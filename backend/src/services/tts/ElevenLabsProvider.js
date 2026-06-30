import TTSProvider from './TTSProvider.js';

export default class ElevenLabsProvider extends TTSProvider {
  constructor() {
    super();
    this.apiKey = process.env.ELEVENLABS_API_KEY;
  }

  async initialize() {
    if (this.apiKey) {
      console.log("Initialized ElevenLabs TTS Provider");
    } else {
      console.warn("ELEVENLABS_API_KEY is not set. ElevenLabsProvider won't work.");
    }
  }

  async getVoices() {
    if (!this.apiKey) return [];
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': this.apiKey }
      });
      const data = await response.json();
      return data.voices.map(v => ({
        id: v.voice_id,
        name: v.name,
        language: 'en', // ElevenLabs v2 handles multi-language natively
        gender: v.labels?.gender || 'neutral',
        previewUrl: v.preview_url
      }));
    } catch (error) {
      console.error("ElevenLabs getVoices error:", error);
      return [];
    }
  }

  async generateStream(text, options = {}) {
    if (!this.apiKey) throw new Error("ElevenLabs API Key is not set");
    
    const cleanStr = this.cleanText(text);
    const voiceId = options.voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Rachel (default)
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanStr,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs Error: ${response.statusText}`);
    }

    return response.body; // Fetch response body is a ReadableStream in Node 18+
  }
}
