'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const THEME_STYLES = {
  'emerald-cyber': { 
    card: 'bg-zinc-900 border-zinc-800 text-emerald-50 shadow-2xl', 
    textMuted: 'text-zinc-500', 
    accentText: 'text-emerald-400', 
    progressBg: 'from-emerald-600 to-emerald-400', 
    balanceCard: 'bg-emerald-600 text-black shadow-emerald-500/10' 
  },
  'velvet-rose': { 
    card: 'bg-neutral-900 border-purple-900/40 text-rose-50 shadow-2xl', 
    textMuted: 'text-purple-300', 
    accentText: 'text-rose-400', 
    progressBg: 'from-rose-600 to-fuchsia-500', 
    balanceCard: 'bg-rose-500 text-black shadow-rose-500/10' 
  },
  'neon-sunset': { 
    card: 'bg-stone-900 border-stone-800 text-orange-50 shadow-2xl', 
    textMuted: 'text-stone-400', 
    accentText: 'text-orange-400', 
    progressBg: 'from-orange-600 to-orange-400', 
    balanceCard: 'bg-orange-500 text-black shadow-orange-500/10' 
  },
  'amber-gold': { 
    card: 'bg-gray-900 border-gray-800 text-amber-50 shadow-2xl', 
    textMuted: 'text-gray-400', 
    accentText: 'text-amber-400', 
    progressBg: 'from-amber-600 to-amber-400', 
    balanceCard: 'bg-amber-500 text-black shadow-amber-500/10' 
  },
  'midnight-blue': { 
    card: 'bg-slate-900 border-blue-900 text-blue-50 shadow-2xl', 
    textMuted: 'text-blue-400', 
    accentText: 'text-blue-400', 
    progressBg: 'from-blue-600 to-cyan-500', 
    balanceCard: 'bg-blue-500 text-black shadow-blue-500/10' 
  },
  'nordic-frost': { 
    card: 'bg-slate-800 border-slate-750 text-slate-50 shadow-2xl', 
    textMuted: 'text-slate-400', 
    accentText: 'text-cyan-400', 
    progressBg: 'from-cyan-600 to-teal-400', 
    balanceCard: 'bg-cyan-500 text-black shadow-cyan-500/10' 
  },
  'crimson-tide': { 
    card: 'bg-slate-950 border-red-950 text-red-100 shadow-2xl', 
    textMuted: 'text-zinc-400', 
    accentText: 'text-[#E63946]', 
    progressBg: 'from-[#E63946] to-[#9B2226]', 
    balanceCard: 'bg-[#9B2226] text-white shadow-[#9B2226]/20' 
  },
  'dracula-vamp': { 
    card: 'bg-zinc-900 border-fuchsia-950 text-purple-200 shadow-2xl', 
    textMuted: 'text-neutral-500', 
    accentText: 'text-fuchsia-400', 
    progressBg: 'from-purple-600 to-fuchsia-500', 
    balanceCard: 'bg-purple-600 text-white shadow-purple-600/20' 
  },
  'forest-moss': { 
    card: 'bg-stone-900 border-emerald-950 text-stone-100 shadow-2xl', 
    textMuted: 'text-stone-400', 
    accentText: 'text-green-400', 
    progressBg: 'from-emerald-700 to-green-500', 
    balanceCard: 'bg-emerald-600 text-white shadow-emerald-600/20' 
  },
  'default': { 
    card: 'bg-[#12161A] border-[#1E2329] text-slate-100 shadow-2xl', 
    textMuted: 'text-slate-400', 
    accentText: 'text-[#BFEC25]', 
    progressBg: 'from-[#BFEC25] to-[#A3CB1B]', 
    balanceCard: 'bg-[#BFEC25] text-black shadow-[#BFEC25]/20' 
  }
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 0 });
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);
  const [catSummaryMasuk, setCatSummaryMasuk] = useState([]);
  const [catSummaryKeluar, setCatSummaryKeluar] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => { loadDashboardData(); }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (settingsData && settingsData.length > 0) {
        setAnnouncement(settingsData[0].announcement || settingsData[0].banner_text || '');
        if (settingsData[0].logo_url) setLogoUrl(settingsData[0].logo_url);
        if (settingsData[0].theme) setCurrentThemeKey(settingsData[0].theme);
      }

      const { data: budgetsData } = await supabase.from('budgets').select('planned_amount');
      let totalPlafonDinamis = 0;
      if (budgetsData) {
        budgetsData.forEach(b => { totalPlafonDinamis += parseFloat(b.planned_amount) || 0; });
      }

      const { data: donationsDb } = await supabase.from('donation_details').select('*');
      const { data: transactionsDb } = await supabase.from('transactions').select('*');
      
      let calcMasuk = 0; 
      let calcKeluar = 0;
      const incomeMap = {}; 
      const expenseMap = {};
      
      const listPemasukanGrup = {};
      const listPengeluaranGrup = [];

      // 1. Olah data tabel inputan dari Aplikasi Pemasukan
      if (donationsDb) {
        donationsDb.forEach((item) => {
          const rawAmount = parseFloat(item.amount) || 0;
          const catName = (item.category || 'Lain-lain').toString().trim();
          const tgl = item.transaction_date;
          const donorNameClean = (item.donor_name || '').toString().trim();
          const isAdminFee = donorNameClean === '__ADMIN_FEE__';
          const isSaldoMengendap = donorNameClean === '__SALDO_MENGENDAP__';

          if (isAdminFee) {
            const nominalMinus = -Math.abs(rawAmount);
            calcMasuk += nominalMinus;
            incomeMap[catName] = (incomeMap[catName] || 0) + nominalMinus;
            
            const keyFee = `FEE_${item.id}`;
            listPemasukanGrup[keyFee] = {
              note: `POTONGAN ADMIN FEE KOLEKTIF BULAN ${tgl?.substring(0, 7)}`,
              transaction_date: tgl,
              amount: nominalMinus,
              isReduction: true
            };
          } else if (isSaldoMengendap) {
            const nominalPositif = Math.abs(rawAmount);
            calcMasuk += nominalPositif;
            incomeMap[catName] = (incomeMap[catName] || 0) + nominalPositif;
            
            const keySaldo = `SALDO_${item.id}`;
            listPemasukanGrup[keySaldo] = {
              note: `SALDO MENGENDAP BULAN ${tgl?.substring(0, 7)}`,
              transaction_date: tgl,
              amount: nominalPositif,
              isReduction: false
            };
          } else {
            // 🟢 PERBAIKAN UTAMA: Tampilkan nama donatur riil murni tanpa dibungkus teks "GABUNGAN DARI"
            const nominalPositif = Math.abs(rawAmount);
            calcMasuk += nominalPositif;
            incomeMap[catName] = (incomeMap[catName] || 0) + nominalPositif;

            const keyRil = `DONASI_${item.id}`;
            listPemasukanGrup[keyRil] = {
              note: donorNameClean.split(' - ')[0].toUpperCase(), // Mengambil nama depan donatur bersangkutan
              transaction_date: tgl,
              amount: nominalPositif,
              isReduction: false
            };
          }
        });
      }

      // 2. Olah tabel data manual operasional dari Buku Kas Transaksi Utama
      if (transactionsDb) {
        transactionsDb.forEach((item) => {
          const nominal = Math.abs(parseFloat(item.amount || item.nominal) || 0);
          const rawType = (item.type || item.jenis || '').toString().toLowerCase().trim();
          const catName = (item.category || item.kategori || 'Lain-lain').toString().trim();
          const tgl = item.transaction_date;

          if (rawType === 'keluar' || rawType === 'pengeluaran') {
            calcKeluar += nominal;
            expenseMap[catName] = (expenseMap[catName] || 0) + nominal;
            listPengeluaranGrup.push({
              note: item.note || 'Pengeluaran Operasional',
              transaction_date: tgl,
              amount: nominal
            });
          } else {
            calcMasuk += nominal;
            incomeMap[catName] = (incomeMap[catName] || 0) + nominal;
            
            const keyManual = `MANUAL_${item.id}`;
            listPemasukanGrup[keyManual] = {
              note: item.note || 'Pemasukan Tambahan',
              transaction_date: tgl,
              amount: nominal,
              isReduction: false
            };
          }
        });
      }

      const arrayMasukFinal = Object.values(listPemasukanGrup).sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
      const arrayKeluarFinal = listPengeluaranGrup.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));

      const parseChart = (map, total) => Object.keys(map).map(key => ({
        label: key, value: map[key], percentage: total > 0 ? parseFloat(((map[key] / total) * 100).toFixed(1)) : 0
      })).sort((a, b) => b.value - a.value);

      setCatSummaryMasuk(parseChart(incomeMap, calcMasuk));
      setCatSummaryKeluar(parseChart(expenseMap, calcKeluar));
      setTotals({ total: calcMasuk - calcKeluar, masuk: calcMasuk, keluar: calcKeluar });
      
      setRincianMasuk(arrayMasukFinal.slice(0, 15)); 
      setRincianKeluar(arrayKeluarFinal.slice(0, 15));

      let hitungPersen = 0;
      if (totalPlafonDinamis > 0) {
        hitungPersen = parseFloat(((calcMasuk / totalPlafonDinamis) * 100).toFixed(1));
      }
      setProgress({ percent: hitungPersen, current: calcMasuk, target: totalPlafonDinamis });

    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }

  const formatRupiah = (angka) => {
    const isMinus = angka < 0;
    const absValue = Math.abs(angka);
    const formatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(absValue);
    return isMinus ? `-${formatted}` : formatted;
  };
  
  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        ⏳ Memuat antarmuka Cirebonan Premium...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-4 sm:px-6 pb-12 -mt-1 text-white">
      
      {/* 1. TEXT BANNER INFORMASI */}
      {announcement && (
        <div className="w-full bg-black/40 border border-zinc-800/80 py-2.5 px-4 rounded-2xl overflow-hidden flex items-center shadow-inner">
          <div className={`animate-marquee inline-block ${style.accentText} font-bold text-[10px] sm:text-xs tracking-widest uppercase font-mono`}>
            📢 {announcement}
          </div>
        </div>
      )}

      {/* 2. AREA UTAMA KARTU SALDO & CARD PEMASUKAN/PENGELUARAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* KARTU SALDO UTAMA */}
        <div className={`${style.balanceCard} p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-between h-52 shadow-xl border border-white/5 transition-transform duration-300 hover:scale-[1.01]`}>
          <div className="absolute inset-y-0 right-0 w-[60%] opacity-[0.15] pointer-events-none select-none z-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200">
              <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M120,30 C145,10 175,15 185,35 C195,55 175,75 145,70 C115,65 105,40 120,30 Z" />
                <path d="M130,40 C150,25 170,28 177,42 C184,56 170,70 150,66 C130,62 123,48 130,40 Z" />
                <path d="M140,50 C152,40 162,42 166,50 C170,58 162,66 152,64 C142,62 138,56 140,50 Z" />
                <path d="M50,100 C75,80 105,85 115,105 C125,125 105,145 75,140 C45,135 35,110 50,100 Z" />
                <path d="M60,110 C78,95 98,98 105,112 C112,126 98,140 78,136 C58,132 51,118 60,110 Z" />
                <path d="M110,120 C135,100 165,105 175,125 C185,145 165,165 135,160 C105,155 95,130 110,120 Z" />
                <path d="M120,130 C140,115 160,118 167,132 C174,146 160,160 140,156 C120,152 113,138 120,130 Z" />
              </g>
            </svg>
          </div>
          <div className="relative z-10">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest opacity-60">KAS UTAMA HAUL</span>
            <p className="text-[11px] font-semibold opacity-70 mt-0.5">Sisa Saldo Kas Bersih</p>
          </div>
          <div className="relative z-10 mt-3">
            <h2 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-black tracking-tight leading-none">
              {formatRupiah(totals.total)}
            </h2>
            <div className="flex justify-between items-center mt-5 font-mono text-[10px] tracking-wider opacity-60">
              <span>**** **** **** 2026</span>
              <span className="font-bold uppercase tracking-wide">PANITIA HAUL</span>
            </div>
          </div>
        </div>

        {/* REKAP NOMINAL MASUK & KELUAR */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className={`p-5 ${style.card} border rounded-[28px] flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40`}>
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm shadow-sm">🟢</div>
              <p className={`text-[10px] font-mono ${style.textMuted} uppercase tracking-wider`}>Total Uang Masuk</p>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl font-['Space_Grotesk']">{formatRupiah(totals.masuk)}</h3>
              <p className="text-[10px] text-emerald-400 font-medium mt-1">✓ {catSummaryMasuk.length} Kategori Kontribusi</p>
            </div>
          </div>

          <div className={`p-5 ${style.card} border rounded-[28px] flex flex-col justify-between transition-all duration-300 hover:border-rose-500/40`}>
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-sm shadow-sm">🔴</div>
              <p className={`text-[10px] font-mono ${style.textMuted} uppercase tracking-wider`}>Total Uang Belanja</p>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl font-['Space_Grotesk']">{formatRupiah(totals.keluar)}</h3>
              <p className="text-[10px] text-rose-400 font-medium mt-1">⚡ {catSummaryKeluar.length} Pos Alokasi Terpakai</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. PROGRESS TARGET ANGGARAN BAR */}
      <div className={`p-5 ${style.card} border rounded-2xl space-y-3 shadow-xl`}>
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> Progres Capaian Target Plafon Anggaran
          </h3>
          <span className={`${style.accentText} font-mono text-xs font-black bg-white/5 px-2 py-0.5 rounded-md`}>{progress.percent}%</span>
        </div>
        <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-zinc-800/50">
          <div className={`h-full bg-gradient-to-r ${style.progressBg} rounded-full transition-all duration-500`} style={{ width: `${Math.min(progress.percent, 100)}%` }}></div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-0.5">
          <span>Terkumpul: <strong className="text-slate-300">{formatRupiah(progress.current)}</strong></span>
          <span>Plafon Target: <strong className="text-slate-300">{formatRupiah(progress.target)}</strong></span>
        </div>
      </div>

      {/* 4. REKAP NOMINAL TOTAL PER KATEGORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-5 ${style.card} border rounded-2xl space-y-3.5 shadow-xl`}>
          <h4 className={`text-[10px] font-black ${style.accentText} uppercase tracking-widest border-b border-white/5 pb-2`}>📊 Rekap Kategori Uang Masuk</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryMasuk.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                <span className="text-zinc-100 flex items-center gap-1">🔹 {c.label}</span>
                <span className={`font-mono font-bold ${c.value < 0 ? 'text-red-400' : style.accentText}`}>{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-5 ${style.card} border rounded-2xl space-y-3.5 shadow-xl`}>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-white/5 pb-2">📊 Rekap Alokasi Anggaran Belanja</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryKeluar.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                <span className="text-zinc-100 flex items-center gap-1">🔸 {c.label}</span>
                <span className="font-mono font-bold text-rose-400">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. DATA RINCIAN MUTASI TERAKHIR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-5 ${style.card} border-l-4 border-l-emerald-500 rounded-2xl space-y-3.5 shadow-xl`}>
          <h5 className={`text-[10px] font-black ${style.accentText} uppercase tracking-wider`}>Pemasukan Terakhir (Deposits)</h5>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {rincianMasuk.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-1">Belum ada mutasi masuk.</p>
            ) : (
              rincianMasuk.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-100 font-bold truncate uppercase tracking-wide">{t.note}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <p className={`font-mono font-black shrink-0 ml-3 text-sm ${t.amount < 0 ? 'text-red-400' : style.accentText}`}>
                    {t.amount < 0 ? formatRupiah(t.amount) : `+${formatRupiah(t.amount)}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`p-5 ${style.card} border-l-4 border-l-rose-500 rounded-2xl space-y-3.5 shadow-xl`}>
          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Pengeluaran Terakhir (Withdrawals)</h5>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {rincianKeluar.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-1">Belum ada mutasi belanja.</p>
            ) : (
              rincianKeluar.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-100 font-bold truncate uppercase tracking-wide">{t.note}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <div className="font-mono font-black text-rose-400 shrink-0 ml-3 text-sm">-{formatRupiah(t.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
