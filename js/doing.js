class DoingManager {
    constructor() {
        this.tasks = []
        this.activeFilter = null
        this.storageKey = "diary-doing-tasks"
        this.loadTasks()
        this.initAnimations()
    }

    loadTasks() {
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

    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks))
        } catch (e) {
            console.error("保存任务失败:", e)
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

    addTask() {
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
        this.saveTasks()
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
            const tagsHtml = task.tags && task.tags.length ? "<span class=todo-meta>#" + task.tags.join(" #") + "</span>" : ""
            div.innerHTML = "<div class=todo-checkbox-wrapper><input type=checkbox class=todo-checkbox onchange=doingManager.toggleTask(" + task.id + ",this)" + (task.completed ? " checked" : "") + "></div><div style=flex:1><span class=todo-text>" + task.text + "</span>" + tagsHtml + "</div><input type=text class=todo-remark placeholder=备注... value=\"" + (task.remark || "") + "\" onchange=doingManager.updateRemark(" + task.id + ",this.value)>"
            list.appendChild(div)
        })
    }

    toggleTask(id, checkbox) {
        const task = this.tasks.find(t => t.id === id)
        if (task) {
            task.completed = checkbox.checked
            this.saveTasks()

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

    updateRemark(id, value) {
        const task = this.tasks.find(t => t.id === id)
        if (task) {
            task.remark = value
            this.saveTasks()
        }
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
})

function addTask() { doingManager?.addTask() }
function toggleTask(id, checkbox) { doingManager?.toggleTask(id, checkbox) }
function toggleTag(btn) { doingManager?.toggleTag(btn) }
function showAllTasks() { doingManager?.showAllTasks() }
function updateRemark(id, value) { doingManager?.updateRemark(id, value) }
