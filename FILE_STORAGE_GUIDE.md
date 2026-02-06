# File System API 存储方案 - 使用指南

## 已完成的功能

### 1. 核心 File System API 实现
- ✅ `FileSystemStorage` 类:管理文件句柄和 IndexedDB
- ✅ `DiaryStorage` 类改造:支持文件存储 + localStorage 降级
- ✅ 自动保存到 JSON 文件 (`diary.json` 和 `weekly.json`)
- ✅ 文件句柄持久化 (存储在 IndexedDB 中)
- ✅ 刷新页面后自动恢复文件连接

### 2. UI 显示
- ✅ Header 中显示当前存储状态
- ✅ 显示 JSON 文件名称和位置
- ✅ 颜色标识:
  - 🟢 绿色: 文件存储模式
  - 🟠 橙色: localStorage (可升级)
  - ⚪ 灰色: localStorage (浏览器不支持)

### 3. 升级机制
- ✅ 点击存储状态可升级到文件存储
- ✅ 自动迁移 localStorage 数据到文件
- ✅ 用户确认对话框

## 使用方法

### 首次使用 (文件存储模式)

1. **打开应用**
   - 应用会检查是否已授权文件访问

2. **升级到文件存储**
   - 点击 Header 中的存储状态文本
   - 在弹出框中点击"确定"
   - 浏览器会弹出文件选择对话框
   - 选择保存位置和文件名 (默认: `diary.json`)

3. **自动保存**
   - 之后的所有操作都会自动保存到该文件
   - 无需手动操作

4. **刷新页面**
   - 文件句柄会自动从 IndexedDB 恢复
   - 继续使用之前的文件

### 数据文件位置

选择的 JSON 文件会保存在你选择的位置,例如:
- Windows: `C:\Users\YourName\Documents\diary.json`
- macOS: `/Users/YourName/Documents/diary.json`
- Linux: `/home/yourname/Documents/diary.json`

**注意**: 应用会告诉你文件的实际路径!

## 兼容性

### 支持的浏览器
- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+
- ⚠️ Safari (部分支持,需要用户授权)
- ❌ Firefox (不支持)

### 降级方案
如果浏览器不支持 File System API,应用会自动降级到 localStorage:
- 所有功能正常使用
- Header 会显示"浏览器不支持文件API"

## 数据格式

### diary.json
```json
[
  {
    "id": "...",
    "content": "日记内容",
    "title": "标题",
    "date": "2026-01-01",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "analysis": null,
    "images": [],
    "footer_images": []
  }
]
```

### weekly.json
```json
[
  {
    "id": "weekly_...",
    "title": "周记标题",
    "summary": "周记内容",
    "startDate": "2026-01-01",
    "endDate": "2026-01-07",
    "images": [],
    "footer_images": []
  }
]
```

## 常见问题

### Q: 刷新页面后数据会丢失吗?
**A**: 不会。文件句柄存储在 IndexedDB 中,刷新后自动恢复连接。

### Q: 我可以修改 JSON 文件吗?
**A**: 可以!但要注意:
- 保持 JSON 格式正确
- 保存后刷新页面即可看到修改

### Q: 如何备份?
**A**: 两种方式:
1. 直接复制 `diary.json` 文件
2. 使用"导出数据"功能 (仍然可用)

### Q: 如何更换存储位置?
**A**:
1. 关闭应用
2. 清除浏览器的 IndexedDB (开发者工具 → Application → IndexedDB)
3. 重新打开应用,重新选择文件

## 开发者信息

### 需要异步化的方法

以下方法现在是异步的,需要使用 `await`:
- `storage.getAll()`
- `storage.getById(id)`
- `storage.create(diary)`
- `storage.update(id, updates)`
- `storage.delete(id)`
- `storage.saveAnalysis(id, analysisData)`
- `storage.getAllWeekly()`
- `storage.createWeekly(weekly)`
- `storage.updateWeekly(id, updates)`
- `storage.deleteWeekly(id)`

同步方法 (无需改动):
- `storage.generateId()`
- `storage.extractTitle(content)`
- `storage.getImgURLConfig()`
- `storage.saveImgURLConfig(config)`
- `storage.getWeekStartDate(year, weekNumber)`
- `storage.getWeekEndDate(year, weekNumber)`
- `storage.getWeekRangeByDate(date)`
- `storage.getISOWeekNumber(date)`
- `storage.formatDateToISO(date)`
- `storage.compressDiaryContent(content, maxLength)`

### 测试

本地测试服务器:
```bash
python3 -m http.server 8888
```

访问: http://localhost:8888

## 已知限制

1. **HTTPS 要求**: File System API 只在 HTTPS 或 localhost 下工作
2. **Safari 支持**: Safari 对 File System API 支持有限
3. **文件权限**: 首次访问需要用户授权
4. **句柄失效**: 如果删除了文件,需要重新选择

## 下一步优化

- [ ] 添加自动备份功能
- [ ] 支持多个数据文件
- [ ] 添加文件锁定机制
- [ ] 实现自动同步到云端
