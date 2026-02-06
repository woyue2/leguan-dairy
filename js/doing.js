class DoingManager {
    constructor() {
        this.tasks = []
        this.activeFilter = null
        this.storageKey = "diary-doing-tasks"
        this.useServerStorage = true  // 使用服务器存储
        this.loadTasks()
        this.initAnimations()
    }

    async loadTasks() {
        if (this.useServerStorage) {
            try {
                const response = await fetch('/api/doing')
                if (response.ok) {
                    const data = await response.json()
                    this.tasks = data.length > 0 ? data : this.getDefaultTasks()
                } else {
                    throw new Error('API 请求失败')
                }
            } catch (e) {
                console.error("从服务器加载任务失败，使用本地缓存:", e)
                // 降级到 localStorage
                const saved = localStorage.getItem(this.storageKey)
                if (saved) {
                    this.tasks = JSON.parse(saved)
                } else {
                    this.tasks = this.getDefaultTasks()
                }
            }
        } else {
            // 使用 localStorage（备用方案）
            try {
                const saved = localStorage.getItem(this.storageKey)
                if (saved) {
                    this.tasks = JSON.parse(saved)
                } else {
                    this.tasks = this.getDefaultTasks()
                }
            } catch (e) {
                console.error("加载任务失败:", e)
                this.tasks = this.getDefaultTasks()
            }
        }

        // 为没有 order 字段的旧任务添加默认值，并按 order 排序
        this.tasks.forEach((task, index) => {
            if (task.order === undefined) {
                task.order = index
            }
        })
        this.tasks.sort((a, b) => a.order - b.order)
    }

    async saveTasks() {
        if (this.useServerStorage) {
            try {
                const response = await fetch('/api/doing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.tasks)
                })

                if (response.ok) {
                    // 同时备份到 localStorage
                    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks))
                    return true
                } else {
                    throw new Error('API 请求失败')
                }
            } catch (e) {
                console.error("保存任务到服务器失败，已保存到本地:", e)
                // 降级到 localStorage
                localStorage.setItem(this.storageKey, JSON.stringify(this.tasks))
                return false
            }
        } else {
            // 使用 localStorage（备用方案）
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.tasks))
                return true
            } catch (e) {
                console.error("保存任务失败:", e)
                return false
            }
        }
    }

    getDefaultTasks() {
        return [
            { id: 1, text: "完成日记本 ImgURL V3 迁移验证", priority: "urgent", completed: false, tags: ["紧急"], remark: "" },
            { id: 2, text: "设计 真棒 动画效果页面", priority: "deep", completed: false, tags: ["深度工作"], remark: "" },
            { id: 3, text: "购买本周的生活用品", priority: "normal", completed: false, tags: ["琐事"], remark: "" }
        ]
    }

    init() {
        this.initDate()
        this.initInputListeners()
        this.renderTasks()
        this.updateProgress()
        this.initDragAndDrop()
    }

    initDate() {
        const dateEl = document.getElementById("current-date")
        if (dateEl) {
            const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
            dateEl.textContent = new Date().toLocaleDateString("zh-CN", options)
        }
    }

    initInputListeners() {
        const input = document.getElementById("new-task-input")
        if (input) {
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.addTask()
            })
        }
    }

    async addTask() {
        const input = document.getElementById("new-task-input")
        const text = input.value.trim()
        if (!text) return

        let priorityVal = document.querySelector("input[name=priority]:checked")?.value || "normal"
        let initialTags = []

        if (this.activeFilter) {
            if (this.activeFilter === "紧急") {
                priorityVal = "urgent"
                initialTags.push("紧急")
            } else if (this.activeFilter === "深度工作") {
                priorityVal = "deep"
                initialTags.push("深度工作")
            } else {
                initialTags.push(this.activeFilter)
            }
        }

        const newTask = {
            id: Date.now(),
            text: text,
            priority: priorityVal,
            completed: false,
            tags: initialTags,
            remark: ""
        }

        this.tasks.push(newTask)
        await this.saveTasks()
        this.renderTasks()
        this.updateProgress()

        input.value = ""

        const list = document.getElementById("todo-list")
        if (list) list.scrollTop = list.scrollHeight
    }

    renderTasks() {
        const list = document.getElementById("todo-list")
        if (!list) return

        list.innerHTML = ""

        let filtered = this.tasks
        if (this.activeFilter) {
            filtered = this.tasks.filter(t => {
                if (this.activeFilter === "紧急" && t.priority === "urgent") return true
                if (this.activeFilter === "深度工作" && t.priority === "deep") return true
                if (t.tags && t.tags.includes(this.activeFilter)) return true
                return false
            })
        }

        if (filtered.length === 0) {
            list.innerHTML = "<div style=text-align:center;color:#ccc;margin-top:30px;>" + (this.activeFilter ? "该分类下暂无任务" : "暂无任务，开始新的一天吧！") + "</div>"
            return
        }

        filtered.forEach(task => {
            const div = document.createElement("div")
            div.className = "todo-item priority-" + task.priority + (task.completed ? " completed" : "")
            div.setAttribute('data-task-id', task.id)

            // 复选框
            const checkboxWrapper = document.createElement("div")
            checkboxWrapper.className = "todo-checkbox-wrapper"
            const checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            checkbox.className = "todo-checkbox"
            checkbox.checked = task.completed
            checkbox.onchange = () => this.toggleTask(task.id, checkbox)
            checkboxWrapper.appendChild(checkbox)

            // 任务文本和标签
            const textDiv = document.createElement("div")
            textDiv.style.cssText = "flex:1;min-width:0;"
            const textSpan = document.createElement("span")
            textSpan.className = "todo-text"
            textSpan.textContent = task.text
            textDiv.appendChild(textSpan)

            if (task.tags && task.tags.length) {
                const tagsSpan = document.createElement("span")
                tagsSpan.className = "todo-meta"
                tagsSpan.textContent = "#" + task.tags.join(" #")
                textDiv.appendChild(tagsSpan)
            }

            // 备注输入框
            const remarkInput = document.createElement("input")
            remarkInput.type = "text"
            remarkInput.className = "todo-remark"
            remarkInput.placeholder = "备注..."
            remarkInput.value = task.remark || ""
            remarkInput.onchange = (e) => this.updateRemark(task.id, e.target.value)

            // 删除按钮
            const deleteBtn = document.createElement("button")
            deleteBtn.className = "todo-delete-btn"
            deleteBtn.textContent = "删除"
            deleteBtn.onclick = () => this.deleteTask(task.id)

            div.appendChild(checkboxWrapper)
            div.appendChild(textDiv)
            div.appendChild(remarkInput)
            div.appendChild(deleteBtn)
            list.appendChild(div)
        })
    }

    async toggleTask(id, checkbox) {
        const task = this.tasks.find(t => t.id === id)
        if (task) {
            task.completed = checkbox.checked
            await this.saveTasks()

            const item = checkbox.closest(".todo-item")
            if (checkbox.checked) {
                item.classList.add("completed")
                this.triggerZhenBang()
            } else {
                item.classList.remove("completed")
            }
            this.updateProgress()
        }
    }

    async updateRemark(id, value) {
        const task = this.tasks.find(t => t.id === id)
        if (task) {
            task.remark = value
            await this.saveTasks()
        }
    }

    initDragAndDrop() {
        const list = document.getElementById("todo-list")
        if (!list) return

        this.sortable = Sortable.create(list, {
            animation: 150,
            ghostClass: 'todo-item-ghost',
            dragClass: 'todo-item-dragging',
            onEnd: async (evt) => {
                await this.handleReorder(evt.oldIndex, evt.newIndex)
            }
        })
    }

    async handleReorder(oldIndex, newIndex) {
        // 如果是过滤模式，提示用户
        if (this.activeFilter) {
            this.renderTasks()  // 重置回原位置
            alert('请在"全部任务"模式下调整顺序')
            return
        }

        // 重新排序数组
        const movedTask = this.tasks.splice(oldIndex, 1)[0]
        this.tasks.splice(newIndex, 0, movedTask)

        // 更新order字段
        this.tasks.forEach((task, index) => {
            task.order = index
        })

        // 保存并重新渲染
        await this.saveTasks()
        this.renderTasks()
    }

    async deleteTask(id) {
        if (!confirm('确定要删除这个任务吗？')) {
            return
        }

        const taskIndex = this.tasks.findIndex(t => t.id === id)
        if (taskIndex === -1) return

        // 添加删除动画
        const taskElement = document.querySelector(`.todo-item[data-task-id="${id}"]`)
        if (taskElement) {
            taskElement.classList.add('deleting')
        }

        // 等待动画完成后删除
        setTimeout(async () => {
            this.tasks.splice(taskIndex, 1)
            await this.saveTasks()
            this.renderTasks()
            this.updateProgress()
        }, 300)
    }

    toggleTag(btn) {
        const isActive = btn.classList.contains("active")

        document.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"))
        const allBtn = document.getElementById("btn-all-tasks")
        if (allBtn) allBtn.classList.remove("active")

        if (isActive) {
            this.showAllTasks()
        } else {
            btn.classList.add("active")
            const text = btn.innerText
            const parts = text.split(" ")
            this.activeFilter = parts.length > 1 ? parts[1] : parts[0]
            this.renderTasks()
        }
    }

    showAllTasks() {
        this.activeFilter = null
        document.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"))
        const allBtn = document.getElementById("btn-all-tasks")
        if (allBtn) allBtn.classList.add("active")
        this.renderTasks()
    }

    updateProgress() {
        const total = this.tasks.length
        const checked = this.tasks.filter(t => t.completed).length
        const percent = total === 0 ? 0 : (checked / total) * 100

        const fill = document.getElementById("progress-fill")
        const text = document.getElementById("progress-text")

        if (fill) fill.style.width = percent + "%"
        if (text) text.textContent = checked + "/" + total
    }

    initAnimations() {
        this.animations = [
            { id: 1, dark: false, dur: 1600 },
            { id: 2, dark: true, dur: 2600 },
            { id: 3, dark: false, dur: 1600 },
            { id: 4, dark: false, dur: 1600 },
            { id: 5, dark: false, dur: 1600 },
            { id: 6, dark: false, dur: 1600 },
            { id: 7, dark: false, dur: 1600 },
            { id: 8, dark: false, dur: 1600 },
            { id: 9, dark: true, dur: 1600 },
            { id: 10, dark: false, dur: 3500 },
            { id: 11, dark: false, dur: 1600 },
            { id: 12, dark: true, dur: 1600 },
            { id: 13, dark: false, dur: 1600 },
            { id: 14, dark: true, dur: 1600 },
            { id: 15, dark: false, dur: 1600 },
            { id: 16, dark: false, dur: 1600 }
        ]
    }

    triggerZhenBang() {
        const overlay = document.getElementById("zhenbang-overlay")
        const box = overlay?.querySelector(".stage-box")
        if (!overlay || !box) return

        const choice = this.animations[Math.floor(Math.random() * this.animations.length)]
        const animClass = "anim-" + choice.id

        overlay.className = ""
        if (choice.dark) overlay.classList.add("dark-mode")

        box.className = "stage-box " + animClass

        void box.offsetWidth

        box.classList.add("animate")

        setTimeout(() => {
            box.classList.remove("animate")
            overlay.className = ""
        }, choice.dur)
    }
}

let doingManager

document.addEventListener("DOMContentLoaded", () => {
    doingManager = new DoingManager()
    doingManager.init()
    document.getElementById("btn-all-tasks").click();
})

function addTask() { doingManager?.addTask() }
function toggleTask(id, checkbox) { doingManager?.toggleTask(id, checkbox) }
function toggleTag(btn) { doingManager?.toggleTag(btn) }
function showAllTasks() { doingManager?.showAllTasks() }
function updateRemark(id, value) { doingManager?.updateRemark(id, value) }
function deleteTask(id) { doingManager?.deleteTask(id) }
