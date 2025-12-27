import { NextRequest, NextResponse } from 'next/server'
import { callDeepSeekAPI } from '@/lib/ai-service'
import { getChatPrompt } from '@/lib/prompts'
import { ChatRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, focus } = body

    // 获取系统提示词
    const systemPrompt = getChatPrompt(focus)

    // 构建 API 请求
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ]

    let assistantMessage: string

    // 尝试使用 DeepSeek API
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const response = await callDeepSeekAPI('/chat/completions', {
          model: 'deepseek-chat',
          messages: apiMessages,
          temperature: 0.8,
          max_tokens: 500,
          stream: false,
        })
        assistantMessage = response.choices[0].message.content
      } catch (deepSeekError) {
        console.error('DeepSeek API failed, falling back to Gemini:', deepSeekError)
        // 如果 DeepSeek 失败，回退到 Gemini
        assistantMessage = await callGeminiChat(apiMessages)
      }
    } else {
      // 直接使用 Gemini
      assistantMessage = await callGeminiChat(apiMessages)
    }

    return NextResponse.json({
      content: assistantMessage,
      shouldContinue: true,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    // 返回更详细的错误信息用于调试
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

// Gemini 聊天 API 作为备用 (使用 REST API)
async function callGeminiChat(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const systemInstruction = messages.find(m => m.role === 'system')?.content || ''
  const chatMessages = messages.filter(m => m.role !== 'system')

  // 构建 Gemini API 请求内容
  const contents = chatMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction,
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}
