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

  if (loading) {
    return (
      <div className="p-12 text-center theme-text-accent text-xs font-mono animate-pulse">
        {dict.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-12 -mt-1 text-xs transition-all duration-500">
      
      {/* 🌐 SELEKTOR PERIODE & BAHASA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
        
        {periodeList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase font-bold">
              {dict.selectPeriod}
            </span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 theme-text-accent text-xs rounded-xl px-3 py-1.5 focus:outline-none font-mono font-bold cursor-pointer transition-all shadow-md"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.nama_periode} {p.is_closed ? dict.statusClosed : dict.statusActive}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Select Language:</span>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-slate-800 border border-slate-700 theme-text-accent text-xs rounded-xl px-3 py-1.5 focus:outline-none font-mono font-bold cursor-pointer transition-all shadow-md"
          >
            <option value="id" className="bg-slate-900 text-white">🇮🇩 Indonesia</option>
            <option value="jv" className="bg-slate-900 text-white">🎯 Cirebonan</option>
            <option value="en" className="bg-slate-900 text-white">🇬🇧 English</option>
          </select>
        </div>
      </div>
      
      {/* 📢 ANNOUNCEMENT BANNER */}
      {announcement && (
        <div className="w-full theme-card py-2.5 px-4 rounded-2xl overflow-hidden flex items-center shadow-lg print:hidden">
          <div className="animate-marquee inline-block font-bold text-[10px] sm:text-xs tracking-widest uppercase font-mono text-amber-300">
            📢 {announcement}
          </div>
        </div>
      )}

      {/* 💳 3 KARTU KAS UTAMA MODERN DENGAN GRADASI & ORNAMEN SVG ABSTRACT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* CARD 1: KAS UTAMA */}
        <div className="p-6 bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-300 text-slate-950 shadow-xl shadow-emerald-500/20 border-2 border-white/80 rounded-[32px] relative overflow-hidden flex flex-col justify-between h-52 transition-transform duration-300 hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-48 h-48 opacity-25 pointer-events-none select-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-slate-950">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.3" />
              <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="10" opacity="0.5" />
              <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="14" opacity="0.8" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-900/80">{dict.mainCash}</span>
            <p className="text-[11px] font-bold text-slate-900 mt-0.5">{dict.netBalance}</p>
          </div>
          <div className="relative z-10 mt-3">
            <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none text-slate-950 drop-shadow-xs">
              {formatRupiah(totals.total)}
            </h2>
            <div className="flex justify-between items-center mt-5 font-mono text-[10px] tracking-wider text-slate-900/90 font-bold">
              <span>{dict.initialBalance}: {formatRupiah(totals.saldoAwal)}</span>
              <span className="font-extrabold uppercase">{dict.committee}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL UANG MASUK */}
        <div className="p-6 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-emerald-100 rounded-[32px] shadow-xl border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between h-52 transition-transform duration-300 hover:scale-[1.01]">
          <div className="absolute inset-0 opacity-15 pointer-events-none select-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-400">{dict.totalIncome}</span>
              <p className="text-[10px] text-emerald-200/80 font-medium mt-0.5">Akumulasi Donasi & Kas</p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm shadow-md">
              🟢
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black font-mono tracking-tight text-emerald-300">{formatRupiah(totals.masuk)}</h3>
            <p className="text-[10px] text-emerald-200/80 font-mono mt-2 font-semibold">✓ {catSummaryMasuk.length} {dict.categories}</p>
          </div>
        </div>

        {/* CARD 3: TOTAL UANG BELANJA */}
        <div className="p-6 bg-gradient-to-br from-rose-950 via-purple-950 to-slate-900 text-rose-100 rounded-[32px] shadow-xl border border-rose-500/40 relative overflow-hidden flex flex-col justify-between h-52 transition-transform duration-300 hover:scale-[1.01]">
          <div className="absolute -bottom-10 -right-10 w-44 h-44 opacity-20 pointer-events-none select-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-rose-400">
              <path fill="currentColor" d="M42.7,-62.9C54.2,-54.1,61.6,-40.4,66.8,-26.1C72,-11.8,75,3.1,72.2,17.4C69.4,31.7,60.8,45.4,48.9,54.8C37,64.2,21.8,69.3,5.8,68.5C-10.2,67.7,-27,61.1,-40.8,51.3C-54.6,41.5,-65.4,28.5,-70.2,13C-75,-2.5,-73.8,-20.5,-65.9,-34.8C-58,-49.1,-43.4,-59.7,-28.9,-66.6C-14.4,-73.5,-0.1,-76.7,13.6,-73.3C27.3,-69.9,31.2,-71.7,42.7,-62.9Z" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-rose-400">{dict.totalExpense}</span>
              <p className="text-[10px] text-rose-200/80 font-medium mt-0.5">Realisasi Pengeluaran</p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-sm shadow-md">
              🔴
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl font-black font-mono tracking-tight text-rose-300">{formatRupiah(totals.keluar)}</h3>
            <p className="text-[10px] text-rose-200/80 font-mono mt-2 font-semibold">⚡ {catSummaryKeluar.length} {dict.allocation}</p>
          </div>
        </div>

      </div>

      {/* LOG TRAFIK PENGUNJUNG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 print:hidden">
        <div className="p-4 theme-card rounded-2xl flex items-center gap-4 transition-all shadow-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-base shadow-sm">📈</div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{dict.totalKunjungan}</p>
            <h4 className="text-xl font-black font-mono mt-0.5">{visitorStats.totalViews} <span className="text-xs font-normal opacity-70">Kali</span></h4>
          </div>
        </div>

        <div className="p-4 theme-card rounded-2xl flex items-center gap-4 transition-all shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-base shadow-sm">👥</div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{dict.pengunjungUnik}</p>
            <h4 className="text-xl font-black font-mono mt-0.5">{visitorStats.uniqueCount} <span className="text-xs font-normal opacity-70">Orang</span></h4>
          </div>
        </div>
      </div>

      {/* TARGET PLAFON PROGRESS */}
      <div className="p-5 theme-card rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3 shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> {dict.progressTitle}
          </h3>
          <span className="theme-text-accent font-mono text-xs font-black bg-white/10 px-2.5 py-1 rounded-md border border-white/20">{progress.percent}%</span>
        </div>
        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
          <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress.percent, 100)}%` }}></div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-0.5">
          <span>{dict.collected}: <strong>{formatRupiah(progress.current)}</strong></span>
          <span>{dict.target}: <strong>{formatRupiah(progress.target)}</strong></span>
        </div>
      </div>

      {/* REKAP KATEGORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 theme-card rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3.5 shadow-lg">
          <h4 className="text-[10px] font-black theme-text-accent uppercase tracking-widest border-b border-white/15 pb-2">{dict.rekapIncome}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryMasuk.map((c, i) => (
              <div key={i} className="p-2.5 bg-black/20 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 font-medium">🔹 {c.label}</span>
                <span className={`font-mono font-bold ${c.value < 0 ? 'text-rose-400' : 'theme-text-accent'}`}>{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 theme-card rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3.5 shadow-lg">
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-white/15 pb-2">{dict.rekapExpense}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryKeluar.map((c, i) => (
              <div key={i} className="p-2.5 bg-black/20 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 font-medium">🔸 {c.label}</span>
                <span className="font-mono font-bold text-rose-400">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MUTASI TERAKHIR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 theme-card border-l-4 border-l-emerald-400 rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3.5 shadow-lg">
          <h5 className="text-[10px] font-black theme-text-accent uppercase tracking-wider">{dict.lastIncome}</h5>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {rincianMasuk.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono py-1">{dict.emptyMutationIn}</p>
            ) : (
              rincianMasuk.map((t, i) => (
                <div key={i} className="p-2.5 bg-black/20 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate uppercase tracking-wide">{t.note}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <p className={`font-mono font-black shrink-0 ml-3 text-sm ${t.amount < 0 ? 'text-rose-400' : 'theme-text-accent'}`}>
                    {t.amount < 0 ? formatRupiah(t.amount) : `+${formatRupiah(t.amount)}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-5 theme-card border-l-4 border-l-rose-400 rounded-[28px] flex flex-col justify-between transition-all duration-300 space-y-3.5 shadow-lg">
          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">{dict.lastExpense}</h5>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {rincianKeluar.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono py-1">{dict.emptyMutationOut}</p>
            ) : (
              rincianKeluar.map((t, i) => (
                <div key={i} className="p-2.5 bg-black/20 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate uppercase tracking-wide">{t.note}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{t.transaction_date}</p>
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
