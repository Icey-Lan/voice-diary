"use client"

import { useState, useEffect } from "react"
import { useGeminiLive } from "@/hooks/useGeminiLive"
import { useConversationStore } from "@/store/conversationStore"

interface LiveVoiceChatProps {
  focus?: string
  onSessionEnd: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function LiveVoiceChat({ focus = "all", onSessionEnd }: LiveVoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [hasStarted, setHasStarted] = useState(false)

  const {
    isConnected,
    isListening,
    isSpeaking,
    connect,
    disconnect,
    startListening,
    stopListening,
    error,
  } = useGeminiLive({
    focus,
    onAudioReceived: () => {
      // 音频会自动播放
    },
    onTextReceived: (text) => {
      // 添加 AI 回复到消息列表
      setMessages((prev) => [...prev, { role: "assistant", content: text }])
    },
    onUserTranscript: (text) => {
      // 添加用户转录文本到消息列表
      setMessages((prev) => [...prev, { role: "user", content: text }])
    },
    onError: (err) => {
      console.error("Live chat error:", err)
    },
  })

  const { startNewSession, endSession } = useConversationStore()

  // 初始化会话
  useEffect(() => {
    startNewSession()
    return () => {
      endSession()
      if (isConnected) {
        disconnect()
      }
    }
  }, [startNewSession, endSession, isConnected, disconnect])

  // 连接到 Live API
  const handleStart = async () => {
    try {
      await connect()
      setHasStarted(true)
      // 自动开始录音
      await startListening()
    } catch (err) {
      console.error("Failed to start:", err)
    }
  }

  // 切换录音状态
  const handleToggleListening = async () => {
    if (isListening) {
      stopListening()
    } else {
      await startListening()
    }
  }

  // 结束对话
  const handleEnd = async () => {
    stopListening()
    await disconnect()
    onSessionEnd()
  }

  if (error) {
    const isPermissionError = error.includes('Permission') || error.includes('NotAllowed')
    const isDeviceNotFoundError = error.includes('NotFound') || error.includes('device')

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#2c2416] mb-2">
              {isPermissionError ? '需要麦克风权限' : isDeviceNotFoundError ? '未检测到麦克风' : '连接失败'}
            </h3>
            <p className="text-sm text-[#5c4a32] mb-4">
              {isPermissionError
                ? '请在浏览器设置中允许访问麦克风，然后重试。'
                : isDeviceNotFoundError
                ? '请确保您的设备已连接麦克风，然后重试。'
                : error}
            </p>
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-[#9caf88] text-white rounded-full hover:bg-[#7a8f6d] transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-[#9caf88]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#9caf88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#2c2416] mb-3">开始语音对话</h2>
          <p className="text-sm text-[#5c4a32] mb-6 leading-relaxed">
            点击下方按钮开始与 AI 进行实时语音对话。您可以随时说话，AI 会实时回复。
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-[#9caf88] text-white rounded-full hover:bg-[#7a8f6d] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
          >
            开始对话
          </button>
          <p className="text-xs text-[#5c4a32]/50 mt-4">
            请允许麦克风权限以使用此功能
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f5f1e8] to-white">
      {/* 顶部导航 */}
      <header className="border-b border-[#c4a77d]/30 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleEnd}
            className="text-[#5c4a32] hover:text-[#8b7355] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-[#2c2416]">语音对话中</h1>
            <p className="text-xs text-[#5c4a32]/60">
              {isSpeaking ? "AI 正在说话..." : isListening ? "正在听您说话..." : "准备就绪"}
            </p>
          </div>
          <button
            onClick={handleEnd}
            className="text-sm text-[#9caf88] hover:text-[#7a8f6d] font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </header>

      {/* 消息列表 */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#9caf88] text-white rounded-br-sm'
                    : 'bg-white text-[#2c2416] rounded-bl-sm shadow-sm border border-[#c4a77d]/30'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 状态指示器 */}
      <div className={`flex flex-col items-center justify-center p-8 ${messages.length > 0 ? 'flex-none' : 'flex-1'}`}>
        {/* 波形动画 */}
        <div className="relative w-40 h-40 mb-8">
          {/* 外圈 */}
          <div
            className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${
              isListening
                ? "border-[#9caf88] animate-pulse"
                : isSpeaking
                ? "border-[#c4a77d] animate-pulse"
                : "border-[#c4a77d]/30"
            }`}
          />

          {/* 内圈 */}
          <div
            className={`absolute inset-4 rounded-full bg-[#9caf88]/20 flex items-center justify-center transition-all duration-300 ${
              isListening || isSpeaking ? "scale-100" : "scale-90"
            }`}
          >
            {isListening ? (
              <div className="flex items-center gap-1">
                <div className="w-1 h-8 bg-[#9caf88] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1 h-12 bg-[#9caf88] rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
                <div className="w-1 h-6 bg-[#9caf88] rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                <div className="w-1 h-10 bg-[#9caf88] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <div className="w-1 h-8 bg-[#9caf88] rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
              </div>
            ) : isSpeaking ? (
              <svg className="w-16 h-16 text-[#c4a77d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-[#5c4a32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
        </div>

        {/* 提示文字 */}
        <div className="text-center mb-8">
          {isListening ? (
            <p className="text-[#2c2416] font-medium">正在聆听...</p>
          ) : isSpeaking ? (
            <p className="text-[#2c2416] font-medium">AI 回复中...</p>
          ) : (
            <p className="text-[#5c4a32]">点击下方按钮开始说话</p>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleToggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#9caf88] hover:bg-[#7a8f6d]"
            }`}
          >
            {isListening ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

        {/* 提示信息 */}
        <p className="text-sm text-[#5c4a32]/60 mt-8 text-center">
          {isListening
            ? "再次点击暂停录音"
            : "点击开始说话，AI 会实时回复"}
        </p>
      </div>

      {/* 连接状态 */}
      <div className="fixed bottom-4 right-4">
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
            isConnected
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          {isConnected ? "已连接" : "未连接"}
        </div>
      </div>
    </div>
  )
}
