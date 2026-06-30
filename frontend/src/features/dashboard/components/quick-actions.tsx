import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Plus, MessageSquare, Upload, Mic, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/store/chat-store'
import { Card, CardContent } from '@/components/ui/card'

export function QuickActions() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { conversations, setCurrentConversation } = useChatStore()

  const handleNewChat = () => {
    setCurrentConversation(null)
    navigate('/chat')
  }

  const handleContinueLast = () => {
    if (conversations.length > 0) {
      const lastChat = conversations[0]
      setCurrentConversation(lastChat.id)
      navigate(`/chat/${lastChat.id}`)
    } else {
      handleNewChat()
    }
  }

  const actions = [
    {
      id: 'new-chat',
      title: t('dashboard.actions.newChat.title', 'Start New Chat'),
      desc: t('dashboard.actions.newChat.desc', 'Begin a fresh conversation with the AI model'),
      icon: Plus,
      color: 'from-bridge-500 to-bridge-600',
      textColor: 'text-bridge-500',
      action: handleNewChat,
    },
    {
      id: 'continue-last',
      title: t('dashboard.actions.continue.title', 'Continue Last Chat'),
      desc: conversations.length > 0
        ? t('dashboard.actions.continue.descActive', 'Resume: "{{title}}"', { title: conversations[0].title })
        : t('dashboard.actions.continue.descEmpty', 'No recent chats. Start one now'),
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-500',
      action: handleContinueLast,
      disabled: conversations.length === 0,
    },

    {
      id: 'voice-mode',
      title: t('dashboard.actions.voice.title', 'Voice Conversation'),
      desc: t('dashboard.actions.voice.desc', 'Speak naturally using real-time voice recognition'),
      icon: Mic,
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-500',
      action: () => {
        setCurrentConversation(null)
        navigate('/chat', { state: { triggerVoice: true } })
      },
    },
  ]

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
        {t('dashboard.actions.heading', 'Quick Actions')}
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <motion.div
              key={act.id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card
                onClick={act.action}
                className="h-full cursor-pointer hover:border-bridge-500/30 hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-base text-[var(--color-text-primary)] group-hover:text-bridge-500 transition-colors">
                        {act.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                        {act.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-bridge-500 pt-2 self-start">
                    <span>{t('common.go', 'Go')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
