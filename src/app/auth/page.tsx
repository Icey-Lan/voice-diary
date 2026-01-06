"use client"

import { useState } from "react"
import Link from "next/link"
import { Icon } from "@/components/icons/Icon"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link")
      }

      setMessage({
        type: "success",
        text: "✨ Magic Link 已发送到你的邮箱，请查收！",
      })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "发送失败，请重试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* 顶部导航 */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            <Icon name="chevron-left" size={24} />
          </Link>
          <h1 className="text-lg font-semibold text-slate-800">
            登录 / 注册
          </h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* 标题卡片 */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-4xl">✉️</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                欢迎回来
              </h2>
              <p className="text-sm text-slate-600">
                输入邮箱，我们将发送 Magic Link 让你快速登录
              </p>
            </div>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full btn-primary py-3 font-medium disabled:opacity-50"
            >
              {isLoading ? "发送中..." : "发送 Magic Link"}
            </button>
          </form>

          {/* 提示信息 */}
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-500">
              我们会发送登录链接到你的邮箱
            </p>
            <p className="text-xs text-slate-500">
              点击链接后会自动登录，无需密码
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
