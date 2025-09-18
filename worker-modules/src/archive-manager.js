import { AppError, TOPIC_CATEGORIES } from './config.js';
import { validateDate, generatePaperId, sortPapersByDate } from './utils.js';

const logger = {
  info: (msg, data = {}) => console.log(`[ARCHIVE] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[ARCHIVE] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[ARCHIVE] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[ARCHIVE] ${msg}`, data)
};

// Archive storage keys
const ARCHIVE_KEYS = {
  daily: (date) => `archive_${date}`,
  index: 'archive_index',
  stats: 'archive_stats',
  search_cache: (hash) => `archive_search_${hash}`,
  export_cache: (jobId) => `export_${jobId}`
};

// Archive entry structure
function createArchiveEntry(date, papers, metadata = {}) {
  const categories = {};
  const sources = {};
  const scores = [];
  const keywords = new Set();

  papers.forEach(paper => {
    // Count categories
    const category = paper.analysis?.category || paper.category || 'other';
    categories[category] = (categories[category] || 0) + 1;

    // Count sources
    const source = paper.source || 'unknown';
    sources[source] = (sources[source] || 0) + 1;

    // Collect scores
    const score = paper.analysis?.relevance_score || 5;
    scores.push(score);

    // Collect keywords
    (paper.analysis?.keywords || []).forEach(keyword => keywords.add(keyword));
  });

  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    date,
    papers: papers.map(paper => ({
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
      archive_metadata: {
        archived_at: new Date().toISOString(),
        original_id: paper.id
      }
    })),
    metadata: {
      total_papers: papers.length,
      categories,
      sources,
      average_score: Math.round(avgScore * 10) / 10,
      unique_keywords: Array.from(keywords).slice(0, 50),
      created_at: new Date().toISOString(),
      ...metadata
    }
  };
}

// Create or update archive index
async function updateArchiveIndex(env, date, stats) {
  try {
    const existingIndex = await getArchiveIndex(env);
    const index = existingIndex || {
      available_dates: [],
      date_stats: {},
      last_updated: null
    };

    // Add date if not exists
    if (!index.available_dates.includes(date)) {
      index.available_dates.push(date);
      index.available_dates.sort().reverse(); // Most recent first
    }

    // Update date stats
    index.date_stats[date] = {
      total_papers: stats.total_papers,
      average_score: stats.average_score,
      categories: stats.categories,
      sources: stats.sources,
      updated_at: new Date().toISOString()
    };

    index.last_updated = new Date().toISOString();

    // Store updated index
    await env.PAPERS.put(ARCHIVE_KEYS.index, JSON.stringify(index), {
      expirationTtl: 365 * 24 * 60 * 60 // 1 year
    });

    return index;
  } catch (error) {
    logger.error('Error updating archive index:', error);
    throw new AppError('Failed to update archive index', 500);
  }
}

// Get archive index
export async function getArchiveIndex(env) {
  try {
    const cached = await env.PAPERS.get(ARCHIVE_KEYS.index);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    logger.error('Error reading archive index:', error);
  }
  return null;
}

// Archive papers for a specific date
export async function archivePapers(date, papers, env, metadata = {}) {
  try {
    validateDate(date);

    if (!papers || papers.length === 0) {
      throw new AppError('No papers provided for archiving', 400);
    }

    logger.info(`Archiving ${papers.length} papers for date ${date}`);

    // Create archive entry
    const archiveEntry = createArchiveEntry(date, papers, metadata);

    // Store archive entry with long TTL (1 year)
    await env.PAPERS.put(ARCHIVE_KEYS.daily(date), JSON.stringify(archiveEntry), {
      expirationTtl: 365 * 24 * 60 * 60 // 1 year
    });

    // Update archive index
    await updateArchiveIndex(env, date, archiveEntry.metadata);

    logger.info(`Successfully archived ${papers.length} papers for ${date}`);

    return {
      success: true,
      date,
      papers_archived: papers.length,
      metadata: archiveEntry.metadata
    };
  } catch (error) {
    logger.error(`Error archiving papers for ${date}:`, error);
    throw error instanceof AppError ? error : new AppError(`Archive failed: ${error.message}`, 500);
  }
}

// Get archived papers for a specific date
export async function getArchivedPapers(date, env) {
  try {
    validateDate(date);

    const cached = await env.PAPERS.get(ARCHIVE_KEYS.daily(date));
    if (!cached) {
      return null;
    }

    const archiveEntry = JSON.parse(cached);
    return archiveEntry;
  } catch (error) {
    logger.error(`Error retrieving archived papers for ${date}:`, error);
    throw new AppError(`Failed to retrieve archive: ${error.message}`, 500);
  }
}

// Get archived papers for a date range
export async function getArchivedPapersByRange(startDate, endDate, env) {
  try {
    validateDate(startDate);
    validateDate(endDate);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new AppError('Start date must be before or equal to end date', 400);
    }

    // Get archive index to check available dates
    const index = await getArchiveIndex(env);
    if (!index) {
      return [];
    }

    const availableDates = index.available_dates.filter(date => {
      const dateObj = new Date(date);
      return dateObj >= start && dateObj <= end;
    });

    if (availableDates.length === 0) {
      return [];
    }

    // Fetch archives for available dates in parallel
    const archives = await Promise.all(
      availableDates.map(date => getArchivedPapers(date, env))
    );

    return archives.filter(archive => archive !== null);
  } catch (error) {
    logger.error(`Error retrieving archived papers for range ${startDate} to ${endDate}:`, error);
    throw error instanceof AppError ? error : new AppError(`Failed to retrieve archive range: ${error.message}`, 500);
  }
}

// Search within archived papers
export async function searchArchivedPapers(query, filters = {}, env) {
  try {
    if (!query || query.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400);
    }

    const { startDate, endDate, category, minScore, maxResults = 50 } = filters;

    // Get date range
    let archives = [];
    if (startDate && endDate) {
      archives = await getArchivedPapersByRange(startDate, endDate, env);
    } else {
      // Get last 30 days if no date range specified
      const index = await getArchiveIndex(env);
      if (index && index.available_dates.length > 0) {
        const recentDates = index.available_dates.slice(0, 30);
        archives = await Promise.all(
          recentDates.map(date => getArchivedPapers(date, env))
        );
        archives = archives.filter(archive => archive !== null);
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

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const results = [];

    archives.forEach(archive => {
      archive.papers.forEach(paper => {
        // Apply filters
        if (category) {
          const paperCategory = paper.analysis?.category || paper.category || 'other';
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

        // Search in paper content
        const searchableText = [
          paper.title,
          paper.abstract,
          paper.authors?.join(' '),
          paper.analysis?.keywords?.join(' '),
          paper.analysis?.introduction,
          paper.analysis?.innovations
        ].filter(Boolean).join(' ').toLowerCase();

        const matches = searchTerms.every(term => searchableText.includes(term));

        if (matches) {
          results.push({
            ...paper,
            archive_date: archive.date,
            search_relevance: calculateSearchRelevance(paper, searchTerms)
          });
        }
      });
    });

    // Sort by relevance and score
    results.sort((a, b) => {
      const relevanceA = a.search_relevance;
      const relevanceB = b.search_relevance;
      const scoreA = a.analysis?.relevance_score || 5;
      const scoreB = b.analysis?.relevance_score || 5;

      if (relevanceB !== relevanceA) return relevanceB - relevanceA;
      return scoreB - scoreA;
    });

    // Limit results
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
    logger.error('Error searching archived papers:', error);
    throw error instanceof AppError ? error : new AppError(`Search failed: ${error.message}`, 500);
  }
}

// Calculate search relevance score
function calculateSearchRelevance(paper, searchTerms) {
  let score = 0;
  const title = paper.title.toLowerCase();
  const abstract = paper.abstract.toLowerCase();
  const keywords = (paper.analysis?.keywords || []).join(' ').toLowerCase();

  searchTerms.forEach(term => {
    // Title matches (highest weight)
    if (title.includes(term)) score += 3;

    // Keywords matches (high weight)
    if (keywords.includes(term)) score += 2;

    // Abstract matches (medium weight)
    if (abstract.includes(term)) score += 1;
  });

  // Bonus for paper score
  const paperScore = paper.analysis?.relevance_score || 5;
  score += (paperScore - 5) * 0.5; // Normalize paper score impact

  return score;
}

// Get archive statistics
export async function getArchiveStatistics(env) {
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

    // Aggregate statistics from date stats
    Object.entries(index.date_stats).forEach(([date, dateStats]) => {
      stats.total_papers += dateStats.total_papers;

      // Aggregate categories
      Object.entries(dateStats.categories).forEach(([category, count]) => {
        stats.category_distribution[category] = (stats.category_distribution[category] || 0) + count;
      });

      // Aggregate sources
      Object.entries(dateStats.sources).forEach(([source, count]) => {
        stats.source_distribution[source] = (stats.source_distribution[source] || 0) + count;
      });

      // Store daily average
      stats.daily_averages[date] = dateStats.average_score;
    });

    // Calculate overall average score
    const scoreSum = Object.values(stats.daily_averages).reduce((a, b) => a + b, 0);
    stats.overall_average_score = stats.total_archives > 0 ? scoreSum / stats.total_archives : 0;

    return stats;
  } catch (error) {
    logger.error('Error getting archive statistics:', error);
    throw new AppError(`Failed to get archive statistics: ${error.message}`, 500);
  }
}

// Check if date has been archived
export async function isDateArchived(date, env) {
  try {
    validateDate(date);
    const archive = await getArchivedPapers(date, env);
    return archive !== null;
  } catch (error) {
    logger.error(`Error checking if date ${date} is archived:`, error);
    return false;
  }
}

// Get available archive dates
export async function getAvailableArchiveDates(env) {
  try {
    const index = await getArchiveIndex(env);
    return index ? index.available_dates : [];
  } catch (error) {
    logger.error('Error getting available archive dates:', error);
    return [];
  }
}

// Clean up old archives (optional maintenance function)
export async function cleanupOldArchives(beforeDate, env) {
  try {
    validateDate(beforeDate);

    const index = await getArchiveIndex(env);
    if (!index) {
      return { removed: 0 };
    }

    const cutoffDate = new Date(beforeDate);
    const datesToRemove = index.available_dates.filter(date => new Date(date) < cutoffDate);

    if (datesToRemove.length === 0) {
      return { removed: 0 };
    }

    // Remove archive entries
    await Promise.all(
      datesToRemove.map(date => env.PAPERS.delete(ARCHIVE_KEYS.daily(date)))
    );

    // Update index
    index.available_dates = index.available_dates.filter(date => !datesToRemove.includes(date));
    datesToRemove.forEach(date => delete index.date_stats[date]);

    await env.PAPERS.put(ARCHIVE_KEYS.index, JSON.stringify(index), {
      expirationTtl: 365 * 24 * 60 * 60
    });

    logger.info(`Cleaned up ${datesToRemove.length} old archives before ${beforeDate}`);

    return { removed: datesToRemove.length, dates_removed: datesToRemove };
  } catch (error) {
    logger.error('Error cleaning up old archives:', error);
    throw new AppError(`Cleanup failed: ${error.message}`, 500);
  }
}

export {
  ARCHIVE_KEYS
};