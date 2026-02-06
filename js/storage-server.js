// 服务器端存储 - 使用 API 保存数据到容器

class ServerStorage {
  constructor() {
    this.apiBase = '/api';
    this.useServer = true;
  }

  async request(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(this.apiBase + endpoint, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async getAll() {
    try {
      const result = await this.request('/diaries');
      return result || [];
    } catch (error) {
      console.error('Failed to get diaries:', error);
      // 降级到 localStorage
      const local = localStorage.getItem(Config.storageKeys.diaries);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAll(diaries) {
    try {
      await this.request('/diaries', 'POST', diaries);
      // 同时备份到 localStorage
      localStorage.setItem(Config.storageKeys.diaries, JSON.stringify(diaries));
    } catch (error) {
      console.error('Failed to save diaries:', error);
      throw new Error('保存失败，请检查网络连接');
    }
  }

  async getAllWeekly() {
    try {
      const result = await this.request('/weeklies');
      return result || [];
    } catch (error) {
      console.error('Failed to get weeklies:', error);
      const local = localStorage.getItem(Config.storageKeys.weekly);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveAllWeekly(weeklies) {
    try {
      await this.request('/weeklies', 'POST', weeklies);
      localStorage.setItem(Config.storageKeys.weekly, JSON.stringify(weeklies));
    } catch (error) {
      console.error('Failed to save weeklies:', error);
      throw new Error('保存失败，请检查网络连接');
    }
  }

  async export() {
    try {
      const result = await this.request('/export');
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('Failed to export:', error);
      throw new Error('导出失败');
    }
  }

  async import(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      const diaries = Array.isArray(data) ? data : (data.diaries || []);
      const weeklies = data.weeklies || [];

      await this.request('/import', 'POST', { diaries, weeklies });
      return diaries.length;
    } catch (error) {
      console.error('Failed to import:', error);
      throw new Error('导入失败');
    }
  }
}

class DiaryStorage {
  constructor() {
    this.storageKey = Config.storageKeys.diaries
    this.server = new ServerStorage()
    this.useServer = true // 强制使用服务器存储
    this.init()
  }

  async init() {
    // 初始化 localStorage 作为备份
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }

    // 通知 UI
    this.notifyStorageStatus()
  }

  notifyStorageStatus() {
    if (this.useServer) {
      this.showStorageStatus('服务器存储', 'server')
    }
  }

  showStorageStatus(message, type) {
    const event = new CustomEvent('storageStatusChanged', {
      detail: { message, type }
    })
    window.dispatchEvent(event)
  }

  // ========== 基础 CRUD 方法 ==========

  async getAll() {
    return await this.server.getAll()
  }

  async getById(id) {
    const diaries = await this.getAll()
    return diaries.find(d => d.id === id) || null
  }

  async getByDate(dateStr) {
    const diaries = await this.getAll()
    return diaries.filter(d => d.date === dateStr)
  }

  async create(diary) {
    const diaries = await this.getAll()
    const newDiary = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: diary.content || '',
      title: diary.title || this.extractTitle(diary.content),
      date: diary.date || new Date().toISOString().split('T')[0],
      analysis: diary.analysis || null,
      finalVersion: diary.finalVersion || diary.content,
      original_content: diary.original_content || null,
      structured_version: diary.structured_version || null,
      images: diary.images || [],
      footer_images: diary.footer_images || []
    }

    diaries.unshift(newDiary)
    await this.server.saveAll(diaries)
    return newDiary
  }

  async update(id, updates) {
    const diaries = await this.getAll()
    const index = diaries.findIndex(d => d.id === id)

    if (index === -1) {
      throw new Error('日记不存在')
    }

    diaries[index] = {
      ...diaries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.server.saveAll(diaries)
    return diaries[index]
  }

  async delete(id) {
    const diaries = await this.getAll()
    const filtered = diaries.filter(d => d.id !== id)
    await this.server.saveAll(filtered)
  }

  async saveAnalysis(id, analysisData) {
    const diary = await this.getById(id)
    if (!diary) {
      throw new Error('日记不存在')
    }

    const result = await this.update(id, {
      analysis: analysisData,
      title: analysisData.title || undefined
    })
    return result
  }

  async saveFinalVersion(id, finalVersion) {
    return await this.update(id, { finalVersion })
  }

  async saveStructuredVersion(id, structuredVersion) {
    return await this.update(id, { structured_version: structuredVersion })
  }

  async getStructuredVersion(id) {
    const diary = await this.getById(id)
    return diary ? diary.structured_version : null
  }

  // ========== 搜索和统计 ==========

  async search(keyword) {
    const diaries = await this.getAll()
    if (!keyword) return diaries

    const lowerKeyword = keyword.toLowerCase()
    return diaries.filter(d =>
      d.content.toLowerCase().includes(lowerKeyword) ||
      d.title.toLowerCase().includes(lowerKeyword)
    )
  }

  async getStats() {
    const diaries = await this.getAll()
    const today = new Date().toISOString().split('T')[0]

    return {
      total: diaries.length,
      today: diaries.filter(d => d.date === today).length,
      analyzed: diaries.filter(d => d.analysis).length
    }
  }

  async clearAll() {
    if (confirm('确定要删除所有日记吗？此操作不可恢复。')) {
      await this.server.saveAll([])
    }
  }

  async export() {
    return await this.server.export()
  }

  async import(jsonData) {
    return await this.server.import(jsonData)
  }

  // ========== 工具方法（同步）==========

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  extractTitle(content) {
    if (!content) return '无标题'
    const firstLine = content.split('\n')[0].trim()
    return firstLine.length > 30
      ? firstLine.substring(0, 30) + '...'
      : firstLine || '无标题'
  }

  // ========== 图片配置 ==========

  getImgURLConfig() {
    const raw = localStorage.getItem(Config.storageKeys.imgurlConfig)
    const fallback = {
      upload_url: Config.imgurl.uploadUrl,
      token: Config.imgurl.defaultToken || ''
    }
    if (!raw) return fallback
    try {
      const parsed = JSON.parse(raw)
      return {
        upload_url: parsed.upload_url || parsed.base_url || Config.imgurl.uploadUrl,
        token: parsed.token || ''
      }
    } catch (e) {
      return fallback
    }
  }

  saveImgURLConfig(config) {
    const payload = {
      upload_url: config.upload_url || Config.imgurl.uploadUrl,
      token: config.token || ''
    }
    localStorage.setItem(Config.storageKeys.imgurlConfig, JSON.stringify(payload))
    return payload
  }

  // ========== 周记相关方法 ==========

  getWeeklyStorageKey() {
    return Config.storageKeys.weekly
  }

  async getAllWeekly() {
    return await this.server.getAllWeekly()
  }

  async getWeeklyById(id) {
    const weeklies = await this.getAllWeekly()
    return weeklies.find(w => w.id === id) || null
  }

  async getWeeklyByWeek(year, weekNumber) {
    const weeklies = await this.getAllWeekly()
    return weeklies.find(w => w.year === year && w.weekNumber === weekNumber) || null
  }

  async createWeekly(weekly) {
    const weeklies = await this.getAllWeekly()
    const newWeekly = {
      id: weekly.id || `weekly_${Date.now()}`,
      summary: weekly.summary || '',
      title: weekly.title || '',
      images: weekly.images || [],
      footer_images: weekly.footer_images || [],
      startDate: weekly.startDate,
      endDate: weekly.endDate,
      createdAt: new Date().toISOString(),
      regenerations: 0
    }

    weeklies.unshift(newWeekly)
    await this.server.saveAllWeekly(weeklies)
    return newWeekly
  }

  async updateWeekly(id, updates) {
    const weeklies = await this.getAllWeekly()
    const index = weeklies.findIndex(w => w.id === id)

    if (index === -1) {
      throw new Error('周记不存在')
    }

    weeklies[index] = {
      ...weeklies[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.server.saveAllWeekly(weeklies)
    return weeklies[index]
  }

  async deleteWeekly(id) {
    const weeklies = await this.getAllWeekly()
    const filtered = weeklies.filter(w => w.id !== id)
    await this.server.saveAllWeekly(filtered)
  }

  // ... 其他周记相关方法保持不变 ...
  async getDiariesForWeek(year, weekNumber) {
    const diaries = await this.getAll()
    const startDate = this.getWeekStartDate(year, weekNumber)
    const endDate = this.getWeekEndDate(year, weekNumber)

    return diaries.filter(diary => {
      const diaryDate = new Date(diary.date)
      return diaryDate >= startDate && diaryDate <= endDate
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  getWeekStartDate(year, weekNumber) {
    const jan4 = new Date(year, 0, 4)
    const day = jan4.getDay() || 7
    const monday = new Date(jan4)
    monday.setDate(jan4.getDate() - day + 1)
    const target = new Date(monday)
    target.setDate(monday.getDate() + (weekNumber - 1) * 7)
    return target
  }

  getWeekEndDate(year, weekNumber) {
    const startDate = this.getWeekStartDate(year, weekNumber)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    return endDate
  }

  getCurrentWeekInfo() {
    const now = new Date()
    const year = now.getFullYear()
    const weekNumber = this.getISOWeekNumber(now)
    const range = this.getWeekRangeByDate(now)

    return {
      year,
      weekNumber,
      startDate: range.startDate,
      endDate: range.endDate
    }
  }

  async hasDiariesThisWeek() {
    const weekInfo = this.getCurrentWeekInfo()
    const diaries = await this.getDiariesForWeek(weekInfo.year, weekInfo.weekNumber)
    return diaries.length > 0
  }

  async getWeeklyStats() {
    const weeklies = await this.getAllWeekly()
    const now = new Date()
    const year = now.getFullYear()
    const weekNumber = this.getISOWeekNumber(now)
    return {
      total: weeklies.length,
      thisWeek: await this.getWeeklyByWeek(year, weekNumber)
    }
  }

  async getDiariesInDateRange(startDate, endDate) {
    const diaries = await this.getAll()
    if (!startDate || !endDate) return []
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    return diaries.filter(diary => {
      const diaryDate = new Date(diary.date)
      return diaryDate >= start && diaryDate <= end
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  async getDiariesLastWeek() {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    const range = this.getWeekRangeByDate(date)
    return await this.getDiariesInDateRange(range.startDate, range.endDate)
  }

  getWeekRangeByDate(dateInput) {
    const date = new Date(dateInput)
    const day = date.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const startDate = new Date(date)
    startDate.setDate(date.getDate() + diff)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    return {
      startDate: this.formatDateToISO(startDate),
      endDate: this.formatDateToISO(endDate)
    }
  }

  getISOWeekNumber(dateInput) {
    const date = new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()))
    const dayNum = date.getUTCDay() || 7
    date.setUTCDate(date.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
  }

  formatDateToISO(date) {
    return date.toISOString().split('T')[0]
  }

  compressDiaryContent(content, maxLength = 500) {
    const text = (content || '').trim()
    if (!text) return ''
    if (text.length <= maxLength) return text

    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
    if (lines.length <= 1) {
      return text.slice(0, maxLength)
    }

    let result = ''
    for (const line of lines) {
      const next = result ? `${result}\n${line}` : line
      if (next.length <= maxLength) {
        result = next
      } else {
        break
      }
    }

    if (!result) {
      return lines[0].slice(0, maxLength)
    }

    if (result.length < maxLength * 0.6 && lines.length > 1) {
      const tail = lines[lines.length - 1]
      const available = maxLength - result.length - 3
      if (available > 20) {
        result = `${result}\n…\n${tail.slice(0, available)}`
      }
    }

    return result.trim()
  }
}
