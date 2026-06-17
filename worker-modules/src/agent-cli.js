// Agent CLI module — llms.txt, agent manifest, markdown formatters
// All agent-facing content generation for PaperDog

export function getLlmsTxt(origin) {
  return `# PaperDog
> AI research paper discovery and analysis. Daily curated papers from arXiv and HuggingFace with 5-part AI analysis, 12 categories, multi-factor scoring.

## Endpoints
- [List papers](${origin}/api/papers) - pagination, category filter, search
- [Papers by date](${origin}/api/papers/:date) - YYYY-MM-DD format
- [Paper details](${origin}/api/papers/:id) - full metadata + AI analysis
- [Search](${origin}/api/search?q=...) - full-text search across papers
- [Categories](${origin}/api/categories) - 12 research categories
- [Archive dates](${origin}/api/archive/dates) - available archive dates
- [Archive by date](${origin}/api/archive/:date) - historical papers
- [Archive range](${origin}/api/archive/range?start_date=&end_date=) - date range query
- [Archive search](${origin}/api/archive/search?q=...) - search historical archives
- [Archive statistics](${origin}/api/archive/statistics) - archive stats
- [Export](${origin}/api/archive/export?format=json|csv|markdown|bibtex) - bulk data export
- [MCP](${origin}/mcp) - JSON-RPC 2.0 endpoint, 5 tools
- [RSS](${origin}/feed) - RSS feed

## Agent Entrance
- [${origin}/agent](${origin}/agent) - JSON capability manifest (machine-readable)

## CLI Mode
Append \`?format=text\` to any \`/api/*\` endpoint for markdown output instead of JSON.
Or send \`Accept: text/plain\` header.

Example: \`curl ${origin}/api/papers?format=text\`

## Optional details
See [${origin}/llms-full.txt](${origin}/llms-full.txt) for complete documentation.
`;
}

export function getLlmsFullTxt(origin) {
  return `# PaperDog — Full Agent Documentation

> AI research paper discovery and analysis service. Daily curated papers from arXiv and HuggingFace with 5-part AI analysis (Introduction, Challenges, Innovations, Experiments, Insights). 12-category classification, multi-factor scoring (Recency 30%, Relevance 40%, Popularity 20%, Quality 10%).

---

## Quick Start

\`\`\`bash
# Get today's papers (JSON)
curl ${origin}/api/papers

# Get today's papers (markdown)
curl "${origin}/api/papers?format=text"

# Search for transformer papers
curl "${origin}/api/search?q=transformer&format=text"

# Get agent manifest
curl ${origin}/agent

# MCP protocol
curl -X POST ${origin}/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
\`\`\`

---

## REST API Reference

### GET /api/papers
List papers with pagination and filtering.

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 10 | Papers per page (max 100) |
| category | string | - | Filter by category |
| search | string | - | Search in titles/abstracts |
| date | string | - | Filter by date (YYYY-MM-DD) |

**Response:** \`{ papers: [...], pagination: {page, limit, total}, filters: {...} }\`

### GET /api/papers/:date
Papers for a specific date.

**Parameters:** date in URL (YYYY-MM-DD)

**Response:** \`{ date, papers: [...], total_papers }\`

### GET /api/papers/:id
Detailed information about a single paper including AI analysis.

**Response:** Paper object with title, abstract, authors, arxiv_id, score, category, ai_analysis, images, figures, etc.

### GET /api/search
Full-text search across papers.

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | required | Search query (min 2 chars) |
| category | string | - | Filter by category |
| limit | int | 20 | Max results |

**Response:** \`{ query, results: [...], total_results, filters }\`

### GET /api/categories
List all available research categories.

**Response:** \`{ categories: [...], total_categories }\`

### GET /api/archive/dates
List all dates with archived papers.

**Response:** \`{ dates: [...], total_dates }\`

### GET /api/archive/:date
Get archived papers for a specific date.

**Response:** \`{ date, papers: [...], count }\`

### GET /api/archive/range
Query papers within a date range.

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | string | required | Start date (YYYY-MM-DD) |
| end_date | string | required | End date (YYYY-MM-DD) |
| category | string | - | Filter by category |
| min_score | float | - | Minimum score filter |
| max_score | float | - | Maximum score filter |

### GET /api/archive/search
Search historical archives.

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | required | Search query (min 2 chars) |
| start_date | string | - | Start date |
| end_date | string | - | End date |
| category | string | - | Filter by category |
| min_score | float | - | Minimum score |
| max_results | int | 50 | Max results |

### GET /api/archive/statistics
Archive statistics.

### GET /api/archive/export
Export archive data.

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| format | string | json | Output format: json, csv, markdown, bibtex |
| start_date | string | - | Start date |
| end_date | string | - | End date |
| category | string | - | Filter by category |
| include_abstracts | bool | true | Include abstracts |
| include_analysis | bool | true | Include AI analysis |

### GET /feed
RSS feed of recent papers.

---

## MCP API Reference

**Endpoint:** \`POST ${origin}/mcp\`
**Protocol:** JSON-RPC 2.0
**Content-Type:** application/json

### Methods
- \`initialize\` - Initialize MCP session
- \`tools/list\` - List available tools
- \`tools/call\` - Execute a tool

### Tools

#### paperdog_search_papers
Search across arXiv and HuggingFace papers.
- **Required:** \`query\` (string, 2-500 chars)
- **Optional:** \`category\`, \`limit\` (1-100, default 20), \`min_score\` (1-10)

#### paperdog_get_daily_papers
Get curated papers for a specific date.
- **Optional:** \`date\` (YYYY-MM-DD, defaults to today), \`category\`

#### paperdog_get_paper_details
Get detailed analysis of a specific paper.
- **Required:** \`paper_id\` (string)
- **Optional:** \`date\`, \`include_analysis\` (bool, default true)

#### paperdog_get_categories
List all available research categories.
- No parameters required.

#### paperdog_get_archive_papers
Access historical paper archives.
- **Optional:** \`start_date\`, \`end_date\`, \`category\`, \`limit\` (1-100, default 20)

### Example MCP Request
\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "paperdog_search_papers",
    "arguments": { "query": "transformer", "limit": 5 }
  }
}
\`\`\`

---

## Categories

| ID | Name |
|----|------|
| computer_vision | Computer Vision |
| machine_learning | Machine Learning |
| natural_language_processing | NLP |
| reinforcement_learning | Reinforcement Learning |
| multimodal_learning | Multimodal Learning |
| generative_models | Generative Models |
| diffusion_models | Diffusion Models |
| transformer_architectures | Transformer Architectures |
| optimization | Optimization |
| robotics | Robotics |
| ethics_ai | AI Ethics |
| datasets | Datasets |

---

## Rate Limits
- MCP: 100 requests/hour, 1000 requests/day per IP
- REST API: No rate limits (fair use)
- Update trigger: 1 request per 5 minutes per IP

## Error Format
All errors return: \`{ "error": "<message>" }\` with appropriate HTTP status code.

## Discovery
- [llms.txt](${origin}/llms.txt) - Brief summary (this file)
- [llms-full.txt](${origin}/llms-full.txt) - Full documentation (you are here)
- [Agent manifest](${origin}/agent) - JSON capability manifest
- [MCP discovery](${origin}/.well-known/mcp) - JSON MCP discovery
- [API docs](${origin}/api/docs) - HTML API documentation
- [AI agents guide](${origin}/for-ai-agents) - HTML integration guide
- [ai-agents.txt](${origin}/ai-agents.txt) - Plain text discovery
`;
}

export function getAgentManifest(origin) {
  return {
    service: 'PaperDog',
    version: '1.0.0',
    description: 'AI research paper discovery and analysis service',
    origin,
    formats: ['json', 'markdown', 'text'],
    content_negotiation: {
      accept_header: 'Send Accept: text/plain or Accept: text/markdown on any /api/* endpoint to get markdown instead of JSON',
      query_param: 'Send ?format=text on any /api/* endpoint to get markdown tables instead of JSON'
    },
    endpoints: {
      rest: [
        { method: 'GET', path: '/api/papers', description: 'List papers with pagination', params: ['page', 'limit', 'category', 'search', 'date'] },
        { method: 'GET', path: '/api/papers/:date', description: 'Papers for a specific date', params: [] },
        { method: 'GET', path: '/api/papers/:id', description: 'Paper details with AI analysis', params: [] },
        { method: 'GET', path: '/api/search', description: 'Search papers', params: ['q', 'category', 'limit'] },
        { method: 'GET', path: '/api/categories', description: 'Available research categories', params: [] },
        { method: 'GET', path: '/api/archive/dates', description: 'Available archive dates', params: [] },
        { method: 'GET', path: '/api/archive/:date', description: 'Archived papers by date', params: [] },
        { method: 'GET', path: '/api/archive/range', description: 'Papers within date range', params: ['start_date', 'end_date', 'category', 'min_score', 'max_score'] },
        { method: 'GET', path: '/api/archive/search', description: 'Search historical archives', params: ['q', 'start_date', 'end_date', 'category'] },
        { method: 'GET', path: '/api/archive/statistics', description: 'Archive statistics', params: [] },
        { method: 'GET', path: '/api/archive/export', description: 'Export archive data', params: ['format', 'start_date', 'end_date', 'category'] },
        { method: 'GET', path: '/feed', description: 'RSS feed', params: [] },
      ],
      mcp: {
        endpoint: '/mcp',
        protocol: 'JSON-RPC 2.0',
        methods: ['initialize', 'tools/list', 'tools/call'],
        tools: [
          { name: 'paperdog_search_papers', description: 'Search papers across arXiv and HuggingFace', required: ['query'] },
          { name: 'paperdog_get_daily_papers', description: 'Get curated papers for a date', required: [] },
          { name: 'paperdog_get_paper_details', description: 'Get paper details with AI analysis', required: ['paper_id'] },
          { name: 'paperdog_get_categories', description: 'List research categories', required: [] },
          { name: 'paperdog_get_archive_papers', description: 'Access historical archives', required: [] },
        ]
      }
    },
    discovery: {
      llms_txt: '/llms.txt',
      llms_full_txt: '/llms-full.txt',
      agent_manifest: '/agent',
      mcp_discovery: '/.well-known/mcp',
      api_docs: '/api/docs',
      ai_agents_guide: '/for-ai-agents',
      ai_agents_txt: '/ai-agents.txt',
      sitemap: '/sitemap.xml'
    },
    categories: [
      'computer_vision', 'machine_learning', 'natural_language_processing',
      'reinforcement_learning', 'multimodal_learning', 'generative_models',
      'diffusion_models', 'transformer_architectures', 'optimization',
      'robotics', 'ethics_ai', 'datasets'
    ],
    rate_limits: { mcp_per_hour: 100, mcp_per_day: 1000 },
    authentication: 'none'
  };
}

// --- Markdown formatters ---

export function papersToMarkdown(papers) {
  if (!papers || !papers.length) return 'No papers found.\n';
  let md = `| # | Score | Title | Category | Date |\n|---|-------|-------|----------|------|\n`;
  papers.forEach((p, i) => {
    const score = p.score || p.relevance_score || 'N/A';
    const title = (p.title || 'Untitled').substring(0, 70);
    const cat = (p.category || 'N/A').replace(/_/g, ' ');
    const date = p.published_date || p.date || 'N/A';
    md += `| ${i + 1} | ${score} | ${title} | ${cat} | ${date} |\n`;
  });
  return md;
}

export function paperToMarkdown(paper) {
  if (!paper) return 'Paper not found.\n';
  let md = `## ${paper.title || 'Untitled'}\n\n`;
  md += `- **ID:** ${paper.id || paper.arxiv_id || 'N/A'}\n`;
  md += `- **Score:** ${paper.score || paper.relevance_score || 'N/A'}\n`;
  md += `- **Category:** ${(paper.category || 'N/A').replace(/_/g, ' ')}\n`;
  md += `- **Date:** ${paper.published_date || paper.date || 'N/A'}\n`;
  if (paper.authors && paper.authors.length) {
    md += `- **Authors:** ${paper.authors.slice(0, 5).join(', ')}${paper.authors.length > 5 ? ' et al.' : ''}\n`;
  }
  if (paper.arxiv_id) {
    md += `- **arXiv:** https://arxiv.org/abs/${paper.arxiv_id}\n`;
  }
  md += '\n';
  if (paper.abstract) {
    md += `### Abstract\n\n> ${paper.abstract}\n\n`;
  }
  const analysis = paper.ai_analysis;
  if (analysis) {
    const sections = [
      ['Introduction', analysis.introduction],
      ['Challenges', analysis.challenges],
      ['Innovations', analysis.innovations],
      ['Experiments', analysis.experiments],
      ['Insights', analysis.insights],
    ];
    for (const [label, text] of sections) {
      if (text) {
        md += `### ${label}\n\n${text}\n\n`;
      }
    }
  }
  return md;
}

export function categoriesToMarkdown(data) {
  if (!data) return 'No categories available.\n';
  const cats = data.categories || data;
  if (!Array.isArray(cats)) return 'No categories available.\n';
  let md = `## Research Categories\n\n`;
  cats.forEach((c, i) => {
    const name = typeof c === 'string' ? c : (c.name || c.id || 'Unknown');
    const count = (typeof c === 'object' && c.count) ? ` (${c.count} papers)` : '';
    md += `${i + 1}. **${name.replace(/_/g, ' ')}**${count}\n`;
  });
  md += `\nTotal: ${cats.length} categories\n`;
  return md;
}

export function searchToMarkdown(data) {
  if (!data) return 'No results.\n';
  const query = data.query || '';
  const results = data.results || [];
  const total = data.total_results || results.length;
  let md = `## Search: "${query}"\n\n`;
  md += `Found ${total} results.\n\n`;
  if (results.length) {
    md += papersToMarkdown(results);
  } else {
    md += 'No results found.\n';
  }
  return md;
}

// Maps handler names to markdown formatters
const HANDLER_FORMATTERS = {
  handlePapersList: (data) => {
    const papers = data.papers || [];
    let md = `## Papers (page ${data.pagination?.page || 1})\n\n`;
    md += `Total: ${data.pagination?.total || papers.length}\n\n`;
    md += papersToMarkdown(papers);
    return md;
  },
  handlePapersByDate: (data) => {
    const papers = data.papers || [];
    let md = `## Papers for ${data.date || 'today'}\n\n`;
    md += `Total: ${data.total_papers || papers.length}\n\n`;
    md += papersToMarkdown(papers);
    return md;
  },
  handlePaperById: (data) => paperToMarkdown(data),
  handleCategories: (data) => categoriesToMarkdown(data),
  handleSearch: (data) => searchToMarkdown(data),
  handleArchiveDates: (data) => {
    const dates = data.dates || [];
    let md = `## Archive Dates\n\n`;
    md += `Total: ${data.total_dates || dates.length}\n\n`;
    dates.forEach((d, i) => { md += `${i + 1}. ${d}\n`; });
    return md;
  },
  handleArchiveByDate: (data) => {
    const papers = data.papers || [];
    let md = `## Archive: ${data.date || 'unknown'}\n\n`;
    md += `Count: ${data.count || papers.length}\n\n`;
    md += papersToMarkdown(papers);
    return md;
  },
  handleArchiveRange: (data) => {
    const papers = data.papers || [];
    let md = `## Archive Range\n\n`;
    md += `Found ${data.total || papers.length} papers.\n\n`;
    md += papersToMarkdown(papers);
    return md;
  },
  handleArchiveSearch: (data) => searchToMarkdown(data),
  handleArchiveStatistics: (data) => {
    let md = `## Archive Statistics\n\n`;
    if (typeof data === 'object') {
      for (const [key, val] of Object.entries(data)) {
        md += `- **${key}:** ${typeof val === 'object' ? JSON.stringify(val) : val}\n`;
      }
    }
    return md;
  },
  handleExportFormats: (data) => {
    let md = `## Export Formats\n\n`;
    const formats = data.formats || data;
    if (Array.isArray(formats)) {
      formats.forEach(f => { md += `- **${f}**\n`; });
    }
    return md;
  },
};

export function formatAsMarkdown(data, handlerName) {
  const formatter = HANDLER_FORMATTERS[handlerName];
  if (formatter) return formatter(data);
  // Fallback: dump as readable text
  let md = `## ${handlerName}\n\n`;
  if (typeof data === 'object' && data !== null) {
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'object' && val !== null) {
        md += `- **${key}:** ${JSON.stringify(val).substring(0, 200)}\n`;
      } else {
        md += `- **${key}:** ${val}\n`;
      }
    }
  }
  return md;
}
