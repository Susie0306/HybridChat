# HybridChat 💬

HybridChat 是一个现代化的全栈混合开发（Hybrid）聊天应用。它结合了 React 前端、Node.js WebSocket 后端、PostgreSQL 云数据库以及原生 Android 外壳，实现了一套跨端、实时、智能的聊天解决方案。

## ✨ 项目亮点

本项目旨在演示**Hybrid App（混合应用）的开发模式，通过 JSBridge 技术打通 Web 与 Native 的交互，同时集成了当下流行的 AI 大模型**与**工业级身份验证**方案。

## 🚀 功能特性 (Features)

### 1\. 核心聊天功能

- **实时通信**：基于 WebSocket 实现毫秒级消息推送，支持多人群组聊天（输入房间号即可加入）。

- **身份验证**：集成 **Clerk Auth**，提供安全、专业的登录/注册流程（支持 Google、GitHub 等第三方登录）。

- **多媒体发送**：支持发送 **图片**、**视频** 和 **音频** 文件。

- **表情支持**：内置 Emoji 选择面板。

### 2\. 高级交互体验

- **消息撤回**：支持在发送后 2 分钟内撤回消息（双端校验，实时同步删除）。

- **历史记录懒加载**：向上滚动聊天记录时，自动从数据库分页加载历史消息，节省流量并提升性能。

- **全文搜索**：支持在当前聊天室内的历史记录中进行关键词搜索。

- **实时在线列表**：侧边栏实时显示当前房间的在线用户及其头像。

### 3\. 🤖 AI 智能助手

- **DeepSeek 集成**：内置 AI 机器人。在聊天框输入 `@DeepSeek` + 问题，即可召唤 AI 参与群聊互动。

### 4\. 📱 Hybrid 原生集成 (Android)

- **原生 Web 容器**：使用 Android WebView 加载前端页面。

- **JSBridge 通信**：

  - **获取设备信息**：Web 端可调用原生方法获取手机的唯一 Device ID。

  - **原生通知**：Web 端触发 Android 原生 `Toast` 气泡提示。

  - **权限申请**：Web 端自动请求 Android 相机和麦克风权限。

- **硬件交互**：处理 Android 物理返回键逻辑（优先网页后退，否则退出应用）。

### 5\. 数据持久化

- **云端存储**：从本地 SQLite 迁移至 **PostgreSQL (Neon)** 云数据库，确保数据线上持久化，不随服务重启丢失。

## 🛠️ 技术栈 (Tech Stack)

### 前端 (Web)

- **框架**：React 18 + Vite

- **UI 库**：Tailwind CSS + Lucide React (Icons)

- **身份验证**：Clerk React SDK

- **表情库**：emoji-picker-react

### 后端 (Server)

- **运行环境**：Node.js

- **通信协议**：WebSocket (`ws`), HTTP

- **数据库**：PostgreSQL (`pg` + `pg-pool`)

- **AI 服务**：OpenAI SDK (适配 DeepSeek API)

### 移动端 (App)

- **平台**：Android (Java)

- **核心组件**：WebView, JavascriptInterface

## 📂 项目结构

```
HybridChat/
├── apiRoutes.js          # 后端：HTTP API 路由处理 (上传, 搜索, 历史记录)
├── chatService.js        # 后端：WebSocket 核心逻辑 & AI 交互
├── storageService.js     # 后端：PostgreSQL 数据库操作层
├── server.js             # 后端：服务入口
├── hybrid-chat-web/      # 前端：React 项目目录
│   ├── src/
│   │   ├── components/   # UI 组件 (ChatRoom, MessageBubble, UserList...)
│   │   ├── hooks/        # 自定义 Hook (useChat.js)
│   │   └── utils/        # 工具类 (bridge.js - 处理与 App 的通信)
│   └── ...
└── app/                  # 移动端：Android Studio 项目目录
    └── src/main/java/.../MainActivity.java  # App 入口与 WebView 配置

```

## ⚡️ 快速开始 (本地运行)

### 1\. 后端启动

确保你配置了 `.env` 文件，包含 `DATABASE_URL` (PostgreSQL), `CLERK_SECRET_KEY` 和 `DEEPSEEK_API_KEY`。

```
# 安装依赖
npm install

# 启动服务 (默认端口 8080)
node server.js

```

### 2\. 前端启动

确保 `hybrid-chat-web/.env.local` 包含 `VITE_CLERK_PUBLISHABLE_KEY` 和 `VITE_API_URL`。

```
cd hybrid-chat-web
npm install
npm run dev

```

### 3\. Android 运行

1.  使用 Android Studio 打开项目中的 `app` 文件夹。

2.  确保 `MainActivity.java` 中的 `WEB_URL` 指向你的前端地址（本地调试可用局域网 IP，线上可用 Vercel 域名）。

3.  连接手机或模拟器，点击 **Run**。

## 📦 部署 (Deployment)

本项目采用主流的 Serverless 和容器化部署方案：

- **前端**：部署至 **Vercel** (支持自动化构建)。

- **后端**：部署至 **Render** (支持 WebSocket 长连接)。

- **数据库**：使用 **Neon** (Serverless PostgreSQL)。

项目线上地址：https://hybrid-chat.vercel.app/
