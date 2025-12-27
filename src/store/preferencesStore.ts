import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserPreferences, DialogueFocus } from '@/types'

interface PreferencesStore extends UserPreferences {
  // API Keys
  apiKeys: {
    zhipu: string
    deepseek: string
  }

  // 设置偏好
  setPreferences: (prefs: Partial<UserPreferences>) => void

  // 设置 API Key
  setApiKey: (service: 'zhipu' | 'deepseek', key: string) => void

  // 重置为默认
  reset: () => void
}

const defaultPreferences: UserPreferences = {
  dialogueFocus: 'all',
  voiceEnabled: true,
  ttsSpeed: 1.0,
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      apiKeys: {
        zhipu: '',
        deepseek: '',
      },

      setPreferences: (prefs) => set((state) => ({ ...state, ...prefs })),

      setApiKey: (service, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [service]: key },
      })),

      reset: () => set({
        ...defaultPreferences,
        apiKeys: { zhipu: '', deepseek: '' },
      }),
    }),
    {
      name: 'diary-preferences',
    }
  )
)
