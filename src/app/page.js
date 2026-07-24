'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🌐 KAMUS 3 BAHASA (ID / JV / EN)
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
    selectPeriod: 'SELECT HAUL PERIOD:',
    initialBalance: 'Opening Cash Balance',
    statusClosed: '(Closed)',
    statusActive: '(Active)'
  }
};

// 🎨 KOLEKSI TEMA LIQUID GLASS DINAMIS
const THEME_STYLES = {
  'default': { 
    liquidCard: 'bg-white/40 backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.05),_inset_0_1px_2px_rgba(255,255,255,0.9),_inset_0_-2px_4px_rgba(0,0,0,0.05)] text-slate-800', 
    innerBg: 'bg-white/60 backdrop-blur-md border border-white/60 shadow-inner', 
    textMuted: 'text-slate-500', 
    accentText: 'text-indigo-600',
    progressBg: 'from-indigo-500 to-cyan-400',
    balanceCard: 'bg-gradient-to-tr from-lime-400 via-emerald-300 to-teal-300 text-slate-950 shadow-xl shadow-emerald-400/20 border-2 border-white/80'
  },
  'cyberpunk-neon': { 
    liquidCard: 'bg-fuchsia-950/20 backdrop-blur-2xl border border-fuchsia-500/40 shadow-[0_10px_35px_rgba(217,70,239,0.15),_inset_0_1px_2px_rgba(255,255,255,0.4),_inset_0_0_15px_rgba(217,70,239,0.2)] text-cyan-100', 
    innerBg: 'bg-purple-950/40 backdrop-blur-md border border-fuchsia-500/30 shadow-inner', 
    textMuted: 'text-fuchsia-300/70', 
    accentText: 'text-cyan-300',
    progressBg: 'from-fuchsia-500 via-purple-500 to-cyan-400',
    balanceCard: 'bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-400 text-white shadow-xl shadow-fuchsia-500/30 border-2 border-white/40'
  },
  'emerald-cyber': { 
    liquidCard: 'bg-emerald-950/30 backdrop-blur-2xl border border-emerald-400/30 shadow-[0_10px_30px_rgba(16,185,129,0.12),_inset_0_1px_2px_rgba(255,255,255,0.3)] text-emerald-100', 
    innerBg: 'bg-emerald-900/30 backdrop-blur-md border border-emerald-500/20', 
    textMuted: 'text-emerald-300/70', 
    accentText: 'text-emerald-300',
    progressBg: 'from-emerald-400 to-teal-300',
    balanceCard: 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 text-slate-950 shadow-xl shadow-emerald-400/30 border-2 border-white/50'
  },
  'midnight-blue': { 
    liquidCard: 'bg-blue-950/30 backdrop-blur-2xl border border-blue-400/30 shadow-[0_10px_30px_rgba(59,130,246,0.15),_inset_0_1px_2px_rgba(255,255,255,0.3)] text-blue-100', 
    innerBg: 'bg-blue-900/30 backdrop-blur-md border border-blue-500/20', 
    textMuted: 'text-blue-300/70', 
    accentText: 'text-sky-300',
    progressBg: 'from-blue-500 to-cyan-300',
    balanceCard: 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 text-white shadow-xl shadow-blue-500/30 border-2 border-white/40'
  }
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
  const [currentThemeKey, setCurrentThemeKey] = useState('default');
  
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  const [visitorStats, setVisitorStats] = useState({ totalViews: 0, uniqueCount: 0 });

  const dict = DICTIONARY[lang] || DICTIONARY['id'];

  useEffect(() => { 
    recordVisitorLog();
    loadDashboardData(); 
  }, [lang, selectedPeriodeId]);

  async function recordVisitorLog() {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      let ipAddress = '127.0.0.1';
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const ipData = await res.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.log('Gagal ambil IP');
      }

      await supabase.from('visitor_logs').insert({
        path: window.location.pathname || '/',
        ip_address: ipAddress,
        user_agent: window.navigator.userAgent || 'unknown'
      });
    } catch (err) {
      console.error('Error log:', err);
    }
  }

  async function loadDashboardData() {
    try {
      setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

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

      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (settingsData && settingsData.length > 0) {
        setAnnouncement(settingsData[0].announcement || settingsData[0].banner_text || '');
        if (settingsData[0].theme) setCurrentThemeKey(settingsData[0].theme);
      }

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

      const { data: budgetsData } = await supabase.from('budgets').select('planned_amount');
      let totalPlafonDinamis = 0;
      if (budgetsData) {
        budgetsData.forEach(b => { totalPlafonDinamis += parseFloat(b.planned_amount) || 0; });
      }

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
      <div className="p-12 text-center opacity-80 text-xs font-mono animate-pulse">
        {dict.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-12 -mt-1 text-xs transition-all duration-500">
      
      {/* 🌐 SELEKTOR PERIODE & BAHASA DENGAN GLASS DOKUMEN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
        
        {/* Dropdown Filter Periode */}
        {periodeList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider opacity-80 uppercase font-bold">
              {dict.selectPeriod}
            </span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-black/20 backdrop-blur-md border border-white/20 text-xs rounded-xl px-3 py-1.5 focus:outline-none font-mono font-bold cursor-pointer transition-all"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.nama_periode} {p.is_closed ? dict.statusClosed : dict.statusActive}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dropdown Bahasa */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] font-mono tracking-wider opacity-70 uppercase">Select Language:</span>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-black/20 backdrop-blur-md border border-white/20 text-xs rounded-xl px-3 py-1.5 focus:outline-none font-mono font-bold cursor-pointer transition-all"
          >
            <option value="id" className="bg-slate-900 text-white">🇮🇩 Indonesia</option>
            <option value="jv" className="bg-slate-900 text-white">🎯 Cirebonan</option>
            <option value="en" className="bg-slate-900 text-white">🇬🇧 English</option>
          </select>
        </div>
      </div>
      
      {/* 📢 ANNOUNCEMENT BANNER */}
      {announcement && (
        <div className={`w-full ${style.liquidCard} py-2.5 px-4 rounded-2xl overflow-hidden flex items-center print:hidden`}>
          <div className="animate-marquee inline-block font-bold text-[10px] sm:text-xs tracking-widest uppercase font-mono">
            📢 {announcement}
          </div>
        </div>
      )}

      {/* STRUKTUR UTAMA DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* KAS UTAMA HAUL (LIQUID GLASS 3D) */}
        <div className={`${style.balanceCard} p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-between h-52 transition-transform duration-300 hover:scale-[1.01]`}>
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
            <span className="font-mono text-[10px] font-black uppercase tracking-widest opacity-80">{dict.mainCash}</span>
            <p className="text-[11px] font-semibold opacity-90 mt-0.5">{dict.netBalance}</p>
          </div>
          <div className="relative z-10 mt-3">
            <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none drop-shadow-md">
              {formatRupiah(totals.total)}
            </h2>
            <div className="flex justify-between items-center mt-5 font-mono text-[10px] tracking-wider opacity-85">
              <span>{dict.initialBalance}: {formatRupiah(totals.saldoAwal)}</span>
              <span className="font-bold uppercase tracking-wide">{dict.committee}</span>
            </div>
          </div>
        </div>

        {/* REKAP CARD UANG MASUK & BELANJA */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* UANG MASUK */}
          <div className={`p-5 ${style.liquidCard} rounded-[28px] flex flex-col justify-between transition-all duration-300 shadow-xl border-l-4 border-l-emerald-400`}>
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm shadow-md">🟢</div>
              <p className="text-[10px] font-mono opacity-90 uppercase tracking-wider">{dict.totalIncome}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight sm:text-3xl font-mono text-emerald-400">{formatRupiah(totals.masuk)}</h3>
              <p className={`text-[10px] ${style.textMuted} font-medium mt-1`}>✓ {catSummaryMasuk.length} {dict.categories}</p>
            </div>
          </div>

          {/* UANG BELANJA */}
          <div className={`p-5 ${style.liquidCard} rounded-[28px] flex flex-col justify-between transition-all duration-300 shadow-xl border-l-4 border-l-rose-400`}>
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-sm shadow-md">🔴</div>
              <p className="text-[10px] font-mono opacity-90 uppercase tracking-wider">{dict.totalExpense}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight sm:text-3xl font-mono text-rose-400">{formatRupiah(totals.keluar)}</h3>
              <p className={`text-[10px] ${style.textMuted} font-medium mt-1`}>⚡ {catSummaryKeluar.length} {dict.allocation}</p>
            </div>
          </div>

        </div>

      </div>

      {/* CARD LOG TRAFIK PENGUNJUNG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 print:hidden">
        <div className={`p-4 ${style.liquidCard} rounded-2xl flex items-center gap-4 transition-all shadow-md`}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-base shadow-sm">📈</div>
          <div>
            <p className={`text-[10px] font-mono ${style.textMuted} uppercase tracking-wider`}>{dict.totalKunjungan}</p>
            <h4 className="text-xl font-black font-mono mt-0.5">{visitorStats.totalViews} <span className="text-xs font-normal opacity-70">Kali</span></h4>
          </div>
        </div>

        <div className={`p-4 ${style.liquidCard} rounded-2xl flex items-center gap-4 transition-all shadow-md`}>
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-base shadow-sm">👥</div>
          <div>
            <p className={`text-[10px] font-mono ${style.textMuted} uppercase tracking-wider`}>{dict.pengunjungUnik}</p>
            <h4 className="text-xl font-black font-mono mt-0.5">{visitorStats.uniqueCount} <span className="text-xs font-normal opacity-70">Orang</span></h4>
          </div>
        </div>
      </div>

      {/* TARGET PLAFON PROGRESS */}
      <div className={`p-5 ${style.liquidCard} rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3`}>
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> {dict.progressTitle}
          </h3>
          <span className={`${style.accentText} font-mono text-xs font-black bg-white/10 px-2.5 py-1 rounded-md border border-white/20`}>{progress.percent}%</span>
        </div>
        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
          <div className={`h-full bg-gradient-to-r ${style.progressBg} rounded-full transition-all duration-500`} style={{ width: `${Math.min(progress.percent, 100)}%` }}></div>
        </div>
        <div className={`flex justify-between items-center text-[10px] font-mono ${style.textMuted} pt-0.5`}>
          <span>{dict.collected}: <strong>{formatRupiah(progress.current)}</strong></span>
          <span>{dict.target}: <strong>{formatRupiah(progress.target)}</strong></span>
        </div>
      </div>

      {/* REKAP KATEGORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-5 ${style.liquidCard} rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3.5`}>
          <h4 className={`text-[10px] font-black ${style.accentText} uppercase tracking-widest border-b border-white/15 pb-2`}>{dict.rekapIncome}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryMasuk.map((c, i) => (
              <div key={i} className={`p-2.5 ${style.innerBg} rounded-xl flex justify-between items-center text-xs`}>
                <span className="flex items-center gap-1 font-medium">🔹 {c.label}</span>
                <span className={`font-mono font-bold ${c.value < 0 ? 'text-rose-400' : style.accentText}`}>{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-5 ${style.liquidCard} rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3.5`}>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-white/15 pb-2">{dict.rekapExpense}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryKeluar.map((c, i) => (
              <div key={i} className={`p-2.5 ${style.innerBg} rounded-xl flex justify-between items-center text-xs`}>
                <span className="flex items-center gap-1 font-medium">🔸 {c.label}</span>
                <span className="font-mono font-bold text-rose-400">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MUTASI TERAKHIR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-5 ${style.liquidCard} border-l-4 border-l-emerald-400 rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3.5`}>
          <h5 className={`text-[10px] font-black ${style.accentText} uppercase tracking-wider`}>{dict.lastIncome}</h5>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {rincianMasuk.length === 0 ? (
              <p className={`text-xs ${style.textMuted} font-mono py-1`}>{dict.emptyMutationIn}</p>
            ) : (
              rincianMasuk.map((t, i) => (
                <div key={i} className={`p-2.5 ${style.innerBg} rounded-xl flex justify-between items-center text-xs`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate uppercase tracking-wide">{t.note}</p>
                    <p className={`text-[9px] ${style.textMuted} font-mono mt-0.5`}>{t.transaction_date}</p>
                  </div>
                  <p className={`font-mono font-black shrink-0 ml-3 text-sm ${t.amount < 0 ? 'text-rose-400' : style.accentText}`}>
                    {t.amount < 0 ? formatRupiah(t.amount) : `+${formatRupiah(t.amount)}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`p-5 ${style.liquidCard} border-l-4 border-l-rose-400 rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3.5`}>
          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">{dict.lastExpense}</h5>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {rincianKeluar.length === 0 ? (
              <p className={`text-xs ${style.textMuted} font-mono py-1`}>{dict.emptyMutationOut}</p>
            ) : (
              rincianKeluar.map((t, i) => (
                <div key={i} className={`p-2.5 ${style.innerBg} rounded-xl flex justify-between items-center text-xs`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate uppercase tracking-wide">{t.note}</p>
                    <p className={`text-[9px] ${style.textMuted} font-mono mt-0.5`}>{t.transaction_date}</p>
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
