import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BridgeLogo } from '@/components/ui/bridge-logo'

export function ThinkingIndicator() {
  const { t } = useTranslation()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-bridge-500/10 bg-gradient-to-r from-bridge-500/5 via-bridge-600/5 to-transparent max-w-fit shadow-sm">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-bridge-500 flex items-center justify-center w-5 h-5"
        >
          <BridgeLogo className="w-5 h-5" />
        </motion.div>
        <div className="absolute -top-1 -right-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-emerald-500"
          >
            <Sparkles className="w-2.5 h-2.5" />
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-[var(--color-text-primary)]">
          {t('chat.thinking', 'Thinking...')}
        </span>
        <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums">
          {t('chat.elapsedTime', 'Reasoned for {{seconds}}s', { seconds })}
        </span>
      </div>
    </div>
  )
}
