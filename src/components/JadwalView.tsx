import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Square, 
  Edit2, 
  Copy, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  BookOpen,
  Volume2
} from 'lucide-react';
import { ScheduleItem, DayOfWeek, BellCategory, CustomAudioItem } from '../types';
import { DAY_NAMES, getCategoryBadge } from '../services/scheduler';

interface JadwalViewProps {
  schedules: ScheduleItem[];
  onAddSchedule: () => void;
  onEditSchedule: (item: ScheduleItem) => void;
  onDuplicateSchedule: (item: ScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleActive: (id: string) => void;
  onTestScheduleBell: (item: ScheduleItem) => void;
  onLoadTemplate: (templateName: 'standar' | 'ujian' | 'ramadhan') => void;
  onToggleAll: (enable: boolean) => void;
}

export const JadwalView: React.FC<JadwalViewProps> = ({
  schedules,
  onAddSchedule,
  onEditSchedule,
  onDuplicateSchedule,
  onDeleteSchedule,
  onToggleActive,
  onTestScheduleBell,
  onLoadTemplate,
  onToggleAll,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'Semua'>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter schedules
  const filteredSchedules = schedules
    .filter((item) => {
      // Day filter
      if (selectedDay !== 'Semua' && !item.days.includes(selectedDay)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.time.includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)) ||
          (item.ttsText && item.ttsText.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Manajemen Jadwal Bel Sekolah</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola seluruh jam berdering otomatis untuk hari Senin hingga Sabtu di SMK As-Syafi’iyah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Quick template loader dropdown */}
          <div className="relative group">
            <button className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Muat Template</span>
            </button>
            <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl hidden group-hover:block z-20 py-1">
              <button
                onClick={() => onLoadTemplate('standar')}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Template Standar (Senin-Kamis & Jumat)
              </button>
              <button
                onClick={() => onLoadTemplate('ujian')}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Template Ujian (UKK / STS / SAS)
              </button>
              <button
                onClick={() => onLoadTemplate('ramadhan')}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Template Khusus Ramadhan (Jam Singkat)
              </button>
            </div>
          </div>

          {/* Add schedule button */}
          <button
            onClick={onAddSchedule}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        
        {/* Day selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDay('Semua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              selectedDay === 'Semua'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            Semua Hari ({schedules.length})
          </button>
          {DAY_NAMES.filter(d => d !== 'Minggu').map((day) => {
            const count = schedules.filter(s => s.days.includes(day)).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {day} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Category row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama kegiatan, jam (misal 07:00), atau teks pengumuman..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category filter dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Kategori Bel</option>
              <option value="masuk">Jam Masuk</option>
              <option value="pergantian">Pergantian Jam</option>
              <option value="istirahat">Istirahat</option>
              <option value="ibadah">Sholat / Dhuha</option>
              <option value="pulang">Jam Pulang</option>
              <option value="upacara">Upacara / Apel</option>
              <option value="khusus">Khusus / Darurat</option>
            </select>
          </div>
        </div>

        {/* Batch actions bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Menampilkan {filteredSchedules.length} jadwal bel</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleAll(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Aktifkan Semua
            </button>
            <span>·</span>
            <button
              onClick={() => onToggleAll(false)}
              className="text-xs text-slate-400 hover:text-rose-400 hover:underline"
            >
              Nonaktifkan Semua
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {filteredSchedules.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Tidak ada jadwal ditemukan</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tidak ada jadwal bel yang sesuai dengan filter atau kata kunci pencarian saat ini.
            </p>
            <button
              onClick={onAddSchedule}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Tambah Jadwal Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold w-24">Waktu</th>
                  <th className="py-3 px-4 font-semibold">Kegiatan & Narasi</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Hari Berlaku</th>
                  <th className="py-3 px-4 font-semibold">Suara / Audio</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSchedules.map((item) => {
                  const badge = getCategoryBadge(item.category);
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-850/40 transition-colors ${
                        !item.isActive ? 'opacity-60 bg-slate-950/20' : ''
                      }`}
                    >
                      {/* Time */}
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm whitespace-nowrap">
                        {item.time} <span className="text-[10px] text-slate-500 font-normal">WIB</span>
                      </td>

                      {/* Name & TTS */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.repeatCount > 1 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {item.repeatCount}x
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.description}
                          </div>
                        )}
                        {item.ttsText && (
                          <div className="text-[10px] text-emerald-400/90 italic mt-0.5 line-clamp-1">
                            "{item.ttsText}"
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] border font-medium ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Days */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {item.days.map((d) => (
                            <span 
                              key={d} 
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                            >
                              {d.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Sound Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onTestScheduleBell(item)}
                            className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                            title="Tes dengarkan suara bel ini"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                          <span className="text-slate-300 text-xs">
                            {item.audioType === 'custom' 
                              ? (item.customAudioName || 'Audio Kustom')
                              : item.presetTone.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Active toggle switch */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleActive(item.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            item.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                          title={item.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              item.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onDuplicateSchedule(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Duplikat jadwal ini"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditSchedule(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit jadwal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus jadwal "${item.name}" (${item.time})?`)) {
                                onDeleteSchedule(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                            title="Hapus jadwal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
