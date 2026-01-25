class DiaryStorage {
  constructor() {
    this.storageKey = Config.storageKeys.diaries
    this.init()
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('读取日记失败:', e)
      return []
    }
  }

  getById(id) {
    const diaries = this.getAll()
    return diaries.find(d => d.id === id) || null
  }

  getByDate(dateStr) {
    const diaries = this.getAll()
    return diaries.filter(d => d.date === dateStr)
  }

  create(diary) {
    const diaries = this.getAll()
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
      structured_version: diary.structured_version || null
    }

    diaries.unshift(newDiary)
    this.saveAll(diaries)
    return newDiary
  }

  update(id, updates) {
    const diaries = this.getAll()
    const index = diaries.findIndex(d => d.id === id)

    if (index === -1) {
      throw new Error('日记不存在')
    }

    diaries[index] = {
      ...diaries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveAll(diaries)
    return diaries[index]
  }

  delete(id) {
    const diaries = this.getAll()
    const filtered = diaries.filter(d => d.id !== id)
    this.saveAll(filtered)
  }

  saveAnalysis(id, analysisData) {
    const diary = this.getById(id)
    if (!diary) {
      throw new Error('日记不存在')
    }

    const result = this.update(id, {
      analysis: analysisData,
      title: analysisData.title || undefined
    })
    return result
  }

  saveFinalVersion(id, finalVersion) {
    return this.update(id, { finalVersion })
  }

  saveStructuredVersion(id, structuredVersion) {
    return this.update(id, { structured_version: structuredVersion })
  }

  getStructuredVersion(id) {
    const diary = this.getById(id)
    return diary ? diary.structured_version : null
  }

  saveAll(diaries) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(diaries))
    } catch (e) {
      console.error('保存日记失败:', e)
      throw new Error('存储空间不足，无法保存')
    }
  }

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

  search(keyword) {
    const diaries = this.getAll()
    if (!keyword) return diaries

    const lowerKeyword = keyword.toLowerCase()
    return diaries.filter(d =>
      d.content.toLowerCase().includes(lowerKeyword) ||
      d.title.toLowerCase().includes(lowerKeyword)
    )
  }

  getStats() {
    const diaries = this.getAll()
    const today = new Date().toISOString().split('T')[0]

    return {
      total: diaries.length,
      today: diaries.filter(d => d.date === today).length,
      analyzed: diaries.filter(d => d.analysis).length
    }
  }

  clearAll() {
    if (confirm('确定要删除所有日记吗？此操作不可恢复。')) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }
  }

  export() {
    return JSON.stringify(this.getAll(), null, 2)
  }

  import(jsonData) {
    try {
      const diaries = JSON.parse(jsonData)
      if (!Array.isArray(diaries)) {
        throw new Error('数据格式错误')
      }

      const existing = this.getAll()
      const merged = [...diaries, ...existing]
      const unique = merged.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id)
        if (!x) {
          return acc.concat([current])
        }
        return acc
      }, [])

      this.saveAll(unique)
      return unique.length - existing.length
    } catch (e) {
      throw new Error('导入失败: ' + e.message)
    }
  }

  // ========== 周记相关方法 ==========

  getWeeklyStorageKey() {
    return Config.storageKeys.weekly
  }

  getAllWeekly() {
    try {
      const data = localStorage.getItem(this.getWeeklyStorageKey())
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('读取周记失败:', e)
      return []
    }
  }

  getWeeklyById(id) {
    const weeklies = this.getAllWeekly()
    return weeklies.find(w => w.id === id) || null
  }

  getWeeklyByWeek(year, weekNumber) {
    const weeklies = this.getAllWeekly()
    return weeklies.find(w => w.year === year && w.weekNumber === weekNumber) || null
  }

  createWeekly(weekly) {
    const weeklies = this.getAllWeekly()
    const newWeekly = {
      id: weekly.id || `weekly_${weekly.year}-W${weekly.weekNumber}`,
      year: weekly.year,
      weekNumber: weekly.weekNumber,
      startDate: weekly.startDate,
      endDate: weekly.endDate,
      diaryIds: weekly.diaryIds || [],
      summary: weekly.summary || '',
      title: weekly.title || '',
      images: Array.isArray(weekly.images) ? weekly.images : [],
      createdAt: new Date().toISOString(),
      regenerations: 0
    }

    const existingIndex = weekly.id
      ? weeklies.findIndex(w => w.id === weekly.id)
      : weeklies.findIndex(w => w.year === weekly.year && w.weekNumber === weekly.weekNumber)

    if (existingIndex >= 0) {
      weeklies[existingIndex] = newWeekly
    } else {
      weeklies.unshift(newWeekly)
    }

    this.saveAllWeekly(weeklies)
    return newWeekly
  }

  updateWeekly(id, updates) {
    const weeklies = this.getAllWeekly()
    const index = weeklies.findIndex(w => w.id === id)

    if (index === -1) {
      throw new Error('周记不存在')
    }

    weeklies[index] = {
      ...weeklies[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveAllWeekly(weeklies)
    return weeklies[index]
  }

  deleteWeekly(id) {
    const weeklies = this.getAllWeekly()
    const filtered = weeklies.filter(w => w.id !== id)
    this.saveAllWeekly(filtered)
  }

  saveAllWeekly(weeklies) {
    try {
      localStorage.setItem(this.getWeeklyStorageKey(), JSON.stringify(weeklies))
    } catch (e) {
      console.error('保存周记失败:', e)
      throw new Error('存储空间不足，无法保存周记')
    }
  }

  getDiariesForWeek(year, weekNumber) {
    const diaries = this.getAll()
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

  hasDiariesThisWeek() {
    const weekInfo = this.getCurrentWeekInfo()
    const diaries = this.getDiariesForWeek(weekInfo.year, weekInfo.weekNumber)
    return diaries.length > 0
  }

  getWeeklyStats() {
    const weeklies = this.getAllWeekly()
    const now = new Date()
    const year = now.getFullYear()
    const weekNumber = this.getISOWeekNumber(now)
    return {
      total: weeklies.length,
      thisWeek: this.getWeeklyByWeek(year, weekNumber)
    }
  }

  getDiariesInDateRange(startDate, endDate) {
    const diaries = this.getAll()
    if (!startDate || !endDate) return []
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    return diaries.filter(diary => {
      const diaryDate = new Date(diary.date)
      return diaryDate >= start && diaryDate <= end
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  getDiariesLastWeek() {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    const range = this.getWeekRangeByDate(date)
    return this.getDiariesInDateRange(range.startDate, range.endDate)
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
