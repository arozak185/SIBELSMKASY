import React from 'react';
import { 
  Bell, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Radio, 
  Music, 
  Sliders, 
  History, 
  Maximize2, 
  ShieldCheck, 
  AlertTriangle,
  Settings as SettingsIcon,
  FileSpreadsheet
} from 'lucide-react';
import { SchoolSettings } from '../types';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wibTimeString: string;
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
  settings: SchoolSettings;
  onOpenSettings: () => void;
  onEnterKiosk: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  wibTimeString,
  isAudioUnlocked,
  onUnlockAudio,
  masterVolume,
  onVolumeChange,
  settings,
  onOpenSettings,
  onEnterKiosk,
}) => {
  const isMuted = masterVolume === 0;

  const navItems = [
    { id: 'dashboard', label: 'Beranda & Status', icon: Radio },
    { id: 'jadwal', label: 'Jadwal Bel', icon: Calendar },
    { id: 'manual', label: 'Bel Manual & Siaran', icon: Bell },
    { id: 'audio', label: 'Pustaka Audio', icon: Music },
    { id: 'khusus', label: 'Mode Khusus', icon: Sliders },
    { id: 'log', label: 'Riwayat Log', icon: History },
    { id: 'google', label: 'Google Sheet & Drive', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Bell className="w-5 h-5 animate-bounce-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white whitespace-nowrap">
                  SIBEL
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {settings.schoolName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sistem Bel Otomatis & Pengendali Suara
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Live WIB Clock badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-emerald-400 font-semibold tabular-nums">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{wibTimeString} WIB</span>
            </div>

            {/* Audio Unlock / Connection Button */}
            {!isAudioUnlocked ? (
              <button
                onClick={onUnlockAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors whitespace-nowrap animate-pulse"
                title="Klik untuk membuka izin audio browser agar bel otomatis dapat berdering"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Hubungkan Audio</span>
              </button>
            ) : (
              <div 
                className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                title="Sistem audio siap dan terhubung ke pengeras suara"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audio Siap</span>
              </div>
            )}

            {/* Volume Control */}
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <button
                onClick={() => onVolumeChange(isMuted ? 80 : 0)}
                className="text-slate-400 hover:text-slate-200"
                title={isMuted ? 'Bunyikan' : 'Senyap'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                title={`Volume Master: ${masterVolume}%`}
              />
              <span className="text-[10px] font-mono text-slate-400 w-6 text-right">
                {masterVolume}%
              </span>
            </div>

            {/* Fullscreen Kiosk Mode */}
            <button
              onClick={onEnterKiosk}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Mode Layar Penuh Kiosk (Monitor Piket TU)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Pengaturan Sekolah & Cadangan Data"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 -mx-4 px-4 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
