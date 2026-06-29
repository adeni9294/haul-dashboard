'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const THEME_STYLES = {
  'emerald-cyber': { card: 'bg-zinc-900 border-zinc-800 text-emerald-50 shadow-2xl', innerBg: 'bg-zinc-950 border border-zinc-850', textMuted: 'text-zinc-500', accentText: 'text-emerald-400', progressBg: 'from-emerald-600 to-emerald-400', chartStroke: '#10b981' },
  'velvet-rose': { card: 'bg-neutral-900 border-purple-900/60 text-rose-50 shadow-2xl', innerBg: 'bg-purple-950 border border-purple-900/40', textMuted: 'text-purple-300', accentText: 'text-rose-400', progressBg: 'from-rose-600 to-fuchsia-500', chartStroke: '#fb7185' },
  'neon-sunset': { card: 'bg-stone-900 border-stone-800 text-orange-50 shadow-2xl', innerBg: 'bg-stone-950 border border-stone-850', textMuted: 'text-stone-400', accentText: 'text-orange-400', progressBg: 'from-orange-600 to-orange-400', chartStroke: '#f97316' },
  'amber-gold': { card: 'bg-gray-900 border-gray-800 text-amber-50 shadow-2xl', innerBg: 'bg-gray-950 border border-gray-850', textMuted: 'text-gray-400', accentText: 'text-amber-400', progressBg: 'from-amber-600 to-amber-400', chartStroke: '#fbbf24' },
  'midnight-blue': { card: 'bg-slate-900 border-blue-900 text-blue-50 shadow-2xl', innerBg: 'bg-blue-950 border border-blue-900/40', textMuted: 'text-blue-400', accentText: 'text-blue-400', progressBg: 'from-blue-600 to-cyan-500', chartStroke: '#60a5fa' },
  'nordic-frost': { card: 'bg-slate-800 border-slate-750 text-slate-50 shadow-2xl', innerBg: 'bg-slate-900 border border-slate-750', textMuted: 'text-slate-400', accentText: 'text-cyan-400', progressBg: 'from-cyan-600 to-teal-400', chartStroke: '#22d3ee' },
  'dracula-vamp': { card: 'bg-zinc-900 border-fuchsia-950 text-purple-100 shadow-2xl', innerBg: 'bg-black border border-fuchsia-950/60', textMuted: 'text-zinc-400', accentText: 'text-fuchsia-400', progressBg: 'from-fuchsia-600 to-purple-500', chartStroke: '#e879f9' },
  'forest-moss': { card: 'bg-stone-900 border-emerald-950 text-stone-50 shadow-2xl', innerBg: 'bg-emerald-950 border border-emerald-900/40', textMuted: 'text-stone-400', accentText: 'text-green-400', progressBg: 'from-green-600 to-emerald-400', chartStroke: '#4ade80' },
  'cyberpunk-2077': { card: 'bg-black border-yellow-500 text-yellow-400 shadow-2xl', innerBg: 'bg-zinc-950 border border-yellow-600/40', textMuted: 'text-yellow-600', accentText: 'text-yellow-400', progressBg: 'from-yellow-500 to-amber-400', chartStroke: '#eab308' },
  'ocean-breeze': { card: 'bg-teal-900 border-teal-800 text-teal-50 shadow-2xl', innerBg: 'bg-teal-950 border border-teal-850', textMuted: 'text-teal-400', accentText: 'text-cyan-300', progressBg: 'from-cyan-600 to-teal-400', chartStroke: '#67e8f9' },
  'rose-gold': { card: 'bg-stone-900 border-rose-900/40 text-rose-100 shadow-2xl', innerBg: 'bg-rose-950 border border-rose-900/30', textMuted: 'text-stone-400', accentText: 'text-rose-300', progressBg: 'from-rose-500 to-pink-400', chartStroke: '#f43f5e' },
  'lavender-dream': { card: 'bg-neutral-900 border-indigo-900/40 text-indigo-100 shadow-2xl', innerBg: 'bg-indigo-950 border border-indigo-900/30', textMuted: 'text-neutral-400', accentText: 'text-indigo-400', progressBg: 'from-indigo-500 to-purple-400', chartStroke: '#818cf8' },
  'coffee-latte': { card: 'bg-stone-900 border-amber-900/30 text-amber-100 shadow-2xl', innerBg: 'bg-amber-950 border border-amber-900/20', textMuted: 'text-stone-400', accentText: 'text-amber-500', progressBg: 'from-amber-600 to-yellow-600', chartStroke: '#f59e0b' },
  'toxic-lime': { card: 'bg-zinc-900 border-lime-950 text-lime-100 shadow-2xl', innerBg: 'bg-zinc-950 border border-lime-900/40', textMuted: 'text-zinc-500', accentText: 'text-lime-400', progressBg: 'from-lime-500 to-green-400', chartStroke: '#a3e635' },
  'crimson-tide': { card: 'bg-neutral-900 border-red-950 text-red-100 shadow-2xl', innerBg: 'bg-red-950 border border-red-900/40', textMuted: 'text-neutral-400', accentText: 'text-red-400', progressBg: 'from-red-600 to-orange-600', chartStroke: '#dc2626' },
  'solarized-dark': { card: 'bg-slate-900 border-teal-950 text-teal-100 shadow-2xl', innerBg: 'bg-slate-950 border border-teal-900/30', textMuted: 'text-slate-400', accentText: 'text-teal-400', progressBg: 'from-teal-600 to-cyan-500', chartStroke: '#2dd4bf' },
  'default': { card: 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl', innerBg: 'bg-slate-950 border border-slate-800/60', textMuted: 'text-slate-400', accentText: 'text-amber-500', progressBg: 'from-amber-600 to-amber-400', chartStroke: '#f59e0b' }
};

// Palet warna infografis premium (Hijau/Biru untuk Pemasukan, Merah/Oranye untuk Pengeluaran)
const INCOME_COLORS = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#a7f3d0'];
const EXPENSE_COLORS = ['#f43f5e', '#fb7185', '#e11d48', '#fda4af', '#fecdd3'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 15300000 });
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');
  
  // State terpisah untuk diagram Masuk dan Keluar
  const [incomeChart, setIncomeChart] = useState([]);
  const [expenseChart, setExpenseChart] = useState([]);

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
        const incomeMap = {};
        const expenseMap = {};

        trans.forEach((item) => {
          const nominal = parseFloat(item.amount || item.nominal) || 0;
          const rawType = (item.type || item.jenis || item.category_type || '').toString().toLowerCase().trim();
          const catName = item.category || item.kategori || 'Lain-lain';

          if (rawType === 'masuk' || rawType === 'pemasukan' || rawType === 'income') {
            calcMasuk += nominal;
            listMasuk.push(item);
            incomeMap[catName] = (incomeMap[catName] || 0) + nominal;
          } else if (rawType === 'keluar' || rawType === 'pengeluaran' || rawType === 'expense') {
            calcKeluar += nominal;
            listKeluar.push(item);
            expenseMap[catName] = (expenseMap[catName] || 0) + nominal;
          } else {
            if (nominal >= 0) {
              calcMasuk += nominal;
              listMasuk.push(item);
              incomeMap[catName] = (incomeMap[catName] || 0) + nominal;
            } else {
              const absNominal = Math.abs(nominal);
              calcKeluar += absNominal;
              listKeluar.push(item);
              expenseMap[catName] = (expenseMap[catName] || 0) + absNominal;
            }
          }
        });

        // Pengolahan data chart Pemasukan
        let parsedIncome = Object.keys(incomeMap).map(key => ({ label: key, value: incomeMap[key] })).sort((a,b) => b.value - a.value);
        if (calcMasuk > 0) {
          parsedIncome = parsedIncome.map(item => ({ ...item, percentage: parseFloat(((item.value / calcMasuk) * 100).toFixed(1)) }));
        }

        // Pengolahan data chart Pengeluaran
        let parsedExpense = Object.keys(expenseMap).map(key => ({ label: key, value: expenseMap[key] })).sort((a,b) => b.value - a.value);
        if (calcKeluar > 0) {
          parsedExpense = parsedExpense.map(item => ({ ...item, percentage: parseFloat(((item.value / calcKeluar) * 100).toFixed(1)) }));
        }
        
        setIncomeChart(parsedIncome.slice(0, 5));
        setExpenseChart(parsedExpense.slice(0, 5));
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
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 font-mono text-xs text-slate-400">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Memisahkan Bagan Alokasi Pos Kas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4.5 max-w-7xl mx-auto px-1 sm:px-0 pb-16">
      
      {/* 1. BANNER TEXT */}
      {announcement && (
        <div className="w-full bg-amber-500/10 border border-amber-500/30 py-2.5 px-3 rounded-xl overflow-hidden flex items-center">
          <div className="flex whitespace-nowrap min-w-full relative">
            <div className="animate-marquee inline-block text-amber-400 font-bold text-[11px] tracking-wide uppercase font-mono">
              📢 {announcement} &nbsp;&nbsp;&bull;&nbsp;&nbsp; {announcement} &nbsp;&nbsp;&bull;&nbsp;&nbsp;
            </div>
          </div>
        </div>
      )}

      {/* 2. KARTU UTAMA TOTAL SISA KAS */}
      <div className={`p-5 sm:p-8 ${style.card} border rounded-2xl sm:rounded-3xl space-y-5 relative overflow-hidden`}>
        <div className="flex justify-between items-end gap-2">
          <div className="space-y-0.5">
            <p className={`${style.textMuted} font-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold`}>Total Sisa Kas Haul</p>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight break-words">
              {formatRupiah(totals.total)}
            </h2>
          </div>
          <div className="w-24 sm:w-36 h-12 shrink-0 opacity-80 pb-1">
            <svg viewBox="0 0 140 40" className="w-full h-full" fill="none">
              <path d="M0 35 Q 20 38 35 25 T 70 15 T 105 28 T 140 5" stroke={style.chartStroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

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

      {/* 3. MODEL INFOGRAFIS DONUT CHART GANDA (PEMASUKAN VS PENGELUARAN SINKRON) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* BAGAN PEMASUKAN */}
        <div className={`p-5 ${style.card} border rounded-2xl shadow-xl space-y-4`}>
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">🟢 Komposisi Pemasukan</h3>
            <p className={`text-[10px] ${style.textMuted} font-medium mt-0.5`}>Persentase kontribusi berdasarkan pos kategori masuk</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                <circle cx="70" cy="70" r={radius} stroke="#1e293b" strokeWidth="18" fill="transparent" />
                {(() => {
                  let accumulatedOffset = 0;
                  return incomeChart.map((item, index) => {
                    const strokeLength = (item.percentage / 100) * circumference;
                    const strokeOffset = circumference - strokeLength + accumulatedOffset;
                    accumulatedOffset -= strokeLength;
                    return (
                      <circle key={index} cx="70" cy="70" r={radius} stroke={INCOME_COLORS[index % INCOME_COLORS.length]} strokeWidth="18" strokeDasharray={circumference} strokeDashoffset={strokeOffset} fill="transparent" />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Masuk</span>
                <span className="text-xs font-black text-emerald-400 mt-0.5">{incomeChart.length} Pos</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              {incomeChart.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-[11px] font-medium border-b border-white/5 pb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length] }}></span>
                    <span className="text-slate-200 truncate uppercase tracking-wide">{item.label}</span>
                  </div>
                  <span className="font-mono shrink-0 font-bold text-emerald-400">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BAGAN PENGELUARAN */}
        <div className={`p-5 ${style.card} border rounded-2xl shadow-xl space-y-4`}>
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-400">🔴 Komposisi Pengeluaran</h3>
            <p className={`text-[10px] ${style.textMuted} font-medium mt-0.5`}>Persentase alokasi belanja berdasarkan pos belanja keluar</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                <circle cx="70" cy="70" r={radius} stroke="#1e293b" strokeWidth="18" fill="transparent" />
                {(() => {
                  let accumulatedOffset = 0;
                  return expenseChart.map((item, index) => {
                    const strokeLength = (item.percentage / 100) * circumference;
                    const strokeOffset = circumference - strokeLength + accumulatedOffset;
                    accumulatedOffset -= strokeLength;
                    return (
                      <circle key={index} cx="70" cy="70" r={radius} stroke={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} strokeWidth="18" strokeDasharray={circumference} strokeDashoffset={strokeOffset} fill="transparent" />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Keluar</span>
                <span className="text-xs font-black text-rose-400 mt-0.5">{expenseChart.length} Pos</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              {expenseChart.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-[11px] font-medium border-b border-white/5 pb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}></span>
                    <span className="text-slate-200 truncate uppercase tracking-wide">{item.label}</span>
                  </div>
                  <span className="font-mono shrink-0 font-bold text-rose-400">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 4. PROGRES TARGET PLAFON */}
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

      {/* 5. SEKSYEN RINCIAN TRANSAKSI */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-amber-500 text-xs">🕒</span>
          <h3 className="text-[10px] sm:text-xs font-black text-slate-300 uppercase tracking-wider">Transaksi Terakhir</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
