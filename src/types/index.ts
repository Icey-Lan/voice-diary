// 用户偏好
export type DialogueFocus = 'event' | 'emotion' | 'growth' | 'all'

export interface UserPreferences {
  dialogueFocus: DialogueFocus
  voiceEnabled: boolean
  ttsSpeed: number
}

// 对话消息
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// 对话焦点选项
export interface DialogueFocusOption {
  value: DialogueFocus
  label: string
  icon: string
  description: string
}

// 日记
export interface Diary {
  id: string
  user_id: string
  date: string
  weather: string
  moodTags: string[]
  content: string
  created_at: string
}

// 生成日记的请求
export interface GenerateDiaryRequest {
  conversation: ChatMessage[]
  focus: DialogueFocus
}

// 生成日记的响应
export interface GenerateDiaryResponse {
  weather: string
  moodTags: string[]
  content: string
}

// AI 对话请求
export interface ChatRequest {
  messages: ChatMessage[]
  focus: DialogueFocus
}

// AI 对话响应
export interface ChatResponse {
  content: string
  shouldContinue: boolean
}

// 语音转文字请求
export interface STTRequest {
  audioData: ArrayBuffer
}

// 语音转文字响应
export interface STTResponse {
  text: string
}

// 文字转语音请求
export interface TTSRequest {
  text: string
  speed?: number
}

// 文字转语音响应
export interface TTSResponse {
  audioData: ArrayBuffer
}

// 对话会话
export interface ConversationSession {
  id: string
  userId: string
  focus: DialogueFocus
  messages: ChatMessage[]
  startTime: Date
  endTime?: Date
}

// 心情标签
export const MOOD_TAGS = [
  { value: '平静', emoji: '🍃' },
  { value: '开心', emoji: '😊' },
  { value: '忧郁', emoji: '🌧️' },
  { value: '感激', emoji: '🙏' },
  { value: '疲惫', emoji: '😴' },
  { value: '期待', emoji: '✨' },
  { value: '焦虑', emoji: '😰' },
  { value: '满足', emoji: '😌' },
  { value: '思考', emoji: '🤔' },
  { value: '温暖', emoji: '🌻' },
] as const

// 天气选项
export const WEATHER_OPTIONS = [
  { value: '晴天', icon: '☀️' },
  { value: '多云', icon: '⛅' },
  { value: '阴天', icon: '☁️' },
  { value: '小雨', icon: '🌧️' },
  { value: '大雨', icon: '⛈️' },
  { value: '雪', icon: '❄️' },
  { value: '雾', icon: '🌫️' },
] as const
