import { AppError, corsHeaders } from './config.js';
import {
  archivePapers,
  getArchivedPapers,
  getArchivedPapersByRange,
  searchArchivedPapers,
  getArchiveStatistics,
  getAvailableArchiveDates,
  getArchiveIndex
} from './archive-manager.js';
import {
  exportArchiveData,
  validateExportRequest,
  prepareExportData,
  EXPORT_FORMATS,
  generateExportFilename
} from './archive-exporter.js';
import { validateDate, jsonResponse, errorResponse } from './utils.js';

const logger = {
  info: (msg, data = {}) => console.log(`[ARCHIVE_HANDLER] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[ARCHIVE_HANDLER] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[ARCHIVE_HANDLER] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[ARCHIVE_HANDLER] ${msg}`, data)
};

// Get available archive dates
export async function handleArchiveDates(request, env) {
  try {
    logger.info('Getting available archive dates');

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
    logger.error('Error getting archive dates:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Get archived papers for specific date
export async function handleArchiveByDate(request, env, date) {
  try {
    validateDate(date);
    logger.info(`Getting archived papers for date: ${date}`);

    const archive = await getArchivedPapers(date, env);
    if (!archive) {
      return errorResponse('No archived papers found for this date', 404);
    }

    return jsonResponse({
      date: date,
      papers: archive.papers,
      metadata: archive.metadata,
      total_papers: archive.papers.length
    });
  } catch (error) {
    logger.error(`Error getting archived papers for ${date}:`, error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Get archived papers for date range
export async function handleArchiveRange(request, env) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const category = url.searchParams.get('category');
    const minScore = url.searchParams.get('min_score') ? parseFloat(url.searchParams.get('min_score')) : null;
    const maxScore = url.searchParams.get('max_score') ? parseFloat(url.searchParams.get('max_score')) : null;

    if (!startDate || !endDate) {
      return errorResponse('Both start_date and end_date are required', 400);
    }

    validateDate(startDate);
    validateDate(endDate);

    logger.info(`Getting archived papers for range: ${startDate} to ${endDate}`);

    let archives = await getArchivedPapersByRange(startDate, endDate, env);

    // Apply additional filters
    if (category || minScore !== null || maxScore !== null) {
      archives = archives.map(archive => ({
        ...archive,
        papers: archive.papers.filter(paper => {
          if (category) {
            const paperCategory = paper.analysis?.category || paper.category || 'other';
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
      })).filter(archive => archive.papers.length > 0);
    }

    // Flatten papers and add archive date
    const allPapers = [];
    let totalPapers = 0;

    archives.forEach(archive => {
      archive.papers.forEach(paper => {
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
    logger.error('Error getting archived papers by range:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Search archived papers
export async function handleArchiveSearch(request, env) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const category = url.searchParams.get('category');
    const minScore = url.searchParams.get('min_score') ? parseFloat(url.searchParams.get('min_score')) : null;
    const maxResults = parseInt(url.searchParams.get('max_results')) || 50;

    if (!query || query.trim().length < 2) {
      return errorResponse('Search query must be at least 2 characters', 400);
    }

    logger.info(`Searching archived papers with query: ${query}`);

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
      filters: filters,
      results: results.results,
      total_results: results.total_results,
      archives_searched: results.archives_searched,
      date_range: results.date_range
    });
  } catch (error) {
    logger.error('Error searching archived papers:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Get archive statistics
export async function handleArchiveStatistics(request, env) {
  try {
    logger.info('Getting archive statistics');

    const stats = await getArchiveStatistics(env);

    return jsonResponse({
      statistics: stats,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting archive statistics:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Export archived papers
export async function handleArchiveExport(request, env) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const category = url.searchParams.get('category');
    const minScore = url.searchParams.get('min_score') ? parseFloat(url.searchParams.get('min_score')) : null;
    const maxScore = url.searchParams.get('max_score') ? parseFloat(url.searchParams.get('max_score')) : null;
    const includeAbstracts = url.searchParams.get('include_abstracts') !== 'false';
    const includeAnalysis = url.searchParams.get('include_analysis') !== 'false';
    const includeStatistics = url.searchParams.get('include_statistics') !== 'false';

    logger.info(`Exporting archived papers in ${format} format`, {
      startDate,
      endDate,
      category,
      minScore,
      maxScore
    });

    // Validate export parameters
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

    logger.info(`Validated export parameters:`, exportParams);

    // Get archives based on date range
    let archives;
    if (startDate && endDate) {
      archives = await getArchivedPapersByRange(startDate, endDate, env);
    } else {
      // Get all available archives
      const availableDates = await getAvailableArchiveDates(env);
      if (availableDates.length === 0) {
        return errorResponse('No archived papers available for export', 404);
      }
      archives = await Promise.all(
        availableDates.slice(0, 30).map(date => getArchivedPapers(date, env))
      );
      archives = archives.filter(archive => archive !== null);
    }

    if (archives.length === 0) {
      return errorResponse('No archived papers found for the specified criteria', 404);
    }

    // Generate export
    logger.info(`Generating export from ${archives.length} archives`);
    const exportResult = await exportArchiveData(archives, exportParams);

    logger.info(`Export generated successfully:`, {
      format: exportResult.format,
      filename: exportResult.filename,
      size: exportResult.content.length,
      papers: exportResult.statistics?.total_papers || 0
    });

    // Return file download response
    return new Response(exportResult.content, {
      status: 200,
      headers: {
        'Content-Type': exportResult.contentType,
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
        'Access-Control-Expose-Headers': 'Content-Disposition',
        'Content-Length': exportResult.content.length.toString(),
        ...corsHeaders
      }
    });
  } catch (error) {
    logger.error('Error exporting archived papers:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Get available export formats
export async function handleExportFormats(request, env) {
  try {
    logger.info('Getting available export formats');

    const formats = Object.values(EXPORT_FORMATS).map(format => ({
      format: format,
      description: getFormatDescription(format),
      content_type: getContentType(format),
      file_extension: getFileExtension(format),
      supports_analysis: supportsAnalysis(format),
      supports_statistics: supportsStatistics(format)
    }));

    return jsonResponse({
      formats: formats,
      default_format: EXPORT_FORMATS.JSON,
      total_formats: formats.length
    });
  } catch (error) {
    logger.error('Error getting export formats:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Create new archive (manual archiving)
export async function handleCreateArchive(request, env) {
  try {
    // Check for API key or admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Authorization required', 401);
    }

    // For now, simple token check - in production, use proper authentication
    const token = authHeader.split(' ')[1];
    if (token !== env.ADMIN_TOKEN) {
      return errorResponse('Invalid authorization token', 403);
    }

    const body = await request.json();
    const { date, papers, metadata = {} } = body;

    if (!date || !papers || !Array.isArray(papers)) {
      return errorResponse('Date and papers array are required', 400);
    }

    validateDate(date);

    logger.info(`Creating manual archive for date: ${date}`);

    const result = await archivePapers(date, papers, env, metadata);

    return jsonResponse({
      success: true,
      message: `Successfully archived ${result.papers_archived} papers for ${date}`,
      date: date,
      papers_archived: result.papers_archived,
      metadata: result.metadata
    });
  } catch (error) {
    logger.error('Error creating archive:', error);
    return errorResponse(error.message, error.statusCode || 500);
  }
}

// Helper functions
function getFormatDescription(format) {
  const descriptions = {
    [EXPORT_FORMATS.JSON]: 'Complete data in JSON format with full analysis and metadata',
    [EXPORT_FORMATS.CSV]: 'Structured tabular data suitable for spreadsheet applications',
    [EXPORT_FORMATS.MARKDOWN]: 'Human-readable format with formatting and structure',
    [EXPORT_FORMATS.BIBTEX]: 'Academic citation format for reference management software',
    [EXPORT_FORMATS.PDF]: 'Formatted PDF documents (coming soon)'
  };
  return descriptions[format] || 'Unknown format';
}

function getContentType(format) {
  const contentTypes = {
    [EXPORT_FORMATS.JSON]: 'application/json',
    [EXPORT_FORMATS.CSV]: 'text/csv',
    [EXPORT_FORMATS.MARKDOWN]: 'text/markdown',
    [EXPORT_FORMATS.BIBTEX]: 'text/plain',
    [EXPORT_FORMATS.PDF]: 'application/pdf'
  };
  return contentTypes[format] || 'application/octet-stream';
}

function getFileExtension(format) {
  const extensions = {
    [EXPORT_FORMATS.JSON]: 'json',
    [EXPORT_FORMATS.CSV]: 'csv',
    [EXPORT_FORMATS.MARKDOWN]: 'md',
    [EXPORT_FORMATS.BIBTEX]: 'bib',
    [EXPORT_FORMATS.PDF]: 'pdf'
  };
  return extensions[format] || 'txt';
}

function supportsAnalysis(format) {
  return [EXPORT_FORMATS.JSON, EXPORT_FORMATS.MARKDOWN].includes(format);
}

function supportsStatistics(format) {
  return [EXPORT_FORMATS.JSON, EXPORT_FORMATS.MARKDOWN, EXPORT_FORMATS.CSV].includes(format);
}

// Export all handlers
export const archiveHandlers = {
  handleArchiveDates,
  handleArchiveByDate,
  handleArchiveRange,
  handleArchiveSearch,
  handleArchiveStatistics,
  handleArchiveExport,
  handleExportFormats,
  handleCreateArchive
};