import React, { useState, useRef } from 'react';
import { 
  X, 
  School, 
  Volume2, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  HardDrive
} from 'lucide-react';
import { SchoolSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetDefault: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetDefault,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportData(content);
      if (success) {
        setImportStatus('Data berhasil diimpor!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Gagal membaca file JSON. Format tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl my-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Pengaturan Sistem SIBEL
              </h3>
              <p className="text-xs text-slate-400">
                Konfigurasi identitas sekolah, audio, dan cadangan data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Identitas Sekolah */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Identitas Sekolah
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Sekolah:
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Slogan / Subtitle Lembaga:
              </label>
              <input
                type="text"
                value={formData.schoolSubtitle}
                onChange={(e) => setFormData({ ...formData, schoolSubtitle: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kepala Sekolah:
                </label>
                <input
                  type="text"
                  value={formData.headmaster}
                  onChange={(e) => setFormData({ ...formData, headmaster: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Petugas Piket / Operator Bel:
                </label>
                <input
                  type="text"
                  value={formData.operatorName}
                  onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Pengaturan Audio & TTS */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Audio & Narasi Suara
            </h4>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Volume Master Default:</span>
                <span className="font-mono text-emerald-400">{formData.masterVolume}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={formData.masterVolume}
                onChange={(e) => setFormData({ ...formData, masterVolume: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Aktifkan Suara Pengumuman Otomatis (TTS)
                </span>
                <span className="text-[11px] text-slate-400">
                  Lafalkan pengumuman narasi setelah melodi bel berbunyi
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableTtsGlobal: !formData.enableTtsGlobal })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.enableTtsGlobal ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.enableTtsGlobal ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Backup & Restore Data */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Cadangan & Pemulihan Data
            </h4>
            <p className="text-xs text-slate-400">
              Ekspor seluruh konfigurasi jadwal ke file JSON agar dapat dipindahkan antar komputer operator TU.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Unduh Cadangan (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Pulihkan Data (JSON)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            {importStatus && (
              <p className="text-xs text-emerald-400 text-center font-medium">
                {importStatus}
              </p>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Kembalikan semua jadwal dan pengaturan ke konfigurasi awal SMK As-Syafi’iyah?')) {
                    onResetDefault();
                    onClose();
                  }
                }}
                className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Jadwal ke Setelan Pabrik As-Syafi’iyah</span>
              </button>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
            >
              {saveSuccess && <Check className="w-4 h-4" />}
              <span>{saveSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
