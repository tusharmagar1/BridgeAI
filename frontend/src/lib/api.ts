import { API_BASE_URL } from './constants'
import { getClientId } from './clientId'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': getClientId(),
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.error || error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Conversations
  async createConversation(userId: string, title: string) {
    return this.request<{ success: boolean; data: { id: string } }>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId, title }),
    })
  }

  async getConversations(userId: string) {
    return this.request<{ success: boolean; data: unknown[] }>(`/chat/conversations/${userId}`)
  }

  async deleteAllConversations() {
    return this.request<{ success: boolean }>('/chat/conversations', {
      method: 'DELETE',
    })
  }

  async deleteConversation(id: string) {
    return this.request<{ success: boolean }>(`/chat/conversations/${id}`, {
      method: 'DELETE',
    })
  }

  async getMessages(conversationId: string) {
    return this.request<{ success: boolean; data: unknown[] }>(`/chat/conversations/${conversationId}/messages`)
  }

  // Chat streaming
  async streamChat(conversationId: string, message: string, aiConfig?: any, signal?: AbortSignal) {
    const response = await fetch(`${this.baseUrl}/chat/conversations/${conversationId}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Client-Id': getClientId(),
      },
      body: JSON.stringify({ message, aiConfig }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response
  }

  // Feedback
  async sendFeedback(messageId: string, feedback: number) {
    return this.request(`/chat/messages/${messageId}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
