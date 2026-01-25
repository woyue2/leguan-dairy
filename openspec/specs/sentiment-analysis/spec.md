# 情绪分析能力规范

## 功能概述
用户保存日记后，可以调用智谱AI进行情绪分析。系统会检测日记中的负面情绪表达，并提供积极的改写建议。

## Requirements

### Requirement: 情绪分析触发
用户保存日记时，系统 SHALL 自动触发情绪分析。

#### Scenario: 保存并分析
- **WHEN** 用户点击"保存并分析"按钮
- **THEN** 显示分析进度（进度条 + 状态文字）
- **AND** 调用智谱AI API 分析日记内容
- **WHEN** 分析完成
- **THEN** 关闭进度显示，显示分析结果弹窗
- **AND** 原始内容保留，analysis 结果存储到数据库

### Requirement: 情绪分析结果展示
系统 SHALL 展示情绪分析结果，包括原文和改写版本。

#### Scenario: 展示原文（负面句子标记）
- **WHEN** 显示分析结果弹窗
- **THEN** 显示原文内容
- **AND** 负面句子用红色背景标记
- **AND** 鼠标悬停显示改写建议
- **AND** 非负面句子正常显示

#### Scenario: 展示积极改写版本
- **WHEN** 显示分析结果弹窗
- **THEN** 显示改写后的版本
- **AND** 改写版本只替换负面表达，保留原文结构和长度

### Requirement: 情绪分析输出格式
AI 分析结果 SHALL 包含以下结构化数据。

#### Scenario: AI 返回 JSON 格式
- **WHEN** 智谱AI 返回分析结果
- **THEN** 解析 JSON 格式响应
- **AND** 提取字段：title（诗意标题）、sentences（句子列表）、analysis（分析结果）、rewritten_version（改写版本）
- **AND** analysis 数组每项包含：index、sentence、is_negative、reason、suggestion

### Requirement: 采用或保留原文
用户 SHALL 选择使用改写版本或保留原文。

#### Scenario: 采用改写版本
- **WHEN** 用户点击"采用改写"按钮
- **THEN** 将 rewritten_version 保存为 finalVersion
- **AND** 关闭弹窗，显示"已采用改写版本"

#### Scenario: 保留原文
- **WHEN** 用户点击"保留原文"按钮
- **THEN** 将 original_content 保存为 finalVersion
- **AND** 关闭弹窗，显示"已保留原文"

### Requirement: 图片处理
系统 SHALL 在分析时忽略图片链接标记。

#### Scenario: 跳过图片标记
- **WHEN** 日记内容包含 `img:URL` 格式的图片链接
- **THEN** 分析前将图片行从内容中移除
- **AND** 分析完成后恢复图片链接显示

## 数据结构

```typescript
interface SentimentAnalysis {
  title: string;           // AI 生成的诗意标题
  sentences: string[];     // 分割后的句子列表
  analysis: SentenceAnalysis[];
  rewritten_version: string; // 改写后的完整版本
  raw_response: string;    // AI 原始响应
}

interface SentenceAnalysis {
  index: number;
  sentence: string;
  is_negative: boolean;
  reason: string;          // 负面原因
  suggestion: string;      // 改写建议
}
```

## 依赖关系

- 依赖 `data-storage` 能力：存储分析结果
- 依赖 `offline-queue` 能力：网络断开时队列处理
