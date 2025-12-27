"use client"

import { useState } from "react"
import Link from "next/link"
import { DialogueFocus, DialogueFocusOption } from "@/types"

const FOCUS_OPTIONS: DialogueFocusOption[] = [
  {
    value: "event",
    label: "记录事件",
    icon: "📝",
    description: "聊聊今天发生的特别事情"
  },
  {
    value: "emotion",
    label: "分享感受",
    icon: "💭",
    description: "表达今天的情绪和心情"
  },
  {
    value: "growth",
    label: "成长感悟",
    icon: "🌱",
    description: "分享今天的收获与思考"
  },
  {
    value: "all",
    label: "全面回顾",
    icon: "📅",
    description: "聊聊今天的方方面面"
  }
]

export default function ConversationPage() {
  const [selectedFocus, setSelectedFocus] = useState<DialogueFocus>("all")
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = () => {
    // 保存选择的焦点到 localStorage
    localStorage.setItem("diaryFocus", selectedFocus)
    // 跳转到对话界面
    window.location.href = "/conversation/chat"
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b border-[#c4a77d]/30 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-[#5c4a32] hover:text-[#8b7355] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-[#2c2416]">
            开始对话
          </h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* 标题 */}
          <div className="text-center space-y-2">
            <div className="text-4xl">💭</div>
            <h2 className="text-xl font-semibold text-[#2c2416]">
              今天想聊聊什么？
            </h2>
            <p className="text-sm text-[#5c4a32]/70">
              选择一个焦点，我会更好地引导你
            </p>
          </div>

          {/* 选项卡片 */}
          <div className="space-y-3">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFocus(option.value)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedFocus === option.value
                    ? "bg-[#9caf88] text-white shadow-lg scale-[1.02]"
                    : "bg-white hover:bg-[#f4f1ea] border-2 border-transparent hover:border-[#c4a77d]/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium mb-1">{option.label}</div>
                    <div className={`text-sm ${
                      selectedFocus === option.value
                        ? "text-white/80"
                        : "text-[#5c4a32]/70"
                    }`}>
                      {option.description}
                    </div>
                  </div>
                  {selectedFocus === option.value && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* 开始按钮 */}
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full btn-retro py-4 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "加载中..." : "开始对话"}
          </button>

          {/* 跳过选项 */}
          <p className="text-center text-sm text-[#5c4a32]/60">
            也可以在设置中更改默认偏好
          </p>
        </div>
      </main>
    </div>
  )
}
