"use client"

import { useState } from "react"
import Link from "next/link"
import { Icon } from "@/components/icons/Icon"
import { DialogueFocus, DialogueFocusOption } from "@/types"

const FOCUS_OPTIONS: DialogueFocusOption[] = [
  {
    value: "event",
    label: "记录事件",
    icon: "edit",
    description: "聊聊今天发生的特别事情"
  },
  {
    value: "emotion",
    label: "分享感受",
    icon: "chat-bubble",
    description: "表达今天的情绪和心情"
  },
  {
    value: "growth",
    label: "成长感悟",
    icon: "sprout",
    description: "分享今天的收获与思考"
  },
  {
    value: "all",
    label: "全面回顾",
    icon: "calendar",
    description: "聊聊今天的方方面面"
  }
]

export default function ConversationPage() {
  const [selectedFocus, setSelectedFocus] = useState<DialogueFocus>("all")

  const handleStart = () => {
    // 保存选择的焦点到 localStorage
    localStorage.setItem("diaryFocus", selectedFocus)
    // 跳转到对话界面
    window.location.href = "/conversation/chat"
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* 顶部导航 */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Icon name="chevron-left" size={24} />
          </Link>
          <h1 className="text-lg font-semibold text-slate-800">
            开始对话
          </h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* 标题 */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="icon-soft-primary">
                <Icon name="chat-bubble" size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">
              今天想聊聊什么？
            </h2>
            <p className="text-sm text-slate-500">
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
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-[1.02]"
                    : "bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedFocus === option.value
                      ? "bg-white/20"
                      : "bg-slate-100"
                  }`}>
                    <Icon
                      name={option.icon as keyof typeof import("@/components/icons/Icon").iconMap}
                      size={20}
                      className={selectedFocus === option.value ? "text-white" : "text-slate-600"}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">{option.label}</div>
                    <div className={`text-sm ${
                      selectedFocus === option.value
                        ? "text-white/80"
                        : "text-slate-500"
                    }`}>
                      {option.description}
                    </div>
                  </div>
                  {selectedFocus === option.value && (
                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
            className="btn-primary w-full py-4 text-lg font-medium"
          >
            开始对话
          </button>

          {/* 跳过选项 */}
          <p className="text-center text-sm text-slate-400">
            也可以在设置中更改默认偏好
          </p>
        </div>
      </main>
    </div>
  )
}
