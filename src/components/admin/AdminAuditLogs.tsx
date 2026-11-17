import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { getAuditLogs } from '../../auth/authService';
import { AuditLogEntry } from '../../auth/types';
import { useAuth } from '../../auth/AuthContext';
import { subscribeToAuditLogs } from '../../services/firestoreService';
import { fetchAuditLogsApi } from '../../services/apiService';

export const AdminAuditLogs: React.FC = () => {
  const { isMasterAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  const mergeLogs = useCallback((incoming: any[], existing: AuditLogEntry[]): AuditLogEntry[] => {
    const combined = [...incoming, ...existing];
    const map = new Map<string, AuditLogEntry>();
    for (const item of combined) {
      const ts = Number(item.timestamp) || Date.now();
      const email = item.email || item.userEmail || 'System';
      const action = item.action || item.eventType || 'EVENT';
      const key = `${ts}_${email}_${action}`;
      if (!map.has(key)) {
        map.set(key, {
          id: item.id || key,
          timestamp: ts,
          email,
          action,
          status: (item.status || 'INFO') as 'SUCCESS' | 'DENIED' | 'INFO',
          details: item.details,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  const refreshLogs = useCallback(async () => {
    const local = getAuditLogs();
    setLogs(local);
    const serverLogs = await fetchAuditLogsApi();
    if (serverLogs && serverLogs.length > 0) {
      setLogs((prev) => mergeLogs(serverLogs, prev));
    }
  }, [mergeLogs]);

  useEffect(() => {
    refreshLogs();

    const unsubscribe = subscribeToAuditLogs((remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setLogs((prev) => mergeLogs(remoteLogs, prev));
      }
    });

    return () => unsubscribe();
  }, [refreshLogs, mergeLogs]);

  const handleClearLocalCache = () => {
    if (confirm('Kosongkan paparan cache log tempatan pelayar ini? (Rekod log pelayan kekal terpelihara)')) {
      localStorage.removeItem('syncrozz_audit_logs');
      refreshLogs();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Log Keselamatan &amp; Percubaan Akses
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 font-mono">
              Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Rekod masa sebenar bagi sesi log masuk Google Auth, percubaan akses tidak sah, dan aktiviti pengurusan sistem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshLogs}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Semula</span>
          </button>

          {isMasterAdmin && logs.length > 0 && (
            <button
              type="button"
              onClick={handleClearLocalCache}
              className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Cache Tempatan</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 sm:px-6">Masa &amp; Tarikh</th>
                <th className="py-3 px-4">Pengguna / Sesi</th>
                <th className="py-3 px-4">Tindakan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Butiran Peristiwa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const date = new Date(log.timestamp);
                const timeStr = date.toLocaleTimeString() + ', ' + date.toLocaleDateString();

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-mono text-slate-500 whitespace-nowrap">
                      {timeStr}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {log.email}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SUCCESS</span>
                        </span>
                      )}
                      {log.status === 'DENIED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          <ShieldAlert className="w-3 h-3" />
                          <span>DENIED</span>
                        </span>
                      )}
                      {log.status === 'INFO' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <Info className="w-3 h-3" />
                          <span>INFO</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.details || '-'}
                    </td>
                  </tr>
                );
              })}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-600">
                    Tiada log audit direkodkan lagi. Sesi log masuk akan dipaparkan secara automatik di sini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
