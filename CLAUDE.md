# MCP Integration for PaperDog

This document explains how to use various MCP (Model Context Protocol) services with the PaperDog blog application for development, debugging, and research paper access.

## 🚀 PaperDog Research MCP Integration

The PaperDog MCP service provides access to thousands of AI research papers from arXiv and HuggingFace with comprehensive AI-generated analysis.

### Setup

The PaperDog MCP configuration has been added to `~/.claude/mcp_settings.json` with two servers:

1. **`paperdog`** - Enhanced direct connection to paperdog.org/mcp
2. **`paperdog-cli`** - Smart wrapper that fixes daily papers functionality

### Available PaperDog Tools

1. **`paperdog_search_papers`** - Search across arXiv and HuggingFace papers
   - Parameters: `query` (required), `category`, `limit`, `min_score`

2. **`paperdog_get_daily_papers`** - Get curated papers for specific dates ⭐ **Fixed**
   - Parameters: `date` (required), `category`
   - *Note: Automatically routes to archive when date is specified*

3. **`paperdog_get_paper_details`** - Get detailed analysis of specific papers
   - Parameters: `paper_id` (required), `date`, `include_analysis`

4. **`paperdog_get_categories`** - List all available research categories
   - Returns: 6 categories (computer_vision, generative_models, machine_learning, natural_language_processing, reinforcement_learning, robotics)

5. **`paperdog_get_archive_papers`** - Access historical paper archives
   - Parameters: `start_date`, `end_date`, `category`, `limit`

### Usage Examples

#### Search for Machine Learning Papers
```bash
# Ask Claude: "Search for recent transformer architecture papers"
# Claude will use: paperdog_search_papers with query="transformer architectures"
```

#### Get Papers from Specific Date
```bash
# Ask Claude: "Show me papers from October 18th"
# Claude will use: paperdog_get_daily_papers with date="2025-10-18"
```

#### Get Papers by Category
```bash
# Ask Claude: "Get today's computer vision papers"
# Claude will use: paperdog_get_daily_papers with category="computer_vision"
```

#### Detailed Paper Analysis
```bash
# Ask Claude: "Get detailed analysis of paper [paper_id]"
# Claude will use: paperdog_get_paper_details with paper_id="[id]"
```

### Paper Analysis Features

Every paper includes comprehensive 5-part AI analysis:
- **🚀 Introduction** - Hook and core idea
- **🎯 Challenges** - Problems being solved
- **✨ Innovations** - Novel solutions and techniques
- **📊 Experiments** - Key results and breakthroughs
- **🤔 Insights** - Future directions and applications

### Service Details

- **Rate Limit**: 100 requests/hour, 1000 requests/day per IP
- **No API Key Required**: Free service with fair usage policy
- **Data Sources**: arXiv.org and HuggingFace.co
- **AI Analysis**: Powered by GPT-5-mini and Gemini-2.5-Flash-Lite

## 🛠️ Chrome DevTools MCP Integration

Chrome DevTools MCP enables Claude to interact with browser DevTools for debugging the PaperDog web application.

### Setup

The Chrome DevTools MCP configuration is included in the global `~/.claude/mcp_settings.json`.

### Available Actions

1. **Launch** - Start Chrome DevTools for the application
2. **Inspect** - Inspect specific elements or pages
3. **Screenshot** - Take screenshots of the application
4. **Network** - Monitor network activity
5. **Console** - Access browser console for debugging

### Usage Examples

To use Chrome DevTools MCP with PaperDog:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Use Claude to launch Chrome DevTools:
   ```javascript
   mcp__chrome_devtools({action: "launch", url: "http://localhost:8787", device: "desktop"})
   ```

3. For mobile testing:
   ```javascript
   mcp__chrome_devtools({action: "launch", url: "http://localhost:8787", device: "mobile"})
   ```

### Debugging Workflow

1. Launch the application with `npm run dev`
2. Use Chrome DevTools MCP to inspect the UI and functionality
3. Monitor network requests for paper fetching
4. Check console logs for any errors
5. Take screenshots for documentation or issue reporting

## 📋 MCP Configuration Files

### Global Configuration
- **File**: `~/.claude/mcp_settings.json`
- **Contains**: Chrome DevTools + PaperDog MCP servers
- **Scope**: Available in all Claude Code sessions

### Project Configuration (Optional)
- **File**: `.claude/settings.local.json`
- **Contains**: Project-specific permissions and hooks
- **Scope**: Available only in this project

## 🔧 Technical Implementation

### PaperDog MCP Fix

The `paperdog-cli` server includes intelligent routing to fix API inconsistencies:
- **Problem**: `paperdog_get_daily_papers` fails for historical dates
- **Solution**: Automatically converts to `paperdog_get_archive_papers` with same date range
- **Result**: Seamless date-based paper access

### Environment Variables

The PaperDog MCP servers include helpful environment variables:
- `PAPERDOG_BASE_URL`: https://paperdog.org/mcp
- `PAPERDOG_TIMEOUT`: 30 seconds

## 🛡️ Permissions & Security

Both MCP tools are configured with appropriate permissions:
- **PaperDog MCP**: Network access to paperdog.org, no filesystem access
- **Chrome DevTools MCP**: Browser access, network monitoring, filesystem disabled for security

## 🚀 Getting Started

1. **Research Papers**: Simply ask Claude about papers, topics, or dates
2. **Web Development**: Use Chrome DevTools MCP for debugging the PaperDog app
3. **Integration**: Both services work together seamlessly in Claude Code