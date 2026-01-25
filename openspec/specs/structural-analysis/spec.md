## ADDED Requirements
### Requirement: 结构化分析入口
系统 SHALL 在编辑器提供独立的"结构优化"按钮，与"保存并分析"并列显示。

#### Scenario: 显示结构优化按钮
- **WHEN** 用户进入编辑器页面
- **THEN** 在编辑器 footer 区域显示"结构优化"按钮
- **AND** 按钮与"保存并分析"按钮并排显示

### Requirement: 结构化分析请求
系统 SHALL 调用 AI 生成日记结构优化建议，不改变原文内容。

#### Scenario: 执行结构化分析
- **WHEN** 用户点击"结构优化"按钮
- **THEN** 显示加载进度（复用现有进度样式）
- **AND** 调用智谱AI API 发送结构化分析请求
- **WHEN** 分析完成
- **THEN** 关闭加载进度，显示分析结果弹窗

### Requirement: 结构化分析结果展示
系统 SHALL 以分段文字形式展示结构优化建议。

#### Scenario: 展示分析结果
- **WHEN** 结构化分析完成
- **THEN** 弹窗显示优化后的日记内容
- **AND** 内容按段落/章节分段显示
- **AND** 保持原文语义，仅优化表达和结构

### Requirement: 保存结构化结果
系统 SHALL 允许用户将结构化分析结果保存为日记内容。

#### Scenario: 保存结构化版本
- **WHEN** 用户在结构化分析弹窗中点击"采用优化"
- **THEN** 将优化内容保存为 diary.structured_version
- **AND** 关闭弹窗，显示"已保存"提示
- **AND** 下次进入编辑器时显示优化后的内容

### Requirement: 基于新内容分析
系统 SHALL 在用户采用结构化结果后，基于新内容进行后续分析。

#### Scenario: 编辑器加载结构化版本
- **WHEN** 用户进入已保存结构化版本的日记编辑页面
- **THEN** 编辑器内容区域显示 structured_version
- **AND** 后续的情绪分析和结构优化都基于此版本

#### Scenario: 多次结构优化
- **WHEN** 用户对已优化的日记再次点击"结构优化"
- **THEN** 基于上次保存的 structured_version 进行分析
- **AND** 生成新的优化建议（可迭代优化）
