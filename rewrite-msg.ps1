# Rewrite commit messages script
$commitMap = @{}
$commitMap["feat: 添加外部图片插入功能"] = "feat(ui): 支持外部图片链接插入"
$commitMap["feat: 新增结构化分析功能"] = "feat(ui): 新增结构化分析功能"
$commitMap["feat: 优化周记生成功能"] = "feat(weekly): 优化周记生成和查看功能"
$commitMap["feat: 新增 ImgURL 图床上传功能"] = "feat(api): 新增 ImgURL 图床上传功能"
$commitMap["feat: 分离图片上传区域并优化章节生成频率"] = "feat(ui): 分离图片上传区域，支持头部和底部图片"

$stdin = $input | Out-String
$lines = $stdin.Trim().Split("`n")
$result = @()

foreach ($line in $lines) {
    if ($line -match "^pick\s+([a-f0-9]+)\s+(.+)$") {
        $hash = $Matches[1]
        $msg = $Matches[2]
        if ($commitMap.ContainsKey($msg)) {
            $result += "pick $hash $($commitMap[$msg])"
        } else {
            $result += $line
        }
    } else {
        $result += $line
    }
}

$result -join "`n"
