# Token Server

Token Server 是一个独立的 Express 服务器，负责处理 OAuth 认证流程中的本地部分。

## 架构设计

### 分层结构

```
├── config.ts              # 配置管理
├── token-server.ts         # 主服务器类
├── controllers/            # 控制器层
│   └── token-controller.ts # 处理 HTTP 请求
├── routes/                 # 路由层
│   └── auth-routes.ts      # 认证相关路由
└── index.ts               # 入口文件
```

### 依赖关系

- **TokenServer** → **TokenController** → **TokenService** (shared)
- **TokenService** → **TokenManager** (shared)

## 功能特性

### 1. 自动认证流程

- 启动时自动检查本地 token
- 无 token 时自动打开浏览器进行认证
- 跨平台支持 (macOS, Windows, Linux)

### 2. HTTP 接口

- `GET /auth/callback` - 接收前端认证回调
- `GET /health` - 健康检查

### 3. 错误处理

- 完善的错误处理和日志记录
- 优雅的错误响应

## 使用方法

### 独立运行

```bash
# 编译项目
npm run build

# 运行 Token Server
node dist/token/index.js
```

### 测试服务器

```bash
# 运行测试脚本
node dist/token/test-server.js

# 测试回调接口
curl "http://localhost:8080/auth/callback?authToken=test_token_123"

# 健康检查
curl http://localhost:8080/health
```

### 集成使用

```typescript
import { createTokenServer } from './token/index.js';

const tokenServer = createTokenServer();
await tokenServer.start();
```

## 配置说明

Token Server 使用以下默认配置：

```typescript
{
  tokenServer: {
    port: 8080,
    callbackUrl: 'http://localhost:8080/auth/callback'
  },
  externalServices: {
    qrCodeUrl: 'http://localhost:5173',      // 前端二维码页面
    authServiceUrl: 'http://localhost:3000'  // 外部鉴权服务
  },
  storage: {
    tokenPath: '~/.mcp-gitlab-auth/token.json'  // Token 存储路径
  }
}
```

## 认证流程

1. **启动检查**: Token Server 启动时检查本地 token
2. **触发认证**: 无有效 token 时自动打开浏览器
3. **用户认证**: 用户在前端页面扫码认证
4. **接收回调**: 前端认证成功后回调 Token Server
5. **存储 Token**: Token Server 验证并存储 token

## 开发说明

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 OOP 原则：public 方法在上，private 方法在下
- 小而美的函数设计，清晰的函数命名
- 适当的模块化和分层

### 错误处理

- 所有异步操作都有错误处理
- 详细的错误日志记录
- 用户友好的错误响应
