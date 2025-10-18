/**
 * PaperDog MCP Integration Example for Claude Desktop
 *
 * This example shows how to configure Claude Desktop to use PaperDog's MCP service
 * for AI research paper discovery and analysis.
 */

// Claude Desktop Configuration File
// Location: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
// or: %APPDATA%\Claude\claude_desktop_config.json (Windows)

const claudeConfig = {
  mcpServers: {
    paperdog: {
      command: "curl",
      args: [
        "-X", "POST",
        "https://paperdog.org/mcp",
        "-H", "Content-Type: application/json",
        "-d", "@-"
      ],
      env: {
        "NODE_ENV": "production"
      }
    }
  }
};

// Example usage prompts for Claude:

const examplePrompts = [
  // Search for papers
  "Search for recent papers about transformer architectures in computer vision",

  // Get daily papers
  "Show me today's top papers about natural language processing",

  // Analyze specific topics
  "Find papers about diffusion models and analyze their key innovations",

  // Research assistance
  "I'm researching reinforcement learning for robotics. Can you find relevant papers and explain the main approaches?",

  // Comparison analysis
  "Compare the latest GAN architectures by searching for recent papers",

  // Historical research
  "Find papers from last month about large language model optimization",

  // Category exploration
  "What categories of research are available? Show me some papers from ethics AI"
];

// Example Claude conversation flow:
/*
User: "I'm working on a computer vision project. Can you help me find recent papers about object detection?"

Claude: [Uses paperdog_search_papers tool with query="object detection", category="computer_vision"]

Claude: "I found several relevant papers for you. Here are the top 5 recent papers on object detection:

1. **[Paper Title]** - [Authors]
   [AI-generated analysis including challenges, innovations, and experimental results]

2. **[Paper Title]** - [Authors]
   [Detailed analysis...]

Would you like me to get more detailed information about any of these papers, or search for a specific aspect of object detection?"

User: "Get detailed analysis of the first paper"

Claude: [Uses paperdog_get_paper_details tool with the paper ID]

Claude: "Here's the detailed analysis of that paper: [Comprehensive 5-part analysis with introduction, challenges, innovations, experiments, and insights]"
*/

console.log("PaperDog MCP Integration for Claude");
console.log("=====================================");
console.log("1. Add the configuration to your Claude Desktop config file");
console.log("2. Restart Claude Desktop");
console.log("3. Start asking questions about AI research papers!");
console.log("\nExample prompts:");
examplePrompts.forEach((prompt, index) => {
  console.log(`${index + 1}. "${prompt}"`);
});