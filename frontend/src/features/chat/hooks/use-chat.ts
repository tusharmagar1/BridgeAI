import { useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useChatStore } from '@/store/chat-store'
import { useSettingsStore } from '@/store/settings-store'
import { useAnalyticsStore } from '@/store/analytics-store'
import { useUIStore } from '@/store/ui-store'
import { Message, Conversation } from '@/types'
import { api } from '@/lib/api'
import { generateId } from '@/lib/utils'
import { getClientId } from '@/lib/clientId'

export function useChat() {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useUIStore()

  const justCreatedConversationId = useRef<string | null>(null)

  const {
    messages,
    conversations,
    isLoading,
    isStreaming,
    abortController,
    setMessages,
    addMessage,
    updateMessage,
    updateLastMessage,
    deleteMessage,
    setConversations,
    addConversation,
    updateConversation,
    deleteConversation,
    setCurrentConversation,
    setLoading,
    setStreaming,
    setError,
    setAbortController,
    stopGeneration,
  } = useChatStore()

  const { ai, uiLanguage, chatLanguage, autoDetectLanguage } = useSettingsStore()
  const { incrementMessages, addTokens, recordActivity } = useAnalyticsStore()

  // Load conversations once on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.getConversations(getClientId())
        if (res.success && Array.isArray(res.data)) {
          // Cast unknown[] to Conversation[]
          setConversations(res.data as Conversation[])
        }
      } catch (err) {
        console.error('Failed to load conversations:', err)
      }
    }
    fetchConversations()
  }, [setConversations])

  // Sync active conversation state on route changes
  useEffect(() => {
    const loadActiveConversation = async () => {
      if (conversationId) {
        if (justCreatedConversationId.current === conversationId) {
          justCreatedConversationId.current = null
          setCurrentConversation(conversationId)
          return
        }
        setCurrentConversation(conversationId)
        setLoading(true)
        try {
          const res = await api.getMessages(conversationId)
          if (res.success && Array.isArray(res.data)) {
            setMessages(res.data as Message[])
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load messages')
          addToast({
            type: 'error',
            title: 'Error loading messages',
            description: 'Could not fetch conversation history from server.',
          })
        } finally {
          setLoading(false)
        }
      } else {
        setCurrentConversation(null)
        setMessages([])
      }
    }
    loadActiveConversation()
  }, [conversationId, location.key, setCurrentConversation, setMessages, setLoading, setError, addToast])

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      let activeId = conversationId

      // 1. Create a new conversation on the backend if none is active
      if (!activeId) {
        setLoading(true)
        try {
          const title = content.trim().slice(0, 30) || 'New Chat'
          const res = await api.createConversation(getClientId(), title)
          if (res.success && res.data?.id) {
            activeId = res.data.id
            const newConv: Conversation = {
              id: activeId,
              userId: getClientId(),
              title,
              locale: uiLanguage,
              status: 'active',
              isFavorite: false,
              isPinned: false,
              isShared: false,
              messageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            addConversation(newConv)
            justCreatedConversationId.current = activeId
            // Navigate to the new conversation URL
            navigate(`/chat/${activeId}`, { replace: true })
          } else {
            throw new Error('No ID returned from server')
          }
        } catch (err) {
          setLoading(false)
          addToast({
            type: 'error',
            title: 'Failed to create chat',
            description: 'Could not initialize a new conversation session.',
          })
          return
        }
      }

      if (!activeId) return

      // 2. Append the User Message
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
        feedback: 0,
      }
      addMessage(userMsg)
      incrementMessages()

      // 3. Setup assistant empty placeholder message for streaming
      const assistantMsgId = generateId()
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        model: ai.model.split('-')[0].toUpperCase(),
        createdAt: new Date().toISOString(),
        feedback: 0,
      }
      addMessage(assistantMsg)

      setLoading(true)
      setStreaming(true)
      setError(null)

      const controller = new AbortController()
      setAbortController(controller)

      try {
        // Send stream request
        const response = await api.streamChat(
          activeId,
          content,
          { ...ai, chatLanguage, autoDetectLanguage },
          controller.signal
        )

        if (!response.body) {
          throw new Error('No response stream body available')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let hasData = false
        let tokensUsed = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          if (!hasData) {
            hasData = true
            setLoading(false) // turn off loading spinner once first token arrives
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const cleanLine = line.trim()
            if (cleanLine.startsWith('data: ')) {
              const dataText = cleanLine.slice(6).trim()
              if (dataText === '[DONE]') continue
              try {
                const event = JSON.parse(dataText)
                if (event.type === 'token') {
                  updateLastMessage(event.content)
                } else if (event.type === 'done') {
                  // Update final message metadata: latency, tokens, etc.
                  updateMessage(assistantMsgId, {
                    latencyMs: event.latencyMs,
                    tokensUsed: event.tokensUsed,
                    model: event.model,
                  })
                  if (event.tokensUsed) {
                    addTokens(event.tokensUsed)
                    tokensUsed = event.tokensUsed
                  }
                } else if (event.type === 'error') {
                  throw new Error(event.message || 'Stream error event received')
                }
              } catch (parseErr) {
                // Ignore parse errors from chunk anomalies
              }
            }
          }
        }

        // Increment message count for assistant
        incrementMessages()
        // Record activity for today
        recordActivity(2, tokensUsed)

        // Update the conversation's last message & update time in store
        const lastContent = useChatStore.getState().messages.find(m => m.id === assistantMsgId)?.content || ''
        updateConversation(activeId, {
          lastMessage: lastContent.slice(0, 60),
          messageCount: (conversations.find(c => c.id === activeId)?.messageCount || 0) + 2,
          updatedAt: new Date().toISOString(),
        })

      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Stream aborted by user.')
        } else {
          setError(err.message || 'Error occurred while streaming response')
          updateMessage(assistantMsgId, {
            content: `\n\n*Error: ${err.message || 'Failed to connect to the AI model. Please verify your server connection.'}*`
          })
          addToast({
            type: 'error',
            title: 'Streaming Error',
            description: err.message || 'Connection interrupted.',
          })
        }
      } finally {
        setLoading(false)
        setStreaming(false)
        setAbortController(null)
      }
    },
    [
      conversationId,
      conversations,
      ai,
      uiLanguage,
      addConversation,
      addMessage,
      updateMessage,
      updateLastMessage,
      setLoading,
      setStreaming,
      setError,
      setAbortController,
      addToast,
      navigate,
      incrementMessages,
      addTokens,
      updateConversation,
      recordActivity,
    ]
  )

  // Edit a message (resends user message and regenerates response)
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!conversationId) return

      // Find index of the edited message
      const msgIndex = messages.findIndex((m) => m.id === messageId)
      if (msgIndex === -1) return

      // Truncate message history up to this message, and set content
      const truncatedHistory = messages.slice(0, msgIndex)
      setMessages(truncatedHistory)

      // Re-trigger send message
      await sendMessage(newContent)
    },
    [conversationId, messages, setMessages, sendMessage]
  )

  // Regenerate response
  const regenerateResponse = useCallback(
    async (messageId: string) => {
      if (!conversationId) return

      // Find index of the assistant message to regenerate
      const msgIndex = messages.findIndex((m) => m.id === messageId)
      if (msgIndex === -1) return

      // Get the user prompt (which should be the message right before)
      const userPromptMsg = messages[msgIndex - 1]
      if (!userPromptMsg || userPromptMsg.role !== 'user') return

      // Truncate message history up to the user message
      const truncatedHistory = messages.slice(0, msgIndex)
      setMessages(truncatedHistory)

      // Re-trigger assistant generation
      await sendMessage(userPromptMsg.content)
    },
    [conversationId, messages, setMessages, sendMessage]
  )

  // Delete message
  const deleteMessageCallback = useCallback(
    (id: string) => {
      deleteMessage(id)
      addToast({
        type: 'info',
        title: 'Message deleted',
        duration: 2000,
      })
    },
    [deleteMessage, addToast]
  )

  // Update feedback thumbs
  const feedbackMessage = useCallback(
    async (messageId: string, value: number) => {
      updateMessage(messageId, { feedback: value })
      try {
        await api.sendFeedback(messageId, value)
      } catch (err) {
        console.error('Failed to submit feedback to server:', err)
      }
    },
    [updateMessage]
  )

  // Bookmark message
  const bookmarkMessage = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId)
      if (!msg) return
      const updatedVal = !msg.isBookmarked
      updateMessage(messageId, { isBookmarked: updatedVal })
      addToast({
        type: 'success',
        title: updatedVal ? 'Added to Bookmarks' : 'Removed from Bookmarks',
        duration: 2000,
      })
    },
    [messages, updateMessage, addToast]
  )

  return {
    conversation: conversations.find((c) => c.id === conversationId) || null,
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    editMessage,
    deleteMessage: deleteMessageCallback,
    feedbackMessage,
    bookmarkMessage,
    regenerateResponse,
    stopGeneration,
  }
}
