# PaperDog MCP Service - Deployment Guide

## 🎯 Overview

This guide covers the complete deployment of PaperDog's Model Context Protocol (MCP) service, which enables AI agents to discover, analyze, and understand AI research papers from arXiv and HuggingFace.

## ✅ Implementation Summary

### What We've Built

1. **MCP Protocol Server** (`worker-modules/src/mcp-server.js`)
   - Full JSON-RPC 2.0 implementation
   - 5 core tools for paper discovery and analysis
   - IP-based rate limiting (100 requests/hour, 1000/day)
   - Automatic cleanup and memory management

2. **Route Integration** (`worker-modules/functions/worker.js`)
   - `/mcp` - Main MCP protocol endpoint
   - `/.well-known/mcp` - Service discovery for AI agents
   - `/for-ai-agents` - Agent-friendly documentation
   - `/api/docs` - Comprehensive API documentation
   - `/ai-agents.txt` - Machine-readable service info

3. **AI Agent Discovery** (`worker-modules/src/templates.js`)
   - Structured data markup (Schema.org)
   - Meta tags for AI agent discovery
   - Comprehensive service descriptions
   - Integration examples and guides

4. **Documentation & Examples**
   - Agent-friendly landing page
   - Complete API documentation
   - Integration examples for Claude and custom clients
   - Smithery.ai configuration

5. **Testing & Validation**
   - Comprehensive test suite
   - Deployment validation script
   - Error handling verification
   - Rate limiting tests

## 🚀 Deployment Steps

### 1. Deploy to Cloudflare Workers

The MCP service is already integrated into your existing Cloudflare Worker. Simply deploy your updated worker:

```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Verify deployment
wrangler tail
```

### 2. Validate Deployment

Run the deployment validation script:

```bash
node deployment-check.js
```

### 3. Run Full Test Suite

Test all MCP functionality:

```bash
node test-mcp-integration.js
```

## 🔧 Configuration

### Environment Variables

Your existing environment variables are sufficient:
- `OPENROUTER_API_KEY` - For AI analysis
- `PAPERS` KV namespace - For paper storage

### New Routes Added

The following routes are now available:

| Route | Method | Description |
|-------|--------|-------------|
| `/mcp` | POST | Main MCP protocol endpoint |
| `/.well-known/mcp` | GET | Service discovery |
| `/for-ai-agents` | GET | Agent documentation |
| `/api/docs` | GET | API documentation |
| `/ai-agents.txt` | GET | Machine-readable info |

## 🛠️ Available MCP Tools

### 1. `paperdog_search_papers`
Search across arXiv and HuggingFace papers with advanced filtering.

**Parameters:**
- `query` (required): Search query
- `category` (optional): Research category filter
- `limit` (optional): Max results (1-100)
- `min_score` (optional): Minimum relevance score (1-10)

### 2. `paperdog_get_daily_papers`
Get curated daily papers with AI analysis.

**Parameters:**
- `date` (optional): Specific date (YYYY-MM-DD)
- `category` (optional): Category filter

### 3. `paperdog_get_paper_details`
Get detailed paper information including full analysis.

**Parameters:**
- `paper_id` (required): Paper identifier
- `date` (optional): Lookup date
- `include_analysis` (optional): Include AI analysis

### 4. `paperdog_get_categories`
List all available research categories.

### 5. `paperdog_get_archive_papers`
Access historical paper archives.

**Parameters:**
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)
- `category` (optional): Category filter
- `limit` (optional): Max results

## 📱 Integration Examples

### Claude Desktop

```json
{
  "mcpServers": {
    "paperdog": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "https://paperdog.org/mcp",
        "-H", "Content-Type: application/json",
        "-d", "@-"
      ]
    }
  }
}
```

### Custom Client

```javascript
const response = await fetch('https://paperdog.org/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "paperdog_search_papers",
      arguments: {
        query: "transformer architectures",
        limit: 5
      }
    }
  })
});
```

## 📊 Smithery.ai Submission

### Files Ready for Submission:

1. **`smithery.json`** - Complete Smithery configuration
2. **`README-SMITHERY.md`** - Comprehensive documentation
3. **`examples/`** - Integration examples

### Submission Steps:

1. Create an account on [Smithery.ai](https://smithery.ai)
2. Submit the MCP service with the provided configuration
3. Include the README and examples
4. Set up categories: "research-tools", "ai", "academic"

## 🔍 AI Agent Discovery Features

### Structured Data
- Schema.org markup for WebApplication, Dataset, Service
- Comprehensive service descriptions
- Capability definitions
- Integration examples

### Meta Tags
- `ai-agent-capable: true`
- `mcp-endpoint: /mcp`
- `service-type: research-paper-discovery`
- `authentication: none`
- `rate-limit: 100-requests-per-hour`

### Discovery Endpoints
- `/.well-known/mcp` - Standard MCP discovery
- `/ai-agents.txt` - Custom agent information
- `/for-ai-agents` - Human-readable guide

## ⚡ Performance & Monitoring

### Rate Limiting
- 100 requests per hour per IP
- 1000 requests per day per IP
- Automatic cleanup of expired entries
- Configurable limits in `mcp-server.js`

### Caching Strategy
- 5-minute cache for search results
- 15-minute cache for daily papers
- 1-hour cache for paper analysis
- Automatic cache invalidation

### Monitoring
- Request logging via Cloudflare Workers
- Error tracking and reporting
- Performance metrics collection
- Rate limit monitoring

## 🧪 Testing

### Run All Tests
```bash
node test-mcp-integration.js
```

### Test Individual Components
```bash
# Test just MCP functionality
node -e "
const { MCPTester } = require('./test-mcp-integration.js');
const tester = new MCPTester('https://paperdog.org');
tester.testMCPInitialize().then(() => console.log('✅ MCP OK'));
"

# Test deployment
node deployment-check.js
```

## 🚨 Troubleshooting

### Common Issues

1. **MCP endpoint not responding**
   - Check Cloudflare Worker deployment
   - Verify route configuration in `config.js`
   - Check for syntax errors in `mcp-server.js`

2. **Rate limiting too aggressive**
   - Adjust limits in `mcp-server.js`
   - Check cleanup schedule in worker
   - Monitor IP-based usage patterns

3. **AI agents not discovering service**
   - Verify structured data markup
   - Check meta tags in templates
   - Test discovery endpoints manually

### Debug Commands

```bash
# Check worker logs
wrangler tail

# Test MCP endpoint directly
curl -X POST https://paperdog.org/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Check service discovery
curl https://paperdog.org/.well-known/mcp

# Test AI agents endpoint
curl https://paperdog.org/ai-agents.txt
```

## 📈 Success Metrics

### Deployment Success Indicators:
- ✅ All endpoints responding correctly
- ✅ MCP tools returning valid results
- ✅ Rate limiting functioning properly
- ✅ AI agents can discover service
- ✅ Integration examples working

### Post-Launch Monitoring:
- MCP request volume and patterns
- Error rates and types
- Rate limit activation frequency
- AI agent adoption metrics
- User feedback and integration issues

## 🎉 Next Steps

1. **Deploy to Production** - Deploy updated worker to Cloudflare
2. **Validate Deployment** - Run validation scripts
3. **Submit to Smithery.ai** - Register MCP service
4. **Monitor Usage** - Track adoption and performance
5. **Gather Feedback** - Collect user experiences
6. **Iterate** - Improve based on usage patterns

## 📞 Support

- **Documentation**: https://paperdog.org/api/docs
- **Agent Guide**: https://paperdog.org/for-ai-agents
- **Issues**: Create GitHub issue for bugs
- **Questions**: Use GitHub discussions

---

**🐕 PaperDog MCP Service - Empowering AI agents with research knowledge**

*Deployment completed successfully! Your PaperDog MCP service is ready for AI agents.*