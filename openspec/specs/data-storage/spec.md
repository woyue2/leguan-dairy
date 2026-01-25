# 数据存储能力规范

## 功能概述
系统使用浏览器 localStorage 持久化存储所有数据，包括日记、周记、API Key、设置和离线队列。

## Requirements

### Requirement: 日记 CRUD
系统 SHALL 提供日记的创建、读取、更新、删除能力。

#### Scenario: 创建日记
- **WHEN** 用户保存新日记
- **THEN** 生成唯一 ID（时间戳 + 随机数）
- **AND** 设置 createdAt 和 updatedAt
- **AND** 保存到 diaries 存储
- **AND** 返回新日记对象

#### Scenario: 读取日记列表
- **WHEN** 需要显示日记列表
- **THEN** 从 localStorage 读取所有日记
- **AND** 按日期降序排序（最新在前）
- **AND** 返回日记数组

#### Scenario: 读取单篇日记
- **WHEN** 用户查看或编辑特定日记
- **THEN** 根据 ID 查找日记
- **AND** 返回匹配的日记对象或 null

#### Scenario: 更新日记
- **WHEN** 用户保存已存在的日记
- **THEN** 更新对应 ID 的日记数据
- **AND** 更新 updatedAt 时间戳
- **AND** 保留原始 createdAt

#### Scenario: 删除日记
- **WHEN** 用户删除日记
- **THEN** 从存储中移除该日记
- **AND** 不影响其他日记

### Requirement: 日记分析结果存储
系统 SHALL 存储情绪分析结果。

#### Scenario: 保存分析结果
- **WHEN** 情绪分析完成
- **THEN** 保存 analysis 数据到日记
- **AND** 更新 title（AI 生成的新标题）
- **AND** 保存 finalVersion（改写版本或原文）

#### Scenario: 保存结构优化结果
- **WHEN** 用户采用结构优化结果
- **THEN** 保存 structured_version 字段
- **AND** 下次编辑时显示优化后的内容

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

### Requirement: API Key 管理
系统 SHALL 提供 API Key 的存储和管理。

#### Scenario: 保存 API Key
- **WHEN** 用户在设置页面保存 API Key
- **THEN** 加密存储到 localStorage
- **AND** 返回保存结果

#### Scenario: 验证 API Key
- **WHEN** 用户点击验证
- **THEN** 调用智谱AI API 验证 Key 有效性
- **AND** 返回验证结果（有效/无效/错误信息）

### Requirement: 数据导出导入
系统 SHALL 支持数据的备份和恢复。

#### Scenario: 导出数据
- **WHEN** 用户点击导出
- **THEN** 导出所有日记为 JSON 文件
- **AND** 触发浏览器下载

#### Scenario: 导入数据
- **WHEN** 用户选择 JSON 文件导入
- **THEN** 解析 JSON 数据
- **AND** 合并到现有日记（去重）
- **AND** 显示导入数量

### Requirement: 存储空间处理
系统 SHALL 处理存储空间限制。

#### Scenario: 存储空间不足
- **WHEN** 保存数据时 localStorage 满
- **THEN** 抛出错误提示"存储空间不足"
- **AND** 不丢失现有数据

#### Scenario: 读取存储失败
- **WHEN** 读取 localStorage 失败
- **THEN** 返回空数组/默认值
- **AND** 记录错误日志

## 存储键定义

| 存储项 | 键名 | 数据类型 |
|--------|------|----------|
| API Key | diary_api_key | string |
| 日记 | diary_entries | JSON 数组 |
| 离线队列 | diary_offline_queue | JSON 数组 |
| 设置 | diary_settings | JSON 对象 |
| 周记 | weekly_entries | JSON 数组 |

## 依赖关系

- 无外部依赖，直接操作 localStorage API
