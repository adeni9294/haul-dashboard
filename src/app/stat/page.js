'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const THEME_STYLES = {
  'emerald-cyber': { card: 'bg-zinc-900 border-zinc-800 text-emerald-50 shadow-2xl', innerBg: 'bg-zinc-950 border border-zinc-850', textMuted: 'text-zinc-500', accentText: 'text-emerald-400', progressBg: 'from-emerald-600 to-emerald-400', accentTextBar: 'bg-gradient-to-t from-emerald-600/40 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]', unselectedBar: 'bg-zinc-800/40 border border-zinc-700/30' },
  'velvet-rose': { card: 'bg-neutral-900 border-purple-900/60 text-rose-50 shadow-2xl', innerBg: 'bg-purple-950 border border-purple-900/40', textMuted: 'text-purple-300', accentText: 'text-rose-400', progressBg: 'from-rose-600 to-fuchsia-500', accentTextBar: 'bg-gradient-to-t from-rose-600/40 to-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.3)]', unselectedBar: 'bg-neutral-800/40 border border-purple-950/30' },
  'neon-sunset': { card: 'bg-stone-900 border-stone-800 text-orange-50 shadow-2xl', innerBg: 'bg-stone-950 border border-stone-850', textMuted: 'text-stone-400', accentText: 'text-orange-400', progressBg: 'from-orange-600 to-orange-400', accentTextBar: 'bg-gradient-to-t from-orange-600/40 to-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.3)]', unselectedBar: 'bg-stone-800/40 border border-stone-700/30' },
  'amber-gold': { card: 'bg-gray-900 border-gray-800 text-amber-50 shadow-2xl', innerBg: 'bg-gray-950 border border-gray-850', textMuted: 'text-gray-400', accentText: 'text-amber-400', progressBg: 'from-amber-600 to-amber-400', accentTextBar: 'bg-gradient-to-t from-amber-600/40 to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]', unselectedBar: 'bg-gray-800/40 border border-gray-700/30' },
  'midnight-blue': { card: 'bg-slate-900 border-blue-900 text-blue-50 shadow-2xl', innerBg: 'bg-blue-950 border border-blue-900/40', textMuted: 'text-blue-400', accentText: 'text-blue-400', progressBg: 'from-blue-600 to-cyan-500', accentTextBar: 'bg-gradient-to-t from-blue-600/40 to-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)]', unselectedBar: 'bg-slate-800/40 border border-blue-950/30' },
  'nordic-frost': { card: 'bg-slate-800 border-slate-750 text-slate-50 shadow-2xl', innerBg: 'bg-slate-900 border border-slate-750', textMuted: 'text-slate-400', accentText: 'text-cyan-400', progressBg: 'from-cyan-600 to-teal-400', accentTextBar: 'bg-gradient-to-t from-cyan-600/40 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]', unselectedBar: 'bg-slate-700/40 border border-slate-600/30' },
  'crimson-tide': { card: 'bg-[#1A0B0B] border-[#3D1414] text-red-100 shadow-2xl', innerBg: 'bg-black/40 border border-red-950/40', textMuted: 'text-zinc-500', accentText: 'text-[#E63946]', progressBg: 'from-[#E63946] to-[#9B2226]', accentTextBar: 'bg-gradient-to-t from-[#9B2226]/40 to-[#E63946] shadow-[0_0_15px_rgba(230,57,70,0.3)]', unselectedBar: 'bg-zinc-900/40 border border-red-950/20' },
  'dracula-vamp': { card: 'bg-zinc-900 border-fuchsia-950 text-purple-200 shadow-2xl', innerBg: 'bg-black border border-fuchsia-950/60', textMuted: 'text-neutral-500', accentText: 'text-fuchsia-400', progressBg: 'from-purple-600 to-fuchsia-500', accentTextBar: 'bg-gradient-to-t from-purple-600/40 to-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.3)]', unselectedBar: 'bg-zinc-800/40 border border-fuchsia-950/20' },
  'forest-moss': { card: 'bg-stone-900 border-emerald-950 text-stone-100 shadow-2xl', innerBg: 'bg-emerald-950 border border-emerald-900/40', textMuted: 'text-stone-400', accentText: 'text-green-400', progressBg: 'from-emerald-700 to-green-500', accentTextBar: 'bg-gradient-to-t from-emerald-700/40 to-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]', unselectedBar: 'bg-stone-800/40 border border-emerald-950/20' },
  'default': { card: 'bg-[#12161A] border-[#1E2329] text-slate-100 shadow-2xl', innerBg: 'bg-black/30 border border-slate-800/40', textMuted: 'text-slate-400', accentText: 'text-[#BFEC25]', progressBg: 'from-[#BFEC25] to-[#A3CB1B]', accentTextBar: 'bg-gradient-to-t from-[#A3CB1B]/40 to-[#BFEC25] shadow-[0_0_15px_rgba(191,236,37,0.3)]', unselectedBar: 'bg-zinc-800/30 border border-zinc-700/20' }
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function StatPage() {
  const [loading, setLoading] = useState(true);
  const [currentThemeKey, setCurrentThemeKey] = useState('default');
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [activeMonthIndex, setActiveMonthIndex] = useState(new Date().getMonth());

  useEffect(() => {
    async function loadStatData() {
      try {
        setLoading(true);
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

        const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
        if (settingsData && settingsData.length > 0 && settingsData[0].theme) {
          setCurrentThemeKey(settingsData[0].theme);
        }

        const { data: trans, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: true });

        if (!error && trans) {
          let calcMasuk = 0;
          let calcKeluar = 0;
          
          const monthsMap = MONTH_LABELS.map((name) => ({ name, masuk: 0, keluar: 0 }));

          trans.forEach((item) => {
            const nominal = parseFloat(item.amount || item.nominal) || 0;
            const rawType = (item.type || item.jenis || item.category_type || '').toString().toLowerCase().trim();
            const catNameLower = (item.category || item.kategori || '').toString().toLowerCase().trim();

            const dateObj = new Date(item.transaction_date);
            const monthIdx = isNaN(dateObj.getTime()) ? new Date().getMonth() : dateObj.getMonth();

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
              monthsMap[monthIdx].masuk += nominal;
            } else {
              calcKeluar += nominal;
              monthsMap[monthIdx].keluar += nominal;
            }
          });

          setTotals({ total: calcMasuk - calcKeluar, masuk: calcMasuk, keluar: calcKeluar });
          setMonthlyData(monthsMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStatData();
  }, []);

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  const maxExpenseValue = monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.keluar), 1) : 1;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        ⏳ Membaca riwayat mutasi bulanan & menyusun visualisasi grafik...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-4 sm:px-6 pb-24 text-white">
      
      {/* JUDUL HALAMAN */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider font-mono">📊 Statistics Analytics</h2>
          <p className="text-[10px] text-slate-500">Akumulasi pengeluaran operasional per bulan</p>
        </div>
        <div className="flex gap-1.5 text-[10px] font-mono">
          <span className={`px-2 py-0.5 rounded bg-red-500/10 ${style.accentText} font-bold animate-pulse`}>● LIVE SYNC</span>
        </div>
      </div>

      {/* TOTAL VALUE PANEL */}
      <div className={`${style.card} border rounded-3xl p-6 relative overflow-hidden`}>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">TOTAL EXPENDITURE</span>
        <h3 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-black tracking-tight text-white">
          {formatRupiah(totals.keluar)}
        </h3>
        <p className="text-[10px] text-slate-400 mt-2">
          Dari total kas masuk terkumpul sebesar <span className="text-emerald-400 font-bold font-mono">{formatRupiah(totals.masuk)}</span>
        </p>
      </div>

      {/* GRAFIK BATANG BANNER PREMIUM DENGAN GLOW GLASS EFFECT */}
      <div className={`${style.card} border rounded-3xl p-5 sm:p-6 space-y-6`}>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 font-mono">Arus Belanja Bulanan</span>
          <span className="text-[10px] font-mono text-slate-500">Klik batang untuk detail</span>
        </div>

        {/* CONTAINER GRAFIK UTAMA */}
        <div className="h-56 w-full flex items-end justify-between gap-1.5 sm:gap-3.5 pt-8 border-b border-zinc-800/60 px-1">
          {monthlyData.map((item, index) => {
            const barHeightPercent = Math.max((item.keluar / maxExpenseValue) * 100, 2);
            const isSelected = activeMonthIndex === index;
            const hasData = item.keluar > 0;

            return (
              <div 
                key={index} 
                className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                onClick={() => setActiveMonthIndex(index)}
              >
                {/* Batang Premium - Glow Glass Effect */}
                <div 
                  className="w-full relative rounded-t-lg transition-all duration-300 transform group-hover:scale-105 min-h-[6px]" 
                  style={{ height: `${barHeightPercent}%` }}
                >
                  <div className={`w-full h-full absolute inset-0 rounded-t-lg transition-all duration-300 ${
                    isSelected 
                      ? `${style.accentTextBar} opacity-100 ring-2 ring-white/10` 
                      : hasData 
                        ? `${style.accentTextBar} opacity-60 group-hover:opacity-90`
                        : `${style.unselectedBar} group-hover:bg-zinc-700/30`
                  }`} />
                </div>
                {/* Label Bulan */}
                <span className={`text-[9px] font-mono mt-2.5 transition-colors duration-200 ${
                  isSelected ? `${style.accentText} font-black scale-105` : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* DETAIL BULAN YANG DIPILIH */}
        <div className={`${style.innerBg} p-4 rounded-2xl grid grid-cols-2 gap-4 shadow-inner`}>
          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase">Bulan Terpilih</p>
            <p className="text-sm font-black text-white">{MONTH_LABELS[activeMonthIndex]} 2026</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono text-slate-500 uppercase">Belanja Logistik</p>
            <p className="text-sm font-black text-rose-400 font-mono">
              {formatRupiah(monthlyData[activeMonthIndex]?.keluar || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* RINGKASAN METRIK KARTU BAWAH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-4 ${style.card} border rounded-2xl flex items-center justify-between`}>
          <div className="space-y-1">
            <p className="text-[9px] font-mono text-slate-500 uppercase">Rata-rata Pengeluaran</p>
            <h4 className="text-base font-bold text-white font-mono">
              {formatRupiah(Math.round(totals.keluar / 12))}
            </h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-black/40 border border-zinc-800/40 flex items-center justify-center text-xs shadow-inner">%-</div>
        </div>

        <div className={`p-4 ${style.card} border rounded-2xl flex items-center justify-between`}>
          <div className="space-y-1">
            <p className="text-[9px] font-mono text-slate-500 uppercase">Sisa Efisiensi Kas</p>
            <h4 className={`text-base font-bold ${style.accentText} font-mono`}>
              {formatRupiah(totals.total)}
            </h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-black/40 border border-zinc-800/40 flex items-center justify-center text-xs shadow-inner">💰</div>
        </div>
      </div>

    </div>
  );
}
