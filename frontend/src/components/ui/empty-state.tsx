import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.25, type: 'spring', stiffness: 100 }}
      className={`flex flex-col items-center justify-center text-center glass border border-[var(--color-border-default)] rounded-2xl ${
        compact ? 'p-4 space-y-2' : 'p-8 md:p-12 space-y-4 max-w-md mx-auto my-6'
      }`}
    >
      <div className={`rounded-2xl bg-gradient-to-br from-bridge-500/10 to-bridge-600/10 text-bridge-500 flex items-center justify-center border border-bridge-500/20 shadow-xs ${
        compact ? 'w-10 h-10' : 'w-16 h-16'
      }`}>
        <Icon className={compact ? 'w-5 h-5' : 'w-8 h-8'} />
      </div>

      <div className="space-y-1.5">
        <h3 className={`font-bold text-[var(--color-text-primary)] ${compact ? 'text-xs' : 'text-sm md:text-base'}`}>
          {title}
        </h3>
        <p className={`text-[var(--color-text-secondary)] leading-relaxed font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className={compact ? 'pt-1' : 'pt-2'}>
          <Button
            onClick={onAction}
            size={compact ? 'sm' : 'default'}
            className="font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
