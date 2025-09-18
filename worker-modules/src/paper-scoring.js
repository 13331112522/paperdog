// Enhanced Paper Scoring System
// 基于多因素的论文评分系统，参考Source目录的评分模式

import { AppError } from './config.js';

const logger = {
  info: (msg, data = {}) => console.log(`[SCORING] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[SCORING] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[SCORING] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[SCORING] ${msg}`, data)
};

// 评分权重配置
const SCORING_WEIGHTS = {
  recency: 0.3,        // 新鲜度权重
  relevance: 0.4,      // AI相关性权重
  popularity: 0.2,     // 流行度权重
  quality: 0.1         // 质量权重
};

// 源特定权重配置
const SOURCE_BONUSES = {
  'huggingface.co': 2.0,  // HuggingFace 论文获得 +2.0 加分
  'arxiv.org': 0.0        // arXiv 论文无额外加分
};

// 新鲜度评分计算
export function calculateRecencyScore(publishedDate) {
  try {
    const now = new Date();
    const publishTime = new Date(publishedDate);
    const daysAgo = Math.floor((now - publishTime) / (1000 * 60 * 60 * 24));
    
    // 新鲜度评分：当天发布10分，每天递减1分，最低1分
    let score = Math.max(1, 10 - daysAgo);
    
    // 额外奖励：7天内发布的论文获得额外加分
    if (daysAgo <= 7) {
      score += 2;
    } else if (daysAgo <= 30) {
      score += 1;
    }
    
    return parseFloat(Math.min(10, score).toFixed(2)); // 确保返回float
  } catch (error) {
    logger.warn('Failed to calculate recency score:', error);
    return 5.0; // 默认分数 (float)
  }
}

// AI相关性评分（基于论文分析结果）
export function calculateRelevanceScore(paper) {
  try {
    let score = 5.0; // 基础分数 (float)
    
    // 基于分析结果的相关性评分
    if (paper.analysis) {
      const analysis = paper.analysis;
      
      // 基于AI模型给出的相关性评分
      if (analysis.relevance_score) {
        score = parseFloat(analysis.relevance_score);
      }
      
      // 基于关键词的相关性加分
      const aiKeywords = [
        'neural network', 'deep learning', 'machine learning', 'computer vision',
        'natural language processing', 'transformer', 'attention', 'gpt', 'bert',
        'diffusion model', 'generative ai', 'reinforcement learning', 'llm',
        'multimodal', 'vision transformer', 'segmentation', 'detection'
      ];
      
      const keywords = analysis.keywords || [];
      const aiKeywordCount = keywords.filter(keyword => 
        aiKeywords.some(aiTerm => keyword.toLowerCase().includes(aiTerm))
      ).length;
      
      score += aiKeywordCount * 0.5; // 每个AI关键词加0.5分
      
      // 基于技术深度的加分
      if (analysis.technical_depth === 'high') {
        score += 1.0;
      } else if (analysis.technical_depth === 'medium') {
        score += 0.5;
      }
    }
    
    // 基于标题和摘要的关键词匹配
    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    const highValueTerms = [
      'breakthrough', 'state-of-the-art', 'novel', 'innovative', 'efficient',
      'scalable', 'robust', 'accuracy', 'performance', 'optimization'
    ];
    
    const termMatches = highValueTerms.filter(term => text.includes(term)).length;
    score += termMatches * 0.3;
    
    return parseFloat(Math.min(10, Math.max(1, score)).toFixed(2));
  } catch (error) {
    logger.warn('Failed to calculate relevance score:', error);
    return 5.0;
  }
}

// 流行度评分（基于引用、点击等指标）
export function calculatePopularityScore(paper) {
  try {
    let score = 3.0; // 基础分数 (float)
    
    // 基于引用数的评分（如果有的话）
    if (paper.citations && paper.citations > 0) {
      if (paper.citations >= 100) {
        score += 3.0;
      } else if (paper.citations >= 50) {
        score += 2.0;
      } else if (paper.citations >= 10) {
        score += 1.0;
      }
    }
    
    // 基于作者影响力的评分
    if (paper.authors && paper.authors.length > 0) {
      const influentialAuthors = [
        'yoshua bengio', 'geoffrey hinton', 'yann lecun', 'andrew ng',
        'fei-fei li', 'pieter abbeel', 'ilya sutskever', 'demis hassabis'
      ];
      
      const hasInfluentialAuthor = paper.authors.some(author =>
        influentialAuthors.some(inf => author.toLowerCase().includes(inf))
      );
      
      if (hasInfluentialAuthor) {
        score += 2.0;
      }
    }
    
    // 基于会议/期刊影响力的评分
    const topVenues = [
      'neurips', 'icml', 'iclr', 'cvpr', 'iccv', 'eccv', 'acl', 'emnlp',
      'nature', 'science', 'ieee transactions', 'jmlr'
    ];
    
    if (paper.venue) {
      const venueLower = paper.venue.toLowerCase();
      const isTopVenue = topVenues.some(venue => venueLower.includes(venue));
      
      if (isTopVenue) {
        score += 2.0;
      }
    }
    
    // 基于代码可用性的加分
    if (paper.code_available) {
      score += 1.0;
    }
    
    return parseFloat(Math.min(10, score).toFixed(2));
  } catch (error) {
    logger.warn('Failed to calculate popularity score:', error);
    return 3.0;
  }
}

// 质量评分（基于论文的完整性和技术价值）
export function calculateQualityScore(paper) {
  try {
    let score = 5.0; // 基础分数 (float)
    
    // 基于摘要完整性
    if (paper.abstract && paper.abstract.length > 200) {
      score += 1.0;
    }
    
    // 基于分析结果的深度
    if (paper.analysis) {
      const analysis = paper.analysis;
      
      // 实验部分的详细程度
      if (analysis.experiments && analysis.experiments.length > 100) {
        score += 1.0;
      }
      
      // 创新部分的深度
      if (analysis.innovations && analysis.innovations.length > 100) {
        score += 1.0;
      }
      
      // 技术深度
      if (analysis.technical_depth === 'high') {
        score += 1.5;
      } else if (analysis.technical_depth === 'medium') {
        score += 0.5;
      }
    }
    
    // 基于方法论的完整性
    if (paper.abstract && (
        paper.abstract.toLowerCase().includes('method') ||
        paper.abstract.toLowerCase().includes('approach') ||
        paper.abstract.toLowerCase().includes('algorithm') ||
        paper.abstract.toLowerCase().includes('framework')
    )) {
      score += 0.5;
    }
    
    return parseFloat(Math.min(10, score).toFixed(2));
  } catch (error) {
    logger.warn('Failed to calculate quality score:', error);
    return 5.0;
  }
}

// 计算综合评分
export function calculateComprehensiveScore(paper) {
  try {
    // 计算各项评分
    const recencyScore = calculateRecencyScore(paper.published);
    const relevanceScore = calculateRelevanceScore(paper);
    const popularityScore = calculatePopularityScore(paper);
    const qualityScore = calculateQualityScore(paper);
    
    // 计算源权重加分
    let sourceBonus = 0.0;
    let sourceType = 'unknown';
    
    // 优先基于原始来源识别，防止伪装的源混淆
    if (paper.original_source) {
      // 如果有原始来源标识，使用它
      if (paper.original_source.includes('huggingface')) {
        sourceBonus = SOURCE_BONUSES['huggingface.co'];
        sourceType = 'huggingface.co';
      } else if (paper.original_source.includes('arxiv')) {
        sourceBonus = SOURCE_BONUSES['arxiv.org'];
        sourceType = 'arxiv.org';
      }
    } else if (paper.source) {
      // 检查是否是真实的 HuggingFace 源
      if (paper.source.toLowerCase().includes('huggingface') || 
          paper.source.toLowerCase().includes('hugging face')) {
        
        // 额外验证：确保不是伪装的 arXiv 论文
        const isRealHuggingFace = !paper.url || 
                                 !paper.url.includes('arxiv.org') ||
                                 paper.is_fallback ||
                                 paper.original_source === 'huggingface_fallback';
        
        if (isRealHuggingFace) {
          sourceBonus = SOURCE_BONUSES['huggingface.co'];
          sourceType = 'huggingface.co';
        } else {
          // 这是伪装的 arXiv 论文
          sourceBonus = SOURCE_BONUSES['arxiv.org'];
          sourceType = 'arxiv.org';
        }
      } 
      // 检查是否是真实的 arXiv 源
      else if (paper.source.toLowerCase().includes('arxiv')) {
        sourceBonus = SOURCE_BONUSES['arxiv.org'];
        sourceType = 'arxiv.org';
      }
    }
    
    // 备用检查：基于URL和其他特征
    if (sourceType === 'unknown' && paper.url) {
      if (paper.url.includes('arxiv.org') && !paper.url.includes('huggingface.co')) {
        sourceBonus = SOURCE_BONUSES['arxiv.org'];
        sourceType = 'arxiv.org';
      } else if (paper.url.includes('huggingface.co') && !paper.url.includes('arxiv.org')) {
        sourceBonus = SOURCE_BONUSES['huggingface.co'];
        sourceType = 'huggingface.co';
      }
    }
    
    // 计算加权总分
    const baseScore = 
      (recencyScore * SCORING_WEIGHTS.recency) +
      (relevanceScore * SCORING_WEIGHTS.relevance) +
      (popularityScore * SCORING_WEIGHTS.popularity) +
      (qualityScore * SCORING_WEIGHTS.quality);
    
    const totalScore = baseScore + sourceBonus;
    
    // 创建评分详情对象
    const scoringDetails = {
      total_score: Math.round(totalScore * 100) / 100, // 保留两位小数
      base_score: Math.round(baseScore * 100) / 100,
      source_bonus: Math.round(sourceBonus * 100) / 100,
      source_type: sourceType,
      recency_score: Math.round(recencyScore * 100) / 100,
      relevance_score: Math.round(relevanceScore * 100) / 100,
      popularity_score: Math.round(popularityScore * 100) / 100,
      quality_score: Math.round(qualityScore * 100) / 100,
      weights: SCORING_WEIGHTS,
      calculated_at: new Date().toISOString()
    };
    
    // 添加评分详情到论文对象
    const scoredPaper = {
      ...paper,
      scoring: scoringDetails
    };
    
    logger.debug(`Calculated score for paper "${paper.title}": ${scoringDetails.total_score}`, {
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
    logger.error('Failed to calculate comprehensive score:', error);
    // 返回带有默认评分的论文
    return {
      ...paper,
      scoring: {
        total_score: 5.0,
        base_score: 5.0,
        source_bonus: 0.0,
        source_type: 'unknown',
        recency_score: 5.0,
        relevance_score: 5.0,
        popularity_score: 5.0,
        quality_score: 5.0,
        weights: SCORING_WEIGHTS,
        calculated_at: new Date().toISOString(),
        error: 'Scoring calculation failed'
      }
    };
  }
}

// 论文筛选和排序
export function filterAndSortPapers(papers, options = {}) {
  const {
    minScore = 6.0,        // 最低分数阈值 (float)
    maxPapers = 10,        // 最大论文数量，改为10篇
    minRecencyScore = 3.0,  // 最低新鲜度分数 (float)
    daysAgoLimit = 90,     // 最多90天前的论文
    ensureBothSources = true  // 确保从两个来源各选5篇
  } = options;
  
  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - daysAgoLimit * 24 * 60 * 60 * 1000);
    
    // 1. 为所有论文计算评分
    const scoredPapers = papers.map(paper => calculateComprehensiveScore(paper));
    
    // 2. 过滤论文
    const filteredPapers = scoredPapers.filter(paper => {
      // 检查时间限制
      try {
        const paperDate = new Date(paper.published);
        if (paperDate < cutoffDate) {
          return false;
        }
      } catch {
        return false;
      }
      
      // 检查分数阈值
      if (paper.scoring.total_score < minScore) {
        return false;
      }
      
      // 检查新鲜度阈值
      if (paper.scoring.recency_score < minRecencyScore) {
        return false;
      }
      
      return true;
    });
    
    logger.info(`Filtered ${scoredPapers.length} papers to ${filteredPapers.length} papers`);
    
    // 3. 排序论文
    const sortedPapers = filteredPapers.sort((a, b) => {
      // 主要按总分排序
      const scoreDiff = b.scoring.total_score - a.scoring.total_score;
      if (Math.abs(scoreDiff) > 0.1) {
        return scoreDiff;
      }
      
      // 分数相同时，按新鲜度排序
      const recencyDiff = b.scoring.recency_score - a.scoring.recency_score;
      if (Math.abs(recencyDiff) > 0.1) {
        return recencyDiff;
      }
      
      // 再按相关性排序
      const relevanceDiff = b.scoring.relevance_score - a.scoring.relevance_score;
      if (Math.abs(relevanceDiff) > 0.1) {
        return relevanceDiff;
      }
      
      // 最后按发布时间排序
      try {
        return new Date(b.published) - new Date(a.published);
      } catch {
        return 0;
      }
    });
    
    // 4. 选择Top N论文（确保从arXiv和HuggingFace各选5篇）
    let topPapers;
    if (ensureBothSources && maxPapers >= 10) {
      topPapers = selectPapersFromBothSources(sortedPapers, maxPapers);
    } else {
      topPapers = sortedPapers.slice(0, maxPapers);
    }
    
    logger.info(`Selected top ${topPapers.length} papers from ${filteredPapers.length} filtered papers`);
    
    return topPapers;
  } catch (error) {
    logger.error('Failed to filter and sort papers:', error);
    // 发生错误时，返回简单的按时间排序
    return papers
      .sort((a, b) => new Date(b.published) - new Date(a.published))
      .slice(0, maxPapers);
  }
}

// 从两个来源各选5篇论文
function selectPapersFromBothSources(sortedPapers, maxPapers = 10) {
  const arxivPapers = [];
  const huggingfacePapers = [];
  const unknownPapers = [];
  
  // 分离 arXiv 和 HuggingFace 论文，并详细记录分类过程
  sortedPapers.forEach((paper, index) => {
    const sourceType = paper.scoring.source_type;
    const paperInfo = {
      index: index,
      title: paper.title.substring(0, 50) + '...',
      source: paper.source,
      original_source: paper.original_source,
      source_type: sourceType,
      url: paper.url,
      is_fallback: paper.is_fallback,
      score: paper.scoring.total_score
    };
    
    if (sourceType === 'arxiv.org') {
      arxivPapers.push(paper);
      logger.debug(`Classified as arXiv:`, paperInfo);
    } else if (sourceType === 'huggingface.co') {
      huggingfacePapers.push(paper);
      logger.debug(`Classified as HuggingFace:`, paperInfo);
    } else {
      unknownPapers.push(paper);
      logger.warn(`Unknown source type:`, paperInfo);
    }
  });
  
  logger.info(`Paper classification: ${arxivPapers.length} arXiv, ${huggingfacePapers.length} HuggingFace, ${unknownPapers.length} unknown`);
  
  // 检查是否有足够的论文
  if (arxivPapers.length === 0 && huggingfacePapers.length === 0) {
    logger.warn('No papers found with proper source classification, fallback to score-based selection');
    return sortedPapers.slice(0, maxPapers);
  }
  
  const selectedPapers = [];
  const targetPerSource = Math.floor(maxPapers / 2); // 每个来源目标5篇
  
  // 从arXiv选择
  const arxivSelected = arxivPapers.slice(0, targetPerSource);
  selectedPapers.push(...arxivSelected);
  
  // 从HuggingFace选择
  const huggingfaceSelected = huggingfacePapers.slice(0, targetPerSource);
  selectedPapers.push(...huggingfaceSelected);
  
  logger.info(`Initial selection: ${arxivSelected.length} arXiv + ${huggingfaceSelected.length} HuggingFace = ${selectedPapers.length} papers`);
  
  // 如果还需要更多论文，按以下优先级补充
  if (selectedPapers.length < maxPapers) {
    const remainingSlots = maxPapers - selectedPapers.length;
    const remainingPapers = [];
    
    // 1. 优先从有论文但数量不足的来源补充
    if (arxivSelected.length < targetPerSource && arxivPapers.length > arxivSelected.length) {
      remainingPapers.push(...arxivPapers.slice(arxivSelected.length));
    }
    if (huggingfaceSelected.length < targetPerSource && huggingfacePapers.length > huggingfaceSelected.length) {
      remainingPapers.push(...huggingfacePapers.slice(huggingfaceSelected.length));
    }
    
    // 2. 添加未分类的论文
    remainingPapers.push(...unknownPapers);
    
    // 按分数排序并选择
    const sortedRemaining = remainingPapers.sort((a, b) => 
      b.scoring.total_score - a.scoring.total_score
    );
    
    const backupSelected = sortedRemaining.slice(0, remainingSlots);
    selectedPapers.push(...backupSelected);
    
    logger.info(`Added ${backupSelected.length} backup papers to reach ${selectedPapers.length} total papers`);
  }
  
  // 确保总数不超过maxPapers并重新排序
  const finalPapers = selectedPapers
    .slice(0, maxPapers)
    .sort((a, b) => b.scoring.total_score - a.scoring.total_score);
  
  // 最终统计和验证
  const finalArxivCount = finalPapers.filter(p => p.scoring.source_type === 'arxiv.org').length;
  const finalHuggingfaceCount = finalPapers.filter(p => p.scoring.source_type === 'huggingface.co').length;
  const finalOtherCount = finalPapers.filter(p => !['arxiv.org', 'huggingface.co'].includes(p.scoring.source_type)).length;
  
  logger.info(`Final selection summary: ${finalArxivCount} arXiv + ${finalHuggingfaceCount} HuggingFace + ${finalOtherCount} other = ${finalPapers.length} total`);
  
  // 如果分布不理想，记录警告
  if (finalArxivCount === 0) {
    logger.warn('No arXiv papers in final selection - check arXiv scraping');
  }
  if (finalHuggingfaceCount === 0) {
    logger.warn('No HuggingFace papers in final selection - check HuggingFace scraping');
  }
  
  return finalPapers;
}

// 应用 HuggingFace 优先逻辑（保留旧函数兼容性）
function applyHuggingFacePriority(sortedPapers, maxPapers) {
  const targetHuggingFaceCount = Math.min(3, maxPapers); // 目标：3/5 来自 HuggingFace
  const huggingFacePapers = [];
  const otherPapers = [];
  
  // 分离 HuggingFace 和其他论文
  sortedPapers.forEach(paper => {
    if (paper.scoring.source_type === 'huggingface.co') {
      huggingFacePapers.push(paper);
    } else {
      otherPapers.push(paper);
    }
  });
  
  logger.info(`Found ${huggingFacePapers.length} HuggingFace papers and ${otherPapers.length} other papers`);
  
  const selectedPapers = [];
  let huggingFaceSelected = 0;
  let otherSelected = 0;
  
  // 混合选择策略：确保 HuggingFace 论文有足够代表
  for (let i = 0; i < maxPapers; i++) {
    const currentHuggingFaceRatio = huggingFaceSelected / (i + 1);
    const targetRatio = targetHuggingFaceCount / maxPapers;
    
    // 如果 HuggingFace 论文比例不足，优先选择
    if (currentHuggingFaceRatio < targetRatio && huggingFacePapers.length > huggingFaceSelected) {
      selectedPapers.push(huggingFacePapers[huggingFaceSelected]);
      huggingFaceSelected++;
    } 
    // 否则选择其他论文中的最佳
    else if (otherPapers.length > otherSelected) {
      selectedPapers.push(otherPapers[otherSelected]);
      otherSelected++;
    }
    // 如果某一类论文已经选完，继续选择另一类
    else if (huggingFacePapers.length > huggingFaceSelected) {
      selectedPapers.push(huggingFacePapers[huggingFaceSelected]);
      huggingFaceSelected++;
    }
    else if (otherPapers.length > otherSelected) {
      selectedPapers.push(otherPapers[otherSelected]);
      otherSelected++;
    }
  }
  
  logger.info(`Selected ${huggingFaceSelected} HuggingFace papers and ${otherSelected} other papers`);
  
  return selectedPapers;
}

// 生成评分报告
export function generateScoringReport(papers) {
  try {
    const scoredPapers = papers.map(paper => calculateComprehensiveScore(paper));
    
    const report = {
      total_papers: scoredPapers.length,
      average_score: scoredPapers.reduce((sum, p) => sum + p.scoring.total_score, 0) / scoredPapers.length,
      score_distribution: {
        excellent: scoredPapers.filter(p => p.scoring.total_score >= 8.5).length,
        good: scoredPapers.filter(p => p.scoring.total_score >= 7.0 && p.scoring.total_score < 8.5).length,
        average: scoredPapers.filter(p => p.scoring.total_score >= 5.5 && p.scoring.total_score < 7.0).length,
        below_average: scoredPapers.filter(p => p.scoring.total_score < 5.5).length
      },
      top_paper: scoredPapers.length > 0 ? scoredPapers[0] : null,
      scoring_weights: SCORING_WEIGHTS,
      generated_at: new Date().toISOString()
    };
    
    return report;
  } catch (error) {
    logger.error('Failed to generate scoring report:', error);
    return {
      error: 'Failed to generate scoring report',
      message: error.message
    };
  }
}

export {
  SCORING_WEIGHTS,
  SOURCE_BONUSES
};