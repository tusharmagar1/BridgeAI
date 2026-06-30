export const APP_NAME = 'BridgeAI'
export const APP_VERSION = '2.0.0'
export const APP_DESCRIPTION = 'Multilingual AI Chatbot'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const DEFAULT_AI_CONFIG = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.9,
  streaming: true,
  mode: 'balanced' as const,
  reasoningMode: false,
  webSearch: false,
  systemPrompt: 'You are BridgeAI, a helpful multilingual assistant. Respond in the same language the user writes in.',
}

export const DEFAULT_VOICE_CONFIG = {
  voice: 'default',
  speed: 1.0,
  pitch: 1.0,
  autoRead: false,
  language: 'en-US',
}

export const KEYBOARD_SHORTCUTS = {
  newChat: { key: 'n', modifier: 'ctrl', label: 'New Chat' },
  search: { key: 'k', modifier: 'ctrl', label: 'Command Palette' },
  toggleSidebar: { key: 'b', modifier: 'ctrl', label: 'Toggle Sidebar' },
  settings: { key: ',', modifier: 'ctrl', label: 'Settings' },
  toggleTheme: { key: 'j', modifier: 'ctrl', label: 'Toggle Theme' },
  focusInput: { key: '/', modifier: 'none', label: 'Focus Input' },
  sendMessage: { key: 'Enter', modifier: 'none', label: 'Send Message' },
  newLine: { key: 'Enter', modifier: 'shift', label: 'New Line' },
  stopGeneration: { key: 'Escape', modifier: 'none', label: 'Stop Generation' },
} as const

export const SLASH_COMMANDS = [
  { command: '/translate', description: 'Translate text to another language', icon: '🌐' },
  { command: '/summarize', description: 'Summarize the conversation', icon: '📝' },
  { command: '/code', description: 'Generate code', icon: '💻' },
  { command: '/explain', description: 'Explain a concept', icon: '💡' },
  { command: '/image', description: 'Describe an image to generate', icon: '🎨' },
  { command: '/fix', description: 'Fix code or text', icon: '🔧' },
  { command: '/improve', description: 'Improve writing quality', icon: '✨' },
] as const

export const PROMPT_TEMPLATES = [
  { label: 'Explain Like I\'m 5', prompt: 'Explain the following concept in simple terms, as if you were explaining to a 5-year-old: ' },
  { label: 'Code Review', prompt: 'Please review the following code for bugs, performance issues, and best practices:\n\n```\n' },
  { label: 'Translate', prompt: 'Translate the following text to [language]:\n\n' },
  { label: 'Summarize', prompt: 'Provide a concise summary of the following text:\n\n' },
  { label: 'Debug This', prompt: 'Help me debug the following code. Here\'s the error I\'m getting:\n\n' },
  { label: 'Write a Story', prompt: 'Write a creative short story about ' },
]
