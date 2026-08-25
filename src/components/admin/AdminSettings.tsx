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
import { SYNCROZZ_ASSET_CATALOG, SYNCROZZ_ASSET_BASE_URL, SYNCROZZ_OGI_OFFICIAL } from '../../data/syncrozzAssets';
import { ExternalLink, Copy, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

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
              Visual rujukan utama OGI.MAINv2.jpg dengan identiti White/Corporate Asymmetrical Layout untuk media sosial & SEO.
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
                <li>• <strong>Komposisi:</strong> Asymmetrical (Kiri: Tipografi & Info, Kanan: Hero Mockup Tech)</li>
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

      {/* Official 13-Asset Directory Showcase (Folder MAIN) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0056D2]" />
                <span>13 Fail Aset Rasmi Logo SYNCROZZ (Folder MAIN)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0056D2]">
                13 Official Files
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Semua 13 fail asal dirujuk terus daripada repositori rasmi tanpa ubah suai atau penjanaan semula.
            </p>
          </div>

          <a 
            href="https://github.com/syncrozz/syncrozz-assets/tree/main/logo/MAIN"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0056D2] hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shrink-0 cursor-pointer"
          >
            <span>Buka Folder GitHub MAIN</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYNCROZZ_ASSET_CATALOG.map((asset, idx) => (
            <div 
              key={asset.name} 
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all flex items-center gap-3 group"
            >
              {/* Preview Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                {asset.name.endsWith('.webmanifest') ? (
                  <FileCode className="w-6 h-6 text-slate-400" />
                ) : (
                  <img 
                    src={asset.url} 
                    alt={asset.name} 
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              {/* Info & Raw Link */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                  <div className="text-xs font-bold text-slate-900 truncate font-mono">{asset.name}</div>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{asset.purpose}</div>
                <div className="text-[9px] text-blue-600 font-mono mt-0.5">
                  {asset.dimensions} • {asset.type}
                </div>
              </div>

              {/* Direct Link Action */}
              <a 
                href={asset.url} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Buka Aset Asal"
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#0056D2] group-hover:border-blue-200 shrink-0 cursor-pointer shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
