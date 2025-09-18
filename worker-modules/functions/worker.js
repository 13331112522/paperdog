// Main entry point - imports all modules and sets up the worker
import { routes } from '../src/config.js';
import {
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
} from '../src/handlers.js';
import { archiveHandlers } from '../src/archive-handlers.js';
import { scrapeDailyPapers } from '../src/paper-scraper.js';
import { analyzePapers } from '../src/paper-analyzer.js';
import { generateDailyReport } from '../src/blog-generator.js';
import { errorResponse, cachePapers } from '../src/utils.js';
import { archivePapers } from '../src/archive-manager.js';

// Handler mapping - direct function calls instead of eval
const handlers = {
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
  handleArchivePage,
  // Archive handlers
  handleArchiveDates: archiveHandlers.handleArchiveDates,
  handleArchiveByDate: archiveHandlers.handleArchiveByDate,
  handleArchiveRange: archiveHandlers.handleArchiveRange,
  handleArchiveSearch: archiveHandlers.handleArchiveSearch,
  handleArchiveStatistics: archiveHandlers.handleArchiveStatistics,
  handleArchiveExport: archiveHandlers.handleArchiveExport,
  handleExportFormats: archiveHandlers.handleExportFormats,
  handleCreateArchive: archiveHandlers.handleCreateArchive
};

// Main Fetch Handler
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;
      
      // Handle OPTIONS preflight
      if (method === 'OPTIONS') {
        return new Response(null, { 
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        });
      }

      // Route matching
      for (const [pattern, handlerName] of Object.entries(routes)) {
        const [routeMethod, routePath] = pattern.split(' ');
        if (method === routeMethod) {
          // Handle parameterized routes
          if (routePath.includes(':')) {
            const routeParts = routePath.split('/');
            const pathParts = path.split('/');
            if (routeParts.length === pathParts.length) {
              let match = true;
              let paramValue = null;
              for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                  paramValue = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                  match = false;
                  break;
                }
              }
              if (match && paramValue) {
                // Call handler directly using handler mapping
                const handler = handlers[handlerName];
                if (handler) {
                  return await handler(request, env, paramValue);
                }
              }
            }
          } else if (path === routePath) {
            // Call handler directly using handler mapping
            const handler = handlers[handlerName];
            if (handler) {
              return await handler(request, env);
            }
          }
        }
      }
      
      // Handle static routes (archive, report, etc.)
      if (path === '/archive') {
        return await handleArchive(request, env);
      } else if (path.startsWith('/report/')) {
        const date = path.split('/')[2];
        return await handleReportByDate(request, env, date);
      }
      
      return errorResponse('Route not found', 404);
    } catch (error) {
      console.error('Fetch error:', error);
      return errorResponse(error.message, error.statusCode || 500);
    }
  },

  async scheduled(event, env, ctx) {
    console.log('Running scheduled paper update at:', new Date().toISOString());
    
    try {
      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) {
        console.error('❌ OPENROUTER_API_KEY not configured');
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      console.log(`🔄 Starting daily paper update for ${today}`);
      
      // Step 1: Scrape papers
      console.log('📡 Scraping papers from sources...');
      const scrapedPapers = await scrapeDailyPapers();
      if (scrapedPapers.length === 0) {
        console.error('❌ No papers could be scraped from sources');
        return;
      }
      
      console.log(`✅ Scraped ${scrapedPapers.length} papers`);
      
      // Step 2: Analyze papers
      console.log('🧠 Analyzing papers with AI...');
      const analyzedPapers = await analyzePapers(scrapedPapers, apiKey);
      
      console.log(`✅ Analyzed ${analyzedPapers.length} papers`);
      
      // Step 3: Cache results
      console.log('💾 Caching results...');
      await cachePapers(today, analyzedPapers, env);

      // Step 4: Generate daily report
      console.log('📊 Generating daily report...');
      const dailyReport = await generateDailyReport(analyzedPapers, today);

      // Step 5: Archive top 10 papers for long-term storage
      console.log('📦 Archiving top 10 papers for long-term storage...');
      try {
        // Sort papers by relevance score and take top 10 for archiving
        const topPapers = [...analyzedPapers]
          .sort((a, b) => {
            const scoreA = (a.analysis?.relevance_score || a.scoring?.total_score || 5);
            const scoreB = (b.analysis?.relevance_score || b.scoring?.total_score || 5);
            return scoreB - scoreA; // Higher score first
          })
          .slice(0, 10); // Archive only top 10 papers

        const archiveResult = await archivePapers(today, topPapers, env, {
          source: 'scheduled_update',
          auto_archived: true,
          papers_archived: topPapers.length,
          total_papers_analyzed: analyzedPapers.length
        });
        console.log(`✅ Successfully archived ${archiveResult.papers_archived} top papers for ${today} (from ${analyzedPapers.length} total)`);
      } catch (archiveError) {
        console.warn('⚠️ Failed to archive papers:', archiveError.message);
        // Don't fail the entire update if archiving fails
      }

      console.log('✅ Daily report generated successfully!');
      console.log(`📈 Summary: ${analyzedPapers.length} papers processed, ${dailyReport.total_papers} total papers`);
      
      // Log statistics
      const categories = {};
      analyzedPapers.forEach(paper => {
        const category = paper.analysis?.category || paper.category || 'other';
        categories[category] = (categories[category] || 0) + 1;
      });
      
      console.log('📂 Category breakdown:', categories);
      
    } catch (error) {
      console.error('❌ Scheduled paper update failed:', error);
    }
  }
};

// Additional route handlers
async function handleArchive(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 12;
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    
    // Get papers from the last 30 days
    let allPapers = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const papers = await env.PAPERS.get(`papers_${dateStr}`);
      if (papers) {
        const parsed = JSON.parse(papers);
        allPapers.push(...parsed);
      }
    }
    
    // Apply filters
    if (category) {
      allPapers = allPapers.filter(p => 
        (p.analysis?.category || p.category || 'other') === category
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      allPapers = allPapers.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.abstract.toLowerCase().includes(searchLower) ||
        (p.authors && p.authors.some(a => a.toLowerCase().includes(searchLower)))
      );
    }
    
    // Import and use templates
    const { getArchiveHTML } = await import('../src/templates.js');
    const html = getArchiveHTML(allPapers, { page, limit, category, search });
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Error in archive handler:', error);
    return errorResponse(error.message, 500);
  }
}

async function handleReportByDate(request, env, date) {
  try {
    // Import validation function
    const { validateDate, getCachedPapers } = await import('../src/utils.js');
    const { generateDailyReport } = await import('../src/blog-generator.js');
    const { getReportHTML } = await import('../src/templates.js');
    
    validateDate(date);
    
    const papers = await getCachedPapers(date, env);
    if (!papers || papers.length === 0) {
      return errorResponse('No papers found for this date', 404);
    }
    
    const report = await generateDailyReport(papers, date);
    const html = getReportHTML(report);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Error in report handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}