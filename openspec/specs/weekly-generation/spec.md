# 周记生成能力规范

## 功能概述
用户可以选择多篇日记，系统调用AI将这些日记整合成一篇有故事感的周记，展示日子之间的变化流动。

## Requirements

### Requirement: 周记生成入口
系统 SHALL 提供周记生成入口。

#### Scenario: 进入周记页面
- **WHEN** 用户点击"周记"按钮
- **THEN** 显示周记选择界面
- **AND** 显示本周日记数量

### Requirement: 日记选择
系统 SHALL 支持灵活的日记选择方式。

#### Scenario: 选择自然周范围
- **WHEN** 用户选择特定自然周
- **THEN** 自动显示该周范围内的所有日记
- **AND** 日记按日期分组显示
- **AND** 默认全选该范围内日记

#### Scenario: 手动勾选日记
- **WHEN** 用户在列表中勾选/取消勾选日记
- **THEN** 更新已选择的日记数量
- **AND** 支持任意数量日记（不强制要求至少4篇）

### Requirement: 周记生成
系统 SHALL 调用AI生成周记。

#### Scenario: 生成周记
- **WHEN** 用户点击"生成周记"按钮
- **THEN** 显示生成进度（分阶段）
- **AND** 传递日记内容给AI，包含明确日期标注
- **AND** AI 分析日子之间的变化流动和情绪趋势
- **WHEN** 生成完成
- **THEN** 显示周记标题和正文

### Requirement: 智能内容处理
系统 SHALL 优化传递给AI的内容。

#### Scenario: 单篇日记压缩
- **WHEN** 单篇日记内容超过500字
- **THEN** 提取关键内容段，压缩至500字以内
- **AND** 标记被压缩的内容为"内容（摘要）"

#### Scenario: 分批处理多篇日记
- **WHEN** 选择的日记超过10篇
- **THEN** 分批调用AI API（每批最多10篇）
- **AND** 每批生成阶段摘要
- **AND** 最后合并所有摘要生成最终周记

### Requirement: 周记生成提示词
AI 提示词 SHALL 要求结构分析和变化流动分析。

#### Scenario: 提示词要求
- **WHEN** 调用AI生成周记
- **THEN** 提示词要求分析日记之间的变化流动
- **AND** 提示词要求识别情绪变化趋势
- **AND** 提示词要求发现事件发展脉络
- **AND** 标题4-8个字，概括本周主题

### Requirement: 周记结果展示
系统 SHALL 展示生成的周记。

#### Scenario: 展示周记结果
- **WHEN** AI 生成周记完成
- **THEN** 以分段文字形式展示
- **AND** 标题体现本周主题或变化
- **AND** 内容展现日子之间的变化流动
- **AND** 语言温暖治愈

### Requirement: 周记操作
系统 SHALL 支持周记的保存、重新生成和删除。

#### Scenario: 保存周记
- **WHEN** 用户点击"保存周记"按钮
- **THEN** 创建周记记录，关联选中的日记ID
- **AND** 保存到周记存储
- **AND** 显示"周记已保存"

#### Scenario: 重新生成周记
- **WHEN** 用户点击"重新生成"按钮
- **THEN** 重新调用AI生成周记
- **AND** 计数 regenerations +1

#### Scenario: 删除周记
- **WHEN** 用户点击"删除"按钮
- **THEN** 确认后删除周记记录
- **AND** 不影响关联的日记

### Requirement: 周记存储
系统 SHALL 提供周记的存储能力。

#### Scenario: 创建周记
- **WHEN** 用户保存周记
- **THEN** 生成周记 ID（格式：weekly_YYYY-W##）
- **AND** 关联所选日记的 ID 列表
- **AND** 保存到 weekly 存储

#### Scenario: 按周查找周记
- **WHEN** 需要查找特定周的周记
- **THEN** 根据 year 和 weekNumber 查找
- **AND** 返回匹配的周记或 null

## 数据结构

```typescript
interface WeeklySummary {
  id: string;              // weekly_YYYY-W##
  year: number;            // 年份
  weekNumber: number;      // 周数 (1-52/53)
  startDate: string;       // 周开始日期 (YYYY-MM-DD)
  endDate: string;         // 周结束日期 (YYYY-MM-DD)
  diaryIds: string[];      // 关联的日记 ID 列表
  title: string;           // 周记标题 (4-8字)
  summary: string;         // 周记正文（分段文字）
  createdAt: string;       // 创建时间
  regenerations: number;   // 重新生成次数
}
```

## 依赖关系

- 依赖 `data-storage` 能力：存储周记和读取日记
- 依赖 `offline-queue` 能力：网络断开时队列处理
