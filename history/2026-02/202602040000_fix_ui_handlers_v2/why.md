# 变更提案: 修复UI事件处理器绑定问题

## 需求背景
用户报告页面出现 \TypeError: Cannot read properties of undefined (reading 'contains')\ 等运行时错误。
经排查，原因是 \index.html\ 中的 \onclick\ 事件处理器仍使用旧的参数格式（传字符串），而 \js/doing.js\ 中的函数已更新为接收 DOM 元素（\	his\）。
之前的修复尝试未能成功更新 \index.html\。

## 变更内容
1.  修正 \index.html\ 中 \	oggleTag\ 的调用方式。
2.  修正 \index.html\ 中 \	ogglePriority\ 的调用方式。

## 核心场景
### 需求: 修复按钮交互报错
#### 场景: 点击标签按钮
- **WHEN** 用户点击
