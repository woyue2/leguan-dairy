# 变更：前端用户界面

## 为什么
为云端版智能日记本提供登录、注册前端页面。

## 什么会改变
- 新增 login.html（登录页面）
- 新增 register.html（注册页面）
- 修改 settings.html（添加修改密码）
- 新增 js/api-client.js（API 调用层）

## 影响
- 新增文件：login.html、register.html、js/api-client.js
- 修改文件：settings.html

## 页面功能

| 页面 | 功能 |
|------|------|
| login.html | 用户名/密码登录、记住登录、注册链接 |
| register.html | 用户名/密码注册、表单验证 |
| settings.html | 修改密码（新增） |

## API Client 功能

| 功能 | 描述 |
|------|------|
| 自动携带 Token | 每次请求自动附加 Authorization header |
| 401 处理 | 跳转登录页面 |
| 错误提示 | 统一的错误显示 |
