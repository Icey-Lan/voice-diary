"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // 检查 URL 中的 hash 或 params 来获取 session
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setTimeout(() => router.push("/"), 3000)
        return
      }

      if (data.session) {
        setStatus("success")
        setTimeout(() => router.push("/"), 1000)
      } else {
        // 尝试从 URL hash 获取 token
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")

        if (accessToken) {
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          })

          if (sessionError) {
            console.error("Session error:", sessionError)
            setStatus("error")
            setTimeout(() => router.push("/"), 3000)
          } else if (session) {
            setStatus("success")
            setTimeout(() => router.push("/"), 1000)
          }
        } else {
          setStatus("error")
          setTimeout(() => router.push("/"), 3000)
        }
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-600">正在验证登录...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-4xl">✓</span>
            </div>
            <p className="text-slate-800 font-medium">登录成功！</p>
            <p className="text-slate-500 text-sm">即将跳转...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-4xl">✕</span>
            </div>
            <p className="text-slate-800 font-medium">登录失败</p>
            <p className="text-slate-500 text-sm">链接可能已过期，请重新尝试</p>
          </>
        )}
      </div>
    </div>
  )
}
