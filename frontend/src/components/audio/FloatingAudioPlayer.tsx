import React from 'react';
import { Play, Pause, Square, Volume2, X } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { audioEngine } from '../../lib/audio/AudioEngine';
import { Slider } from '../ui/slider';

export const FloatingAudioPlayer: React.FC = () => {
  const { 
    playbackState, 
    volume, 
    speed, 
    setVolume, 
    setSpeed, 
    currentTrackId,
    setPlaybackState
  } = useAudioStore();

  if (playbackState === 'idle' && !currentTrackId) return null;

  const handleClose = () => {
    audioEngine.stop();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[var(--color-surface-primary)]/95 backdrop-blur-md border border-[var(--color-border-default)] shadow-2xl rounded-2xl p-4 w-[280px] transition-all animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-semibold truncate text-[var(--color-text-primary)]">Read Aloud</div>
        <button onClick={handleClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-4">
        {playbackState === 'playing' ? (
          <button 
            onClick={() => audioEngine.pause()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bridge-500 text-white hover:bg-bridge-600 cursor-pointer"
          >
            <Pause className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={() => audioEngine.resume()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bridge-500 text-white hover:bg-bridge-600 cursor-pointer"
          >
            <Play className="w-5 h-5 ml-1" />
          </button>
        )}
        
        <button 
          onClick={() => audioEngine.stop()}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] cursor-pointer"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Volume */}
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <Slider 
            value={[volume * 100]} 
            max={100} 
            step={5} 
            className="flex-1"
            onValueChange={([val]) => setVolume(val / 100)}
          />
        </div>

        {/* Speed Selector */}
        <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)] pt-1">
          <span className="font-semibold">Speed:</span>
          <select 
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-transparent border-none outline-none cursor-pointer hover:text-[var(--color-text-primary)] font-semibold"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2.0}>2x</option>
          </select>
        </div>
      </div>
    </div>
  );
};
