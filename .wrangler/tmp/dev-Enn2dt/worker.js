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

// .wrangler/tmp/bundle-6uvAAJ/checked-fetch.js
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
  ".wrangler/tmp/bundle-6uvAAJ/checked-fetch.js"() {
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
var AppError, routes, PAPER_SOURCES, TOPIC_CATEGORIES, SOURCE_CONFIGS, MODEL_CONFIG, MODEL_PARAMS, PAPER_ANALYSIS_PROMPT;
var init_config = __esm({
  "worker-modules/src/config.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
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
      "POST /api/update": "handleUpdatePapers",
      "GET /api/categories": "handleCategories",
      "GET /api/search": "handleSearch",
      "GET /feed": "handleRSSFeed",
      "GET /about": "handleAbout",
      "GET /api/scoring/:date": "handleScoringReport"
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
        maxPapersPerRequest: 50,
        requestDelay: 1e3,
        retryAttempts: 3,
        dateRange: 7,
        // Last 7 days to get more results
        fields: "id,title,summary,authors,published,updated,primary_category"
      },
      huggingface: {
        maxPapersPerRequest: 30,
        requestDelay: 2e3,
        retryAttempts: 3,
        dateRange: 1,
        fields: "title,summary,authors,published,id,arxiv_id,tags"
      }
    };
    MODEL_CONFIG = {
      analysis: "openai/gpt-4o-mini",
      summary: "google/gemini-2.0-flash-001",
      translation: "google/gemini-2.0-flash-001"
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
    PAPER_ANALYSIS_PROMPT = `You are an expert AI researcher specializing in computer vision and machine learning. 

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
  "technical_depth": "beginner|intermediate|advanced"
}`;
  }
});

// worker-modules/src/utils.js
var utils_exports = {};
__export(utils_exports, {
  cachePaper: () => cachePaper,
  cachePapers: () => cachePapers,
  corsHeaders: () => corsHeaders,
  errorResponse: () => errorResponse,
  extractKeywords: () => extractKeywords,
  fetchWithTimeout: () => fetchWithTimeout,
  filterPapersByCategory: () => filterPapersByCategory,
  formatDate: () => formatDate,
  generatePaperId: () => generatePaperId,
  getCachedPaper: () => getCachedPaper,
  getCachedPapers: () => getCachedPapers,
  htmlResponse: () => htmlResponse,
  jsonResponse: () => jsonResponse,
  rssResponse: () => rssResponse,
  searchPapers: () => searchPapers,
  sleep: () => sleep,
  sortPapersByDate: () => sortPapersByDate,
  truncateText: () => truncateText,
  validateDate: () => validateDate,
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
      ...corsHeaders
    }
  });
}
function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders
    }
  });
}
function rssResponse(xml, status = 200) {
  return new Response(xml, {
    status,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      ...corsHeaders
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
var corsHeaders;
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
    corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
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
    return Math.min(10, score);
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
        score = analysis.relevance_score;
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
    return Math.min(10, Math.max(1, score));
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
    return Math.min(10, score);
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
    return Math.min(10, score);
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
    const totalScore = recencyScore * SCORING_WEIGHTS.recency + relevanceScore * SCORING_WEIGHTS.relevance + popularityScore * SCORING_WEIGHTS.popularity + qualityScore * SCORING_WEIGHTS.quality;
    const scoringDetails = {
      total_score: Math.round(totalScore * 100) / 100,
      // 保留两位小数
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
    // 最低分数阈值
    maxPapers = 5,
    // 最大论文数量
    minRecencyScore = 3,
    // 最低新鲜度分数
    daysAgoLimit = 90
    // 最多90天前的论文
  } = options;
  try {
    const now = /* @__PURE__ */ new Date();
    const cutoffDate = new Date(now.getTime() - daysAgoLimit * 24 * 60 * 60 * 1e3);
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
      const scoreDiff = b.scoring.total_score - a.scoring.total_score;
      if (Math.abs(scoreDiff) > 0.1) {
        return scoreDiff;
      }
      const recencyDiff = b.scoring.recency_score - a.scoring.recency_score;
      if (Math.abs(recencyDiff) > 0.1) {
        return recencyDiff;
      }
      const relevanceDiff = b.scoring.relevance_score - a.scoring.relevance_score;
      if (Math.abs(relevanceDiff) > 0.1) {
        return relevanceDiff;
      }
      try {
        return new Date(b.published) - new Date(a.published);
      } catch {
        return 0;
      }
    });
    const topPapers = sortedPapers.slice(0, maxPapers);
    logger3.info(`Selected top ${topPapers.length} papers from ${filteredPapers.length} filtered papers`);
    return topPapers;
  } catch (error) {
    logger3.error("Failed to filter and sort papers:", error);
    return papers.sort((a, b) => new Date(b.published) - new Date(a.published)).slice(0, maxPapers);
  }
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
var logger3, SCORING_WEIGHTS;
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
    __name(calculateRecencyScore, "calculateRecencyScore");
    __name(calculateRelevanceScore, "calculateRelevanceScore");
    __name(calculatePopularityScore, "calculatePopularityScore");
    __name(calculateQualityScore, "calculateQualityScore");
    __name(calculateComprehensiveScore, "calculateComprehensiveScore");
    __name(filterAndSortPapers, "filterAndSortPapers");
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
      maxPapers: 5,
      minRecencyScore: 3,
      daysAgoLimit: 90
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
  let summary = `Today's digest features ${papers.length} papers spanning ${Object.keys(categories).length} categories, with strong representation from ${topCategories}. The average relevance score is ${avgRelevance.toFixed(1)}/10. Trending topics include ${trendingKeywords}.`;
  if (scoringReport && !scoringReport.error) {
    summary += ` Using our advanced scoring system that considers recency (${Math.round(SCORING_WEIGHTS.recency * 100)}%), relevance (${Math.round(SCORING_WEIGHTS.relevance * 100)}%), popularity (${Math.round(SCORING_WEIGHTS.popularity * 100)}%), and quality (${Math.round(SCORING_WEIGHTS.quality * 100)}%), we selected the top 5 papers with an average score of ${scoringReport.average_score.toFixed(1)}/10.`;
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
    maxPapers = 20
  } = options;
  try {
    const sortedPapers = sortPapersByDate(papers).slice(0, maxPapers);
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
                    <div class="stat-number">${papers.length}</div>
                    <div class="stat-label">Total Papers</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${new Set(papers.map((p) => p.analysis?.category || p.category || "other")).size}</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${papers.filter((p) => p.source === "arxiv").length}</div>
                    <div class="stat-label">arXiv Papers</div>
                </div>
                <div class="col-md-3 stat-item">
                    <div class="stat-number">${papers.filter((p) => p.source === "huggingface").length}</div>
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

// .wrangler/tmp/bundle-6uvAAJ/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-6uvAAJ/middleware-insertion-facade.js
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
var logger = {
  info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[INFO] ${msg}`, data), "info"),
  debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[DEBUG] ${msg}`, data), "debug"),
  warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[WARN] ${msg}`, data), "warn"),
  error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[ERROR] ${msg}`, data), "error")
};
async function scrapeDailyPapers() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  logger.info(`Starting daily paper scraping for ${today}`);
  try {
    const [arxivPapers, huggingfacePapers] = await Promise.allSettled([
      scrapeArxivPapers(),
      scrapeHuggingfacePapers()
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
  const config = SOURCE_CONFIGS.huggingface;
  const papers = [];
  logger.info("Scraping HuggingFace papers");
  try {
    const url = "https://huggingface.co/papers";
    const response = await fetchWithTimeout(url, 3e4);
    const htmlContent = await response.text();
    const paperElements = parseHuggingfaceHTML(htmlContent);
    logger.info(`Found ${paperElements.length} paper elements on HuggingFace`);
    for (let i = 0; i < Math.min(paperElements.length, config.maxPapersPerRequest); i++) {
      try {
        const paper = parseHuggingfacePaper(paperElements[i]);
        if (paper) {
          papers.push(paper);
        }
      } catch (error) {
        logger.warn(`Failed to parse HuggingFace paper ${i}:`, { error: error.message });
      }
      if (i < paperElements.length - 1) {
        await sleep(config.requestDelay);
      }
    }
    return papers;
  } catch (error) {
    logger.error("Error scraping HuggingFace:", error);
    throw new AppError(`HuggingFace scraping failed: ${error.message}`);
  }
}
__name(scrapeHuggingfacePapers, "scrapeHuggingfacePapers");
function parseHuggingfacePaper(element) {
  try {
    const title = element.title;
    const abstract = element.abstract;
    const link = element.link;
    if (!title) {
      logger.warn("No title found in HuggingFace paper element");
      return null;
    }
    const id = `hf_${title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}_${Date.now()}`;
    return {
      id,
      title,
      abstract,
      authors: [],
      // HTML parsing for authors is complex, skip for now
      published: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      // Default to today
      updated: (/* @__PURE__ */ new Date()).toISOString(),
      category: "computer-vision",
      // Default category
      source: "huggingface",
      url: link.startsWith("http") ? link : `https://huggingface.co${link}`,
      pdf_url: "",
      // HuggingFace may not provide direct PDF links
      scraped_at: (/* @__PURE__ */ new Date()).toISOString()
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
  const paperRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  const divRegex = /<div[^>]*class="[^"]*paper[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = paperRegex.exec(htmlContent)) !== null) {
    const paperContent = match[1];
    const paper = parseHuggingfacePaperContent(paperContent);
    if (paper) {
      papers.push(paper);
    }
  }
  if (papers.length === 0) {
    while ((match = divRegex.exec(htmlContent)) !== null) {
      const paperContent = match[1];
      const paper = parseHuggingfacePaperContent(paperContent);
      if (paper) {
        papers.push(paper);
      }
    }
  }
  return papers;
}
__name(parseHuggingfaceHTML, "parseHuggingfaceHTML");
function parseHuggingfacePaperContent(paperContent) {
  try {
    const extractText = /* @__PURE__ */ __name((tag) => {
      const match = paperContent.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return match ? match[1].replace(/<[^>]*>/g, "").trim() : "";
    }, "extractText");
    const title = extractText("h1") || extractText("h2") || extractText("h3") || extractText("h4") || extractText("h5") || extractText("h6");
    if (!title) {
      return null;
    }
    const abstractMatch = paperContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const abstract = abstractMatch ? abstractMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    const linkMatch = paperContent.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
    const link = linkMatch ? linkMatch[1] : "";
    return {
      title,
      abstract,
      link
    };
  } catch (error) {
    logger.error("Error parsing HuggingFace paper content:", error);
    return null;
  }
}
__name(parseHuggingfacePaperContent, "parseHuggingfacePaperContent");
function removeDuplicatePapers(papers) {
  const seen = /* @__PURE__ */ new Set();
  const uniquePapers = [];
  for (const paper of papers) {
    const titleHash = paper.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seen.has(titleHash)) {
      seen.add(titleHash);
      uniquePapers.push(paper);
    } else {
      logger.debug(`Removed duplicate paper: ${paper.title}`);
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
  const BATCH_SIZE = 2;
  for (let i = 0; i < papers.length; i += BATCH_SIZE) {
    const batch = papers.slice(i, i + BATCH_SIZE);
    logger2.info(`Analyzing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(papers.length / BATCH_SIZE)}`);
    const batchPromises = batch.map((paper) => analyzeSinglePaper(paper, apiKey));
    const batchResults = await Promise.allSettled(batchPromises);
    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value) {
        analyzedPapers.push(result.value);
      } else if (result.status === "rejected") {
        logger2.error("Failed to analyze paper:", { error: result.reason.message });
        const originalPaper = batch[batchResults.indexOf(result)];
        if (originalPaper) {
          analyzedPapers.push(createFallbackAnalysis(originalPaper));
        }
      }
    }
    if (i + BATCH_SIZE < papers.length) {
      await sleep(2e3);
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
    const prompt = PAPER_ANALYSIS_PROMPT.replace("{title}", paper.title).replace("{authors}", paper.authors ? paper.authors.join(", ") : "Unknown").replace("{abstract}", paper.abstract || "No abstract available").replace("{published}", paper.published || "Unknown");
    const analysisResult = await callLLM(prompt, MODEL_CONFIG.analysis, MODEL_PARAMS.analysis, apiKey);
    const analysis = parseAnalysisResponse(analysisResult);
    const analyzedPaper = {
      ...paper,
      analysis: {
        ...analysis,
        analyzed_at: (/* @__PURE__ */ new Date()).toISOString(),
        model: MODEL_CONFIG.analysis
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
  try {
    const response = await fetchWithTimeout(url, 6e4, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      const errorText = await response.text();
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
    return content;
  } catch (error) {
    logger2.error("LLM API call failed:", error);
    throw error;
  }
}
__name(callLLM, "callLLM");
function parseAnalysisResponse(response) {
  try {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.replace(/```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/```\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(cleanResponse);
    const requiredFields = ["introduction", "challenges", "innovations", "experiments", "insights", "keywords", "category"];
    for (const field of requiredFields) {
      if (!parsed[field]) {
        logger2.warn(`Missing field in analysis: ${field}`);
        parsed[field] = field === "keywords" ? [] : "Not provided";
      }
    }
    if (!TOPIC_CATEGORIES.includes(parsed.category)) {
      logger2.warn(`Invalid category: ${parsed.category}, defaulting to 'machine_learning'`);
      parsed.category = "machine_learning";
    }
    if (!Array.isArray(parsed.keywords)) {
      parsed.keywords = typeof parsed.keywords === "string" ? [parsed.keywords] : [];
    }
    if (typeof parsed.relevance_score !== "number" || parsed.relevance_score < 1 || parsed.relevance_score > 10) {
      parsed.relevance_score = 5;
    }
    parsed.summary = generateSummary(parsed);
    return parsed;
  } catch (error) {
    logger2.error("Failed to parse analysis response:", error);
    throw new AppError(`Failed to parse analysis: ${error.message}`);
  }
}
__name(parseAnalysisResponse, "parseAnalysisResponse");
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
  return {
    ...paper,
    analysis: {
      introduction: "Analysis not available due to processing error.",
      challenges: "Not analyzed",
      innovations: "Not analyzed",
      experiments: "Not analyzed",
      insights: "Not analyzed",
      summary: paper.abstract ? `Abstract: ${paper.abstract.substring(0, 300)}...` : "No abstract available",
      keywords: extractKeywords2(paper),
      category: inferCategory(paper),
      relevance_score: 5,
      technical_depth: "unknown",
      analyzed_at: (/* @__PURE__ */ new Date()).toISOString(),
      model: "fallback",
      error: true
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
function getDualColumnHTML(papers = [], dailyReport = null) {
  const safeReportJson = JSON.stringify(dailyReport).replace(/</g, "<");
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
    </style>
</head>
<body>
    <nav class="navbar navbar-dark">
        <div class="container-fluid">
            <span class="navbar-brand mb-0 h1">
                <i class="fas fa-graduation-cap me-2"></i>PaperDog
            </span>
            <span class="navbar-text">
                Daily AI Papers Digest
            </span>
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
                
                // Try to get today's papers first
                const today = new Date().toISOString().split('T')[0];
                const response = await fetch('/api/papers/' + today);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.papers && data.papers.length > 0) {
                        loadPapersList(data.papers);
                        loadingIndicator.style.display = 'none';
                        return;
                    }
                }
                
                // Fallback to recent papers
                const recentResponse = await fetch('/api/papers?limit=20');
                if (recentResponse.ok) {
                    const data = await recentResponse.json();
                    loadPapersList(data.papers || []);
                } else {
                    listContainer.innerHTML = '<p class="text-muted">\u6682\u65E0\u8BBA\u6587\u6570\u636E</p>';
                }
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
                const scoreA = (a.analysis?.relevance_score || a.scoring?.total_score || 5);
                const scoreB = (b.analysis?.relevance_score || b.scoring?.total_score || 5);
                if (Math.abs(scoreA - scoreB) > 0.5) return scoreB - scoreA;
                return new Date(b.published || b.scraped_at) - new Date(a.published || a.scraped_at);
            });
            
            const papersHTML = papers.map((paper, index) => {
                const totalScore = paper.scoring?.total_score || paper.analysis?.relevance_score || 5;
                const category = paper.analysis?.category || paper.category || 'other';
                const isTopPaper = totalScore >= 7.0;
                
                return '<div class="card paper-card mb-2" onclick="loadPaperContent(' + index + ')">' +
                    '<div class="card-body py-2 px-3">' +
                    '<h6 class="card-title mb-1">' +
                    (isTopPaper ? '<i class="fas fa-trophy text-warning me-1"></i>' : '') +
                    paper.title.substring(0, 60) + (paper.title.length > 60 ? '...' : '') +
                    '</h6>' +
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
            const category = paper.analysis?.category || paper.category || 'other';
            const totalScore = paper.scoring?.total_score || paper.analysis?.relevance_score || 5;
            
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
    <\/script>
</body>
</html>`;
}
__name(getDualColumnHTML, "getDualColumnHTML");

// worker-modules/src/handlers.js
init_paper_scoring();
var logger5 = {
  info: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[HANDLER] ${msg}`, data), "info"),
  debug: /* @__PURE__ */ __name((msg, data = {}) => console.log(`[HANDLER] ${msg}`, data), "debug"),
  warn: /* @__PURE__ */ __name((msg, data = {}) => console.warn(`[HANDLER] ${msg}`, data), "warn"),
  error: /* @__PURE__ */ __name((msg, data = {}) => console.error(`[HANDLER] ${msg}`, data), "error")
};
async function handleRoot(request, env) {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const url = new URL(request.url);
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
      dailyReport = await generateDailyReport(papers, targetDate);
    }
    return htmlResponse(getDualColumnHTML(papers || [], dailyReport));
  } catch (error) {
    logger5.error("Error in root handler:", error);
    return htmlResponse(getIndexHTML([], null));
  }
}
__name(handleRoot, "handleRoot");
async function handlePapersList(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 20;
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const date = url.searchParams.get("date");
    let papers = [];
    if (date) {
      validateDate(date);
      papers = await getCachedPapers(date, env) || [];
    } else {
      for (let i = 0; i < 7; i++) {
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
    papers = sortPapersByDate(papers);
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
        category,
        search,
        date
      }
    };
    return jsonResponse(response);
  } catch (error) {
    logger5.error("Error in papers list handler:", error);
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
    return jsonResponse({
      date,
      papers,
      total_papers: papers.length
    });
  } catch (error) {
    logger5.error("Error in papers by date handler:", error);
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
    return jsonResponse(paper);
  } catch (error) {
    logger5.error("Error in paper by ID handler:", error);
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
    logger5.info("Starting manual paper update");
    const scrapedPapers = await scrapeDailyPapers();
    if (scrapedPapers.length === 0) {
      return errorResponse("No papers could be scraped", 404);
    }
    const analyzedPapers = await analyzePapers(scrapedPapers, apiKey);
    await cachePapers(today, analyzedPapers, env);
    const dailyReport = await generateDailyReport(analyzedPapers, today);
    logger5.info(`Successfully updated ${analyzedPapers.length} papers`);
    return jsonResponse({
      success: true,
      message: `Successfully updated ${analyzedPapers.length} papers`,
      date: today,
      papers_count: analyzedPapers.length,
      report: dailyReport
    });
  } catch (error) {
    logger5.error("Error in update papers handler:", error);
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
    logger5.error("Error in categories handler:", error);
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
    logger5.error("Error in search handler:", error);
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
    logger5.error("Error in RSS feed handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleRSSFeed, "handleRSSFeed");
async function handleAbout(request, env) {
  try {
    const aboutHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - PaperDog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .about-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4rem 0;
            margin-bottom: 3rem;
        }
    </style>
</head>
<body>
    <div class="about-header">
        <div class="container">
            <h1 class="display-4">
                <i class="fas fa-info-circle me-3"></i>About PaperDog
            </h1>
            <p class="lead">Your AI-powered research paper companion</p>
        </div>
    </div>
    
    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <div class="card mb-4">
                    <div class="card-body">
                        <h3><i class="fas fa-robot me-2"></i>What is PaperDog?</h3>
                        <p>PaperDog is an automated system that collects, analyzes, and presents the latest AI and computer vision research papers from top sources like arXiv and HuggingFace.</p>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <h3><i class="fas fa-cogs me-2"></i>How It Works</h3>
                        <ol>
                            <li><strong>Daily Scraping:</strong> Automatically collects new papers from arXiv and HuggingFace</li>
                            <li><strong>AI Analysis:</strong> Uses advanced language models to analyze each paper's content and relevance</li>
                            <li><strong>Smart Curation:</strong> Filters and ranks papers based on quality and importance</li>
                            <li><strong>Beautiful Presentation:</strong> Presents papers in an easy-to-read blog format</li>
                        </ol>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <h3><i class="fas fa-bolt me-2"></i>Features</h3>
                        <ul>
                            <li>Daily automated updates</li>
                            <li>AI-powered paper analysis</li>
                            <li>Smart categorization and tagging</li>
                            <li>Search and filter capabilities</li>
                            <li>RSS feed integration</li>
                            <li>Responsive design for all devices</li>
                        </ul>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <h3><i class="fas fa-code me-2"></i>Technical Details</h3>
                        <p>Built with modern web technologies:</p>
                        <ul>
                            <li>Backend: Cloudflare Workers</li>
                            <li>AI Analysis: OpenRouter API (GPT-4o, Gemini)</li>
                            <li>Storage: Cloudflare KV</li>
                            <li>Frontend: Bootstrap 5, HTML5, CSS3</li>
                            <li>Deployment: Cloudflare Pages + Workers</li>
                        </ul>
                    </div>
                </div>
                
                <div class="text-center">
                    <a href="/" class="btn btn-primary btn-lg me-3">
                        <i class="fas fa-home me-2"></i>Back to Home
                    </a>
                    <a href="/api/papers" class="btn btn-outline-secondary btn-lg">
                        <i class="fas fa-code me-2"></i>View API
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
    logger5.error("Error in about handler:", error);
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
    logger5.info(`Generated scoring report for ${date} with ${papers.length} papers`);
    return jsonResponse({
      date,
      papers_count: papers.length,
      scoring_report: scoringReport,
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    logger5.error("Error in scoring report handler:", error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}
__name(handleScoringReport, "handleScoringReport");

// worker-modules/functions/worker.js
init_blog_generator();
init_utils();
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
  handleScoringReport
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

// .wrangler/tmp/bundle-6uvAAJ/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-6uvAAJ/middleware-loader.entry.ts
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
