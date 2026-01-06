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
        response_format: 'mp3',
        speed: speed,
        volume: 1.0,
        output_format: 'base64'  // 返回 base64 格式，便于直接返回音频数据
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zhipu GLM-TTS API error:', response.status, errorText)
      throw new Error(`Zhipu GLM-TTS API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()

    // 智谱 GLM-TTS 返回格式: { created: 123456, data: [{ url: "..." }] }
    // 当 output_format 为 url 时返回 URL，为 base64 时返回音频数据
    if (result.data && result.data.length > 0) {
      // 如果返回的是 base64 数据
      if (result.data[0].audio) {
        const audioBuffer = Buffer.from(result.data[0].audio, 'base64')
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
          },
        })
      }
      // 如果返回的是 URL，需要下载音频文件
      if (result.data[0].url) {
        const audioResponse = await fetch(result.data[0].url)
        const audioBuffer = await audioResponse.arrayBuffer()
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
          },
        })
      }
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
