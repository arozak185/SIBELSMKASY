/**
 * SIBEL - Google Sheets & Google Drive Integration Service
 * Bridges SIBEL web app with Google Sheets (as relational database) and Google Drive (as audio file storage)
 * using Google Apps Script (GAS) Web App endpoint.
 */

import { ScheduleItem, SchoolSettings, BellLog } from '../types';

export const GAS_SCRIPT_CODE = `/**
 * =========================================================================
 * SIBEL — SISTEM INFORMASI BEL SEKOLAH SMK AS-SYAFI'IYAH
 * Backend API Google Apps Script (Database Google Sheets & Google Drive)
 * =========================================================================
 * 
 * PETUNJUK INSTALASI CEPAT:
 * 1. Buka https://sheets.google.com dan buat Spreadsheet Baru bernama:
 *    "DATABASE SIBEL SMK AS-SYAFI'IYAH"
 * 2. Di menu Spreadsheet, klik: Ekstensi > Apps Script
 * 3. Hapus semua kode yang ada di editor, lalu Salin & Tempel seluruh skrip ini.
 * 4. Klik menu dropdown fungsi, pilih "setupDatabase", lalu klik tombol "Jalankan" (Run).
 *    (Berikan izin Google saat diminta pertama kali).
 * 5. Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Deployment Baru" (New deployment).
 * 6. Pilih Jenis: "Aplikasi Web" (Web app).
 * 7. Setel:
 *    - Deskripsi: SIBEL API v1
 *    - Jalankan sebagai: Saya (Akun Anda)
 *    - Yang memiliki akses: Siapa saja (Anyone) -> Ini penting agar web app SIBEL bisa terhubung!
 * 8. Klik "Terapkan", lalu SALIN "URL Aplikasi Web" (contoh: https://script.google.com/macros/s/.../exec)
 * 9. Tempelkan URL tersebut ke menu Integrasi Google di aplikasi SIBEL!
 */

const SHEET_JADWAL = 'Jadwal_Bel';
const SHEET_PENGATURAN = 'Pengaturan';
const SHEET_LOG = 'Riwayat_Log';
const DRIVE_FOLDER_NAME = 'SIBEL_Audio_AsSyafi’iyah';

// Inisialisasi awal tabel dan folder Google Drive
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Buat / Siapkan Sheet Jadwal_Bel
  let sheetJadwal = ss.getSheetByName(SHEET_JADWAL);
  if (!sheetJadwal) {
    sheetJadwal = ss.insertSheet(SHEET_JADWAL);
    sheetJadwal.appendRow(['ID', 'Waktu (WIB)', 'Nama Bel / Kegiatan', 'Kategori', 'Hari', 'Tipe Audio', 'Nada Bawaan', 'ID File Drive / Nama Audio', 'Teks Narasi TTS', 'Pengulangan', 'Status Aktif', 'Catatan']);
    sheetJadwal.getRange(1, 1, 1, 12).setBackground('#047857').setFontColor('#ffffff').setFontWeight('bold');
    sheetJadwal.setFrozenRows(1);
  }

  // 2. Buat / Siapkan Sheet Pengaturan
  let sheetPengaturan = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheetPengaturan) {
    sheetPengaturan = ss.insertSheet(SHEET_PENGATURAN);
    sheetPengaturan.appendRow(['Kunci', 'Nilai', 'Keterangan']);
    sheetPengaturan.getRange(1, 1, 1, 3).setBackground('#047857').setFontColor('#ffffff').setFontWeight('bold');
    sheetPengaturan.appendRow(['schoolName', 'SMK As-Syafi’iyah', 'Nama Sekolah']);
    sheetPengaturan.appendRow(['masterVolume', '85', 'Volume Default (0-100)']);
    sheetPengaturan.appendRow(['currentMode', 'auto', 'Mode Bel Aktif']);
    sheetPengaturan.setFrozenRows(1);
  }

  // 3. Buat / Siapkan Sheet Riwayat_Log
  let sheetLog = ss.getSheetByName(SHEET_LOG);
  if (!sheetLog) {
    sheetLog = ss.insertSheet(SHEET_LOG);
    sheetLog.appendRow(['ID', 'Timestamp (ISO)', 'Waktu WIB', 'Tanggal', 'Nama Bel', 'Kategori', 'Pemicu', 'Status', 'Rincian']);
    sheetLog.getRange(1, 1, 1, 9).setBackground('#0f172a').setFontColor('#34d399').setFontWeight('bold');
    sheetLog.setFrozenRows(1);
  }

  // 4. Siapkan Folder di Google Drive
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(DRIVE_FOLDER_NAME);
  }

  SpreadsheetApp.getUi().alert('Inisialisasi Database SIBEL Selesai! Spreadsheet dan Folder Google Drive telah siap.');
}

// Endpoint GET: Mengambil data jadwal, pengaturan, dan status
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetJadwal = ss.getSheetByName(SHEET_JADWAL);
    
    const schedules = [];
    if (sheetJadwal && sheetJadwal.getLastRow() > 1) {
      const data = sheetJadwal.getRange(2, 1, sheetJadwal.getLastRow() - 1, 12).getValues();
      data.forEach(row => {
        if (row[0]) {
          schedules.push({
            id: String(row[0]),
            time: String(row[1]),
            name: String(row[2]),
            category: String(row[3]),
            days: String(row[4]).split(',').map(s => s.trim()),
            audioType: String(row[5]),
            presetTone: String(row[6]),
            customAudioName: String(row[7]),
            ttsText: String(row[8]),
            repeatCount: Number(row[9]) || 1,
            isActive: Boolean(row[10] === true || String(row[10]).toLowerCase() === 'true'),
            description: String(row[11])
          });
        }
      });
    }

    const response = {
      status: 'success',
      school: 'SMK As-Syafi’iyah',
      serverTime: new Date().toISOString(),
      schedulesCount: schedules.length,
      schedules: schedules
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Endpoint POST: Menerima sinkronisasi jadwal, log pemutaran bel, atau upload audio
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // AKSI 1: Sinkronisasi Seluruh Jadwal (Kirim dari SIBEL ke Google Sheet)
    if (action === 'sync_schedules') {
      const schedules = body.schedules || [];
      let sheetJadwal = ss.getSheetByName(SHEET_JADWAL);
      if (!sheetJadwal) {
        setupDatabase();
        sheetJadwal = ss.getSheetByName(SHEET_JADWAL);
      }

      // Bersihkan data lama di bawah header
      if (sheetJadwal.getLastRow() > 1) {
        sheetJadwal.deleteRows(2, sheetJadwal.getLastRow() - 1);
      }

      if (schedules.length > 0) {
        const rows = schedules.map(item => [
          item.id,
          item.time,
          item.name,
          item.category,
          Array.isArray(item.days) ? item.days.join(',') : item.days,
          item.audioType,
          item.presetTone || 'ding_dong',
          item.customAudioName || '',
          item.ttsText || '',
          item.repeatCount || 1,
          item.isActive,
          item.description || ''
        ]);
        sheetJadwal.getRange(2, 1, rows.length, 12).setValues(rows);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Jadwal berhasil disinkronkan ke Google Sheet (' + schedules.length + ' item)',
        updatedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // AKSI 2: Catat Riwayat Pemutaran Bel (Real-time Audit Log)
    if (action === 'log_bell') {
      const log = body.log;
      let sheetLog = ss.getSheetByName(SHEET_LOG);
      if (!sheetLog) {
        setupDatabase();
        sheetLog = ss.getSheetByName(SHEET_LOG);
      }

      sheetLog.appendRow([
        log.id || 'log-' + Date.now(),
        log.timestamp || new Date().toISOString(),
        log.wibTime || '',
        log.dateString || '',
        log.scheduleName || '',
        log.category || '',
        log.triggerType || '',
        log.status || '',
        log.details || ''
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Log bel berhasil dicatat di Google Sheet'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // AKSI 3: Upload File Audio ke Google Drive
    if (action === 'upload_audio') {
      const fileName = body.fileName || 'Audio_Bel_' + Date.now() + '.mp3';
      const base64Data = body.base64Data;
      const contentType = body.contentType || 'audio/mpeg';

      const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
      let targetFolder;
      if (folders.hasNext()) {
        targetFolder = folders.next();
      } else {
        targetFolder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
      }

      const decodedBytes = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decodedBytes, contentType, fileName);
      const file = targetFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        fileId: file.getId(),
        fileName: file.getName(),
        downloadUrl: file.getDownloadUrl(),
        message: 'File audio berhasil diunggah ke Google Drive'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Aksi tidak dikenali'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export interface SyncResult {
  success: boolean;
  message: string;
  schedules?: ScheduleItem[];
  schedulesCount?: number;
}

class GoogleSyncService {
  /**
   * Test connection to the Google Apps Script Web App
   */
  public async testConnection(scriptUrl: string): Promise<SyncResult> {
    if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'URL tidak valid. Pastikan dimulai dengan https://script.google.com/macros/s/...',
      };
    }

    try {
      const response = await fetch(scriptUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Server merespon dengan status ${response.status}`,
        };
      }

      const data = await response.json();
      if (data.status === 'success') {
        return {
          success: true,
          message: `Terhubung dengan Google Sheet ${data.school || 'SMK As-Syafi’iyah'}! Ditemukan ${data.schedulesCount || 0} jadwal.`,
          schedules: data.schedules,
          schedulesCount: data.schedulesCount,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Respon Google Script tidak valid.',
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Koneksi gagal: ${message}. Pastikan izin deployment diatur ke "Siapa saja (Anyone)".`,
      };
    }
  }

  /**
   * Pull all schedules from Google Sheet into SIBEL
   */
  public async pullSchedules(scriptUrl: string): Promise<SyncResult> {
    const test = await this.testConnection(scriptUrl);
    if (!test.success) return test;

    if (!test.schedules || test.schedules.length === 0) {
      return {
        success: true,
        message: 'Google Sheet terhubung tetapi tabel jadwal masih kosong.',
        schedules: [],
        schedulesCount: 0,
      };
    }

    return {
      success: true,
      message: `Berhasil mengimpor ${test.schedules.length} jadwal dari Google Sheet!`,
      schedules: test.schedules,
      schedulesCount: test.schedules.length,
    };
  }

  /**
   * Push current SIBEL schedules to Google Sheet
   */
  public async pushSchedules(scriptUrl: string, schedules: ScheduleItem[]): Promise<SyncResult> {
    if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/')) {
      return { success: false, message: 'URL Google Apps Script tidak valid.' };
    }

    try {
      // Use text/plain to avoid CORS preflight issues with Google Apps Script
      const payload = JSON.stringify({
        action: 'sync_schedules',
        schedules,
      });

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
      });

      const data = await response.json();
      if (data.status === 'success') {
        return {
          success: true,
          message: data.message || 'Jadwal berhasil disimpan ke Google Sheet!',
          schedulesCount: schedules.length,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Gagal menyimpan ke Google Sheet.',
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal mengirim ke Google Sheet: ${message}`,
      };
    }
  }

  /**
   * Automatically log a bell ring event to Google Sheet in background
   */
  public async logBellEvent(scriptUrl: string, log: BellLog): Promise<void> {
    if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/')) return;

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'log_bell',
          log,
        }),
      });
    } catch (err) {
      console.warn('Gagal mencatat log ke Google Sheet:', err);
    }
  }
}

export const googleSyncService = new GoogleSyncService();
