import Groq from 'groq-sdk';
import '../config/env.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Map of the 22 official Indian languages for prompt construction and matching
const INDIAN_LANGUAGES_MAP = {
  en: { name: 'English', native: 'English' },
  hi: { name: 'Hindi', native: 'हिन्दी' },
  mr: { name: 'Marathi', native: 'मराठी' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી' },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  bn: { name: 'Bengali', native: 'বাংলা' },
  ta: { name: 'Tamil', native: 'தமிழ்' },
  te: { name: 'Telugu', native: 'తెలుగు' },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ' },
  ml: { name: 'Malayalam', native: 'മലയാളം' },
  or: { name: 'Odia', native: 'ଓଡ଼ିଆ' },
  as: { name: 'Assamese', native: 'অসমীয়া' },
  ur: { name: 'Urdu', native: 'اردو' },
  kok: { name: 'Konkani', native: 'कोंकणी' },
  sa: { name: 'Sanskrit', native: 'संस्कृतम्' },
  ks: { name: 'Kashmiri', native: 'کٲشُر' },
  sd: { name: 'Sindhi', native: 'سنڌي' },
  doi: { name: 'Dogri', native: 'डोगरी' },
  mai: { name: 'Maithili', native: 'मैथिली' },
  brx: { name: 'Bodo', native: 'बर\'' },
  mni: { name: 'Manipuri', native: 'মৈতৈলোন্' },
  sat: { name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  ne: { name: 'Nepali', native: 'नेपाली' }
};

/**
   * Helper to parse explicit language requests from user text.
   */
export const parseRequestedLanguage = (text) => {
  if (!text) return null;
  const lowerText = text.toLowerCase();

  // Check for language names in English
  const keys = Object.keys(INDIAN_LANGUAGES_MAP);
  for (const key of keys) {
    const lang = INDIAN_LANGUAGES_MAP[key];
    // Check if the query contains the language name (e.g. "gujarati", "speak gujarati", "reply in gujarati")
    // or the native name (e.g., "ગુજરાતી")
    if (lowerText.includes(lang.name.toLowerCase()) || lowerText.includes(lang.native.toLowerCase())) {
      return { code: key, ...lang };
    }
  }

  // Fallback to script-based checks if no English name was matched
  if (/[\u0980-\u09FF]/.test(text)) {
    if (/[ৰৱ]/.test(text)) return { code: 'as', ...INDIAN_LANGUAGES_MAP.as };
    return { code: 'bn', ...INDIAN_LANGUAGES_MAP.bn };
  }
  if (/[\u0900-\u097F]/.test(text)) {
    if (/[\u0933]/.test(text)) return { code: 'mr', ...INDIAN_LANGUAGES_MAP.mr };
    return { code: 'hi', ...INDIAN_LANGUAGES_MAP.hi };
  }
  if (/[\u0A00-\u0A7F]/.test(text)) return { code: 'pa', ...INDIAN_LANGUAGES_MAP.pa };
  if (/[\u0A80-\u0AFF]/.test(text)) return { code: 'gu', ...INDIAN_LANGUAGES_MAP.gu };
  if (/[\u0B00-\u0B7F]/.test(text)) return { code: 'or', ...INDIAN_LANGUAGES_MAP.or };
  if (/[\u0B80-\u0BFF]/.test(text)) return { code: 'ta', ...INDIAN_LANGUAGES_MAP.ta };
  if (/[\u0C00-\u0C7F]/.test(text)) return { code: 'te', ...INDIAN_LANGUAGES_MAP.te };
  if (/[\u0C80-\u0CFF]/.test(text)) return { code: 'kn', ...INDIAN_LANGUAGES_MAP.kn };
  if (/[\u0D00-\u0D7F]/.test(text)) return { code: 'ml', ...INDIAN_LANGUAGES_MAP.ml };
  if (/[\u0600-\u06FF]/.test(text)) return { code: 'ur', ...INDIAN_LANGUAGES_MAP.ur };
  if (/[\u1C50-\u1C7F]/.test(text)) return { code: 'sat', ...INDIAN_LANGUAGES_MAP.sat };

  return null;
};

export const getSystemPrompt = (locale = 'en') => {
  const cleanLocale = locale.toLowerCase().split('-')[0];
  const lang = INDIAN_LANGUAGES_MAP[cleanLocale];

  if (lang) {
    return `You are BridgeAI, a helpful multilingual AI assistant. Respond ONLY in ${lang.name} (${lang.native}). Do not use any other language. Ensure your entire response is written in the correct script for ${lang.name}.`;
  }
  
  // Non-Indian languages prompts
  const otherPrompts = {
    es: `Eres BridgeAI, un asistente de IA multilingüe útil. Responde siempre en español.`,
    fr: `Vous êtes BridgeAI, un assistant IA multilingue utile. Répondez toujours en français.`,
    de: `Sie sind BridgeAI, ein hilfreicher mehrsprachiger KI-Assistent. Antworten Sie immer auf Deutsch.`,
    zh: `您是BridgeAI，一个乐于助人的多语言AI助手。请始终使用中文回复。`,
    ja: `あなたはBridgeAI、便利な多言語AIアシスタントです。常に日本語で返信してください。`,
    ar: `أنت BridgeAI، مساعد ذكاء اصطناعي متعدد اللغات ومفيد. رد دائمًا باللغة العربية.`
  };
  
  return otherPrompts[cleanLocale] || `You are BridgeAI, a helpful multilingual AI assistant. Always respond in the same language the user is using.`;
};

export const streamChatCompletion = async (messages, locale = 'en', aiConfig = {}, userRequested = false) => {
  const cleanLocale = locale.toLowerCase().split('-')[0];
  const lang = INDIAN_LANGUAGES_MAP[cleanLocale];
  
  let langInstruction = '';
  if (lang) {
    langInstruction = `The user ${userRequested ? 'explicitly requested' : 'wrote in'} ${lang.name}. Respond ONLY in ${lang.name} (${lang.native}). Do not use any other language. Ensure your entire response is written in the correct script for ${lang.name}.`;
  } else {
    const otherLangs = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Chinese',
      ja: 'Japanese',
      ar: 'Arabic',
      ko: 'Korean'
    };
    const name = otherLangs[cleanLocale] || 'English';
    langInstruction = `The user ${userRequested ? 'explicitly requested' : 'wrote in'} ${name}. Respond ONLY in ${name}. Do not use any other language.`;
  }

  const basePrompt = aiConfig.systemPrompt || 'You are BridgeAI, a helpful multilingual assistant.';
  const finalSystemPrompt = `${basePrompt}\n\n${langInstruction}\n\nDo not reuse the previous conversation language unless the current user message is also in that language. Never randomly switch to German or any other language unless explicitly requested.`;

  const systemMessage = {
    role: 'system',
    content: finalSystemPrompt,
  };

  const response = await groq.chat.completions.create({
    model: aiConfig.model || 'llama-3.3-70b-versatile',
    messages: [systemMessage, ...messages],
    stream: true,
    temperature: aiConfig.temperature ?? 0.7,
    max_tokens: aiConfig.maxTokens ?? 2048,
    top_p: aiConfig.topP ?? 0.9,
  });

  return response;
};

export const detectLanguage = async (text) => {
  try {
    // 1. Check for explicit language requests first
    const explicitRequest = parseRequestedLanguage(text);
    if (explicitRequest) {
      return explicitRequest.code;
    }

    // 2. Otherwise use the model to detect
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a language detection expert. Respond with ONLY the ISO 639-1 language code (e.g., en, es, fr, de, hi, zh, ja, ar, etc.) for the given text. No explanation.',
        },
        {
          role: 'user',
          content: `Detect the language of this text and return only the 2-letter code: "${text.substring(0, 200)}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 5,
    });

    let detected = response.choices[0]?.message?.content?.trim().toLowerCase();
    
    // Extract the first 2-3 letter word to guarantee a clean code and avoid SQL crashes
    const match = detected.match(/[a-z]{2,3}/);
    detected = match ? match[0] : 'en';

    return detected.substring(0, 10);
  } catch (err) {
    console.error('Language detection error:', err);
    return 'en';
  }
};

export default groq;
