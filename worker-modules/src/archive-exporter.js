import { AppError } from './config.js';

const logger = {
  info: (msg, data = {}) => console.log(`[EXPORT] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[EXPORT] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[EXPORT] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[EXPORT] ${msg}`, data)
};

// Export format types
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  MARKDOWN: 'markdown',
  BIBTEX: 'bibtex',
  PDF: 'pdf' // Future implementation
};

// Export options defaults
const DEFAULT_EXPORT_OPTIONS = {
  includeAbstracts: true,
  includeAnalysis: true,
  includeMetadata: true,
  includeStatistics: true,
  compressLargeExports: true,
  maxPapersPerFile: 1000,
  dateFormat: 'YYYY-MM-DD',
  authorSeparator: '; ',
  keywordSeparator: '; ',
  citationStyle: 'apa' // For future citation formats
};

// Validate export request
export function validateExportRequest(params) {
  logger.info('Validating export request', params);

  const { format, startDate, endDate, category, minScore, maxScore, options = {} } = params;

  // Validate format
  if (!Object.values(EXPORT_FORMATS).includes(format)) {
    throw new AppError(`Invalid export format. Supported formats: ${Object.values(EXPORT_FORMATS).join(', ')}`, 400);
  }

  // Validate dates if provided
  if (startDate || endDate) {
    if (startDate && !isValidDate(startDate)) {
      throw new AppError('Invalid start date format. Use YYYY-MM-DD', 400);
    }
    if (endDate && !isValidDate(endDate)) {
      throw new AppError('Invalid end date format. Use YYYY-MM-DD', 400);
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new AppError('Start date must be before or equal to end date', 400);
    }
  }

  // Validate score range
  if (minScore && (minScore < 0 || minScore > 10)) {
    throw new AppError('Minimum score must be between 0 and 10', 400);
  }
  if (maxScore && (maxScore < 0 || maxScore > 10)) {
    throw new AppError('Maximum score must be between 0 and 10', 400);
  }
  if (minScore && maxScore && minScore > maxScore) {
    throw new AppError('Minimum score must be less than or equal to maximum score', 400);
  }

  // Validate options
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

  logger.info('Export request validated successfully', validatedParams);
  return validatedParams;
}

// Helper function to validate date format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Filter papers based on export parameters
export function filterPapersForExport(papers, filters) {
  const { startDate, endDate, category, minScore, maxScore } = filters;

  return papers.filter(paper => {
    // Date filter
    if (startDate || endDate) {
      const paperDate = paper.archive_date || paper.published || paper.scraped_at;
      if (startDate && new Date(paperDate) < new Date(startDate)) return false;
      if (endDate && new Date(paperDate) > new Date(endDate)) return false;
    }

    // Category filter
    if (category) {
      const paperCategory = paper.analysis?.category || paper.category || 'other';
      if (paperCategory.toLowerCase() !== category.toLowerCase()) return false;
    }

    // Score filter
    if (minScore || maxScore) {
      const score = paper.analysis?.relevance_score || 5;
      if (minScore && score < minScore) return false;
      if (maxScore && score > maxScore) return false;
    }

    return true;
  });
}

// Prepare export data with metadata
export function prepareExportData(archives, filters, options = {}) {
  try {
    logger.info('Preparing export data', { archives: archives.length, filters, options });

    // Validate input
    if (!archives || !Array.isArray(archives)) {
      throw new AppError('Invalid archives data', 400);
    }

    if (archives.length === 0) {
      return {
        papers: [],
        statistics: {
          total_papers: 0,
          category_distribution: {},
          source_distribution: {},
          score_distribution: { '1-3': 0, '4-6': 0, '7-8': 0, '9-10': 0 },
          average_score: 0,
          date_range: null
        },
        metadata: {
          version: '1.0',
          exported_at: new Date().toISOString(),
          total_original_papers: 0,
          total_filtered_papers: 0,
          filters_applied: filters,
          options_used: options,
          archives_processed: 0,
          date_range: null,
          format: filters.format || 'unknown'
        }
      };
    }

    // Collect all papers from archives
    let allPapers = [];
    archives.forEach(archive => {
      if (archive && archive.papers && Array.isArray(archive.papers)) {
        const papersWithDate = archive.papers.map(paper => ({
          ...paper,
          archive_date: archive.date,
          archive_metadata: archive.metadata
        }));
        allPapers = allPapers.concat(papersWithDate);
      }
    });

    if (allPapers.length === 0) {
      logger.warn('No papers found in archives for export');
      return {
        papers: [],
        statistics: {
          total_papers: 0,
          category_distribution: {},
          source_distribution: {},
          score_distribution: { '1-3': 0, '4-6': 0, '7-8': 0, '9-10': 0 },
          average_score: 0,
          date_range: null
        },
        metadata: {
          version: '1.0',
          exported_at: new Date().toISOString(),
          total_original_papers: 0,
          total_filtered_papers: 0,
          filters_applied: filters,
          options_used: options,
          archives_processed: archives.length,
          date_range: null,
          format: filters.format || 'unknown'
        }
      };
    }

    // Apply filters
    const filteredPapers = filterPapersForExport(allPapers, filters);

    // Generate statistics
    const statistics = generateExportStatistics(filteredPapers, archives, filters);

    // Create export metadata
    const exportMetadata = {
      version: '1.0',
      exported_at: new Date().toISOString(),
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
    logger.error('Error preparing export data:', error);
    throw new AppError(`Failed to prepare export data: ${error.message}`, 500);
  }
}

// Generate export statistics
function generateExportStatistics(papers, archives, filters) {
  const categoryStats = {};
  const sourceStats = {};
  const dateStats = {};
  const scoreDistribution = { '1-3': 0, '4-6': 0, '7-8': 0, '9-10': 0 };
  let totalScore = 0;

  papers.forEach(paper => {
    // Category statistics
    const category = paper.analysis?.category || paper.category || 'other';
    categoryStats[category] = (categoryStats[category] || 0) + 1;

    // Source statistics
    const source = paper.source || 'unknown';
    sourceStats[source] = (sourceStats[source] || 0) + 1;

    // Date statistics
    const date = paper.archive_date || paper.published || paper.scraped_at;
    const dateKey = date.split('T')[0]; // Extract date part
    dateStats[dateKey] = (dateStats[dateKey] || 0) + 1;

    // Score distribution
    const score = paper.analysis?.relevance_score || 5;
    totalScore += score;

    if (score >= 1 && score <= 3) scoreDistribution['1-3']++;
    else if (score >= 4 && score <= 6) scoreDistribution['4-6']++;
    else if (score >= 7 && score <= 8) scoreDistribution['7-8']++;
    else if (score >= 9 && score <= 10) scoreDistribution['9-10']++;
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

// Get date range from papers
function getDateRangeFromPapers(papers) {
  if (papers.length === 0) return null;

  const dates = papers.map(paper => {
    const dateStr = paper.archive_date || paper.published || paper.scraped_at;
    return new Date(dateStr);
  });

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  return {
    start: minDate.toISOString().split('T')[0],
    end: maxDate.toISOString().split('T')[0]
  };
}

// Generate JSON export
export function generateJSONExport(data, options = {}) {
  try {
    logger.info('Generating JSON export', { paper_count: data.papers.length });

    const { includeAbstracts = true, includeAnalysis = true, includeMetadata = true, includeStatistics = true } = options;

    let exportData = {
      export_metadata: data.metadata
    };

    // Process papers based on options
    if (includeAnalysis && includeAbstracts) {
      exportData.papers = data.papers;
    } else {
      exportData.papers = data.papers.map(paper => {
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
    logger.error('Error generating JSON export:', error);
    throw new AppError(`Failed to generate JSON export: ${error.message}`, 500);
  }
}

// Generate CSV export
export function generateCSVExport(data, options = {}) {
  try {
    logger.info('Generating CSV export', { paper_count: data.papers.length });

    const {
      includeAbstracts = true,
      includeAnalysis = false, // Analysis data is complex for CSV
      authorSeparator = '; ',
      keywordSeparator = '; '
    } = options;

    // Define CSV headers
    const headers = [
      'archive_date',
      'title',
      'authors',
      'category',
      'relevance_score',
      'source',
      'published_date',
      'url',
      'primary_category'
    ];

    if (includeAbstracts) {
      headers.push('abstract');
    }

    if (includeAnalysis) {
      headers.push('keywords', 'technical_depth');
    }

    // Generate CSV rows
    const rows = data.papers.map(paper => {
      const row = {
        archive_date: paper.archive_date || '',
        title: escapeCSV(paper.title),
        authors: escapeCSV(paper.authors?.join(authorSeparator) || ''),
        category: escapeCSV(paper.analysis?.category || paper.category || 'other'),
        relevance_score: paper.analysis?.relevance_score || 5,
        source: paper.source || 'unknown',
        published_date: paper.published ? paper.published.split('T')[0] : '',
        url: paper.url || '',
        primary_category: paper.primary_category || ''
      };

      if (includeAbstracts) {
        row.abstract = escapeCSV(paper.abstract || '');
      }

      if (includeAnalysis) {
        row.keywords = escapeCSV(paper.analysis?.keywords?.join(keywordSeparator) || '');
        row.technical_depth = paper.analysis?.technical_depth || 'unknown';
      }

      return headers.map(header => `"${row[header] || ''}"`).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    return csvContent;
  } catch (error) {
    logger.error('Error generating CSV export:', error);
    throw new AppError(`Failed to generate CSV export: ${error.message}`, 500);
  }
}

// Escape CSV values
function escapeCSV(value) {
  if (typeof value !== 'string') return value;

  // Replace quotes with double quotes and wrap in quotes if needed
  return value.replace(/"/g, '""');
}

// Generate Markdown export
export function generateMarkdownExport(data, options = {}) {
  try {
    logger.info('Generating Markdown export', { paper_count: data.papers.length });

    const {
      includeAbstracts = true,
      includeAnalysis = true,
      includeStatistics = true
    } = options;

    let markdown = `# PaperDog Archive Export\n\n`;

    // Add export metadata
    markdown += `**Generated**: ${data.metadata.exported_at}\n`;
    if (data.metadata.date_range) {
      markdown += `**Date Range**: ${data.metadata.date_range.start} to ${data.metadata.date_range.end}\n`;
    } else {
      markdown += `**Date Range**: No date range available\n`;
    }
    markdown += `**Total Papers**: ${data.papers.length}\n\n`;

    // Add statistics if requested
    if (includeStatistics && data.statistics) {
      markdown += '## Export Statistics\n\n';
      markdown += `- **Total Papers**: ${data.statistics.total_papers}\n`;
      markdown += `- **Average Score**: ${data.statistics.average_score}/10\n`;
      markdown += `- **Date Range**: ${data.statistics.date_range ? `${data.statistics.date_range.start} to ${data.statistics.date_range.end}` : 'No date range available'}\n\n`;

      // Category distribution
      if (Object.keys(data.statistics.category_distribution).length > 0) {
        markdown += '### Papers by Category\n\n';
        Object.entries(data.statistics.category_distribution)
          .sort(([,a], [,b]) => b - a)
          .forEach(([category, count]) => {
            markdown += `- **${category}**: ${count} papers\n`;
          });
        markdown += '\n';
      }

      // Source distribution
      if (Object.keys(data.statistics.source_distribution).length > 0) {
        markdown += '### Papers by Source\n\n';
        Object.entries(data.statistics.source_distribution)
          .sort(([,a], [,b]) => b - a)
          .forEach(([source, count]) => {
            markdown += `- **${source}**: ${count} papers\n`;
          });
        markdown += '\n';
      }

      // Score distribution
      markdown += '### Score Distribution\n\n';
      Object.entries(data.statistics.score_distribution).forEach(([range, count]) => {
        markdown += `- **${range}**: ${count} papers\n`;
      });
      markdown += '\n---\n\n';
    }

    // Group papers by date
    const papersByDate = {};
    data.papers.forEach(paper => {
      const date = paper.archive_date || paper.published?.split('T')[0] || 'Unknown';
      if (!papersByDate[date]) papersByDate[date] = [];
      papersByDate[date].push(paper);
    });

    // Add papers grouped by date
    Object.keys(papersByDate).sort().reverse().forEach(date => {
      const papers = papersByDate[date];
      markdown += `## ${date} (${papers.length} papers)\n\n`;

      papers.forEach((paper, index) => {
        const score = paper.analysis?.relevance_score || 5;
        const category = paper.analysis?.category || paper.category || 'other';
        const depth = paper.analysis?.technical_depth || 'unknown';

        markdown += `### ${index + 1}. [${score}/10] ${paper.title}\n\n`;
        markdown += `**Authors**: ${paper.authors?.join(', ') || 'Unknown'}\n`;
        markdown += `**Category**: ${category} | **Source**: ${paper.source || 'unknown'} | **Depth**: ${depth}\n`;

        if (paper.url) {
          markdown += `**URL**: ${paper.url}\n`;
        }

        if (paper.published) {
          markdown += `**Published**: ${paper.published.split('T')[0]}\n`;
        }

        if (includeAnalysis && paper.analysis?.keywords?.length > 0) {
          markdown += `**Keywords**: ${paper.analysis.keywords.join(', ')}\n`;
        }

        markdown += '\n';

        if (includeAbstracts && paper.abstract) {
          markdown += '**Abstract**:\n';
          markdown += `${paper.abstract}\n\n`;
        }

        if (includeAnalysis && paper.analysis) {
          const analysis = paper.analysis;

          if (analysis.introduction) {
            markdown += '**Introduction**:\n';
            markdown += `${analysis.introduction}\n\n`;
          }

          if (analysis.innovations) {
            markdown += '**Innovations**:\n';
            markdown += `${analysis.innovations}\n\n`;
          }

          if (analysis.experiments) {
            markdown += '**Experiments & Results**:\n';
            markdown += `${analysis.experiments}\n\n`;
          }

          if (analysis.insights) {
            markdown += '**Insights & Future Directions**:\n';
            markdown += `${analysis.insights}\n\n`;
          }
        }

        markdown += '---\n\n';
      });
    });

    return markdown;
  } catch (error) {
    logger.error('Error generating Markdown export:', error);
    throw new AppError(`Failed to generate Markdown export: ${error.message}`, 500);
  }
}

// Generate BibTeX export
export function generateBibTeXExport(data, options = {}) {
  try {
    logger.info('Generating BibTeX export', { paper_count: data.papers.length });

    const { citationStyle = 'apa' } = options;
    let bibtex = '';

    data.papers.forEach((paper, index) => {
      const key = generateBibTeXKey(paper, index);
      const authors = formatBibTeXAuthors(paper.authors || []);
      const title = paper.title.replace(/[{}]/g, '\\$&'); // Escape special chars
      const year = new Date(paper.published || paper.archive_date).getFullYear();
      const month = new Date(paper.published || paper.archive_date).toLocaleString('default', { month: 'short' }).toLowerCase();

      bibtex += `@article{${key},\n`;
      bibtex += `  title={${title}},\n`;

      if (authors) {
        bibtex += `  author={${authors}},\n`;
      }

      bibtex += `  year={${year}},\n`;
      bibtex += `  month={${month}},\n`;

      // Add journal/source information
      if (paper.source === 'arxiv' && paper.url) {
        const arxivMatch = paper.url.match(/arxiv\.org\/abs\/(\d+\.\d+)/);
        if (arxivMatch) {
          bibtex += `  journal={arXiv preprint arXiv:${arxivMatch[1]}},\n`;
        }
      } else if (paper.source === 'huggingface') {
        bibtex += `  journal={HuggingFace Papers},\n`;
      } else {
        bibtex += `  journal={${paper.source || 'Unknown Source'}},\n`;
      }

      // Add URL
      if (paper.url) {
        bibtex += `  url={${paper.url}},\n`;
      }

      // Add primary category as note
      if (paper.primary_category) {
        bibtex += `  note={Primary category: ${paper.primary_category}},\n`;
      }

      // Add keywords if available
      if (paper.analysis?.keywords?.length > 0) {
        const keywords = paper.analysis.keywords.join(', ');
        bibtex += `  keywords={${keywords}},\n`;
      }

      // Add PaperDog reference
      bibtex += `  note={Accessed via PaperDog Archive},\n`;

      // Remove trailing comma and newline
      bibtex = bibtex.trim().replace(/,\n$/, '\n');
      bibtex += '}\n\n';
    });

    return bibtex.trim();
  } catch (error) {
    logger.error('Error generating BibTeX export:', error);
    throw new AppError(`Failed to generate BibTeX export: ${error.message}`, 500);
  }
}

// Generate BibTeX key
function generateBibTeXKey(paper, index) {
  const authors = paper.authors || [];
  const year = new Date(paper.published || paper.archive_date).getFullYear();

  // Use first author's last name if available
  let authorKey = '';
  if (authors.length > 0) {
    const firstAuthor = authors[0];
    const nameParts = firstAuthor.split(' ');
    authorKey = nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  } else {
    authorKey = 'unknown';
  }

  // Create title key (first few words)
  const titleWords = paper.title.toLowerCase().split(' ').slice(0, 3);
  const titleKey = titleWords.map(word => word.replace(/[^a-z]/g, '')).join('_');

  return `paperdog_${year}_${authorKey}_${titleKey}_${index + 1}`;
}

// Format authors for BibTeX
function formatBibTeXAuthors(authors) {
  if (!authors || authors.length === 0) return '';

  // Convert "First Last" to "Last, First" format
  const formattedAuthors = authors.map(author => {
    const nameParts = author.trim().split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts.slice(0, -1).join(' ');
      const lastName = nameParts[nameParts.length - 1];
      return `${lastName}, ${firstName}`;
    }
    return author;
  });

  return formattedAuthors.join(' and ');
}

// Generate export filename
export function generateExportFilename(format, dateRange, filters = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const startDate = dateRange?.start || 'all';
  const endDate = dateRange?.end || 'all';

  let filename = `paperdog_archive_${startDate}_to_${endDate}`;

  // Add filter indicators
  if (filters.category) filename += `_cat_${filters.category}`;
  if (filters.minScore) filename += `_min_${filters.minScore}`;
  if (filters.maxScore) filename += `_max_${filters.maxScore}`;

  filename += `_${timestamp}.${format}`;

  return filename;
}

// Compress export data
export async function compressExport(data, format) {
  try {
    logger.info('Compressing export data');

    // For now, we'll use basic compression
    // In a real implementation, you might use a compression library
    const compressed = {
      compressed: true,
      format: format,
      original_size: data.length,
      compressed_size: data.length, // Placeholder
      compression_ratio: 1.0, // Placeholder
      data: data
    };

    return JSON.stringify(compressed);
  } catch (error) {
    logger.error('Error compressing export data:', error);
    throw new AppError(`Failed to compress export: ${error.message}`, 500);
  }
}

// Main export function
export async function exportArchiveData(archives, params) {
  try {
    logger.info('Starting archive export', { format: params.format, archives: archives.length });

    // Validate and normalize parameters
    const validatedParams = validateExportRequest(params);
    const { format, options } = validatedParams;

    logger.info('Preparing export data...');
    // Prepare export data
    const exportData = prepareExportData(archives, validatedParams, options);

    logger.info(`Generating ${format} export for ${exportData.papers.length} papers`);
    // Generate export content based on format
    let exportContent;
    let contentType;
    let fileExtension;

    switch (format) {
      case EXPORT_FORMATS.JSON:
        exportContent = generateJSONExport(exportData, options);
        contentType = 'application/json';
        fileExtension = 'json';
        break;

      case EXPORT_FORMATS.CSV:
        exportContent = generateCSVExport(exportData, options);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;

      case EXPORT_FORMATS.MARKDOWN:
        exportContent = generateMarkdownExport(exportData, options);
        contentType = 'text/markdown';
        fileExtension = 'md';
        break;

      case EXPORT_FORMATS.BIBTEX:
        exportContent = generateBibTeXExport(exportData, options);
        contentType = 'text/plain';
        fileExtension = 'bib';
        break;

      default:
        throw new AppError(`Export format '${format}' not implemented yet`, 501);
    }

    logger.info(`Export content generated (${exportContent.length} characters)`);

    // Generate filename
    const filename = generateExportFilename(fileExtension, exportData.metadata.date_range, validatedParams);

    // Compress if requested and content is large
    if (options.compressLargeExports && exportContent.length > 100000) { // 100KB threshold
      logger.info('Compressing large export...');
      exportContent = await compressExport(exportContent, format);
      contentType = 'application/json'; // Compressed data is JSON-wrapped
    }

    logger.info('Export completed successfully', {
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
    logger.error('Error in exportArchiveData:', error);
    throw error instanceof AppError ? error : new AppError(`Export failed: ${error.message}`, 500);
  }
}

// Batch export for large datasets
export async function batchExportArchiveData(archives, params, batchSize = 1000) {
  try {
    logger.info('Starting batch export', { batch_size: batchSize, total_archives: archives.length });

    const allPapers = [];
    archives.forEach(archive => {
      const papersWithDate = archive.papers.map(paper => ({
        ...paper,
        archive_date: archive.date
      }));
      allPapers.push(...papersWithDate);
    });

    // Filter papers
    const filteredPapers = filterPapersForExport(allPapers, params);

    if (filteredPapers.length === 0) {
      throw new AppError('No papers match the specified filters', 404);
    }

    // Process in batches
    const batches = [];
    for (let i = 0; i < filteredPapers.length; i += batchSize) {
      const batchPapers = filteredPapers.slice(i, i + batchSize);
      const batchData = {
        papers: batchPapers,
        metadata: {
          ...params,
          batch_number: Math.floor(i / batchSize) + 1,
          total_batches: Math.ceil(filteredPapers.length / batchSize)
        }
      };
      batches.push(batchData);
    }

    logger.info(`Created ${batches.length} batches for export`);
    return batches;
  } catch (error) {
    logger.error('Error in batchExportArchiveData:', error);
    throw error instanceof AppError ? error : new AppError(`Batch export failed: ${error.message}`, 500);
  }
}