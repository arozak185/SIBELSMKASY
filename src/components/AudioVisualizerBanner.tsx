import React from 'react';
import { Volume2, Square } from 'lucide-react';

interface AudioVisualizerBannerProps {
  isPlaying: boolean;
  currentTrackName?: string;
  onStop: () => void;
}

export const AudioVisualizerBanner: React.FC<AudioVisualizerBannerProps> = ({
  isPlaying,
  currentTrackName,
  onStop,
}) => {
  if (!isPlaying) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-b border-emerald-500/40 px-4 py-3 text-slate-100 shadow-lg sticky top-16 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Ringing info & animated soundwaves */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Volume2 className="w-5 h-5 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider animate-pulse">
                Sedang Berdering
              </span>
              <span className="text-sm font-bold text-white tracking-wide">
                {currentTrackName || 'Bel Sekolah'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Audio sedang disiarkan ke pengeras suara sekolah SMK As-Syafi’iyah
            </p>
          </div>
        </div>

        {/* Visualizer wave bars */}
        <div className="hidden sm:flex items-center gap-1 h-6 px-3 py-1 bg-slate-950/50 rounded-lg border border-slate-800">
          {[40, 75, 95, 60, 85, 100, 70, 90, 50, 80, 65, 45].map((height, i) => (
            <span
              key={i}
              className="w-1 bg-emerald-400 rounded-full animate-pulse"
              style={{
                height: `${height}%`,
                animationDelay: `${i * 80}ms`,
                animationDuration: '600ms',
              }}
            />
          ))}
        </div>

        {/* Emergency Stop Button */}
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Hentikan Bel (Stop)</span>
        </button>
      </div>
    </div>
  );
};
