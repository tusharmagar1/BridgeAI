import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings, ThemeMode } from '@/types'
import { DEFAULT_AI_CONFIG, DEFAULT_VOICE_CONFIG } from '@/lib/constants'

export interface SavedTheme {
  id: string
  name: string
  theme: 'light' | 'dark'
  primaryColor: string
  secondaryColor: string
  isFavorite: boolean
}

interface SettingsState extends AppSettings {
  savedThemes: SavedTheme[]

  // Actions
  setTheme: (theme: ThemeMode) => void
  setAccentColor: (color: string) => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setUILanguage: (lang: string) => void
  setChatLanguage: (lang: string) => void
  setAutoDetectLanguage: (enabled: boolean) => void
  updateAIConfig: (updates: Partial<AppSettings['ai']>) => void
  updateVoiceConfig: (updates: Partial<AppSettings['voice']>) => void
  updatePrivacy: (updates: Partial<AppSettings['privacy']>) => void
  updateThemeCustomizer: (updates: Partial<AppSettings['themeCustomizer']>) => void
  setNotifications: (enabled: boolean) => void
  resetSettings: () => void

  // Custom Theme Actions
  saveTheme: (name: string) => void
  loadTheme: (id: string) => void
  toggleFavoriteTheme: (id: string) => void
  deleteTheme: (id: string) => void
  resetThemeCustomizer: () => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#ffffff', // Default to White accent for Dark Theme
  fontSize: 'medium',
  uiLanguage: 'en',
  chatLanguage: 'auto',
  autoDetectLanguage: true,
  ai: DEFAULT_AI_CONFIG,
  voice: DEFAULT_VOICE_CONFIG,
  privacy: {
    saveChatHistory: true,
    dataRetention: 'forever',
    shareAnalytics: false,
  },
  notifications: true,
  themeCustomizer: {
    borderRadius: 'organic',
    density: 'comfortable',
    chatBubbleStyle: 'modern',
    glassIntensity: 'medium',
    backgroundBlur: 'medium',
    fontFamily: 'Inter',
    animationSpeed: 'normal',
    sidebarWidth: 'standard',
    backgroundPattern: 'none',
    customWallpaper: 'solar-flare',
    themePreset: 'abyssal-trench',
    primaryColor: '#ffffff', // Default White
    secondaryColor: '#a1a1aa', // Default Gray
  },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      savedThemes: [],

      setTheme: (theme) => set((s) => {
        const customizer = s.themeCustomizer
        
        // Detect if current colors are the defaults for the previous theme
        const isDefaultDark = customizer.primaryColor === '#ffffff' && customizer.secondaryColor === '#a1a1aa'
        const isDefaultLight = customizer.primaryColor === '#000000' && customizer.secondaryColor === '#52525b'
        
        let newPrimary = customizer.primaryColor
        let newSecondary = customizer.secondaryColor
        
        // Auto-switch defaults if they haven't been customized
        if (theme === 'dark' && (isDefaultLight || newPrimary === '#000000')) {
          newPrimary = '#ffffff'
          newSecondary = '#a1a1aa'
        } else if (theme === 'light' && (isDefaultDark || newPrimary === '#ffffff')) {
          newPrimary = '#000000'
          newSecondary = '#52525b'
        }
        
        return {
          theme,
          accentColor: newPrimary,
          themeCustomizer: {
            ...customizer,
            primaryColor: newPrimary,
            secondaryColor: newSecondary,
          }
        }
      }),
      setAccentColor: (accentColor) => set((s) => ({ 
        accentColor,
        themeCustomizer: {
          ...s.themeCustomizer,
          primaryColor: accentColor
        }
      })),
      setFontSize: (fontSize) => set({ fontSize }),
      setUILanguage: (uiLanguage) => set({ uiLanguage }),
      setChatLanguage: (chatLanguage) => set({ chatLanguage }),
      setAutoDetectLanguage: (autoDetectLanguage) => set({ autoDetectLanguage }),
      updateAIConfig: (updates) => set((s) => ({ ai: { ...s.ai, ...updates } })),
      updateVoiceConfig: (updates) => set((s) => ({ voice: { ...s.voice, ...updates } })),
      updatePrivacy: (updates) => set((s) => ({ privacy: { ...s.privacy, ...updates } })),
      updateThemeCustomizer: (updates) => set((s) => {
        const newPrimary = updates.primaryColor !== undefined ? updates.primaryColor : s.themeCustomizer.primaryColor
        return {
          accentColor: newPrimary, // Sync accentColor with primaryColor
          themeCustomizer: { ...s.themeCustomizer, ...updates }
        }
      }),
      setNotifications: (notifications) => set({ notifications }),
      resetSettings: () => set({ ...defaultSettings }),

      // Custom Theme Actions
      saveTheme: (name) => set((s) => {
        const newTheme: SavedTheme = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          theme: s.theme === 'light' ? 'light' : 'dark',
          primaryColor: s.themeCustomizer.primaryColor,
          secondaryColor: s.themeCustomizer.secondaryColor,
          isFavorite: false,
        }
        return {
          savedThemes: [...s.savedThemes, newTheme]
        }
      }),
      loadTheme: (id) => set((s) => {
        const target = s.savedThemes.find(t => t.id === id)
        if (!target) return {}
        return {
          theme: target.theme,
          accentColor: target.primaryColor,
          themeCustomizer: {
            ...s.themeCustomizer,
            primaryColor: target.primaryColor,
            secondaryColor: target.secondaryColor,
          }
        }
      }),
      toggleFavoriteTheme: (id) => set((s) => ({
        savedThemes: s.savedThemes.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)
      })),
      deleteTheme: (id) => set((s) => ({
        savedThemes: s.savedThemes.filter(t => t.id !== id)
      })),
      resetThemeCustomizer: () => set((s) => {
        const isDarkTheme = s.theme === 'dark'
        const defaultPrimary = isDarkTheme ? '#ffffff' : '#000000'
        const defaultSecondary = isDarkTheme ? '#a1a1aa' : '#52525b'
        return {
          accentColor: defaultPrimary,
          themeCustomizer: {
            ...s.themeCustomizer,
            primaryColor: defaultPrimary,
            secondaryColor: defaultSecondary,
            borderRadius: 'organic',
            density: 'comfortable',
            chatBubbleStyle: 'modern',
            glassIntensity: 'medium',
            backgroundBlur: 'medium',
            fontFamily: 'Inter',
            animationSpeed: 'normal',
            sidebarWidth: 'standard',
            backgroundPattern: 'none',
          }
        }
      })
    }),
    {
      name: 'bridgeai-settings',
      version: 2,
    }
  )
)
