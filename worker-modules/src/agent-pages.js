// HTML templates for AI agent-friendly pages

/**
 * Generate HTML for AI agents integration guide page
 */
export function getForAIAgentsHTML(origin) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PaperDog for AI Agents - Research Paper Discovery MCP Service</title>
    <meta name="description" content="PaperDog MCP service enables AI agents to discover, analyze, and understand AI research papers from arXiv and HuggingFace">

    <!-- Structured Data for AI Agents -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "PaperDog MCP Server",
        "description": "AI research paper discovery and analysis service via Model Context Protocol",
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
            "name": "PaperDog",
            "url": "https://paperdog.org"
        },
        "featureList": [
            "Paper discovery from arXiv and HuggingFace",
            "AI-powered paper analysis",
            "Category-based filtering",
            "Historical archive access",
            "Multi-format export",
            "Rate-limited free access"
        ]
    }
    </script>

    <!-- AI Agent Discovery Meta Tags -->
    <meta name="ai-agent-capable" content="true">
    <meta name="mcp-endpoint" content="${origin}/mcp">
    <meta name="mcp-discovery" content="${origin}/.well-known/mcp">
    <meta name="api-documentation" content="${origin}/api/docs">
    <meta name="service-type" content="research-paper-discovery">
    <meta name="authentication" content="none">
    <meta name="rate-limit" content="100-requests-per-hour">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4rem 0;
        }
        .capability-card {
            border: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
            height: 100%;
        }
        .capability-card:hover {
            transform: translateY(-5px);
        }
        .code-block {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 0.5rem;
            padding: 1rem;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        .mcp-tools-list {
            list-style: none;
            padding: 0;
        }
        .mcp-tools-list li {
            background: #f8f9fa;
            margin: 0.5rem 0;
            padding: 0.75rem;
            border-left: 4px solid #007bff;
            border-radius: 0.25rem;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="${origin}">
                <i class="fas fa-dog me-2"></i>PaperDog
            </a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="${origin}">Home</a>
                <a class="nav-link" href="${origin}/api/docs">API Docs</a>
                <a class="nav-link active" href="${origin}/for-ai-agents">For AI Agents</a>
                <a class="nav-link" href="${origin}/about">About</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container text-center">
            <h1 class="display-4 fw-bold mb-4">
                <i class="fas fa-robot me-3"></i>PaperDog for AI Agents
            </h1>
            <p class="lead mb-4">
                Empower AI assistants with access to thousands of research papers through Model Context Protocol
            </p>
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="d-flex justify-content-center gap-3">
                        <span class="badge bg-success fs-6">
                            <i class="fas fa-check-circle me-1"></i>No Authentication
                        </span>
                        <span class="badge bg-info fs-6">
                            <i class="fas fa-bolt me-1"></i>Rate Limited
                        </span>
                        <span class="badge bg-warning fs-6">
                            <i class="fas fa-gift me-1"></i>Free Service
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Start -->
    <section class="py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <div class="card border-primary">
                        <div class="card-header bg-primary text-white">
                            <h4 class="mb-0">
                                <i class="fas fa-rocket me-2"></i>Quick Start for AI Agents
                            </h4>
                        </div>
                        <div class="card-body">
                            <p class="card-text">
                                PaperDog provides MCP tools for AI research paper discovery. Here's how to integrate:
                            </p>

                            <h6 class="fw-bold">MCP Endpoint:</h6>
                            <div class="code-block mb-4">${origin}/mcp</div>

                            <h6 class="fw-bold">Service Discovery:</h6>
                            <div class="code-block mb-4">${origin}/.well-known/mcp</div>

                            <h6 class="fw-bold">Available Tools:</h6>
                            <ul class="mcp-tools-list">
                                <li><strong>paperdog_search_papers</strong> - Search arXiv and HuggingFace papers</li>
                                <li><strong>paperdog_get_daily_papers</strong> - Get curated daily papers</li>
                                <li><strong>paperdog_get_paper_details</strong> - Get detailed paper information</li>
                                <li><strong>paperdog_get_categories</strong> - List available research categories</li>
                                <li><strong>paperdog_get_archive_papers</strong> - Access historical archives</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Capabilities -->
    <section class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5">AI Agent Capabilities</h2>
            <div class="row g-4">
                <div class="col-md-6 col-lg-4">
                    <div class="card capability-card">
                        <div class="card-body text-center">
                            <i class="fas fa-search fa-3x text-primary mb-3"></i>
                            <h5 class="card-title">Smart Search</h5>
                            <p class="card-text">
                                Search across thousands of papers with advanced filtering by category, relevance score, and date ranges.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card capability-card">
                        <div class="card-body text-center">
                            <i class="fas fa-brain fa-3x text-success mb-3"></i>
                            <h5 class="card-title">AI Analysis</h5>
                            <p class="card-text">
                                Get AI-powered analysis including challenges, innovations, experiments, and insights for each paper.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card capability-card">
                        <div class="card-body text-center">
                            <i class="fas fa-calendar fa-3x text-info mb-3"></i>
                            <h5 class="card-title">Daily Curation</h5>
                            <p class="card-text">
                                Access daily curated top papers with comprehensive analysis and relevance scoring.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card capability-card">
                        <div class="card-body text-center">
                            <i class="fas fa-archive fa-3x text-warning mb-3"></i>
                            <h5 class="card-title">Historical Archive</h5>
                            <p class="card-text">
                                Query historical paper archives with advanced search and filtering capabilities.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card capability-card">
                        <div class="card-body text-center">
                            <i class="fas fa-layer-group fa-3x text-danger mb-3"></i>
                            <h5 class="card-title">Categories</h5>
                            <p class="card-text">
                                Browse papers by research categories including computer vision, NLP, ML, and more.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card capability-card">
                        <div class="card-body text-center">
                            <i class="fas fa-tachometer-alt fa-3x text-secondary mb-3"></i>
                            <h5 class="card-title">Rate Limited</h5>
                            <p class="card-text">
                                Fair usage with 100 requests per hour and 1000 requests per day per IP address.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Integration Examples -->
    <section class="py-5">
        <div class="container">
            <h2 class="text-center mb-5">Integration Examples</h2>

            <!-- Claude Integration -->
            <div class="row mb-4">
                <div class="col-lg-8 mx-auto">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-comment-dots me-2"></i>Claude Integration
                            </h5>
                        </div>
                        <div class="card-body">
                            <p>Add PaperDog MCP to Claude's configuration:</p>
                            <div class="code-block">
{
  "mcpServers": {
    "paperdog": {
      "command": "curl",
      "args": ["-X", "POST", "${origin}/mcp",
               "-H", "Content-Type: application/json",
               "-d", "@-"]
    }
  }
}
                            </div>
                            <p class="mt-3">Then ask Claude:</p>
                            <div class="code-block">
"Search for recent papers on transformer architectures and analyze the top 3 results"
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ChatGPT Integration -->
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-robot me-2"></i>ChatGPT Plugin
                            </h5>
                        </div>
                        <div class="card-body">
                            <p>Create a custom ChatGPT plugin that calls PaperDog's MCP endpoint:</p>
                            <div class="code-block">
POST ${origin}/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "paperdog_search_papers",
    "arguments": {
      "query": "generative AI",
      "limit": 10
    }
  }
}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Technical Details -->
    <section class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5">Technical Details</h2>
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Protocol & Specifications</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Protocol</h6>
                                    <p>Model Context Protocol (MCP) - JSON-RPC 2.0</p>

                                    <h6>Authentication</h6>
                                    <p>None required (IP-based rate limiting)</p>

                                    <h6>Rate Limits</h6>
                                    <ul>
                                        <li>100 requests per hour</li>
                                        <li>1000 requests per day</li>
                                        <li>Per IP address</li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6>Response Format</h6>
                                    <p>JSON with paper metadata, analysis, and search results</p>

                                    <h6>Error Handling</h6>
                                    <p>Standard JSON-RPC error codes with descriptive messages</p>

                                    <h6>Cache Strategy</h6>
                                    <p>5-minute cache for search results, 15-minute cache for daily papers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4">
        <div class="container text-center">
            <p class="mb-0">
                © 2024 PaperDog. Empowering AI agents with research knowledge.
            </p>
            <div class="mt-2">
                <a href="${origin}" class="text-light me-3">Home</a>
                <a href="${origin}/api/docs" class="text-light me-3">API Docs</a>
                <a href="${origin}/about" class="text-light">About</a>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

/**
 * Generate HTML for API documentation page
 */
export function getAPIDocsHTML(origin) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PaperDog API Documentation - REST & MCP Endpoints</title>
    <meta name="description" content="Complete API documentation for PaperDog research paper discovery service">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet">
    <style>
        .sidebar {
            background: #f8f9fa;
            border-right: 1px solid #dee2e6;
            min-height: calc(100vh - 56px);
        }
        .nav-pills .nav-link {
            color: #495057;
            border-radius: 0;
            padding: 0.75rem 1rem;
        }
        .nav-pills .nav-link.active {
            background: #007bff;
        }
        .endpoint-card {
            border-left: 4px solid #007bff;
            margin-bottom: 1rem;
        }
        .method-badge {
            font-size: 0.8rem;
            font-weight: bold;
            padding: 0.25rem 0.5rem;
        }
        .method-get { background: #28a745; color: white; }
        .method-post { background: #007bff; color: white; }
        .code-block {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 0.25rem;
            padding: 1rem;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
        }
        .response-example {
            background: #f8f9fa;
            border-left: 4px solid #28a745;
        }
        .error-example {
            background: #f8f9fa;
            border-left: 4px solid #dc3545;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="${origin}">
                <i class="fas fa-dog me-2"></i>PaperDog API Docs
            </a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="${origin}">Home</a>
                <a class="nav-link" href="${origin}/for-ai-agents">For AI Agents</a>
                <a class="nav-link active" href="${origin}/api/docs">API Docs</a>
                <a class="nav-link" href="${origin}/about">About</a>
            </div>
        </div>
    </nav>

    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-3 col-lg-2 d-md-block sidebar collapse">
                <div class="position-sticky pt-3">
                    <ul class="nav flex-column nav-pills">
                        <li class="nav-item">
                            <a class="nav-link active" href="#overview">Overview</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#rest-api">REST API</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#mcp-api">MCP API</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#examples">Examples</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#rate-limits">Rate Limits</a>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-- Main Content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">API Documentation</h1>
                </div>

                <!-- Overview Section -->
                <section id="overview" class="mb-5">
                    <h2>Overview</h2>
                    <p>PaperDog provides both REST API and Model Context Protocol (MCP) endpoints for accessing AI research papers from arXiv and HuggingFace.</p>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Base URL</h5>
                                </div>
                                <div class="card-body">
                                    <div class="code-block">${origin}</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Authentication</h5>
                                </div>
                                <div class="card-body">
                                    <p>No API key required. Rate limited by IP address.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- REST API Section -->
                <section id="rest-api" class="mb-5">
                    <h2>REST API Endpoints</h2>

                    <!-- Papers List -->
                    <div class="card endpoint-card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Get Papers</h5>
                            <span class="method-badge method-get">GET</span>
                        </div>
                        <div class="card-body">
                            <p><strong>Endpoint:</strong> <code>/api/papers</code></p>
                            <p><strong>Description:</strong> Get list of papers with pagination and filtering</p>

                            <h6>Query Parameters:</h6>
                            <ul>
                                <li><code>page</code> (number) - Page number (default: 1)</li>
                                <li><code>limit</code> (number) - Results per page (default: 20, max: 100)</li>
                                <li><code>category</code> (string) - Filter by category</li>
                                <li><code>search</code> (string) - Search query</li>
                            </ul>

                            <div class="code-block">
curl "${origin}/api/papers?limit=10&category=machine_learning"
                            </div>
                        </div>
                    </div>

                    <!-- Search Papers -->
                    <div class="card endpoint-card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Search Papers</h5>
                            <span class="method-badge method-get">GET</span>
                        </div>
                        <div class="card-body">
                            <p><strong>Endpoint:</strong> <code>/api/search</code></p>
                            <p><strong>Description:</strong> Search papers with advanced filters</p>

                            <h6>Query Parameters:</h6>
                            <ul>
                                <li><code>q</code> (string, required) - Search query</li>
                                <li><code>category</code> (string) - Filter by category</li>
                                <li><code>limit</code> (number) - Max results (default: 20)</li>
                                <li><code>min_score</code> (number) - Minimum relevance score (1-10)</li>
                            </ul>

                            <div class="code-block">
curl "${origin}/api/search?q=transformer&limit=5&min_score=7"
                            </div>
                        </div>
                    </div>

                    <!-- Paper Details -->
                    <div class="card endpoint-card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Get Paper Details</h5>
                            <span class="method-badge method-get">GET</span>
                        </div>
                        <div class="card-body">
                            <p><strong>Endpoint:</strong> <code>/api/papers/:id</code></p>
                            <p><strong>Description:</strong> Get detailed information about a specific paper</p>

                            <div class="code-block">
curl "${origin}/api/papers/12345"
                            </div>
                        </div>
                    </div>

                    <!-- Categories -->
                    <div class="card endpoint-card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Get Categories</h5>
                            <span class="method-badge method-get">GET</span>
                        </div>
                        <div class="card-body">
                            <p><strong>Endpoint:</strong> <code>/api/categories</code></p>
                            <p><strong>Description:</strong> Get all available research categories</p>

                            <div class="code-block">
curl "${origin}/api/categories"
                            </div>
                        </div>
                    </div>

                    <!-- Archive Endpoints -->
                    <div class="card endpoint-card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Archive Search</h5>
                            <span class="method-badge method-get">GET</span>
                        </div>
                        <div class="card-body">
                            <p><strong>Endpoint:</strong> <code>/api/archive/search</code></p>
                            <p><strong>Description:</strong> Search historical paper archives</p>

                            <h6>Query Parameters:</h6>
                            <ul>
                                <li><code>query</code> (string) - Search query</li>
                                <li><code>start_date</code> (string) - Start date (YYYY-MM-DD)</li>
                                <li><code>end_date</code> (string) - End date (YYYY-MM-DD)</li>
                                <li><code>category</code> (string) - Filter by category</li>
                                <li><code>limit</code> (number) - Max results</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- MCP API Section -->
                <section id="mcp-api" class="mb-5">
                    <h2>Model Context Protocol (MCP)</h2>
                    <p>PaperDog implements the Model Context Protocol for AI agent integration.</p>

                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">MCP Endpoint</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Endpoint:</strong> <code>POST /mcp</code></p>
                            <p><strong>Protocol:</strong> JSON-RPC 2.0</p>
                            <p><strong>Content-Type:</strong> <code>application/json</code></p>
                        </div>
                    </div>

                    <h4 class="mt-4">Available MCP Tools</h4>

                    <!-- Search Papers Tool -->
                    <div class="card endpoint-card">
                        <div class="card-header">
                            <h5 class="mb-0">paperdog_search_papers</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Description:</strong> Search across arXiv and HuggingFace papers</p>

                            <h6>Parameters:</h6>
                            <div class="code-block">
{
  "query": "string (required)",
  "category": "string (optional)",
  "limit": "number (optional, default: 20, max: 100)",
  "min_score": "number (optional, range: 1-10)"
}
                            </div>

                            <h6>Example Request:</h6>
                            <div class="code-block">
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "paperdog_search_papers",
    "arguments": {
      "query": "computer vision",
      "category": "computer_vision",
      "limit": 10
    }
  }
}
                            </div>
                        </div>
                    </div>

                    <!-- Daily Papers Tool -->
                    <div class="card endpoint-card">
                        <div class="card-header">
                            <h5 class="mb-0">paperdog_get_daily_papers</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Description:</strong> Get curated daily papers with AI analysis</p>

                            <h6>Parameters:</h6>
                            <div class="code-block">
{
  "date": "string (optional, format: YYYY-MM-DD)",
  "category": "string (optional)"
}
                            </div>
                        </div>
                    </div>

                    <!-- Paper Details Tool -->
                    <div class="card endpoint-card">
                        <div class="card-header">
                            <h5 class="mb-0">paperdog_get_paper_details</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Description:</strong> Get detailed paper information including analysis</p>

                            <h6>Parameters:</h6>
                            <div class="code-block">
{
  "paper_id": "string (required)",
  "date": "string (optional, format: YYYY-MM-DD)",
  "include_analysis": "boolean (optional, default: true)"
}
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Examples Section -->
                <section id="examples" class="mb-5">
                    <h2>Code Examples</h2>

                    <!-- JavaScript Example -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">JavaScript (REST API)</h5>
                        </div>
                        <div class="card-body">
                            <div class="code-block">
// Search for papers
const response = await fetch('${origin}/api/search?q=transformer&limit=10');
const data = await response.json();

console.log('Found papers:', data.papers.length);
data.papers.forEach(paper => {
    console.log(paper.title, paper.authors);
});
                            </div>
                        </div>
                    </div>

                    <!-- Python Example -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Python (requests)</h5>
                        </div>
                        <div class="card-body">
                            <div class="code-block">
import requests

# Search papers
response = requests.get('${origin}/api/search', params={
    'q': 'machine learning',
    'limit': 10,
    'min_score': 7
})

data = response.json()
for paper in data['papers']:
    print(f"Title: {paper['title']}")
    print(f"Authors: {', '.join(paper['authors'])}")
    print("---")
                            </div>
                        </div>
                    </div>

                    <!-- MCP Example -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">MCP Client Example</h5>
                        </div>
                        <div class="card-body">
                            <div class="code-block">
// MCP request to search papers
const mcpRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "paperdog_search_papers",
        arguments: {
            query: "generative AI",
            limit: 5,
            min_score: 8
        }
    }
};

const response = await fetch('${origin}/mcp', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(mcpRequest)
});

const result = await response.json();
console.log('Search results:', result.result.content[0].text);
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Rate Limits Section -->
                <section id="rate-limits" class="mb-5">
                    <h2>Rate Limits</h2>

                    <div class="card">
                        <div class="card-body">
                            <p>PaperDog implements IP-based rate limiting to ensure fair usage:</p>

                            <ul>
                                <li><strong>REST API:</strong> 1000 requests per hour per IP</li>
                                <li><strong>MCP API:</strong> 100 requests per hour per IP</li>
                                <li><strong>Daily Limit:</strong> 10,000 requests per day per IP</li>
                            </ul>

                            <p>Rate limit headers are included in responses:</p>
                            <div class="code-block">
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        });
    </script>
</body>
</html>`;
}