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
  'default': { card: 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl', innerBg: 'bg-slate-950 border border-slate-800/60', textMuted: 'text-slate-400', accentText: 'text-amber-500', progressBg: 'from-amber-600 to-amber-400' }
};

const INCOME_COLORS = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#a7f3d0'];
const EXPENSE_COLORS = ['#f43f5e', '#fb7185', '#e11d48', '#fda4af', '#fecdd3'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 15300000 });
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);
  const [catSummaryMasuk, setCatSummaryMasuk] = useState([]);
  const [catSummaryKeluar, setCatSummaryKeluar] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => { loadDashboardData(); }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

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
        let calcMasuk = 0; let calcKeluar = 0;
        const listMasuk = []; const listKeluar = [];
        const incomeMap = {}; const expenseMap = {};

        trans.forEach((item) => {
          const nominal = parseFloat(item.amount || item.nominal) || 0;
          const rawType = (item.type || item.jenis || item.category_type || '').toString().toLowerCase().trim();
          const catName = item.category || item.kategori || 'Lain-lain';

          if (rawType === 'masuk' || rawType === 'pemasukan' || rawType === 'income') {
            calcMasuk += nominal; listMasuk.push(item);
            incomeMap[catName] = (incomeMap[catName] || 0) + nominal;
          } else {
            calcKeluar += nominal; listKeluar.push(item);
            expenseMap[catName] = (expenseMap[catName] || 0) + nominal;
          }
        });

        const parseChart = (map, total) => Object.keys(map).map(key => ({
          label: key, value: map[key], percentage: total > 0 ? parseFloat(((map[key] / total) * 100).toFixed(1)) : 0
        })).sort((a,b) => b.value - a.value);

        setCatSummaryMasuk(parseChart(incomeMap, calcMasuk));
        setCatSummaryKeluar(parseChart(expenseMap, calcKeluar));
        setTotals({ total: calcMasuk - calcKeluar, masuk: calcMasuk, keluar: calcKeluar });
        setRincianMasuk(listMasuk.slice(0, 5));
        setRincianKeluar(listKeluar.slice(0, 5));

        const hitungPersen = Math.min(Math.round((calcMasuk / targetDana) * 100), 100);
        setProgress({ percent: hitungPersen, current: calcMasuk, target: targetDana });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];
  const radius = 50; const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-4.5 max-w-7xl mx-auto px-1 sm:px-0 pb-16">
      {announcement && (
        <div className="w-full bg-amber-500/10 border border-amber-500/30 py-2.5 px-3 rounded-xl overflow-hidden flex items-center">
          <div className="animate-marquee inline-block text-amber-400 font-bold text-[11px] tracking-wide uppercase font-mono">📢 {announcement}</div>
        </div>
      )}

      {/* 2. AREA TOTAL SALDO & 3 MINI PIE CHARTS */}
      <div className={`p-5 sm:p-7 ${style.card} border rounded-2xl sm:rounded-3xl shadow-xl space-y-6`}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-center">
          
          {/* Kolom Kiri: Sisa Kas Total */}
          <div className="space-y-1">
            <p className={`${style.textMuted} font-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold`}>Total Sisa Kas Haul</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{formatRupiah(totals.total)}</h2>
          </div>

          {/* Kolom Tengah & Kanan: Wrapper 3 Pie Chart Berdampingan */}
          <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            
            {/* Chart 1: Bagan Anggaran */}
            <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5 justify-center sm:justify-start">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                  <circle cx="70" cy="70" r={radius} stroke="#1e293b" strokeWidth="18" fill="transparent" />
                  <circle cx="70" cy="70" r={radius} stroke="#f59e0b" strokeWidth="18" strokeDasharray={circumference} strokeDashoffset={circumference - (progress.percent / 100) * circumference} fill="transparent" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-black text-white font-mono">{progress.percent}%</span></div>
              </div>
              <div className="text-left"><p className="text-[10px] font-bold text-slate-300 uppercase">Target Anggaran</p><p className="text-[9px] font-mono text-amber-400">{formatRupiah(progress.target)}</p></div>
            </div>

            {/* Chart 2: Komposisi Pemasukan */}
            <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5 justify-center sm:justify-start">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                  <circle cx="70" cy="70" r={radius} stroke="#1e293b" strokeWidth="18" fill="transparent" />
                  {(() => { let offset = 0; return catSummaryMasuk.map((item, i) => { const len = (item.percentage / 100) * circumference; const strokeOffset = circumference - len + offset; offset -= len; return <circle key={i} cx="70" cy="70" r={radius} stroke={INCOME_COLORS[i % INCOME_COLORS.length]} strokeWidth="18" strokeDasharray={circumference} strokeDashoffset={strokeOffset} fill="transparent" />; }); })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-black text-emerald-400 font-mono">{catSummaryMasuk.length} Pos</span></div>
              </div>
              <div className="text-left"><p className="text-[10px] font-bold text-slate-300 uppercase">Pos Pemasukan</p><p className="text-[9px] font-mono text-emerald-400">{formatRupiah(totals.masuk)}</p></div>
            </div>

            {/* Chart 3: Komposisi Pengeluaran */}
            <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5 justify-center sm:justify-start">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                  <circle cx="70" cy="70" r={radius} stroke="#1e293b" strokeWidth="18" fill="transparent" />
                  {(() => { let offset = 0; return catSummaryKeluar.map((item, i) => { const len = (item.percentage / 100) * circumference; const strokeOffset = circumference - len + offset; offset -= len; return <circle key={i} cx="70" cy="70" r={radius} stroke={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} strokeWidth="18" strokeDasharray={circumference} strokeDashoffset={strokeOffset} fill="transparent" />; }); })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-black text-rose-400 font-mono">{catSummaryKeluar.length} Pos</span></div>
              </div>
              <div className="text-left"><p className="text-[10px] font-bold text-slate-300 uppercase">Pos Belanja</p><p className="text-[9px] font-mono text-rose-400">{formatRupiah(totals.keluar)}</p></div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. PROGRES TARGET BAR */}
      <div className={`p-4 sm:p-5 ${style.card} border rounded-xl space-y-2.5`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5"><span className="text-amber-500 text-xs">🎯</span><h3 className="text-[10px] sm:text-xs font-black text-slate-200 uppercase tracking-wider">Progres Target Dana</h3></div>
          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black rounded border border-amber-500/40">{progress.percent}%</span>
        </div>
        <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div className={`h-full bg-gradient-to-r ${style.progressBg} rounded-full transition-all duration-1000`} style={{ width: `${progress.percent}%` }}></div>
        </div>
      </div>

      {/* 4. SEKSYEN BARU: REKAPITULASI NOMINAL PER KATEGORI (DIBAWAH PROGRES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rekap Kategori Pemasukan */}
        <div className={`p-4 ${style.card} border rounded-xl space-y-2`}>
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">📊 Total per Kategori Pemasukan</h4>
          <div className="space-y-1.5 pt-1">
            {catSummaryMasuk.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1">
                <span className="text-slate-300 font-medium">🏷️ {c.label}</span>
                <span className="font-mono font-bold text-emerald-400">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Rekap Kategori Pengeluaran */}
        <div className={`p-4 ${style.card} border rounded-xl space-y-2`}>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">📊 Total per Kategori Pengeluaran</h4>
          <div className="space-y-1.5 pt-1">
            {catSummaryKeluar.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1">
                <span className="text-slate-300 font-medium">📦 {c.label}</span>
                <span className="font-mono font-bold text-rose-400">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. SEKSYEN RINCIAN TRANSAKSI TERAKHIR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 ${style.card} border-l-4 border-l-emerald-500 border-y border-r rounded-xl space-y-2.5`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800"><span className="text-[10px] font-black text-emerald-400 tracking-wider">🟢 KAS MASUK TERBARU</span></div>
          <div className="space-y-2 divide-y divide-slate-800">{rincianMasuk.map((item, idx) => (<div key={idx} className="flex justify-between items-center pt-2 first:pt-0"><div className="min-w-0 flex-1"><p className="text-slate-100 font-bold text-xs truncate">{item.description}</p><p className="text-[9px] font-mono text-slate-500">{item.transaction_date}</p></div><p className="text-xs font-black font-mono text-emerald-400 shrink-0">+{formatRupiah(item.amount)}</p></div>))}</div>
        </div>
        <div className={`p-4 ${style.card} border-l-4 border-l-rose-500 border-y border-r rounded-xl space-y-2.5`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800"><span className="text-[10px] font-black text-rose-400 tracking-wider">🔴 KAS KELUAR TERBARU</span></div>
          <div className="space-y-2 divide-y divide-slate-800">{rincianKeluar.map((item, idx) => (<div key={idx} className="flex justify-between items-center pt-2 first:pt-0"><div className="min-w-0 flex-1"><p className="text-slate-100 font-bold text-xs truncate">{item.description}</p><p className="text-[9px] font-mono text-slate-500">{item.transaction_date}</p></div><p className="text-xs font-black font-mono text-rose-400 shrink-0">-{formatRupiah(item.amount)}</p></div>))}</div>
        </div>
      </div>
    </div>
  );
}
