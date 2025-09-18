import { AppError } from './config.js';

// Utility functions for PaperDog Blog

export async function fetchWithTimeout(url, timeout = 10000, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const defaultHeaders = {
    'User-Agent': 'PaperDog-Bot/1.0 (https://paperdog.org)',
    'Accept': 'application/xml,application/json,text/html'
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
    if (error.name === 'AbortError') {
      throw new AppError(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generatePaperId(paper) {
  const timestamp = Date.now();
  const titleSlug = paper.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `${paper.source}_${titleSlug}_${timestamp}`;
}

export function validateDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD');
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new AppError('Invalid date');
  }
  
  return true;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncateText(text, maxLength = 200) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function extractKeywords(text, maxKeywords = 8) {
  // Simple keyword extraction - in production, use more sophisticated NLP
  const commonWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with',
    'we', 'our', 'this', 'that', 'these', 'those', 'are', 'be', 'have', 'has',
    'been', 'from', 'for', 'not', 'as', 'by', 'it', 'of', 'to', 'can', 'will'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

export function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders
    }
  });
}

export function rssResponse(xml, status = 200) {
  return new Response(xml, {
    status,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      ...corsHeaders
    }
  });
}

export function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status);
}

export async function getCachedPapers(date, env) {
  try {
    const cached = await env.PAPERS.get(`papers_${date}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }
  return null;
}

export async function cachePapers(date, papers, env) {
  try {
    const ttl = 24 * 60 * 60; // 24 hours in seconds
    await env.PAPERS.put(`papers_${date}`, JSON.stringify(papers), {
      expirationTtl: ttl
    });
    console.log(`Cached ${papers.length} papers for date ${date}`);
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

export async function getCachedPaper(paperId, env) {
  try {
    const cached = await env.PAPERS.get(`paper_${paperId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading paper from cache:', error);
  }
  return null;
}

export async function cachePaper(paperId, paper, env) {
  try {
    const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
    await env.PAPERS.put(`paper_${paperId}`, JSON.stringify(paper), {
      expirationTtl: ttl
    });
  } catch (error) {
    console.error('Error caching paper:', error);
  }
}

export function validatePaper(paper) {
  if (!paper.title || paper.title.trim().length < 10) {
    throw new AppError('Paper title is required and must be at least 10 characters');
  }
  
  if (!paper.abstract || paper.abstract.trim().length < 50) {
    throw new AppError('Paper abstract is required and must be at least 50 characters');
  }
  
  if (!paper.authors || !Array.isArray(paper.authors) || paper.authors.length === 0) {
    throw new AppError('Paper must have at least one author');
  }
  
  return true;
}

export function filterPapersByCategory(papers, category) {
  if (!category) return papers;
  
  return papers.filter(paper => 
    paper.category?.toLowerCase() === category.toLowerCase() ||
    paper.analysis?.category?.toLowerCase() === category.toLowerCase()
  );
}

export function searchPapers(papers, query) {
  if (!query) return papers;
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  return papers.filter(paper => {
    const searchableText = [
      paper.title,
      paper.abstract,
      ...(paper.authors || []),
      ...(paper.analysis?.keywords || [])
    ].join(' ').toLowerCase();
    
    return searchTerms.every(term => searchableText.includes(term));
  });
}

export function sortPapersByDate(papers, order = 'desc') {
  return [...papers].sort((a, b) => {
    const dateA = new Date(a.published || a.scraped_at);
    const dateB = new Date(b.published || b.scraped_at);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Archive utility functions
export function generateArchiveKey(date) {
  return `archive_${date}`;
}

export function generateArchiveIndexKey() {
  return 'archive_index';
}

export function generateExportKey(jobId) {
  return `export_${jobId}`;
}

export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new AppError('Both start_date and end_date are required', 400);
  }

  validateDate(startDate);
  validateDate(endDate);

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new AppError('Start date must be before or equal to end date', 400);
  }

  // Check if date range is too large (e.g., more than 1 year)
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 365) {
    throw new AppError('Date range cannot exceed 365 days', 400);
  }

  return { startDate, endDate, days: diffDays };
}

export function validateExportParams(params) {
  const { format, startDate, endDate, category, minScore, maxScore } = params;

  // Validate format
  const validFormats = ['json', 'csv', 'markdown', 'bibtex'];
  if (!validFormats.includes(format)) {
    throw new AppError(`Invalid format. Supported formats: ${validFormats.join(', ')}`, 400);
  }

  // Validate date range if provided
  if (startDate || endDate) {
    validateDateRange(startDate, endDate);
  }

  // Validate scores
  if (minScore !== undefined && (minScore < 0 || minScore > 10)) {
    throw new AppError('Minimum score must be between 0 and 10', 400);
  }

  if (maxScore !== undefined && (maxScore < 0 || maxScore > 10)) {
    throw new AppError('Maximum score must be between 0 and 10', 400);
  }

  if (minScore !== undefined && maxScore !== undefined && minScore > maxScore) {
    throw new AppError('Minimum score must be less than or equal to maximum score', 400);
  }

  return params;
}

export function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateExportJobId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `export_${timestamp}_${random}`;
}

export function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function generateArchiveStatistics(papers) {
  const stats = {
    total: papers.length,
    categories: {},
    sources: {},
    scores: [],
    dates: [],
    keywords: new Set()
  };

  papers.forEach(paper => {
    // Category stats
    const category = paper.analysis?.category || paper.category || 'other';
    stats.categories[category] = (stats.categories[category] || 0) + 1;

    // Source stats
    const source = paper.source || 'unknown';
    stats.sources[source] = (stats.sources[source] || 0) + 1;

    // Score stats
    const score = paper.analysis?.relevance_score || 5;
    stats.scores.push(score);

    // Date stats
    const date = paper.archive_date || paper.published?.split('T')[0] || 'unknown';
    if (!stats.dates.includes(date)) {
      stats.dates.push(date);
    }

    // Keywords
    if (paper.analysis?.keywords) {
      paper.analysis.keywords.forEach(keyword => stats.keywords.add(keyword));
    }
  });

  // Calculate averages
  const avgScore = stats.scores.length > 0 ?
    stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length : 0;

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

export function groupPapersByDate(papers) {
  const grouped = {};

  papers.forEach(paper => {
    const date = paper.archive_date || paper.published?.split('T')[0] || 'unknown';
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(paper);
  });

  return grouped;
}

export function getPaginationParams(url) {
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 20;

  if (page < 1) throw new AppError('Page must be greater than 0', 400);
  if (limit < 1 || limit > 100) throw new AppError('Limit must be between 1 and 100', 400);

  return { page, limit };
}

export function paginateArray(array, page, limit) {
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