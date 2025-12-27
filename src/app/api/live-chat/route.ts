import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality } from '@google/genai'
import { getChatPrompt } from '@/lib/prompts'

const MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'

// 用于存储活动的会话
const activeSessions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionId, focus, audioData } = body

    // 获取系统提示词
    const systemPrompt = getChatPrompt(focus || 'all')

    switch (action) {
      case 'connect':
        // 创建新的 Live API 会话
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
          return NextResponse.json(
            { error: 'GEMINI_API_KEY not configured' },
            { status: 500 }
          )
        }

        const ai = new GoogleGenAI({ apiKey })
        const config = {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemPrompt,
        }

        // 连接到 Live API
        const liveSession = await ai.live.connect({
          model: MODEL,
          config: config,
          callbacks: {
            onopen: () => console.log('Live API connection opened'),
            onmessage: (message: any) => console.log('Live API message:', message),
            onerror: (e: any) => console.error('Live API error:', e.message || e),
            onclose: (reason: any) => console.log('Live API closed:', reason),
          },
        })

        const newSessionId = sessionId || `session_${Date.now()}`

        // 存储会话
        activeSessions.set(newSessionId, {
          session: liveSession,
          config,
          responseQueue: [] as any[],
        })

        return NextResponse.json({
          sessionId: newSessionId,
          status: 'connected',
        })

      case 'send_audio':
        // 发送音频到 Live API
        const sessionData = activeSessions.get(sessionId)
        if (!sessionData) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        const { session } = sessionData

        // 发送音频数据
        if (audioData) {
          await session.sendRealtimeInput({
            audio: {
              data: audioData,
              mimeType: 'audio/pcm;rate=16000',
            },
          })
        }

        // 等待响应
        const responses: any[] = []
        let audioResponse: string | null = null
        let textResponse: string | null = null

        try {
          // 接收响应
          const turn = session.receive()
          for await (const response of turn) {
            responses.push(response)

            if (response.serverContent?.modelTurn?.parts) {
              for (const part of response.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  // 音频响应 (base64)
                  audioResponse = part.inlineData.data
                }
                if (part.text) {
                  // 文本响应
                  textResponse = part.text
                }
              }
            }
          }
        } catch (error) {
          console.error('Error receiving response:', error)
        }

        return NextResponse.json({
          status: 'success',
          audioResponse,
          textResponse,
          responses,
        })

      case 'disconnect':
        // 断开会话
        const sessionToClose = activeSessions.get(sessionId)
        if (sessionToClose) {
          try {
            await sessionToClose.session.close()
          } catch (error) {
            console.error('Error closing session:', error)
          }
          activeSessions.delete(sessionId)
        }

        return NextResponse.json({
          status: 'disconnected',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Live chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process live chat request', details: String(error) },
      { status: 500 }
    )
  }
}

// 清理过期会话
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, sessionData] of activeSessions.entries()) {
    // 如果会话超过 30 分钟没有活动，关闭它
    if (now - (sessionData.lastActivity || now) > 30 * 60 * 1000) {
      try {
        sessionData.session.close()
      } catch (error) {
        console.error('Error closing expired session:', error)
      }
      activeSessions.delete(sessionId)
    }
  }
}, 5 * 60 * 1000) // 每 5 分钟检查一次
