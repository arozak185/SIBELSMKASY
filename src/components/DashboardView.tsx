import React from 'react';
import { 
  Clock, 
  Calendar, 
  Play, 
  Volume2, 
  BellRing, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Coffee,
  School,
  Flame,
  Radio
} from 'lucide-react';
import { ScheduleItem, SchoolSettings, BellLog } from '../types';
import { WibTimeInfo, UpcomingBellInfo, getCategoryBadge } from '../services/scheduler';

interface DashboardViewProps {
  wibTime: WibTimeInfo;
  upcomingBell: UpcomingBellInfo;
  currentActivity: ScheduleItem | null;
  todaySchedules: ScheduleItem[];
  settings: SchoolSettings;
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
  onTriggerBell: (schedule: ScheduleItem) => void;
  onQuickManualTone: (toneName: string, label: string) => void;
  recentLogs: BellLog[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  wibTime,
  upcomingBell,
  currentActivity,
  todaySchedules,
  settings,
  isAudioUnlocked,
  onUnlockAudio,
  onTriggerBell,
  onQuickManualTone,
  recentLogs,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Audio Unlock Alert Banner (if browser blocked auto audio) */}
      {!isAudioUnlocked && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-200">
                Akses Audio Browser Belum Diaktifkan
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Kebijakan browser memerlukan klik interaksi pengguna agar bel otomatis dapat berdering tanpa hambatan di latar belakang.
              </p>
            </div>
          </div>
          <button
            onClick={onUnlockAudio}
            className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm transition-colors whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            Aktifkan Audio Sekarang
          </button>
        </div>
      )}

      {/* Main Cockpit Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Time & Next Bell Spotlight */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: School & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Sistem Otomatis Aktif
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">
                  {settings.schoolName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {wibTime.formattedDate}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                Mode: {settings.currentMode === 'auto' ? 'Kalender Otomatis' : settings.currentMode.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Center: Big Digital Clock & Upcoming Bell */}
          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Live Clock Display */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Waktu Indonesia Barat (WIB)
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                {wibTime.timeString}
              </div>
              <p className="text-xs text-slate-400">
                Zona Waktu: Asia/Jakarta (GMT+7)
              </p>
            </div>

            {/* Upcoming Bell Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5" /> Bel Berikutnya
                </span>
                {upcomingBell.schedule && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {upcomingBell.schedule.time} WIB
                  </span>
                )}
              </div>

              {upcomingBell.schedule ? (
                <div>
                  <h4 className="text-sm font-semibold text-white line-clamp-1">
                    {upcomingBell.schedule.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                      {upcomingBell.remainingText}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Suara: {upcomingBell.schedule.presetTone.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => onTriggerBell(upcomingBell.schedule!)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      title="Uji bunyikan bel ini sekarang"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Uji Bunyi</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-slate-400">
                  {upcomingBell.remainingText}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Ongoing Activity */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Kegiatan Terakhir / Sedang Berjalan:</span>
              <span className="font-medium text-white">
                {currentActivity ? currentActivity.name : 'Sebelum Kegiatan Pagi'}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('jadwal')}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Kelola Jadwal Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Status & Quick Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-400" />
              <span>Status Operasional SIBEL</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {settings.schoolSubtitle}
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Bel Hari Ini:</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {todaySchedules.length} Jadwal
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Bel Selesai:</span>
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                  {todaySchedules.filter(s => s.time < wibTime.minuteString).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Bel Tersisa:</span>
                <span className="font-mono font-semibold text-sky-400 tabular-nums">
                  {todaySchedules.filter(s => s.time >= wibTime.minuteString).length}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operator Piket:</span>
                <span className="text-slate-200 font-medium truncate max-w-[140px]">
                  {settings.operatorName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kepala Sekolah:</span>
                <span className="text-slate-200 font-medium truncate max-w-[140px]">
                  {settings.headmaster}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Volume Output:</span>
                <span className="font-mono font-semibold text-white">
                  {settings.masterVolume}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('manual')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Buka Panel Kendali Bel Manual</span>
          </button>
        </div>
      </div>

      {/* Quick Manual Bell Control Pad (Pusat Tombol Cepat) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Tombol Bunyi Cepat (Manual)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tekan untuk memutar suara bel secara instan ke pengeras suara sekolah
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Tersedia 6 Nada Utama
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* 1. Bel Masuk */}
          <button
            onClick={() => onQuickManualTone('westminster', 'Bel Masuk Sekolah')}
            className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-950/20 text-left transition-all group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400">
                Bel Masuk
              </span>
              <Play className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300">
                Masuk Kelas
              </p>
              <p className="text-[10px] text-slate-400">Westminster</p>
            </div>
          </button>

          {/* 2. Pergantian Jam */}
          <button
            onClick={() => onQuickManualTone('ding_dong', 'Pergantian Jam Pelajaran')}
            className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30 hover:border-sky-500 hover:bg-sky-950/20 text-left transition-all group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-sky-400">
                Ganti Jam
              </span>
              <Play className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-sky-300">
                Pergantian Jam
              </p>
              <p className="text-[10px] text-slate-400">Ding Dong 2 Nada</p>
            </div>
          </button>

          {/* 3. Istirahat */}
          <button
            onClick={() => onQuickManualTone('tri_chime', 'Waktu Istirahat')}
            className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500 hover:bg-amber-950/20 text-left transition-all group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-400">
                Istirahat
              </span>
              <Coffee className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300">
                Waktu Istirahat
              </p>
              <p className="text-[10px] text-slate-400">Tri-Chime</p>
            </div>
          </button>

          {/* 4. Masuk Kembali */}
          <button
            onClick={() => onQuickManualTone('ding_dong', 'Selesai Istirahat')}
            className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/30 hover:border-teal-500 hover:bg-teal-950/20 text-left transition-all group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-teal-400">
                Masuk Selesai Istirahat
              </span>
              <Play className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-teal-300">
                Masuk Kembali
              </p>
              <p className="text-[10px] text-slate-400">Ding Dong</p>
            </div>
          </button>

          {/* 5. Jam Pulang */}
          <button
            onClick={() => onQuickManualTone('westminster', 'Bel Pulang Sekolah')}
            className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 hover:border-purple-500 hover:bg-purple-950/20 text-left transition-all group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-400">
                Jam Pulang
              </span>
              <Play className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-purple-300">
                Pulang Sekolah
              </p>
              <p className="text-[10px] text-slate-400">Westminster Panjang</p>
            </div>
          </button>

          {/* 6. Bel Darurat / Evakuasi */}
          <button
            onClick={() => onQuickManualTone('siren', 'Sirene Darurat / Evakuasi')}
            className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/40 hover:border-rose-500 hover:bg-rose-950/30 text-left transition-all group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400">
                DARURAT
              </span>
              <Flame className="w-3.5 h-3.5 text-rose-400 group-hover:animate-ping" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-rose-300">
                Sirene Evakuasi
              </p>
              <p className="text-[10px] text-slate-400">Gempa / Bahaya</p>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Section: Today's Schedule Table & Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Timetable (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Jadwal Bel Hari Ini ({wibTime.dayName})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total {todaySchedules.length} bel terjadwal dan siap diputar otomatis
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('jadwal')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Ubah Jadwal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 font-semibold w-20">Waktu</th>
                  <th className="py-2.5 font-semibold">Kegiatan Bel</th>
                  <th className="py-2.5 font-semibold">Kategori</th>
                  <th className="py-2.5 font-semibold">Status Hari Ini</th>
                  <th className="py-2.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {todaySchedules.map((item) => {
                  const badge = getCategoryBadge(item.category);
                  const isPast = item.time < wibTime.minuteString;
                  const isUpcoming = item.id === upcomingBell.schedule?.id;
                  
                  return (
                    <tr 
                      key={item.id}
                      className={`hover:bg-slate-850/50 transition-colors ${
                        isUpcoming ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 font-mono font-semibold text-white whitespace-nowrap">
                        {item.time} WIB
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-white">{item.name}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400">{item.description}</div>
                        )}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] border font-medium ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        {isUpcoming ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Berikutnya ({upcomingBell.remainingText.split(' ')[0]} mnt)
                          </span>
                        ) : isPast ? (
                          <span className="text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                            Sudah Berbunyi
                          </span>
                        ) : (
                          <span className="text-slate-400">Menunggu Jam</span>
                        )}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onTriggerBell(item)}
                          className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Bunyikan sekarang"
                        >
                          Bunyikan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Bell Logs Feed (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Riwayat Pemutaran</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Log bel otomatis & manual terakhir
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('log')}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Belum ada catatan pemutaran bel
                </div>
              ) : (
                recentLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[170px]">
                        {log.scheduleName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {log.wibTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="capitalize">{log.triggerType}</span>
                      <span className={`font-medium ${
                        log.status === 'sukses' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {log.status === 'sukses' ? '✓ Berhasil' : log.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('log')}
            className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Lihat Laporan Log Lengkap (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};
