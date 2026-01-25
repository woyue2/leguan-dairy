## ADDED Requirements
### Requirement: 登录页面
系统 SHALL 提供登录页面。

#### Scenario: 显示登录表单
- **WHEN** 用户访问登录页面
- **THEN** 显示用户名输入框
- **AND** 显示密码输入框
- **AND** 显示"记住登录"复选框
- **AND** 显示"登录"按钮
- **AND** 显示"注册"链接

#### Scenario: 登录成功
- **WHEN** 用户输入正确凭证并登录
- **THEN** 调用登录 API
- **AND** 保存 Token 到 localStorage
- **AND** 跳转到日记页面

#### Scenario: 登录失败
- **WHEN** 登录失败
- **THEN** 显示错误提示

### Requirement: 注册页面
系统 SHALL 提供注册页面。

#### Scenario: 显示注册表单
- **WHEN** 用户访问注册页面
- **THEN** 显示用户名输入框
- **AND** 显示密码输入框
- **AND** 显示确认密码输入框
- **AND** 显示"注册"按钮
- **AND** 显示"已有账号？去登录"链接

#### Scenario: 注册成功
- **WHEN** 用户填写有效信息并注册
- **THEN** 调用注册 API
- **AND** 跳转到登录页面
- **AND** 显示"请登录"提示

#### Scenario: 注册失败
- **WHEN** 注册失败（用户名已存在、密码不符合要求）
- **THEN** 显示对应错误提示

### Requirement: 修改密码
系统 SHALL 提供修改密码功能。

#### Scenario: 显示修改密码表单
- **WHEN** 用户进入设置页面
- **AND** 已登录
- **THEN** 显示旧密码输入框
- **AND** 显示新密码输入框
- **AND** 显示确认密码输入框
- **AND** 显示"修改密码"按钮

#### Scenario: 修改成功
- **WHEN** 用户输入正确信息并提交
- **THEN** 调用修改密码 API
- **AND** 显示"修改成功"提示

### Requirement: API Client
系统 SHALL 提供统一的 API 调用层。

#### Scenario: 自动携带 Token
- **WHEN** 发起 API 请求
- **THEN** 自动添加 Authorization header

#### Scenario: 401 处理
- **WHEN** API 返回 401
- **THEN** 跳转登录页面
- **AND** 清除本地 Token

## 页面结构

```html
<!-- login.html -->
<input type="text" name="username" placeholder="用户名">
<input type="password" name="password" placeholder="密码">
<input type="checkbox" name="remember"> 记住登录
<button type="submit">登录</button>
<a href="register.html">注册账号</a>
```

## 依赖关系

- 前置：01-user-auth
