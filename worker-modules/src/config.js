// Configuration constants for PaperDog Blog
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Custom Error Class
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Route Configuration
export const routes = {
  'GET /': 'handleRoot',
  'GET /api/papers': 'handlePapersList',
  'GET /api/papers/:date': 'handlePapersByDate',
  'GET /api/papers/:id': 'handlePaperById',
  'POST /api/papers/:id/view': 'handleTrackPaperView',
  'POST /api/update': 'handleUpdatePapers',
  'GET /api/categories': 'handleCategories',
  'GET /api/search': 'handleSearch',
  'GET /feed': 'handleRSSFeed',
  'GET /about': 'handleAbout',
  'GET /api/scoring/:date': 'handleScoringReport',
  // Archive routes
  'GET /api/archive/dates': 'handleArchiveDates',
  'GET /api/archive/:date': 'handleArchiveByDate',
  'GET /api/archive/range': 'handleArchiveRange',
  'GET /api/archive/search': 'handleArchiveSearch',
  'GET /api/archive/statistics': 'handleArchiveStatistics',
  'GET /api/archive/export': 'handleArchiveExport',
  'GET /api/archive/export/formats': 'handleExportFormats',
  'POST /api/archive/create': 'handleCreateArchive',
  'GET /archive': 'handleArchivePage',
  'POST /api/translate': 'handleTranslate',
  // MCP routes
  'POST /mcp': 'handleMCP',
  'GET /.well-known/mcp': 'handleMCPDiscovery',
  'GET /for-ai-agents': 'handleForAIAgents',
  'GET /api/docs': 'handleAPIDocs',
  'GET /ai-agents.txt': 'handleAIAgentsTxt',
};

// Paper sources configuration
export const PAPER_SOURCES = {
  arxiv: {
    baseUrl: 'https://export.arxiv.org/api/query',
    categories: ['cs.CV', 'cs.AI', 'cs.LG', 'cs.CL', 'cs.RO'],
    maxResults: 50,
    sortBy: 'submittedDate',
    sortOrder: 'descending'
  },
  huggingface: {
    baseUrl: 'https://huggingface.co/api/papers',
    categories: ['computer-vision', 'natural-language-processing', 'machine-learning'],
    maxResults: 30
  }
};

// Topic categories for AI/ML papers
export const TOPIC_CATEGORIES = [
  'computer_vision',
  'machine_learning', 
  'natural_language_processing',
  'reinforcement_learning',
  'multimodal_learning',
  'generative_models',
  'diffusion_models',
  'transformer_architectures',
  'optimization',
  'robotics',
  'ethics_ai',
  'datasets'
];

// Source-specific scraping configurations
export const SOURCE_CONFIGS = {
  arxiv: {
    maxPapersPerRequest: 15,
    requestDelay: 1000,
    retryAttempts: 3,
    dateRange: 7, // Last 7 days to get more results
    fields: 'id,title,summary,authors,published,updated,primary_category'
  },
  huggingface: {
    maxPapersPerRequest: 10,
    requestDelay: 2000,
    retryAttempts: 3,
    dateRange: 1,
    fields: 'title,summary,authors,published,id,arxiv_id,tags'
  }
};

// Model configuration for paper analysis
export const MODEL_CONFIG = {
  analysis: 'openai/gpt-5-mini',
  fallback_analysis: 'google/gemini-2.5-flash-preview-09-2025',
  summary: 'openai/gpt-5-mini',
  translation: 'google/gemini-2.5-flash-preview-09-2025'
};

// Function to get GLM fallback configuration from environment
export function getGLMFallbackConfig(env) {
  return {
    apiKey: env.GLM_API_KEY,
    baseUrl: env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/',
    model: env.GLM_MODEL || 'glm-4-air'
  };
}

export const MODEL_PARAMS = {
  analysis: {
    temperature: 0.3,
    max_tokens: 2000,
    response_format: 'json_object'
  },
  summary: {
    temperature: 0.3,
    max_tokens: 500
  },
  translation: {
    temperature: 0.5,
    max_tokens: 1200
  }
};

// Paper analysis prompt template
export const PAPER_ANALYSIS_PROMPT = `You are an expert AI researcher specializing in related fields. 

Analyze this research paper and provide a structured analysis:

**Paper Title:** {title}
**Authors:** {authors}
**Abstract:** {abstract}
**Published:** {published}

Generate 5 distinct text blocks in English. Use formatting suitable for Twitter (e.g., line breaks for readability, relevant emojis strategically).
DO NOT MAKE ANYTHING UP. If the information is not in the paper, say "Not specified in the paper."

### Required Sections (Max 280 characters EACH):

1. 🚀 Introduction (Hook & Core Idea):
    * Start with a strong hook (question, surprising stat, relatable problem).
    * Immediately state the paper's main breakthrough or purpose in simple, exciting terms.
    * Briefly hint at *why* it's important or who it benefits.
    * Goal: Make people stop scrolling and want to know more.
    
2. 🎯 Challenges (The Problems Solved):
    * Clearly list 2-3 key problems or limitations this research tackles.
    * Use bullet points (e.g., - Problem 1) or a numbered list for easy scanning.
    * Be direct and focus on the *pain points* the paper addresses.
    * Example: - Existing methods struggle with X. - Data scarcity hinders Y.
	 
3. ✨ Innovations (The Novel Solution):
    * List the core method(s), model(s), or key techniques introduced.
    * Use bullet points or a list.
    * **Crucially, highlight *what makes it novel***. What's the unique twist or idea?
    * Focus on the *how* in simple terms.
    * Example: - Introduced CleverModel architecture. - Novel XYZ training technique.
	 
4. 📊 Experiment (Proof & Breakthrough):
    * Showcase the single *most compelling* quantitative result (e.g., "Achieved X% improvement over state-of-the-art!").
    * Clearly state the main breakthrough *demonstrated* by the experiments. What does this result *prove*?
    * Provide concrete evidence of success concisely.
    * Example: "Results: Our method outperformed prior work by 15% on [Benchmark Task], showing significant gains in [Metric]."
	
5. 🤔 Insights (What's Next?):
    * **Synthesize, don't just copy.** List 1-2 *potential* future research directions *inspired* by this work but not necessarily listed in the paper's future work section.
    * Suggest 1-2 *potential* broader applications or real-world implications.
    * End with a forward-looking statement or question to spark discussion.
    * Example: "Inspires exploration into [New Area]. Could this revolutionize [Application]? "

**Format your response as a valid JSON object:**
{
  "introduction": "🚀 English introduction text...",
  "challenges": "🎯 English challenges text...(Use bullet points or a list with \\n for each)",
  "innovations": "✨ English innovations text...(Use bullet points or a list with \\n for each)",
  "experiments": "📊 English experiments text...",
  "insights": "🤔 English insights text...",
  "keywords": ["term1", "term2", ...],
  "category": "one_of_topic_categories",
  "relevance_score": (1-10),
  "technical_depth": "beginner|intermediate|advanced"
}`;

// RSS feed configuration
export const RSS_CONFIG = {
  title: 'PaperDog - AI Papers Daily',
  description: 'Daily curated AI and computer vision research papers',
  language: 'en',
  maxItems: 20
};

// Archive configuration
export const ARCHIVE_CONFIG = {
  // Storage settings
  defaultTTL: 365 * 24 * 60 * 60, // 1 year in seconds
  maxArchivesPerRequest: 30,

  // Export settings
  maxExportPapers: 5000,
  exportTimeoutMs: 30000, // 30 seconds
  compressionThreshold: 100 * 1024, // 100KB

  // Search settings
  maxSearchResults: 100,
  searchCacheTTL: 3600, // 1 hour

  // Date range settings
  maxDateRangeDays: 365, // 1 year
  defaultArchiveDays: 30, // Last 30 days

  // Rate limiting
  maxExportsPerHour: 10,
  maxSearchesPerMinute: 30,

  // Export formats
  supportedFormats: ['json', 'csv', 'markdown', 'bibtex'],
  defaultFormat: 'json',

  // Batch processing
  batchSize: 1000,
  maxBatchFiles: 10
};

// Export format configurations
export const EXPORT_CONFIG = {
  json: {
    contentType: 'application/json',
    extension: 'json',
    description: 'Complete data with full analysis and metadata',
    supportsAnalysis: true,
    supportsStatistics: true
  },
  csv: {
    contentType: 'text/csv',
    extension: 'csv',
    description: 'Structured tabular data for spreadsheets',
    supportsAnalysis: false,
    supportsStatistics: true
  },
  markdown: {
    contentType: 'text/markdown',
    extension: 'md',
    description: 'Human-readable format with formatting',
    supportsAnalysis: true,
    supportsStatistics: true
  },
  bibtex: {
    contentType: 'text/plain',
    extension: 'bib',
    description: 'Academic citation format',
    supportsAnalysis: false,
    supportsStatistics: false
  }
};
