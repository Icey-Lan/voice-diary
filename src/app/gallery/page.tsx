"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Icon, iconMap } from "@/components/icons/Icon"
import { Diary, MOOD_TAGS, WEATHER_OPTIONS } from "@/types"
import { useAuthStore } from "@/store/authStore"

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
  const { isAuthenticated } = useAuthStore()
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载日记数据
  useEffect(() => {
    const loadDiaries = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (isAuthenticated) {
          // 从云端加载数据
          const response = await fetch("/api/diaries")
          if (!response.ok) {
            throw new Error("Failed to fetch diaries")
          }
          const data = await response.json()
          setDiaries(data.diaries || [])
        } else {
          // 从 localStorage 加载数据（备用）
          const saved = localStorage.getItem("diaries")
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              setDiaries(parsed)
            } catch (error) {
              console.error("Failed to parse diaries:", error)
              setDiaries([])
            }
          } else {
            setDiaries([])
          }
        }
      } catch (error) {
        console.error("Error loading diaries:", error)
        setError("加载日记失败")
        // 降级到 localStorage
        const saved = localStorage.getItem("diaries")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            setDiaries(parsed)
          } catch (e) {
            setDiaries([])
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadDiaries()
  }, [isAuthenticated])

  // 监听 localStorage 变化（仅用于未登录用户）
  useEffect(() => {
    if (isAuthenticated) return

    const handleStorageChange = () => {
      const saved = localStorage.getItem("diaries")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setDiaries(parsed)
        } catch (error) {
          console.error("Failed to parse diaries:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("diariesUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("diariesUpdated", handleStorageChange)
    }
  }, [isAuthenticated])

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
          {!isAuthenticated && (
            <Link
              href="/auth"
              className="ml-auto text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              登录
            </Link>
          )}
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 加载状态 */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-slate-600">加载中...</p>
            </div>
          )}

          {/* 错误状态 */}
          {error && !isLoading && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                重试
              </button>
            </div>
          )}

          {/* 空状态 */}
          {!isLoading && diaries.length === 0 && (
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
          )}

          {/* 日记列表 */}
          {!isLoading && diaries.length > 0 && (
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
