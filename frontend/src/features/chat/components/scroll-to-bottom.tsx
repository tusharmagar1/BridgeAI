import { ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScrollToBottomProps {
  visible: boolean
  onClick: () => void
  unreadCount?: number
}

export function ScrollToBottom({ visible, onClick, unreadCount = 0 }: ScrollToBottomProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="absolute bottom-24 right-6 z-30 p-3 rounded-full bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] shadow-lg hover:shadow-xl text-bridge-500 cursor-pointer flex items-center justify-center backdrop-blur-md"
        >
          <ArrowDown className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-bridge-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--color-surface-primary)] animate-pulse">
              {unreadCount}
            </span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
