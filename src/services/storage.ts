/**
 * SIBEL - Storage Service
 * Handles LocalStorage and IndexedDB for schedules, audio files, logs, and settings.
 */

import { ScheduleItem, SchoolSettings, BellLog, CustomAudioItem, DateOverride } from '../types';

const DB_NAME = 'sibel_school_bell_db';
const DB_VERSION = 1;
const AUDIO_STORE = 'custom_audios';

const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'SMK As-Syafi’iyah',
  schoolSubtitle: 'Pusat Keunggulan Vokasi & Pendidikan Karakter Berakhlak Mulia',
  schoolAddress: 'Jl. As-Syafi\'iyah No. 01, Jakarta Timur',
  headmaster: 'H. Drs. Ahmad Fauzi, M.Pd.',
  operatorName: 'Piket Tata Usaha / Operator Bel',
  masterVolume: 85,
  enableTtsGlobal: true,
  ttsSpeed: 0.95,
  ttsPitch: 1.0,
  currentMode: 'auto',
};

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  // SENIN - KAMIS (Reguler)
  {
    id: 'reg-01',
    time: '06:45',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Jam Masuk & Pembacaan Asmaul Husna / Doa Pagi',
    category: 'masuk',
    audioType: 'preset_tts',
    presetTone: 'westminster',
    ttsText: 'Perhatian, waktu masuk sekolah telah tiba. Seluruh siswa SMK As-Syafi’iyah dipersilakan memasuki kelas untuk membaca Asmaul Husna dan doa pagi bersama.',
    repeatCount: 1,
    isActive: true,
    description: 'Awal kegiatan pagi dan pembiasaan islami',
  },
  {
    id: 'reg-02',
    time: '07:00',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Jam Pelajaran Ke-1 Dimulai',
    category: 'pergantian',
    audioType: 'preset_tts',
    presetTone: 'ding_dong',
    ttsText: 'Jam pelajaran pertama dimulai.',
    repeatCount: 1,
    isActive: true,
    description: 'Awal KBM sesi pagi',
  },
  {
    id: 'reg-03',
    time: '07:45',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Pergantian Jam Pelajaran Ke-2',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'reg-04',
    time: '08:30',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Pergantian Jam Pelajaran Ke-3',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'reg-05',
    time: '09:15',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Pergantian Jam Pelajaran Ke-4',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'reg-06',
    time: '10:00',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Waktu Istirahat Pertama (30 Menit)',
    category: 'istirahat',
    audioType: 'preset_tts',
    presetTone: 'tri_chime',
    ttsText: 'Saatnya istirahat pertama. Selamat beristirahat, tetap jaga kebersihan lingkungan sekolah.',
    repeatCount: 1,
    isActive: true,
    description: 'Waktu makan dan Sholat Dhuha bagi yang melaksanakan',
  },
  {
    id: 'reg-07',
    time: '10:30',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Masuk Kembali & Jam Pelajaran Ke-5',
    category: 'masuk',
    audioType: 'preset_tts',
    presetTone: 'ding_dong',
    ttsText: 'Waktu istirahat telah selesai. Silakan kembali ke ruang kelas atau bengkel praktik masing-masing.',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'reg-08',
    time: '11:15',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Pergantian Jam Pelajaran Ke-6',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'reg-09',
    time: '12:00',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Istirahat Kedua & Sholat Dzuhur Berjamaah',
    category: 'ibadah',
    audioType: 'preset_tts',
    presetTone: 'sholawat_chime',
    ttsText: 'Waktu istirahat kedua dan sholat dzuhur berjamaah telah tiba. Seluruh dewan guru dan siswa SMK As-Syafi’iyah dipersilakan menuju masjid sekolah untuk melaksanakan sholat berjamaah.',
    repeatCount: 1,
    isActive: true,
    description: 'Sholat Dzuhur Berjamaah di Masjid Sekolah',
  },
  {
    id: 'reg-10',
    time: '12:45',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Masuk Kembali & Jam Pelajaran Ke-7',
    category: 'masuk',
    audioType: 'preset_tts',
    presetTone: 'ding_dong',
    ttsText: 'Waktu istirahat dan sholat dzuhur telah selesai. Jam pelajaran ketujuh dimulai.',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'reg-11',
    time: '13:30',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Pergantian Jam Pelajaran Ke-8',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'reg-12',
    time: '14:15',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Pergantian Jam Pelajaran Ke-9',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'reg-13',
    time: '15:00',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    name: 'Akhir KBM, Doa Bersama & Jam Pulang Sekolah',
    category: 'pulang',
    audioType: 'preset_tts',
    presetTone: 'westminster',
    ttsText: 'Kegiatan belajar mengajar hari ini telah selesai. Mari kita tutup dengan doa penutup majelis. Selamat pulang ke rumah masing-masing, hati-hati di jalan.',
    repeatCount: 2,
    isActive: true,
    description: 'Bel kepulangan reguler',
  },

  // SENIN PAGI KHUSUS UPACARA BENDERA
  {
    id: 'upac-01',
    time: '06:45',
    days: ['Senin'],
    name: 'Persiapan Upacara Bendera Hari Senin',
    category: 'upacara',
    audioType: 'preset_tts',
    presetTone: 'fanfare',
    ttsText: 'Perhatian, seluruh siswa, dewan guru, dan staf SMK As-Syafi’iyah dipersilakan segera berbaris tertib di lapangan upacara untuk mengikuti Upacara Bendera.',
    repeatCount: 1,
    isActive: true,
    description: 'Upacara rutin hari Senin',
  },

  // JUMAT (Jadwal Khusus Hari Jumat)
  {
    id: 'fri-01',
    time: '06:45',
    days: ['Jumat'],
    name: 'Jam Masuk & Program Imtaq / Sholat Dhuha Bersama',
    category: 'ibadah',
    audioType: 'preset_tts',
    presetTone: 'sholawat_chime',
    ttsText: 'Selamat pagi. Hari Jumat berkah, seluruh siswa SMK As-Syafi’iyah dipersilakan berkumpul di masjid sekolah untuk program Imtaq dan Sholat Dhuha bersama.',
    repeatCount: 1,
    isActive: true,
    description: 'Kegiatan keagamaan Jumat pagi',
  },
  {
    id: 'fri-02',
    time: '07:30',
    days: ['Jumat'],
    name: 'Jam Pelajaran Ke-1 (Jumat)',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'fri-03',
    time: '08:15',
    days: ['Jumat'],
    name: 'Pergantian Jam Pelajaran Ke-2 (Jumat)',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'fri-04',
    time: '09:00',
    days: ['Jumat'],
    name: 'Pergantian Jam Pelajaran Ke-3 (Jumat)',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'fri-05',
    time: '09:45',
    days: ['Jumat'],
    name: 'Istirahat Singkat Jumat (15 Menit)',
    category: 'istirahat',
    audioType: 'preset_tts',
    presetTone: 'tri_chime',
    ttsText: 'Waktu istirahat singkat hari Jumat.',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'fri-06',
    time: '10:00',
    days: ['Jumat'],
    name: 'Masuk Kembali & Jam Pelajaran Ke-4 (Jumat)',
    category: 'masuk',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'fri-07',
    time: '10:45',
    days: ['Jumat'],
    name: 'Pergantian Jam Pelajaran Ke-5 (Jumat)',
    category: 'pergantian',
    audioType: 'preset',
    presetTone: 'ding_dong',
    repeatCount: 1,
    isActive: true,
  },
  {
    id: 'fri-08',
    time: '11:30',
    days: ['Jumat'],
    name: 'Bel Pulang Jumat & Persiapan Sholat Jumat',
    category: 'pulang',
    audioType: 'preset_tts',
    presetTone: 'westminster',
    ttsText: 'Pembelajaran hari Jumat telah usai. Siswa putra segera mempersiapkan diri untuk Sholat Jumat berjamaah di masjid. Siswa putri dipersilakan pulang ke rumah masing-masing.',
    repeatCount: 2,
    isActive: true,
    description: 'Bel kepulangan hari Jumat',
  },
];

class StorageService {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initIndexedDB();
  }

  private initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // --- Schedules ---
  public getSchedules(): ScheduleItem[] {
    const raw = localStorage.getItem('sibel_schedules');
    if (!raw) {
      this.saveSchedules(INITIAL_SCHEDULES);
      return INITIAL_SCHEDULES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SCHEDULES;
    }
  }

  public saveSchedules(schedules: ScheduleItem[]): void {
    localStorage.setItem('sibel_schedules', JSON.stringify(schedules));
  }

  // --- Settings ---
  public getSettings(): SchoolSettings {
    const raw = localStorage.getItem('sibel_settings');
    if (!raw) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: SchoolSettings): void {
    localStorage.setItem('sibel_settings', JSON.stringify(settings));
  }

  // --- Logs ---
  public getLogs(): BellLog[] {
    const raw = localStorage.getItem('sibel_logs');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public addLog(entry: Omit<BellLog, 'id'>): void {
    const logs = this.getLogs();
    const newLog: BellLog = {
      ...entry,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    // Keep maximum 200 logs to preserve storage
    const updated = [newLog, ...logs].slice(0, 200);
    localStorage.setItem('sibel_logs', JSON.stringify(updated));
  }

  public clearLogs(): void {
    localStorage.removeItem('sibel_logs');
  }

  // --- Date Overrides ---
  public getDateOverrides(): DateOverride[] {
    const raw = localStorage.getItem('sibel_date_overrides');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveDateOverrides(overrides: DateOverride[]): void {
    localStorage.setItem('sibel_date_overrides', JSON.stringify(overrides));
  }

  // --- IndexedDB Custom Audios ---
  public async getCustomAudios(): Promise<CustomAudioItem[]> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async saveCustomAudio(item: CustomAudioItem): Promise<void> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteCustomAudio(id: string): Promise<void> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getCustomAudioBlob(id: string): Promise<Blob | null> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as CustomAudioItem | undefined;
        resolve(result?.blobData || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Reset to default
  public resetToDefault(): void {
    this.saveSchedules(INITIAL_SCHEDULES);
    this.saveSettings(DEFAULT_SETTINGS);
    this.clearLogs();
  }

  // Export full JSON configuration
  public exportData(): string {
    const data = {
      app: 'SIBEL-SMK-As-Syafi-iyah',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      schedules: this.getSchedules(),
      dateOverrides: this.getDateOverrides(),
      logs: this.getLogs(),
    };
    return JSON.stringify(data, null, 2);
  }

  // Import JSON configuration
  public importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.schedules && Array.isArray(data.schedules)) {
        this.saveSchedules(data.schedules);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings(data.settings);
      }
      if (data.dateOverrides && Array.isArray(data.dateOverrides)) {
        this.saveDateOverrides(data.dateOverrides);
      }
      return true;
    } catch (err) {
      console.error('Gagal mengimpor data SIBEL:', err);
      return false;
    }
  }
}

export const storage = new StorageService();
