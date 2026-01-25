# OpenCode配置节点删除指南

## 配置文件位置
- 主配置: `C:\Users\Administrator\.config\opencode\opencode.json`
- 插件配置: `C:\Users\Administrator\.config\opencode\oh-my-opencode.json`
- 认证数据: `C:\Users\Administrator\.local\share\opencode\auth.json`

## 常用删除命令

### 1. 删除Provider节点

#### 删除MiniMax Provider：
```bash
# 使用PowerShell
cd "C:\Users\Administrator\.config\opencode"
powershell -Command "$config = Get-Content opencode.json | ConvertFrom-Json; $config.provider.PSObject.Properties.Remove('minimax'); $config | ConvertTo-Json -Depth 10 | Set-Content opencode.json"
```

#### 删除Zhipu Provider：
```bash
powershell -Command "$config = Get-Content opencode.json | ConvertFrom-Json; $config.provider.PSObject.Properties.Remove('zhupu'); $config | ConvertTo-Json -Depth 10 | Set-Content opencode.json"
```

#### 删除整个Provider配置：
```bash
powershell -Command "$config = Get-Content opencode.json | ConvertFrom-Json; $config.PSObject.Properties.Remove('provider'); $config | ConvertTo-Json -Depth 10 | Set-Content opencode.json"
```

### 2. 删除Plugin节点

#### 删除特定插件：
```bash
# 删除opencode-scheduler插件
powershell -Command "$config = Get-Content opencode.json | ConvertFrom-Json; $config.plugin = $config.plugin | Where-Object { $_ -ne 'opencode-scheduler' }; $config | ConvertTo-Json -Depth 10 | Set-Content opencode.json"

# 删除@different-ai/opencode-browser插件
powershell -Command "$config = Get-Content opencode.json | ConvertFrom-Json; $config.plugin = $config.plugin | Where-Object { $_ -ne '@different-ai/opencode-browser' }; $config | ConvertTo-Json -Depth 10 | Set-Content opencode.json"
```

#### 删除所有插件：
```bash
powershell -Command "$config = Get-Content opencode.json | ConvertFrom-Json; $config.PSObject.Properties.Remove('plugin'); $config | ConvertTo-Json -Depth 10 | Set-Content opencode.json"
```

### 3. 删除Agent配置节点

#### 删除特定Agent（从oh-my-opencode.json）：
```bash
cd "C:\Users\Administrator\.config\opencode"
powershell -Command "$config = Get-Content oh-my-opencode.json | ConvertFrom-Json; $config.agents.PSObject.Properties.Remove('sisyphus'); $config | ConvertTo-Json -Depth 10 | Set-Content oh-my-opencode.json"
```

#### 删除所有Agent配置：
```bash
powershell -Command "$config = Get-Content oh-my-opencode.json | ConvertFrom-Json; $config.PSObject.Properties.Remove('agents'); $config | ConvertTo-Json -Depth 10 | Set-Content oh-my-opencode.json"
```

### 4. 删除认证信息

#### 清空所有认证：
```bash
cd "C:\Users\Administrator\.local\share\opencode"
echo {} > auth.json
```

#### 删除特定Provider认证：
```bash
powershell -Command "$auth = Get-Content auth.json | ConvertFrom-Json; $auth.PSObject.Properties.Remove('minimax'); $auth | ConvertTo-Json -Depth 10 | Set-Content auth.json"
```

### 5. 备份配置文件

在删除前建议备份：
```bash
copy "C:\Users\Administrator\.config\opencode\opencode.json" "C:\Users\Administrator\.config\opencode\opencode.json.backup"
copy "C:\Users\Administrator\.config\opencode\oh-my-opencode.json" "C:\Users\Administrator\.config\opencode\oh-my-opencode.json.backup"
```

### 6. 验证删除结果

#### 查看当前配置：
```bash
opencode debug config
```

#### 检查Provider列表：
```bash
opencode mcp list
```

## 实际示例

### 示例1：完全重置OpenCode配置
```bash
# 备份原配置
copy "C:\Users\Administrator\.config\opencode\opencode.json" "C:\Users\Administrator\.config\opencode\opencode.json.backup"

# 创建空配置
echo '{"$schema": "https://opencode.ai/config.json"}' > "C:\Users\Administrator\.config\opencode\opencode.json"

# 清空认证
echo {} > "C:\Users\Administrator\.local\share\opencode\auth.json"
```

### 示例2：只保留Zhipu Provider，删除其他
```bash
cd "C:\Users\Administrator\.config\opencode"
powershell -Command "$config = Get-Content opencode.json | ConvertFrom-Json; $config.provider.PSObject.Properties.Remove('minimax'); $config | ConvertTo-Json -Depth 10 | Set-Content opencode.json"
```

### 示例3：移除所有插件但保留Provider
```bash
powershell -Command "$config = Get-Content opencode.json | ConvertFrom-Json; $config.plugin = @(); $config | ConvertTo-Json -Depth 10 | Set-Content opencode.json"
```

## 注意事项

1. **删除前备份**：建议在删除任何配置前先备份原文件
2. **语法正确性**：删除后确保JSON格式正确，否则OpenCode无法启动
3. **依赖关系**：某些插件可能有依赖关系，删除时需注意
4. **重启OpenCode**：配置更改后需要重启OpenCode才能生效

## 恢复配置

如果误删除需要恢复：
```bash
copy "C:\Users\Administrator\.config\opencode\opencode.json.backup" "C:\Users\Administrator\.config\opencode\opencode.json"
```