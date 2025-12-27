import { create } from 'zustand'
import { ChatMessage, DialogueFocus, ConversationSession } from '@/types'

interface ConversationStore {
  // 当前会话
  currentSession: ConversationSession | null

  // 对话焦点
  focus: DialogueFocus

  // 对话消息
  messages: ChatMessage[]

  // 是否正在录音
  isRecording: boolean

  // 是否正在生成
  isGenerating: boolean

  // AI 正在说话
  isPlaying: boolean

  // 设置焦点
  setFocus: (focus: DialogueFocus) => void

  // 开始新会话
  startNewSession: () => void

  // 添加消息
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void

  // 清空消息
  clearMessages: () => void

  // 设置录音状态
  setRecording: (recording: boolean) => void

  // 设置生成状态
  setGenerating: (generating: boolean) => void

  // 设置播放状态
  setPlaying: (playing: boolean) => void

  // 结束会话
  endSession: () => void
}

export const useConversationStore = create<ConversationStore>((set) => ({
  currentSession: null,
  focus: 'all',
  messages: [],
  isRecording: false,
  isGenerating: false,
  isPlaying: false,

  setFocus: (focus) => set({ focus }),

  startNewSession: () => set({
    currentSession: {
      id: crypto.randomUUID(),
      userId: 'local-user', // 本地模式
      focus: useConversationStore.getState().focus,
      messages: [],
      startTime: new Date(),
    },
    messages: [],
  }),

  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
    ],
  })),

  clearMessages: () => set({ messages: [] }),

  setRecording: (isRecording) => set({ isRecording }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setPlaying: (isPlaying) => set({ isPlaying }),

  endSession: () => set((state) => ({
    currentSession: state.currentSession
      ? { ...state.currentSession, endTime: new Date() }
      : null,
  })),
}))
