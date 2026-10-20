import React, { useState } from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { BellLog } from '../types';
import { getCategoryBadge } from '../services/scheduler';

interface LogViewProps {
  logs: BellLog[];
  onClearLogs: () => void;
}

export const LogView: React.FC<LogViewProps> = ({ logs, onClearLogs }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.triggerType !== filterType) {
      return false;
    }
    if (filterStatus !== 'all' && log.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.scheduleName.toLowerCase().includes(q) ||
        log.wibTime.includes(q) ||
        log.dateString.includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['ID', 'Tanggal', 'Waktu WIB', 'Nama Bel', 'Kategori', 'Pemicu', 'Status', 'Keterangan'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.dateString,
      l.wibTime,
      `"${l.scheduleName.replace(/"/g, '""')}"`,
      l.category,
      l.triggerType,
      l.status,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SIBEL_Log_Pemutaran_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Riwayat Pemutaran & Log Kesalahan Bel</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Catatan audit otomatis setiap kali suara bel dibunyikan di SMK As-Syafi’iyah
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV (Excel)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Hapus seluruh riwayat log pemutaran? Tindakan ini tidak dapat dibatalkan.')) {
                onClearLogs();
              }
            }}
            disabled={logs.length === 0}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama bel, waktu, atau tanggal..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Type */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Jenis Pemicu</option>
            <option value="otomatis">Otomatis (Jadwal Terjadwal)</option>
            <option value="manual">Manual (Operator Soundboard)</option>
            <option value="uji_coba">Uji Coba (Simulasi)</option>
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="sukses">Sukses Berdering</option>
            <option value="dihentikan">Dihentikan Operator</option>
            <option value="gagal">Gagal / Eror</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Tidak ada riwayat pemutaran bel yang sesuai dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold">Waktu (WIB)</th>
                  <th className="py-3 px-4 font-semibold">Nama Bel</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Pemicu</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Detail / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const badge = getCategoryBadge(log.category);
                  return (
                    <tr key={log.id} className="hover:bg-slate-850/40">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-white">
                          {log.wibTime}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.dateString}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-white">
                        {log.scheduleName}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] border font-medium ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="capitalize text-slate-300">
                          {log.triggerType === 'otomatis' ? 'Otomatis' : log.triggerType === 'manual' ? 'Manual' : 'Uji Coba'}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.status === 'sukses' ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sukses
                          </span>
                        ) : log.status === 'dihentikan' ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Dihentikan
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Gagal
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
