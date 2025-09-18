import { routes } from './config.js';
import {
  validateDate,
  getCachedPapers,
  cachePapers,
  jsonResponse,
  htmlResponse,
  rssResponse,
  errorResponse,
  sortPapersByDate,
  filterPapersByCategory,
  searchPapers
} from './utils.js';
import { scrapeDailyPapers } from './paper-scraper.js';
import { analyzePapers } from './paper-analyzer.js';
import { generateDailyReport, generateBlogContent, generateRSSFeed } from './blog-generator.js';
import { getIndexHTML } from './templates.js';
import { getDualColumnHTML } from './dual-column-templates.js';
import { filterAndSortPapers, generateScoringReport } from './paper-scoring.js';
import { archivePapers } from './archive-manager.js';
import { trackVisitor, getVisitorStats, formatVisitorStats } from './visitor-counter.js';

const logger = {
  info: (msg, data = {}) => console.log(`[HANDLER] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[HANDLER] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[HANDLER] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[HANDLER] ${msg}`, data)
};

// Route Handlers
export async function handleRoot(request, env) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = new URL(request.url);

    // Track visitor
    const visitorInfo = await trackVisitor(request, env);

    // Check for specific date parameter
    const requestedDate = url.searchParams.get('date');
    const targetDate = requestedDate || today;

    // Try to get cached papers
    let papers = await getCachedPapers(targetDate, env);
    let dailyReport = null;

    if (!papers) {
      // If no papers for today, try to get recent papers
      const recentDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        recentDates.push(date.toISOString().split('T')[0]);
      }

      // Find the most recent date with papers
      for (const date of recentDates) {
        const cached = await getCachedPapers(date, env);
        if (cached && cached.length > 0) {
          papers = cached;
          break;
        }
      }
    }

    // Try to get daily report
    if (papers && papers.length > 0) {
      // Sort papers by relevance score with random tie-breaking for consistent top 10
      papers.sort((a, b) => {
        const scoreA = (a.analysis?.relevance_score || a.scoring?.total_score || 5);
        const scoreB = (b.analysis?.relevance_score || b.scoring?.total_score || 5);

        // Primary sort: higher score first
        if (Math.abs(scoreB - scoreA) > 0.1) {
          return scoreB - scoreA;
        }

        // Secondary sort: random tie-breaking for identical scores
        if (scoreA === scoreB) {
          return Math.random() - 0.5; // Random -0.5 to 0.5
        }

        // Tertiary sort: newer papers first if scores are very close
        const dateA = new Date(a.published || a.scraped_at || 0);
        const dateB = new Date(b.published || b.scraped_at || 0);
        return dateB - dateA;
      });

      dailyReport = await generateDailyReport(papers, targetDate);
    }

    // Limit to top 10 papers by relevance score for mainpage display
    let displayPapers = papers || [];
    if (displayPapers.length > 10) {
      displayPapers = displayPapers.slice(0, 10); // Take top 10 (already sorted above)
    }

    // Get visitor stats for display
    const visitorStats = await getVisitorStats(env);
    const formattedStats = formatVisitorStats(visitorStats);

    return htmlResponse(getDualColumnHTML(displayPapers, dailyReport, formattedStats));
  } catch (error) {
    logger.error('Error in root handler:', error);
    return htmlResponse(getIndexHTML([], null));
  }
}

export async function handlePapersList(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 11); // Default 10, max 11
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const date = url.searchParams.get('date');
    
    let papers = [];
    
    if (date) {
      validateDate(date);
      papers = await getCachedPapers(date, env) || [];
    } else {
      // Get papers from the last 1 days
      for (let i = 0; i < 1; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const cached = await getCachedPapers(dateStr, env);
        if (cached) {
          papers.push(...cached);
        }
      }
    }
    
    // Apply filters
    if (category) {
      papers = filterPapersByCategory(papers, category);
    }
    
    if (search) {
      papers = searchPapers(papers, search);
    }
    
    // Sort by relevance score first, then by date, with random tie-breaking
    papers.sort((a, b) => {
      const scoreA = a.analysis?.relevance_score || a.scoring?.total_score || 5;
      const scoreB = b.analysis?.relevance_score || b.scoring?.total_score || 5;

      // Primary sort: higher score first
      if (Math.abs(scoreB - scoreA) > 0.1) {
        return scoreB - scoreA;
      }

      // Secondary sort: random tie-breaking for identical scores
      if (scoreA === scoreB) {
        return Math.random() - 0.5; // Random -0.5 to 0.5
      }

      // Tertiary sort: newer papers first if scores are very close
      const dateA = new Date(a.published || a.scraped_at || 0);
      const dateB = new Date(b.published || b.scraped_at || 0);
      return dateB - dateA;
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPapers = papers.slice(startIndex, endIndex);
    
    const response = {
      papers: paginatedPapers,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(papers.length / limit),
        total_papers: papers.length,
        has_next: endIndex < papers.length,
        has_prev: page > 1
      },
      filters: {
        category: category,
        search: search,
        date: date
      }
    };
    
    return jsonResponse(response);
  } catch (error) {
    logger.error('Error in papers list handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

export async function handlePapersByDate(request, env, date) {
  try {
    validateDate(date);
    
    const papers = await getCachedPapers(date, env);
    if (!papers) {
      return errorResponse('No papers found for this date', 404);
    }
    
    return jsonResponse({
      date: date,
      papers: papers,
      total_papers: papers.length
    });
  } catch (error) {
    logger.error('Error in papers by date handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

export async function handlePaperById(request, env, paperId) {
  try {
    // Try to find the paper in recent cached data
    let paper = null;
    
    // Search through the last 7 days of cached papers
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const papers = await getCachedPapers(dateStr, env);
      
      if (papers) {
        paper = papers.find(p => p.id === paperId);
        if (paper) break;
      }
    }
    
    if (!paper) {
      return errorResponse('Paper not found', 404);
    }
    
    return jsonResponse(paper);
  } catch (error) {
    logger.error('Error in paper by ID handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

export async function handleUpdatePapers(request, env) {
  try {
    // Check for API key
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return errorResponse('OpenRouter API key not configured', 503);
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check rate limiting (simple implementation)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `rate_limit_${clientIP}`;
    const lastUpdate = await env.PAPERS.get(rateLimitKey);
    
    if (lastUpdate) {
      const lastUpdateTime = parseInt(lastUpdate);
      const timeSinceLastUpdate = Date.now() - lastUpdateTime;
      const minInterval = 5 * 60 * 1000; // 5 minutes
      
      if (timeSinceLastUpdate < minInterval) {
        return errorResponse('Please wait before requesting another update', 429);
      }
    }
    
    // Update rate limit
    await env.PAPERS.put(rateLimitKey, Date.now().toString(), {
      expirationTtl: 300 // 5 minutes
    });
    
    logger.info('Starting manual paper update');
    
    // Step 1: Scrape papers
    const scrapedPapers = await scrapeDailyPapers();
    if (scrapedPapers.length === 0) {
      return errorResponse('No papers could be scraped', 404);
    }
    
    // Step 2: Analyze papers
    const analyzedPapers = await analyzePapers(scrapedPapers, apiKey);
    
    // Step 3: Cache results
    await cachePapers(today, analyzedPapers, env);

    // Step 4: Generate daily report
    const dailyReport = await generateDailyReport(analyzedPapers, today);

    // Step 5: Archive top 10 papers for long-term storage
    let archiveResult = null;
    try {
      // Sort papers by relevance score with random tie-breaking for consistent top 10 selection
      const topPapers = [...analyzedPapers]
        .sort((a, b) => {
          const scoreA = (a.analysis?.relevance_score || a.scoring?.total_score || 5);
          const scoreB = (b.analysis?.relevance_score || b.scoring?.total_score || 5);

          // Primary sort: higher score first
          if (Math.abs(scoreB - scoreA) > 0.1) {
            return scoreB - scoreA;
          }

          // Secondary sort: random tie-breaking for identical scores
          if (scoreA === scoreB) {
            return Math.random() - 0.5; // Random -0.5 to 0.5
          }

          // Tertiary sort: newer papers first if scores are very close
          const dateA = new Date(a.published || a.scraped_at || 0);
          const dateB = new Date(b.published || b.scraped_at || 0);
          return dateB - dateA;
        })
        .slice(0, 10); // Archive only top 10 papers

      archiveResult = await archivePapers(today, topPapers, env, {
        source: 'daily_update',
        auto_archived: true,
        papers_archived: topPapers.length,
        total_papers_analyzed: analyzedPapers.length
      });
      logger.info(`Successfully archived ${archiveResult.papers_archived} top papers for ${today} (from ${analyzedPapers.length} total)`);
    } catch (archiveError) {
      logger.warn('Failed to archive papers:', archiveError.message);
      // Don't fail the entire update if archiving fails
    }

    logger.info(`Successfully updated ${analyzedPapers.length} papers`);

    return jsonResponse({
      success: true,
      message: `Successfully updated ${analyzedPapers.length} papers`,
      date: today,
      papers_count: analyzedPapers.length,
      report: dailyReport,
      archive: archiveResult,
      top_papers_archived: archiveResult ? archiveResult.papers_archived : 0
    });
    
  } catch (error) {
    logger.error('Error in update papers handler:', error);
    return errorResponse(`Update failed: ${error.message}`, error.statusCode || 500);
  }
}

export async function handleCategories(request, env) {
  try {
    // Get all categories from recent papers
    const categories = new Set();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const papers = await getCachedPapers(dateStr, env);
      
      if (papers) {
        papers.forEach(paper => {
          const category = paper.analysis?.category || paper.category || 'other';
          categories.add(category);
        });
      }
    }
    
    const categoryList = Array.from(categories).sort();
    
    return jsonResponse({
      categories: categoryList,
      total_categories: categoryList.length
    });
  } catch (error) {
    logger.error('Error in categories handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

export async function handleSearch(request, env) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    
    if (!query || query.trim().length < 2) {
      return errorResponse('Search query must be at least 2 characters', 400);
    }
    
    // Search through recent papers
    let allPapers = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const papers = await getCachedPapers(dateStr, env);
      if (papers) {
        allPapers.push(...papers);
      }
    }
    
    // Apply search and filters
    let results = searchPapers(allPapers, query);
    
    if (category) {
      results = filterPapersByCategory(results, category);
    }
    
    // Sort by relevance score
    results.sort((a, b) => {
      const scoreA = a.analysis?.relevance_score || 5;
      const scoreB = b.analysis?.relevance_score || 5;
      return scoreB - scoreA;
    });
    
    // Apply limit
    results = results.slice(0, limit);
    
    return jsonResponse({
      query: query,
      results: results,
      total_results: results.length,
      filters: {
        category: category
      }
    });
  } catch (error) {
    logger.error('Error in search handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

export async function handleRSSFeed(request, env) {
  try {
    // Get recent papers for RSS feed
    let allPapers = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const papers = await getCachedPapers(dateStr, env);
      if (papers) {
        allPapers.push(...papers);
      }
    }
    
    // Sort by date
    allPapers = sortPapersByDate(allPapers);
    
    const rssFeed = generateRSSFeed(allPapers, {
      title: 'PaperDog - AI Papers Daily',
      description: 'Daily curated AI and computer vision research papers',
      link: 'https://paperdog.org',
      maxItems: 20
    });
    
    return rssResponse(rssFeed);
  } catch (error) {
    logger.error('Error in RSS feed handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

export async function handleAbout(request, env) {
  try {
    // Get visitor stats for display
    const visitorStats = await getVisitorStats(env);
    const formattedStats = formatVisitorStats(visitorStats);

    const aboutHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - PaperDog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .about-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4rem 0;
            margin-bottom: 3rem;
        }
        .stats-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: none;
            transition: transform 0.2s ease;
        }
        .stats-card:hover {
            transform: translateY(-2px);
        }
        .feature-icon {
            font-size: 2.5rem;
            color: #667eea;
            margin-bottom: 1rem;
        }
        .api-section {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border-radius: 12px;
            padding: 2rem;
        }
        .nav-buttons .btn {
            margin: 0.25rem;
            border-radius: 8px;
        }
        .visitor-badge {
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="about-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h1 class="display-4 mb-3">
                        <i class="fas fa-info-circle me-3"></i>About PaperDog
                    </h1>
                    <p class="lead mb-0">Your AI-powered research paper companion</p>
                </div>
                <div class="col-lg-4 text-end">
                    <div class="visitor-badge">
                        <i class="fas fa-users me-2"></i>
                        ${formattedStats.displayText}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto">

                <!-- Quick Stats -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="stats-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h5>AI Powered</h5>
                            <p class="text-muted">GPT-4o & Gemini Analysis</p>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="stats-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-sync-alt"></i>
                            </div>
                            <h5>Daily Updates</h5>
                            <p class="text-muted">Automated Paper Collection</p>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="stats-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-archive"></i>
                            </div>
                            <h5>Smart Archive</h5>
                            <p class="text-muted">Top 10 Papers Daily</p>
                        </div>
                    </div>
                </div>

                <!-- What is PaperDog -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-robot me-2"></i>What is PaperDog?
                        </h3>
                        <p class="lead">PaperDog is an automated system that collects, analyzes, and presents the latest AI and computer vision research papers from top sources like arXiv and HuggingFace.</p>
                        <p>Our mission is to make cutting-edge AI research accessible to everyone by providing intelligent summaries, categorization, and easy-to-read analysis of complex academic papers.</p>
                    </div>
                </div>

                <!-- Key Features -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-star me-2"></i>Key Features
                        </h3>
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-brain text-primary me-2"></i>AI-Powered Analysis</h6>
                                <ul class="mb-4">
                                    <li>GPT-4o and Gemini model analysis</li>
                                    <li>500-word intelligent summaries</li>
                                    <li>Relevance scoring (1-10 scale)</li>
                                    <li>Technical depth assessment</li>
                                </ul>

                                <h6><i class="fas fa-tags text-primary me-2"></i>Smart Categorization</h6>
                                <ul class="mb-4">
                                    <li>Computer Vision</li>
                                    <li>Machine Learning</li>
                                    <li>Natural Language Processing</li>
                                    <li>Reinforcement Learning</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-archive text-primary me-2"></i>Paper Archive System</h6>
                                <ul class="mb-4">
                                    <li>Top 10 papers archived daily</li>
                                    <li>Date-based browsing</li>
                                    <li>Advanced search & filtering</li>
                                    <li>Multiple export formats</li>
                                </ul>

                                <h6><i class="fas fa-download text-primary me-2"></i>Export Options</h6>
                                <ul class="mb-4">
                                    <li>JSON format with full analysis</li>
                                    <li>CSV for data analysis</li>
                                    <li>Markdown for documentation</li>
                                    <li>BibTeX for citations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- How It Works -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-cogs me-2"></i>How It Works
                        </h3>
                        <div class="row">
                            <div class="col-md-3 text-center mb-3">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style="width: 60px; height: 60px;">
                                    <i class="fas fa-download fa-2x text-primary"></i>
                                </div>
                                <h6>Daily Scraping</h6>
                                <p class="small text-muted">Automatically collects new papers from arXiv and HuggingFace</p>
                            </div>
                            <div class="col-md-3 text-center mb-3">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style="width: 60px; height: 60px;">
                                    <i class="fas fa-brain fa-2x text-primary"></i>
                                </div>
                                <h6>AI Analysis</h6>
                                <p class="small text-muted">Uses advanced language models to analyze each paper's content</p>
                            </div>
                            <div class="col-md-3 text-center mb-3">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style="width: 60px; height: 60px;">
                                    <i class="fas fa-filter fa-2x text-primary"></i>
                                </div>
                                <h6>Smart Curation</h6>
                                <p class="small text-muted">Filters and ranks papers based on quality and importance</p>
                            </div>
                            <div class="col-md-3 text-center mb-3">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style="width: 60px; height: 60px;">
                                    <i class="fas fa-chart-line fa-2x text-primary"></i>
                                </div>
                                <h6>Beautiful Presentation</h6>
                                <p class="small text-muted">Presents papers in an easy-to-read blog format</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Archive System -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-archive me-2"></i>Paper Archive System
                        </h3>
                        <p class="mb-3">Our intelligent archive system stores only the top 10 highest-scoring papers each day, ensuring quality over quantity:</p>

                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-calendar-alt text-primary me-2"></i>Date-Based Browsing</h6>
                                <p class="text-muted mb-3">Browse papers by specific dates with an intuitive calendar interface</p>

                                <h6><i class="fas fa-search text-primary me-2"></i>Advanced Search</h6>
                                <p class="text-muted mb-3">Search within archived content with filters for categories, scores, and date ranges</p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-download text-primary me-2"></i>Multiple Export Formats</h6>
                                <p class="text-muted mb-3">Export papers in JSON, CSV, Markdown, or BibTeX formats for different use cases</p>

                                <h6><i class="fas fa-chart-bar text-primary me-2"></i>Statistics Dashboard</h6>
                                <p class="text-muted mb-3">View archive statistics including paper distribution and visitor analytics</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- API Section -->
                <div class="api-section mb-4">
                    <h3 class="mb-3">
                        <i class="fas fa-code me-2"></i>Developer API
                    </h3>
                    <p class="mb-3">Access PaperDog's functionality programmatically through our REST API:</p>

                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-file-alt me-2"></i>Paper Endpoints</h6>
                            <ul class="mb-3">
                                <li><code>GET /api/papers</code> - List papers</li>
                                <li><code>GET /api/papers/:date</code> - Papers by date</li>
                                <li><code>GET /api/search?q=query</code> - Search papers</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-archive me-2"></i>Archive Endpoints</h6>
                            <ul class="mb-3">
                                <li><code>GET /api/archive/dates</code> - Available dates</li>
                                <li><code>GET /api/archive/:date</code> - Archive by date</li>
                                <li><code>GET /api/archive/export</code> - Export data</li>
                            </ul>
                        </div>
                    </div>

                    <div class="text-center">
                        <a href="/api/papers" class="btn btn-light btn-sm me-2">
                            <i class="fas fa-external-link-alt me-1"></i>View API Docs
                        </a>
                        <a href="/api/archive/export/formats" class="btn btn-light btn-sm">
                            <i class="fas fa-download me-1"></i>Export Formats
                        </a>
                    </div>
                </div>

                <!-- Technical Details -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-server me-2"></i>Technical Architecture
                        </h3>
                        <p>PaperDog is built with modern, scalable technologies:</p>

                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-cloud text-primary me-2"></i>Backend Infrastructure</h6>
                                <ul class="mb-3">
                                    <li><strong>Cloudflare Workers:</strong> Serverless edge computing</li>
                                    <li><strong>Cloudflare KV:</strong> Distributed key-value storage</li>
                                    <li><strong>Global CDN:</strong> Fast content delivery worldwide</li>
                                </ul>

                                <h6><i class="fas fa-brain text-primary me-2"></i>AI Integration</h6>
                                <ul class="mb-3">
                                    <li><strong>OpenRouter API:</strong> Access to GPT-4o, Gemini, Claude</li>
                                    <li><strong>Intelligent Analysis:</strong> Automated paper evaluation</li>
                                    <li><strong>Scoring System:</strong> 1-10 relevance scoring</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-database text-primary me-2"></i>Data Sources</h6>
                                <ul class="mb-3">
                                    <li><strong>arXiv API:</strong> Latest academic papers</li>
                                    <li><strong>HuggingFace:</strong> ML community papers</li>
                                    <li><strong>Web Scraping:</strong> Additional content sources</li>
                                </ul>

                                <h6><i class="fas fa-palette text-primary me-2"></i>Frontend Technologies</h6>
                                <ul class="mb-3">
                                    <li><strong>Bootstrap 5:</strong> Responsive UI framework</li>
                                    <li><strong>Font Awesome:</strong> Professional icons</li>
                                    <li><strong>Modern CSS:</strong> Gradient designs and animations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Visit Stats -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-chart-line me-2"></i>Visitor Statistics
                        </h3>
                        <div class="row text-center">
                            <div class="col-md-4">
                                <h4 class="text-primary">${formattedStats.today}</h4>
                                <p class="text-muted">Today's Visitors</p>
                            </div>
                            <div class="col-md-4">
                                <h4 class="text-primary">${formattedStats.total}</h4>
                                <p class="text-muted">Total Visitors</p>
                            </div>
                            <div class="col-md-4">
                                <h4 class="text-primary">${formattedStats.thisMonth}</h4>
                                <p class="text-muted">This Month</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="text-center nav-buttons">
                    <a href="/" class="btn btn-primary btn-lg me-2">
                        <i class="fas fa-home me-2"></i>Back to Home
                    </a>
                    <a href="/archive" class="btn btn-outline-primary btn-lg me-2">
                        <i class="fas fa-archive me-2"></i>Browse Archive
                    </a>
                    <a href="/api/papers" class="btn btn-outline-secondary btn-lg me-2">
                        <i class="fas fa-code me-2"></i>API Documentation
                    </a>
                    <a href="/feed" class="btn btn-outline-info btn-lg">
                        <i class="fas fa-rss me-2"></i>RSS Feed
                    </a>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    return htmlResponse(aboutHTML);
  } catch (error) {
    logger.error('Error in about handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

export async function handleScoringReport(request, env, date) {
  try {
    validateDate(date);
    
    const papers = await getCachedPapers(date, env);
    if (!papers || papers.length === 0) {
      return errorResponse('No papers found for this date', 404);
    }
    
    // Generate scoring report
    const scoringReport = generateScoringReport(papers);
    
    logger.info(`Generated scoring report for ${date} with ${papers.length} papers`);
    
    return jsonResponse({
      date: date,
      papers_count: papers.length,
      scoring_report: scoringReport,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in scoring report handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Archive page handler
export async function handleArchivePage(request, env) {
  try {
    logger.info('Serving archive page');

    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;

    // Import archive functions and templates
    const { getAvailableArchiveDates, getArchivedPapers, getArchiveStatistics } = await import('./archive-manager.js');
    const { generateEnhancedArchiveHTML } = await import('./archive-templates.js');

    let papers = [];
    let availableDates = [];
    let statistics = null;
    let selectedDate = date;

    // Get available archive dates
    try {
      availableDates = await getAvailableArchiveDates(env);
      if (availableDates.length > 0) {
        statistics = await getArchiveStatistics(env);
      }
    } catch (error) {
      logger.warn('Failed to get archive data:', error.message);
    }

    // Get papers for specific date or recent papers
    if (date) {
      try {
        validateDate(date);
        const archive = await getArchivedPapers(date, env);
        if (archive) {
          papers = archive.papers;
        }
      } catch (error) {
        logger.warn(`Failed to get archive for date ${date}:`, error.message);
      }
    } else if (availableDates.length > 0) {
      // Get most recent archive
      const recentDate = availableDates[0];
      try {
        const archive = await getArchivedPapers(recentDate, env);
        if (archive) {
          papers = archive.papers;
          selectedDate = recentDate;
        }
      } catch (error) {
        logger.warn(`Failed to get recent archive:`, error.message);
      }
    }

    // Apply filters
    if (category) {
      papers = papers.filter(paper => {
        const paperCategory = paper.analysis?.category || paper.category || 'other';
        return paperCategory.toLowerCase() === category.toLowerCase();
      });
    }

    if (search) {
      const searchTerms = search.toLowerCase().split(' ').filter(term => term.length > 2);
      papers = papers.filter(paper => {
        const searchableText = [
          paper.title,
          paper.abstract,
          ...(paper.authors || []),
          ...(paper.analysis?.keywords || [])
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Sort by score
    papers.sort((a, b) => {
      const scoreA = a.analysis?.relevance_score || 5;
      const scoreB = b.analysis?.relevance_score || 5;
      return scoreB - scoreA;
    });

    // Pagination
    const totalPapers = papers.length;
    const totalPages = Math.ceil(totalPapers / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPapers = papers.slice(startIndex, endIndex);

    // Generate archive HTML
    const archiveHTML = generateEnhancedArchiveHTML({
      papers: paginatedPapers,
      availableDates,
      statistics,
      selectedDate,
      filters: { category, search },
      pagination: {
        currentPage: page,
        totalPages,
        totalPapers,
        hasNext: endIndex < totalPapers,
        hasPrev: page > 1
      }
    });

    return htmlResponse(archiveHTML);
  } catch (error) {
    logger.error('Error in archive page handler:', error);
    return htmlResponse(`
      <!DOCTYPE html>
      <html>
      <head><title>Archive Error - PaperDog</title></head>
      <body>
        <h1>Archive Error</h1>
        <p>Unable to load archive. Please try again later.</p>
        <p>Error: ${error.message}</p>
      </body>
      </html>
    `);
  }
}

// Export all handlers for easy access
export const handlers = {
  handleRoot,
  handlePapersList,
  handlePapersByDate,
  handlePaperById,
  handleUpdatePapers,
  handleCategories,
  handleSearch,
  handleRSSFeed,
  handleAbout,
  handleScoringReport,
  handleArchivePage
};
