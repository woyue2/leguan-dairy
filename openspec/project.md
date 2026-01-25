# 项目上下文

## 目的
智能日记本 - 一款带有AI情感分析功能的日记应用。写完日记后自动检测负面内容并提供积极改写建议。

## 技术栈
- **前端**: 原生 HTML5 + CSS3 + ES6+（无框架依赖）
- **存储**: localStorage 本地存储
- **AI**: 智谱AI ChatGLM-4 API（情绪分析）
- **部署**: 纯静态页面，无需后端
- **PWA**: manifest.json 支持应用安装

## 项目规范

### 代码风格
- ES6+ JavaScript（当前无 TypeScript）
- 模块化文件结构，位于 `/js` 目录
- 样式统一在 `/css/style.css`

### 架构模式
- 单页应用（SPA）
- JS 模块划分：app.js（入口）、api.js（AI 调用）、storage.js（存储）、offline.js（离线队列）、ui.js（UI 组件）
- 事件驱动的 UI 更新机制

### 测试策略
- 当前代码库暂无自动化测试
- AI 功能和离线行为需手动测试

### Git 工作流
- 基于功能的分支策略
- 约定式提交（当前未强制执行）

## 领域上下文
- AI 驱动的情绪健康/日记领域
- 支持中文（UI 和 AI 提示词）
- 隐私优先：所有数据本地存储，仅在需要时调用 API
- 离线优先：网络断开时自动队列处理

## 重要约束
- 仅支持静态部署（无后端服务器）
- 受浏览器 localStorage 容量限制
- 使用 AI 功能需要配置智谱AI API Key
- 当前无用户认证系统

## 外部依赖
- 智谱AI ChatGLM-4 API（https://www.bigmodel.cn/）
- 浏览器 localStorage API
