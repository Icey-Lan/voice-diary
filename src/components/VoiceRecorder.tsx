"use client"

import { useState, useRef } from "react"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  isRecording: boolean
  onRecordingChange: (recording: boolean) => void
}

export function VoiceRecorder({ onTranscript, isRecording, onRecordingChange }: VoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)

  const startRecording = () => {
    // 检查浏览器支持
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音识别，请使用 Chrome 或 Safari 浏览器")
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.lang = "zh-CN"
      recognition.continuous = false
      recognition.interimResults = true // 实时显示识别结果

      recognition.onstart = () => {
        onRecordingChange(true)
        setIsProcessing(false)
      }

      recognition.onresult = (event: any) => {
        const results = event.results
        if (results.length > 0) {
          const transcript = results[results.length - 1][0].transcript
          // 实时更新输入框
          onTranscript(transcript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsProcessing(false)
        onRecordingChange(false)

        if (event.error === "not-allowed") {
          alert("请允许麦克风权限以使用语音识别功能")
        } else if (event.error === "no-speech") {
          // 没有检测到语音
          setIsProcessing(false)
          onRecordingChange(false)
        }
      }

      recognition.onend = () => {
        setIsProcessing(false)
        onRecordingChange(false)
      }

      recognition.start()
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setIsProcessing(false)
      onRecordingChange(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      onRecordingChange(false)
    }
  }

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else if (!isProcessing) {
      startRecording()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`
        relative w-20 h-20 rounded-full flex items-center justify-center transition-all
        ${isRecording ? "bg-[#d4a5a5] recording-pulse" : "bg-[#9caf88] hover:bg-[#7a8f6d]"}
        ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
        shadow-lg hover:shadow-xl active:scale-95
      `}
    >
      {isRecording ? (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <rect x="6" y="6" width="8" height="8" rx="1" />
        </svg>
      ) : (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  )
}
