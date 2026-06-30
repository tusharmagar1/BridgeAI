import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ChatPanel } from './components/chat-panel'
import { ChatInput } from './components/chat-input'
import { AIControls } from './components/ai-controls'
import { useChat } from './hooks/use-chat'
import { useUIStore } from '@/store/ui-store'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settings-store'
import { useAudioStore } from '@/store/useAudioStore'
import { audioEngine } from '@/lib/audio/AudioEngine'
import { processTextForTTS } from '@/lib/text/textProcessor'

export default function ChatPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const { setAIControlsOpen } = useUIStore()
  const { uiLanguage, voice: voiceSettings } = useSettingsStore()

  const {
    conversation,
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    editMessage,
    deleteMessage,
    feedbackMessage,
    bookmarkMessage,
    regenerateResponse,
    stopGeneration,
  } = useChat()

  const [voiceActive, setVoiceActive] = useState(false)
  const currentTrackId = useAudioStore(state => state.currentTrackId)

  // Handle trigger actions passed through route navigation state (e.g. from Dashboard click)
  useEffect(() => {
    const state = location.state as { triggerVoice?: boolean } | null
    if (state?.triggerVoice) {
      handleVoiceToggle()
    }
    // Clear location state to prevent repeat triggers on reload
    window.history.replaceState({}, document.title)
  }, [location])

  const lastAutoReadId = useRef<string | null>(null)

  useEffect(() => {
    if (!isStreaming && voiceSettings.autoRead && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant' && lastMessage.content && lastMessage.id !== lastAutoReadId.current) {
        lastAutoReadId.current = lastMessage.id
        handleSpeakMessage(lastMessage.id, lastMessage.content, lastMessage.language)
      }
    }
  }, [messages, isStreaming, voiceSettings.autoRead])

  const handleSpeakMessage = (id: string, text: string, msgLanguage?: string) => {
    const store = useAudioStore.getState()
    
    // Toggle play/pause if clicking the same message
    if (store.currentTrackId === id) {
      if (store.playbackState === 'playing') {
        audioEngine.pause()
      } else {
        audioEngine.resume()
      }
      return
    }

    // Otherwise play new message
    audioEngine.play(id, text, msgLanguage)
  }

  // Wrapper functions to stop speaking immediately when user interacts
  const handleSendMessage = (text: string) => {
    audioEngine.stop()
    sendMessage(text)
  }

  const handleEditMessage = (id: string, text: string) => {
    audioEngine.stop()
    editMessage(id, text)
  }

  const handleRegenerate = (messageId: string) => {
    audioEngine.stop()
    regenerateResponse(messageId)
  }

  // Simple Speech Recognition voice input recorder
  const handleVoiceToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert(t('voice.recognitionUnsupported', 'Speech recognition is not supported in this browser.'))
      return
    }

    if (voiceActive) {
      setVoiceActive(false)
      // Stop recognition
    } else {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US' // Can pull from settings default language

      recognition.onstart = () => {
        setVoiceActive(true)
      }

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript
        if (resultText.trim()) {
          sendMessage(resultText)
        }
      }

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err)
        setVoiceActive(false)
      }

      recognition.onend = () => {
        setVoiceActive(false)
      }

      recognition.start()
    }
  }

  // Cancel speech syntheses on page changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      {/* Messages Feed View */}
      <ChatPanel
        conversation={conversation}
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onSendMessage={handleSendMessage}
        onUpdateMessage={handleEditMessage}
        onDeleteMessage={deleteMessage}
        onFeedbackMessage={feedbackMessage}
        onBookmarkMessage={bookmarkMessage}
        onRegenerateMessage={handleRegenerate}
        onSpeakMessage={handleSpeakMessage}
        speakingMessageId={currentTrackId}
      />

      {/* Input Composer Panel */}
      <ChatInput
        onSend={handleSendMessage}
        onStop={stopGeneration}
        isStreaming={isStreaming}
        triggerVoiceActive={voiceActive}
        onVoiceToggle={handleVoiceToggle}
      />

      {/* Parameter Settings Slider Drawer Overlay */}
      <AIControls />
    </div>
  )
}
