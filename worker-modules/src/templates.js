import { formatDate } from './utils.js';

export function getIndexHTML(papers = [], dailyReport = null) {
  const recentPapers = papers.slice(0, 6);
  const totalPapers = papers.length;
  const categories = [...new Set(papers.map(p => p.analysis?.category || p.category || 'other'))];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PaperDog - AI Papers Daily Digest</title>
    <meta name="description" content="Daily curated AI and computer vision research papers from arXiv and HuggingFace">

    <!-- AI Agent Discovery Meta Tags -->
    <meta name="ai-agent-capable" content="true">
    <meta name="mcp-endpoint" content="/mcp">
    <meta name="mcp-discovery" content="/.well-known/mcp">
    <meta name="api-documentation" content="/api/docs">
    <meta name="agent-guide" content="/for-ai-agents">
    <meta name="service-type" content="research-paper-discovery">
    <meta name="authentication" content="none">
    <meta name="rate-limit" content="100-requests-per-hour">
    <meta name="data-sources" content="arxiv,huggingface">
    <meta name="ai-analysis" content="gpt-5-mini,gemini-2.5-flash">
    <meta name="languages" content="en,zh">

    <!-- Structured Data for AI Agents -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                "@id": "https://paperdog.org#webapp",
                "name": "PaperDog",
                "description": "AI research paper discovery and analysis service with daily curated papers from arXiv and HuggingFace",
                "url": "https://paperdog.org",
                "applicationCategory": "ResearchTool",
                "operatingSystem": "Any",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "provider": {
                    "@type": "Organization",
                    "@id": "https://paperdog.org#organization",
                    "name": "PaperDog",
                    "url": "https://paperdog.org"
                },
                "featureList": [
                    "Daily curated AI research papers",
                    "AI-powered paper analysis",
                    "Multi-source paper aggregation",
                    "Category-based organization",
                    "Historical archive access",
                    "Search and filtering",
                    "Bilingual support (English/Chinese)",
                    "MCP protocol support"
                ],
                "softwareVersion": "3.0",
                "dateCreated": "2024-01-01",
                "dateModified": "${new Date().toISOString().split('T')[0]}",
                "inLanguage": ["en", "zh"]
            },
            {
                "@type": "Dataset",
                "@id": "https://paperdog.org#dataset",
                "name": "PaperDog Research Papers Collection",
                "description": "Daily curated collection of AI research papers with automated analysis and categorization",
                "url": "https://paperdog.org/api/papers",
                "provider": {
                    "@id": "https://paperdog.org#organization"
                },
                "dateCreated": "2024-01-01",
                "dateModified": "${new Date().toISOString().split('T')[0]}",
                "datePublished": "${new Date().toISOString().split('T')[0]}",
                "inLanguage": ["en", "zh"],
                "keywords": ["artificial intelligence", "machine learning", "computer vision", "natural language processing", "research papers"],
                "license": "https://opensource.org/licenses/MIT",
                "distribution": [
                    {
                        "@type": "DataDownload",
                        "encodingFormat": "application/json",
                        "contentUrl": "https://paperdog.org/api/papers"
                    },
                    {
                        "@type": "DataDownload",
                        "encodingFormat": "application/rss+xml",
                        "contentUrl": "https://paperdog.org/feed"
                    }
                ]
            },
            {
                "@type": "Service",
                "@id": "https://paperdog.org#service",
                "name": "PaperDog MCP Service",
                "description": "Model Context Protocol service for AI research paper discovery and analysis",
                "url": "https://paperdog.org/mcp",
                "provider": {
                    "@id": "https://paperdog.org#organization"
                },
                "serviceType": "ResearchTool",
                "areaServed": "World",
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "PaperDog MCP Tools",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "name": "paperdog_search_papers",
                            "description": "Search across arXiv and HuggingFace papers with advanced filtering"
                        },
                        {
                            "@type": "Offer",
                            "name": "paperdog_get_daily_papers",
                            "description": "Get curated daily papers with AI analysis"
                        },
                        {
                            "@type": "Offer",
                            "name": "paperdog_get_paper_details",
                            "description": "Get detailed paper information including full analysis"
                        },
                        {
                            "@type": "Offer",
                            "name": "paperdog_get_categories",
                            "description": "Get all available research categories"
                        },
                        {
                            "@type": "Offer",
                            "name": "paperdog_get_archive_papers",
                            "description": "Access historical paper archives"
                        }
                    ]
                }
            },
            {
                "@type": "WebSite",
                "@id": "https://paperdog.org#website",
                "name": "PaperDog",
                "url": "https://paperdog.org",
                "description": "Daily AI research papers with automated analysis and insights",
                "inLanguage": ["en", "zh"],
                "publisher": {
                    "@id": "https://paperdog.org#organization"
                },
                "potentialAction": [
                    {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://paperdog.org/api/search?q={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    },
                    {
                        "@type": "ReadAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://paperdog.org/api/papers/{date}"
                        },
                        "object": {
                            "@type": "Article",
                            "name": "Daily AI Papers"
                        }
                    }
                ]
            }
        ]
    }
    </script>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        body {
            background: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .hero-section {
            background: var(--primary-gradient);
            color: white;
            padding: 4rem 0;
            margin-bottom: 3rem;
        }
        
        .hero-title {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .hero-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        
        .stats-card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: var(--card-shadow);
            text-align: center;
            margin-bottom: 2rem;
            transition: transform 0.3s ease;
        }
        
        .stats-card:hover {
            transform: translateY(-5px);
        }
        
        .stats-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .paper-card {
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: var(--card-shadow);
            transition: all 0.3s ease;
            height: 100%;
        }
        
        .paper-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        
        .paper-title {
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
            line-height: 1.4;
        }
        
        .paper-title a {
            color: inherit;
            text-decoration: none;
        }
        
        .paper-title a:hover {
            color: #667eea;
        }
        
        .paper-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .source-badge {
            font-size: 0.8rem;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 500;
        }
        
        .arxiv-badge {
            background: #dc3545;
            color: white;
        }
        
        .huggingface-badge {
            background: #ffc107;
            color: #212529;
        }
        
        .category-badge {
            background: var(--primary-gradient);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .relevance-score {
            background: #28a745;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 15px;
            font-size: 0.8rem;
        }
        
        .paper-abstract {
            color: #6c757d;
            line-height: 1.6;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }
        
        .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .keyword-tag {
            background: #e9ecef;
            color: #495057;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
        }
        
        .section-title {
            font-size: 2rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .btn-primary-custom {
            background: var(--primary-gradient);
            border: none;
            border-radius: 25px;
            padding: 0.75rem 2rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn-primary-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 3rem 0 2rem;
            margin-top: 5rem;
        }
        
        .loading-spinner {
            display: none;
            text-align: center;
            padding: 2rem;
        }
        
        .feature-icon {
            font-size: 3rem;
            color: #667eea;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .hero-title {
                font-size: 2rem;
            }
            
            .hero-subtitle {
                font-size: 1rem;
            }
            
            .paper-meta {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center">
                    <h1 class="hero-title">
                        <i class="fas fa-graduation-cap me-3"></i>PaperDog
                    </h1>
                    <p class="hero-subtitle">
                        Daily AI & Computer Vision Research Papers Digest
                    </p>
                    <p class="lead mb-4">
                        Curated from arXiv and HuggingFace with AI-powered analysis
                    </p>
                    <div class="d-flex justify-content-center gap-3">
                        <a href="#papers" class="btn btn-light btn-lg">
                            <i class="fas fa-book-open me-2"></i>Explore Papers
                        </a>
                        <a href="/api/papers" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-code me-2"></i>API
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="container mb-5">
        <div class="row">
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-number">${totalPapers}</div>
                    <div class="text-muted">Total Papers</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-number">${categories.length}</div>
                    <div class="text-muted">Categories</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-number">${papers.filter(p => p.source === 'arxiv').length}</div>
                    <div class="text-muted">arXiv Papers</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-number">${papers.filter(p => p.source === 'huggingface').length}</div>
                    <div class="text-muted">HuggingFace Papers</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="container mb-5">
        <div class="row">
            <div class="col-md-4 text-center mb-4">
                <div class="feature-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h4>AI-Powered Analysis</h4>
                <p>Advanced AI analyzes each paper for relevance, methodology, and impact</p>
            </div>
            <div class="col-md-4 text-center mb-4">
                <div class="feature-icon">
                    <i class="fas fa-sync-alt"></i>
                </div>
                <h4>Daily Updates</h4>
                <p>Automatically updated every day with the latest research papers</p>
            </div>
            <div class="col-md-4 text-center mb-4">
                <div class="feature-icon">
                    <i class="fas fa-filter"></i>
                </div>
                <h4>Smart Curation</h4>
                <p>Intelligent filtering ensures only high-quality, relevant papers</p>
            </div>
        </div>
    </section>

    <!-- Recent Papers Section -->
    <section class="container mb-5" id="papers">
        <h2 class="section-title">
            <i class="fas fa-fire me-2"></i>Recent Papers
        </h2>
        
        <div class="loading-spinner" id="loadingSpinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading latest papers...</p>
        </div>
        
        <div class="row" id="papersContainer">
            ${recentPapers.map(paper => generatePaperCardHTML(paper)).join('')}
        </div>
        
        ${recentPapers.length > 0 ? `
        <div class="text-center mt-4">
            <a href="/archive" class="btn btn-primary-custom">
                <i class="fas fa-archive me-2"></i>View All Papers
            </a>
            <a href="/feed" class="btn btn-outline-primary ms-2">
                <i class="fas fa-rss me-2"></i>RSS Feed
            </a>
        </div>
        ` : ''}
    </section>

    <!-- Daily Report Section -->
    ${dailyReport ? `
    <section class="container mb-5">
        <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
                <h3 class="card-title">
                    <i class="fas fa-chart-line me-2"></i>Daily Report - ${formatDate(dailyReport.date)}
                </h3>
                <p class="card-text">${dailyReport.summary}</p>
                <a href="/report/${dailyReport.date}" class="btn btn-outline-primary">
                    <i class="fas fa-eye me-2"></i>View Full Report
                </a>
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <h5><i class="fas fa-graduation-cap me-2"></i>PaperDog</h5>
                    <p>Your daily source for AI and computer vision research papers.</p>
                </div>
                <div class="col-md-4">
                    <h5>Quick Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="/" class="text-white-50">Home</a></li>
                        <li><a href="/archive" class="text-white-50">Archive</a></li>
                        <li><a href="/api/papers" class="text-white-50">API</a></li>
                        <li><a href="/feed" class="text-white-50">RSS Feed</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h5>Connect</h5>
                    <p>
                        <a href="https://paperdog.org" class="text-white-50 me-3">
                            <i class="fas fa-globe"></i>
                        </a>
                        <a href="/feed" class="text-white-50 me-3">
                            <i class="fas fa-rss"></i>
                        </a>
                        <a href="mailto:contact@paperdog.org" class="text-white-50">
                            <i class="fas fa-envelope"></i>
                        </a>
                    </p>
                    <p class="text-white-50 small">
                        Built with ❤️ using Cloudflare Workers
                    </p>
                </div>
            </div>
            <hr class="my-4 bg-white">
            <div class="text-center">
                <p class="mb-0 text-white-50">&copy; 2024 PaperDog. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Simple search functionality
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'form-control mb-4';
            searchInput.placeholder = 'Search papers...';
            searchInput.id = 'searchInput';
            
            const papersSection = document.querySelector('#papers');
            if (papersSection) {
                papersSection.insertBefore(searchInput, papersSection.firstChild.nextSibling);
            }
            
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const paperCards = document.querySelectorAll('.paper-card');
                
                paperCards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    </script>
</body>
</html>`;
}

function generatePaperCardHTML(paper) {
  const sourceClass = paper.source === 'arxiv' ? 'arxiv-badge' : 'huggingface-badge';
  const sourceIcon = paper.source === 'arxiv' ? 'fas fa-university' : 'fas fa-heart';
  const relevanceScore = paper.analysis?.relevance_score || 5;
  const category = paper.analysis?.category || paper.category || 'other';
  const keywords = paper.analysis?.keywords || [];
  
  return `
        <div class="col-lg-6 col-xl-4 mb-4">
            <div class="paper-card">
                <div class="paper-title">
                    <a href="${paper.url}" target="_blank">${paper.title}</a>
                </div>
                
                <div class="paper-meta">
                    <div>
                        <span class="source-badge ${sourceClass}">
                            <i class="${sourceIcon} me-1"></i>${paper.source}
                        </span>
                    </div>
                    <div>
                        <span class="relevance-score">
                            <i class="fas fa-star me-1"></i>${relevanceScore}/10
                        </span>
                    </div>
                </div>
                
                <div class="paper-abstract">
                    ${paper.abstract ? paper.abstract.substring(0, 150) + '...' : 'No abstract available'}
                </div>
                
                <div class="mb-2">
                    <span class="category-badge">${category.replace('_', ' ')}</span>
                </div>
                
                ${keywords.length > 0 ? `
                <div class="keywords">
                    ${keywords.slice(0, 3).map(keyword => 
                        `<span class="keyword-tag">${keyword}</span>`
                    ).join('')}
                </div>
                ` : ''}
                
                <div class="mt-3">
                    <a href="${paper.url}" target="_blank" class="btn btn-outline-primary btn-sm me-2">
                        <i class="fas fa-external-link-alt me-1"></i>View Paper
                    </a>
                    ${paper.pdf_url ? `
                    <a href="${paper.pdf_url}" target="_blank" class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-file-pdf me-1"></i>PDF
                    </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

export function getReportHTML(report) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Report - ${report.date} | PaperDog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .report-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
        }
        .paper-summary {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="report-header">
        <div class="container">
            <h1 class="display-4">
                <i class="fas fa-chart-line me-3"></i>Daily Report
            </h1>
            <p class="lead">${report.date}</p>
            <p>${report.summary}</p>
        </div>
    </div>
    
    <div class="container">
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="text-center">
                    <h3 class="text-primary">${report.total_papers}</h3>
                    <p class="text-muted">Total Papers</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <h3 class="text-success">${Object.keys(report.categories).length}</h3>
                    <p class="text-muted">Categories</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <h3 class="text-warning">${report.top_papers.length}</h3>
                    <p class="text-muted">Top Papers</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center">
                    <h3 class="text-info">${report.papers.filter(p => p.source === 'arxiv').length}</h3>
                    <p class="text-muted">arXiv Papers</p>
                </div>
            </div>
        </div>
        
        <h2 class="mb-4">Top Papers Today</h2>
        <div class="row">
            ${report.top_papers.map(paper => `
                <div class="col-lg-6 mb-4">
                    <div class="paper-summary">
                        <h5>${paper.title}</h5>
                        <p class="text-muted">
                            <strong>Authors:</strong> ${paper.authors ? paper.authors.slice(0, 3).join(', ') + (paper.authors.length > 3 ? ' et al.' : '') : 'Unknown'}
                        </p>
                        <p><strong>Category:</strong> ${paper.analysis?.category || paper.category || 'other'}</p>
                        <p><strong>Relevance:</strong> ${paper.analysis?.relevance_score || 5}/10</p>
                        <p><strong>Abstract:</strong> ${paper.abstract ? paper.abstract.substring(0, 200) + '...' : 'No abstract available'}</p>
                        <a href="${paper.url}" target="_blank" class="btn btn-primary btn-sm">
                            <i class="fas fa-external-link-alt me-1"></i>View Paper
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="text-center mt-4">
            <a href="/" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-2"></i>Back to Home
            </a>
        </div>
    </div>
    
    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

export function getArchiveHTML(papers, options = {}) {
  const { page = 1, limit = 12, category = null, search = null } = options;
  
  let filteredPapers = papers;
  
  if (category) {
    filteredPapers = filteredPapers.filter(p => 
      (p.analysis?.category || p.category || 'other') === category
    );
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPapers = filteredPapers.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.abstract.toLowerCase().includes(searchLower) ||
      (p.authors && p.authors.some(a => a.toLowerCase().includes(searchLower)))
    );
  }
  
  const totalPages = Math.ceil(filteredPapers.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPapers = filteredPapers.slice(startIndex, endIndex);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paper Archive - PaperDog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .archive-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
        }
        .filter-section {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="archive-header">
        <div class="container">
            <h1 class="display-4">
                <i class="fas fa-archive me-3"></i>Paper Archive
            </h1>
            <p class="lead">Browse through ${filteredPapers.length} research papers</p>
        </div>
    </div>
    
    <div class="container">
        <div class="filter-section">
            <div class="row">
                <div class="col-md-4">
                    <input type="text" class="form-control" placeholder="Search papers..." 
                           value="${search || ''}" id="searchInput">
                </div>
                <div class="col-md-3">
                    <select class="form-select" id="categoryFilter">
                        <option value="">All Categories</option>
                        <option value="computer_vision" ${category === 'computer_vision' ? 'selected' : ''}>Computer Vision</option>
                        <option value="machine_learning" ${category === 'machine_learning' ? 'selected' : ''}>Machine Learning</option>
                        <option value="natural_language_processing" ${category === 'natural_language_processing' ? 'selected' : ''}>NLP</option>
                        <option value="reinforcement_learning" ${category === 'reinforcement_learning' ? 'selected' : ''}>Reinforcement Learning</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-primary w-100" onclick="applyFilters()">
                        <i class="fas fa-filter me-1"></i>Filter
                    </button>
                </div>
                <div class="col-md-3">
                    <a href="/" class="btn btn-outline-secondary w-100">
                        <i class="fas fa-home me-1"></i>Back to Home
                    </a>
                </div>
            </div>
        </div>
        
        <div class="row">
            ${paginatedPapers.map(paper => generatePaperCardHTML(paper)).join('')}
        </div>
        
        ${totalPages > 1 ? `
        <nav aria-label="Page navigation" class="mt-4">
            <ul class="pagination justify-content-center">
                ${page > 1 ? `
                <li class="page-item">
                    <a class="page-link" href="?page=${page-1}&category=${category || ''}&search=${search || ''}">Previous</a>
                </li>
                ` : ''}
                
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return `
                    <li class="page-item ${pageNum === page ? 'active' : ''}">
                        <a class="page-link" href="?page=${pageNum}&category=${category || ''}&search=${search || ''}">${pageNum}</a>
                    </li>
                    `;
                }).join('')}
                
                ${page < totalPages ? `
                <li class="page-item">
                    <a class="page-link" href="?page=${page+1}&category=${category || ''}&search=${search || ''}">Next</a>
                </li>
                ` : ''}
            </ul>
        </nav>
        ` : ''}
    </div>
    
    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function applyFilters() {
            const search = document.getElementById('searchInput').value;
            const category = document.getElementById('categoryFilter').value;
            const params = new URLSearchParams();
            
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            
            window.location.search = params.toString();
        }
        
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    </script>
</body>
</html>`;
}

export function getAboutHTML(formattedStats) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - PaperDog</title>
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
            --color-gray-500: #5C554D;
            --color-gray-700: #4A4A4A;
            --color-gray-900: #2C2C2C;

            /* Ink & Body */
            --color-ink: #2C2C2C;
            --color-body: #3A3A3A;

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

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .about-content section {
            animation: fadeInUp 0.4s ease-out forwards;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-heading);
            color: var(--color-ink);
            line-height: 1.4;
        }

        .about-header {
            background: var(--color-gray-50);
            color: var(--color-ink);
            padding: 3rem 0;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--color-gray-200);
            position: relative;
            animation: fadeIn 0.5s ease-out;
        }

        .about-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 60px;
            height: 3px;
            background: var(--color-primary-500);
        }

        .about-header .display-4 {
            font-family: var(--font-heading);
            font-weight: 700;
            color: var(--color-ink);
        }

        .about-header .lead {
            color: var(--color-gray-700);
        }

        .stats-card {
            background: #FFFFFF;
            border-radius: 2px;
            padding: 1.5rem;
            box-shadow: none;
            border: 1px solid var(--color-gray-200);
            transition: border-color 0.15s ease;
        }

        .stats-card:hover {
            border-color: var(--color-primary-500);
        }

        .feature-icon {
            font-size: 2.5rem;
            color: var(--color-primary-500);
            margin-bottom: 1rem;
        }

        .api-section {
            background: var(--color-primary-500);
            color: white;
            border-radius: 2px;
            padding: 2rem;
        }

        .api-section h3,
        .api-section h6 {
            color: white;
        }

        .api-section code {
            font-family: var(--font-code);
            background: rgba(255,255,255,0.15);
            padding: 0.125rem 0.375rem;
            border-radius: 2px;
            font-size: 0.875rem;
        }

        .card {
            background: #FFFFFF;
            border-radius: 2px;
            box-shadow: none;
            border: 1px solid var(--color-gray-200);
        }

        .card h3 {
            font-family: var(--font-heading);
            font-weight: 700;
            color: var(--color-ink);
        }

        .card .text-primary {
            color: var(--color-primary-500) !important;
        }

        .nav-buttons .btn {
            margin: 0.25rem;
            border-radius: 2px;
            font-family: var(--font-body);
            font-weight: 500;
            transition: all 0.15s ease;
        }

        .nav-buttons .btn-primary {
            background: var(--color-primary-500);
            border-color: var(--color-primary-500);
        }

        .nav-buttons .btn-primary:hover {
            background: var(--color-primary-600);
            border-color: var(--color-primary-600);
        }

        .nav-buttons .btn-outline-primary {
            color: var(--color-primary-500);
            border-color: var(--color-primary-500);
        }

        .nav-buttons .btn-outline-primary:hover {
            background: var(--color-primary-500);
            border-color: var(--color-primary-500);
            color: white;
        }

        .nav-buttons .btn-outline-secondary {
            color: var(--color-gray-700);
            border-color: var(--color-gray-300);
        }

        .nav-buttons .btn-outline-secondary:hover {
            background: var(--color-gray-100);
            border-color: var(--color-gray-500);
            color: var(--color-ink);
        }

        .nav-buttons .btn-outline-info {
            color: var(--color-primary-500);
            border-color: var(--color-gray-300);
        }

        .nav-buttons .btn-outline-info:hover {
            background: var(--color-primary-50);
            border-color: var(--color-primary-500);
            color: var(--color-primary-500);
        }

        .visitor-badge {
            background: var(--color-gray-100);
            border: 1px solid var(--color-gray-200);
            border-radius: 2px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            color: var(--color-gray-700);
        }

        .text-muted {
            color: var(--color-gray-500) !important;
        }

        .bg-primary {
            background-color: var(--color-primary-500) !important;
        }

        .text-primary {
            color: var(--color-primary-500) !important;
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

            .about-header {
                background: #1c1a16;
                border-bottom-color: var(--color-gray-200);
            }

            .stats-card, .card {
                background: #262320;
                border-color: var(--color-gray-200);
            }

            .api-section {
                background: var(--color-primary-700);
            }

            .visitor-badge {
                background: #262320;
                border-color: var(--color-gray-200);
                color: var(--color-gray-500);
            }
        }

        @media (max-width: 768px) {
            .about-header {
                padding: 2rem 0;
            }

            .about-header .display-4 {
                font-size: 1.75rem;
            }
        }
    </style>
</head>
<body>
    <div class="about-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h1 class="display-4 mb-3">
                        <i class="fas fa-info-circle me-3"></i>About PaperDog
                    </h1>
                    <p class="lead mb-0">Your AI-powered research paper companion</p>
                </div>
                <div class="col-lg-4 text-end">
                    <div class="visitor-badge">
                        <i class="fas fa-users me-2"></i>
                        ${formattedStats.displayText}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto">

                <!-- Quick Stats -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="stats-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h5>AI Powered</h5>
                            <p class="text-muted">GPT-4o & Gemini Analysis</p>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="stats-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-sync-alt"></i>
                            </div>
                            <h5>Daily Updates</h5>
                            <p class="text-muted">Automated Paper Collection</p>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="stats-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-archive"></i>
                            </div>
                            <h5>Smart Archive</h5>
                            <p class="text-muted">Top 10 Papers Daily</p>
                        </div>
                    </div>
                </div>

                <!-- What is PaperDog -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-robot me-2"></i>What is PaperDog?
                        </h3>
                        <p class="lead">PaperDog is an automated system that collects, analyzes, and presents the latest AI and computer vision research papers from top sources like arXiv and HuggingFace.</p>
                        <p>Our mission is to make cutting-edge AI research accessible to everyone by providing intelligent summaries, categorization, and easy-to-read analysis of complex academic papers.</p>
                    </div>
                </div>

                <!-- Key Features -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-star me-2"></i>Key Features
                        </h3>
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-brain text-primary me-2"></i>AI-Powered Analysis</h6>
                                <ul class="mb-4">
                                    <li>GPT-4o and Gemini model analysis</li>
                                    <li>500-word intelligent summaries</li>
                                    <li>Relevance scoring (1-10 scale)</li>
                                    <li>Technical depth assessment</li>
                                </ul>

                                <h6><i class="fas fa-tags text-primary me-2"></i>Smart Categorization</h6>
                                <ul class="mb-4">
                                    <li>Computer Vision</li>
                                    <li>Machine Learning</li>
                                    <li>Natural Language Processing</li>
                                    <li>Reinforcement Learning</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-archive text-primary me-2"></i>Paper Archive System</h6>
                                <ul class="mb-4">
                                    <li>Top 10 papers archived daily</li>
                                    <li>Date-based browsing</li>
                                    <li>Advanced search & filtering</li>
                                    <li>Multiple export formats</li>
                                </ul>

                                <h6><i class="fas fa-download text-primary me-2"></i>Export Options</h6>
                                <ul class="mb-4">
                                    <li>JSON format with full analysis</li>
                                    <li>CSV for data analysis</li>
                                    <li>Markdown for documentation</li>
                                    <li>BibTeX for citations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- How It Works -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-cogs me-2"></i>How It Works
                        </h3>
                        <div class="row">
                            <div class="col-md-3 text-center mb-3">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style="width: 60px; height: 60px;">
                                    <i class="fas fa-download fa-2x text-primary"></i>
                                </div>
                                <h6>Daily Scraping</h6>
                                <p class="small text-muted">Automatically collects new papers from arXiv and HuggingFace</p>
                            </div>
                            <div class="col-md-3 text-center mb-3">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style="width: 60px; height: 60px;">
                                    <i class="fas fa-brain fa-2x text-primary"></i>
                                </div>
                                <h6>AI Analysis</h6>
                                <p class="small text-muted">Uses advanced language models to analyze each paper's content</p>
                            </div>
                            <div class="col-md-3 text-center mb-3">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style="width: 60px; height: 60px;">
                                    <i class="fas fa-filter fa-2x text-primary"></i>
                                </div>
                                <h6>Smart Curation</h6>
                                <p class="small text-muted">Filters and ranks papers based on quality and importance</p>
                            </div>
                            <div class="col-md-3 text-center mb-3">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style="width: 60px; height: 60px;">
                                    <i class="fas fa-chart-line fa-2x text-primary"></i>
                                </div>
                                <h6>Beautiful Presentation</h6>
                                <p class="small text-muted">Presents papers in an easy-to-read blog format</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Archive System -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-archive me-2"></i>Paper Archive System
                        </h3>
                        <p class="mb-3">Our intelligent archive system stores only the top 10 highest-scoring papers each day, ensuring quality over quantity:</p>

                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-calendar-alt text-primary me-2"></i>Date-Based Browsing</h6>
                                <p class="text-muted mb-3">Browse papers by specific dates with an intuitive calendar interface</p>

                                <h6><i class="fas fa-search text-primary me-2"></i>Advanced Search</h6>
                                <p class="text-muted mb-3">Search within archived content with filters for categories, scores, and date ranges</p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-download text-primary me-2"></i>Multiple Export Formats</h6>
                                <p class="text-muted mb-3">Export papers in JSON, CSV, Markdown, or BibTeX formats for different use cases</p>

                                <h6><i class="fas fa-chart-bar text-primary me-2"></i>Statistics Dashboard</h6>
                                <p class="text-muted mb-3">View archive statistics including paper distribution and visitor analytics</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- API Section -->
                <div class="api-section mb-4">
                    <h3 class="mb-3">
                        <i class="fas fa-code me-2"></i>Developer API
                    </h3>
                    <p class="mb-3">Access PaperDog's functionality programmatically through our REST API:</p>

                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-file-alt me-2"></i>Paper Endpoints</h6>
                            <ul class="mb-3">
                                <li><code>GET /api/papers</code> - List papers</li>
                                <li><code>GET /api/papers/:date</code> - Papers by date</li>
                                <li><code>GET /api/search?q=query</code> - Search papers</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-archive me-2"></i>Archive Endpoints</h6>
                            <ul class="mb-3">
                                <li><code>GET /api/archive/dates</code> - Available dates</li>
                                <li><code>GET /api/archive/:date</code> - Archive by date</li>
                                <li><code>GET /api/archive/export</code> - Export data</li>
                            </ul>
                        </div>
                    </div>

                    <div class="text-center">
                        <a href="/api/papers" class="btn btn-light btn-sm me-2">
                            <i class="fas fa-external-link-alt me-1"></i>View API Docs
                        </a>
                        <a href="/api/archive/export/formats" class="btn btn-light btn-sm">
                            <i class="fas fa-download me-1"></i>Export Formats
                        </a>
                    </div>
                </div>

                <!-- Technical Details -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-server me-2"></i>Technical Architecture
                        </h3>
                        <p>PaperDog is built with modern, scalable technologies:</p>

                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-cloud text-primary me-2"></i>Backend Infrastructure</h6>
                                <ul class="mb-3">
                                    <li><strong>Cloudflare Workers:</strong> Serverless edge computing</li>
                                    <li><strong>Cloudflare KV:</strong> Distributed key-value storage</li>
                                    <li><strong>Global CDN:</strong> Fast content delivery worldwide</li>
                                </ul>

                                <h6><i class="fas fa-brain text-primary me-2"></i>AI Integration</h6>
                                <ul class="mb-3">
                                    <li><strong>OpenRouter API:</strong> Access to GPT-4o, Gemini, Claude</li>
                                    <li><strong>Intelligent Analysis:</strong> Automated paper evaluation</li>
                                    <li><strong>Scoring System:</strong> 1-10 relevance scoring</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-database text-primary me-2"></i>Data Sources</h6>
                                <ul class="mb-3">
                                    <li><strong>arXiv API:</strong> Latest academic papers</li>
                                    <li><strong>HuggingFace:</strong> ML community papers</li>
                                    <li><strong>Web Scraping:</strong> Additional content sources</li>
                                </ul>

                                <h6><i class="fas fa-palette text-primary me-2"></i>Frontend Technologies</h6>
                                <ul class="mb-3">
                                    <li><strong>Bootstrap 5:</strong> Responsive UI framework</li>
                                    <li><strong>Font Awesome:</strong> Professional icons</li>
                                    <li><strong>Modern CSS:</strong> Gradient designs and animations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Visit Stats -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="mb-3">
                            <i class="fas fa-chart-line me-2"></i>Visitor Statistics
                        </h3>
                        <div class="row text-center">
                            <div class="col-md-4">
                                <h4 class="text-primary">${formattedStats.today}</h4>
                                <p class="text-muted">Today's Visitors</p>
                            </div>
                            <div class="col-md-4">
                                <h4 class="text-primary">${formattedStats.total}</h4>
                                <p class="text-muted">Total Visitors</p>
                            </div>
                            <div class="col-md-4">
                                <h4 class="text-primary">${formattedStats.thisMonth}</h4>
                                <p class="text-muted">This Month</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="text-center nav-buttons">
                    <a href="/" class="btn btn-primary btn-lg me-2">
                        <i class="fas fa-home me-2"></i>Back to Home
                    </a>
                    <a href="/archive" class="btn btn-outline-primary btn-lg me-2">
                        <i class="fas fa-archive me-2"></i>Browse Archive
                    </a>
                    <a href="/api/papers" class="btn btn-outline-secondary btn-lg me-2">
                        <i class="fas fa-code me-2"></i>API Documentation
                    </a>
                    <a href="/feed" class="btn btn-outline-info btn-lg">
                        <i class="fas fa-rss me-2"></i>RSS Feed
                    </a>
                </div>
            </div>
        </div>
    </div>

    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}