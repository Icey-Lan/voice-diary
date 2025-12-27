import { NextRequest, NextResponse } from 'next/server'
import { callDeepSeekAPI } from '@/lib/ai-service'
import { DIARY_GENERATION_PROMPT } from '@/lib/prompts'
import { GenerateDiaryRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDiaryRequest = await request.json()
    const { conversation } = body

    // 构建对话文本
    const conversationText = conversation
      .map((msg) => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
      .join('\n')

    // 构建生成请求
    const prompt = `${DIARY_GENERATION_PROMPT}\n\n以下是对话内容：\n${conversationText}`

    const response = await callDeepSeekAPI('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的日记作家，擅长将对话内容转化为温暖治愈的散文式日记。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: false,
    })

    const generatedText = response.choices[0].message.content

    // 解析生成的文本
    let weather = '晴天'
    let moodTags: string[] = ['平静']
    let content = generatedText

    // 尝试解析格式化输出
    const weatherMatch = generatedText.match(/weather:\s*(.+)/i)
    const moodMatch = generatedText.match(/mood:\s*\[(.+)\]/i)
    const contentMatch = generatedText.match(/---\n([\s\S]+)$/)

    if (weatherMatch) weather = weatherMatch[1].trim()
    if (moodMatch) {
      moodTags = moodMatch[1].split(',').map((t: string) => t.trim())
    }
    if (contentMatch) {
      content = contentMatch[1].trim()
    }

    return NextResponse.json({
      weather,
      moodTags,
      content,
    })
  } catch (error) {
    console.error('Diary generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate diary' },
      { status: 500 }
    )
  }
}
