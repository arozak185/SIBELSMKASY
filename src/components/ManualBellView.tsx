import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  Radio, 
  Play, 
  Square, 
  Mic, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Sparkles,
  Coffee,
  CheckCircle2,
  Send
} from 'lucide-react';
import { PresetTone } from '../types';

interface ManualBellViewProps {
  onPlayTone: (tone: PresetTone, name: string) => void;
  onBroadcastTTS: (text: string, prelude: PresetTone | 'none', repeatCount: number) => void;
  isPlaying: boolean;
  currentPlayingName?: string;
  onStop: () => void;
  simulatedTime: string | null;
  onSetSimulatedTime: (time: string | null) => void;
}

export const ManualBellView: React.FC<ManualBellViewProps> = ({
  onPlayTone,
  onBroadcastTTS,
  isPlaying,
  currentPlayingName,
  onStop,
  simulatedTime,
  onSetSimulatedTime,
}) => {
  const [announcementText, setAnnouncementText] = useState('');
  const [preludeTone, setPreludeTone] = useState<PresetTone | 'none'>('ding_dong');
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [tempSimTime, setTempSimTime] = useState('06:45');

  const soundboardItems: {
    id: PresetTone;
    title: string;
    subtitle: string;
    desc: string;
    theme: 'emerald' | 'sky' | 'amber' | 'teal' | 'purple' | 'indigo' | 'rose';
  }[] = [
    {
      id: 'westminster',
      title: 'Bel Masuk Sekolah',
      subtitle: 'Westminster Chime',
      desc: 'Diputar saat jam masuk pagi & kepulangan sekolah',
      theme: 'emerald',
    },
    {
      id: 'ding_dong',
      title: 'Pergantian Jam Pelajaran',
      subtitle: 'Ding-Dong 2 Nada',
      desc: 'Nada standar transisi antar jam pelajaran',
      theme: 'sky',
    },
    {
      id: 'tri_chime',
      title: 'Waktu Istirahat',
      subtitle: 'Tri-Chime Naik',
      desc: 'Diputar saat jeda istirahat pertama / makan siang',
      theme: 'amber',
    },
    {
      id: 'ding_dong',
      title: 'Masuk Kembali (Selesai Istirahat)',
      subtitle: 'Ding-Dong Panggilan',
      desc: 'Mengingatkan siswa kembali ke ruang kelas / lab',
      theme: 'teal',
    },
    {
      id: 'sholawat_chime',
      title: 'Sholat Dzuhur & Ibadah',
      subtitle: 'Melodi Islami As-Syafi’iyah',
      desc: 'Nada seru sholat berjamaah & pembiasaan pagi',
      theme: 'emerald',
    },
    {
      id: 'fanfare',
      title: 'Apel Pagi & Upacara',
      subtitle: 'Fanfare Brass',
      desc: 'Pengumuman baris lapangan upacara & apel sekolah',
      theme: 'indigo',
    },
    {
      id: 'buzzer',
      title: 'Buzzer Listrik Kejuruan',
      subtitle: 'Electric Buzzer',
      desc: 'Sinyal bengkel praktik, ujian teknis & batas waktu',
      theme: 'purple',
    },
  ];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    onBroadcastTTS(announcementText.trim(), preludeTone, repeatCount);
  };

  const handleEmergencyTrigger = () => {
    setShowEmergencyConfirm(false);
    onPlayTone('siren', 'Sirene Darurat / Evakuasi Bahaya');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span>Pusat Kendali Bel Manual & Siaran Suara</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Putar nada bel secara instan kapan saja atau siarkan pengumuman suara ke pengeras suara SMK As-Syafi’iyah
          </p>
        </div>

        {isPlaying && (
          <button
            onClick={onStop}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Hentikan Suara ({currentPlayingName})</span>
          </button>
        )}
      </div>

      {/* Main Soundboard Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>Papan Tombol Nada Bel Sekolah (Soundboard)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {soundboardItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-3 transition-all hover:bg-slate-850/60 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {item.subtitle}
                  </span>
                  <Bell className="w-4 h-4 text-slate-500" />
                </div>
                <h4 className="text-sm font-bold text-white mt-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => onPlayTone(item.id, item.title)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Bunyikan Sekarang</span>
              </button>
            </div>
          ))}

          {/* Emergency Siren Card (Highlighted in Rose) */}
          <div className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  Bahaya / Evakuasi
                </span>
                <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                Sirene Bel Darurat
              </h4>
              <p className="text-xs text-rose-300/80 mt-1">
                Dipakai khusus situasi genting: Kebakaran, Gempa Bumi, atau Evakuasi Gedung
              </p>
            </div>

            <button
              onClick={() => setShowEmergencyConfirm(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-98 shadow-md"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Bunyikan Sirene Darurat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Voice Broadcast Announcer (TTS Synthesizer) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Siaran Pengumuman Suara Operator (Text-to-Speech)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ketik pesan apa saja dan sistem akan melafalkannya dalam Bahasa Indonesia dengan nada pembuka
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Sintesis Suara id-ID
          </span>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Isi Teks Pengumuman Sekolah:
            </label>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              rows={3}
              placeholder="Contoh: Perhatian kepada seluruh ketua kelas X Teknik Komputer dan Jaringan serta Rekayasa Perangkat Lunak, harap berkumpul di ruang guru sekarang juga..."
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Quick Announcement Templates */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Templat Cepat:</span>
            {[
              {
                label: 'Panggilan OSIS',
                text: 'Perhatian kepada seluruh pengurus OSIS SMK As-Syafi’iyah, diharapkan berkumpul di ruang OSIS setelah bel istirahat.',
              },
              {
                label: 'Himbauan Kebersihan',
                text: 'Perhatian kepada seluruh siswa, mari kita jaga kebersihan kelas dan lingkungan sekolah. Buanglah sampah pada tempatnya.',
              },
              {
                label: 'Sholat Dzuhur',
                text: 'Waktu sholat dzuhur berjamaah telah tiba. Seluruh dewan guru dan siswa dipersilakan menuju masjid sekolah.',
              },
              {
                label: 'Persiapan Pulang',
                text: 'Waktu pembelajaran hari ini telah usai. Rapikan meja kursi dan pastikan tidak ada barang yang tertinggal sebelum pulang.',
              },
            ].map((tmpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAnnouncementText(tmpl.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Broadcast Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            {/* Tone Prelude */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nada Bel Pembuka Sebelum Bicara:
              </label>
              <select
                value={preludeTone}
                onChange={(e) => setPreludeTone(e.target.value as PresetTone | 'none')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ding_dong">Ding Dong 2 Nada (Rekomendasi Pengumuman)</option>
                <option value="tri_chime">Tri-Chime</option>
                <option value="westminster">Westminster Chime</option>
                <option value="fanfare">Fanfare Apel</option>
                <option value="none">Langsung Bicara (Tanpa Nada)</option>
              </select>
            </div>

            {/* Repeat count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pengulangan Siaran:
              </label>
              <div className="flex gap-2">
                {[1, 2].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setRepeatCount(num)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      repeatCount === num
                        ? 'bg-slate-800 text-emerald-400 border-slate-600'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num}x Siar
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="submit"
              disabled={isPlaying}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Siarkan ke Pengeras Suara Sekolah</span>
            </button>
          </div>
        </form>
      </div>

      {/* Simulator Mode Bar (Testing Helper) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Mode Uji Coba & Simulasi Waktu Bel</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Uji jadwal bel sekolah otomatis pada jam tertentu tanpa menunggu jam aslinya tiba
            </p>
          </div>

          {simulatedTime ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-mono">
                Simulasi Aktif: {simulatedTime} WIB
              </span>
              <button
                onClick={() => onSetSimulatedTime(null)}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700"
              >
                Kembalikan Waktu Asli
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={tempSimTime}
                onChange={(e) => setTempSimTime(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
              />
              <button
                onClick={() => onSetSimulatedTime(tempSimTime)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                Setel Jam Simulasi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Confirmation Modal */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Konfirmasi Sirene Darurat
                </h3>
                <p className="text-xs text-rose-300">
                  Peringatan Evakuasi Keselamatan Sekolah
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Anda akan memutar sirene darurat bervolume tinggi di seluruh area SMK As-Syafi’iyah. Pastikan tindakan ini dilakukan untuk evakuasi nyata atau latihan simulasi resmi.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEmergencyConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={handleEmergencyTrigger}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-colors"
              >
                Ya, Bunyikan Sirene Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
