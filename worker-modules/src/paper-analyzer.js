import { AppError, MODEL_CONFIG, MODEL_PARAMS, PAPER_ANALYSIS_PROMPT, TOPIC_CATEGORIES } from './config.js';
import { fetchWithTimeout, sleep } from './utils.js';

const logger = {
  info: (msg, data = {}) => console.log(`[ANALYZER] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[ANALYZER] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[ANALYZER] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[ANALYZER] ${msg}`, data)
};

export async function analyzePapers(papers, apiKey) {
  if (!apiKey) {
    throw new AppError('OpenRouter API key is required for paper analysis');
  }
  
  if (!papers || papers.length === 0) {
    logger.warn('No papers to analyze');
    return [];
  }
  
  logger.info(`Starting analysis of ${papers.length} papers`);
  
  const analyzedPapers = [];
  const BATCH_SIZE = 2; // Process papers in small batches to avoid rate limits
  
  for (let i = 0; i < papers.length; i += BATCH_SIZE) {
    const batch = papers.slice(i, i + BATCH_SIZE);
    logger.info(`Analyzing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(papers.length / BATCH_SIZE)}`);
    
    const batchPromises = batch.map(paper => analyzeSinglePaper(paper, apiKey));
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        analyzedPapers.push(result.value);
      } else if (result.status === 'rejected') {
        logger.error('Failed to analyze paper:', { error: result.reason.message });
        // Add paper without analysis for fallback
        const originalPaper = batch[batchResults.indexOf(result)];
        if (originalPaper) {
          analyzedPapers.push(createFallbackAnalysis(originalPaper));
        }
      }
    }
    
    // Add delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < papers.length) {
      await sleep(2000); // 2 second delay between batches
    }
  }
  
  logger.info(`Successfully analyzed ${analyzedPapers.length} papers`);
  return analyzedPapers;
}

export async function analyzeSinglePaper(paper, apiKey) {
  try {
    logger.debug(`Analyzing paper: ${paper.title}`);

    // Check if paper already has analysis (cached)
    if (paper.analysis && paper.analysis.summary) {
      logger.debug(`Paper ${paper.id} already has analysis, skipping`);
      return paper;
    }

    // Prepare analysis prompt
    const prompt = PAPER_ANALYSIS_PROMPT
      .replace('{title}', paper.title)
      .replace('{authors}', paper.authors ? paper.authors.join(', ') : 'Unknown')
      .replace('{abstract}', paper.abstract || 'No abstract available')
      .replace('{published}', paper.published || 'Unknown');

    let analysisResult = null;
    let modelUsed = MODEL_CONFIG.analysis;

    // Try primary model first
    try {
      analysisResult = await callLLM(prompt, MODEL_CONFIG.analysis, MODEL_PARAMS.analysis, apiKey);
      logger.debug(`Primary model (${MODEL_CONFIG.analysis}) succeeded`);
    } catch (primaryError) {
      logger.warn(`Primary model failed, trying fallback:`, primaryError.message);

      // Try fallback model
      try {
        analysisResult = await callLLM(prompt, MODEL_CONFIG.fallback_analysis, MODEL_PARAMS.analysis, apiKey);
        modelUsed = MODEL_CONFIG.fallback_analysis;
        logger.debug(`Fallback model (${MODEL_CONFIG.fallback_analysis}) succeeded`);
      } catch (fallbackError) {
        logger.error(`Both models failed for paper ${paper.title}:`, fallbackError);
        throw new AppError(`Failed to analyze paper with both models: ${fallbackError.message}`);
      }
    }

    // Parse the JSON response
    const analysis = await parseAnalysisResponse(analysisResult, apiKey);

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

async function callLLM(prompt, model, params, apiKey) {
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
        content: 'You are an expert AI research analyst specializing in computer vision and machine learning. Provide detailed, accurate analysis of research papers.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: params.temperature || 0.3,
    max_tokens: params.max_tokens || 1000,
    response_format: { type: 'json_object' }
  };

  // Retry logic for network failures
  const maxRetries = 3;
  const baseTimeout = 90000; // 90 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeout = baseTimeout * attempt; // Exponential backoff
      logger.debug(`LLM API call attempt ${attempt}/${maxRetries} with ${timeout}ms timeout`);

      const response = await fetchWithTimeout(url, timeout, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(`LLM API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new AppError('Invalid LLM response format');
      }

      const content = data.choices[0].message.content;
      if (!content) {
        throw new AppError('Empty LLM response');
      }

      logger.debug(`LLM API call succeeded on attempt ${attempt}`);
      return content;

    } catch (error) {
      logger.warn(`LLM API call failed on attempt ${attempt}:`, error.message);

      if (attempt === maxRetries) {
        logger.error('All LLM API call attempts failed:', error);
        throw new AppError(`Failed to call LLM API after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retry (exponential backoff)
      const retryDelay = Math.min(2000 * attempt, 8000); // Max 8 seconds
      logger.debug(`Waiting ${retryDelay}ms before retry...`);
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
    // Clean the response to ensure it's valid JSON
    let cleanResponse = response.trim();
    
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsed = JSON.parse(cleanResponse);
    
    // Validate required fields
    const requiredFields = ['introduction', 'challenges', 'innovations', 'experiments', 'insights', 'keywords', 'category'];
    for (const field of requiredFields) {
      if (!parsed[field]) {
        logger.warn(`Missing field in analysis: ${field}`);
        parsed[field] = field === 'keywords' ? [] : 'Not provided';
      }
    }

    // Validate Chinese fields if available
    const chineseFields = ['chinese_abstract', 'chinese_introduction', 'chinese_challenges', 'chinese_innovations', 'chinese_experiments', 'chinese_insights'];
    for (const field of chineseFields) {
      if (!parsed[field]) {
        logger.warn(`Missing Chinese field in analysis: ${field}, setting to empty string.`);
        parsed[field] = ''; // Set to empty string if not provided
      }
    }
    
    // Apply fallback translations if Chinese fields are empty but English content exists
    await applyFallbackTranslations(parsed, apiKey);
    
    // Normalize and validate category
    parsed.category = normalizeCategory(parsed.category);
    if (!TOPIC_CATEGORIES.includes(parsed.category)) {
      logger.warn(`Invalid category: ${parsed.category}, defaulting to 'machine_learning'`);
      parsed.category = 'machine_learning';
    }
    
    // Ensure keywords is an array
    if (!Array.isArray(parsed.keywords)) {
      parsed.keywords = typeof parsed.keywords === 'string' ? [parsed.keywords] : [];
    }
    
    // Validate scores
    if (typeof parsed.relevance_score !== 'number' || parsed.relevance_score < 1 || parsed.relevance_score > 10) {
      parsed.relevance_score = 5; // Default score
    }
    
    // Add summary field that combines all sections
    parsed.summary = generateSummary(parsed);
    
    return parsed;
    
  } catch (error) {
    logger.error('Failed to parse analysis response:', error);
    throw new AppError(`Failed to parse analysis: ${error.message}`);
  }
}

async function applyFallbackTranslations(analysis, apiKey) {
  const translationPairs = [
    { english: 'abstract', chinese: 'chinese_abstract', promptKey: 'abstract' },
    { english: 'introduction', chinese: 'chinese_introduction', promptKey: 'introduction' },
    { english: 'challenges', chinese: 'chinese_challenges', promptKey: 'challenges' },
    { english: 'innovations', chinese: 'chinese_innovations', promptKey: 'innovations' },
    { english: 'experiments', chinese: 'chinese_experiments', promptKey: 'experiments' },
    { english: 'insights', chinese: 'chinese_insights', promptKey: 'insights' }
  ];

  const translationsNeeded = translationPairs.filter(pair => 
    !analysis[pair.chinese] || analysis[pair.chinese].trim() === '' ||
    analysis[pair.chinese].trim() === 'Not specified in the paper.'
  );

  if (translationsNeeded.length === 0) {
    logger.debug('All Chinese translations are present, no fallback needed');
    return;
  }

  logger.info(`Applying fallback translations for ${translationsNeeded.length} fields`);

  for (const pair of translationsNeeded) {
    const englishContent = analysis[pair.english];
    
    // Skip if English content is empty or "Not provided"
    if (!englishContent || englishContent.trim() === '' || englishContent.trim() === 'Not provided') {
      analysis[pair.chinese] = '英文内容不可用 / English content not available';
      continue;
    }

    try {
      const translationPrompt = `请将以下英文内容翻译成简体中文。翻译必须准确、自然，适合AI研究者和爱好者阅读。保持技术术语的专业性，但解释复杂概念时使用通俗易懂的语言。

英文内容（${pair.promptKey}）：
${englishContent}

请只返回翻译后的中文文本，不要添加任何额外说明或格式。`;

      const translatedContent = await callLLM(translationPrompt, MODEL_CONFIG.translation, MODEL_PARAMS.translation, apiKey);
      
      // Clean up the response
      let cleanTranslation = translatedContent.trim();
      if (cleanTranslation.startsWith('```')) {
        cleanTranslation = cleanTranslation.replace(/```[\w]*\n?/, '').replace(/\n?```$/, '');
      }
      
      analysis[pair.chinese] = cleanTranslation;
      logger.debug(`Successfully translated ${pair.promptKey} to Chinese`);
      
      // Small delay to avoid rate limiting
      await sleep(500);
      
    } catch (translationError) {
      logger.warn(`Failed to translate ${pair.promptKey}:`, translationError.message);
      analysis[pair.chinese] = `翻译失败，请查看英文原文 / Translation failed, please see English original`;
    }
  }

  logger.info('Fallback translations completed');
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
  return {
    ...paper,
    analysis: {
      introduction: 'Analysis not available due to processing error.',
      challenges: 'Not analyzed',
      innovations: 'Not analyzed',
      experiments: 'Not analyzed',
      insights: 'Not analyzed',
      summary: paper.abstract ? `Abstract: ${paper.abstract.substring(0, 300)}...` : 'No abstract available',
      keywords: extractKeywords(paper),
      category: inferCategory(paper),
      relevance_score: 5,
      technical_depth: 'unknown',
      analyzed_at: new Date().toISOString(),
      model: 'fallback',
      error: true
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

export async function generatePaperSummary(paper, apiKey) {
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
    const summaryResult = await callLLM(prompt, MODEL_CONFIG.summary, MODEL_PARAMS.summary, apiKey);
    return summaryResult.trim();
  } catch (error) {
    logger.error('Failed to generate paper summary:', error);
    return paper.analysis.summary; // Fallback to existing summary
  }
}
