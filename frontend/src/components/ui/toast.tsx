import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import type { Toast as ToastType } from '@/types'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
  info: 'border-bridge-500/30 bg-bridge-500/10 text-bridge-600 dark:text-bridge-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useUIStore()
  const Icon = icons[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-[var(--shadow-elevated)] bg-[var(--color-surface-primary)] ${colors[toast.type]} max-w-sm`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-0.5 rounded hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts } = useUIStore()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
