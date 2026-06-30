/* ===== CORE ENTITIES ===== */

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokensUsed?: number
  latencyMs?: number
  feedback: number
  language?: string
  isBookmarked?: boolean
  isPinned?: boolean
  reactions?: MessageReaction[]
  isEdited?: boolean
  parentId?: string
  createdAt: string
}

export interface MessageReaction {
  emoji: string
  count: number
  reacted: boolean
}

export interface Conversation {
  id: string
  userId: string
  title: string
  locale: string
  status: 'active' | 'archived' | 'deleted'
  folderId?: string
  isFavorite: boolean
  isPinned: boolean
  isShared: boolean
  messageCount: number
  lastMessage?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  color: string
  conversationIds: string[]
  createdAt: string
}

/* ===== AI CONFIGURATION ===== */

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  maxTokens: number
  contextWindow: number
  isAvailable: boolean
  icon?: string
}

export interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
  topP: number
  streaming: boolean
  mode: 'creative' | 'balanced' | 'precise'
  reasoningMode: boolean
  webSearch: boolean
  systemPrompt: string
}

/* ===== STREAMING ===== */

export interface StreamingToken {
  type: 'token'
  content: string
}

export interface StreamingDone {
  type: 'done'
  latencyMs: number
  tokensUsed: number
  model: string
}

export interface StreamingError {
  type: 'error'
  message: string
}

export type StreamEvent = StreamingToken | StreamingDone | StreamingError

/* ===== VOICE ===== */

export interface VoiceConfig {
  voice: string
  speed: number
  pitch: number
  autoRead: boolean
  language: string
}

/* ===== ANALYTICS ===== */

export interface AnalyticsData {
  totalMessages: number
  totalTokens: number
  totalConversations: number
  languagesUsed: string[]
  averageResponseTime: number
  dailyActivity: DailyActivity[]
  modelUsage: ModelUsage[]
}

export interface DailyActivity {
  date: string
  messages: number
  tokens: number
}

export interface ModelUsage {
  model: string
  count: number
  tokens: number
}

/* ===== SETTINGS ===== */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppSettings {
  theme: ThemeMode
  accentColor: string
  fontSize: 'small' | 'medium' | 'large'
  uiLanguage: string
  chatLanguage: string
  autoDetectLanguage: boolean
  ai: AIConfig
  voice: VoiceConfig
  privacy: PrivacySettings
  notifications: boolean
  themeCustomizer: {
    borderRadius: string
    density: 'comfortable' | 'compact'
    chatBubbleStyle: 'classic' | 'modern' | 'minimal'
    glassIntensity: 'none' | 'low' | 'medium' | 'high'
    backgroundBlur: string
    fontFamily: string
    animationSpeed: string
    sidebarWidth: 'narrow' | 'standard' | 'wide'
    backgroundPattern: string
    customWallpaper: string
    themePreset: string
    primaryColor: string
    secondaryColor: string
  }
}

export interface PrivacySettings {
  saveChatHistory: boolean
  dataRetention: 'forever' | '30days' | '90days' | '1year'
  shareAnalytics: boolean
}

/* ===== UI STATE ===== */

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
  duration?: number
}

export interface CommandItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  group: string
  action: () => void
}

/* ===== LANGUAGE ===== */

export interface Language {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  flag: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', flag: '🇮🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', flag: '🇰🇷' },
]

/* ===== AI MODELS ===== */

export const AI_MODELS: AIModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'GroqCloud',
    description: 'Most capable model. Best for complex tasks.',
    maxTokens: 32768,
    contextWindow: 131072,
    isAvailable: true,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    provider: 'GroqCloud',
    description: 'Ultra-fast model. Best for simple tasks.',
    maxTokens: 8192,
    contextWindow: 131072,
    isAvailable: true,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'GroqCloud',
    description: 'Balanced model. Good for most tasks.',
    maxTokens: 32768,
    contextWindow: 32768,
    isAvailable: true,
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    provider: 'GroqCloud',
    description: 'Google\'s compact model. Great for conversation.',
    maxTokens: 8192,
    contextWindow: 8192,
    isAvailable: true,
  },
]
