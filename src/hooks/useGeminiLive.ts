import { useRef, useState, useCallback } from 'react'

// 扩展全局 Window 接口
declare global {
  interface Window {
    webkitAudioContext?: new (options?: AudioContextOptions) => AudioContext;
  }
}

interface UseGeminiLiveOptions {
  focus?: string
  onAudioReceived?: (audioData: string) => void
  onTextReceived?: (text: string) => void
  onError?: (error: Error) => void
}

interface UseGeminiLiveReturn {
  isConnected: boolean
  isListening: boolean
  isSpeaking: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  startListening: () => Promise<void>
  stopListening: () => void
  sendAudio: (audioData: string) => Promise<void>
  error: string | null
}

export function useGeminiLive({
  focus = 'all',
  onAudioReceived,
  onTextReceived,
  onError,
}: UseGeminiLiveOptions): UseGeminiLiveReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<string[]>([])
  const isPlayingRef = useRef(false)

  // 连接到 Live API
  const connect = useCallback(async () => {
    try {
      const response = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          focus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to connect')
      }

      const data = await response.json()
      sessionIdRef.current = data.sessionId
      setIsConnected(true)
      setError(null)
    } catch (err) {
      const error = err as Error
      setError(error.message)
      onError?.(error)
      throw error
    }
  }, [focus, onError])

  // 断开连接
  const disconnect = useCallback(async () => {
    if (sessionIdRef.current) {
      try {
        await fetch('/api/live-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'disconnect',
            sessionId: sessionIdRef.current,
          }),
        })
      } catch (err) {
        console.error('Error disconnecting:', err)
      }
      sessionIdRef.current = null
    }
    setIsConnected(false)
    setIsListening(false)
    setIsSpeaking(false)
  }, [])

  // 播放音频队列
  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return
    }

    isPlayingRef.current = true
    setIsSpeaking(true)

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift()!
      try {
        // 将 base64 音频数据转换为 ArrayBuffer
        const binaryString = atob(audioData)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // 创建音频上下文并播放
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext
          if (!AudioContextClass) {
            throw new Error('AudioContext not supported in this browser')
          }
          audioContextRef.current = new AudioContextClass({
            sampleRate: 24000,
          })
        }

        const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer)
        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContextRef.current.destination)

        await new Promise<void>((resolve) => {
          source.onended = () => resolve()
          source.start()
        })
      } catch (err) {
        console.error('Error playing audio:', err)
      }
    }

    isPlayingRef.current = false
    setIsSpeaking(false)
  }, [])

  // 发送音频数据
  const sendAudio = useCallback(
    async (audioData: string) => {
      if (!sessionIdRef.current) {
        throw new Error('Not connected')
      }

      try {
        const response = await fetch('/api/live-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_audio',
            sessionId: sessionIdRef.current,
            audioData,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send audio')
        }

        const data = await response.json()

        // 处理响应
        if (data.audioResponse) {
          audioQueueRef.current.push(data.audioResponse)
          onAudioReceived?.(data.audioResponse)
          // 开始播放音频队列
          playAudioQueue()
        }

        if (data.textResponse) {
          onTextReceived?.(data.textResponse)
        }

        return data
      } catch (err) {
        const error = err as Error
        setError(error.message)
        onError?.(error)
        throw error
      }
    },
    [onAudioReceived, onTextReceived, onError, playAudioQueue]
  )

  // 开始录音
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
        },
      })

      // 创建 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder

      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      // 每 100ms 发送一次音频数据
      mediaRecorder.onstop = async () => {
        if (audioChunks.length === 0) return

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const arrayBuffer = await audioBlob.arrayBuffer()

        // 转换为 base64
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        )

        // 发送音频数据
        await sendAudio(base64)

        // 清空 chunks
        audioChunks.length = 0
      }

      mediaRecorder.start(100) // 每 100ms 触发一次 dataavailable
      setIsListening(true)
      setError(null)
    } catch (err) {
      const error = err as Error
      setError(error.message)
      onError?.(error)
      throw error
    }
  }, [onError, sendAudio])

  // 停止录音
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      mediaRecorderRef.current = null
    }
    setIsListening(false)
  }, [])

  return {
    isConnected,
    isListening,
    isSpeaking,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendAudio,
    error,
  }
}
