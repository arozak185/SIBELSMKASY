import React, { useState } from 'react';
import { 
  Sliders, 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  Info, 
  AlertCircle,
  Clock,
  Sparkles,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { ScheduleMode, DateOverride } from '../types';
import { getModeLabel } from '../services/scheduler';

interface JadwalKhususViewProps {
  currentMode: ScheduleMode;
  onSetMode: (mode: ScheduleMode) => void;
  dateOverrides: DateOverride[];
  onAddDateOverride: (override: DateOverride) => void;
  onDeleteDateOverride: (id: string) => void;
}

export const JadwalKhususView: React.FC<JadwalKhususViewProps> = ({
  currentMode,
  onSetMode,
  dateOverrides,
  onAddDateOverride,
  onDeleteDateOverride,
}) => {
  const [newDate, setNewDate] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newMode, setNewMode] = useState<ScheduleMode>('libur');
  const [newNote, setNewNote] = useState('');

  const modeOptions: {
    id: ScheduleMode;
    title: string;
    desc: string;
    badge: string;
  }[] = [
    {
      id: 'auto',
      title: 'Otomatis Sesuai Kalender',
      desc: 'Sistem membaca kalender otomatis: Senin-Kamis (Reguler), Jumat (Pendek/Imtaq), Sabtu-Minggu (Libur).',
      badge: 'Rekomendasi Standar',
    },
    {
      id: 'normal',
      title: 'Paksa Mode Normal (Senin - Kamis)',
      desc: 'Memaksa sistem menjalankan pola KBM reguler penuh, mengabaikan pergantian hari.',
      badge: 'Jadwal Penuh',
    },
    {
      id: 'jumat',
      title: 'Paksa Mode Hari Jumat',
      desc: 'Memaksa sistem menjalankan pola KBM Jumat pendek (sampai persiapan sholat jumat 11:30 WIB).',
      badge: 'Jumat Berkah',
    },
    {
      id: 'ujian',
      title: 'Pekan Ujian (UKK / STS / SAS)',
      desc: 'Mode khusus saat SMK As-Syafi’iyah menyelenggarakan Ujian Semester atau Uji Kompetensi Keahlian Kejuruan.',
      badge: 'Mode Ujian',
    },
    {
      id: 'ramadhan',
      title: 'Khusus Bulan Ramadhan',
      desc: 'Jadwal KBM dipersingkat 35 menit per jam pelajaran dengan istirahat untuk tadarus Al-Quran.',
      badge: 'Ramadhan',
    },
    {
      id: 'libur',
      title: 'Mode Libur Sekolah (Hening Total)',
      desc: 'Semua bel otomatis dinonaktifkan sepenuhnya. Bel manual tetap dapat dibunyikan oleh operator jika diperlukan.',
      badge: 'Senyap',
    },
  ];

  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTitle.trim()) return;

    const override: DateOverride = {
      id: 'ovr-' + Date.now(),
      date: newDate,
      title: newTitle.trim(),
      mode: newMode,
      note: newNote.trim() || undefined,
    };

    onAddDateOverride(override);
    setNewDate('');
    setNewTitle('');
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <span>Pengaturan Mode Operasi & Hari Khusus</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Sesuaikan perilaku otomatisasi bel saat hari libur, ujian UKK, pekan pesantren kilat, atau jadwal khusus lainnya
        </p>
      </div>

      {/* Mode Selector Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Pilih Mode Operasional Saat Ini</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mode yang dipilih berlaku langsung untuk bel otomatis hari ini
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
            Aktif: {getModeLabel(currentMode)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {modeOptions.map((opt) => {
            const isSelected = currentMode === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onSetMode(opt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-emerald-950/20 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {opt.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">
                    {opt.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
                    {isSelected ? '✓ Sedang Diterapkan' : 'Klik untuk Aktifkan'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Specific Override Calendar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Pengecualian Tanggal Tertentu (Kalender Khusus)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftarkan tanggal libur nasional, hari guru, atau agenda khusus agar bel otomatis hening atau berganti mode pada tanggal tersebut
          </p>
        </div>

        {/* Form add override */}
        <form onSubmit={handleAddOverride} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pilih Tanggal:
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nama Agenda / Pengecualian:
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Libur Idul Fitri, Rapat Kerja Dewan Guru, Hari Kemerdekaan"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mode yang Dijalankan:
              </label>
              <select
                value={newMode}
                onChange={(e) => setNewMode(e.target.value as ScheduleMode)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="libur">Libur (Hening Total)</option>
                <option value="ujian">Mode Ujian / UKK</option>
                <option value="ramadhan">Mode Ramadhan</option>
                <option value="jumat">Mode Jumat Pendek</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan ke Kalender</span>
            </button>
          </div>
        </form>

        {/* Overrides Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-white">
            Daftar Tanggal Khusus Terdaftar ({dateOverrides.length})
          </h4>

          {dateOverrides.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
              Belum ada tanggal pengecualian khusus yang didaftarkan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-4 font-semibold">Tanggal</th>
                    <th className="py-2.5 px-4 font-semibold">Nama Agenda</th>
                    <th className="py-2.5 px-4 font-semibold">Mode Berjalan</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dateOverrides.map((ovr) => (
                    <tr key={ovr.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-mono font-semibold text-white whitespace-nowrap">
                        {ovr.date}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {ovr.title}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium capitalize">
                        {getModeLabel(ovr.mode)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteDateOverride(ovr.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                          title="Hapus tanggal khusus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
