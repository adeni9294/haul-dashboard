'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🌐 KAMUS 3 BAHASA (INDONESIA, REANG/CIREBON, ENGLISH)
const DICTIONARY = {
  id: {
    loading: '⏳ Memuat antarmuka Cirebonan Premium...',
    mainCash: 'KAS UTAMA HAUL',
    netBalance: 'Sisa Saldo Kas Bersih',
    committee: 'PANITIA HAUL',
    totalIncome: 'Total Uang Masuk',
    totalExpense: 'Total Uang Belanja',
    categories: 'Kategori Kontribusi',
    allocation: 'Pos Alokasi Terpakai',
    progressTitle: 'Progres Capaian Target Plafon Anggaran',
    collected: 'Terkumpul',
    target: 'Plafon Target',
    rekapIncome: '📊 Rekap Kategori Uang Masuk',
    rekapExpense: '📊 Rekap Alokasi Anggaran Belanja',
    lastIncome: 'Pemasukan Terakhir (Cash In)',
    lastExpense: 'Pengeluaran Terakhir (Cash Out)',
    emptyMutationIn: 'Belum ada mutasi masuk.',
    emptyMutationOut: 'Belum ada mutasi belanja.',
    systemFee: 'POTONGAN ADMIN FEE KOLEKTIF BULAN',
    settledBalance: 'SALDO MENGENDAP BULAN',
    combinedDonor: 'GABUNGAN DARI',
    donorUpper: 'DONATUR',
    operasionalExpense: 'Pengeluaran Operasional',
    totalKunjungan: 'Total Kunjungan Aplikasi',
    pengunjungUnik: 'Pengunjung Unik (IP)',
    // ➕ Fitur Baru Period
    selectPeriod: 'PILIH PERIODE HAUL:',
    initialBalance: 'Saldo Awal Kas',
    statusClosed: '(Selesai/Tutup Buku)',
    statusActive: '(Berjalan)'
  },
  jv: { 
    loading: '⏳ Nembe ngebuka antarmuka Cirebonan Premium...',
    mainCash: 'KAS UTAMA HAUL',
    netBalance: 'Sisa Saldo Kas Bersih',
    committee: 'PANITIA HAUL',
    totalIncome: 'Total Pragat Mlebu',
    totalExpense: 'Total Pragat Blonjo',
    categories: 'Werna Sumbangan',
    allocation: 'Pos Alokasi Sing Dinggo',
    progressTitle: 'Progres Capaian Target Plafon Anggaran',
    collected: 'Kekumpul',
    target: 'Plafon Target',
    rekapIncome: '📊 Rekap Kategori Pragat Mlebu',
    rekapExpense: '📊 Rekap Alokasi Anggaran Blonjo',
    lastIncome: 'Mutasi Mlebu Keri Jelas (Cash In)',
    lastExpense: 'Mutasi Blonjo Keri Jelas (Cash Out)',
    emptyMutationIn: 'Durung ana mutasi mlebu.',
    emptyMutationOut: 'Durung ana mutasi blonjo.',
    systemFee: 'POTONGAN ADMIN FEE KOLEKTIF WULAN',
    settledBalance: 'SALDO MENGENDAP WULAN',
    combinedDonor: 'GABUNGAN SAKING',
    donorUpper: 'DONATUR',
    operasionalExpense: 'Pragat Blonjo Operasional',
    totalKunjungan: 'Kabeh Klik Sing Mlebu',
    pengunjungUnik: 'Wong Sing Deleng (IP)',
    // ➕ Fitur Baru Period
    selectPeriod: 'PILIH PERIODE HAUL:',
    initialBalance: 'Bondo Awal Kas',
    statusClosed: '(Rampung/Tutup Buku)',
    statusActive: '(Mlaku)'
  },
  en: {
    loading: '⏳ Loading Premium Interface...',
    mainCash: 'HAUL MAIN CASH',
    netBalance: 'Net Cash Balance Remaining',
    committee: 'HAUL COMMITTEE',
    totalIncome: 'Total Cash Inflow',
    totalExpense: 'Total Expenditures',
    categories: 'Contribution Categories',
    allocation: 'Used Allocation Posts',
    progressTitle: 'Budget Ceiling Target Achievement Progress',
    collected: 'Collected',
    target: 'Target Ceiling',
    rekapIncome: '📊 Cash Inflow Category Summary',
    rekapExpense: '📊 Budgetary Allocation Summary',
    lastIncome: 'Latest Cash Inflows (Cash In)',
    lastExpense: 'Latest Expenditures (Cash Out)',
    emptyMutationIn: 'No incoming mutations yet.',
    emptyMutationOut: 'No expenditure mutations yet.',
    systemFee: 'COLLECTIVE ADMIN FEE DEDUCTION FOR MONTH',
    settledBalance: 'RETAINED BALANCE FOR MONTH',
    combinedDonor: 'COMBINED OF',
    donorUpper: 'DONORS',
    operasionalExpense: 'Operational Expenditure',
    totalKunjungan: 'Total Hits / Pageviews',
    pengunjungUnik: 'Unique Visitors (IP)',
    // ➕ Fitur Baru Period
    selectPeriod: 'SELECT HAUL PERIOD:',
    initialBalance: 'Opening Cash Balance',
    statusClosed: '(Closed)',
    statusActive: '(Active)'
  }
};

const THEME_STYLES = {
  'emerald-cyber': { card: 'bg-emerald-950/20 border-emerald-500/30 text-emerald-50 shadow-2xl', textMuted: 'text-emerald-400/70', accentText: 'text-emerald-400', progressBg: 'from-emerald-600 to-emerald-400', balanceCard: 'bg-emerald-600 text-black shadow-emerald-500/20' },
  'velvet-rose': { card: 'bg-rose-950/20 border-rose-500/30 text-rose-50 shadow-2xl', textMuted: 'text-purple-300', accentText: 'text-rose-400', progressBg: 'from-rose-600 to-fuchsia-500', balanceCard: 'bg-rose-500 text-black shadow-rose-500/20' },
  'neon-sunset': { card: 'bg-orange-950/20 border-orange-500/30 text-orange-50 shadow-2xl', textMuted: 'text-stone-400', accentText: 'text-orange-400', progressBg: 'from-orange-600 to-orange-400', balanceCard: 'bg-orange-500 text-black shadow-orange-500/20' },
  'amber-gold': { card: 'bg-amber-950/20 border-amber-500/30 text-amber-50 shadow-2xl', textMuted: 'text-gray-400', accentText: 'text-amber-400', progressBg: 'from-amber-600 to-amber-400', balanceCard: 'bg-amber-500 text-black shadow-amber-500/20' },
  'midnight-blue': { card: 'bg-blue-950/20 border-blue-500/30 text-blue-50 shadow-2xl', textMuted: 'text-blue-400', accentText: 'text-blue-400', progressBg: 'from-blue-600 to-cyan-500', balanceCard: 'bg-blue-500 text-black shadow-blue-500/20' },
  'nordic-frost': { card: 'bg-slate-900/30 border-cyan-500/30 text-slate-50 shadow-2xl', textMuted: 'text-slate-400', accentText: 'text-cyan-400', progressBg: 'from-cyan-600 to-teal-400', balanceCard: 'bg-cyan-500 text-black shadow-cyan-500/20' },
  'crimson-tide': { card: 'bg-red-950/20 border-red-500/30 text-red-100 shadow-2xl', textMuted: 'text-zinc-400', accentText: 'text-[#E63946]', progressBg: 'from-[#E63946] to-[#9B2226]', balanceCard: 'bg-[#9B2226] text-white shadow-[#9B2226]/20' },
  'dracula-vamp': { card: 'bg-purple-950/20 border-fuchsia-500/30 text-purple-200 shadow-2xl', textMuted: 'text-neutral-500', accentText: 'text-fuchsia-400', progressBg: 'from-purple-600 to-fuchsia-500', balanceCard: 'bg-purple-600 text-white shadow-purple-600/20' },
  'forest-moss': { card: 'bg-emerald-950/20 border-emerald-500/30 text-stone-100 shadow-2xl', textMuted: 'text-stone-400', accentText: 'text-green-400', progressBg: 'from-emerald-700 to-green-500', balanceCard: 'bg-emerald-600 text-white shadow-emerald-600/20' },
  'default': { card: 'bg-white/[0.03] border-white/10 text-slate-100 shadow-2xl', textMuted: 'text-slate-400', accentText: 'text-[#BFEC25]', progressBg: 'from-[#BFEC25] to-[#A3CB1B]', balanceCard: 'bg-[#BFEC25] text-black shadow-[#BFEC25]/20' }
};

export default function DashboardPage() {
  const [lang, setLang] = useState('id'); 
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0, saldoAwal: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 0 });
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);
  const [catSummaryMasuk, setCatSummaryMasuk] = useState([]);
  const [catSummaryKeluar, setCatSummaryKeluar] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');
  
  // ➕ State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);

  // State Data Pengunjung
  const [visitorStats, setVisitorStats] = useState({ totalViews: 0, uniqueCount: 0 });

  const dict = DICTIONARY[lang] || DICTIONARY['id'];

  useEffect(() => { 
    loadDashboardData(); 
  }, [lang, selectedPeriodeId]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

      // 1. MEMUAT DAFTAR PERIODE HAUL
      let activePeriodeId = selectedPeriodeId;
      let currentSaldoAwal = 0;

      const { data: listPeriode } = await supabase
        .from('periode_haul')
        .select('*')
        .order('created_at', { ascending: false });

      if (listPeriode && listPeriode.length > 0) {
        setPeriodeList(listPeriode);
        if (!activePeriodeId) {
          activePeriodeId = listPeriode[0].id;
          setSelectedPeriodeId(activePeriodeId);
        }

        const selectedObj = listPeriode.find(p => p.id === activePeriodeId) || listPeriode[0];
        currentSaldoAwal = parseFloat(selectedObj.saldo_awal || 0);
      }

      // 2. MEMUAT SETTINGS
      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (settingsData && settingsData.length > 0) {
        setAnnouncement(settingsData[0].announcement || settingsData[0].banner_text || '');
        if (settingsData[0].logo_url) setLogoUrl(settingsData[0].logo_url);
        if (settingsData[0].theme) setCurrentThemeKey(settingsData[0].theme);
      }

      // 3. LOG PENGUNJUNG
      try {
        const { count: countViews } = await supabase
          .from('visitor_logs')
          .select('*', { count: 'exact', head: true });

        const { data: listIps } = await supabase
          .from('visitor_logs')
          .select('ip_address');

        const uniqueIpsCount = listIps ? new Set(listIps.map(v => v.ip_address)).size : 0;
        setVisitorStats({ totalViews: countViews || 0, uniqueCount: uniqueIpsCount });
      } catch (visErr) {
        console.error('Gagal memuat analitik log:', visErr);
      }

      // 4. BUDGET TARGET
      const { data: budgetsData } = await supabase.from('budgets').select('planned_amount');
      let totalPlafonDinamis = 0;
      if (budgetsData) {
        budgetsData.forEach(b => { totalPlafonDinamis += parseFloat(b.planned_amount) || 0; });
      }

      // 5. FETCH TRANSAKSI & DONASI (DENGAN FILTER PERIODE_ID)
      let donQuery = supabase.from('donation_details').select('*');
      let txQuery = supabase.from('transactions').select('*');

      if (activePeriodeId) {
        donQuery = donQuery.eq('periode_id', activePeriodeId);
        txQuery = txQuery.eq('periode_id', activePeriodeId);
      }

      const { data: donationsDb } = await donQuery;
      const { data: transactionsDb } = await txQuery;
        
      let calcMasuk = 0; 
      let calcKeluar = 0;
      const incomeMap = {}; 
      const expenseMap = {};
      
      const listPemasukanGrup = {};
      const listPengeluaranGrup = [];

      if (donationsDb) {
        donationsDb.forEach((item) => {
          const rawAmount = parseFloat(item.amount) || 0;
          const catName = (item.category || 'Lain-lain').toString().trim();
          const tgl = item.transaction_date || '';
          
          if (!tgl) return;

          const donorNameClean = (item.donor_name || '').toString().trim();
          const isAdminFee = donorNameClean === '__ADMIN_FEE__';
          const isSaldoMengendap = donorNameClean === '__SALDO_MENGENDAP__';

          if (isAdminFee) {
            const nominalMinus = -Math.abs(rawAmount);
            calcMasuk += nominalMinus;
            incomeMap[catName] = (incomeMap[catName] || 0) + nominalMinus;
            
            const keyFee = `${tgl}_FEE_SYSTEM_${item.id}`;
            listPemasukanGrup[keyFee] = {
              note: `${dict.systemFee} ${tgl?.substring(0, 7)}`,
              transaction_date: tgl,
              amount: nominalMinus
            };
          } else if (isSaldoMengendap) {
            const nominalPositif = Math.abs(rawAmount);
            calcMasuk += nominalPositif;
            incomeMap[catName] = (incomeMap[catName] || 0) + nominalPositif;
            
            const keySaldo = `${tgl}_SALDO_SYSTEM_${item.id}`;
            listPemasukanGrup[keySaldo] = {
              note: `${dict.settledBalance} ${tgl?.substring(0, 7)}`,
              transaction_date: tgl,
              amount: nominalPositif
            };
          } else {
            const nominalPositif = Math.abs(rawAmount);
            calcMasuk += nominalPositif;
            incomeMap[catName] = (incomeMap[catName] || 0) + nominalPositif;

            const grupKey = `${tgl}_${catName.toLowerCase().replace(/\s+/g, '_')}_Donatur`;
            
            if (!listPemasukanGrup[grupKey]) {
              listPemasukanGrup[grupKey] = {
                note: '',
                transaction_date: tgl,
                amount: 0,
                count: 0,
                cat: catName
              };
            }
            listPemasukanGrup[grupKey].amount += nominalPositif;
            listPemasukanGrup[grupKey].count += 1;
            listPemasukanGrup[grupKey].note = `${dict.combinedDonor} ${listPemasukanGrup[grupKey].count} ${dict.donorUpper} ${catName.toUpperCase()}`;
          }
        });
      }

      if (transactionsDb) {
        transactionsDb.forEach((item) => {
          const nominal = Math.abs(parseFloat(item.amount || item.nominal) || 0);
          const rawType = (item.type || item.jenis || '').toString().toLowerCase().trim();
          const catName = (item.category || item.kategori || 'Lain-lain').toString().trim();
          const tgl = item.transaction_date || '';
          const noteText = (item.note || '').toString().toUpperCase();

          if (!tgl) return;

          if (
            noteText.includes('APLIKASI PEMASUKAN') || 
            noteText.includes('DETAIL') || 
            catName.toUpperCase().includes('DETAIL')
          ) {
            return; 
          }

          if (rawType === 'keluar' || rawType === 'pengeluaran') {
            calcKeluar += nominal;
            expenseMap[catName] = (expenseMap[catName] || 0) + nominal;
            listPengeluaranGrup.push({
              note: item.note || dict.operasionalExpense,
              transaction_date: tgl,
              amount: nominal
            });
          } else {
            if (!item.note || item.note.trim() === '') return;

            calcMasuk += nominal;
            incomeMap[catName] = (incomeMap[catName] || 0) + nominal;
            
            const keyManual = `MANUAL_${item.id}`;
            listPemasukanGrup[keyManual] = {
              note: item.note,
              transaction_date: tgl,
              amount: nominal
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

      // Sisa Kas Bersih = Saldo Awal Periode + Total Masuk - Total Keluar
      const totalSaldoNet = currentSaldoAwal + calcMasuk - calcKeluar;
      setTotals({ 
        total: totalSaldoNet, 
        masuk: calcMasuk, 
        keluar: calcKeluar, 
        saldoAwal: currentSaldoAwal 
      });
      
      setRincianMasuk(arrayMasukFinal.slice(0, 15)); 
      setRincianKeluar(arrayKeluarFinal.slice(0, 15));

      let hitungPersen = 0;
      if (totalPlafonDinamis > 0) {
        hitungPersen = parseFloat((((calcMasuk + currentSaldoAwal) / totalPlafonDinamis) * 100).toFixed(1));
      }
      setProgress({ percent: hitungPersen, current: calcMasuk + currentSaldoAwal, target: totalPlafonDinamis });

    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }

  const formatRupiah = (angka) => {
    const absValue = Math.abs(angka);
    const formatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(absValue);
    return angka < 0 ? `-${formatted}` : formatted;
  };
  
  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        {dict.loading}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-4 sm:px-6 pb-12 -mt-1 text-white">
      
      {/* 🌐 SELEKTOR PERIODE & BAHASA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 print:hidden">
        
        {/* Dropdown Filter Periode */}
        {periodeList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
              {dict.selectPeriod}
            </span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs text-amber-400 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono font-bold cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_periode} {p.is_closed ? dict.statusClosed : dict.statusActive}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dropdown Bahasa */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Select Language:</span>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono font-bold cursor-pointer transition-all"
          >
            <option value="id">🇮🇩 Indonesia</option>
            <option value="jv">🎯 Cirebonan</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </div>
      
      {/* 📢 ANNOUNCEMENT BANNER */}
      {announcement && (
        <div className="w-full bg-black/30 backdrop-blur-md border border-white/10 py-2.5 px-4 rounded-2xl overflow-hidden flex items-center shadow-[0_0_20px_rgba(191,236,37,0.1)] print:hidden">
          <div className="animate-marquee inline-block text-[#BFEC25] font-bold text-[10px] sm:text-xs tracking-widest uppercase font-mono">
            📢 {announcement}
          </div>
        </div>
      )}

      {/* STRUKTUR UTAMA DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* KAS BERSIH (CARD SALDO NEON GLOW) */}
        <div className={`${style.balanceCard} p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-between h-52 shadow-[0_0_30px_rgba(191,236,37,0.25)] border border-white/30 backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01]`}>
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
            <span className="font-mono text-[10px] font-black uppercase tracking-widest opacity-70">{dict.mainCash}</span>
            <p className="text-[11px] font-semibold opacity-80 mt-0.5">{dict.netBalance}</p>
          </div>
          <div className="relative z-10 mt-3">
            <h2 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-black tracking-tight leading-none drop-shadow-md">
              {formatRupiah(totals.total)}
            </h2>
            <div className="flex justify-between items-center mt-5 font-mono text-[10px] tracking-wider opacity-70">
              <span>{dict.initialBalance}: {formatRupiah(totals.saldoAwal)}</span>
              <span className="font-bold uppercase tracking-wide">{dict.committee}</span>
            </div>
          </div>
        </div>

        {/* REKAP CARD UANG MASUK & BELANJA (GLASS & GLOW) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* UANG MASUK (HIJAU NEON GLOW) */}
          <div 
            style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
            className="p-5 border rounded-[28px] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.12)] hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">🟢</div>
              <p className={`text-[10px] font-mono text-emerald-300 uppercase tracking-wider`}>{dict.totalIncome}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl font-['Space_Grotesk'] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{formatRupiah(totals.masuk)}</h3>
              <p className="text-[10px] text-emerald-400 font-medium mt-1">✓ {catSummaryMasuk.length} {dict.categories}</p>
            </div>
          </div>

          {/* UANG BELANJA (MERAH ROSY GLOW) */}
          <div 
            style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
            className="p-5 border rounded-[28px] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-[0_0_25px_rgba(244,63,94,0.12)] hover:shadow-[0_0_35px_rgba(244,63,94,0.25)]"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(244,63,94,0.3)]">🔴</div>
              <p className={`text-[10px] font-mono text-rose-300 uppercase tracking-wider`}>{dict.totalExpense}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl font-['Space_Grotesk'] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{formatRupiah(totals.keluar)}</h3>
              <p className="text-[10px] text-rose-400 font-medium mt-1">⚡ {catSummaryKeluar.length} {dict.allocation}</p>
            </div>
          </div>
        </div>

      </div>

      {/* CARD LOG TRAFIK PENGUNJUNG APLIKASI (GLASS GLOW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 print:hidden">
        <div 
          style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
          className="p-4 border rounded-2xl backdrop-blur-xl flex items-center gap-4 transition-all shadow-[0_0_20px_rgba(59,130,246,0.12)]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-base shadow-[0_0_15px_rgba(59,130,246,0.3)]">📈</div>
          <div>
            <p className={`text-[10px] font-mono text-blue-300 uppercase tracking-wider`}>{dict.totalKunjungan}</p>
            <h4 className="text-xl font-black font-['Space_Grotesk'] mt-0.5">{visitorStats.totalViews} <span className="text-xs font-normal text-slate-400 font-sans">Kali</span></h4>
          </div>
        </div>

        <div 
          style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
          className="p-4 border rounded-2xl backdrop-blur-xl flex items-center gap-4 transition-all shadow-[0_0_20px_rgba(168,85,247,0.12)]"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-base shadow-[0_0_15px_rgba(168,85,247,0.3)]">👥</div>
          <div>
            <p className={`text-[10px] font-mono text-purple-300 uppercase tracking-wider`}>{dict.pengunjungUnik}</p>
            <h4 className="text-xl font-black font-['Space_Grotesk'] mt-0.5">{visitorStats.uniqueCount} <span className="text-xs font-normal text-slate-400 font-sans">Orang</span></h4>
          </div>
        </div>
      </div>

      {/* TARGET PLAFON PROGRESS (GLASS GLOW) */}
      <div 
        style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
        className="p-5 border rounded-[28px] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.5)] space-y-3"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> {dict.progressTitle}
          </h3>
          <span className={`${style.accentText} font-mono text-xs font-black bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 shadow-[0_0_10px_rgba(191,236,37,0.2)]`}>{progress.percent}%</span>
        </div>
        <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
          <div className={`h-full bg-gradient-to-r ${style.progressBg} rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(191,236,37,0.5)]`} style={{ width: `${Math.min(progress.percent, 100)}%` }}></div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-0.5">
          <span>{dict.collected}: <strong className="text-slate-200">{formatRupiah(progress.current)}</strong></span>
          <span>{dict.target}: <strong className="text-slate-200">{formatRupiah(progress.target)}</strong></span>
        </div>
      </div>

      {/* REKAP KATEGORI (GLASS GLOW) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div 
          style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
          className="p-5 border rounded-[28px] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.5)] space-y-3.5"
        >
          <h4 className={`text-[10px] font-black ${style.accentText} uppercase tracking-widest border-b border-white/10 pb-2`}>{dict.rekapIncome}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryMasuk.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                <span className="text-zinc-100 flex items-center gap-1">🔹 {c.label}</span>
                <span className={`font-mono font-bold ${c.value < 0 ? 'text-red-400' : style.accentText}`}>{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div 
          style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
          className="p-5 border rounded-[28px] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.5)] space-y-3.5"
        >
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-white/10 pb-2">{dict.rekapExpense}</h4>
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

      {/* MUTASI MUTASI TERAKHIR (GLASS GLOW) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div 
          style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
          className="p-5 border border-l-4 border-l-emerald-400 rounded-[28px] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.08)] space-y-3.5"
        >
          <h5 className={`text-[10px] font-black ${style.accentText} uppercase tracking-wider`}>{dict.lastIncome}</h5>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {rincianMasuk.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-1">{dict.emptyMutationIn}</p>
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

        <div 
          style={{ backgroundColor: 'var(--bg-card-custom)', borderColor: 'var(--border-custom)' }} 
          className="p-5 border border-l-4 border-l-rose-400 rounded-[28px] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-[0_0_25px_rgba(244,63,94,0.08)] space-y-3.5"
        >
          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">{dict.lastExpense}</h5>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {rincianKeluar.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-1">{dict.emptyMutationOut}</p>
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
