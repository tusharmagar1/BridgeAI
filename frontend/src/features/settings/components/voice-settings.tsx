import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAudioStore, PitchType } from '@/store/useAudioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Volume2, Mic, Play, Settings, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageOption {
  code: string;
  name: string;
  testPhrase: string;
}

const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', testPhrase: 'Hello! This is a preview of the selected voice.' },
  { code: 'hi', name: 'Hindi (हिन्दी)', testPhrase: 'नमस्ते! यह आपकी चुनी हुई आवाज़ का पूर्वावलोकन है।' },
  { code: 'mr', name: 'Marathi (मराठी)', testPhrase: 'नमस्कार! हे तुमच्या निवडलेल्या आवाजाचे पूर्वावलोकन आहे।' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', testPhrase: 'નમસ્તે! આ તમારી પસંદ કરેલી આયતનું પૂર્વાવલોકન છે।' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', testPhrase: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਇਹ ਤੁਹਾਡੀ ਚੁਣੀ ਹੋਈ ਅਵਾਜ਼ ਦਾ ਪੂਰਵਦਰਸ਼ਨ ਹੈ।' },
  { code: 'bn', name: 'Bengali (বাংলা)', testPhrase: 'নমস্কার! এটি আপনার নির্বাচিত কন্ঠস্বরের পূর্বরূপ।' },
  { code: 'ta', name: 'Tamil (தமிழ்)', testPhrase: 'வணக்கம்! இது நீங்கள் தேர்ந்தெடுத்த குரலின் முன்னோட்டம்।' },
  { code: 'te', name: 'Telugu (తెలుగు)', testPhrase: 'నమస్కారం! ఇది మీరు ఎంచుకున్న వాయిస్ యొక్క ప్రివ్యూ।' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', testPhrase: 'ನಮಸ್ಕಾರ! ಇದು ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಧ್ವನಿಯ ಮುನ್ನೋಟ।' },
  { code: 'ml', name: 'Malayalam (മലയാളം)', testPhrase: 'നമസ്കാരം! ഇത് നിങ്ങൾ തിരഞ്ഞെടുത്ത ശബ്ദത്തിന്റെ പ്രിവ്യൂ ആണ്।' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', testPhrase: 'ନମସ୍କାର! ଏହା ଆପଣଙ୍କର ମନୋନୀତ ସ୍ୱରର ଏକ ପୂର୍ବାବଲୋକନ ଅଟେ।' },
  { code: 'as', name: 'Assamese (অসমীয়া)', testPhrase: 'নমস্কাৰ! এইটো আপোনাৰ নিৰ্বাচিত কণ্ঠস্বৰৰ পূৰ্বৰূপ।' },
  { code: 'ur', name: 'Urdu (اردو)', testPhrase: 'ہیلو! یہ آپ کی منتخب کردہ آواز کا پیش نظارہ ہے۔' },
  { code: 'kok', name: 'Konkani (कोंकणी)', testPhrase: 'नमस्कार! हें तुमचें वेंचून काडिल्लें आवाजाचें पूर्वदृश्य।' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)', testPhrase: 'नमो नमः! एषः भवतः चितस्वरेण पूर्वावलोकनः अस्ति।' },
  { code: 'ks', name: 'Kashmiri (کٲشُر)', testPhrase: 'ہیلو! یہ آپ کی منتخب کردہ آواز کا پیش نظارہ ہے۔' },
  { code: 'sd', name: 'Sindhi (سنڌي)', testPhrase: 'ہیلو! یہ آپ کی منتخب کردہ آواز کا پیش نظارہ ہے۔' },
  { code: 'doi', name: 'Dogri (डोगरी)', testPhrase: 'नमस्ते! यह आपकी चुनी हुई आवाज़ का पूर्वावलोकन है।' },
  { code: 'mai', name: 'Maithili (मैथिली)', testPhrase: 'नमस्ते! यह आपकी चुनी हुई आवाज़ का पूर्वावलोकन है।' },
  { code: 'brx', name: 'Bodo (बर\' )', testPhrase: 'नमस्ते! यह आपकी चुनी हुई आवाज़ का पूर्वावलोकन है।' },
  { code: 'mni', name: 'Manipuri (মৈতৈলোন্)', testPhrase: 'হেলো! মসি অদোম্না খল্লকপা খোঞ্জেলসিগী প্রিভিউ অমনি।' },
  { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)', testPhrase: 'ᱡᱚᱦᱟᱨ! ᱱᱚᱶᱟ ᱫᱚ ᱟᱹᱵᱤᱱ ᱵᱟᱪᱷᱟᱣ ᱟᱠᱟᱫ ᱛᱟᱹᱵᱤᱱ ᱨᱟᱦᱟ ᱨᱮᱱᱟᱜ ᱢᱤᱫ ᱡᱷᱚᱞᱚᱠ ᱠᱟᱱᱟ।' },
  { code: 'ne', name: 'Nepali (नेपाली)', testPhrase: 'नमस्ते! यो तपाईंको चयन गरिएको आवाजको पूर्वावलोकन हो।' },
];

export function VoiceSettings() {
  const { t } = useTranslation()
  const store = useAudioStore()
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([])
  const [testActive, setTestActive] = useState(false)

  // Load browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      setSystemVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Handle previewing the selected voice
  const handleVoicePreview = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || testActive) return;
    setTestActive(true);

    window.speechSynthesis.cancel();
    
    // Find the appropriate test phrase and voice
    const selectedLangOpt = INDIAN_LANGUAGES.find(l => l.code === store.defaultVoice);
    const textToSpeak = selectedLangOpt ? selectedLangOpt.testPhrase : 'Hello! This is a preview of the selected voice.';
    
    let voiceObj: SpeechSynthesisVoice | null = null;
    if (store.defaultVoice !== 'auto') {
      voiceObj = systemVoices.find(v => v.lang.toLowerCase().startsWith(store.defaultVoice.toLowerCase())) || null;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (voiceObj) {
      utterance.voice = voiceObj;
    }
    
    // Configure rate
    utterance.rate = store.speed;

    // Configure pitch
    if (store.pitch === 'low') {
      utterance.pitch = 0.7;
    } else if (store.pitch === 'high') {
      utterance.pitch = 1.3;
    } else {
      utterance.pitch = 1.0;
    }

    // Configure volume
    utterance.volume = store.volume;

    utterance.onend = () => setTestActive(false);
    utterance.onerror = () => setTestActive(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleRestoreDefaults = () => {
    store.resetSettings();
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const pitchOptions: { label: string; value: PitchType }[] = [
    { label: 'Low', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      {/* Default Voice */}
      <Card className="border border-[var(--color-border-default)] bg-[var(--color-surface-primary)]/90 backdrop-blur-xs shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Mic className="w-4 h-4 text-bridge-500" />
              <span>{t('settings.voice.selectionHeading', 'Default Voice')}</span>
            </CardTitle>
            <CardDescription className="text-xs text-[var(--color-text-secondary)]">
              Choose between auto-detecting the response language or forcing a specific language voice
            </CardDescription>
          </div>
          <button
            onClick={handleVoicePreview}
            disabled={testActive}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors shadow-xs disabled:opacity-55',
              testActive
                ? 'border-pink-500 bg-pink-500/10 text-pink-500 animate-pulse'
                : 'border-[var(--color-border-default)] hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-bridge-500'
            )}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Voice</span>
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Preferred Language Voice
            </label>
            <select
              value={store.defaultVoice}
              onChange={(e) => store.setDefaultVoice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/50 text-xs text-[var(--color-text-primary)] focus:outline-none"
            >
              <option value="auto">Auto Detect (Default)</option>
              {INDIAN_LANGUAGES.map((lang) => {
                const hasVoice = systemVoices.some(v => v.lang.toLowerCase().startsWith(lang.code.toLowerCase()));
                return (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} {!hasVoice && lang.code !== 'en' && lang.code !== 'hi' ? '(No native voice, uses fallback)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card className="border border-[var(--color-border-default)] bg-[var(--color-surface-primary)]/90 backdrop-blur-xs shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <span>{t('settings.voice.paramsHeading', 'Speech Settings')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            Configure speed rate, pitch, and volume parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Speech Speed */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
              Speech Speed
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {speedOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => store.setSpeed(opt)}
                  className={cn(
                    'py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center',
                    store.speed === opt
                      ? 'bg-bridge-500 border-bridge-500 text-white shadow-sm shadow-bridge-500/10'
                      : 'border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
                  )}
                >
                  {opt === 1.0 ? '1x (Default)' : `${opt}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
              Pitch
            </label>
            <div className="grid grid-cols-3 gap-2">
              {pitchOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => store.setPitch(opt.value)}
                  className={cn(
                    'py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center',
                    store.pitch === opt.value
                      ? 'bg-bridge-500 border-bridge-500 text-white shadow-sm shadow-bridge-500/10'
                      : 'border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--color-text-secondary)] uppercase tracking-wider">
                Volume
              </span>
              <span className="text-emerald-500 tabular-nums bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {Math.round(store.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[store.volume * 100]}
              onValueChange={([val]) => store.setVolume(val / 100)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Auto Read Switch */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-default)]">
            <div className="space-y-0.5 max-w-[80%]">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                Auto Read AI Responses
              </span>
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                Automatically speak assistant replies when they complete.
              </p>
            </div>
            <Switch
              checked={store.autoRead}
              onCheckedChange={(checked) => store.setAutoRead(checked)}
            />
          </div>

        </CardContent>
      </Card>

      {/* Restore Defaults */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleRestoreDefaults}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-primary)] hover:bg-[var(--color-surface-secondary)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restore Default Settings</span>
        </button>
      </div>
    </div>
  );
}
