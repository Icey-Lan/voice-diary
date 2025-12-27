import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Diary } from '@/types'

interface DiaryStore {
  // 日记列表
  diaries: Diary[]

  // 当前生成的日记（预览状态）
  currentDiary: Diary | null

  // 对话记录（预览状态）
  conversationHistory: Array<{ role: string; content: string }>

  // 是否正在加载
  isLoading: boolean

  // 设置日记列表
  setDiaries: (diaries: Diary[]) => void

  // 添加日记
  addDiary: (diary: Diary) => void

  // 删除日记
  deleteDiary: (id: string) => void

  // 更新日记
  updateDiary: (id: string, updates: Partial<Diary>) => void

  // 设置当前生成的日记
  setCurrentDiary: (diary: Diary | null) => void

  // 设置对话记录
  setConversationHistory: (history: Array<{ role: string; content: string }>) => void

  // 设置加载状态
  setLoading: (loading: boolean) => void

  // 清空当前会话数据
  clearCurrentSession: () => void
}

export const useDiaryStore = create<DiaryStore>()(
  persist(
    (set) => ({
      diaries: [],
      currentDiary: null,
      conversationHistory: [],
      isLoading: false,

      setDiaries: (diaries) => set({ diaries }),

      addDiary: (diary) => set((state) => ({
        diaries: [diary, ...state.diaries],
      })),

      deleteDiary: (id) => set((state) => ({
        diaries: state.diaries.filter((d) => d.id !== id),
      })),

      updateDiary: (id, updates) => set((state) => ({
        diaries: state.diaries.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
      })),

      setCurrentDiary: (diary) => set({ currentDiary: diary }),

      setConversationHistory: (history) => set({ conversationHistory: history }),

      setLoading: (isLoading) => set({ isLoading }),

      clearCurrentSession: () => set({
        currentDiary: null,
        conversationHistory: [],
      }),
    }),
    {
      name: 'diary-storage',
    }
  )
)
