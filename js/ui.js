class UIManager {
  constructor() {
    this.currentDiaryId = null
    this.elements = {}
    this.init()
  }

  init() {
    this.cacheElements()
    this.bindEvents()
    this.checkApiKey()
    this.updateOnlineStatus()
  }

  cacheElements() {
    this.elements = {
      app: document.getElementById('app'),
      viewList: document.getElementById('view-list'),
      viewEditor: document.getElementById('view-editor'),
      viewSettings: document.getElementById('view-settings'),
      btnNew: document.getElementById('btn-new'),
      btnSettings: document.getElementById('btn-settings'),
      btnBack: document.getElementById('btn-back'),
      btnSave: document.getElementById('btn-save'),
      btnApiKey: document.getElementById('btn-api-key'),
      btnWeekly: document.getElementById('btn-weekly'),
      btnBackToList: document.getElementById('btn-back-to-list'),
      diaryList: document.getElementById('diary-list'),
      weeklyList: document.getElementById('weekly-list'),
      editorContent: document.getElementById('editor-content'),
      editorTitle: document.getElementById('editor-title'),
      statusOnline: document.getElementById('status-online'),
      statusQueue: document.getElementById('status-queue'),
      statusCount: document.getElementById('status-count'),
      modalAnalysis: document.getElementById('modal-analysis'),
      modalSettings: document.getElementById('modal-settings'),
      modalWeekly: document.getElementById('modal-weekly'),
      analysisContent: document.getElementById('analysis-content'),
      analysisRewritten: document.getElementById('analysis-rewritten'),
      settingsApiKey: document.getElementById('settings-api-key'),
      toast: document.getElementById('toast')
    }
  }

  bindEvents() {
    if (this.elements.btnNew) {
      this.elements.btnNew.addEventListener('click', () => this.showEditor())
    }
    if (this.elements.btnBack) {
      this.elements.btnBack.addEventListener('click', () => this.showList())
    }
    if (this.elements.btnSettings) {
      this.elements.btnSettings.addEventListener('click', () => this.showSettings())
    }
    if (this.elements.btnSave) {
      this.elements.btnSave.addEventListener('click', () => this.handleSave())
    }
    if (this.elements.btnApiKey) {
      this.elements.btnApiKey.addEventListener('click', () => this.saveApiKey())
    }
    if (this.elements.btnWeekly) {
      this.elements.btnWeekly.addEventListener('click', () => this.showWeeklyGenerator())
    }
    if (this.elements.btnBackToList) {
      this.elements.btnBackToList.addEventListener('click', () => this.showList())
    }
  }

  showView(viewName) {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'))
    const view = document.getElementById(`view-${viewName}`)
    if (view) {
      view.classList.remove('hidden')
    }
  }

  showList() {
    this.currentDiaryId = null
    this.renderDiaryList()
    this.showView('list')
  }

  showEditor(diaryId = null) {
    if (diaryId) {
      const storage = new DiaryStorage()
      const diary = storage.getById(diaryId)
      if (diary) {
        this.elements.editorTitle.value = diary.title
        this.elements.editorContent.value = diary.finalVersion || diary.content
        this.currentDiaryId = diaryId
      }
    } else {
      this.elements.editorTitle.value = ''
      this.elements.editorContent.value = ''
      this.currentDiaryId = null
    }
    this.updateWordCount()
    this.bindWordCountEvent()
    this.showView('editor')
    this.elements.editorContent.focus()
  }

  showSettings() {
    this.elements.settingsApiKey.value = Config.getApiKey()
    this.showView('settings')
  }

  renderDiaryList() {
    const storage = new DiaryStorage()
    const diaries = storage.getAll()

    if (diaries.length === 0) {
      this.elements.diaryList.innerHTML = `
        <div class="empty-state">
          <p>还没有日记</p>
          <button class="btn-primary" onclick="ui.showEditor()">写第一篇日记</button>
        </div>
      `
      return
    }

    this.elements.diaryList.innerHTML = diaries.map(diary => `
      <div class="diary-card" data-id="${diary.id}">
        <div class="diary-card-header">
          <h3 class="diary-card-title">${this.escapeHtml(diary.title)}</h3>
          <span class="diary-card-date">${this.formatDate(diary.date)}</span>
        </div>
        <p class="diary-card-preview">${this.escapeHtml((diary.finalVersion || diary.content).substring(0, 100))}...</p>
        <div class="diary-card-footer">
          <span class="diary-card-status ${diary.isAnalyzed ? 'analyzed' : ''}">
            ${diary.isAnalyzed ? '已分析' : '未分析'}
          </span>
          <div class="diary-card-actions">
            <button class="btn-small" onclick="ui.showViewer('${diary.id}')">查看</button>
            <button class="btn-small" onclick="ui.showEditor('${diary.id}')">编辑</button>
            <button class="btn-small btn-danger" onclick="ui.deleteDiary('${diary.id}')">删除</button>
          </div>
        </div>
      </div>
    `).join('')
  }

  async handleSave() {
    const content = this.elements.editorContent.value.trim()
    const title = this.elements.editorTitle.value.trim() ||
      this.extractTitle(content)

    if (content.length < Config.validation.minContentLength) {
      this.showToast('内容太短，至少需要5个字符')
      return
    }

    const storage = new DiaryStorage()
    let diary

    try {
      if (this.currentDiaryId) {
        diary = storage.update(this.currentDiaryId, { content, title })
      } else {
        diary = storage.create({ content, title })
        this.currentDiaryId = diary.id
      }

      this.showToast('保存成功')
      this.showAnalysisProgress()

      const offline = new OfflineQueue()
      if (!navigator.onLine) {
        this.hideAnalysisProgress()
        offline.add(offline.createAnalysisTask(content, diary.id))
        this.showToast('已加入离线队列，有网时自动分析')
        this.renderDiaryList()
        return
      }

      const api = new ZhipuAPI()

      try {
        const result = await api.analyze(content, (percent, status, info) => {
          this.updateProgress(percent, status, info)
        })
        this.hideAnalysisProgress()
        storage.saveAnalysis(diary.id, result)
        this.showAnalysisModal(diary.id, result)
        this.renderDiaryList()
      } catch (error) {
        this.hideAnalysisProgress()
        if (error.message.includes('请求频率')) {
          this.showToast(error.message)
        } else if (error.message.includes('网络') || error.message.includes('取消')) {
          const offline = new OfflineQueue()
          offline.add(offline.createAnalysisTask(content, diary?.id))
          this.showToast('网络问题，已加入离线队列')
        } else if (error.message.includes('超时')) {
          this.showToast('分析超时，请重试')
        } else {
          this.showToast(error.message)
        }
      }

    } catch (error) {
      this.hideAnalysisProgress()
      this.showToast(error.message)
    }
  }

  showAnalysisModal(diaryId, analysis) {
    const storage = new DiaryStorage()
    const diary = storage.getById(diaryId)

    const highlightedContent = this.highlightNegativeSentences(
      diary.content,
      analysis
    )

    this.elements.analysisContent.innerHTML = highlightedContent
    this.elements.analysisRewritten.textContent = analysis.rewritten_version

    this.elements.modalAnalysis.classList.remove('hidden')
    this.bindAnalysisModalEvents(diaryId)
  }

  highlightNegativeSentences(content, analysis) {
    if (!analysis.analysis || analysis.analysis.length === 0) {
      return this.escapeHtml(content)
    }

    const negativeIndices = analysis.analysis
      .filter(a => a.is_negative)
      .map(a => a.index)

    const sentences = analysis.sentences

    return sentences.map((sentence, index) => {
      const escaped = this.escapeHtml(sentence)
      if (negativeIndices.includes(index)) {
        return `<span class="negative-sentence" title="${this.escapeHtml(analysis.analysis[index]?.suggestion || '')}">${escaped}</span>`
      }
      return escaped
    }).join('')
  }

  bindAnalysisModalEvents(diaryId) {
    const modal = this.elements.modalAnalysis
    const btnKeepOriginal = modal.querySelector('#btn-keep-original')
    const btnUseRewritten = modal.querySelector('#btn-use-rewritten')
    const btnRegenerate = modal.querySelector('#btn-regenerate-analysis')
    const btnMinimize = modal.querySelector('#btn-minimize-modal')
    const btnClose = modal.querySelector('#btn-close-modal')

    if (!btnKeepOriginal || !btnUseRewritten || !btnRegenerate || !btnMinimize || !btnClose) {
      console.error('弹窗按钮元素未找到')
      return
    }

    const handler = (fn) => {
      return async () => {
        const storage = new DiaryStorage()
        const diary = storage.getById(diaryId)
        if (diary) {
          await fn(diaryId, diary, storage)
          this.renderDiaryList()
        }
        modal.classList.add('hidden')
        this.showList()
      }
    }

    btnKeepOriginal.onclick = handler((id, diary, storage) => {
      storage.saveFinalVersion(id, diary.content)
      this.showToast('已保留原文')
    })

    btnUseRewritten.onclick = handler((id, diary, storage) => {
      const rewritten = diary?.analysis?.rewritten_version || ''
      const newTitle = diary?.analysis?.title || ''
      if (rewritten) {
        storage.update(id, {
          finalVersion: rewritten,
          title: newTitle || undefined
        })
        this.showToast('已采用改写版本')
      } else {
        this.showToast('没有可用的改写版本')
      }
    })

    btnRegenerate.onclick = async () => {
      const storage = new DiaryStorage()
      const diary = storage.getById(diaryId)
      if (!diary) return

      btnRegenerate.disabled = true
      btnRegenerate.textContent = '生成中...'

      try {
        const api = new ZhipuAPI()
        const result = await api.analyze(diary.content, (percent, status, info) => {
          this.updateProgress(percent, status, info)
        })

        storage.saveAnalysis(diaryId, result)

        this.showAnalysisModal(diaryId, result)
        this.showToast('已重新生成')

      } catch (error) {
        this.showToast(error.message)
      } finally {
        btnRegenerate.disabled = false
        btnRegenerate.textContent = '重新生成'
      }
    }

    const cleanup = () => {
      btnKeepOriginal.onclick = null
      btnUseRewritten.onclick = null
      btnRegenerate.onclick = null
      btnMinimize.onclick = null
    }

    btnMinimize.onclick = () => {
      modal.classList.add('hidden')
    }

    btnClose.onclick = () => {
      modal.classList.add('hidden')
      cleanup()
    }
  }

  saveApiKey() {
    const key = this.elements.settingsApiKey.value.trim()
    if (Config.setApiKey(key)) {
      this.showToast('API Key已保存')
      this.showList()
    } else {
      this.showToast('请输入有效的API Key')
    }
  }

  async deleteDiary(id) {
    if (confirm('确定要删除这篇日记吗？')) {
      const storage = new DiaryStorage()
      storage.delete(id)
      this.renderDiaryList()
      this.showToast('日记已删除')
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  updateWordCount() {
    const content = this.elements.editorContent.value
    const count = content.length
    const wordCountEl = document.getElementById('word-count')
    if (wordCountEl) {
      wordCountEl.textContent = `${count} 字`
    }
  }

  bindWordCountEvent() {
    this.elements.editorContent.oninput = () => this.updateWordCount()
  }

  checkApiKey() {
    if (!Config.hasApiKey()) {
      this.showToast('请先设置智谱AI API Key')
      setTimeout(() => this.showSettings(), 1000)
    }
  }

  updateOnlineStatus() {
    const update = () => {
      this.elements.statusOnline.textContent = navigator.onLine ? '在线' : '离线'
      this.elements.statusOnline.className = navigator.onLine ? 'status-online online' : 'status-online offline'
    }

    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  }

  updateQueueCount(count) {
    this.elements.statusCount.textContent = count
    this.elements.statusQueue.style.display = count > 0 ? 'inline' : 'none'
  }

  showToast(message, duration = 3000) {
    const toast = this.elements.toast
    toast.textContent = message
    toast.classList.add('show')

    setTimeout(() => {
      toast.classList.remove('show')
    }, duration)
  }

  formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  extractTitle(content) {
    if (!content) return '无标题'
    const firstLine = content.split('\n')[0].trim()
    return firstLine.length > 30
      ? firstLine.substring(0, 30) + '...'
      : firstLine || '无标题'
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  showAnalysisProgress() {
    const progressPanel = document.getElementById('analysis-progress')
    if (progressPanel) {
      progressPanel.classList.remove('hidden')
      this.updateProgress(0, '正在发送请求...', '准备分析')
    }
    this.bindCancelAnalysis()
  }

  hideAnalysisProgress() {
    const progressPanel = document.getElementById('analysis-progress')
    if (progressPanel) {
      progressPanel.classList.add('hidden')
    }
  }

  updateProgress(percent, statusText, infoText) {
    const progressBar = document.getElementById('progress-bar')
    const progressStatus = document.getElementById('progress-status')
    const progressInfo = document.getElementById('progress-info')

    if (progressBar) {
      progressBar.style.width = `${Math.min(percent, 100)}%`
    }
    if (progressStatus) {
      progressStatus.textContent = statusText || '正在分析...'
    }
    if (progressInfo) {
      progressInfo.textContent = infoText || ''
    }
  }

  setProgressStatus(statusText) {
    const progressStatus = document.getElementById('progress-status')
    if (progressStatus) {
      progressStatus.textContent = statusText
    }
  }

  bindCancelAnalysis() {
    const btnCancel = document.getElementById('btn-cancel-analysis')
    if (btnCancel) {
      btnCancel.onclick = () => {
        this.hideAnalysisProgress()
        this.showToast('已取消分析')
      }
    }
  }

  viewerFontSize = 18
  viewerCurrentDiaryId = null
  viewerDiaries = []

  showViewer(diaryId) {
    const storage = new DiaryStorage()
    this.viewerDiaries = storage.getAll()

    const currentIndex = this.viewerDiaries.findIndex(d => d.id === diaryId)
    if (currentIndex === -1) {
      this.showToast('日记不存在')
      return
    }

    this.viewerCurrentDiaryId = diaryId
    this.viewerFontSize = 18

    this.renderViewerContent(diaryId)
    this.updateViewerNavigation()
    this.updateViewerFontSize()

    const modal = document.getElementById('modal-viewer')
    modal.classList.remove('hidden')
    modal.className = 'modal-overlay viewer-overlay'

    document.body.style.overflow = ''
  }

  closeViewer() {
    const modal = document.getElementById('modal-viewer')
    modal.classList.add('hidden')
    document.body.style.overflow = ''
  }

  renderViewerContent(diaryId) {
    const storage = new DiaryStorage()
    const diary = storage.getById(diaryId)
    if (!diary) return

    const content = diary.finalVersion || diary.content
    const article = document.getElementById('viewer-article')

    const paragraphs = content.split('\n').filter(p => p.trim())

    let html = `
      <h1 class="viewer-title">${this.escapeHtml(diary.title)}</h1>
      <div class="viewer-date">${this.formatDate(diary.date)}</div>
    `

    paragraphs.forEach((para, index) => {
      if (index === 0 && para.length > 0) {
        const firstChar = para[0]
        const rest = para.slice(1)
        html += `<p><span class="viewer-first-letter">${this.escapeHtml(firstChar)}</span><span class="viewer-content">${this.escapeHtml(rest)}</span></p>`
      } else if (para.trim()) {
        html += `<p class="viewer-content">${this.escapeHtml(para)}</p>`
      }

      if (index > 0 && index % 3 === 0 && index < paragraphs.length - 1) {
        html += `<div class="viewer-chapter-divider">第 ${Math.floor(index / 3) + 1} 章</div>`
      }
    })

    article.innerHTML = html
    article.style.fontSize = `${this.viewerFontSize}px`
  }

  setViewerTheme(theme) {
    const modal = document.getElementById('modal-viewer')
    modal.className = 'modal-overlay viewer-overlay'

    if (theme !== 'light') {
      modal.classList.add(theme)
    }
  }

  adjustViewerFontSize(delta) {
    this.viewerFontSize = Math.max(14, Math.min(28, this.viewerFontSize + delta))
    const article = document.getElementById('viewer-article')
    if (article) {
      article.style.fontSize = `${this.viewerFontSize}px`
    }
    this.updateViewerFontSize()
  }

  updateViewerFontSize() {
    const fontSizeEl = document.getElementById('viewer-font-size')
    if (fontSizeEl) {
      fontSizeEl.textContent = `${this.viewerFontSize}px`
    }
  }

  navigateViewer(direction) {
    const storage = new DiaryStorage()
    const diaries = storage.getAll()
    const currentIndex = diaries.findIndex(d => d.id === this.viewerCurrentDiaryId)

    let newIndex
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : diaries.length - 1
    } else {
      newIndex = currentIndex < diaries.length - 1 ? currentIndex + 1 : 0
    }

    if (diaries[newIndex]) {
      this.viewerCurrentDiaryId = diaries[newIndex].id
      this.renderViewerContent(diaries[newIndex].id)
      this.updateViewerNavigation()
    }
  }

  updateViewerNavigation() {
    const btnPrev = document.getElementById('btn-prev-diary')
    const btnNext = document.getElementById('btn-next-diary')

    const storage = new DiaryStorage()
    const diaries = storage.getAll()

    if (diaries.length <= 1) {
      btnPrev.style.visibility = 'hidden'
      btnNext.style.visibility = 'hidden'
    } else {
      btnPrev.style.visibility = 'visible'
      btnNext.style.visibility = 'visible'
    }
  }

  // ========== 周记相关方法 ==========

  currentWeeklyData = null

  async showWeeklyGenerator() {
    const storage = new DiaryStorage()
    const weekInfo = storage.getCurrentWeekInfo()
    const diaries = storage.getDiariesForWeek(weekInfo.year, weekInfo.weekNumber)
    const dayCount = diaries.length

    if (dayCount < 4) {
      this.showWeeklyEmpty(dayCount, 7)
      return
    }

    this.showWeeklyModal()

    this.showWeeklyProgress(true, 0, '正在收集本周日记...', '准备生成')

    try {
      const api = new ZhipuAPI()
      const result = await api.generateWeeklySummary(diaries, (percent, status, info) => {
        this.updateWeeklyProgress(percent, status, info)
      })

      this.currentWeeklyData = {
        ...weekInfo,
        diaryIds: diaries.map(d => d.id),
        title: result.title,
        summary: result.summary
      }

      this.showWeeklyResult(result.title, result.summary)
      this.bindWeeklyModalEvents()

    } catch (error) {
      this.showToast(error.message)
      this.hideWeeklyModal()
    }
  }

  async forceGenerateWeekly() {
    const storage = new DiaryStorage()
    const weekInfo = storage.getCurrentWeekInfo()
    const diaries = storage.getDiariesForWeek(weekInfo.year, weekInfo.weekNumber)
    const dayCount = diaries.length

    this.showWeeklyModal()
    this.showWeeklyProgress(true, 0, '正在生成周记...', `注意：仅有 ${dayCount} 天日记`)

    try {
      const api = new ZhipuAPI()
      const result = await api.generateWeeklySummary(diaries, (percent, status, info) => {
        this.updateWeeklyProgress(percent, status, info)
      })

      this.currentWeeklyData = {
        ...weekInfo,
        diaryIds: diaries.map(d => d.id),
        title: result.title,
        summary: result.summary
      }

      this.showWeeklyResult(result.title, result.summary)
      this.bindWeeklyModalEvents()
      this.showToast('周记已生成（天数较少，可能不够有代表性）')

    } catch (error) {
      this.showToast(error.message)
      this.hideWeeklyModal()
    }
  }

  showWeeklyModal() {
    const modal = document.getElementById('modal-weekly')
    if (modal) {
      modal.classList.remove('hidden')
      this.bindWeeklyModalEvents()
    }
  }

  hideWeeklyModal() {
    const modal = document.getElementById('modal-weekly')
    if (modal) {
      modal.classList.add('hidden')
      this.currentWeeklyData = null
    }
  }

  showWeeklyProgress(show, percent, status, info) {
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')

    if (progress) {
      show ? progress.classList.remove('hidden') : progress.classList.add('hidden')
    }
    if (result) result.classList.add('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.add('hidden')

    this.updateWeeklyProgress(percent, status, info)
  }

  updateWeeklyProgress(percent, status, info) {
    const progressBar = document.getElementById('weekly-progress-bar')
    const progressStatus = document.getElementById('weekly-progress-status')
    const progressInfo = document.getElementById('weekly-progress-info')

    if (progressBar) {
      progressBar.style.width = `${Math.min(percent, 100)}%`
    }
    if (progressStatus) {
      progressStatus.textContent = status || '正在生成周记...'
    }
    if (progressInfo) {
      progressInfo.textContent = info || ''
    }
  }

  showWeeklyEmpty(currentDay = 0, totalDays = 7) {
    this.showWeeklyModal()

    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')
    const title = document.getElementById('weekly-modal-title')

    if (progress) progress.classList.add('hidden')
    if (result) result.classList.add('hidden')
    if (empty) empty.classList.remove('hidden')
    if (footer) footer.classList.add('hidden')
    if (title) title.textContent = '周记生成'

    const btnClose = document.getElementById('btn-close-weekly')
    if (btnClose) {
      btnClose.onclick = () => this.hideWeeklyModal()
    }

    const emptyContent = document.getElementById('weekly-empty')
    if (emptyContent) {
      emptyContent.innerHTML = `
        <div class="weekly-empty-content">
          <div class="weekly-day-count">
            <span class="count-number">${currentDay}</span>
            <span class="count-total">/${totalDays} 天</span>
          </div>
          <p class="weekly-tip">至少需要4天才能生成有代表性的周记</p>
          <div class="weekly-actions">
            <button class="btn btn-primary" onclick="ui.hideWeeklyModal(); ui.showEditor()">继续写日记</button>
            ${currentDay > 0 ? `<button class="btn btn-secondary" onclick="ui.forceGenerateWeekly()">强制生成（可能不够有代表性）</button>` : ''}
          </div>
        </div>
      `
    }
  }

  showWeeklyResult(title, summary) {
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')

    const titleEl = document.getElementById('weekly-title')
    const summaryEl = document.getElementById('weekly-summary')

    if (progress) progress.classList.add('hidden')
    if (result) result.classList.remove('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.remove('hidden')

    if (titleEl) titleEl.textContent = title
    if (summaryEl) summaryEl.textContent = summary
  }

  bindWeeklyModalEvents() {
    const btnClose = document.getElementById('btn-close-weekly')
    const btnRegenerate = document.getElementById('btn-regenerate-weekly')
    const btnSave = document.getElementById('btn-save-weekly')

    if (btnClose) {
      btnClose.onclick = () => this.hideWeeklyModal()
    }

    if (btnRegenerate) {
      btnRegenerate.onclick = () => this.regenerateWeekly()
    }

    if (btnSave) {
      btnSave.onclick = () => this.saveWeekly()
    }
  }

  async regenerateWeekly() {
    if (!this.currentWeeklyData) return

    const storage = new DiaryStorage()
    const diaries = storage.getDiariesForWeek(
      this.currentWeeklyData.year,
      this.currentWeeklyData.weekNumber
    )

    this.showWeeklyProgress(true, 0, '重新生成周记...', '准备中')

    try {
      const api = new ZhipuAPI()
      const result = await api.generateWeeklySummary(diaries, (percent, status, info) => {
        this.updateWeeklyProgress(percent, status, info)
      })

      this.currentWeeklyData.title = result.title
      this.currentWeeklyData.summary = result.summary

      this.showWeeklyResult(result.title, result.summary)
      this.showToast('周记已重新生成')

    } catch (error) {
      this.showToast(error.message)
    }
  }

  saveWeekly() {
    if (!this.currentWeeklyData) return

    const storage = new DiaryStorage()
    const weekly = storage.createWeekly(this.currentWeeklyData)

    this.hideWeeklyModal()
    this.showWeeklyList()
    this.showToast('周记已保存')
  }

  showWeeklyList() {
    this.renderWeeklyList()
    this.showView('weekly')
  }

  renderWeeklyList() {
    const storage = new DiaryStorage()
    const weeklies = storage.getAllWeekly()

    const listEl = document.getElementById('weekly-list')

    if (weeklies.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>还没有周记</p>
          <button class="btn btn-primary" onclick="ui.showWeeklyGenerator()">生成第一篇周记</button>
        </div>
      `
      return
    }

    listEl.innerHTML = weeklies.map(weekly => {
      const startDate = new Date(weekly.startDate)
      const endDate = new Date(weekly.endDate)
      const dateRange = `${startDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`

      return `
        <div class="weekly-card" onclick="ui.viewWeekly('${weekly.id}')">
          <div class="weekly-card-header">
            <h3 class="weekly-card-title">${this.escapeHtml(weekly.title)}</h3>
            <span class="weekly-card-date">${dateRange}</span>
          </div>
          <p class="weekly-card-summary">${this.escapeHtml(weekly.summary.substring(0, 150))}...</p>
          <div class="weekly-card-footer">
            <button class="btn-small" onclick="event.stopPropagation(); ui.deleteWeekly('${weekly.id}')">删除</button>
          </div>
        </div>
      `
    }).join('')
  }

  viewWeekly(id) {
    const storage = new DiaryStorage()
    const weekly = storage.getWeeklyById(id)

    if (!weekly) {
      this.showToast('周记不存在')
      return
    }

    this.currentWeeklyData = weekly

    const modal = document.getElementById('modal-weekly')
    const titleEl = document.getElementById('weekly-modal-title')
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')

    if (titleEl) titleEl.textContent = '周记详情'
    if (progress) progress.classList.add('hidden')
    if (result) result.classList.remove('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.remove('hidden')

    const titleResultEl = document.getElementById('weekly-title')
    const summaryResultEl = document.getElementById('weekly-summary')

    if (titleResultEl) titleResultEl.textContent = weekly.title
    if (summaryResultEl) summaryResultEl.textContent = weekly.summary

    const btnRegenerate = document.getElementById('btn-regenerate-weekly')
    const btnSave = document.getElementById('btn-save-weekly')

    if (btnRegenerate) {
      btnRegenerate.textContent = '重新生成'
      btnRegenerate.onclick = () => this.regenerateWeekly()
    }

    if (btnSave) {
      btnSave.style.display = 'none'
    }

    const btnClose = document.getElementById('btn-close-weekly')
    if (btnClose) {
      btnClose.onclick = () => {
        this.hideWeeklyModal()
        this.renderWeeklyList()
      }
    }

    modal.classList.remove('hidden')
  }

  deleteWeekly(id) {
    if (confirm('确定要删除这篇周记吗？')) {
      const storage = new DiaryStorage()
      storage.deleteWeekly(id)
      this.renderWeeklyList()
      this.showToast('周记已删除')
    }
  }
}
