import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getWibTime, 
  WibTimeInfo, 
  getEffectiveDay, 
  getTodaySchedules, 
  getUpcomingBell, 
  getCurrentActivity 
} from './services/scheduler';
import { audioEngine } from './services/audioEngine';
import { storage, INITIAL_SCHEDULES } from './services/storage';
import { 
  ScheduleItem, 
  SchoolSettings, 
  BellLog, 
  CustomAudioItem, 
  DateOverride, 
  PresetTone, 
  ScheduleMode 
} from './types';

import { TopNavbar } from './components/TopNavbar';
import { AudioVisualizerBanner } from './components/AudioVisualizerBanner';
import { DashboardView } from './components/DashboardView';
import { JadwalView } from './components/JadwalView';
import { ManualBellView } from './components/ManualBellView';
import { AudioLibraryView } from './components/AudioLibraryView';
import { JadwalKhususView } from './components/JadwalKhususView';
import { LogView } from './components/LogView';
import { KioskView } from './components/KioskView';
import { ScheduleModal } from './components/ScheduleModal';
import { SettingsModal } from './components/SettingsModal';
import { GoogleIntegrationView } from './components/GoogleIntegrationView';
import { googleSyncService } from './services/googleSyncService';

export default function App() {
  // --- Persistent State ---
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => storage.getSchedules());
  const [settings, setSettings] = useState<SchoolSettings>(() => storage.getSettings());
  const [logs, setLogs] = useState<BellLog[]>(() => storage.getLogs());
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>(() => storage.getDateOverrides());
  const [customAudios, setCustomAudios] = useState<CustomAudioItem[]>([]);

  // --- UI Navigation & Modals ---
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // --- Real-time Clock & Scheduler ---
  const [wibTime, setWibTime] = useState<WibTimeInfo>(() => getWibTime());
  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);
  const lastTriggeredKeyRef = useRef<string | null>(null);

  // --- Audio State ---
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackName, setCurrentTrackName] = useState<string | undefined>(undefined);

  // Load custom audios from IndexedDB on mount
  useEffect(() => {
    storage.getCustomAudios().then(audios => {
      setCustomAudios(audios);
    }).catch(err => {
      console.warn('Gagal memuat pustaka audio kustom:', err);
    });

    audioEngine.setPlaybackListener((playing, track) => {
      setIsPlaying(playing);
      setCurrentTrackName(track);
    });

    audioEngine.setMasterVolume(settings.masterVolume);
  }, []);

  // Update master volume when settings change
  useEffect(() => {
    audioEngine.setMasterVolume(settings.masterVolume);
  }, [settings.masterVolume]);

  // Audio unlock helper
  const handleUnlockAudio = async () => {
    const success = await audioEngine.unlockAudio();
    setIsAudioUnlocked(success);
    if (success) {
      // Play a very subtle pleasant chime confirmation
      await audioEngine.playDingDong();
    }
  };

  // Determine current active mode considering date overrides
  const effectiveMode: ScheduleMode = (() => {
    const dateOverride = dateOverrides.find(o => o.date === wibTime.dateString);
    if (dateOverride) {
      return dateOverride.mode;
    }
    return settings.currentMode;
  })();

  // Current effective day
  const effectiveDay = getEffectiveDay(wibTime.dayName, effectiveMode);

  // Filter schedules for today
  const todaySchedules = getTodaySchedules(schedules, effectiveDay, effectiveMode);

  // Calculate upcoming bell and current activity
  const activeMinute = simulatedTime || wibTime.minuteString;
  const upcomingBell = getUpcomingBell(todaySchedules, activeMinute, wibTime.seconds);
  const currentActivity = getCurrentActivity(todaySchedules, activeMinute);

  // --- Trigger Bell Execution Function ---
  const executeBell = useCallback(async (
    item: {
      name: string;
      category: ScheduleItem['category'];
      audioType: ScheduleItem['audioType'];
      presetTone: PresetTone;
      customAudioId?: string;
      ttsText?: string;
      repeatCount?: number;
    },
    triggerType: 'otomatis' | 'manual' | 'uji_coba'
  ) => {
    try {
      await audioEngine.unlockAudio();
      setIsAudioUnlocked(true);

      let customBlob: Blob | null = null;
      if (item.audioType === 'custom' && item.customAudioId) {
        customBlob = await storage.getCustomAudioBlob(item.customAudioId);
      }

      const shouldSpeakTts = settings.enableTtsGlobal && (item.audioType === 'tts' || item.audioType === 'preset_tts');

      // Execute sequence
      await audioEngine.playBellSequence({
        name: item.name,
        presetTone: item.audioType === 'custom' ? undefined : item.presetTone,
        customAudioBlob: customBlob || undefined,
        ttsText: shouldSpeakTts ? item.ttsText : undefined,
        repeatCount: item.repeatCount || 1,
      });

      // Add log
      const logEntry: Omit<BellLog, 'id'> = {
        timestamp: new Date().toISOString(),
        wibTime: getWibTime().timeString,
        dateString: getWibTime().dateString,
        scheduleName: item.name,
        category: item.category,
        triggerType,
        status: 'sukses',
        details: `${item.presetTone} (${item.repeatCount || 1}x) ${shouldSpeakTts && item.ttsText ? '+ Narasi TTS' : ''}`,
      };
      storage.addLog(logEntry);
      const updatedLogs = storage.getLogs();
      setLogs(updatedLogs);

      // Auto sync log to Google Sheet in background
      if (settings.autoSyncGoogleSheet && settings.googleScriptUrl) {
        const fullLog = updatedLogs[0];
        if (fullLog) {
          googleSyncService.logBellEvent(settings.googleScriptUrl, fullLog);
        }
      }
    } catch (err) {
      console.error('Error saat memutar bel:', err);
      const logEntry: Omit<BellLog, 'id'> = {
        timestamp: new Date().toISOString(),
        wibTime: getWibTime().timeString,
        dateString: getWibTime().dateString,
        scheduleName: item.name,
        category: item.category,
        triggerType,
        status: 'gagal',
        details: String(err),
      };
      storage.addLog(logEntry);
      setLogs(storage.getLogs());
    }
  }, [settings.enableTtsGlobal]);

  // --- Second-by-Second Background Ticker ---
  useEffect(() => {
    const timer = setInterval(() => {
      const current = getWibTime();
      setWibTime(current);

      const checkMinute = simulatedTime || current.minuteString;
      const triggerKey = `${current.dateString}_${checkMinute}`;

      // Trigger automatic bell if time matches and within the first 3 seconds
      if (effectiveMode !== 'libur' && current.seconds <= 2 && lastTriggeredKeyRef.current !== triggerKey) {
        const matchingSchedule = todaySchedules.find(s => s.time === checkMinute && s.isActive);
        if (matchingSchedule) {
          lastTriggeredKeyRef.current = triggerKey;
          executeBell(matchingSchedule, simulatedTime ? 'uji_coba' : 'otomatis');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todaySchedules, effectiveMode, simulatedTime, executeBell]);

  // --- Handlers for Schedules ---
  const handleSaveSchedule = (item: ScheduleItem) => {
    const exists = schedules.some(s => s.id === item.id);
    let updated: ScheduleItem[];
    if (exists) {
      updated = schedules.map(s => s.id === item.id ? item : s);
    } else {
      updated = [...schedules, item];
    }
    setSchedules(updated);
    storage.saveSchedules(updated);
  };

  const handleDuplicateSchedule = (item: ScheduleItem) => {
    const newItem: ScheduleItem = {
      ...item,
      id: 'sch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: `${item.name} (Salinan)`,
    };
    const updated = [...schedules, newItem];
    setSchedules(updated);
    storage.saveSchedules(updated);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    storage.saveSchedules(updated);
  };

  const handleToggleScheduleActive = (id: string) => {
    const updated = schedules.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    setSchedules(updated);
    storage.saveSchedules(updated);
  };

  const handleToggleAllSchedules = (enable: boolean) => {
    const updated = schedules.map(s => ({ ...s, isActive: enable }));
    setSchedules(updated);
    storage.saveSchedules(updated);
  };

  const handleLoadTemplate = (templateName: 'standar' | 'ujian' | 'ramadhan') => {
    if (templateName === 'standar') {
      if (confirm('Muat template jadwal standar SMK As-Syafi’iyah? Jadwal saat ini akan diperbarui.')) {
        setSchedules(INITIAL_SCHEDULES);
        storage.saveSchedules(INITIAL_SCHEDULES);
      }
    } else if (templateName === 'ujian') {
      if (confirm('Terapkan template Pekan Ujian (UKK / Penilaian Semester)?')) {
        const examSchedules: ScheduleItem[] = [
          {
            id: 'ex-01',
            time: '07:15',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            name: 'Persiapan Memasuki Ruang Ujian',
            category: 'masuk',
            audioType: 'preset_tts',
            presetTone: 'westminster',
            ttsText: 'Perhatian kepada seluruh peserta ujian SMK As-Syafi’iyah, harap segera memasuki ruang ujian dengan tertib. Siapkan kartu ujian dan alat tulis.',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ex-02',
            time: '07:30',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            name: 'Pengerjaan Ujian Sesi 1 Dimulai',
            category: 'pergantian',
            audioType: 'preset_tts',
            presetTone: 'buzzer',
            ttsText: 'Ujian sesi pertama dimulai. Selamat mengerjakan dengan jujur dan teliti.',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ex-03',
            time: '09:30',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            name: 'Akhir Ujian Sesi 1 & Istirahat',
            category: 'istirahat',
            audioType: 'preset_tts',
            presetTone: 'tri_chime',
            ttsText: 'Waktu ujian sesi pertama telah selesai. Letakkan lembar jawaban dan dipersilakan istirahat.',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ex-04',
            time: '10:00',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            name: 'Masuk Ruang Ujian Sesi 2',
            category: 'masuk',
            audioType: 'preset',
            presetTone: 'ding_dong',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ex-05',
            time: '10:15',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            name: 'Pengerjaan Ujian Sesi 2 Dimulai',
            category: 'pergantian',
            audioType: 'preset_tts',
            presetTone: 'buzzer',
            ttsText: 'Ujian sesi kedua dimulai.',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ex-06',
            time: '12:00',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            name: 'Selesai Ujian Hari Ini & Sholat Berjamaah',
            category: 'pulang',
            audioType: 'preset_tts',
            presetTone: 'sholawat_chime',
            ttsText: 'Ujian hari ini telah selesai. Seluruh siswa dipersilakan menuju masjid untuk sholat berjamaah sebelum kembali ke rumah.',
            repeatCount: 2,
            isActive: true,
          },
        ];
        setSchedules(examSchedules);
        storage.saveSchedules(examSchedules);
      }
    } else if (templateName === 'ramadhan') {
      if (confirm('Terapkan template Khusus Bulan Ramadhan (Jam dipersingkat 35 menit)?')) {
        const ramadhanSchedules: ScheduleItem[] = [
          {
            id: 'ram-01',
            time: '07:30',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Jam Masuk & Tadarus Pagi Ramadhan',
            category: 'masuk',
            audioType: 'preset_tts',
            presetTone: 'sholawat_chime',
            ttsText: 'Selamat pagi. Selamat menunaikan ibadah puasa. Mari kita mulai hari dengan tadarus Al-Quran.',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ram-02',
            time: '08:00',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Jam Pelajaran Ke-1 (Ramadhan)',
            category: 'pergantian',
            audioType: 'preset',
            presetTone: 'ding_dong',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ram-03',
            time: '08:35',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Pergantian Jam Ke-2',
            category: 'pergantian',
            audioType: 'preset',
            presetTone: 'ding_dong',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ram-04',
            time: '09:10',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Pergantian Jam Ke-3',
            category: 'pergantian',
            audioType: 'preset',
            presetTone: 'ding_dong',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ram-05',
            time: '09:45',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Istirahat & Sholat Dhuha',
            category: 'ibadah',
            audioType: 'preset_tts',
            presetTone: 'tri_chime',
            ttsText: 'Waktu istirahat Ramadhan dan Sholat Dhuha.',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ram-06',
            time: '10:15',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Masuk Kembali & Jam Ke-4',
            category: 'masuk',
            audioType: 'preset',
            presetTone: 'ding_dong',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ram-07',
            time: '10:50',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Pergantian Jam Ke-5',
            category: 'pergantian',
            audioType: 'preset',
            presetTone: 'ding_dong',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ram-08',
            time: '11:25',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Pergantian Jam Ke-6',
            category: 'pergantian',
            audioType: 'preset',
            presetTone: 'ding_dong',
            repeatCount: 1,
            isActive: true,
          },
          {
            id: 'ram-09',
            time: '12:00',
            days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
            name: 'Sholat Dzuhur Berjamaah & Jam Kepulangan Ramadhan',
            category: 'pulang',
            audioType: 'preset_tts',
            presetTone: 'westminster',
            ttsText: 'KBM Ramadhan selesai. Mari melaksanakan Sholat Dzuhur berjamaah sebelum pulang.',
            repeatCount: 2,
            isActive: true,
          },
        ];
        setSchedules(ramadhanSchedules);
        storage.saveSchedules(ramadhanSchedules);
      }
    }
  };

  // --- Quick Manual Tone Handler ---
  const handleQuickManualTone = (toneName: string, label: string) => {
    executeBell(
      {
        name: label,
        category: 'khusus',
        audioType: 'preset',
        presetTone: toneName as PresetTone,
        repeatCount: 1,
      },
      'manual'
    );
  };

  // --- Broadcast TTS Live Handler ---
  const handleBroadcastTTS = async (text: string, prelude: PresetTone | 'none', repeatCount: number) => {
    await audioEngine.unlockAudio();
    setIsAudioUnlocked(true);

    if (prelude !== 'none') {
      await audioEngine.playPreset(prelude);
      await new Promise(r => setTimeout(r, 600));
    }

    for (let i = 0; i < repeatCount; i++) {
      await audioEngine.speakText(text, settings.ttsSpeed, settings.ttsPitch);
      if (i < repeatCount - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const logEntry: Omit<BellLog, 'id'> = {
      timestamp: new Date().toISOString(),
      wibTime: getWibTime().timeString,
      dateString: getWibTime().dateString,
      scheduleName: 'Siaran Pengumuman Suara (TTS)',
      category: 'khusus',
      triggerType: 'manual',
      status: 'sukses',
      details: text.slice(0, 100) + '...',
    };
    storage.addLog(logEntry);
    setLogs(storage.getLogs());
  };

  // --- Custom Audio Upload & Delete ---
  const handleUploadAudio = async (file: File) => {
    const newItem: CustomAudioItem = {
      id: 'aud-' + Date.now(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      fileSize: file.size,
      duration: 0,
      createdAt: new Date().toISOString(),
      blobData: file,
    };

    await storage.saveCustomAudio(newItem);
    const updated = await storage.getCustomAudios();
    setCustomAudios(updated);
  };

  const handleDeleteCustomAudio = async (id: string) => {
    await storage.deleteCustomAudio(id);
    const updated = await storage.getCustomAudios();
    setCustomAudios(updated);
  };

  const handlePlayCustom = async (id: string) => {
    const blob = await storage.getCustomAudioBlob(id);
    const audioItem = customAudios.find(a => a.id === id);
    if (blob) {
      await audioEngine.playAudioBlob(blob, audioItem?.name || 'Audio Kustom', 1);
    }
  };

  // --- Date Overrides Handlers ---
  const handleAddDateOverride = (override: DateOverride) => {
    const updated = [...dateOverrides, override];
    setDateOverrides(updated);
    storage.saveDateOverrides(updated);
  };

  const handleDeleteDateOverride = (id: string) => {
    const updated = dateOverrides.filter(o => o.id !== id);
    setDateOverrides(updated);
    storage.saveDateOverrides(updated);
  };

  // --- Settings Handlers ---
  const handleSaveSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleExportData = () => {
    const jsonStr = storage.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIBEL_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string): boolean => {
    const ok = storage.importData(jsonStr);
    if (ok) {
      setSchedules(storage.getSchedules());
      setSettings(storage.getSettings());
      setDateOverrides(storage.getDateOverrides());
      setLogs(storage.getLogs());
    }
    return ok;
  };

  const handleResetDefault = () => {
    storage.resetToDefault();
    setSchedules(storage.getSchedules());
    setSettings(storage.getSettings());
    setLogs(storage.getLogs());
    setDateOverrides(storage.getDateOverrides());
  };

  // If in Kiosk Mode, render the fullscreen Kiosk view
  if (isKioskMode) {
    return (
      <KioskView
        wibTime={wibTime}
        upcomingBell={upcomingBell}
        currentActivity={currentActivity}
        todaySchedules={todaySchedules}
        settings={settings}
        isPlaying={isPlaying}
        currentTrackName={currentTrackName}
        onStop={() => audioEngine.stopAll()}
        onExitKiosk={() => setIsKioskMode(false)}
        onQuickManualTone={handleQuickManualTone}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      
      <div>
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          wibTimeString={wibTime.timeString}
          isAudioUnlocked={isAudioUnlocked}
          onUnlockAudio={handleUnlockAudio}
          masterVolume={settings.masterVolume}
          onVolumeChange={(vol) => {
            const updated = { ...settings, masterVolume: vol };
            setSettings(updated);
            storage.saveSettings(updated);
          }}
          settings={settings}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onEnterKiosk={() => setIsKioskMode(true)}
        />

        {/* Live Audio Visualizer Banner (Appears when bell rings) */}
        <AudioVisualizerBanner
          isPlaying={isPlaying}
          currentTrackName={currentTrackName}
          onStop={() => audioEngine.stopAll()}
        />

        {/* Main Content Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              wibTime={wibTime}
              upcomingBell={upcomingBell}
              currentActivity={currentActivity}
              todaySchedules={todaySchedules}
              settings={settings}
              isAudioUnlocked={isAudioUnlocked}
              onUnlockAudio={handleUnlockAudio}
              onTriggerBell={(item) => executeBell(item, 'manual')}
              onQuickManualTone={handleQuickManualTone}
              recentLogs={logs}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'jadwal' && (
            <JadwalView
              schedules={schedules}
              onAddSchedule={() => {
                setEditingScheduleItem(null);
                setIsScheduleModalOpen(true);
              }}
              onEditSchedule={(item) => {
                setEditingScheduleItem(item);
                setIsScheduleModalOpen(true);
              }}
              onDuplicateSchedule={handleDuplicateSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              onToggleActive={handleToggleScheduleActive}
              onTestScheduleBell={(item) => executeBell(item, 'uji_coba')}
              onLoadTemplate={handleLoadTemplate}
              onToggleAll={handleToggleAllSchedules}
            />
          )}

          {activeTab === 'manual' && (
            <ManualBellView
              onPlayTone={(tone, name) => executeBell({
                name,
                category: 'khusus',
                audioType: 'preset',
                presetTone: tone,
                repeatCount: 1,
              }, 'manual')}
              onBroadcastTTS={handleBroadcastTTS}
              isPlaying={isPlaying}
              currentPlayingName={currentTrackName}
              onStop={() => audioEngine.stopAll()}
              simulatedTime={simulatedTime}
              onSetSimulatedTime={setSimulatedTime}
            />
          )}

          {activeTab === 'audio' && (
            <AudioLibraryView
              customAudios={customAudios}
              onUploadAudio={handleUploadAudio}
              onDeleteCustomAudio={handleDeleteCustomAudio}
              onPlayPreset={(tone) => audioEngine.playPreset(tone)}
              onPlayCustom={handlePlayCustom}
              isPlaying={isPlaying}
              currentPlayingName={currentTrackName}
              onStop={() => audioEngine.stopAll()}
            />
          )}

          {activeTab === 'khusus' && (
            <JadwalKhususView
              currentMode={settings.currentMode}
              onSetMode={(mode) => {
                const updated = { ...settings, currentMode: mode };
                setSettings(updated);
                storage.saveSettings(updated);
              }}
              dateOverrides={dateOverrides}
              onAddDateOverride={handleAddDateOverride}
              onDeleteDateOverride={handleDeleteDateOverride}
            />
          )}

          {activeTab === 'log' && (
            <LogView
              logs={logs}
              onClearLogs={() => {
                storage.clearLogs();
                setLogs([]);
              }}
            />
          )}

          {activeTab === 'google' && (
            <GoogleIntegrationView
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                storage.saveSettings(newSettings);
              }}
              schedules={schedules}
              onUpdateSchedules={(newSchedules) => {
                setSchedules(newSchedules);
                storage.saveSchedules(newSchedules);
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            SIBEL — Sistem Informasi Bel Sekolah · {settings.schoolName}
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            Zona Waktu: Asia/Jakarta (WIB) · Operator: {settings.operatorName}
          </p>
        </div>
      </footer>

      {/* Schedule Edit/Add Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        editingItem={editingScheduleItem}
        customAudios={customAudios}
        onPreviewTone={(tone) => audioEngine.playPreset(tone)}
        onPreviewTTS={(text) => audioEngine.speakText(text, settings.ttsSpeed, settings.ttsPitch)}
        onPreviewCustom={handlePlayCustom}
        isAudioPlaying={isPlaying}
        onStopAudio={() => audioEngine.stopAll()}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetDefault={handleResetDefault}
      />
    </div>
  );
}
