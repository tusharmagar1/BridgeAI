import { useState } from 'react'
import { Message } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MarkdownRenderer } from './markdown-renderer'
import { MessageActions } from './message-actions'
import { Brain, User, Sparkles, Check, X, Clock, Flame } from 'lucide-react'
import { BridgeLogo } from '@/components/ui/bridge-logo'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useIsMobile } from '@/hooks/use-media-query'

interface MessageBubbleProps {
  message: Message
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onFeedback: (id: string, val: number) => void
  onBookmark?: (id: string) => void
  onRegenerate?: (id: string) => void
  onSpeak?: (id: string, text: string, language?: string) => void
  isSpeaking?: boolean
}

export function MessageBubble({
  message,
  onUpdate,
  onDelete,
  onFeedback,
  onBookmark,
  onRegenerate,
  onSpeak,
  isSpeaking = false,
}: MessageBubbleProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useIsMobile()

  const isUser = message.role === 'user'

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onUpdate(message.id, editContent)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative flex w-full gap-3 p-3.5 md:p-6 transition-colors',
        isUser
          ? 'bg-transparent flex-row-reverse'
          : 'bg-[var(--color-surface-secondary)]/30 border-y border-[var(--color-border-default)]/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (isMobile) {
          const target = e.target as HTMLElement
          if (!target.closest('button') && !target.closest('a') && !target.closest('textarea')) {
            setIsHovered(!isHovered)
          }
        }
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={cn('w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 shadow-sm', isUser ? 'ring-1 ring-bridge-500/20' : 'bg-bridge-500/10 border border-bridge-500/20 flex items-center justify-center rounded-full')}>
          {isUser ? (
            <>
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-bridge-500 to-bridge-600 w-full h-full flex items-center justify-center rounded-full">
                <User className="w-5 h-5 text-white" />
              </AvatarFallback>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <BridgeLogo className="w-full h-full object-contain" />
            </div>
          )}
        </Avatar>
      </div>

      {/* Message Content Container */}
      <div className={cn('flex flex-col max-w-[85%] sm:max-w-[75%] space-y-1.5', isUser ? 'items-end' : 'items-start')}>
        {/* Name and Meta header */}
        {isUser ? (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] font-medium">
            <span className="font-semibold text-[var(--color-text-secondary)]">
              {t('chat.user', 'You')}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-0.5 select-none">
            <span className="font-bold text-sm text-[var(--color-text-primary)] leading-none">
              BridgeAI
            </span>
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium flex items-center gap-1.5 mt-0.5">
              <span>AI Assistant • {(() => {
                if (!message.model) return 'Llama 3.3 70B';
                const lower = message.model.toLowerCase();
                if (lower.includes('3.3')) return 'Llama 3.3 70B';
                if (lower.includes('3.1')) return 'Llama 3.1 8B';
                if (lower.includes('mixtral')) return 'Mixtral 8x7B';
                if (lower.includes('gemma')) return 'Gemma 2 9B';
                return 'Llama 3.3 70B';
              })()}</span>
              {message.latencyMs && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {(message.latencyMs / 1000).toFixed(2)}s
                  </span>
                </>
              )}
              {message.tokensUsed && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 text-amber-500" />
                    {message.tokensUsed}T
                  </span>
                </>
              )}
              {message.language && (
                <>
                  <span>•</span>
                  <span className="px-1 py-0.2 rounded bg-[var(--color-border-default)] text-[8px] uppercase tracking-wide font-bold">
                    {message.language}
                  </span>
                </>
              )}
            </span>
          </div>
        )}

        {/* Content Bubble / Edit box */}
        {isEditing ? (
          <div className="w-full space-y-2 mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[80px] p-3 rounded-xl border border-bridge-500 focus:outline-none bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] text-sm shadow-inner resize-y leading-relaxed font-sans"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-border-default)] hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] cursor-pointer text-xs font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('common.cancel', 'Cancel')}</span>
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bridge-500 hover:bg-bridge-600 text-white cursor-pointer text-xs font-semibold transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('common.save', 'Save')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'rounded-2xl p-3.5 md:p-4 text-sm leading-relaxed shadow-xs',
              isUser
                ? 'bg-gradient-to-br from-bridge-500 to-bridge-600 text-white rounded-tr-none shadow-bridge-500/10'
                : 'bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] rounded-tl-none prose prose-zinc dark:prose-invert max-w-none'
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap font-sans">{message.content}</p>
            ) : message.content === '' ? (
              // Empty message placeholder (during streaming or thinking)
              <div className="flex items-center gap-1.5 py-1 text-[var(--color-text-tertiary)]">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-xs animate-pulse font-medium">{t('chat.loadingText', 'Writing response...')}</span>
              </div>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>
        )}
      </div>

      {/* Floating Action Menu (visible on hover) */}
      {!isEditing && (isHovered || isSpeaking) && (
        <div
          className={cn(
            'absolute bottom-[-16px] z-10',
            isUser ? 'left-6 md:left-24' : 'right-6 md:right-24'
          )}
        >
          <MessageActions
            role={message.role}
            content={message.content}
            feedback={message.feedback}
            isBookmarked={message.isBookmarked}
            onFeedback={(val) => onFeedback(message.id, val)}
            onBookmark={onBookmark ? () => onBookmark(message.id) : undefined}
            onRegenerate={onRegenerate && !isUser ? () => onRegenerate(message.id) : undefined}
            onEdit={isUser ? () => setIsEditing(true) : undefined}
            onDelete={() => onDelete(message.id)}
            onSpeak={onSpeak ? () => onSpeak(message.id, message.content, message.language) : undefined}
            isSpeaking={isSpeaking}
          />
        </div>
      )}
    </motion.div>
  )
}
