import TTSProvider from './TTSProvider.js';
import textToSpeech from '@google-cloud/text-to-speech';
import stream from 'stream';

export default class GoogleTTSProvider extends TTSProvider {
  constructor() {
    super();
    this.client = null;
  }

  async initialize() {
    // Requires GOOGLE_APPLICATION_CREDENTIALS environment variable
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CREDENTIALS_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.warn("Google TTS: GOOGLE_APPLICATION_CREDENTIALS environment variable not set. It won't be used.");
      this.client = null;
      return;
    }
    try {
      this.client = new textToSpeech.TextToSpeechClient();
      console.log("Initialized Google Cloud TTS Provider");
    } catch (error) {
      console.warn("Failed to initialize Google TTS (missing credentials?). It won't be used.");
      this.client = null;
    }
  }

  async getVoices() {
    if (!this.client) return [];
    const [result] = await this.client.listVoices({});
    return result.voices.map(v => ({
      id: v.name,
      name: v.name,
      language: v.languageCodes[0],
      gender: v.ssmlGender.replace('SSML_VOICE_GENDER_UNSPECIFIED', 'neutral').toLowerCase()
    }));
  }

  async generateStream(text, options = {}) {
    if (!this.client) throw new Error("Google TTS Client not initialized");
    
    const cleanStr = this.cleanText(text);
    
    const request = {
      input: { text: cleanStr },
      voice: { 
        languageCode: options.language || 'en-US', 
        name: options.voiceId || 'en-US-Journey-F' 
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: options.speed || 1.0,
        pitch: options.pitch ? (options.pitch - 1.0) * 20 : 0.0 // Google pitch is -20.0 to 20.0
      },
    };

    const [response] = await this.client.synthesizeSpeech(request);
    
    const passThrough = new stream.PassThrough();
    passThrough.end(response.audioContent);
    return passThrough;
  }
}
