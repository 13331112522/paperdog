import { formatDate, formatBytes, sanitizeFilename } from './utils.js';

// Enhanced archive HTML template with export functionality
export function generateEnhancedArchiveHTML(data) {
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

  // Generate export URL parameters
  const exportParams = new URLSearchParams();
  if (selectedDate) exportParams.set('start_date', selectedDate);
  if (selectedDate) exportParams.set('end_date', selectedDate);
  if (category) exportParams.set('category', category);

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
                    <div class="stats-number">${statistics.overall_average_score?.toFixed(1) || '0.0'}</div>
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
        ` : ''}

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
                    <strong>JSON:</strong> Complete data with analysis •
                    <strong>CSV:</strong> Tabular data for analysis •
                    <strong>Markdown:</strong> Human-readable reports •
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
                ${availableDates.slice(0, 15).map(date => `
                    <a href="?date=${date}" class="date-btn ${selectedDate === date ? 'active' : ''}" title="${formatDate(date)}">
                        ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </a>
                `).join('')}
                ${availableDates.length > 15 ? `
                    <span class="text-muted ms-2">... and ${availableDates.length - 15} more dates</span>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <!-- Filters and Search -->
        <div class="filter-section">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <form method="GET" action="/archive" class="d-flex gap-2">
                        ${selectedDate ? `<input type="hidden" name="date" value="${selectedDate}">` : ''}
                        <input type="text" name="search" class="form-control search-box" placeholder="Search papers..." value="${search || ''}">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-search"></i>
                        </button>
                        ${search ? `<a href="?${selectedDate ? `date=${selectedDate}` : ''}" class="btn btn-outline-secondary">Clear</a>` : ''}
                    </form>
                </div>
                <div class="col-lg-6 text-end">
                    <div class="btn-group" role="group">
                        <a href="?${new URLSearchParams({...filters, date: selectedDate}).toString()}" class="btn btn-outline-primary ${!category ? 'active' : ''}">
                            All Categories
                        </a>
                        ${statistics ? Object.keys(statistics.category_distribution || {}).slice(0, 5).map(cat => `
                            <a href="?${new URLSearchParams({...filters, date: selectedDate, category: cat}).toString()}"
                               class="btn btn-outline-primary ${category === cat ? 'active' : ''}"
                               title="${cat.replace(/_/g, ' ')}">
                                ${cat.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </a>
                        `).join('') : ''}
                    </div>
                </div>
            </div>
        </div>

        <!-- Papers List -->
        <div class="papers-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>
                    <i class="fas fa-file-alt me-2"></i>
                    ${selectedDate ? `Papers for ${formatDate(selectedDate)}` : 'Recent Papers'}
                    ${category ? ` - ${category.replace(/_/g, ' ')}` : ''}
                    ${search ? ` (Search: "${search}")` : ''}
                </h4>
                <span class="text-muted">${totalPapers} papers found</span>
            </div>

            ${papers.length === 0 ? `
                <div class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No papers found</h5>
                    <p class="text-muted">Try adjusting your search criteria or browse a different date.</p>
                </div>
            ` : papers.map(paper => `
                <div class="paper-card">
                    <div class="row">
                        <div class="col-md-10">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="mb-1">
                                    <a href="${paper.url || '#'}" target="_blank" class="text-decoration-none">
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
                                <i class="fas fa-user me-1"></i>${paper.authors?.join(', ') || 'Unknown authors'}
                                ${paper.published ? `<span class="ms-3"><i class="fas fa-calendar me-1"></i>${new Date(paper.published).toLocaleDateString()}</span>` : ''}
                                ${paper.source ? `<span class="ms-3"><i class="fas fa-database me-1"></i>${paper.source}</span>` : ''}
                            </p>
                            ${paper.analysis?.category ? `<span class="category-badge mb-2 d-inline-block">${paper.analysis.category.replace(/_/g, ' ')}</span>` : ''}
                            <p class="mb-2">${paper.abstract?.substring(0, 300) || 'No abstract available'}${paper.abstract?.length > 300 ? '...' : ''}</p>
                            ${paper.analysis?.keywords?.length > 0 ? `
                                <div class="mb-2">
                                    <small class="text-muted">Keywords: ${paper.analysis.keywords.slice(0, 8).join(', ')}</small>
                                </div>
                            ` : ''}
                        </div>
                        <div class="col-md-2 text-end">
                            ${paper.url ? `
                                <a href="${paper.url}" target="_blank" class="btn btn-sm btn-outline-primary mb-2">
                                    <i class="fas fa-external-link-alt me-1"></i>View Paper
                                </a>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-secondary" onclick="exportPaper('${paper.id}', '${sanitizeFilename(paper.title)}')">
                                <i class="fas fa-download me-1"></i>Export
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Pagination -->
        ${totalPages > 1 ? `
        <nav class="pagination">
            <ul class="pagination justify-content-center">
                <li class="page-item ${!hasPrev ? 'disabled' : ''}">
                    <a class="page-link" href="?${new URLSearchParams({...filters, date: selectedDate, page: currentPage - 1}).toString()}">Previous</a>
                </li>

                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return `
                    <li class="page-item ${pageNum === currentPage ? 'active' : ''}">
                        <a class="page-link" href="?${new URLSearchParams({...filters, date: selectedDate, page: pageNum}).toString()}">${pageNum}</a>
                    </li>
                  `;
                }).join('')}

                <li class="page-item ${!hasNext ? 'disabled' : ''}">
                    <a class="page-link" href="?${new URLSearchParams({...filters, date: selectedDate, page: currentPage + 1}).toString()}">Next</a>
                </li>
            </ul>
        </nav>
        ` : ''}
    </div>

    <!-- Loading Spinner -->
    <div class="loading-spinner" id="loadingSpinner">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Preparing your export...</p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
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
    </script>
</body>
</html>`;
}

// Export modal template
export function generateExportModal(data) {
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
              <li><strong>Date Range:</strong> ${dateRange?.start || 'All'} to ${dateRange?.end || 'All'}</li>
              ${currentFilters?.category ? `<li><strong>Category:</strong> ${currentFilters.category}</li>` : ''}
              ${currentFilters?.search ? `<li><strong>Search:</strong> "${currentFilters.search}"</li>` : ''}
            </ul>
          </div>
          <div class="col-md-6">
            <h6 class="mb-3">Select Format</h6>
            ${availableFormats.map(format => `
              <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="exportFormat" id="format_${format.value}" value="${format.value}" ${format.default ? 'checked' : ''}>
                <label class="form-check-label" for="format_${format.value}">
                  <strong>${format.label}</strong> - ${format.description}
                </label>
              </div>
            `).join('')}
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

// Export progress template
export function generateExportProgressTemplate() {
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

// Export completion template
export function generateExportCompleteTemplate(result) {
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

// Category distribution chart template
export function generateCategoryChart(categories) {
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  const sortedCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  return `
<div class="chart-container mb-4">
  <h6 class="mb-3">Papers by Category</h6>
  ${sortedCategories.map(([category, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    return `
      <div class="mb-2">
        <div class="d-flex justify-content-between mb-1">
          <span class="small">${category.replace(/_/g, ' ')}</span>
          <span class="small text-muted">${count} (${percentage}%)</span>
        </div>
        <div class="progress" style="height: 8px">
          <div class="progress-bar bg-primary" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('')}
</div>`;
}

// Date range picker template
export function generateDateRangePicker() {
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

// Advanced filter template
export function generateAdvancedFilters() {
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

// Export summary template
export function generateExportSummary(data) {
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
        <div class="h4 text-primary">${date_range ? `${date_range.start} to ${date_range.end}` : 'All'}</div>
        <small class="text-muted">Date Range</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="text-center">
        <div class="h4 text-primary">${filters?.category || 'All'}</div>
        <small class="text-muted">Category</small>
      </div>
    </div>
  </div>
</div>`;
}