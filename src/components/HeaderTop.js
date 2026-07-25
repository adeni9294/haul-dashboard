'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client di luar komponen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const THEME_STYLES = {
  'emerald-cyber': { card: 'bg-zinc-900 border-zinc-800 text-emerald-100', innerBg: 'bg-zinc-950 border border-zinc-800', textMuted: 'text-zinc-400', accentText: 'text-emerald-400' },
  'velvet-rose': { card: 'bg-neutral-900 border-purple-950 text-rose-100', innerBg: 'bg-purple-950 border border-purple-900/60', textMuted: 'text-purple-400', accentText: 'text-rose-400' },
  'neon-sunset': { card: 'bg-stone-900 border-stone-800 text-orange-100', innerBg: 'bg-stone-950 border border-stone-800', textMuted: 'text-stone-400', accentText: 'text-orange-400' },
  'amber-gold': { card: 'bg-gray-900 border-gray-800 text-amber-100', innerBg: 'bg-gray-950 border border-gray-800', textMuted: 'text-gray-400', accentText: 'text-amber-400' },
  'midnight-blue': { card: 'bg-slate-900 border-blue-950 text-blue-100', innerBg: 'bg-blue-950 border border-blue-900/40', textMuted: 'text-blue-400', accentText: 'text-blue-400' },
  'nordic-frost': { card: 'bg-slate-800 border-slate-700 text-slate-100', innerBg: 'bg-slate-900 border border-slate-700', textMuted: 'text-slate-400', accentText: 'text-cyan-400' }, // Typo 'Qbg' diperbaiki
  'dracula-vamp': { card: 'bg-zinc-900 border-fuchsia-950 text-purple-200', innerBg: 'bg-black border border-fuchsia-950/60', textMuted: 'text-neutral-400', accentText: 'text-fuchsia-400' },
  'forest-moss': { card: 'bg-stone-900 border-emerald-950 text-stone-100', innerBg: 'bg-emerald-950 border border-emerald-900/40', textMuted: 'text-stone-400', accentText: 'text-green-400' },
  'cyberpunk-2077': { card: 'bg-black border-yellow-500 text-yellow-400', innerBg: 'bg-zinc-950 border border-yellow-600/40', textMuted: 'text-yellow-600', accentText: 'text-yellow-400' },
  'ocean-breeze': { card: 'bg-teal-900 border-teal-800 text-teal-100', innerBg: 'bg-teal-950 border border-teal-800', textMuted: 'text-teal-400', accentText: 'text-cyan-300' },
  'rose-gold': { card: 'bg-stone-900 border-rose-950 text-rose-200', innerBg: 'bg-rose-950 border border-rose-900/40', textMuted: 'text-stone-400', accentText: 'text-rose-300' },
  'lavender-dream': { card: 'bg-neutral-900 border-indigo-950 text-indigo-200', innerBg: 'bg-indigo-950 border border-indigo-900/40', textMuted: 'text-neutral-400', accentText: 'text-indigo-400' },
  'coffee-latte': { card: 'bg-stone-900 border-amber-950 text-amber-100', innerBg: 'bg-amber-950 border border-amber-900/30', textMuted: 'text-stone-400', accentText: 'text-amber-500' },
  'toxic-lime': { card: 'bg-zinc-900 border-lime-950 text-lime-400', innerBg: 'bg-zinc-950 border border-lime-900/40', textMuted: 'text-zinc-400', accentText: 'text-lime-400' },
  'crimson-tide': { card: 'bg-neutral-900 border-red-950 text-red-200', innerBg: 'bg-red-950 border border-red-900/40', textMuted: 'text-neutral-400', accentText: 'text-red-400' },
  'solarized-dark': { card: 'bg-slate-900 border-teal-950 text-teal-200', innerBg: 'bg-slate-950 border border-teal-900/40', textMuted: 'text-slate-400', accentText: 'text-teal-400' },
  'default': { card: 'bg-slate-900 border-slate-800 text-slate-100', innerBg: 'bg-slate-950 border border-slate-800/60', textMuted: 'text-cyan-400/90', accentText: 'text-cyan-400' }
};

export default function HeaderTop() {
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadHeaderSettings() {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('settings')
          .select('org_name, address, bank_info, logo_url, theme')
          .eq('id', 'main_config')
          .maybeSingle();

        if (error) {
          console.warn("Gagal mengambil konfigurasi Supabase:", error.message);
          return;
        }

        if (data) {
          if (data.org_name) setOrgName(data.org_name);
          if (data.address) setAddress(data.address);
          if (data.bank_info) setBankInfo(data.bank_info);
          if (data.logo_url) setLogoUrl(data.logo_url);
          if (data.theme && THEME_STYLES[data.theme]) setCurrentThemeKey(data.theme);
        }
      } catch (err) {
        console.error("Gagal memuat header dinamis, menggunakan data bawaan:", err);
      }
    }

    loadHeaderSettings();
  }, []);

  const currentStyle = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  return (
    <div className={`p-4 sm:p-5 ${currentStyle.card} border rounded-2xl shadow-xl w-full max-w-xl mx-auto space-y-3.5 mb-5 transition-all`}>
      {/* Bagian Atas: Logo, Nama Organisasi, Badge Admin & Alamat */}
      <div className="flex items-start gap-3.5">
        {/* Container Logo */}
        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 ${currentStyle.innerBg} rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-inner border border-white/10`}>
          {logoUrl && !imageError ? (
            <Image 
              src={logoUrl} 
              alt="Logo Resmi" 
              fill 
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentStyle.accentText}>
              <path d="M2 22h20"/><path d="M12 2v3"/><path d="M12 7a5 5 0 0 1 5 5v10H7V12a5 5 0 0 1 5-5z"/>
            </svg>
          )}
        </div>

        {/* Detail Teks Organisasi */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase leading-tight">
              {orgName}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              ⚡ ADMIN
            </span>
          </div>

          <p className={`text-[11px] sm:text-xs ${currentStyle.textMuted} flex items-center gap-1 truncate`}>
            <span>📍</span>
            <span className="truncate">{address}</span>
          </p>
        </div>
      </div>

      {/* Bagian Bawah: Tombol Sholat & Jam/Tanggal */}
      <div className="pt-3 border-t border-white/10 flex flex-row items-center justify-between gap-2 text-xs">
        <button className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 rounded-full transition-colors text-[11px] font-medium">
          <span>🕌</span>
          <span>Jadwal Sholat</span>
        </button>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
          <span>10.59.26</span>
          <span>•</span>
          <span>Sab, 25 Jul 2026</span>
        </div>
      </div>

      {/* Catatan Info Bank */}
      {bankInfo && (
        <div className={`text-[10px] ${currentStyle.textMuted} font-mono pt-1 text-center sm:text-left truncate opacity-80`}>
          💳 {bankInfo}
        </div>
      )}
    </div>
  );
}
