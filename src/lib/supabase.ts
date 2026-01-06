import { createBrowserClient, createServerClient } from '@supabase/ssr'

/**
 * 获取 Supabase 环境变量
 */
function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return null
  }

  return { url, key }
}

/**
 * 浏览器端 Supabase 客户端
 * 用于客户端组件（use client）
 */
export function createClient() {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error('Supabase URL and API key are required')
  }

  return createBrowserClient(config.url, config.key)
}

/**
 * 服务器端 Supabase 客户端
 * 用于服务器组件和 API Routes
 */
export function createServerSupabaseClient(cookieStore: {
  getAll: () => { name: string; value: string }[]
  set: (name: string, value: string, options?: any) => void
}) {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error('Supabase URL and API key are required')
  }

  return createServerClient(config.url, config.key, {
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
