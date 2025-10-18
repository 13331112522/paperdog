# PaperDog MCP Server

**Access thousands of AI research papers with intelligent analysis and translations via Model Context Protocol**

[![Smithery.ai](https://img.shields.io/badge/Available%20on-Smithery.ai-blue)](https://smithery.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Protocol](https://img.shields.io/badge/Protocol-MCP%201.0-green)](https://modelcontextprotocol.io)

## 🚀 Overview

PaperDog MCP Server provides AI agents with seamless access to a curated collection of AI research papers from arXiv and HuggingFace. Each paper comes with comprehensive AI-generated analysis, making it easy for AI assistants to understand and explain complex research.

## ✨ Key Features

- **🔍 Smart Paper Discovery** - Search across thousands of papers with advanced filtering
- **🧠 AI-Powered Analysis** - 5-part structured analysis for every paper
- **📅 Daily Curation** - Fresh papers delivered daily with relevance scoring
- **🗂️ Historical Archives** - Access to growing historical paper collection
- **🌍 Bilingual Support** - English papers with Chinese translation capabilities
- **⚡ Lightning Fast** - Sub-2 second average response times
- **🆓 Free Service** - No API keys required, rate-limited for fair usage

## 🛠️ Available MCP Tools

### 🔎 `paperdog_search_papers`
Search across arXiv and HuggingFace papers with advanced filtering options.

**Parameters:**
- `query` (required) - Search query string
- `category` (optional) - Filter by research category
- `limit` (optional) - Maximum results (default: 20, max: 100)
- `min_score` (optional) - Minimum relevance score (1-10)

**Example Use:**
> "Search for recent papers about transformer architectures"

### 📅 `paperdog_get_daily_papers`
Get today's curated papers with comprehensive AI analysis.

**Parameters:**
- `date` (optional) - Specific date in YYYY-MM-DD format
- `category` (optional) - Filter by research category

**Example Use:**
> "Show me today's top machine learning papers"

### 📄 `paperdog_get_paper_details`
Get detailed information about a specific paper including full analysis.

**Parameters:**
- `paper_id` (required) - Unique paper identifier
- `date` (optional) - Date for paper lookup
- `include_analysis` (optional) - Include AI analysis (default: true)

**Example Use:**
> "Get detailed analysis of paper about attention mechanisms"

### 🏷️ `paperdog_get_categories`
Get all available research categories and their statistics.

**Example Use:**
> "What research categories are available?"

### 📚 `paperdog_get_archive_papers`
Access historical paper archives with advanced search.

**Parameters:**
- `start_date` (optional) - Start date for historical search
- `end_date` (optional) - End date for historical search
- `category` (optional) - Filter by research category
- `limit` (optional) - Maximum results

**Example Use:**
> "Find computer vision papers from last month"

## 📊 Research Categories

PaperDog organizes papers into these AI research categories:
- **Computer Vision** - Image processing, object detection, segmentation
- **Machine Learning** - General ML, algorithms, optimization
- **Natural Language Processing** - Text analysis, language models
- **Reinforcement Learning** - Agent-based learning, game playing
- **Multimodal Learning** - Vision-language, cross-modal understanding
- **Generative Models** - GANs, VAEs, diffusion models
- **Diffusion Models** - Image generation, diffusion processes
- **Transformer Architectures** - Attention mechanisms, transformers
- **Optimization** - Training methods, gradient techniques
- **Robotics** - Embodied AI, robotic control
- **Ethics AI** - AI safety, bias, fairness
- **Datasets** - Data collections, benchmarks

## 🚀 Quick Start

### For Claude Desktop Users

1. Add PaperDog to your Claude MCP configuration:

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

2. Restart Claude Desktop
3. Start asking questions about research papers!

### For Custom MCP Clients

**Endpoint:** `https://paperdog.org/mcp`
**Protocol:** JSON-RPC 2.0
**Content-Type:** `application/json`

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "paperdog_search_papers",
    "arguments": {
      "query": "transformer architectures",
      "limit": 5,
      "min_score": 8
    }
  }
}
```

## 📈 AI Analysis Features

Every paper includes a comprehensive 5-part AI analysis:

1. **🚀 Introduction** - Hook and core idea
2. **🎯 Challenges** - Problems being solved
3. **✨ Innovations** - Novel solutions and techniques
4. **📊 Experiments** - Key results and breakthroughs
5. **🤔 Insights** - Future directions and applications

## 🌐 Data Sources

- **arXiv.org** - Open access preprint repository
- **HuggingFace.co** - Machine learning community papers
- **AI Analysis** - Powered by GPT-5-mini and Gemini-2.5-Flash-Lite
- **Translations** - DeepSeek V3.1 for Chinese translations

## 📋 Usage Limits

- **100 requests per hour** per IP address
- **1000 requests per day** per IP address
- **No authentication required**
- **Fair usage policy applies**

## 🔍 Discovery & Documentation

- **Service Discovery:** `https://paperdog.org/.well-known/mcp`
- **API Documentation:** `https://paperdog.org/api/docs`
- **Agent Guide:** `https://paperdog.org/for-ai-agents`
- **AI Agents Info:** `https://paperdog.org/ai-agents.txt`

## 📞 Support & Community

- **Website:** [https://paperdog.org](https://paperdog.org)
- **Documentation:** [https://paperdog.org/api/docs](https://paperdog.org/api/docs)
- **Agent Guide:** [https://paperdog.org/for-ai-agents](https://paperdog.org/for-ai-agents)
- **Support:** [https://paperdog.org/about](https://paperdog.org/about)

## 🏆 Use Cases

### For Research
- Stay updated with latest AI research breakthroughs
- Find papers relevant to your research interests
- Understand complex papers through AI analysis
- Track developments in specific research areas

### For Content Creation
- Generate accurate content about AI research
- Explain technical concepts with clear analysis
- Find examples and case studies for presentations
- Create educational materials about AI

### For Development
- Understand cutting-edge techniques for implementation
- Find inspiration for new AI projects
- Learn about state-of-the-art methods
- Stay current with AI trends

## 📜 License

PaperDog MCP Server is released under the [MIT License](https://opensource.org/licenses/MIT).

---

**Empowering AI agents with research knowledge** 🐕📚

Made with ❤️ by the PaperDog Team