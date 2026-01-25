# 项目上下文

## 目的
智能日记本 - 一款带有AI情感分析功能的日记应用。用户写完日记后可以：
1. 进行情绪分析，检测负面内容并提供积极改写建议
2. 对日记进行结构优化，保持语义但让内容更清晰有条理
3. 选择多篇日记生成周记，整合成有故事感的一周记录
4. 插入外部图片链接，丰富日记内容

## 技术栈

### 前端
- **语言**: 原生 HTML5 + CSS3 + ES6+（无框架依赖）
- **存储**: 浏览器 localStorage
- **部署**: 纯静态页面，无需后端服务器
- **PWA**: manifest.json 支持应用安装

### AI 服务
- **提供商**: 智谱AI (BigModel)
- **模型**: GLM-4
- **API**: https://open.bigmodel.cn/api/paas/v4/chat/completions
- **用途**: 情绪分析、结构优化、周记生成

### 项目结构

```
├── index.html           # 入口页面
├── manifest.json        # PWA 配置
├── config/
│   └── env.js           # 配置（API、存储键、提示词）
├── css/
│   └── style.css        # 样式文件
├── js/
│   ├── app.js           # 应用入口
│   ├── api.js           # AI API 调用
│   ├── storage.js       # 数据存储
│   ├── offline.js       # 离线队列
│   └── ui.js            # UI 组件
└── openspec/            # OpenSpec 规范
```

## 项目规范

### 代码风格
- ES6+ JavaScript（当前无 TypeScript）
- 模块化文件结构，按功能划分
- 类-based 架构（UIManager、DiaryStorage、ZhipuAPI、OfflineQueue）

### 架构模式
- 单页应用 (SPA)
- 事件驱动的 UI 更新
- 离线优先：网络断开时自动队列处理

### 存储结构

```javascript
// 日记结构
{
  id: string,              // 唯一标识
  title: string,           // 标题
  content: string,         // 原始内容
  finalVersion: string,    // 情绪分析后的版本
  structured_version: string, // 结构优化版本
  date: string,            // 日期 (YYYY-MM-DD)
  analysis: object,        // 情绪分析结果
  createdAt: string,       // 创建时间
  updatedAt: string        // 更新时间
}

// 周记结构
{
  id: string,              // weekly_YYYY-W##
  year: number,            // 年份
  weekNumber: number,      // 周数
  startDate: string,       // 周开始日期
  endDate: string,         // 周结束日期
  diaryIds: string[],      // 关联的日记 ID
  title: string,           // 周记标题
  summary: string,         // 周记内容
  createdAt: string        // 创建时间
}
```

### API 提示词

| 功能 | 提示词用途 |
|------|-----------|
| 情绪分析 | 检测负面句子，提供积极改写建议 |
| 结构优化 | 优化表达和结构，保留原文语义 |
| 周记生成 | 分析日记间变化流动，生成故事感周记 |

## 领域上下文

- **目标用户**: 需要情感支持的日记用户
- **语言**: 中文（UI 和 AI 提示词）
- **隐私**: 所有数据本地存储，仅调用 AI 时传输内容
- **离线支持**: 网络断开时自动队列，联网后处理

## 重要约束

- 仅支持静态部署（无后端）
- 受浏览器 localStorage 容量限制（通常 5-10MB）
- AI 功能需要智谱AI API Key
- 当前无用户认证系统

## 外部依赖

- 智谱AI ChatGLM-4 API: https://www.bigmodel.cn/
- 浏览器 localStorage API
