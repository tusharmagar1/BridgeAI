import { useState } from 'react'
import { Copy, Check, ThumbsUp, ThumbsDown, Volume2, RotateCw, Trash2, Edit3, Bookmark, BookmarkCheck, Play, Pause, Square } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAudioStore } from '@/store/useAudioStore'
import { audioEngine } from '@/lib/audio/AudioEngine'

interface MessageActionsProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  feedback: number
  isBookmarked?: boolean
  onFeedback: (val: number) => void
  onBookmark?: () => void
  onRegenerate?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSpeak?: () => void
  isSpeaking?: boolean
}

export function MessageActions({
  role,
  content,
  feedback,
  isBookmarked = false,
  onFeedback,
  onBookmark,
  onRegenerate,
  onEdit,
  onDelete,
  onSpeak,
  isSpeaking = false,
}: MessageActionsProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const playbackState = useAudioStore((state) => state.playbackState)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 5 },
    visible: { opacity: 1, scale: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-2 p-1.5 sm:gap-1 sm:p-1 rounded-2xl sm:rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-primary)] shadow-md backdrop-blur-md max-w-fit pointer-events-auto"
    >
      {/* Copy Action */}
      <button
        onClick={handleCopy}
        className="p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-bridge-500 cursor-pointer transition-colors"
        title={t('chat.actions.copy', 'Copy')}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Speak Actions (Read / Pause / Resume / Stop) */}
      {onSpeak && (
        <div className="flex items-center">
          {!isSpeaking || playbackState === 'idle' ? (
            <button
              onClick={onSpeak}
              className="p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-bridge-500 cursor-pointer transition-colors flex items-center justify-center"
              title={t('chat.actions.read', 'Read')}
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              {playbackState === 'playing' ? (
                <button
                  onClick={() => audioEngine.pause()}
                  className="p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] text-bridge-500 cursor-pointer transition-colors flex items-center justify-center"
                  title={t('chat.actions.pause', 'Pause')}
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => audioEngine.resume()}
                  className="p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] text-bridge-500 cursor-pointer transition-colors flex items-center justify-center"
                  title={t('chat.actions.resume', 'Resume')}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
              <button
                onClick={() => audioEngine.stop()}
                className="p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] text-rose-500 cursor-pointer transition-colors flex items-center justify-center"
                title={t('chat.actions.stop', 'Stop')}
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Bookmark Action */}
      {onBookmark && (
        <button
          onClick={onBookmark}
          className={cn(
            'p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] cursor-pointer transition-colors',
            isBookmarked ? 'text-amber-500' : 'text-[var(--color-text-secondary)] hover:text-amber-500'
          )}
          title={t('chat.actions.bookmark', 'Bookmark')}
        >
          {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* User Actions */}
      {role === 'user' && onEdit && (
        <button
          onClick={onEdit}
          className="p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-bridge-500 cursor-pointer transition-colors"
          title={t('chat.actions.edit', 'Edit')}
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Assistant Actions */}
      {role === 'assistant' && (
        <>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-bridge-500 cursor-pointer transition-colors"
              title={t('chat.actions.regenerate', 'Regenerate')}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Feedback Thumbs */}
          <div className="h-4 w-[1px] bg-[var(--color-border-default)] mx-1" />

          <button
            onClick={() => onFeedback(feedback === 1 ? 0 : 1)}
            className={cn(
              'p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] cursor-pointer transition-colors',
              feedback === 1 ? 'text-emerald-500 bg-emerald-500/10' : 'text-[var(--color-text-secondary)] hover:text-emerald-500'
            )}
            title={t('chat.actions.goodResponse', 'Good response')}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onFeedback(feedback === -1 ? 0 : -1)}
            className={cn(
              'p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-[var(--color-surface-secondary)] cursor-pointer transition-colors',
              feedback === -1 ? 'text-rose-500 bg-rose-500/10' : 'text-[var(--color-text-secondary)] hover:text-rose-500'
            )}
            title={t('chat.actions.badResponse', 'Bad response')}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {/* Common Delete Action */}
      {onDelete && (
        <>
          <div className="h-4 w-[1px] bg-[var(--color-border-default)] mx-1" />
          <button
            onClick={onDelete}
            className="p-3 sm:p-1.5 rounded-xl sm:rounded-lg hover:bg-rose-500/10 text-[var(--color-text-secondary)] hover:text-rose-500 cursor-pointer transition-colors"
            title={t('chat.actions.delete', 'Delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </motion.div>
  )
}
