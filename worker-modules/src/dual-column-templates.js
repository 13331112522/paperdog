import { formatDate } from './utils.js';

// Shared CSS for the Huashu warm reading-focused design system.
// Used by dual-column-templates.js and blog-templates.js.
export function getSharedCSS() {
  return `
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

            /* Ink & Body */
            --color-ink: #2C2C2C;
            --color-body: #4A4A4A;

            /* Fonts */
            --font-heading: 'Noto Serif SC', Georgia, 'Times New Roman', serif;
            --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-code: 'JetBrains Mono', Menlo, 'Courier New', monospace;

            /* Spacing Scale */
            --spacing-1: 0.25rem;
            --spacing-2: 0.5rem;
            --spacing-3: 0.75rem;
            --spacing-4: 1rem;
            --spacing-5: 1.25rem;
            --spacing-6: 1.5rem;
            --spacing-8: 2rem;
        }

        body {
            background: var(--color-gray-50);
            font-family: var(--font-body);
            font-size: 1rem;
            line-height: 1.8;
            color: var(--color-body);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.03;
            pointer-events: none;
            z-index: 9999;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            background-repeat: repeat;
            background-size: 200px 200px;
        }

        .navbar {
            background: #FDF8F0;
            border-bottom: 1px solid var(--color-gray-200);
            padding: var(--spacing-3) 0;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .navbar-brand {
            font-size: 1.25rem;
            font-weight: 700;
            font-family: var(--font-heading);
            color: var(--color-ink);
            text-decoration: none;
            transition: color 0.15s ease;
        }

        .navbar-brand:hover {
            color: var(--color-primary-500);
        }

        .navbar-tagline {
            font-size: 0.875rem;
            color: var(--color-gray-500);
            margin-left: var(--spacing-4);
        }

        .visitor-info {
            font-size: 0.8125rem;
            line-height: 1.4;
        }

        .visitor-stats {
            color: var(--color-gray-700);
            font-weight: 500;
        }

        .visitor-label {
            color: var(--color-gray-500);
            font-size: 0.75rem;
        }

        .nav-links {
            display: flex;
            gap: var(--spacing-1);
        }

        .nav-link {
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--color-gray-700);
            text-decoration: none;
            padding: var(--spacing-2) var(--spacing-3);
            border-radius: 3px;
            transition: all 0.15s ease;
        }

        .nav-link:hover {
            background: var(--color-gray-100);
            color: var(--color-ink);
        }

        .nav-link.active {
            background: var(--color-primary-50);
            color: var(--color-primary-500);
        }

        .translation-btn {
            background: transparent;
            border: 1px solid var(--color-gray-300);
            color: var(--color-gray-700);
            font-size: 0.875rem;
            font-weight: 500;
            padding: var(--spacing-2) var(--spacing-3);
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .translation-btn:hover {
            background: var(--color-gray-100);
            border-color: var(--color-gray-500);
        }

        /* Section label -- replaces emoji headers */
        .section-label {
            font-family: var(--font-heading);
            font-size: 1rem;
            font-weight: 700;
            color: var(--color-ink);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--color-gray-200);
            padding-bottom: var(--spacing-2);
            margin-bottom: var(--spacing-3);
        }

        footer {
            background: var(--color-gray-900);
            color: var(--color-gray-500);
            padding: var(--spacing-8) 0;
            margin-top: var(--spacing-8);
            text-align: center;
            position: relative;
        }

        footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: var(--color-primary-500);
        }

        footer p {
            margin-bottom: var(--spacing-1);
        }

        footer .small {
            font-size: 0.875rem;
            color: var(--color-gray-500);
        }

        /* Dark Mode Support */
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

            .navbar {
                background: #1c1a16;
                border-bottom-color: var(--color-gray-200);
            }

            body::before {
                opacity: 0.04;
            }
        }

        /* Page Load Animation */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-8px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .navbar {
            animation: fadeIn 0.4s ease-out;
        }

        .section-label {
            animation: slideInLeft 0.5s ease-out;
        }

        /* Staggered Card Reveal */
        .stagger-reveal > * {
            opacity: 0;
            animation: fadeInUp 0.4s ease-out forwards;
        }
        .stagger-reveal > *:nth-child(1) { animation-delay: 0.05s; }
        .stagger-reveal > *:nth-child(2) { animation-delay: 0.1s; }
        .stagger-reveal > *:nth-child(3) { animation-delay: 0.15s; }
        .stagger-reveal > *:nth-child(4) { animation-delay: 0.2s; }
        .stagger-reveal > *:nth-child(5) { animation-delay: 0.25s; }
        .stagger-reveal > *:nth-child(6) { animation-delay: 0.3s; }
        .stagger-reveal > *:nth-child(7) { animation-delay: 0.35s; }
        .stagger-reveal > *:nth-child(8) { animation-delay: 0.4s; }
        .stagger-reveal > *:nth-child(9) { animation-delay: 0.45s; }
        .stagger-reveal > *:nth-child(10) { animation-delay: 0.5s; }
        .stagger-reveal > *:nth-child(n+11) { animation-delay: 0.55s; }
  `;
}

// Generate shared header HTML
export function getHeader(activePage = 'home', visitorStats = null, showTranslationButton = false) {
  const visitorInfo = visitorStats || { today: '0', total: '0', displayText: 'Visitor stats' };

  // Helper function to generate nav link with active state
  const navLink = (href, icon, text, isActive) => {
    const activeClass = isActive ? 'active' : '';
    return `
      <a href="${href}" class="nav-link ${activeClass}">
        <i class="${icon} me-1"></i>${text}
      </a>
    `;
  };

  // Translation button HTML (only shown on homepage where it works)
  const translationButton = showTranslationButton ? `
        <button class="translation-btn" onclick="toggleTranslation()" id="translate-btn" title="切换语言 / Switch Language">
          <i class="fas fa-language me-1"></i><span id="translate-text">中文</span>
        </button>
  ` : '';

  return `
    <nav class="navbar">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center w-100">
                <div class="d-flex align-items-center">
                    <a href="/" class="navbar-brand">
                        <img src="data:image/jpeg;base64,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" alt="PaperDog" style="height:32px;width:32px;border-radius:50%;object-fit:cover;margin-right:8px;vertical-align:middle;">PaperDog
                    </a>
                    <span class="navbar-tagline">
                        Daily AI Papers Digest
                    </span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="visitor-info me-4">
                        <div class="visitor-stats">
                            <i class="fas fa-users me-1"></i>
                            Today: ${visitorInfo.today} | Total: ${visitorInfo.total}
                        </div>
                        <div class="visitor-label">
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
  const safeReportJson = JSON.stringify(dailyReport).replace(/</g, '<');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PaperDog - AI Papers Daily Digest</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        ${getSharedCSS()}

        .container-fluid {
            max-width: 1400px;
        }

        .column-content {
            min-height: 600px;
            padding: var(--spacing-6);
            background: #FFFFFF;
            border-radius: 2px;
            margin-bottom: var(--spacing-4);
            border: 1px solid var(--color-gray-200);
        }

        #paper-content, #analysis-content {
            overflow-wrap: break-word;
            word-wrap: break-word;
            font-size: 1rem;
            line-height: 1.8;
            max-width: 720px;
        }

        #paper-content h1, #paper-content h2, #paper-content h3,
        #analysis-content h1, #analysis-content h2, #analysis-content h3 {
            font-family: var(--font-heading);
            font-size: 1.25rem;
            font-weight: 700;
            margin-top: var(--spacing-5);
            margin-bottom: var(--spacing-3);
            color: var(--color-ink);
            line-height: 1.4;
        }

        #paper-content h5, #analysis-content h5 {
            font-family: var(--font-heading);
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--color-ink);
            margin-bottom: var(--spacing-3);
        }

        #paper-content h6, #analysis-content h6 {
            font-family: var(--font-heading);
            font-size: 1rem;
            font-weight: 700;
            color: var(--color-gray-700);
            margin-top: var(--spacing-4);
            margin-bottom: var(--spacing-2);
        }

        #paper-content p, #analysis-content p {
            margin-bottom: var(--spacing-3);
            color: var(--color-body);
        }

        #paper-content table, #analysis-content table {
            width: 100%;
            table-layout: fixed;
            font-size: 0.9375rem;
        }

        #paper-content pre, #analysis-content pre,
        #paper-content code, #analysis-content code {
            font-family: var(--font-code);
            font-size: 0.875rem;
            overflow-x: auto;
            background: var(--color-gray-100);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: 2px;
        }

        .side-panel {
            background: #FFFFFF;
            border-radius: 2px;
            padding: var(--spacing-5);
            min-height: 100%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid var(--color-gray-200);
        }

        .paper-card {
            transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
            border: 1px solid var(--color-gray-200);
            border-radius: 2px;
        }

        .paper-card:hover {
            border-color: var(--color-primary-500);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(192, 85, 45, 0.08);
        }

        .paper-card.today {
            border-color: var(--color-primary-200);
            background: var(--color-primary-50);
        }

        .paper-abstract {
            font-size: 0.875rem;
            color: var(--color-gray-500);
            line-height: 1.6;
            max-height: 3.2em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .update-btn {
            background: var(--color-primary-500);
            border: none;
            border-radius: 3px;
            padding: var(--spacing-3) var(--spacing-4);
            font-weight: 500;
            font-size: 0.9375rem;
            transition: background 0.15s ease;
            color: #FFFFFF;
        }

        .update-btn:hover:not(:disabled) {
            background: var(--color-primary-600);
        }

        .update-btn:disabled {
            background: var(--color-gray-500);
        }

        .translation-btn:active,
        .update-btn:active {
            transform: scale(0.97);
        }

        .update-btn {
            position: relative;
            overflow: hidden;
        }

        .update-btn::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            transition: width 0.4s ease, height 0.4s ease;
            transform: translate(-50%, -50%);
        }

        .update-btn:active::after {
            width: 200px;
            height: 200px;
        }

        .spinner {
            border: 4px solid var(--color-gray-200);
            border-left-color: var(--color-primary-500);
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
            background: var(--color-primary-50);
            color: var(--color-primary-700);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: 2px;
            font-size: 0.8125rem;
            font-weight: 500;
            border: 1px solid var(--color-primary-200);
        }

        .category-badge {
            background: var(--color-primary-50);
            color: var(--color-primary-700);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: 2px;
            font-size: 0.8125rem;
            font-weight: 500;
            border: 1px solid var(--color-primary-200);
        }

        .paper-stats {
            font-size: 0.8125rem;
            color: var(--color-gray-500);
        }

        .view-count {
            font-size: 0.8125rem;
            color: var(--color-gray-700);
            display: flex;
            align-items: center;
            gap: var(--spacing-1);
            background: var(--color-gray-50);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: 2px;
            border: 1px solid var(--color-gray-200);
        }

        .view-count i {
            font-size: 0.875rem;
            color: var(--color-primary-500);
        }

        .view-badge {
            background: var(--color-primary-50);
            color: var(--color-primary-700);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: 2px;
            font-size: 0.75rem;
            font-weight: 500;
            min-width: 20px;
            text-align: center;
        }

        .card-title {
            font-family: var(--font-heading);
            font-size: 1rem;
            font-weight: 700;
            color: var(--color-ink);
            line-height: 1.4;
        }

        /* Page-specific dark mode */
        @media (prefers-color-scheme: dark) {
            .column-content,
            .side-panel {
                background: #262320;
                border-color: var(--color-gray-200);
            }

            #paper-content p, #analysis-content p {
                color: var(--color-body);
            }

            .paper-card {
                border-color: var(--color-gray-200);
                background: #262320;
            }

            .paper-card:hover {
                border-color: var(--color-primary-500);
            }

            #paper-content pre, #analysis-content pre,
            #paper-content code, #analysis-content code {
                background: var(--color-gray-100);
            }
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
                            <h3 class="section-label mb-3">
                                <i class="fas fa-file-alt me-2"></i>Paper Details
                            </h3>
                            <div id="paper-content">
                                <div class="text-center text-muted py-5">
                                    <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
                                    <h5>Select a Paper</h5>
                                    <p>Click a paper from the list to view details</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="column-content">
                            <h3 class="section-label mb-3">
                                <i class="fas fa-brain me-2"></i>AI Analysis
                            </h3>
                            <div id="analysis-content">
                                <div class="text-center text-muted py-5">
                                    <i class="fas fa-robot fa-2x mb-3"></i>
                                    <h5>AI Analysis</h5>
                                    <p>Select a paper to view AI-powered analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="side-panel">
                    <h4 class="section-label mb-3">
                        <i class="fas fa-list me-2"></i>Paper List
                    </h4>
                    <button id="update-btn" class="btn update-btn btn-primary mb-3 w-100" onclick="updatePapers()">
                        <i class="fas fa-sync-alt me-2"></i>Update Papers
                    </button>
                    <div class="loading-indicator" id="loadingIndicator">
                        <div class="spinner"></div>
                        <p class="text-muted mb-0">Updating papers...</p>
                    </div>
                    <div id="papers-list" class="stagger-reveal">Loading...</div>
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

        // Helper function to generate paper figure HTML
        function generateFigureHTML(paper, maxFigures) {
            if (!paper.images || !paper.images.length || !paper.images[0]) {
                return '';
            }
            var limit = maxFigures || 1;
            var figures = paper.figures || [];
            var html = '';

            for (var i = 0; i < Math.min(limit, paper.images.length); i++) {
                var src = paper.images[i];
                if (!src) continue;
                var caption = figures[i] && figures[i].caption
                    ? figures[i].caption
                    : 'Figure from the paper';
                html += '<div style="text-align:center;margin-bottom:1rem;">' +
                    '<img src="' + src + '" alt="' + caption.replace(/"/g, '&quot;') + '" ' +
                    'style="max-width:100%;border:1px solid #E0D8CE;border-radius:2px;" ' +
                    'onerror="this.parentElement.remove()">' +
                    '<p style="font-style:italic;font-size:0.8125rem;color:var(--color-gray-500);margin-top:0.25rem;margin-bottom:0;">' + caption + '</p>' +
                    '</div>';
            }
            return html;
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

                // Generate dates for the last 7 days
                const dates = Array.from({length: 7}, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                });

                // Fetch all dates in parallel
                const results = await Promise.allSettled(
                    dates.map(dateStr =>
                        fetch('/api/papers/' + dateStr)
                            .then(r => r.ok ? r.json() : null)
                    )
                );

                // Find first valid result with papers (prefers most recent date)
                for (const result of results) {
                    if (result.status === 'fulfilled' && result.value && result.value.papers && result.value.papers.length > 0) {
                        const sortedPapers = result.value.papers.sort((a, b) => {
                            const scoreA = ((a.analysis && a.analysis.relevance_score) || (a.scoring && a.scoring.total_score) || 5);
                            const scoreB = ((b.analysis && b.analysis.relevance_score) || (b.scoring && b.scoring.total_score) || 5);
                            return scoreB - scoreA;
                        }).slice(0, 10);

                        loadPapersList(sortedPapers);
                        loadingIndicator.style.display = 'none';
                        return;
                    }
                }

                // If no papers found in any date
                listContainer.innerHTML = '<p class="text-muted">No papers available</p>';
            } catch (error) {
                console.error('Error fetching papers:', error);
                listContainer.innerHTML = '<p class="text-danger">Error loading papers</p>';
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }

        function loadPapersList(papers) {
            const listContainer = document.getElementById('papers-list');

            if (papers.length === 0) {
                listContainer.innerHTML = '<p class="text-muted">No papers available</p>';
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
                            <p class="mt-3 text-muted">Generating Chinese translation...</p>
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
                    card.style.borderColor = 'var(--color-primary-500)';
                    card.style.background = 'var(--color-primary-50)';
                } else {
                    card.style.borderColor = '';
                    card.style.background = '';
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
            html += '<p class="text-muted mb-1"><strong>Score:</strong> <span class="score-badge">' + totalScore.toFixed(1) + '/10</span></p>';
            html += '</div>';

            if (paper.abstract) {
                html += '<h6>Abstract</h6>';
                html += '<p>' + paper.abstract + '</p>';
                html += generateFigureHTML(paper);
            }

            html += '<div class="mt-3">';
            html += '<a href="' + paper.url + '" target="_blank" class="btn btn-sm me-2" style="background:var(--color-primary-500);color:#fff;border:none;border-radius:3px;">';
            html += '<i class="fas fa-external-link-alt me-1"></i>View Paper</a>';
            if (paper.pdf_url) {
                html += '<a href="' + paper.pdf_url + '" target="_blank" class="btn btn-sm" style="background:var(--color-gray-700);color:#fff;border:none;border-radius:3px;">';
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

            // Hero figure at the top of the analysis section
            html += generateFigureHTML(paper);

            if (analysis.introduction) {
                html += '<div class="section-label">Introduction</div>';
                html += '<p>' + analysis.introduction + '</p>';
            }

            if (analysis.challenges) {
                html += '<div class="section-label">Key Challenges</div>';
                html += '<p>' + analysis.challenges + '</p>';
            }

            if (analysis.innovations) {
                html += '<div class="section-label">Innovations</div>';
                html += '<p>' + analysis.innovations + '</p>';
            }

            if (analysis.experiments) {
                html += '<div class="section-label">Experiments & Results</div>';
                html += '<p>' + analysis.experiments + '</p>';
                // Show additional figures after experiments (skip first, already shown as hero)
                if (paper.images && paper.images.length > 1) {
                    var paperCopy = Object.assign({}, paper);
                    paperCopy.images = paper.images.slice(1);
                    paperCopy.figures = (paper.figures || []).slice(1);
                    html += generateFigureHTML(paperCopy, paperCopy.images.length);
                }
            }

            if (analysis.insights) {
                html += '<div class="section-label">Insights & Future Directions</div>';
                html += '<p>' + analysis.insights + '</p>';
            }

            if (analysis.keywords && analysis.keywords.length > 0) {
                html += '<div class="section-label">Keywords</div>';
                html += '<div class="mb-2">';
                analysis.keywords.forEach(keyword => {
                    html += '<span class="category-badge me-1 mb-1">' + keyword + '</span>';
                });
                html += '</div>';
            }

            if (analysis.relevance_score) {
                html += '<div class="mt-3 p-2" style="background:var(--color-gray-100);border-radius:2px;">';
                html += '<strong>Relevance Score:</strong> ' + analysis.relevance_score + '/10<br>';
                html += '<strong>Technical Depth:</strong> ' + (analysis.technical_depth || 'Unknown');
                html += '</div>';
            }

            return html || '<p class="text-muted">No analysis details available.</p>';
        }

        async function updatePapers() {
            const button = document.getElementById('update-btn');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const originalHTML = button.innerHTML;

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
                    button.innerHTML = '<i class="fas fa-check me-2"></i>Updated!';
                    button.className = 'btn btn-success mb-3 w-100';

                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.className = 'btn update-btn btn-primary mb-3 w-100';
                        button.disabled = false;
                    }, 2000);
                } else {
                    const errorMsg = result.error || 'Update failed';
                    const isRateLimit = response.status === 429 || errorMsg.includes('wait');

                    button.innerHTML = isRateLimit
                        ? '<i class="fas fa-clock me-2"></i>Please Wait'
                        : '<i class="fas fa-exclamation-triangle me-2"></i>Update Failed';
                    button.className = isRateLimit ? 'btn btn-warning mb-3 w-100' : 'btn btn-danger mb-3 w-100';

                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.className = 'btn update-btn btn-primary mb-3 w-100';
                        button.disabled = false;
                    }, 3000);
                }
            } catch (error) {
                console.error('Error updating papers:', error);

                button.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Update Failed';
                button.className = 'btn btn-danger mb-3 w-100';

                setTimeout(() => {
                    button.innerHTML = originalHTML;
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
                translateBtn.style.background = 'var(--color-primary-500)';
                translateBtn.style.color = '#fff';
                translateBtn.style.borderColor = 'var(--color-primary-500)';
            } else {
                translateBtn.style.background = 'transparent';
                translateBtn.style.color = 'var(--color-gray-700)';
                translateBtn.style.borderColor = 'var(--color-gray-300)';
            }

            // Reload current paper if one is selected
            if (window.currentPaperIndex !== undefined) {
                await loadPaperContent(window.currentPaperIndex);
            }
        }

        function generateTranslatedPaperDetails(paper) {
            if (currentLanguage === 'zh' && paper.analysis) {
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
                html += '<p class="text-muted mb-1"><strong>评分:</strong> <span class="score-badge">' + totalScore.toFixed(1) + '/10</span></p>';
                html += '</div>';

                if (paper.abstract) {
                    html += '<div class="section-label">摘要 / Abstract</div>';
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
                    html += generateFigureHTML(paper);
                } else {
                    html += '<div class="section-label">摘要 / Abstract</div>';
                    html += '<p class="text-muted">暂无摘要 / No abstract available</p>';
                }

                html += '<div class="mt-3">';
                html += '<a href="' + paper.url + '" target="_blank" class="btn btn-sm me-2" style="background:var(--color-primary-500);color:#fff;border:none;border-radius:3px;">';
                html += '<i class="fas fa-external-link-alt me-1"></i>查看论文 / View Paper</a>';
                if (paper.pdf_url) {
                    html += '<a href="' + paper.pdf_url + '" target="_blank" class="btn btn-sm" style="background:var(--color-gray-700);color:#fff;border:none;border-radius:3px;">';
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

                // Hero figure at the top of the translated analysis section
                html += generateFigureHTML(paper);

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
                    html += '<div class="section-label">介绍 / Introduction</div>';
                    if (zhIntro && zhIntro.trim()) {
                        html += '<p>' + zhIntro + '</p>';
                    } else {
                        html += '<p>' + analysis.introduction + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.challenges) {
                    html += '<div class="section-label">挑战 / Challenges</div>';
                    if (zhChallenges && zhChallenges.trim()) {
                        html += '<p>' + zhChallenges + '</p>';
                    } else {
                        html += '<p>' + analysis.challenges + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.innovations) {
                    html += '<div class="section-label">创新点 / Innovations</div>';
                    if (zhInnovations && zhInnovations.trim()) {
                        html += '<p>' + zhInnovations + '</p>';
                    } else {
                        html += '<p>' + analysis.innovations + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.experiments) {
                    html += '<div class="section-label">实验与结果 / Experiments & Results</div>';
                    if (zhExperiments && zhExperiments.trim()) {
                        html += '<p>' + zhExperiments + '</p>';
                    } else {
                        html += '<p>' + analysis.experiments + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.insights) {
                    html += '<div class="section-label">见解与未来方向 / Insights & Future Directions</div>';
                    if (zhInsights && zhInsights.trim()) {
                        html += '<p>' + zhInsights + '</p>';
                    } else {
                        html += '<p>' + analysis.insights + '</p>';
                        html += '<div class="alert alert-warning alert-sm mt-2 mb-3" role="alert">';
                        html += '<i class="fas fa-spinner fa-spin me-1"></i>中文翻译生成中...';
                        html += '</div>';
                    }
                }

                if (analysis.keywords && analysis.keywords.length > 0) {
                    html += '<div class="section-label">关键词 / Keywords</div>';
                    html += '<div class="mb-2">';
                    analysis.keywords.forEach(keyword => {
                        html += '<span class="category-badge me-1 mb-1">' + keyword + '</span>';
                    });
                    html += '</div>';
                }

                if (analysis.relevance_score) {
                    html += '<div class="mt-3 p-2" style="background:var(--color-gray-100);border-radius:2px;">';
                    html += '<strong>相关度评分 / Relevance Score:</strong> ' + analysis.relevance_score + '/10<br>';
                    html += '<strong>技术深度 / Technical Depth:</strong> ' + (analysis.technical_depth || '未知');
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
