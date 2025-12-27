"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConversationStore } from "@/store/conversationStore"
import { useDiaryStore } from "@/store/diaryStore"
import { ChatMessage } from "@/components/ChatMessage"
import { Diary } from "@/types"

type ViewMode = "conversation" | "diary"

export default function PreviewPage() {
  const router = useRouter()
  const { messages, currentSession } = useConversationStore()
  const { currentDiary, setCurrentDiary, setConversationHistory } = useDiaryStore()
  const [viewMode, setViewMode] = useState<ViewMode>("conversation")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDiary, setGeneratedDiary] = useState<Diary | null>(currentDiary)

  useEffect(() => {
    // 保存对话记录
    setConversationHistory(messages.map(m => ({ role: m.role, content: m.content })))

    // 如果还没有生成日记，自动生成
    if (!generatedDiary && !currentDiary) {
      generateDiary()
    }
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

  const handleSave = () => {
    if (generatedDiary) {
      // 保存到本地存储（后续会同步到 Supabase）
      const savedDiaries = JSON.parse(localStorage.getItem("diaries") || "[]")
      savedDiaries.unshift(generatedDiary)
      localStorage.setItem("diaries", JSON.stringify(savedDiaries))

      // 清空当前会话
      useDiaryStore.getState().clearCurrentSession()
      useConversationStore.getState().clearMessages()

      // 跳转到日记回廊
      router.push("/gallery")
    }
  }

  const handleRegenerate = () => {
    setGeneratedDiary(null)
    setCurrentDiary(null)
    generateDiary()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b border-[#c4a77d]/30 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.back()}
              className="text-[#5c4a32] hover:text-[#8b7355] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-[#2c2416]">
              预览
            </h1>
            <div className="w-6" />
          </div>

          {/* 视图切换 */}
          <div className="flex bg-[#f4f1ea] rounded-full p-1">
            <button
              onClick={() => setViewMode("conversation")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                viewMode === "conversation"
                  ? "bg-white text-[#2c2416] shadow-sm"
                  : "text-[#5c4a32]/70"
              }`}
            >
              对话记录
            </button>
            <button
              onClick={() => setViewMode("diary")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                viewMode === "diary"
                  ? "bg-white text-[#2c2416] shadow-sm"
                  : "text-[#5c4a32]/70"
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
              <p className="text-center text-sm text-[#5c4a32]/60 py-4">
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
                    <div className="absolute inset-0 rounded-full border-4 border-[#c4a77d]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#9caf88] border-t-transparent animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-[#2c2416]">
                      正在生成你的日记...
                    </p>
                    <p className="text-sm text-[#5c4a32]/70">
                      AI 正在认真整理对话内容
                    </p>
                  </div>
                </div>
              ) : generatedDiary ? (
                <div className="paper-texture bg-white rounded-2xl p-8 card-shadow washi-tape fade-in">
                  {/* 日记头部 */}
                  <div className="text-center mb-6 pb-6 border-b border-[#c4a77d]/20">
                    <p className="text-sm text-[#5c4a32]/70 mb-2">
                      {new Date(generatedDiary.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      })}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-lg">{generatedDiary.weather}</span>
                      <span className="text-[#c4a77d]">·</span>
                      <div className="flex gap-1">
                        {generatedDiary.moodTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-[#f4f1ea] text-[#5c4a32]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 日记内容 */}
                  <div className="handwriting text-lg leading-loose text-[#2c2416] whitespace-pre-wrap ink-spread">
                    {generatedDiary.content}
                  </div>

                  {/* 底部装饰 */}
                  <div className="mt-8 pt-6 border-t border-[#c4a77d]/20 text-center">
                    <p className="text-xs text-[#5c4a32]/50">
                      ✨ 于 {new Date().toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} 生成
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-[#5c4a32]/70">点击下方按钮生成日记</p>
                  <button
                    onClick={generateDiary}
                    className="mt-4 btn-retro px-6 py-2"
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
      <footer className="border-t border-[#c4a77d]/30 bg-white/50 backdrop-blur-sm p-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          {!generatedDiary || isGenerating ? (
            <button
              onClick={generateDiary}
              disabled={isGenerating}
              className="flex-1 btn-retro py-3 font-medium disabled:opacity-50"
            >
              {isGenerating ? "生成中..." : "生成日记"}
            </button>
          ) : (
            <>
              <button
                onClick={handleRegenerate}
                className="flex-1 py-3 rounded-xl border-2 border-[#c4a77d]/30 text-[#5c4a32] font-medium hover:bg-[#f4f1ea] transition-colors"
              >
                重新生成
              </button>
              <button
                onClick={handleSave}
                className="flex-1 btn-retro py-3 font-medium"
              >
                保存日记
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
