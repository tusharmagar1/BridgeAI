import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export function WelcomeScreen() {
  const { t } = useTranslation()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting(t('dashboard.welcome.morning', 'Good morning'))
    } else if (hour < 18) {
      setGreeting(t('dashboard.welcome.afternoon', 'Good afternoon'))
    } else {
      setGreeting(t('dashboard.welcome.evening', 'Good evening'))
    }
  }, [t])

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bridge-500/10 via-bridge-600/5 to-transparent p-8 md:p-12 border border-bridge-500/10 shadow-lg">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-bridge-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bridge-500/10 text-bridge-500 border border-bridge-500/20 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('dashboard.welcome.tag', 'AI Chatbot Companion')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)]"
          >
            {greeting}, <span className="bg-gradient-to-r from-bridge-500 to-emerald-500 bg-clip-text text-transparent">Explorer</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed"
          >
            {t('dashboard.welcome.subtitle', 'I am here to assist you with intelligent, multilingual conversations. How can I help you today?')}
          </motion.p>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
          className="flex-shrink-0 flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-bridge-500 to-emerald-500 p-[2px] shadow-xl hover:scale-105 transition-transform duration-300"
        >
          <div className="w-full h-full rounded-[22px] bg-[var(--color-surface-primary)] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-bridge-500/20 to-emerald-500/20" />
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg className="w-12 h-12 md:w-16 md:h-16 text-bridge-500" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C8.268 2 2 8.268 2 16C2 19.868 3.567 23.37 6.1 25.9L4 30L9.1 27.9C11.166 29.231 13.518 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z" fill="currentColor" fillOpacity="0.1" />
                <path d="M10 13C10 11.3431 11.3431 10 13 10H19C20.6569 10 22 11.3431 22 13V19C22 20.6569 20.6569 22 19 22H13C11.3431 22 10 20.6569 10 19V13Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 14H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M13 18H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
