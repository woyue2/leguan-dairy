class UIManager {
  constructor() {
    this.currentDiaryId = null
    this.currentImages = []
    this.currentStructuredContent = ''
    this.structureTargetType = 'diary'
    this.structureTargetId = null
    this.weeklyImages = []
    this.imageInsertTarget = 'diary'
    this.elements = {}
    this.isInsertImageMode = false
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
      btnSaveOnly: document.getElementById('btn-save-only'),
      btnStructure: document.getElementById('btn-structure'),
      btnViewOriginal: document.getElementById('btn-view-original'),
      btnApiKey: document.getElementById('btn-api-key'),
      btnWeekly: document.getElementById('btn-weekly'),
      btnWeeklyCreate: document.getElementById('btn-weekly-create'),
      btnBackToList: document.getElementById('btn-back-to-list'),
      btnBackFromSettings: document.getElementById('btn-back-from-settings'),
      diaryList: document.getElementById('diary-list'),
      weeklyList: document.getElementById('weekly-list'),
      editorContent: document.getElementById('editor-content'),
      editorTitle: document.getElementById('editor-title'),
      statusOnline: document.getElementById('status-online'),
      statusQueue: document.getElementById('status-queue'),
      statusCount: document.getElementById('status-count'),
      modalAnalysis: document.getElementById('modal-analysis'),
      modalStructure: document.getElementById('modal-structure'),
      modalOriginal: document.getElementById('modal-original'),
      modalSettings: document.getElementById('modal-settings'),
      modalWeekly: document.getElementById('modal-weekly'),
      analysisContent: document.getElementById('analysis-content'),
      analysisRewritten: document.getElementById('analysis-rewritten'),
      structureContent: document.getElementById('structure-content'),
      originalContent: document.getElementById('original-content'),
      btnCloseStructure: document.getElementById('btn-close-structure'),
      btnUseStructure: document.getElementById('btn-use-structure'),
      btnCancelStructure: document.getElementById('btn-cancel-structure'),
      btnCloseOriginal: document.getElementById('btn-close-original'),
      btnCloseOriginalFooter: document.getElementById('btn-close-original-footer'),
      settingsApiKey: document.getElementById('settings-api-key'),
      toast: document.getElementById('toast'),
      btnInsertImage: document.getElementById('btn-insert-image'),
      modalInsertImage: document.getElementById('modal-insert-image'),
      btnCloseImageModal: document.getElementById('btn-close-image-modal'),
      btnCancelInsert: document.getElementById('btn-cancel-insert'),
      btnConfirmInsert: document.getElementById('btn-confirm-insert'),
      imageUrlInput: document.getElementById('image-url-input'),
      editorImages: document.getElementById('editor-images'),
      btnWeeklyInsertImage: document.getElementById('btn-weekly-insert-image'),
      weeklyEditorSummary: document.getElementById('weekly-editor-summary'),
      weeklyEditorImages: document.getElementById('weekly-editor-images'),
      weeklyResultImages: document.getElementById('weekly-result-images')
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
    if (this.elements.btnSaveOnly) {
      this.elements.btnSaveOnly.addEventListener('click', () => this.handleSaveOnly())
    }
    if (this.elements.btnStructure) {
      this.elements.btnStructure.addEventListener('click', () => this.handleStructureAnalysis())
    }
    if (this.elements.btnViewOriginal) {
      this.elements.btnViewOriginal.addEventListener('click', () => this.showOriginalModal())
    }
    if (this.elements.btnApiKey) {
      this.elements.btnApiKey.addEventListener('click', () => this.saveApiKey())
    }
    if (this.elements.btnWeekly) {
      this.elements.btnWeekly.addEventListener('click', () => this.showWeeklyList())
    }
    if (this.elements.btnWeeklyCreate) {
      this.elements.btnWeeklyCreate.addEventListener('click', () => this.showWeeklyGenerator())
    }
    if (this.elements.btnBackToList) {
      this.elements.btnBackToList.addEventListener('click', () => this.showList())
    }
    if (this.elements.btnBackFromSettings) {
      this.elements.btnBackFromSettings.addEventListener('click', () => this.showList())
    }
    if (this.elements.btnInsertImage) {
      this.elements.btnInsertImage.addEventListener('click', () => this.showInsertImageModal('diary'))
    }
    if (this.elements.btnWeeklyInsertImage) {
      this.elements.btnWeeklyInsertImage.addEventListener('click', () => this.showInsertImageModal('weekly'))
    }
    if (this.elements.btnCloseImageModal) {
      this.elements.btnCloseImageModal.addEventListener('click', () => this.hideInsertImageModal())
    }
    if (this.elements.btnCancelInsert) {
      this.elements.btnCancelInsert.addEventListener('click', () => this.hideInsertImageModal())
    }
    if (this.elements.btnConfirmInsert) {
      this.elements.btnConfirmInsert.addEventListener('click', () => this.insertImage())
    }
    if (this.elements.editorContent) {
      this.elements.editorContent.addEventListener('paste', (e) => this.handlePaste(e))
    }
    if (this.elements.weeklyEditorSummary) {
      this.elements.weeklyEditorSummary.addEventListener('paste', (e) => this.handleWeeklyPaste(e))
    }
    if (this.elements.editorImages) {
      this.elements.editorImages.addEventListener('click', (e) => this.handleRemoveImage(e))
    }
    if (this.elements.weeklyEditorImages) {
      this.elements.weeklyEditorImages.addEventListener('click', (e) => this.handleRemoveWeeklyImage(e))
    }
    if (this.elements.btnCloseStructure) {
      this.elements.btnCloseStructure.addEventListener('click', () => this.hideStructureModal())
    }
    if (this.elements.btnCancelStructure) {
      this.elements.btnCancelStructure.addEventListener('click', () => this.hideStructureModal())
    }
    if (this.elements.btnUseStructure) {
      this.elements.btnUseStructure.addEventListener('click', () => this.saveStructuredVersion())
    }
    if (this.elements.btnCloseOriginal) {
      this.elements.btnCloseOriginal.addEventListener('click', () => this.hideOriginalModal())
    }
    if (this.elements.btnCloseOriginalFooter) {
      this.elements.btnCloseOriginalFooter.addEventListener('click', () => this.hideOriginalModal())
    }
  }

  showInsertImageModal(target = 'diary') {
    this.isInsertImageMode = true
    this.imageInsertTarget = target
    this.elements.imageUrlInput.value = ''
    this.elements.modalInsertImage.classList.remove('hidden')
    this.elements.imageUrlInput.focus()
  }

  hideInsertImageModal() {
    this.isInsertImageMode = false
    this.elements.modalInsertImage.classList.add('hidden')
  }

  insertImage() {
    const url = this.elements.imageUrlInput.value.trim()
    if (!url) {
      this.showToast('请输入图片链接')
      return
    }

    if (this.imageInsertTarget === 'weekly') {
      if (!this.weeklyImages.includes(url)) {
        this.weeklyImages.push(url)
      }
      if (this.currentWeeklyData) {
        this.currentWeeklyData = {
          ...this.currentWeeklyData,
          images: [...this.weeklyImages]
        }
      }
    } else if (!this.currentImages.includes(url)) {
      this.currentImages.push(url)
    }
    this.hideInsertImageModal()
    if (this.imageInsertTarget === 'weekly') {
      this.updateWeeklyImagePreview()
      if (this.elements.weeklyEditorSummary) {
        this.elements.weeklyEditorSummary.focus()
      }
    } else {
      this.updateWordCount()
      this.updateImagePreview()
      this.elements.editorContent.focus()
    }
  }

  handlePaste(e) {
    if (this.isInsertImageMode) {
      return
    }
    if (this.elements.modalInsertImage && !this.elements.modalInsertImage.classList.contains('hidden')) {
      return
    }
    if (document.activeElement === this.elements.imageUrlInput) {
      return
    }
    const paste = (e.clipboardData || window.clipboardData).getData('text')
    if (paste && paste.match(/^https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i)) {
      e.preventDefault()
      if (!this.currentImages.includes(paste)) {
        this.currentImages.push(paste)
      }
      this.updateWordCount()
      this.updateImagePreview()
      this.showToast('已自动识别并插入图片链接')
    }
  }

  handleWeeklyPaste(e) {
    if (this.isInsertImageMode) {
      return
    }
    if (this.elements.modalInsertImage && !this.elements.modalInsertImage.classList.contains('hidden')) {
      return
    }
    if (document.activeElement === this.elements.imageUrlInput) {
      return
    }
    const paste = (e.clipboardData || window.clipboardData).getData('text')
    if (paste && paste.match(/^https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i)) {
      e.preventDefault()
      if (!this.weeklyImages.includes(paste)) {
        this.weeklyImages.push(paste)
      }
      if (this.currentWeeklyData) {
        this.currentWeeklyData = {
          ...this.currentWeeklyData,
          images: [...this.weeklyImages]
        }
      }
      this.updateWeeklyImagePreview()
      this.showToast('已自动识别并插入图片链接')
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
        const normalized = this.normalizeDiaryContent(diary)
        this.elements.editorContent.value = normalized.content
        this.currentImages = normalized.images
        this.currentStructuredContent = diary.structured_version || ''
        this.currentDiaryId = diaryId
      }
    } else {
      this.elements.editorTitle.value = ''
      this.elements.editorContent.value = ''
      this.currentImages = []
      this.currentStructuredContent = ''
      this.currentDiaryId = null
    }
    this.updateWordCount()
    this.updateImagePreview()
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

    this.elements.diaryList.innerHTML = diaries.map(diary => {
      const normalized = this.normalizeDiaryContent(diary)
      const content = normalized.content
      const images = normalized.images
      const thumbUrl = images[0] || null
      const previewText = content.substring(0, 100)

      return `
      <div class="diary-card" data-id="${diary.id}" onclick="ui.showViewer('${diary.id}')">
        <div class="diary-card-body">
          ${thumbUrl ? `<img src="${this.escapeHtml(thumbUrl)}" class="diary-thumbnail" onerror="this.style.display='none'">` : ''}
          <div class="diary-card-main">
            <div class="diary-card-header">
              <h3 class="diary-card-title">${this.escapeHtml(diary.title)}</h3>
              <span class="diary-card-date">${this.formatDate(diary.date)}</span>
            </div>
            <p class="diary-card-preview">${this.escapeHtml(previewText)}...</p>
            <div class="diary-card-footer">
              <div class="diary-card-actions">
                <button class="btn-small" onclick="event.stopPropagation(); ui.showViewer('${diary.id}')">查看</button>
                <button class="btn-small" onclick="event.stopPropagation(); ui.showEditor('${diary.id}')">编辑</button>
                <button class="btn-small btn-danger" onclick="event.stopPropagation(); ui.deleteDiary('${diary.id}')">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}).join('')
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
      const updates = { content, title, images: [...this.currentImages] }

      if (this.currentDiaryId) {
        const existing = storage.getById(this.currentDiaryId)
        if (existing && !existing.original_content) {
          updates.original_content = existing.content || content
        }
        if (existing?.structured_version) {
          updates.structured_version = content
        }
      }

      if (this.currentDiaryId) {
        diary = storage.update(this.currentDiaryId, updates)
      } else {
        diary = storage.create(updates)
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

  async handleSaveOnly() {
    const content = this.elements.editorContent.value.trim()
    const title = this.elements.editorTitle.value.trim() ||
      this.extractTitle(content)

    if (content.length < Config.validation.minContentLength) {
      this.showToast('内容太短，至少需要5个字符')
      return
    }

    const storage = new DiaryStorage()

    try {
      const updates = {
        content,
        title,
        images: [...this.currentImages],
        analysis: null,
        finalVersion: null
      }

      if (this.currentDiaryId) {
        const existing = storage.getById(this.currentDiaryId)
        if (existing && !existing.original_content) {
          updates.original_content = existing.content || content
        }
        if (existing?.structured_version) {
          updates.structured_version = content
        }
        storage.update(this.currentDiaryId, updates)
      } else {
        const diary = storage.create(updates)
        this.currentDiaryId = diary.id
      }

      this.renderDiaryList()
      this.showToast('已保存（未分析）')
    } catch (error) {
      this.showToast(error.message)
    }
  }

  async handleStructureAnalysis() {
    const content = this.elements.editorContent.value.trim()
    if (content.length < Config.validation.minContentLength) {
      this.showToast('内容太短，至少需要5个字符')
      return
    }

    this.structureTargetType = 'diary'
    this.structureTargetId = this.currentDiaryId
    const api = new ZhipuAPI()
    this.showStructureProgress(() => api.abort())

    try {
      const result = await api.analyzeStructure(content, (percent, status, info) => {
        this.updateProgress(percent, status, info)
      })
      this.hideAnalysisProgress()
      this.currentStructuredContent = result.structured_version || ''
      this.showStructureModal(this.currentStructuredContent)
    } catch (error) {
      this.hideAnalysisProgress()
      if (error.message.includes('请求频率')) {
        this.showToast(error.message)
      } else if (error.message.includes('网络') || error.message.includes('取消')) {
        this.showToast('网络问题，请稍后重试')
      } else if (error.message.includes('超时')) {
        this.showToast('结构优化超时，请重试')
      } else {
        this.showToast(error.message)
      }
    }
  }

  showStructureModal(content) {
    if (this.elements.structureContent) {
      this.elements.structureContent.innerHTML = this.renderStructureContent(content)
    }
    if (this.elements.modalStructure) {
      this.elements.modalStructure.classList.remove('hidden')
    }
  }

  hideStructureModal() {
    if (this.elements.modalStructure) {
      this.elements.modalStructure.classList.add('hidden')
    }
  }

  saveStructuredVersion() {
    if (!this.currentStructuredContent) {
      this.showToast('没有可保存的优化内容')
      return
    }

    if (this.structureTargetType === 'weekly') {
      if (!this.currentWeeklyData) {
        this.showToast('周记不存在')
        return
      }
      const storage = new DiaryStorage()
      const updatedSummary = this.currentStructuredContent
      this.currentWeeklyData = {
        ...this.currentWeeklyData,
        summary: updatedSummary
      }
      const existing = storage.getWeeklyById(this.currentWeeklyData.id)
      if (existing) {
        storage.updateWeekly(this.currentWeeklyData.id, {
          summary: updatedSummary
        })
      }
      this.hideStructureModal()
      this.showWeeklyResult(this.currentWeeklyData.title, updatedSummary)
      this.showToast('结构优化已保存')
      return
    }

    const storage = new DiaryStorage()
    const title = this.elements.editorTitle.value.trim() ||
      this.extractTitle(this.currentStructuredContent)

    if (this.currentDiaryId) {
      const existing = storage.getById(this.currentDiaryId)
      const updates = {
        structured_version: this.currentStructuredContent,
        finalVersion: this.currentStructuredContent
      }
      if (existing && !existing.original_content) {
        updates.original_content = existing.content || this.elements.editorContent.value.trim()
      }
      storage.update(this.currentDiaryId, updates)
    } else {
      const diary = storage.create({
        title,
        content: this.elements.editorContent.value.trim(),
        original_content: this.elements.editorContent.value.trim(),
        structured_version: this.currentStructuredContent,
        finalVersion: this.currentStructuredContent,
        images: [...this.currentImages]
      })
      this.currentDiaryId = diary.id
    }

    this.elements.editorContent.value = this.currentStructuredContent
    this.updateWordCount()
    this.hideStructureModal()
    this.renderDiaryList()
    this.showToast('结构优化已保存')
  }

  showOriginalModal() {
    if (!this.currentDiaryId) {
      this.showToast('暂无可查看的原文')
      return
    }
    const storage = new DiaryStorage()
    const diary = storage.getById(this.currentDiaryId)
    if (!diary) {
      this.showToast('日记不存在')
      return
    }
    const original = diary.original_content || diary.content || ''
    if (this.elements.originalContent) {
      this.elements.originalContent.textContent = original
    }
    if (this.elements.modalOriginal) {
      this.elements.modalOriginal.classList.remove('hidden')
    }
  }

  hideOriginalModal() {
    if (this.elements.modalOriginal) {
      this.elements.modalOriginal.classList.add('hidden')
    }
  }

  showAnalysisModal(diaryId, analysis) {
    const storage = new DiaryStorage()
    const diary = storage.getById(diaryId)

    const baseContent = this.getDiaryEffectiveContent(diary)
    const highlightedContent = this.highlightNegativeSentences(baseContent, analysis)

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

  splitTreeContent(content) {
    const text = (content || '').trim()
    if (!text) {
      return { bodyText: '', treeText: '' }
    }
    const treeMatch = text.match(/\n\s*目录树[:：]\s*\n/i)
    if (!treeMatch) {
      return { bodyText: text, treeText: '' }
    }
    const splitIndex = treeMatch.index ?? -1
    if (splitIndex < 0) {
      return { bodyText: text, treeText: '' }
    }
    return {
      bodyText: text.slice(0, splitIndex).trim(),
      treeText: text.slice(splitIndex + treeMatch[0].length).trim()
    }
  }

  renderStructureContent(content) {
    const { bodyText, treeText } = this.splitTreeContent(content)
    if (!bodyText && !treeText) {
      return ''
    }
    const blocks = bodyText.split(/\n{2,}/).map(block => block.trim()).filter(Boolean)
    const paragraphs = blocks.length > 0 ? blocks : bodyText.split('\n').map(block => block.trim()).filter(Boolean)
    let html = paragraphs.map(paragraph => `<p class="structure-paragraph">${this.escapeHtml(paragraph)}</p>`).join('')

    if (treeText) {
      html += `<div class="structure-tree-title">目录树</div>`
      html += `<pre class="structure-tree">${this.escapeHtml(treeText)}</pre>`
    }

    return html
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
        let updatedContent = ''
        let updatedTitle = ''
        if (diary) {
          const result = await fn(diaryId, diary, storage)
          updatedContent = result?.content || ''
          updatedTitle = result?.title || ''
          this.renderDiaryList()
        }
        modal.classList.add('hidden')
        if (updatedContent) {
          this.elements.editorContent.value = updatedContent
          this.elements.editorTitle.value = updatedTitle || this.extractTitle(updatedContent)
          this.currentDiaryId = diaryId
          this.updateWordCount()
          this.updateImagePreview()
          if (confirm('是否继续进行结构分析？')) {
            this.handleStructureAnalysis()
          }
        }
      }
    }

    btnKeepOriginal.onclick = handler((id, diary, storage) => {
      const baseContent = this.getDiaryEffectiveContent(diary)
      storage.saveFinalVersion(id, baseContent)
      this.showToast('已保留原文')
      return { content: baseContent, title: diary.title }
    })

    btnUseRewritten.onclick = handler((id, diary, storage) => {
      const rewritten = diary?.analysis?.rewritten_version || ''
      const newTitle = diary?.analysis?.title || ''
      if (rewritten) {
        storage.update(id, {
          finalVersion: rewritten,
          structured_version: rewritten,
          title: newTitle || undefined
        })
        this.showToast('已采用改写版本')
        return { content: rewritten, title: newTitle || diary.title }
      } else {
        this.showToast('没有可用的改写版本')
      }
      return null
    })

    btnRegenerate.onclick = async () => {
      const storage = new DiaryStorage()
      const diary = storage.getById(diaryId)
      if (!diary) return
      const baseContent = this.getDiaryEffectiveContent(diary)

      btnRegenerate.disabled = true
      btnRegenerate.textContent = '生成中...'

      try {
        const api = new ZhipuAPI()
        const result = await api.analyze(baseContent, (percent, status, info) => {
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
    this.elements.editorContent.oninput = () => {
      this.updateWordCount()
      this.updateImagePreview()
    }
  }

  updateImagePreview() {
    if (!this.elements.editorImages) return
    if (this.currentImages.length === 0) {
      this.elements.editorImages.innerHTML = ''
      this.elements.editorImages.classList.add('hidden')
      return
    }

    this.elements.editorImages.classList.remove('hidden')
    this.elements.editorImages.innerHTML = this.currentImages.map(url => `
      <div class="editor-image-item">
        <img src="${this.escapeHtml(url)}" alt="图片">
        <button class="editor-image-remove" data-url="${this.escapeHtml(url)}">×</button>
      </div>
    `).join('')
  }

  updateWeeklyImagePreview() {
    if (!this.elements.weeklyEditorImages) return
    if (this.weeklyImages.length === 0) {
      this.elements.weeklyEditorImages.innerHTML = ''
      this.elements.weeklyEditorImages.classList.add('hidden')
      return
    }

    this.elements.weeklyEditorImages.classList.remove('hidden')
    this.elements.weeklyEditorImages.innerHTML = this.weeklyImages.map(url => `
      <div class="editor-image-item">
        <img src="${this.escapeHtml(url)}" alt="图片">
        <button class="editor-image-remove" data-url="${this.escapeHtml(url)}">×</button>
      </div>
    `).join('')
  }

  updateWeeklyResultImages(images) {
    if (!this.elements.weeklyResultImages) return
    const list = Array.isArray(images) ? images : []
    if (list.length === 0) {
      this.elements.weeklyResultImages.innerHTML = ''
      this.elements.weeklyResultImages.classList.add('hidden')
      return
    }

    this.elements.weeklyResultImages.classList.remove('hidden')
    this.elements.weeklyResultImages.innerHTML = list.map(url => `
      <div class="editor-image-item">
        <img src="${this.escapeHtml(url)}" alt="图片">
      </div>
    `).join('')
  }

  handleRemoveImage(e) {
    const button = e.target.closest('.editor-image-remove')
    if (!button) return
    const url = button.dataset.url
    if (!url) return
    this.currentImages = this.currentImages.filter(item => item !== url)
    this.updateImagePreview()
    this.updateWordCount()
  }

  handleRemoveWeeklyImage(e) {
    const button = e.target.closest('.editor-image-remove')
    if (!button) return
    const url = button.dataset.url
    if (!url) return
    this.weeklyImages = this.weeklyImages.filter(item => item !== url)
    if (this.currentWeeklyData) {
      this.currentWeeklyData = {
        ...this.currentWeeklyData,
        images: [...this.weeklyImages]
      }
    }
    this.updateWeeklyImagePreview()
  }

  normalizeDiaryContent(diary) {
    const rawContent = diary.structured_version || diary.finalVersion || diary.content || ''
    const images = Array.isArray(diary.images) ? [...diary.images] : []
    const lines = rawContent.split('\n')
    const filtered = lines.filter(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith('img:')) {
        const url = trimmed.replace(/^img:/, '').trim()
        if (url && !images.includes(url)) {
          images.push(url)
        }
        return false
      }
      return true
    })
    return { content: filtered.join('\n').trim(), images }
  }

  getDiaryEffectiveContent(diary) {
    if (!diary) return ''
    return diary.structured_version || diary.finalVersion || diary.content || ''
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

  showStructureProgress(onCancel) {
    const progressPanel = document.getElementById('analysis-progress')
    if (progressPanel) {
      progressPanel.classList.remove('hidden')
      this.updateProgress(0, '正在结构优化...', '准备优化')
    }
    this.bindCancelAnalysis(onCancel, '已取消结构优化')
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

  bindCancelAnalysis(onCancel, message) {
    const btnCancel = document.getElementById('btn-cancel-analysis')
    if (btnCancel) {
      btnCancel.onclick = () => {
        this.hideAnalysisProgress()
        this.showToast(message || '已取消分析')
        if (onCancel) {
          onCancel()
        }
      }
    }
  }

  viewerFontSize = 18
  viewerCurrentDiaryId = null
  viewerDiaries = []
  viewerMode = 'diary'
  viewerCurrentWeeklyId = null
  viewerWeeklies = []

  showViewer(diaryId) {
    const storage = new DiaryStorage()
    this.viewerDiaries = storage.getAll()
    this.viewerMode = 'diary'

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

  showWeeklyViewer(weeklyId) {
    const storage = new DiaryStorage()
    this.viewerWeeklies = storage.getAllWeekly().slice().sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    this.viewerMode = 'weekly'

    const currentIndex = this.viewerWeeklies.findIndex(w => w.id === weeklyId)
    if (currentIndex === -1) {
      this.showToast('周记不存在')
      return
    }

    this.viewerCurrentWeeklyId = weeklyId
    this.viewerFontSize = 18

    this.renderWeeklyViewerContent(weeklyId)
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

    const normalized = this.normalizeDiaryContent(diary)
    const { bodyText, treeText } = this.splitTreeContent(normalized.content)
    const content = bodyText
    const article = document.getElementById('viewer-article')
    const images = normalized.images

    const paragraphs = content.split('\n').filter(p => p.trim())

    let html = `
      <h1 class="viewer-title">${this.escapeHtml(diary.title)}</h1>
      <div class="viewer-date">${this.formatDate(diary.date)}</div>
    `

    if (images.length > 0) {
      html += images.map(url => `
        <img src="${this.escapeHtml(url)}" onerror="this.outerHTML='<div class=\\'image-placeholder\\'>图片加载失败</div>'">
      `).join('')
    }

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

    if (treeText) {
      html += `<div class="viewer-tree-title">目录树</div>`
      html += `<pre class="viewer-tree">${this.escapeHtml(treeText)}</pre>`
    }

    article.innerHTML = html
    article.style.fontSize = `${this.viewerFontSize}px`
  }

  renderWeeklyViewerContent(weeklyId) {
    const storage = new DiaryStorage()
    const weekly = storage.getWeeklyById(weeklyId)
    if (!weekly) return

    const article = document.getElementById('viewer-article')
    const startDate = new Date(weekly.startDate)
    const endDate = new Date(weekly.endDate)
    const dateRange = `${startDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}`
    const summary = (weekly.summary || '').trim()
    const paragraphs = summary ? summary.split(/\n+/).map(p => p.trim()).filter(Boolean) : []
    const images = Array.isArray(weekly.images) ? weekly.images : []

    let html = `
      <h1 class="viewer-title">${this.escapeHtml(weekly.title || '无标题')}</h1>
      <div class="viewer-date">${this.escapeHtml(dateRange)}</div>
    `

    if (images.length > 0) {
      html += images.map(url => `
        <img src="${this.escapeHtml(url)}" onerror="this.outerHTML='<div class=\\'image-placeholder\\'>图片加载失败</div>'">
      `).join('')
    }

    if (paragraphs.length === 0) {
      html += `<p class="viewer-content">${this.escapeHtml(summary)}</p>`
    } else {
      paragraphs.forEach((para, index) => {
        if (index === 0 && para.length > 0) {
          const firstChar = para[0]
          const rest = para.slice(1)
          html += `<p><span class="viewer-first-letter">${this.escapeHtml(firstChar)}</span><span class="viewer-content">${this.escapeHtml(rest)}</span></p>`
        } else if (para.trim()) {
          html += `<p class="viewer-content">${this.escapeHtml(para)}</p>`
        }
      })
    }

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
    if (this.viewerMode === 'weekly') {
      const weeklies = this.viewerWeeklies
      if (weeklies.length === 0) return
      const currentIndex = weeklies.findIndex(w => w.id === this.viewerCurrentWeeklyId)

      let newIndex
      if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : weeklies.length - 1
      } else {
        newIndex = currentIndex < weeklies.length - 1 ? currentIndex + 1 : 0
      }

      if (weeklies[newIndex]) {
        this.viewerCurrentWeeklyId = weeklies[newIndex].id
        this.renderWeeklyViewerContent(weeklies[newIndex].id)
        this.updateViewerNavigation()
      }
      return
    }

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

    if (this.viewerMode === 'weekly') {
      if (this.viewerWeeklies.length <= 1) {
        btnPrev.style.visibility = 'hidden'
        btnNext.style.visibility = 'hidden'
      } else {
        btnPrev.style.visibility = 'visible'
        btnNext.style.visibility = 'visible'
      }
      return
    }

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
  weeklyEditingExisting = false
  weeklySelection = {
    mode: 'range',
    rangeType: 'last-week',
    startDate: '',
    endDate: '',
    selectedIds: new Set()
  }
  weeklyAllDiaries = []
  weeklyVisibleDiaries = []

  async showWeeklyGenerator() {
    this.showWeeklyModal()
    const title = document.getElementById('weekly-modal-title')
    if (title) title.textContent = '周记生成'
    const btnSave = document.getElementById('btn-save-weekly')
    if (btnSave) btnSave.style.display = ''
    const btnRegenerate = document.getElementById('btn-regenerate-weekly')
    if (btnRegenerate) btnRegenerate.textContent = '重新生成'
    this.weeklyEditingExisting = false
    this.weeklyImages = []
    this.updateWeeklyImagePreview()
    this.updateWeeklyResultImages([])
    this.prepareWeeklySelector()
    this.showWeeklySelectorView()
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
      this.weeklyEditingExisting = false
    }
  }

  showWeeklySelectorView() {
    const selector = document.getElementById('weekly-selector')
    const selectionFooter = document.getElementById('weekly-selection-footer')
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')
    const editor = document.getElementById('weekly-editor')
    const editorFooter = document.getElementById('weekly-editor-footer')

    if (selector) selector.classList.remove('hidden')
    if (selectionFooter) selectionFooter.classList.remove('hidden')
    if (progress) progress.classList.add('hidden')
    if (result) result.classList.add('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.add('hidden')
    if (editor) editor.classList.add('hidden')
    if (editorFooter) editorFooter.classList.add('hidden')
  }

  showWeeklyProgress(show, percent, status, info) {
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')
    const selector = document.getElementById('weekly-selector')
    const selectionFooter = document.getElementById('weekly-selection-footer')
    const editor = document.getElementById('weekly-editor')
    const editorFooter = document.getElementById('weekly-editor-footer')

    if (progress) {
      show ? progress.classList.remove('hidden') : progress.classList.add('hidden')
    }
    if (result) result.classList.add('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.add('hidden')
    if (selector) selector.classList.add('hidden')
    if (selectionFooter) selectionFooter.classList.add('hidden')
    if (editor) editor.classList.add('hidden')
    if (editorFooter) editorFooter.classList.add('hidden')

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
    const selector = document.getElementById('weekly-selector')
    const selectionFooter = document.getElementById('weekly-selection-footer')
    const editor = document.getElementById('weekly-editor')
    const editorFooter = document.getElementById('weekly-editor-footer')
    const title = document.getElementById('weekly-modal-title')

    if (progress) progress.classList.add('hidden')
    if (result) result.classList.add('hidden')
    if (empty) empty.classList.remove('hidden')
    if (footer) footer.classList.add('hidden')
    if (selector) selector.classList.add('hidden')
    if (selectionFooter) selectionFooter.classList.add('hidden')
    if (editor) editor.classList.add('hidden')
    if (editorFooter) editorFooter.classList.add('hidden')
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
          <p class="weekly-tip">还没有可用于生成的日记</p>
          <div class="weekly-actions">
            <button class="btn btn-primary" onclick="ui.hideWeeklyModal(); ui.showEditor()">继续写日记</button>
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
    const selector = document.getElementById('weekly-selector')
    const selectionFooter = document.getElementById('weekly-selection-footer')
    const editor = document.getElementById('weekly-editor')
    const editorFooter = document.getElementById('weekly-editor-footer')

    const titleEl = document.getElementById('weekly-title')
    const summaryEl = document.getElementById('weekly-summary')

    if (progress) progress.classList.add('hidden')
    if (result) result.classList.remove('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.remove('hidden')
    if (selector) selector.classList.add('hidden')
    if (selectionFooter) selectionFooter.classList.add('hidden')
    if (editor) editor.classList.add('hidden')
    if (editorFooter) editorFooter.classList.add('hidden')

    if (titleEl) titleEl.textContent = title
    if (summaryEl) summaryEl.textContent = summary
    if (this.currentWeeklyData) {
      const images = Array.isArray(this.currentWeeklyData.images) ? [...this.currentWeeklyData.images] : []
      this.weeklyImages = images
      this.updateWeeklyResultImages(images)
    } else {
      this.updateWeeklyResultImages([])
    }
  }

  bindWeeklyModalEvents() {
    const btnClose = document.getElementById('btn-close-weekly')
    const btnRegenerate = document.getElementById('btn-regenerate-weekly')
    const btnStructure = document.getElementById('btn-weekly-structure')
    const btnSave = document.getElementById('btn-save-weekly')
    const btnGenerate = document.getElementById('btn-generate-weekly')
    const btnSelectAll = document.getElementById('btn-weekly-select-all')
    const btnClear = document.getElementById('btn-weekly-clear')
    const btnEdit = document.getElementById('btn-edit-weekly')

    if (btnClose) {
      btnClose.onclick = () => this.hideWeeklyModal()
    }

    if (btnRegenerate) {
      btnRegenerate.onclick = () => this.regenerateWeekly()
    }

    if (btnStructure) {
      btnStructure.onclick = () => this.handleWeeklyStructureAnalysis()
    }

    if (btnSave) {
      btnSave.onclick = () => this.saveWeekly()
    }

    if (btnGenerate) {
      btnGenerate.onclick = () => this.generateWeeklyFromSelection()
    }

    if (btnSelectAll) {
      btnSelectAll.onclick = () => this.selectAllWeeklyDiaries()
    }

    if (btnClear) {
      btnClear.onclick = () => this.clearWeeklySelection()
    }

    if (btnEdit) {
      btnEdit.onclick = () => this.openWeeklyEditorFromCurrent()
    }
  }

  prepareWeeklySelector() {
    const storage = new DiaryStorage()
    this.weeklyAllDiaries = storage.getAll().slice().sort((a, b) => new Date(a.date) - new Date(b.date))
    const lastWeek = this.getWeeklyRangeByType('last-week')
    this.weeklySelection = {
      mode: 'range',
      rangeType: 'last-week',
      startDate: lastWeek.startDate,
      endDate: lastWeek.endDate,
      selectedIds: new Set()
    }
    this.applyWeeklyRangeSelection()
    this.renderWeeklySelector()
    this.bindWeeklySelectorEvents()
  }

  bindWeeklySelectorEvents() {
    const modeSelect = document.getElementById('weekly-select-mode')
    const rangeSelect = document.getElementById('weekly-range-type')
    const startInput = document.getElementById('weekly-range-start')
    const endInput = document.getElementById('weekly-range-end')
    const listEl = document.getElementById('weekly-diary-list')

    if (modeSelect) {
      modeSelect.onchange = (event) => {
        this.weeklySelection.mode = event.target.value
        if (this.weeklySelection.mode === 'range') {
          this.applyWeeklyRangeSelection()
        }
        this.renderWeeklySelector()
      }
    }

    if (rangeSelect) {
      rangeSelect.onchange = (event) => {
        this.weeklySelection.rangeType = event.target.value
        if (this.weeklySelection.rangeType !== 'custom') {
          const range = this.getWeeklyRangeByType(this.weeklySelection.rangeType)
          this.weeklySelection.startDate = range.startDate
          this.weeklySelection.endDate = range.endDate
        }
        if (this.weeklySelection.mode === 'range') {
          this.applyWeeklyRangeSelection()
        }
        this.renderWeeklySelector()
      }
    }

    if (startInput) {
      startInput.onchange = () => this.handleWeeklyCustomRangeChange()
    }

    if (endInput) {
      endInput.onchange = () => this.handleWeeklyCustomRangeChange()
    }

    if (listEl) {
      listEl.onchange = (event) => {
        const checkbox = event.target.closest('input[type="checkbox"]')
        if (!checkbox) return
        const id = checkbox.value
        if (!id) return
        if (checkbox.checked) {
          this.weeklySelection.selectedIds.add(id)
        } else {
          this.weeklySelection.selectedIds.delete(id)
        }
        this.updateWeeklySelectionSummary()
        this.updateWeeklyGenerateState()
      }
    }
  }

  handleWeeklyCustomRangeChange() {
    const startInput = document.getElementById('weekly-range-start')
    const endInput = document.getElementById('weekly-range-end')
    if (!startInput || !endInput) return
    const startDate = startInput.value
    const endDate = endInput.value
    if (!startDate || !endDate) return
    if (new Date(startDate) > new Date(endDate)) {
      this.showToast('开始日期不能晚于结束日期')
      return
    }
    this.weeklySelection.startDate = startDate
    this.weeklySelection.endDate = endDate
    if (this.weeklySelection.mode === 'range') {
      this.applyWeeklyRangeSelection()
    }
    this.renderWeeklySelector()
  }

  applyWeeklyRangeSelection() {
    if (this.weeklySelection.mode !== 'range') return
    const rangeDiaries = this.getWeeklyVisibleDiaries()
    this.weeklySelection.selectedIds = new Set(rangeDiaries.map(d => d.id))
  }

  renderWeeklySelector() {
    const modeSelect = document.getElementById('weekly-select-mode')
    const rangeSelect = document.getElementById('weekly-range-type')
    const startInput = document.getElementById('weekly-range-start')
    const endInput = document.getElementById('weekly-range-end')
    const rangeControls = document.getElementById('weekly-range-controls')
    const customRange = document.getElementById('weekly-custom-range')
    const listEl = document.getElementById('weekly-diary-list')

    if (modeSelect) modeSelect.value = this.weeklySelection.mode
    if (rangeSelect) rangeSelect.value = this.weeklySelection.rangeType
    if (startInput) startInput.value = this.weeklySelection.startDate || ''
    if (endInput) endInput.value = this.weeklySelection.endDate || ''

    if (rangeControls) {
      this.weeklySelection.mode === 'range'
        ? rangeControls.classList.remove('hidden')
        : rangeControls.classList.add('hidden')
    }
    if (customRange) {
      this.weeklySelection.mode === 'range' && this.weeklySelection.rangeType === 'custom'
        ? customRange.classList.remove('hidden')
        : customRange.classList.add('hidden')
    }

    const diaries = this.getWeeklyVisibleDiaries()
    this.weeklyVisibleDiaries = diaries

    if (listEl) {
      if (diaries.length === 0) {
        listEl.innerHTML = `<div class="weekly-empty">暂无日记</div>`
      } else {
        let html = ''
        let currentDate = ''
        for (let i = 0; i < diaries.length; i += 1) {
          const diary = diaries[i]
          const dateLabel = this.formatDate(diary.date)
          if (dateLabel !== currentDate) {
            if (currentDate) {
              html += `</div>`
            }
            currentDate = dateLabel
            html += `<div class="weekly-diary-group"><div class="weekly-diary-date">${this.escapeHtml(dateLabel)}</div>`
          }
          const checked = this.weeklySelection.selectedIds.has(diary.id) ? 'checked' : ''
          const preview = this.getWeeklyDiaryPreview(diary)
          html += `
            <label class="weekly-diary-item">
              <input type="checkbox" value="${diary.id}" ${checked}>
              <div>
                <div class="weekly-diary-title">${this.escapeHtml(diary.title || '无标题')}</div>
                <div class="weekly-diary-preview">${this.escapeHtml(preview)}</div>
              </div>
            </label>
          `
        }
        if (currentDate) {
          html += `</div>`
        }
        listEl.innerHTML = html
      }
    }

    this.updateWeeklySelectionSummary()
    this.updateWeeklyGenerateState()
  }

  updateWeeklySelectionSummary() {
    const countEl = document.getElementById('weekly-selected-count')
    const rangeEl = document.getElementById('weekly-selected-range')
    const tipEl = document.getElementById('weekly-selection-tip')
    const count = this.weeklySelection.selectedIds.size
    if (countEl) countEl.textContent = `已选 ${count} 篇`

    let rangeLabel = ''
    if (count > 0) {
      const diaries = this.getSelectedDiaries()
      const range = this.getWeeklyDateRangeFromDiaries(diaries)
      rangeLabel = range ? `范围：${this.formatRangeLabel(range.startDate, range.endDate)}` : ''
    }
    if (rangeEl) rangeEl.textContent = rangeLabel

    let tip = ''
    if (count === 0) {
      tip = '请选择至少一篇日记'
    } else if (count < 3) {
      tip = `已选 ${count} 篇，建议至少 3 篇以获得更好的效果`
    }
    if (tipEl) tipEl.textContent = tip
  }

  updateWeeklyGenerateState() {
    const btnGenerate = document.getElementById('btn-generate-weekly')
    if (btnGenerate) {
      btnGenerate.disabled = this.weeklySelection.selectedIds.size === 0
    }
  }

  getWeeklyRangeByType(type) {
    const storage = new DiaryStorage()
    const now = new Date()
    if (type === 'this-week') {
      return storage.getWeekRangeByDate(now)
    }
    if (type === 'last-week') {
      const lastWeek = new Date(now)
      lastWeek.setDate(now.getDate() - 7)
      return storage.getWeekRangeByDate(lastWeek)
    }
    return {
      startDate: this.weeklySelection.startDate,
      endDate: this.weeklySelection.endDate
    }
  }

  getWeeklyVisibleDiaries() {
    if (this.weeklySelection.mode === 'manual') {
      return this.weeklyAllDiaries
    }
    const { startDate, endDate } = this.weeklySelection
    if (!startDate || !endDate) return []
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return this.weeklyAllDiaries.filter(diary => {
      const date = new Date(diary.date)
      return date >= start && date <= end
    })
  }

  selectAllWeeklyDiaries() {
    const diaries = this.weeklyVisibleDiaries.length > 0 ? this.weeklyVisibleDiaries : this.getWeeklyVisibleDiaries()
    this.weeklySelection.selectedIds = new Set(diaries.map(d => d.id))
    this.renderWeeklySelector()
  }

  clearWeeklySelection() {
    this.weeklySelection.selectedIds.clear()
    this.renderWeeklySelector()
  }

  async generateWeeklyFromSelection() {
    const diaries = this.getSelectedDiaries()
    if (diaries.length === 0) {
      this.showToast('请选择至少一篇日记')
      return
    }

    this.showWeeklyProgress(true, 0, '正在生成周记...', `已选 ${diaries.length} 篇`)

    try {
      const api = new ZhipuAPI()
      const result = await api.generateWeeklySummary(diaries, (percent, status, info) => {
        this.updateWeeklyProgress(percent, status, info)
      })

      const range = this.getWeeklyDateRangeFromDiaries(diaries)
      const startDate = range?.startDate || diaries[0].date
      const endDate = range?.endDate || diaries[diaries.length - 1].date
      const weekInfo = this.getWeekInfoFromDate(startDate)
      const weeklyId = `weekly_${startDate}_${endDate}`

      this.currentWeeklyData = {
        id: weeklyId,
        year: weekInfo.year,
        weekNumber: weekInfo.weekNumber,
        startDate,
        endDate,
        diaryIds: diaries.map(d => d.id),
        title: result.title,
        summary: result.summary,
        images: []
      }
      this.weeklyImages = []

      this.showWeeklyResult(result.title, result.summary)
      this.bindWeeklyModalEvents()
    } catch (error) {
      this.showToast(error.message)
      this.hideWeeklyModal()
    }
  }

  getSelectedDiaries() {
    return this.weeklyAllDiaries
      .filter(diary => this.weeklySelection.selectedIds.has(diary.id))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  getWeeklyDateRangeFromDiaries(diaries) {
    if (!diaries || diaries.length === 0) return null
    const storage = new DiaryStorage()
    const dates = diaries.map(d => new Date(d.date)).sort((a, b) => a - b)
    return {
      startDate: storage.formatDateToISO(dates[0]),
      endDate: storage.formatDateToISO(dates[dates.length - 1])
    }
  }

  getWeekInfoFromDate(dateStr) {
    const storage = new DiaryStorage()
    const date = new Date(dateStr)
    return {
      year: date.getFullYear(),
      weekNumber: storage.getISOWeekNumber(date)
    }
  }

  getWeeklyDiariesFromCurrent(storage) {
    if (this.currentWeeklyData.diaryIds && this.currentWeeklyData.diaryIds.length > 0) {
      const diaries = storage.getAll()
      return diaries
        .filter(diary => this.currentWeeklyData.diaryIds.includes(diary.id))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    }
    if (this.currentWeeklyData.startDate && this.currentWeeklyData.endDate) {
      return storage.getDiariesInDateRange(this.currentWeeklyData.startDate, this.currentWeeklyData.endDate)
    }
    if (this.currentWeeklyData.year && this.currentWeeklyData.weekNumber) {
      return storage.getDiariesForWeek(this.currentWeeklyData.year, this.currentWeeklyData.weekNumber)
    }
    return []
  }

  getWeeklyDiaryPreview(diary) {
    const normalized = this.normalizeDiaryContent(diary)
    const content = normalized.content || ''
    return content.length > 60 ? `${content.slice(0, 60)}...` : content
  }

  formatRangeLabel(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''
    const startText = start.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
    const endText = end.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
    return `${startText} - ${endText}`
  }

  async regenerateWeekly() {
    if (!this.currentWeeklyData) return

    const storage = new DiaryStorage()
    const diaries = this.getWeeklyDiariesFromCurrent(storage)
    if (diaries.length === 0) {
      this.showToast('没有找到可重新生成的日记')
      return
    }

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

  async handleWeeklyStructureAnalysis() {
    if (!this.currentWeeklyData) {
      this.showToast('暂无可分析的周记')
      return
    }
    const content = (this.currentWeeklyData.summary || '').trim()
    if (content.length < Config.validation.minContentLength) {
      this.showToast('内容太短，至少需要5个字符')
      return
    }

    this.structureTargetType = 'weekly'
    this.structureTargetId = this.currentWeeklyData.id
    const api = new ZhipuAPI()
    this.showStructureProgress(() => api.abort())

    try {
      const result = await api.analyzeStructure(content, (percent, status, info) => {
        this.updateProgress(percent, status, info)
      })
      this.hideAnalysisProgress()
      this.currentStructuredContent = result.structured_version || ''
      this.showStructureModal(this.currentStructuredContent)
    } catch (error) {
      this.hideAnalysisProgress()
      if (error.message.includes('请求频率')) {
        this.showToast(error.message)
      } else if (error.message.includes('网络') || error.message.includes('取消')) {
        this.showToast('网络问题，请稍后重试')
      } else if (error.message.includes('超时')) {
        this.showToast('结构优化超时，请重试')
      } else {
        this.showToast(error.message)
      }
    }
  }

  saveWeekly() {
    if (!this.currentWeeklyData) return

    const storage = new DiaryStorage()
    this.currentWeeklyData = {
      ...this.currentWeeklyData,
      images: [...this.weeklyImages]
    }
    const weekly = storage.createWeekly(this.currentWeeklyData)

    this.hideWeeklyModal()
    this.showWeeklyList()
    this.showToast('周记已保存')
  }

  editWeekly(id) {
    const storage = new DiaryStorage()
    const weekly = storage.getWeeklyById(id)

    if (!weekly) {
      this.showToast('周记不存在')
      return
    }

    this.showWeeklyEditor(weekly, true)
  }

  openWeeklyEditorFromCurrent() {
    if (!this.currentWeeklyData) {
      this.showToast('暂无可编辑的周记')
      return
    }
    const storage = new DiaryStorage()
    const existing = storage.getWeeklyById(this.currentWeeklyData.id)
    const data = existing ? { ...existing } : { ...this.currentWeeklyData }
    this.showWeeklyEditor(data, Boolean(existing))
  }

  showWeeklyEditor(weekly, isExisting) {
    this.showWeeklyModal()
    this.weeklyEditingExisting = Boolean(isExisting)
    this.currentWeeklyData = { ...weekly }

    const title = document.getElementById('weekly-modal-title')
    if (title) title.textContent = '编辑周记'

    const selector = document.getElementById('weekly-selector')
    const selectionFooter = document.getElementById('weekly-selection-footer')
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')
    const editor = document.getElementById('weekly-editor')
    const editorFooter = document.getElementById('weekly-editor-footer')

    if (selector) selector.classList.add('hidden')
    if (selectionFooter) selectionFooter.classList.add('hidden')
    if (progress) progress.classList.add('hidden')
    if (result) result.classList.add('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.add('hidden')
    if (editor) editor.classList.remove('hidden')
    if (editorFooter) editorFooter.classList.remove('hidden')

    const titleInput = document.getElementById('weekly-editor-title')
    const summaryInput = document.getElementById('weekly-editor-summary')
    if (titleInput) titleInput.value = weekly.title || ''
    if (summaryInput) summaryInput.value = weekly.summary || ''
    this.weeklyImages = Array.isArray(weekly.images) ? [...weekly.images] : []
    this.updateWeeklyImagePreview()

    const btnCancel = document.getElementById('btn-cancel-weekly-edit')
    const btnSave = document.getElementById('btn-save-weekly-edit')

    if (btnCancel) {
      btnCancel.onclick = () => {
        if (this.weeklyEditingExisting) {
          this.hideWeeklyModal()
          this.showWeeklyList()
        } else {
          this.showWeeklyResult(this.currentWeeklyData.title, this.currentWeeklyData.summary)
        }
      }
    }

    if (btnSave) {
      btnSave.onclick = () => this.saveWeeklyEdit()
    }
  }

  saveWeeklyEdit() {
    const titleInput = document.getElementById('weekly-editor-title')
    const summaryInput = document.getElementById('weekly-editor-summary')
    const titleValue = titleInput ? titleInput.value.trim() : ''
    const summaryValue = summaryInput ? summaryInput.value.trim() : ''

    if (!summaryValue) {
      this.showToast('请输入周记内容')
      return
    }

    const finalTitle = titleValue || this.currentWeeklyData?.title || '无标题'
    const images = [...this.weeklyImages]
    this.currentWeeklyData = {
      ...this.currentWeeklyData,
      title: finalTitle,
      summary: summaryValue,
      images
    }

    if (this.weeklyEditingExisting) {
      const storage = new DiaryStorage()
      storage.updateWeekly(this.currentWeeklyData.id, {
        title: finalTitle,
        summary: summaryValue,
        images
      })
      this.hideWeeklyModal()
      this.renderWeeklyList()
      this.showToast('周记已更新')
      return
    }

    this.showWeeklyResult(finalTitle, summaryValue)
    this.showToast('周记内容已更新')
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
      const images = Array.isArray(weekly.images) ? weekly.images : []
      const thumbUrl = images[0] || null

      return `
        <div class="weekly-card" onclick="ui.showWeeklyViewer('${weekly.id}')">
          <div class="weekly-card-body">
            ${thumbUrl ? `<img src="${this.escapeHtml(thumbUrl)}" class="diary-thumbnail" onerror="this.style.display='none'">` : ''}
            <div class="weekly-card-main">
              <div class="weekly-card-header">
                <h3 class="weekly-card-title">${this.escapeHtml(weekly.title)}</h3>
                <span class="weekly-card-date">${dateRange}</span>
              </div>
              <p class="weekly-card-summary">${this.escapeHtml(weekly.summary.substring(0, 150))}...</p>
              <div class="weekly-card-footer">
                <button class="btn-small" onclick="event.stopPropagation(); ui.showWeeklyViewer('${weekly.id}')">查看</button>
                <button class="btn-small" onclick="event.stopPropagation(); ui.editWeekly('${weekly.id}')">编辑</button>
                <button class="btn-small" onclick="event.stopPropagation(); ui.deleteWeekly('${weekly.id}')">删除</button>
              </div>
            </div>
          </div>
        </div>
      `
    }).join('')
  }

  viewWeekly(id) {
    this.showWeeklyViewer(id)
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
