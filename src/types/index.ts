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
  { value: '平静', icon: 'leaf', color: '#10b981' },
  { value: '开心', icon: 'sun', color: '#fbbf24' },
  { value: '忧郁', icon: 'cloud-rain', color: '#64748b' },
  { value: '感激', icon: 'heart', color: '#ec4899' },
  { value: '疲惫', icon: 'moon', color: '#8b5cf6' },
  { value: '期待', icon: 'sparkles', color: '#f59e0b' },
  { value: '焦虑', icon: 'zap', color: '#ef4444' },
  { value: '满足', icon: 'smile', color: '#6366f1' },
  { value: '思考', icon: 'lightbulb', color: '#f59e0b' },
  { value: '温暖', icon: 'sun', color: '#f97316' },
] as const

// 天气选项
export const WEATHER_OPTIONS = [
  { value: '晴天', icon: 'sun', color: '#fbbf24' },
  { value: '多云', icon: 'cloud-sun', color: '#94a3b8' },
  { value: '阴天', icon: 'cloud', color: '#64748b' },
  { value: '小雨', icon: 'cloud-drizzle', color: '#60a5fa' },
  { value: '大雨', icon: 'cloud-rain', color: '#3b82f6' },
  { value: '雪', icon: 'snowflake', color: '#a5b4fc' },
  { value: '雾', icon: 'cloud-fog', color: '#94a3b8' },
] as const
