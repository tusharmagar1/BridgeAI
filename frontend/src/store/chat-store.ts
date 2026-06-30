import { create } from 'zustand'
import { Message, Conversation, Folder } from '@/types'
import { api } from '@/lib/api'
import { useUIStore } from '@/store/ui-store'

interface ChatState {
  // Data
  messages: Message[]
  conversations: Conversation[]
  folders: Folder[]
  currentConversationId: string | null
  searchQuery: string

  // Status
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  abortController: AbortController | null

  // Actions — Messages
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  updateLastMessage: (content: string) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void

  // Actions — Conversations
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  deleteConversation: (id: string) => Promise<void>
  setCurrentConversation: (id: string | null) => void
  setSearchQuery: (query: string) => void
  deleteAllConversations: () => void

  // Actions — Folders
  addFolder: (folder: Folder) => void
  deleteFolder: (id: string) => void

  // Actions — Status
  setLoading: (loading: boolean) => void
  setStreaming: (streaming: boolean) => void
  setError: (error: string | null) => void
  setAbortController: (controller: AbortController | null) => void
  stopGeneration: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  conversations: [],
  folders: [],
  currentConversationId: null,
  searchQuery: '',
  isLoading: false,
  isStreaming: false,
  error: null,
  abortController: null,

  // Messages
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  updateMessage: (id, updates) => set((s) => ({
    messages: s.messages.map((m) => m.id === id ? { ...m, ...updates } : m),
  })),
  updateLastMessage: (content) => set((s) => {
    const messages = [...s.messages]
    const lastIdx = messages.length - 1
    if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
      messages[lastIdx] = { ...messages[lastIdx], content: messages[lastIdx].content + content }
    }
    return { messages }
  }),
  deleteMessage: (id) => set((s) => ({
    messages: s.messages.filter((m) => m.id !== id),
  })),
  clearMessages: () => set({ messages: [] }),

  // Conversations
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) => set((s) => ({
    conversations: [conversation, ...s.conversations],
  })),
  updateConversation: (id, updates) => set((s) => ({
    conversations: s.conversations.map((c) => c.id === id ? { ...c, ...updates } : c),
  })),
  deleteConversation: async (id) => {
    const previousConversations = get().conversations;
    const previousCurrentId = get().currentConversationId;

    // Optimistically update the UI
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      currentConversationId: s.currentConversationId === id ? null : s.currentConversationId,
    }));

    try {
      await api.deleteConversation(id);
      useUIStore.getState().addToast({
        title: 'Conversation deleted permanently.',
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      
      // Rollback on failure
      set({
        conversations: previousConversations,
        currentConversationId: previousCurrentId
      });

      useUIStore.getState().addToast({
        title: 'Failed to delete conversation. Please try again.',
        type: 'error',
        duration: 4000
      });
    }
  },
  setCurrentConversation: (id) => set({ currentConversationId: id }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  deleteAllConversations: () => set({ conversations: [], currentConversationId: null }),

  // Folders
  addFolder: (folder) => set((s) => ({ folders: [...s.folders, folder] })),
  deleteFolder: (id) => set((s) => ({
    folders: s.folders.filter((f) => f.id !== id),
  })),

  // Status
  setLoading: (isLoading) => set({ isLoading }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setError: (error) => set({ error }),
  setAbortController: (abortController) => set({ abortController }),
  stopGeneration: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
      set({ abortController: null, isStreaming: false, isLoading: false })
    }
  },
}))
