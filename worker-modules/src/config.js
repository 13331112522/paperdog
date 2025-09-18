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
    maxPapersPerRequest: 50,
    requestDelay: 1000,
    retryAttempts: 3,
    dateRange: 7, // Last 7 days to get more results
    fields: 'id,title,summary,authors,published,updated,primary_category'
  },
  huggingface: {
    maxPapersPerRequest: 30,
    requestDelay: 2000,
    retryAttempts: 3,
    dateRange: 1,
    fields: 'title,summary,authors,published,id,arxiv_id,tags'
  }
};

// Model configuration for paper analysis
export const MODEL_CONFIG = {
  analysis: 'openai/gpt-4o-mini',
  summary: 'google/gemini-2.0-flash-001',
  translation: 'google/gemini-2.0-flash-001'
};

export const MODEL_PARAMS = {
  analysis: {
    temperature: 0.3,
    max_tokens: 2000
  },
  summary: {
    temperature: 0.3,
    max_tokens: 500
  },
  translation: {
    temperature: 0.5,
    max_tokens: 800
  }
};

// Paper analysis prompt template
export const PAPER_ANALYSIS_PROMPT = `You are an expert AI researcher specializing in computer vision and machine learning. 

Analyze this research paper and provide a structured analysis:

**Paper Title:** {title}
**Authors:** {authors}
**Abstract:** {abstract}
**Published:** {published}

Please provide a comprehensive analysis covering:

1. **Introduction & Background (50-100 words)**
   - Research context and motivation
   - Problem being addressed

2. **Key Challenges (50-100 words)**
   - Main technical challenges
   - Limitations of existing approaches

3. **Innovations & Contributions (100-150 words)**
   - Novel methods or techniques
   - Key technical contributions
   - Theoretical or practical innovations

4. **Experiments & Results (100-150 words)**
   - Experimental setup
   - Key results and metrics
   - Comparison with baselines

5. **Insights & Future Directions (50-100 words)**
   - Implications for the field
   - Potential applications
   - Future research directions

6. **Keywords (5-8 terms)**
   - Extract key technical terms
   - Include methods, datasets, metrics

**Format your response as a valid JSON object:**
{
  "introduction": "text...",
  "challenges": "text...",
  "innovations": "text...",
  "experiments": "text...",
  "insights": "text...",
  "keywords": ["term1", "term2", ...],
  "category": "one_of_topic_categories",
  "relevance_score": (1-10),
  "technical_depth": "beginner|intermediate|advanced",
  "chinese_abstract": "Chinese translation of the paper's abstract",
  "chinese_introduction": "中文介绍：研究背景和动机",
  "chinese_challenges": "中文挑战：主要技术挑战",
  "chinese_innovations": "中文创新：新方法和贡献",
  "chinese_experiments": "中文实验：实验设置和结果",
  "chinese_insights": "中文见解：领域意义和未来方向"
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