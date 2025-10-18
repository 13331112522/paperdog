#!/usr/bin/env node

/**
 * Interactive MCP Testing
 * Run this and it will prompt you to test different functions
 */

const readline = require('readline');
const baseURL = "http://localhost:8787";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testMCPEndpoint(method, params = {}) {
  try {
    const response = await fetch(`${baseURL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params
      })
    });

    const data = await response.json();
    console.log("✅ Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function testWebEndpoint(endpoint) {
  try {
    const response = await fetch(`${baseURL}${endpoint}`);
    const contentType = response.headers.get('content-type');

    if (contentType.includes('application/json')) {
      const data = await response.json();
      console.log("✅ Response:", JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log("✅ Response (first 500 chars):", text.substring(0, 500) + "...");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

function showMenu() {
  console.log("\n🧪 PaperDog MCP Testing Menu");
  console.log("==============================");
  console.log("1. Test MCP Discovery");
  console.log("2. Test MCP Initialization");
  console.log("3. List Available Tools");
  console.log("4. Search Papers");
  console.log("5. Get Categories");
  console.log("6. Get Daily Papers");
  console.log("7. Test Main Website");
  console.log("8. Test Agent Documentation");
  console.log("9. Test REST API");
  console.log("0. Exit");
  console.log("==============================");
}

async function main() {
  console.log("🚀 Welcome to PaperDog MCP Interactive Testing!");
  console.log("Make sure your wrangler dev server is running on localhost:8787\n");

  while (true) {
    showMenu();

    const choice = await new Promise(resolve => {
      rl.question("Choose an option (0-9): ", resolve);
    });

    switch (choice) {
      case '1':
        console.log("\n📍 Testing MCP Discovery...");
        await testWebEndpoint("/.well-known/mcp");
        break;

      case '2':
        console.log("\n🔧 Testing MCP Initialization...");
        await testMCPEndpoint("initialize", {
          protocolVersion: "2024-11-05",
          capabilities: {}
        });
        break;

      case '3':
        console.log("\n📋 Listing Available Tools...");
        await testMCPEndpoint("tools/list");
        break;

      case '4':
        const query = await new Promise(resolve => {
          rl.question("Enter search query (default: machine learning): ", resolve);
        });
        console.log("\n🔍 Searching Papers...");
        await testMCPEndpoint("tools/call", {
          name: "paperdog_search_papers",
          arguments: {
            query: query || "machine learning",
            limit: 5
          }
        });
        break;

      case '5':
        console.log("\n🏷️ Getting Categories...");
        await testMCPEndpoint("tools/call", {
          name: "paperdog_get_categories",
          arguments: {}
        });
        break;

      case '6':
        console.log("\n📅 Getting Daily Papers...");
        await testMCPEndpoint("tools/call", {
          name: "paperdog_get_daily_papers",
          arguments: {}
        });
        break;

      case '7':
        console.log("\n🌐 Testing Main Website...");
        await testWebEndpoint("/");
        break;

      case '8':
        console.log("\n📖 Testing Agent Documentation...");
        await testWebEndpoint("/for-ai-agents");
        break;

      case '9':
        console.log("\n🔌 Testing REST API...");
        await testWebEndpoint("/api/categories");
        break;

      case '0':
        console.log("\n👋 Goodbye!");
        rl.close();
        return;

      default:
        console.log("\n❌ Invalid choice. Please try again.");
    }

    // Wait for user to continue
    await new Promise(resolve => {
      rl.question("\nPress Enter to continue...", resolve);
    });
  }
}

// Handle Ctrl+C
rl.on('close', () => {
  console.log('\n👋 Testing session ended.');
  process.exit(0);
});

// Start the interactive test
main().catch(error => {
  console.error("❌ Testing failed:", error);
  rl.close();
});