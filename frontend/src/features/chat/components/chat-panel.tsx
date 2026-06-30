import React, { useRef, useEffect, useState } from 'react'
import { Message, Conversation } from '@/types'
import { MessageBubble } from './message-bubble'
import { ScrollToBottom } from './scroll-to-bottom'
import { TypingIndicator } from './typing-indicator'
import { ThinkingIndicator } from './thinking-indicator'
import { Sparkles, Languages, Code, AlertTriangle, ArrowRight, Settings2, Trash2, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/ui-store'
import { useSettingsStore } from '@/store/settings-store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { BridgeLogo } from '@/components/ui/bridge-logo'

interface ChatPanelProps {
  conversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  onSendMessage: (content: string) => void
  onUpdateMessage: (id: string, content: string) => void
  onDeleteMessage: (id: string) => void
  onFeedbackMessage: (id: string, val: number) => void
  onBookmarkMessage?: (id: string) => void
  onRegenerateMessage?: (id: string) => void
  onSpeakMessage?: (id: string, text: string, language?: string) => void
  speakingMessageId?: string | null
}

export function ChatPanel({
  conversation,
  messages,
  isLoading,
  isStreaming,
  onSendMessage,
  onUpdateMessage,
  onDeleteMessage,
  onFeedbackMessage,
  onBookmarkMessage,
  onRegenerateMessage,
  onSpeakMessage,
  speakingMessageId = null,
}: ChatPanelProps) {
  const { t } = useTranslation()
  const { setAIControlsOpen } = useUIStore()
  const { ai } = useSettingsStore()

  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const isAutoScrolling = useRef(true)

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    // Check if user is scrolled up (more than 150px from bottom)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150

    isAutoScrolling.current = isAtBottom
    setShowScrollBtn(!isAtBottom)

    if (isAtBottom) {
      setUnreadCount(0)
    }
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    })
    setUnreadCount(0)
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isAutoScrolling.current) {
      scrollToBottom('smooth')
    } else if (messages.length > 0) {
      setUnreadCount((prev) => prev + 1)
    }
  }, [messages.length])

  // Initial scroll on load
  useEffect(() => {
    scrollToBottom('auto')
  }, [conversation?.id])

  const suggestions = [
    {
      id: 'translate',
      label: t('chat.suggestions.translate.label', 'Translate text'),
      prompt: t('chat.suggestions.translate.prompt', 'Translate the following phrase into Spanish, Japanese, and French: "Hello, it is wonderful to meet you today."'),
      icon: Languages,
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500',
    },
    {
      id: 'explain',
      label: t('chat.suggestions.explain.label', 'Explain concepts'),
      prompt: t('chat.suggestions.explain.prompt', 'Explain what quantum computing is and how it differs from classical computing in simple terms.'),
      icon: Sparkles,
      color: 'from-pink-500/10 to-rose-500/10 border-pink-500/20 text-pink-500',
    },
    {
      id: 'code',
      label: t('chat.suggestions.code.label', 'Write & Debug code'),
      prompt: t('chat.suggestions.code.prompt', 'Write a clean, responsive CSS Grid layout with three columns and a header in vanilla HTML and CSS.'),
      icon: Code,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500',
    },
  ]

  return (
    <div className="flex-1 flex flex-col relative h-full min-w-0 overflow-hidden bg-[var(--color-surface-primary)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-default)] select-none bg-[var(--color-surface-primary)]/80 backdrop-blur-md z-20">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold text-[var(--color-text-primary)] truncate flex items-center gap-2">
            <BridgeLogo className="w-4.5 h-4.5 text-bridge-500" />
            <span>{conversation ? conversation.title : t('chat.newChat', 'New Conversation')}</span>
          </h1>
          <p className="text-[10px] text-[var(--color-text-secondary)] font-semibold truncate flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>BridgeAI</span>
            <span>•</span>
            <span>Temp {ai.temperature}</span>
            {ai.reasoningMode && (
              <>
                <span>•</span>
                <span className="text-purple-500 font-bold uppercase tracking-wide">Reasoning Active</span>
              </>
            )}
            {ai.webSearch && (
              <>
                <span>•</span>
                <span className="text-sky-500 font-bold uppercase tracking-wide">Web Search Active</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setAIControlsOpen(true)}
            className="p-2 rounded-xl border border-[var(--color-border-default)] hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-bridge-500 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('chat.header.parameters', 'Model Config')}</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 py-4 divide-y divide-[var(--color-border-default)]/30 scrollbar-thin relative"
      >
        {messages.length === 0 ? (
          /* Empty/Landing State Suggestions */
          <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-full space-y-8">
            <div className="text-center space-y-3 max-w-lg">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-16 h-16 rounded-2xl bg-bridge-500/10 border border-bridge-500/20 flex items-center justify-center text-bridge-500 mx-auto shadow-md"
              >
                <BridgeLogo className="w-10 h-10" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl font-extrabold text-[var(--color-text-primary)]"
              >
                {t('chat.empty.heading', 'How can I assist you today?')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs md:text-sm text-[var(--color-text-secondary)]"
              >
                {t('chat.empty.subheading', 'Select a suggested prompt below or write your own message. I can converse fluently in any of our 9 supported languages.')}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4">
              {suggestions.map((sug, idx) => {
                const Icon = sug.icon
                return (
                  <motion.div
                    key={sug.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, type: 'spring', stiffness: 100 }}
                    onClick={() => onSendMessage(sug.prompt)}
                    className={cn(
                      'p-4 rounded-2xl border bg-gradient-to-br cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group',
                      sug.color
                    )}
                  >
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center shadow-xs">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="font-bold text-xs text-[var(--color-text-primary)] group-hover:text-bridge-500 transition-colors">
                        {sug.label}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-3 font-medium">
                        "{sug.prompt}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-bridge-500 pt-2 opacity-0 group-hover:opacity-100 transition-opacity self-start">
                      <span>{t('chat.empty.tryThis', 'Send Prompt')}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Conversation Feed */
          <div className="space-y-1">
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onUpdate={onUpdateMessage}
                onDelete={onDeleteMessage}
                onFeedback={onFeedbackMessage}
                onBookmark={onBookmarkMessage}
                onRegenerate={onRegenerateMessage}
                onSpeak={onSpeakMessage}
                isSpeaking={speakingMessageId === msg.id}
              />
            ))}

            {/* Typing and Reasoning Indicators at Bottom */}
            {isLoading && (
              <div className="flex items-start gap-4 p-4 md:p-6 bg-[var(--color-surface-secondary)]/30 border-y border-[var(--color-border-default)]/50">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full bg-bridge-500/10 border border-bridge-500/20 flex items-center justify-center shadow-sm p-2">
                    <BridgeLogo className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {ai.reasoningMode && <ThinkingIndicator />}
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Scroll To Bottom Button */}
      <ScrollToBottom
        visible={showScrollBtn}
        onClick={() => scrollToBottom('smooth')}
        unreadCount={unreadCount}
      />
    </div>
  )
}
