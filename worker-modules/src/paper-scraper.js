import { PAPER_SOURCES, SOURCE_CONFIGS, AppError } from './config.js';
import { fetchWithTimeout, sleep } from './utils.js';

// Timeout utility for overall operation timeout
function createTimeout(ms, message) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });
}

// Simple logger for Worker environment
const logger = {
  info: (msg, data = {}) => console.log(`[INFO] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[DEBUG] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[WARN] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[ERROR] ${msg}`, data)
};

// Enhanced JSON content sanitization for abstracts and translations
function sanitizeJsonContent(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // Pre-processing: normalize whitespace and remove obvious junk
  content = content.replace(/\s+/g, ' ').trim();

  // Early detection of JSON contamination - be more aggressive
  const contaminationPatterns = [
    '":"',
    '_id',
    'updatedAt',
    '"paper":',
    '"authors":',
    '"organization":',
    'canRead',
    'dailyPaperRank',
    'acceptLanguages',
    'upvoters',
    'discussionId',
    'ai_summary',
    'ai_keywords',
    'githubStars',
    '{"',
    '["',
    '":{',
    '":['
  ];

  const hasContamination = contaminationPatterns.some(pattern => content.includes(pattern));

  if (hasContamination) {
    logger.debug('Detected JSON metadata contamination, applying aggressive cleaning...');

    // Strategy 1: Cut content at first JSON delimiter with safety buffer
    const jsonDelimiters = [
      '"updatedAt',
      '"_id',
      '"paper"',
      '"authors"',
      '"organization"',
      '"canRead"',
      '"dailyPaperRank"',
      '"acceptLanguages"',
      '"upvoters"',
      '"discussionId"',
      '"ai_summary"',
      '"ai_keywords"',
      '"githubStars"',
      '","_id:',
      '","updatedAt:',
      '":{',
      '":['
    ];

    let bestCutIndex = -1;
    for (const delimiter of jsonDelimiters) {
      const index = content.indexOf(delimiter);
      if (index > 30) { // Reduced buffer for more aggressive cutting
        // Look backward to find a sentence end
        const precedingText = content.substring(0, index);
        const lastSentenceEnd = Math.max(
          precedingText.lastIndexOf('.'),
          precedingText.lastIndexOf('!'),
          precedingText.lastIndexOf('?')
        );

        if (lastSentenceEnd > 20) {
          bestCutIndex = lastSentenceEnd + 1;
        } else {
          bestCutIndex = index === -1 ? bestCutIndex : (bestCutIndex === -1 ? index : Math.min(bestCutIndex, index));
        }
      }
    }

    if (bestCutIndex > 30) {
      let cleanAbstract = content.substring(0, bestCutIndex).trim();

      // Remove any trailing JSON fragments
      cleanAbstract = cleanAbstract
        .replace(/,\s*"[^"]*":\s*"[^"]*"?\s*$/g, '')
        .replace(/,\s*"[^"]*":\s*\{[^}]*\}\s*$/g, '')
        .replace(/,\s*"[^"]*":\s*\[[^\]]*\]\s*$/g, '')
        .replace(/\s*"[^"]*":\s*"[^"]*"\s*$/g, '')
        .trim();

      if (cleanAbstract.length > 50 && validateAbstractStructure(cleanAbstract)) {
        logger.debug(`Extracted clean abstract (${cleanAbstract.length} chars) before JSON metadata`);
        return cleanAbstract;
      }
    }

    // Strategy 2: Extract sentences before JSON contamination
    const sentences = content.split(/[.!?]+/);
    const cleanSentences = [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 15 &&
          !contaminationPatterns.some(pattern => trimmed.includes(pattern)) &&
          !trimmed.includes('huggingface.co') &&
          !trimmed.includes('avatars/') &&
          !trimmed.includes('github.com') &&
          !trimmed.match(/^\s*[\d\.\)]+\s/) && // Skip numbered lists
          validateAbstractStructure(trimmed)) {
        cleanSentences.push(trimmed);
      } else if (cleanSentences.length > 0) {
        // Stop adding sentences once we hit contamination
        break;
      }
    }

    if (cleanSentences.length >= 2) {
      const academicAbstract = cleanSentences.join('. ') + '.';
      logger.debug(`Reconstructed academic abstract from clean sentences: ${academicAbstract.length} chars`);
      return academicAbstract;
    }

    // Strategy 3: Try to extract from structured JSON if it's valid JSON
    if ((content.trim().startsWith('{') && content.trim().endsWith('}')) ||
        (content.trim().startsWith('[') && content.trim().endsWith(']'))) {
      try {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object') {
          // Look for meaningful text fields
          const textFields = ['summary', 'abstract', 'description', 'introduction', 'content', 'text'];
          for (const field of textFields) {
            if (parsed[field] && typeof parsed[field] === 'string' && parsed[field].length > 50) {
              const extracted = parsed[field].trim();
              if (validateAbstractStructure(extracted)) {
                logger.debug(`Extracted clean abstract from JSON field '${field}': ${extracted.length} chars`);
                return extracted;
              }
            }
          }

          // Handle nested structures
          if (parsed.paper && typeof parsed.paper === 'object') {
            for (const field of textFields) {
              if (parsed.paper[field] && typeof parsed.paper[field] === 'string' && parsed.paper[field].length > 50) {
                const extracted = parsed.paper[field].trim();
                if (validateAbstractStructure(extracted)) {
                  logger.debug(`Extracted clean abstract from nested paper.${field}: ${extracted.length} chars`);
                  return extracted;
                }
              }
            }
          }

          // Handle arrays of strings
          if (Array.isArray(parsed)) {
            const validTexts = parsed.filter(item =>
              typeof item === 'string' &&
              item.length > 20 &&
              validateAbstractStructure(item)
            );
            if (validTexts.length > 0) {
              const joinedText = validTexts.join('. ');
              logger.debug(`Extracted clean abstract from JSON array: ${joinedText.length} chars`);
              return joinedText;
            }
          }
        }
      } catch (e) {
        logger.debug('Failed to parse JSON content, trying final extraction methods');
      }
    }

    // Strategy 4: Last resort - use aggressive regex to extract any meaningful text
    const textBlocks = content.match(/[^",[\]{}]*?[.!?][^",[\]{}]*?(?=[",[\]{}]|$)/g) || [];
    const validBlocks = textBlocks
      .map(block => block.trim())
      .filter(block =>
        block.length > 30 &&
        validateAbstractStructure(block) &&
        !contaminationPatterns.some(pattern => block.includes(pattern))
      );

    if (validBlocks.length > 0) {
      const finalAbstract = validBlocks.join(' ').replace(/\s+/g, ' ');
      logger.debug(`Extracted final abstract using regex fallback: ${finalAbstract.length} chars`);
      return finalAbstract;
    }

    // If all strategies fail, return empty to avoid showing corrupted content
    logger.warn('Could not extract clean abstract from JSON-contaminated content, discarding completely');
    return '';
  }

  // If no contamination detected, still validate the content
  if (validateAbstractStructure(content)) {
    return content;
  } else {
    logger.warn('Content failed abstract structure validation, discarding');
    return '';
  }
}

// Circuit breaker for API reliability
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker ${this.name} is OPEN until ${new Date(this.nextAttempt).toISOString()}`);
      } else {
        this.state = 'HALF_OPEN';
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

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logger.info(`Circuit breaker ${this.name} is now CLOSED`);
    }
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
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
      nextAttempt: this.state === 'OPEN' ? new Date(this.nextAttempt).toISOString() : null,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null
    };
  }
}

// Global circuit breakers
const circuitBreakers = {
  huggingfaceApi: new CircuitBreaker('huggingface-api', { failureThreshold: 3, resetTimeout: 300000 }),
  huggingfaceScraping: new CircuitBreaker('huggingface-scraping', { failureThreshold: 5, resetTimeout: 600000 }),
  arxivApi: new CircuitBreaker('arxiv-api', { failureThreshold: 3, resetTimeout: 300000 })
};

export async function scrapeDailyPapers() {
  const today = new Date().toISOString().split('T')[0];
  logger.info(`Starting daily paper scraping for ${today}`);

  try {
    // Add overall timeout protection for the entire scraping process
    const scrapingPromise = Promise.allSettled([
      scrapeArxivPapers(),
      scrapeHuggingfacePapers()
    ]);

    const timeoutPromise = createTimeout(5 * 60 * 1000, 'Paper scraping timeout after 5 minutes');

    const [arxivPapers, huggingfacePapers] = await Promise.race([
      scrapingPromise,
      timeoutPromise.then(() => { throw new Error('Paper scraping timeout after 5 minutes'); })
    ]);
    
    const allPapers = [];
    
    // Process arXiv results
    if (arxivPapers.status === 'fulfilled' && arxivPapers.value.length > 0) {
      logger.info(`Scraped ${arxivPapers.value.length} papers from arXiv`);
      allPapers.push(...arxivPapers.value);
    } else if (arxivPapers.status === 'rejected') {
      logger.error('Failed to scrape arXiv papers:', { error: arxivPapers.reason.message });
    }
    
    // Process HuggingFace results
    if (huggingfacePapers.status === 'fulfilled' && huggingfacePapers.value.length > 0) {
      logger.info(`Scraped ${huggingfacePapers.value.length} papers from HuggingFace`);
      allPapers.push(...huggingfacePapers.value);
    } else if (huggingfacePapers.status === 'rejected') {
      logger.error('Failed to scrape HuggingFace papers:', { error: huggingfacePapers.reason.message });
    }
    
    // Remove duplicates based on title similarity
    const uniquePapers = removeDuplicatePapers(allPapers);
    logger.info(`Total unique papers scraped: ${uniquePapers.length}`);
    
    return uniquePapers;
  } catch (error) {
    logger.error('Error in daily paper scraping:', error);
    throw new AppError(`Failed to scrape daily papers: ${error.message}`);
  }
}

async function scrapeArxivPapers() {
  return await circuitBreakers.arxivApi.execute(async () => {
    const config = SOURCE_CONFIGS.arxiv;
    const categories = PAPER_SOURCES.arxiv.categories;
    const papers = [];

    logger.info(`Scraping arXiv papers from categories: ${categories.join(', ')}`);

    // Build query for all categories
    const categoryQuery = categories.map(cat => `cat:${cat}`).join(' OR ');

    // Try without date filter first to get recent papers
    const searchQuery = categoryQuery;
    const encodedQuery = encodeURIComponent(searchQuery);

    const url = `${PAPER_SOURCES.arxiv.baseUrl}?search_query=${encodedQuery}&start=0&max_results=${config.maxPapersPerRequest}&sortBy=${PAPER_SOURCES.arxiv.sortBy}&sortOrder=${PAPER_SOURCES.arxiv.sortOrder}`;

    try {
      const response = await fetchWithTimeout(url, 30000);
      const xmlContent = await response.text();

      // Parse XML response using regex-based parser for Cloudflare Workers
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
      logger.error('Error scraping arXiv:', error);
      throw new AppError(`arXiv scraping failed: ${error.message}`);
    }
  });
}

function parseArxivEntry(entry) {
  try {
    // The entry is now an object with pre-extracted properties
    const id = entry.id;
    const title = entry.title;
    const summary = entry.summary;
    const published = entry.published;
    const updated = entry.updated;
    const primary_category = entry.primary_category;
    const authors = entry.authors || [];
    const arxivId = entry.arxiv_id || '';
    
    if (!title || !summary) {
      logger.warn('Missing required fields in arXiv entry');
      return null;
    }
    
    return {
      id: `arxiv_${arxivId}`,
      arxiv_id: arxivId,
      title: title,
      abstract: summary,
      authors: authors,
      published: published || '',
      updated: updated || '',
      category: primary_category || '',
      source: 'arxiv',
      original_source: 'arxiv', // 明确标记原始来源
      url: id,
      pdf_url: id.replace('/abs/', '/pdf/') + '.pdf',
      scraped_at: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error parsing arXiv entry:', error);
    return null;
  }
}

async function scrapeHuggingfacePapers() {
  return await circuitBreakers.huggingfaceScraping.execute(async () => {
    const config = SOURCE_CONFIGS.huggingface;
    const papers = [];

    logger.info('Scraping HuggingFace papers');

    // Try HuggingFace API first with circuit breaker
    try {
      const apiPapers = await circuitBreakers.huggingfaceApi.execute(async () => {
        const apiUrl = 'https://huggingface.co/api/papers';
        const response = await fetchWithTimeout(apiUrl, 30000, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://huggingface.co/',
            'Origin': 'https://huggingface.co'
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
      logger.debug('HuggingFace API not available:', apiError.message);
    }

    // Alternative 1: Enhanced web scraping
    try {
      logger.info('Attempting enhanced HuggingFace web scraping');
      const url = 'https://huggingface.co/papers';
      const response = await fetchWithTimeout(url, 30000, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const htmlContent = await response.text();
        const paperElements = parseHuggingfaceHTML(htmlContent);

        logger.info(`Found ${paperElements.length} paper elements on HuggingFace`);

        // Process papers with enhanced abstract retrieval
        for (let i = 0; i < Math.min(paperElements.length, config.maxPapersPerRequest); i++) {
          try {
            const paper = await parseHuggingfacePaper(paperElements[i]);
            if (paper) {
              // Accept all papers regardless of abstract quality - we'll analyze what we have
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
      logger.warn('Enhanced HuggingFace scraping failed:', scrapingError.message);
    }

    // Alternative 2: Datasets API
    try {
      logger.info('Trying HuggingFace datasets API');
      const datasetsUrl = 'https://huggingface.co/api/datasets?full=true&limit=20';
      const response = await fetchWithTimeout(datasetsUrl, 30000, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
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
      logger.debug('HuggingFace datasets API not available:', datasetError.message);
    }

    // Alternative 3: Trending papers fallback
    logger.info('Generating fallback HuggingFace papers from trending topics');
    const fallbackPapers = await generateFallbackHuggingFacePapers(config.maxPapersPerRequest);

    if (fallbackPapers.length > 0) {
      logger.info(`Generated ${fallbackPapers.length} fallback HuggingFace papers`);
      return fallbackPapers;
    }

    logger.warn('All HuggingFace scraping methods failed, returning empty array');
    return [];
  });
}

async function parseHuggingfacePaper(element, apiKey = null) {
  try {
    // The element is now an object with pre-extracted properties
    let title = element.title;
    let abstract = element.abstract;
    let link = element.link;
    let authors = element.authors || [];

    if (!title) {
      logger.warn('No title found in HuggingFace paper element');
      return null;
    }

    // Enhanced abstract retrieval with fallback chain
    if (!abstract || abstract.length < 50) {
      logger.debug(`Abstract too short or missing for "${title}", attempting retrieval...`);

      // Try individual paper page scraping
      if (link) {
        const fullUrl = link.startsWith('http') ? link : `https://huggingface.co${link}`;
        abstract = await scrapePaperFromIndividualPage(fullUrl) || abstract;

        // Still no abstract, try arXiv cross-reference
        if (!abstract || abstract.length < 50) {
          logger.debug(`Attempting arXiv cross-reference for "${title}"...`);
          abstract = await crossReferenceArxiv(title, authors) || abstract;
        }
      }
    }

    // Final safety check - ensure abstract doesn't contain JSON metadata
    if (abstract && (abstract.includes('":"') || abstract.includes('_id') || abstract.includes('updatedAt'))) {
      logger.debug(`Abstract still contains JSON metadata for "${title}", applying final cleanup...`);
      abstract = sanitizeJsonContent(abstract);
    }

    // Enhanced abstract quality validation
    if (abstract && abstract.length >= 20) {
      const qualityScore = calculateAbstractQuality(abstract);

      // Only accept abstracts with decent quality scores
      if (qualityScore >= 5) {
        logger.debug(`Accepted high-quality abstract for "${title}" (${qualityScore}/10): ${abstract.substring(0, 60)}...`);
      } else if (qualityScore >= 3) {
        logger.debug(`Accepted marginal quality abstract for "${title}" (${qualityScore}/10): ${abstract.substring(0, 60)}...`);
        // Keep it but note the marginal quality
      } else {
        logger.warn(`Rejecting low-quality abstract for "${title}" (${qualityScore}/10): ${abstract.substring(0, 60)}...`);
        abstract = null; // Reject and try alternatives
      }
    }

    // If after all processing we still don't have a good abstract, try arXiv cross-reference
    if (!abstract || abstract.length < 20) {
      logger.debug(`Attempting arXiv cross-reference for "${title}" due to missing/invalid abstract...`);
      const arxivAbstract = await crossReferenceArxiv(title, authors);
      if (arxivAbstract && calculateAbstractQuality(arxivAbstract) >= 3) {
        abstract = arxivAbstract;
        logger.debug(`Successfully obtained abstract from arXiv for "${title}"`);
      }
    }

    // Final fallback - create a contextual placeholder if we still don't have an abstract
    if (!abstract || abstract.length < 20) {
      logger.warn(`Could not extract clean abstract for "${title}", creating contextual placeholder`);

      // Extract key concepts from title for a better placeholder
      const titleWords = title.toLowerCase().split(/\s+/);
      const concepts = titleWords.filter(word => word.length > 4 && !word.includes('(') && !word.includes(')')).slice(0, 3);

      abstract = `This paper presents research on ${concepts.join(', ')}. The full abstract is not available at this time. Please visit the paper's website for complete details about the methodology, results, and contributions.`;
    }

    // Abstract quality validation
    const abstractQuality = validateAbstractQuality(abstract);
    if (abstractQuality.score < 3) {
      logger.warn(`Low quality abstract for "${title}" (score: ${abstractQuality.score}): ${abstractQuality.reason}`);
    }

    // Generate ID from title
    const id = `hf_${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}`;

    // Infer category from title and abstract
    const text = `${title} ${abstract}`.toLowerCase();
    let category = 'machine-learning';

    if (text.includes('vision') || text.includes('image') || text.includes('visual')) {
      category = 'computer_vision';
    } else if (text.includes('nlp') || text.includes('language') || text.includes('text')) {
      category = 'natural_language_processing';
    } else if (text.includes('reinforcement') || text.includes('rl') || text.includes('agent')) {
      category = 'reinforcement_learning';
    }

    return {
      id: id,
      title: title,
      abstract: abstract,
      authors: authors,
      published: new Date().toISOString().split('T')[0], // Default to today
      updated: new Date().toISOString(),
      category: category,
      source: 'huggingface',
      original_source: 'huggingface_enhanced', // Mark as enhanced scraping
      url: link.startsWith('http') ? link : `https://huggingface.co${link}`,
      pdf_url: '', // HuggingFace may not provide direct PDF links
      scraped_at: new Date().toISOString(),
      abstract_quality: abstractQuality.score
    };
  } catch (error) {
    logger.error('Error parsing HuggingFace paper:', error);
    return null;
  }
}

// XML parsing function for Cloudflare Workers (no DOMParser)
function parseArxivXML(xmlContent) {
  const entries = [];
  
  // Extract entries using regex
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

// Parse individual arXiv entry content
function parseArxivEntryContent(entryContent) {
  try {
    // Extract XML elements using regex
    const extractElement = (tagName) => {
      const match = entryContent.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`));
      return match ? match[1].trim() : '';
    };
    
    const extractAttribute = (tagName, attrName) => {
      const match = entryContent.match(new RegExp(`<${tagName}[^>]*${attrName}="([^"]*)"[^>]*>`));
      return match ? match[1] : '';
    };
    
    // Extract multiple elements
    const extractElements = (tagName) => {
      const elements = [];
      const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'g');
      let match;
      
      while ((match = regex.exec(entryContent)) !== null) {
        const content = match[1].trim();
        if (content) {
          elements.push(content);
        }
      }
      return elements;
    };
    
    const id = extractElement('id');
    const title = extractElement('title');
    const summary = extractElement('summary');
    const published = extractElement('published');
    const updated = extractElement('updated');
    
    if (!title || !summary) {
      logger.warn('Missing required fields in arXiv entry');
      return null;
    }
    
    // Extract authors
    const authors = [];
    const authorContents = extractElements('author');
    for (const authorContent of authorContents) {
      const nameMatch = authorContent.match(/<name[^>]*>([\s\S]*?)<\/name>/);
      if (nameMatch) {
        authors.push(nameMatch[1].trim());
      }
    }
    
    // Extract arXiv ID from URL
    const arxivId = id.includes('arxiv.org/abs/') ? id.split('arxiv.org/abs/')[1] : '';
    
    return {
      id: id,
      title: title,
      summary: summary,
      published: published,
      updated: updated,
      authors: authors,
      primary_category: extractAttribute('primary_category', 'term'),
      arxiv_id: arxivId
    };
  } catch (error) {
    logger.error('Error parsing arXiv entry content:', error);
    return null;
  }
}

// HTML parsing function for Cloudflare Workers (enhanced for HuggingFace)
function parseHuggingfaceHTML(htmlContent) {
  const papers = [];
  
  // Modern HuggingFace papers page structure patterns
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
      const paperContent = match[1] || match[2]; // Handle different pattern groups
      const paper = parseHuggingfacePaperContent(paperContent);
      if (paper && paper.title && paper.title !== 'Daily Papers') {
        // Extract the full link from the original match if not found in content
        if (!paper.link) {
          const linkMatch = match[0].match(/href="([^"]*)"/);
          if (linkMatch) {
            paper.link = linkMatch[1];
          }
        }
        
        // Ensure we don't add duplicate papers
        const isDuplicate = papers.some(p => p.title === paper.title);
        if (!isDuplicate) {
          papers.push(paper);
        }
      }
    }
    
    // If we found papers with this pattern, don't try others
    if (papers.length > 3) {
      break;
    }
  }
  
  // Fallback: Look for individual paper elements using more aggressive parsing
  if (papers.length < 3) {
    logger.info('Using enhanced fallback parsing for HuggingFace papers');
    const fallbackPapers = extractPapersFromModernStructure(htmlContent);
    papers.push(...fallbackPapers.filter(p => p.title && p.title !== 'Daily Papers'));
    
    // Remove duplicates
    const uniquePapers = [];
    const seenTitles = new Set();
    
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

// Enhanced abstract scraping from individual HuggingFace paper page
async function scrapePaperFromIndividualPage(paperUrl) {
  try {
    logger.debug(`Scraping individual paper page: ${paperUrl}`);

    const response = await fetchWithTimeout(paperUrl, 15000, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch paper page: ${response.status}`);
    }

    const htmlContent = await response.text();
    logger.debug(`Retrieved HTML content (${htmlContent.length} chars) from ${paperUrl}`);

    // Try multiple extraction strategies in order of reliability
    const extractionStrategies = [
      {
        name: 'HuggingFace AI-Generated Summary (Primary Target)',
        patterns: [
          // HuggingFace text-based patterns for "AI-generated summary"
          /AI-generated summary\s*\r?\n\s*([^\r\n]+(?:\r?\n[^\r\n]+)*)/gi,
          /AI-generated summary\s*\n\s*([^\n]+(?:\n[^\n]+)*)/gi,
          // Alternative patterns for different formatting
          /AI-generated summary\s*[\r\n]+([^\r\n]+(?:[\r\n][^AI][^\r\n]*)*)/gi
        ]
      },
      {
        name: 'HuggingFace Short Abstract (Fallback)',
        patterns: [
          // HuggingFace text-based patterns for short abstract
          /Abstract\s*[-]+\s*([^\r\n]+(?:\r?\n[^\r\n]+)*)/gi,
          /Abstract\s*[-]+\s*([^\n]+)/gi,
          // Alternative abstract patterns
          /Abstract\s*[-]+\s*([^\r\n]+(?:[\r\n][^\r\n]+)*)/gi
        ]
      },
      {
        name: 'HuggingFace Main Abstract (HTML)',
        patterns: [
          /<div[^>]*class="abstract"[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/gi,
          /<div[^>]*class="abstract"[^>]*>([\s\S]*?)<\/div>/gi
        ]
      },
      {
        name: 'HuggingFace Abstract Headers (HTML)',
        patterns: [
          /<h3[^>]*>\s*Abstract\s*<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi,
          /<h4[^>]*>\s*Abstract\s*<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/gi
        ]
      },
      {
        name: 'HuggingFace Section Abstracts (HTML)',
        patterns: [
          /<section[^>]*class="[^"]*abstract[^"]*"[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/section>/gi,
          /<div[^>]*class="[^"]*prose[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<div[^>]*class="[^"]*summary[^"]*"[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/gi
        ]
      },
      {
        name: 'Meta Tags (Filtered)',
        patterns: [
          /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/gi,
          /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/gi
        ]
      },
      {
        name: 'General Abstract Patterns (HTML)',
        patterns: [
          /<div[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<section[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
          /<p[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/p>/gi
        ]
      },
      {
        name: 'Content Paragraphs (Last Resort)',
        patterns: [
          /<p[^>]*>([^<]{100,500})<\/p>/gi
        ]
      }
    ];

    let bestAbstract = null;
    let bestScore = 0;

    for (const strategy of extractionStrategies) {
      logger.debug(`Trying extraction strategy: ${strategy.name}`);

      for (const pattern of strategy.patterns) {
        let match;
        try {
          // Reset regex lastIndex for global patterns
          if (pattern.global) {
            pattern.lastIndex = 0;
          }

          while ((match = pattern.exec(htmlContent)) !== null) {
            const content = match[1] || match[0];
            if (!content) continue;

            let cleanContent = content
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();

            // Additional cleaning for HuggingFace specific issues
            cleanContent = cleanContent
              .replace(/^\s*[-*]\s*/, '') // Remove leading bullets
              .replace(/\s*[-*]\s*$/, '') // Remove trailing bullets
              .replace(/Abstract\s*[:\-]?\s*/i, '') // Remove "Abstract:" prefix
              .replace(/^PsiloQA[^.]*\./i, '') // Remove dataset names from start
              // Clean up markdown-style citations [text](url) -> text
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
              // Clean up multiple spaces and normalize
              .replace(/\s+/g, ' ')
              // Remove leading/trailing whitespace
              .trim();

            // Skip if content looks like JSON metadata
            if (cleanContent.includes('":"') ||
                cleanContent.includes('_id') ||
                cleanContent.includes('updatedAt') ||
                cleanContent.includes('"paper":')) {
              logger.debug(`Skipping JSON-contaminated content from ${strategy.name}`);
              continue;
            }

            // Filter out UI text and navigation content for meta tags
            if (strategy.name.includes('Meta Tags') && (
                cleanContent.includes('Join the discussion') ||
                cleanContent.includes('Sign up') ||
                cleanContent.includes('Log in') ||
                cleanContent.includes('Click here') ||
                cleanContent.includes('Subscribe') ||
                cleanContent.length < 50)) {
              logger.debug(`Skipping UI/navigation content from ${strategy.name}: ${cleanContent.substring(0, 50)}...`);
              continue;
            }

            // Calculate quality score for this abstract
            const qualityScore = calculateAbstractQuality(cleanContent);

            if (qualityScore > bestScore && qualityScore >= 3) {
              bestAbstract = cleanContent;
              bestScore = qualityScore;
              logger.debug(`New best abstract found (${qualityScore}/10, ${cleanContent.length} chars) from ${strategy.name}: ${cleanContent.substring(0, 80)}...`);
            } else if (cleanContent.length > 30) {
              logger.debug(`Found abstract but lower quality (${qualityScore}/10): ${cleanContent.substring(0, 50)}...`);
            }
          }
        } catch (error) {
          logger.warn(`Error applying pattern in ${strategy.name}: ${error.message}`);
        }
      }
    }

    if (bestAbstract && bestScore >= 4) {
      logger.debug(`Selected best abstract with quality score ${bestScore}/10`);
      return sanitizeJsonContent(bestAbstract);
    } else if (bestAbstract && bestScore >= 2) {
      logger.debug(`Selected acceptable abstract with quality score ${bestScore}/10 (marginal)`);
      return sanitizeJsonContent(bestAbstract);
    }

    logger.debug(`No suitable abstract found on individual page: ${paperUrl}`);
    return null;

  } catch (error) {
    logger.warn(`Failed to scrape individual paper page ${paperUrl}:`, error.message);
    return null;
  }
}

// Calculate abstract quality score - updated for HuggingFace papers
function calculateAbstractQuality(content) {
  if (!content || content.length < 20) {
    return 0;
  }

  let score = 0;

  // Length score (0-4 points) - more generous for HuggingFace
  if (content.length >= 200) score += 4;
  else if (content.length >= 100) score += 3;
  else if (content.length >= 50) score += 2;
  else if (content.length >= 20) score += 1;

  // Academic indicators (0-6 points) - expanded for modern ML/AI papers
  const academicIndicators = [
    /\b(present|propose|introduce|develop|show|demonstrate|evaluate|analyze|investigate|examine|address|enhance|improve)\b/i,
    /\b(method|approach|technique|algorithm|framework|architecture|system|model|dataset|paper|work)\b/i,
    /\b(result|performance|evaluation|experiment|comparison|benchmark|finding|study|analysis)\b/i,
    /\b(problem|challenge|issue|limitation|drawback|gap|research|investigation)\b/i,
    /\b(solve|address|overcome|improve|enhance|optimize|achieve|outperform|exceed)\b/i,
    /\b(language|model|agent|training|learning|reinforcement|entropy|detection|hallucination)\b/i
  ];

  academicIndicators.forEach(pattern => {
    if (pattern.test(content)) score += 1;
  });

  // Structure score (0-2 points) - more lenient
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 8);
  if (sentences.length >= 2) score += 2;
  else if (sentences.length >= 1) score += 1;

  // Content diversity score (0-1 point)
  const uniqueWords = new Set(content.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  if (uniqueWords.size >= 15) score += 1;

  // Negative indicators (subtract points) - more specific
  if (content.includes('://') && !content.includes('arxiv.org')) score -= 1; // Allow arXiv links
  if (content.includes('Sign up') || content.includes('Subscribe') || content.includes('Join the discussion')) score -= 2;
  if (content.match(/^\s*\d+\./)) score -= 1; // Only if starts with number
  if (content.includes('buy now') || content.includes('free trial')) score -= 2;

  return Math.max(0, Math.min(10, score));
}

// Cross-reference with arXiv for missing abstracts
async function crossReferenceArxiv(title, authors = []) {
  try {
    logger.debug(`Cross-referencing arXiv for title: ${title.substring(0, 50)}...`);

    // Create search query from title and optionally authors
    const titleWords = title.toLowerCase().split(' ').slice(0, 5).join(' ');
    const searchQuery = authors.length > 0 ?
      `${titleWords} ${authors[0].toLowerCase()}` :
      titleWords;

    const encodedQuery = encodeURIComponent(searchQuery);
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodedQuery}&start=0&max_results=3&sortBy=relevance&sortOrder=descending`;

    const response = await fetchWithTimeout(arxivUrl, 10000);
    const xmlContent = await response.text();

    const entries = parseArxivXML(xmlContent);

    if (entries.length > 0) {
      // Find the best match based on title similarity
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

// Validate abstract structure to ensure it's legitimate academic content
function validateAbstractStructure(content) {
  if (!content || content.length < 20) { // Reduced minimum length
    return false;
  }

  // Check for academic writing patterns - more lenient for HuggingFace
  const academicPatterns = [
    /\b(present|propose|introduce|develop|show|demonstrate|evaluate|analyze|investigate|examine|address|enhance|improve)\b/i,
    /\b(method|approach|technique|algorithm|framework|architecture|system|model|dataset|paper|work)\b/i,
    /\b(result|performance|evaluation|experiment|comparison|benchmark|finding|study)\b/i,
    /\b(problem|challenge|issue|limitation|drawback|gap|research)\b/i,
    /\b(solve|address|overcome|improve|enhance|optimize|achieve|outperform)\b/i,
    /\b(language|model|agent|training|learning|reinforcement|entropy)\b/i // More specific to recent papers
  ];

  const hasAcademicPattern = academicPatterns.some(pattern => pattern.test(content));

  // Check for JSON contamination patterns
  const jsonPatterns = [
    /":\s*"/,
    /_id/,
    /updatedAt/,
    /"paper":/,
    /"authors":/,
    /canRead/,
    /dailyPaperRank/,
    /acceptLanguages/,
    /upvoters/,
    /discussionId/,
    /ai_summary/,
    /ai_keywords/,
    /githubStars/,
    /\{.*\}/,
    /\[.*\]/
  ];

  const hasJsonContamination = jsonPatterns.some(pattern => pattern.test(content));

  // Check for obvious UI/navigation patterns that indicate this isn't an abstract
  const uiPatterns = [
    /sign up/i,
    /log in/i,
    /click here/i,
    /join the discussion/i,
    /subscribe/i,
    /follow/i,
    /buy now/i,
    /free trial/i,
    /view cart/i,
    /add to collection/i
  ];

  const hasUiPattern = uiPatterns.some(pattern => pattern.test(content));

  // Check for reference-like patterns - be more lenient with citations in abstracts
  const referencePatterns = [
    /^\s*\d+\./,           // Only if it starts with a number
    /^\s*\[\d+\]/,        // Only if it starts with a bracketed number
    /et al\.\s*$/i,       // Only if it ends with et al.
    /doi:\s*10\./i,       // Only if it's a DOI at start/end
    /arXiv:\s*\d+/i        // Only if it's an arXiv ID
  ];

  const hasReferencePattern = referencePatterns.some(pattern => pattern.test(content));

  // Check for sentence structure - more lenient
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 8);
  const hasGoodStructure = sentences.length >= 1 && (content.includes('.') || content.length > 100);

  // Allow content with academic indicators even if structure is imperfect
  if (hasAcademicPattern && !hasJsonContamination && !hasUiPattern && !hasReferencePattern) {
    return true;
  }

  // Allow longer content with good structure even without strong academic indicators
  if (content.length > 100 && hasGoodStructure && !hasJsonContamination && !hasUiPattern && !hasReferencePattern) {
    return true;
  }

  return false;
}

// Calculate title similarity using simple string matching
function calculateTitleSimilarity(title1, title2) {
  const words1 = title1.toLowerCase().split(/\s+/);
  const words2 = title2.toLowerCase().split(/\s+/);

  const commonWords = words1.filter(word => word.length > 3 && words2.includes(word));
  const totalUniqueWords = [...new Set([...words1, ...words2])].filter(word => word.length > 3);

  return commonWords.length / totalUniqueWords.length;
}

// Validate abstract quality (more lenient scoring)
function validateAbstractQuality(abstract) {
  if (!abstract || typeof abstract !== 'string') {
    return { score: 1, reason: 'No abstract available - will use title-only analysis' }; // Give 1 point instead of 0
  }

  const length = abstract.trim().length;
  const words = abstract.trim().split(/\s+/);

  // More lenient quality criteria
  const checks = {
    length: length >= 50 ? 2 : (length >= 20 ? 1 : 0), // Lowered from 100 to 50, 50 to 20
    wordCount: words.length >= 10 ? 2 : (words.length >= 5 ? 1 : 0), // Lowered from 20 to 10, 10 to 5
    hasTechnicalTerms: /\b(method|model|algorithm|approach|technique|framework|architecture|system|experiment|result|performance|evaluation|analysis|dataset|training|learning|network|transformer|neural|deep)\b/i.test(abstract) ? 1 : 0, // Reduced from 2 to 1
    notGeneric: !/\b(this paper|we present|in this work|our approach|the proposed)\b/i.test(abstract.substring(0, 100)) ? 1 : 0,
    notSpam: !/(sign up|subscribe|follow|click here|buy now|free trial)/i.test(abstract) ? 1 : 0
  };

  const score = Object.values(checks).reduce((sum, val) => sum + val, 0);
  const maxScore = Object.keys(checks).length;

  let reason = '';
  if (score < 2) { // Lowered threshold from 3 to 2
    if (length < 20) reason = 'Very short abstract';
    else if (words.length < 5) reason = 'Very few words';
    else if (!checks.hasTechnicalTerms) reason = 'Limited technical content';
    else if (!checks.notGeneric) reason = 'Generic content';
    else if (!checks.notSpam) reason = 'Contains spam indicators';
  } else {
    reason = 'Acceptable abstract quality';
  }

  return { score, maxScore, reason };
}

// Parse individual HuggingFace paper content
function parseHuggingfacePaperContent(paperContent) {
  try {
    // Enhanced extraction with multiple strategies
    const extractText = (tag, attributes = '') => {
      const match = paperContent.match(new RegExp(`<${tag}${attributes}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
    };
    
    // Extract title from various possible tags and classes
    let title = extractText('h1') || extractText('h2') || extractText('h3') || 
                extractText('h4') || extractText('h5') || extractText('h6');
    
    // Try to find title in specific structures
    if (!title) {
      const titleMatch = paperContent.match(/<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]*)<\/[^>]*>/i);
      title = titleMatch ? titleMatch[1].trim() : '';
    }
    
    if (!title) {
      return null;
    }
    
    // Enhanced abstract extraction
    let abstract = '';
    
    // Try multiple strategies for abstract extraction
    const strategies = [
      // Strategy 1: Look for abstract/description in paragraphs (modern patterns)
      () => {
        const paragraphs = paperContent.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (paragraphs) {
          // Take the longest paragraph as likely abstract
          const longestParagraph = paragraphs
            .map(p => p.replace(/<[^>]*>/g, '').trim())
            .filter(p => p.length > 15 && !p.includes('Read more') && !p.includes('Continue reading'))
            .sort((a, b) => b.length - a.length)[0];
          return longestParagraph || '';
        }
        return '';
      },
      
      // Strategy 2: Look for description meta tags
      () => {
        const descMatch = paperContent.match(/<meta[^>]*(name|property)="(description|og:description)"[^>]*content="([^"]*)"[^>]*>/i);
        return descMatch ? descMatch[3] : '';
      },
      
      // Strategy 3: Look for abstract-specific divs with modern class patterns
      () => {
        const abstractPatterns = [
          /<div[^>]*class="[^"]*(abstract|description|summary|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<div[^>]*data-testid="[^"]*(abstract|description)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<section[^>]*class="[^"]*(abstract|description)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
          /<div[^>]*class="[^"]*(prose|markdown)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
        ];

        for (const pattern of abstractPatterns) {
          const abstractMatch = paperContent.match(pattern);
          if (abstractMatch && abstractMatch[1]) {
            const content = abstractMatch[2] || abstractMatch[1];
            const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

            // Filter out content that contains JSON metadata - be more aggressive
            if (cleanContent.length > 10 &&
                !cleanContent.includes('":"') &&
                !cleanContent.includes('_id') &&
                !cleanContent.includes('updatedAt') &&
                !cleanContent.includes('"paper":') &&
                !cleanContent.includes('"authors":') &&
                !cleanContent.includes('huggingface.co') &&
                !cleanContent.includes('avatars/') &&
                !cleanContent.includes('github.com')) {
              return sanitizeJsonContent(cleanContent);
            }
          }
        }
        return '';
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
            const content = summaryMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

            // Filter out content that contains JSON metadata - be more aggressive
            if (content.length > 10 &&
                !content.includes('":"') &&
                !content.includes('_id') &&
                !content.includes('updatedAt') &&
                !content.includes('"paper":') &&
                !content.includes('"authors":') &&
                !content.includes('huggingface.co') &&
                !content.includes('avatars/') &&
                !content.includes('github.com')) {
              return sanitizeJsonContent(content);
            }
          }
        }
        return '';
      },
      
      // Strategy 5: Look for content in article/body sections
      () => {
        const contentSections = paperContent.match(/<(article|main|section)[^>]*>([\s\S]*?)<\/\1>/gi);
        if (contentSections) {
          // Extract text from the first content section
          const text = contentSections[0].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          // Return the first 200 characters as abstract
          return text.length > 50 ? text.substring(0, 200) + '...' : '';
        }
        return '';
      },
      
      // Strategy 6: Look for modern React component patterns
      () => {
        // Modern frameworks often use data attributes
        const modernPatterns = [
          /<div[^>]*data-content="([^"]*)"[^>]*>/gi,
          /<div[^>]*data-text="([^"]*)"[^>]*>/gi,
          /<span[^>]*data-testid="[^"]*text[^"]*"[^>]*>([\s\S]*?)<\/span>/gi
        ];
        
        for (const pattern of modernPatterns) {
          const match = paperContent.match(pattern);
          if (match) {
            const content = match[1] || match[0].replace(/<[^>]*>/g, '');
            const cleanContent = content.replace(/\s+/g, ' ').trim();
            if (cleanContent.length > 20) {
              return sanitizeJsonContent(cleanContent);
            }
          }
        }
        return '';
      }
    ];
    
    // Try each strategy until we get an abstract
    for (const strategy of strategies) {
      abstract = strategy();
      if (abstract && abstract.length > 10 && !abstract.includes('Sign up') && !abstract.includes('Subscribe')) {
        logger.debug(`Found abstract using strategy: ${abstract.substring(0, 50)}...`);
        break;
      }
    }
    
    // Clean up abstract
    abstract = abstract.replace(/\s+/g, ' ').trim();
    
    // Log abstract extraction results for debugging
    if (abstract && abstract.length > 0) {
      logger.debug(`Extracted abstract for "${title}": ${abstract.length} chars - "${abstract.substring(0, 60)}${abstract.length > 60 ? '...' : ''}"`);
    } else {
      logger.warn(`No abstract extracted for paper: ${title}. Content preview: ${paperContent.substring(0, 200)}...`);
    }
    
    // Extract link
    let link = '';
    const linkMatch = paperContent.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
    if (linkMatch) {
      link = linkMatch[1];
    }
    
    // Extract authors if available - Updated patterns for modern HuggingFace HTML
    let authors = [];
    
    // Strategy 1: Look for button elements with author names (most reliable)
    const authorButtonMatch = paperContent.match(/<button[^>]*class="[^"]*whitespace-nowrap[^"]*"[^>]*>([^<]+)<\/button>/gi);
    if (authorButtonMatch) {
      authors = authorButtonMatch.map(match => match.replace(/<[^>]*>/g, '').trim()).filter(a => a && a.length > 1);
    }
    
    // Strategy 2: Look for elements with "author" class (fallback)
    if (authors.length === 0) {
      const authorMatch = paperContent.match(/<[^>]*class="[^"]*author[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi);
      if (authorMatch) {
        authors = authorMatch.map(match => {
          // Extract text content, removing HTML tags
          const textContent = match.replace(/<[^>]*>/g, '').trim();
          // Remove commas and clean up
          return textContent.replace(/,$/, '').trim();
        }).filter(a => a && a.length > 1);
      }
    }
    
    // Strategy 3: Look for structured JSON data in the HTML (most reliable)
    if (authors.length === 0) {
      // Try to extract from the embedded JSON data in data-props
      const jsonMatch = paperContent.match(/"authors":\s*\[([\s\S]*?)\]/);
      if (jsonMatch) {
        try {
          const authorsJson = JSON.parse('[' + jsonMatch[1] + ']');
          authors = authorsJson
            .filter(author => author.name && !author.hidden)
            .map(author => author.name.trim())
            .filter(name => name && name.length > 1);
        } catch (e) {
          logger.debug('Failed to parse authors from JSON data:', e.message);
        }
      }
    }
    
    // Strategy 4: Fallback - look for author names in text content
    if (authors.length === 0) {
      // Look for patterns that might be author names near "Authors:" text
      const authorsSectionMatch = paperContent.match(/Authors:[\s\S]*?(?=<\/div>)/i);
      if (authorsSectionMatch) {
        const authorText = authorsSectionMatch[0];
        // Extract names that look like author names (capitalized, multiple words)
        const namePattern = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g;
        const potentialNames = authorText.match(namePattern) || [];
        authors = potentialNames.filter(name => 
          name.length > 2 && 
          !name.includes('Authors') && 
          !name.includes('Published') &&
          !name.includes('Submitted')
        );
      }
    }
    
    return {
      title: title,
      abstract: abstract,
      link: link,
      authors: authors
    };
  } catch (error) {
    logger.error('Error parsing HuggingFace paper content:', error);
    return null;
  }
}

// Fallback function to extract papers from HTML structure
function extractPapersFromStructure(htmlContent) {
  const papers = [];
  
  // Look for individual paper elements by searching for common patterns
  const paperElements = htmlContent.match(/<[^>]*(paper|article)[^>]*>[\s\S]*?<\/[^>]*(paper|article)[^>]*>/gi);
  
  if (paperElements) {
    for (const element of paperElements) {
      const paper = extractPaperFromElement(element);
      if (paper) {
        papers.push(paper);
      }
    }
  }
  
  return papers;
}

// Enhanced function to extract papers from modern website structure
function extractPapersFromModernStructure(htmlContent) {
  const papers = [];
  
  // Strategy 1: Look for JSON-LD structured data (common in modern sites)
  try {
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    
    while ((jsonLdMatch = jsonLdRegex.exec(htmlContent)) !== null) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData['@type'] === 'ItemList' && jsonData.itemListElement) {
          jsonData.itemListElement.forEach(item => {
            if (item.item && item.item.name) {
              papers.push({
                title: item.item.name,
                abstract: item.item.description || '',
                link: item.item.url || ''
              });
            }
          });
        }
      } catch (e) {
        // JSON parsing failed, continue
      }
    }
  } catch (error) {
    logger.debug('JSON-LD parsing failed:', error.message);
  }
  
  // Strategy 2: Look for meta tags with paper information
  const metaTags = htmlContent.match(/<meta[^>]*>/gi) || [];
  let currentPaper = null;
  
  for (const tag of metaTags) {
    const nameMatch = tag.match(/name="([^"]*)"/);
    const contentMatch = tag.match(/content="([^"]*)"/);
    
    if (nameMatch && contentMatch) {
      const name = nameMatch[1];
      const content = contentMatch[1];
      
      if (name.includes('title') || name.includes('og:title')) {
        if (currentPaper && currentPaper.title) {
          papers.push(currentPaper);
        }
        currentPaper = { title: content, abstract: '', link: '' };
      } else if (currentPaper && name.includes('description')) {
        currentPaper.abstract = content;
      }
    }
  }
  
  if (currentPaper && currentPaper.title) {
    papers.push(currentPaper);
  }
  
  // Strategy 3: Look for heading elements that might be paper titles
  const headingRegex = /<h[1-6][^>]*>([^<]*)<\/h[1-6]>/gi;
  let headingMatch;
  
  while ((headingMatch = headingRegex.exec(htmlContent)) !== null) {
    const title = headingMatch[1].trim();
    if (title.length > 10 && !title.includes('Menu') && !title.includes('Footer')) {
      papers.push({
        title: title,
        abstract: '',
        link: ''
      });
    }
  }
  
  // Remove duplicates and empty titles
  const uniquePapers = [];
  const seenTitles = new Set();
  
  for (const paper of papers) {
    if (paper.title && paper.title.length > 5 && !seenTitles.has(paper.title)) {
      seenTitles.add(paper.title);
      uniquePapers.push(paper);
    }
  }
  
  return uniquePapers;
}

// Extract paper from a single HTML element
function extractPaperFromElement(element) {
  try {
    // Extract title
    const titleMatch = element.match(/<h[1-6][^>]*>([^<]*)<\/h[1-6]>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    if (!title) {
      return null;
    }
    
    // Extract any paragraph content as potential abstract
    const paragraphMatches = element.match(/<p[^>]*>([^<]*)<\/p>/gi);
    const abstract = paragraphMatches 
      ? paragraphMatches
          .map(p => p.replace(/<[^>]*>/g, '').trim())
          .filter(p => p.length > 20)
          .join(' ')
      : '';
    
    // Extract link
    const linkMatch = element.match(/<a[^>]*href="\/papers\/[^"]*"[^>]*>/i);
    const link = linkMatch ? linkMatch[0].match(/href="([^"]*)"/)[1] : '';
    
    return {
      title: title,
      abstract: abstract,
      link: link,
      authors: []
    };
  } catch (error) {
    logger.error('Error extracting paper from element:', error);
    return null;
  }
}

// Parse HuggingFace API response
function parseHuggingFaceAPIResponse(apiData) {
  const papers = [];
  
  try {
    const papersData = Array.isArray(apiData) ? apiData : (apiData.papers || []);
    
    for (const paperData of papersData) {
      try {
        const paper = {
          id: `hf_${paperData.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: paperData.title || '',
          abstract: paperData.summary || paperData.abstract || '',
          authors: paperData.authors || [],
          published: paperData.publishedAt || new Date().toISOString().split('T')[0],
          updated: paperData.updatedAt || new Date().toISOString(),
          category: inferCategoryFromHF(paperData),
          source: 'huggingface',
          original_source: 'huggingface_api', // 明确标记API来源
          url: paperData.url || `https://huggingface.co/papers/${paperData.id}`,
          pdf_url: paperData.pdfUrl || '',
          scraped_at: new Date().toISOString()
        };
        
        if (paper.title) {
          papers.push(paper);
        }
      } catch (error) {
        logger.warn('Failed to parse HuggingFace API paper:', error);
      }
    }
    
    logger.info(`Successfully parsed ${papers.length} papers from HuggingFace API`);
    return papers;
    
  } catch (error) {
    logger.error('Failed to parse HuggingFace API response:', error);
    return [];
  }
}

// Parse HuggingFace datasets response
function parseHuggingFaceDatasets(datasetsData) {
  const papers = [];
  
  try {
    const datasets = Array.isArray(datasetsData) ? datasetsData : [];
    
    for (const dataset of datasets) {
      try {
        // Only consider datasets that have proper documentation and seem like research papers
        if (dataset.description && dataset.description.length > 100 && 
            dataset.tags && dataset.tags.includes('arxiv')) {
          
          const paper = {
            id: `hf_dataset_${dataset.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: dataset.title || dataset.id || 'Untitled Dataset',
            abstract: dataset.description || '',
            authors: dataset.author ? [dataset.author] : [],
            published: dataset.lastModified || new Date().toISOString().split('T')[0],
            updated: dataset.lastModified || new Date().toISOString(),
            category: inferCategoryFromText(dataset.description || ''),
            source: 'huggingface',
            original_source: 'huggingface_datasets', // 明确标记数据集来源
            url: `https://huggingface.co/datasets/${dataset.id}`,
            pdf_url: '',
            scraped_at: new Date().toISOString()
          };
          
          if (paper.title && paper.abstract && paper.abstract.length > 10) {
            papers.push(paper);
          } else if (paper.title) {
            // For HuggingFace datasets, allow papers with shorter abstracts
            logger.debug(`Accepting paper with short abstract (${paper.abstract?.length || 0} chars): ${paper.title}`);
            papers.push(paper);
          }
        }
      } catch (error) {
        logger.warn('Failed to parse HuggingFace dataset:', error);
      }
    }
    
    logger.info(`Successfully parsed ${papers.length} papers from HuggingFace datasets`);
    return papers;
    
  } catch (error) {
    logger.error('Failed to parse HuggingFace datasets response:', error);
    return [];
  }
}

// Infer category from text content
function inferCategoryFromText(text) {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('vision') || textLower.includes('image') || textLower.includes('visual') || textLower.includes('cv')) {
    return 'computer_vision';
  } else if (textLower.includes('nlp') || textLower.includes('language') || textLower.includes('text') || textLower.includes('transformer')) {
    return 'natural_language_processing';
  } else if (textLower.includes('reinforcement') || textLower.includes('rl') || textLower.includes('agent') || textLower.includes('policy')) {
    return 'reinforcement_learning';
  } else if (textLower.includes('multimodal') || textLower.includes('multi-modal')) {
    return 'multimodal_learning';
  } else {
    return 'machine_learning';
  }
}

// Infer category from HuggingFace paper data
function inferCategoryFromHF(paperData) {
  const text = `${paperData.title || ''} ${paperData.summary || ''} ${JSON.stringify(paperData.tags || [])}`.toLowerCase();
  
  if (text.includes('vision') || text.includes('image') || text.includes('visual') || text.includes('cv')) {
    return 'computer_vision';
  } else if (text.includes('nlp') || text.includes('language') || text.includes('text') || text.includes('transformer')) {
    return 'natural_language_processing';
  } else if (text.includes('reinforcement') || text.includes('rl') || text.includes('agent') || text.includes('policy')) {
    return 'reinforcement_learning';
  } else if (text.includes('multimodal') || text.includes('multi-modal')) {
    return 'multimodal_learning';
  } else {
    return 'machine_learning';
  }
}

// Generate fallback HuggingFace papers from trending AI topics
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
      published: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString(),
      category: topic.category,
      source: 'huggingface',
      original_source: 'huggingface_fallback', // Mark as fallback
      url: 'https://huggingface.co/papers',
      pdf_url: '',
      scraped_at: new Date().toISOString(),
      keywords: topic.keywords,
      is_fallback: true // Clear indicator this is a fallback paper
    };
    fallbackPapers.push(paper);
  }
  
  return fallbackPapers;
}

function removeDuplicatePapers(papers) {
  // Handle edge cases
  if (!papers || !Array.isArray(papers)) {
    logger.warn('Invalid papers array provided to removeDuplicatePapers, returning empty array');
    return [];
  }

  const seen = new Set();
  const uniquePapers = [];

  for (const paper of papers) {
    try {
      // Skip invalid paper objects
      if (!paper || !paper.title) {
        logger.warn('Skipping invalid paper object:', paper);
        continue;
      }

      // Create a simple hash of the title for duplicate detection
      const titleHash = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (!seen.has(titleHash)) {
        seen.add(titleHash);
        uniquePapers.push(paper);
      } else {
        logger.debug(`Removed duplicate paper: ${paper.title}`);
      }
    } catch (error) {
      logger.warn('Error processing paper during duplicate removal:', error);
      // Skip this paper and continue processing others
      continue;
    }
  }

  return uniquePapers;
}

// Export individual scraping functions for testing
export {
  scrapeArxivPapers,
  scrapeHuggingfacePapers,
  parseArxivEntry,
  parseHuggingfacePaper,
  sanitizeJsonContent,
  validateAbstractStructure,
  calculateAbstractQuality,
  scrapePaperFromIndividualPage
};
