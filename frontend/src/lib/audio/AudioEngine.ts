import { useAudioStore, PitchType } from '../../store/useAudioStore';
import { useUIStore } from '../../store/ui-store';
import { API_BASE_URL } from '../constants';

class AudioEngine {
  private static instance: AudioEngine;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audio: HTMLAudioElement;
  private currentText = '';
  private currentLanguage = '';
  private warnedLanguages: Set<string> = new Set();
  private isBrowserSpeech = true;
  private currentBlobUrl: string | null = null;

  private constructor() {
    this.audio = new Audio();
    this.setupAudioListeners();

    // Warm up the voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private setupAudioListeners() {
    this.audio.addEventListener('play', () => {
      useAudioStore.getState().setPlaybackState('playing');
    });
    this.audio.addEventListener('pause', () => {
      if (this.audio.currentTime !== this.audio.duration && !this.audio.ended) {
        useAudioStore.getState().setPlaybackState('paused');
      }
    });
    this.audio.addEventListener('ended', () => {
      this.stop();
    });
    this.audio.addEventListener('error', (e) => {
      console.error("Audio element error during playback:", e);
    });
  }

  /**
   * Automatically detects the language of the text based on Unicode character ranges.
   * Tailored for all 22 official Indian languages.
   */
  public detectLanguage(text: string): string {
    if (!text) return 'en';

    // 1. Gurmukhi script (Punjabi)
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';

    // 2. Gujarati script (Gujarati)
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';

    // 3. Odia script (Odia)
    if (/[\u0B00-\u0B7F]/.test(text)) return 'or';

    // 4. Tamil script (Tamil)
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';

    // 5. Telugu script (Telugu)
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';

    // 6. Kannada script (Kannada)
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';

    // 7. Malayalam script (Malayalam)
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';

    // 8. Ol Chiki script (Santali)
    if (/[\u1C50-\u1C7F]/.test(text)) return 'sat';

    // 9. Bengali-Assamese script (Bengali, Assamese, Manipuri)
    if (/[\u0980-\u09FF]/.test(text)) {
      // Assamese specific characters ৰ (U+09f0) and ৱ (U+09f1)
      if (/[ৰৱ]/.test(text)) return 'as';
      return 'bn';
    }

    // 10. Devnagari script (Hindi, Marathi, Sanskrit, Nepali, Konkani, Dogri, Maithili, Bodo, Kashmiri)
    if (/[\u0900-\u097F]/.test(text)) {
      if (/[\u0933]/.test(text)) return 'mr'; // Marathi specific ळ
      return 'hi'; // Default Devnagari to Hindi
    }

    // 11. Arabic script (Urdu, Sindhi, Kashmiri)
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ur';
    }

    return 'en';
  }

  /**
   * Get the fallback chain for all 22 Indian languages.
   */
  private getFallbackChain(lang: string): string[] {
    const mainLang = lang.split('-')[0].toLowerCase();
    
    // Dravidian languages fallback to other Dravidian languages before Hindi
    const dravidianLanguages = ['ta', 'te', 'kn', 'ml'];
    if (dravidianLanguages.includes(mainLang)) {
      const remaining = dravidianLanguages.filter(l => l !== mainLang);
      return [mainLang, ...remaining, 'hi', 'en'];
    }

    // Indo-Aryan languages fallback to Hindi, then English
    return [mainLang, 'hi', 'en'];
  }

  /**
   * Finds the best matching browser voice for a language code.
   */
  private findBrowserVoice(langCode: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    const fallbacks = this.getFallbackChain(langCode);

    for (const targetLang of fallbacks) {
      const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang));
      if (matchingVoice) return matchingVoice;
    }

    return null;
  }

  /**
   * Maps pitch types to browser/cloud pitch values.
   */
  private getPitchValue(pitchType: PitchType): number {
    switch (pitchType) {
      case 'low':
        return 0.7;
      case 'high':
        return 1.3;
      case 'normal':
      default:
        return 1.0;
    }
  }

  /**
   * Speaks the provided text.
   */
  public play(id: string, text: string, language?: string) {
    this.stop();

    const store = useAudioStore.getState();
    this.currentText = text;
    
    // Normalize language string
    let rawLang = language || this.detectLanguage(text);
    if (rawLang.length > 3 && !rawLang.includes('-')) {
      const nameMap: Record<string, string> = {
        english: 'en', hindi: 'hi', marathi: 'mr', gujarati: 'gu', punjabi: 'pa',
        bengali: 'bn', tamil: 'ta', telugu: 'te', kannada: 'kn', malayalam: 'ml',
        odia: 'or', assamese: 'as', urdu: 'ur', konkani: 'kok', sanskrit: 'sa',
        kashmiri: 'ks', sindhi: 'sd', dogri: 'doi', maithili: 'mai', bodo: 'brx',
        manipuri: 'mni', santali: 'sat', nepali: 'ne'
      };
      rawLang = nameMap[rawLang.toLowerCase()] || rawLang;
    }
    
    this.currentLanguage = rawLang.split('-')[0].toLowerCase();
    const targetLang = (store.defaultVoice && store.defaultVoice !== 'auto') ? store.defaultVoice : this.currentLanguage;

    // Get system voices
    let voices: SpeechSynthesisVoice[] = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      voices = window.speechSynthesis.getVoices();
    }

    const matchedBrowserVoice = this.findBrowserVoice(targetLang, voices);

    // If the browser has a native voice for this language, use it
    if (matchedBrowserVoice && matchedBrowserVoice.lang.toLowerCase().startsWith(targetLang)) {
      this.isBrowserSpeech = true;
      this.playBrowserSpeech(id, text, matchedBrowserVoice);
    } else {
      // Otherwise, automatically fall back to Cloud TTS
      this.isBrowserSpeech = false;
      this.playCloudSpeechWithRetry(id, text, targetLang);
    }
  }

  private playBrowserSpeech(id: string, text: string, voice: SpeechSynthesisVoice) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const store = useAudioStore.getState();
    const cleanText = this.cleanMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    utterance.voice = voice;
    utterance.rate = store.speed;
    utterance.pitch = this.getPitchValue(store.pitch);
    utterance.volume = store.volume;

    utterance.onstart = () => {
      store.setPlaybackState('playing');
      store.currentTrackId = id;
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      store.setPlaybackState('idle');
      store.currentTrackId = null;
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      this.currentUtterance = null;
      store.setPlaybackState('idle');
      store.currentTrackId = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  private async playCloudSpeechWithRetry(id: string, text: string, lang: string, retries = 1) {
    const store = useAudioStore.getState();
    store.setPlaybackState('playing');
    store.currentTrackId = id;

    // Notify the user about the fallback if we haven't warned them for this language yet
    if (!this.warnedLanguages.has(lang)) {
      this.warnedLanguages.add(lang);
      useUIStore.getState().addToast({
        title: 'Voice Fallback',
        description: 'A native voice for this language is not available on your device. Using the closest available voice.',
        type: 'warning',
        duration: 4000
      });
    }

    try {
      const cleanText = this.cleanMarkdown(text);
      const url = await this.fetchCloudAudioUrl(cleanText, lang);
      
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = url;

      this.audio.src = url;
      this.audio.playbackRate = store.speed;
      this.audio.volume = store.volume;
      await this.audio.play();
    } catch (err) {
      console.error(`Cloud TTS play failed (retries left: ${retries})`, err);
      if (retries > 0) {
        // Retry once
        await this.playCloudSpeechWithRetry(id, text, lang, retries - 1);
      } else {
        this.stop();
        useUIStore.getState().addToast({
          title: 'Playback Failed',
          description: 'Could not play the voice response. Please check your network connection.',
          type: 'error',
          duration: 5000
        });
      }
    }
  }

  private async fetchCloudAudioUrl(text: string, lang: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/tts/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        provider: 'fallback', // Uses the backend's FallbackTTSProvider (google-tts-api)
        voiceId: '',
        speed: 1.0,
        pitch: 1.0
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cloud audio');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  public pause() {
    const store = useAudioStore.getState();
    if (this.isBrowserSpeech) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
        store.setPlaybackState('paused');
      }
    } else {
      this.audio.pause();
      store.setPlaybackState('paused');
    }
  }

  public resume() {
    const store = useAudioStore.getState();
    if (this.isBrowserSpeech) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
        store.setPlaybackState('playing');
      }
    } else {
      this.audio.play().catch(e => console.error("Cloud audio resume failed:", e));
      store.setPlaybackState('playing');
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    
    this.audio.pause();
    this.audio.currentTime = 0;

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    const store = useAudioStore.getState();
    store.setPlaybackState('idle');
    store.currentTrackId = null;
  }

  public replay(id: string) {
    if (this.currentText) {
      this.play(id, this.currentText, this.currentLanguage);
    }
  }

  /**
   * Smart text pre-processor for natural reading of lists, bullet points, and punctuation.
   */
  private cleanMarkdown(text: string): string {
    if (!text) return '';
    let clean = text;

    // 1. Remove code blocks entirely
    clean = clean.replace(/```[\s\S]*?```/g, '');
    
    // 2. Remove inline code formatting but keep the text
    clean = clean.replace(/`([^`]+)`/g, '$1');

    // 3. Convert headers to text with a trailing period for a natural pause
    clean = clean.replace(/^#{1,6}\s+(.*)$/gm, '$1. ');

    // 4. Clean up bullet points: convert "* item" or "- item" to "item" with a brief pause
    clean = clean.replace(/^[\s]*[-*+]\s+(.*)$/gm, '$1. ');

    // 5. Clean up numbered lists: convert "1. item" to "number 1, item" or just "1, item"
    clean = clean.replace(/^[\s]*(\d+)\.\s+(.*)$/gm, '$1, $2. ');

    // 6. Remove bold/italic markdown symbols
    clean = clean.replace(/(\*\*|__)(.*?)\1/g, '$2');
    clean = clean.replace(/(\*|_)(.*?)\1/g, '$2');

    // 7. Remove links but keep the text
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 8. Remove HTML tags
    clean = clean.replace(/<[^>]*>?/gm, '');

    // 9. Remove URLs
    clean = clean.replace(/https?:\/\/[^\s]+/g, '');

    // 10. Normalize spacing and line breaks
    clean = clean.replace(/\n+/g, '. ');
    clean = clean.replace(/\s+/g, ' ').trim();

    return clean;
  }
}

export const audioEngine = AudioEngine.getInstance();
