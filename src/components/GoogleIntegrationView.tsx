import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  HardDrive,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { SchoolSettings, ScheduleItem } from '../types';
import { googleSyncService, GAS_SCRIPT_CODE } from '../services/googleSyncService';

interface GoogleIntegrationViewProps {
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  schedules: ScheduleItem[];
  onUpdateSchedules: (schedules: ScheduleItem[]) => void;
}

export const GoogleIntegrationView: React.FC<GoogleIntegrationViewProps> = ({
  settings,
  onUpdateSettings,
  schedules,
  onUpdateSchedules,
}) => {
  const [scriptUrl, setScriptUrl] = useState(settings.googleScriptUrl || '');
  const [autoSync, setAutoSync] = useState(settings.autoSyncGoogleSheet || false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSaveConfig = () => {
    const updated = {
      ...settings,
      googleScriptUrl: scriptUrl.trim(),
      autoSyncGoogleSheet: autoSync,
    };
    onUpdateSettings(updated);
    setTestResult({ success: true, message: 'Pengaturan integrasi Google disimpan di browser!' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) {
      setTestResult({ success: false, message: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await googleSyncService.testConnection(scriptUrl.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      onUpdateSettings({
        ...settings,
        googleScriptUrl: scriptUrl.trim(),
        lastSyncTime: new Date().toLocaleTimeString('id-ID'),
      });
    }
  };

  const handlePushToSheet = async () => {
    if (!scriptUrl.trim()) return;

    if (!confirm(`Kirim seluruh ${schedules.length} jadwal SIBEL saat ini ke Google Sheet? Data di Sheet akan diperbarui.`)) {
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    const result = await googleSyncService.pushSchedules(scriptUrl.trim(), schedules);
    setIsSyncing(false);
    setSyncMessage(result.message);

    if (result.success) {
      onUpdateSettings({
        ...settings,
        lastSyncTime: new Date().toLocaleTimeString('id-ID'),
      });
    }
  };

  const handlePullFromSheet = async () => {
    if (!scriptUrl.trim()) return;

    if (!confirm('Tarik jadwal dari Google Sheet? Jadwal di aplikasi SIBEL akan disesuaikan dengan data di Sheet.')) {
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    const result = await googleSyncService.pullSchedules(scriptUrl.trim());
    setIsSyncing(false);

    if (result.success && result.schedules && result.schedules.length > 0) {
      onUpdateSchedules(result.schedules);
      setSyncMessage(`Berhasil memperbarui ${result.schedules.length} jadwal dari Google Sheet!`);
      onUpdateSettings({
        ...settings,
        lastSyncTime: new Date().toLocaleTimeString('id-ID'),
      });
    } else {
      setSyncMessage(result.message || 'Tidak ada jadwal yang diimpor.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Integrasi Database Google Sheets & Drive</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Cloud Gratis
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simpan jadwal, cadangan audio, dan riwayat bel secara permanen tanpa biaya server/Cloud SQL
              </p>
            </div>
          </div>
        </div>

        {settings.googleScriptUrl ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Google API Terpasang</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>Belum Terhubung</span>
          </div>
        )}
      </div>

      {/* Connection & Configuration Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Konfigurasi Endpoint Google Apps Script</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tempelkan URL Web App yang didapat dari Google Spreadsheet SMK As-Syafi’iyah
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL Aplikasi Web Google Script (Web App Deployment URL):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji...' : 'Tes Koneksi'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Simpan URL
                </button>
              </div>
            </div>
          </div>

          {/* Toggle Auto Log Sync */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                Sinkronisasi Riwayat Bel Otomatis ke Google Sheet
              </span>
              <span className="text-[11px] text-slate-400">
                Setiap kali bel berbunyi (otomatis/manual), data akan langsung tercatat di tab "Riwayat_Log" Spreadsheet.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !autoSync;
                setAutoSync(next);
                onUpdateSettings({ ...settings, autoSyncGoogleSheet: next });
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                autoSync ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  autoSync ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Status Alert */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Two-Way Data Sync Operations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Operasi Sinkronisasi Jadwal Bel</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sinkronkan jadwal antara aplikasi web SIBEL dan Google Sheet sekolah
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Push: SIBEL -> Google Sheet */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <UploadCloud className="w-4 h-4" />
                <span>Kirim ke Google Sheet (Upload)</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                Kirim Jadwal SIBEL ke Spreadsheet
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Menyimpan seluruh {schedules.length} jadwal yang saat ini ada di aplikasi ke tab `Jadwal_Bel` di Google Sheet.
              </p>
            </div>

            <button
              onClick={handlePushToSheet}
              disabled={isSyncing || !settings.googleScriptUrl}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 disabled:opacity-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSyncing ? 'Mengunggah...' : 'Unggah ke Google Sheet'}</span>
            </button>
          </div>

          {/* Pull: Google Sheet -> SIBEL */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                <DownloadCloud className="w-4 h-4" />
                <span>Tarik dari Google Sheet (Download)</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                Perbarui Jadwal dari Spreadsheet
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Mengambil data jadwal terbaru yang telah diedit oleh tim TU langsung di Google Sheet.
              </p>
            </div>

            <button
              onClick={handlePullFromSheet}
              disabled={isSyncing || !settings.googleScriptUrl}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 disabled:opacity-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{isSyncing ? 'Mengunduh...' : 'Tarik dari Google Sheet'}</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{syncMessage}</span>
          </div>
        )}
      </div>

      {/* Step by Step Guide & GAS Script Code */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Skrip Backend Google Apps Script (Code.gs)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Salin kode di bawah ini ke editor Apps Script di Google Sheet sekolah Anda
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode GAS'}</span>
          </button>
        </div>

        {/* 5-Step Visual Guide */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {[
            {
              step: '1',
              title: 'Buat Spreadsheet Baru',
              desc: 'Buka sheets.google.com, buat spreadsheet baru dengan nama "DATABASE SIBEL SMK AS-SYAFI’IYAH".',
            },
            {
              step: '2',
              title: 'Buka Apps Script',
              desc: 'Di menu Spreadsheet, klik: Ekstensi > Apps Script.',
            },
            {
              step: '3',
              title: 'Tempel Kode',
              desc: 'Hapus kode bawaan di editor, lalu tempel kode yang disalin di bawah ini.',
            },
            {
              step: '4',
              title: 'Jalankan setupDatabase',
              desc: 'Pilih fungsi setupDatabase dan klik "Jalankan" untuk membuat tabel dan folder Google Drive.',
            },
            {
              step: '5',
              title: 'Deploy Web App',
              desc: 'Klik Terapkan > Deployment Baru > Jenis: Aplikasi Web > Akses: "Siapa Saja (Anyone)" > Salin URL.',
            },
          ].map((item) => (
            <div key={item.step} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[11px]">
                {item.step}
              </span>
              <h5 className="font-semibold text-white mt-1">{item.title}</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Code Snippet Preview */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-xs text-slate-400 font-mono">
            <span>Code.gs — Google Apps Script</span>
            <span>JavaScript (V8)</span>
          </div>
          <pre className="p-4 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
            {GAS_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};
