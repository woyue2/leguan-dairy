# 技术设计: 修复UI交互问题
## 技术方案
### 实现要点
1. **CSS修复**: 在 css/style.css 的 :root 中定义 --accent-color。
2. **HTML修复**: 修改 index.html 中的 toggleTag 调用，传 this。
3. **JS修复**: 在 js/doing.js 中添加 togglePriority(priority, btn) 函数并更新 renderTasks。
