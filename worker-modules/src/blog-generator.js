import { AppError } from './config.js';
import { validateDate, formatDate, sortPapersByDate, filterPapersByCategory, searchPapers } from './utils.js';
import { filterAndSortPapers, generateScoringReport, SCORING_WEIGHTS } from './paper-scoring.js';

const logger = {
  info: (msg, data = {}) => console.log(`[BLOG] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[BLOG] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[BLOG] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[BLOG] ${msg}`, data)
};

export async function generateDailyReport(papers, date) {
  try {
    logger.info(`Generating daily report for ${date} with ${papers.length} papers`);
    
    if (!papers || papers.length === 0) {
      return {
        date: date,
        title: `No Papers Found - ${formatDate(date)}`,
        summary: 'No new AI papers were found for this date.',
        papers: [],
        total_papers: 0,
        categories: {},
        top_papers: [],
        scoring_report: null
      };
    }
    
    // Use enhanced scoring system to filter and select top papers
    const topPapers = filterAndSortPapers(papers, {
      minScore: 6.0,
      maxPapers: 10,  // 改为选择10篇论文
      minRecencyScore: 3.0,
      daysAgoLimit: 90,
      ensureBothSources: true  // 确保从两个来源各选5篇
    });
    
    // Generate scoring report
    const scoringReport = generateScoringReport(papers);
    
    // Group by category for all papers
    const categories = {};
    papers.forEach(paper => {
      const category = paper.analysis?.category || paper.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(paper);
    });
    
    // Generate enhanced summary with scoring information
    const summary = generateDailySummary(papers, date, categories, scoringReport);
    
    const report = {
      date: date,
      title: `Daily AI Papers Digest - ${formatDate(date)}`,
      summary: summary,
      papers: papers,
      total_papers: papers.length,
      categories: categories,
      top_papers: topPapers,
      scoring_report: scoringReport,
      generated_at: new Date().toISOString()
    };
    
    logger.info(`Generated daily report with ${papers.length} papers, selected top ${topPapers.length} papers`);
    return report;
    
  } catch (error) {
    logger.error('Failed to generate daily report:', error);
    throw new AppError(`Failed to generate daily report: ${error.message}`);
  }
}

function getScoreColor(score) {
  if (score >= 8.5) return '#28a745'; // Excellent - green
  if (score >= 7.0) return '#17a2b8'; // Good - blue
  if (score >= 5.5) return '#ffc107'; // Average - yellow
  return '#dc3545'; // Below average - red
}

function generateDailySummary(papers, date, categories, scoringReport) {
  const topCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 3)
    .map(([cat, papers]) => `${cat.replace('_', ' ')} (${papers.length})`)
    .join(', ');
  
  const avgRelevance = papers.reduce((sum, paper) => {
    return sum + (paper.analysis?.relevance_score || 5);
  }, 0) / papers.length;
  
  const topKeywords = {};
  papers.forEach(paper => {
    const keywords = paper.analysis?.keywords || [];
    keywords.forEach(keyword => {
      topKeywords[keyword] = (topKeywords[keyword] || 0) + 1;
    });
  });
  
  const trendingKeywords = Object.entries(topKeywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([keyword]) => keyword)
    .join(', ');
  
  // 统计来源分布（使用更准确的方法）
  const sourceCounts = {
    arxiv: papers.filter(p => p.scoring?.source_type === 'arxiv.org').length,
    huggingface: papers.filter(p => p.scoring?.source_type === 'huggingface.co').length,
    unknown: papers.filter(p => !p.scoring?.source_type || !['arxiv.org', 'huggingface.co'].includes(p.scoring.source_type)).length
  };
  
  // 验证源分布并记录警告
  if (sourceCounts.arxiv === 0) {
    logger.warn('No arXiv papers found in summary generation');
  }
  if (sourceCounts.huggingface === 0) {
    logger.warn('No HuggingFace papers found in summary generation');
  }
  if (sourceCounts.unknown > 0) {
    logger.warn(`Found ${sourceCounts.unknown} papers with unknown source type`);
  }
  
  // Enhanced summary with scoring information
  let summary = `Today's digest features ${papers.length} papers spanning ${Object.keys(categories).length} categories, with strong representation from ${topCategories}. The average relevance score is ${avgRelevance.toFixed(1)}/10. Trending topics include ${trendingKeywords}.`;
  
  // 添加来源统计和验证信息
  if (sourceCounts.unknown > 0) {
    summary += ` Source distribution: ${sourceCounts.arxiv} from arXiv, ${sourceCounts.huggingface} from HuggingFace, ${sourceCounts.unknown} unknown sources.`;
  } else {
    summary += ` Source distribution: ${sourceCounts.arxiv} from arXiv, ${sourceCounts.huggingface} from HuggingFace.`;
  }
  
  // 添加源分布验证状态
  const targetPerSource = 5;
  const isBalanced = sourceCounts.arxiv >= targetPerSource && sourceCounts.huggingface >= targetPerSource;
  if (isBalanced) {
    summary += ` ✅ Balanced source representation achieved.`;
  } else {
    summary += ` ⚠️ Unbalanced source distribution detected.`;
  }
  
  if (scoringReport && !scoringReport.error) {
    summary += ` Using our advanced scoring system that considers recency (${Math.round(SCORING_WEIGHTS.recency * 100)}%), relevance (${Math.round(SCORING_WEIGHTS.relevance * 100)}%), popularity (${Math.round(SCORING_WEIGHTS.popularity * 100)}%), and quality (${Math.round(SCORING_WEIGHTS.quality * 100)}%), we selected the top 10 papers (5 from arXiv, 5 from HuggingFace) with an average score of ${scoringReport.average_score.toFixed(1)}/10.`;
    
    if (scoringReport.score_distribution) {
      const excellentCount = scoringReport.score_distribution.excellent || 0;
      const goodCount = scoringReport.score_distribution.good || 0;
      if (excellentCount > 0 || goodCount > 0) {
        summary += ` ${excellentCount} papers scored excellent (8.5+), and ${goodCount} scored good (7.0+).`;
      }
    }
  }
  
  return summary;
}

export async function generateBlogContent(papers, options = {}) {
  const {
    title = 'AI Research Papers Daily',
    description = 'Latest advances in artificial intelligence and computer vision research',
    showFullAnalysis = false,
    maxPapers = 10  // 改为显示10篇论文
  } = options;
  
  try {
    // Use scoring to filter and get top papers
    const topPapers = filterAndSortPapers(papers, {
      minScore: 6.0,
      maxPapers: maxPapers,
      minRecencyScore: 3.0,
      daysAgoLimit: 90,
      ensureBothSources: true  // 确保从两个来源各选5篇
    });
    
    const sortedPapers = topPapers; // Already filtered and sorted
    
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .hero-section {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem 2rem;
            margin: 2rem 0;
            color: white;
            text-align: center;
        }
        .paper-card {
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .paper-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        .paper-title {
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 1.2rem;
        }
        .paper-authors {
            color: #7f8c8d;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        .paper-abstract {
            color: #34495e;
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        .paper-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .category-badge {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .relevance-score {
            background: #27ae60;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 15px;
            font-size: 0.8rem;
        }
        .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        .keyword-tag {
            background: #ecf0f1;
            color: #2c3e50;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
        }
        .analysis-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1rem;
            border-left: 4px solid #667eea;
        }
        .source-icon {
            margin-right: 0.5rem;
        }
        .arxiv-icon { color: #b31b1b; }
        .huggingface-icon { color: #ffd700; }
        .stats-section {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
            text-align: center;
        }
        .stat-item {
            margin: 1rem;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero-section">
            <h1 class="display-4 mb-3">
                <i class="fas fa-graduation-cap me-3"></i>${title}
            </h1>
            <p class="lead">${description}</p>
            <p class="mb-0">
                <i class="fas fa-calendar-alt me-2"></i>
                Updated: ${formatDate(new Date().toISOString().split('T')[0])}
            </p>
        </div>
        
        <div class="stats-section">
            <div class="row">
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${sortedPapers.length}</div>
                    <div class="stat-label">Top Papers</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${new Set(sortedPapers.map(p => p.analysis?.category || p.category || 'other')).size}</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${sortedPapers.filter(p => p.source === 'arxiv').length}</div>
                    <div class="stat-label">arXiv Papers</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${sortedPapers.filter(p => p.source === 'huggingface').length}</div>
                    <div class="stat-label">HuggingFace Papers</div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <h2 class="text-white mb-4">
                    <i class="fas fa-fire me-2"></i>Today's Top Papers
                </h2>
            </div>
        </div>
        
        <div class="row">
            ${sortedPapers.map(paper => generatePaperCard(paper, showFullAnalysis)).join('')}
        </div>
        
        <footer class="text-center text-white py-4 mt-5">
            <p class="mb-0">
                <i class="fas fa-robot me-2"></i>
                Curated by PaperDog AI • 
                <i class="fas fa-code me-1"></i>
                Built with Cloudflare Workers
            </p>
        </footer>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
    
    return html;
    
  } catch (error) {
    logger.error('Failed to generate blog content:', error);
    throw new AppError(`Failed to generate blog content: ${error.message}`);
  }
}

function generatePaperCard(paper, showFullAnalysis = false) {
  const sourceIcon = paper.source === 'arxiv' ? 'arxiv-icon' : 'huggingface-icon';
  const sourceName = paper.source === 'arxiv' ? 'arXiv' : 'HuggingFace';
  const relevanceScore = paper.analysis?.relevance_score || 5;
  const category = paper.analysis?.category || paper.category || 'other';
  const keywords = paper.analysis?.keywords || [];
  
  // Enhanced scoring information
  const totalScore = paper.scoring?.total_score || relevanceScore;
  const recencyScore = paper.scoring?.recency_score || 5;
  const isTopPaper = paper.scoring && totalScore >= 7.0;
  
  // Check for Chinese translation
  const hasChineseTranslation = paper.analysis?.chinese_introduction;
  
  let analysisContent = '';
  if (showFullAnalysis && paper.analysis) {
    analysisContent = `
        <div class="analysis-section">
            <h6 class="mb-2"><i class="fas fa-brain me-2"></i>AI Analysis</h6>
            <div class="row">
                <div class="col-md-6">
                    <strong>Introduction:</strong>
                    <p class="small">${paper.analysis.introduction || 'Not available'}</p>
                </div>
                <div class="col-md-6">
                    <strong>Innovations:</strong>
                    <p class="small">${paper.analysis.innovations || 'Not available'}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <strong>Results:</strong>
                    <p class="small">${paper.analysis.experiments || 'Not available'}</p>
                </div>
                <div class="col-md-6">
                    <strong>Insights:</strong>
                    <p class="small">${paper.analysis.insights || 'Not available'}</p>
                </div>
            </div>
            ${hasChineseTranslation ? `
            <hr class="my-3">
            <h6 class="mb-2"><i class="fas fa-language me-2"></i>中文分析 (Chinese Analysis)</h6>
            <div class="row">
                <div class="col-md-6">
                    <strong>中文介绍:</strong>
                    <p class="small">${paper.analysis.chinese_introduction || '翻译不可用'}</p>
                </div>
                <div class="col-md-6">
                    <strong>中文创新点:</strong>
                    <p class="small">${paper.analysis.chinese_innovations || '翻译不可用'}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <strong>中文实验结果:</strong>
                    <p class="small">${paper.analysis.chinese_experiments || '翻译不可用'}</p>
                </div>
                <div class="col-md-6">
                    <strong>中文见解:</strong>
                    <p class="small">${paper.analysis.chinese_insights || '翻译不可用'}</p>
                </div>
            </div>
            ` : ''}
        </div>
    `;
  }
  
  return `
        <div class="col-lg-6 mb-4">
            <div class="paper-card ${isTopPaper ? 'border border-warning border-2' : ''}">
                ${isTopPaper ? '<div class="position-absolute top-0 end-0 m-2"><span class="badge bg-warning text-dark"><i class="fas fa-trophy me-1"></i>Top Paper</span></div>' : ''}
                <div class="paper-title">
                    <i class="fas fa-file-alt source-icon ${sourceIcon}"></i>
                    <a href="${paper.url}" target="_blank" class="text-decoration-none">${paper.title}</a>
                </div>
                
                <div class="paper-authors">
                    <i class="fas fa-users me-2"></i>
                    ${paper.authors ? paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ' et al.' : '') : 'Unknown authors'}
                </div>
                
                <div class="paper-abstract">
                    ${paper.abstract ? paper.abstract.substring(0, 200) + '...' : 'No abstract available'}
                </div>
                
                <div class="paper-meta">
                    <div>
                        <span class="category-badge">${category.replace('_', ' ')}</span>
                        <span class="relevance-score" style="background: ${getScoreColor(totalScore)};">
                            <i class="fas fa-star me-1"></i>${totalScore.toFixed(1)}/10
                        </span>
                        ${paper.scoring ? `
                        <span class="recency-score" style="background: #17a2b8; color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-size: 0.8rem;">
                            <i class="fas fa-clock me-1"></i>${recencyScore.toFixed(1)}
                        </span>
                        ` : ''}
                        ${hasChineseTranslation ? `
                        <span class="badge bg-info ms-1">
                            <i class="fas fa-language me-1"></i>中文
                        </span>
                        ` : ''}
                    </div>
                    <div class="text-muted small">
                        <i class="fas fa-external-link-alt me-1"></i>
                        ${sourceName}
                    </div>
                </div>
                
                ${analysisContent}
                
                ${keywords.length > 0 ? `
                <div class="keywords">
                    ${keywords.slice(0, 5).map(keyword => 
                        `<span class="keyword-tag">${keyword}</span>`
                    ).join('')}
                </div>
                ` : ''}
                
                <div class="mt-3">
                    <a href="${paper.url}" target="_blank" class="btn btn-outline-primary btn-sm me-2">
                        <i class="fas fa-external-link-alt me-1"></i>View Paper
                    </a>
                    ${paper.pdf_url ? `
                    <a href="${paper.pdf_url}" target="_blank" class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-file-pdf me-1"></i>PDF
                    </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

export function generateRSSFeed(papers, options = {}) {
  const {
    title = 'PaperDog - AI Papers Daily',
    description = 'Daily curated AI and computer vision research papers',
    link = 'https://paperdog.org',
    maxItems = 20
  } = options;
  
  const sortedPapers = sortPapersByDate(papers).slice(0, maxItems);
  
  const items = sortedPapers.map(paper => {
    const pubDate = new Date(paper.published || paper.scraped_at).toUTCString();
    const description = `
        <strong>Authors:</strong> ${paper.authors ? paper.authors.join(', ') : 'Unknown'}<br>
        <strong>Category:</strong> ${paper.analysis?.category || paper.category || 'other'}<br>
        <strong>Relevance Score:</strong> ${paper.analysis?.relevance_score || 5}/10<br><br>
        ${paper.abstract ? paper.abstract.substring(0, 500) + '...' : 'No abstract available'}
        ${paper.analysis?.keywords ? '<br><br><strong>Keywords:</strong> ' + paper.analysis.keywords.join(', ') : ''}
    `;
    
    return `
        <item>
            <title><![CDATA[${paper.title}]]></title>
            <description><![CDATA[${description}]]></description>
            <link>${paper.url}</link>
            <guid isPermaLink="false">${paper.id}</guid>
            <pubDate>${pubDate}</pubDate>
        </item>
    `;
  }).join('');
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${title}</title>
        <description>${description}</description>
        <link>${link}</link>
        <atom:link href="${link}/feed" rel="self" type="application/rss+xml"/>
        <language>en</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
    </channel>
</rss>`;
  
  return rss;
}