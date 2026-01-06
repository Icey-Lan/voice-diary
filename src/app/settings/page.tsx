"use client"

import Link from "next/link"
import { usePreferencesStore } from "@/store/preferencesStore"
import { useDiaryStore } from "@/store/diaryStore"
import { DialogueFocus, Diary } from "@/types"

const FOCUS_OPTIONS = [
  { value: "event", label: "记录事件" },
  { value: "emotion", label: "分享感受" },
  { value: "growth", label: "成长感悟" },
  { value: "all", label: "全面回顾" },
] as const

// 计算总字数（统计中文字符）
function calculateTotalWords(diaries: Diary[]): number {
  return diaries.reduce((sum, diary) => {
    // 统计中文字符数，去除空格、标点符号和表情符号
    const wordCount = diary.content.replace(/[\s\p{P}\p{S}]/gu, '').length
    return sum + wordCount
  }, 0)
}

export default function SettingsPage() {
  const { dialogueFocus, voiceEnabled, ttsSpeed, setPreferences } = usePreferencesStore()
  const { diaries } = useDiaryStore()
  const totalWords = calculateTotalWords(diaries)

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
            设置
          </h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 对话偏好 */}
          <section className="bg-white rounded-2xl p-6 card-shadow">
            <h2 className="text-lg font-semibold text-[#2c2416] mb-4">
              对话偏好
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5c4a32] mb-2">
                  默认对话焦点
                </label>
                <select
                  value={dialogueFocus}
                  onChange={(e) => setPreferences({ dialogueFocus: e.target.value as DialogueFocus })}
                  className="w-full px-4 py-2 rounded-lg border border-[#c4a77d]/30 bg-[#f4f1ea] text-[#2c2416] focus:outline-none focus:ring-2 focus:ring-[#9caf88]/50"
                >
                  {FOCUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 语音设置 */}
          <section className="bg-white rounded-2xl p-6 card-shadow">
            <h2 className="text-lg font-semibold text-[#2c2416] mb-4">
              语音设置
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#2c2416]">AI 语音朗读</div>
                  <div className="text-sm text-[#5c4a32]/70">
                    AI 回复时是否朗读声音
                  </div>
                </div>
                <button
                  onClick={() => setPreferences({ voiceEnabled: !voiceEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    voiceEnabled ? "bg-[#9caf88]" : "bg-[#c4a77d]/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      voiceEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {voiceEnabled && (
                <div>
                  <label className="block text-sm font-medium text-[#5c4a32] mb-2">
                    朗读速度: {ttsSpeed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={ttsSpeed}
                    onChange={(e) => setPreferences({ ttsSpeed: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </section>

          {/* 记录统计 */}
          <section className="bg-white rounded-2xl p-6 card-shadow">
            <h2 className="text-lg font-semibold text-[#2c2416] mb-4">
              记录统计
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#f4f1ea] rounded-xl">
                <div className="text-3xl font-bold text-[#9caf88]">
                  {diaries.length}
                </div>
                <div className="text-sm text-[#5c4a32]/70 mt-1">
                  已记录天数
                </div>
              </div>
              <div className="text-center p-4 bg-[#f4f1ea] rounded-xl">
                <div className="text-3xl font-bold text-[#9caf88]">
                  {totalWords}
                </div>
                <div className="text-sm text-[#5c4a32]/70 mt-1">
                  总字数
                </div>
              </div>
            </div>
          </section>

          {/* 关于 */}
          <section className="text-center py-8 text-sm text-[#5c4a32]/60">
            <p>AI 语音日记本 v1.0</p>
            <p className="mt-1">温暖的 AI 日记伙伴 🌻</p>
          </section>
        </div>
      </main>
    </div>
  )
}
