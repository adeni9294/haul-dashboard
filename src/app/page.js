'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const THEME_STYLES = {
  'emerald-cyber': { card: 'bg-zinc-900 border-zinc-800 text-emerald-50 shadow-2xl', innerBg: 'bg-zinc-950 border border-zinc-850', textMuted: 'text-zinc-500', accentText: 'text-emerald-400', progressBg: 'from-emerald-600 to-emerald-400' },
  'velvet-rose': { card: 'bg-neutral-900 border-purple-900/60 text-rose-50 shadow-2xl', innerBg: 'bg-purple-950 border border-purple-900/40', textMuted: 'text-purple-300', accentText: 'text-rose-400', progressBg: 'from-rose-600 to-fuchsia-500' },
  'neon-sunset': { card: 'bg-stone-900 border-stone-800 text-orange-50 shadow-2xl', innerBg: 'bg-stone-950 border border-stone-850', textMuted: 'text-stone-400', accentText: 'text-orange-400', progressBg: 'from-orange-600 to-orange-400' },
  'amber-gold': { card: 'bg-gray-900 border-gray-800 text-amber-50 shadow-2xl', innerBg: 'bg-gray-950 border border-gray-850', textMuted: 'text-gray-400', accentText: 'text-amber-400', progressBg: 'from-amber-600 to-amber-400' },
  'midnight-blue': { card: 'bg-slate-900 border-blue-900 text-blue-50 shadow-2xl', innerBg: 'bg-blue-950 border border-blue-900/40', textMuted: 'text-blue-400', accentText: 'text-blue-400', progressBg: 'from-blue-600 to-cyan-500' },
  'nordic-frost': { card: 'bg-slate-800 border-slate-750 text-slate-50 shadow-2xl', innerBg: 'bg-slate-900 border border-slate-750', textMuted: 'text-slate-400', accentText: 'text-cyan-400', progressBg: 'from-cyan-600 to-teal-400' },
  'dracula-vamp': { card: 'bg-zinc-900 border-fuchsia-950 text-purple-100 shadow-2xl', innerBg: 'bg-black border border-fuchsia-950/60', textMuted: 'text-zinc-400', accentText: 'text-fuchsia-400', progressBg: 'from-fuchsia-600 to-purple-500' },
  'forest-moss': { card: 'bg-stone-900 border-emerald-950 text-stone-50 shadow-2xl', innerBg: 'bg-emerald-950 border border-emerald-900/40', textMuted: 'text-stone-400', accentText: 'text-green-400', progressBg: 'from-green-600 to-emerald-400' },
  'cyberpunk-2077': { card: 'bg-black border-yellow-500 text-yellow-400 shadow-2xl', innerBg: 'bg-zinc-950 border border-yellow-600/40', textMuted: 'text-yellow-600', accentText: 'text-yellow-400', progressBg: 'from-yellow-500 to-amber-400' },
  'ocean-breeze': { card: 'bg-teal-900 border-teal-800 text-teal-50 shadow-2xl', innerBg: 'bg-teal-950 border border-teal-850', textMuted: 'text-teal-400', accentText: 'text-cyan-300', progressBg: 'from-cyan-600 to-teal-400' },
  'rose-gold': { card: 'bg-stone-900 border-rose-900/40 text-rose-100 shadow-2xl', innerBg: 'bg-rose-950 border border-rose-900/30', textMuted: 'text-stone-400', accentText: 'text-rose-300', progressBg: 'from-rose-500 to-pink-400' },
  'lavender-dream': { card: 'bg-neutral-900 border-indigo-900/40 text-indigo-100 shadow-2xl', innerBg: 'bg-indigo-950 border border-indigo-900/30', textMuted: 'text-neutral-400', accentText: 'text-indigo-400', progressBg: 'from-indigo-500 to-purple-400' },
  'coffee-latte': { card: 'bg-stone-900 border-amber-900/30 text-amber-100 shadow-2xl', innerBg: 'bg-amber-950 border border-amber-900/20', textMuted: 'text-stone-400', accentText: 'text-amber-500', progressBg: 'from-amber-600 to-yellow-600' },
  'toxic-lime': { card: 'bg-zinc-900 border-lime-950 text-lime-100 shadow-2xl', innerBg: 'bg-zinc-950 border border-lime-900/40', textMuted: 'text-zinc-500', accentText: 'text-lime-400', progressBg: 'from-lime-500 to-green-400' },
  'crimson-tide': { card: 'bg-neutral-900 border-red-950 text-red-100 shadow-2xl', innerBg: 'bg-red-950 border border-red-900/40', textMuted: 'text-neutral-400', accentText: 'text-red-400', progressBg: 'from-red-600 to-orange-600' },
  'solarized-dark': { card: 'bg-slate-900 border-teal-950 text-teal-100 shadow-2xl', innerBg: 'bg-slate-950 border border-teal-900/30', textMuted: 'text-slate-400', accentText: 'text-teal-400', progressBg: 'from-teal-600 to-cyan-500' },
  'default': { card: 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl', innerBg: 'bg-slate-950 border border-slate-800/60', textMuted: 'text-slate-400', accentText: 'text-amber-500', progressBg: 'from-amber-600 to-amber-400' }
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 15300000 });
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      let targetDana = 15300000;
      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (settingsData && settingsData.length > 0) {
        setAnnouncement(settingsData[0].announcement || settingsData[0].banner_text || '');
        if (settingsData[0].theme) setCurrentThemeKey(settingsData[0].theme);
        const dbTarget = settingsData[0].target_notes || settingsData[0].target_amount;
        if (dbTarget) {
          const parsingTarget = parseInt(dbTarget);
          if (!isNaN(parsingTarget) && parsingTarget > 0) targetDana = parsingTarget;
        }
      }

      const { data: trans, error } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
      
      if (!error && trans) {
        let calcMasuk = 0;
        let calcKeluar = 0;
        const listMasuk = [];
        const listKeluar = [];

        trans.forEach((item) => {
          const nominal = parseFloat(item.amount || item.nominal) || 0;
          const rawType = (item.type || item.jenis || item.category_type || '').toString().toLowerCase().trim();

          if (rawType === 'masuk' || rawType === 'pemasukan' || rawType === 'income') {
            calcMasuk += nominal;
            listMasuk.push(item);
          } else {
            calcKeluar += nominal;
            listKeluar.push(item);
          }
        });

        setTotals({ total: calcMasuk - calcKeluar, masuk: calcMasuk, keluar: calcKeluar });
        setRincianMasuk(listMasuk.slice(0, 5));
        setRincianKeluar(listKeluar.slice(0, 5));

        const hitungPersen = Math.min(Math.round((calcMasuk / targetDana) * 100), 100);
        setProgress({ percent: hitungPersen, current: calcMasuk, target: targetDana });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];
  
  // Konfigurasi Matematika Keliling Lingkaran Donut Chart Anggaran
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeOffsetProgress = circumference - (progress.percent / 100) * circumference;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 font-mono text-xs text-slate-400">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Menyusun Layout Dashboard Premium...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4.5 max-w-7xl mx-auto px-1 sm:px-0 pb-16">
      
      {/* 1. TEXT BANNER */}
      {announcement && (
        <div className="w-full bg-amber-500/10 border border-amber-500/30 py-2.5 px-3 rounded-xl overflow-hidden flex items-center">
          <div className="flex whitespace-nowrap min-w-full relative">
            <div className="animate-marquee inline-block text-amber-400 font-bold text-[11px] tracking-wide uppercase font-mono">
              📢 {announcement} &nbsp;&nbsp;&bull;&nbsp;&nbsp; {announcement} &nbsp;&nbsp;&bull;&nbsp;&nbsp;
            </div>
          </div>
        </div>
      )}

      {/* 2. KARTU UTAMA: SALDO KAS (KIRI) & PIE CHART ANGGARAN (KANAN) */}
      <div className={`p-5 sm:p-8 ${style.card} border rounded-2xl sm:rounded-3xl shadow-xl space-y-5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        {/* Layout Fleksibel: Sampingan di Laptop, Tumpuk di HP */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1 w-full sm:w-auto text-left">
            <p className={`${style.textMuted} font-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold`}>Total Sisa Kas Haul</p>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight break-words">
              {formatRupiah(totals.total)}
            </h2>
          </div>

          {/* DIAGRAM LINGKARAAN (DONUT CHART) PERBANDINGAN ANGGARAN */}
          <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5 w-full sm:w-auto shrink-0 justify-center sm:justify-start">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                {/* Lingkaran Background Sisa Anggaran (Abu-abu Gelap) */}
                <circle cx="70" cy="70" r={radius} stroke="#1e293b" strokeWidth="18" fill="transparent" />
                {/* Lingkaran Utama Nilai Progres Dana Terkumpul */}
                <circle cx="70" cy="70" r={radius} stroke="#10b981" strokeWidth="18" strokeDasharray={circumference} strokeDashoffset={strokeOffsetProgress} strokeLinecap="round" fill="transparent" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-white font-mono">{progress.percent}%</span>
              </div>
            </div>
            <div className="text-left space-y-0.5">
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-wide">Bagan Anggaran</p>
              <p className="text-[9px] font-mono text-emerald-400 font-bold">In: {formatRupiah(progress.current)}</p>
              <p className="text-[9px] font-mono text-slate-400">Target: {formatRupiah(progress.target)}</p>
            </div>
          </div>
        </div>

        {/* Kotak Info Dana Masuk & Keluar di Bagian Bawah Kartu */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
          <div className={`p-3 ${style.innerBg} rounded-xl flex items-center gap-2.5 shadow-md`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 0 5.814-5.518l2.74-8.74m0 0-3.393.117m3.393-.117-2.618 5.74" /></svg>
            </div>
            <div className="min-w-0">
              <p className={`text-[9px] font-mono uppercase ${style.textMuted} tracking-wider truncate font-bold`}>Dana Masuk</p>
              <p className="text-xs sm:text-sm font-black text-emerald-400 truncate mt-0.5">{formatRupiah(totals.masuk)}</p>
            </div>
          </div>
          <div className={`p-3 ${style.innerBg} rounded-xl flex items-center gap-2.5 shadow-md`}>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0 border border-rose-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.306-4.306a11.95 11.95 0 0 1 5.814 5.519l2.74 8.74m0 0-3.393-.117m3.393.117-2.618-5.74" /></svg>
            </div>
            <div className="min-w-0">
              <p className={`text-[9px] font-mono uppercase ${style.textMuted} tracking-wider truncate font-bold`}>Dana Keluar</p>
              <p className="text-xs sm:text-sm font-black text-rose-400 truncate mt-0.5">{formatRupiah(totals.keluar)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROGRES BAR TARGET PLAFON STRIP KUNING */}
      <div className={`p-4 sm:p-5 ${style.card} border rounded-xl sm:rounded-2xl space-y-2.5`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500 text-xs">🎯</span>
            <h3 className="text-[10px] sm:text-xs font-black text-slate-200 uppercase tracking-wider">Progres Target</h3>
          </div>
          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black rounded border border-amber-500/40">{progress.percent}%</span>
        </div>
        <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div className={`h-full bg-gradient-to-r ${style.progressBg} rounded-full transition-all duration-1000`} style={{ width: `${progress.percent}%` }}></div>
        </div>
        <div className={`flex justify-between text-[9px] font-mono ${style.textMuted} pt-0.5 font-semibold`}>
          <p>In: <span className="text-slate-100 font-bold">{formatRupiah(progress.current)}</span></p>
          <p>Target: <span className="text-slate-100 font-bold">{formatRupiah(progress.target)}</span></p>
        </div>
      </div>

      {/* 4. SEKSYEN RINCIAN TRANSAKSI */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-amber-500 text-xs">🕒</span>
          <h3 className="text-[10px] sm:text-xs font-black text-slate-300 uppercase tracking-wider">Transaksi Terakhir</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* KAS MASUK */}
          <div className={`p-4 ${style.card} border-l-4 border-l-emerald-500 border-y border-r rounded-xl space-y-2.5`}>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">🟢 KAS MASUK</span>
              <span className={`text-[9px] ${style.textMuted} font-mono font-bold`}>TERBARU</span>
            </div>
            <div className="space-y-2 divide-y divide-slate-800 pr-0.5">
              {rincianMasuk.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center pt-2 first:pt-0 gap-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-slate-100 font-bold text-xs truncate">{item.description || 'Transaksi Masuk'}</p>
                    <p className={`text-[9px] font-mono ${style.textMuted} font-medium`}>{item.transaction_date || '-'}</p>
                  </div>
                  <p className="text-xs font-black font-mono text-emerald-400 shrink-0">+{formatRupiah(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* KAS KELUAR */}
          <div className={`p-4 ${style.card} border-l-4 border-l-rose-500 border-y border-r rounded-xl space-y-2.5`}>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
              <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">🔴 KAS KELUAR</span>
              <span className={`text-[9px] ${style.textMuted} font-mono font-bold`}>TERBARU</span>
            </div>
            <div className="space-y-2 divide-y divide-slate-800 pr-0.5">
              {rincianKeluar.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center pt-2 first:pt-0 gap-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-slate-100 font-bold text-xs truncate">{item.description || 'Transaksi Keluar'}</p>
                    <p className={`text-[9px] font-mono ${style.textMuted} font-medium`}>{item.transaction_date || '-'}</p>
                  </div>
                  <p className="text-xs font-black font-mono text-rose-400 shrink-0">-{formatRupiah(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
