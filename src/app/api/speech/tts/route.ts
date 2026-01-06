import { NextRequest, NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai-service'

// 智谱 GLM-TTS 文字转语音
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

    // 调用智谱 GLM-TTS API 生成音频
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.zhipu.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-tts',
        input: text,
        voice: 'tongtong',  // 使用默认的中文音色
        speed: speed,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zhipu GLM-TTS API error:', response.status, errorText)
      throw new Error(`Zhipu GLM-TTS API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()

    // 智谱 GLM-TTS 返回格式: { created: 123456, data: [{ url: "..." }] }
    // 返回的是音频文件的 URL，需要下载后返回给客户端
    if (result.data && result.data.length > 0 && result.data[0].url) {
      const audioUrl = result.data[0].url
      const audioResponse = await fetch(audioUrl)

      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio from URL: ${audioResponse.status}`)
      }

      const audioBuffer = await audioResponse.arrayBuffer()
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
        },
      })
    }

    throw new Error('No audio data returned from GLM-TTS API')
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
