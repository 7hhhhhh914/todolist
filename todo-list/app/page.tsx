"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, X, Check, Pencil, Moon, Sun } from "lucide-react"

type FilterType = "all" | "active" | "completed"

interface Task {
  text: string
  done: boolean
  id: string
}

interface TodoData {
  [key: string]: Task[]
}

const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"]

function getDayName(year: number, month: number, day: number): string {
  return WEEK_DAYS[new Date(year, month, day).getDay()]
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export default function TodoApp() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [data, setData] = useState<TodoData>({})
  const [inputValue, setInputValue] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const daysContainerRef = useRef<HTMLDivElement>(null)
  const activeDayRef = useRef<HTMLButtonElement>(null)
  const today = new Date()

  // 从 localStorage 加载数据
  useEffect(() => {
    const saved = localStorage.getItem("todo-data")
    if (saved) {
      setData(JSON.parse(saved))
    }
    setSelectedDate(new Date())
  }, [])

  // 保存数据到 localStorage
  useEffect(() => {
    localStorage.setItem("todo-data", JSON.stringify(data))
  }, [data])

  // 滚动到选中的日期
  useEffect(() => {
    if (activeDayRef.current) {
      activeDayRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
    }
  }, [selectedDate])

if (!selectedDate){
  return <div className="min-h-screen bg-secondary" />}
  
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const day = selectedDate.getDate()
  const daysInMonth = getDaysInMonth(year, month)
  const dateKey = getDateKey(selectedDate)
  const allTasks = data[dateKey] || []
  const filteredTasks = allTasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "active") return !task.done
    return task.done
  })
  const completedCount = allTasks.filter((t) => t.done).length
  const isSelectedToday =
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  const isTodayDate = (dayNum: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === dayNum

  // 获取某天未完成的任务数量
  function getActiveTaskCount(dayNum: number): number {
    const key = `${year}-${month + 1}-${dayNum}`
    const tasks = data[key] || []
    return tasks.filter((t) => !t.done).length
  }

  // 回到今天
  function goToToday() {
    setSelectedDate(new Date())
  }

  function prevMonth() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  function nextMonth() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  function selectDay(dayNum: number) {
    setSelectedDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(dayNum)
      return newDate
    })
  }

  function addTask() {
    if (!inputValue.trim()) return
    setData((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { text: inputValue, done: false, id: Date.now().toString() }],
    }))
    setInputValue("")
  }

  function toggleTask(taskIndex: number) {
    // taskIndex 是在 allTasks 中的真实索引
    setData((prev) => {
      const tasks = [...(prev[dateKey] || [])]
      tasks[taskIndex] = { ...tasks[taskIndex], done: !tasks[taskIndex].done }
      return { ...prev, [dateKey]: tasks }
    })
  }

  function removeTask(taskIndex: number) {
    // taskIndex 是在 allTasks 中的真实索引
    setData((prev) => {
      const tasks = [...(prev[dateKey] || [])]
      tasks.splice(taskIndex, 1)
      return { ...prev, [dateKey]: tasks }
    })
  }

  // 获取任务在 allTasks 中的真实索引
  function getRealIndex(task: Task): number {
    return allTasks.indexOf(task)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      addTask()
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto flex min-h-screen max-w-[500px] flex-col bg-card px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        {/* 标题栏 */}
        <header className="flex flex-col gap-2 px-0 pb-2.5 pt-5">
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-lg"
              aria-label="上个月"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="m-0 text-2xl font-bold">
              {year}年 {month + 1}月
            </h1>
            <button
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-lg"
              aria-label="下个月"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          {!isSelectedToday && (
            <button
              onClick={goToToday}
              className="self-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              回到今天
            </button>
          )}
        </header>

        {/* 日期选择器 */}
        <div
          ref={daysContainerRef}
          className="flex gap-3 overflow-x-auto py-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
            const isActive = dayNum === day
            const isThisToday = isTodayDate(dayNum)
            const activeCount = getActiveTaskCount(dayNum)
            return (
              <button
                key={dayNum}
                ref={isActive ? activeDayRef : null}
                onClick={() => selectDay(dayNum)}
                className={`relative flex h-[60px] min-w-[45px] shrink-0 flex-col items-center justify-center rounded-[14px] transition-all duration-200 ${
                  isActive
                    ? "scale-105 bg-primary text-primary-foreground shadow-lg"
                    : isThisToday
                      ? "bg-primary/10 ring-2 ring-primary/50"
                      : "bg-secondary"
                }`}
              >
                <span className="text-xs">{getDayName(year, month, dayNum)}</span>
                <span className="text-lg font-bold">{dayNum}</span>
                {activeCount > 0 && !isActive && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm">
                    {activeCount > 9 ? "9+" : activeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* 筛选器和统计 */}
        <div className="flex items-center justify-between py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === "active"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              未完成
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === "completed"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              已完成
            </button>
          </div>
          {allTasks.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {completedCount}/{allTasks.length} 已完成
            </span>
          )}
        </div>

        {/* 输入框 */}
        <div className="sticky top-0 z-10 flex gap-2.5 bg-card py-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="想做点什么？"
            autoComplete="off"
            className="flex-1 rounded-xl border border-border bg-secondary px-3.5 py-3.5 text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={addTask}
            className="rounded-xl bg-primary px-5 font-bold text-primary-foreground"
          >
            添加
          </button>
        </div>

        {/* 任务列表 */}
        <ul className="m-0 list-none p-0">
          {filteredTasks.map((task) => {
            const realIndex = getRealIndex(task)
            return (
              <li
                key={realIndex}
                className="mb-2.5 flex animate-fade-in items-center rounded-xl border border-border bg-card p-4"
              >
                <div
                  onClick={() => toggleTask(realIndex)}
                  className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5"
                >
                  <div
                    className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      task.done
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {task.done && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </div>
                  <span
                    className={`flex-1 break-words text-base ${
                      task.done ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => removeTask(realIndex)}
                  className="p-1.5 text-destructive"
                  aria-label="删除任务"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>

        {/* 空状态 */}
        {filteredTasks.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-muted-foreground">
            {allTasks.length === 0 ? (
              <>
                <p className="text-lg">今天还没有待办事项</p>
                <p className="text-sm">添加一个任务开始吧！</p>
              </>
            ) : filter === "active" ? (
              <>
                <p className="text-lg">太棒了！</p>
                <p className="text-sm">所有任务都已完成</p>
              </>
            ) : (
              <>
                <p className="text-lg">还没有已完成的任务</p>
                <p className="text-sm">完成一个任务试试吧</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
