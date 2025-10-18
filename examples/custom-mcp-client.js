/**
 * Custom MCP Client Example for PaperDog
 *
 * This example demonstrates how to build a custom MCP client that can
 * communicate with PaperDog's MCP service for AI research paper discovery.
 */

class PaperDogMCPClient {
  constructor(baseURL = "https://paperdog.org/mcp") {
    this.baseURL = baseURL;
    this.requestId = 1;
  }

  /**
   * Send a JSON-RPC request to PaperDog MCP server
   */
  async request(method, params = {}) {
    const payload = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method,
      params
    };

    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`MCP Error: ${result.error.message} (Code: ${result.error.code})`);
      }

      return result.result;
    } catch (error) {
      console.error("MCP request failed:", error);
      throw error;
    }
  }

  /**
   * List all available tools
   */
  async listTools() {
    return await this.request("tools/list");
  }

  /**
   * Search for papers
   */
  async searchPapers(query, options = {}) {
    const params = {
      query,
      ...options
    };
    return await this.request("tools/call", {
      name: "paperdog_search_papers",
      arguments: params
    });
  }

  /**
   * Get daily papers
   */
  async getDailyPapers(options = {}) {
    return await this.request("tools/call", {
      name: "paperdog_get_daily_papers",
      arguments: options
    });
  }

  /**
   * Get paper details
   */
  async getPaperDetails(paperId, options = {}) {
    const params = {
      paper_id: paperId,
      ...options
    };
    return await this.request("tools/call", {
      name: "paperdog_get_paper_details",
      arguments: params
    });
  }

  /**
   * Get categories
   */
  async getCategories() {
    return await this.request("tools/call", {
      name: "paperdog_get_categories",
      arguments: {}
    });
  }

  /**
   * Get archive papers
   */
  async getArchivePapers(options = {}) {
    return await this.request("tools/call", {
      name: "paperdog_get_archive_papers",
      arguments: options
    });
  }
}

// Usage Examples

async function demonstratePaperDogMCP() {
  const client = new PaperDogMCPClient();

  try {
    console.log("🔍 Connecting to PaperDog MCP Service...\n");

    // 1. List available tools
    console.log("📋 Available Tools:");
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`  • ${tool.name}: ${tool.description}`);
    });
    console.log();

    // 2. Search for papers
    console.log("🔎 Searching for transformer papers...");
    const searchResults = await client.searchPapers("transformer architectures", {
      limit: 3,
      min_score: 7
    });

    const searchContent = JSON.parse(searchResults.content[0].text);
    if (searchContent.success) {
      console.log(`Found ${searchContent.total_found} papers. Showing top ${searchContent.papers.length}:\n`);

      searchContent.papers.forEach((paper, index) => {
        console.log(`${index + 1}. ${paper.title}`);
        console.log(`   Authors: ${paper.authors?.slice(0, 3).join(", ")}${paper.authors?.length > 3 ? "..." : ""}`);
        console.log(`   Score: ${paper.scoring?.total_score || paper.analysis?.relevance_score || "N/A"}`);
        console.log();
      });
    }

    // 3. Get today's papers
    console.log("📅 Getting today's curated papers...");
    const dailyPapers = await client.getDailyPapers();
    const dailyContent = JSON.parse(dailyPapers.content[0].text);

    if (dailyContent.success) {
      console.log(`Today's papers (${dailyContent.date}): ${dailyContent.papers.length} papers\n`);

      dailyContent.papers.slice(0, 2).forEach((paper, index) => {
        console.log(`${index + 1}. ${paper.title}`);
        if (paper.analysis?.introduction) {
          console.log(`   ${paper.analysis.introduction.slice(0, 150)}...`);
        }
        console.log();
      });
    }

    // 4. Get categories
    console.log("🏷️ Available Research Categories:");
    const categories = await client.getCategories();
    const categoriesContent = JSON.parse(categories.content[0].text);

    if (categoriesContent.success) {
      categoriesContent.categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
      });
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Research Workflow Example
async function researchWorkflow(topic, client) {
  console.log(`🔬 Research Workflow: ${topic}\n`);

  try {
    // Step 1: Search for papers on the topic
    console.log("Step 1: Searching for papers...");
    const searchResults = await client.searchPapers(topic, { limit: 5 });
    const searchContent = JSON.parse(searchResults.content[0].text);

    if (!searchContent.success || searchContent.papers.length === 0) {
      console.log("No papers found for this topic.");
      return;
    }

    console.log(`Found ${searchContent.papers.length} relevant papers\n`);

    // Step 2: Get detailed analysis for top papers
    console.log("Step 2: Analyzing top papers...");
    for (let i = 0; i < Math.min(2, searchContent.papers.length); i++) {
      const paper = searchContent.papers[i];
      console.log(`\n📄 Paper ${i + 1}: ${paper.title}`);

      const details = await client.getPaperDetails(paper.id);
      const detailsContent = JSON.parse(details.content[0].text);

      if (detailsContent.success && detailsContent.paper.analysis) {
        const analysis = detailsContent.paper.analysis;
        console.log(`🚀 Introduction: ${analysis.introduction}`);
        console.log(`✨ Innovations: ${analysis.innovations}`);
        console.log(`📊 Key Results: ${analysis.experiments}`);
      }
    }

    // Step 3: Get related papers from archives
    console.log("\nStep 3: Finding related historical papers...");
    const archiveResults = await client.getArchivePapers({
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
      category: searchContent.papers[0]?.category,
      limit: 3
    });

    const archiveContent = JSON.parse(archiveResults.content[0].text);
    if (archiveContent.success) {
      console.log(`Found ${archiveContent.papers.length} related papers from archives`);
    }

  } catch (error) {
    console.error("Research workflow error:", error.message);
  }
}

// Example usage
if (require.main === module) {
  console.log("🐕 PaperDog MCP Client Examples\n");

  // Basic demonstration
  demonstratePaperDogMCP().then(() => {
    console.log("\n" + "=".repeat(50) + "\n");

    // Research workflow example
    const client = new PaperDogMCPClient();
    return researchWorkflow("diffusion models", client);
  }).catch(console.error);
}

module.exports = { PaperDogMCPClient, researchWorkflow, demonstratePaperDogMCP };