# PaperDog - AI Papers Daily Blog

🎓 **PaperDog** 是一个自动化的AI论文博客网站，每日从arXiv和HuggingFace收集最新的AI和计算机视觉论文，并使用大模型进行智能分析和总结。

## ✨ 功能特点

### 🧠 AI驱动的智能分析
- 🤖 **多模型分析系统** - GPT-5-mini主模型 + Gemini 2.5 Flash Lite备用模型
- 🧠 **5段式深度分析** - 研究背景、技术挑战、创新内容、实验结果、深度洞察 (每段280字符)
- 🏷️ **智能分类系统** - 11个AI/ML领域自动分类，关键词智能匹配
- 📊 **多因子评分算法** - 新鲜度30%、相关性40%、流行度20%、质量10%
- 🎯 **智能平衡选优** - arXiv 5篇 + HuggingFace 5篇，智能平局决胜

### 🌐 完整双语支持
- 🇨🇳 **全中文翻译** - 论文摘要、分析内容、界面元素的完整中文翻译
- 🔀 **智能回退机制** - 翻译缺失时自动翻译英文内容
- 📊 **状态可视化** - 翻译进度和状态的实时指示器
- 🌍 **无缝语言切换** - 实时中英文切换，保持用户状态
- ⚡ **智能错误处理** - 翻译失败时的优雅降级处理

### 📊 智能论文策展
- 📡 **多源自动收集** - 每日自动从arXiv和HuggingFace获取最新论文
- 🎯 **5+5优化算法** - 确保两个来源的平衡展示 (各5篇)
- 🔄 **每日精选** - 仅保存最高评分的10篇论文
- 🔍 **高级搜索筛选** - 全文搜索，多维度筛选功能
- 📡 **RSS订阅** - 支持RSS feed订阅最新论文
- 📊 **实时更新** - 动态内容加载，无需页面刷新

### 💾 归档导出系统
- 📚 **长期归档存储** - 每日推荐论文自动保存
- 📅 **日期索引浏览** - 按日期快速浏览历史论文
- 💾 **多格式导出** - JSON、CSV、Markdown、BibTeX格式
- 🔍 **归档搜索** - 在历史档案中搜索特定论文
- 📊 **统计仪表板** - 归档统计和论文分布分析

### 🎨 用户体验优化
- 📱 **响应式设计** - 桌面端和移动端完美适配
- 🖼️ **双栏布局** - 论文列表+详细分析视图
- 📊 **视觉状态指示** - 评分徽章、分类标签、来源标识
- 🔄 **交互式体验** - 点击查看详情，平滑过渡效果
- 📊 **访问统计** - 隐私合规的访客统计系统

## 🏗️ 技术架构

### 后端技术栈
- **Cloudflare Workers** - 无服务器边缘计算平台，全球CDN部署
- **Cloudflare KV** - 分布式键值存储，高性能论文数据缓存
- **OpenRouter API** - 多模型接入：GPT-5-mini、Gemini 2.5 Flash Lite、DeepSeek V3.1
- **arXiv API** - 获取学术论文数据，支持多分类订阅
- **Web Scraping** - HuggingFace多策略页面数据提取，支持React现代网站
- **智能重试机制** - 指数退避算法，API可靠性保障

### 前端技术栈
- **HTML5 + CSS3** - 现代化语义化网页结构
- **Bootstrap 5** - 响应式UI框架，移动端优化
- **Font Awesome** - 图标库，视觉指示器
- **JavaScript** - 前端交互，实时更新
- **双栏布局** - 论文列表与详细分析并排显示
- **可折叠设计** - 移动端自适应布局优化

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
- **主模型**: GPT-5-mini（主要分析）
- **备用模型**: Gemini 2.5 Flash Lite Preview（容错分析）
- **翻译模型**: DeepSeek V3.1 Terminus（中文翻译）
- **总结模型**: Gemini 2.5 Flash Preview（内容总结）
- **分析维度**: 研究背景、技术挑战、创新内容、实验结果、深度洞察
- **字符限制**: 每段分析不超过280字符
- **评分机制**: 多因子综合评分 (1-10分，支持小数)
- **智能平衡**: 5+5来源分配算法，随机平局决胜

### 缓存策略
- **多级缓存体系**: 论文数据缓存24小时，单篇论文缓存7天
- **智能缓存管理**: 自动清理过期数据，优化存储使用
- **手动缓存控制**: 支持管理员手动清除缓存
- **性能优化**: 批量处理2篇论文，避免API限流
- **并发控制**: 最大并发请求数3个，防止资源过载

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
- **多层级容错**: API失败时自动切换备用模型
- **指数退避重试**: 2秒、4秒、8秒渐进式重试机制
- **优雅降级**: 系统部分功能失效时保持核心功能
- **详细错误日志**: 完整的错误信息记录，便于调试
- **状态监控**: 实时系统状态和翻译进度指示
- **智能回退**: 翻译失败时显示英文内容加中文标签

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

## 🚀 最新版本特性 (v3.0)

### 核心技术升级
- **多模型AI栈**: GPT-5-mini + Gemini 2.5 Flash Lite + DeepSeek V3.1
- **智能平衡算法**: 5+5来源分配，确保论文来源多样性
- **完整双语系统**: 全中文翻译支持，智能回退机制
- **多因子评分**: 新鲜度、相关性、流行度、质量综合评估

### 可靠性增强
- **指数退避重试**: API失败时的智能重试机制
- **多层级容错**: 模型失败时自动切换备用方案
- **优雅降级**: 系统组件失效时保持核心功能
- **实时状态监控**: 翻译进度和系统状态可视化

### 用户体验优化
- **响应式双栏布局**: 桌面端和移动端完美适配
- **实时语言切换**: 中英文无缝切换，状态保持
- **视觉状态指示**: 评分、分类、来源清晰标识
- **交互式体验**: 平滑过渡效果，动态内容更新

**PaperDog v3.0** - 智能AI论文聚合平台的全面升级 🎓🐕✨
