import express from 'express';
import * as langdetect from 'langdetect';
import FallbackTTSProvider from '../services/tts/FallbackTTSProvider.js';
import GoogleTTSProvider from '../services/tts/GoogleTTSProvider.js';
import ElevenLabsProvider from '../services/tts/ElevenLabsProvider.js';

const router = express.Router();

// Initialize providers
const providers = {
  fallback: new FallbackTTSProvider(),
  google: new GoogleTTSProvider(),
  elevenlabs: new ElevenLabsProvider()
};

// Initialize them asynchronously (fire and forget for now, or await in a real startup script)
Object.values(providers).forEach(p => p.initialize());

/**
 * Get available voices for a specific provider
 * GET /api/tts/voices?provider=google
 */
router.get('/voices', async (req, res) => {
  try {
    const providerName = req.query.provider || 'fallback';
    const provider = providers[providerName] || providers.fallback;
    
    const voices = await provider.getVoices();
    res.json({ voices });
  } catch (error) {
    console.error("Error fetching voices:", error);
    res.status(500).json({ success: false, error: "Failed to fetch voices" });
  }
});

/**
 * Stream TTS audio
 * POST /api/tts/stream
 * Body: { text: string, provider: string, voiceId: string, speed: number, pitch: number }
 */
router.post('/stream', async (req, res) => {
  try {
    const { text, provider: providerName = 'fallback', voiceId, speed = 1.0, pitch = 1.0 } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    // Auto-detect language if not strictly provided
    let detectedLang = 'en';
    try {
      const detected = langdetect.detectOne(text);
      if (detected) detectedLang = detected;
    } catch (e) {
      // fallback to en if detection fails
    }

    const provider = providers[providerName] || providers.fallback;

    const audioStream = await provider.generateStream(text, {
      voiceId,
      language: detectedLang,
      speed: parseFloat(speed),
      pitch: parseFloat(pitch)
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Web Streams API (fetch body from ElevenLabs)
    if (audioStream instanceof ReadableStream) {
      const reader = audioStream.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        pump();
      };
      pump();
    } 
    // Node.js Streams (from our stream.PassThrough)
    else {
      audioStream.pipe(res);
    }
  } catch (error) {
    console.error("TTS Stream Error:", error);
    res.status(500).json({ success: false, error: "Failed to generate TTS stream" });
  }
});

export default router;
