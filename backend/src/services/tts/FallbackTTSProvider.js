import TTSProvider from './TTSProvider.js';
import * as googleTTS from 'google-tts-api'; // Unofficial free API for immediate testing
import stream from 'stream';

/**
 * Fallback TTS Provider using unofficial free google-tts-api.
 * Useful when no API keys are provided.
 */
export default class FallbackTTSProvider extends TTSProvider {
  async initialize() {
    console.log("Initialized Fallback TTS Provider (google-tts-api)");
  }

  async getVoices() {
    // google-tts-api doesn't have a voice list endpoint, it just uses language codes
    return [
      { id: 'en', name: 'English (Default)', language: 'en', gender: 'neutral' },
      { id: 'fr', name: 'French', language: 'fr', gender: 'neutral' },
      { id: 'es', name: 'Spanish', language: 'es', gender: 'neutral' },
      { id: 'hi', name: 'Hindi', language: 'hi', gender: 'neutral' },
      { id: 'zh', name: 'Chinese', language: 'zh', gender: 'neutral' },
      { id: 'ja', name: 'Japanese', language: 'ja', gender: 'neutral' }
    ];
  }

  async generateStream(text, options = {}) {
    const cleanStr = this.cleanText(text);
    const lang = options.language || 'en';
    // google-tts-api has a 200 character limit per request. 
    // We use getAllAudioBase64 to automatically split long text and fetch chunks.
    try {
      const results = await googleTTS.getAllAudioBase64(cleanStr, {
        lang: lang,
        slow: options.speed < 1.0,
        host: 'https://translate.google.com',
      });
      
      const passThrough = new stream.PassThrough();
      
      // Concatenate all chunks
      const buffers = results.map(res => Buffer.from(res.base64, 'base64'));
      const combinedBuffer = Buffer.concat(buffers);
      
      passThrough.end(combinedBuffer);
      return passThrough;
    } catch (error) {
      console.error("FallbackTTSProvider error:", error);
      throw error;
    }
  }
}
