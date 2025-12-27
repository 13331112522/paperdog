# PaperDog - AI Papers Daily Blog

🎓 **PaperDog** 是一个自动化的AI论文博客网站，每日从arXiv和HuggingFace收集最新的AI和计算机视觉论文，并使用大模型进行智能分析和总结。

## ✨ 功能特点

### 🧠 AI驱动的智能分析
- 🤖 **多模型分析系统** - GPT-5-mini主模型 + Gemini 2.5 Flash Lite备用模型 + GLM-4-air智能回退
- 🧠 **5段式深度分析** - 研究背景、技术挑战、创新内容、实验结果、深度洞察 (每段280字符)
- 🏷️ **智能分类系统** - 11个AI/ML领域自动分类，关键词智能匹配
- 📊 **多因子评分算法** - 新鲜度30%、相关性40%、流行度20%、质量10%
- 🎯 **智能平衡选优** - arXiv 5篇 + HuggingFace 5篇，智能平局决胜
- 🔄 **三级容错机制** - OpenRouter → GLM智能回退 → 完整错误处理

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
- 🎨 **现代UI设计** - Inter字体、简洁白色导航、indigo配色方案
- 🌓 **暗色模式** - 系统偏好自动适配暗色主题
- 📊 **视觉状态指示** - 评分徽章、分类标签、来源标识
- 🔄 **交互式体验** - 点击查看详情，平滑过渡效果
- 📊 **访问统计** - 隐私合规的访客统计系统
- 📝 **博客集成** - 无头WordPress API博客系统集成，分享见解和更新

## 🏗️ 技术架构

### 后端技术栈
- **Cloudflare Workers** - 无服务器边缘计算平台，全球CDN部署
- **Cloudflare KV** - 分布式键值存储，高性能论文数据缓存
- **OpenRouter API** - 多模型接入：GPT-5-mini、Gemini 2.5 Flash Lite、DeepSeek V3.1
- **GLM API** - 智能回退系统：GLM-4-air模型，OpenRouter失效时自动切换
- **arXiv API** - 获取学术论文数据，支持多分类订阅
- **Web Scraping** - HuggingFace多策略页面数据提取，支持React现代网站
- **三级容错机制** - OpenRouter → GLM智能回退 → 完整错误处理

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
- GLM API密钥（可选，作为回退方案）
- paperdog.org域名（已配置）

### 2. 获取API密钥
1. **OpenRouter API**:
   - 访问 [OpenRouter.ai](https://openrouter.ai) 注册账户
   - 获取API密钥

2. **GLM API** (推荐配置，提供高可用性):
   - 访问 [智谱AI开放平台](https://open.bigmodel.cn/) 注册账户
   - 获取API密钥
   - 推荐模型: GLM-4-air

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
# AI Service Configuration
OPENROUTER_API_KEY = "your-openrouter-api-key-here"
GLM_API_KEY = "your-glm-api-key-here"  # 可选但强烈推荐
GLM_BASE_URL = "https://open.bigmodel.cn/api/paas/v4/"
GLM_MODEL = "glm-4-air"

# Site Configuration
SITE_TITLE = "PaperDog - AI论文每日更新"
SITE_DESCRIPTION = "每日精选AI和计算机视觉最新论文研究"
DOMAIN = "paperdog.org"

# KV命名空间ID（替换为实际ID）
[[kv_namespaces]]
binding = "PAPERS"
id = "your-kv-namespace-id-here"
preview_id = "your-kv-namespace-id-here"
```

**GLM配置说明**:
- `GLM_API_KEY`: 智谱AI API密钥，作为OpenRouter的回退方案
- `GLM_BASE_URL`: GLM API端点，通常使用默认值
- `GLM_MODEL`: 推荐使用 `glm-4-air`，性价比最佳

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
│       ├── dual-column-templates.js  # 双栏布局模板（含共享header）
│       ├── blog-templates.js     # 博客页面模板
│       ├── blog-fetcher.js       # WordPress博客fetcher
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

# 本地测试（带Chrome DevTools调试）
npm run dev:tools

# 运行测试
npm test
```

### 🤖 MCP (Model Context Protocol) 集成

PaperDog 现在全面支持 MCP 协议，提供强大的开发调试和论文研究能力：

#### 📚 PaperDog 研究 MCP 服务

访问来自 arXiv 和 HuggingFace 的数千篇 AI 研究论文，配备全面的 AI 生成分析。

**配置文件**: `~/.claude/mcp_settings.json`

**可用工具**:
- **`paperdog_search_papers`** - 搜索论文（支持主题、分类、评分筛选）
- **`paperdog_get_daily_papers`** - 获取特定日期的精选论文 ⭐ *已修复历史日期访问*
- **`paperdog_get_paper_details`** - 获取单篇论文的详细分析
- **`paperdog_get_categories`** - 查看所有研究分类
- **`paperdog_get_archive_papers`** - 访问历史论文档案

**使用示例**:
```bash
# 搜索机器学习论文
"搜索最新的 transformer 架构论文"

# 获取特定日期论文
"显示 10 月 18 日的论文"

# 按分类获取
"获取今天的计算机视觉论文"

# 详细分析
"获取论文 [paper_id] 的详细分析"
```

**服务特性**:
- 🎯 **智能分析**: 每篇论文包含 5 部分 AI 分析（引言、挑战、创新、实验、洞察）
- 🌍 **多语言支持**: 14 种语言的 span 级别幻觉检测数据集
- 📊 **综合评分**: 新鲜度、相关性、流行度、质量多因子评分
- 🔄 **实时更新**: 每日从 arXiv 和 HuggingFace 自动获取最新论文
- 🆓 **免费服务**: 每小时 100 次请求，每日 1000 次请求，无需 API 密钥

#### 🛠️ Chrome DevTools MCP 集成

PaperDog 支持 Chrome DevTools MCP 集成，便于开发和调试：

**功能特性**:
- **实时调试**: 使用 Chrome DevTools 直接调试 Cloudflare Worker
- **网络监控**: 监控所有 API 请求和响应
- **性能分析**: 分析论文抓取和处理性能
- **控制台日志**: 查看详细的调试信息和错误日志
- **设备模拟**: 测试移动端和桌面端响应式设计

**使用方法**:
1. 运行带调试的开发服务器：`npm run dev:tools`
2. 在 Claude 中使用 MCP 工具启动 Chrome DevTools
3. 连接到 `localhost:8787` 进行调试

**调试工具函数**:
项目包含专用的调试工具函数，可在 Chrome DevTools 控制台中使用：
- `debugUtils.debugLog()` - 记录调试信息
- `debugUtils.tracePaperProcessing()` - 跟踪论文处理步骤
- `debugUtils.networkLog()` - 监控网络请求
- `debugUtils.performanceLog()` - 性能指标记录

#### 🔧 MCP 配置技术细节

**智能修复功能**:
- **问题**: `paperdog_get_daily_papers` 对历史日期返回空结果
- **解决方案**: 自动路由到 `paperdog_get_archive_papers` 使用相同日期范围
- **结果**: 无缝的按日期访问论文功能

**环境变量**:
- `PAPERDOG_BASE_URL`: https://paperdog.org/mcp
- `PAPERDOG_TIMEOUT`: 30 秒超时设置

**配置文件位置**:
- **全局配置**: `~/.claude/mcp_settings.json`（所有 Claude Code 会话可用）
- **项目配置**: `.claude/settings.local.json`（仅当前项目可用）

### API接口
- `GET /` - 主页（论文展示）
- `GET /blog` - 博客列表页
- `GET /blog/:slug` - 单篇博客文章
- `GET /about` - 关于页面
- `GET /archive` - 归档页面
- `GET /api/papers` - 获取论文列表
- `GET /api/papers/:date` - 获取特定日期论文
- `GET /api/papers/:id` - 获取单篇论文详情
- `POST /api/update` - 手动触发更新
- `GET /api/categories` - 获取论文分类
- `GET /api/search` - 搜索论文
- `GET /feed` - RSS订阅
- `GET /api/debug/logs` - 获取调试日志（开发环境）
- `POST /api/debug/clear-cache` - 清除缓存（开发环境）

### 定时任务
系统配置为每日UTC时间8:00自动更新论文（北京时间16:00）。

## 🔧 配置说明

### 论文源配置
- **arXiv**: cs.CV, cs.AI, cs.LG, cs.CL, cs.RO
- **HuggingFace**: 计算机视觉、NLP、机器学习相关论文

### AI分析配置
- **主模型**: GPT-5-mini（主要分析）
- **备用模型**: Gemini 2.5 Flash Lite Preview（容错分析）
- **智能回退**: GLM-4-air（OpenRouter失效时自动切换）
- **翻译模型**: Gemini 2.5 Flash Preview（中文翻译，支持GLM回退）
- **总结模型**: Gemini 2.5 Flash Preview（内容总结，支持GLM回退）
- **分析维度**: 研究背景、技术挑战、创新内容、实验结果、深度洞察
- **字符限制**: 每段分析不超过280字符
- **评分机制**: 多因子综合评分 (1-10分，支持小数)
- **智能平衡**: 5+5来源分配算法，随机平局决胜
- **三级容错**: OpenRouter → GLM → 完整错误处理，确保服务高可用性

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

## 🔄 GLM智能回退系统 (v3.2 - 2025年11月)

### 🚀 新功能特性
- **✅ 智能回退机制**: OpenRouter API失效时自动切换到GLM-4-air
- **✅ 环境变量配置**: 所有API密钥通过环境变量管理，提升安全性
- **✅ 三级容错架构**: 主模型 → 备用模型 → GLM回退 → 错误处理
- **✅ 全功能支持**: 论文分析、中文翻译、内容总结均支持GLM回退
- **✅ 无缝切换**: 用户无感知的API切换，保证服务连续性

### 🔧 技术实现
- **配置管理**: `getGLMFallbackConfig(env)` 函数读取环境变量
- **参数传递**: 所有关键函数支持 `glmFallbackConfig` 参数
- **错误处理**: 完整的错误日志和双重API失败报告
- **默认值**: 环境变量缺失时提供合理默认配置

### 📊 回退策略
1. **第一级**: OpenRouter (GPT-5-mini / Gemini 2.5 Flash)
2. **第二级**: GLM-4-air (智谱AI，自动切换)
3. **第三级**: 完整错误处理和降级服务

### 🛡️ 安全性提升
- **环境变量管理**: API密钥不再硬编码在源码中
- **配置分离**: 开发/测试/生产环境独立配置
- **最佳实践**: 遵循Cloudflare Workers安全规范

---

## 🔧 关键修复与稳定性改进 (v3.1 - 2025年10月)

### 🚨 重大问题修复
- **✅ 修复关键超时错误**: 解决了`paper-scraper.js`中的`TypeError: Cannot create property 'timeoutId'`错误，该错误导致论文更新失败
- **✅ 增强错误处理**: 为HuggingFace论文解析添加了全面的try-catch块和空值检查
- **✅ 改进论文抓取**: 修复了摘要提取模式，增加了对格式错误内容的错误处理
- **✅ 超时保护**: 实现了5分钟整体抓取超时，防止系统挂起
- **✅ 重复论文处理**: 增强了论文处理管道中的验证和错误处理

### 🛠️ 系统恢复状态
- **🔧 根本原因识别**: 分析失败和中文翻译缺失是由论文抓取中的超时错误引起的
- **🔧 系统状态**: 分析和翻译系统现已功能正常，准备进行论文处理
- **🔧 开发环境**: `wrangler dev`服务器在`localhost:8789`上稳定运行，无挂起问题

### 🎯 修复影响
- 开发服务器现在能够稳定启动和运行
- 论文更新流程不再因超时错误而中断
- AI分析和中文翻译功能已恢复并可正常工作
- 系统整体稳定性和可靠性显著提升

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

**PaperDog v3.2** - GLM智能回退系统，高可用AI论文分析 🎓🐕✨🔄

---

## 🎨 设计系统 (v4.0 - 2025年12月)

### 🌟 现代设计语言
PaperDog采用现代专业的设计系统，灵感来自Hugging Face、Vercel和Hashnode等顶尖科技平台。

#### 字体系统
- **主字体**: Inter (Google Fonts)
- **后备字体**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **字重**: 400 (正文), 500 (中等), 600 (半粗), 700 (粗体)
- **字体大小**:
  - 页面标题: 2.5rem (40px)
  - 卡片标题: 1.25rem (20px)
  - 正文: 1rem (16px)
  - 辅助文本: 0.875rem (14px)
  - 标签: 0.8125rem (13px)

#### 配色方案
**主色调 (Indigo)**:
- Primary-50: #EEF2FF
- Primary-100: #E0E7FF
- Primary-200: #C7D2FE
- Primary-500: #6366F1
- Primary-600: #4F46E5
- Primary-700: #4338CA

**中性灰**:
- Gray-50: #F9FAFB (背景)
- Gray-100: #F3F4F6
- Gray-200: #E5E7EB (边框)
- Gray-500: #6B7280 (辅助文本)
- Gray-700: #374151 (正文)
- Gray-900: #111827 (标题)

#### 组件设计
**导航栏**:
- 白色背景 (#FFFFFF)
- 底部边框 (1px #E5E7EB)
- 背景模糊效果 (backdrop-filter: blur(8px))
- 粘性定位 (sticky)
- 透明度 95%

**卡片**:
- 白色背景
- 微妙边框 (1px #E5E7EB)
- 轻阴影 (0 1px 3px rgba(0,0,0,0.05))
- 悬停效果:
  - 边框颜色变化 (#C7D2FE)
  - 阴影增强 (0 4px 12px rgba(99, 102, 241, 0.1))
  - 轻微上移 (translateY(-2px))

**徽章**:
- 分类徽章: Primary-50背景, Primary-700文本, Primary-200边框
- 标签: Gray-100背景, Gray-700文本, Gray-200边框
- 圆角: 6px (分类), 9999px (标签)

#### 间距系统
基于0.25rem递增的间距比例:
- Spacing-1: 0.25rem (4px)
- Spacing-2: 0.5rem (8px)
- Spacing-3: 0.75rem (12px)
- Spacing-4: 1rem (16px)
- Spacing-5: 1.25rem (20px)
- Spacing-6: 1.5rem (24px)
- Spacing-8: 2rem (32px)

#### 暗色模式
系统自动检测用户OS偏好，支持暗色主题:
- 背景色反转: #111827, #1F2937
- 文本色反转: #F9FAFB, #D1D5DB
- 边框和阴影适配
- 保持视觉层次和可读性

#### 动画与过渡
- **缓动函数**: cubic-bezier(0.4, 0, 0.2, 1)
- **过渡时长**: 0.15s (颜色), 0.2s (变换)
- **悬停效果**:
  - 阴影增强
  - 边框颜色变化
  - 轻微位移 (-2px)

### 📝 博客集成特性
- **无头WordPress**: 通过WordPress.com REST API集成
- **缓存策略**: 列表15分钟, 文章1小时
- **响应式设计**: 移动端优先,桌面端优化
- **SEO友好**: 语义化HTML, meta标签
- **社交分享**: Twitter, Facebook, LinkedIn分享按钮

### 🔧 技术实现
- **CSS自定义属性**: 使用CSS变量管理颜色和间距
- **移动优先**: 响应式断点 @media (max-width: 768px)
- **浏览器兼容**: 支持现代浏览器 (Chrome, Firefox, Safari, Edge)
- **无障碍**: WCAG 2.1 AA级标准, 语义化HTML
- **性能优化**: 字体预连接, CDN加载, 最小化重排

---

**PaperDog v4.0** - 现代设计系统, 专业论文展示平台 🎓🐕✨🎨
