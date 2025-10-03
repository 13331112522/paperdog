var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-KstIoW/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-KstIoW/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// ../../../.nvm/versions/node/v22.17.0/lib/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../../.nvm/versions/node/v22.17.0/lib/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// worker-modules/src/config.js
var corsHeaders, AppError, routes, PAPER_SOURCES, TOPIC_CATEGORIES, SOURCE_CONFIGS, MODEL_CONFIG, MODEL_PARAMS, PAPER_ANALYSIS_PROMPT, ARCHIVE_CONFIG;
var init_config = __esm({
  "worker-modules/src/config.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    AppError = class extends Error {
      static {
        __name(this, "AppError");
      }
      constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
      }
    };
    routes = {
      "GET /": "handleRoot",
      "GET /api/papers": "handlePapersList",
      "GET /api/papers/:date": "handlePapersByDate",
      "GET /api/papers/:id": "handlePaperById",
      "POST /api/papers/:id/view": "handleTrackPaperView",
      "POST /api/update": "handleUpdatePapers",
      "GET /api/categories": "handleCategories",
      "GET /api/search": "handleSearch",
      "GET /feed": "handleRSSFeed",
      "GET /about": "handleAbout",
      "GET /api/scoring/:date": "handleScoringReport",
      // Archive routes
      "GET /api/archive/dates": "handleArchiveDates",
      "GET /api/archive/:date": "handleArchiveByDate",
      "GET /api/archive/range": "handleArchiveRange",
      "GET /api/archive/search": "handleArchiveSearch",
      "GET /api/archive/statistics": "handleArchiveStatistics",
      "GET /api/archive/export": "handleArchiveExport",
      "GET /api/archive/export/formats": "handleExportFormats",
      "POST /api/archive/create": "handleCreateArchive",
      "GET /archive": "handleArchivePage"
    };
    PAPER_SOURCES = {
      arxiv: {
        baseUrl: "https://export.arxiv.org/api/query",
        categories: ["cs.CV", "cs.AI", "cs.LG", "cs.CL", "cs.RO"],
        maxResults: 50,
        sortBy: "submittedDate",
        sortOrder: "descending"
      },
      huggingface: {
        baseUrl: "https://huggingface.co/api/papers",
        categories: ["computer-vision", "natural-language-processing", "machine-learning"],
        maxResults: 30
      }
    };
    TOPIC_CATEGORIES = [
      "computer_vision",
      "machine_learning",
      "natural_language_processing",
      "reinforcement_learning",
      "multimodal_learning",
      "generative_models",
      "diffusion_models",
      "transformer_architectures",
      "optimization",
      "robotics",
      "ethics_ai",
      "datasets"
    ];
    SOURCE_CONFIGS = {
      arxiv: {
        maxPapersPerRequest: 15,
        requestDelay: 1e3,
        retryAttempts: 3,
        dateRange: 7,
        // Last 7 days to get more results
        fields: "id,title,summary,authors,published,updated,primary_category"
      },
      huggingface: {
        maxPapersPerRequest: 10,
        requestDelay: 2e3,
        retryAttempts: 3,
        dateRange: 1,
        fields: "title,summary,authors,published,id,arxiv_id,tags"
      }
    };
    MODEL_CONFIG = {
      analysis: "openai/gpt-5-mini",
      fallback_analysis: "google/gemini-2.5-flash-preview-09-2025",
      summary: "openai/gpt-5-mini",
      translation: "google/gemini-2.5-flash-preview-09-2025"
    };
    MODEL_PARAMS = {
      analysis: {
        temperature: 0.3,
        max_tokens: 2e3
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
    PAPER_ANALYSIS_PROMPT = `You are an expert AI researcher specializing in related fields. 

Analyze this research paper and provide a structured analysis:

**Paper Title:** {title}
**Authors:** {authors}
**Abstract:** {abstract}
**Published:** {published}

Generate 5 distinct text blocks in English. Use formatting suitable for Twitter (e.g., line breaks for readability, relevant emojis strategically).
DO NOT MAKE ANYTHING UP. If the information is not in the paper, say "Not specified in the paper."

### Required Sections (Max 280 characters EACH):

1. \u{1F680} Introduction (Hook & Core Idea):
    * Start with a strong hook (question, surprising stat, relatable problem).
    * Immediately state the paper's main breakthrough or purpose in simple, exciting terms.
    * Briefly hint at *why* it's important or who it benefits.
    * Goal: Make people stop scrolling and want to know more.
    
2. \u{1F3AF} Challenges (The Problems Solved):
    * Clearly list 2-3 key problems or limitations this research tackles.
    * Use bullet points (e.g., - Problem 1) or a numbered list for easy scanning.
    * Be direct and focus on the *pain points* the paper addresses.
    * Example: - Existing methods struggle with X. - Data scarcity hinders Y.
	 
3. \u2728 Innovations (The Novel Solution):
    * List the core method(s), model(s), or key techniques introduced.
    * Use bullet points or a list.
    * **Crucially, highlight *what makes it novel***. What's the unique twist or idea?
    * Focus on the *how* in simple terms.
    * Example: - Introduced CleverModel architecture. - Novel XYZ training technique.
	 
4. \u{1F4CA} Experiment (Proof & Breakthrough):
    * Showcase the single *most compelling* quantitative result (e.g., "Achieved X% improvement over state-of-the-art!").
    * Clearly state the main breakthrough *demonstrated* by the experiments. What does this result *prove*?
    * Provide concrete evidence of success concisely.
    * Example: "Results: Our method outperformed prior work by 15% on [Benchmark Task], showing significant gains in [Metric]."
	
5. \u{1F914} Insights (What's Next?):
    * **Synthesize, don't just copy.** List 1-2 *potential* future research directions *inspired* by this work but not necessarily listed in the paper's future work section.
    * Suggest 1-2 *potential* broader applications or real-world implications.
    * End with a forward-looking statement or question to spark discussion.
    * Example: "Inspires exploration into [New Area]. Could this revolutionize [Application]? "
     

**IMPORTANT: You MUST provide complete Chinese translations for ALL sections. The Chinese translations should be accurate, natural, and suitable for Chinese-speaking AI researchers and enthusiasts. Use proper Simplified Chinese. Do not translate emojis or section numbers. Make sure each Chinese translation is comprehensive and covers the same key points as the English version.**

**Format your response as a valid JSON object:**
{
  "introduction": "\u{1F680} English introduction text...",
  "challenges": "\u{1F3AF} English challenges text...(Use bullet points or a list with \\n for each)",
  "innovations": "\u2728 English innovations text...(Use bullet points or a list with \\n for each)",
  "experiments": "\u{1F4CA} English experiments text...",
  "insights": "\u{1F914} English insights text...",
  "keywords": ["term1", "term2", ...],
  "category": "one_of_topic_categories",
  "relevance_score": (1-10),
  "technical_depth": "beginner|intermediate|advanced",
  "chinese_abstract": "\u{1F680}\u4E2D\u6587\u6458\u8981\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u6458\u8981\uFF0C\u6DB5\u76D6\u8BBA\u6587\u7684\u4E3B\u8981\u8D21\u732E\u3001\u521B\u65B0\u70B9\u548C\u80CC\u666F\u3002\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\uFF0C\u786E\u4FDD\u7FFB\u8BD1\u51C6\u786E\u81EA\u7136\u3002",
  "chinese_introduction": "\u{1F680}\u4E2D\u6587\u4ECB\u7ECD\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u4ECB\u7ECD\uFF0C\u5305\u62EC\u7814\u7A76\u80CC\u666F\u3001\u52A8\u673A\u548C\u6838\u5FC3\u601D\u60F3\u3002\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\uFF0C\u786E\u4FDD\u7FFB\u8BD1\u51C6\u786E\u81EA\u7136\u3002",
  "chinese_challenges": "\u{1F3AF}\u4E2D\u6587\u6311\u6218\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u6311\u6218\u63CF\u8FF0\uFF0C\u5217\u51FA\u4E3B\u8981\u6280\u672F\u95EE\u9898\u3002\u4F7F\u7528 bullet points \u6216\u5217\u8868\u3002\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\uFF0C\u786E\u4FDD\u7FFB\u8BD1\u51C6\u786E\u81EA\u7136\u3002",
  "chinese_innovations": "\u2728\u4E2D\u6587\u521B\u65B0\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u521B\u65B0\u63CF\u8FF0\uFF0C\u7A81\u51FA\u65B0\u65B9\u6CD5\u548C\u6280\u672F\u8D21\u732E\u3002\u4F7F\u7528 bullet points \u6216\u5217\u8868\u3002\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\uFF0C\u786E\u4FDD\u7FFB\u8BD1\u51C6\u786E\u81EA\u7136\u3002",
  "chinese_experiments": "\u{1F4CA}\u4E2D\u6587\u5B9E\u9A8C\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u5B9E\u9A8C\u63CF\u8FF0\uFF0C\u5305\u62EC\u8BBE\u7F6E\u3001\u7ED3\u679C\u548C\u7A81\u7834\u3002\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\uFF0C\u786E\u4FDD\u7FFB\u8BD1\u51C6\u786E\u81EA\u7136\u3002",
  "chinese_insights": "\u{1F914}\u4E2D\u6587\u89C1\u89E3\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u89C1\u89E3\u63CF\u8FF0\uFF0C\u5305\u62EC\u9886\u57DF\u610F\u4E49\u548C\u672A\u6765\u65B9\u5411\u3002\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\uFF0C\u786E\u4FDD\u7FFB\u8BD1\u51C6\u786E\u81EA\u7136\u3002"
}`;
    ARCHIVE_CONFIG = {
      // Storage settings
      defaultTTL: 365 * 24 * 60 * 60,
      // 1 year in seconds
      maxArchivesPerRequest: 30,
      // Export settings
      maxExportPapers: 5e3,
      exportTimeoutMs: 3e4,
      // 30 seconds
      compressionThreshold: 100 * 1024,
      // 100KB
      // Search settings
      maxSearchResults: 100,
      searchCacheTTL: 3600,
      // 1 hour
      // Date range settings
      maxDateRangeDays: 365,
      // 1 year
      defaultArchiveDays: 30,
      // Last 30 days
      // Rate limiting
      maxExportsPerHour: 10,
      maxSearchesPerMinute: 30,
      // Export formats
      supportedFormats: ["json", "csv", "markdown", "bibtex"],
      defaultFormat: "json",
      // Batch processing
      batchSize: 1e3,
      maxBatchFiles: 10
    };
  }
});

// worker-modules/src/utils.js
var utils_exports = {};
__export(utils_exports, {
  addViewToPaper: () => addViewToPaper,
  cachePaper: () => cachePaper,
  cachePapers: () => cachePapers,
  corsHeaders: () => corsHeaders2,
  enrichPapersWithViews: () => enrichPapersWithViews,
  errorResponse: () => errorResponse,
  extractKeywords: () => extractKeywords,
  fetchWithTimeout: () => fetchWithTimeout,
  filterPapersByCategory: () => filterPapersByCategory,
  formatBytes: () => formatBytes,
  formatDate: () => formatDate,
  formatDateForDisplay: () => formatDateForDisplay,
  generateArchiveIndexKey: () => generateArchiveIndexKey,
  generateArchiveKey: () => generateArchiveKey,
  generateArchiveStatistics: () => generateArchiveStatistics,
  generateExportJobId: () => generateExportJobId,
  generateExportKey: () => generateExportKey,
  generatePaperId: () => generatePaperId,
  getCachedPaper: () => getCachedPaper,
  getCachedPapers: () => getCachedPapers,
  getPaginationParams: () => getPaginationParams,
  getPaperViewCount: () => getPaperViewCount,
  groupPapersByDate: () => groupPapersByDate,
  htmlResponse: () => htmlResponse,
  incrementPaperView: () => incrementPaperView,
  jsonResponse: () => jsonResponse,
  paginateArray: () => paginateArray,
  rssResponse: () => rssResponse,
  sanitizeFilename: () => sanitizeFilename,
  searchPapers: () => searchPapers,
  sleep: () => sleep,
  sortPapersByDate: () => sortPapersByDate,
  truncateText: () => truncateText,
  validateDate: () => validateDate,
  validateDateRange: () => validateDateRange,
  validateExportParams: () => validateExportParams,
  validatePaper: () => validatePaper
});
async function fetchWithTimeout(url, timeout = 1e4, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const defaultHeaders = {
    "User-Agent": "PaperDog-Bot/1.0 (https://paperdog.org)",
    "Accept": "application/xml,application/json,text/html"
  };
  const fetchOptions = {
    signal: controller.signal,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new AppError(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function generatePaperId(paper) {
  const timestamp = Date.now();
  const titleSlug = paper.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);
  return `${paper.source}_${titleSlug}_${timestamp}`;
}
function validateDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    throw new AppError("Invalid date format. Use YYYY-MM-DD");
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new AppError("Invalid date");
  }
  return true;
}
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function truncateText(text, maxLength = 200) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
function extractKeywords(text, maxKeywords = 8) {
  const commonWords = /* @__PURE__ */ new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "with",
    "we",
    "our",
    "this",
    "that",
    "these",
    "those",
    "are",
    "be",
    "have",
    "has",
    "been",
    "from",
    "for",
    "not",
    "as",
    "by",
    "it",
    "of",
    "to",
    "can",
    "will"
  ]);
  const words = text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((word) => word.length > 3 && !commonWords.has(word));
  const wordFreq = {};
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  return Object.entries(wordFreq).sort(([, a], [, b]) => b - a).slice(0, maxKeywords).map(([word]) => word);
}
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders2
    }
  });
}
function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders2
    }
  });
}
function rssResponse(xml, status = 200) {
  return new Response(xml, {
    status,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      ...corsHeaders2
    }
  });
}
function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status);
}
async function getCachedPapers(date, env) {
  try {
    const cached = await env.PAPERS.get(`papers_${date}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error("Error reading from cache:", error);
  }
  return null;
}
async function cachePapers(date, papers, env) {
  try {
    const ttl = 24 * 60 * 60;
    await env.PAPERS.put(`papers_${date}`, JSON.stringify(papers), {
      expirationTtl: ttl
    });
    console.log(`Cached ${papers.length} papers for date ${date}`);
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}
async function getCachedPaper(paperId, env) {
  try {
    const cached = await env.PAPERS.get(`paper_${paperId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error("Error reading paper from cache:", error);
  }
  return null;
}
async function cachePaper(paperId, paper, env) {
  try {
    const ttl = 7 * 24 * 60 * 60;
    await env.PAPERS.put(`paper_${paperId}`, JSON.stringify(paper), {
      expirationTtl: ttl
    });
  } catch (error) {
    console.error("Error caching paper:", error);
  }
}
function validatePaper(paper) {
  if (!paper.title || paper.title.trim().length < 10) {
    throw new AppError("Paper title is required and must be at least 10 characters");
  }
  if (!paper.abstract || paper.abstract.trim().length < 50) {
    throw new AppError("Paper abstract is required and must be at least 50 characters");
  }
  if (!paper.authors || !Array.isArray(paper.authors) || paper.authors.length === 0) {
    throw new AppError("Paper must have at least one author");
  }
  return true;
}
function filterPapersByCategory(papers, category) {
  if (!category) return papers;
  return papers.filter(
    (paper) => paper.category?.toLowerCase() === category.toLowerCase() || paper.analysis?.category?.toLowerCase() === category.toLowerCase()
  );
}
function searchPapers(papers, query) {
  if (!query) return papers;
  const searchTerms = query.toLowerCase().split(" ").filter((term) => term.length > 2);
  return papers.filter((paper) => {
    const searchableText = [
      paper.title,
      paper.abstract,
      ...paper.authors || [],
      ...paper.analysis?.keywords || []
    ].join(" ").toLowerCase();
    return searchTerms.every((term) => searchableText.includes(term));
  });
}
function sortPapersByDate(papers, order = "desc") {
  return [...papers].sort((a, b) => {
    const dateA = new Date(a.published || a.scraped_at);
    const dateB = new Date(b.published || b.scraped_at);
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
}
function generateArchiveKey(date) {
  return `archive_${date}`;
}
function generateArchiveIndexKey() {
  return "archive_index";
}
function generateExportKey(jobId) {
  return `export_${jobId}`;
}
function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new AppError("Both start_date and end_date are required", 400);
  }
  validateDate(startDate);
  validateDate(endDate);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) {
    throw new AppError("Start date must be before or equal to end date", 400);
  }
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  if (diffDays > 365) {
    throw new AppError("Date range cannot exceed 365 days", 400);
  }
  return { startDate, endDate, days: diffDays };
}
function validateExportParams(params) {
  const { format, startDate, endDate, category, minScore, maxScore } = params;
  const validFormats = ["json", "csv", "markdown", "bibtex"];
  if (!validFormats.includes(format)) {
    throw new AppError(`Invalid format. Supported formats: ${validFormats.join(", ")}`, 400);
  }
  if (startDate || endDate) {
    validateDateRange(startDate, endDate);
  }
  if (minScore !== void 0 && (minScore < 0 || minScore > 10)) {
    throw new AppError("Minimum score must be between 0 and 10", 400);
  }
  if (maxScore !== void 0 && (maxScore < 0 || maxScore > 10)) {
    throw new AppError("Maximum score must be between 0 and 10", 400);
  }
  if (minScore !== void 0 && maxScore !== void 0 && minScore > maxScore) {
    throw new AppError("Minimum score must be less than or equal to maximum score", 400);
  }
  return params;
}
function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function generateExportJobId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `export_${timestamp}_${random}`;
}
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_");
}
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
function generateArchiveStatistics(papers) {
  const stats = {
    total: papers.length,
    categories: {},
    sources: {},
    scores: [],
    dates: [],
    keywords: /* @__PURE__ */ new Set()
  };
  papers.forEach((paper) => {
    const category = paper.analysis?.category || paper.category || "other";
    stats.categories[category] = (stats.categories[category] || 0) + 1;
    const source = paper.source || "unknown";
    stats.sources[source] = (stats.sources[source] || 0) + 1;
    const score = paper.analysis?.relevance_score || 5;
    stats.scores.push(score);
    const date = paper.archive_date || paper.published?.split("T")[0] || "unknown";
    if (!stats.dates.includes(date)) {
      stats.dates.push(date);
    }
    if (paper.analysis?.keywords) {
      paper.analysis.keywords.forEach((keyword) => stats.keywords.add(keyword));
    }
  });
  const avgScore = stats.scores.length > 0 ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length : 0;
  return {
    total_papers: stats.total,
    categories: stats.categories,
    sources: stats.sources,
    average_score: Math.round(avgScore * 10) / 10,
    unique_dates: stats.dates.length,
    unique_keywords: stats.keywords.size,
    date_range: stats.dates.length > 0 ? {
      start: stats.dates.sort()[0],
      end: stats.dates.sort().reverse()[0]
    } : null
  };
}
function groupPapersByDate(papers) {
  const grouped = {};
  papers.forEach((paper) => {
    const date = paper.archive_date || paper.published?.split("T")[0] || "unknown";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(paper);
  });
  return grouped;
}
function getPaginationParams(url) {
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = parseInt(url.searchParams.get("limit")) || 20;
  if (page < 1) throw new AppError("Page must be greater than 0", 400);
  if (limit < 1 || limit > 100) throw new AppError("Limit must be between 1 and 100", 400);
  return { page, limit };
}
function paginateArray(array, page, limit) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    items: array.slice(startIndex, endIndex),
    pagination: {
      current_page: page,
      total_pages: Math.ceil(array.length / limit),
      total_items: array.length,
      has_next: endIndex < array.length,
      has_prev: page > 1
    }
  };
}
async function incrementPaperView(paperId, env) {
  try {
    const viewKey = `views_${paperId}`;
    const currentViews = await env.PAPERS.get(viewKey);
    const newViews = currentViews ? parseInt(currentViews) + 1 : 1;
    await env.PAPERS.put(viewKey, newViews.toString(), {
      expirationTtl: 365 * 24 * 60 * 60
      // 1 year TTL
    });
    return newViews;
  } catch (error) {
    console.error("Error incrementing paper views:", error);
    return 0;
  }
}
async function getPaperViewCount(paperId, env) {
  try {
    const viewKey = `views_${paperId}`;
    const views = await env.PAPERS.get(viewKey);
    return views ? parseInt(views) : 0;
  } catch (error) {
    console.error("Error getting paper view count:", error);
    return 0;
  }
}
async function addViewToPaper(paper, env) {
  if (!paper || !paper.id) {
    return paper;
  }
  const newViewCount = await incrementPaperView(paper.id, env);
  return {
    ...paper,
    views: newViewCount
  };
}
async function enrichPapersWithViews(papers, env) {
  const papersWithViews = await Promise.all(
    papers.map(async (paper) => {
      const viewCount = await getPaperViewCount(paper.id, env);
      return {
        ...paper,
        views: viewCount
      };
    })
  );
  return papersWithViews;
}
var corsHeaders2;
var init_utils = __esm({
  "worker-modules/src/utils.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_config();
    __name(fetchWithTimeout, "fetchWithTimeout");
    __name(sleep, "sleep");
    __name(generatePaperId, "generatePaperId");
    __name(validateDate, "validateDate");
    __name(formatDate, "formatDate");
    __name(truncateText, "truncateText");
    __name(extractKeywords, "extractKeywords");
    __name(jsonResponse, "jsonResponse");
    __name(htmlResponse, "htmlResponse");
    __name(rssResponse, "rssResponse");
    __name(errorResponse, "errorResponse");
    __name(getCachedPapers, "getCachedPapers");
    __name(cachePapers, "cachePapers");
    __name(getCachedPaper, "getCachedPaper");
    __name(cachePaper, "cachePaper");
    __name(validatePaper, "validatePaper");
    __name(filterPapersByCategory, "filterPapersByCategory");
    __name(searchPapers, "searchPapers");
    __name(sortPapersByDate, "sortPapersByDate");
    corsHeaders2 = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    __name(generateArchiveKey, "generateArchiveKey");
    __name(generateArchiveIndexKey, "generateArchiveIndexKey");
    __name(generateExportKey, "generateExportKey");
    __name(validateDateRange, "validateDateRange");
    __name(validateExportParams, "validateExportParams");
    __name(formatDateForDisplay, "formatDateForDisplay");
    __name(generateExportJobId, "generateExportJobId");
    __name(sanitizeFilename, "sanitizeFilename");
    __name(formatBytes, "formatBytes");
    __name(generateArchiveStatistics, "generateArchiveStatistics");
    __name(groupPapersByDate, "groupPapersByDate");
    __name(getPaginationParams, "getPaginationParams");
    __name(paginateArray, "paginateArray");
    __name(incrementPaperView, "incrementPaperView");
    __name(getPaperViewCount, "getPaperViewCount");
    __name(addViewToPaper, "addViewToPaper");
    __name(enrichPapersWithViews, "enrichPapersWithViews");
  }
});

// worker-modules/src/paper-scoring.js
function calculateRecencyScore(publishedDate) {
  try {
    const now = /* @__PURE__ */ new Date();
    const publishTime = new Date(publishedDate);
    const daysAgo = Math.floor((now - publishTime) / (1e3 * 60 * 60 * 24));
    let score = Math.max(1, 10 - daysAgo);
    if (daysAgo <= 7) {
      score += 2;
    } else if (daysAgo <= 30) {
      score += 1;
    }
    return parseFloat(Math.min(10, score).toFixed(2));
  } catch (error) {
    logger3.warn("Failed to calculate recency score:", error);
    return 5;
  }
}
function calculateRelevanceScore(paper) {
  try {
    let score = 5;
    if (paper.analysis) {
      const analysis = paper.analysis;
      if (analysis.relevance_score) {
        score = parseFloat(analysis.relevance_score);
      }
      const aiKeywords = [
        "neural network",
        "deep learning",
        "machine learning",
        "computer vision",
        "natural language processing",
        "transformer",
        "attention",
        "gpt",
        "bert",
        "diffusion model",
        "generative ai",
        "reinforcement learning",
        "llm",
        "multimodal",
        "vision transformer",
        "segmentation",
        "detection"
      ];
      const keywords = analysis.keywords || [];
      const aiKeywordCount = keywords.filter(
        (keyword) => aiKeywords.some((aiTerm) => keyword.toLowerCase().includes(aiTerm))
      ).length;
      score += aiKeywordCount * 0.5;
      if (analysis.technical_depth === "high") {
        score += 1;
      } else if (analysis.technical_depth === "medium") {
        score += 0.5;
      }
    }
    const text = `${paper.title} ${paper.abstract || ""}`.toLowerCase();
    const highValueTerms = [
      "breakthrough",
      "state-of-the-art",
      "novel",
      "innovative",
      "efficient",
      "scalable",
      "robust",
      "accuracy",
      "performance",
      "optimization"
    ];
    const termMatches = highValueTerms.filter((term) => text.includes(term)).length;
    score += termMatches * 0.3;
    return parseFloat(Math.min(10, Math.max(1, score)).toFixed(2));
  } catch (error) {
    logger3.warn("Failed to calculate relevance score:", error);
    return 5;
  }
}
function calculatePopularityScore(paper) {
  try {
    let score = 3;
    if (paper.citations && paper.citations > 0) {
      if (paper.citations >= 100) {
        score += 3;
      } else if (paper.citations >= 50) {
        score += 2;
      } else if (paper.citations >= 10) {
        score += 1;
      }
    }
    if (paper.authors && paper.authors.length > 0) {
      const influentialAuthors = [
        "yoshua bengio",
        "geoffrey hinton",
        "yann lecun",
        "andrew ng",
        "fei-fei li",
        "pieter abbeel",
        "ilya sutskever",
        "demis hassabis"
      ];
      const hasInfluentialAuthor = paper.authors.some(
        (author) => influentialAuthors.some((inf) => author.toLowerCase().includes(inf))
      );
      if (hasInfluentialAuthor) {
        score += 2;
      }
    }
    const topVenues = [
      "neurips",
      "icml",
      "iclr",
      "cvpr",
      "iccv",
      "eccv",
      "acl",
      "emnlp",
      "nature",
      "science",
      "ieee transactions",
      "jmlr"
    ];
    if (paper.venue) {
      const venueLower = paper.venue.toLowerCase();
      const isTopVenue = topVenues.some((venue) => venueLower.includes(venue));
      if (isTopVenue) {
        score += 2;
      }
    }
    if (paper.code_available) {
      score += 1;
    }
    return parseFloat(Math.min(10, score).toFixed(2));
  } catch (error) {
    logger3.warn("Failed to calculate popularity score:", error);
    return 3;
  }
}
function calculateQualityScore(paper) {
  try {
    let score = 5;
    if (paper.abstract && paper.abstract.length > 200) {
      score += 1;
    }
    if (paper.analysis) {
      const analysis = paper.analysis;
      if (analysis.experiments && analysis.experiments.length > 100) {
        score += 1;
      }
      if (analysis.innovations && analysis.innovations.length > 100) {
        score += 1;
      }
      if (analysis.technical_depth === "high") {
        score += 1.5;
      } else if (analysis.technical_depth === "medium") {
        score += 0.5;
      }
    }
    if (paper.abstract && (paper.abstract.toLowerCase().includes("method") || paper.abstract.toLowerCase().includes("approach") || paper.abstract.toLowerCase().includes("algorithm") || paper.abstract.toLowerCase().includes("framework"))) {
      score += 0.5;
    }
    return parseFloat(Math.min(10, score).toFixed(2));
  } catch (error) {
    logger3.warn("Failed to calculate quality score:", error);
    return 5;
  }
}
function calculateComprehensiveScore(paper) {
  try {
    const recencyScore = calculateRecencyScore(paper.published);
    const relevanceScore = calculateRelevanceScore(paper);
    const popularityScore = calculatePopularityScore(paper);
    const qualityScore = calculateQualityScore(paper);
    let sourceBonus = 0;
    let sourceType = "unknown";
    if (paper.original_source) {
      if (paper.original_source.includes("huggingface")) {
        sourceBonus = SOURCE_BONUSES["huggingface.co"];
        sourceType = "huggingface.co";
      } else if (paper.original_source.includes("arxiv")) {
        sourceBonus = SOURCE_BONUSES["arxiv.org"];
        sourceType = "arxiv.org";
      }
    } else if (paper.source) {
      if (paper.source.toLowerCase().includes("huggingface") || paper.source.toLowerCase().includes("hugging face")) {
        const isRealHuggingFace = !paper.url || !paper.url.includes("arxiv.org") || paper.is_fallback || paper.original_source === "huggingface_fallback";
        if (isRealHuggingFace) {
          sourceBonus = SOURCE_BONUSES["huggingface.co"];
          sourceType = "huggingface.co";
        } else {
          sourceBonus = SOURCE_BONUSES["arxiv.org"];
          sourceType = "arxiv.org";
        }
      } else if (paper.source.toLowerCase().includes("arxiv")) {
        sourceBonus = SOURCE_BONUSES["arxiv.org"];
        sourceType = "arxiv.org";
      }
    }
    if (sourceType === "unknown" && paper.url) {
      if (paper.url.includes("arxiv.org") && !paper.url.includes("huggingface.co")) {
        sourceBonus = SOURCE_BONUSES["arxiv.org"];
        sourceType = "arxiv.org";
      } else if (paper.url.includes("huggingface.co") && !paper.url.includes("arxiv.org")) {
        sourceBonus = SOURCE_BONUSES["huggingface.co"];
        sourceType = "huggingface.co";
      }
    }
    const baseScore = recencyScore * SCORING_WEIGHTS.recency + relevanceScore * SCORING_WEIGHTS.relevance + popularityScore * SCORING_WEIGHTS.popularity + qualityScore * SCORING_WEIGHTS.quality;
    const totalScore = baseScore + sourceBonus;
    const scoringDetails = {
      total_score: Math.round(totalScore * 100) / 100,
      // 保留两位小数
      base_score: Math.round(baseScore * 100) / 100,
      source_bonus: Math.round(sourceBonus * 100) / 100,
      source_type: sourceType,
      recency_score: Math.round(recencyScore * 100) / 100,
      relevance_score: Math.round(relevanceScore * 100) / 100,
      popularity_score: Math.round(popularityScore * 100) / 100,
      quality_score: Math.round(qualityScore * 100) / 100,
      weights: SCORING_WEIGHTS,
      calculated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const scoredPaper = {
      ...paper,
      scoring: scoringDetails
    };
    logger3.debug(`Calculated score for paper "${paper.title}": ${scoringDetails.total_score}`, {
      base_score: scoringDetails.base_score,
      source_bonus: scoringDetails.source_bonus,
      source_type: scoringDetails.source_type,
      recency: scoringDetails.recency_score,
      relevance: scoringDetails.relevance_score,
      popularity: scoringDetails.popularity_score,
      quality: scoringDetails.quality_score
    });
    return scoredPaper;
  } catch (error) {
    logger3.error("Failed to calculate comprehensive score:", error);
    return {
      ...paper,
      scoring: {
        total_score: 5,
        base_score: 5,
        source_bonus: 0,
        source_type: "unknown",
        recency_score: 5,
        relevance_score: 5,
        popularity_score: 5,
        quality_score: 5,
        weights: SCORING_WEIGHTS,
        calculated_at: (/* @__PURE__ */ new Date()).toISOString(),
        error: "Scoring calculation failed"
      }
    };
  }
}
function filterAndSortPapers(papers, options = {}) {
  const {
    minScore = 6,
    // 最低分数阈值 (float)
    maxPapers = 10,
    // 最大论文数量，改为10篇
    minRecencyScore = 3,
    // 最低新鲜度分数 (float)
    daysAgoLimit = 90,
    // 最多90天前的论文
    ensureBothSources = true
    // 确保从两个来源各选5篇
  } = options;
  try {
    const now = /* @__PURE__ */ new Date();
    const cutoffDate = new Date(now.getTime() - daysAgoLimit * 24 * 60 * 60 * 1e3);
    const date = now.toISOString().split("T")[0];
    const scoredPapers = papers.map((paper) => calculateComprehensiveScore(paper));
    const filteredPapers = scoredPapers.filter((paper) => {
      try {
        const paperDate = new Date(paper.published);
        if (paperDate < cutoffDate) {
          return false;
        }
      } catch {
        return false;
      }
      if (paper.scoring.total_score < minScore) {
        return false;
      }
      if (paper.scoring.recency_score < minRecencyScore) {
        return false;
      }
      return true;
    });
    logger3.info(`Filtered ${scoredPapers.length} papers to ${filteredPapers.length} papers`);
    const sortedPapers = filteredPapers.sort((a, b) => {
      const random = createSeededRandom(date);
      const scoreDiff = b.scoring.total_score - a.scoring.total_score;
      if (Math.abs(scoreDiff) > 0.01) {
        return scoreDiff;
      }
      const recencyDiff = b.scoring.recency_score - a.scoring.recency_score;
      if (Math.abs(recencyDiff) > 0.01) {
        return recencyDiff;
      }
      const relevanceDiff = b.scoring.relevance_score - a.scoring.relevance_score;
      if (Math.abs(relevanceDiff) > 0.01) {
        return relevanceDiff;
      }
      return random() - 0.5;
    });
    let topPapers;
    if (ensureBothSources && maxPapers >= 10) {
      topPapers = selectPapersFromBothSources(sortedPapers, maxPapers, date);
    } else {
      topPapers = sortedPapers.slice(0, maxPapers);
    }
    const validation = validatePaperSelection(topPapers, options);
    if (!validation.isValid) {
      logger3.warn("Paper selection validation failed:", validation.issues);
    } else {
      logger3.info("Paper selection validation passed");
    }
    logger3.info(`Selected top ${topPapers.length} papers from ${filteredPapers.length} filtered papers`);
    logger3.info(`Selection validation: ${JSON.stringify(validation.summary)}`);
    return topPapers;
  } catch (error) {
    logger3.error("Failed to filter and sort papers:", error);
    return papers.sort((a, b) => new Date(b.published) - new Date(a.published)).slice(0, maxPapers);
  }
}
function validatePaperSelection(papers, options) {
  const { maxPapers = 10, ensureBothSources = true } = options;
  const issues = [];
  const summary = {
    total_papers: papers.length,
    arxiv_count: 0,
    huggingface_count: 0,
    other_count: 0,
    average_score: 0,
    score_range: { min: 10, max: 0 }
  };
  if (papers.length === 0) {
    issues.push("No papers selected");
    return { isValid: false, issues, summary };
  }
  papers.forEach((paper) => {
    const sourceType = paper.scoring?.source_type || "unknown";
    if (sourceType === "arxiv.org") {
      summary.arxiv_count++;
    } else if (sourceType === "huggingface.co") {
      summary.huggingface_count++;
    } else {
      summary.other_count++;
    }
    const score = paper.scoring?.total_score || 0;
    summary.average_score += score;
    summary.score_range.min = Math.min(summary.score_range.min, score);
    summary.score_range.max = Math.max(summary.score_range.max, score);
  });
  summary.average_score = summary.average_score / papers.length;
  if (papers.length > maxPapers) {
    issues.push(`Too many papers selected: ${papers.length} > ${maxPapers}`);
  } else if (papers.length < maxPapers / 2) {
    issues.push(`Too few papers selected: ${papers.length} < ${maxPapers / 2}`);
  }
  if (ensureBothSources) {
    const targetPerSource = Math.floor(maxPapers / 2);
    if (summary.arxiv_count < targetPerSource / 2) {
      issues.push(`Insufficient arXiv papers: ${summary.arxiv_count} < ${targetPerSource / 2}`);
    }
    if (summary.huggingface_count < targetPerSource / 2) {
      issues.push(`Insufficient HuggingFace papers: ${summary.huggingface_count} < ${targetPerSource / 2}`);
    }
    if (summary.arxiv_count + summary.huggingface_count < maxPapers * 0.8) {
      issues.push("Poor source balance - too many other/unknown sources");
    }
  }
  if (summary.score_range.min < 4) {
    issues.push(`Low minimum score: ${summary.score_range.min} < 4.0`);
  }
  const isValid = issues.length === 0;
  return { isValid, issues, summary };
}
function createSeededRandom(dateString) {
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed += dateString.charCodeAt(i) * 31;
  }
  seed = seed % 2147483647;
  return function() {
    seed = seed * 16807 % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
function selectPapersFromBothSources(sortedPapers, maxPapers = 10, date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0]) {
  const arxivPapers = [];
  const huggingfacePapers = [];
  const unknownPapers = [];
  sortedPapers.forEach((paper, index) => {
    const sourceType = paper.scoring.source_type;
    const paperInfo = {
      index,
      title: paper.title.substring(0, 50) + "...",
      source: paper.source,
      original_source: paper.original_source,
      source_type: sourceType,
      url: paper.url,
      is_fallback: paper.is_fallback,
      score: paper.scoring.total_score
    };
    if (sourceType === "arxiv.org") {
      arxivPapers.push(paper);
      logger3.debug(`Classified as arXiv:`, paperInfo);
    } else if (sourceType === "huggingface.co") {
      huggingfacePapers.push(paper);
      logger3.debug(`Classified as HuggingFace:`, paperInfo);
    } else {
      unknownPapers.push(paper);
      logger3.warn(`Unknown source type:`, paperInfo);
    }
  });
  logger3.info(`Paper classification: ${arxivPapers.length} arXiv, ${huggingfacePapers.length} HuggingFace, ${unknownPapers.length} unknown`);
  if (arxivPapers.length === 0 && huggingfacePapers.length === 0) {
    logger3.warn("No papers found with proper source classification, fallback to score-based selection");
    return sortedPapers.slice(0, maxPapers);
  }
  const random = createSeededRandom(date);
  arxivPapers.sort((a, b) => {
    const scoreDiff = b.scoring.total_score - a.scoring.total_score;
    if (Math.abs(scoreDiff) > 0.01) {
      return scoreDiff;
    }
    return random() - 0.5;
  });
  huggingfacePapers.sort((a, b) => {
    const scoreDiff = b.scoring.total_score - a.scoring.total_score;
    if (Math.abs(scoreDiff) > 0.01) {
      return scoreDiff;
    }
    return random() - 0.5;
  });
  const selectedPapers = [];
  const targetPerSource = Math.floor(maxPapers / 2);
  const arxivSelected = arxivPapers.slice(0, Math.min(targetPerSource, arxivPapers.length));
  selectedPapers.push(...arxivSelected);
  logger3.info(`Selected ${arxivSelected.length} arXiv papers (target: ${targetPerSource})`);
  const huggingfaceSelected = huggingfacePapers.slice(0, Math.min(targetPerSource, huggingfacePapers.length));
  selectedPapers.push(...huggingfaceSelected);
  logger3.info(`Selected ${huggingfaceSelected.length} HuggingFace papers (target: ${targetPerSource})`);
  logger3.info(`Initial selection: ${arxivSelected.length} arXiv + ${huggingfaceSelected.length} HuggingFace = ${selectedPapers.length} papers`);
  if (selectedPapers.length < maxPapers) {
    const remainingSlots = maxPapers - selectedPapers.length;
    const remainingPapers = [];
    if (arxivSelected.length < targetPerSource && arxivPapers.length > arxivSelected.length) {
      remainingPapers.push(...arxivPapers.slice(arxivSelected.length, arxivSelected.length + remainingSlots));
    }
    if (huggingfaceSelected.length < targetPerSource && huggingfacePapers.length > huggingfaceSelected.length) {
      remainingPapers.push(...huggingfacePapers.slice(huggingfaceSelected.length, huggingfaceSelected.length + remainingSlots));
    }
    unknownPapers.sort((a, b) => {
      const scoreDiff = b.scoring.total_score - a.scoring.total_score;
      if (Math.abs(scoreDiff) > 0.01) {
        return scoreDiff;
      }
      return random() - 0.5;
    });
    remainingPapers.push(...unknownPapers);
    const backupSelected = remainingPapers.slice(0, remainingSlots);
    selectedPapers.push(...backupSelected);
    logger3.info(`Added ${backupSelected.length} backup papers to reach ${selectedPapers.length} total papers`);
  }
  const finalPapers = selectedPapers.slice(0, maxPapers).sort((a, b) => {
    const scoreDiff = b.scoring.total_score - a.scoring.total_score;
    if (Math.abs(scoreDiff) > 0.01) {
      return scoreDiff;
    }
    return random() - 0.5;
  });
  const finalArxivCount = finalPapers.filter((p) => p.scoring.source_type === "arxiv.org").length;
  const finalHuggingfaceCount = finalPapers.filter((p) => p.scoring.source_type === "huggingface.co").length;
  const finalOtherCount = finalPapers.filter((p) => !["arxiv.org", "huggingface.co"].includes(p.scoring.source_type)).length;
  logger3.info(`Final selection summary: ${finalArxivCount} arXiv + ${finalHuggingfaceCount} HuggingFace + ${finalOtherCount} other = ${finalPapers.length} total`);
  logger3.info(`Random seed used for date: ${date}`);
  logger3.info(`Source distribution details:`, {
    arxiv: {
      total_available: arxivPapers.length,
      selected: finalArxivCount,
      top_scores: arxivPapers.slice(0, 3).map((p) => ({ title: p.title.substring(0, 30) + "...", score: p.scoring.total_score }))
    },
    huggingface: {
      total_available: huggingfacePapers.length,
      selected: finalHuggingfaceCount,
      top_scores: huggingfacePapers.slice(0, 3).map((p) => ({ title: p.title.substring(0, 30) + "...", score: p.scoring.total_score }))
    },
    other: {
      total_available: unknownPapers.length,
      selected: finalOtherCount
    }
  });
  if (finalArxivCount === 0) {
    logger3.warn("No arXiv papers in final selection - check arXiv scraping and source classification");
  }
  if (finalHuggingfaceCount === 0) {
    logger3.warn("No HuggingFace papers in final selection - check HuggingFace scraping and source classification");
  }
  if (finalOtherCount > 2) {
    logger3.warn(`High number of other/unknown source papers: ${finalOtherCount} - review source detection logic`);
  }
  return finalPapers;
}
function generateScoringReport(papers) {
  try {
    const scoredPapers = papers.map((paper) => calculateComprehensiveScore(paper));
    const report = {
      total_papers: scoredPapers.length,
      average_score: scoredPapers.reduce((sum, p) => sum + p.scoring.total_score, 0) / scoredPapers.length,
      score_distribution: {
        excellent: scoredPapers.filter((p) => p.scoring.total_score >= 8.5).length,
        good: scoredPapers.filter((p) => p.scoring.total_score >= 7 && p.scoring.total_score < 8.5).length,
        average: scoredPapers.filter((p) => p.scoring.total_score >= 5.5 && p.scoring.total_score < 7).length,
        below_average: scoredPapers.filter((p) => p.scoring.total_score < 5.5).length
      },
      top_paper: scoredPapers.length > 0 ? scoredPapers[0] : null,
      scoring_weights: SCORING_WEIGHTS,
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    return report;
  } catch (error) {
    logger3.error("Failed to generate scoring report:", error);
    return {
      error: "Failed to generate scoring report",
      message: error.message
    };
  }
}
var logger3, SCORING_WEIGHTS, SOURCE_BONUSES;
var init_paper_scoring = __esm({
  "worker-modules/src/paper-scoring.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_config();
    logger3 = {
      info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[SCORING] ${msg}`, data), "info"),
      debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[SCORING] ${msg}`, data), "debug"),
      warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[SCORING] ${msg}`, data), "warn"),
      error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[SCORING] ${msg}`, data), "error")
    };
    SCORING_WEIGHTS = {
      recency: 0.3,
      // 新鲜度权重
      relevance: 0.4,
      // AI相关性权重
      popularity: 0.2,
      // 流行度权重
      quality: 0.1
      // 质量权重
    };
    SOURCE_BONUSES = {
      "huggingface.co": 2,
      // HuggingFace 论文获得 +2.0 加分
      "arxiv.org": 0
      // arXiv 论文无额外加分
    };
    __name(calculateRecencyScore, "calculateRecencyScore");
    __name(calculateRelevanceScore, "calculateRelevanceScore");
    __name(calculatePopularityScore, "calculatePopularityScore");
    __name(calculateQualityScore, "calculateQualityScore");
    __name(calculateComprehensiveScore, "calculateComprehensiveScore");
    __name(filterAndSortPapers, "filterAndSortPapers");
    __name(validatePaperSelection, "validatePaperSelection");
    __name(createSeededRandom, "createSeededRandom");
    __name(selectPapersFromBothSources, "selectPapersFromBothSources");
    __name(generateScoringReport, "generateScoringReport");
  }
});

// worker-modules/src/blog-generator.js
var blog_generator_exports = {};
__export(blog_generator_exports, {
  generateBlogContent: () => generateBlogContent,
  generateDailyReport: () => generateDailyReport,
  generateRSSFeed: () => generateRSSFeed
});
async function generateDailyReport(papers, date) {
  try {
    logger4.info(`Generating daily report for ${date} with ${papers.length} papers`);
    if (!papers || papers.length === 0) {
      return {
        date,
        title: `No Papers Found - ${formatDate(date)}`,
        summary: "No new AI papers were found for this date.",
        papers: [],
        total_papers: 0,
        categories: {},
        top_papers: [],
        scoring_report: null
      };
    }
    const topPapers = filterAndSortPapers(papers, {
      minScore: 6,
      maxPapers: 10,
      // 改为选择10篇论文
      minRecencyScore: 3,
      daysAgoLimit: 90,
      ensureBothSources: true
      // 确保从两个来源各选5篇
    });
    const scoringReport = generateScoringReport(papers);
    const categories = {};
    papers.forEach((paper) => {
      const category = paper.analysis?.category || paper.category || "other";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(paper);
    });
    const summary = generateDailySummary(papers, date, categories, scoringReport);
    const report = {
      date,
      title: `Daily AI Papers Digest - ${formatDate(date)}`,
      summary,
      papers,
      total_papers: papers.length,
      categories,
      top_papers: topPapers,
      scoring_report: scoringReport,
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    logger4.info(`Generated daily report with ${papers.length} papers, selected top ${topPapers.length} papers`);
    return report;
  } catch (error) {
    logger4.error("Failed to generate daily report:", error);
    throw new AppError(`Failed to generate daily report: ${error.message}`);
  }
}
function getScoreColor(score) {
  if (score >= 8.5) return "#28a745";
  if (score >= 7) return "#17a2b8";
  if (score >= 5.5) return "#ffc107";
  return "#dc3545";
}
function generateDailySummary(papers, date, categories, scoringReport) {
  const topCategories = Object.entries(categories).sort(([, a], [, b]) => b.length - a.length).slice(0, 3).map(([cat, papers2]) => `${cat.replace("_", " ")} (${papers2.length})`).join(", ");
  const avgRelevance = papers.reduce((sum, paper) => {
    return sum + (paper.analysis?.relevance_score || 5);
  }, 0) / papers.length;
  const topKeywords = {};
  papers.forEach((paper) => {
    const keywords = paper.analysis?.keywords || [];
    keywords.forEach((keyword) => {
      topKeywords[keyword] = (topKeywords[keyword] || 0) + 1;
    });
  });
  const trendingKeywords = Object.entries(topKeywords).sort(([, a], [, b]) => b - a).slice(0, 5).map(([keyword]) => keyword).join(", ");
  const sourceCounts = {
    arxiv: papers.filter((p) => p.scoring?.source_type === "arxiv.org").length,
    huggingface: papers.filter((p) => p.scoring?.source_type === "huggingface.co").length,
    unknown: papers.filter((p) => !p.scoring?.source_type || !["arxiv.org", "huggingface.co"].includes(p.scoring.source_type)).length
  };
  if (sourceCounts.arxiv === 0) {
    logger4.warn("No arXiv papers found in summary generation");
  }
  if (sourceCounts.huggingface === 0) {
    logger4.warn("No HuggingFace papers found in summary generation");
  }
  if (sourceCounts.unknown > 0) {
    logger4.warn(`Found ${sourceCounts.unknown} papers with unknown source type`);
  }
  let summary = `Today's digest features ${papers.length} papers spanning ${Object.keys(categories).length} categories, with strong representation from ${topCategories}. The average relevance score is ${avgRelevance.toFixed(1)}/10. Trending topics include ${trendingKeywords}.`;
  if (sourceCounts.unknown > 0) {
    summary += ` Source distribution: ${sourceCounts.arxiv} from arXiv, ${sourceCounts.huggingface} from HuggingFace, ${sourceCounts.unknown} unknown sources.`;
  } else {
    summary += ` Source distribution: ${sourceCounts.arxiv} from arXiv, ${sourceCounts.huggingface} from HuggingFace.`;
  }
  const targetPerSource = 5;
  const isBalanced = sourceCounts.arxiv >= targetPerSource && sourceCounts.huggingface >= targetPerSource;
  if (isBalanced) {
    summary += ` \u2705 Balanced source representation achieved.`;
  } else {
    summary += ` \u26A0\uFE0F Unbalanced source distribution detected.`;
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
async function generateBlogContent(papers, options = {}) {
  const {
    title = "AI Research Papers Daily",
    description = "Latest advances in artificial intelligence and computer vision research",
    showFullAnalysis = false,
    maxPapers = 10
    // 改为显示10篇论文
  } = options;
  try {
    const topPapers = filterAndSortPapers(papers, {
      minScore: 6,
      maxPapers,
      minRecencyScore: 3,
      daysAgoLimit: 90,
      ensureBothSources: true
      // 确保从两个来源各选5篇
    });
    const sortedPapers = topPapers;
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
                Updated: ${formatDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0])}
            </p>
        </div>
        
        <div class="stats-section">
            <div class="row">
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${sortedPapers.length}</div>
                    <div class="stat-label">Top Papers</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${new Set(sortedPapers.map((p) => p.analysis?.category || p.category || "other")).size}</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${sortedPapers.filter((p) => p.source === "arxiv").length}</div>
                    <div class="stat-label">arXiv Papers</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${sortedPapers.filter((p) => p.source === "huggingface").length}</div>
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
            ${sortedPapers.map((paper) => generatePaperCard(paper, showFullAnalysis)).join("")}
        </div>
        
        <footer class="text-center text-white py-4 mt-5">
            <p class="mb-0">
                <i class="fas fa-robot me-2"></i>
                Curated by PaperDog AI \u2022 
                <i class="fas fa-code me-1"></i>
                Built with Cloudflare Workers
            </p>
        </footer>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>
</body>
</html>`;
    return html;
  } catch (error) {
    logger4.error("Failed to generate blog content:", error);
    throw new AppError(`Failed to generate blog content: ${error.message}`);
  }
}
function generatePaperCard(paper, showFullAnalysis = false) {
  const sourceIcon = paper.source === "arxiv" ? "arxiv-icon" : "huggingface-icon";
  const sourceName = paper.source === "arxiv" ? "arXiv" : "HuggingFace";
  const relevanceScore = paper.analysis?.relevance_score || 5;
  const category = paper.analysis?.category || paper.category || "other";
  const keywords = paper.analysis?.keywords || [];
  const totalScore = paper.scoring?.total_score || relevanceScore;
  const recencyScore = paper.scoring?.recency_score || 5;
  const isTopPaper = paper.scoring && totalScore >= 7;
  const hasChineseTranslation = paper.analysis?.chinese_introduction;
  let analysisContent = "";
  if (showFullAnalysis && paper.analysis) {
    analysisContent = `
        <div class="analysis-section">
            <h6 class="mb-2"><i class="fas fa-brain me-2"></i>AI Analysis</h6>
            <div class="row">
                <div class="col-md-6">
                    <strong>Introduction:</strong>
                    <p class="small">${paper.analysis.introduction || "Not available"}</p>
                </div>
                <div class="col-md-6">
                    <strong>Innovations:</strong>
                    <p class="small">${paper.analysis.innovations || "Not available"}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <strong>Results:</strong>
                    <p class="small">${paper.analysis.experiments || "Not available"}</p>
                </div>
                <div class="col-md-6">
                    <strong>Insights:</strong>
                    <p class="small">${paper.analysis.insights || "Not available"}</p>
                </div>
            </div>
            ${hasChineseTranslation ? `
            <hr class="my-3">
            <h6 class="mb-2"><i class="fas fa-language me-2"></i>\u4E2D\u6587\u5206\u6790 (Chinese Analysis)</h6>
            <div class="row">
                <div class="col-md-6">
                    <strong>\u4E2D\u6587\u4ECB\u7ECD:</strong>
                    <p class="small">${paper.analysis.chinese_introduction || "\u7FFB\u8BD1\u4E0D\u53EF\u7528"}</p>
                </div>
                <div class="col-md-6">
                    <strong>\u4E2D\u6587\u521B\u65B0\u70B9:</strong>
                    <p class="small">${paper.analysis.chinese_innovations || "\u7FFB\u8BD1\u4E0D\u53EF\u7528"}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <strong>\u4E2D\u6587\u5B9E\u9A8C\u7ED3\u679C:</strong>
                    <p class="small">${paper.analysis.chinese_experiments || "\u7FFB\u8BD1\u4E0D\u53EF\u7528"}</p>
                </div>
                <div class="col-md-6">
                    <strong>\u4E2D\u6587\u89C1\u89E3:</strong>
                    <p class="small">${paper.analysis.chinese_insights || "\u7FFB\u8BD1\u4E0D\u53EF\u7528"}</p>
                </div>
            </div>
            ` : ""}
        </div>
    `;
  }
  return `
        <div class="col-lg-6 mb-4">
            <div class="paper-card ${isTopPaper ? "border border-warning border-2" : ""}">
                ${isTopPaper ? '<div class="position-absolute top-0 end-0 m-2"><span class="badge bg-warning text-dark"><i class="fas fa-trophy me-1"></i>Top Paper</span></div>' : ""}
                <div class="paper-title">
                    <i class="fas fa-file-alt source-icon ${sourceIcon}"></i>
                    <a href="${paper.url}" target="_blank" class="text-decoration-none">${paper.title}</a>
                </div>
                
                <div class="paper-authors">
                    <i class="fas fa-users me-2"></i>
                    ${paper.authors ? paper.authors.slice(0, 3).join(", ") + (paper.authors.length > 3 ? " et al." : "") : "Unknown authors"}
                </div>
                
                <div class="paper-abstract">
                    ${paper.abstract ? paper.abstract.substring(0, 200) + "..." : "No abstract available"}
                </div>
                
                <div class="paper-meta">
                    <div>
                        <span class="category-badge">${category.replace("_", " ")}</span>
                        <span class="relevance-score" style="background: ${getScoreColor(totalScore)};">
                            <i class="fas fa-star me-1"></i>${totalScore.toFixed(1)}/10
                        </span>
                        ${paper.scoring ? `
                        <span class="recency-score" style="background: #17a2b8; color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-size: 0.8rem;">
                            <i class="fas fa-clock me-1"></i>${recencyScore.toFixed(1)}
                        </span>
                        ` : ""}
                        ${hasChineseTranslation ? `
                        <span class="badge bg-info ms-1">
                            <i class="fas fa-language me-1"></i>\u4E2D\u6587
                        </span>
                        ` : ""}
                    </div>
                    <div class="text-muted small">
                        <i class="fas fa-external-link-alt me-1"></i>
                        ${sourceName}
                    </div>
                </div>
                
                ${analysisContent}
                
                ${keywords.length > 0 ? `
                <div class="keywords">
                    ${keywords.slice(0, 5).map(
    (keyword) => `<span class="keyword-tag">${keyword}</span>`
  ).join("")}
                </div>
                ` : ""}
                
                <div class="mt-3">
                    <a href="${paper.url}" target="_blank" class="btn btn-outline-primary btn-sm me-2">
                        <i class="fas fa-external-link-alt me-1"></i>View Paper
                    </a>
                    ${paper.pdf_url ? `
                    <a href="${paper.pdf_url}" target="_blank" class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-file-pdf me-1"></i>PDF
                    </a>
                    ` : ""}
                </div>
            </div>
        </div>
    `;
}
function generateRSSFeed(papers, options = {}) {
  const {
    title = "PaperDog - AI Papers Daily",
    description = "Daily curated AI and computer vision research papers",
    link = "https://paperdog.org",
    maxItems = 20
  } = options;
  const sortedPapers = sortPapersByDate(papers).slice(0, maxItems);
  const items = sortedPapers.map((paper) => {
    const pubDate = new Date(paper.published || paper.scraped_at).toUTCString();
    const description2 = `
        <strong>Authors:</strong> ${paper.authors ? paper.authors.join(", ") : "Unknown"}<br>
        <strong>Category:</strong> ${paper.analysis?.category || paper.category || "other"}<br>
        <strong>Relevance Score:</strong> ${paper.analysis?.relevance_score || 5}/10<br><br>
        ${paper.abstract ? paper.abstract.substring(0, 500) + "..." : "No abstract available"}
        ${paper.analysis?.keywords ? "<br><br><strong>Keywords:</strong> " + paper.analysis.keywords.join(", ") : ""}
    `;
    return `
        <item>
            <title><![CDATA[${paper.title}]]></title>
            <description><![CDATA[${description2}]]></description>
            <link>${paper.url}</link>
            <guid isPermaLink="false">${paper.id}</guid>
            <pubDate>${pubDate}</pubDate>
        </item>
    `;
  }).join("");
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${title}</title>
        <description>${description}</description>
        <link>${link}</link>
        <atom:link href="${link}/feed" rel="self" type="application/rss+xml"/>
        <language>en</language>
        <lastBuildDate>${(/* @__PURE__ */ new Date()).toUTCString()}</lastBuildDate>
        ${items}
    </channel>
</rss>`;
  return rss;
}
var logger4;
var init_blog_generator = __esm({
  "worker-modules/src/blog-generator.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_config();
    init_utils();
    init_paper_scoring();
    logger4 = {
      info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[BLOG] ${msg}`, data), "info"),
      debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[BLOG] ${msg}`, data), "debug"),
      warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[BLOG] ${msg}`, data), "warn"),
      error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[BLOG] ${msg}`, data), "error")
    };
    __name(generateDailyReport, "generateDailyReport");
    __name(getScoreColor, "getScoreColor");
    __name(generateDailySummary, "generateDailySummary");
    __name(generateBlogContent, "generateBlogContent");
    __name(generatePaperCard, "generatePaperCard");
    __name(generateRSSFeed, "generateRSSFeed");
  }
});

// worker-modules/src/templates.js
var templates_exports = {};
__export(templates_exports, {
  getArchiveHTML: () => getArchiveHTML,
  getIndexHTML: () => getIndexHTML,
  getReportHTML: () => getReportHTML
});
function getIndexHTML(papers = [], dailyReport = null) {
  const recentPapers = papers.slice(0, 6);
  const totalPapers = papers.length;
  const categories = [...new Set(papers.map((p) => p.analysis?.category || p.category || "other"))];
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PaperDog - AI Papers Daily Digest</title>
    <meta name="description" content="Daily curated AI and computer vision research papers from arXiv and HuggingFace">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        body {
            background: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .hero-section {
            background: var(--primary-gradient);
            color: white;
            padding: 4rem 0;
            margin-bottom: 3rem;
        }
        
        .hero-title {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .hero-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        
        .stats-card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: var(--card-shadow);
            text-align: center;
            margin-bottom: 2rem;
            transition: transform 0.3s ease;
        }
        
        .stats-card:hover {
            transform: translateY(-5px);
        }
        
        .stats-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .paper-card {
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: var(--card-shadow);
            transition: all 0.3s ease;
            height: 100%;
        }
        
        .paper-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        
        .paper-title {
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
            line-height: 1.4;
        }
        
        .paper-title a {
            color: inherit;
            text-decoration: none;
        }
        
        .paper-title a:hover {
            color: #667eea;
        }
        
        .paper-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .source-badge {
            font-size: 0.8rem;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 500;
        }
        
        .arxiv-badge {
            background: #dc3545;
            color: white;
        }
        
        .huggingface-badge {
            background: #ffc107;
            color: #212529;
        }
        
        .category-badge {
            background: var(--primary-gradient);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .relevance-score {
            background: #28a745;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 15px;
            font-size: 0.8rem;
        }
        
        .paper-abstract {
            color: #6c757d;
            line-height: 1.6;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }
        
        .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .keyword-tag {
            background: #e9ecef;
            color: #495057;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
        }
        
        .section-title {
            font-size: 2rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .btn-primary-custom {
            background: var(--primary-gradient);
            border: none;
            border-radius: 25px;
            padding: 0.75rem 2rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn-primary-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 3rem 0 2rem;
            margin-top: 5rem;
        }
        
        .loading-spinner {
            display: none;
            text-align: center;
            padding: 2rem;
        }
        
        .feature-icon {
            font-size: 3rem;
            color: #667eea;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .hero-title {
                font-size: 2rem;
            }
            
            .hero-subtitle {
                font-size: 1rem;
            }
            
            .paper-meta {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center">
                    <h1 class="hero-title">
                        <i class="fas fa-graduation-cap me-3"></i>PaperDog
                    </h1>
                    <p class="hero-subtitle">
                        Daily AI & Computer Vision Research Papers Digest
                    </p>
                    <p class="lead mb-4">
                        Curated from arXiv and HuggingFace with AI-powered analysis
                    </p>
                    <div class="d-flex justify-content-center gap-3">
                        <a href="#papers" class="btn btn-light btn-lg">
                            <i class="fas fa-book-open me-2"></i>Explore Papers
                        </a>
                        <a href="/api/papers" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-code me-2"></i>API
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="container mb-5">
        <div class="row">
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-number">${totalPapers}</div>
                    <div class="text-muted">Total Papers</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-number">${categories.length}</div>
                    <div class="text-muted">Categories</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-number">${papers.filter((p) => p.source === "arxiv").length}</div>
                    <div class="text-muted">arXiv Papers</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-number">${papers.filter((p) => p.source === "huggingface").length}</div>
                    <div class="text-muted">HuggingFace Papers</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="container mb-5">
        <div class="row">
            <div class="col-md-4 text-center mb-4">
                <div class="feature-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h4>AI-Powered Analysis</h4>
                <p>Advanced AI analyzes each paper for relevance, methodology, and impact</p>
            </div>
            <div class="col-md-4 text-center mb-4">
                <div class="feature-icon">
                    <i class="fas fa-sync-alt"></i>
                </div>
                <h4>Daily Updates</h4>
                <p>Automatically updated every day with the latest research papers</p>
            </div>
            <div class="col-md-4 text-center mb-4">
                <div class="feature-icon">
                    <i class="fas fa-filter"></i>
                </div>
                <h4>Smart Curation</h4>
                <p>Intelligent filtering ensures only high-quality, relevant papers</p>
            </div>
        </div>
    </section>

    <!-- Recent Papers Section -->
    <section class="container mb-5" id="papers">
        <h2 class="section-title">
            <i class="fas fa-fire me-2"></i>Recent Papers
        </h2>
        
        <div class="loading-spinner" id="loadingSpinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading latest papers...</p>
        </div>
        
        <div class="row" id="papersContainer">
            ${recentPapers.map((paper) => generatePaperCardHTML(paper)).join("")}
        </div>
        
        ${recentPapers.length > 0 ? `
        <div class="text-center mt-4">
            <a href="/archive" class="btn btn-primary-custom">
                <i class="fas fa-archive me-2"></i>View All Papers
            </a>
            <a href="/feed" class="btn btn-outline-primary ms-2">
                <i class="fas fa-rss me-2"></i>RSS Feed
            </a>
        </div>
        ` : ""}
    </section>

    <!-- Daily Report Section -->
    ${dailyReport ? `
    <section class="container mb-5">
        <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
                <h3 class="card-title">
                    <i class="fas fa-chart-line me-2"></i>Daily Report - ${formatDate(dailyReport.date)}
                </h3>
                <p class="card-text">${dailyReport.summary}</p>
                <a href="/report/${dailyReport.date}" class="btn btn-outline-primary">
                    <i class="fas fa-eye me-2"></i>View Full Report
                </a>
            </div>
        </div>
    </section>
    ` : ""}

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <h5><i class="fas fa-graduation-cap me-2"></i>PaperDog</h5>
                    <p>Your daily source for AI and computer vision research papers.</p>
                </div>
                <div class="col-md-4">
                    <h5>Quick Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="/" class="text-white-50">Home</a></li>
                        <li><a href="/archive" class="text-white-50">Archive</a></li>
                        <li><a href="/api/papers" class="text-white-50">API</a></li>
                        <li><a href="/feed" class="text-white-50">RSS Feed</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h5>Connect</h5>
                    <p>
                        <a href="https://paperdog.org" class="text-white-50 me-3">
                            <i class="fas fa-globe"></i>
                        </a>
                        <a href="/feed" class="text-white-50 me-3">
                            <i class="fas fa-rss"></i>
                        </a>
                        <a href="mailto:contact@paperdog.org" class="text-white-50">
                            <i class="fas fa-envelope"></i>
                        </a>
                    </p>
                    <p class="text-white-50 small">
                        Built with \u2764\uFE0F using Cloudflare Workers
                    </p>
                </div>
            </div>
            <hr class="my-4 bg-white">
            <div class="text-center">
                <p class="mb-0 text-white-50">&copy; 2024 PaperDog. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>
    <script>
        // Simple search functionality
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'form-control mb-4';
            searchInput.placeholder = 'Search papers...';
            searchInput.id = 'searchInput';
            
            const papersSection = document.querySelector('#papers');
            if (papersSection) {
                papersSection.insertBefore(searchInput, papersSection.firstChild.nextSibling);
            }
            
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const paperCards = document.querySelectorAll('.paper-card');
                
                paperCards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    <\/script>
</body>
</html>`;
}
function generatePaperCardHTML(paper) {
  const sourceClass = paper.source === "arxiv" ? "arxiv-badge" : "huggingface-badge";
  const sourceIcon = paper.source === "arxiv" ? "fas fa-university" : "fas fa-heart";
  const relevanceScore = paper.analysis?.relevance_score || 5;
  const category = paper.analysis?.category || paper.category || "other";
  const keywords = paper.analysis?.keywords || [];
  return `
        <div class="col-lg-6 col-xl-4 mb-4">
            <div class="paper-card">
                <div class="paper-title">
                    <a href="${paper.url}" target="_blank">${paper.title}</a>
                </div>
                
                <div class="paper-meta">
                    <div>
                        <span class="source-badge ${sourceClass}">
                            <i class="${sourceIcon} me-1"></i>${paper.source}
                        </span>
                    </div>
                    <div>
                        <span class="relevance-score">
                            <i class="fas fa-star me-1"></i>${relevanceScore}/10
                        </span>
                    </div>
                </div>
                
                <div class="paper-abstract">
                    ${paper.abstract ? paper.abstract.substring(0, 150) + "..." : "No abstract available"}
                </div>
                
                <div class="mb-2">
                    <span class="category-badge">${category.replace("_", " ")}</span>
                </div>
                
                ${keywords.length > 0 ? `
                <div class="keywords">
                    ${keywords.slice(0, 3).map(
    (keyword) => `<span class="keyword-tag">${keyword}</span>`
  ).join("")}
                </div>
                ` : ""}
                
                <div class="mt-3">
                    <a href="${paper.url}" target="_blank" class="btn btn-outline-primary btn-sm me-2">
                        <i class="fas fa-external-link-alt me-1"></i>View Paper
                    </a>
                    ${paper.pdf_url ? `
                    <a href="${paper.pdf_url}" target="_blank" class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-file-pdf me-1"></i>PDF
                    </a>
                    ` : ""}
                </div>
            </div>
        </div>
    `;
}
function getReportHTML(report) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Report - ${report.date} | PaperDog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .report-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
        }
        .paper-summary {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="report-header">
        <div class="container">
            <h1 class="display-4">
                <i class="fas fa-chart-line me-3"></i>Daily Report
            </h1>
            <p class="lead">${report.date}</p>
            <p>${report.summary}</p>
        </div>
    </div>
    
    <div class="container">
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="text-center">
                    <h3 class="text-primary">${report.total_papers}</h3>
                    <p class="text-muted">Total Papers</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <h3 class="text-success">${Object.keys(report.categories).length}</h3>
                    <p class="text-muted">Categories</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <h3 class="text-warning">${report.top_papers.length}</h3>
                    <p class="text-muted">Top Papers</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <h3 class="text-info">${report.papers.filter((p) => p.source === "arxiv").length}</h3>
                    <p class="text-muted">arXiv Papers</p>
                </div>
            </div>
        </div>
        
        <h2 class="mb-4">Top Papers Today</h2>
        <div class="row">
            ${report.top_papers.map((paper) => `
                <div class="col-lg-6 mb-4">
                    <div class="paper-summary">
                        <h5>${paper.title}</h5>
                        <p class="text-muted">
                            <strong>Authors:</strong> ${paper.authors ? paper.authors.slice(0, 3).join(", ") + (paper.authors.length > 3 ? " et al." : "") : "Unknown"}
                        </p>
                        <p><strong>Category:</strong> ${paper.analysis?.category || paper.category || "other"}</p>
                        <p><strong>Relevance:</strong> ${paper.analysis?.relevance_score || 5}/10</p>
                        <p><strong>Abstract:</strong> ${paper.abstract ? paper.abstract.substring(0, 200) + "..." : "No abstract available"}</p>
                        <a href="${paper.url}" target="_blank" class="btn btn-primary btn-sm">
                            <i class="fas fa-external-link-alt me-1"></i>View Paper
                        </a>
                    </div>
                </div>
            `).join("")}
        </div>
        
        <div class="text-center mt-4">
            <a href="/" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-2"></i>Back to Home
            </a>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>
</body>
</html>`;
}
function getArchiveHTML(papers, options = {}) {
  const { page = 1, limit = 12, category = null, search = null } = options;
  let filteredPapers = papers;
  if (category) {
    filteredPapers = filteredPapers.filter(
      (p) => (p.analysis?.category || p.category || "other") === category
    );
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPapers = filteredPapers.filter(
      (p) => p.title.toLowerCase().includes(searchLower) || p.abstract.toLowerCase().includes(searchLower) || p.authors && p.authors.some((a) => a.toLowerCase().includes(searchLower))
    );
  }
  const totalPages = Math.ceil(filteredPapers.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPapers = filteredPapers.slice(startIndex, endIndex);
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paper Archive - PaperDog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .archive-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
        }
        .filter-section {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="archive-header">
        <div class="container">
            <h1 class="display-4">
                <i class="fas fa-archive me-3"></i>Paper Archive
            </h1>
            <p class="lead">Browse through ${filteredPapers.length} research papers</p>
        </div>
    </div>
    
    <div class="container">
        <div class="filter-section">
            <div class="row">
                <div class="col-md-4">
                    <input type="text" class="form-control" placeholder="Search papers..." 
                           value="${search || ""}" id="searchInput">
                </div>
                <div class="col-md-3">
                    <select class="form-select" id="categoryFilter">
                        <option value="">All Categories</option>
                        <option value="computer_vision" ${category === "computer_vision" ? "selected" : ""}>Computer Vision</option>
                        <option value="machine_learning" ${category === "machine_learning" ? "selected" : ""}>Machine Learning</option>
                        <option value="natural_language_processing" ${category === "natural_language_processing" ? "selected" : ""}>NLP</option>
                        <option value="reinforcement_learning" ${category === "reinforcement_learning" ? "selected" : ""}>Reinforcement Learning</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-primary w-100" onclick="applyFilters()">
                        <i class="fas fa-filter me-1"></i>Filter
                    </button>
                </div>
                <div class="col-md-3">
                    <a href="/" class="btn btn-outline-secondary w-100">
                        <i class="fas fa-home me-1"></i>Back to Home
                    </a>
                </div>
            </div>
        </div>
        
        <div class="row">
            ${paginatedPapers.map((paper) => generatePaperCardHTML(paper)).join("")}
        </div>
        
        ${totalPages > 1 ? `
        <nav aria-label="Page navigation" class="mt-4">
            <ul class="pagination justify-content-center">
                ${page > 1 ? `
                <li class="page-item">
                    <a class="page-link" href="?page=${page - 1}&category=${category || ""}&search=${search || ""}">Previous</a>
                </li>
                ` : ""}
                
                ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
    return `
                    <li class="page-item ${pageNum === page ? "active" : ""}">
                        <a class="page-link" href="?page=${pageNum}&category=${category || ""}&search=${search || ""}">${pageNum}</a>
                    </li>
                    `;
  }).join("")}
                
                ${page < totalPages ? `
                <li class="page-item">
                    <a class="page-link" href="?page=${page + 1}&category=${category || ""}&search=${search || ""}">Next</a>
                </li>
                ` : ""}
            </ul>
        </nav>
        ` : ""}
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>
    <script>
        function applyFilters() {
            const search = document.getElementById('searchInput').value;
            const category = document.getElementById('categoryFilter').value;
            const params = new URLSearchParams();
            
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            
            window.location.search = params.toString();
        }
        
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    <\/script>
</body>
</html>`;
}
var init_templates = __esm({
  "worker-modules/src/templates.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_utils();
    __name(getIndexHTML, "getIndexHTML");
    __name(generatePaperCardHTML, "generatePaperCardHTML");
    __name(getReportHTML, "getReportHTML");
    __name(getArchiveHTML, "getArchiveHTML");
  }
});

// worker-modules/src/archive-manager.js
var archive_manager_exports = {};
__export(archive_manager_exports, {
  ARCHIVE_KEYS: () => ARCHIVE_KEYS,
  archivePapers: () => archivePapers,
  cleanupOldArchives: () => cleanupOldArchives,
  getArchiveIndex: () => getArchiveIndex,
  getArchiveStatistics: () => getArchiveStatistics,
  getArchivedPapers: () => getArchivedPapers,
  getArchivedPapersByRange: () => getArchivedPapersByRange,
  getAvailableArchiveDates: () => getAvailableArchiveDates,
  isDateArchived: () => isDateArchived,
  searchArchivedPapers: () => searchArchivedPapers
});
function createArchiveEntry(date, papers, metadata = {}) {
  const categories = {};
  const sources = {};
  const scores = [];
  const keywords = /* @__PURE__ */ new Set();
  papers.forEach((paper) => {
    const category = paper.analysis?.category || paper.category || "other";
    categories[category] = (categories[category] || 0) + 1;
    const source = paper.source || "unknown";
    sources[source] = (sources[source] || 0) + 1;
    const score = paper.analysis?.relevance_score || 5;
    scores.push(score);
    (paper.analysis?.keywords || []).forEach((keyword) => keywords.add(keyword));
  });
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  return {
    date,
    papers: papers.map((paper) => ({
      id: paper.id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      published: paper.published,
      source: paper.source,
      url: paper.url,
      primary_category: paper.primary_category,
      analysis: paper.analysis,
      scraped_at: paper.scraped_at,
      views: paper.views || 0,
      // Include view count
      archive_metadata: {
        archived_at: (/* @__PURE__ */ new Date()).toISOString(),
        original_id: paper.id,
        views_at_archive: paper.views || 0
        // Track views at time of archiving
      }
    })),
    metadata: {
      total_papers: papers.length,
      categories,
      sources,
      average_score: Math.round(avgScore * 10) / 10,
      unique_keywords: Array.from(keywords).slice(0, 50),
      total_views: papers.reduce((sum, paper) => sum + (paper.views || 0), 0),
      // Total views for all papers
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...metadata
    }
  };
}
async function updateArchiveIndex(env, date, stats) {
  try {
    const existingIndex = await getArchiveIndex(env);
    const index = existingIndex || {
      available_dates: [],
      date_stats: {},
      last_updated: null
    };
    if (!index.available_dates.includes(date)) {
      index.available_dates.push(date);
      index.available_dates.sort().reverse();
    }
    index.date_stats[date] = {
      total_papers: stats.total_papers,
      average_score: stats.average_score,
      categories: stats.categories,
      sources: stats.sources,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    index.last_updated = (/* @__PURE__ */ new Date()).toISOString();
    await env.PAPERS.put(ARCHIVE_KEYS.index, JSON.stringify(index), {
      expirationTtl: 365 * 24 * 60 * 60
      // 1 year
    });
    return index;
  } catch (error) {
    logger5.error("Error updating archive index:", error);
    throw new AppError("Failed to update archive index", 500);
  }
}
async function getArchiveIndex(env) {
  try {
    const cached = await env.PAPERS.get(ARCHIVE_KEYS.index);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    logger5.error("Error reading archive index:", error);
  }
  return null;
}
async function archivePapers(date, papers, env, metadata = {}) {
  try {
    validateDate(date);
    if (!papers || papers.length === 0) {
      throw new AppError("No papers provided for archiving", 400);
    }
    logger5.info(`Archiving ${papers.length} papers for date ${date}`);
    const papersWithViews = await enrichPapersWithViews(papers, env);
    const archiveEntry = createArchiveEntry(date, papersWithViews, metadata);
    await env.PAPERS.put(ARCHIVE_KEYS.daily(date), JSON.stringify(archiveEntry), {
      expirationTtl: 365 * 24 * 60 * 60
      // 1 year
    });
    await updateArchiveIndex(env, date, archiveEntry.metadata);
    logger5.info(`Successfully archived ${papers.length} papers for ${date}`);
    return {
      success: true,
      date,
      papers_archived: papers.length,
      metadata: archiveEntry.metadata
    };
  } catch (error) {
    logger5.error(`Error archiving papers for ${date}:`, error);
    throw error instanceof AppError ? error : new AppError(`Archive failed: ${error.message}`, 500);
  }
}
async function getArchivedPapers(date, env) {
  try {
    validateDate(date);
    const cached = await env.PAPERS.get(ARCHIVE_KEYS.daily(date));
    if (!cached) {
      return null;
    }
    const archiveEntry = JSON.parse(cached);
    return archiveEntry;
  } catch (error) {
    logger5.error(`Error retrieving archived papers for ${date}:`, error);
    throw new AppError(`Failed to retrieve archive: ${error.message}`, 500);
  }
}
async function getArchivedPapersByRange(startDate, endDate, env) {
  try {
    validateDate(startDate);
    validateDate(endDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      throw new AppError("Start date must be before or equal to end date", 400);
    }
    const index = await getArchiveIndex(env);
    if (!index) {
      return [];
    }
    const availableDates = index.available_dates.filter((date) => {
      const dateObj = new Date(date);
      return dateObj >= start && dateObj <= end;
    });
    if (availableDates.length === 0) {
      return [];
    }
    const archives = await Promise.all(
      availableDates.map((date) => getArchivedPapers(date, env))
    );
    return archives.filter((archive) => archive !== null);
  } catch (error) {
    logger5.error(`Error retrieving archived papers for range ${startDate} to ${endDate}:`, error);
    throw error instanceof AppError ? error : new AppError(`Failed to retrieve archive range: ${error.message}`, 500);
  }
}
async function searchArchivedPapers(query, filters = {}, env) {
  try {
    if (!query || query.trim().length < 2) {
      throw new AppError("Search query must be at least 2 characters", 400);
    }
    const { startDate, endDate, category, minScore, maxResults = 50 } = filters;
    let archives = [];
    if (startDate && endDate) {
      archives = await getArchivedPapersByRange(startDate, endDate, env);
    } else {
      const index = await getArchiveIndex(env);
      if (index && index.available_dates.length > 0) {
        const recentDates = index.available_dates.slice(0, 30);
        archives = await Promise.all(
          recentDates.map((date) => getArchivedPapers(date, env))
        );
        archives = archives.filter((archive) => archive !== null);
      }
    }
    if (archives.length === 0) {
      return {
        query,
        results: [],
        total_results: 0,
        archives_searched: 0
      };
    }
    const searchTerms = query.toLowerCase().split(" ").filter((term) => term.length > 2);
    const results = [];
    archives.forEach((archive) => {
      archive.papers.forEach((paper) => {
        if (category) {
          const paperCategory = paper.analysis?.category || paper.category || "other";
          if (paperCategory.toLowerCase() !== category.toLowerCase()) {
            return;
          }
        }
        if (minScore) {
          const score = paper.analysis?.relevance_score || 5;
          if (score < minScore) {
            return;
          }
        }
        const searchableText = [
          paper.title,
          paper.abstract,
          paper.authors?.join(" "),
          paper.analysis?.keywords?.join(" "),
          paper.analysis?.introduction,
          paper.analysis?.innovations
        ].filter(Boolean).join(" ").toLowerCase();
        const matches = searchTerms.every((term) => searchableText.includes(term));
        if (matches) {
          results.push({
            ...paper,
            archive_date: archive.date,
            search_relevance: calculateSearchRelevance(paper, searchTerms)
          });
        }
      });
    });
    results.sort((a, b) => {
      const relevanceA = a.search_relevance;
      const relevanceB = b.search_relevance;
      const scoreA = a.analysis?.relevance_score || 5;
      const scoreB = b.analysis?.relevance_score || 5;
      if (relevanceB !== relevanceA) return relevanceB - relevanceA;
      return scoreB - scoreA;
    });
    const limitedResults = results.slice(0, maxResults);
    return {
      query,
      filters,
      results: limitedResults,
      total_results: results.length,
      archives_searched: archives.length,
      date_range: {
        start: archives[0]?.date,
        end: archives[archives.length - 1]?.date
      }
    };
  } catch (error) {
    logger5.error("Error searching archived papers:", error);
    throw error instanceof AppError ? error : new AppError(`Search failed: ${error.message}`, 500);
  }
}
function calculateSearchRelevance(paper, searchTerms) {
  let score = 0;
  const title = paper.title.toLowerCase();
  const abstract = paper.abstract.toLowerCase();
  const keywords = (paper.analysis?.keywords || []).join(" ").toLowerCase();
  searchTerms.forEach((term) => {
    if (title.includes(term)) score += 3;
    if (keywords.includes(term)) score += 2;
    if (abstract.includes(term)) score += 1;
  });
  const paperScore = paper.analysis?.relevance_score || 5;
  score += (paperScore - 5) * 0.5;
  return score;
}
async function getArchiveStatistics(env) {
  try {
    const index = await getArchiveIndex(env);
    if (!index) {
      return {
        total_archives: 0,
        total_papers: 0,
        date_range: null,
        category_distribution: {},
        source_distribution: {},
        average_scores: {}
      };
    }
    const stats = {
      total_archives: index.available_dates.length,
      total_papers: 0,
      date_range: {
        start: index.available_dates[index.available_dates.length - 1],
        end: index.available_dates[0]
      },
      category_distribution: {},
      source_distribution: {},
      average_scores: {},
      daily_averages: {}
    };
    Object.entries(index.date_stats).forEach(([date, dateStats]) => {
      stats.total_papers += dateStats.total_papers;
      Object.entries(dateStats.categories).forEach(([category, count]) => {
        stats.category_distribution[category] = (stats.category_distribution[category] || 0) + count;
      });
      Object.entries(dateStats.sources).forEach(([source, count]) => {
        stats.source_distribution[source] = (stats.source_distribution[source] || 0) + count;
      });
      stats.daily_averages[date] = dateStats.average_score;
    });
    const scoreSum = Object.values(stats.daily_averages).reduce((a, b) => a + b, 0);
    stats.overall_average_score = stats.total_archives > 0 ? scoreSum / stats.total_archives : 0;
    return stats;
  } catch (error) {
    logger5.error("Error getting archive statistics:", error);
    throw new AppError(`Failed to get archive statistics: ${error.message}`, 500);
  }
}
async function isDateArchived(date, env) {
  try {
    validateDate(date);
    const archive = await getArchivedPapers(date, env);
    return archive !== null;
  } catch (error) {
    logger5.error(`Error checking if date ${date} is archived:`, error);
    return false;
  }
}
async function getAvailableArchiveDates(env) {
  try {
    const index = await getArchiveIndex(env);
    return index ? index.available_dates : [];
  } catch (error) {
    logger5.error("Error getting available archive dates:", error);
    return [];
  }
}
async function cleanupOldArchives(beforeDate, env) {
  try {
    validateDate(beforeDate);
    const index = await getArchiveIndex(env);
    if (!index) {
      return { removed: 0 };
    }
    const cutoffDate = new Date(beforeDate);
    const datesToRemove = index.available_dates.filter((date) => new Date(date) < cutoffDate);
    if (datesToRemove.length === 0) {
      return { removed: 0 };
    }
    await Promise.all(
      datesToRemove.map((date) => env.PAPERS.delete(ARCHIVE_KEYS.daily(date)))
    );
    index.available_dates = index.available_dates.filter((date) => !datesToRemove.includes(date));
    datesToRemove.forEach((date) => delete index.date_stats[date]);
    await env.PAPERS.put(ARCHIVE_KEYS.index, JSON.stringify(index), {
      expirationTtl: 365 * 24 * 60 * 60
    });
    logger5.info(`Cleaned up ${datesToRemove.length} old archives before ${beforeDate}`);
    return { removed: datesToRemove.length, dates_removed: datesToRemove };
  } catch (error) {
    logger5.error("Error cleaning up old archives:", error);
    throw new AppError(`Cleanup failed: ${error.message}`, 500);
  }
}
var logger5, ARCHIVE_KEYS;
var init_archive_manager = __esm({
  "worker-modules/src/archive-manager.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_config();
    init_utils();
    logger5 = {
      info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[ARCHIVE] ${msg}`, data), "info"),
      debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[ARCHIVE] ${msg}`, data), "debug"),
      warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[ARCHIVE] ${msg}`, data), "warn"),
      error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[ARCHIVE] ${msg}`, data), "error")
    };
    ARCHIVE_KEYS = {
      daily: /* @__PURE__ */ __name((date) => `archive_${date}`, "daily"),
      index: "archive_index",
      stats: "archive_stats",
      search_cache: /* @__PURE__ */ __name((hash) => `archive_search_${hash}`, "search_cache"),
      export_cache: /* @__PURE__ */ __name((jobId) => `export_${jobId}`, "export_cache")
    };
    __name(createArchiveEntry, "createArchiveEntry");
    __name(updateArchiveIndex, "updateArchiveIndex");
    __name(getArchiveIndex, "getArchiveIndex");
    __name(archivePapers, "archivePapers");
    __name(getArchivedPapers, "getArchivedPapers");
    __name(getArchivedPapersByRange, "getArchivedPapersByRange");
    __name(searchArchivedPapers, "searchArchivedPapers");
    __name(calculateSearchRelevance, "calculateSearchRelevance");
    __name(getArchiveStatistics, "getArchiveStatistics");
    __name(isDateArchived, "isDateArchived");
    __name(getAvailableArchiveDates, "getAvailableArchiveDates");
    __name(cleanupOldArchives, "cleanupOldArchives");
  }
});

// worker-modules/src/archive-templates.js
var archive_templates_exports = {};
__export(archive_templates_exports, {
  generateAdvancedFilters: () => generateAdvancedFilters,
  generateCategoryChart: () => generateCategoryChart,
  generateDateRangePicker: () => generateDateRangePicker,
  generateEnhancedArchiveHTML: () => generateEnhancedArchiveHTML,
  generateExportCompleteTemplate: () => generateExportCompleteTemplate,
  generateExportModal: () => generateExportModal,
  generateExportProgressTemplate: () => generateExportProgressTemplate,
  generateExportSummary: () => generateExportSummary
});
function generateEnhancedArchiveHTML(data) {
  const {
    papers = [],
    availableDates = [],
    statistics = null,
    selectedDate = null,
    filters = {},
    pagination = {}
  } = data;
  const { category = null, search = null } = filters;
  const { currentPage = 1, totalPages = 1, totalPapers = 0, hasNext = false, hasPrev = false } = pagination;
  const exportParams = new URLSearchParams();
  if (selectedDate) exportParams.set("start_date", selectedDate);
  if (selectedDate) exportParams.set("end_date", selectedDate);
  if (category) exportParams.set("category", category);
  const exportBaseUrl = `/api/archive/export?${exportParams.toString()}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paper Archive - PaperDog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            --border-radius: 12px;
        }

        body {
            background: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .archive-header {
            background: var(--primary-gradient);
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
        }

        .stats-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 1.5rem;
            box-shadow: var(--card-shadow);
            border: none;
            transition: transform 0.2s ease;
        }

        .stats-card:hover {
            transform: translateY(-2px);
        }

        .filter-section {
            background: white;
            border-radius: var(--border-radius);
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .export-panel {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: var(--border-radius);
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .export-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .export-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            color: white;
            transform: translateY(-1px);
        }

        .date-selector {
            background: white;
            border-radius: var(--border-radius);
            padding: 1rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .date-btn {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
            transition: all 0.2s ease;
            text-decoration: none;
            color: #495057;
            font-size: 0.9rem;
        }

        .date-btn:hover, .date-btn.active {
            background: var(--primary-gradient);
            border-color: transparent;
            color: white;
            transform: translateY(-1px);
        }

        .paper-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: none;
            transition: all 0.3s ease;
        }

        .paper-card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
        }

        .score-badge {
            background: var(--secondary-gradient);
            color: white;
            border-radius: 20px;
            padding: 0.25rem 0.75rem;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .view-count {
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
            border-radius: 12px;
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            border: 1px solid rgba(0, 123, 255, 0.2);
        }

        .view-count i {
            font-size: 0.7rem;
        }

        .category-badge {
            background: #e3f2fd;
            color: #1976d2;
            border-radius: 15px;
            padding: 0.25rem 0.75rem;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .search-box {
            border-radius: 25px;
            border: 2px solid #e9ecef;
            padding: 0.75rem 1.5rem;
            transition: all 0.3s ease;
        }

        .search-box:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .pagination {
            margin-top: 2rem;
        }

        .page-link {
            border-radius: 8px;
            margin: 0 0.25rem;
            border: none;
            background: #f8f9fa;
            color: #495057;
        }

        .page-link:hover, .page-item.active .page-link {
            background: var(--primary-gradient);
            color: white;
        }

        .export-format-info {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
        }

        .loading-spinner {
            display: none;
            text-align: center;
            padding: 2rem;
        }

        .stats-number {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="archive-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h1 class="display-5 fw-bold mb-2">
                        <i class="fas fa-archive me-3"></i>Paper Archive
                    </h1>
                    <p class="lead mb-0">Browse and export your curated research paper collection</p>
                </div>
                <div class="col-lg-4 text-end">
                    <a href="/" class="btn btn-outline-light">
                        <i class="fas fa-home me-2"></i>Back to Home
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <!-- Statistics Panel -->
        ${statistics ? `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stats-card text-center">
                    <div class="stats-number">${statistics.total_archives}</div>
                    <div class="text-muted">Archived Days</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card text-center">
                    <div class="stats-number">${statistics.total_papers}</div>
                    <div class="text-muted">Total Papers</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card text-center">
                    <div class="stats-number">${statistics.overall_average_score?.toFixed(1) || "0.0"}</div>
                    <div class="text-muted">Avg Score</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card text-center">
                    <div class="stats-number">${Object.keys(statistics.category_distribution).length}</div>
                    <div class="text-muted">Categories</div>
                </div>
            </div>
        </div>
        ` : ""}

        <!-- Export Panel -->
        <div class="export-panel">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h4 class="mb-2">
                        <i class="fas fa-download me-2"></i>Export Archive Data
                    </h4>
                    <p class="mb-0 opacity-75">Download your archived papers in various formats</p>
                </div>
                <div class="col-lg-4 text-end">
                    <a href="${exportBaseUrl}&format=json" class="export-btn" title="Complete JSON data">
                        <i class="fas fa-code me-1"></i>JSON
                    </a>
                    <a href="${exportBaseUrl}&format=csv" class="export-btn" title="Spreadsheet format">
                        <i class="fas fa-table me-1"></i>CSV
                    </a>
                    <a href="${exportBaseUrl}&format=markdown" class="export-btn" title="Readable format">
                        <i class="fas fa-file-alt me-1"></i>Markdown
                    </a>
                    <a href="${exportBaseUrl}&format=bibtex" class="export-btn" title="Citation format">
                        <i class="fas fa-quote-right me-1"></i>BibTeX
                    </a>
                </div>
            </div>
            <div class="export-format-info">
                <small>
                    <strong>JSON:</strong> Complete data with analysis \u2022
                    <strong>CSV:</strong> Tabular data for analysis \u2022
                    <strong>Markdown:</strong> Human-readable reports \u2022
                    <strong>BibTeX:</strong> Academic citations
                </small>
            </div>
        </div>

        <!-- Date Selector -->
        ${availableDates.length > 0 ? `
        <div class="date-selector">
            <h5 class="mb-3">
                <i class="fas fa-calendar me-2"></i>Browse by Date
            </h5>
            <div class="d-flex flex-wrap">
                ${availableDates.slice(0, 15).map((date) => `
                    <a href="?date=${date}" class="date-btn ${selectedDate === date ? "active" : ""}" title="${formatDate(date)}">
                        ${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </a>
                `).join("")}
                ${availableDates.length > 15 ? `
                    <span class="text-muted ms-2">... and ${availableDates.length - 15} more dates</span>
                ` : ""}
            </div>
        </div>
        ` : ""}

        <!-- Filters and Search -->
        <div class="filter-section">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <form method="GET" action="/archive" class="d-flex gap-2">
                        ${selectedDate ? `<input type="hidden" name="date" value="${selectedDate}">` : ""}
                        <input type="text" name="search" class="form-control search-box" placeholder="Search papers..." value="${search || ""}">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-search"></i>
                        </button>
                        ${search ? `<a href="?${selectedDate ? `date=${selectedDate}` : ""}" class="btn btn-outline-secondary">Clear</a>` : ""}
                    </form>
                </div>
                <div class="col-lg-6 text-end">
                    <div class="btn-group" role="group">
                        <a href="?${new URLSearchParams({ ...filters, date: selectedDate }).toString()}" class="btn btn-outline-primary ${!category ? "active" : ""}">
                            All Categories
                        </a>
                        ${statistics ? Object.keys(statistics.category_distribution || {}).slice(0, 5).map((cat) => `
                            <a href="?${new URLSearchParams({ ...filters, date: selectedDate, category: cat }).toString()}"
                               class="btn btn-outline-primary ${category === cat ? "active" : ""}"
                               title="${cat.replace(/_/g, " ")}">
                                ${cat.replace(/_/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                            </a>
                        `).join("") : ""}
                    </div>
                </div>
            </div>
        </div>

        <!-- Papers List -->
        <div class="papers-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>
                    <i class="fas fa-file-alt me-2"></i>
                    ${selectedDate ? `Papers for ${formatDate(selectedDate)}` : "Recent Papers"}
                    ${category ? ` - ${category.replace(/_/g, " ")}` : ""}
                    ${search ? ` (Search: "${search}")` : ""}
                </h4>
                <span class="text-muted">${totalPapers} papers found</span>
            </div>

            ${papers.length === 0 ? `
                <div class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No papers found</h5>
                    <p class="text-muted">Try adjusting your search criteria or browse a different date.</p>
                </div>
            ` : papers.map((paper) => `
                <div class="paper-card">
                    <div class="row">
                        <div class="col-md-10">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="mb-1">
                                    <a href="${paper.url || "#"}" target="_blank" class="text-decoration-none">
                                        ${paper.title}
                                    </a>
                                </h5>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="view-count">
                                        <i class="fas fa-eye"></i>
                                        <span>${paper.views || 0}</span>
                                    </div>
                                    <span class="score-badge">${(paper.analysis?.relevance_score || 5).toFixed(1)}/10</span>
                                </div>
                            </div>
                            <p class="text-muted mb-2">
                                <i class="fas fa-user me-1"></i>${paper.authors?.join(", ") || "Unknown authors"}
                                ${paper.published ? `<span class="ms-3"><i class="fas fa-calendar me-1"></i>${new Date(paper.published).toLocaleDateString()}</span>` : ""}
                                ${paper.source ? `<span class="ms-3"><i class="fas fa-database me-1"></i>${paper.source}</span>` : ""}
                            </p>
                            ${paper.analysis?.category ? `<span class="category-badge mb-2 d-inline-block">${paper.analysis.category.replace(/_/g, " ")}</span>` : ""}
                            <p class="mb-2">${paper.abstract?.substring(0, 300) || "No abstract available"}${paper.abstract?.length > 300 ? "..." : ""}</p>
                            ${paper.analysis?.keywords?.length > 0 ? `
                                <div class="mb-2">
                                    <small class="text-muted">Keywords: ${paper.analysis.keywords.slice(0, 8).join(", ")}</small>
                                </div>
                            ` : ""}
                        </div>
                        <div class="col-md-2 text-end">
                            ${paper.url ? `
                                <a href="${paper.url}" target="_blank" class="btn btn-sm btn-outline-primary mb-2">
                                    <i class="fas fa-external-link-alt me-1"></i>View Paper
                                </a>
                            ` : ""}
                            <button class="btn btn-sm btn-outline-secondary" onclick="exportPaper('${paper.id}', '${sanitizeFilename(paper.title)}')">
                                <i class="fas fa-download me-1"></i>Export
                            </button>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>

        <!-- Pagination -->
        ${totalPages > 1 ? `
        <nav class="pagination">
            <ul class="pagination justify-content-center">
                <li class="page-item ${!hasPrev ? "disabled" : ""}">
                    <a class="page-link" href="?${new URLSearchParams({ ...filters, date: selectedDate, page: currentPage - 1 }).toString()}">Previous</a>
                </li>

                ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
    return `
                    <li class="page-item ${pageNum === currentPage ? "active" : ""}">
                        <a class="page-link" href="?${new URLSearchParams({ ...filters, date: selectedDate, page: pageNum }).toString()}">${pageNum}</a>
                    </li>
                  `;
  }).join("")}

                <li class="page-item ${!hasNext ? "disabled" : ""}">
                    <a class="page-link" href="?${new URLSearchParams({ ...filters, date: selectedDate, page: currentPage + 1 }).toString()}">Next</a>
                </li>
            </ul>
        </nav>
        ` : ""}
    </div>

    <!-- Loading Spinner -->
    <div class="loading-spinner" id="loadingSpinner">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Preparing your export...</p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>
    <script>
        // Export individual paper
        async function exportPaper(paperId, paperTitle) {
            const spinner = document.getElementById('loadingSpinner');
            spinner.style.display = 'block';

            try {
                // For now, we'll export as JSON - could be enhanced to support multiple formats
                const response = await fetch(\`/api/papers/\${paperId}\`);
                const data = await response.json();

                const exportData = {
                    paper: data,
                    exported_at: new Date().toISOString(),
                    format: 'individual_export'
                };

                downloadFile(JSON.stringify(exportData, null, 2), \`\${paperTitle}_export.json\`, 'application/json');
            } catch (error) {
                alert('Export failed: ' + error.message);
            } finally {
                spinner.style.display = 'none';
            }
        }

        // Download file helper
        function downloadFile(content, filename, contentType) {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Show export progress for large downloads
        document.querySelectorAll('a[href*="/api/archive/export"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const spinner = document.getElementById('loadingSpinner');
                spinner.style.display = 'block';

                // Hide spinner after a delay (export will proceed in background)
                setTimeout(() => {
                    spinner.style.display = 'none';
                }, 3000);
            });
        });
    <\/script>
</body>
</html>`;
}
function generateExportModal(data) {
  const { totalPapers, dateRange, availableFormats, currentFilters } = data;
  return `
<div class="modal fade" id="exportModal" tabindex="-1" aria-labelledby="exportModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exportModalLabel">
          <i class="fas fa-download me-2"></i>Export Archive Data
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-6">
            <h6 class="mb-3">Export Summary</h6>
            <ul class="list-unstyled">
              <li><strong>Total Papers:</strong> ${totalPapers}</li>
              <li><strong>Date Range:</strong> ${dateRange?.start || "All"} to ${dateRange?.end || "All"}</li>
              ${currentFilters?.category ? `<li><strong>Category:</strong> ${currentFilters.category}</li>` : ""}
              ${currentFilters?.search ? `<li><strong>Search:</strong> "${currentFilters.search}"</li>` : ""}
            </ul>
          </div>
          <div class="col-md-6">
            <h6 class="mb-3">Select Format</h6>
            ${availableFormats.map((format) => `
              <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="exportFormat" id="format_${format.value}" value="${format.value}" ${format.default ? "checked" : ""}>
                <label class="form-check-label" for="format_${format.value}">
                  <strong>${format.label}</strong> - ${format.description}
                </label>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-12">
            <h6 class="mb-3">Export Options</h6>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="includeAbstracts" checked>
              <label class="form-check-label" for="includeAbstracts">Include abstracts</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="includeAnalysis" checked>
              <label class="form-check-label" for="includeAnalysis">Include AI analysis</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="includeStatistics" checked>
              <label class="form-check-label" for="includeStatistics">Include statistics</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="compressLarge" checked>
              <label class="form-check-label" for="compressLarge">Compress large exports</label>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="performAdvancedExport()">
          <i class="fas fa-download me-2"></i>Export Data
        </button>
      </div>
    </div>
  </div>
</div>`;
}
function generateExportProgressTemplate() {
  return `
<div class="progress mb-3" style="height: 25px">
  <div class="progress-bar progress-bar-striped progress-bar-animated"
       role="progressbar"
       id="exportProgressBar">
    Preparing export...
  </div>
</div>
<div class="text-center">
  <p id="exportStatusText">Initializing export process... </p>
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>`;
}
function generateExportCompleteTemplate(result) {
  const { format, filename, size, papers_count, metadata } = result;
  return `
<div class="alert alert-success" role="alert">
  <h6 class="alert-heading">Export Complete! <i class="fas fa-check-circle"></i></h6>
  <p>Your archive data has been successfully exported.</p>
  <hr>
  <ul class="mb-0">
    <li><strong>Format:</strong> ${format.toUpperCase()}</li>
    <li><strong>Papers:</strong> ${papers_count}</li>
    <li><strong>File size:</strong> ${formatBytes(size)}</li>
    <li><strong>Filename:</strong> ${filename}</li>
  </ul>
</div>
<div class="text-center mt-3">
  <a href="#" class="btn btn-success" onclick="downloadExportedFile()">
    <i class="fas fa-download me-2"></i>Download File
  </a>
  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
</div>`;
}
function generateCategoryChart(categories) {
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => b - a).slice(0, 8);
  return `
<div class="chart-container mb-4">
  <h6 class="mb-3">Papers by Category</h6>
  ${sortedCategories.map(([category, count]) => {
    const percentage = (count / total * 100).toFixed(1);
    return `
      <div class="mb-2">
        <div class="d-flex justify-content-between mb-1">
          <span class="small">${category.replace(/_/g, " ")}</span>
          <span class="small text-muted">${count} (${percentage}%)</span>
        </div>
        <div class="progress" style="height: 8px">
          <div class="progress-bar bg-primary" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join("")}
</div>`;
}
function generateDateRangePicker() {
  return `
<div class="row mb-3">
  <div class="col-md-6">
    <label for="startDate" class="form-label">Start Date</label>
    <input type="date" class="form-control" id="startDate" name="start_date">
  </div>
  <div class="col-md-6">
    <label for="endDate" class="form-label">End Date</label>
    <input type="date" class="form-control" id="endDate" name="end_date">
  </div>
</div>`;
}
function generateAdvancedFilters() {
  return `
<div class="row mb-3">
  <div class="col-md-4">
    <label for="categoryFilter" class="form-label">Category</label>
    <select class="form-select" id="categoryFilter" name="category">
      <option value="">All Categories</option>
      <option value="computer_vision">Computer Vision</option>
      <option value="machine_learning">Machine Learning</option>
      <option value="natural_language_processing">Natural Language Processing</option>
      <option value="reinforcement_learning">Reinforcement Learning</option>
      <option value="multimodal_learning">Multimodal Learning</option>
      <option value="generative_models">Generative Models</option>
      <option value="diffusion_models">Diffusion Models</option>
      <option value="transformer_architectures">Transformer Architectures</option>
    </select>
  </div>
  <div class="col-md-4">
    <label for="minScore" class="form-label">Minimum Score</label>
    <input type="range" class="form-range" id="minScore" name="min_score" min="1" max="10" value="1">
    <div class="text-center"><small id="minScoreValue">1</small></div>
  </div>
  <div class="col-md-4">
    <label for="maxScore" class="form-label">Maximum Score</label>
    <input type="range" class="form-range" id="maxScore" name="max_score" min="1" max="10" value="10">
    <div class="text-center"><small id="maxScoreValue">10</small></div>
  </div>
</div>`;
}
function generateExportSummary(data) {
  const { format, papers_count, date_range, filters } = data;
  return `
<div class="export-summary mb-4">
  <h6>Export Details</h6>
  <div class="row">
    <div class="col-md-3">
      <div class="text-center">
        <div class="h4 text-primary">${papers_count}</div>
        <small class="text-muted">Papers</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="text-center">
        <div class="h4 text-primary">${format.toUpperCase()}</div>
        <small class="text-muted">Format</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="text-center">
        <div class="h4 text-primary">${date_range ? `${date_range.start} to ${date_range.end}` : "All"}</div>
        <small class="text-muted">Date Range</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="text-center">
        <div class="h4 text-primary">${filters?.category || "All"}</div>
        <small class="text-muted">Category</small>
      </div>
    </div>
  </div>
</div>`;
}
var init_archive_templates = __esm({
  "worker-modules/src/archive-templates.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_utils();
    __name(generateEnhancedArchiveHTML, "generateEnhancedArchiveHTML");
    __name(generateExportModal, "generateExportModal");
    __name(generateExportProgressTemplate, "generateExportProgressTemplate");
    __name(generateExportCompleteTemplate, "generateExportCompleteTemplate");
    __name(generateCategoryChart, "generateCategoryChart");
    __name(generateDateRangePicker, "generateDateRangePicker");
    __name(generateAdvancedFilters, "generateAdvancedFilters");
    __name(generateExportSummary, "generateExportSummary");
  }
});

// .wrangler/tmp/bundle-KstIoW/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-KstIoW/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// worker-modules/functions/worker.js
init_checked_fetch();
init_modules_watch_stub();
init_config();

// worker-modules/src/handlers.js
init_checked_fetch();
init_modules_watch_stub();
init_config();
init_utils();

// worker-modules/src/paper-scraper.js
init_checked_fetch();
init_modules_watch_stub();
init_config();
init_utils();
function createTimeout(ms, message) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });
}
__name(createTimeout, "createTimeout");
var logger = {
  info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[INFO] ${msg}`, data), "info"),
  debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[DEBUG] ${msg}`, data), "debug"),
  warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[WARN] ${msg}`, data), "warn"),
  error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[ERROR] ${msg}`, data), "error")
};
function sanitizeJsonContent(content) {
  if (!content || typeof content !== "string") {
    return content;
  }
  if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === "object") {
        if (parsed.abstract) return parsed.abstract;
        if (parsed.description) return parsed.description;
        if (parsed.summary) return parsed.summary;
        if (parsed.text) return parsed.text;
        if (parsed.challenges && Array.isArray(parsed.challenges)) {
          return parsed.challenges.join(". ");
        }
        if (parsed.introduction) return parsed.introduction;
        if (parsed.innovations) return parsed.innovations;
        if (parsed.experiments) return parsed.experiments;
        if (parsed.insights) return parsed.insights;
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => typeof item === "string").join(". ");
        }
        return JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      logger.debug("Failed to parse JSON content, using original", { content: content.substring(0, 100) });
    }
  }
  return content;
}
__name(sanitizeJsonContent, "sanitizeJsonContent");
var CircuitBreaker = class {
  static {
    __name(this, "CircuitBreaker");
  }
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 6e4;
    this.failures = 0;
    this.state = "CLOSED";
    this.nextAttempt = Date.now();
    this.successCount = 0;
    this.lastFailureTime = null;
  }
  async execute(operation) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker ${this.name} is OPEN until ${new Date(this.nextAttempt).toISOString()}`);
      } else {
        this.state = "HALF_OPEN";
        logger.info(`Circuit breaker ${this.name} entering HALF_OPEN state`);
      }
    }
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  onSuccess() {
    this.successCount++;
    this.failures = 0;
    if (this.state === "HALF_OPEN") {
      this.state = "CLOSED";
      logger.info(`Circuit breaker ${this.name} is now CLOSED`);
    }
  }
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
      logger.warn(`Circuit breaker ${this.name} is now OPEN until ${new Date(this.nextAttempt).toISOString()}`);
    }
  }
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successCount: this.successCount,
      nextAttempt: this.state === "OPEN" ? new Date(this.nextAttempt).toISOString() : null,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null
    };
  }
};
var circuitBreakers = {
  huggingfaceApi: new CircuitBreaker("huggingface-api", { failureThreshold: 3, resetTimeout: 3e5 }),
  huggingfaceScraping: new CircuitBreaker("huggingface-scraping", { failureThreshold: 5, resetTimeout: 6e5 }),
  arxivApi: new CircuitBreaker("arxiv-api", { failureThreshold: 3, resetTimeout: 3e5 })
};
async function scrapeDailyPapers() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  logger.info(`Starting daily paper scraping for ${today}`);
  try {
    const scrapingPromise = Promise.allSettled([
      scrapeArxivPapers(),
      scrapeHuggingfacePapers()
    ]);
    const timeoutPromise = createTimeout(5 * 60 * 1e3, "Paper scraping timeout after 5 minutes");
    const [arxivPapers, huggingfacePapers] = await Promise.race([
      scrapingPromise,
      timeoutPromise.then(() => {
        throw new Error("Paper scraping timeout after 5 minutes");
      })
    ]);
    const allPapers = [];
    if (arxivPapers.status === "fulfilled" && arxivPapers.value.length > 0) {
      logger.info(`Scraped ${arxivPapers.value.length} papers from arXiv`);
      allPapers.push(...arxivPapers.value);
    } else if (arxivPapers.status === "rejected") {
      logger.error("Failed to scrape arXiv papers:", { error: arxivPapers.reason.message });
    }
    if (huggingfacePapers.status === "fulfilled" && huggingfacePapers.value.length > 0) {
      logger.info(`Scraped ${huggingfacePapers.value.length} papers from HuggingFace`);
      allPapers.push(...huggingfacePapers.value);
    } else if (huggingfacePapers.status === "rejected") {
      logger.error("Failed to scrape HuggingFace papers:", { error: huggingfacePapers.reason.message });
    }
    const uniquePapers = removeDuplicatePapers(allPapers);
    logger.info(`Total unique papers scraped: ${uniquePapers.length}`);
    return uniquePapers;
  } catch (error) {
    logger.error("Error in daily paper scraping:", error);
    throw new AppError(`Failed to scrape daily papers: ${error.message}`);
  }
}
__name(scrapeDailyPapers, "scrapeDailyPapers");
async function scrapeArxivPapers() {
  return await circuitBreakers.arxivApi.execute(async () => {
    const config = SOURCE_CONFIGS.arxiv;
    const categories = PAPER_SOURCES.arxiv.categories;
    const papers = [];
    logger.info(`Scraping arXiv papers from categories: ${categories.join(", ")}`);
    const categoryQuery = categories.map((cat) => `cat:${cat}`).join(" OR ");
    const searchQuery = categoryQuery;
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `${PAPER_SOURCES.arxiv.baseUrl}?search_query=${encodedQuery}&start=0&max_results=${config.maxPapersPerRequest}&sortBy=${PAPER_SOURCES.arxiv.sortBy}&sortOrder=${PAPER_SOURCES.arxiv.sortOrder}`;
    try {
      const response = await fetchWithTimeout(url, 3e4);
      const xmlContent = await response.text();
      const entries = parseArxivXML(xmlContent);
      logger.info(`Found ${entries.length} entries in arXiv response`);
      for (let i = 0; i < entries.length; i++) {
        try {
          const entry = entries[i];
          const paper = parseArxivEntry(entry);
          if (paper) {
            papers.push(paper);
          }
        } catch (error) {
          logger.warn(`Failed to parse arXiv entry ${i}:`, { error: error.message });
        }
      }
      return papers;
    } catch (error) {
      logger.error("Error scraping arXiv:", error);
      throw new AppError(`arXiv scraping failed: ${error.message}`);
    }
  });
}
__name(scrapeArxivPapers, "scrapeArxivPapers");
function parseArxivEntry(entry) {
  try {
    const id = entry.id;
    const title = entry.title;
    const summary = entry.summary;
    const published = entry.published;
    const updated = entry.updated;
    const primary_category = entry.primary_category;
    const authors = entry.authors || [];
    const arxivId = entry.arxiv_id || "";
    if (!title || !summary) {
      logger.warn("Missing required fields in arXiv entry");
      return null;
    }
    return {
      id: `arxiv_${arxivId}`,
      arxiv_id: arxivId,
      title,
      abstract: summary,
      authors,
      published: published || "",
      updated: updated || "",
      category: primary_category || "",
      source: "arxiv",
      original_source: "arxiv",
      // 明确标记原始来源
      url: id,
      pdf_url: id.replace("/abs/", "/pdf/") + ".pdf",
      scraped_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    logger.error("Error parsing arXiv entry:", error);
    return null;
  }
}
__name(parseArxivEntry, "parseArxivEntry");
async function scrapeHuggingfacePapers() {
  return await circuitBreakers.huggingfaceScraping.execute(async () => {
    const config = SOURCE_CONFIGS.huggingface;
    const papers = [];
    logger.info("Scraping HuggingFace papers");
    try {
      const apiPapers = await circuitBreakers.huggingfaceApi.execute(async () => {
        const apiUrl = "https://huggingface.co/api/papers";
        const response = await fetchWithTimeout(apiUrl, 3e4, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://huggingface.co/",
            "Origin": "https://huggingface.co"
          }
        });
        if (response.ok) {
          const apiData = await response.json();
          logger.info(`HuggingFace API returned ${apiData.length || 0} papers`);
          return parseHuggingFaceAPIResponse(apiData);
        } else {
          throw new Error(`HuggingFace API returned ${response.status}`);
        }
      });
      if (apiPapers && apiPapers.length > 0) {
        return apiPapers;
      }
    } catch (apiError) {
      logger.debug("HuggingFace API not available:", apiError.message);
    }
    try {
      logger.info("Attempting enhanced HuggingFace web scraping");
      const url = "https://huggingface.co/papers";
      const response = await fetchWithTimeout(url, 3e4, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });
      if (response.ok) {
        const htmlContent = await response.text();
        const paperElements = parseHuggingfaceHTML(htmlContent);
        logger.info(`Found ${paperElements.length} paper elements on HuggingFace`);
        for (let i = 0; i < Math.min(paperElements.length, config.maxPapersPerRequest); i++) {
          try {
            const paper = await parseHuggingfacePaper(paperElements[i]);
            if (paper) {
              papers.push(paper);
              logger.debug(`Added paper (quality score: ${paper.abstract_quality}): ${paper.title.substring(0, 50)}...`);
            }
          } catch (error) {
            logger.warn(`Failed to parse HuggingFace paper ${i}:`, { error: error.message });
          }
          if (i < paperElements.length - 1) {
            await sleep(config.requestDelay);
          }
        }
        if (papers.length > 0) {
          logger.info(`Successfully retrieved ${papers.length} high-quality papers from HuggingFace`);
          return papers;
        }
      }
    } catch (scrapingError) {
      logger.warn("Enhanced HuggingFace scraping failed:", scrapingError.message);
    }
    try {
      logger.info("Trying HuggingFace datasets API");
      const datasetsUrl = "https://huggingface.co/api/datasets?full=true&limit=20";
      const response = await fetchWithTimeout(datasetsUrl, 3e4, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      if (response.ok) {
        const datasetsData = await response.json();
        const datasetPapers = parseHuggingFaceDatasets(datasetsData);
        if (datasetPapers.length > 0) {
          logger.info(`Found ${datasetPapers.length} papers from HuggingFace datasets`);
          return datasetPapers.slice(0, config.maxPapersPerRequest);
        }
      }
    } catch (datasetError) {
      logger.debug("HuggingFace datasets API not available:", datasetError.message);
    }
    logger.info("Generating fallback HuggingFace papers from trending topics");
    const fallbackPapers = await generateFallbackHuggingFacePapers(config.maxPapersPerRequest);
    if (fallbackPapers.length > 0) {
      logger.info(`Generated ${fallbackPapers.length} fallback HuggingFace papers`);
      return fallbackPapers;
    }
    logger.warn("All HuggingFace scraping methods failed, returning empty array");
    return [];
  });
}
__name(scrapeHuggingfacePapers, "scrapeHuggingfacePapers");
async function parseHuggingfacePaper(element, apiKey = null) {
  try {
    let title = element.title;
    let abstract = element.abstract;
    let link = element.link;
    let authors = element.authors || [];
    if (!title) {
      logger.warn("No title found in HuggingFace paper element");
      return null;
    }
    if (!abstract || abstract.length < 50) {
      logger.debug(`Abstract too short or missing for "${title}", attempting retrieval...`);
      if (link) {
        const fullUrl = link.startsWith("http") ? link : `https://huggingface.co${link}`;
        abstract = await scrapePaperFromIndividualPage(fullUrl) || abstract;
        if (!abstract || abstract.length < 50) {
          logger.debug(`Attempting arXiv cross-reference for "${title}"...`);
          abstract = await crossReferenceArxiv(title, authors) || abstract;
        }
      }
    }
    const abstractQuality = validateAbstractQuality(abstract);
    if (abstractQuality.score < 3) {
      logger.warn(`Low quality abstract for "${title}" (score: ${abstractQuality.score}): ${abstractQuality.reason}`);
    }
    const id = `hf_${title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}_${Date.now()}`;
    const text = `${title} ${abstract}`.toLowerCase();
    let category = "machine-learning";
    if (text.includes("vision") || text.includes("image") || text.includes("visual")) {
      category = "computer_vision";
    } else if (text.includes("nlp") || text.includes("language") || text.includes("text")) {
      category = "natural_language_processing";
    } else if (text.includes("reinforcement") || text.includes("rl") || text.includes("agent")) {
      category = "reinforcement_learning";
    }
    return {
      id,
      title,
      abstract,
      authors,
      published: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      // Default to today
      updated: (/* @__PURE__ */ new Date()).toISOString(),
      category,
      source: "huggingface",
      original_source: "huggingface_enhanced",
      // Mark as enhanced scraping
      url: link.startsWith("http") ? link : `https://huggingface.co${link}`,
      pdf_url: "",
      // HuggingFace may not provide direct PDF links
      scraped_at: (/* @__PURE__ */ new Date()).toISOString(),
      abstract_quality: abstractQuality.score
    };
  } catch (error) {
    logger.error("Error parsing HuggingFace paper:", error);
    return null;
  }
}
__name(parseHuggingfacePaper, "parseHuggingfacePaper");
function parseArxivXML(xmlContent) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xmlContent)) !== null) {
    const entryContent = match[1];
    const entry = parseArxivEntryContent(entryContent);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}
__name(parseArxivXML, "parseArxivXML");
function parseArxivEntryContent(entryContent) {
  try {
    const extractElement = /* @__PURE__ */ __name((tagName) => {
      const match = entryContent.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`));
      return match ? match[1].trim() : "";
    }, "extractElement");
    const extractAttribute = /* @__PURE__ */ __name((tagName, attrName) => {
      const match = entryContent.match(new RegExp(`<${tagName}[^>]*${attrName}="([^"]*)"[^>]*>`));
      return match ? match[1] : "";
    }, "extractAttribute");
    const extractElements = /* @__PURE__ */ __name((tagName) => {
      const elements = [];
      const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "g");
      let match;
      while ((match = regex.exec(entryContent)) !== null) {
        const content = match[1].trim();
        if (content) {
          elements.push(content);
        }
      }
      return elements;
    }, "extractElements");
    const id = extractElement("id");
    const title = extractElement("title");
    const summary = extractElement("summary");
    const published = extractElement("published");
    const updated = extractElement("updated");
    if (!title || !summary) {
      logger.warn("Missing required fields in arXiv entry");
      return null;
    }
    const authors = [];
    const authorContents = extractElements("author");
    for (const authorContent of authorContents) {
      const nameMatch = authorContent.match(/<name[^>]*>([\s\S]*?)<\/name>/);
      if (nameMatch) {
        authors.push(nameMatch[1].trim());
      }
    }
    const arxivId = id.includes("arxiv.org/abs/") ? id.split("arxiv.org/abs/")[1] : "";
    return {
      id,
      title,
      summary,
      published,
      updated,
      authors,
      primary_category: extractAttribute("primary_category", "term"),
      arxiv_id: arxivId
    };
  } catch (error) {
    logger.error("Error parsing arXiv entry content:", error);
    return null;
  }
}
__name(parseArxivEntryContent, "parseArxivEntryContent");
function parseHuggingfaceHTML(htmlContent) {
  const papers = [];
  const patterns = [
    // Pattern 1: Look for paper list items with data-testid (modern React apps)
    /<div[^>]*data-testid="[^"]*(paper|card|item)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Pattern 2: Look for article elements with paper content
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    // Pattern 3: Look for paper cards with specific classes (modern class patterns)
    /<div[^>]*class="[^"]*(paper|card|item|post|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Pattern 4: Look for links to paper details
    /<a[^>]*href="\/papers\/[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
    // Pattern 5: Look for grid items (common in modern layouts)
    /<div[^>]*class="[^"]*(grid|container|flex)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Pattern 6: Look for list items in modern UI frameworks
    /<li[^>]*class="[^"]*(paper|card|item)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    // Pattern 7: Look for components with paper-related attributes
    /<[^>]*(paper|post|article)[^>]*>([\s\S]*?)<\/[^>]*>/gi
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null) {
      const paperContent = match[1] || match[2];
      const paper = parseHuggingfacePaperContent(paperContent);
      if (paper && paper.title && paper.title !== "Daily Papers") {
        if (!paper.link) {
          const linkMatch = match[0].match(/href="([^"]*)"/);
          if (linkMatch) {
            paper.link = linkMatch[1];
          }
        }
        const isDuplicate = papers.some((p) => p.title === paper.title);
        if (!isDuplicate) {
          papers.push(paper);
        }
      }
    }
    if (papers.length > 3) {
      break;
    }
  }
  if (papers.length < 3) {
    logger.info("Using enhanced fallback parsing for HuggingFace papers");
    const fallbackPapers = extractPapersFromModernStructure(htmlContent);
    papers.push(...fallbackPapers.filter((p) => p.title && p.title !== "Daily Papers"));
    const uniquePapers = [];
    const seenTitles = /* @__PURE__ */ new Set();
    for (const paper of papers) {
      if (paper.title && !seenTitles.has(paper.title)) {
        seenTitles.add(paper.title);
        uniquePapers.push(paper);
      }
    }
    return uniquePapers;
  }
  logger.info(`Extracted ${papers.length} papers from HuggingFace HTML`);
  return papers;
}
__name(parseHuggingfaceHTML, "parseHuggingfaceHTML");
async function scrapePaperFromIndividualPage(paperUrl) {
  try {
    logger.debug(`Scraping individual paper page: ${paperUrl}`);
    const response = await fetchWithTimeout(paperUrl, 15e3, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch paper page: ${response.status}`);
    }
    const htmlContent = await response.text();
    logger.debug(`Retrieved HTML content (${htmlContent.length} chars) from ${paperUrl}`);
    const abstractExtractionPatterns = [
      // HuggingFace specific pattern - exact match for <div class="abstract">
      /<div[^>]*class="abstract"[^>]*>([\s\S]*?)<\/div>/gi,
      // HuggingFace meta tags
      /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/gi,
      /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/gi,
      // General abstract patterns (fallbacks)
      /<div[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
      /<div[^>]*class="[^"]*(?:description|summary)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      // Paragraph patterns
      /<p[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
      // Data attribute patterns
      /<div[^>]*data-testid="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      // Content div patterns
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    ];
    logger.debug(`Trying ${abstractExtractionPatterns.length} abstract extraction patterns`);
    for (let i = 0; i < abstractExtractionPatterns.length; i++) {
      const pattern = abstractExtractionPatterns[i];
      let match;
      try {
        while ((match = pattern.exec(htmlContent)) !== null) {
          const content = match[1] || match[0];
          if (content) {
            const cleanContent = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
            if (cleanContent.length > 50 && !cleanContent.includes("Sign up") && !cleanContent.includes("Login") && !cleanContent.includes("Subscribe") && !cleanContent.includes("Follow")) {
              logger.debug(`Pattern ${i + 1} found abstract (${cleanContent.length} chars): ${cleanContent.substring(0, 100)}...`);
              return cleanContent;
            } else if (cleanContent.length > 10) {
              logger.debug(`Pattern ${i + 1} found content but too short or filtered: ${cleanContent.substring(0, 50)}...`);
            }
          }
        }
        logger.debug(`Pattern ${i + 1} found no matches`);
      } catch (error) {
        logger.warn(`Error applying pattern ${i + 1} for abstract extraction: ${error.message}`);
      }
    }
    logger.debug(`No abstract found on individual page: ${paperUrl}`);
    return null;
  } catch (error) {
    logger.warn(`Failed to scrape individual paper page ${paperUrl}:`, error.message);
    return null;
  }
}
__name(scrapePaperFromIndividualPage, "scrapePaperFromIndividualPage");
async function crossReferenceArxiv(title, authors = []) {
  try {
    logger.debug(`Cross-referencing arXiv for title: ${title.substring(0, 50)}...`);
    const titleWords = title.toLowerCase().split(" ").slice(0, 5).join(" ");
    const searchQuery = authors.length > 0 ? `${titleWords} ${authors[0].toLowerCase()}` : titleWords;
    const encodedQuery = encodeURIComponent(searchQuery);
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodedQuery}&start=0&max_results=3&sortBy=relevance&sortOrder=descending`;
    const response = await fetchWithTimeout(arxivUrl, 1e4);
    const xmlContent = await response.text();
    const entries = parseArxivXML(xmlContent);
    if (entries.length > 0) {
      let bestMatch = null;
      let highestSimilarity = 0;
      for (const entry of entries) {
        const similarity = calculateTitleSimilarity(title.toLowerCase(), entry.title.toLowerCase());
        if (similarity > highestSimilarity && similarity > 0.7) {
          highestSimilarity = similarity;
          bestMatch = entry;
        }
      }
      if (bestMatch && bestMatch.summary.length > 100) {
        logger.debug(`Found arXiv cross-reference with similarity ${highestSimilarity.toFixed(2)}: ${bestMatch.title.substring(0, 50)}...`);
        return bestMatch.summary;
      }
    }
    logger.debug(`No suitable arXiv cross-reference found for: ${title.substring(0, 50)}...`);
    return null;
  } catch (error) {
    logger.warn(`Failed to cross-reference arXiv for "${title.substring(0, 50)}...":`, error.message);
    return null;
  }
}
__name(crossReferenceArxiv, "crossReferenceArxiv");
function calculateTitleSimilarity(title1, title2) {
  const words1 = title1.toLowerCase().split(/\s+/);
  const words2 = title2.toLowerCase().split(/\s+/);
  const commonWords = words1.filter((word) => word.length > 3 && words2.includes(word));
  const totalUniqueWords = [.../* @__PURE__ */ new Set([...words1, ...words2])].filter((word) => word.length > 3);
  return commonWords.length / totalUniqueWords.length;
}
__name(calculateTitleSimilarity, "calculateTitleSimilarity");
function validateAbstractQuality(abstract) {
  if (!abstract || typeof abstract !== "string") {
    return { score: 1, reason: "No abstract available - will use title-only analysis" };
  }
  const length = abstract.trim().length;
  const words = abstract.trim().split(/\s+/);
  const checks = {
    length: length >= 50 ? 2 : length >= 20 ? 1 : 0,
    // Lowered from 100 to 50, 50 to 20
    wordCount: words.length >= 10 ? 2 : words.length >= 5 ? 1 : 0,
    // Lowered from 20 to 10, 10 to 5
    hasTechnicalTerms: /\b(method|model|algorithm|approach|technique|framework|architecture|system|experiment|result|performance|evaluation|analysis|dataset|training|learning|network|transformer|neural|deep)\b/i.test(abstract) ? 1 : 0,
    // Reduced from 2 to 1
    notGeneric: !/\b(this paper|we present|in this work|our approach|the proposed)\b/i.test(abstract.substring(0, 100)) ? 1 : 0,
    notSpam: !/(sign up|subscribe|follow|click here|buy now|free trial)/i.test(abstract) ? 1 : 0
  };
  const score = Object.values(checks).reduce((sum, val) => sum + val, 0);
  const maxScore = Object.keys(checks).length;
  let reason = "";
  if (score < 2) {
    if (length < 20) reason = "Very short abstract";
    else if (words.length < 5) reason = "Very few words";
    else if (!checks.hasTechnicalTerms) reason = "Limited technical content";
    else if (!checks.notGeneric) reason = "Generic content";
    else if (!checks.notSpam) reason = "Contains spam indicators";
  } else {
    reason = "Acceptable abstract quality";
  }
  return { score, maxScore, reason };
}
__name(validateAbstractQuality, "validateAbstractQuality");
function parseHuggingfacePaperContent(paperContent) {
  try {
    const extractText = /* @__PURE__ */ __name((tag, attributes = "") => {
      const match = paperContent.match(new RegExp(`<${tag}${attributes}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return match ? match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : "";
    }, "extractText");
    let title = extractText("h1") || extractText("h2") || extractText("h3") || extractText("h4") || extractText("h5") || extractText("h6");
    if (!title) {
      const titleMatch = paperContent.match(/<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]*)<\/[^>]*>/i);
      title = titleMatch ? titleMatch[1].trim() : "";
    }
    if (!title) {
      return null;
    }
    let abstract = "";
    const strategies = [
      // Strategy 1: Look for abstract/description in paragraphs (modern patterns)
      () => {
        const paragraphs = paperContent.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (paragraphs) {
          const longestParagraph = paragraphs.map((p) => p.replace(/<[^>]*>/g, "").trim()).filter((p) => p.length > 15 && !p.includes("Read more") && !p.includes("Continue reading")).sort((a, b) => b.length - a.length)[0];
          return longestParagraph || "";
        }
        return "";
      },
      // Strategy 2: Look for description meta tags
      () => {
        const descMatch = paperContent.match(/<meta[^>]*(name|property)="(description|og:description)"[^>]*content="([^"]*)"[^>]*>/i);
        return descMatch ? descMatch[3] : "";
      },
      // Strategy 3: Look for abstract-specific divs with modern class patterns
      () => {
        const abstractPatterns = [
          /<div[^>]*class="[^"]*(abstract|description|summary|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<div[^>]*data-testid="[^"]*(abstract|description)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<section[^>]*class="[^"]*(abstract|description)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
          /<div[^>]*data-testid="[^"]*(paper|card)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<div[^>]*class="[^"]*(prose|markdown)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
        ];
        for (const pattern of abstractPatterns) {
          const abstractMatch = paperContent.match(pattern);
          if (abstractMatch && abstractMatch[1]) {
            const content = abstractMatch[2] || abstractMatch[1];
            const cleanContent = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
            if (cleanContent.length > 10) {
              return sanitizeJsonContent(cleanContent);
            }
          }
        }
        return "";
      },
      // Strategy 4: Look for summary sections with modern patterns
      () => {
        const summaryPatterns = [
          /<div[^>]*class="[^"]*summary[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<p[^>]*class="[^"]*summary[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
          /<div[^>]*data-testid="[^"]*summary[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<div[^>]*class="[^"]*(text-gray|text-muted)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
        ];
        for (const pattern of summaryPatterns) {
          const summaryMatch = paperContent.match(pattern);
          if (summaryMatch && summaryMatch[1]) {
            const content = summaryMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
            if (content.length > 10) {
              return sanitizeJsonContent(content);
            }
          }
        }
        return "";
      },
      // Strategy 5: Look for content in article/body sections
      () => {
        const contentSections = paperContent.match(/<(article|main|section)[^>]*>([\s\S]*?)<\/\1>/gi);
        if (contentSections) {
          const text = contentSections[0].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
          return text.length > 50 ? text.substring(0, 200) + "..." : "";
        }
        return "";
      },
      // Strategy 6: Look for modern React component patterns
      () => {
        const modernPatterns = [
          /<div[^>]*data-content="([^"]*)"[^>]*>/gi,
          /<div[^>]*data-text="([^"]*)"[^>]*>/gi,
          /<span[^>]*data-testid="[^"]*text[^"]*"[^>]*>([\s\S]*?)<\/span>/gi
        ];
        for (const pattern of modernPatterns) {
          const match = paperContent.match(pattern);
          if (match) {
            const content = match[1] || match[0].replace(/<[^>]*>/g, "");
            const cleanContent = content.replace(/\s+/g, " ").trim();
            if (cleanContent.length > 20) {
              return sanitizeJsonContent(cleanContent);
            }
          }
        }
        return "";
      }
    ];
    for (const strategy of strategies) {
      abstract = strategy();
      if (abstract && abstract.length > 10 && !abstract.includes("Sign up") && !abstract.includes("Subscribe")) {
        logger.debug(`Found abstract using strategy: ${abstract.substring(0, 50)}...`);
        break;
      }
    }
    abstract = abstract.replace(/\s+/g, " ").trim();
    if (abstract && abstract.length > 0) {
      logger.debug(`Extracted abstract for "${title}": ${abstract.length} chars - "${abstract.substring(0, 60)}${abstract.length > 60 ? "..." : ""}"`);
    } else {
      logger.warn(`No abstract extracted for paper: ${title}. Content preview: ${paperContent.substring(0, 200)}...`);
    }
    let link = "";
    const linkMatch = paperContent.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
    if (linkMatch) {
      link = linkMatch[1];
    }
    let authors = [];
    const authorMatch = paperContent.match(/<[^>]*class="[^"]*author[^"]*"[^>]*>([^<]*)<\/[^>]*>/gi);
    if (authorMatch) {
      authors = authorMatch.map((match) => match.replace(/<[^>]*>/g, "").trim()).filter((a) => a);
    }
    return {
      title,
      abstract,
      link,
      authors
    };
  } catch (error) {
    logger.error("Error parsing HuggingFace paper content:", error);
    return null;
  }
}
__name(parseHuggingfacePaperContent, "parseHuggingfacePaperContent");
function extractPapersFromModernStructure(htmlContent) {
  const papers = [];
  try {
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdRegex.exec(htmlContent)) !== null) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData["@type"] === "ItemList" && jsonData.itemListElement) {
          jsonData.itemListElement.forEach((item) => {
            if (item.item && item.item.name) {
              papers.push({
                title: item.item.name,
                abstract: item.item.description || "",
                link: item.item.url || ""
              });
            }
          });
        }
      } catch (e) {
      }
    }
  } catch (error) {
    logger.debug("JSON-LD parsing failed:", error.message);
  }
  const metaTags = htmlContent.match(/<meta[^>]*>/gi) || [];
  let currentPaper = null;
  for (const tag of metaTags) {
    const nameMatch = tag.match(/name="([^"]*)"/);
    const contentMatch = tag.match(/content="([^"]*)"/);
    if (nameMatch && contentMatch) {
      const name = nameMatch[1];
      const content = contentMatch[1];
      if (name.includes("title") || name.includes("og:title")) {
        if (currentPaper && currentPaper.title) {
          papers.push(currentPaper);
        }
        currentPaper = { title: content, abstract: "", link: "" };
      } else if (currentPaper && name.includes("description")) {
        currentPaper.abstract = content;
      }
    }
  }
  if (currentPaper && currentPaper.title) {
    papers.push(currentPaper);
  }
  const headingRegex = /<h[1-6][^>]*>([^<]*)<\/h[1-6]>/gi;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(htmlContent)) !== null) {
    const title = headingMatch[1].trim();
    if (title.length > 10 && !title.includes("Menu") && !title.includes("Footer")) {
      papers.push({
        title,
        abstract: "",
        link: ""
      });
    }
  }
  const uniquePapers = [];
  const seenTitles = /* @__PURE__ */ new Set();
  for (const paper of papers) {
    if (paper.title && paper.title.length > 5 && !seenTitles.has(paper.title)) {
      seenTitles.add(paper.title);
      uniquePapers.push(paper);
    }
  }
  return uniquePapers;
}
__name(extractPapersFromModernStructure, "extractPapersFromModernStructure");
function parseHuggingFaceAPIResponse(apiData) {
  const papers = [];
  try {
    const papersData = Array.isArray(apiData) ? apiData : apiData.papers || [];
    for (const paperData of papersData) {
      try {
        const paper = {
          id: `hf_${paperData.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: paperData.title || "",
          abstract: paperData.summary || paperData.abstract || "",
          authors: paperData.authors || [],
          published: paperData.publishedAt || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          updated: paperData.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
          category: inferCategoryFromHF(paperData),
          source: "huggingface",
          original_source: "huggingface_api",
          // 明确标记API来源
          url: paperData.url || `https://huggingface.co/papers/${paperData.id}`,
          pdf_url: paperData.pdfUrl || "",
          scraped_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (paper.title) {
          papers.push(paper);
        }
      } catch (error) {
        logger.warn("Failed to parse HuggingFace API paper:", error);
      }
    }
    logger.info(`Successfully parsed ${papers.length} papers from HuggingFace API`);
    return papers;
  } catch (error) {
    logger.error("Failed to parse HuggingFace API response:", error);
    return [];
  }
}
__name(parseHuggingFaceAPIResponse, "parseHuggingFaceAPIResponse");
function parseHuggingFaceDatasets(datasetsData) {
  const papers = [];
  try {
    const datasets = Array.isArray(datasetsData) ? datasetsData : [];
    for (const dataset of datasets) {
      try {
        if (dataset.description && dataset.description.length > 100 && dataset.tags && dataset.tags.includes("arxiv")) {
          const paper = {
            id: `hf_dataset_${dataset.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: dataset.title || dataset.id || "Untitled Dataset",
            abstract: dataset.description || "",
            authors: dataset.author ? [dataset.author] : [],
            published: dataset.lastModified || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            updated: dataset.lastModified || (/* @__PURE__ */ new Date()).toISOString(),
            category: inferCategoryFromText(dataset.description || ""),
            source: "huggingface",
            original_source: "huggingface_datasets",
            // 明确标记数据集来源
            url: `https://huggingface.co/datasets/${dataset.id}`,
            pdf_url: "",
            scraped_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          if (paper.title && paper.abstract && paper.abstract.length > 10) {
            papers.push(paper);
          } else if (paper.title) {
            logger.debug(`Accepting paper with short abstract (${paper.abstract?.length || 0} chars): ${paper.title}`);
            papers.push(paper);
          }
        }
      } catch (error) {
        logger.warn("Failed to parse HuggingFace dataset:", error);
      }
    }
    logger.info(`Successfully parsed ${papers.length} papers from HuggingFace datasets`);
    return papers;
  } catch (error) {
    logger.error("Failed to parse HuggingFace datasets response:", error);
    return [];
  }
}
__name(parseHuggingFaceDatasets, "parseHuggingFaceDatasets");
function inferCategoryFromText(text) {
  const textLower = text.toLowerCase();
  if (textLower.includes("vision") || textLower.includes("image") || textLower.includes("visual") || textLower.includes("cv")) {
    return "computer_vision";
  } else if (textLower.includes("nlp") || textLower.includes("language") || textLower.includes("text") || textLower.includes("transformer")) {
    return "natural_language_processing";
  } else if (textLower.includes("reinforcement") || textLower.includes("rl") || textLower.includes("agent") || textLower.includes("policy")) {
    return "reinforcement_learning";
  } else if (textLower.includes("multimodal") || textLower.includes("multi-modal")) {
    return "multimodal_learning";
  } else {
    return "machine_learning";
  }
}
__name(inferCategoryFromText, "inferCategoryFromText");
function inferCategoryFromHF(paperData) {
  const text = `${paperData.title || ""} ${paperData.summary || ""} ${JSON.stringify(paperData.tags || [])}`.toLowerCase();
  if (text.includes("vision") || text.includes("image") || text.includes("visual") || text.includes("cv")) {
    return "computer_vision";
  } else if (text.includes("nlp") || text.includes("language") || text.includes("text") || text.includes("transformer")) {
    return "natural_language_processing";
  } else if (text.includes("reinforcement") || text.includes("rl") || text.includes("agent") || text.includes("policy")) {
    return "reinforcement_learning";
  } else if (text.includes("multimodal") || text.includes("multi-modal")) {
    return "multimodal_learning";
  } else {
    return "machine_learning";
  }
}
__name(inferCategoryFromHF, "inferCategoryFromHF");
async function generateFallbackHuggingFacePapers(maxPapers = 5) {
  const trendingTopics = [
    {
      title: "Multimodal Foundation Models: Recent Advances in Vision-Language Understanding",
      abstract: "This paper surveys recent developments in multimodal foundation models that integrate vision and language understanding. We examine state-of-the-art architectures, training methodologies, and applications across various domains including image captioning, visual question answering, and multimodal reasoning tasks.",
      category: "multimodal_learning",
      keywords: ["multimodal", "foundation models", "vision-language", "transformers"]
    },
    {
      title: "Efficient Diffusion Models for High-Resolution Image Generation",
      abstract: "We present novel techniques for accelerating diffusion models while maintaining high-quality image generation. Our approach combines architectural improvements with advanced sampling strategies to achieve significant speedup in inference time without compromising output quality.",
      category: "generative_models",
      keywords: ["diffusion models", "image generation", "efficiency", "sampling"]
    },
    {
      title: "Large Language Models for Code Generation: A Comprehensive Analysis",
      abstract: "This work provides an extensive evaluation of large language models on code generation tasks. We analyze performance across multiple programming languages and propose new benchmarks for assessing code quality, correctness, and efficiency.",
      category: "natural_language_processing",
      keywords: ["large language models", "code generation", "programming", "evaluation"]
    },
    {
      title: "Reinforcement Learning with Human Feedback: Scaling to Complex Tasks",
      abstract: "We explore methods for scaling reinforcement learning with human feedback to increasingly complex tasks. Our framework incorporates novel reward modeling techniques and demonstrates superior performance on challenging multi-step reasoning problems.",
      category: "reinforcement_learning",
      keywords: ["reinforcement learning", "human feedback", "reward modeling", "reasoning"]
    },
    {
      title: "Vision Transformers for Medical Image Analysis: Challenges and Opportunities",
      abstract: "This survey examines the application of vision transformers to medical imaging tasks. We discuss architectural adaptations, training strategies for limited data scenarios, and regulatory considerations for clinical deployment.",
      category: "computer_vision",
      keywords: ["vision transformers", "medical imaging", "healthcare", "clinical AI"]
    }
  ];
  const fallbackPapers = [];
  const selectedTopics = trendingTopics.slice(0, Math.min(maxPapers, trendingTopics.length));
  for (let i = 0; i < selectedTopics.length; i++) {
    const topic = selectedTopics[i];
    const paper = {
      id: `hf_fallback_${Date.now()}_${i}`,
      title: topic.title,
      abstract: topic.abstract,
      authors: ["AI Research Community"],
      published: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      updated: (/* @__PURE__ */ new Date()).toISOString(),
      category: topic.category,
      source: "huggingface",
      original_source: "huggingface_fallback",
      // Mark as fallback
      url: `https://huggingface.co/papers/trending-${i + 1}`,
      pdf_url: "",
      scraped_at: (/* @__PURE__ */ new Date()).toISOString(),
      keywords: topic.keywords,
      is_fallback: true
      // Clear indicator this is a fallback paper
    };
    fallbackPapers.push(paper);
  }
  return fallbackPapers;
}
__name(generateFallbackHuggingFacePapers, "generateFallbackHuggingFacePapers");
function removeDuplicatePapers(papers) {
  if (!papers || !Array.isArray(papers)) {
    logger.warn("Invalid papers array provided to removeDuplicatePapers, returning empty array");
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const uniquePapers = [];
  for (const paper of papers) {
    try {
      if (!paper || !paper.title) {
        logger.warn("Skipping invalid paper object:", paper);
        continue;
      }
      const titleHash = paper.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seen.has(titleHash)) {
        seen.add(titleHash);
        uniquePapers.push(paper);
      } else {
        logger.debug(`Removed duplicate paper: ${paper.title}`);
      }
    } catch (error) {
      logger.warn("Error processing paper during duplicate removal:", error);
      continue;
    }
  }
  return uniquePapers;
}
__name(removeDuplicatePapers, "removeDuplicatePapers");

// worker-modules/src/paper-analyzer.js
init_checked_fetch();
init_modules_watch_stub();
init_config();
init_utils();
var logger2 = {
  info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[ANALYZER] ${msg}`, data), "info"),
  debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[ANALYZER] ${msg}`, data), "debug"),
  warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[ANALYZER] ${msg}`, data), "warn"),
  error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[ANALYZER] ${msg}`, data), "error")
};
function createTitleOnlyPrompt(paper) {
  return `You are an expert AI researcher specializing in related fields.

**IMPORTANT:** This paper only has a title and authors available, but no abstract. Please provide the best possible analysis based on the title and research context.

**Paper Title:** ${paper.title}
**Authors:** ${paper.authors ? paper.authors.join(", ") : "Unknown"}
**Published:** ${paper.published || "Unknown"}

Since no abstract is available, please provide analysis based on:
1. The title's key concepts and terminology
2. The authors' likely research area based on names and affiliations (if recognizable)
3. Current trends and challenges in the implied research field
4. Your expertise about similar research directions

Generate 5 distinct text blocks in English. Use formatting suitable for Twitter (e.g., line breaks for readability, relevant emojis strategically).

### Required Sections (Max 280 characters EACH):

1. \u{1F680} Introduction (Hook & Core Idea):
   * Start with a strong hook based on the title's implications.
   * State what the research likely addresses based on terminology.
   * Hint at the potential impact or applications.

2. \u{1F3AF} Challenges (The Problems Solved):
   * List 2-3 key problems this research likely addresses based on the title.
   * Focus on common challenges in this research area.

3. \u2728 Innovations (The Novel Solution):
   * List potential novel approaches or methods suggested by the title.
   * Highlight what makes this direction innovative or unique.

4. \u{1F4CA} Experiment (Likely Proof & Validation):
   * Describe what kind of experiments or validation would typically be used.
   * Mention expected metrics or benchmarks for this type of research.

5. \u{1F914} Insights (Implications & Future Directions):
   * Discuss potential broader implications of this research direction.
   * Suggest future work or applications that could follow from this research.

**IMPORTANT: You MUST provide complete Chinese translations for ALL sections. The Chinese translations should be accurate, natural, and suitable for Chinese-speaking AI researchers and enthusiasts. Use proper Simplified Chinese. Do not translate emojis or section numbers.**

**Format your response as a valid JSON object:**
{
  "introduction": "\u{1F680} English introduction text...",
  "challenges": "\u{1F3AF} English challenges text...",
  "innovations": "\u2728 English innovations text...",
  "experiments": "\u{1F4CA} English experiments text...",
  "insights": "\u{1F914} English insights text...",
  "keywords": ["term1", "term2", ...],
  "category": "one_of_topic_categories",
  "relevance_score": (1-10),
  "technical_depth": "beginner|intermediate|advanced",
  "chinese_abstract": "\u{1F680}\u4E2D\u6587\u6458\u8981\uFF1A\u57FA\u4E8E\u6807\u9898\u63A8\u65AD\u7684\u4E2D\u6587\u6458\u8981...",
  "chinese_introduction": "\u{1F680}\u4E2D\u6587\u4ECB\u7ECD\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u4ECB\u7ECD...",
  "chinese_challenges": "\u{1F3AF}\u4E2D\u6587\u6311\u6218\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u6311\u6218\u63CF\u8FF0...",
  "chinese_innovations": "\u2728\u4E2D\u6587\u521B\u65B0\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u521B\u65B0\u63CF\u8FF0...",
  "chinese_experiments": "\u{1F4CA}\u4E2D\u6587\u5B9E\u9A8C\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u5B9E\u9A8C\u63CF\u8FF0...",
  "chinese_insights": "\u{1F914}\u4E2D\u6587\u89C1\u89E3\uFF1A\u5B8C\u6574\u7684\u4E2D\u6587\u89C1\u89E3\u63CF\u8FF0..."
}`;
}
__name(createTitleOnlyPrompt, "createTitleOnlyPrompt");
async function analyzePapers(papers, apiKey) {
  if (!apiKey) {
    throw new AppError("OpenRouter API key is required for paper analysis");
  }
  if (!papers || papers.length === 0) {
    logger2.warn("No papers to analyze");
    return [];
  }
  logger2.info(`Starting analysis of ${papers.length} papers`);
  const analyzedPapers = [];
  const BATCH_SIZE = 3;
  for (let i = 0; i < papers.length; i += BATCH_SIZE) {
    const batch = papers.slice(i, i + BATCH_SIZE);
    const batchStartIndex = i + 1;
    const batchEndIndex = Math.min(i + BATCH_SIZE, papers.length);
    logger2.info(`Processing batch ${Math.ceil(i / BATCH_SIZE) + 1}: papers ${batchStartIndex}-${batchEndIndex}`);
    const batchPromises = batch.map(async (paper, batchIndex) => {
      const paperIndex = i + batchIndex + 1;
      try {
        logger2.info(`Analyzing paper ${paperIndex}/${papers.length}: ${paper.title.substring(0, 50)}...`);
        const analyzedPaper = await analyzeSinglePaper(paper, apiKey);
        if (analyzedPaper) {
          logger2.info(`Successfully analyzed paper ${paperIndex}/${papers.length}`);
          return analyzedPaper;
        }
        return null;
      } catch (error) {
        logger2.error(`Failed to analyze paper ${paperIndex}/${papers.length}:`, {
          error: error.message,
          title: paper.title
        });
        return createFallbackAnalysis(paper);
      }
    });
    const batchResults = await Promise.allSettled(batchPromises);
    batchResults.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        analyzedPapers.push(result.value);
      } else {
        logger2.error(`Paper ${i + index + 1} failed or returned null`);
      }
    });
    if (i + BATCH_SIZE < papers.length) {
      const delay = Math.min(1e3 + Math.ceil(i / BATCH_SIZE) * 200, 3e3);
      logger2.debug(`Waiting ${delay}ms before next batch...`);
      await sleep(delay);
    }
  }
  logger2.info(`Successfully analyzed ${analyzedPapers.length} papers`);
  return analyzedPapers;
}
__name(analyzePapers, "analyzePapers");
async function analyzeSinglePaper(paper, apiKey) {
  try {
    logger2.debug(`Analyzing paper: ${paper.title}`);
    if (paper.analysis && paper.analysis.summary) {
      logger2.debug(`Paper ${paper.id} already has analysis, skipping`);
      return paper;
    }
    let prompt;
    let isTitleOnlyAnalysis = false;
    if (!paper.abstract || paper.abstract.trim().length < 50) {
      logger2.info(`Paper ${paper.title} has no abstract or abstract too short, using title-only analysis`);
      prompt = createTitleOnlyPrompt(paper);
      isTitleOnlyAnalysis = true;
    } else {
      prompt = PAPER_ANALYSIS_PROMPT.replace("{title}", paper.title).replace("{authors}", paper.authors ? paper.authors.join(", ") : "Unknown").replace("{abstract}", paper.abstract).replace("{published}", paper.published || "Unknown");
    }
    let analysisResult = null;
    let modelUsed = MODEL_CONFIG.analysis;
    try {
      analysisResult = await callLLM(prompt, MODEL_CONFIG.analysis, MODEL_PARAMS.analysis, apiKey);
      logger2.debug(`Primary model (${MODEL_CONFIG.analysis}) succeeded`);
    } catch (primaryError) {
      logger2.warn(`Primary model failed, trying fallback:`, primaryError.message);
      try {
        analysisResult = await callLLM(prompt, MODEL_CONFIG.fallback_analysis, MODEL_PARAMS.analysis, apiKey);
        modelUsed = MODEL_CONFIG.fallback_analysis;
        logger2.debug(`Fallback model (${MODEL_CONFIG.fallback_analysis}) succeeded`);
      } catch (fallbackError) {
        logger2.error(`Both models failed for paper ${paper.title}:`, fallbackError);
        throw new AppError(`Failed to analyze paper with both models: ${fallbackError.message}`);
      }
    }
    const analysis = await parseAnalysisResponse(analysisResult, apiKey);
    if (isTitleOnlyAnalysis) {
      analysis.title_only_analysis = true;
      logger2.debug(`Used title-only analysis for paper: ${paper.title}`);
    }
    const analyzedPaper = {
      ...paper,
      analysis: {
        ...analysis,
        analyzed_at: (/* @__PURE__ */ new Date()).toISOString(),
        model: modelUsed
      }
    };
    logger2.debug(`Successfully analyzed paper: ${paper.title}`);
    return analyzedPaper;
  } catch (error) {
    logger2.error(`Failed to analyze paper ${paper.title}:`, error);
    throw error;
  }
}
__name(analyzeSinglePaper, "analyzeSinglePaper");
async function callLLM(prompt, model, params, apiKey) {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": "https://paperdog.org",
    "X-Title": "PaperDog"
  };
  const requestBody = {
    model,
    messages: [
      {
        role: "system",
        content: "You are an expert AI research analyst specializing in computer vision and machine learning. Provide detailed, accurate analysis of research papers."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: params.temperature || 0.3,
    max_tokens: params.max_tokens || 1e3,
    response_format: { type: "json_object" }
  };
  const maxRetries = 3;
  const baseTimeout = 3e4;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeout = baseTimeout * attempt;
      logger2.debug(`LLM API call attempt ${attempt}/${maxRetries} with ${timeout}ms timeout`);
      const response = await fetchWithTimeout(url, timeout, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          const retryAfter = parseInt(errorText.match(/retry_after:\s*(\d+)/i)?.[1] || "30");
          logger2.warn(`Rate limited, waiting ${retryAfter}s before retry...`);
          if (attempt < maxRetries) {
            await sleep(retryAfter * 1e3);
            continue;
          }
        }
        throw new AppError(`LLM API error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new AppError("Invalid LLM response format");
      }
      const content = data.choices[0].message.content;
      if (!content) {
        throw new AppError("Empty LLM response");
      }
      logger2.debug(`LLM API call succeeded on attempt ${attempt}`);
      return content;
    } catch (error) {
      logger2.warn(`LLM API call failed on attempt ${attempt}:`, error.message);
      if (attempt === maxRetries) {
        logger2.error("All LLM API call attempts failed:", error);
        throw new AppError(`Failed to call LLM API after ${maxRetries} attempts: ${error.message}`);
      }
      const retryDelay = Math.min(2e3 * (attempt * attempt), 18e3);
      logger2.debug(`Waiting ${retryDelay}ms before retry...`);
      await sleep(retryDelay);
    }
  }
}
__name(callLLM, "callLLM");
function normalizeCategory(category) {
  if (!category || typeof category !== "string") {
    return "machine_learning";
  }
  return category.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}
__name(normalizeCategory, "normalizeCategory");
async function parseAnalysisResponse(response, apiKey) {
  try {
    logger2.debug(`Raw response received (${response.length} chars)`);
    logger2.debug(`Response preview: ${response.substring(0, 200)}...`);
    let cleanResponse = response.trim();
    cleanResponse = cleanResponse.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }
    logger2.debug(`Attempting to parse cleaned JSON response (${cleanResponse.length} chars)`);
    let parsed;
    try {
      parsed = JSON.parse(cleanResponse);
      logger2.debug("Direct JSON parsing successful");
    } catch (parseError) {
      logger2.warn(`Primary JSON parse failed, attempting recovery: ${parseError.message}`);
      try {
        let recoveredResponse = cleanResponse.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/:\s*,/g, ": null,").replace(/:\s*}/g, ": null}").replace(/\r\n/g, "\\n").replace(/\n/g, "\\n");
        parsed = JSON.parse(recoveredResponse);
        logger2.info("Recovery Strategy 1 successful: Basic JSON fixes");
      } catch (recoveryError1) {
        logger2.debug(`Recovery Strategy 1 failed: ${recoveryError1.message}`);
        try {
          let recoveredResponse = cleanResponse;
          recoveredResponse = recoveredResponse.replace(/:\s*"([^"]*)"([^",\}\]]*?)"/g, ': "$1\\"$2\\"$3"').replace(/:\s*"([^"]*)"([^",\}\]]*?)"/g, ': "$1\\"$2\\"$3"');
          recoveredResponse = recoveredResponse.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\r\n/g, "\\n").replace(/\n/g, "\\n");
          parsed = JSON.parse(recoveredResponse);
          logger2.info("Recovery Strategy 2 successful: Quote escaping fixes");
        } catch (recoveryError2) {
          logger2.debug(`Recovery Strategy 2 failed: ${recoveryError2.message}`);
          try {
            const fieldPatterns = {
              introduction: /"introduction":\s*"([^"]*(?:\\.[^"]*)*)"/,
              challenges: /"challenges":\s*"([^"]*(?:\\.[^"]*)*)"/,
              innovations: /"innovations":\s*"([^"]*(?:\\.[^"]*)*)"/,
              experiments: /"experiments":\s*"([^"]*(?:\\.[^"]*)*)"/,
              insights: /"insights":\s*"([^"]*(?:\\.[^"]*)*)"/,
              keywords: /"keywords":\s*(\[.*?\])/,
              category: /"category":\s*"([^"]*)"/,
              relevance_score: /"relevance_score":\s*(\d+)/,
              technical_depth: /"technical_depth":\s*"([^"]*)"/
            };
            parsed = {};
            for (const [field, pattern] of Object.entries(fieldPatterns)) {
              const match = cleanResponse.match(pattern);
              if (match) {
                if (field === "keywords") {
                  try {
                    parsed[field] = JSON.parse(match[1]);
                  } catch {
                    parsed[field] = [];
                  }
                } else if (field === "relevance_score") {
                  parsed[field] = parseInt(match[1]);
                } else {
                  parsed[field] = match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");
                }
              }
            }
            if (parsed.introduction && parsed.challenges) {
              logger2.info("Recovery Strategy 3 successful: Manual reconstruction");
            } else {
              throw new Error("Essential fields missing after reconstruction");
            }
          } catch (recoveryError3) {
            logger2.error(`All recovery strategies failed`);
            logger2.debug(`Problematic response: ${cleanResponse.substring(0, 1e3)}...`);
            throw new AppError(`Unable to parse JSON response after all recovery attempts: ${parseError.message}`);
          }
        }
      }
    }
    const requiredFields = ["introduction", "challenges", "innovations", "experiments", "insights", "keywords", "category"];
    let missingCriticalFields = [];
    for (const field of requiredFields) {
      if (!parsed[field] || typeof parsed[field] === "string" && parsed[field].trim() === "") {
        logger2.warn(`Missing field in analysis: ${field}`);
        if (["introduction", "challenges", "innovations", "experiments", "insights"].includes(field)) {
          missingCriticalFields.push(field);
        }
        parsed[field] = field === "keywords" ? [] : "Not provided";
      }
    }
    if (missingCriticalFields.length > 2) {
      logger2.warn(`Incomplete analysis response - missing ${missingCriticalFields.length} critical fields: ${missingCriticalFields.join(", ")}`);
      const availableIntro = parsed.introduction && parsed.introduction !== "Not provided" ? parsed.introduction : "";
      const availableChallenges = parsed.challenges && parsed.challenges !== "Not provided" ? parsed.challenges : "";
      if (availableIntro || availableChallenges) {
        logger2.info("Creating enhanced fallback from available partial analysis");
        const combinedText = `${availableIntro} ${availableChallenges}`.toLowerCase();
        if (parsed.innovations === "Not provided") {
          parsed.innovations = combinedText.includes("new") || combinedText.includes("novel") || combinedText.includes("approach") ? "\u2728 Introduces novel methodologies and approaches for enhanced performance." : "\u2728 Not specified in the paper.";
        }
        if (parsed.experiments === "Not provided") {
          parsed.experiments = combinedText.includes("result") || combinedText.includes("experiment") || combinedText.includes("performance") ? "\u{1F4CA} Demonstrates significant improvements over existing methods through comprehensive experiments." : "\u{1F4CA} Not specified in the paper.";
        }
        if (parsed.insights === "Not provided") {
          parsed.insights = combinedText.includes("future") || combinedText.includes("potential") || combinedText.includes("impact") ? "\u{1F914} Opens new directions for research and practical applications in the field." : "\u{1F914} Not specified in the paper.";
        }
        if (parsed.keywords.length === 0) {
          const keywordPatterns = [
            /transformer|attention|neural|network|deep learning|machine learning|ai|model|algorithm|approach|method|framework|architecture|system/g
          ];
          const foundKeywords = /* @__PURE__ */ new Set();
          keywordPatterns.forEach((pattern) => {
            const matches = combinedText.match(pattern);
            if (matches) matches.forEach((match) => foundKeywords.add(match));
          });
          parsed.keywords = Array.from(foundKeywords).slice(0, 5);
        }
        if (parsed.category === "Not provided" || parsed.category === "not_provided") {
          if (combinedText.includes("vision") || combinedText.includes("image") || combinedText.includes("visual")) {
            parsed.category = "computer_vision";
          } else if (combinedText.includes("language") || combinedText.includes("nlp") || combinedText.includes("text")) {
            parsed.category = "natural_language_processing";
          } else if (combinedText.includes("reinforcement") || combinedText.includes("rl") || combinedText.includes("agent")) {
            parsed.category = "reinforcement_learning";
          } else {
            parsed.category = "machine_learning";
          }
        }
      }
    }
    const chineseFields = ["chinese_abstract", "chinese_introduction", "chinese_challenges", "chinese_innovations", "chinese_experiments", "chinese_insights"];
    for (const field of chineseFields) {
      if (!parsed[field] || parsed[field].trim() === "") {
        logger2.warn(`Missing Chinese field in analysis: ${field}, will generate fallback.`);
        parsed[field] = "";
      }
    }
    await applyFallbackTranslations(parsed, apiKey);
    parsed.category = normalizeCategory(parsed.category);
    if (!TOPIC_CATEGORIES.includes(parsed.category)) {
      logger2.warn(`Invalid category: ${parsed.category}, defaulting to 'machine_learning'`);
      parsed.category = "machine_learning";
    }
    if (!Array.isArray(parsed.keywords)) {
      parsed.keywords = typeof parsed.keywords === "string" ? parsed.keywords.split(",").map((k) => k.trim()).filter((k) => k) : [];
    }
    if (typeof parsed.relevance_score !== "number" || parsed.relevance_score < 1 || parsed.relevance_score > 10) {
      logger2.warn(`Invalid relevance score: ${parsed.relevance_score}, defaulting to 5`);
      parsed.relevance_score = 5;
    }
    parsed.summary = generateSummary(parsed);
    logger2.debug("Successfully parsed and validated analysis response");
    return parsed;
  } catch (error) {
    logger2.error("Failed to parse analysis response:", error);
    throw new AppError(`Failed to parse analysis: ${error.message}`);
  }
}
__name(parseAnalysisResponse, "parseAnalysisResponse");
async function applyFallbackTranslations(analysis, apiKey) {
  const translationPairs = [
    { english: "abstract", chinese: "chinese_abstract", promptKey: "abstract" },
    { english: "introduction", chinese: "chinese_introduction", promptKey: "introduction" },
    { english: "challenges", chinese: "chinese_challenges", promptKey: "challenges" },
    { english: "innovations", chinese: "chinese_innovations", promptKey: "innovations" },
    { english: "experiments", chinese: "chinese_experiments", promptKey: "experiments" },
    { english: "insights", chinese: "chinese_insights", promptKey: "insights" }
  ];
  const translationsNeeded = translationPairs.filter(
    (pair) => !analysis[pair.chinese] || analysis[pair.chinese].trim() === "" || analysis[pair.chinese].trim() === "Not specified in the paper."
  );
  if (translationsNeeded.length === 0) {
    logger2.debug("All Chinese translations are present, no fallback needed");
    return;
  }
  logger2.info(`Applying fallback translations for ${translationsNeeded.length} fields`);
  const translationPromises = translationsNeeded.map(async (pair) => {
    const englishContent = analysis[pair.english];
    if (!englishContent || englishContent.trim() === "" || englishContent.trim() === "Not provided") {
      analysis[pair.chinese] = "\u82F1\u6587\u5185\u5BB9\u4E0D\u53EF\u7528 / English content not available";
      return { field: pair.chinese, success: true };
    }
    try {
      const translationPrompt = `\u8BF7\u5C06\u4EE5\u4E0B\u82F1\u6587\u5185\u5BB9\u7FFB\u8BD1\u6210\u7B80\u4F53\u4E2D\u6587\u3002\u7FFB\u8BD1\u5FC5\u987B\u51C6\u786E\u3001\u81EA\u7136\uFF0C\u9002\u5408AI\u7814\u7A76\u8005\u548C\u7231\u597D\u8005\u9605\u8BFB\u3002\u4FDD\u6301\u6280\u672F\u672F\u8BED\u7684\u4E13\u4E1A\u6027\uFF0C\u4F46\u89E3\u91CA\u590D\u6742\u6982\u5FF5\u65F6\u4F7F\u7528\u901A\u4FD7\u6613\u61C2\u7684\u8BED\u8A00\u3002

\u82F1\u6587\u5185\u5BB9\uFF08${pair.promptKey}\uFF09\uFF1A
${englishContent}

\u8BF7\u53EA\u8FD4\u56DE\u7FFB\u8BD1\u540E\u7684\u4E2D\u6587\u6587\u672C\uFF0C\u4E0D\u8981\u6DFB\u52A0\u4EFB\u4F55\u989D\u5916\u8BF4\u660E\u6216\u683C\u5F0F\u3002`;
      const translatedContent = await callLLM(translationPrompt, MODEL_CONFIG.translation, MODEL_PARAMS.translation, apiKey);
      let cleanTranslation = translatedContent.trim();
      if (cleanTranslation.startsWith("```")) {
        cleanTranslation = cleanTranslation.replace(/```[\w]*\n?/, "").replace(/\n?```$/, "");
      }
      analysis[pair.chinese] = cleanTranslation;
      logger2.debug(`Successfully translated ${pair.promptKey} to Chinese`);
      return { field: pair.chinese, success: true };
    } catch (translationError) {
      logger2.warn(`Failed to translate ${pair.promptKey}:`, translationError.message);
      analysis[pair.chinese] = `\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u82F1\u6587\u539F\u6587 / Translation failed, please see English original`;
      return { field: pair.chinese, success: false, error: translationError.message };
    }
  });
  const translationResults = await Promise.allSettled(translationPromises);
  const successfulTranslations = translationResults.filter(
    (r) => r.status === "fulfilled" && r.value?.success
  ).length;
  logger2.info(`Completed ${successfulTranslations}/${translationsNeeded.length} translations`);
  if (translationsNeeded.length > 0) {
    await sleep(200);
  }
  logger2.info("Fallback translations completed");
}
__name(applyFallbackTranslations, "applyFallbackTranslations");
function generateSummary(analysis) {
  const sections = [
    { title: "Introduction", content: analysis.introduction },
    { title: "Challenges", content: analysis.challenges },
    { title: "Innovations", content: analysis.innovations },
    { title: "Experiments", content: analysis.experiments },
    { title: "Insights", content: analysis.insights }
  ];
  let summary = "";
  let totalLength = 0;
  const maxLength = 500;
  for (const section of sections) {
    const sectionText = section.content.trim();
    if (sectionText && sectionText !== "Not provided") {
      if (totalLength + sectionText.length + 50 <= maxLength) {
        summary += `**${section.title}:** ${sectionText}

`;
        totalLength += sectionText.length + 50;
      } else {
        const remainingSpace = maxLength - totalLength - 50;
        if (remainingSpace > 50) {
          summary += `**${section.title}:** ${sectionText.substring(0, remainingSpace)}...

`;
        }
        break;
      }
    }
  }
  return summary.trim() || "Analysis not available";
}
__name(generateSummary, "generateSummary");
function createFallbackAnalysis(paper) {
  const hasAbstract = paper.abstract && paper.abstract.trim().length > 50;
  return {
    ...paper,
    analysis: {
      introduction: `\u{1F680} ${paper.title} - ${hasAbstract ? "Research analysis" : "Title-based analysis available"} - Analysis temporarily unavailable due to processing error.`,
      challenges: "\u{1F3AF} Challenges information unavailable due to processing error.",
      innovations: "\u2728 Innovation details unavailable due to processing error.",
      experiments: "\u{1F4CA} Experimental results unavailable due to processing error.",
      insights: "\u{1F914} Research insights unavailable due to processing error.",
      summary: hasAbstract ? `Abstract: ${paper.abstract.substring(0, 300)}...` : `Title: ${paper.title} - Full analysis temporarily unavailable.`,
      keywords: extractKeywords2(paper),
      category: inferCategory(paper),
      relevance_score: 5,
      technical_depth: "unknown",
      analyzed_at: (/* @__PURE__ */ new Date()).toISOString(),
      model: "fallback",
      error: true,
      title_only_analysis: !hasAbstract
    }
  };
}
__name(createFallbackAnalysis, "createFallbackAnalysis");
function extractKeywords2(paper) {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  const keywords = [];
  const aiTerms = [
    "neural network",
    "deep learning",
    "machine learning",
    "computer vision",
    "natural language processing",
    "transformer",
    "attention",
    "gpt",
    "bert",
    "diffusion model",
    "generative ai",
    "reinforcement learning",
    "cnn",
    "rnn",
    "lstm",
    "gradient descent",
    "backpropagation",
    "fine-tuning",
    "pretraining",
    "transfer learning",
    "multi-modal",
    "vision transformer",
    "segmentation",
    "detection",
    "classification",
    "regression"
  ];
  for (const term of aiTerms) {
    if (text.includes(term) && !keywords.includes(term)) {
      keywords.push(term);
      if (keywords.length >= 5) break;
    }
  }
  return keywords;
}
__name(extractKeywords2, "extractKeywords");
function inferCategory(paper) {
  const text = `${paper.title} ${paper.abstract} ${paper.category || ""}`.toLowerCase();
  if (text.includes("vision") || text.includes("image") || text.includes("visual")) {
    return "computer_vision";
  } else if (text.includes("nlp") || text.includes("language") || text.includes("text")) {
    return "natural_language_processing";
  } else if (text.includes("reinforcement") || text.includes("rl") || text.includes("agent")) {
    return "reinforcement_learning";
  } else {
    return "machine_learning";
  }
}
__name(inferCategory, "inferCategory");

// worker-modules/src/handlers.js
init_blog_generator();
init_templates();

// worker-modules/src/dual-column-templates.js
init_checked_fetch();
init_modules_watch_stub();
init_utils();
function getDualColumnHTML(papers = [], dailyReport = null, visitorStats = null) {
  const safeReportJson = JSON.stringify(dailyReport).replace(/</g, "<");
  const visitorInfo = visitorStats || { today: "0", total: "0", displayText: "Visitor stats" };
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PaperDog - AI Papers Daily Digest</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .container-fluid {
            max-width: 1600px;
        }
        
        .navbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .visitor-info {
            font-size: 0.85rem;
            line-height: 1.2;
        }

        .nav-links .btn {
            border-width: 1px;
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
            transition: all 0.3s ease;
        }

        .nav-links .btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-1px);
        }
        
        .column-content {
            min-height: 600px;
            padding: 1.5rem;
            background: #f6f8fc;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #e9ecef;
        }
        
        #paper-content, #analysis-content {
            overflow-wrap: break-word;
            word-wrap: break-word;
            font-size: 0.95em;
            line-height: 1.6;
        }
        
        #paper-content h1, #paper-content h2, #paper-content h3,
        #analysis-content h1, #analysis-content h2, #analysis-content h3 {
            font-size: 1.15em;
            margin-top: 1.2rem;
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }
        
        #paper-content table, #analysis-content table {
            width: 100%;
            table-layout: fixed;
            font-size: 0.9em;
        }
        
        #paper-content pre, #analysis-content pre,
        #paper-content code, #analysis-content code {
            font-size: 0.85em;
            overflow-x: auto;
            background: #f8f9fa;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
        }
        
        .side-panel {
            background: #f6f8fc;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
            padding: 1.5rem 1rem;
            min-height: 100%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid #e9ecef;
        }
        
        .paper-card {
            transition: box-shadow 0.2s;
            cursor: pointer;
            border: 1px solid #dee2e6;
        }
        
        .paper-card:hover {
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border-color: #667eea;
        }
        
        .paper-card.today {
            border-color: #007bff;
            background: #f8f9ff;
        }
        
        .paper-abstract {
            font-size: 0.85em;
            color: #6c757d;
            line-height: 1.4;
            max-height: 3.2em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .update-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .update-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .update-btn:disabled {
            background: #6c757d;
        }
        
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #007bff;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 10px auto;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .loading-indicator {
            display: none;
            text-align: center;
            padding: 1rem;
        }
        
        @media (max-width: 1200px) {
            .container-fluid {
                max-width: 100%;
                padding: 0 1rem;
            }
            .col-md-3, .col-md-6 {
                flex: 0 0 100%;
                max-width: 100%;
            }
            .side-panel {
                max-height: none;
                margin-top: 1rem;
            }
        }
        
        @media (max-width: 768px) {
            .column-content, .side-panel {
                padding: 1rem 0.5rem;
                min-height: unset;
            }
            .container-fluid {
                padding: 0;
            }
            .row {
                flex-direction: column;
            }
        }
        
        .score-badge {
            background: #28a745;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .category-badge {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .paper-stats {
            font-size: 0.8rem;
            color: #6c757d;
        }

        .view-count {
            font-size: 0.75rem;
            color: #6c757d;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            background: rgba(0, 123, 255, 0.05);
            padding: 0.125rem 0.375rem;
            border-radius: 8px;
            border: 1px solid rgba(0, 123, 255, 0.1);
        }

        .view-count i {
            font-size: 0.8rem;
            color: #007bff;
        }

        .view-badge {
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
            padding: 0.125rem 0.375rem;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 500;
            min-width: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center w-100">
                <div class="d-flex align-items-center">
                    <span class="navbar-brand mb-0 h1">
                        <i class="fas fa-graduation-cap me-2"></i>PaperDog
                    </span>
                    <span class="navbar-text me-4">
                        Daily AI Papers Digest
                    </span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="visitor-info me-4 text-end">
                        <div class="small text-light">
                            <i class="fas fa-users me-1"></i>
                            Today: ${visitorInfo.today} | Total: ${visitorInfo.total}
                        </div>
                        <div class="small text-light opacity-75">
                            ${visitorInfo.displayText}
                        </div>
                    </div>
                    <div class="nav-links">
                        <a href="/archive" class="btn btn-outline-light btn-sm me-2">
                            <i class="fas fa-archive me-1"></i>Archive
                        </a>
                        <a href="/about" class="btn btn-outline-light btn-sm me-2">
                            <i class="fas fa-info-circle me-1"></i>About
                        </a>
                        <a href="#" class="btn btn-outline-light btn-sm" onclick="toggleTranslation()" id="translate-btn" title="\u5207\u6362\u8BED\u8A00 / Switch Language">
                            <i class="fas fa-language me-1"></i><span id="translate-text">\u4E2D\u6587</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    
    <div class="container-fluid mt-3">
        <div class="row gx-4 gy-3">
            <div class="col-md-9">
                <div class="row">
                    <div class="col-md-6">
                        <div class="column-content">
                            <h3 class="mb-3">
                                <i class="fas fa-file-alt me-2"></i>\u8BBA\u6587\u8BE6\u60C5
                            </h3>
                            <div id="paper-content">
                                <div class="text-center text-muted py-5">
                                    <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
                                    <h5>\u9009\u62E9\u4E00\u7BC7\u8BBA\u6587</h5>
                                    <p>\u70B9\u51FB\u53F3\u4FA7\u7684\u8BBA\u6587\u5217\u8868\u67E5\u770B\u8BE6\u7EC6\u5185\u5BB9</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="column-content">
                            <h3 class="mb-3">
                                <i class="fas fa-brain me-2"></i>AI Analysis
                            </h3>
                            <div id="analysis-content">
                                <div class="text-center text-muted py-5">
                                    <i class="fas fa-robot fa-2x mb-3"></i>
                                    <h5>AI\u5206\u6790\u5185\u5BB9</h5>
                                    <p>\u9009\u62E9\u8BBA\u6587\u540E\u663E\u793AAI\u667A\u80FD\u5206\u6790\u7ED3\u679C</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="side-panel">
                    <h4 class="mb-3">
                        <i class="fas fa-list me-2"></i>\u8BBA\u6587\u5217\u8868
                    </h4>
                    <button id="update-btn" class="btn update-btn btn-primary mb-3 w-100" onclick="updatePapers()">
                        <i class="fas fa-sync-alt me-2"></i>Update Papers
                    </button>
                    <div class="loading-indicator" id="loadingIndicator">
                        <div class="spinner"></div>
                        <p class="text-muted mb-0">Updating papers...</p>
                    </div>
                    <div id="papers-list">\u52A0\u8F7D\u4E2D...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const report = ${safeReportJson};
            
            // Initialize with today's papers if available
            if (report && report.papers && report.papers.length > 0) {
                loadPapersList(report.papers);

                // Auto-select the top paper
                if (report.top_papers && report.top_papers.length > 0) {
                    loadPaperContent(report.top_papers[0]);
                }
            } else {
                // Fetch papers from API
                fetchPapers();
            }
        });
        
        async function fetchPapers() {
            const listContainer = document.getElementById('papers-list');
            const loadingIndicator = document.getElementById('loadingIndicator');

            try {
                loadingIndicator.style.display = 'block';
                listContainer.innerHTML = '';

                // Try to get papers from recent dates, starting with today
                // This ensures we get top papers from a specific date, not aggregated from multiple days
                for (let i = 0; i < 7; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];

                    try {
                        const response = await fetch('/api/papers/' + dateStr);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.papers && data.papers.length > 0) {
                                // Sort by relevance score and take top 10 for mainpage display
                                const sortedPapers = data.papers.sort((a, b) => {
                                    const scoreA = ((a.analysis && a.analysis.relevance_score) || (a.scoring && a.scoring.total_score) || 5);
                                    const scoreB = ((b.analysis && b.analysis.relevance_score) || (b.scoring && b.scoring.total_score) || 5);
                                    return scoreB - scoreA;
                                }).slice(0, 10); // Limit to top 10 papers

                                loadPapersList(sortedPapers);
                                loadingIndicator.style.display = 'none';
                                return;
                            }
                        }
                    } catch (dateError) {
                        console.warn("Failed to fetch papers for " + dateStr + ":", dateError);
                        // Continue to next date
                    }
                }

                // If no papers found in recent dates, show empty state
                listContainer.innerHTML = '<p class="text-muted">\u6682\u65E0\u8BBA\u6587\u6570\u636E</p>';
            } catch (error) {
                console.error('Error fetching papers:', error);
                listContainer.innerHTML = '<p class="text-danger">\u52A0\u8F7D\u8BBA\u6587\u51FA\u9519</p>';
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }
        
        function loadPapersList(papers) {
            const listContainer = document.getElementById('papers-list');
            
            if (papers.length === 0) {
                listContainer.innerHTML = '<p class="text-muted">\u6682\u65E0\u8BBA\u6587\u6570\u636E</p>';
                return;
            }
            
            // Sort by relevance score and date
            papers.sort((a, b) => {
                const scoreA = ((a.analysis && a.analysis.relevance_score) || (a.scoring && a.scoring.total_score) || 5);
                const scoreB = ((b.analysis && b.analysis.relevance_score) || (b.scoring && b.scoring.total_score) || 5);
                if (Math.abs(scoreA - scoreB) > 0.5) return scoreB - scoreA;
                return new Date(b.published || b.scraped_at) - new Date(a.published || a.scraped_at);
            });
            
            const papersHTML = papers.map((paper, index) => {
                const totalScore = (paper.scoring && paper.scoring.total_score) || (paper.analysis && paper.analysis.relevance_score) || 5;
                const category = (paper.analysis && paper.analysis.category) || paper.category || 'other';
                const isTopPaper = totalScore >= 7.0;
                const views = paper.views || 0;
                const viewDisplay = views > 999 ? (views / 1000).toFixed(1) + 'k' : views.toString();

                return '<div class="card paper-card mb-2" onclick="loadPaperContent(' + index + ')">' +
                    '<div class="card-body py-2 px-3">' +
                    '<div class="d-flex justify-content-between align-items-start mb-2">' +
                    '<h6 class="card-title mb-0 flex-grow-1">' +
                    (isTopPaper ? '<i class="fas fa-trophy text-warning me-1"></i>' : '') +
                    paper.title.substring(0, 60) + (paper.title.length > 60 ? '...' : '') +
                    '</h6>' +
                    '<div class="view-count">' +
                    '<i class="fas fa-eye"></i>' +
                    '<span class="view-badge">' + viewDisplay + '</span>' +
                    '</div>' +
                    '</div>' +
                    '<p class="paper-abstract mb-1">' + (paper.abstract || 'No abstract').substring(0, 80) + '...</p>' +
                    '<div class="d-flex justify-content-between align-items-center">' +
                    '<div>' +
                    '<span class="category-badge me-2">' + category.replace('_', ' ') + '</span>' +
                    '<span class="score-badge">' + totalScore.toFixed(1) + '/10</span>' +
                    '</div>' +
                    '<small class="paper-stats">' + paper.source + '</small>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }).join('');
            
            listContainer.innerHTML = papersHTML;
            
            // Store papers for content loading
            window.currentPapers = papers;
        }
        
        function loadPaperContent(index) {
            const paper = window.currentPapers[index];
            if (!paper) return;
            
            // Load paper details
            const paperContent = generatePaperDetails(paper);
            document.getElementById('paper-content').innerHTML = paperContent;
            
            // Load AI analysis
            const analysisContent = generateAIAnalysis(paper);
            document.getElementById('analysis-content').innerHTML = analysisContent;
            
            // Highlight selected paper
            document.querySelectorAll('.paper-card').forEach((card, i) => {
                if (i === index) {
                    card.classList.add('border-primary', 'bg-light');
                } else {
                    card.classList.remove('border-primary', 'bg-light');
                }
            });
        }
        
        function generatePaperDetails(paper) {
            const publishedDate = paper.published ? new Date(paper.published).toLocaleDateString() : 'Unknown';
            const authors = paper.authors ? paper.authors.slice(0, 5).join(', ') + (paper.authors.length > 5 ? ' et al.' : '') : 'Unknown authors';
            const category = (paper.analysis && paper.analysis.category) || paper.category || 'other';
            const totalScore = (paper.scoring && paper.scoring.total_score) || (paper.analysis && paper.analysis.relevance_score) || 5;
            
            let html = '<h5>' + paper.title + '</h5>';
            html += '<div class="mb-3">';
            html += '<p class="text-muted mb-1"><strong>Authors:</strong> ' + authors + '</p>';
            html += '<p class="text-muted mb-1"><strong>Published:</strong> ' + publishedDate + '</p>';
            html += '<p class="text-muted mb-1"><strong>Source:</strong> ' + paper.source + '</p>';
            html += '<p class="text-muted mb-1"><strong>Category:</strong> ' + category.replace('_', ' ') + '</p>';
            html += '<p class="text-muted mb-1"><strong>Score:</strong> <span class="badge bg-success">' + totalScore.toFixed(1) + '/10</span></p>';
            html += '</div>';
            
            if (paper.abstract) {
                html += '<h6>Abstract</h6>';
                html += '<p>' + paper.abstract + '</p>';
            }
            
            html += '<div class="mt-3">';
            html += '<a href="' + paper.url + '" target="_blank" class="btn btn-primary btn-sm me-2">';
            html += '<i class="fas fa-external-link-alt me-1"></i>View Paper</a>';
            if (paper.pdf_url) {
                html += '<a href="' + paper.pdf_url + '" target="_blank" class="btn btn-danger btn-sm">';
                html += '<i class="fas fa-file-pdf me-1"></i>PDF</a>';
            }
            html += '</div>';
            
            return html;
        }
        
        function generateAIAnalysis(paper) {
            if (!paper.analysis) {
                return '<div class="text-center text-muted py-5">' +
                    '<i class="fas fa-robot fa-2x mb-3"></i>' +
                    '<h5>No AI Analysis Available</h5>' +
                    '<p>This paper has not been analyzed by AI yet.</p>' +
                    '</div>';
            }
            
            const analysis = paper.analysis;
            let html = '';
            
            if (analysis.introduction) {
                html += '<h6>Introduction</h6>';
                html += '<p>' + analysis.introduction + '</p>';
            }
            
            if (analysis.challenges) {
                html += '<h6>Key Challenges</h6>';
                html += '<p>' + analysis.challenges + '</p>';
            }
            
            if (analysis.innovations) {
                html += '<h6>Innovations & Contributions</h6>';
                html += '<p>' + analysis.innovations + '</p>';
            }
            
            if (analysis.experiments) {
                html += '<h6>Experiments & Results</h6>';
                html += '<p>' + analysis.experiments + '</p>';
            }
            
            if (analysis.insights) {
                html += '<h6>Insights & Future Directions</h6>';
                html += '<p>' + analysis.insights + '</p>';
            }
            
            if (analysis.keywords && analysis.keywords.length > 0) {
                html += '<h6>Keywords</h6>';
                html += '<div class="mb-2">';
                analysis.keywords.forEach(keyword => {
                    html += '<span class="badge bg-secondary me-1 mb-1">' + keyword + '</span>';
                });
                html += '</div>';
            }
            
            if (analysis.relevance_score) {
                html += '<div class="mt-3 p-2 bg-light rounded">';
                html += '<strong>Relevance Score:</strong> ' + analysis.relevance_score + '/10<br>';
                html += '<strong>Technical Depth:</strong> ' + (analysis.technical_depth || 'Unknown');
                html += '</div>';
            }
            
            return html || '<p class="text-muted">No analysis details available.</p>';
        }
        
        async function updatePapers() {
            const button = document.getElementById('update-btn');
            const loadingIndicator = document.getElementById('loadingIndicator');
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
            loadingIndicator.style.display = 'block';
            
            try {
                const response = await fetch('/api/update', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    // Refresh papers list
                    await fetchPapers();
                    
                    // Show success message
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check me-2"></i>Updated!';
                    button.className = 'btn btn-success mb-3 w-100';
                    
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.className = 'btn update-btn btn-primary mb-3 w-100';
                        button.disabled = false;
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Update failed');
                }
            } catch (error) {
                console.error('Error updating papers:', error);
                
                // Show error message
                button.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Update Failed';
                button.className = 'btn btn-danger mb-3 w-100';
                
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Update Papers';
                    button.className = 'btn update-btn btn-primary mb-3 w-100';
                    button.disabled = false;
                }, 2000);
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }

        // View tracking functions
        async function trackPaperView(paperId) {
            try {
                const response = await fetch('/api/papers/' + paperId + '/view', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();

                    // Update view count in UI
                    const papers = window.currentPapers;
                    const paperIndex = papers.findIndex(p => p.id === paperId);
                    if (paperIndex !== -1) {
                        papers[paperIndex].views = result.views;
                        updateViewDisplay(paperIndex, result.views);
                    }
                }
            } catch (error) {
                console.warn('Failed to track view:', error);
                // Silent fail - don't break user experience
            }
        }

        function updateViewDisplay(paperIndex, viewCount) {
            const cards = document.querySelectorAll('.paper-card');
            const viewCountElement = cards[paperIndex].querySelector('.view-badge');
            if (viewCountElement) {
                const displayCount = viewCount > 999 ? (viewCount / 1000).toFixed(1) + 'k' : viewCount.toString();
                viewCountElement.textContent = displayCount;
            }
        }

        // Helper functions for Chinese formatting
        function formatChineseDate(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return year + '\u5E74' + month + '\u6708' + day + '\u65E5';
        }

        function getChineseSourceName(source) {
            const sourceNames = {
                'arxiv': 'arXiv\u9884\u5370\u672C',
                'huggingface': 'HuggingFace\u8BBA\u6587',
                'unknown': '\u672A\u77E5\u6765\u6E90'
            };
            return sourceNames[source] || source;
        }

        // Translation functionality
        let currentLanguage = 'en'; // Default to English

        function toggleTranslation() {
            currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';

            // Update button text with bilingual display
            const translateText = document.getElementById('translate-text');
            translateText.textContent = currentLanguage === 'en' ? '\u4E2D\u6587' : 'English';

            // Update button styling to indicate current language
            const translateBtn = document.getElementById('translate-btn');
            if (currentLanguage === 'zh') {
                translateBtn.classList.add('btn-warning');
                translateBtn.classList.remove('btn-outline-light');
            } else {
                translateBtn.classList.remove('btn-warning');
                translateBtn.classList.add('btn-outline-light');
            }

            // Reload current paper if one is selected
            if (window.currentPaperIndex !== undefined) {
                loadPaperContent(window.currentPaperIndex);
            }
        }

        function generateTranslatedPaperDetails(paper) {
            if (currentLanguage === 'zh' && paper.analysis) {
                // Use Chinese translations if available
                const publishedDate = paper.published ? formatChineseDate(paper.published) : '\u672A\u77E5';
                const authors = paper.authors ? paper.authors.slice(0, 5).join(', ') + (paper.authors.length > 5 ? ' \u7B49' : '') : '\u672A\u77E5\u4F5C\u8005';
                const category = (paper.analysis && paper.analysis.category) || paper.category || '\u5176\u4ED6';
                const totalScore = (paper.scoring && paper.scoring.total_score) || (paper.analysis && paper.analysis.relevance_score) || 5;
                const sourceDisplay = getChineseSourceName(paper.source);

                let html = '<h5>' + paper.title + '</h5>';
                html += '<div class="mb-3">';
                html += '<p class="text-muted mb-1"><strong>\u4F5C\u8005:</strong> ' + authors + '</p>';
                html += '<p class="text-muted mb-1"><strong>\u53D1\u5E03\u65E5\u671F:</strong> ' + publishedDate + '</p>';
                html += '<p class="text-muted mb-1"><strong>\u6765\u6E90:</strong> ' + sourceDisplay + '</p>';
                html += '<p class="text-muted mb-1"><strong>\u5206\u7C7B:</strong> ' + category.replace('_', ' ') + '</p>';
                html += '<p class="text-muted mb-1"><strong>\u8BC4\u5206:</strong> <span class="badge bg-success">' + totalScore.toFixed(1) + '/10</span></p>';
                html += '</div>';

                // Use Chinese abstract if available, otherwise show original with Chinese label
                if (paper.abstract) {
                    html += '<h6>\u6458\u8981 / Abstract</h6>';
                    if (paper.analysis.chinese_abstract && paper.analysis.chinese_abstract.trim() && 
                        paper.analysis.chinese_abstract !== '\u82F1\u6587\u5185\u5BB9\u4E0D\u53EF\u7528 / English content not available' &&
                        paper.analysis.chinese_abstract !== '\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u82F1\u6587\u539F\u6587 / Translation failed, please see English original') {
                        html += '<p>' + sanitizeChineseContent(paper.analysis.chinese_abstract) + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-0" role="alert">';
                        html += '<i class="fas fa-info-circle me-1"></i>\u5DF2\u63D0\u4F9B\u4E2D\u6587\u7FFB\u8BD1';
                        html += '</div>';
                    } else {
                        html += '<p>' + paper.abstract + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-0" role="alert">';
                        html += '<i class="fas fa-exclamation-triangle me-1"></i>\u6458\u8981\u4E3A\u82F1\u6587\u539F\u6587\uFF0C\u4E2D\u6587\u7FFB\u8BD1\u751F\u6210\u4E2D...';
                        html += '</div>';
                    }
                } else {
                    html += '<h6>\u6458\u8981 / Abstract</h6>';
                    html += '<p class="text-muted">\u6682\u65E0\u6458\u8981 / No abstract available</p>';
                }

                html += '<div class="mt-3">';
                html += '<a href="' + paper.url + '" target="_blank" class="btn btn-primary btn-sm me-2">';
                html += '<i class="fas fa-external-link-alt me-1"></i>\u67E5\u770B\u8BBA\u6587 / View Paper</a>';
                if (paper.pdf_url) {
                    html += '<a href="' + paper.pdf_url + '" target="_blank" class="btn btn-danger btn-sm">';
                    html += '<i class="fas fa-file-pdf me-1"></i>\u4E0B\u8F7DPDF / Download PDF</a>';
                }
                html += '</div>';

                return html;
            }

            // Default to English
            return generatePaperDetails(paper);
        }

        function generateTranslatedAIAnalysis(paper) {
            if (currentLanguage === 'zh' && paper.analysis) {
                const analysis = paper.analysis;
                let html = '';
                let hasChineseContent = false;
                let translationStatus = [];

                // Check translation status
                if (analysis.chinese_introduction && analysis.chinese_introduction.trim() && 
                    analysis.chinese_introduction !== '\u82F1\u6587\u5185\u5BB9\u4E0D\u53EF\u7528 / English content not available' &&
                    analysis.chinese_introduction !== '\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u82F1\u6587\u539F\u6587 / Translation failed, please see English original') {
                    hasChineseContent = true;
                }
                if (analysis.chinese_innovations && analysis.chinese_innovations.trim() && 
                    analysis.chinese_innovations !== '\u82F1\u6587\u5185\u5BB9\u4E0D\u53EF\u7528 / English content not available' &&
                    analysis.chinese_innovations !== '\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u82F1\u6587\u539F\u6587 / Translation failed, please see English original') {
                    hasChineseContent = true;
                }
                if (analysis.chinese_experiments && analysis.chinese_experiments.trim() && 
                    analysis.chinese_experiments !== '\u82F1\u6587\u5185\u5BB9\u4E0D\u53EF\u7528 / English content not available' &&
                    analysis.chinese_experiments !== '\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u82F1\u6587\u539F\u6587 / Translation failed, please see English original') {
                    hasChineseContent = true;
                }
                if (analysis.chinese_insights && analysis.chinese_insights.trim() && 
                    analysis.chinese_insights !== '\u82F1\u6587\u5185\u5BB9\u4E0D\u53EF\u7528 / English content not available' &&
                    analysis.chinese_insights !== '\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u82F1\u6587\u539F\u6587 / Translation failed, please see English original') {
                    hasChineseContent = true;
                }

                if (analysis.introduction) {
                    if (analysis.chinese_introduction && analysis.chinese_introduction.trim()) {
                        html += '<h6>\u4ECB\u7ECD / Introduction</h6>';
                        html += '<p>' + sanitizeChineseContent(analysis.chinese_introduction) + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u5DF2\u5B8C\u6210';
                        html += '</div>';
                    } else {
                        html += '<h6>\u4ECB\u7ECD / Introduction</h6>';
                        html += '<p>' + analysis.introduction + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u751F\u6210\u4E2D...';
                        html += '</div>';
                    }
                }

                if (analysis.challenges) {
                    if (analysis.chinese_challenges && analysis.chinese_challenges.trim()) {
                        html += '<h6>\u6311\u6218 / Challenges</h6>';
                        html += '<p>' + sanitizeChineseContent(analysis.chinese_challenges) + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u5DF2\u5B8C\u6210';
                        html += '</div>';
                    } else {
                        html += '<h6>\u6311\u6218 / Challenges</h6>';
                        html += '<p>' + analysis.challenges + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u751F\u6210\u4E2D...';
                        html += '</div>';
                    }
                }

                if (analysis.innovations) {
                    if (analysis.chinese_innovations && analysis.chinese_innovations.trim()) {
                        html += '<h6>\u521B\u65B0\u70B9 / Innovations</h6>';
                        html += '<p>' + sanitizeChineseContent(analysis.chinese_innovations) + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u5DF2\u5B8C\u6210';
                        html += '</div>';
                    } else {
                        html += '<h6>\u521B\u65B0\u70B9 / Innovations</h6>';
                        html += '<p>' + analysis.innovations + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u751F\u6210\u4E2D...';
                        html += '</div>';
                    }
                }

                if (analysis.experiments) {
                    if (analysis.chinese_experiments && analysis.chinese_experiments.trim()) {
                        html += '<h6>\u5B9E\u9A8C\u4E0E\u7ED3\u679C / Experiments & Results</h6>';
                        html += '<p>' + sanitizeChineseContent(analysis.chinese_experiments) + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u5DF2\u5B8C\u6210';
                        html += '</div>';
                    } else {
                        html += '<h6>\u5B9E\u9A8C\u4E0E\u7ED3\u679C / Experiments & Results</h6>';
                        html += '<p>' + analysis.experiments + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u751F\u6210\u4E2D...';
                        html += '</div>';
                    }
                }

                if (analysis.insights) {
                    if (analysis.chinese_insights && analysis.chinese_insights.trim()) {
                        html += '<h6>\u89C1\u89E3\u4E0E\u672A\u6765\u65B9\u5411 / Insights & Future Directions</h6>';
                        html += '<p>' + sanitizeChineseContent(analysis.chinese_insights) + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u5DF2\u5B8C\u6210';
                        html += '</div>';
                    } else {
                        html += '<h6>\u89C1\u89E3\u4E0E\u672A\u6765\u65B9\u5411 / Insights & Future Directions</h6>';
                        html += '<p>' + analysis.insights + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>\u4E2D\u6587\u7FFB\u8BD1\u751F\u6210\u4E2D...';
                        html += '</div>';
                    }
                }

                if (analysis.keywords && analysis.keywords.length > 0) {
                    html += '<h6>\u5173\u952E\u8BCD / Keywords</h6>';
                    html += '<div class="mb-2">';
                    analysis.keywords.forEach(keyword => {
                        html += '<span class="badge bg-secondary me-1 mb-1">' + keyword + '</span>';
                    });
                    html += '</div>';
                }

                if (analysis.relevance_score) {
                    html += '<div class="mt-3 p-2 bg-light rounded">';
                    html += '<strong>\u76F8\u5173\u5EA6\u8BC4\u5206 / Relevance Score:</strong> ' + analysis.relevance_score + '/10<br>';
                    html += '<strong>\u6280\u672F\u6DF1\u5EA6 / Technical Depth:</strong> ' + (analysis.technical_depth || '\u672A\u77E5');
                    html += '</div>';
                }

                // Add overall translation status
                if (hasChineseContent) {
                    html += '<div class="mt-3 p-3 bg-success bg-opacity-10 border border-success rounded">';
                    html += '<i class="fas fa-language text-success me-2"></i>';
                    html += '<strong>\u7FFB\u8BD1\u72B6\u6001:</strong> \u90E8\u5206\u6216\u5168\u90E8\u5185\u5BB9\u5DF2\u7FFB\u8BD1\u4E3A\u4E2D\u6587';
                    html += '</div>';
                } else {
                    html += '<div class="mt-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">';
                    html += '<i class="fas fa-language text-warning me-2"></i>';
                    html += '<strong>\u7FFB\u8BD1\u72B6\u6001:</strong> \u6B63\u5728\u751F\u6210\u4E2D\u6587\u7FFB\u8BD1\uFF0C\u8BF7\u7A0D\u5019\u5237\u65B0\u9875\u9762';
                    html += '</div>';
                }

                return html || '<p class="text-muted">\u6682\u65E0\u5206\u6790\u8BE6\u60C5 / No analysis details available.</p>';
            }

            // Default to English
            return generateAIAnalysis(paper);
        }

        // Override the loadPaperContent function to support translation
        window.currentPaperIndex = undefined;

        function loadPaperContent(index) {
            const paper = window.currentPapers[index];
            if (!paper) return;

            window.currentPaperIndex = index;

            // Track view when paper is selected
            if (paper.id) {
                trackPaperView(paper.id);
            }

            // Load paper details with translation
            const paperContent = generateTranslatedPaperDetails(paper);
            document.getElementById('paper-content').innerHTML = paperContent;

            // Load AI analysis with translation
            const analysisContent = generateTranslatedAIAnalysis(paper);
            document.getElementById('analysis-content').innerHTML = analysisContent;

            // Highlight selected paper
            document.querySelectorAll('.paper-card').forEach((card, i) => {
                if (i === index) {
                    card.classList.add('border-primary', 'bg-light');
                } else {
                    card.classList.remove('border-primary', 'bg-light');
                }
            });
        }
    <\/script>
</body>
</html>`;
}
__name(getDualColumnHTML, "getDualColumnHTML");

// worker-modules/src/handlers.js
init_paper_scoring();
init_archive_manager();

// worker-modules/src/visitor-counter.js
init_checked_fetch();
init_modules_watch_stub();
init_config();
var logger6 = {
  info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[VISITOR] ${msg}`, data), "info"),
  debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[VISITOR] ${msg}`, data), "debug"),
  warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[VISITOR] ${msg}`, data), "warn"),
  error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[VISITOR] ${msg}`, data), "error")
};
var VISITOR_KEYS = {
  daily: /* @__PURE__ */ __name((date) => `visitors_${date}`, "daily"),
  total: "visitors_total",
  unique: "visitors_unique",
  monthly: /* @__PURE__ */ __name((year, month) => `visitors_monthly_${year}_${month}`, "monthly"),
  ip_hash: /* @__PURE__ */ __name((ip) => `visitor_ip_${ip}`, "ip_hash")
};
function generateVisitorId(ip, userAgent) {
  const data = `${ip}:${userAgent || "unknown"}:${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
__name(generateVisitorId, "generateVisitorId");
function getCurrentDate() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
__name(getCurrentDate, "getCurrentDate");
function getCurrentMonth() {
  const date = /* @__PURE__ */ new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
__name(getCurrentMonth, "getCurrentMonth");
async function trackVisitor(request, env) {
  try {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const userAgent = request.headers.get("User-Agent") || "unknown";
    const today = getCurrentDate();
    const currentMonth = getCurrentMonth();
    const visitorId = generateVisitorId(ip, userAgent);
    logger6.info("Tracking visitor", { ip, visitorId, date: today });
    const todayVisitorKey = `${VISITOR_KEYS.ip_hash(visitorId)}_${today}`;
    const alreadyCounted = await env.PAPERS.get(todayVisitorKey);
    if (!alreadyCounted) {
      await env.PAPERS.put(todayVisitorKey, "1", {
        expirationTtl: 24 * 60 * 60
        // 24 hours
      });
      const dailyKey = VISITOR_KEYS.daily(today);
      const dailyCount = await env.PAPERS.get(dailyKey);
      const newDailyCount = (dailyCount ? parseInt(dailyCount) : 0) + 1;
      await env.PAPERS.put(dailyKey, newDailyCount.toString(), {
        expirationTtl: 7 * 24 * 60 * 60
        // Keep for 7 days
      });
      const totalKey = VISITOR_KEYS.total;
      const totalCount = await env.PAPERS.get(totalKey);
      const newTotalCount = (totalCount ? parseInt(totalCount) : 0) + 1;
      await env.PAPERS.put(totalKey, newTotalCount.toString());
      const monthlyKey = VISITOR_KEYS.monthly(currentMonth.split("-")[0], currentMonth.split("-")[1]);
      const monthlyCount = await env.PAPERS.get(monthlyKey);
      const newMonthlyCount = (monthlyCount ? parseInt(monthlyCount) : 0) + 1;
      await env.PAPERS.put(monthlyKey, newMonthlyCount.toString(), {
        expirationTtl: 32 * 24 * 60 * 60
        // Keep for ~1 month
      });
      logger6.info("New visitor counted", { visitorId, daily: newDailyCount, total: newTotalCount });
      return {
        isNewVisitor: true,
        daily: newDailyCount,
        total: newTotalCount,
        monthly: newMonthlyCount
      };
    } else {
      const dailyCount = await env.PAPERS.get(VISITOR_KEYS.daily(today)) || "0";
      const totalCount = await env.PAPERS.get(VISITOR_KEYS.total) || "0";
      const monthlyCount = await env.PAPERS.get(VISITOR_KEYS.monthly(currentMonth.split("-")[0], currentMonth.split("-")[1])) || "0";
      return {
        isNewVisitor: false,
        daily: parseInt(dailyCount),
        total: parseInt(totalCount),
        monthly: parseInt(monthlyCount)
      };
    }
  } catch (error) {
    logger6.error("Error tracking visitor:", error);
    return {
      isNewVisitor: false,
      daily: 0,
      total: 0,
      monthly: 0,
      error: error.message
    };
  }
}
__name(trackVisitor, "trackVisitor");
async function getVisitorStats(env) {
  try {
    const today = getCurrentDate();
    const currentMonth = getCurrentMonth();
    const dailyCount = await env.PAPERS.get(VISITOR_KEYS.daily(today)) || "0";
    const totalCount = await env.PAPERS.get(VISITOR_KEYS.total) || "0";
    const monthlyCount = await env.PAPERS.get(VISITOR_KEYS.monthly(currentMonth.split("-")[0], currentMonth.split("-")[1])) || "0";
    const dailyTrend = [];
    for (let i = 0; i < 7; i++) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = await env.PAPERS.get(VISITOR_KEYS.daily(dateStr)) || "0";
      dailyTrend.push({
        date: dateStr,
        count: parseInt(count)
      });
    }
    return {
      today: parseInt(dailyCount),
      total: parseInt(totalCount),
      thisMonth: parseInt(monthlyCount),
      dailyTrend: dailyTrend.reverse(),
      // Oldest to newest
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    logger6.error("Error getting visitor stats:", error);
    return {
      today: 0,
      total: 0,
      thisMonth: 0,
      dailyTrend: [],
      error: error.message
    };
  }
}
__name(getVisitorStats, "getVisitorStats");
function formatVisitorStats(stats) {
  if (!stats || stats.error) {
    return {
      today: "0",
      total: "0",
      thisMonth: "0",
      displayText: "Visitor stats unavailable"
    };
  }
  const formatNumber = /* @__PURE__ */ __name((num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  }, "formatNumber");
  return {
    today: formatNumber(stats.today),
    total: formatNumber(stats.total),
    thisMonth: formatNumber(stats.thisMonth),
    displayText: `${formatNumber(stats.total)} total visitors`
  };
}
__name(formatVisitorStats, "formatVisitorStats");

// worker-modules/src/handlers.js
var logger7 = {
  info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[HANDLER] ${msg}`, data), "info"),
  debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[HANDLER] ${msg}`, data), "debug"),
  warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[HANDLER] ${msg}`, data), "warn"),
  error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[HANDLER] ${msg}`, data), "error")
};
async function handleRoot(request, env) {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const url = new URL(request.url);
    const visitorInfo = await trackVisitor(request, env);
    const requestedDate = url.searchParams.get("date");
    const targetDate = requestedDate || today;
    let papers = await getCachedPapers(targetDate, env);
    let dailyReport = null;
    if (!papers) {
      const recentDates = [];
      for (let i = 0; i < 7; i++) {
        const date = /* @__PURE__ */ new Date();
        date.setDate(date.getDate() - i);
        recentDates.push(date.toISOString().split("T")[0]);
      }
      for (const date of recentDates) {
        const cached = await getCachedPapers(date, env);
        if (cached && cached.length > 0) {
          papers = cached;
          break;
        }
      }
    }
    if (papers && papers.length > 0) {
      const displayPapers2 = filterAndSortPapers(papers, {
        ensureBothSources: true,
        maxPapers: 10,
        minScore: 5
        // Lower threshold to ensure we get 10 papers when possible
      });
      dailyReport = await generateDailyReport(displayPapers2, targetDate);
      papers = displayPapers2;
    }
    const displayPapers = papers || [];
    const papersWithViews = await enrichPapersWithViews(displayPapers, env);
    const visitorStats = await getVisitorStats(env);
    const formattedStats = formatVisitorStats(visitorStats);
    return htmlResponse(getDualColumnHTML(papersWithViews, dailyReport, formattedStats));
  } catch (error) {
    logger7.error("Error in root handler:", error);
    return htmlResponse(getIndexHTML([], null));
  }
}
__name(handleRoot, "handleRoot");
async function handlePapersList(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = Math.min(parseInt(url.searchParams.get("limit")) || 10, 11);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const date = url.searchParams.get("date");
    let papers = [];
    if (date) {
      validateDate(date);
      papers = await getCachedPapers(date, env) || [];
    } else {
      for (let i = 0; i < 1; i++) {
        const date2 = /* @__PURE__ */ new Date();
        date2.setDate(date2.getDate() - i);
        const dateStr = date2.toISOString().split("T")[0];
        const cached = await getCachedPapers(dateStr, env);
        if (cached) {
          papers.push(...cached);
        }
      }
    }
    if (category) {
      papers = filterPapersByCategory(papers, category);
    }
    if (search) {
      papers = searchPapers(papers, search);
    }
    papers.sort((a, b) => {
      const scoreA = a.analysis?.relevance_score || a.scoring?.total_score || 5;
      const scoreB = b.analysis?.relevance_score || b.scoring?.total_score || 5;
      if (Math.abs(scoreB - scoreA) > 0.1) {
        return scoreB - scoreA;
      }
      if (scoreA === scoreB) {
        return Math.random() - 0.5;
      }
      const dateA = new Date(a.published || a.scraped_at || 0);
      const dateB = new Date(b.published || b.scraped_at || 0);
      return dateB - dateA;
    });
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPapers = papers.slice(startIndex, endIndex);
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
        category,
        search,
        date
      }
    };
    return jsonResponse(response);
  } catch (error) {
    logger7.error("Error in papers list handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handlePapersList, "handlePapersList");
async function handlePapersByDate(request, env, date) {
  try {
    validateDate(date);
    const papers = await getCachedPapers(date, env);
    if (!papers) {
      return errorResponse("No papers found for this date", 404);
    }
    const papersWithViews = await enrichPapersWithViews(papers, env);
    return jsonResponse({
      date,
      papers: papersWithViews,
      total_papers: papersWithViews.length
    });
  } catch (error) {
    logger7.error("Error in papers by date handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handlePapersByDate, "handlePapersByDate");
async function handlePaperById(request, env, paperId) {
  try {
    let paper = null;
    for (let i = 0; i < 7; i++) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const papers = await getCachedPapers(dateStr, env);
      if (papers) {
        paper = papers.find((p) => p.id === paperId);
        if (paper) break;
      }
    }
    if (!paper) {
      return errorResponse("Paper not found", 404);
    }
    const viewCount = await getPaperViewCount(paperId, env);
    const paperWithViews = {
      ...paper,
      views: viewCount
    };
    return jsonResponse(paperWithViews);
  } catch (error) {
    logger7.error("Error in paper by ID handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handlePaperById, "handlePaperById");
async function handleUpdatePapers(request, env) {
  try {
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return errorResponse("OpenRouter API key not configured", 503);
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimitKey = `rate_limit_${clientIP}`;
    const lastUpdate = await env.PAPERS.get(rateLimitKey);
    if (lastUpdate) {
      const lastUpdateTime = parseInt(lastUpdate);
      const timeSinceLastUpdate = Date.now() - lastUpdateTime;
      const minInterval = 5 * 60 * 1e3;
      if (timeSinceLastUpdate < minInterval) {
        return errorResponse("Please wait before requesting another update", 429);
      }
    }
    await env.PAPERS.put(rateLimitKey, Date.now().toString(), {
      expirationTtl: 300
      // 5 minutes
    });
    logger7.info("Starting manual paper update");
    const scrapedPapers = await scrapeDailyPapers();
    if (scrapedPapers.length === 0) {
      return errorResponse("No papers could be scraped", 404);
    }
    const analyzedPapers = await analyzePapers(scrapedPapers, apiKey);
    await cachePapers(today, analyzedPapers, env);
    const dailyReport = await generateDailyReport(analyzedPapers, today);
    let archiveResult = null;
    try {
      const topPapers = filterAndSortPapers(analyzedPapers, {
        ensureBothSources: true,
        maxPapers: 10,
        minScore: 5
        // Lower threshold to ensure we get 10 papers when possible
      });
      archiveResult = await archivePapers(today, topPapers, env, {
        source: "daily_update",
        auto_archived: true,
        papers_archived: topPapers.length,
        total_papers_analyzed: analyzedPapers.length
      });
      logger7.info(`Successfully archived ${archiveResult.papers_archived} top papers for ${today} (from ${analyzedPapers.length} total)`);
    } catch (archiveError) {
      logger7.warn("Failed to archive papers:", archiveError.message);
    }
    logger7.info(`Successfully updated ${analyzedPapers.length} papers`);
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
    logger7.error("Error in update papers handler:", error);
    return errorResponse(`Update failed: ${error.message}`, error.statusCode || 500);
  }
}
__name(handleUpdatePapers, "handleUpdatePapers");
async function handleCategories(request, env) {
  try {
    const categories = /* @__PURE__ */ new Set();
    for (let i = 0; i < 7; i++) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const papers = await getCachedPapers(dateStr, env);
      if (papers) {
        papers.forEach((paper) => {
          const category = paper.analysis?.category || paper.category || "other";
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
    logger7.error("Error in categories handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleCategories, "handleCategories");
async function handleSearch(request, env) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const category = url.searchParams.get("category");
    const limit = parseInt(url.searchParams.get("limit")) || 20;
    if (!query || query.trim().length < 2) {
      return errorResponse("Search query must be at least 2 characters", 400);
    }
    let allPapers = [];
    for (let i = 0; i < 7; i++) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const papers = await getCachedPapers(dateStr, env);
      if (papers) {
        allPapers.push(...papers);
      }
    }
    let results = searchPapers(allPapers, query);
    if (category) {
      results = filterPapersByCategory(results, category);
    }
    results.sort((a, b) => {
      const scoreA = a.analysis?.relevance_score || 5;
      const scoreB = b.analysis?.relevance_score || 5;
      return scoreB - scoreA;
    });
    results = results.slice(0, limit);
    return jsonResponse({
      query,
      results,
      total_results: results.length,
      filters: {
        category
      }
    });
  } catch (error) {
    logger7.error("Error in search handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleSearch, "handleSearch");
async function handleRSSFeed(request, env) {
  try {
    let allPapers = [];
    for (let i = 0; i < 3; i++) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const papers = await getCachedPapers(dateStr, env);
      if (papers) {
        allPapers.push(...papers);
      }
    }
    allPapers = sortPapersByDate(allPapers);
    const rssFeed = generateRSSFeed(allPapers, {
      title: "PaperDog - AI Papers Daily",
      description: "Daily curated AI and computer vision research papers",
      link: "https://paperdog.org",
      maxItems: 20
    });
    return rssResponse(rssFeed);
  } catch (error) {
    logger7.error("Error in RSS feed handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleRSSFeed, "handleRSSFeed");
async function handleAbout(request, env) {
  try {
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>
</body>
</html>`;
    return htmlResponse(aboutHTML);
  } catch (error) {
    logger7.error("Error in about handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleAbout, "handleAbout");
async function handleScoringReport(request, env, date) {
  try {
    validateDate(date);
    const papers = await getCachedPapers(date, env);
    if (!papers || papers.length === 0) {
      return errorResponse("No papers found for this date", 404);
    }
    const scoringReport = generateScoringReport(papers);
    logger7.info(`Generated scoring report for ${date} with ${papers.length} papers`);
    return jsonResponse({
      date,
      papers_count: papers.length,
      scoring_report: scoringReport,
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    logger7.error("Error in scoring report handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleScoringReport, "handleScoringReport");
async function handleTrackPaperView(request, env, paperId) {
  try {
    if (!paperId) {
      return errorResponse("Paper ID is required", 400);
    }
    let paper = null;
    for (let i = 0; i < 7; i++) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const papers = await getCachedPapers(dateStr, env);
      if (papers) {
        paper = papers.find((p) => p.id === paperId);
        if (paper) break;
      }
    }
    if (!paper) {
      return errorResponse("Paper not found", 404);
    }
    const newViewCount = await incrementPaperView(paperId, env);
    logger7.info(`Tracked view for paper ${paperId}: ${newViewCount} views`);
    return jsonResponse({
      success: true,
      paper_id: paperId,
      views: newViewCount,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    logger7.error("Error tracking paper view:", error);
    return errorResponse("Failed to track view", 500);
  }
}
__name(handleTrackPaperView, "handleTrackPaperView");
async function handleArchivePage(request, env) {
  try {
    logger7.info("Serving archive page");
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 20;
    const { getAvailableArchiveDates: getAvailableArchiveDates2, getArchivedPapers: getArchivedPapers2, getArchiveStatistics: getArchiveStatistics2 } = await Promise.resolve().then(() => (init_archive_manager(), archive_manager_exports));
    const { generateEnhancedArchiveHTML: generateEnhancedArchiveHTML2 } = await Promise.resolve().then(() => (init_archive_templates(), archive_templates_exports));
    let papers = [];
    let availableDates = [];
    let statistics = null;
    let selectedDate = date;
    try {
      availableDates = await getAvailableArchiveDates2(env);
      if (availableDates.length > 0) {
        statistics = await getArchiveStatistics2(env);
      }
    } catch (error) {
      logger7.warn("Failed to get archive data:", error.message);
    }
    if (date) {
      try {
        validateDate(date);
        const archive = await getArchivedPapers2(date, env);
        if (archive) {
          papers = archive.papers;
        }
      } catch (error) {
        logger7.warn(`Failed to get archive for date ${date}:`, error.message);
      }
    } else if (availableDates.length > 0) {
      const recentDate = availableDates[0];
      try {
        const archive = await getArchivedPapers2(recentDate, env);
        if (archive) {
          papers = archive.papers;
          selectedDate = recentDate;
        }
      } catch (error) {
        logger7.warn(`Failed to get recent archive:`, error.message);
      }
    }
    if (category) {
      papers = papers.filter((paper) => {
        const paperCategory = paper.analysis?.category || paper.category || "other";
        return paperCategory.toLowerCase() === category.toLowerCase();
      });
    }
    if (search) {
      const searchTerms = search.toLowerCase().split(" ").filter((term) => term.length > 2);
      papers = papers.filter((paper) => {
        const searchableText = [
          paper.title,
          paper.abstract,
          ...paper.authors || [],
          ...paper.analysis?.keywords || []
        ].join(" ").toLowerCase();
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }
    papers.sort((a, b) => {
      const scoreA = a.analysis?.relevance_score || 5;
      const scoreB = b.analysis?.relevance_score || 5;
      return scoreB - scoreA;
    });
    const totalPapers = papers.length;
    const totalPages = Math.ceil(totalPapers / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPapers = papers.slice(startIndex, endIndex);
    const archiveHTML = generateEnhancedArchiveHTML2({
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
    logger7.error("Error in archive page handler:", error);
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
__name(handleArchivePage, "handleArchivePage");

// worker-modules/src/archive-handlers.js
init_checked_fetch();
init_modules_watch_stub();
init_config();
init_archive_manager();

// worker-modules/src/archive-exporter.js
init_checked_fetch();
init_modules_watch_stub();
init_config();
var logger8 = {
  info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[EXPORT] ${msg}`, data), "info"),
  debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[EXPORT] ${msg}`, data), "debug"),
  warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[EXPORT] ${msg}`, data), "warn"),
  error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[EXPORT] ${msg}`, data), "error")
};
var EXPORT_FORMATS = {
  JSON: "json",
  CSV: "csv",
  MARKDOWN: "markdown",
  BIBTEX: "bibtex",
  PDF: "pdf"
  // Future implementation
};
var DEFAULT_EXPORT_OPTIONS = {
  includeAbstracts: true,
  includeAnalysis: true,
  includeMetadata: true,
  includeStatistics: true,
  compressLargeExports: true,
  maxPapersPerFile: 1e3,
  dateFormat: "YYYY-MM-DD",
  authorSeparator: "; ",
  keywordSeparator: "; ",
  citationStyle: "apa"
  // For future citation formats
};
function validateExportRequest(params) {
  logger8.info("Validating export request", params);
  const { format, startDate, endDate, category, minScore, maxScore, options = {} } = params;
  if (!Object.values(EXPORT_FORMATS).includes(format)) {
    throw new AppError(`Invalid export format. Supported formats: ${Object.values(EXPORT_FORMATS).join(", ")}`, 400);
  }
  if (startDate || endDate) {
    if (startDate && !isValidDate(startDate)) {
      throw new AppError("Invalid start date format. Use YYYY-MM-DD", 400);
    }
    if (endDate && !isValidDate(endDate)) {
      throw new AppError("Invalid end date format. Use YYYY-MM-DD", 400);
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new AppError("Start date must be before or equal to end date", 400);
    }
  }
  if (minScore && (minScore < 0 || minScore > 10)) {
    throw new AppError("Minimum score must be between 0 and 10", 400);
  }
  if (maxScore && (maxScore < 0 || maxScore > 10)) {
    throw new AppError("Maximum score must be between 0 and 10", 400);
  }
  if (minScore && maxScore && minScore > maxScore) {
    throw new AppError("Minimum score must be less than or equal to maximum score", 400);
  }
  const validOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const validatedParams = {
    format,
    startDate,
    endDate,
    category,
    minScore,
    maxScore,
    options: validOptions
  };
  logger8.info("Export request validated successfully", validatedParams);
  return validatedParams;
}
__name(validateExportRequest, "validateExportRequest");
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
__name(isValidDate, "isValidDate");
function filterPapersForExport(papers, filters) {
  const { startDate, endDate, category, minScore, maxScore } = filters;
  return papers.filter((paper) => {
    if (startDate || endDate) {
      const paperDate = paper.archive_date || paper.published || paper.scraped_at;
      if (startDate && new Date(paperDate) < new Date(startDate)) return false;
      if (endDate && new Date(paperDate) > new Date(endDate)) return false;
    }
    if (category) {
      const paperCategory = paper.analysis?.category || paper.category || "other";
      if (paperCategory.toLowerCase() !== category.toLowerCase()) return false;
    }
    if (minScore || maxScore) {
      const score = paper.analysis?.relevance_score || 5;
      if (minScore && score < minScore) return false;
      if (maxScore && score > maxScore) return false;
    }
    return true;
  });
}
__name(filterPapersForExport, "filterPapersForExport");
function prepareExportData(archives, filters, options = {}) {
  try {
    logger8.info("Preparing export data", { archives: archives.length, filters, options });
    if (!archives || !Array.isArray(archives)) {
      throw new AppError("Invalid archives data", 400);
    }
    if (archives.length === 0) {
      return {
        papers: [],
        statistics: {
          total_papers: 0,
          category_distribution: {},
          source_distribution: {},
          score_distribution: { "1-3": 0, "4-6": 0, "7-8": 0, "9-10": 0 },
          average_score: 0,
          date_range: null
        },
        metadata: {
          version: "1.0",
          exported_at: (/* @__PURE__ */ new Date()).toISOString(),
          total_original_papers: 0,
          total_filtered_papers: 0,
          filters_applied: filters,
          options_used: options,
          archives_processed: 0,
          date_range: null,
          format: filters.format || "unknown"
        }
      };
    }
    let allPapers = [];
    archives.forEach((archive) => {
      if (archive && archive.papers && Array.isArray(archive.papers)) {
        const papersWithDate = archive.papers.map((paper) => ({
          ...paper,
          archive_date: archive.date,
          archive_metadata: archive.metadata
        }));
        allPapers = allPapers.concat(papersWithDate);
      }
    });
    if (allPapers.length === 0) {
      logger8.warn("No papers found in archives for export");
      return {
        papers: [],
        statistics: {
          total_papers: 0,
          category_distribution: {},
          source_distribution: {},
          score_distribution: { "1-3": 0, "4-6": 0, "7-8": 0, "9-10": 0 },
          average_score: 0,
          date_range: null
        },
        metadata: {
          version: "1.0",
          exported_at: (/* @__PURE__ */ new Date()).toISOString(),
          total_original_papers: 0,
          total_filtered_papers: 0,
          filters_applied: filters,
          options_used: options,
          archives_processed: archives.length,
          date_range: null,
          format: filters.format || "unknown"
        }
      };
    }
    const filteredPapers = filterPapersForExport(allPapers, filters);
    const statistics = generateExportStatistics(filteredPapers, archives, filters);
    const exportMetadata = {
      version: "1.0",
      exported_at: (/* @__PURE__ */ new Date()).toISOString(),
      total_original_papers: allPapers.length,
      total_filtered_papers: filteredPapers.length,
      filters_applied: filters,
      options_used: options,
      archives_processed: archives.length,
      date_range: getDateRangeFromPapers(filteredPapers),
      format: filters.format
    };
    return {
      papers: filteredPapers,
      statistics,
      metadata: exportMetadata
    };
  } catch (error) {
    logger8.error("Error preparing export data:", error);
    throw new AppError(`Failed to prepare export data: ${error.message}`, 500);
  }
}
__name(prepareExportData, "prepareExportData");
function generateExportStatistics(papers, archives, filters) {
  const categoryStats = {};
  const sourceStats = {};
  const dateStats = {};
  const scoreDistribution = { "1-3": 0, "4-6": 0, "7-8": 0, "9-10": 0 };
  let totalScore = 0;
  papers.forEach((paper) => {
    const category = paper.analysis?.category || paper.category || "other";
    categoryStats[category] = (categoryStats[category] || 0) + 1;
    const source = paper.source || "unknown";
    sourceStats[source] = (sourceStats[source] || 0) + 1;
    const date = paper.archive_date || paper.published || paper.scraped_at;
    const dateKey = date.split("T")[0];
    dateStats[dateKey] = (dateStats[dateKey] || 0) + 1;
    const score = paper.analysis?.relevance_score || 5;
    totalScore += score;
    if (score >= 1 && score <= 3) scoreDistribution["1-3"]++;
    else if (score >= 4 && score <= 6) scoreDistribution["4-6"]++;
    else if (score >= 7 && score <= 8) scoreDistribution["7-8"]++;
    else if (score >= 9 && score <= 10) scoreDistribution["9-10"]++;
  });
  const avgScore = papers.length > 0 ? totalScore / papers.length : 0;
  return {
    total_papers: papers.length,
    category_distribution: categoryStats,
    source_distribution: sourceStats,
    date_distribution: dateStats,
    score_distribution: scoreDistribution,
    average_score: Math.round(avgScore * 100) / 100,
    date_range: getDateRangeFromPapers(papers)
  };
}
__name(generateExportStatistics, "generateExportStatistics");
function getDateRangeFromPapers(papers) {
  if (papers.length === 0) return null;
  const dates = papers.map((paper) => {
    const dateStr = paper.archive_date || paper.published || paper.scraped_at;
    return new Date(dateStr);
  });
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  return {
    start: minDate.toISOString().split("T")[0],
    end: maxDate.toISOString().split("T")[0]
  };
}
__name(getDateRangeFromPapers, "getDateRangeFromPapers");
function generateJSONExport(data, options = {}) {
  try {
    logger8.info("Generating JSON export", { paper_count: data.papers.length });
    const { includeAbstracts = true, includeAnalysis = true, includeMetadata = true, includeStatistics = true } = options;
    let exportData = {
      export_metadata: data.metadata
    };
    if (includeAnalysis && includeAbstracts) {
      exportData.papers = data.papers;
    } else {
      exportData.papers = data.papers.map((paper) => {
        const exportedPaper = { ...paper };
        if (!includeAbstracts) {
          delete exportedPaper.abstract;
        }
        if (!includeAnalysis) {
          delete exportedPaper.analysis;
        }
        return exportedPaper;
      });
    }
    if (includeStatistics) {
      exportData.statistics = data.statistics;
    }
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    logger8.error("Error generating JSON export:", error);
    throw new AppError(`Failed to generate JSON export: ${error.message}`, 500);
  }
}
__name(generateJSONExport, "generateJSONExport");
function generateCSVExport(data, options = {}) {
  try {
    logger8.info("Generating CSV export", { paper_count: data.papers.length });
    const {
      includeAbstracts = true,
      includeAnalysis = false,
      // Analysis data is complex for CSV
      authorSeparator = "; ",
      keywordSeparator = "; "
    } = options;
    const headers = [
      "archive_date",
      "title",
      "authors",
      "category",
      "relevance_score",
      "source",
      "published_date",
      "url",
      "primary_category"
    ];
    if (includeAbstracts) {
      headers.push("abstract");
    }
    if (includeAnalysis) {
      headers.push("keywords", "technical_depth");
    }
    const rows = data.papers.map((paper) => {
      const row = {
        archive_date: paper.archive_date || "",
        title: escapeCSV(paper.title),
        authors: escapeCSV(paper.authors?.join(authorSeparator) || ""),
        category: escapeCSV(paper.analysis?.category || paper.category || "other"),
        relevance_score: paper.analysis?.relevance_score || 5,
        source: paper.source || "unknown",
        published_date: paper.published ? paper.published.split("T")[0] : "",
        url: paper.url || "",
        primary_category: paper.primary_category || ""
      };
      if (includeAbstracts) {
        row.abstract = escapeCSV(paper.abstract || "");
      }
      if (includeAnalysis) {
        row.keywords = escapeCSV(paper.analysis?.keywords?.join(keywordSeparator) || "");
        row.technical_depth = paper.analysis?.technical_depth || "unknown";
      }
      return headers.map((header) => `"${row[header] || ""}"`).join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    return csvContent;
  } catch (error) {
    logger8.error("Error generating CSV export:", error);
    throw new AppError(`Failed to generate CSV export: ${error.message}`, 500);
  }
}
__name(generateCSVExport, "generateCSVExport");
function escapeCSV(value) {
  if (typeof value !== "string") return value;
  return value.replace(/"/g, '""');
}
__name(escapeCSV, "escapeCSV");
function generateMarkdownExport(data, options = {}) {
  try {
    logger8.info("Generating Markdown export", { paper_count: data.papers.length });
    const {
      includeAbstracts = true,
      includeAnalysis = true,
      includeStatistics = true
    } = options;
    let markdown = `# PaperDog Archive Export

`;
    markdown += `**Generated**: ${data.metadata.exported_at}
`;
    if (data.metadata.date_range) {
      markdown += `**Date Range**: ${data.metadata.date_range.start} to ${data.metadata.date_range.end}
`;
    } else {
      markdown += `**Date Range**: No date range available
`;
    }
    markdown += `**Total Papers**: ${data.papers.length}

`;
    if (includeStatistics && data.statistics) {
      markdown += "## Export Statistics\n\n";
      markdown += `- **Total Papers**: ${data.statistics.total_papers}
`;
      markdown += `- **Average Score**: ${data.statistics.average_score}/10
`;
      markdown += `- **Date Range**: ${data.statistics.date_range ? `${data.statistics.date_range.start} to ${data.statistics.date_range.end}` : "No date range available"}

`;
      if (Object.keys(data.statistics.category_distribution).length > 0) {
        markdown += "### Papers by Category\n\n";
        Object.entries(data.statistics.category_distribution).sort(([, a], [, b]) => b - a).forEach(([category, count]) => {
          markdown += `- **${category}**: ${count} papers
`;
        });
        markdown += "\n";
      }
      if (Object.keys(data.statistics.source_distribution).length > 0) {
        markdown += "### Papers by Source\n\n";
        Object.entries(data.statistics.source_distribution).sort(([, a], [, b]) => b - a).forEach(([source, count]) => {
          markdown += `- **${source}**: ${count} papers
`;
        });
        markdown += "\n";
      }
      markdown += "### Score Distribution\n\n";
      Object.entries(data.statistics.score_distribution).forEach(([range, count]) => {
        markdown += `- **${range}**: ${count} papers
`;
      });
      markdown += "\n---\n\n";
    }
    const papersByDate = {};
    data.papers.forEach((paper) => {
      const date = paper.archive_date || paper.published?.split("T")[0] || "Unknown";
      if (!papersByDate[date]) papersByDate[date] = [];
      papersByDate[date].push(paper);
    });
    Object.keys(papersByDate).sort().reverse().forEach((date) => {
      const papers = papersByDate[date];
      markdown += `## ${date} (${papers.length} papers)

`;
      papers.forEach((paper, index) => {
        const score = paper.analysis?.relevance_score || 5;
        const category = paper.analysis?.category || paper.category || "other";
        const depth = paper.analysis?.technical_depth || "unknown";
        markdown += `### ${index + 1}. [${score}/10] ${paper.title}

`;
        markdown += `**Authors**: ${paper.authors?.join(", ") || "Unknown"}
`;
        markdown += `**Category**: ${category} | **Source**: ${paper.source || "unknown"} | **Depth**: ${depth}
`;
        if (paper.url) {
          markdown += `**URL**: ${paper.url}
`;
        }
        if (paper.published) {
          markdown += `**Published**: ${paper.published.split("T")[0]}
`;
        }
        if (includeAnalysis && paper.analysis?.keywords?.length > 0) {
          markdown += `**Keywords**: ${paper.analysis.keywords.join(", ")}
`;
        }
        markdown += "\n";
        if (includeAbstracts && paper.abstract) {
          markdown += "**Abstract**:\n";
          markdown += `${paper.abstract}

`;
        }
        if (includeAnalysis && paper.analysis) {
          const analysis = paper.analysis;
          if (analysis.introduction) {
            markdown += "**Introduction**:\n";
            markdown += `${analysis.introduction}

`;
          }
          if (analysis.innovations) {
            markdown += "**Innovations**:\n";
            markdown += `${analysis.innovations}

`;
          }
          if (analysis.experiments) {
            markdown += "**Experiments & Results**:\n";
            markdown += `${analysis.experiments}

`;
          }
          if (analysis.insights) {
            markdown += "**Insights & Future Directions**:\n";
            markdown += `${analysis.insights}

`;
          }
        }
        markdown += "---\n\n";
      });
    });
    return markdown;
  } catch (error) {
    logger8.error("Error generating Markdown export:", error);
    throw new AppError(`Failed to generate Markdown export: ${error.message}`, 500);
  }
}
__name(generateMarkdownExport, "generateMarkdownExport");
function generateBibTeXExport(data, options = {}) {
  try {
    logger8.info("Generating BibTeX export", { paper_count: data.papers.length });
    const { citationStyle = "apa" } = options;
    let bibtex = "";
    data.papers.forEach((paper, index) => {
      const key = generateBibTeXKey(paper, index);
      const authors = formatBibTeXAuthors(paper.authors || []);
      const title = paper.title.replace(/[{}]/g, "\\$&");
      const year = new Date(paper.published || paper.archive_date).getFullYear();
      const month = new Date(paper.published || paper.archive_date).toLocaleString("default", { month: "short" }).toLowerCase();
      bibtex += `@article{${key},
`;
      bibtex += `  title={${title}},
`;
      if (authors) {
        bibtex += `  author={${authors}},
`;
      }
      bibtex += `  year={${year}},
`;
      bibtex += `  month={${month}},
`;
      if (paper.source === "arxiv" && paper.url) {
        const arxivMatch = paper.url.match(/arxiv\.org\/abs\/(\d+\.\d+)/);
        if (arxivMatch) {
          bibtex += `  journal={arXiv preprint arXiv:${arxivMatch[1]}},
`;
        }
      } else if (paper.source === "huggingface") {
        bibtex += `  journal={HuggingFace Papers},
`;
      } else {
        bibtex += `  journal={${paper.source || "Unknown Source"}},
`;
      }
      if (paper.url) {
        bibtex += `  url={${paper.url}},
`;
      }
      if (paper.primary_category) {
        bibtex += `  note={Primary category: ${paper.primary_category}},
`;
      }
      if (paper.analysis?.keywords?.length > 0) {
        const keywords = paper.analysis.keywords.join(", ");
        bibtex += `  keywords={${keywords}},
`;
      }
      bibtex += `  note={Accessed via PaperDog Archive},
`;
      bibtex = bibtex.trim().replace(/,\n$/, "\n");
      bibtex += "}\n\n";
    });
    return bibtex.trim();
  } catch (error) {
    logger8.error("Error generating BibTeX export:", error);
    throw new AppError(`Failed to generate BibTeX export: ${error.message}`, 500);
  }
}
__name(generateBibTeXExport, "generateBibTeXExport");
function generateBibTeXKey(paper, index) {
  const authors = paper.authors || [];
  const year = new Date(paper.published || paper.archive_date).getFullYear();
  let authorKey = "";
  if (authors.length > 0) {
    const firstAuthor = authors[0];
    const nameParts = firstAuthor.split(" ");
    authorKey = nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, "");
  } else {
    authorKey = "unknown";
  }
  const titleWords = paper.title.toLowerCase().split(" ").slice(0, 3);
  const titleKey = titleWords.map((word) => word.replace(/[^a-z]/g, "")).join("_");
  return `paperdog_${year}_${authorKey}_${titleKey}_${index + 1}`;
}
__name(generateBibTeXKey, "generateBibTeXKey");
function formatBibTeXAuthors(authors) {
  if (!authors || authors.length === 0) return "";
  const formattedAuthors = authors.map((author) => {
    const nameParts = author.trim().split(" ");
    if (nameParts.length >= 2) {
      const firstName = nameParts.slice(0, -1).join(" ");
      const lastName = nameParts[nameParts.length - 1];
      return `${lastName}, ${firstName}`;
    }
    return author;
  });
  return formattedAuthors.join(" and ");
}
__name(formatBibTeXAuthors, "formatBibTeXAuthors");
function generateExportFilename(format, dateRange, filters = {}) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const startDate = dateRange?.start || "all";
  const endDate = dateRange?.end || "all";
  let filename = `paperdog_archive_${startDate}_to_${endDate}`;
  if (filters.category) filename += `_cat_${filters.category}`;
  if (filters.minScore) filename += `_min_${filters.minScore}`;
  if (filters.maxScore) filename += `_max_${filters.maxScore}`;
  filename += `_${timestamp}.${format}`;
  return filename;
}
__name(generateExportFilename, "generateExportFilename");
async function compressExport(data, format) {
  try {
    logger8.info("Compressing export data");
    const compressed = {
      compressed: true,
      format,
      original_size: data.length,
      compressed_size: data.length,
      // Placeholder
      compression_ratio: 1,
      // Placeholder
      data
    };
    return JSON.stringify(compressed);
  } catch (error) {
    logger8.error("Error compressing export data:", error);
    throw new AppError(`Failed to compress export: ${error.message}`, 500);
  }
}
__name(compressExport, "compressExport");
async function exportArchiveData(archives, params) {
  try {
    logger8.info("Starting archive export", { format: params.format, archives: archives.length });
    const validatedParams = validateExportRequest(params);
    const { format, options } = validatedParams;
    logger8.info("Preparing export data...");
    const exportData = prepareExportData(archives, validatedParams, options);
    logger8.info(`Generating ${format} export for ${exportData.papers.length} papers`);
    let exportContent;
    let contentType;
    let fileExtension;
    switch (format) {
      case EXPORT_FORMATS.JSON:
        exportContent = generateJSONExport(exportData, options);
        contentType = "application/json";
        fileExtension = "json";
        break;
      case EXPORT_FORMATS.CSV:
        exportContent = generateCSVExport(exportData, options);
        contentType = "text/csv";
        fileExtension = "csv";
        break;
      case EXPORT_FORMATS.MARKDOWN:
        exportContent = generateMarkdownExport(exportData, options);
        contentType = "text/markdown";
        fileExtension = "md";
        break;
      case EXPORT_FORMATS.BIBTEX:
        exportContent = generateBibTeXExport(exportData, options);
        contentType = "text/plain";
        fileExtension = "bib";
        break;
      default:
        throw new AppError(`Export format '${format}' not implemented yet`, 501);
    }
    logger8.info(`Export content generated (${exportContent.length} characters)`);
    const filename = generateExportFilename(fileExtension, exportData.metadata.date_range, validatedParams);
    if (options.compressLargeExports && exportContent.length > 1e5) {
      logger8.info("Compressing large export...");
      exportContent = await compressExport(exportContent, format);
      contentType = "application/json";
    }
    logger8.info("Export completed successfully", {
      format,
      papers: exportData.papers.length,
      size: exportContent.length
    });
    return {
      content: exportContent,
      contentType,
      filename,
      format,
      metadata: exportData.metadata,
      statistics: exportData.statistics
    };
  } catch (error) {
    logger8.error("Error in exportArchiveData:", error);
    throw error instanceof AppError ? error : new AppError(`Export failed: ${error.message}`, 500);
  }
}
__name(exportArchiveData, "exportArchiveData");

// worker-modules/src/archive-handlers.js
init_utils();
var logger9 = {
  info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[ARCHIVE_HANDLER] ${msg}`, data), "info"),
  debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[ARCHIVE_HANDLER] ${msg}`, data), "debug"),
  warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[ARCHIVE_HANDLER] ${msg}`, data), "warn"),
  error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[ARCHIVE_HANDLER] ${msg}`, data), "error")
};
async function handleArchiveDates(request, env) {
  try {
    logger9.info("Getting available archive dates");
    const dates = await getAvailableArchiveDates(env);
    const index = await getArchiveIndex(env);
    return jsonResponse({
      available_dates: dates,
      total_archives: dates.length,
      date_range: dates.length > 0 ? {
        start: dates[dates.length - 1],
        end: dates[0]
      } : null,
      date_stats: index?.date_stats || {},
      last_updated: index?.last_updated || null
    });
  } catch (error) {
    logger9.error("Error getting archive dates:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleArchiveDates, "handleArchiveDates");
async function handleArchiveByDate(request, env, date) {
  try {
    validateDate(date);
    logger9.info(`Getting archived papers for date: ${date}`);
    const archive = await getArchivedPapers(date, env);
    if (!archive) {
      return errorResponse("No archived papers found for this date", 404);
    }
    return jsonResponse({
      date,
      papers: archive.papers,
      metadata: archive.metadata,
      total_papers: archive.papers.length
    });
  } catch (error) {
    logger9.error(`Error getting archived papers for ${date}:`, error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleArchiveByDate, "handleArchiveByDate");
async function handleArchiveRange(request, env) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const category = url.searchParams.get("category");
    const minScore = url.searchParams.get("min_score") ? parseFloat(url.searchParams.get("min_score")) : null;
    const maxScore = url.searchParams.get("max_score") ? parseFloat(url.searchParams.get("max_score")) : null;
    if (!startDate || !endDate) {
      return errorResponse("Both start_date and end_date are required", 400);
    }
    validateDate(startDate);
    validateDate(endDate);
    logger9.info(`Getting archived papers for range: ${startDate} to ${endDate}`);
    let archives = await getArchivedPapersByRange(startDate, endDate, env);
    if (category || minScore !== null || maxScore !== null) {
      archives = archives.map((archive) => ({
        ...archive,
        papers: archive.papers.filter((paper) => {
          if (category) {
            const paperCategory = paper.analysis?.category || paper.category || "other";
            if (paperCategory.toLowerCase() !== category.toLowerCase()) return false;
          }
          if (minScore !== null) {
            const score = paper.analysis?.relevance_score || 5;
            if (score < minScore) return false;
          }
          if (maxScore !== null) {
            const score = paper.analysis?.relevance_score || 5;
            if (score > maxScore) return false;
          }
          return true;
        })
      })).filter((archive) => archive.papers.length > 0);
    }
    const allPapers = [];
    let totalPapers = 0;
    archives.forEach((archive) => {
      archive.papers.forEach((paper) => {
        allPapers.push({
          ...paper,
          archive_date: archive.date
        });
      });
      totalPapers += archive.papers.length;
    });
    return jsonResponse({
      date_range: {
        start: startDate,
        end: endDate
      },
      archives_found: archives.length,
      total_papers: totalPapers,
      filters_applied: {
        category,
        min_score: minScore,
        max_score: maxScore
      },
      papers: allPapers
    });
  } catch (error) {
    logger9.error("Error getting archived papers by range:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleArchiveRange, "handleArchiveRange");
async function handleArchiveSearch(request, env) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const category = url.searchParams.get("category");
    const minScore = url.searchParams.get("min_score") ? parseFloat(url.searchParams.get("min_score")) : null;
    const maxResults = parseInt(url.searchParams.get("max_results")) || 50;
    if (!query || query.trim().length < 2) {
      return errorResponse("Search query must be at least 2 characters", 400);
    }
    logger9.info(`Searching archived papers with query: ${query}`);
    const filters = {
      startDate,
      endDate,
      category,
      minScore,
      maxResults
    };
    const results = await searchArchivedPapers(query, filters, env);
    return jsonResponse({
      query,
      filters,
      results: results.results,
      total_results: results.total_results,
      archives_searched: results.archives_searched,
      date_range: results.date_range
    });
  } catch (error) {
    logger9.error("Error searching archived papers:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleArchiveSearch, "handleArchiveSearch");
async function handleArchiveStatistics(request, env) {
  try {
    logger9.info("Getting archive statistics");
    const stats = await getArchiveStatistics(env);
    return jsonResponse({
      statistics: stats,
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    logger9.error("Error getting archive statistics:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleArchiveStatistics, "handleArchiveStatistics");
async function handleArchiveExport(request, env) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "json";
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const category = url.searchParams.get("category");
    const minScore = url.searchParams.get("min_score") ? parseFloat(url.searchParams.get("min_score")) : null;
    const maxScore = url.searchParams.get("max_score") ? parseFloat(url.searchParams.get("max_score")) : null;
    const includeAbstracts = url.searchParams.get("include_abstracts") !== "false";
    const includeAnalysis = url.searchParams.get("include_analysis") !== "false";
    const includeStatistics = url.searchParams.get("include_statistics") !== "false";
    logger9.info(`Exporting archived papers in ${format} format`, {
      startDate,
      endDate,
      category,
      minScore,
      maxScore
    });
    const exportParams = validateExportRequest({
      format,
      startDate,
      endDate,
      category,
      minScore,
      maxScore,
      options: {
        includeAbstracts,
        includeAnalysis,
        includeStatistics
      }
    });
    logger9.info(`Validated export parameters:`, exportParams);
    let archives;
    if (startDate && endDate) {
      archives = await getArchivedPapersByRange(startDate, endDate, env);
    } else {
      const availableDates = await getAvailableArchiveDates(env);
      if (availableDates.length === 0) {
        return errorResponse("No archived papers available for export", 404);
      }
      archives = await Promise.all(
        availableDates.slice(0, 30).map((date) => getArchivedPapers(date, env))
      );
      archives = archives.filter((archive) => archive !== null);
    }
    if (archives.length === 0) {
      return errorResponse("No archived papers found for the specified criteria", 404);
    }
    logger9.info(`Generating export from ${archives.length} archives`);
    const exportResult = await exportArchiveData(archives, exportParams);
    logger9.info(`Export generated successfully:`, {
      format: exportResult.format,
      filename: exportResult.filename,
      size: exportResult.content.length,
      papers: exportResult.statistics?.total_papers || 0
    });
    return new Response(exportResult.content, {
      status: 200,
      headers: {
        "Content-Type": exportResult.contentType,
        "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
        "Access-Control-Expose-Headers": "Content-Disposition",
        "Content-Length": exportResult.content.length.toString(),
        ...corsHeaders
      }
    });
  } catch (error) {
    logger9.error("Error exporting archived papers:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleArchiveExport, "handleArchiveExport");
async function handleExportFormats(request, env) {
  try {
    logger9.info("Getting available export formats");
    const formats = Object.values(EXPORT_FORMATS).map((format) => ({
      format,
      description: getFormatDescription(format),
      content_type: getContentType(format),
      file_extension: getFileExtension(format),
      supports_analysis: supportsAnalysis(format),
      supports_statistics: supportsStatistics(format)
    }));
    return jsonResponse({
      formats,
      default_format: EXPORT_FORMATS.JSON,
      total_formats: formats.length
    });
  } catch (error) {
    logger9.error("Error getting export formats:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleExportFormats, "handleExportFormats");
async function handleCreateArchive(request, env) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Authorization required", 401);
    }
    const token = authHeader.split(" ")[1];
    if (token !== env.ADMIN_TOKEN) {
      return errorResponse("Invalid authorization token", 403);
    }
    const body = await request.json();
    const { date, papers, metadata = {} } = body;
    if (!date || !papers || !Array.isArray(papers)) {
      return errorResponse("Date and papers array are required", 400);
    }
    validateDate(date);
    logger9.info(`Creating manual archive for date: ${date}`);
    const result = await archivePapers(date, papers, env, metadata);
    return jsonResponse({
      success: true,
      message: `Successfully archived ${result.papers_archived} papers for ${date}`,
      date,
      papers_archived: result.papers_archived,
      metadata: result.metadata
    });
  } catch (error) {
    logger9.error("Error creating archive:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleCreateArchive, "handleCreateArchive");
function getFormatDescription(format) {
  const descriptions = {
    [EXPORT_FORMATS.JSON]: "Complete data in JSON format with full analysis and metadata",
    [EXPORT_FORMATS.CSV]: "Structured tabular data suitable for spreadsheet applications",
    [EXPORT_FORMATS.MARKDOWN]: "Human-readable format with formatting and structure",
    [EXPORT_FORMATS.BIBTEX]: "Academic citation format for reference management software",
    [EXPORT_FORMATS.PDF]: "Formatted PDF documents (coming soon)"
  };
  return descriptions[format] || "Unknown format";
}
__name(getFormatDescription, "getFormatDescription");
function getContentType(format) {
  const contentTypes = {
    [EXPORT_FORMATS.JSON]: "application/json",
    [EXPORT_FORMATS.CSV]: "text/csv",
    [EXPORT_FORMATS.MARKDOWN]: "text/markdown",
    [EXPORT_FORMATS.BIBTEX]: "text/plain",
    [EXPORT_FORMATS.PDF]: "application/pdf"
  };
  return contentTypes[format] || "application/octet-stream";
}
__name(getContentType, "getContentType");
function getFileExtension(format) {
  const extensions = {
    [EXPORT_FORMATS.JSON]: "json",
    [EXPORT_FORMATS.CSV]: "csv",
    [EXPORT_FORMATS.MARKDOWN]: "md",
    [EXPORT_FORMATS.BIBTEX]: "bib",
    [EXPORT_FORMATS.PDF]: "pdf"
  };
  return extensions[format] || "txt";
}
__name(getFileExtension, "getFileExtension");
function supportsAnalysis(format) {
  return [EXPORT_FORMATS.JSON, EXPORT_FORMATS.MARKDOWN].includes(format);
}
__name(supportsAnalysis, "supportsAnalysis");
function supportsStatistics(format) {
  return [EXPORT_FORMATS.JSON, EXPORT_FORMATS.MARKDOWN, EXPORT_FORMATS.CSV].includes(format);
}
__name(supportsStatistics, "supportsStatistics");
var archiveHandlers = {
  handleArchiveDates,
  handleArchiveByDate,
  handleArchiveRange,
  handleArchiveSearch,
  handleArchiveStatistics,
  handleArchiveExport,
  handleExportFormats,
  handleCreateArchive
};

// worker-modules/functions/worker.js
init_blog_generator();
init_utils();
init_archive_manager();
var handlers = {
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
  handleTrackPaperView,
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
var worker_default = {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;
      if (method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      }
      for (const [pattern, handlerName] of Object.entries(routes)) {
        const [routeMethod, routePath] = pattern.split(" ");
        if (method === routeMethod) {
          if (routePath.includes(":")) {
            const routeParts = routePath.split("/");
            const pathParts = path.split("/");
            if (routeParts.length === pathParts.length) {
              let match = true;
              let paramValue = null;
              for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(":")) {
                  paramValue = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                  match = false;
                  break;
                }
              }
              if (match && paramValue) {
                const handler = handlers[handlerName];
                if (handler) {
                  return await handler(request, env, paramValue);
                }
              }
            }
          } else if (path === routePath) {
            const handler = handlers[handlerName];
            if (handler) {
              return await handler(request, env);
            }
          }
        }
      }
      if (path === "/archive") {
        return await handleArchive(request, env);
      } else if (path.startsWith("/report/")) {
        const date = path.split("/")[2];
        return await handleReportByDate(request, env, date);
      }
      return errorResponse("Route not found", 404);
    } catch (error) {
      console.error("Fetch error:", error);
      return errorResponse(error.message, error.statusCode || 500);
    }
  },
  async scheduled(event, env, ctx) {
    console.log("Running scheduled paper update at:", (/* @__PURE__ */ new Date()).toISOString());
    try {
      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) {
        console.error("\u274C OPENROUTER_API_KEY not configured");
        return;
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      console.log(`\u{1F504} Starting daily paper update for ${today}`);
      console.log("\u{1F4E1} Scraping papers from sources...");
      const scrapedPapers = await scrapeDailyPapers();
      if (scrapedPapers.length === 0) {
        console.error("\u274C No papers could be scraped from sources");
        return;
      }
      console.log(`\u2705 Scraped ${scrapedPapers.length} papers`);
      console.log("\u{1F9E0} Analyzing papers with AI...");
      const analyzedPapers = await analyzePapers(scrapedPapers, apiKey);
      console.log(`\u2705 Analyzed ${analyzedPapers.length} papers`);
      console.log("\u{1F4BE} Caching results...");
      await cachePapers(today, analyzedPapers, env);
      console.log("\u{1F4CA} Generating daily report...");
      const dailyReport = await generateDailyReport(analyzedPapers, today);
      console.log("\u{1F4E6} Archiving top 10 papers for long-term storage...");
      try {
        const topPapers = [...analyzedPapers].sort((a, b) => {
          const scoreA = a.analysis?.relevance_score || a.scoring?.total_score || 5;
          const scoreB = b.analysis?.relevance_score || b.scoring?.total_score || 5;
          return scoreB - scoreA;
        }).slice(0, 10);
        const archiveResult = await archivePapers(today, topPapers, env, {
          source: "scheduled_update",
          auto_archived: true,
          papers_archived: topPapers.length,
          total_papers_analyzed: analyzedPapers.length
        });
        console.log(`\u2705 Successfully archived ${archiveResult.papers_archived} top papers for ${today} (from ${analyzedPapers.length} total)`);
      } catch (archiveError) {
        console.warn("\u26A0\uFE0F Failed to archive papers:", archiveError.message);
      }
      console.log("\u2705 Daily report generated successfully!");
      console.log(`\u{1F4C8} Summary: ${analyzedPapers.length} papers processed, ${dailyReport.total_papers} total papers`);
      const categories = {};
      analyzedPapers.forEach((paper) => {
        const category = paper.analysis?.category || paper.category || "other";
        categories[category] = (categories[category] || 0) + 1;
      });
      console.log("\u{1F4C2} Category breakdown:", categories);
    } catch (error) {
      console.error("\u274C Scheduled paper update failed:", error);
    }
  }
};
async function handleArchive(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 12;
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    let allPapers = [];
    for (let i = 0; i < 30; i++) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const papers = await env.PAPERS.get(`papers_${dateStr}`);
      if (papers) {
        const parsed = JSON.parse(papers);
        allPapers.push(...parsed);
      }
    }
    if (category) {
      allPapers = allPapers.filter(
        (p) => (p.analysis?.category || p.category || "other") === category
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      allPapers = allPapers.filter(
        (p) => p.title.toLowerCase().includes(searchLower) || p.abstract.toLowerCase().includes(searchLower) || p.authors && p.authors.some((a) => a.toLowerCase().includes(searchLower))
      );
    }
    const { getArchiveHTML: getArchiveHTML2 } = await Promise.resolve().then(() => (init_templates(), templates_exports));
    const html = getArchiveHTML2(allPapers, { page, limit, category, search });
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    console.error("Error in archive handler:", error);
    return errorResponse(error.message, 500);
  }
}
__name(handleArchive, "handleArchive");
async function handleReportByDate(request, env, date) {
  try {
    const { validateDate: validateDate2, getCachedPapers: getCachedPapers2 } = await Promise.resolve().then(() => (init_utils(), utils_exports));
    const { generateDailyReport: generateDailyReport2 } = await Promise.resolve().then(() => (init_blog_generator(), blog_generator_exports));
    const { getReportHTML: getReportHTML2 } = await Promise.resolve().then(() => (init_templates(), templates_exports));
    validateDate2(date);
    const papers = await getCachedPapers2(date, env);
    if (!papers || papers.length === 0) {
      return errorResponse("No papers found for this date", 404);
    }
    const report = await generateDailyReport2(papers, date);
    const html = getReportHTML2(report);
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    console.error("Error in report handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleReportByDate, "handleReportByDate");

// ../../../.nvm/versions/node/v22.17.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.nvm/versions/node/v22.17.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-KstIoW/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../.nvm/versions/node/v22.17.0/lib/node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-KstIoW/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
