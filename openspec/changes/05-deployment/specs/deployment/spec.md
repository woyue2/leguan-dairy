## ADDED Requirements
### Requirement: Worker 部署
系统 SHALL 部署到 Cloudflare Workers。

#### Scenario: 部署 Worker
- **WHEN** 运行部署命令
- **THEN** 上传 Worker 代码到 Cloudflare
- **AND** 绑定 R2 存储桶
- **AND** 设置环境变量

#### Scenario: 部署验证
- **WHEN** 部署完成后
- **THEN** API 接口可访问
- **AND** R2 读写正常

### Requirement: 前端部署
系统 SHALL 部署前端到 Vercel。

#### Scenario: 部署前端
- **WHEN** Vercel 构建完成
- **THEN** 前端页面可访问
- **AND** API 请求正常工作
- **AND** 静态资源加载正常

### Requirement: 开源文档
系统 SHALL 提供完整的开源文档。

#### Scenario: README 文档
- **WHEN** 用户访问 GitHub 仓库
- **THEN** 可以了解项目用途
- **AND** 可以了解功能特性
- **AND** 可以查看截图

#### Scenario: 部署文档
- **WHEN** 用户想要自部署
- **AND** 可以按照 DEPLOY.md 步骤部署
- **AND** 配置 wrangler.example.toml
- **AND** 部署成功

#### Scenario: 配置模板
- **WHEN** 用户想要部署
- **AND** 可以使用 wrangler.example.toml
- **AND** 只需要填写自己的配置
- **AND** 无需修改代码

## 部署清单

| 项目 | 描述 |
|------|------|
| Worker URL | Cloudflare Workers 访问地址 |
| R2 Bucket | 存储桶名称和绑定 |
| JWT_SECRET | Token 签名密钥 |
| 前端 API 地址 | Vercel 访问地址 |

## 依赖关系

- 前置：01-user-auth、02-cloud-storage、03-data-sync、04-frontend-auth
