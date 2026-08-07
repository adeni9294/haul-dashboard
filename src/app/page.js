'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from "@/components/GlassCard";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const DICTIONARY = {
  id: {
    loading: 'Memuat Antarmuka Cirebonan Premium...',
    mainCash: 'KAS UTAMA HAUL',
    netBalance: 'Sisa Saldo Kas Bersih',
    committee: 'PANITIA HAUL',
    totalIncome: 'TOTAL UANG MASUK',
    totalExpense: 'TOTAL UANG BELANJA',
    categories: 'Kategori Kontribusi',
    allocation: 'Pos Alokasi Terpakai',
    progressTitle: 'Progres Capaian Target Plafon Anggaran',
    collected: 'Terkumpul',
    target: 'Plafon Target',
    rekapIncome: 'Rekap Kategori Uang Masuk',
    rekapExpense: 'Rekap Alokasi Anggaran Belanja',
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
    loading: 'Nembe ngebuka antarmuka Cirebonan Premium...',
    mainCash: 'KAS UTAMA HAUL',
    netBalance: 'Sisa Saldo Kas Bersih',
    committee: 'PANITIA HAUL',
    totalIncome: 'TOTAL PRAGAT MLEBU',
    totalExpense: 'TOTAL PRAGAT BLONJO',
    categories: 'Werna Sumbangan',
    allocation: 'Pos Alokasi Sing Dinggo',
    progressTitle: 'Progres Capaian Target Plafon Anggaran',
    collected: 'Kekumpul',
    target: 'Plafon Target',
    rekapIncome: 'Rekap Kategori Pragat Mlebu',
    rekapExpense: 'Rekap Alokasi Anggaran Blonjo',
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
    loading: 'Loading Premium Interface...',
    mainCash: 'HAUL MAIN CASH',
    netBalance: 'Net Cash Balance Remaining',
    committee: 'HAUL COMMITTEE',
    totalIncome: 'TOTAL CASH INFLOW',
    totalExpense: 'TOTAL EXPENDITURES',
    categories: 'Contribution Categories',
    allocation: 'Used Allocation Posts',
    progressTitle: 'Budget Ceiling Target Achievement Progress',
    collected: 'Collected',
    target: 'Target Ceiling',
    rekapIncome: 'Cash Inflow Category Summary',
    rekapExpense: 'Budgetary Allocation Summary',
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
  
  const visitorLogRecordedRef = useRef(false);
  const dict = DICTIONARY[lang] || DICTIONARY['id'];

  useEffect(() => {
    if (!visitorLogRecordedRef.current && supabase) {
      visitorLogRecordedRef.current = true;
      recordVisitorLog();
    }
  }, []);

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

      const { data: settingsData } = await supabase
        .from('settings')
        .select('announcement, banner_text')
        .eq('id', 'main_config')
        .single();

      if (settingsData) {
        setAnnouncement(settingsData.announcement || settingsData.banner_text || '');
      }

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

      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('planned_amount');

      let totalPlafonDinamis = 0;
      if (budgetsData) {
        budgetsData.forEach(b => {
          totalPlafonDinamis += parseFloat(b.planned_amount) || 0;
        });
      }

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

      let calcMasuk = 0;
      let calcKeluar = 0;
      const incomeMap = {};
      const expenseMap = {};

      const listPemasukanGrup = {};
      const listPengeluaranGrup = [];

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

      if (transactionsDb && Array.isArray(transactionsDb)) {
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

      const arrayMasukFinal = Object.values(listPemasukanGrup)
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
        .slice(0, 15);

      const arrayKeluarFinal = listPengeluaranGrup
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
        .slice(0, 15);

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

      const totalSaldoNet = calcMasuk - calcKeluar;

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

      let hitungPersen = 0;
      if (totalPlafonDinamis > 0) {
        hitungPersen = parseFloat(((calcMasuk / totalPlafonDinamis) * 100).toFixed(1));
      }
      setProgress({
        percent: hitungPersen,
        current: calcMasuk,
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

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-2 sm:px-4 pb-12 animate-fadeIn">
        <div className="flex items-center justify-center gap-3 py-6 theme-text-accent font-mono text-xs tracking-widest uppercase">
          <svg className="animate-spin h-5 w-5 theme-text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">{dict.loading}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-10 rounded-2xl theme-bg-tertiary animate-pulse theme-border border" />
          <div className="h-10 rounded-2xl theme-bg-tertiary animate-pulse theme-border border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="h-44 rounded-3xl theme-bg-secondary theme-border border p-5 flex flex-col justify-between relative overflow-hidden shadow-xl"
            >
              <div className="space-y-3">
                <div className="h-3 w-1/3 theme-bg-tertiary rounded" />
                <div className="h-2 w-1/2 theme-bg-tertiary opacity-60 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-3/4 theme-bg-tertiary rounded-lg" />
                <div className="h-2 w-1/3 theme-bg-tertiary opacity-60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4 max-w-5xl mx-auto">
        <div className="text-rose-400 text-sm font-mono">{error}</div>
        <button
          onClick={() => loadDashboardData()}
          className="px-4 py-2 theme-gradient-main theme-text-primary rounded-lg font-mono text-xs transition-all shadow-md cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-2 sm:px-4 pb-12 text-xs transition-all duration-500 theme-text-primary">
      
      {/* SELEKTOR PERIODE & BAHASA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print:hidden">
        {periodeList.length > 0 && (
          <GlassCard className="p-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider theme-text-secondary uppercase font-bold px-1 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 theme-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {dict.selectPeriod}
            </span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="theme-bg-tertiary theme-text-accent text-xs rounded-lg px-2.5 py-1 focus:outline-none font-mono font-bold cursor-pointer theme-border border"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">
                  {p.nama_periode} {p.is_closed ? dict.statusClosed : dict.statusActive}
                </option>
              ))}
            </select>
          </GlassCard>
        )}

        <GlassCard className="p-2.5 flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider theme-text-secondary uppercase font-bold px-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 theme-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.198 15.287 6 18.213"></path>
            </svg>
            {dict.selectLanguage}
          </span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="theme-bg-tertiary theme-text-primary text-xs rounded-lg px-2.5 py-1 focus:outline-none font-mono font-bold cursor-pointer theme-border border"
          >
            <option value="id" className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">🇮🇩 Indonesia</option>
            <option value="jv" className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">🎯 Cirebonan</option>
            <option value="en" className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">🇬🇧 English</option>
          </select>
        </GlassCard>
      </div>

      {/* ANNOUNCEMENT BANNER */}
      {announcement && (
        <GlassCard className="w-full py-2.5 px-4 overflow-hidden flex items-center gap-2 print:hidden">
          <svg className="w-4 h-4 theme-text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 000-6M5.436 13.683A4.001 4.001 0 017 6h1.832c.41 0 .789-.237.973-.603l1.082-2.165A1.8 1.8 0 0112.502 2h.001c.99 0 1.8.81 1.8 1.8v15.4c0 .99-.81 1.8-1.8 1.8h-.001a1.8 1.8 0 01-1.615-1.032l-1.082-2.165a1.182 1.182 0 00-.973-.603H7a4 4 0 01-1.564-.317z"></path>
          </svg>
          <div className="animate-marquee inline-block font-bold text-[10px] sm:text-xs tracking-widest uppercase font-mono theme-text-accent">
            {announcement}
          </div>
        </GlassCard>
      )}

      {/* 3 KARTU KAS UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* CARD 1: KAS UTAMA HAUL */}
        <div className="md:col-span-1 p-5 sm:p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-xl border border-white/20 rounded-3xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-20 pointer-events-none select-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.4" />
              <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="10" opacity="0.6" />
              <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="14" opacity="0.9" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-white/90">{dict.mainCash}</span>
            <p className="text-[11px] font-bold text-white/80 mt-0.5">{dict.netBalance}</p>
          </div>

          <div className="relative z-10 mt-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight leading-none text-white drop-shadow-md">
              {formatRupiah(totals.total)}
            </h2>
            <div className="flex justify-between items-center mt-5 font-mono text-[10px] tracking-wider text-white/90 font-bold">
              <span>{dict.initialBalance}: {formatRupiah(totals.saldoAwal)}</span>
              <span className="font-extrabold uppercase">{dict.committee}</span>
            </div>
          </div>
        </div>

       {/* CARD 2: TOTAL UANG MASUK */}
        <div className="p-5 flex flex-col justify-between border-2 border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/80 rounded-3xl transition-all shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-950 dark:text-emerald-300">{dict.totalIncome}</span>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-200 font-bold mt-0.5">Akumulasi Donasi & Kas</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>

          <div className="relative z-10 mt-3">
            <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-950 dark:text-emerald-300 my-1">{formatRupiah(totals.masuk)}</h3>
            <p className="text-[10px] font-extrabold text-emerald-900 dark:text-emerald-200 font-mono mt-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
              {catSummaryMasuk.length} {dict.categories}
            </p>
          </div>
        </div>

        {/* CARD 3: TOTAL UANG BELANJA */}
        <div className="p-5 flex flex-col justify-between border-2 border-rose-500/50 bg-rose-50 dark:bg-rose-950/80 rounded-3xl transition-all shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-rose-950 dark:text-rose-300">{dict.totalExpense}</span>
              <p className="text-[10px] text-rose-800 dark:text-rose-200 font-bold mt-0.5">Realisasi Pengeluaran</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </div>
          </div>

          <div className="relative z-10 mt-3">
            <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-950 dark:text-rose-300 my-1">{formatRupiah(totals.keluar)}</h3>
            <p className="text-[10px] font-extrabold text-rose-900 dark:text-rose-200 font-mono mt-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              {catSummaryKeluar.length} {dict.allocation}
            </p>
          </div>
        </div>
              
      </div>

      {/* LOG TRAFIK PENGUNJUNG & TARGET PLAFON PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">

        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:col-span-1">
          <GlassCard className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-mono theme-text-tertiary uppercase truncate">{dict.totalKunjungan}</p>
              <h4 className="text-base font-black font-mono leading-tight">{visitorStats.totalViews}</h4>
            </div>
          </GlassCard>

          <GlassCard className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-mono theme-text-tertiary uppercase truncate">{dict.pengunjungUnik}</p>
              <h4 className="text-base font-black font-mono leading-tight">{visitorStats.uniqueCount}</h4>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="md:col-span-2 p-4 flex flex-col justify-center space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 theme-text-primary">
              <svg className="w-4 h-4 theme-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {dict.progressTitle}
            </h3>
            <span className="theme-text-accent font-mono text-xs font-black theme-bg-tertiary px-2 py-0.5 rounded theme-border border">{progress.percent}%</span>
          </div>
          <div className="w-full h-3 theme-bg-tertiary rounded-full overflow-hidden p-0.5 theme-border border">
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
          <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b theme-border pb-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            {dict.rekapIncome}
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {catSummaryMasuk.map((c, i) => (
              <div key={i} className="p-2 theme-bg-tertiary theme-border border rounded-xl flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 theme-text-secondary font-medium">
                  <svg className="w-3 h-3 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 12h10m-8 5h8"></path>
                  </svg>
                  {c.label}
                </span>
                <span className={`font-mono font-bold ${c.value < 0 ? 'text-rose-400' : 'theme-text-accent'}`}>{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-3">
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b theme-border pb-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 30a1 1 0 000 2h2a1 1 0 000-2h-2z M16 8v8m-4-5h8m-8 0a3 3 0 106 0 3 3 0 00-6 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h1m4 0h1m-5 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            {dict.rekapExpense}
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {catSummaryKeluar.map((c, i) => (
              <div key={i} className="p-2 theme-bg-tertiary theme-border border rounded-xl flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 theme-text-secondary font-medium">
                  <svg className="w-3 h-3 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 12h10m-8 5h8"></path>
                  </svg>
                  {c.label}
                </span>
                <span className="font-mono font-bold text-rose-400">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* MUTASI TERAKHIR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-4 border-l-4 border-l-emerald-400 space-y-3">
          <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {dict.lastIncome}
          </h5>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {rincianMasuk.length === 0 ? (
              <p className="text-xs theme-text-tertiary font-mono py-1">{dict.emptyMutationIn}</p>
            ) : (
              rincianMasuk.map((t, i) => (
                <div key={i} className="p-2 theme-bg-tertiary theme-border border rounded-xl flex justify-between items-center text-xs">
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
          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
            </svg>
            {dict.lastExpense}
          </h5>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {rincianKeluar.length === 0 ? (
              <p className="text-xs theme-text-tertiary font-mono py-1">{dict.emptyMutationOut}</p>
            ) : (
              rincianKeluar.map((t, i) => (
                <div key={i} className="p-2 theme-bg-tertiary theme-border border rounded-xl flex justify-between items-center text-xs">
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
