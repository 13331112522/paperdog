import { routes, getGLMFallbackConfig } from './config.js';
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
  searchPapers,
  incrementPaperView,
  getPaperViewCount,
  enrichPapersWithViews
} from './utils.js';
import { scrapeDailyPapers, extractPaperFigures } from './paper-scraper.js';
import { analyzePapers, translateAnalysis } from './paper-analyzer.js';
import { generateDailyReport, generateBlogContent, generateRSSFeed } from './blog-generator.js';
import { getIndexHTML, getAboutHTML } from './templates.js';
import { getDualColumnHTML } from './dual-column-templates.js';
import { filterAndSortPapers, generateScoringReport } from './paper-scoring.js';
import { archivePapers } from './archive-manager.js';
import { trackVisitor, getVisitorStats, formatVisitorStats } from './visitor-counter.js';
import { fetchBlogPosts, fetchBlogPostBySlug, handleBlogImageRequest } from './blog-fetcher.js';
import { getBlogListHTML, getBlogPostHTML } from './blog-templates.js';

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

    // Track visitor and capture stats from the tracking call
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
      // Use enhanced filtering and sorting with source balancing and random tie-breaking
      const displayPapers = filterAndSortPapers(papers, {
        ensureBothSources: true,
        maxPapers: 10,
        minScore: 5.0 // Lower threshold to ensure we get 10 papers when possible
      });

      // Use the filtered papers for daily report
      dailyReport = await generateDailyReport(displayPapers, targetDate);

      // Set displayPapers to the balanced selection
      papers = displayPapers; // Update papers to the balanced selection for consistency
    }

    // displayPapers is now the balanced top 10 from filterAndSortPapers
    const displayPapers = papers || [];

    // Enrich papers with view counts before passing to template
    const papersWithViews = await enrichPapersWithViews(displayPapers, env);

    // Use visitor stats from trackVisitor when available to avoid redundant KV reads
    let formattedStats;
    if (visitorInfo && typeof visitorInfo.today === 'number' && !visitorInfo.error) {
      formattedStats = formatVisitorStats(visitorInfo);
    } else {
      // Fallback to separate stats call if trackVisitor didn't return usable data
      const visitorStats = await getVisitorStats(env);
      formattedStats = formatVisitorStats(visitorStats);
    }

    return htmlResponse(getDualColumnHTML(papersWithViews, dailyReport, formattedStats));
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

    // Enrich papers with view counts
    const papersWithViews = await enrichPapersWithViews(paginatedPapers, env);

    const response = {
      papers: papersWithViews,
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

    // Enrich papers with view counts
    const papersWithViews = await enrichPapersWithViews(papers, env);

    return jsonResponse({
      date: date,
      papers: papersWithViews,
      total_papers: papersWithViews.length
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

    // Add view count to paper
    const viewCount = await getPaperViewCount(paperId, env);
    const paperWithViews = {
      ...paper,
      views: viewCount
    };

    return jsonResponse(paperWithViews);
  } catch (error) {
    logger.error('Error in paper by ID handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

export async function handleUpdatePapers(request, env) {
  try {
    // Check for API keys
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return errorResponse('OpenRouter API key not configured', 503);
    }

    // Get GLM fallback configuration
    const glmFallbackConfig = getGLMFallbackConfig(env);
    if (!glmFallbackConfig.apiKey) {
      return errorResponse('GLM API key not configured', 503);
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

    // Step 1.5: Extract figures from arXiv HTML versions
    try {
      await extractPaperFigures(scrapedPapers);
    } catch (figError) {
      logger.warn('Figure extraction failed, continuing without figures:', { error: figError.message });
    }

    // Step 2: Analyze papers
    const analyzedPapers = await analyzePapers(scrapedPapers, apiKey, glmFallbackConfig);
    
    // Step 3: Cache results
    await cachePapers(today, analyzedPapers, env);

    // Step 4: Generate daily report
    const dailyReport = await generateDailyReport(analyzedPapers, today);

    // Step 5: Archive top 10 papers for long-term storage using balanced selection
    let archiveResult = null;
    try {
      // Use enhanced filtering and sorting with source balancing and random tie-breaking
      const topPapers = filterAndSortPapers(analyzedPapers, {
        ensureBothSources: true,
        maxPapers: 10,
        minScore: 5.0 // Lower threshold to ensure we get 10 papers when possible
      });

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
    }, 200, -1);

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
    // Track visitor
    await trackVisitor(request, env);

    // Get visitor stats for display
    const visitorStats = await getVisitorStats(env);
    const formattedStats = formatVisitorStats(visitorStats);

    return htmlResponse(getAboutHTML(formattedStats));
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

export async function handleTrackPaperView(request, env, paperId) {
  try {
    if (!paperId) {
      return errorResponse('Paper ID is required', 400);
    }

    // Find the paper first to ensure it exists
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

    // Increment view count
    const newViewCount = await incrementPaperView(paperId, env);

    logger.info(`Tracked view for paper ${paperId}: ${newViewCount} views`);

    return jsonResponse({
      success: true,
      paper_id: paperId,
      views: newViewCount,
      timestamp: new Date().toISOString()
    }, 200, -1);
  } catch (error) {
    logger.error('Error tracking paper view:', error);
    return errorResponse('Failed to track view', 500);
  }
}

// Archive page handler
export async function handleArchivePage(request, env) {
  try {
    logger.info('Serving archive page');

    // Track visitor
    await trackVisitor(request, env);

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

export async function handleTranslate(request, env) {
  try {
    // Check for API keys
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return errorResponse('OpenRouter API key not configured', 503);
    }

    // Get GLM fallback configuration
    const glmFallbackConfig = getGLMFallbackConfig(env);
    if (!glmFallbackConfig.apiKey) {
      return errorResponse('GLM API key not configured', 503);
    }

    // Parse request body
    const requestBody = await request.json();
    const { analysis, abstract } = requestBody;

    if (!analysis) {
      return errorResponse('Analysis data is required', 400);
    }

    logger.info('Starting translation request');

    // Call translation function with abstract support and GLM fallback
    const translations = await translateAnalysis(analysis, apiKey, abstract, glmFallbackConfig);

    logger.info('Translation request completed successfully');

    return jsonResponse({
      success: true,
      translations: translations,
      timestamp: new Date().toISOString()
    }, 200, -1);

  } catch (error) {
    logger.error('Error in translate handler:', error);
    return errorResponse(`Translation failed: ${error.message}`, error.statusCode || 500);
  }
}

// Blog Handlers
export async function handleBlog(request, env) {
  try {
    logger.info('Handling blog page request');

    // Track visitor
    await trackVisitor(request, env);

    // Get visitor stats
    const visitorStats = await getVisitorStats(env);
    const formattedStats = formatVisitorStats(visitorStats);

    // Fetch all blog posts (client-side pagination handles display)
    const posts = await fetchBlogPosts(env, { perPage: 100 });

    logger.info(`Fetched ${posts.length} blog posts`);

    // Return HTML response
    const html = getBlogListHTML(posts, formattedStats);
    return htmlResponse(html);
  } catch (error) {
    logger.error('Error in blog handler:', error);
    return errorResponse(`Failed to load blog: ${error.message}`, error.statusCode || 500);
  }
}

export async function handleBlogPost(request, env, slug) {
  try {
    logger.info('Handling blog post request', { slug });

    // Track visitor
    await trackVisitor(request, env);

    // Get visitor stats
    const visitorStats = await getVisitorStats(env);
    const formattedStats = formatVisitorStats(visitorStats);

    // Fetch blog post from WordPress
    const post = await fetchBlogPostBySlug(env, slug);

    if (!post) {
      logger.warn('Blog post not found', { slug });
      return errorResponse('Blog post not found', 404);
    }

    logger.info('Fetched blog post', { slug, title: post.title });

    // Return HTML response
    const html = getBlogPostHTML(post, formattedStats);
    return htmlResponse(html);
  } catch (error) {
    logger.error('Error in blog post handler:', error);
    return errorResponse(`Failed to load blog post: ${error.message}`, error.statusCode || 500);
  }
}

// Blog image handler — delegates to blog-fetcher
export async function handleBlogImage(request, env, slug) {
  return await handleBlogImageRequest(env, slug);
}

// Export all handlers for easy access
export const handlers = {
  handleRoot,
  handlePapersList,
  handlePapersByDate,
  handlePaperById,
  handleUpdatePapers,
  handleBlogImage: handleBlogImageRequest,
  handleCategories,
  handleSearch,
  handleRSSFeed,
  handleAbout,
  handleBlog,
  handleBlogPost,
  handleScoringReport,
  handleTrackPaperView,
  handleArchivePage,
  handleTranslate
};
