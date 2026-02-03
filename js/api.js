class ZhipuAPI {
  constructor() {
    this.config = Config.api
    this.controller = null
  }

  getHeaders(providedKey = null) {
    const apiKey = providedKey || Config.getApiKey()
    if (!apiKey) {
      throw new Error('API Key未设置')
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  }

  async analyze(content, retryCount = 0) {
    const cleanedContent = this.stripImageLines(content || '')
    if (!cleanedContent || cleanedContent.trim().length < Config.validation.minContentLength) {
      throw new Error('内容太短，无法分析')
    }

    if (!Config.hasApiKey()) {
      throw new Error('请先设置智谱AI API Key')
    }

    if (!navigator.onLine) {
      throw new Error('网络连接已断开')
    }

    this.controller = new AbortController()
    const timeoutId = setTimeout(() => this.controller.abort(), this.config.timeout)

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: Config.getDefaultSystemPrompt()
            },
            {
              role: 'user',
              content: cleanedContent
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
        signal: this.controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000
          console.log(`请求频率限制，等待${delay / 1000}秒后重试...`)
          await this.delay(delay)
          return this.analyze(cleanedContent, retryCount + 1)
        }

        throw this.handleErrorResponse(response.status, errorData)
      }

      const data = await response.json()
      return this.parseResponse(data)

    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new Error('请求超时，请重试')
      }

      throw error
    }
  }

  async analyzeStructure(content, onProgress) {
    const cleanedContent = this.stripImageLines(content || '')
    if (!cleanedContent || cleanedContent.trim().length < Config.validation.minContentLength) {
      throw new Error('内容太短，无法优化结构')
    }

    if (!Config.hasApiKey()) {
      throw new Error('请先设置智谱AI API Key')
    }

    if (!navigator.onLine) {
      throw new Error('网络连接已断开')
    }

    this.controller = new AbortController()
    const timeoutId = setTimeout(() => this.controller.abort(), this.config.timeout)

    if (onProgress) {
      onProgress(10, '准备结构优化...', '正在发送请求')
    }

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: Config.getStructureSystemPrompt()
            },
            {
              role: 'user',
              content: cleanedContent
            }
          ],
          temperature: 0.4,
          max_tokens: 2000
        }),
        signal: this.controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw this.handleErrorResponse(response.status, errorData)
      }

      if (onProgress) {
        onProgress(70, '正在生成优化结果...', '即将完成')
      }

      const data = await response.json()
      return this.parseStructureResponse(data)
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请重试')
      }
      throw error
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  handleErrorResponse(status, errorData) {
    const errorMessages = {
      401: 'API Key无效，请检查配置',
      403: '没有访问权限，请检查API Key权限',
      429: '请求频率过高，请稍后再试',
      500: '服务器错误，请重试',
      503: '服务暂时不可用，请稍后再试'
    }

    const message = errorMessages[status] ||
      errorData.error?.message ||
      `请求失败 (${status})`

    return new Error(message)
  }

  parseResponse(data) {
    try {
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('API返回数据格式错误')
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        console.warn('无法解析JSON，尝试手动解析:', content)
        return this.fallbackParse(content)
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        title: parsed.title || '',
        sentences: parsed.sentences || [],
        analysis: parsed.analysis || [],
        rewritten_version: parsed.rewritten_version || '',
        raw_response: content
      }

    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      console.error('解析响应失败:', error)
      throw new Error('解析分析结果失败')
    }
  }

  parseStructureResponse(data) {
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('API返回数据格式错误')
    }

    const trimmed = content.trim()
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const parsed = (() => {
        try {
          return JSON.parse(jsonMatch[0])
        } catch (error) {
          return null
        }
      })()
      if (parsed) {
        const structured = parsed.structured_version || parsed.content || parsed.result
        if (structured) {
          return {
            structured_version: String(structured).trim(),
            raw_response: trimmed
          }
        }
      }
    }

    const withoutFence = trimmed
      .replace(/^```[a-zA-Z]*\n?/, '')
      .replace(/```$/, '')
      .trim()

    return {
      structured_version: withoutFence,
      raw_response: trimmed
    }
  }

  fallbackParse(content) {
    return {
      sentences: content.split(/[。！？\n]/).filter(s => s.trim()),
      analysis: [],
      rewritten_version: content,
      raw_response: content,
      parse_warning: '自动解析结果，可能不准确'
    }
  }

  async validateApiKey(providedKey = null) {
    const apiKey = providedKey || Config.getApiKey()
    if (!apiKey) {
      return { valid: false, error: 'API Key未设置' }
    }

    try {
      this.controller = new AbortController()
      const timeoutId = setTimeout(() => this.controller.abort(), 10000)

      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(apiKey),
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 10
        }),
        signal: this.controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return { valid: true }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { valid: false, error: errorData.error?.message || 'API Key无效' }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { valid: false, error: '验证超时' }
      }
      return { valid: false, error: '网络错误' }
    }
  }

  abort() {
    if (this.controller) {
      this.controller.abort()
    }
  }

  stripImageLines(content) {
    return content
      .split('\n')
      .filter(line => !line.trim().startsWith('img:'))
      .join('\n')
      .trim()
  }

  getImgURLOutputType(inputType) {
    const type = (inputType || '').toLowerCase()
    if (type === 'image/jpeg' || type === 'image/jpg') {
      return 'image/jpeg'
    }
    if (type === 'image/webp') {
      return 'image/webp'
    }
    return 'image/jpeg'
  }

  getImgURLOutputFilename(name, outputType) {
    const base = (name || 'image').replace(/\.[^/.]+$/, '')
    if (outputType === 'image/webp') {
      return `${base}.webp`
    }
    return `${base}.jpg`
  }

  loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('图片读取失败'))
      }
      img.src = url
    })
  }

  canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('图片压缩失败'))
          return
        }
        resolve(blob)
      }, type, quality)
    })
  }

  resizeImageToCanvas(img, maxWidth) {
    const scale = Math.min(1, maxWidth / img.width)
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)
    return canvas
  }

  async compressImage(file, maxSizeMB = Config.imgurl.maxSizeMB, maxWidth = Config.imgurl.maxWidth, quality = Config.imgurl.quality, minQuality = Config.imgurl.minQuality, maxTries = Config.imgurl.maxCompressTries) {
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size < maxSize) {
      return {
        blob: file,
        filename: file.name || 'image',
        skipped: true
      }
    }

    const img = await this.loadImageFromFile(file)
    const outputType = this.getImgURLOutputType(file.type)
    let currentQuality = quality
    let attempt = 0
    let lastBlob = null

    while (attempt < maxTries) {
      const canvas = this.resizeImageToCanvas(img, maxWidth)
      const blob = await this.canvasToBlob(canvas, outputType, currentQuality)
      lastBlob = blob
      if (blob.size < maxSize) {
        return {
          blob,
          filename: this.getImgURLOutputFilename(file.name, outputType),
          skipped: false
        }
      }
      currentQuality = Math.max(minQuality, currentQuality - 0.1)
      attempt += 1
    }

    if (lastBlob && lastBlob.size < maxSize) {
      return {
        blob: lastBlob,
        filename: this.getImgURLOutputFilename(file.name, outputType),
        skipped: false
      }
    }

    throw new Error('图片过大，无法压缩至 3MB 以下，请选择更小的图片')
  }

  uploadToImgURL(blob, filename, config, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', blob, filename)

      // V3 接口规范：Authorization: Bearer <token>
      const token = (config.token || '').trim()

      const xhr = new XMLHttpRequest()
      // 直接使用配置的 uploadUrl
      xhr.open('POST', config.upload_url || Config.imgurl.uploadUrl)
      xhr.responseType = 'json'

      // 设置 Authorization Header (V3 规范)
      const headerValue = token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`
      xhr.setRequestHeader('Authorization', headerValue)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      }

      xhr.onload = () => {
        const response = xhr.response || {}
        if (xhr.status === 200 && response.code === 200) {
          resolve({
            url: response.data?.url || ''
          })
          return
        }
        if (response.code === 401) {
          const error = new Error('图床 Token 已失效，请重新配置')
          error.code = 'UNAUTHORIZED'
          reject(error)
          return
        }
        if (response.code === 429) {
          const error = new Error('请稍后再试')
          error.code = 'RATE_LIMIT'
          reject(error)
          return
        }
        if (xhr.status === 401) {
          const error = new Error('图床 Token 已失效，请重新配置')
          error.code = 'UNAUTHORIZED'
          reject(error)
          return
        }
        if (xhr.status === 429) {
          const error = new Error('请稍后再试')
          error.code = 'RATE_LIMIT'
          reject(error)
          return
        }
        if (xhr.status >= 500) {
          const error = new Error('服务器错误，请重试')
          error.code = 'SERVER_ERROR'
          reject(error)
          return
        }
        const responseMessage = response.msg || response.message || ''
        if (responseMessage === 'invalid.token') {
          const error = new Error('图床 Token 无效，请到 ImgURL 后台重新生成')
          error.code = 'UNAUTHORIZED'
          reject(error)
          return
        }
        const error = new Error(responseMessage || '上传失败')
        error.code = 'UPLOAD_FAILED'
        reject(error)
      }

      xhr.onerror = () => {
        const error = new Error('网络错误')
        error.code = 'NETWORK_ERROR'
        reject(error)
      }

      xhr.onabort = () => {
        const error = new Error('上传已取消')
        error.code = 'ABORTED'
        reject(error)
      }

      xhr.send(formData)
    })
  }

  async createTestImageBlob() {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1, 1)
    return this.canvasToBlob(canvas, 'image/png', 0.9)
  }

  async testImgURLConnection(config) {
    const blob = await this.createTestImageBlob()
    const filename = `test-${Date.now()}.png`
    const result = await this.uploadToImgURL(blob, filename, config)
    return result
  }

  async generateWeeklySummary(diaries, onProgress) {
    if (!diaries || diaries.length === 0) {
      throw new Error('没有可用于生成周记的日记')
    }

    if (!Config.hasApiKey()) {
      throw new Error('请先设置智谱AI API Key')
    }

    if (!navigator.onLine) {
      throw new Error('网络连接已断开')
    }

    const maxDiaryLength = 500
    const batchSize = 10

    this.controller = new AbortController()

    if (onProgress) {
      onProgress(10, '整理日记中...', '正在收集日记内容')
    }

    const diaryContent = this.buildWeeklyDiaryContent(diaries, maxDiaryLength)
    const batches = this.splitWeeklyBatches(diaryContent, batchSize)

    try {
      if (batches.length === 1) {
        const result = await this.requestWeeklySummary(
          batches[0].join('\n\n'),
          onProgress,
          '原始日记内容'
        )
        return result
      }

      const batchSummaries = []
      for (let i = 0; i < batches.length; i += 1) {
        const percent = 20 + Math.round((i / batches.length) * 50)
        if (onProgress) {
          onProgress(percent, `分批处理中 (${i + 1}/${batches.length})`, '正在生成阶段摘要')
        }
        const summary = await this.requestWeeklyBatchSummary(
          batches[i].join('\n\n'),
          i + 1,
          batches.length
        )
        batchSummaries.push(`第${i + 1}批摘要：\n${summary}`)
      }

      if (onProgress) {
        onProgress(75, '合并周记中...', '正在汇总整体结构')
      }

      const mergedContent = batchSummaries.join('\n\n')
      const result = await this.requestWeeklySummary(mergedContent, onProgress, '分批摘要内容')
      return result

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求已取消')
      }
      throw error
    }
  }

  buildWeeklyDiaryContent(diaries, maxDiaryLength) {
    const storage = new DiaryStorage()
    return diaries.map(diary => {
      const date = this.formatWeeklyDate(diary.date)
      const title = diary.title ? `《${diary.title}》` : ''
      const content = diary.structured_version || diary.finalVersion || diary.content || ''
      const cleaned = this.stripImageLines(content)
      const compressed = storage.compressDiaryContent(cleaned, maxDiaryLength)
      const isCompressed = cleaned.length > maxDiaryLength
      const label = isCompressed ? '内容（摘要）' : '内容'
      return `【${date}】${title}\n${label}：${compressed}`
    })
  }

  splitWeeklyBatches(entries, batchSize) {
    const batches = []
    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize))
    }
    return batches
  }

  formatWeeklyDate(dateStr) {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  async requestWeeklySummary(content, onProgress, label) {
    if (onProgress) {
      onProgress(35, '生成周记中...', '正在调用AI')
    }

    const response = await fetch(this.config.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: Config.getWeeklySystemPrompt()
          },
          {
            role: 'user',
            content: `请根据以下${label}生成一篇周记：\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }),
      signal: this.controller.signal
    })

    if (onProgress) {
      onProgress(70, '解析周记内容...', '正在处理结果')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw this.handleErrorResponse(response.status, errorData)
    }

    const data = await response.json()

    if (onProgress) {
      onProgress(90, '完成生成...', '准备显示')
    }

    const result = this.parseWeeklyResponse(data)

    if (onProgress) {
      onProgress(100, '生成完成', '周记已准备就绪')
    }

    return result
  }

  async requestWeeklyBatchSummary(content, batchIndex, totalBatches) {
    const response = await fetch(this.config.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `你是周记整理助手，请对一组带日期的日记进行结构化摘要。

要求：
1. 按时间顺序提炼关键事件与情绪变化
2. 保留日子之间的因果与转折
3. 输出 2-4 段摘要，保持真实自然

请用JSON格式返回：
{
  "summary": "阶段摘要"
}`
          },
          {
            role: 'user',
            content: `这是第 ${batchIndex}/${totalBatches} 批日记内容：\n\n${content}`
          }
        ],
        temperature: 0.6,
        max_tokens: 2000
      }),
      signal: this.controller.signal
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw this.handleErrorResponse(response.status, errorData)
    }

    const data = await response.json()
    const result = this.parseWeeklyResponse(data)
    return result.summary
  }

  parseWeeklyResponse(data) {
    try {
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('API返回数据格式错误')
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        console.warn('周记JSON解析失败，尝试手动解析:', content)
        return {
          title: '本周记录',
          summary: content
        }
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        title: parsed.title || '本周记录',
        summary: parsed.summary || content
      }

    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      console.error('解析周记响应失败:', error)
      throw new Error('解析周记结果失败')
    }
  }
}

class APIError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message)
    this.name = 'APIError'
    this.code = code
  }

  static network() {
    return new APIError('网络连接失败，请检查网络', 'NETWORK')
  }

  static timeout() {
    return new APIError('请求超时，请重试', 'TIMEOUT')
  }

  static invalidKey() {
    return new APIError('API Key无效', 'INVALID_KEY')
  }

  static quotaExceeded() {
    return new APIError('API调用次数已用尽', 'QUOTA_EXCEEDED')
  }

}
