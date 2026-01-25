## ADDED Requirements
### Requirement: 图片插入
系统 SHALL 提供用户插入外部图片链接的功能。

#### Scenario: 通过按钮插入图片
- **WHEN** 用户点击工具栏"插入图片"按钮
- **THEN** 显示图片 URL 输入弹窗
- **WHEN** 用户输入图片 URL 并点击确认
- **THEN** 图片链接插入到日记内容当前位置

#### Scenario: 通过 Ctrl+V 粘贴图片链接
- **WHEN** 用户在编辑区域按下 Ctrl+V
- **THEN** 系统检测剪贴板内容是否为 URL
- **AND** URL 以常见图片格式结尾（.jpg/.jpeg/.png/.gif/.webp）
- **THEN** 自动将图片链接插入到内容中
- **AND** 显示"已插入图片"提示

### Requirement: 图片渲染
系统 SHALL 在日记内容中渲染外部图片。

#### Scenario: 显示外部图片
- **WHEN** 日记内容包含图片 URL（`img:URL` 格式）
- **THEN** 将图片 URL 渲染为 `<img>` 标签
- **AND** 图片最大宽度为 100%
- **AND** 保持原始宽高比

#### Scenario: 图片加载失败
- **WHEN** 图片 URL 无法加载
- **THEN** 显示灰色占位符
- **AND** 占位符显示"图片"文字

### Requirement: 目录缩略图
系统 SHALL 在目录页显示日记图片缩略图。

#### Scenario: 显示缩略图
- **WHEN** 日记内容包含图片 URL
- **THEN** 提取第一个图片 URL 作为缩略图
- **AND** 显示 80x80 像素裁剪预览
- **AND** 使用 object-fit: cover 保持比例

#### Scenario: 无图片日记
- **WHEN** 日记内容不包含图片 URL
- **THEN** 显示默认图片图标
- **AND** 图标居中显示
