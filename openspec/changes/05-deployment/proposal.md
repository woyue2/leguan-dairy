# 变更：部署与开源准备

## 为什么
将云端版智能日记本部署上线，并准备开源。

## 什么会改变
- 部署 Cloudflare Worker
- 部署前端到 Vercel
- 编写开源文档

## 影响
- 新增文件：`DEPLOY.md`、`README.md`、`wrangler.example.toml`
- 无现有代码修改

## 部署目标

| 服务 | 用途 | 费用 |
|------|------|------|
| Cloudflare Workers | API 后端 | 免费 |
| Cloudflare R2 | 数据存储 | 免费额度内 |
| Vercel | 前端托管 | 免费 |

## 开源内容

| 文件 | 描述 |
|------|------|
| README.md | 项目介绍、使用说明 |
| DEPLOY.md | 部署步骤 |
| wrangler.example.toml | Worker 配置模板 |
