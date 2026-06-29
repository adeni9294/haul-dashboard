'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. KUNCI UTAMA: PEMETAAN WARNA KOMPONEN AGAR SINKRON DENGAN LAYOUT
const THEME_STYLES = {
  'emerald-cyber': { card: 'bg-zinc-900 border-zinc-800 text-emerald-100', innerBg: 'bg-zinc-950/40', textMuted: 'text-zinc-500', accentText: 'text-emerald-400', progressBg: 'from-emerald-600 to-emerald-400' },
  'velvet-rose': { card: 'bg-purple-950/20 border-purple-900/50 text-rose-100', innerBg: 'bg-purple-950/40 border-purple-900/40', textMuted: 'text-purple-400', accentText: 'text-rose-400', progressBg: 'from-rose-600 to-fuchsia-400' },
  'neon-sunset': { card: 'bg-stone-900 border-stone-800 text-orange-100', innerBg: 'bg-stone-950/40', textMuted: 'text-stone-500', accentText: 'text-orange-400', progressBg: 'from-orange-600 to-orange-400' },
  'amber-gold': { card: 'bg-gray-900 border-gray-800 text-amber-100', innerBg: 'bg-gray-950/40', textMuted: 'text-gray-500', accentText: 'text-amber-400', progressBg: 'from-amber-600 to-amber-400' },
  'midnight-blue': { card: 'bg-blue-950/40 border-blue-900/60 text-blue-100', innerBg: 'bg-blue-950/50 border-blue-900/30', textMuted: 'text-blue-400', accentText: 'text-blue-400', progressBg: 'from-blue-600 to-cyan-500' },
  'nordic-frost': { card: 'bg-slate-800/60 border-slate-700/60 text-slate-100', innerBg: 'bg-slate-900/50', textMuted: 'text-slate-400', accentText: 'text-cyan-400', progressBg: 'from-cyan-600 to-teal-400' },
  'dracula-vamp': { card: 'bg-neutral-900 border-fuchsia-950 text-purple-200', innerBg: 'bg-neutral-950/40', textMuted: 'text-neutral-500', accentText: 'text-fuchsia-400', progressBg: 'from-fuchsia-600 to-purple-500' },
  'forest-moss': { card: 'bg-emerald-950/30 border-emerald-900/40 text-stone-100', innerBg: 'bg-stone-950/40', textMuted: 'text-stone-400', accentText: 'text-green-400', progressBg: 'from-green-600 to-emerald-400' },
  'cyberpunk-2077': { card: 'bg-black border-yellow-500 text-yellow-400', innerBg: 'bg-yellow-950/20 border-yellow-500/30', textMuted: 'text-yellow-600', accentText: 'text-yellow-400', progressBg: 'from-yellow-500 to-amber-400' },
  'ocean-breeze': { card: 'bg-teal-900/40 border-teal-800 text-teal-100', innerBg: 'bg-teal-950/40', textMuted: 'text-teal-400', accentText: 'text-cyan-300', progressBg: 'from-cyan-600 to-teal-400' },
  'rose-gold': { card: 'bg-rose-950/20 border-rose-900/40 text-rose-200', innerBg: 'bg-stone-950/40', textMuted: 'text-stone-500', accentText: 'text-rose-300', progressBg: 'from-rose-500 to-pink-400' },
  'lavender-dream': { card: 'bg-indigo-950/20 border-indigo-900/40 text-indigo-200', innerBg: 'bg-neutral-950/40', textMuted: 'text-neutral-500', accentText: 'text-indigo-400', progressBg: 'from-indigo-500 to-purple-400' },
  'coffee-latte': { card: 'bg-amber-950/20 border-amber-900/30 text-amber-100', innerBg: 'bg-stone-950/40', textMuted: 'text-stone-500', accentText: 'text-amber-500', progressBg: 'from-amber-600 to-yellow-600' },
  'toxic-lime': { card: 'bg-zinc-900 border-lime-900 text-lime-400', innerBg: 'bg-zinc-950/40', textMuted: 'text-zinc-600', accentText: 'text-lime-400', progressBg: 'from-lime-500 to-green-400' },
  'crimson-tide': { card: 'bg-red-950/20 border-red-950 text-red-200', innerBg: 'bg-neutral-950/40', textMuted: 'text-neutral-500', accentText: 'text-red-400', progressBg: 'from-red-600 to-orange-600' },
  'solarized-dark': { card: 'bg-slate-900 border-teal-950 text-teal-200', innerBg: 'bg-slate-950/40', textMuted: 'text-slate-500', accentText: 'text-teal-400', progressBg: 'from-teal-600 to-cyan-500' },
  'default': { card: 'bg-slate-900 border-slate-800 text-slate-100', innerBg: 'bg-slate-950/40 border-slate-800/60', textMuted: 'text-slate-400', accentText: 'text-amber-500', progressBg: 'from-amber-600 to-amber-400' }
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 15300000 });
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default'); // Menyimpan tema aktif

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

      // 1. SINKRONISASI TEMA & BANNER
      let targetDana = 15300000;
      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (settingsData && settingsData.length > 0) {
        setAnnouncement(settingsData[0].announcement || settingsData[0].banner_text || '');
        if (settingsData[0].theme) {
          setCurrentThemeKey(settingsData[0].theme); // Set tema sesuai pilihan DB
        }
        const dbTarget = settingsData[0].target_notes || settingsData[0].target_amount;
        if (dbTarget) {
          const parsingTarget = parseInt(dbTarget);
          if (!isNaN(parsingTarget) && parsingTarget > 0) targetDana = parsingTarget;
        }
      }

      // 2. AMBIL TRANSAKSI
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
          } else if (rawType === 'keluar' || rawType === 'pengeluaran' || rawType === 'expense') {
            calcKeluar += nominal;
            listKeluar.push(item);
          } else {
            if (nominal >= 0) {
              calcMasuk += nominal;
              listMasuk.push(item);
            } else {
              calcKeluar += Math.abs(nominal);
              listKeluar.push(item);
            }
          }
        });

        const sisaKas = calcMasuk - calcKeluar;
        setTotals({ total: sisaKas, masuk: calcMasuk, keluar: calcKeluar });
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

  // Ambil gaya CSS dinamis berdasarkan tema aktif
  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 font-mono text-xs text-slate-400">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Menyelaraskan Tema & Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-1 sm:px-0 pb-16">
      
      {/* 1. RUNNING TEXT BANNER */}
      {announcement && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 py-2 px-3 rounded-xl overflow-hidden relative flex items-center">
          <div className="flex whitespace-nowrap min-w-full relative">
            <div className="animate-marquee inline-block text-amber-400 font-bold text-[11px] tracking-wide uppercase font-mono">
              📢 {announcement} &nbsp;&nbsp;&bull;&nbsp;&nbsp; {announcement} &nbsp;&nbsp;&bull;&nbsp;&nbsp;
            </div>
            <div className="animate-marquee inline-block text-amber-400 font-bold text-[11px] tracking-wide uppercase font-mono absolute top-0 left-0">
              📢 {announcement} &nbsp;&nbsp;&bull;&nbsp;&nbsp; {announcement} &nbsp;&nbsp;&bull;&nbsp;&nbsp;
            </div>
          </div>
        </div>
      )}

      {/* 2. KARTU UTAMA TOTAL SISA KAS - (Gaya Kelas Berubah Dinamis Melalui `style.card`) */}
      <div className={`p-5 sm:p-8 ${style.card} border rounded-2xl sm:rounded-3xl shadow-xl space-y-5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="space-y-0.5">
          <p className={`${style.textMuted} font-mono text-[10px] sm:text-xs uppercase tracking-widest`}>Total Sisa Kas Haul</p>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight break-words">
            {formatRupiah(totals.total)}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
          {/* Box Masuk */}
          <div className={`p-3 ${style.innerBg} border border-white/5 rounded-xl flex items-center gap-2.5`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className={`text-[9px] font-mono uppercase ${style.textMuted} tracking-wider truncate`}>Dana Masuk</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-400 truncate mt-0.5">{formatRupiah(totals.masuk)}</p>
            </div>
          </div>

          {/* Box Keluar */}
          <div className={`p-3 ${style.innerBg} border border-white/5 rounded-xl flex items-center gap-2.5`}>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className={`text-[9px] font-mono uppercase ${style.textMuted} tracking-wider truncate`}>Dana Keluar</p>
              <p className="text-xs sm:text-sm font-bold text-rose-400 truncate mt-0.5">{formatRupiah(totals.keluar)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROGRES TARGET PLAFON */}
      <div className={`p-4 sm:p-5 ${style.card} border rounded-xl sm:rounded-2xl shadow-lg space-y-2.5`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500 text-xs sm:text-sm">🎯</span>
            <h3 className="text-[10px] sm:text-xs font-bold text-slate-200 uppercase tracking-wider">Progres Target</h3>
          </div>
          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 font-mono text-[10px] font-black rounded border border-amber-500/20">
            {progress.percent}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
          <div className={`h-full bg-gradient-to-r ${style.progressBg} rounded-full transition-all duration-1000`} style={{ width: `${progress.percent}%` }}></div>
        </div>

        <div className={`flex justify-between text-[9px] font-mono ${style.textMuted} pt-0.5`}>
          <p>In: <span className="text-slate-200 font-bold">{formatRupiah(progress.current)}</span></p>
          <p>Target: <span className="text-slate-200 font-bold">{formatRupiah(progress.target)}</span></p>
        </div>
      </div>

      {/* 4. SEKSYEN RINCIAN TRANSAKSI */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-amber-500 text-xs">🕒</span>
          <h3 className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">Transaksi Terakhir</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* KAS MASUK */}
          <div className={`p-4 ${style.card} border-l-4 border-l-emerald-500 border-y border-r rounded-xl shadow-md space-y-2.5`}>
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">🟢 KAS MASUK</span>
              <span className={`text-[9px] ${style.textMuted} font-mono`}>Terbaru</span>
            </div>
            
            <div className="space-y-2 divide-y divide-white/5 pr-0.5">
              {rincianMasuk.length > 0 ? rincianMasuk.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center pt-2 first:pt-0 gap-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-slate-200 font-medium text-xs truncate">{item.description || item.keterangan || item.notes || 'Transaksi Masuk'}</p>
                    <p className={`text-[9px] font-mono ${style.textMuted}`}>{item.transaction_date || item.tanggal || '-'}</p>
                  </div>
                  <p className="text-xs font-bold font-mono text-emerald-400 shrink-0">+{formatRupiah(item.amount || item.nominal)}</p>
                </div>
              )) : (
                <p className={`text-[9px] ${style.textMuted} font-mono py-2 text-center`}>Belum ada data masuk.</p>
              )}
            </div>
          </div>

          {/* KAS KELUAR */}
          <div className={`p-4 ${style.card} border-l-4 border-l-rose-500 border-y border-r rounded-xl shadow-md space-y-2.5`}>
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">🔴 KAS KELUAR</span>
              <span className={`text-[9px] ${style.textMuted} font-mono`}>Terbaru</span>
            </div>

            <div className="space-y-2 divide-y divide-white/5 pr-0.5">
              {rincianKeluar.length > 0 ? rincianKeluar.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center pt-2 first:pt-0 gap-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-slate-200 font-medium text-xs truncate">{item.description || item.keterangan || item.notes || 'Transaksi Keluar'}</p>
                    <p className={`text-[9px] font-mono ${style.textMuted}`}>{item.transaction_date || item.tanggal || '-'}</p>
                  </div>
                  <p className="text-xs font-bold font-mono text-rose-400 shrink-0">-{formatRupiah(item.amount || item.nominal)}</p>
                </div>
              )) : (
                <p className={`text-[9px] ${style.textMuted} font-mono py-2 text-center`}>Belum ada data keluar.</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
