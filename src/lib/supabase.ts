import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 浏览器端 Supabase 客户端
 * 用于客户端组件（use client）
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * 服务器端 Supabase 客户端
 * 用于服务器组件和 API Routes
 */
export function createServerSupabaseClient(cookieStore: {
  getAll: () => { name: string; value: string }[]
  set: (name: string, value: string, options?: any) => void
}) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
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

// 导出默认客户端（向后兼容）
export const supabase = createClient()
