import React from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Globe, 
  Server, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileCode,
  Crown
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { MASTER_ADMIN_EMAIL } from '../../auth/authConfig';

export const AdminSettings: React.FC = () => {
  const { user, isMasterAdmin } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-extrabold text-slate-900">
            Tetapan Keselamatan & Google OAuth 2.0
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Enforced
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Konfigurasi protokol Google Identity Services, pengesahan token, dan perlindungan laluan pentadbiran SYNCROZZ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* OAuth 2.0 Security Architecture */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0056D2]" />
            <span>Protokol Google OAuth 2.0</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Kaedah Pengesahan</div>
                <div className="text-[11px] text-slate-500">Google Identity Services (GSI) / OAuth 2.0</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Perlindungan Laluan Pentadbir</div>
                <div className="text-[11px] text-slate-500">/admin/* dihalang tanpa kebenaran MASTER_ADMIN / ADMIN</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PROTECTED
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Pengasingan Auth & Authorization</div>
                <div className="text-[11px] text-slate-500">Google mengesahkan identiti; SYNCROZZ menentukan hak peranan</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                DECOUPLED
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Pengesahan Emel Google</div>
                <div className="text-[11px] text-slate-500">Hanya emel yang telah diverifikasi (email_verified: true) diterima</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                VERIFIED ONLY
              </span>
            </div>
          </div>
        </div>

        {/* Master Admin Identity Guard */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>Ketetapan Master Admin</span>
          </h3>

          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
            <div className="font-bold text-amber-900 flex items-center justify-between">
              <span>Master Admin Tetap:</span>
              <span className="font-mono text-[11px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-bold">
                IMMUTABLE
              </span>
            </div>
            <div className="font-mono font-bold text-sm text-slate-900">
              {MASTER_ADMIN_EMAIL}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
              Akaun Google <strong className="text-slate-900">{MASTER_ADMIN_EMAIL}</strong> diiktiraf sebagai satu-satunya Master Admin mutlak sejak awal. Peranan ini tidak boleh dipadam atau diturunkan taraf oleh mana-mana pengguna lain.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-slate-700 font-bold">Ciri-Ciri Keselamatan Khas:</div>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tiada kata laluan tersimpan dalam pangkalan data sistem.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sesi kekal aktif selepas muat semula laman (Page Refresh Safe).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Akses ditutup serta-merta apabila pengguna menekan butang Sign Out.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
