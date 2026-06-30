import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AnalyticsData, DailyActivity } from '@/types'

interface AnalyticsState extends AnalyticsData {
  // Actions
  incrementMessages: () => void
  addTokens: (count: number) => void
  addLanguage: (lang: string) => void
  recordActivity: (messages: number, tokens: number) => void
  setAnalytics: (data: Partial<AnalyticsData>) => void
  resetAnalytics: () => void
}

const defaultAnalytics: AnalyticsData = {
  totalMessages: 0,
  totalTokens: 0,
  totalConversations: 0,
  languagesUsed: ['en'],
  averageResponseTime: 0,
  dailyActivity: [],
  modelUsage: [],
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      ...defaultAnalytics,

      incrementMessages: () => set((s) => ({ totalMessages: s.totalMessages + 1 })),
      addTokens: (count) => set((s) => ({ totalTokens: s.totalTokens + count })),
      addLanguage: (lang) => set((s) => ({
        languagesUsed: s.languagesUsed.includes(lang)
          ? s.languagesUsed
          : [...s.languagesUsed, lang],
      })),
      recordActivity: (messages, tokens) => set((s) => {
        const today = new Date().toISOString().split('T')[0]
        const activity = [...s.dailyActivity]
        const todayIdx = activity.findIndex((a) => a.date === today)
        if (todayIdx >= 0) {
          activity[todayIdx] = {
            ...activity[todayIdx],
            messages: activity[todayIdx].messages + messages,
            tokens: activity[todayIdx].tokens + tokens,
          }
        } else {
          activity.push({ date: today, messages, tokens } as DailyActivity)
        }
        // Keep only last 90 days
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - 90)
        const filtered = activity.filter((a) => new Date(a.date) >= cutoff)
        return { dailyActivity: filtered }
      }),
      setAnalytics: (data) => set((s) => ({ ...s, ...data })),
      resetAnalytics: () => set(defaultAnalytics),
    }),
    {
      name: 'bridgeai-analytics',
      version: 1,
    }
  )
)
