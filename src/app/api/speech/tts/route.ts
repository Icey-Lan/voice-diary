import { NextRequest, NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai-service'

// 智谱 GLM-TTS 文字转语音 API
// 文档: https://docs.bigmodel.cn/cn/guide/models/sound-and-video/glm-tts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, speed = 1.0 } = body

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    // 调用智谱 GLM-TTS API
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.zhipu.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-tts',
        input: text,
        voice: 'female', // 默认使用女声
        speed,
        response_format: 'wav',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zhipu TTS API error:', response.status, errorText)
      throw new Error(`Zhipu TTS API error: ${response.status} ${errorText}`)
    }

    // 返回音频数据
    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
