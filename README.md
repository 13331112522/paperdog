# PaperDog - AI Papers Daily Blog

🎓 **PaperDog** 是一个自动化的AI论文博客网站，每日从arXiv和HuggingFace收集最新的AI和计算机视觉论文，并使用大模型进行智能分析和总结。

## ✨ 功能特点

- 🤖 **AI驱动的分析** - 使用GPT-4o和Gemini模型深度分析每篇论文
- 📡 **自动收集** - 每日自动从arXiv和HuggingFace获取最新论文
- 🧠 **智能总结** - 生成500字以内的精炼摘要，包含研究背景、挑战、创新内容等
- 🏷️ **智能分类** - 自动分类为计算机视觉、机器学习、NLP等领域
- 📊 **相关性评分** - 1-10分制评估论文的学术价值和应用潜力
- 📱 **响应式设计** - 支持桌面端和移动端浏览
- 🔍 **搜索和筛选** - 按类别、关键词搜索论文
- 📡 **RSS订阅** - 支持RSS feed订阅最新论文
- 🔄 **每日更新** - 自动每日更新内容
- 📚 **论文归档** - 长期存储每日推荐的论文，支持日期浏览和回溯
- 💾 **数据导出** - 支持JSON、CSV、Markdown、BibTeX等多种格式导出
- 📅 **日期索引** - 按日期快速浏览和检索历史论文

## 🏗️ 技术架构

### 后端技术栈
- **Cloudflare Workers** - 无服务器边缘计算平台
- **Cloudflare KV** - 键值存储用于缓存论文数据
- **OpenRouter API** - 接入GPT-4o和Gemini等大模型
- **arXiv API** - 获取学术论文数据
- **Web Scraping** - HuggingFace论文页面数据提取

### 前端技术栈
- **HTML5 + CSS3** - 现代化的网页结构
- **Bootstrap 5** - 响应式UI框架
- **Font Awesome** - 图标库
- **JavaScript** - 前端交互功能

## 📦 部署准备

### 1. 环境要求
- Cloudflare账户
- OpenRouter API密钥
- paperdog.org域名（已配置）

### 2. 获取API密钥
1. 访问 [OpenRouter.ai](https://openrouter.ai) 注册账户
2. 获取API密钥
3. 记录密钥用于配置

### 3. Cloudflare配置

#### 创建KV命名空间
```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 创建KV命名空间
wrangler kv:namespace create "PAPERS"
```

#### 配置环境变量
编辑 `wrangler.toml` 文件，替换以下占位符：

```toml
[vars]
OPENROUTER_API_KEY = "your-openrouter-api-key-here"
SITE_TITLE = "PaperDog - AI论文每日更新"
SITE_DESCRIPTION = "每日精选AI和计算机视觉最新论文研究"
DOMAIN = "paperdog.org"

# KV命名空间ID（替换为实际ID）
[[kv_namespaces]]
binding = "PAPERS"
id = "your-kv-namespace-id-here"
preview_id = "your-kv-namespace-id-here"
```

## 🚀 部署步骤

### 1. 部署Worker
```bash
# 进入项目目录
cd target/worker-modules

# 部署到Cloudflare
wrangler deploy
```

### 2. 配置域名
1. 在Cloudflare Dashboard中添加paperdog.org域名
2. 设置DNS记录指向Worker
3. 配置SSL证书

### 3. 验证部署
访问 `https://paperdog.org` 查看网站是否正常运行

### 4. 测试手动更新
```bash
# 测试手动更新功能
curl -X POST https://paperdog.org/api/update
```

## 📚 论文归档功能

PaperDog现在包含强大的论文归档和导出功能，帮助您长期保存和管理每日推荐的论文。

### 🗂️ 归档功能
- **自动归档**：每日更新的论文自动保存到长期归档中
- **日期索引**：按日期快速浏览历史论文
- **搜索功能**：在归档中搜索特定论文
- **统计信息**：查看归档统计和论文分布

### 💾 导出功能
支持多种导出格式：
- **JSON**：完整数据，包含AI分析结果
- **CSV**：结构化数据，适合表格分析
- **Markdown**：人类可读的格式化报告
- **BibTeX**：学术引用格式

### 🔗 API端点
```bash
# 浏览归档界面
GET https://paperdog.org/archive

# 获取可用归档日期
GET https://paperdog.org/api/archive/dates

# 获取特定日期的归档论文
GET https://paperdog.org/api/archive/2025-01-18

# 日期范围查询
GET https://paperdog.org/api/archive/range?start_date=2025-01-01&end_date=2025-01-18

# 搜索归档论文
GET https://paperdog.org/api/archive/search?q=computer vision&category=computer_vision

# 导出归档数据（JSON格式）
GET https://paperdog.org/api/archive/export?date=2025-01-18&format=json

# 导出为CSV格式
GET https://paperdog.org/api/archive/export?start_date=2025-01-01&end_date=2025-01-18&format=csv

# 获取导出格式信息
GET https://paperdog.org/api/archive/export/formats

# 获取归档统计
GET https://paperdog.org/api/archive/statistics
```

### 📊 使用示例
```bash
# 导出最近一周的论文为Markdown格式
curl "https://paperdog.org/api/archive/export?start_date=2025-01-11&end_date=2025-01-18&format=markdown" -o weekly_report.md

# 搜索计算机视觉相关的高分论文
curl "https://paperdog.org/api/archive/search?q=vision&min_score=8&category=computer_vision"

# 获取特定日期的论文并保存为BibTeX
curl "https://paperdog.org/api/archive/2025-01-18" | jq -r '.papers[] | .title'
```

## 📁 项目结构

```
target/
├── worker-modules/
│   ├── functions/
│   │   └── worker.js              # 主Worker入口
│   └── src/
│       ├── config.js             # 配置文件
│       ├── handlers.js           # API路由处理
│       ├── paper-scraper.js      # 论文爬取模块
│       ├── paper-analyzer.js     # AI分析模块
│       ├── blog-generator.js     # 博客内容生成
│       ├── templates.js          # 前端模板
│       ├── utils.js              # 工具函数
│       ├── archive-manager.js    # 归档管理核心
│       ├── archive-exporter.js   # 导出功能模块
│       ├── archive-handlers.js   # 归档API处理
│       └── archive-templates.js  # 归档界面模板
├── wrangler.toml                  # Cloudflare配置
├── test-archive.js               # 归档功能测试脚本
└── README.md                     # 项目说明
```

## 🛠️ 开发和测试

### 本地开发
```bash
# 安装依赖
npm install

# 本地测试
wrangler dev

# 运行测试
npm test
```

### API接口
- `GET /` - 博客首页
- `GET /api/papers` - 获取论文列表
- `GET /api/papers/:date` - 获取特定日期论文
- `GET /api/papers/:id` - 获取单篇论文详情
- `POST /api/update` - 手动触发更新
- `GET /api/categories` - 获取论文分类
- `GET /api/search` - 搜索论文
- `GET /feed` - RSS订阅

### 定时任务
系统配置为每日UTC时间8:00自动更新论文（北京时间16:00）。

## 🔧 配置说明

### 论文源配置
- **arXiv**: cs.CV, cs.AI, cs.LG, cs.CL, cs.RO
- **HuggingFace**: 计算机视觉、NLP、机器学习相关论文

### AI分析配置
- **模型**: GPT-4o-mini（分析）、Gemini 2.0 Flash（总结）
- **分析维度**: 研究背景、挑战、创新内容、实验结果、启发
- **字数限制**: 摘要不超过500字
- **评分机制**: 1-10分相关性评分

### 缓存策略
- 论文数据缓存24小时
- 单篇论文缓存7天
- 支持手动清除缓存

## 📊 监控和维护

### 日志查看
```bash
# 查看Worker日志
wrangler tail
```

### 性能监控
- Cloudflare Analytics提供访问统计
- Worker Metrics显示执行时间和错误率
- KV Storage监控存储使用情况

### 错误处理
- 自动重试失败的API请求
- 降级处理保证基本功能
- 错误日志记录用于调试

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

### 代码规范
- 使用ES6+语法
- 遵循现有代码风格
- 添加必要的注释
- 确保代码可测试

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [arXiv](https://arxiv.org) - 开放获取的学术论文库
- [HuggingFace](https://huggingface.co) - AI模型和论文平台
- [OpenRouter](https://openrouter.ai) - AI模型API服务
- [Cloudflare](https://cloudflare.com) - 边缘计算平台

## 📞 联系方式

- 项目主页: https://paperdog.org
- 问题反馈: 通过GitHub Issues
- 邮箱: 13331112522@189.cn

---

**PaperDog** - 让AI研究论文触手可及 🎓🐕
