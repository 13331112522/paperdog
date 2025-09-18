#!/bin/bash

# PaperDog Deployment Script
# 部署PaperDog到Cloudflare Workers

set -e

echo "🚀 Starting PaperDog deployment..."

# 检查必要的工具
command -v wrangler >/dev/null 2>&1 || { echo "❌ Wrangler CLI is required but not installed. Aborting." >&2; exit 1; }

# 检查是否已登录
if ! wrangler whoami &>/dev/null; then
    echo "🔐 Please login to Cloudflare..."
    wrangler login
fi

# 进入项目目录
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo "🔧 Checking configuration..."
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found!"
    exit 1
fi

# 检查环境变量
if grep -q "your-openrouter-api-key-here" wrangler.toml; then
    echo "⚠️  Please update your OpenRouter API key in wrangler.toml"
    echo "   Edit wrangler.toml and replace 'your-openrouter-api-key-here' with your actual API key"
    exit 1
fi

if grep -q "your-kv-namespace-id-here" wrangler.toml; then
    echo "⚠️  Please update your KV namespace ID in wrangler.toml"
    echo "   Run: wrangler kv:namespace create \"PAPERS\""
    echo "   Then update the ID in wrangler.toml"
    exit 1
fi

echo "🏗️  Building and deploying..."
wrangler deploy

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your PaperDog blog is now live at: https://paperdog.org"
echo ""
echo "📋 Next steps:"
echo "   1. Configure your domain DNS in Cloudflare Dashboard"
echo "   2. Test the website: https://paperdog.org"
echo "   3. Test manual update: curl -X POST https://paperdog.org/api/update"
echo "   4. View logs: wrangler tail"
echo ""
echo "🎉 Happy paper reading!"