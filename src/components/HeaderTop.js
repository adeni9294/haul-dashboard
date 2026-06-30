'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const THEME_STYLES = {
  'emerald-cyber': { card: 'bg-zinc-900 border-zinc-800 text-emerald-100', innerBg: 'bg-zinc-950 border border-zinc-850', textMuted: 'text-zinc-500', accentText: 'text-emerald-400' },
  'velvet-rose': { card: 'bg-neutral-900 border-purple-950 text-rose-100', innerBg: 'bg-purple-950 border border-purple-900/60', textMuted: 'text-purple-400', accentText: 'text-rose-400' },
  'neon-sunset': { card: 'bg-stone-900 border-stone-800 text-orange-100', innerBg: 'bg-stone-950 border border-stone-850', textMuted: 'text-stone-500', accentText: 'text-orange-400' },
  'amber-gold': { card: 'bg-gray-900 border-gray-800 text-amber-100', innerBg: 'bg-gray-950 border border-gray-850', textMuted: 'text-gray-500', accentText: 'text-amber-400' },
  'midnight-blue': { card: 'bg-slate-900 border-blue-950 text-blue-100', innerBg: 'bg-blue-950 border border-blue-900/40', textMuted: 'text-blue-400', accentText: 'text-blue-400' },
  'nordic-frost': { card: 'bg-slate-800 border-slate-750 text-slate-100', innerBg: 'bg-slate-900 border border-slate-750', textMuted: 'text-slate-400', accentText: 'text-cyan-400' },
  'dracula-vamp': { card: 'bg-zinc-900 border-fuchsia-950 text-purple-200', innerBg: 'bg-black border border-fuchsia-950/60', textMuted: 'text-neutral-500', accentText: 'text-fuchsia-400' },
  'forest-moss': { card: 'bg-stone-900 border-emerald-950 text-stone-100', innerBg: 'bg-emerald-950 border border-emerald-900/40', textMuted: 'text-stone-400', accentText: 'text-green-400' },
  'cyberpunk-2077': { card: 'bg-black border-yellow-500 text-yellow-400', innerBg: 'bg-zinc-950 border border-yellow-600/40', textMuted: 'text-yellow-600', accentText: 'text-yellow-400' },
  'ocean-breeze': { card: 'bg-teal-900 border-teal-800 text-teal-100', innerBg: 'bg-teal-950 border border-teal-850', textMuted: 'text-teal-400', accentText: 'text-cyan-300' },
  'rose-gold': { card: 'bg-stone-900 border-rose-950 text-rose-200', innerBg: 'bg-rose-950 border border-rose-900/40', textMuted: 'text-stone-500', accentText: 'text-rose-300' },
  'lavender-dream': { card: 'bg-neutral-900 border-indigo-950 text-indigo-200', innerBg: 'bg-indigo-950 border border-indigo-900/40', textMuted: 'text-neutral-500', accentText: 'text-indigo-400' },
  'coffee-latte': { card: 'bg-stone-900 border-amber-950 text-amber-100', innerBg: 'bg-amber-950 border border-amber-900/30', textMuted: 'text-stone-500', accentText: 'text-amber-500' },
  'toxic-lime': { card: 'bg-zinc-900 border-lime-950 text-lime-400', innerBg: 'bg-zinc-950 border border-lime-900/40', textMuted: 'text-zinc-600', accentText: 'text-lime-400' },
  'crimson-tide': { card: 'bg-neutral-900 border-red-950 text-red-200', innerBg: 'bg-red-950 border border-red-900/40', textMuted: 'text-neutral-500', accentText: 'text-red-400' },
  'solarized-dark': { card: 'bg-slate-900 border-teal-950 text-teal-200', innerBg: 'bg-slate-950 border border-teal-900/40', textMuted: 'text-slate-500', accentText: 'text-teal-400' },
  'default': { card: 'bg-slate-900 border-slate-800 text-slate-100', innerBg: 'bg-slate-950 border border-slate-800/60', textMuted: 'text-slate-400', accentText: 'text-amber-500' }
};

export default function HeaderTop() {
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => {
    async function loadHeaderSettings() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'main_config');

        if (!error && data && data.length > 0) {
          const config = data[0];
          if (config.org_name) setOrgName(config.org_name);
          if (config.address) setAddress(config.address);
          if (config.bank_info) setBankInfo(config.bank_info);
          if (config.logo_url) setLogoUrl(config.logo_url);
          if (config.theme && THEME_STYLES[config.theme]) setCurrentThemeKey(config.theme);
        }
      } catch (err) {
        console.error("Gagal memuat header dinamis, menggunakan data bawaan:", err);
      }
    }
    loadHeaderSettings();
  }, []);

  const currentStyle = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  return (
    <div className={`p-4 md:p-6 ${currentStyle.card} border rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-xl w-full mb-5`}>
      {/* Container Lingkaran Logo */}
      <div className={`w-14 h-14 md:w-16 md:h-16 ${currentStyle.innerBg} rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner`}>
        {logoUrl ? (
          <img src={logoUrl} alt="Logo Resmi" className="w-full h-full object-cover" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentStyle.accentText}><path d="M2 22h20"/><path d="M12 2v3"/><path d="M12 7a5 5 0 0 1 5 5v10H7V12a5 5 0 0 1 5-5z"/></svg>
        )}
      </div>

      {/* Detail Teks Organisasi & Alamat */}
      <div className="text-center md:text-left space-y-0.5 flex-1 min-w-0">
        <h1 className="text-xs md:text-sm font-bold text-white tracking-wide uppercase truncate">{orgName}</h1>
        <p className={`text-[10px] md:text-xs ${currentStyle.textMuted} truncate`}>{address}</p>
        <p className={`text-[9px] md:text-[10px] ${currentStyle.textMuted} font-mono pt-1 border-t border-white/5 max-w-max mx-auto md:mx-0 mt-1`}>
          💳 {bankInfo}
        </p>
      </div>
    </div>
  );
}
