"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Icon, iconMap } from "@/components/icons/Icon"
import { ChatMessage } from "@/components/ChatMessage"
import { useConversationStore } from "@/store/conversationStore"
import { useDiaryStore } from "@/store/diaryStore"
import { useAuthStore } from "@/store/authStore"
import { Diary, MOOD_TAGS, WEATHER_OPTIONS } from "@/types"

type ViewMode = "conversation" | "diary"

export default function PreviewPage() {
  const router = useRouter()
  const { messages, currentSession } = useConversationStore()
  const { currentDiary, setCurrentDiary, setConversationHistory } = useDiaryStore()
  const { isAuthenticated } = useAuthStore()
  const [viewMode, setViewMode] = useState<ViewMode>("conversation")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedDiary, setGeneratedDiary] = useState<Diary | null>(currentDiary)

  useEffect(() => {
    // 保存对话记录
    setConversationHistory(messages.map(m => ({ role: m.role, content: m.content })))

    // 如果还没有生成日记，自动生成
    if (!generatedDiary && !currentDiary) {
      generateDiary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateDiary = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/diary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: messages,
          focus: currentSession?.focus || "all",
        }),
      })

      if (!response.ok) throw new Error("Failed to generate diary")

      const data = await response.json()

      const diary: Diary = {
        id: crypto.randomUUID(),
        user_id: "local-user",
        date: new Date().toISOString().split("T")[0],
        weather: data.weather,
        moodTags: data.moodTags,
        content: data.content,
        created_at: new Date().toISOString(),
      }

      setGeneratedDiary(diary)
      setCurrentDiary(diary)

      // 延迟切换到日记视图
      setTimeout(() => setViewMode("diary"), 500)
    } catch (error) {
      console.error("Error generating diary:", error)
      alert("生成日记失败，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedDiary) return

    setIsSaving(true)

    try {
      if (isAuthenticated) {
        // 保存到云端
        const response = await fetch("/api/diaries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: generatedDiary.date,
            weather: generatedDiary.weather,
            moodTags: generatedDiary.moodTags,
            content: generatedDiary.content,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save diary")
        }
      } else {
        // 保存到本地存储
        const savedDiaries = JSON.parse(localStorage.getItem("diaries") || "[]")
        savedDiaries.unshift(generatedDiary)
        localStorage.setItem("diaries", JSON.stringify(savedDiaries))

        // 触发自定义事件，通知其他页面更新
        window.dispatchEvent(new Event("diariesUpdated"))
      }

      // 清空当前会话
      useDiaryStore.getState().clearCurrentSession()
      useConversationStore.getState().clearMessages()

      // 跳转到日记回廊
      router.push("/gallery")
    } catch (error) {
      console.error("Error saving diary:", error)
      alert("保存失败，请重试")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerate = () => {
    setGeneratedDiary(null)
    setCurrentDiary(null)
    generateDiary()
  }

  // 获取天气图标信息
  const getWeatherInfo = (weather: string) => {
    return WEATHER_OPTIONS.find(w => w.value === weather) || WEATHER_OPTIONS[0]
  }

  // 获取心情标签信息
  const getMoodInfo = (mood: string) => {
    return MOOD_TAGS.find(m => m.value === mood)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* 顶部导航 */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.back()}
              className="text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Icon name="chevron-left" size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">
              预览
            </h1>
            <div className="w-6" />
          </div>

          {/* 视图切换 */}
          <div className="flex bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setViewMode("conversation")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                viewMode === "conversation"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              对话记录
            </button>
            <button
              onClick={() => setViewMode("diary")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                viewMode === "diary"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500"
              }`}
              disabled={!generatedDiary && !isGenerating}
            >
              {isGenerating ? "生成中..." : "生成的日记"}
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {viewMode === "conversation" ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-slate-400 py-4">
                回顾我们刚才的对话
              </p>
              {messages.map((message, index) => (
                <ChatMessage key={`${message.id}-${index}`} message={message} />
              ))}
            </div>
          ) : (
            <div className="py-4">
              {isGenerating ? (
                <div className="text-center py-16 space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-slate-800">
                      正在生成你的日记...
                    </p>
                    <p className="text-sm text-slate-500">
                      AI 正在认真整理对话内容
                    </p>
                  </div>
                </div>
              ) : generatedDiary ? (
                <div className="card-flat p-8 fade-in">
                  {/* 日记头部 */}
                  <div className="text-center mb-6 pb-6 border-b border-slate-200">
                    <p className="text-sm text-slate-500 mb-3">
                      {new Date(generatedDiary.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      })}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          name={getWeatherInfo(generatedDiary.weather).icon as keyof typeof iconMap}
                          size={18}
                          style={{ color: getWeatherInfo(generatedDiary.weather).color }}
                        />
                        <span className="text-sm text-slate-600">{generatedDiary.weather}</span>
                      </div>
                      <span className="text-slate-300">·</span>
                      <div className="flex gap-1 flex-wrap justify-center">
                        {generatedDiary.moodTags.map((tag) => {
                          const moodInfo = getMoodInfo(tag)
                          return moodInfo ? (
                            <div
                              key={tag}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600"
                            >
                              <Icon name={moodInfo.icon as keyof typeof iconMap} size={12} style={{ color: moodInfo.color }} />
                              <span>{tag}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 日记内容 */}
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg leading-loose text-slate-800 whitespace-pre-wrap">
                      {generatedDiary.content}
                    </p>
                  </div>

                  {/* 底部装饰 */}
                  <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-400">
                      于 {new Date().toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} 生成
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-slate-500">点击下方按钮生成日记</p>
                  <button
                    onClick={generateDiary}
                    className="mt-4 btn-primary px-6 py-2"
                  >
                    生成日记
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 底部操作栏 */}
      <footer className="border-t border-slate-200/60 bg-white/70 backdrop-blur-sm p-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          {!generatedDiary || isGenerating ? (
            <button
              onClick={generateDiary}
              disabled={isGenerating}
              className="btn-primary flex-1 py-3 font-medium disabled:opacity-50"
            >
              {isGenerating ? "生成中..." : "生成日记"}
            </button>
          ) : (
            <>
              <button
                onClick={handleRegenerate}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                重新生成
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex-1 py-3 font-medium disabled:opacity-50"
              >
                {isSaving ? "保存中..." : "保存日记"}
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
