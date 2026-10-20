import React, { useState, useRef } from 'react';
import { 
  Music, 
  Upload, 
  Play, 
  Square, 
  Trash2, 
  Volume2, 
  CheckCircle, 
  Sparkles, 
  FileAudio, 
  HardDrive,
  Info
} from 'lucide-react';
import { CustomAudioItem, PresetTone } from '../types';

interface AudioLibraryViewProps {
  customAudios: CustomAudioItem[];
  onUploadAudio: (file: File) => Promise<void>;
  onDeleteCustomAudio: (id: string) => Promise<void>;
  onPlayPreset: (tone: PresetTone) => void;
  onPlayCustom: (id: string) => void;
  isPlaying: boolean;
  currentPlayingName?: string;
  onStop: () => void;
}

export const AudioLibraryView: React.FC<AudioLibraryViewProps> = ({
  customAudios,
  onUploadAudio,
  onDeleteCustomAudio,
  onPlayPreset,
  onPlayCustom,
  isPlaying,
  currentPlayingName,
  onStop,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetCatalog: {
    id: PresetTone;
    name: string;
    category: string;
    duration: string;
    description: string;
  }[] = [
    {
      id: 'westminster',
      name: 'Westminster Chime (8 Nada Klasik)',
      category: 'Jam Masuk & Pulang',
      duration: '~9.5 detik',
      description: 'Melodi lonceng gereja/sekolah klasik Indonesia (Sol-Do-Re-Mi / Do-Mi-Re-Sol)',
    },
    {
      id: 'ding_dong',
      name: 'Ding-Dong 2-Tone (Harmonik)',
      category: 'Pergantian Jam Pelajaran',
      duration: '~3.5 detik',
      description: 'Dua dentang nada harmonik Sol-Do yang jernih dan ramah di telinga',
    },
    {
      id: 'tri_chime',
      name: 'Tri-Chime 3-Tone (Naik Nada)',
      category: 'Istirahat & Masuk',
      duration: '~4.0 detik',
      description: 'Tiga nada lonceng berurutan naik untuk menandai waktu jeda istirahat',
    },
    {
      id: 'sholawat_chime',
      name: 'Melodi Islami Dhuha As-Syafi’iyah',
      category: 'Ibadah & Pembiasaan Pagi',
      duration: '~7.5 detik',
      description: 'Laras pentatonik lembut untuk panggilan sholat dhuha dan dzuhur berjamaah',
    },
    {
      id: 'fanfare',
      name: 'Fanfare Apel Pagi / Upacara',
      category: 'Upacara & Lapangan',
      duration: '~4.5 detik',
      description: 'Nada fanfare kuningan ceria untuk mengumpulkan peserta upacara bendera',
    },
    {
      id: 'buzzer',
      name: 'Buzzer Listrik Kejuruan (Bengkel)',
      category: 'Praktik & Ujian',
      duration: '~2.5 detik',
      description: 'Tiga dentuman getaran listrik frekuensi rendah untuk laboratorium dan bengkel',
    },
    {
      id: 'siren',
      name: 'Sirene Darurat / Evakuasi',
      category: 'Situasi Genting',
      duration: '~6.5 detik',
      description: 'Sirene dua nada bergelombang frekuensi tinggi untuk peringatan bahaya',
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      setUploadError('Harap pilih file audio valid (.mp3, .wav, .ogg, .m4a)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 25 MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      await onUploadAudio(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError('Gagal mengunggah file audio');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-emerald-400" />
            <span>Pustaka Nada & File Audio Bel</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gunakan melodi synthesizer berkualitas tinggi bawaan atau unggah file rekaman lagu / mars sekolah sendiri
          </p>
        </div>

        {isPlaying && (
          <button
            onClick={onStop}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Hentikan Audio ({currentPlayingName})</span>
          </button>
        )}
      </div>

      {/* Preset Synthesizer Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Nada Bawaan (Web Audio Synthesizer)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dihasilkan langsung secara matematis tanpa ketergantungan koneksi internet
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {presetCatalog.length} Melodi Siap Pakai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presetCatalog.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {preset.category}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {preset.duration}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2">
                  {preset.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => onPlayPreset(preset.id)}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors mt-2"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Tes Dengar Nada</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Audio Uploader Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Unggah File Audio Kustom (MP3 / WAV / OGG)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simpan lagu mars sekolah, rekaman suara instruksi guru, atau nada bel khusus ke IndexedDB browser
            </p>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            Tersimpan Aman di Browser Komputer
          </span>
        </div>

        {/* Upload Dropzone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-emerald-950/10 space-y-3"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {isUploading ? 'Sedang memproses audio...' : 'Klik untuk memilih file audio'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Mendukung format MP3, WAV, OGG, M4A hingga 25 MB
            </p>
          </div>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
            {uploadError}
          </div>
        )}

        {/* Uploaded Audio Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white">
              Daftar File Audio Kustom ({customAudios.length})
            </h4>
          </div>

          {customAudios.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500">
              Belum ada file audio yang diunggah. Silakan klik area di atas untuk menambahkan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-4 font-semibold">Nama File</th>
                    <th className="py-2.5 px-4 font-semibold">Ukuran</th>
                    <th className="py-2.5 px-4 font-semibold">Tanggal Unggah</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customAudios.map((audio) => (
                    <tr key={audio.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span>{audio.name}</span>
                          <p className="text-[10px] text-slate-500 font-mono">{audio.fileName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {formatFileSize(audio.fileSize)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(audio.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onPlayCustom(audio.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors font-medium flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Putar</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus file audio "${audio.name}"?`)) {
                                onDeleteCustomAudio(audio.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                            title="Hapus file audio ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
