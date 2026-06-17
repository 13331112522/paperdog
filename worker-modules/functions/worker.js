// Main entry point - imports all modules and sets up the worker
import { routes, getGLMFallbackConfig } from '../src/config.js';
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
  handleBlog,
  handleBlogPost,
  handleBlogImage,
  handleScoringReport,
  handleTrackPaperView,
  handleArchivePage,
  handleTranslate
} from '../src/handlers.js';
import { archiveHandlers } from '../src/archive-handlers.js';
import { scrapeDailyPapers } from '../src/paper-scraper.js';
import { analyzePapers } from '../src/paper-analyzer.js';
import { generateDailyReport } from '../src/blog-generator.js';
import { errorResponse, cachePapers, jsonResponse, textResponse, markdownResponse } from '../src/utils.js';
import { archivePapers } from '../src/archive-manager.js';
import { debugUtils } from '../src/debug-utils.js';
import { MCPServer, cleanupRateLimits } from '../src/mcp-server.js';
import { getLlmsTxt, getLlmsFullTxt, getAgentManifest, formatAsMarkdown } from '../src/agent-cli.js';

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
  handleBlog,
  handleBlogPost,
  handleBlogImage,
  handleScoringReport,
  handleTrackPaperView,
  handleArchivePage,
  handleTranslate,
  // Archive handlers
  handleArchiveDates: archiveHandlers.handleArchiveDates,
  handleArchiveByDate: archiveHandlers.handleArchiveByDate,
  handleArchiveRange: archiveHandlers.handleArchiveRange,
  handleArchiveSearch: archiveHandlers.handleArchiveSearch,
  handleArchiveStatistics: archiveHandlers.handleArchiveStatistics,
  handleArchiveExport: archiveHandlers.handleArchiveExport,
  handleExportFormats: archiveHandlers.handleExportFormats,
  handleCreateArchive: archiveHandlers.handleCreateArchive,
  // MCP handlers (will be defined inline)
  handleMCP: null,
  handleMCPDiscovery: null,
  handleForAIAgents: null,
  handleAPIDocs: null
};

// MCP Server instance
let mcpServer = null;

// Content negotiation: convert JSON responses to markdown for CLI agents
async function maybeConvertToMarkdown(response, request, handlerName) {
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) return response;

  const url = new URL(request.url);
  const format = url.searchParams.get('format');
  const accept = request.headers.get('Accept') || '';
  const wantsText = format === 'text' ||
    (accept.includes('text/plain') && !accept.includes('text/html')) ||
    accept.includes('text/markdown');

  if (!wantsText) return response;

  try {
    const data = await response.json();
    const md = formatAsMarkdown(data, handlerName);
    return markdownResponse(md);
  } catch (e) {
    return response;
  }
}

// Main Fetch Handler
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Initialize MCP server if needed
      if (!mcpServer) {
        mcpServer = new MCPServer(env);
      }

      // Debug logging for Chrome DevTools
      debugUtils.debugLog('Incoming request', { method, path, url: request.url });
      
      // Handle OPTIONS preflight
      if (method === 'OPTIONS') {
        debugUtils.debugLog('Handling OPTIONS preflight request');
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, max-age=86400',
          }
        });
      }

      // Handle MCP routes (special handling)
      if (path === '/mcp' && method === 'POST') {
        debugUtils.debugLog('Handling MCP request');
        const mcpResponse = await mcpServer.handleRequest(request);
        return new Response(JSON.stringify(mcpResponse), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store',
          }
        });
      }

      if (path === '/.well-known/mcp' && method === 'GET') {
        debugUtils.debugLog('Handling MCP discovery request');
        return await handleMCPDiscovery(request, env);
      }

      if (path === '/for-ai-agents' && method === 'GET') {
        debugUtils.debugLog('Handling AI agents page request');
        const accept = request.headers.get('Accept') || '';
        if (accept.includes('text/plain') || accept.includes('text/markdown')) {
          return textResponse(getLlmsFullTxt(url.origin));
        }
        return await handleForAIAgents(request, env);
      }

      if (path === '/api/docs' && method === 'GET') {
        debugUtils.debugLog('Handling API docs request');
        const accept = request.headers.get('Accept') || '';
        if (accept.includes('text/plain') || accept.includes('text/markdown')) {
          return textResponse(getLlmsFullTxt(url.origin));
        }
        return await handleAPIDocs(request, env);
      }

      if (path === '/ai-agents.txt' && method === 'GET') {
        debugUtils.debugLog('Handling AI agents.txt request');
        return await handleAIAgentsTxt(request, env);
      }

      // Agent CLI routes
      if (path === '/llms.txt' && method === 'GET') {
        return textResponse(getLlmsTxt(url.origin), 200, 3600);
      }

      if (path === '/llms-full.txt' && method === 'GET') {
        return textResponse(getLlmsFullTxt(url.origin), 200, 3600);
      }

      if (path === '/agent' && method === 'GET') {
        return jsonResponse(getAgentManifest(url.origin), 200, 3600);
      }

      // Static utility routes
      if (url.pathname === '/robots.txt') {
          return new Response('User-agent: *\nAllow: /\nSitemap: https://paperdog.org/sitemap.xml', {
              headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' }
          });
      }
      if (url.pathname === '/sitemap.xml') {
          const origin = url.origin;
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${origin}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${origin}/archive</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${origin}/blog</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${origin}/for-ai-agents</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
  <url><loc>${origin}/api/docs</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
  <url><loc>${origin}/llms.txt</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>
  <url><loc>${origin}/agent</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>
  <url><loc>${origin}/feed</loc><changefreq>daily</changefreq><priority>0.5</priority></url>
</urlset>`;
          return new Response(sitemap, {
              headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' }
          });
      }
      if (url.pathname === '/favicon.ico') {
          return new Response(null, { status: 204, headers: { 'Cache-Control': 'public, max-age=604800' } });
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
                debugUtils.debugLog('Route matched with parameter', { pattern, handlerName, paramValue });
                const handler = handlers[handlerName];
                if (handler) {
                  const response = await handler(request, env, paramValue);
                  return await maybeConvertToMarkdown(response, request, handlerName);
                }
              }
            }
          } else if (path === routePath) {
            debugUtils.debugLog('Route matched', { path, handlerName });
            const handler = handlers[handlerName];
            if (handler) {
              const response = await handler(request, env);
              return await maybeConvertToMarkdown(response, request, handlerName);
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

      // GLM is the primary analysis path; without this config the cron would
      // fall through to OpenRouter (and miss GLM entirely). Mirrors handleUpdatePapers.
      const glmFallbackConfig = getGLMFallbackConfig(env);
      if (!glmFallbackConfig.apiKey) {
        console.error('❌ GLM_API_KEY not configured');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      console.log(`🔄 Starting daily paper update for ${today}`);
      
      // Debug logging for Chrome DevTools
      debugUtils.debugLog('Starting scheduled paper update', { date: today });
      
      // Step 1: Scrape papers
      console.log('📡 Scraping papers from sources...');
      const scrapedPapers = await scrapeDailyPapers();
      if (scrapedPapers.length === 0) {
        console.error('❌ No papers could be scraped from sources');
        debugUtils.debugLog('No papers scraped', { error: 'No papers found' });
        return;
      }
      
      console.log(`✅ Scraped ${scrapedPapers.length} papers`);
      debugUtils.debugLog('Papers scraped successfully', { count: scrapedPapers.length });
      
      // Step 2: Analyze papers
      console.log('🧠 Analyzing papers with AI...');
      debugUtils.debugLog('Starting paper analysis', { paperCount: scrapedPapers.length });
      const analyzedPapers = await analyzePapers(scrapedPapers, apiKey, glmFallbackConfig);
      
      console.log(`✅ Analyzed ${analyzedPapers.length} papers`);
      debugUtils.debugLog('Papers analyzed successfully', { count: analyzedPapers.length });
      
      // Step 3: Cache results
      console.log('💾 Caching results...');
      debugUtils.debugLog('Caching papers', { date: today, count: analyzedPapers.length });
      await cachePapers(today, analyzedPapers, env);

      // Step 4: Generate daily report
      console.log('📊 Generating daily report...');
      debugUtils.debugLog('Generating daily report', { date: today });
      const dailyReport = await generateDailyReport(analyzedPapers, today);

      // Step 5: Archive top 10 papers for long-term storage
      console.log('📦 Archiving top 10 papers for long-term storage...');
      debugUtils.debugLog('Starting paper archiving', { date: today });
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
        debugUtils.debugLog('Papers archived successfully', { 
          date: today, 
          archivedCount: archiveResult.papers_archived, 
          totalCount: analyzedPapers.length 
        });
      } catch (archiveError) {
        console.warn('⚠️ Failed to archive papers:', archiveError.message);
        debugUtils.debugLog('Paper archiving failed', { error: archiveError.message });
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
      debugUtils.debugLog('Scheduled update completed', {
        date: today,
        processedPapers: analyzedPapers.length,
        categories
      });

    } catch (error) {
      console.error('❌ Scheduled paper update failed:', error);
      debugUtils.debugLog('Scheduled update failed', { error: error.message });
    }

    // Cleanup MCP rate limits (run every hour)
    try {
      if (mcpServer) {
        cleanupRateLimits(mcpServer);
        debugUtils.debugLog('MCP rate limits cleaned up');
      }
    } catch (error) {
      console.error('Rate limit cleanup failed:', error);
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
        'Cache-Control': 'public, max-age=300',
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
        'Cache-Control': 'public, max-age=300',
      }
    });
  } catch (error) {
    console.error('Error in report handler:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// MCP Handler Functions
async function handleMCPDiscovery(request, env) {
  try {
    const discoveryData = {
      name: 'PaperDog MCP Server',
      version: '1.0.0',
      description: 'AI research paper discovery and analysis service via Model Context Protocol',
      url: 'https://paperdog.org',
      mcp_endpoint: 'https://paperdog.org/mcp',
      capabilities: {
        tools: [
          'paperdog_search_papers',
          'paperdog_get_daily_papers',
          'paperdog_get_paper_details',
          'paperdog_get_categories',
          'paperdog_get_archive_papers'
        ]
      },
      authentication: {
        type: 'none',
        description: 'No authentication required - rate limited by IP'
      },
      rate_limits: {
        requests_per_hour: 100,
        requests_per_day: 1000
      },
      documentation: {
        api_docs: 'https://paperdog.org/api/docs',
        agent_guide: 'https://paperdog.org/for-ai-agents'
      },
      contact: {
        website: 'https://paperdog.org',
        support: 'https://paperdog.org/about'
      },
      tags: [
        'ai-research',
        'machine-learning',
        'arxiv',
        'papers',
        'research',
        'academic',
        'discovery'
      ],
      category: 'research-tools',
      license: 'MIT',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    };

    return new Response(JSON.stringify(discoveryData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error) {
    console.error('Error in MCP discovery handler:', error);
    return errorResponse(error.message, 500);
  }
}

async function handleForAIAgents(request, env) {
  try {
    const url = new URL(request.url);
    const { getForAIAgentsHTML } = await import('../src/agent-pages.js');
    const html = getForAIAgentsHTML(url.origin);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error) {
    console.error('Error in AI agents handler:', error);
    return errorResponse(error.message, 500);
  }
}

async function handleAPIDocs(request, env) {
  try {
    const url = new URL(request.url);
    const { getAPIDocsHTML } = await import('../src/agent-pages.js');
    const html = getAPIDocsHTML(url.origin);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error) {
    console.error('Error in API docs handler:', error);
    return errorResponse(error.message, 500);
  }
}

async function handleAIAgentsTxt(request, env) {
  try {
    const aiAgentsContent = `# AI Agents Discovery File
# This file helps AI agents understand PaperDog's capabilities and integration points

# Service Information
User-agent: *
Service: PaperDog Research Paper Discovery
Description: AI research paper discovery and analysis service via Model Context Protocol
Version: 1.0.0
Provider: PaperDog Team
Website: https://paperdog.org

# MCP Integration
MCP-Endpoint: https://paperdog.org/mcp
MCP-Discovery: https://paperdog.org/.well-known/mcp
Protocol: Model Context Protocol (MCP) 1.0
Authentication: None (rate limited by IP)
Rate-Limit: 100 requests per hour, 1000 per day

# Available MCP Tools
Tools: paperdog_search_papers, paperdog_get_daily_papers, paperdog_get_paper_details, paperdog_get_categories, paperdog_get_archive_papers

# Data Sources
Sources: arXiv.org, HuggingFace.co
Data-Types: Research papers, AI analysis, citations, metadata
Languages: English, Chinese
Update-Frequency: Daily

# API Documentation
API-Docs: https://paperdog.org/api/docs
Agent-Guide: https://paperdog.org/for-ai-agents
REST-API: https://paperdog.org/api/

# Integration Examples
Claude-Integration: See https://paperdog.org/for-ai-agents
ChatGPT-Plugin: See https://paperdog.org/for-ai-agents
Custom-Integration: See https://paperdog.org/api/docs

# Categories Supported
Categories: computer_vision, machine_learning, natural_language_processing, reinforcement_learning, multimodal_learning, generative_models, diffusion_models, transformer_architectures, optimization, robotics, ethics_ai, datasets

# Performance Metrics
Uptime: 99.9%
Average-Response-Time: <2 seconds
Daily-Paper-Count: 10-15 curated papers
Archive-Size: Growing daily archive`;

    return new Response(aiAgentsContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error) {
    console.error('Error in AI agents.txt handler:', error);
    return errorResponse(error.message, 500);
  }
}