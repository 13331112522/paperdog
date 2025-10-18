// MCP (Model Context Protocol) Server Implementation for PaperDog
// Handles JSON-RPC protocol communication for AI agents

/**
 * MCP Protocol Handler for Cloudflare Workers
 * Implements the Model Context Protocol for AI agent integration
 */

// MCP Server Configuration
const MCP_CONFIG = {
  RATE_LIMITS: {
    REQUESTS_PER_HOUR: 100,
    REQUESTS_PER_DAY: 1000,
    HOUR_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    DAY_WINDOW_MS: 24 * 60 * 60 * 1000 // 24 hours
  },
  VALIDATION: {
    MAX_REQUEST_SIZE_MB: 1,
    MAX_QUERY_LENGTH: 500,
    MIN_QUERY_LENGTH: 2,
    MAX_CATEGORY_LENGTH: 50,
    MIN_LIMIT: 1,
    MAX_LIMIT: 100,
    MIN_SCORE: 1,
    MAX_SCORE: 10
  }
};

export class MCPServer {
  constructor(env) {
    this.env = env;
    this.tools = new Map();
    this.rateLimits = new Map();
    this.initializeTools();
  }

  // Initialize all available MCP tools
  initializeTools() {
    this.tools.set('paperdog_search_papers', {
      name: 'paperdog_search_papers',
      description: 'Search across arXiv and HuggingFace papers with advanced filtering',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for papers'
          },
          category: {
            type: 'string',
            enum: ['computer_vision', 'machine_learning', 'natural_language_processing', 'reinforcement_learning', 'multimodal_learning', 'generative_models', 'diffusion_models', 'transformer_architectures', 'optimization', 'robotics', 'ethics_ai', 'datasets'],
            description: 'Filter by research category'
          },
          limit: {
            type: 'number',
            default: 20,
            minimum: 1,
            maximum: 100,
            description: 'Maximum number of results to return'
          },
          min_score: {
            type: 'number',
            minimum: 1,
            maximum: 10,
            description: 'Minimum relevance score filter'
          }
        },
        required: ['query']
      }
    });

    this.tools.set('paperdog_get_daily_papers', {
      name: 'paperdog_get_daily_papers',
      description: "Get today's curated top papers with AI analysis",
      inputSchema: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'Date in YYYY-MM-DD format (defaults to today)'
          },
          category: {
            type: 'string',
            enum: ['computer_vision', 'machine_learning', 'natural_language_processing', 'reinforcement_learning', 'multimodal_learning', 'generative_models', 'diffusion_models', 'transformer_architectures', 'optimization', 'robotics', 'ethics_ai', 'datasets'],
            description: 'Filter by research category'
          }
        }
      }
    });

    this.tools.set('paperdog_get_paper_details', {
      name: 'paperdog_get_paper_details',
      description: 'Get detailed information about a specific paper including full analysis',
      inputSchema: {
        type: 'object',
        properties: {
          paper_id: {
            type: 'string',
            description: 'Unique identifier of the paper'
          },
          date: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'Date in YYYY-MM-DD format (required if paper_id is not a UUID)'
          },
          include_analysis: {
            type: 'boolean',
            default: true,
            description: 'Include AI analysis in response'
          }
        },
        required: ['paper_id']
      }
    });

    this.tools.set('paperdog_get_categories', {
      name: 'paperdog_get_categories',
      description: 'Get all available research categories and their statistics',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    });

    this.tools.set('paperdog_get_archive_papers', {
      name: 'paperdog_get_archive_papers',
      description: 'Get papers from historical archives with advanced filtering',
      inputSchema: {
        type: 'object',
        properties: {
          start_date: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'Start date in YYYY-MM-DD format'
          },
          end_date: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'End date in YYYY-MM-DD format'
          },
          category: {
            type: 'string',
            enum: ['computer_vision', 'machine_learning', 'natural_language_processing', 'reinforcement_learning', 'multimodal_learning', 'generative_models', 'diffusion_models', 'transformer_architectures', 'optimization', 'robotics', 'ethics_ai', 'datasets'],
            description: 'Filter by research category'
          },
          limit: {
            type: 'number',
            default: 20,
            minimum: 1,
            maximum: 100,
            description: 'Maximum number of results'
          }
        }
      }
    });
  }

  // Handle MCP JSON-RPC requests
  async handleRequest(request) {
    try {
      // Add request size validation
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MCP_CONFIG.VALIDATION.MAX_REQUEST_SIZE_MB * 1024 * 1024) {
        return this.createErrorResponse(null, -32603, 'Request too large');
      }

      // Add JSON parsing protection
      let body;
      try {
        body = await request.json();
      } catch (parseError) {
        return this.createErrorResponse(null, -32600, 'Invalid JSON format');
      }

      // Validate required JSON-RPC fields
      const { jsonrpc, id, method, params } = body;

      if (!jsonrpc || !method) {
        return this.createErrorResponse(id || null, -32600, 'Missing required JSON-RPC fields');
      }

      // Validate JSON-RPC format
      if (jsonrpc !== '2.0') {
        return this.createErrorResponse(id, -32600, 'Invalid Request');
      }

      // Rate limiting check (IP-based)
      const clientIP = request.headers.get('CF-Connecting-IP');
      if (!clientIP || clientIP === 'unknown') {
        return this.createErrorResponse(id, -32003, 'Unable to verify client IP');
      }

      if (!this.checkRateLimit(clientIP)) {
        return this.createErrorResponse(id, -32003, 'Rate limit exceeded');
      }

      // Handle different MCP methods
      switch (method) {
        case 'tools/list':
          return this.handleListTools(id);

        case 'tools/call':
          return this.handleToolCall(id, params);

        case 'initialize':
          return this.handleInitialize(id, params);

        default:
          return this.createErrorResponse(id, -32601, 'Method not found');
      }

    } catch (error) {
      console.error('MCP Request handling error:', error);
      // Generic error message for production (don't expose internal errors)
      return this.createErrorResponse(null, -32603, 'Request processing failed');
    }
  }

  // Handle initialize request
  handleInitialize(id, params) {
    return this.createSuccessResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        logging: {}
      },
      serverInfo: {
        name: 'PaperDog MCP Server',
        version: '1.0.0'
      }
    });
  }

  // Handle tools/list request
  handleListTools(id) {
    const tools = Array.from(this.tools.values());
    return this.createSuccessResponse(id, { tools });
  }

  // Handle tools/call request
  async handleToolCall(id, params) {
    const { name, arguments: args } = params;

    if (!this.tools.has(name)) {
      return this.createErrorResponse(id, -32602, `Unknown tool: ${name}`);
    }

    try {
      const result = await this.executeTool(name, args);
      return this.createSuccessResponse(id, result);
    } catch (error) {
      console.error(`Tool execution error (${name}):`, error);
      return this.createErrorResponse(id, -32603, `Tool execution failed: ${error.message}`);
    }
  }

  // Execute specific tool
  async executeTool(toolName, args) {
    switch (toolName) {
      case 'paperdog_search_papers':
        return await this.searchPapers(args);

      case 'paperdog_get_daily_papers':
        return await this.getDailyPapers(args);

      case 'paperdog_get_paper_details':
        return await this.getPaperDetails(args);

      case 'paperdog_get_categories':
        return await this.getCategories(args);

      case 'paperdog_get_archive_papers':
        return await this.getArchivePapers(args);

      default:
        throw new Error(`Tool ${toolName} not implemented`);
    }
  }

  // Tool implementations
  async searchPapers(args) {
    // Validate and sanitize inputs
    if (!args.query || typeof args.query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    const query = args.query.trim().substring(0, MCP_CONFIG.VALIDATION.MAX_QUERY_LENGTH);
    if (query.length < MCP_CONFIG.VALIDATION.MIN_QUERY_LENGTH) {
      throw new Error(`Search query must be at least ${MCP_CONFIG.VALIDATION.MIN_QUERY_LENGTH} characters`);
    }

    const category = args.category ? args.category.substring(0, MCP_CONFIG.VALIDATION.MAX_CATEGORY_LENGTH) : undefined;
    const limit = Math.min(Math.max(parseInt(args.limit) || 20, MCP_CONFIG.VALIDATION.MIN_LIMIT), MCP_CONFIG.VALIDATION.MAX_LIMIT);
    const min_score = args.min_score ? Math.min(Math.max(parseFloat(args.min_score), MCP_CONFIG.VALIDATION.MIN_SCORE), MCP_CONFIG.VALIDATION.MAX_SCORE) : undefined;

    // Import search functionality
    const { handleSearch } = await import('./handlers.js');

    // Create mock request for search handler
    const url = new URL('https://paperdog.org/api/search');
    url.searchParams.set('q', query);
    if (category) url.searchParams.set('category', category);
    if (limit) url.searchParams.set('limit', limit.toString());
    if (min_score) url.searchParams.set('min_score', min_score.toString());

    const mockRequest = new Request(url.toString());
    const response = await handleSearch(mockRequest, this.env);
    const data = await response.json();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          papers: data.papers || [],
          total_found: data.total_found || 0,
          search_metadata: {
            query,
            filters: { category, min_score },
            executed_at: new Date().toISOString()
          }
        }, null, 2)
      }]
    };
  }

  async getDailyPapers(args) {
    const { date, category } = args;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Import papers functionality
    const { handlePapersByDate } = await import('./handlers.js');

    // Create mock request for papers by date handler
    const url = new URL(`https://paperdog.org/api/papers/${targetDate}`);
    if (category) url.searchParams.set('category', category);

    const mockRequest = new Request(url.toString());
    const response = await handlePapersByDate(mockRequest, this.env, targetDate);

    // Handle case where response is JSON (error) vs HTML (success)
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorData.message || 'No papers found for this date',
            date: targetDate
          }, null, 2)
        }]
      };
    }

    // For HTML response, parse papers from the cached data
    const { getCachedPapers } = await import('./utils.js');
    const papers = await getCachedPapers(targetDate, this.env);

    if (!papers || papers.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'No papers found for this date',
            date: targetDate
          }, null, 2)
        }]
      };
    }

    let filteredPapers = papers;
    if (category) {
      filteredPapers = papers.filter(paper =>
        (paper.analysis?.category || paper.category) === category
      );
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          date: targetDate,
          papers: filteredPapers,
          total_found: filteredPapers.length,
          category_filter: category
        }, null, 2)
      }]
    };
  }

  async getPaperDetails(args) {
    const { paper_id, date, include_analysis = true } = args;

    // Import handler functionality
    const { handlePaperById } = await import('./handlers.js');

    try {
      // Create mock request for paper by ID handler
      const url = new URL(`https://paperdog.org/api/papers/${paper_id}`);
      if (date) url.searchParams.set('date', date);

      const mockRequest = new Request(url.toString());
      const response = await handlePaperById(mockRequest, this.env, paper_id);

      // Handle case where response is JSON (error) vs data (success)
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        // If it's an error response
        if (data.error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: data.error,
                paper_id
              }, null, 2)
            }]
          };
        }

        // If it's a successful response with paper data
        const result = {
          success: true,
          paper: {
            id: data.id || paper_id,
            title: data.title,
            authors: data.authors,
            abstract: data.abstract,
            published: data.published,
            arxiv_id: data.arxiv_id,
            huggingface_id: data.huggingface_id,
            url: data.url,
            pdf_url: data.pdf_url,
            category: data.category,
            scoring: data.scoring
          }
        };

        if (include_analysis && data.analysis) {
          result.paper.analysis = data.analysis;
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } else {
        // Handle non-JSON response (likely an error page)
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Paper not found or invalid response format',
              paper_id
            }, null, 2)
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: `Failed to get paper details: ${error.message}`,
            paper_id
          }, null, 2)
        }]
      };
    }
  }

  async getCategories(args) {
    // Import handler functionality
    const { handleCategories } = await import('./handlers.js');

    try {
      // Create mock request for categories handler
      const url = new URL('https://paperdog.org/api/categories');
      const mockRequest = new Request(url.toString());
      const response = await handleCategories(mockRequest, this.env);

      const data = await response.json();

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            categories: data.categories || [],
            total_categories: data.categories?.length || 0
          }, null, 2)
        }]
      };
    } catch (error) {
      // Fallback to config if handler fails
      const { TOPIC_CATEGORIES } = await import('./config.js');
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            categories: TOPIC_CATEGORIES,
            total_categories: TOPIC_CATEGORIES.length
          }, null, 2)
        }]
      };
    }
  }

  async getArchivePapers(args) {
    const { start_date, end_date, category, limit = 20 } = args;

    // Import archive functionality
    const { archiveHandlers } = await import('./archive-handlers.js');

    try {
      // Create mock request with URL for archive range handler
      const url = new URL('https://paperdog.org/api/archive/range');
      if (start_date) url.searchParams.set('start_date', start_date);
      if (end_date) url.searchParams.set('end_date', end_date);
      if (category) url.searchParams.set('category', category);
      if (limit) url.searchParams.set('limit', limit.toString());

      const mockRequest = {
        url: url.toString(),
        json: async () => ({
          start_date,
          end_date,
          category,
          limit
        })
      };

      const response = await archiveHandlers.handleArchiveRange(mockRequest, this.env);
      const data = await response.json();

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            papers: data.papers || [],
            total_found: data.total_found || 0,
            date_range: { start_date, end_date },
            category_filter: category
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: `Archive search failed: ${error.message}`,
            date_range: { start_date, end_date },
            category_filter: category
          }, null, 2)
        }]
      };
    }
  }

  // Rate limiting implementation
  checkRateLimit(clientIP) {
    const now = Date.now();
    const hourWindow = MCP_CONFIG.RATE_LIMITS.HOUR_WINDOW_MS;
    const maxRequestsPerHour = MCP_CONFIG.RATE_LIMITS.REQUESTS_PER_HOUR;

    if (!this.rateLimits.has(clientIP)) {
      this.rateLimits.set(clientIP, []);
    }

    const requests = this.rateLimits.get(clientIP);

    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < hourWindow);
    this.rateLimits.set(clientIP, validRequests);

    // Check if under limit
    if (validRequests.length >= maxRequestsPerHour) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    return true;
  }

  // JSON-RPC response helpers
  createSuccessResponse(id, result) {
    return {
      jsonrpc: '2.0',
      id,
      result
    };
  }

  createErrorResponse(id, code, message) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
  }
}

// Rate limit cleanup (run periodically)
export function cleanupRateLimits(server) {
  const now = Date.now();
  const hourWindow = MCP_CONFIG.RATE_LIMITS.HOUR_WINDOW_MS;

  for (const [ip, requests] of server.rateLimits.entries()) {
    const validRequests = requests.filter(timestamp => now - timestamp < hourWindow);
    if (validRequests.length === 0) {
      server.rateLimits.delete(ip);
    } else {
      server.rateLimits.set(ip, validRequests);
    }
  }
}