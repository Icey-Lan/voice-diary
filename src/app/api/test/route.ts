import { NextRequest, NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai-service'

export async function GET(request: NextRequest) {
  const status = {
    timestamp: new Date().toISOString(),
    env: {
      DEEPSEEK_API_KEY: !!process.env.DEEPSEEK_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      ZHIPU_API_KEY: !!process.env.ZHIPU_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    config: {
      deepseek: {
        hasKey: !!AI_CONFIG.deepseek.apiKey,
        keyPrefix: AI_CONFIG.deepseek.apiKey ? AI_CONFIG.deepseek.apiKey.substring(0, 10) + '...' : 'N/A',
      },
      gemini: {
        hasKey: !!AI_CONFIG.gemini.apiKey,
        keyPrefix: AI_CONFIG.gemini.apiKey ? AI_CONFIG.gemini.apiKey.substring(0, 10) + '...' : 'N/A',
      },
      zhipu: {
        hasKey: !!AI_CONFIG.zhipu.apiKey,
        keyPrefix: AI_CONFIG.zhipu.apiKey ? AI_CONFIG.zhipu.apiKey.substring(0, 10) + '...' : 'N/A',
      },
    },
  }

  // 测试 Gemini API 连接
  let geminiTest = { status: 'not_tested', error: null as string | null }
  if (process.env.GEMINI_API_KEY) {
    try {
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Hello' }]
            }],
            generationConfig: {
              maxOutputTokens: 10,
            },
          }),
        }
      )
      geminiTest = {
        status: testResponse.ok ? 'ok' : 'error',
        error: testResponse.ok ? null : `HTTP ${testResponse.status}`,
      }
    } catch (e: any) {
      geminiTest = { status: 'error', error: e.message }
    }
  }

  // 测试 DeepSeek API 连接
  let deepseekTest = { status: 'not_tested', error: null as string | null }
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const testResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10,
        }),
      })
      deepseekTest = {
        status: testResponse.ok ? 'ok' : 'error',
        error: testResponse.ok ? null : `HTTP ${testResponse.status}`,
      }
    } catch (e: any) {
      deepseekTest = { status: 'error', error: e.message }
    }
  }

  return NextResponse.json({
    ...status,
    apiTests: {
      gemini: geminiTest,
      deepseek: deepseekTest,
    },
  })
}
