import { NextRequest, NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai-service'

// Gemini API 文字转语音
// 文档: https://ai.google.dev/gemini-api/docs/speech-generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    // 调用 Gemini API 生成音频
    // 使用 gemini-2.5-flash-preview-tts 专用 TTS 模型
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${AI_CONFIG.gemini.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: text
            }]
          }],
          generationConfig: {
            responseMimeType: 'audio/mp3',
            // 添加语音配置
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'cmn-CN-Wavenet-A'  // 中文语音
                }
              }
            }
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini TTS API error:', response.status, errorText)
      throw new Error(`Gemini TTS API error: ${response.status} ${errorText}`)
    }

    // 返回音频数据
    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
