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

const INCOME_COLORS = ['#bfec25', '#a3cb1b', '#86a714', '#6a840d', '#4d6108'];
const EXPENSE_COLORS = ['#f43f5e', '#fb7185', '#e11d48', '#fda4af', '#fecdd3'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 0 });
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

      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (settingsData && settingsData.length > 0) {
        setAnnouncement(settingsData[0].announcement || settingsData[0].banner_text || '');
        if (settingsData[0].theme) setCurrentThemeKey(settingsData[0].theme);
      }

      const { data: budgetsData } = await supabase.from('budgets').select('planned_amount');
      let totalPlafonDinamis = 0;
      if (budgetsData) {
        budgetsData.forEach(b => {
          totalPlafonDinamis += parseFloat(b.planned_amount) || 0;
        });
      }

      const { data: trans, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (!error && trans) {
        let calcMasuk = 0; let calcKeluar = 0;
        const listMasuk = []; const listKeluar = [];
        const incomeMap = {}; const expenseMap = {};

        trans.forEach((item) => {
          const nominal = parseFloat(item.amount || item.nominal) || 0;
          const rawType = (item.type || item.jenis || item.category_type || '').toString().toLowerCase().trim();
          const catName = (item.category || item.kategori || 'Lain-lain').toString().trim();
          const catNameLower = catName.toLowerCase();

          if (
            rawType === 'masuk' || 
            rawType === 'pemasukan' || 
            rawType === 'income' ||
            catNameLower.includes('masuk') || 
            catNameLower.includes('iuran') || 
            catNameLower.includes('sumbangan') ||
            catNameLower.includes('kas awal')
          ) {
            calcMasuk += nominal;
            item.runtime_type = 'masuk'; 
            listMasuk.push(item);
            incomeMap[catName] = (incomeMap[catName] || 0) + nominal;
          } else {
            calcKeluar += nominal;
            item.runtime_type = 'keluar';
            listKeluar.push(item);
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

        let hitungPersen = 0;
        if (totalPlafonDinamis > 0) {
          hitungPersen = Math.round((calcKeluar / totalPlafonDinamis) * 100);
        }
        setProgress({ percent: hitungPersen, current: calcKeluar, target: totalPlafonDinamis });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];
  const radius = 50; const circumference = 2 * Math.PI * radius;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        ⏳ Sinkronisasi data real-time dengan sistem database Supabase...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-1 sm:px-0 pb-16">
      
      {/* 1. RUNNING BANNER TEXT */}
      {announcement && (
        <div className="w-full bg-[#BFEC25]/10 border border-[#BFEC25]/20 py-2 px-3 rounded-xl overflow-hidden flex items-center">
          <div className="animate-marquee inline-block text-[#BFEC25] font-bold text-[10px] tracking-widest uppercase font-mono">
            📢 {announcement}
          </div>
        </div>
      )}

      {/* 2. AREA KARTU SALDO UTAMA NEON LIME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KARTU FISIK ELEGAN (Saldo Akhir Bersih) */}
        <div className="bg-[#BFEC25] text-[#0E1012] p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-52 shadow-xl shadow-[#BFEC25]/5 border border-[#BFEC25]">
          {/* Ornamen Masjid Minimalis Melayang */}
          <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 22h20"/><path d="M12 2v3"/><path d="M12 7a5 5 0 0 1 5 5v10H7V12a5 5 0 0 1 5-5z"/><path d="M17 14h3a2 2 0 0 1 2 2v6h-5v-8z"/><path d="M7 14H4a2 2 0 0 0-2 2v6h5v-8z"/></svg>
          </div>
          <div>
            <span className="font-mono text-xs font-black uppercase tracking-widest opacity-60">KAS UTAMA HAUL</span>
            <p className="text-xs font-medium opacity-70 mt-1">Sisa Saldo Kas Bersih</p>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-black tracking-tight leading-none">
              {formatRupiah(totals.total)}
            </h2>
            <div className="flex justify-between items-center mt-5 font-mono text-[10px] tracking-wider opacity-60">
              <span>**** **** **** 2026</span>
              <span>PANITIA HAUL</span>
            </div>
          </div>
        </div>

        {/* INTEGRASI KOTAK NOMINAL PEMASUKAN DAN PENGELUARAN */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 h-full">
          <div className={`p-5 ${style.card} border rounded-3xl flex flex-col justify-between shadow-xl`}>
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm">🟢</div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">Total Uang Masuk</p>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{formatRupiah(totals.masuk)}</h3>
              <p className="text-[9px] text-emerald-400 font-medium mt-1">+{catSummaryMasuk.length} Kategori Kontribusi</p>
            </div>
          </div>

          <div className={`p-5 ${style.card} border rounded-3xl flex flex-col justify-between shadow-xl`}>
            <div>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-sm">🔴</div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">Total Uang Belanja</p>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{formatRupiah(totals.keluar)}</h3>
              <p className="text-[9px] text-rose-400 font-medium mt-1">-{catSummaryKeluar.length} Pos Alokasi Terpakai</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROGRESS TARGET BAR */}
      <div className={`p-4 sm:p-5 ${style.card} border rounded-2xl space-y-3 shadow-xl`}>
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-wider">🎯 Progres Capaian Target Plafon Anggaran</h3>
            <p className="text-[9px] text-slate-500">Batas maksimal anggaran belanja yang direncanakan</p>
          </div>
          <span className="text-[#BFEC25] font-mono text-xs font-black">{progress.percent}%</span>
        </div>
        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div className={`h-full bg-gradient-to-r ${style.progressBg}`} style={{ width: `${Math.min(progress.percent, 100)}%` }}></div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>Terpakai: {formatRupiah(progress.current)}</span>
          <span>Plafon: {formatRupiah(progress.target)}</span>
        </div>
      </div>

      {/* 4. REKAP NOMINAL PER KATEGORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 ${style.card} border rounded-2xl space-y-4 shadow-xl`}>
          <h4 className="text-[10px] font-black text-[#BFEC25] uppercase tracking-widest border-b border-white/5 pb-2">📊 Rincian Per Kategori Pemasukan</h4>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {catSummaryMasuk.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5 last:border-0">
                <span className="text-slate-300 font-medium">🏷️ {c.label}</span>
                <div className="text-right">
                  <p className="font-mono font-bold text-[#BFEC25]">{formatRupiah(c.value)}</p>
                  <p className="text-[8px] text-slate-500 font-mono">{c.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-5 ${style.card} border rounded-2xl space-y-4 shadow-xl`}>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-white/5 pb-2">📊 Rincian Per Kategori Pengeluaran</h4>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {catSummaryKeluar.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5 last:border-0">
                <span className="text-slate-300 font-medium">📦 {c.label}</span>
                <div className="text-right">
                  <p className="font-mono font-bold text-rose-400">{formatRupiah(c.value)}</p>
                  <p className="text-[8px] text-slate-500 font-mono">{c.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. DATA RINCIAN TRANSAKSI TERAKHIR (RECENT TRANSACTIONS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MUTASI MASUK */}
        <div className={`p-5 ${style.card} border-l-4 border-l-[#BFEC25] rounded-2xl space-y-4 shadow-xl`}>
          <h5 className="text-[10px] font-black text-[#BFEC25] uppercase tracking-wider">Recent Deposits (Pemasukan Terakhir)</h5>
          <div className="space-y-3">
            {rincianMasuk.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2">Belum ada mutasi dana masuk.</p>
            ) : (
              rincianMasuk.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs group">
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-100 font-bold truncate group-hover:text-[#BFEC25] transition-colors">{t.note || t.keterangan || t.description}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <p className="font-mono font-black text-[#BFEC25] shrink-0 ml-3">+{formatRupiah(t.amount)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MUTASI KELUAR */}
        <div className={`p-5 ${style.card} border-l-4 border-l-rose-500 rounded-2xl space-y-4 shadow-xl`}>
          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Recent Withdrawals (Pengeluaran Terakhir)</h5>
          <div className="space-y-3">
            {rincianKeluar.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2">Belum ada mutasi belanja logistik.</p>
            ) : (
              rincianKeluar.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs group">
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-100 font-bold truncate group-hover:text-rose-400 transition-colors">{t.note || t.keterangan || t.description}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <p className="font-mono font-black text-rose-400 shrink-0 ml-3">-{formatRupiah(t.amount)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
