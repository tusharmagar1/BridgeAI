import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Calendar, Star, ArrowRight, Languages } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/store/chat-store'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { SUPPORTED_LANGUAGES } from '@/types'

export function RecentChats() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { conversations, setCurrentConversation } = useChatStore()

  // Filter out archived/deleted chats and sort by updated time
  const activeChats = conversations
    .filter((c) => c.status === 'active')
    .sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      const validA = isNaN(timeA) ? 0 : timeA
      const validB = isNaN(timeB) ? 0 : timeB
      return validB - validA
    })
    .slice(0, 3)

  const handleChatClick = (id: string) => {
    setCurrentConversation(id)
    navigate(`/chat/${id}`)
  };

  const getLanguageFlag = (localeCode: string) => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === localeCode)
    return lang ? `${lang.flag} ${lang.name}` : localeCode.toUpperCase()
  }

  return (
    <Card className="h-full border border-[var(--color-border-default)] hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-bridge-500" />
              <span>{t('dashboard.recent.heading', 'Recent Chats')}</span>
            </h2>
            {conversations.length > 3 && (
              <button
                onClick={() => navigate('/chat')}
                className="text-xs font-semibold text-bridge-500 hover:text-bridge-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{t('common.viewAll', 'View All')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {activeChats.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t('dashboard.recent.empty', 'No recent conversations')}
                </p>
                <button
                  onClick={() => {
                    setCurrentConversation(null)
                    navigate('/chat')
                  }}
                  className="text-xs font-bold text-bridge-500 hover:underline cursor-pointer"
                >
                  {t('dashboard.recent.startFirst', 'Create one now')}
                </button>
              </div>
            ) : (
              activeChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ x: 3 }}
                  onClick={() => handleChatClick(chat.id)}
                  className="p-3 rounded-xl border border-[var(--color-border-default)] hover:border-bridge-500/20 hover:bg-bridge-500/5 cursor-pointer transition-all duration-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--color-text-primary)] truncate block">
                        {chat.title}
                      </span>
                      {chat.isFavorite && (
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {chat.lastMessage || t('dashboard.recent.noMessages', 'Empty chat')}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] text-[var(--color-text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {(() => {
                          try {
                            if (!chat.updatedAt) return 'recent'
                            const d = new Date(chat.updatedAt)
                            return isNaN(d.getTime()) ? 'recent' : formatDistanceToNow(d, { addSuffix: true })
                          } catch {
                            return 'recent'
                          }
                        })()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        {getLanguageFlag(chat.locale)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
