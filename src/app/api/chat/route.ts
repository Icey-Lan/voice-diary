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

    // 调用 DeepSeek API
    const response = await callDeepSeekAPI('/chat/completions', {
      model: 'deepseek-chat',
      messages: apiMessages,
      temperature: 0.8,
      max_tokens: 500,
      stream: false,
    })

    const assistantMessage = response.choices[0].message.content

    return NextResponse.json({
      content: assistantMessage,
      shouldContinue: true,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
