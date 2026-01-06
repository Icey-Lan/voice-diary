"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Icon, iconMap } from "@/components/icons/Icon"
import { Diary, MOOD_TAGS, WEATHER_OPTIONS } from "@/types"

// 获取天气图标信息
function getWeatherInfo(weather: string) {
  return WEATHER_OPTIONS.find(w => w.value === weather) || WEATHER_OPTIONS[0]
}

// 获取心情标签信息
function getMoodInfo(mood: string) {
  return MOOD_TAGS.find(m => m.value === mood)
}

// 截断文本
function truncateText(text: string, maxLength: number = 50) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export default function GalleryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // 从 localStorage 加载日记数据
  useEffect(() => {
    const loadDiaries = () => {
      const saved = localStorage.getItem("diaries")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setDiaries(parsed)
        } catch (error) {
          console.error("Failed to parse diaries:", error)
          setDiaries([])
        }
      }
    }

    loadDiaries()

    // 监听 localStorage 变化（当新日记保存时更新列表）
    const handleStorageChange = () => {
      loadDiaries()
    }

    window.addEventListener("storage", handleStorageChange)

    // 自定义事件监听（同页面内的更新）
    window.addEventListener("diariesUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("diariesUpdated", handleStorageChange)
    }
  }, [])

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
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
            日记回廊
          </h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 空状态或日记列表 */}
          {diaries.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="flex justify-center">
                <div className="icon-soft-secondary">
                  <Icon name="diary" size={40} className="text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                还没有日记
              </h2>
              <p className="text-slate-600">
                开始记录第一篇日记吧
              </p>
              <Link
                href="/conversation"
                className="inline-block btn-primary px-6 py-2"
              >
                开始写日记
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {diaries.map((diary, index) => {
                const weatherInfo = getWeatherInfo(diary.weather)
                const isExpanded = expandedCards.has(diary.id)
                return (
                  <div
                    key={diary.id}
                    className="card-flat p-6 fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* 卡片头部 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{diary.date}</span>
                        <span className="text-slate-300">·</span>
                        <div className="flex items-center gap-1">
                          <Icon
                            name={weatherInfo.icon as keyof typeof iconMap}
                            size={14}
                            style={{ color: weatherInfo.color }}
                          />
                          <span>{diary.weather}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {diary.moodTags.map((tag) => {
                          const moodInfo = getMoodInfo(tag)
                          return moodInfo ? (
                            <div
                              key={tag}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600"
                            >
                              <Icon name={moodInfo.icon as keyof typeof iconMap} size={10} style={{ color: moodInfo.color }} />
                              <span>{tag}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>

                    {/* 日记内容 */}
                    <div className="text-slate-800 leading-relaxed">
                      {isExpanded ? diary.content : truncateText(diary.content)}
                    </div>

                    {/* 卡片装饰 */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                      <span>珍藏于此</span>
                      <button
                        onClick={() => toggleCard(diary.id)}
                        className="hover:text-indigo-600 transition-colors font-medium flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>收起</span>
                            <Icon name="chevron-left" size={14} className="rotate-90" />
                          </>
                        ) : (
                          <>
                            <span>查看详情</span>
                            <Icon name="chevron-left" size={14} className="-rotate-90" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
