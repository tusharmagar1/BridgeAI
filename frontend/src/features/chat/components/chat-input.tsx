import React, { useState, useRef, useEffect } from 'react'
import { Send, Square, Paperclip, Mic, Sparkles, X, ChevronUp, Command, HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '@/store/chat-store'
import { SLASH_COMMANDS, PROMPT_TEMPLATES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatInputProps {
  onSend: (content: string, attachments?: File[]) => void
  onStop: () => void
  isStreaming: boolean
  triggerVoiceActive?: boolean
  onVoiceToggle?: () => void
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  triggerVoiceActive = false,
  onVoiceToggle,
}: ChatInputProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashSearch, setSlashSearch] = useState('')
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const placeholders = [
    t('chat.placeholder.1', 'Ask me to write, explain, or code...'),
    t('chat.placeholder.2', 'Translate text into another language...'),
    t('chat.placeholder.3', 'Type /summarize to shorten conversations...'),
    t('chat.placeholder.4', 'How do I center a div in Tailwind?'),
  ]

  // Rotate placeholders
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [placeholders.length])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 200)
    textarea.style.height = `${newHeight}px`
  }, [content])

  // Handle key down (Send on Enter, new line on Shift+Enter, navigate slash commands)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu) {
      const filtered = SLASH_COMMANDS.filter((cmd) =>
        cmd.command.toLowerCase().includes(slashSearch.toLowerCase())
      )

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSlashIndex((prev) => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedSlashIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedSlashIndex]) {
          applySlashCommand(filtered[selectedSlashIndex].command)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowSlashMenu(false)
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)

    // Detect slash command trigger
    const words = val.split(' ')
    const lastWord = words[words.length - 1]

    if (lastWord.startsWith('/')) {
      setShowSlashMenu(true)
      setSlashSearch(lastWord)
      setSelectedSlashIndex(0)
    } else {
      setShowSlashMenu(false)
    }
  }

  const applySlashCommand = (command: string) => {
    const words = content.split(' ')
    words.pop() // remove the partial slash search word
    const newContent = [...words, `${command} `].join(' ').trimStart()
    setContent(newContent)
    setShowSlashMenu(false)
    textareaRef.current?.focus()
  }

  const applyTemplate = (prompt: string) => {
    setContent((prev) => `${prev}${prompt}`)
    setShowTemplates(false)
    textareaRef.current?.focus()
  }

  const handleSubmit = () => {
    if (isStreaming) {
      onStop()
      return
    }

    if (!content.trim() && attachments.length === 0) return

    onSend(content, attachments)
    setContent('')
    setAttachments([])

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...files].slice(0, 3)) // Max 3 files
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Calculate estimated tokens
  const charCount = content.length
  const estTokens = Math.ceil(charCount / 4)

  const filteredSlashCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.command.toLowerCase().includes(slashSearch.toLowerCase())
  )

  return (
    <div className="relative border-t border-[var(--color-border-default)] bg-[var(--color-surface-primary)] p-4 md:px-6">
      {/* File Upload / Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-3">
            {attachments.map((file, idx) => (
              <motion.div
                key={`${file.name}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-secondary)] font-medium max-w-[200px]"
              >
                <span className="truncate">{file.name}</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="p-0.5 rounded-full hover:bg-[var(--color-border-default)] text-[var(--color-text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Templates Popup Menu */}
      <AnimatePresence>
        {showTemplates && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-20 left-4 z-20 w-72 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-primary)] p-2 shadow-2xl space-y-1 max-h-64 overflow-y-auto"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-bridge-500" />
                <span>{t('chat.input.templates', 'Prompt Templates')}</span>
              </div>
              {PROMPT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  onClick={() => applyTemplate(tmpl.prompt)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] font-medium cursor-pointer transition-colors block truncate"
                >
                  {tmpl.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slash Commands Dropdown Menu */}
      <AnimatePresence>
        {showSlashMenu && filteredSlashCommands.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSlashMenu(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-20 left-4 z-20 w-64 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-primary)] p-2 shadow-2xl space-y-0.5"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider flex items-center gap-1 border-b border-[var(--color-border-default)] pb-1 mb-1">
                <Command className="w-3 h-3 text-bridge-500" />
                <span>{t('chat.input.shortcuts', 'Command Menu')}</span>
              </div>
              {filteredSlashCommands.map((cmd, idx) => (
                <button
                  key={cmd.command}
                  onClick={() => applySlashCommand(cmd.command)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors',
                    selectedSlashIndex === idx
                      ? 'bg-bridge-500/10 text-bridge-500'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cmd.icon}</span>
                    <span>{cmd.command}</span>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-normal">{cmd.description}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Composer Input Box wrapper */}
      <div className="relative rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/50 focus-within:border-bridge-500 focus-within:bg-[var(--color-surface-primary)] focus-within:shadow-[0_0_0_1px_var(--color-bridge-500)] shadow-xs transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholders[placeholderIndex]}
          className="w-full bg-transparent pl-4 pr-16 py-3.5 outline-none resize-none text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] leading-relaxed font-sans min-h-[48px] max-h-[200px]"
        />

        {/* Toolbar Buttons Inside Input Container */}
        <div className="absolute right-3 bottom-2.5 flex items-center gap-1">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-bridge-500 hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer"
            title={t('chat.input.attach', 'Attach Files')}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />

          {/* Voice transcription mode */}
          {onVoiceToggle && (
            <button
              onClick={onVoiceToggle}
              className={cn(
                'p-2 rounded-xl hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer',
                triggerVoiceActive
                  ? 'text-pink-500 bg-pink-500/10 animate-pulse'
                  : 'text-[var(--color-text-secondary)] hover:text-pink-500'
              )}
              title={t('chat.input.voice', 'Voice Input')}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          {/* Send / Stop button */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() && !isStreaming}
            className={cn(
              'p-2 rounded-xl text-white transition-all cursor-pointer shadow-sm',
              isStreaming
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-bridge-500 hover:bg-bridge-600 disabled:opacity-50 disabled:bg-[var(--color-border-default)] disabled:text-[var(--color-text-tertiary)] disabled:shadow-none'
            )}
            title={isStreaming ? t('chat.input.stop', 'Stop Generating') : t('chat.input.send', 'Send')}
          >
            {isStreaming ? <Square className="w-4 h-4 fill-white" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Footer bar for helpers/token stats */}
      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)] font-semibold mt-2 px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1 text-bridge-500 hover:text-bridge-600 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{t('chat.input.templatesBtn', 'Use Template')}</span>
          </button>
          <span className="flex items-center gap-0.5">
            <Command className="w-3 h-3" />
            <span>{t('chat.input.keyboardHint', 'Press Enter to Send')}</span>
          </span>
        </div>
        {content.trim() && (
          <div className="flex items-center gap-2 font-mono text-[9px]">
            <span>{t('chat.input.chars', 'Chars: {{charCount}}', { charCount })}</span>
            <span>|</span>
            <span>{t('chat.input.tokens', 'Est. Tokens: {{estTokens}}', { estTokens })}</span>
          </div>
        )}
      </div>
    </div>
  )
}
