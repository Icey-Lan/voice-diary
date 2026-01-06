import { NextRequest, NextResponse } from 'next/server'
import { callDeepSeekAPI } from '@/lib/ai-service'
import { DIARY_GENERATION_PROMPT } from '@/lib/prompts'
import { GenerateDiaryRequest } from '@/types'

// Gemini 日记生成作为备用
async function callGeminiDiary(conversation: any[]) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  // 构建对话文本
  const conversationText = conversation
    .map((msg) => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
    .join('\n')

  const prompt = `${DIARY_GENERATION_PROMPT}\n\n以下是对话内容：\n${conversationText}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: '你是一位专业的日记作家，擅长将对话内容转化为温暖治愈的散文式日记。',
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  // 安全地解析响应
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini API returned no candidates')
  }

  const candidate = data.candidates[0]
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new Error('Gemini API returned invalid response format')
  }

  return candidate.content.parts[0].text || ''
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDiaryRequest = await request.json()
    const { conversation } = body

    let generatedText: string

    // 尝试使用 DeepSeek API
    if (process.env.DEEPSEEK_API_KEY) {
      try {
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

        generatedText = response.choices[0].message.content
      } catch (deepSeekError) {
        console.error('DeepSeek API failed, falling back to Gemini:', deepSeekError)
        // 如果 DeepSeek 失败，回退到 Gemini
        generatedText = await callGeminiDiary(conversation)
      }
    } else {
      // 直接使用 Gemini
      generatedText = await callGeminiDiary(conversation)
    }

    // 解析生成的文本
    let weather = '晴天'
    let moodTags: string[] = ['平静']
    let content = generatedText

    // 尝试解析格式化输出（支持多种格式）
    const weatherMatch = generatedText.match(/weather:\s*(.+)/i)
    const moodMatch = generatedText.match(/mood:\s*\[(.+)\]/i)
    const contentMatch = generatedText.match(/---\s*\nweather:.+?\nmood:\s*\[.+?\]\s*\n([\s\S]+?)\n---/i)

    if (weatherMatch) weather = weatherMatch[1].trim()
    if (moodMatch) {
      moodTags = moodMatch[1].split(',').map((t: string) => t.trim())
    }

    if (contentMatch) {
      // 标准格式：提取两个 --- 之间的正文内容
      content = contentMatch[1].trim()
    } else {
      // 备用解析：尝试提取 weather 和 mood 之后的所有内容
      const lines = generatedText.split('\n')
      const contentLines: string[] = []
      let foundMetadata = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // 跳过分隔符和元数据行
        if (line.trim() === '---' || line.match(/^weather:/i) || line.match(/^mood:/i)) {
          foundMetadata = true
          continue
        }
        // 收集元数据之后的内容
        if (foundMetadata || (!foundMetadata && i > 0)) {
          contentLines.push(line)
        }
      }

      if (contentLines.length > 0) {
        const parsedContent = contentLines.join('\n').trim()
        // 确保解析出的内容不是元数据
        if (parsedContent && !parsedContent.match(/^weather:/i) && !parsedContent.match(/^mood:/i)) {
          content = parsedContent
        }
      }
    }

    // 最终清理：确保 content 不包含 weather 和 mood 信息
    content = content
      .replace(/^weather:\s*.+$/im, '')
      .replace(/^mood:\s*\[.+?\]$/im, '')
      .replace(/^---\s*$/gm, '')
      .trim()

    return NextResponse.json({
      weather,
      moodTags,
      content,
    })
  } catch (error) {
    console.error('Diary generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate diary',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
