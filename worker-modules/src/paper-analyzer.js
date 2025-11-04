import { AppError, MODEL_CONFIG, MODEL_PARAMS, PAPER_ANALYSIS_PROMPT, TOPIC_CATEGORIES } from './config.js';
import { fetchWithTimeout, sleep } from './utils.js';

const logger = {
  info: (msg, data = {}) => console.log(`[ANALYZER] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[ANALYZER] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[ANALYZER] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[ANALYZER] ${msg}`, data)
};

function createTitleOnlyPrompt(paper) {
  return `You are an expert AI researcher specializing in related fields.

**IMPORTANT:** This paper only has a title and authors available, but no abstract. Please provide the best possible analysis based on the title and research context.

**Paper Title:** ${paper.title}
**Authors:** ${paper.authors ? paper.authors.join(', ') : 'Unknown'}
**Published:** ${paper.published || 'Unknown'}

Since no abstract is available, please provide analysis based on:
1. The title's key concepts and terminology
2. The authors' likely research area based on names and affiliations (if recognizable)
3. Current trends and challenges in the implied research field
4. Your expertise about similar research directions

Generate 5 distinct text blocks in English. Use formatting suitable for Twitter (e.g., line breaks for readability, relevant emojis strategically).

### Required Sections (Max 280 characters EACH):

1. 🚀 Introduction (Hook & Core Idea):
   * Start with a strong hook based on the title's implications.
   * State what the research likely addresses based on terminology.
   * Hint at the potential impact or applications.

2. 🎯 Challenges (The Problems Solved):
   * List 2-3 key problems this research likely addresses based on the title.
   * Focus on common challenges in this research area.

3. ✨ Innovations (The Novel Solution):
   * List potential novel approaches or methods suggested by the title.
   * Highlight what makes this direction innovative or unique.

4. 📊 Experiment (Likely Proof & Validation):
   * Describe what kind of experiments or validation would typically be used.
   * Mention expected metrics or benchmarks for this type of research.

5. 🤔 Insights (Implications & Future Directions):
   * Discuss potential broader implications of this research direction.
   * Suggest future work or applications that could follow from this research.

**Format your response as a valid JSON object:**
{
  "introduction": "🚀 English introduction text...",
  "challenges": "🎯 English challenges text...",
  "innovations": "✨ English innovations text...",
  "experiments": "📊 English experiments text...",
  "insights": "🤔 English insights text...",
  "keywords": ["term1", "term2", ...],
  "category": "one_of_topic_categories",
  "relevance_score": (1-10),
  "technical_depth": "beginner|intermediate|advanced"
}`;
}

export async function analyzePapers(papers, apiKey, glmFallbackConfig = null) {
  if (!apiKey) {
    throw new AppError('OpenRouter API key is required for paper analysis');
  }
  
  if (!papers || papers.length === 0) {
    logger.warn('No papers to analyze');
    return [];
  }
  
  logger.info(`Starting analysis of ${papers.length} papers`);
  
  const analyzedPapers = [];
  const BATCH_SIZE = 3; // Process 3 papers in parallel for better performance

  for (let i = 0; i < papers.length; i += BATCH_SIZE) {
    const batch = papers.slice(i, i + BATCH_SIZE);
    const batchStartIndex = i + 1;
    const batchEndIndex = Math.min(i + BATCH_SIZE, papers.length);

    logger.info(`Processing batch ${Math.ceil(i / BATCH_SIZE) + 1}: papers ${batchStartIndex}-${batchEndIndex}`);

    // Process papers in parallel
    const batchPromises = batch.map(async (paper, batchIndex) => {
      const paperIndex = i + batchIndex + 1;
      try {
        logger.info(`Analyzing paper ${paperIndex}/${papers.length}: ${paper.title.substring(0, 50)}...`);
        const analyzedPaper = await analyzeSinglePaper(paper, apiKey, glmFallbackConfig);
        if (analyzedPaper) {
          logger.info(`Successfully analyzed paper ${paperIndex}/${papers.length}`);
          return analyzedPaper;
        }
        return null;
      } catch (error) {
        logger.error(`Failed to analyze paper ${paperIndex}/${papers.length}:`, {
          error: error.message,
          title: paper.title
        });
        return createFallbackAnalysis(paper);
      }
    });

    // Wait for all papers in the batch to complete
    const batchResults = await Promise.allSettled(batchPromises);

    // Collect successful results
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        analyzedPapers.push(result.value);
      } else {
        logger.error(`Paper ${i + index + 1} failed or returned null`);
      }
    });

    // Add delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < papers.length) {
      const delay = Math.min(1000 + (Math.ceil(i / BATCH_SIZE) * 200), 3000);
      logger.debug(`Waiting ${delay}ms before next batch...`);
      await sleep(delay);
    }
  }
  
  logger.info(`Successfully analyzed ${analyzedPapers.length} papers`);
  return analyzedPapers;
}

export async function analyzeSinglePaper(paper, apiKey, glmFallbackConfig = null) {
  try {
    logger.debug(`Analyzing paper: ${paper.title}`);

    // Check if paper already has analysis (cached)
    if (paper.analysis && paper.analysis.summary) {
      logger.debug(`Paper ${paper.id} already has analysis, skipping`);
      return paper;
    }

    // Prepare analysis prompt - use title-only analysis if no abstract available
    let prompt;
    let isTitleOnlyAnalysis = false;

    if (!paper.abstract || paper.abstract.trim().length < 50) {
      logger.info(`Paper ${paper.title} has no abstract or abstract too short, using title-only analysis`);
      prompt = createTitleOnlyPrompt(paper);
      isTitleOnlyAnalysis = true;
    } else {
      prompt = PAPER_ANALYSIS_PROMPT
        .replace('{title}', paper.title)
        .replace('{authors}', paper.authors ? paper.authors.join(', ') : 'Unknown')
        .replace('{abstract}', paper.abstract)
        .replace('{published}', paper.published || 'Unknown');
    }

    let analysisResult = null;
    let modelUsed = MODEL_CONFIG.analysis;

    // GLM fallback configuration (passed as parameter)
    if (!glmFallbackConfig) {
      logger.warn('No GLM fallback configuration provided');
    }

    // Try primary model first with GLM fallback
    try {
      analysisResult = await callLLM(prompt, MODEL_CONFIG.analysis, MODEL_PARAMS.analysis, apiKey, glmFallbackConfig);
      logger.debug(`Primary model (${MODEL_CONFIG.analysis}) succeeded`);
    } catch (primaryError) {
      logger.warn(`Primary model with fallback failed, trying secondary OpenRouter model:`, primaryError.message);

      // Try fallback model
      try {
        analysisResult = await callLLM(prompt, MODEL_CONFIG.fallback_analysis, MODEL_PARAMS.analysis, apiKey, glmFallbackConfig);
        modelUsed = MODEL_CONFIG.fallback_analysis;
        logger.debug(`Fallback model (${MODEL_CONFIG.fallback_analysis}) succeeded`);
      } catch (fallbackError) {
        logger.error(`All models failed for paper ${paper.title}:`, fallbackError);
        throw new AppError(`Failed to analyze paper with all models: ${fallbackError.message}`);
      }
    }

    // Parse the JSON response
    const analysis = await parseAnalysisResponse(analysisResult, apiKey);

    // Add flag for title-only analysis
    if (isTitleOnlyAnalysis) {
      analysis.title_only_analysis = true;
      logger.debug(`Used title-only analysis for paper: ${paper.title}`);
    }

    // Add analysis to paper
    const analyzedPaper = {
      ...paper,
      analysis: {
        ...analysis,
        analyzed_at: new Date().toISOString(),
        model: modelUsed
      }
    };

    logger.debug(`Successfully analyzed paper: ${paper.title}`);
    return analyzedPaper;

  } catch (error) {
    logger.error(`Failed to analyze paper ${paper.title}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

async function callLLM(prompt, model, params, apiKey, fallbackConfig = null) {
  // Try OpenRouter first
  try {
    return await callOpenRouter(prompt, model, params, apiKey);
  } catch (openRouterError) {
    logger.warn(`OpenRouter API failed:`, openRouterError.message);

    // If fallback config is provided, try GLM
    if (fallbackConfig) {
      logger.info('Attempting fallback to GLM API');
      try {
        return await callGLM(prompt, model, params, fallbackConfig);
      } catch (glmError) {
        logger.error(`GLM fallback also failed:`, glmError.message);
        throw new AppError(`Both OpenRouter and GLM APIs failed. OpenRouter: ${openRouterError.message}, GLM: ${glmError.message}`);
      }
    }

    // No fallback available, re-throw the original error
    throw openRouterError;
  }
}

async function callOpenRouter(prompt, model, params, apiKey) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://paperdog.org',
    'X-Title': 'PaperDog'
  };

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'system',
        content: (params && params.system_role) ? params.system_role : 'You are an expert AI research analyst specializing in computer vision and machine learning. Provide detailed, accurate analysis of research papers.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: params.temperature || 0.3,
    max_tokens: params.max_tokens || 1000
  };

  // Only enforce JSON output when explicitly requested by caller (analysis),
  // translation should return free-form text.
  if (params && params.response_format === 'json_object') {
    requestBody.response_format = { type: 'json_object' };
  }

  // Retry logic for network failures - optimized for GPT-5-mini
  const maxRetries = 3;
  const baseTimeout = 30000; // 30 seconds for faster failure detection

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeout = baseTimeout * attempt; // Exponential backoff: 30s, 60s, 90s
      logger.debug(`OpenRouter API call attempt ${attempt}/${maxRetries} with ${timeout}ms timeout`);

      const response = await fetchWithTimeout(url, timeout, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

    if (!response.ok) {
        const errorText = await response.text();

        // Handle rate limit specifically
        if (response.status === 429) {
          const retryAfter = parseInt(errorText.match(/retry_after:\s*(\d+)/i)?.[1] || '30');
          logger.warn(`Rate limited, waiting ${retryAfter}s before retry...`);
          if (attempt < maxRetries) {
            await sleep(retryAfter * 1000);
            continue;
          }
        }

        throw new AppError(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new AppError('Invalid OpenRouter response format');
      }

      const content = data.choices[0].message.content;
      if (!content) {
        throw new AppError('Empty OpenRouter response');
      }

      logger.debug(`OpenRouter API call succeeded on attempt ${attempt}`);
      return content;

    } catch (error) {
      logger.warn(`OpenRouter API call failed on attempt ${attempt}:`, error.message);

      if (attempt === maxRetries) {
        logger.error('All OpenRouter API call attempts failed:', error);
        throw new AppError(`Failed to call OpenRouter API after ${maxRetries} attempts: ${error.message}`);
      }

      // Quadratic backoff: 2s, 8s, 18s
      const retryDelay = Math.min(2000 * (attempt * attempt), 18000);
      logger.debug(`Waiting ${retryDelay}ms before retry...`);
      await sleep(retryDelay);
    }
  }
}

async function callGLM(prompt, model, params, glmConfig) {
  const url = glmConfig.baseUrl.endsWith('/') ? `${glmConfig.baseUrl}chat/completions` : `${glmConfig.baseUrl}/chat/completions`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${glmConfig.apiKey}`
  };

  // GLM model mapping - if OpenRouter model is requested, map to GLM model
  const glmModel = glmConfig.model || 'glm-4-air';

  const requestBody = {
    model: glmModel,
    messages: [
      {
        role: 'system',
        content: (params && params.system_role) ? params.system_role : 'You are an expert AI research analyst specializing in computer vision and machine learning. Provide detailed, accurate analysis of research papers.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: params.temperature || 0.3,
    max_tokens: params.max_tokens || 1000
  };

  // Only enforce JSON output when explicitly requested by caller
  if (params && params.response_format === 'json_object') {
    // Note: GLM might not support response_format, so we'll include JSON instructions in the prompt instead
    requestBody.messages[0].content += '\n\nIMPORTANT: You must respond with valid JSON only, no markdown code blocks or additional text.';
  }

  // Retry logic for GLM API
  const maxRetries = 3;
  const baseTimeout = 30000; // 30 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeout = baseTimeout * attempt; // Exponential backoff
      logger.debug(`GLM API call attempt ${attempt}/${maxRetries} with ${timeout}ms timeout`);

      const response = await fetchWithTimeout(url, timeout, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

    if (!response.ok) {
        const errorText = await response.text();

        // Handle rate limit specifically
        if (response.status === 429) {
          const retryAfter = parseInt(errorText.match(/retry_after:\s*(\d+)/i)?.[1] || '30');
          logger.warn(`GLM rate limited, waiting ${retryAfter}s before retry...`);
          if (attempt < maxRetries) {
            await sleep(retryAfter * 1000);
            continue;
          }
        }

        throw new AppError(`GLM API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new AppError('Invalid GLM response format');
      }

      const content = data.choices[0].message.content;
      if (!content) {
        throw new AppError('Empty GLM response');
      }

      logger.debug(`GLM API call succeeded on attempt ${attempt}`);
      return content;

    } catch (error) {
      logger.warn(`GLM API call failed on attempt ${attempt}:`, error.message);

      if (attempt === maxRetries) {
        logger.error('All GLM API call attempts failed:', error);
        throw new AppError(`Failed to call GLM API after ${maxRetries} attempts: ${error.message}`);
      }

      // Backoff between retries
      const retryDelay = Math.min(2000 * (attempt * attempt), 18000);
      logger.debug(`Waiting ${retryDelay}ms before GLM retry...`);
      await sleep(retryDelay);
    }
  }
}

function normalizeCategory(category) {
  if (!category || typeof category !== 'string') {
    return 'machine_learning';
  }
  // Convert to lowercase, replace spaces with underscores, remove special characters
  return category.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

async function parseAnalysisResponse(response, apiKey) {
  try {
    logger.debug(`Raw response received (${response.length} chars)`);
    logger.debug(`Response preview: ${response.substring(0, 200)}...`);

    // Enhanced cleaning for GPT-5-mini responses
    let cleanResponse = response.trim();

    // Remove markdown code blocks with better detection
    cleanResponse = cleanResponse.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

    logger.debug(`Initial response length: ${cleanResponse.length}`);
    logger.debug(`Response pattern example: ${cleanResponse.substring(0, 300)}`);

    // Step 1: Fix basic syntax issues
    cleanResponse = cleanResponse.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    // Step 2: Advanced quote escaping for nested quotes (more precise)
    // Find strings like "key": "value with "quotes" inside"
    let quoteEscapeStep = 0;
    let previousLength = cleanResponse.length;
    while (quoteEscapeStep < 5 && cleanResponse.length === previousLength) {
      previousLength = cleanResponse.length;
      // Look for unescaped quotes within string values
      cleanResponse = cleanResponse.replace(/:\s*"([^"]*(?<!\\)"[^"]*(?<!\\)")([^",}:]*(?<!\\)")[,}\s]*($|(?=\s*[,{}\s]))/g, (match, content, rest) => {
        // Escape the inner quotes
        const escapedContent = content.replace(/"(?![^"]*\\")/g, '\\"');
        return `: "${escapedContent}"${rest}`;
      });
      quoteEscapeStep++;
      if (cleanResponse.length !== previousLength) {
        logger.debug(`Quote escaping iteration ${quoteEscapeStep}: Applied fixes`);
      }
    }

    // Step 3: Handle quotes around complex values (authors, technical terms)
    cleanResponse = cleanResponse.replace(/("authors"|"name"|"title")[^}]*"([^"]*(?<!\\)")(?:\s*,\s*(?=(?:"[^"]+"|[},])))/g, (match, key, value) => {
      const escapedValue = value.replace(/"/g, '\\"');
      return `${key}": "${escapedValue}"`;
    });

    // Step 4: Final cleanup for common leftovers
    cleanResponse = cleanResponse.replace(/:\s*"/g, ': "').replace(/"\s*,/g, '",');

    // Step 5: Handle newlines and tabs
    cleanResponse = cleanResponse.replace(/\\n/g, ' ').replace(/\\t/g, ' ');

    logger.debug(`After all fixes - length: ${cleanResponse.length}`);

    // Try to extract JSON object boundaries if response has extra text
    const jsonMatch = cleanResponse.match(/\{[^{}]*"introduction"[^{}]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
      logger.debug('Extracted JSON object from larger text');
    }

    logger.debug(`Attempting to parse cleaned JSON response (${cleanResponse.length} chars)`);

    let parsed;
    try {
      // Direct JSON parse first
      parsed = JSON.parse(cleanResponse);
      logger.debug('Direct JSON parsing successful');
    } catch (parseError) {
      logger.warn(`Primary JSON parse failed, attempting recovery: ${parseError.message}`);

      // Recovery Strategy 1: Fix common JSON syntax issues
      try {
        let recoveredResponse = cleanResponse
          .replace(/,\s*}/g, '}') // Remove trailing commas in objects
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/:\s*,/g, ': null,') // Fix empty values
          .replace(/:\s*}/g, ': null}') // Fix missing values at object end
          .replace(/\r\n/g, '\\n') // Fix Windows newlines
          .replace(/\n/g, '\\n'); // Fix Unix newlines

        parsed = JSON.parse(recoveredResponse);
        logger.info('Recovery Strategy 1 successful: Basic JSON fixes');
      } catch (recoveryError1) {
        logger.debug(`Recovery Strategy 1 failed: ${recoveryError1.message}`);

        // Recovery Strategy 2: Handle escaped quotes in JSON content
        try {
          let recoveredResponse = cleanResponse;

          // Find and fix improperly escaped quotes in string values
          // This is more careful than the previous approach
          recoveredResponse = recoveredResponse
            .replace(/:\s*"([^"]*)"([^",\}\]]*?)"/g, ': "$1\\"$2\\"$3"') // Fix quotes within strings
            .replace(/:\s*"([^"]*)"([^",\}\]]*?)"/g, ': "$1\\"$2\\"$3"'); // Apply twice for nested cases

          // Then apply basic fixes
          recoveredResponse = recoveredResponse
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/\r\n/g, '\\n')
            .replace(/\n/g, '\\n');

          parsed = JSON.parse(recoveredResponse);
          logger.info('Recovery Strategy 2 successful: Quote escaping fixes');
        } catch (recoveryError2) {
          logger.debug(`Recovery Strategy 2 failed: ${recoveryError2.message}`);

          // Recovery Strategy 3: Manual JSON reconstruction (last resort)
          try {
            // Extract content using regex patterns for each field
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
                if (field === 'keywords') {
                  try {
                    parsed[field] = JSON.parse(match[1]);
                  } catch {
                    parsed[field] = [];
                  }
                } else if (field === 'relevance_score') {
                  parsed[field] = parseInt(match[1]);
                } else {
                  parsed[field] = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
                }
              }
            }

            // Verify we got the essential fields
            if (parsed.introduction && parsed.challenges) {
              logger.info('Recovery Strategy 3 successful: Manual reconstruction');
            } else {
              throw new Error('Essential fields missing after reconstruction');
            }
          } catch (recoveryError3) {
            logger.error(`All recovery strategies failed`);
            logger.debug(`Problematic response: ${cleanResponse.substring(0, 1000)}...`);
            throw new AppError(`Unable to parse JSON response after all recovery attempts: ${parseError.message}`);
          }
        }
      }
    }

    // Validate required fields and check for completeness
    const requiredFields = ['introduction', 'challenges', 'innovations', 'experiments', 'insights', 'keywords', 'category'];
    let missingCriticalFields = [];

    for (const field of requiredFields) {
      if (!parsed[field] || (typeof parsed[field] === 'string' && parsed[field].trim() === '')) {
        logger.warn(`Missing field in analysis: ${field}`);

        // Count critical fields (introduction, challenges, innovations, experiments, insights)
        if (['introduction', 'challenges', 'innovations', 'experiments', 'insights'].includes(field)) {
          missingCriticalFields.push(field);
        }

        parsed[field] = field === 'keywords' ? [] : 'Not provided';
      }
    }

    // If more than 2 critical fields are missing, the response is incomplete
    if (missingCriticalFields.length > 2) {
      logger.warn(`Incomplete analysis response - missing ${missingCriticalFields.length} critical fields: ${missingCriticalFields.join(', ')}`);

      // Create a more complete fallback using available information
      const availableIntro = parsed.introduction && parsed.introduction !== 'Not provided' ? parsed.introduction : '';
      const availableChallenges = parsed.challenges && parsed.challenges !== 'Not provided' ? parsed.challenges : '';

      if (availableIntro || availableChallenges) {
        logger.info('Creating enhanced fallback from available partial analysis');

        // Generate missing fields based on available content
        const combinedText = `${availableIntro} ${availableChallenges}`.toLowerCase();

        if (parsed.innovations === 'Not provided') {
          parsed.innovations = combinedText.includes('new') || combinedText.includes('novel') || combinedText.includes('approach') ?
            '✨ Introduces novel methodologies and approaches for enhanced performance.' : '✨ Not specified in the paper.';
        }

        if (parsed.experiments === 'Not provided') {
          parsed.experiments = combinedText.includes('result') || combinedText.includes('experiment') || combinedText.includes('performance') ?
            '📊 Demonstrates significant improvements over existing methods through comprehensive experiments.' : '📊 Not specified in the paper.';
        }

        if (parsed.insights === 'Not provided') {
          parsed.insights = combinedText.includes('future') || combinedText.includes('potential') || combinedText.includes('impact') ?
            '🤔 Opens new directions for research and practical applications in the field.' : '🤔 Not specified in the paper.';
        }

        // Generate keywords from available text
        if (parsed.keywords.length === 0) {
          const keywordPatterns = [
            /transformer|attention|neural|network|deep learning|machine learning|ai|model|algorithm|approach|method|framework|architecture|system/g
          ];
          const foundKeywords = new Set();
          keywordPatterns.forEach(pattern => {
            const matches = combinedText.match(pattern);
            if (matches) matches.forEach(match => foundKeywords.add(match));
          });
          parsed.keywords = Array.from(foundKeywords).slice(0, 5);
        }

        // Infer category from content
        if (parsed.category === 'Not provided' || parsed.category === 'not_provided') {
          if (combinedText.includes('vision') || combinedText.includes('image') || combinedText.includes('visual')) {
            parsed.category = 'computer_vision';
          } else if (combinedText.includes('language') || combinedText.includes('nlp') || combinedText.includes('text')) {
            parsed.category = 'natural_language_processing';
          } else if (combinedText.includes('reinforcement') || combinedText.includes('rl') || combinedText.includes('agent')) {
            parsed.category = 'reinforcement_learning';
          } else {
            parsed.category = 'machine_learning';
          }
        }
      }
    }


    // Normalize and validate category
    parsed.category = normalizeCategory(parsed.category);
    if (!TOPIC_CATEGORIES.includes(parsed.category)) {
      logger.warn(`Invalid category: ${parsed.category}, defaulting to 'machine_learning'`);
      parsed.category = 'machine_learning';
    }

    // Ensure keywords is an array and filter out empty strings
    if (!Array.isArray(parsed.keywords)) {
      parsed.keywords = typeof parsed.keywords === 'string' ?
        parsed.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
    }

    // Validate scores with better range checking
    if (typeof parsed.relevance_score !== 'number' || parsed.relevance_score < 1 || parsed.relevance_score > 10) {
      logger.warn(`Invalid relevance score: ${parsed.relevance_score}, defaulting to 5`);
      parsed.relevance_score = 5;
    }

    // Add summary field that combines all sections
    parsed.summary = generateSummary(parsed);

    logger.debug('Successfully parsed and validated analysis response');
    return parsed;

  } catch (error) {
    logger.error('Failed to parse analysis response:', error);
    throw new AppError(`Failed to parse analysis: ${error.message}`);
  }
}

// New on-demand translation function
export async function translateAnalysis(analysis, apiKey, abstract = null, glmFallbackConfig = null) {
  const translationPairs = [
    { english: 'abstract', chinese: 'chinese_abstract', promptKey: 'abstract' },
    { english: 'introduction', chinese: 'chinese_introduction', promptKey: 'introduction' },
    { english: 'challenges', chinese: 'chinese_challenges', promptKey: 'challenges' },
    { english: 'innovations', chinese: 'chinese_innovations', promptKey: 'innovations' },
    { english: 'experiments', chinese: 'chinese_experiments', promptKey: 'experiments' },
    { english: 'insights', chinese: 'chinese_insights', promptKey: 'insights' }
  ];

  // Include abstract in the data to be translated
  const dataToTranslate = { ...analysis };
  if (abstract && abstract.trim() && abstract.trim() !== 'Not provided') {
    dataToTranslate.abstract = abstract;
  }

  const translationsNeeded = translationPairs.filter(pair =>
    dataToTranslate[pair.english] && dataToTranslate[pair.english].trim() !== '' && dataToTranslate[pair.english].trim() !== 'Not provided'
  );

  if (translationsNeeded.length === 0) {
    logger.warn('No content available for translation');
    throw new AppError('No content available for translation');
  }

  logger.info(`Starting translation for ${translationsNeeded.length} fields`);

  // GLM fallback configuration for translation (passed as parameter)
  if (!glmFallbackConfig) {
    logger.warn('No GLM fallback configuration provided for translation');
  }

  // Process translations concurrently for better performance
  const translationPromises = translationsNeeded.map(async (pair) => {
    const englishContent = dataToTranslate[pair.english];

    try {
      const translationPrompt = `请将以下英文内容翻译成简体中文。翻译必须准确、自然，适合AI研究者和爱好者阅读。保持技术术语的专业性，但解释复杂概念时使用通俗易懂的语言。

英文内容（${pair.promptKey}）：
${englishContent}

请只返回翻译后的中文文本，不要添加任何额外说明或格式。`;

      // Per-field retry to reduce partial failures
      const maxAttempts = 2;
      let lastError = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const translatedContent = await callLLM(
            translationPrompt,
            MODEL_CONFIG.translation,
            { ...MODEL_PARAMS.translation, system_role: 'You are a professional Chinese translator. Translate the user content into Simplified Chinese only. Output plain Chinese text only, no JSON, no code fences, no extra commentary.' },
            apiKey,
            glmFallbackConfig
          );

          // Clean up the response
          let cleanTranslation = translatedContent.trim();
          if (cleanTranslation.startsWith('```')) {
            cleanTranslation = cleanTranslation.replace(/```[\w]*\n?/, '').replace(/\n?```$/, '');
          }

          // Unwrap JSON-shaped responses and extract textual content
          try {
            if (cleanTranslation.startsWith('{') || cleanTranslation.startsWith('[')) {
              const parsed = JSON.parse(cleanTranslation);
              let extracted = '';

              if (Array.isArray(parsed)) {
                extracted = parsed.filter(v => typeof v === 'string' && v.trim()).join('；');
              } else if (parsed && typeof parsed === 'object') {
                const candidateKeys = ['translation', 'chinese', 'zh', 'text', 'content', 'result', 'output'];
                for (const k of candidateKeys) {
                  if (typeof parsed[k] === 'string' && parsed[k].trim()) {
                    extracted = parsed[k].trim();
                    break;
                  }
                  if (Array.isArray(parsed[k])) {
                    const joined = parsed[k].filter(v => typeof v === 'string' && v.trim()).join('；');
                    if (joined) { extracted = joined; break; }
                  }
                }
                if (!extracted) {
                  for (const v of Object.values(parsed)) {
                    if (typeof v === 'string' && v.trim()) { extracted = v.trim(); break; }
                    if (Array.isArray(v)) {
                      const joined = v.filter(x => typeof x === 'string' && x.trim()).join('；');
                      if (joined) { extracted = joined; break; }
                    }
                  }
                }
              }
              cleanTranslation = extracted || '';
            }
          } catch (_) {
            // ignore parse errors; fall back to raw text
          }

          // Guard against empty/placeholder responses
          if (!cleanTranslation || cleanTranslation.trim().length < 2) {
            throw new Error('Empty translation content');
          }

          logger.debug(`Successfully translated ${pair.promptKey} to Chinese (attempt ${attempt})`);
          return { field: pair.chinese, content: cleanTranslation, success: true };
        } catch (innerErr) {
          lastError = innerErr;
          logger.warn(`Translate ${pair.promptKey} attempt ${attempt} failed:`, innerErr.message);
          if (attempt < maxAttempts) {
            await sleep(500 + attempt * 500);
            continue;
          }
        }
      }

      throw lastError || new Error('Unknown translation error');

    } catch (translationError) {
      logger.warn(`Failed to translate ${pair.promptKey}:`, translationError.message);
      return {
        field: pair.chinese,
        content: `翻译失败，请查看英文原文 / Translation failed, please see English original`,
        success: false,
        error: translationError.message
      };
    }
  });

  // Wait for all translations to complete
  const translationResults = await Promise.allSettled(translationPromises);

  // Collect results
  const translations = {};
  const successfulTranslations = translationResults.filter(r =>
    r.status === 'fulfilled' && r.value?.success
  ).length;

  translationResults.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      translations[result.value.field] = result.value.content;
    }
  });

  logger.info(`Completed ${successfulTranslations}/${translationsNeeded.length} translations`);
  if (successfulTranslations === 0) {
    logger.warn('All translation attempts failed for requested fields');
  }

  return translations;
}

function generateSummary(analysis) {
  const sections = [
    { title: 'Introduction', content: analysis.introduction },
    { title: 'Challenges', content: analysis.challenges },
    { title: 'Innovations', content: analysis.innovations },
    { title: 'Experiments', content: analysis.experiments },
    { title: 'Insights', content: analysis.insights }
  ];
  
  let summary = '';
  let totalLength = 0;
  const maxLength = 500;
  
  for (const section of sections) {
    const sectionText = section.content.trim();
    if (sectionText && sectionText !== 'Not provided') {
      if (totalLength + sectionText.length + 50 <= maxLength) {
        summary += `**${section.title}:** ${sectionText}\n\n`;
        totalLength += sectionText.length + 50;
      } else {
        // Add truncated version if we're approaching the limit
        const remainingSpace = maxLength - totalLength - 50;
        if (remainingSpace > 50) {
          summary += `**${section.title}:** ${sectionText.substring(0, remainingSpace)}...\n\n`;
        }
        break;
      }
    }
  }
  
  return summary.trim() || 'Analysis not available';
}

function createFallbackAnalysis(paper) {
  // Create a basic analysis for papers that couldn't be processed by LLM
  // This now provides better analysis even for title-only papers

  const hasAbstract = paper.abstract && paper.abstract.trim().length > 50;

  return {
    ...paper,
    analysis: {
      introduction: `🚀 ${paper.title} - ${hasAbstract ? 'Research analysis' : 'Title-based analysis available'} - Analysis temporarily unavailable due to processing error.`,
      challenges: '🎯 Challenges information unavailable due to processing error.',
      innovations: '✨ Innovation details unavailable due to processing error.',
      experiments: '📊 Experimental results unavailable due to processing error.',
      insights: '🤔 Research insights unavailable due to processing error.',
      summary: hasAbstract ?
        `Abstract: ${paper.abstract.substring(0, 300)}...` :
        `Title: ${paper.title} - Full analysis temporarily unavailable.`,
      keywords: extractKeywords(paper),
      category: inferCategory(paper),
      relevance_score: 5,
      technical_depth: 'unknown',
      analyzed_at: new Date().toISOString(),
      model: 'fallback',
      error: true,
      title_only_analysis: !hasAbstract
    }
  };
}

function extractKeywords(paper) {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  const keywords = [];
  
  // Simple keyword extraction based on common AI/ML terms
  const aiTerms = [
    'neural network', 'deep learning', 'machine learning', 'computer vision',
    'natural language processing', 'transformer', 'attention', 'gpt', 'bert',
    'diffusion model', 'generative ai', 'reinforcement learning', 'cnn',
    'rnn', 'lstm', 'gradient descent', 'backpropagation', 'fine-tuning',
    'pretraining', 'transfer learning', 'multi-modal', 'vision transformer',
    'segmentation', 'detection', 'classification', 'regression'
  ];
  
  for (const term of aiTerms) {
    if (text.includes(term) && !keywords.includes(term)) {
      keywords.push(term);
      if (keywords.length >= 5) break;
    }
  }
  
  return keywords;
}

function inferCategory(paper) {
  const text = `${paper.title} ${paper.abstract} ${paper.category || ''}`.toLowerCase();
  
  if (text.includes('vision') || text.includes('image') || text.includes('visual')) {
    return 'computer_vision';
  } else if (text.includes('nlp') || text.includes('language') || text.includes('text')) {
    return 'natural_language_processing';
  } else if (text.includes('reinforcement') || text.includes('rl') || text.includes('agent')) {
    return 'reinforcement_learning';
  } else {
    return 'machine_learning';
  }
}

export async function generatePaperSummary(paper, apiKey, glmFallbackConfig = null) {
  if (!paper.analysis || !paper.analysis.summary) {
    throw new AppError('Paper analysis is required for summary generation');
  }

  const prompt = `Create a concise, engaging summary (under 200 words) of this AI research paper for a blog audience:

**Title:** ${paper.title}
**Authors:** ${paper.authors ? paper.authors.join(', ') : 'Unknown'}

**Analysis:**
${paper.analysis.summary}

**Key Points:**
- **Innovation:** ${paper.analysis.innovations}
- **Results:** ${paper.analysis.experiments}
- **Impact:** ${paper.analysis.insights}

Format the summary to be engaging and accessible to AI enthusiasts while maintaining technical accuracy.`;

  try {
    // GLM fallback configuration for summary generation (passed as parameter)
    if (!glmFallbackConfig) {
      logger.warn('No GLM fallback configuration provided for summary generation');
    }

    const summaryResult = await callLLM(prompt, MODEL_CONFIG.summary, MODEL_PARAMS.summary, apiKey, glmFallbackConfig);
    return summaryResult.trim();
  } catch (error) {
    logger.error('Failed to generate paper summary:', error);
    return paper.analysis.summary; // Fallback to existing summary
  }
}
