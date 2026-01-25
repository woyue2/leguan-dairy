# 离线队列能力规范

## 功能概述
当网络断开时，系统将待处理的 AI 分析任务暂存到队列中，联网后自动恢复处理。

## Requirements

### Requirement: 网络状态检测
系统 SHALL 实时检测网络连接状态。

#### Scenario: 网络断开
- **WHEN** 浏览器检测到网络断开
- **THEN** 显示离线状态提示
- **AND** 将新任务添加到离线队列
- **AND** 停止处理队列中的任务

#### Scenario: 网络恢复
- **WHEN** 浏览器检测到网络恢复
- **THEN** 显示在线状态提示
- **AND** 自动开始处理离线队列

### Requirement: 队列添加
系统 SHALL 将任务添加到离线队列。

#### Scenario: 添加分析任务
- **WHEN** 用户保存日记时网络断开
- **THEN** 创建分析任务对象
- **AND** 任务包含：类型、内容、日记ID、执行函数
- **AND** 添加到队列末尾
- **AND** 显示"网络已断开，内容将暂存后发送"

#### Scenario: 队列上限
- **WHEN** 队列已满（100项）
- **THEN** 移除最旧的任务
- **AND** 添加新任务
- **AND** 记录警告日志

### Requirement: 队列处理
系统 SHALL 自动处理离线队列。

#### Scenario: 开始处理
- **WHEN** 网络恢复且队列有任务
- **THEN** 标记 isProcessing = true
- **AND** 按顺序处理每个任务
- **AND** 显示处理进度

#### Scenario: 处理成功
- **WHEN** 任务执行成功
- **THEN** 从队列移除该任务
- **AND** 保存分析结果到数据库
- **AND** 通知监听器"itemProcessed"

#### Scenario: 处理失败（可重试）
- **WHEN** 任务执行失败
- **THEN** retryCount +1
- **AND** 如果 retryCount < 3，继续保留在队列
- **AND** 通知监听器"itemRetried"
- **AND** 5秒后重试

#### Scenario: 处理失败（超过重试次数）
- **WHEN** 任务重试达到3次仍失败
- **THEN** 从队列移除该任务
- **AND** 通知监听器"itemFailed"（包含错误信息）

### Requirement: 任务执行
系统 SHALL 执行队列中的任务。

#### Scenario: 执行函数
- **WHEN** 处理队列任务
- **THEN** 调用任务对象的 execute 方法
- **AND** 返回 Promise
- **AND** 等待完成或失败

### Requirement: 队列管理
系统 SHALL 提供队列管理功能。

#### Scenario: 获取队列大小
- **WHEN** 需要显示队列状态
- **THEN** 返回当前队列长度
- **AND** 更新 UI 显示

#### Scenario: 清空队列
- **WHEN** 需要清空所有待处理任务
- **THEN** 清空 localStorage 中的队列数据
- **AND** 重置队列长度为0
- **AND** 通知监听器"cleared"

### Requirement: 事件监听
系统 SHALL 支持事件监听模式。

#### Scenario: 监听事件
- **WHEN** 调用 on(event, callback) 注册监听器
- **THEN** 将监听器添加到列表
- **AND** 事件触发时执行回调

#### Scenario: 支持的事件
- `online` - 网络恢复
- `offline` - 网络断开
- `queueChanged` - 队列变化
- `itemProcessed` - 任务处理成功
- `itemRetried` - 任务重试
- `itemFailed` - 任务失败
- `processingStarted` - 开始处理
- `processingCompleted` - 处理完成

## 数据结构

```typescript
interface QueueItem {
  type: string;              // 任务类型，如 'analysis'
  content: string;           // 原始内容
  diaryId: string;           // 关联的日记 ID
  execute: () => Promise<any>; // 执行函数
  addedAt: string;           // 添加时间 (ISO)
  retryCount: number;        // 重试次数
}

interface QueueEventData {
  item?: QueueItem;
  index?: number;
  remaining?: number;
  count?: number;
  error?: string;
}
```

## 依赖关系

- 依赖 `data-storage` 能力：队列数据持久化
- 依赖 `sentiment-analysis` 能力：执行情绪分析任务
