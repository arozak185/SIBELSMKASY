/**
 * SIBEL - Time & Scheduler Service
 * Handles Asia/Jakarta (WIB) time calculations, schedule evaluation, and countdown timers.
 */

import { DayOfWeek, ScheduleItem, ScheduleMode, SchoolSettings } from '../types';

export const DAY_NAMES: DayOfWeek[] = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export interface WibTimeInfo {
  date: Date;
  dayName: DayOfWeek;
  formattedDate: string;
  timeString: string; // HH:mm:ss
  minuteString: string; // HH:mm
  seconds: number;
  dateString: string; // YYYY-MM-DD
}

/**
 * Get current time converted to Asia/Jakarta (WIB - UTC+7)
 */
export function getWibTime(): WibTimeInfo {
  const now = new Date();
  
  // Format options with Asia/Jakarta timezone
  const tz = 'Asia/Jakarta';
  
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const hour = parts.find(p => p.type === 'hour')?.value || '00';
  const minute = parts.find(p => p.type === 'minute')?.value || '00';
  const second = parts.find(p => p.type === 'second')?.value || '00';

  const datePartsFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateString = datePartsFormatter.format(now); // YYYY-MM-DD

  // Indonesian day of week in Jakarta
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
  });
  const weekdayShort = dayFormatter.format(now);
  const dayIndexMap: Record<string, DayOfWeek> = {
    'Sun': 'Minggu',
    'Mon': 'Senin',
    'Tue': 'Selasa',
    'Wed': 'Rabu',
    'Thu': 'Kamis',
    'Fri': 'Jumat',
    'Sat': 'Sabtu',
  };
  const dayName = dayIndexMap[weekdayShort] || 'Senin';

  // Indonesian formatted date
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const formattedDate = `${dayName}, ${parseInt(dayStr, 10)} ${INDONESIAN_MONTHS[monthIdx]} ${yearStr}`;

  return {
    date: now,
    dayName,
    formattedDate,
    timeString: `${hour}:${minute}:${second}`,
    minuteString: `${hour}:${minute}`,
    seconds: parseInt(second, 10),
    dateString,
  };
}

/**
 * Determine effective day based on schedule mode override
 */
export function getEffectiveDay(actualDay: DayOfWeek, mode: ScheduleMode): DayOfWeek | null {
  if (mode === 'libur') return null;
  if (mode === 'normal') return 'Senin'; // Representative of Senin-Kamis
  if (mode === 'jumat') return 'Jumat';
  return actualDay;
}

/**
 * Filter schedules for the effective day and sort chronologically
 */
export function getTodaySchedules(
  allSchedules: ScheduleItem[],
  effectiveDay: DayOfWeek | null,
  mode: ScheduleMode
): ScheduleItem[] {
  if (!effectiveDay || mode === 'libur') return [];

  return allSchedules
    .filter(item => item.isActive && item.days.includes(effectiveDay))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export interface UpcomingBellInfo {
  schedule: ScheduleItem | null;
  remainingSeconds: number;
  remainingText: string;
}

/**
 * Find the next upcoming bell for today
 */
export function getUpcomingBell(
  todaySchedules: ScheduleItem[],
  currentMinute: string,
  currentSeconds: number
): UpcomingBellInfo {
  if (todaySchedules.length === 0) {
    return { schedule: null, remainingSeconds: 0, remainingText: 'Tidak ada jadwal tersisa hari ini' };
  }

  const [currH, currM] = currentMinute.split(':').map(Number);
  const currentTotalSeconds = (currH * 3600) + (currM * 60) + currentSeconds;

  for (const item of todaySchedules) {
    const [h, m] = item.time.split(':').map(Number);
    const itemTotalSeconds = (h * 3600) + (m * 60);

    if (itemTotalSeconds > currentTotalSeconds) {
      const diffSec = itemTotalSeconds - currentTotalSeconds;
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;

      let remainingText = '';
      if (hours > 0) {
        remainingText = `${hours} jam ${minutes} menit lagi`;
      } else if (minutes > 0) {
        remainingText = `${minutes} menit ${secs} detik lagi`;
      } else {
        remainingText = `${secs} detik lagi`;
      }

      return {
        schedule: item,
        remainingSeconds: diffSec,
        remainingText,
      };
    }
  }

  return { schedule: null, remainingSeconds: 0, remainingText: 'Semua bel hari ini telah berbunyi' };
}

/**
 * Find the ongoing school activity based on schedule intervals
 */
export function getCurrentActivity(
  todaySchedules: ScheduleItem[],
  currentMinute: string
): ScheduleItem | null {
  if (todaySchedules.length === 0) return null;

  // Find the last schedule whose time <= currentMinute
  let active: ScheduleItem | null = null;
  for (const item of todaySchedules) {
    if (item.time <= currentMinute) {
      active = item;
    } else {
      break;
    }
  }

  return active;
}

/**
 * Convert category to friendly Indonesian badge info
 */
export function getCategoryBadge(category: string): { label: string; color: string; bg: string; text: string } {
  switch (category) {
    case 'masuk':
      return { label: 'Jam Masuk', color: 'emerald', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400' };
    case 'pergantian':
      return { label: 'Pergantian Jam', color: 'blue', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20', text: 'text-sky-400' };
    case 'istirahat':
      return { label: 'Istirahat', color: 'amber', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-400' };
    case 'ibadah':
      return { label: 'Ibadah / Dhuha', color: 'teal', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20', text: 'text-teal-400' };
    case 'pulang':
      return { label: 'Jam Pulang', color: 'purple', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', text: 'text-purple-400' };
    case 'upacara':
      return { label: 'Upacara / Apel', color: 'indigo', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', text: 'text-indigo-400' };
    case 'khusus':
    default:
      return { label: 'Khusus / Darurat', color: 'rose', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', text: 'text-rose-400' };
  }
}

/**
 * Get readable mode description
 */
export function getModeLabel(mode: ScheduleMode): string {
  switch (mode) {
    case 'auto':
      return 'Otomatis Kalender';
    case 'normal':
      return 'Paksa Normal (Senin - Kamis)';
    case 'jumat':
      return 'Paksa Jadwal Jumat';
    case 'ujian':
      return 'Pekan Ujian / UKK';
    case 'ramadhan':
      return 'Bulan Ramadhan';
    case 'libur':
      return 'Hari Libur (Hening)';
  }
}
