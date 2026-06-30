import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlaybackState = 'idle' | 'playing' | 'paused';
export type PitchType = 'low' | 'normal' | 'high';

interface AudioState {
  playbackState: PlaybackState;
  currentTrackId: string | null;
  speed: number; // 0.5, 0.75, 1.0, 1.25, 1.5, 2.0
  pitch: PitchType;
  volume: number; // 0.0 to 1.0
  autoRead: boolean;
  defaultVoice: string; // 'auto' or a specific voice name

  setPlaybackState: (state: PlaybackState) => void;
  setSpeed: (speed: number) => void;
  setPitch: (pitch: PitchType) => void;
  setVolume: (volume: number) => void;
  setAutoRead: (autoRead: boolean) => void;
  setDefaultVoice: (voice: string) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  playbackState: 'idle' as PlaybackState,
  currentTrackId: null as string | null,
  speed: 1.0,
  pitch: 'normal' as PitchType,
  volume: 0.8,
  autoRead: false,
  defaultVoice: 'auto',
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setPlaybackState: (state) => set({ playbackState: state }),
      setSpeed: (speed) => set({ speed }),
      setPitch: (pitch) => set({ pitch }),
      setVolume: (volume) => set({ volume }),
      setAutoRead: (autoRead) => set({ autoRead }),
      setDefaultVoice: (defaultVoice) => set({ defaultVoice }),
      resetSettings: () => set({
        speed: defaultSettings.speed,
        pitch: defaultSettings.pitch,
        volume: defaultSettings.volume,
        autoRead: defaultSettings.autoRead,
        defaultVoice: defaultSettings.defaultVoice,
      }),
    }),
    {
      name: 'bridgeai-audio-v3-storage',
      partialize: (state) => ({
        speed: state.speed,
        pitch: state.pitch,
        volume: state.volume,
        autoRead: state.autoRead,
        defaultVoice: state.defaultVoice,
      }),
    }
  )
);
