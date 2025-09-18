# PaperDog 部署指南

## 📋 部署前检查清单

### 1. 必需的账户和服务
- [ ] Cloudflare 账户
- [ ] OpenRouter.ai 账户和 API 密钥
- [ ] paperdog.org 域名（已购买）

### 2. 环境准备
- [ ] 安装 Node.js 16+
- [ ] 安装 Wrangler CLI: `npm install -g wrangler`
- [ ] 登录 Cloudflare: `wrangler login`

## 🚀 部署步骤

### 步骤 1: 配置检查
```bash
cd target
node check-config.js
```

### 步骤 2: 创建 KV 存储
```bash
wrangler kv:namespace create "PAPERS"
```
记录返回的 namespace ID，然后更新 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "PAPERS"
id = "your-namespace-id-here"
preview_id = "your-namespace-id-here"
```

### 步骤 3: 配置环境变量
编辑 `wrangler.toml`，设置你的 OpenRouter API 密钥：

```toml
[vars]
OPENROUTER_API_KEY = "sk-or-v1-your-actual-api-key"
```

### 步骤 4: 部署 Worker
```bash
# 自动部署
./deploy.sh

# 或手动部署
npm install
wrangler deploy
```

### 步骤 5: 配置域名
1. 登录 Cloudflare Dashboard
2. 添加 paperdog.org 域名
3. 在 Workers 部分，添加路由：
   - 路由: `paperdog.org/*`
   - 服务: `paperdog-blog`
   - 环境: `production`

### 步骤 6: 验证部署
```bash
# 测试网站
curl https://paperdog.org

# 测试 API
curl https://paperdog.org/api/papers

# 测试手动更新
curl -X POST https://paperdog.org/api/update
```

## 🔧 配置说明

### 环境变量
| 变量名 | 说明 | 必需 |
|--------|------|------|
| `OPENROUTER_API_KEY` | OpenRouter API 密钥 | ✅ |
| `SITE_TITLE` | 网站标题 | ❌ |
| `SITE_DESCRIPTION` | 网站描述 | ❌ |
| `DOMAIN` | 域名 | ❌ |

### KV 存储
- **绑定名称**: `PAPERS`
- **用途**: 缓存论文数据
- **TTL**: 24 小时（论文），7 天（单篇论文）

### 定时任务
- **Cron 表达式**: `0 8 * * *`
- **执行时间**: UTC 8:00（北京时间 16:00）
- **功能**: 每日自动爬取和分析论文

## 🧪 测试功能

### 本地测试
```bash
# 启动本地开发服务器
wrangler dev

# 在另一个终端运行测试
OPENROUTER_API_KEY=your-key node test-local.js
```

### 部署后测试
```bash
# 查看日志
wrangler tail

# 测试所有 API 端点
curl https://paperdog.org/api/papers
curl https://paperdog.org/api/categories
curl https://paperdog.org/feed
```

## 📊 监控和维护

### 性能监控
- Cloudflare Analytics: 访问统计和性能指标
- Worker Metrics: 执行时间和错误率
- KV Storage: 存储使用情况

### 错误处理
系统包含多层错误处理：
1. 网络请求自动重试
2. API 降级处理
3. 缓存容错机制
4. 详细的错误日志

### 维护任务
- 定期检查 API 使用量
- 监控爬取成功率
- 更新论文源配置
- 优化 AI 分析提示词

## 🚨 故障排除

### 常见问题

#### 1. 部署失败
```bash
# 检查配置
wrangler config list

# 检查权限
wrangler whoami
```

#### 2. API 密钥错误
```bash
# 验证 API 密钥
curl -H "Authorization: Bearer your-key" https://openrouter.ai/api/v1/models
```

#### 3. KV 存储问题
```bash
# 列出 KV 命名空间
wrangler kv:namespace list

# 测试 KV 读写
wrangler kv:key get --namespace-id your-id test-key
```

#### 4. 域名配置问题
- 确保 DNS 记录正确指向 Cloudflare
- 检查 SSL 证书状态
- 验证 Worker 路由配置

### 日志分析
```bash
# 实时日志
wrangler tail

# 过滤错误
wrangler tail --format=pretty | grep ERROR

# 查看特定时间段的日志
wrangler tail --format=pretty --since=1h
```

## 💡 性能优化

### 缓存策略
- 论文数据缓存 24 小时
- API 响应缓存 1 小时
- 静态资源通过 CDN 缓存

### 成本控制
- 限制每日 API 调用次数
- 优化并发请求处理
- 使用智能缓存减少重复计算

### 扩展性
- 支持横向扩展
- 边缘计算优化
- 自动负载均衡

## 🔒 安全考虑

### API 安全
- 使用环境变量存储密钥
- 实施 API 访问限制
- 定期轮换 API 密钥

### 数据安全
- 不存储敏感用户数据
- 加密传输（HTTPS）
- 定期清理过期缓存

### 访问控制
- 实施 IP 白名单（可选）
- 配置速率限制
- 监控异常访问

## 📈 升级和维护

### 版本更新
```bash
# 拉取最新代码
git pull origin main

# 重新部署
wrangler deploy
```

### 配置更新
- 修改 `wrangler.toml` 配置
- 更新环境变量
- 重新部署 Worker

### 备份和恢复
- KV 数据自动备份
- 配置版本控制
- 灾难恢复计划

---

## 📞 技术支持

如果在部署过程中遇到问题：

1. 检查本文档的故障排除部分
2. 查看 Cloudflare 官方文档
3. 检查项目 GitHub Issues
4. 联系技术支持：contact@paperdog.org

祝您部署顺利！🎉