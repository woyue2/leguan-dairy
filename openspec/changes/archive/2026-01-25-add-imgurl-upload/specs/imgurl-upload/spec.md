## ADDED Requirements
### Requirement: 图床配置
系统 SHALL 允许用户配置 ImgURL 图床的 base_url、uid 和 token。

#### Scenario: 配置图床
- **WHEN** 用户进入设置页面
- **THEN** 显示"图床设置"区域（与 API Key 设置并列）
- **AND** 显示 base_url 输入框（默认 https://www.imgurl.org）
- **AND** 显示 uid 输入框和 token 输入框
- **AND** 显示"测试连接"按钮
- **AND** 显示安全提示："uid 和 token 存储在浏览器本地，请勿在公共电脑上使用"
- **WHEN** 用户输入配置并保存
- **THEN** 保存到 localStorage
- **AND** 显示"保存成功"提示

#### Scenario: 测试连接
- **WHEN** 用户点击"测试连接"按钮
- **AND** 已填写 base_url、uid、token
- **THEN** 发送测试请求到图床 API
- **AND** 显示"测试中..."状态
- **WHEN** 测试成功
- **THEN** 显示"连接成功"提示
- **WHEN** 测试失败
- **THEN** 显示具体错误信息

#### Scenario: 验证配置
- **WHEN** 用户保存配置后
- **THEN** 验证所有字段非空
- **AND** 格式错误时显示对应提示

### Requirement: 图片上传入口
系统 SHALL 提供图片上传入口。

#### Scenario: 显示上传按钮
- **WHEN** 用户进入编辑器
- **THEN** 工具栏显示两个图片相关按钮：
  - "🖼️ 图片" - 手动输入 URL（现有功能）
  - "⬆️ 上传" - 本地上传（新增功能）

### Requirement: 图片选择与格式验证
系统 SHALL 选择本地图片并验证格式。

#### Scenario: 选择图片文件
- **WHEN** 用户点击"上传"按钮
- **THEN** 打开文件选择器（accept="image/*"）
- **AND** 筛选图片格式：jpg、jpeg、png、gif、webp
- **WHEN** 用户选择图片文件
- **THEN** 验证文件格式
- **AND** 如果格式不支持，显示"不支持该格式"

### Requirement: 图片压缩
系统 SHALL 自动压缩图片至 3MB 以下。

#### Scenario: 压缩小图片
- **WHEN** 选择图片文件
- **AND** 文件大小 < 3MB
- **THEN** 跳过压缩，直接进入上传
- **AND** 不显示压缩状态

#### Scenario: 压缩大图片
- **WHEN** 选择图片文件
- **AND** 文件大小 >= 3MB
- **THEN** 显示"压缩中..."状态
- **AND** 执行压缩：
  1. Canvas 调整尺寸（最大 1920px，保持比例）
  2. 质量设为 80%（0.8）
  3. 检查压缩后大小
  4. 如果仍 >= 3MB，质量递减 0.1 重试（最多 3 次）
- **WHEN** 压缩成功（< 3MB）
- **THEN** 隐藏压缩状态，继续上传

#### Scenario: 压缩失败
- **WHEN** 3 次压缩循环后仍 >= 3MB
- **THEN** 显示提示"图片过大，无法压缩至 3MB 以下，请选择更小的图片"
- **AND** 取消上传操作
- **AND** 允许用户重新选择图片

### Requirement: 图片上传
系统 SHALL 上传压缩后的图片到 ImgURL。

#### Scenario: 上传图片
- **WHEN** 图片压缩完成
- **THEN** 显示"上传中 X%"进度
- **AND** 发送 POST 请求到 `https://www.imgurl.org/api/v2/upload`
- **AND** 请求体为 multipart/form-data，包含 file、uid、token
- **WHEN** 上传成功（code: 200）
- **THEN** 关闭进度显示
- **AND** 提取 data.url 字段
- **AND** 将 `img:url` 插入编辑器
- **AND** 显示"上传成功"提示

#### Scenario: 上传失败
- **WHEN** 上传失败（网络错误、Token 失效等）
- **THEN** 显示错误提示（具体错误信息）
- **AND** 显示"重试"按钮
- **AND** 不插入任何内容到编辑器

#### Scenario: Token 失效
- **WHEN** API 返回 401 状态码
- **THEN** 显示提示"图床 Token 已失效，请重新配置"
- **AND** 不显示重试按钮

### Requirement: ImgURL API 规范
系统 SHALL 遵循 ImgURL API 规范。

#### Scenario: API 接口
- **WHEN** 调用图床上传
- **THEN** 使用以下规范：
  - 接口地址：`https://www.imgurl.org/api/v2/upload`
  - 请求方式：POST multipart/form-data
  - 请求参数：file（文件）、uid（用户ID）、token（API Token）
  - 支持格式：jpg/jpeg/png/gif/bmp/webp
  - 单文件限制：3MB

#### Scenario: 解析返回数据
- **WHEN** ImgURL 返回成功响应（code: 200）
- **THEN** 提取 data.url 字段
- **AND** 将 URL 转换为 `img:URL` 格式
- **AND** 插入到编辑器光标位置

## 数据结构

```typescript
interface ImgURLConfig {
  uid: string;      // 用户 ID（必填）
  token: string;    // API Token（必填）
}

interface ImgURLResponse {
  code: number;     // 200 表示成功
  msg: string;      // 错误信息
  data: {
    relative_path: string;     // 相对路径
    url: string;               // 图片 URL（用于插入）
    thumbnail_url: string;     // 缩略图 URL（暂不使用）
    image_width: number;       // 宽度
    image_height: number;      // 高度
  };
}
```

## 缩略图策略

继续沿用现有策略：从日记内容提取第一张图作为缩略图，不单独存储 `thumbnail_url`。

## 依赖关系

- 依赖 `data-storage` 能力：保存图床配置
- 依赖 `external-image-insert` 能力：插入图片到编辑器
