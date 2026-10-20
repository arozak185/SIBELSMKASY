import React from 'react';
import { 
  Minimize2, 
  Clock, 
  BellRing, 
  Volume2, 
  Square, 
  Flame, 
  School,
  CheckCircle2
} from 'lucide-react';
import { ScheduleItem, SchoolSettings } from '../types';
import { WibTimeInfo, UpcomingBellInfo, getCategoryBadge } from '../services/scheduler';

interface KioskViewProps {
  wibTime: WibTimeInfo;
  upcomingBell: UpcomingBellInfo;
  currentActivity: ScheduleItem | null;
  todaySchedules: ScheduleItem[];
  settings: SchoolSettings;
  isPlaying: boolean;
  currentTrackName?: string;
  onStop: () => void;
  onExitKiosk: () => void;
  onQuickManualTone: (tone: string, label: string) => void;
}

export const KioskView: React.FC<KioskViewProps> = ({
  wibTime,
  upcomingBell,
  currentActivity,
  todaySchedules,
  settings,
  isPlaying,
  currentTrackName,
  onStop,
  onExitKiosk,
  onQuickManualTone,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {settings.schoolName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SIBEL DISPLAY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {settings.schoolSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isPlaying && (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Hentikan Bel Sekarang</span>
            </button>
          )}

          <button
            onClick={onExitKiosk}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Keluar Layar Penuh</span>
          </button>
        </div>
      </div>

      {/* Main Big Display Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center py-6">
        
        {/* Giant Digital Clock (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wider text-sm uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Waktu Indonesia Barat (WIB)</span>
          </div>

          <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white font-mono tracking-tighter tabular-nums drop-shadow-xl">
            {wibTime.timeString}
          </div>

          <div className="text-lg sm:text-xl md:text-2xl font-medium text-slate-300">
            {wibTime.formattedDate}
          </div>

          {isPlaying && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-pulse">
              <Volume2 className="w-6 h-6 shrink-0" />
              <div>
                <span className="font-bold text-sm block">Sedang Berdering:</span>
                <span className="text-xs text-white">{currentTrackName || 'Bel Sekolah'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Activity & Next Bell Display (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Current Activity Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Sedang Berlangsung
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {currentActivity ? currentActivity.name : 'Sebelum Kegiatan Pembelajaran'}
            </h3>
            {currentActivity?.description && (
              <p className="text-xs text-slate-400">
                {currentActivity.description}
              </p>
            )}
          </div>

          {/* Next Bell Countdown Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <BellRing className="w-4 h-4" /> Bel Berikutnya
              </span>
              {upcomingBell.schedule && (
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-sm border border-emerald-500/30">
                  {upcomingBell.schedule.time} WIB
                </span>
              )}
            </div>

            {upcomingBell.schedule ? (
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {upcomingBell.schedule.name}
                </h3>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  {upcomingBell.remainingText}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-2">
                {upcomingBell.remainingText}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline Strip */}
      <div className="border-t border-slate-800 pt-5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
            Jadwal Terdekat Hari Ini:
          </span>
          <div className="flex items-center gap-2">
            {todaySchedules
              .filter(s => s.time >= wibTime.minuteString)
              .slice(0, 4)
              .map(item => (
                <div
                  key={item.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="font-mono font-bold text-emerald-400">
                    {item.time}
                  </span>
                  <span className="text-slate-300 font-medium truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Emergency Siren Quick Access in Kiosk */}
        <button
          onClick={() => {
            if (confirm('BUNYIKAN SIRENE EVAKUASI DARURAT?')) {
              onQuickManualTone('siren', 'Sirene Darurat / Evakuasi');
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Sirene Darurat</span>
        </button>
      </div>
    </div>
  );
};
