# 变更：新增 ImgURL 图床上传功能

## 为什么
当前仅支持手动输入图片 URL，用户需要先在其他地方上传图片再复制链接。使用体验不够顺畅。

通过集成 ImgURL API，用户可以直接从本地上传图片，系统自动压缩后上传，并插入到日记中。

## ImgURL API 规范

| 项目 | 值 |
|------|-----|
| 接口地址 | `https://www.imgurl.org/api/v2/upload` |
| 请求方式 | POST multipart/form-data |
| CORS | 支持前端直传（无跨域限制） |
| 必填参数 | `uid`（用户ID）、`token`（API Token）、`file`（图片文件） |
| 支持格式 | jpg/jpeg/png/gif/bmp/webp |
| 单文件限制 | 3MB |
| 返回格式 | JSON |

### API 返回示例

```json
{
  "code": 200,
  "msg": "",
  "data": {
    "relative_path": "imgs/2025/01/26/xxx.jpg",
    "url": "https://s3.bmp.ovh/imgs/2025/01/26/xxx.jpg",
    "thumbnail_url": "https://s3.bmp.ovh/imgs/2025/01/26/xxx_thumb.jpg",
    "image_width": 1920,
    "image_height": 1080
  }
}
```

## 什么会改变
- 新增"上传图片"按钮，与现有"插入图片"按钮并列
- 新增图床设置区域（设置页内），包含 base_url、uid、token 输入框
- 新增"测试连接"按钮，验证图床 API 是否正常
- 支持选择本地图片 → 自动压缩（<3MB）→ 上传到 ImgURL → 插入图片
- 上传失败时显示错误提示，支持重试

## 影响
- 受影响的规范：新增 `imgurl-upload` 能力
- 受影响的代码：
  - `index.html` - 新增上传按钮和图床设置区域
  - `js/api.js` - 新增图片压缩和上传方法
  - `js/ui.js` - 新增上传交互逻辑
  - `config/env.js` - 新增图床 API 地址配置
  - `css/style.css` - 上传进度和提示样式
- 新增依赖：无（使用原生 Canvas 压缩）

## 压缩策略

### 压缩流程
1. **第一步**：检查文件大小
   - 如果 < 3MB，直接上传
   - 如果 >= 3MB，进入压缩流程

2. **第二步**：Canvas 压缩（循环执行，最多 3 次）
   - 最大宽度：1920px（保持比例）
   - 质量：0.8（80%）
   - 每次循环后检查大小
   - 如果仍 >= 3MB，质量递减 0.1（最低 0.5）

3. **第三步**：压缩失败处理
   - 如果 3 次循环后仍 >= 3MB
   - 显示提示"图片过大，无法压缩至 3MB 以下"
   - 拒绝上传，让用户选择其他图片

### 缩略图策略
继续沿用现有策略：提取日记内容第一张图作为缩略图，不单独存储 `thumbnail_url`。
