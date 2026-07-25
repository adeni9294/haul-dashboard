'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from "@/components/GlassCard";

// Inisialisasi Supabase Client Tunggal di Luar Render Loop
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

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
    selectLanguage: 'SELECT LANGUAGE:',
    initialBalance: 'Saldo Awal Kas',
    statusClosed: '(Selesai/Tutup Buku)',
    statusActive: '(Berjalan)',
    errorLoading: 'Gagal memuat data. Silakan coba lagi.',
    errorLoadingData: 'Error memuat data dashboard'
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
    selectLanguage: 'SELECT LANGUAGE:',
    initialBalance: 'Bondo Awal Kas',
    statusClosed: '(Rampung/Tutup Buku)',
    statusActive: '(Mlaku)',
    errorLoading: 'Gagal memuat data. Coba maneh.',
    errorLoadingData: 'Error memuat data dashboard'
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
    selectLanguage: 'SELECT LANGUAGE:',
    initialBalance: 'Opening Cash Balance',
    statusClosed: '(Closed)',
    statusActive: '(Active)',
    errorLoading: 'Failed to load data. Please try again.',
    errorLoadingData: 'Error loading dashboard data'
  }
};

export default function DashboardPage() {
  const [lang, setLang] = useState('id'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  
  // Track if visitor log has been recorded this session
  const visitorLogRecordedRef = useRef(false);

  const dict = DICTIONARY[lang] || DICTIONARY['id'];

  // Record visitor log only once per session
  useEffect(() => {
    if (!visitorLogRecordedRef.current && supabase) {
      visitorLogRecordedRef.current = true;
      recordVisitorLog();
    }
  }, []);

  // Load dashboard data when periode changes or page first loads
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriodeId]);

  async function recordVisitorLog() {
    if (!supabase) return;
    try {
      let ipAddress = '127.0.0.1';
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const ipData = await res.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.log('IP fetch failed, using default');
      }

      await supabase.from('visitor_logs').insert({
        path: typeof window !== 'undefined' ? window.location.pathname || '/' : '/',
        ip_address: ipAddress,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent || 'unknown' : 'unknown'
      });
    } catch (err) {
      console.error('Visitor log error:', err);
    }
  }

  async function loadDashboardData() {
    if (!supabase) return;
    
    try {
      setLoading(true);
      setError(null);

      let activePeriodeId = selectedPeriodeId;
      let currentSaldoAwal = 0;

      // Fetch periode list
      const { data: listPeriode, error: periodeError } = await supabase
        .from('periode_haul')
        .select('id, nama_periode, saldo_awal, is_closed, created_at')
        .order('created_at', { ascending: false });

      if (periodeError) throw periodeError;

      if (listPeriode && listPeriode.length > 0) {
        setPeriodeList(listPeriode);
        if (!activePeriodeId) {
          activePeriodeId = listPeriode[0].id;
          setSelectedPeriodeId(activePeriodeId);
        }

        const selectedObj = listPeriode.find(p => p.id === activePeriodeId) || listPeriode[0];
        currentSaldoAwal = parseFloat(selectedObj.saldo_awal || 0);
      }

      // Fetch announcement/settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('announcement, banner_text')
        .eq('id', 'main_config')
        .single();

      if (settingsData) {
        setAnnouncement(settingsData.announcement || settingsData.banner_text || '');
      }

      // Fetch visitor stats (with error handling)
      let visitorData = { totalViews: 0, uniqueCount: 0 };
      try {
        const { count: countViews, error: countError } = await supabase
          .from('visitor_logs')
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          const { data: listIps, error: ipsError } = await supabase
            .from('visitor_logs')
            .select('ip_address');

          const uniqueIpsCount = !ipsError && listIps ? new Set(listIps.map(v => v.ip_address)).size : 0;
          visitorData = { totalViews: countViews || 0, uniqueCount: uniqueIpsCount };
        }
      } catch (visErr) {
        console.error('Visitor stats error:', visErr);
      }
      setVisitorStats(visitorData);

      // Fetch budgets
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('planned_amount');

      let totalPlafonDinamis = 0;
      if (budgetsData) {
        budgetsData.forEach(b => {
          totalPlafonDinamis += parseFloat(b.planned_amount) || 0;
        });
      }

      // Build queries with periode filter
      let donQuery = supabase.from('donation_details').select('*');
      let txQuery = supabase.from('transactions').select('*');

      if (activePeriodeId) {
        donQuery = donQuery.eq('periode_id', activePeriodeId);
        txQuery = txQuery.eq('periode_id', activePeriodeId);
      }

      const { data: donationsDb, error: donError } = await donQuery;
      const { data: transactionsDb, error: txError } = await txQuery;

      if (donError) console.error('Donation fetch error:', donError);
      if (txError) console.error('Transaction fetch error:', txError);

      // Process donations and transactions
      let calcMasuk = 0;
      let calcKeluar = 0;
      const incomeMap = {};
      const expenseMap = {};

      const listPemasukanGrup = {};
      const listPengeluaranGrup = [];

      // Process donations
      if (donationsDb && Array.isArray(donationsDb)) {
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

      // Process transactions
      if (transactionsDb && Array.isArray(transactionsDb)) {
        transactionsDb.forEach((item) => {
          const nominal = Math.abs(parseFloat(item.amount || item.nominal) || 0);
          const rawType = (item.type || item.jenis || '').toString().toLowerCase().trim();
          const catName = (item.category || item.kategori || 'Lain-lain').toString().trim();
          const tgl = item.transaction_date || '';
          const noteText = (item.note || '').toString().toUpperCase();

          if (!tgl) return;

          // Skip invalid entries
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

      // Sort and finalize data
      const arrayMasukFinal = Object.values(listPemasukanGrup)
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
        .slice(0, 15);

      const arrayKeluarFinal = listPengeluaranGrup
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
        .slice(0, 15);

      // Parse chart data
      const parseChart = (map, total) =>
        Object.keys(map)
          .map(key => ({
            label: key,
            value: map[key],
            percentage: total > 0 ? parseFloat(((map[key] / total) * 100).toFixed(1)) : 0
          }))
          .sort((a, b) => b.value - a.value);

      const incomeSummary = parseChart(incomeMap, calcMasuk);
      const expenseSummary = parseChart(expenseMap, calcKeluar);

      // Calculate totals
      const totalSaldoNet = currentSaldoAwal + calcMasuk - calcKeluar;

      setTotals({
        total: totalSaldoNet,
        masuk: calcMasuk,
        keluar: calcKeluar,
        saldoAwal: currentSaldoAwal
      });

      setCatSummaryMasuk(incomeSummary);
      setCatSummaryKeluar(expenseSummary);
      setRincianMasuk(arrayMasukFinal);
      setRincianKeluar(arrayKeluarFinal);

      // Calculate progress
      let hitungPersen = 0;
      if (totalPlafonDinamis > 0) {
        hitungPersen = parseFloat((((calcMasuk + currentSaldoAwal) / totalPlafonDinamis) * 100).toFixed(1));
      }
      setProgress({
        percent: hitungPersen,
        current: calcMasuk + currentSaldoAwal,
        target: totalPlafonDinamis
      });

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(dict.errorLoadingData);
    } finally {
      setLoading(false);
    }
  }

  const formatRupiah = useCallback((angka) => {
    const absValue = Math.abs(angka);
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(absValue);
    return angka < 0 ? `-${formatted}` : formatted;
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto px-2 sm:px-4 pb-12">
        <div className="p-12 text-center text-cyan-400 text-xs font-mono animate-pulse">
          {dict.loading}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 glass-card animate-pulse opacity-60" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center space-y-4 max-w-5xl mx-auto">
        <div className="text-red-400 text-sm font-mono">{error}</div>
        <button
          onClick={() => loadDashboardData()}
          className="px-4 py-2 btn-theme-primary rounded-lg font-mono text-xs transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-2 sm:px-4 pb-12 text-xs transition-all duration-500 theme-text-primary">
      
      {/* 🌐 SELEKTOR PERIODE & BAHASA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print:hidden">
        {periodeList.length > 0 && (
          <GlassCard className="p-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider theme-text-secondary uppercase font-bold px-1">
              {dict.selectPeriod}
            </span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-black/30 theme-text-accent text-xs rounded-lg px-2.5 py-1 focus:outline-none font-mono font-bold cursor-pointer theme-border border"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.nama_periode} {p.is_closed ? dict.statusClosed : dict.statusActive}
                </option>
              ))}
            </select>
          </GlassCard>
        )}

        <GlassCard className="p-2.5 flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider theme-text-secondary uppercase font-bold px-1">
            {dict.selectLanguage}
          </span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-black/30 theme-text-primary text-xs rounded-lg px-2.5 py-1 focus:outline-none font-mono font-bold cursor-pointer theme-border border"
          >
            <option value="id" className="bg-slate-900 text-white">🇮🇩 Indonesia</option>
            <option value="jv" className="bg-slate-900 text-white">🎯 Cirebonan</option>
            <option value="en" className="bg-slate-900 text-white">🇬🇧 English</option>
          </select>
        </GlassCard>
      </div>

      {/* 📢 ANNOUNCEMENT BANNER */}
      {announcement && (
        <GlassCard className="w-full py-2.5 px-4 overflow-hidden flex items-center print:hidden">
          <div className="animate-marquee inline-block font-bold text-[10px] sm:text-xs tracking-widest uppercase font-mono theme-text-accent">
            📢 {announcement}
          </div>
        </GlassCard>
      )}

      {/* 💳 3 KARTU KAS UTAMA MODERN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* CARD 1: KAS UTAMA HAUL */}
        <div className="md:col-span-1 p-5 sm:p-6 theme-gradient-main text-slate-950 shadow-xl border border-white/20 rounded-3xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-25 pointer-events-none select-none">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight leading-none text-slate-950">
              {formatRupiah(totals.total)}
            </h2>
            <div className="flex justify-between items-center mt-5 font-mono text-[10px] tracking-wider text-slate-900/90 font-bold">
              <span>{dict.initialBalance}: {formatRupiah(totals.saldoAwal)}</span>
              <span className="font-extrabold uppercase">{dict.committee}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL UANG MASUK */}
        <GlassCard className="p-5 flex flex-col justify-between border-emerald-500/30">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-400">{dict.totalIncome}</span>
              <p className="text-[10px] theme-text-secondary font-medium mt-0.5">Akumulasi Donasi & Kas</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xs shadow-md">
              🟢
            </div>
          </div>

          <div className="relative z-10 mt-3">
            <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-300">{formatRupiah(totals.masuk)}</h3>
            <p className="text-[10px] theme-text-secondary font-mono mt-2 font-semibold">✓ {catSummaryMasuk.length} {dict.categories}</p>
          </div>
        </GlassCard>

        {/* CARD 3: TOTAL UANG BELANJA */}
        <GlassCard className="p-5 flex flex-col justify-between border-rose-500/30">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-rose-400">{dict.totalExpense}</span>
              <p className="text-[10px] theme-text-secondary font-medium mt-0.5">Realisasi Pengeluaran</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-xs shadow-md">
              🔴
            </div>
          </div>

          <div className="relative z-10 mt-3">
            <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-300">{formatRupiah(totals.keluar)}</h3>
            <p className="text-[10px] theme-text-secondary font-mono mt-2 font-semibold">⚡ {catSummaryKeluar.length} {dict.allocation}</p>
          </div>
        </GlassCard>

      </div>

      {/* LOG TRAFIK PENGUNJUNG & TARGET PLAFON PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">

        {/* LOG TRAFIK PENGUNJUNG */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:col-span-1">
          <GlassCard className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sm shrink-0">📈</div>
            <div className="min-w-0">
              <p className="text-[9px] font-mono theme-text-tertiary uppercase truncate">{dict.totalKunjungan}</p>
              <h4 className="text-base font-black font-mono leading-tight">{visitorStats.totalViews}</h4>
            </div>
          </GlassCard>

          <GlassCard className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-sm shrink-0">👥</div>
            <div className="min-w-0">
              <p className="text-[9px] font-mono theme-text-tertiary uppercase truncate">{dict.pengunjungUnik}</p>
              <h4 className="text-base font-black font-mono leading-tight">{visitorStats.uniqueCount}</h4>
            </div>
          </GlassCard>
        </div>

        {/* TARGET PLAFON PROGRESS */}
        <GlassCard className="md:col-span-2 p-4 flex flex-col justify-center space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 theme-text-primary">
              <span>🎯</span> {dict.progressTitle}
            </h3>
            <span className="theme-text-accent font-mono text-xs font-black bg-black/30 px-2 py-0.5 rounded theme-border border">{progress.percent}%</span>
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 theme-border border">
            <div
              className="h-full theme-gradient-main rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress.percent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono theme-text-secondary">
            <span>{dict.collected}: <strong className="theme-text-primary">{formatRupiah(progress.current)}</strong></span>
            <span>{dict.target}: <strong className="theme-text-primary">{formatRupiah(progress.target)}</strong></span>
          </div>
        </GlassCard>

      </div>

      {/* REKAP KATEGORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-4 space-y-3">
          <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b theme-border pb-2">{dict.rekapIncome}</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {catSummaryMasuk.map((c, i) => (
              <div key={i} className="p-2 bg-black/20 theme-border border rounded-xl flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 theme-text-secondary font-medium">🔹 {c.label}</span>
                <span className={`font-mono font-bold ${c.value < 0 ? 'text-rose-400' : 'theme-text-accent'}`}>{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-3">
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b theme-border pb-2">{dict.rekapExpense}</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {catSummaryKeluar.map((c, i) => (
              <div key={i} className="p-2 bg-black/20 theme-border border rounded-xl flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 theme-text-secondary font-medium">🔸 {c.label}</span>
                <span className="font-mono font-bold text-rose-400">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* MUTASI TERAKHIR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-4 border-l-4 border-l-emerald-400 space-y-3">
          <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">{dict.lastIncome}</h5>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {rincianMasuk.length === 0 ? (
              <p className="text-xs theme-text-tertiary font-mono py-1">{dict.emptyMutationIn}</p>
            ) : (
              rincianMasuk.map((t, i) => (
                <div key={i} className="p-2 bg-black/20 theme-border border rounded-xl flex justify-between items-center text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate uppercase theme-text-primary">{t.note}</p>
                    <p className="text-[9px] theme-text-tertiary font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <p className={`font-mono font-black shrink-0 ml-2 text-xs ${t.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {t.amount < 0 ? formatRupiah(t.amount) : `+${formatRupiah(t.amount)}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-rose-400 space-y-3">
          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">{dict.lastExpense}</h5>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {rincianKeluar.length === 0 ? (
              <p className="text-xs theme-text-tertiary font-mono py-1">{dict.emptyMutationOut}</p>
            ) : (
              rincianKeluar.map((t, i) => (
                <div key={i} className="p-2 bg-black/20 theme-border border rounded-xl flex justify-between items-center text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate uppercase theme-text-primary">{t.note}</p>
                    <p className="text-[9px] theme-text-tertiary font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <div className="font-mono font-black text-rose-400 shrink-0 ml-2 text-xs">-{formatRupiah(t.amount)}</div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
