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

        // 1. Ambil Setelan Tema
        const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
        if (settingsData && settingsData.length > 0 && settingsData[0].theme) {
          setCurrentThemeKey(settingsData[0].theme);
        }

        // 2. Ambil Semua Data Transaksi
        const { data: trans, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: true });

        if (!error && trans) {
          let calcMasuk = 0;
          let calcKeluar = 0;
          
          // Inisialisasi wadah 12 bulan
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

  // Cari angka pengeluaran tertinggi untuk skala tinggi grafik batang
  const maxExpenseValue = monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.keluar), 1) : 1;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        ⏳ Membaca riwayat mutasi bulanan & menyusun visualisasi grafik...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-1 sm:px-0 pb-16">
      
      {/* JUDUL HALAMAN */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white font-mono">📊 Statics Analytics</h2>
          <p className="text-[10px] text-slate-500">Akumulasi pengeluaran operasional per bulan</p>
        </div>
        <div className="flex gap-1.5 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#BFEC25]/20 text-[#BFEC25] font-bold">LIVE</span>
        </div>
      </div>

      {/* TOTAL VALUE PANEL */}
      <div className={`${style.card} border rounded-3xl p-6 relative overflow-hidden shadow-xl`}>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">TOTAL EXPENDITURE</span>
        <h3 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-black text-white tracking-tight">
          {formatRupiah(totals.keluar)}
        </h3>
        <p className="text-[10px] text-slate-400 mt-2">
          Dari total kas masuk terkumpul sebesar <span className="text-emerald-400 font-bold font-mono">{formatRupiah(totals.masuk)}</span>
        </p>
      </div>

      {/* GRAFIK BATANG BANNER PREMIUM (MENIRU REFERENSI) */}
      <div className={`${style.card} border rounded-3xl p-5 sm:p-6 shadow-xl space-y-6`}>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 font-mono">Arus Belanja Bulanan</span>
          <span className="text-[10px] font-mono text-slate-500">Klik batang untuk detail</span>
        </div>

        {/* CONTAINER GRAFIK */}
        <div className="h-52 w-full flex items-end justify-between gap-1 sm:gap-3 pt-6 border-b border-slate-800/80 px-1">
          {monthlyData.map((item, index) => {
            // Hitung tinggi batang dalam persen
            const barHeightPercent = Math.max((item.keluar / maxExpenseValue) * 100, 4);
            const isSelected = activeMonthIndex === index;

            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center group cursor-pointer"
                onClick={() => setActiveMonthIndex(index)}
              >
                {/* Batang */}
                <div className="w-full relative rounded-t-md transition-all duration-300 overflow-hidden" style={{ height: `${barHeightPercent}%` }}>
                  <div className={`w-full h-full absolute inset-0 transition-colors ${
                    isSelected 
                      ? 'bg-[#BFEC25] shadow-lg shadow-[#BFEC25]/20' 
                      : 'bg-zinc-800 group-hover:bg-zinc-700'
                  }`} />
                </div>
                {/* Label Bulan */}
                <span className={`text-[9px] font-mono mt-2 transition-colors ${
                  isSelected ? 'text-[#BFEC25] font-black' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* DETAIL BULAN YANG DIPILIH */}
        <div className="p-4 bg-black/40 border border-slate-850 rounded-2xl grid grid-cols-2 gap-4">
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
        <div className={`p-4 ${style.card} border rounded-2xl flex items-center justify-between shadow-lg`}>
          <div className="space-y-1">
            <p className="text-[9px] font-mono text-slate-500 uppercase">Rata-rata Pengeluaran</p>
            <h4 className="text-base font-bold text-white font-mono">
              {formatRupiah(totals.keluar / 12)}
            </h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-xs">📉</div>
        </div>

        <div className={`p-4 ${style.card} border rounded-2xl flex items-center justify-between shadow-lg`}>
          <div className="space-y-1">
            <p className="text-[9px] font-mono text-slate-500 uppercase">Sisa Efisiensi Kas</p>
            <h4 className="text-base font-bold text-[#BFEC25] font-mono">
              {formatRupiah(totals.total)}
            </h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-xs">💰</div>
        </div>
      </div>

    </div>
  );
}
