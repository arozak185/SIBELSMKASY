export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export type BellCategory = 
  | 'masuk' 
  | 'pergantian' 
  | 'istirahat' 
  | 'ibadah' 
  | 'pulang' 
  | 'upacara' 
  | 'khusus';

export type AudioType = 'preset' | 'custom' | 'tts' | 'preset_tts';

export type PresetTone = 
  | 'westminster' 
  | 'ding_dong' 
  | 'tri_chime' 
  | 'fanfare' 
  | 'sholawat_chime' 
  | 'buzzer' 
  | 'siren';

export interface ScheduleItem {
  id: string;
  time: string; // HH:mm format, e.g. "06:45"
  days: DayOfWeek[];
  name: string;
  category: BellCategory;
  audioType: AudioType;
  presetTone: PresetTone;
  customAudioId?: string;
  customAudioName?: string;
  ttsText?: string;
  repeatCount: number; // 1, 2, or 3
  isActive: boolean;
  description?: string;
}

export type ScheduleMode = 
  | 'auto'       // Mengikuti hari kalender otomatis
  | 'normal'     // Paksa jadwal Senin-Kamis
  | 'jumat'      // Paksa jadwal Jumat
  | 'ujian'      // Mode Ujian (STS / SAS / UKK)
  | 'ramadhan'   // Mode Khusus Ramadhan (jam dipersingkat)
  | 'libur';     // Mode Hening (semua bel otomatis mati)

export interface CustomAudioItem {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  duration: number; // in seconds
  createdAt: string;
  blobData?: Blob;
}

export interface BellLog {
  id: string;
  timestamp: string; // ISO string
  wibTime: string;    // HH:mm:ss
  dateString: string; // YYYY-MM-DD
  scheduleName: string;
  category: BellCategory;
  triggerType: 'otomatis' | 'manual' | 'uji_coba';
  status: 'sukses' | 'gagal' | 'dihentikan';
  details: string;
}

export interface DateOverride {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  mode: ScheduleMode;
  note?: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolSubtitle: string;
  schoolAddress: string;
  headmaster: string;
  operatorName: string;
  masterVolume: number; // 0 to 100
  enableTtsGlobal: boolean;
  ttsSpeed: number; // 0.8 to 1.2
  ttsPitch: number; // 0.8 to 1.2
  currentMode: ScheduleMode;
  manualOverrideDate?: string;
  // Google Sheets & Drive Integration
  googleScriptUrl?: string;
  autoSyncGoogleSheet?: boolean;
  lastSyncTime?: string;
}
