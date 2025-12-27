import { formatDate } from './utils.js';

// Generate shared header HTML
export function getHeader(activePage = 'home', visitorStats = null, showTranslationButton = false) {
  const visitorInfo = visitorStats || { today: '0', total: '0', displayText: 'Visitor stats' };

  // Helper function to generate nav link with active state
  const navLink = (href, icon, text, isActive) => {
    const activeClass = isActive ? 'active' : '';
    return `
      <a href="${href}" class="btn btn-outline-light btn-sm me-2 ${activeClass}">
        <i class="${icon} me-1"></i>${text}
      </a>
    `;
  };

  // Translation button HTML (only shown on homepage where it works)
  const translationButton = showTranslationButton ? `
        <a href="#" class="btn btn-outline-light btn-sm" onclick="toggleTranslation()" id="translate-btn" title="切换语言 / Switch Language">
          <i class="fas fa-language me-1"></i><span id="translate-text">中文</span>
        </a>
  ` : '';

  return `
    <nav class="navbar navbar-dark">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center w-100">
                <div class="d-flex align-items-center">
                    <span class="navbar-brand mb-0 h1">
                        <i class="fas fa-graduation-cap me-2"></i>PaperDog
                    </span>
                    <span class="navbar-text me-4">
                        Daily AI Papers Digest
                    </span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="visitor-info me-4 text-end">
                        <div class="small text-light">
                            <i class="fas fa-users me-1"></i>
                            Today: ${visitorInfo.today} | Total: ${visitorInfo.total}
                        </div>
                        <div class="small text-light opacity-75">
                            ${visitorInfo.displayText}
                        </div>
                    </div>
                    <div class="nav-links">
                        ${navLink('/', 'fas fa-home', 'Home', activePage === 'home')}
                        ${navLink('/archive', 'fas fa-archive', 'Archive', activePage === 'archive')}
                        ${navLink('/blog', 'fas fa-book', 'Blog', activePage === 'blog')}
                        ${navLink('/about', 'fas fa-info-circle', 'About', activePage === 'about')}
                        ${translationButton}
                    </div>
                </div>
            </div>
        </div>
    </nav>
  `;
}

// Helper function to sanitize Chinese translation content
function sanitizeChineseContent(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // Try to parse if it looks like JSON
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      // Extract meaningful text from JSON structures
      if (typeof parsed === 'object') {
        if (parsed.challenges && Array.isArray(parsed.challenges)) {
          return parsed.challenges.join('；');
        }
        if (parsed.introduction && Array.isArray(parsed.introduction)) {
          return parsed.introduction.join('；');
        }
        if (parsed.innovations && Array.isArray(parsed.innovations)) {
          return parsed.innovations.join('；');
        }
        if (parsed.experiments && Array.isArray(parsed.experiments)) {
          return parsed.experiments.join('；');
        }
        if (parsed.insights && Array.isArray(parsed.insights)) {
          return parsed.insights.join('；');
        }
        // Handle single values
        if (parsed.challenges) return parsed.challenges;
        if (parsed.introduction) return parsed.introduction;
        if (parsed.innovations) return parsed.innovations;
        if (parsed.experiments) return parsed.experiments;
        if (parsed.insights) return parsed.insights;

        // Fallback: stringify the object nicely
        return JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      // If parsing fails, return original content
    }
  }

  return content;
}

export function getDualColumnHTML(papers = [], dailyReport = null, formattedStats = null) {
  const safeReportJson = JSON.stringify(dailyReport).replace(/</g, '\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PaperDog - AI Papers Daily Digest</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .container-fluid {
            max-width: 1600px;
        }
        
        .navbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .visitor-info {
            font-size: 0.85rem;
            line-height: 1.2;
        }

        .nav-links .btn {
            border-width: 1px;
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
            transition: all 0.3s ease;
        }

        .nav-links .btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-1px);
        }
        
        .column-content {
            min-height: 600px;
            padding: 1.5rem;
            background: #f6f8fc;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #e9ecef;
        }
        
        #paper-content, #analysis-content {
            overflow-wrap: break-word;
            word-wrap: break-word;
            font-size: 0.95em;
            line-height: 1.6;
        }
        
        #paper-content h1, #paper-content h2, #paper-content h3,
        #analysis-content h1, #analysis-content h2, #analysis-content h3 {
            font-size: 1.15em;
            margin-top: 1.2rem;
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }
        
        #paper-content table, #analysis-content table {
            width: 100%;
            table-layout: fixed;
            font-size: 0.9em;
        }
        
        #paper-content pre, #analysis-content pre,
        #paper-content code, #analysis-content code {
            font-size: 0.85em;
            overflow-x: auto;
            background: #f8f9fa;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
        }
        
        .side-panel {
            background: #f6f8fc;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
            padding: 1.5rem 1rem;
            min-height: 100%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid #e9ecef;
        }
        
        .paper-card {
            transition: box-shadow 0.2s;
            cursor: pointer;
            border: 1px solid #dee2e6;
        }
        
        .paper-card:hover {
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border-color: #667eea;
        }
        
        .paper-card.today {
            border-color: #007bff;
            background: #f8f9ff;
        }
        
        .paper-abstract {
            font-size: 0.85em;
            color: #6c757d;
            line-height: 1.4;
            max-height: 3.2em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .update-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .update-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .update-btn:disabled {
            background: #6c757d;
        }
        
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #007bff;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 10px auto;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .loading-indicator {
            display: none;
            text-align: center;
            padding: 1rem;
        }
        
        @media (max-width: 1200px) {
            .container-fluid {
                max-width: 100%;
                padding: 0 1rem;
            }
            .col-md-3, .col-md-6 {
                flex: 0 0 100%;
                max-width: 100%;
            }
            .side-panel {
                max-height: none;
                margin-top: 1rem;
            }
        }
        
        @media (max-width: 768px) {
            .column-content, .side-panel {
                padding: 1rem 0.5rem;
                min-height: unset;
            }
            .container-fluid {
                padding: 0;
            }
            .row {
                flex-direction: column;
            }
        }
        
        .score-badge {
            background: #28a745;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .category-badge {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .paper-stats {
            font-size: 0.8rem;
            color: #6c757d;
        }

        .view-count {
            font-size: 0.75rem;
            color: #6c757d;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            background: rgba(0, 123, 255, 0.05);
            padding: 0.125rem 0.375rem;
            border-radius: 8px;
            border: 1px solid rgba(0, 123, 255, 0.1);
        }

        .view-count i {
            font-size: 0.8rem;
            color: #007bff;
        }

        .view-badge {
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
            padding: 0.125rem 0.375rem;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 500;
            min-width: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    ${getHeader('home', formattedStats, true)}

    <div class="container-fluid mt-3">
        <div class="row gx-4 gy-3">
            <div class="col-md-9">
                <div class="row">
                    <div class="col-md-6">
                        <div class="column-content">
                            <h3 class="mb-3">
                                <i class="fas fa-file-alt me-2"></i>论文详情
                            </h3>
                            <div id="paper-content">
                                <div class="text-center text-muted py-5">
                                    <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
                                    <h5>选择一篇论文</h5>
                                    <p>点击右侧的论文列表查看详细内容</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="column-content">
                            <h3 class="mb-3">
                                <i class="fas fa-brain me-2"></i>AI Analysis
                            </h3>
                            <div id="analysis-content">
                                <div class="text-center text-muted py-5">
                                    <i class="fas fa-robot fa-2x mb-3"></i>
                                    <h5>AI分析内容</h5>
                                    <p>选择论文后显示AI智能分析结果</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="side-panel">
                    <h4 class="mb-3">
                        <i class="fas fa-list me-2"></i>论文列表
                    </h4>
                    <button id="update-btn" class="btn update-btn btn-primary mb-3 w-100" onclick="updatePapers()">
                        <i class="fas fa-sync-alt me-2"></i>Update Papers
                    </button>
                    <div class="loading-indicator" id="loadingIndicator">
                        <div class="spinner"></div>
                        <p class="text-muted mb-0">Updating papers...</p>
                    </div>
                    <div id="papers-list">加载中...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Helper function to sanitize Chinese translation content
        function sanitizeChineseContent(content) {
            if (!content || typeof content !== 'string') {
                return content;
            }

            // Try to parse if it looks like JSON
            if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                try {
                    const parsed = JSON.parse(content);
                    // Extract meaningful text from JSON structures
                    if (typeof parsed === 'object') {
                        // Handle various possible field names for translations
                        const translationFields = [
                            'translation', 'chinese_translation', 'experiments_translation',
                            'challenges', 'introduction', 'innovations', 'experiments', 'insights',
                            'chinese_challenges', 'chinese_introduction', 'chinese_innovations',
                            'chinese_experiments', 'chinese_insights', 'chinese_abstract'
                        ];

                        for (const field of translationFields) {
                            if (parsed[field]) {
                                if (Array.isArray(parsed[field])) {
                                    return parsed[field].join('；');
                                }
                                return parsed[field];
                            }
                        }

                        // Fallback: find first string value in the object
                        for (const key in parsed) {
                            if (parsed[key]) {
                                if (Array.isArray(parsed[key])) {
                                    return parsed[key].join('；');
                                }
                                if (typeof parsed[key] === 'string' && parsed[key].trim()) {
                                    return parsed[key];
                                }
                            }
                        }
                    }
                } catch (e) {
                    // If parsing fails, return original content
                }
            }

            // Return original content if no JSON structure found or parsing failed
            return content;
        }

        document.addEventListener('DOMContentLoaded', function() {
            const report = ${safeReportJson};
            
            // Initialize with today's papers if available
            if (report && report.papers && report.papers.length > 0) {
                loadPapersList(report.papers);

                // Auto-select the top paper
                if (report.top_papers && report.top_papers.length > 0) {
                    loadPaperContent(report.top_papers[0]);
                }
            } else {
                // Fetch papers from API
                fetchPapers();
            }
        });
        
        async function fetchPapers() {
            const listContainer = document.getElementById('papers-list');
            const loadingIndicator = document.getElementById('loadingIndicator');

            try {
                loadingIndicator.style.display = 'block';
                listContainer.innerHTML = '';

                // Try to get papers from recent dates, starting with today
                // This ensures we get top papers from a specific date, not aggregated from multiple days
                for (let i = 0; i < 7; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];

                    try {
                        const response = await fetch('/api/papers/' + dateStr);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.papers && data.papers.length > 0) {
                                // Sort by relevance score and take top 10 for mainpage display
                                const sortedPapers = data.papers.sort((a, b) => {
                                    const scoreA = ((a.analysis && a.analysis.relevance_score) || (a.scoring && a.scoring.total_score) || 5);
                                    const scoreB = ((b.analysis && b.analysis.relevance_score) || (b.scoring && b.scoring.total_score) || 5);
                                    return scoreB - scoreA;
                                }).slice(0, 10); // Limit to top 10 papers

                                loadPapersList(sortedPapers);
                                loadingIndicator.style.display = 'none';
                                return;
                            }
                        }
                    } catch (dateError) {
                        console.warn("Failed to fetch papers for " + dateStr + ":", dateError);
                        // Continue to next date
                    }
                }

                // If no papers found in recent dates, show empty state
                listContainer.innerHTML = '<p class="text-muted">暂无论文数据</p>';
            } catch (error) {
                console.error('Error fetching papers:', error);
                listContainer.innerHTML = '<p class="text-danger">加载论文出错</p>';
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }
        
        function loadPapersList(papers) {
            const listContainer = document.getElementById('papers-list');
            
            if (papers.length === 0) {
                listContainer.innerHTML = '<p class="text-muted">暂无论文数据</p>';
                return;
            }
            
            // Sort by relevance score and date
            papers.sort((a, b) => {
                const scoreA = ((a.analysis && a.analysis.relevance_score) || (a.scoring && a.scoring.total_score) || 5);
                const scoreB = ((b.analysis && b.analysis.relevance_score) || (b.scoring && b.scoring.total_score) || 5);
                if (Math.abs(scoreA - scoreB) > 0.5) return scoreB - scoreA;
                return new Date(b.published || b.scraped_at) - new Date(a.published || a.scraped_at);
            });
            
            const papersHTML = papers.map((paper, index) => {
                const totalScore = (paper.scoring && paper.scoring.total_score) || (paper.analysis && paper.analysis.relevance_score) || 5;
                const category = (paper.analysis && paper.analysis.category) || paper.category || 'other';
                const isTopPaper = totalScore >= 7.0;
                const views = paper.views || 0;
                const viewDisplay = views > 999 ? (views / 1000).toFixed(1) + 'k' : views.toString();

                return '<div class="card paper-card mb-2" onclick="loadPaperContent(' + index + ')">' +
                    '<div class="card-body py-2 px-3">' +
                    '<div class="d-flex justify-content-between align-items-start mb-2">' +
                    '<h6 class="card-title mb-0 flex-grow-1">' +
                    (isTopPaper ? '<i class="fas fa-trophy text-warning me-1"></i>' : '') +
                    paper.title.substring(0, 60) + (paper.title.length > 60 ? '...' : '') +
                    '</h6>' +
                    '<div class="view-count">' +
                    '<i class="fas fa-eye"></i>' +
                    '<span class="view-badge">' + viewDisplay + '</span>' +
                    '</div>' +
                    '</div>' +
                    '<p class="paper-abstract mb-1">' + (paper.abstract || 'No abstract').substring(0, 80) + '...</p>' +
                    '<div class="d-flex justify-content-between align-items-center">' +
                    '<div>' +
                    '<span class="category-badge me-2">' + category.replace('_', ' ') + '</span>' +
                    '<span class="score-badge">' + totalScore.toFixed(1) + '/10</span>' +
                    '</div>' +
                    '<small class="paper-stats">' + paper.source + '</small>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }).join('');
            
            listContainer.innerHTML = papersHTML;
            
            // Store papers for content loading
            window.currentPapers = papers;
        }
        
        async function loadPaperContent(index) {
            const paper = window.currentPapers[index];
            if (!paper) return;

            window.currentPaperIndex = index;

            // Track view when paper is selected
            if (paper.id) {
                trackPaperView(paper.id);
            }

            // If switching to Chinese and translations are not available, fetch them
            if (currentLanguage === 'zh' && paper.analysis) {
                const hasTranslations = paper.analysis.chinese_abstract ||
                                      paper.analysis.chinese_introduction ||
                                      paper.analysis.chinese_challenges ||
                                      paper.analysis.chinese_innovations ||
                                      paper.analysis.chinese_experiments ||
                                      paper.analysis.chinese_insights;

                if (!hasTranslations) {
                    // Show loading state for both columns
                    const loadingContent = \`<div class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-3 text-muted">正在生成中文翻译...</p>
                        </div>\`;
                    document.getElementById('analysis-content').innerHTML = loadingContent;
                    document.getElementById('paper-content').innerHTML = loadingContent;

                    // Fetch translations
                    const translations = await fetchTranslations(paper);

                    // Merge translations into paper analysis
                    if (translations && Object.keys(translations).length > 0) {
                        paper.analysis = { ...paper.analysis, ...translations };
                    } else {
                        // Mark error to prevent perpetual spinner
                        paper.analysis = { ...paper.analysis, translation_error: true };
                    }

                    // Re-render both columns after translations are available
                    const paperContent = generateTranslatedPaperDetails(paper);
                    document.getElementById('paper-content').innerHTML = paperContent;

                    const analysisContent = generateTranslatedAIAnalysis(paper);
                    document.getElementById('analysis-content').innerHTML = analysisContent;

                    return; // Exit early to avoid double rendering
                }
            }

            // Load paper details with translation
            const paperContent = generateTranslatedPaperDetails(paper);
            document.getElementById('paper-content').innerHTML = paperContent;

            // Load AI analysis with translation
            const analysisContent = generateTranslatedAIAnalysis(paper);
            document.getElementById('analysis-content').innerHTML = analysisContent;

            // Highlight selected paper
            document.querySelectorAll('.paper-card').forEach((card, i) => {
                if (i === index) {
                    card.classList.add('border-primary', 'bg-light');
                } else {
                    card.classList.remove('border-primary', 'bg-light');
                }
            });
        }
        
        function generatePaperDetails(paper) {
            const publishedDate = paper.published ? new Date(paper.published).toLocaleDateString() : 'Unknown';
            const authors = paper.authors ? paper.authors.slice(0, 5).join(', ') + (paper.authors.length > 5 ? ' et al.' : '') : 'Unknown authors';
            const category = (paper.analysis && paper.analysis.category) || paper.category || 'other';
            const totalScore = (paper.scoring && paper.scoring.total_score) || (paper.analysis && paper.analysis.relevance_score) || 5;
            
            let html = '<h5>' + paper.title + '</h5>';
            html += '<div class="mb-3">';
            html += '<p class="text-muted mb-1"><strong>Authors:</strong> ' + authors + '</p>';
            html += '<p class="text-muted mb-1"><strong>Published:</strong> ' + publishedDate + '</p>';
            html += '<p class="text-muted mb-1"><strong>Source:</strong> ' + paper.source + '</p>';
            html += '<p class="text-muted mb-1"><strong>Category:</strong> ' + category.replace('_', ' ') + '</p>';
            html += '<p class="text-muted mb-1"><strong>Score:</strong> <span class="badge bg-success">' + totalScore.toFixed(1) + '/10</span></p>';
            html += '</div>';
            
            if (paper.abstract) {
                html += '<h6>Abstract</h6>';
                html += '<p>' + paper.abstract + '</p>';
            }
            
            html += '<div class="mt-3">';
            html += '<a href="' + paper.url + '" target="_blank" class="btn btn-primary btn-sm me-2">';
            html += '<i class="fas fa-external-link-alt me-1"></i>View Paper</a>';
            if (paper.pdf_url) {
                html += '<a href="' + paper.pdf_url + '" target="_blank" class="btn btn-danger btn-sm">';
                html += '<i class="fas fa-file-pdf me-1"></i>PDF</a>';
            }
            html += '</div>';
            
            return html;
        }
        
        function generateAIAnalysis(paper) {
            if (!paper.analysis) {
                return '<div class="text-center text-muted py-5">' +
                    '<i class="fas fa-robot fa-2x mb-3"></i>' +
                    '<h5>No AI Analysis Available</h5>' +
                    '<p>This paper has not been analyzed by AI yet.</p>' +
                    '</div>';
            }
            
            const analysis = paper.analysis;
            let html = '';
            
            if (analysis.introduction) {
                html += '<h6>Introduction</h6>';
                html += '<p>' + analysis.introduction + '</p>';
            }
            
            if (analysis.challenges) {
                html += '<h6>Key Challenges</h6>';
                html += '<p>' + analysis.challenges + '</p>';
            }
            
            if (analysis.innovations) {
                html += '<h6>Innovations & Contributions</h6>';
                html += '<p>' + analysis.innovations + '</p>';
            }
            
            if (analysis.experiments) {
                html += '<h6>Experiments & Results</h6>';
                html += '<p>' + analysis.experiments + '</p>';
            }
            
            if (analysis.insights) {
                html += '<h6>Insights & Future Directions</h6>';
                html += '<p>' + analysis.insights + '</p>';
            }
            
            if (analysis.keywords && analysis.keywords.length > 0) {
                html += '<h6>Keywords</h6>';
                html += '<div class="mb-2">';
                analysis.keywords.forEach(keyword => {
                    html += '<span class="badge bg-secondary me-1 mb-1">' + keyword + '</span>';
                });
                html += '</div>';
            }
            
            if (analysis.relevance_score) {
                html += '<div class="mt-3 p-2 bg-light rounded">';
                html += '<strong>Relevance Score:</strong> ' + analysis.relevance_score + '/10<br>';
                html += '<strong>Technical Depth:</strong> ' + (analysis.technical_depth || 'Unknown');
                html += '</div>';
            }
            
            return html || '<p class="text-muted">No analysis details available.</p>';
        }
        
        async function updatePapers() {
            const button = document.getElementById('update-btn');
            const loadingIndicator = document.getElementById('loadingIndicator');
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
            loadingIndicator.style.display = 'block';
            
            try {
                const response = await fetch('/api/update', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    // Refresh papers list
                    await fetchPapers();
                    
                    // Show success message
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check me-2"></i>Updated!';
                    button.className = 'btn btn-success mb-3 w-100';
                    
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.className = 'btn update-btn btn-primary mb-3 w-100';
                        button.disabled = false;
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Update failed');
                }
            } catch (error) {
                console.error('Error updating papers:', error);
                
                // Show error message
                button.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Update Failed';
                button.className = 'btn btn-danger mb-3 w-100';
                
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Update Papers';
                    button.className = 'btn update-btn btn-primary mb-3 w-100';
                    button.disabled = false;
                }, 2000);
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }

        // View tracking functions
        async function trackPaperView(paperId) {
            try {
                const response = await fetch('/api/papers/' + paperId + '/view', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();

                    // Update view count in UI
                    const papers = window.currentPapers;
                    const paperIndex = papers.findIndex(p => p.id === paperId);
                    if (paperIndex !== -1) {
                        papers[paperIndex].views = result.views;
                        updateViewDisplay(paperIndex, result.views);
                    }
                }
            } catch (error) {
                console.warn('Failed to track view:', error);
                // Silent fail - don't break user experience
            }
        }

        function updateViewDisplay(paperIndex, viewCount) {
            const cards = document.querySelectorAll('.paper-card');
            const viewCountElement = cards[paperIndex].querySelector('.view-badge');
            if (viewCountElement) {
                const displayCount = viewCount > 999 ? (viewCount / 1000).toFixed(1) + 'k' : viewCount.toString();
                viewCountElement.textContent = displayCount;
            }
        }

        // Helper functions for Chinese formatting
        function formatChineseDate(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return year + '年' + month + '月' + day + '日';
        }

        function getChineseSourceName(source) {
            const sourceNames = {
                'arxiv': 'arXiv预印本',
                'huggingface': 'HuggingFace论文',
                'unknown': '未知来源'
            };
            return sourceNames[source] || source;
        }

        // Translation functionality
        let currentLanguage = 'en'; // Default to English

        async function toggleTranslation() {
            currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';

            // Update button text with bilingual display
            const translateText = document.getElementById('translate-text');
            translateText.textContent = currentLanguage === 'en' ? '中文' : 'English';

            // Update button styling to indicate current language
            const translateBtn = document.getElementById('translate-btn');
            if (currentLanguage === 'zh') {
                translateBtn.classList.add('btn-warning');
                translateBtn.classList.remove('btn-outline-light');
            } else {
                translateBtn.classList.remove('btn-warning');
                translateBtn.classList.add('btn-outline-light');
            }

            // Reload current paper if one is selected
            if (window.currentPaperIndex !== undefined) {
                await loadPaperContent(window.currentPaperIndex);
            }
        }

        function generateTranslatedPaperDetails(paper) {
            if (currentLanguage === 'zh' && paper.analysis) {
                // Use Chinese translations if available
                const publishedDate = paper.published ? formatChineseDate(paper.published) : '未知';
                const authors = paper.authors ? paper.authors.slice(0, 5).join(', ') + (paper.authors.length > 5 ? ' 等' : '') : '未知作者';
                const category = (paper.analysis && paper.analysis.category) || paper.category || '其他';
                const totalScore = (paper.scoring && paper.scoring.total_score) || (paper.analysis && paper.analysis.relevance_score) || 5;
                const sourceDisplay = getChineseSourceName(paper.source);

                let html = '<h5>' + paper.title + '</h5>';
                html += '<div class="mb-3">';
                html += '<p class="text-muted mb-1"><strong>作者:</strong> ' + authors + '</p>';
                html += '<p class="text-muted mb-1"><strong>发布日期:</strong> ' + publishedDate + '</p>';
                html += '<p class="text-muted mb-1"><strong>来源:</strong> ' + sourceDisplay + '</p>';
                html += '<p class="text-muted mb-1"><strong>分类:</strong> ' + category.replace('_', ' ') + '</p>';
                html += '<p class="text-muted mb-1"><strong>评分:</strong> <span class="badge bg-success">' + totalScore.toFixed(1) + '/10</span></p>';
                html += '</div>';

                // Use Chinese abstract if available, otherwise show original with Chinese label
                if (paper.abstract) {
                    html += '<h6>摘要 / Abstract</h6>';
                    const zhAbs = sanitizeChineseContent(paper.analysis.chinese_abstract || '');
                    if (zhAbs && zhAbs.trim() && 
                        paper.analysis.chinese_abstract !== '英文内容不可用 / English content not available' &&
                        paper.analysis.chinese_abstract !== '翻译失败，请查看英文原文 / Translation failed, please see English original') {
                        html += '<p>' + zhAbs + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-0" role="alert">';
                        html += '<i class="fas fa-info-circle me-1"></i>已提供中文翻译';
                        html += '</div>';
                    } else {
                        html += '<p>' + paper.abstract + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-0" role="alert">';
                        html += '<i class="fas fa-exclamation-triangle me-1"></i>摘要为英文原文，中文翻译生成中...';
                        html += '</div>';
                    }
                } else {
                    html += '<h6>摘要 / Abstract</h6>';
                    html += '<p class="text-muted">暂无摘要 / No abstract available</p>';
                }

                html += '<div class="mt-3">';
                html += '<a href="' + paper.url + '" target="_blank" class="btn btn-primary btn-sm me-2">';
                html += '<i class="fas fa-external-link-alt me-1"></i>查看论文 / View Paper</a>';
                if (paper.pdf_url) {
                    html += '<a href="' + paper.pdf_url + '" target="_blank" class="btn btn-danger btn-sm">';
                    html += '<i class="fas fa-file-pdf me-1"></i>下载PDF / Download PDF</a>';
                }
                html += '</div>';

                return html;
            }

            // Default to English
            return generatePaperDetails(paper);
        }

        function generateTranslatedAIAnalysis(paper) {
            if (currentLanguage === 'zh' && paper.analysis) {
                const analysis = paper.analysis;
                let html = '';
                let hasChineseContent = false;
                let translationStatus = [];

                // Pre-sanitize values to drive checks and rendering
                const zhIntro = sanitizeChineseContent(analysis.chinese_introduction || '');
                const zhChallenges = sanitizeChineseContent(analysis.chinese_challenges || '');
                const zhInnovations = sanitizeChineseContent(analysis.chinese_innovations || '');
                const zhExperiments = sanitizeChineseContent(analysis.chinese_experiments || '');
                const zhInsights = sanitizeChineseContent(analysis.chinese_insights || '');

                // Check translation status
                if (zhIntro && zhIntro.trim() && 
                    analysis.chinese_introduction !== '英文内容不可用 / English content not available' &&
                    analysis.chinese_introduction !== '翻译失败，请查看英文原文 / Translation failed, please see English original') {
                    hasChineseContent = true;
                }
                if (zhInnovations && zhInnovations.trim() && 
                    analysis.chinese_innovations !== '英文内容不可用 / English content not available' &&
                    analysis.chinese_innovations !== '翻译失败，请查看英文原文 / Translation failed, please see English original') {
                    hasChineseContent = true;
                }
                if (zhExperiments && zhExperiments.trim() && 
                    analysis.chinese_experiments !== '英文内容不可用 / English content not available' &&
                    analysis.chinese_experiments !== '翻译失败，请查看英文原文 / Translation failed, please see English original') {
                    hasChineseContent = true;
                }
                if (zhInsights && zhInsights.trim() && 
                    analysis.chinese_insights !== '英文内容不可用 / English content not available' &&
                    analysis.chinese_insights !== '翻译失败，请查看英文原文 / Translation failed, please see English original') {
                    hasChineseContent = true;
                }

                if (analysis.introduction) {
                    if (zhIntro && zhIntro.trim()) {
                        html += '<h6>介绍 / Introduction</h6>';
                        html += '<p>' + zhIntro + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>中文翻译已完成';
                        html += '</div>';
                    } else if (analysis.translation_error) {
                        html += '<h6>介绍 / Introduction</h6>';
                        html += '<p>' + analysis.introduction + '</p>';
                        html += '<div class="alert alert-danger alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-exclamation-triangle me-1"></i>翻译暂不可用，请稍后重试';
                        html += '</div>';
                    } else {
                        html += '<h6>介绍 / Introduction</h6>';
                        html += '<p>' + analysis.introduction + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.challenges) {
                    if (zhChallenges && zhChallenges.trim()) {
                        html += '<h6>挑战 / Challenges</h6>';
                        html += '<p>' + zhChallenges + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>中文翻译已完成';
                        html += '</div>';
                    } else if (analysis.translation_error) {
                        html += '<h6>挑战 / Challenges</h6>';
                        html += '<p>' + analysis.challenges + '</p>';
                        html += '<div class="alert alert-danger alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-exclamation-triangle me-1"></i>翻译暂不可用，请稍后重试';
                        html += '</div>';
                    } else {
                        html += '<h6>挑战 / Challenges</h6>';
                        html += '<p>' + analysis.challenges + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.innovations) {
                    if (zhInnovations && zhInnovations.trim()) {
                        html += '<h6>创新点 / Innovations</h6>';
                        html += '<p>' + zhInnovations + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>中文翻译已完成';
                        html += '</div>';
                    } else if (analysis.translation_error) {
                        html += '<h6>创新点 / Innovations</h6>';
                        html += '<p>' + analysis.innovations + '</p>';
                        html += '<div class="alert alert-danger alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-exclamation-triangle me-1"></i>翻译暂不可用，请稍后重试';
                        html += '</div>';
                    } else {
                        html += '<h6>创新点 / Innovations</h6>';
                        html += '<p>' + analysis.innovations + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.experiments) {
                    if (zhExperiments && zhExperiments.trim()) {
                        html += '<h6>实验与结果 / Experiments & Results</h6>';
                        html += '<p>' + zhExperiments + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>中文翻译已完成';
                        html += '</div>';
                    } else if (analysis.translation_error) {
                        html += '<h6>实验与结果 / Experiments & Results</h6>';
                        html += '<p>' + analysis.experiments + '</p>';
                        html += '<div class="alert alert-danger alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-exclamation-triangle me-1"></i>翻译暂不可用，请稍后重试';
                        html += '</div>';
                    } else {
                        html += '<h6>实验与结果 / Experiments & Results</h6>';
                        html += '<p>' + analysis.experiments + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.insights) {
                    if (zhInsights && zhInsights.trim()) {
                        html += '<h6>见解与未来方向 / Insights & Future Directions</h6>';
                        html += '<p>' + zhInsights + '</p>';
                        html += '<div class="alert alert-info alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-check-circle me-1"></i>中文翻译已完成';
                        html += '</div>';
                    } else if (analysis.translation_error) {
                        html += '<h6>见解与未来方向 / Insights & Future Directions</h6>';
                        html += '<p>' + analysis.insights + '</p>';
                        html += '<div class="alert alert-danger alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-exclamation-triangle me-1"></i>翻译暂不可用，请稍后重试';
                        html += '</div>';
                    } else {
                        html += '<h6>见解与未来方向 / Insights & Future Directions</h6>';
                        html += '<p>' + analysis.insights + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.keywords && analysis.keywords.length > 0) {
                    html += '<h6>关键词 / Keywords</h6>';
                    html += '<div class="mb-2">';
                    analysis.keywords.forEach(keyword => {
                        html += '<span class="badge bg-secondary me-1 mb-1">' + keyword + '</span>';
                    });
                    html += '</div>';
                }

                if (analysis.relevance_score) {
                    html += '<div class="mt-3 p-2 bg-light rounded">';
                    html += '<strong>相关度评分 / Relevance Score:</strong> ' + analysis.relevance_score + '/10<br>';
                    html += '<strong>技术深度 / Technical Depth:</strong> ' + (analysis.technical_depth || '未知');
                    html += '</div>';
                }

                // Add overall translation status
                if (hasChineseContent) {
                    html += '<div class="mt-3 p-3 bg-success bg-opacity-10 border border-success rounded">';
                    html += '<i class="fas fa-language text-success me-2"></i>';
                    html += '<strong>翻译状态:</strong> 部分或全部内容已翻译为中文';
                    html += '</div>';
                } else {
                    html += '<div class="mt-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">';
                    html += '<i class="fas fa-language text-warning me-2"></i>';
                    html += '<strong>翻译状态:</strong> 正在生成中文翻译，请稍候刷新页面';
                    html += '</div>';
                }

                return html || '<p class="text-muted">暂无分析详情 / No analysis details available.</p>';
            }

            // Default to English
            return generateAIAnalysis(paper);
        }

        // Function to fetch translations for a paper
        async function fetchTranslations(paper) {
            if (!paper.analysis) {
                return {};
            }

            try {
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        analysis: paper.analysis,
                        abstract: paper.abstract
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.translations) {
                        return result.translations;
                    }
                } else {
                    console.warn('Translate API returned non-OK:', response.status);
                    return null;
                }
            } catch (error) {
                console.error('Failed to fetch translations:', error);
                return null;
            }

            return {};
        }

    </script>
</body>
</html>`;
}
