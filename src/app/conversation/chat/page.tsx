"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { ChatMessage } from "@/components/ChatMessage"
import { useConversationStore } from "@/store/conversationStore"
import { usePreferencesStore } from "@/store/preferencesStore"
import { getGreetingMessage } from "@/lib/prompts"

export default function ChatPage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const {
    messages,
    isRecording,
    isGenerating,
    addMessage,
    setRecording,
    setGenerating,
    startNewSession,
    endSession,
  } = useConversationStore()
  const { dialogueFocus, voiceEnabled } = usePreferencesStore()
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // 初始化会话
  useEffect(() => {
    startNewSession()

    // 从 localStorage 获取焦点
    const savedFocus = localStorage.getItem("diaryFocus")
    const greeting = getGreetingMessage((savedFocus || "all") as any)
    addMessage({ role: "assistant", content: greeting })
    setIsLoading(false)

    return () => {
      endSession()
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 处理语音转录
  const handleTranscript = async (text: string) => {
    if (!text.trim()) return

    setInputText(text)
  }

  // 发送消息
  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || isGenerating) return

    // 添加用户消息
    addMessage({ role: "user", content: text })
    setInputText("")
    setGenerating(true)

    try {
      // 调用 AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }],
          focus: dialogueFocus,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      // 添加 AI 回复
      addMessage({ role: "assistant", content: data.content })

      // 如果启用了语音，播放 TTS
      if (voiceEnabled) {
        playTTS(data.content)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      addMessage({
        role: "assistant",
        content: "抱歉，我遇到了一些问题。请稍后再试。",
      })
    } finally {
      setGenerating(false)
    }
  }

  // 播放 TTS
  const playTTS = async (text: string) => {
    if (!voiceEnabled || !text) return

    try {
      const response = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) return

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (error) {
      console.error("Error playing TTS:", error)
    }
  }

  // 完成对话，生成日记
  const handleFinish = () => {
    router.push("/conversation/preview")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#9caf88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5c4a32]">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b border-[#c4a77d]/30 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-[#5c4a32] hover:text-[#8b7355] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-[#2c2416]">对话中</h1>
            <p className="text-xs text-[#5c4a32]/60">和 AI 聊聊今天</p>
          </div>
          <button
            onClick={handleFinish}
            className="text-sm text-[#9caf88] hover:text-[#7a8f6d] font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </header>

      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage key={`${message.id}-${index}`} message={message} />
        ))}

        {isGenerating && (
          <div className="flex justify-start fade-in">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
              <div className="flex items-center gap-2">
                <span>🌻</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#9caf88] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#9caf88] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#9caf88] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-[#c4a77d]/30 bg-white/50 backdrop-blur-sm p-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3">
            {/* 文本输入 */}
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="说点什么..."
                rows={1}
                className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-[#c4a77d]/30 focus:border-[#9caf88] focus:outline-none resize-none text-[#2c2416] placeholder:text-[#5c4a32]/50"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>

            {/* 录音按钮 */}
            <VoiceRecorder
              onTranscript={handleTranscript}
              isRecording={isRecording}
              onRecordingChange={setRecording}
            />

            {/* 发送按钮 */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isGenerating}
              className="w-12 h-12 rounded-full bg-[#9caf88] text-white flex items-center justify-center hover:bg-[#7a8f6d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-center text-[#5c4a32]/50 mt-3">
            按住麦克风说话，或输入文字后点击发送
          </p>
        </div>
      </div>
    </div>
  )
}
