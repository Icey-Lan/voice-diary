"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Icon } from "@/components/icons/Icon"
import { useAuthStore } from "@/store/authStore"
import { createClient } from "@/lib/supabase"

export default function Home() {
  const { user, isAuthenticated, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient()
        if (!supabase) {
          setIsLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? null,
          })
        }
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [setUser])

  // 监听认证状态变化
  useEffect(() => {
    let subscription = null

    try {
      const supabase = createClient()
      if (!supabase) {
        setIsLoading(false)
        return
      }

      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? null,
          })
        } else {
          setUser(null)
        }
      })
      subscription = sub
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      setIsLoading(false)
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [setUser])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* 顶部导航 */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            AI 日记本
          </h1>
          <nav className="flex gap-4">
            <Link
              href="/gallery"
              className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
            >
              日记回廊
            </Link>
            <Link
              href="/settings"
              className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
            >
              设置
            </Link>
            {!isLoading && !isAuthenticated && (
              <Link
                href="/auth"
                className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
              >
                登录
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* 欢迎卡片 */}
          <div className="card-flat p-8 text-center space-y-6">
            {/* 图标 */}
            <div className="flex justify-center">
              <div className="icon-soft-secondary">
                <Icon name="diary" size={40} className="text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">
                {isAuthenticated ? `你好，${user?.email}` : "你好呀"}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {isAuthenticated
                  ? "准备好记录今天的故事了吗？"
                  : "我是你的 AI 日记伙伴，想聊聊今天发生什么了吗？"}
              </p>
            </div>

            {/* 开始按钮 */}
            <Link
              href="/conversation"
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
            >
              <span>开始写日记</span>
              <Icon name="chevron-left" size={20} className="rotate-180" />
            </Link>

            {/* 未登录提示 */}
            {!isLoading && !isAuthenticated && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-3">
                  登录后可云端同步你的日记
                </p>
                <Link
                  href="/auth"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  立即登录 →
                </Link>
              </div>
            )}

            {/* 最近日记预览 */}
            {isAuthenticated && (
              <div className="pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-3">
                  上次记录：3 天前
                </p>
                <div className="text-sm text-slate-600">
                  点击"开始写日记"记录今天的点滴
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
