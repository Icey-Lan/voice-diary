import { createBrowserClient, createServerClient } from '@supabase/ssr'

/**
 * 获取 Supabase 环境变量（客户端安全）
 */
function getSupabaseEnv() {
  // 在浏览器环境中，从 window 获取环境变量
  if (typeof window !== 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  }

  // 服务器端环境
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

/**
 * 浏览器端 Supabase 客户端
 * 用于客户端组件（use client）
 */
export function createClient() {
  const { url, key } = getSupabaseEnv()

  if (!url || !key) {
    console.warn('Supabase credentials not found')
    return null
  }

  return createBrowserClient(url, key)
}

/**
 * 服务器端 Supabase 客户端
 * 用于服务器组件和 API Routes
 */
export function createServerSupabaseClient(cookieStore: {
  getAll: () => { name: string; value: string }[]
  set: (name: string, value: string, options?: any) => void
}) {
  const { url, key } = getSupabaseEnv()

  if (!url || !key) {
    throw new Error('Supabase URL and API key are required')
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
        }
      },
    },
  })
}
