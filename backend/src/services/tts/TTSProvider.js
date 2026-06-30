/**
 * Abstract Base Class for Text-to-Speech Providers
 */
export default class TTSProvider {
  constructor() {
    if (new.target === TTSProvider) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
  }

  /**
   * Initializes the provider (e.g., fetching credentials, loading resources)
   */
  async initialize() {
    throw new Error("Must implement initialize method");
  }

  /**
   * Returns a list of available voices from this provider
   * @returns {Promise<Array<{id: string, name: string, language: string, gender: string, previewUrl?: string}>>}
   */
  async getVoices() {
    throw new Error("Must implement getVoices method");
  }

  /**
   * Generates a streaming audio response for the given text
   * @param {string} text - The text to synthesize
   * @param {object} options - TTS options
   * @param {string} options.voiceId - The ID of the voice to use
   * @param {string} [options.language] - The language code (e.g., 'en', 'fr')
   * @param {number} [options.speed=1.0] - Playback speed multiplier
   * @param {number} [options.pitch=1.0] - Pitch multiplier
   * @returns {Promise<ReadableStream|Buffer|NodeJS.ReadableStream>} - The audio stream data
   */
  async generateStream(text, options = {}) {
    throw new Error("Must implement generateStream method");
  }

  /**
   * Cleans text before sending it to the provider (e.g., removing Markdown)
   * @param {string} text 
   * @returns {string}
   */
  cleanText(text) {
    if (!text) return "";
    
    // Remove Markdown links
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // Remove Markdown bold/italic
    text = text.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1");
    // Remove Markdown headers
    text = text.replace(/^#+\s+/gm, "");
    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, "Code block omitted.");
    // Remove inline code
    text = text.replace(/`([^`]+)`/g, "$1");
    // Remove HTML tags
    text = text.replace(/<[^>]*>?/gm, "");
    
    return text.trim();
  }
}
