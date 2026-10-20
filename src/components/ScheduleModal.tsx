import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Volume2, 
  Play, 
  Square, 
  HelpCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { ScheduleItem, DayOfWeek, BellCategory, AudioType, PresetTone, CustomAudioItem } from '../types';
import { DAY_NAMES } from '../services/scheduler';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ScheduleItem) => void;
  editingItem: ScheduleItem | null;
  customAudios: CustomAudioItem[];
  onPreviewTone: (tone: PresetTone) => void;
  onPreviewTTS: (text: string) => void;
  onPreviewCustom: (id: string) => void;
  isAudioPlaying: boolean;
  onStopAudio: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  customAudios,
  onPreviewTone,
  onPreviewTTS,
  onPreviewCustom,
  isAudioPlaying,
  onStopAudio,
}) => {
  const [time, setTime] = useState('07:00');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BellCategory>('pergantian');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['Senin', 'Selasa', 'Rabu', 'Kamis']);
  const [audioType, setAudioType] = useState<AudioType>('preset');
  const [presetTone, setPresetTone] = useState<PresetTone>('ding_dong');
  const [customAudioId, setCustomAudioId] = useState<string>('');
  const [ttsText, setTtsText] = useState('');
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTime(editingItem.time);
      setName(editingItem.name);
      setCategory(editingItem.category);
      setSelectedDays(editingItem.days);
      setAudioType(editingItem.audioType);
      setPresetTone(editingItem.presetTone);
      setCustomAudioId(editingItem.customAudioId || '');
      setTtsText(editingItem.ttsText || '');
      setRepeatCount(editingItem.repeatCount || 1);
      setIsActive(editingItem.isActive);
      setDescription(editingItem.description || '');
    } else {
      setTime('07:00');
      setName('');
      setCategory('pergantian');
      setSelectedDays(['Senin', 'Selasa', 'Rabu', 'Kamis']);
      setAudioType('preset');
      setPresetTone('ding_dong');
      setCustomAudioId(customAudios[0]?.id || '');
      setTtsText('');
      setRepeatCount(1);
      setIsActive(true);
      setDescription('');
    }
  }, [editingItem, customAudios, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSelectDaysPreset = (preset: 'senin-kamis' | 'senin-jumat' | 'senin-sabtu' | 'jumat' | 'semua') => {
    switch (preset) {
      case 'senin-kamis':
        setSelectedDays(['Senin', 'Selasa', 'Rabu', 'Kamis']);
        break;
      case 'senin-jumat':
        setSelectedDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
        break;
      case 'senin-sabtu':
        setSelectedDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
        break;
      case 'jumat':
        setSelectedDays(['Jumat']);
        break;
      case 'semua':
        setSelectedDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const customAudio = customAudios.find(a => a.id === customAudioId);

    const newItem: ScheduleItem = {
      id: editingItem ? editingItem.id : 'sch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      time,
      name: name.trim(),
      category,
      days: selectedDays,
      audioType,
      presetTone,
      customAudioId: audioType === 'custom' ? customAudioId : undefined,
      customAudioName: audioType === 'custom' ? customAudio?.name : undefined,
      ttsText: (audioType === 'tts' || audioType === 'preset_tts') ? ttsText.trim() : undefined,
      repeatCount,
      isActive,
      description: description.trim() || undefined,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              {editingItem ? 'Edit Jadwal Bel' : 'Tambah Jadwal Bel Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Atur waktu berdering, hari aktif, dan jenis nada bel untuk SMK As-Syafi’iyah
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Time & Title Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Time Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Jam Berdering (WIB)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Title / Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Kegiatan / Bel
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Jam Masuk Pagi, Istirahat 1, Pergantian Jam Ke-3"
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kategori Bel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'masuk', label: 'Jam Masuk' },
                { id: 'pergantian', label: 'Pergantian Jam' },
                { id: 'istirahat', label: 'Istirahat' },
                { id: 'ibadah', label: 'Sholat / Dhuha' },
                { id: 'pulang', label: 'Jam Pulang' },
                { id: 'upacara', label: 'Upacara / Apel' },
                { id: 'khusus', label: 'Khusus / Lainnya' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as BellCategory)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                    category === cat.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Hari Berlaku
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Pilihan Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleSelectDaysPreset('senin-kamis')}
                  className="hover:text-emerald-400 underline"
                >
                  Sen-Kam
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleSelectDaysPreset('jumat')}
                  className="hover:text-emerald-400 underline"
                >
                  Jumat
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleSelectDaysPreset('senin-jumat')}
                  className="hover:text-emerald-400 underline"
                >
                  Sen-Jum
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleSelectDaysPreset('semua')}
                  className="hover:text-emerald-400 underline"
                >
                  Semua
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {DAY_NAMES.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-1 text-center text-xs font-medium rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Type Selection */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Jenis Suara Bel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'preset', label: 'Nada Bawaan' },
                { id: 'preset_tts', label: 'Nada + Suara TTS' },
                { id: 'custom', label: 'File Kustom' },
                { id: 'tts', label: 'Hanya Suara TTS' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setAudioType(t.id as AudioType)}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-colors ${
                    audioType === t.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* If preset or preset_tts: Select Preset Tone */}
            {(audioType === 'preset' || audioType === 'preset_tts') && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Pilih Melodi Nada Bel:
                  </span>
                  {isAudioPlaying ? (
                    <button
                      type="button"
                      onClick={onStopAudio}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs text-rose-400 hover:text-rose-300"
                    >
                      <Square className="w-3 h-3 fill-current" /> Stop
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPreviewTone(presetTone)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30"
                    >
                      <Play className="w-3 h-3 fill-current" /> Tes Nada Ini
                    </button>
                  )}
                </div>

                <select
                  value={presetTone}
                  onChange={(e) => setPresetTone(e.target.value as PresetTone)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="westminster">Westminster Chime (4/8 Nada Klasik Sekolah)</option>
                  <option value="ding_dong">Ding Dong 2 Nada (Harmonik Halus)</option>
                  <option value="tri_chime">Tri-Chime (3 Nada Naik - Istirahat / Selesai)</option>
                  <option value="sholawat_chime">Melodi Islami As-Syafi’iyah (Dhuha / Ibadah)</option>
                  <option value="fanfare">Fanfare Upacara / Apel Pagi</option>
                  <option value="buzzer">Buzzer Listrik Elektronik</option>
                  <option value="siren">Sirene Darurat / Evakuasi</option>
                </select>
              </div>
            )}

            {/* If custom audio */}
            {audioType === 'custom' && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-medium text-slate-300">
                  Pilih File Audio Kustom:
                </span>
                {customAudios.length === 0 ? (
                  <p className="text-xs text-amber-400/90">
                    Belum ada file audio yang diunggah. Silakan unggah terlebih dahulu di menu "Pustaka Audio".
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={customAudioId}
                      onChange={(e) => setCustomAudioId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    >
                      {customAudios.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.fileName})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onPreviewCustom(customAudioId)}
                      className="px-3 py-2 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                    >
                      Putar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* If TTS or Preset+TTS: Text Input */}
            {(audioType === 'tts' || audioType === 'preset_tts') && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Teks Narasi Pengumuman (Bahasa Indonesia):
                  </span>
                  <button
                    type="button"
                    onClick={() => onPreviewTTS(ttsText || 'Contoh pengumuman suara bel sekolah SMK As-Syafi’iyah.')}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    <Play className="w-3 h-3 fill-current" /> Dengar Suara
                  </button>
                </div>

                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Saatnya jam pelajaran kedua dimulai. Selamat belajar dan berkarya."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                />

                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
                  <span className="text-slate-500">Contoh:</span>
                  <button
                    type="button"
                    onClick={() => setTtsText('Waktu istirahat pertama telah tiba. Selamat beristirahat.')}
                    className="hover:text-emerald-400 underline"
                  >
                    Istirahat 1
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setTtsText('Waktu istirahat telah usai, silakan masuk kembali ke ruang kelas.')}
                    className="hover:text-emerald-400 underline"
                  >
                    Masuk Kembali
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setTtsText('Waktu sholat dzuhur berjamaah telah tiba. Seluruh siswa menuju masjid.')}
                    className="hover:text-emerald-400 underline"
                  >
                    Sholat Dzuhur
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Repetition & Active Toggle */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Repeat count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pengulangan Nada
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setRepeatCount(num)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      repeatCount === num
                        ? 'bg-slate-800 text-emerald-400 border-slate-600'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num}x Putar
                  </button>
                ))}
              </div>
            </div>

            {/* Is Active Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Status Jadwal
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                <span>{isActive ? 'Aktif (Akan Berbunyi Otomatis)' : 'Nonaktif (Hening)'}</span>
                <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              </button>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan / Deskripsi Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Berlaku khusus sesi praktik jurusan RPL & TKJ"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
            >
              {editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
