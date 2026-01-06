import { NextRequest, NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai-service'

// 智谱 GLM-ASR 语音转文字 API
// 文档: https://docs.bigmodel.cn/cn/guide/models/sound-and-video/glm-asr
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // 智谱 GLM-4.7 ASR API 需要使用 FormData 方式上传
    const apiFormData = new FormData()
    apiFormData.append('file', audioFile)
    apiFormData.append('model', 'glm-4.7')

    // 调用智谱 GLM-4.7 ASR API
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.zhipu.apiKey}`,
      },
      body: apiFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zhipu STT API error:', response.status, errorText)
      throw new Error(`Zhipu STT API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()

    // 智谱 GLM-4.7 ASR 返回格式: { text: "识别的文本" }
    return NextResponse.json({
      text: result.text || '',
    })
  } catch (error) {
    console.error('STT error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
