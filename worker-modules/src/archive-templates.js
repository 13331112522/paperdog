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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            /* Warm Ivory / Terracotta Palette */
            --color-primary-50: #FBF0EA;
            --color-primary-100: #F5DFD2;
            --color-primary-200: #E8C4AD;
            --color-primary-500: #C0552D;
            --color-primary-600: #A84825;
            --color-primary-700: #8B3A1D;

            /* Warm Neutrals */
            --color-gray-50: #FDF8F0;
            --color-gray-100: #F5EDE2;
            --color-gray-200: #E0D8CE;
            --color-gray-300: #C9BFB3;
            --color-gray-500: #7A7268;
            --color-gray-700: #4A4A4A;
            --color-gray-900: #2C2C2C;

            --color-ink: #2C2C2C;
            --color-body: #4A4A4A;

            --font-heading: 'Noto Serif SC', Georgia, 'Times New Roman', serif;
            --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-code: 'JetBrains Mono', Menlo, 'Courier New', monospace;
        }

        body {
            background: var(--color-gray-50);
            font-family: var(--font-body);
            color: var(--color-body);
            line-height: 1.8;
            -webkit-font-smoothing: antialiased;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-heading);
            color: var(--color-ink);
            font-weight: 700;
        }

        .archive-header {
            background: var(--color-primary-500);
            color: #FFFFFF;
            padding: 3rem 0;
            margin-bottom: 2rem;
            animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .archive-header h1 {
            color: #FFFFFF;
        }

        .stats-card {
            background: #FFFFFF;
            border-radius: 2px;
            padding: 1.5rem;
            border: 1px solid var(--color-gray-200);
            transition: border-color 0.15s ease;
        }

        .stats-card:hover {
            border-color: var(--color-primary-500);
        }

        .stats-number {
            font-family: var(--font-heading);
            font-size: 2rem;
            font-weight: 700;
            color: var(--color-primary-500);
        }

        .filter-section {
            background: #FFFFFF;
            border-radius: 2px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid var(--color-gray-200);
        }

        .export-panel {
            background: var(--color-primary-500);
            color: #FFFFFF;
            border-radius: 2px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .export-btn {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #FFFFFF;
            border-radius: 3px;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
            transition: background 0.15s ease;
            text-decoration: none;
            display: inline-block;
        }

        .export-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            color: #FFFFFF;
        }

        .date-selector {
            background: #FFFFFF;
            border-radius: 2px;
            padding: 1rem;
            margin-bottom: 2rem;
            border: 1px solid var(--color-gray-200);
        }

        .date-btn {
            background: var(--color-gray-50);
            border: 1px solid var(--color-gray-200);
            border-radius: 3px;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
            transition: all 0.15s ease;
            text-decoration: none;
            color: var(--color-gray-700);
            font-size: 0.9rem;
        }

        .date-btn:hover, .date-btn.active {
            background: var(--color-primary-500);
            border-color: var(--color-primary-500);
            color: #FFFFFF;
        }

        .paper-card {
            background: #FFFFFF;
            border-radius: 2px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border: 1px solid var(--color-gray-200);
            transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .paper-card:hover {
            border-color: var(--color-primary-500);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(192, 85, 45, 0.08);
        }

        .archive-card {
            transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .archive-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(192, 85, 45, 0.08);
        }

        .score-badge {
            background: var(--color-primary-50);
            color: var(--color-primary-700);
            border-radius: 2px;
            padding: 0.25rem 0.75rem;
            font-size: 0.8rem;
            font-weight: 600;
            border: 1px solid var(--color-primary-200);
        }

        .view-count {
            background: var(--color-gray-50);
            color: var(--color-gray-700);
            border-radius: 2px;
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            border: 1px solid var(--color-gray-200);
        }

        .view-count i {
            font-size: 0.7rem;
        }

        .category-badge {
            background: var(--color-primary-50);
            color: var(--color-primary-700);
            border-radius: 2px;
            padding: 0.25rem 0.75rem;
            font-size: 0.8rem;
            font-weight: 500;
            border: 1px solid var(--color-primary-200);
        }

        .search-box {
            border-radius: 3px;
            border: 1px solid var(--color-gray-200);
            padding: 0.75rem 1.5rem;
            transition: border-color 0.15s ease;
        }

        .search-box:focus {
            border-color: var(--color-primary-500);
            box-shadow: 0 0 0 2px rgba(192, 85, 45, 0.15);
        }

        .pagination {
            margin-top: 2rem;
        }

        .page-link {
            border-radius: 3px;
            margin: 0 0.25rem;
            border: 1px solid var(--color-gray-200);
            background: #FFFFFF;
            color: var(--color-gray-700);
        }

        .page-link:hover, .page-item.active .page-link {
            background: var(--color-primary-500);
            color: #FFFFFF;
            border-color: var(--color-primary-500);
        }

        .export-format-info {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            padding: 1rem;
            margin-top: 1rem;
        }

        .loading-spinner {
            display: none;
            text-align: center;
            padding: 2rem;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
            :root {
                --color-gray-50: #1c1a16;
                --color-gray-100: #262320;
                --color-gray-200: #3a3632;
                --color-gray-300: #524e48;
                --color-gray-500: #9a958e;
                --color-gray-700: #c9c3ba;
                --color-gray-900: #F5EDE2;

                --color-primary-50: #2e1f18;
                --color-primary-100: #3d2a20;
                --color-primary-200: #5c3f30;
                --color-primary-500: #D4764E;
                --color-primary-600: #C0552D;
                --color-primary-700: #A84825;

                --color-ink: #F5EDE2;
                --color-body: #c9c3ba;
            }

            body {
                background: #1c1a16;
                color: var(--color-body);
            }

            .archive-header {
                background: #A84825;
            }

            .stats-card,
            .filter-section,
            .date-selector,
            .paper-card,
            .page-link {
                background: #262320;
                border-color: var(--color-gray-200);
                color: var(--color-body);
            }

            .export-panel {
                background: #8B3A1D;
            }

            .date-btn {
                background: #262320;
                border-color: var(--color-gray-200);
                color: var(--color-body);
            }

            .search-box {
                background: #262320;
                border-color: var(--color-gray-200);
                color: var(--color-body);
            }
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
                    <a href="/" class="btn" style="border:1px solid rgba(255,255,255,0.4);color:#fff;border-radius:3px;">
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
                    <strong>JSON:</strong> Complete data with analysis |
                    <strong>CSV:</strong> Tabular data for analysis |
                    <strong>Markdown:</strong> Human-readable reports |
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
                        <button type="submit" class="btn" style="background:var(--color-primary-500);color:#fff;border:none;border-radius:3px;">
                            <i class="fas fa-search"></i>
                        </button>
                        ${search ? `<a href="?${selectedDate ? `date=${selectedDate}` : ''}" class="btn btn-outline-secondary" style="border-radius:3px;">Clear</a>` : ''}
                    </form>
                </div>
                <div class="col-lg-6 text-end">
                    <div class="btn-group" role="group">
                        <a href="?${new URLSearchParams({...filters, date: selectedDate}).toString()}" class="btn btn-outline-secondary ${!category ? 'active' : ''}" style="border-radius:3px;">
                            All Categories
                        </a>
                        ${statistics ? Object.keys(statistics.category_distribution || {}).slice(0, 5).map(cat => `
                            <a href="?${new URLSearchParams({...filters, date: selectedDate, category: cat}).toString()}"
                               class="btn btn-outline-secondary ${category === cat ? 'active' : ''}"
                               title="${cat.replace(/_/g, ' ')}"
                               style="border-radius:3px;">
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
            ` : papers.map(paper => {
                const paperDataJson = JSON.stringify(paper).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                return `
                <div class="paper-card" data-paper-id="${paper.id}">
                    <div class="row">
                        <div class="col-md-10">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="mb-1">
                                    <a href="${paper.url || '#'}" target="_blank" class="text-decoration-none" style="color:var(--color-ink);">
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
                                <a href="${paper.url}" target="_blank" class="btn btn-sm btn-outline-secondary mb-2" style="border-radius:3px;">
                                    <i class="fas fa-external-link-alt me-1"></i>View Paper
                                </a>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-secondary" style="border-radius:3px;" onclick="exportPaper(this)" data-paper='${paperDataJson}'>
                                <i class="fas fa-download me-1"></i>Export
                            </button>
                        </div>
                    </div>
                </div>
            `;
            }).join('')}
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
        <div class="spinner-border" style="color:var(--color-primary-500);" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Preparing your export...</p>
    </div>

    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Sanitize a string for use as a filename
        function sanitizeFilename(name) {
            return name.replace(/[^a-zA-Z0-9_\\- ]/g, '').replace(/\\s+/g, '_').substring(0, 80);
        }

        // Format a single author name for BibTeX (Last, First)
        function formatBibtexAuthor(name) {
            const parts = name.trim().split(/\\s+/);
            if (parts.length === 1) return parts[0];
            return parts.slice(-1) + ', ' + parts.slice(0, -1).join(' ');
        }

        // Generate BibTeX export
        function generateBibtex(paper) {
            const id = paper.id || 'unknown';
            const title = paper.title || 'Untitled';
            const authors = (paper.authors || []).map(formatBibtexAuthor).join(' and ');
            const year = paper.published ? new Date(paper.published).getFullYear() : new Date().getFullYear();
            const abstract = (paper.abstract || '').replace(/\\n/g, ' ').replace(/\\s+/g, ' ').trim();
            const keywords = (paper.analysis?.keywords || []).join(', ');
            const category = (paper.analysis?.category || 'other').replace(/_/g, ' ');

            let bibtex = '@article{' + sanitizeFilename(id) + ',\\n';
            bibtex += '  title     = {' + title + '},\\n';
            bibtex += '  author    = {' + authors + '},\\n';
            bibtex += '  year      = {' + year + '},\\n';
            if (paper.url) bibtex += '  url       = {' + paper.url + '},\\n';
            if (abstract) bibtex += '  abstract  = {' + abstract + '},\\n';
            if (keywords) bibtex += '  keywords  = {' + keywords + '},\\n';
            bibtex += '  category  = {' + category + '}\\n';
            bibtex += '}\\n';
            return bibtex;
        }

        // Generate Markdown export
        function generateMarkdown(paper) {
            const title = paper.title || 'Untitled';
            const authors = (paper.authors || []).join(', ') || 'Unknown authors';
            const published = paper.published ? new Date(paper.published).toLocaleDateString() : 'N/A';
            const abstract = paper.abstract || 'No abstract available';
            const keywords = (paper.analysis?.keywords || []).join(', ');
            const category = (paper.analysis?.category || 'other').replace(/_/g, ' ');
            const score = (paper.analysis?.relevance_score || 5).toFixed(1);
            const url = paper.url || '';

            let md = '# ' + title + '\\n\\n';
            md += '**Authors:** ' + authors + '\\n\\n';
            md += '**Published:** ' + published + '  \\n';
            md += '**Category:** ' + category + '  \\n';
            md += '**Relevance Score:** ' + score + '/10  \\n';
            if (url) md += '**Paper URL:** [' + url + '](' + url + ')  \\n';
            md += '\\n---\\n\\n';
            md += '## Abstract\\n\\n' + abstract + '\\n\\n';
            if (keywords) md += '## Keywords\\n\\n' + keywords + '\\n\\n';
            md += '---\\n*Exported from PaperDog on ' + new Date().toISOString() + '*\\n';
            return md;
        }

        // Export individual paper using embedded data
        function exportPaper(button) {
            try {
                var rawJson = button.getAttribute('data-paper');
                if (!rawJson) {
                    alert('Export failed: Paper data not found. Please refresh the page and try again.');
                    return;
                }
                var paper = JSON.parse(rawJson);
                var title = sanitizeFilename(paper.title || 'paper');
                var timestamp = new Date().toISOString().slice(0, 10);

                // Prompt user for format choice
                var format = prompt('Choose export format:\\n  1 - JSON\\n  2 - BibTeX\\n  3 - Markdown\\nEnter 1, 2, or 3:', '1');
                if (!format) return;

                var content, filename, contentType;
                switch (format.trim()) {
                    case '2':
                        content = generateBibtex(paper);
                        filename = title + '_' + timestamp + '.bib';
                        contentType = 'text/plain';
                        break;
                    case '3':
                        content = generateMarkdown(paper);
                        filename = title + '_' + timestamp + '.md';
                        contentType = 'text/markdown';
                        break;
                    case '1':
                    default:
                        var exportData = {
                            paper: paper,
                            exported_at: new Date().toISOString(),
                            source: 'PaperDog Archive'
                        };
                        content = JSON.stringify(exportData, null, 2);
                        filename = title + '_' + timestamp + '.json';
                        contentType = 'application/json';
                        break;
                }

                downloadFile(content, filename, contentType);
            } catch (error) {
                alert('Export failed: ' + error.message + '. Please try again.');
            }
        }

        // Download file helper
        function downloadFile(content, filename, contentType) {
            var blob = new Blob([content], { type: contentType });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Show export progress for bulk downloads with error handling
        document.querySelectorAll('a[href*="/api/archive/export"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                try {
                    var spinner = document.getElementById('loadingSpinner');
                    if (spinner) spinner.style.display = 'block';

                    // Hide spinner after a delay (export will proceed in background)
                    setTimeout(function() {
                        if (spinner) spinner.style.display = 'none';
                    }, 5000);
                } catch (err) {
                    console.error('Export progress display error:', err);
                }
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
    <div class="modal-content" style="border-radius:2px;border:1px solid var(--color-gray-200);">
      <div class="modal-header" style="border-bottom:1px solid var(--color-gray-200);">
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
      <div class="modal-footer" style="border-top:1px solid var(--color-gray-200);">
        <button type="button" class="btn btn-secondary" style="border-radius:3px;" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn" style="background:var(--color-primary-500);color:#fff;border:none;border-radius:3px;" onclick="performAdvancedExport()">
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
       id="exportProgressBar"
       style="background:var(--color-primary-500);">
    Preparing export...
  </div>
</div>
<div class="text-center">
  <p id="exportStatusText">Initializing export process... </p>
  <div class="spinner-border" style="color:var(--color-primary-500);" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>`;
}

// Export completion template
export function generateExportCompleteTemplate(result) {
  const { format, filename, size, papers_count, metadata } = result;

  return `
<div class="alert alert-success" role="alert" style="border-radius:2px;">
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
  <a href="#" class="btn" style="background:var(--color-primary-500);color:#fff;border:none;border-radius:3px;" onclick="downloadExportedFile()">
    <i class="fas fa-download me-2"></i>Download File
  </a>
  <button type="button" class="btn btn-secondary" style="border-radius:3px;" data-bs-dismiss="modal">Close</button>
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
        <div class="progress" style="height: 6px">
          <div class="progress-bar" style="width: ${percentage}%;background:var(--color-primary-500);"></div>
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
    <input type="date" class="form-control" style="border-radius:3px;" id="startDate" name="start_date">
  </div>
  <div class="col-md-6">
    <label for="endDate" class="form-label">End Date</label>
    <input type="date" class="form-control" style="border-radius:3px;" id="endDate" name="end_date">
  </div>
</div>`;
}

// Advanced filter template
export function generateAdvancedFilters() {
  return `
<div class="row mb-3">
  <div class="col-md-4">
    <label for="categoryFilter" class="form-label">Category</label>
    <select class="form-select" style="border-radius:3px;" id="categoryFilter" name="category">
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
        <div class="h4" style="color:var(--color-primary-500);">${papers_count}</div>
        <small class="text-muted">Papers</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="text-center">
        <div class="h4" style="color:var(--color-primary-500);">${format.toUpperCase()}</div>
        <small class="text-muted">Format</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="text-center">
        <div class="h4" style="color:var(--color-primary-500);">${date_range ? `${date_range.start} to ${date_range.end}` : 'All'}</div>
        <small class="text-muted">Date Range</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="text-center">
        <div class="h4" style="color:var(--color-primary-500);">${filters?.category || 'All'}</div>
        <small class="text-muted">Category</small>
      </div>
    </div>
  </div>
</div>`;
}
