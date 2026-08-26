import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  Shield, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { MASTER_ADMIN_EMAIL, ROLE_PERMISSIONS } from '../../auth/authConfig';
import { UserRole } from '../../auth/types';

export const AdminUsers: React.FC = () => {
  const { user, isMasterAdmin, addAdminEmail, removeAdminEmail, getAdminEmails } = useAuth();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const customAdmins = getAdminEmails();

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const email = newAdminEmail.trim();
    if (!email) return;

    if (!email.includes('@') || !email.includes('.')) {
      setFeedback({ type: 'error', message: 'Sila masukkan format emel Google yang sah.' });
      return;
    }

    if (email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      setFeedback({ type: 'error', message: 'Emel ini adalah Master Admin utama.' });
      return;
    }

    const success = addAdminEmail(email);
    if (success) {
      setFeedback({ type: 'success', message: `Akaun ${email} berjaya ditambah sebagai ADMIN.` });
      setNewAdminEmail('');
    } else {
      setFeedback({ type: 'error', message: 'Emel ini telah pun wujud dalam senarai pentadbir.' });
    }
  };

  const handleRemoveAdmin = (email: string) => {
    if (confirm(`Adakah anda pasti untuk membatalkan akses ADMIN bagi ${email}?`)) {
      removeAdminEmail(email);
      setFeedback({ type: 'success', message: `Akses ADMIN bagi ${email} telah dibatalkan.` });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Pengurusan Pengguna & Peranan
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
              Role Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kawal selia akses peranan berasaskan hierarki: <span className="font-mono font-bold">MASTER_ADMIN</span>, <span className="font-mono font-bold">ADMIN</span>, dan <span className="font-mono font-bold">USER</span>.
          </p>
        </div>

        {isMasterAdmin ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shrink-0">
            <Crown className="w-4 h-4 fill-current" />
            <span>Master Admin Access</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
            <Lock className="w-4 h-4" />
            <span>Lihat Sahaja (Standard Admin)</span>
          </span>
        )}
      </div>

      {/* Add New Admin Form (Master Admin Only) */}
      {isMasterAdmin && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#0056D2]" />
            <span>Lantik Pentadbir Sekunder (Secondary Admin)</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Masukkan emel pengguna untuk memberikan hak peranan <strong className="text-slate-700 font-mono">ADMIN</strong> bagi pengurusan platform dan visual Open Graph.
          </p>

          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="contoh.pentadbir@gmail.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!newAdminEmail.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Lantik Admin</span>
            </button>
          </form>

          {feedback && (
            <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Admin Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Senarai Pentadbir Berautoriti
            </h3>
            <p className="text-xs text-slate-500">
              Hanya akaun tersenarai dibenarkan mengakses Papan Pemuka Pentadbir.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {1 + customAdmins.length} Pentadbir
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 sm:px-6">Emel Google</th>
                <th className="py-3 px-4">Peranan</th>
                <th className="py-3 px-4">Status Pengesahan</th>
                <th className="py-3 px-4">Kebenaran Sistem</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {/* 1. MASTER ADMIN ROW */}
              <tr className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[10px]">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <span>{MASTER_ADMIN_EMAIL}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
                    MASTER_ADMIN
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Disahkan (Utama)</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  Semua Akses (Penuh & Mutlak)
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-[10px] font-semibold text-slate-600 italic">
                    Kekal (Protected)
                  </span>
                </td>
              </tr>

              {/* 2. SECONDARY ADMIN ROWS */}
              {customAdmins.map((admEmail) => (
                <tr key={admEmail} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                      A
                    </div>
                    <span>{admEmail}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                      ADMIN
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Firebase & PIN</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    Platform & Visual OG Sahaja
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isMasterAdmin ? (
                      <button
                        onClick={() => handleRemoveAdmin(admEmail)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Batalkan Akses Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {customAdmins.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 px-6 text-center text-xs text-slate-600 italic">
                    Tiada pentadbir sekunder berdaftar. Hanya Master Admin ({MASTER_ADMIN_EMAIL}) yang memegang hak pentadbir semasa.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0056D2]" />
          <span>Matriks Kebenaran Peranan (Role Permission Matrix)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* MASTER_ADMIN CARD */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 font-mono">MASTER_ADMIN</span>
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-[11px] text-slate-600">
              {ROLE_PERMISSIONS.MASTER_ADMIN.description}
            </p>
            <ul className="space-y-1 text-[11px] font-medium text-slate-700 pt-2 border-t border-amber-200/60">
              {ROLE_PERMISSIONS.MASTER_ADMIN.permissions.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ADMIN CARD */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 font-mono">ADMIN</span>
              <Shield className="w-4 h-4 text-[#0056D2]" />
            </div>
            <p className="text-[11px] text-slate-600">
              {ROLE_PERMISSIONS.ADMIN.description}
            </p>
            <ul className="space-y-1 text-[11px] font-medium text-slate-700 pt-2 border-t border-blue-200/60">
              {ROLE_PERMISSIONS.ADMIN.permissions.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* USER CARD */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 font-mono">USER</span>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500">
              {ROLE_PERMISSIONS.USER.description}
            </p>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-red-600 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Akses Papan Pemuka: DITOLAK (Access Denied)</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
