# PaperDog - AI Papers Daily Blog

**PaperDog** is an automated AI research paper digest that daily collects the latest AI/ML papers from arXiv and HuggingFace, analyzes them with LLMs, and presents them with embedded paper figures and bilingual analysis.

## Features

### AI-Powered Analysis
- **Multi-model analysis** - GPT-5-mini primary + Gemini 2.5 Flash Lite fallback + GLM-4-air smart fallback
- **5-section deep analysis** - Introduction, Challenges, Innovations, Experiments, Insights (280 chars each)
- **11-category classification** - Automatic AI/ML domain categorization with keyword matching
- **Multi-factor scoring** - Recency 30%, Relevance 40%, Popularity 20%, Quality 10%
- **Balanced curation** - 5 from arXiv + 5 from HuggingFace, smart tie-breaking

### Paper Figure Embedding
- **arXiv HTML extraction** - Fetches arXiv HTML versions, extracts all `<img class="ltx_graphics">` figures with captions
- **Dual-column display** - Hero figure at top of AI analysis + additional figures in Experiments section
- **Graceful degradation** - `onerror` fallback removes broken figures silently for papers without HTML versions
- **Rate-limited fetching** - Circuit breaker protection, 1s delays between arXiv HTML requests

### Bilingual Support
- Full Chinese translation of abstracts, analysis, and UI elements
- Smart fallback when translations are missing
- Real-time language switching with state preservation

### Blog Integration
- **GitHub Pages source** - Articles fetched from `13331112522.github.io` with streaming image extraction
- **Pagination + search** - 6 articles per page, client-side search across titles/excerpts/tags
- **Featured images** - First figure from each article pre-fetched and cached in KV (24h TTL)
- **Batch image loading** - 4 concurrent image requests from `/api/blog/image/:slug` endpoint

### Archive & Export
- **Long-term storage** - Daily top papers automatically archived
- **Date-indexed browsing** - Browse historical papers by date
- **Multi-format export** - JSON, CSV, Markdown, BibTeX
- **Archive search** - Full-text search across historical archives

### MCP Protocol Support
- **5 tools** - search, daily papers, paper details, categories, archive
- **No API key required** - Rate limited by IP (100/hr, 1000/day)
- **Smart routing** - Automatic fallback to archive for historical dates

## Architecture

```
Cloudflare Workers (edge) + KV storage
  |
  +-- Scrape (arXiv API + HuggingFace) → extractPaperFigures() → AI Analyze → Cache
  |
  +-- SSR HTML (template literals, no framework)
  |     |-- dual-column-templates.js  (homepage)
  |     |-- blog-templates.js         (blog listing)
  |     +-- archive-templates.js      (archive pages)
  |
  +-- Blog (GitHub Pages → streaming fetch → KV cache)
```

**Update pipeline**: `scrapeDailyPapers()` → `extractPaperFigures()` → `analyzePapers()` → `cachePapers()` → `archivePapers()`

## Tech Stack

- **Runtime**: Cloudflare Workers (Wrangler)
- **Storage**: Cloudflare KV
- **AI**: OpenRouter (GPT-5-mini, Gemini 2.5 Flash) + GLM-4-air fallback
- **Sources**: arXiv API, HuggingFace daily_papers API
- **Frontend**: Bootstrap 5, Font Awesome, vanilla JS
- **Blog**: GitHub Pages static site with streaming HTML parsing

## Project Structure

```
worker-modules/
├── functions/
│   └── worker.js                    # Entry point, route dispatch
└── src/
    ├── config.js                    # Routes, constants, prompts
    ├── handlers.js                  # All route handlers, update pipeline
    ├── paper-scraper.js             # 3 scraping sources + extractPaperFigures()
    ├── paper-analyzer.js            # AI analysis with retry/backoff
    ├── paper-scoring.js             # Multi-factor scoring algorithm
    ├── dual-column-templates.js     # Homepage HTML + embedded client JS
    ├── blog-fetcher.js              # GitHub Pages blog + streaming image API
    ├── blog-templates.js            # Blog listing with pagination/search
    ├── templates.js                 # About, archive pages
    ├── archive-manager.js           # Long-term paper archival
    ├── archive-handlers.js          # Archive API endpoints
    ├── archive-templates.js         # Archive UI templates
    ├── mcp-server.js                # MCP protocol implementation
    ├── agent-pages.js               # AI agents discovery pages
    └── utils.js                     # fetchWithTimeout, sleep, caching
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Homepage with dual-column paper display |
| GET | `/blog` | Blog listing (paginated, searchable) |
| GET | `/blog/:slug` | Single blog article |
| GET | `/api/blog/image/:slug` | Blog article featured image |
| GET | `/api/papers/:date` | Papers for a specific date |
| POST | `/api/update` | Trigger paper update pipeline |
| GET | `/api/categories` | Available research categories |
| GET | `/api/search` | Search papers |
| GET | `/api/archive/:date` | Archived papers by date |
| GET | `/api/archive/export` | Export archives (JSON/CSV/MD/BibTeX) |
| POST | `/api/translate` | Translate paper content |
| POST | `/mcp` | MCP protocol endpoint |
| GET | `/feed` | RSS feed |

## Deployment

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build check (no deploy)
npx wrangler deploy --dry-run

# Deploy to Cloudflare
npx wrangler deploy
```

### Environment Variables

Configure in `wrangler.toml`:

```toml
[vars]
OPENROUTER_API_KEY = "sk-or-..."
GLM_API_KEY = "..."
GLM_BASE_URL = "https://open.bigmodel.cn/api/paas/v4/"
GLM_MODEL = "glm-4-air"
SITE_TITLE = "PaperDog - AI论文每日更新"
DOMAIN = "paperdog.org"
```

## Scheduled Updates

Configured via Cloudflare Cron Triggers to run daily at UTC 08:00 (Beijing 16:00).

The pipeline scrapes papers, extracts figures from arXiv HTML versions, runs AI analysis, caches results, and archives top papers.

## License

MIT
