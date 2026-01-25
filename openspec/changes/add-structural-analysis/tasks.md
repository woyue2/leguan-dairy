## 1. 后端 API
- [x] 1.1 在 api.js 添加 analyzeStructure(content) 方法
- [x] 1.2 配置结构化分析的系统提示词
- [x] 1.3 解析结构化分析结果

## 2. 存储层
- [x] 2.1 修改 storage.js 的 Diary 数据结构，添加 structured_version 字段
- [x] 2.2 添加 saveStructuredVersion(id, version) 方法
- [x] 2.3 添加 getStructuredVersion(id) 方法

## 3. UI 层
- [x] 3.1 在 index.html 编辑器 footer 新增"结构优化"按钮
- [x] 3.2 在 index.html 新增结构化分析结果弹窗
- [x] 3.3 在 ui.js 添加 showStructureModal() / hideStructureModal()
- [x] 3.4 添加 handleStructureAnalysis() 方法
- [x] 3.5 添加 saveStructuredVersion() 方法

## 4. 测试验证
- [ ] 4.1 测试结构化分析调用
- [ ] 4.2 测试结果展示
- [ ] 4.3 测试保存功能
- [ ] 4.4 测试基于新内容再次分析
