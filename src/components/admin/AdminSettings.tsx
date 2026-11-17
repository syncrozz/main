import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Crown,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { MASTER_ADMIN_EMAIL } from '../../auth/authConfig';
import { SYNCROZZ_OGI_OFFICIAL } from '../../data/syncrozzAssets';

export const AdminSettings: React.FC = () => {
  const { user, isMasterAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-extrabold text-slate-900">
            Tetapan Keselamatan & Pengesahan Google
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Enforced
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Konfigurasi protokol kawalan akses, pengesahan Firebase ID Token pelayan, dan perlindungan portal pentadbiran SYNCROZZ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Auth Security Architecture */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0056D2]" />
            <span>Protokol Keselamatan Google Authentication</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Kaedah Pengesahan</div>
                <div className="text-[11px] text-slate-500">
                  Google Sign-In melalui Firebase Authentication (ID Token JWT)
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Pengesahan Pelayan (Server-Side)</div>
                <div className="text-[11px] text-slate-500">
                  Tandatangan kriptografi, issuer, audience & tamat tempoh disemak di pelayan
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PROTECTED
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Kawalan Akses Berasaskan Peranan (RBAC)</div>
                <div className="text-[11px] text-slate-500">
                  Master Admin eksklusif & pentadbir sekunder disahkan secara autoritatif
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                STRICT
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Pengurusan Sesi & Audit</div>
                <div className="text-[11px] text-slate-500">
                  Setiap log masuk, akses ditolak, dan pembatalan sesi direkodkan ke log audit
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                SYNCED
              </span>
            </div>
          </div>
        </div>

        {/* Master Admin Identity Guard */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>Identiti Master Admin Eksklusif</span>
          </h3>

          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
            <div className="font-bold text-amber-900 flex items-center justify-between">
              <span>Akaun Master Admin:</span>
              <span className="font-mono text-[11px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-bold">
                {isMasterAdmin ? 'MASTER_ADMIN ACTIVE' : 'STANDARD ADMIN'}
              </span>
            </div>
            <div className="font-mono font-bold text-sm text-slate-900">
              {MASTER_ADMIN_EMAIL}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
              Log masuk semasa: <span className="font-mono font-semibold text-slate-800">{user?.email}</span> ({user?.role}). Hanya akaun Google yang disahkan emel dibenarkan mengakses API pentadbiran.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-slate-700 font-bold">Jaminan Keselamatan Aktif:</div>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tiada log masuk tanpa token atau akses tetamu pada laluan pentadbir.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Identiti dan peranan ditentukan sepenuhnya oleh pelayan daripada ID token.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Token dibatalkan serta-merta di pelayan apabila pentadbir log keluar.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Official Master Open Graph Image Showcase (OGI.MAINv2.jpg) */}
      <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0056D2]" />
                <span>Rujukan Visual Rasmi: Master Open Graph Image (OGI)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#0056D2]">
                1200 × 630 px
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Visual rujukan utama OGI.MAINv2.jpg dengan identiti White/Corporate Asymmetrical Layout untuk media sosial &amp; SEO.
            </p>
          </div>

          <a
            href={SYNCROZZ_OGI_OFFICIAL.blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0056D2] hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shrink-0 cursor-pointer"
          >
            <span>Buka OGI.MAINv2.jpg di GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-6 rounded-xl overflow-hidden border border-slate-200 shadow-xs aspect-[1200/630] bg-slate-900">
            <img
              src={SYNCROZZ_OGI_OFFICIAL.rawUrl}
              alt="SYNCROZZ Official Open Graph Image OGI.MAINv2.jpg"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-6 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">Spesifikasi Identiti Visual:</div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• <strong>Dimensi:</strong> 1200 × 630 piksel (Aspect Ratio 1.905:1 / 1.91:1)</li>
                <li>• <strong>Gaya:</strong> White / Light / Modern / Clean / Premium Corporate</li>
                <li>• <strong>Komposisi:</strong> Asymmetrical (Kiri: Tipografi &amp; Info, Kanan: Hero Mockup Tech)</li>
                <li>• <strong>Warna:</strong> SYNCROZZ Blue (<code className="text-blue-700 font-bold">#0056D2</code>) + Dark Navy (<code className="text-slate-800 font-bold">#0F172A</code>) + Pure White (<code className="text-slate-600 font-bold">#FFFFFF</code>)</li>
              </ul>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Dikonfigurasikan secara langsung dalam tag <code className="font-mono text-blue-700 font-bold">&lt;meta property="og:image"&gt;</code> di index.html</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
