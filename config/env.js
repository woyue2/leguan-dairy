const Config = {
  app: {
    name: '智能日记本',
    version: '1.0.0',
    storageKey: 'diary_app_data'
  },

  api: {
    provider: 'zhipu',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4',
    timeout: 30000
  },

  storageKeys: {
    apiKey: 'diary_api_key',
    diaries: 'diary_entries',
    offlineQueue: 'diary_offline_queue',
    settings: 'diary_settings',
    weekly: 'weekly_entries',
    imgurlConfig: 'diary_imgurl_config'
  },

  ui: {
    maxDiaryTitleLength: 50,
    maxContentLength: 10000,
    autoSaveInterval: null
  },

  validation: {
    minContentLength: 5,
    maxOfflineQueueSize: 100
  },

  imgurl: {
    baseUrl: 'https://www.imgurl.org',
    uploadPath: '/api/v2/upload', // 默认为 V2，代码会根据 Token 格式自动调整
    maxSizeMB: 3,
    maxWidth: 1920,
    quality: 0.8,
    minQuality: 0.5,
    maxCompressTries: 3
  },

  getApiKey() {
    return localStorage.getItem(this.storageKeys.apiKey) || ''
  },

  setApiKey(key) {
    if (key && key.trim().length > 0) {
      localStorage.setItem(this.storageKeys.apiKey, key.trim())
      return true
    }
    return false
  },

  clearApiKey() {
    localStorage.removeItem(this.storageKeys.apiKey)
  },

  hasApiKey() {
    return this.getApiKey().length > 0
  },

  normalizeImgURLBaseUrl(baseUrl) {
    const input = (baseUrl || this.imgurl.baseUrl || '').trim()
    if (!input) {
      return this.imgurl.baseUrl
    }
    const uploadPath = this.imgurl.uploadPath.replace(/\/+$/, '')
    let normalized = input.replace(/\/+$/, '')
    if (normalized.toLowerCase().endsWith(uploadPath.toLowerCase())) {
      normalized = normalized.slice(0, -uploadPath.length).replace(/\/+$/, '')
    }
    return normalized || this.imgurl.baseUrl
  },

  getImgURLUploadUrl(baseUrl, isV3 = false) {
    const normalized = this.normalizeImgURLBaseUrl(baseUrl)
    const uploadPath = isV3 ? '/api/v3/upload' : '/api/v2/upload'
    return `${normalized}${uploadPath}`
  },

  getDefaultSystemPrompt() {
    return `你是一个情感分析助手，专门分析用户日记内容并提供积极的改写建议。

任务要求：
1. 根据日记内容生成一个诗意的标题（4-8个字，简短有意境）
2. 将用户日记按句子分割（非常重要！即使是连在一起的段落，也要根据标点和语义拆分成独立的句子）
3. 识别表达负面情绪的句子（悲伤、焦虑、愤怒、沮丧、绝望等）
4. 对每个负面句子提供积极的改写建议，保持原意但转换表达方式
5. 整体改写版本应该保留原文结构，只将负面表达转换为积极表达

请用JSON格式返回结果，结构如下：
{
  "title": "诗意标题（4-8个字）",
  "sentences": ["句子1", "句子2", "句子3", ...],
  "analysis": [
    {
      "index": 0,
      "sentence": "原句",
      "is_negative": true/false,
      "reason": "如果是负面句，说明原因",
      "suggestion": "改写建议"
    }
  ],
  "rewritten_version": "完整改写版本，保留原文结构，只将负面句子转换为积极表达"
}

注意：
- 标题要有诗意，可以用比喻、意象等手法
- 分句是最重要的步骤：每个句子应该完整表达一个意思，长度适中（10-50字左右）
- 即使原文是连在一起的一大段（有标点但没换行），也要拆分成多个独立句子
- rewritten_version应该尽量保持原文长度和结构
- 遇到形如 img:...png 的图片标记文本时，请保持原样，不要改写或删除
 - 如果没有负面内容，analysis数组为空，保持原句`
  },

  getStructureSystemPrompt() {
    return `你是一名写作结构优化助手。

任务要求：
1. 在不改变原文语义的前提下，优化结构与表达，让内容更清晰有条理
2. 保留原文的信息与情感，不增加虚构内容
3. 以分段形式输出，段落之间用换行分隔
4. 不要输出标题、编号或多余说明
5. 在正文末尾追加一段目录树，使用"目录树:"作为标题单独一行
6. 目录树格式类似 Linux tree，使用 ├──、└──、│ 表示层级

仅输出优化后的正文内容与目录树，不要包含JSON或代码块。`
  },

  getWeeklySystemPrompt() {
    return `你是一名周记整理与结构分析助手。

任务：根据用户提供的带日期日记，生成结构清晰、能体现日子之间变化流动的周记。

要求：
1. 先做整体结构分析，梳理本周主线与阶段变化
2. 按时间顺序组织内容，突出事件在日子之间的推进、转折与流动
3. 关注情绪或状态的变化趋势，并用自然语言串联
4. 保留关键细节，不要过度概括成流水账
5. 语言温暖治愈，但保持真实
6. 标题 4-8 个字，概括本周主题
7. summary 用分段文字输出，段落之间空一行

请用JSON格式返回：
{
  "title": "标题",
  "summary": "周记正文"
}`
  }
}
