'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';

export default function StatPage() {
  const [loading, setLoading] = useState(true);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  
  const [allPeriodeStats, setAllPeriodeStats] = useState([]);
  const [currentSummary, setCurrentSummary] = useState({
    namaPeriode: '-',
    totalMasuk: 0,
    totalKeluar: 0,
    totalRencanaBudget: 0,
    saldoBersih: 0,
    persentaseSerapan: 0
  });

  // 🔔 Custom Toast State (Center Top)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const getSupabase = () => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  };

  useEffect(() => {
    loadGlobalStats();
  }, []);

  useEffect(() => {
    if (selectedPeriodeId) {
      calculateCurrentPeriod(selectedPeriodeId);
    }
  }, [selectedPeriodeId, allPeriodeStats]);

  async function loadGlobalStats() {
    try {
      setLoading(true);
      const supabase = getSupabase();

      // 1. Ambil Periode Haul
      const { data: listPeriode, error: periodeErr } = await supabase
        .from('periode_haul')
        .select('*')
        .order('created_at', { ascending: false });

      if (periodeErr) throw periodeErr;

      if (!listPeriode || listPeriode.length === 0) {
        setLoading(false);
        return;
      }

      setPeriodeList(listPeriode);
      setSelectedPeriodeId(listPeriode[0].id);

      // 2. Ambil Data Master
      const { data: allDonations } = await supabase.from('donation_details').select('*');
      const { data: allTransactions } = await supabase.from('transactions').select('*');
      const { data: allBudgets } = await supabase.from('budgets').select('*');

      // 3. Mapping Statistik per Periode
      const statsMap = listPeriode.map(p => {
        const pId = p.id;

        let calcMasuk = 0;
        let calcKeluar = 0;
        let totalPlafonDinamis = 0;

        // --- A. OLAH DATA DONATION DETAILS ---
        if (allDonations) {
          allDonations.forEach((item) => {
            const matchPeriode = item.periode_id === pId || !item.periode_id || item.periode_id === Number(pId);
            if (!matchPeriode) return;

            const rawAmount = parseFloat(item.amount) || 0;
            const tgl = item.transaction_date || '';
            if (!tgl) return;

            const donorNameClean = (item.donor_name || '').toString().trim();
            const isAdminFee = donorNameClean === '__ADMIN_FEE__';
            const isSaldoMengendap = donorNameClean === '__SALDO_MENGENDAP__';

            if (isAdminFee) {
              calcMasuk += -Math.abs(rawAmount);
            } else if (isSaldoMengendap) {
              calcMasuk += Math.abs(rawAmount);
            } else {
              calcMasuk += Math.abs(rawAmount);
            }
          });
        }

        // --- B. OLAH DATA TRANSACTIONS ---
        if (allTransactions) {
          allTransactions.forEach((item) => {
            const matchPeriode = item.periode_id === pId || !item.periode_id || item.periode_id === Number(pId);
            if (!matchPeriode) return;

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
            } else {
              if (!item.note || item.note.trim() === '') return;
              calcMasuk += nominal;
            }
          });
        }

        // --- C. OLAH DATA BUDGETS ---
        if (allBudgets) {
          allBudgets.forEach(b => {
            const matchPeriode = b.periode_id === pId || !b.periode_id || b.periode_id === Number(pId);
            if (matchPeriode) {
              totalPlafonDinamis += parseFloat(b.planned_amount) || 0;
            }
          });
        }

        const totalMasukTerkumpul = calcMasuk;
        const totalSaldoNet = totalMasukTerkumpul - calcKeluar;

        return {
          id: pId,
          nama_periode: p.nama_periode,
          is_closed: p.is_closed,
          totalMasuk: totalMasukTerkumpul,
          totalKeluar: calcKeluar,
          saldoBersih: totalSaldoNet,
          totalRencanaBudget: totalPlafonDinamis
        };
      });

      setAllPeriodeStats(statsMap);
    } catch (err) {
      console.error("Gagal kalkulasi statistik:", err);
      showToast('Gagal memuat statistik kalkulasi keuangan', 'error');
    } finally {
      setLoading(false);
    }
  }

  function calculateCurrentPeriod(pId) {
    const found = allPeriodeStats.find(s => s.id === pId);
    if (!found) return;

    const serapan = found.totalRencanaBudget > 0 
      ? parseFloat(((found.totalKeluar / found.totalRencanaBudget) * 100).toFixed(1)) 
      : 0;

    setCurrentSummary({
      namaPeriode: found.nama_periode,
      totalMasuk: found.totalMasuk,
      totalKeluar: found.totalKeluar,
      totalRencanaBudget: found.totalRencanaBudget,
      saldoBersih: found.saldoBersih,
      persentaseSerapan: serapan
    });
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // 🚀 TAMPILAN SKELETON LOADING MODERN
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0 pb-12">
        <div className="flex items-center justify-center gap-3 py-6 text-amber-400 font-mono text-xs tracking-widest uppercase">
          <svg className="animate-spin h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">Kalkulasi Statistik & Capaian Finansial...</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <GlassCard key={i} className="p-4 space-y-2 animate-pulse bg-slate-900/40 border border-white/5">
              <div className="h-3 w-3/4 bg-slate-800/80 rounded" />
              <div className="h-6 w-1/2 bg-slate-800/80 rounded" />
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6 h-64 animate-pulse bg-slate-900/40 border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs theme-text-primary relative">

      {/* 🔔 FLOATING TOAST NOTIFICATION (POSISI CENTER ATAS) */}
      {toast.show && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md transition-all duration-300">
          <div className={`px-5 py-3.5 border-2 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
            toast.type === 'error' 
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50' 
              : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50'
          }`}>
            <span className="text-lg shrink-0">{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span className="font-mono font-bold text-xs leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      {/* HEADER & SELECTOR PERIODE */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 theme-text-primary">
            <span>📈</span> Statistik & Pencapaian Finansial Haul
          </h2>
          <p className="text-[10px] theme-text-tertiary font-mono mt-0.5">Komparasi pencapaian antar periode & realisasi target anggaran</p>
        </div>

        {periodeList.length > 0 && (
          <div className="flex items-center bg-black/30 p-1 border theme-border rounded-xl">
            <span className="text-[9px] font-mono font-bold theme-text-tertiary px-2 uppercase">Fokus Periode:</span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-black/40 border theme-border text-[10px] theme-text-accent rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </GlassCard>

      {/* SECTION 1: INDIKATOR PENCAPAIAN UTAMA (5 CARDS) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider theme-text-secondary flex items-center gap-2">
          <span>🎯</span> Indikator Pencapaian Utama: <span className="theme-text-accent font-black">{currentSummary.namaPeriode}</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <GlassCard className="p-4 space-y-1">
            <p className="text-[10px] font-mono theme-text-tertiary uppercase">Total Pemasukan (Terkumpul)</p>
            <h4 className="text-base font-black font-mono text-emerald-300">{formatRupiah(currentSummary.totalMasuk)}</h4>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <p className="text-[10px] font-mono theme-text-tertiary uppercase">Total Pengeluaran</p>
            <h4 className="text-base font-black font-mono text-rose-300">{formatRupiah(currentSummary.totalKeluar)}</h4>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <p className="text-[10px] font-mono theme-text-tertiary uppercase">Sisa Kas Bersih</p>
            <h4 className={`text-base font-black font-mono ${currentSummary.saldoBersih >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
              {formatRupiah(currentSummary.saldoBersih)}
            </h4>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <p className="text-[10px] font-mono theme-text-tertiary uppercase">Target Anggaran</p>
            <h4 className="text-base font-black font-mono theme-text-accent">{formatRupiah(currentSummary.totalRencanaBudget)}</h4>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <p className="text-[10px] font-mono theme-text-tertiary uppercase">Serapan Anggaran</p>
            <h4 className="text-base font-black font-mono text-purple-300">{currentSummary.persentaseSerapan}% <span className="text-[9px] font-normal opacity-70">terserap</span></h4>
          </GlassCard>
        </div>
      </div>

      {/* SECTION 2: KOMPARASI ANTAR PERIODE */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider theme-text-secondary flex items-center gap-2">
          <span>📊</span> Komparasi Kinerja Keuangan Antar Periode Haul
        </h3>

        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-black/40 theme-text-secondary border-b theme-border font-mono uppercase text-[9px] tracking-wider">
                  <th className="p-3">Periode Haul</th>
                  <th className="p-3 text-right">Total Pemasukan</th>
                  <th className="p-3 text-right">Total Pengeluaran</th>
                  <th className="p-3 text-right">Target Anggaran</th>
                  <th className="p-3 text-right">Sisa Saldo Kas Bersih</th>
                  <th className="p-3 text-center">Status Buku</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border font-mono text-[11px]">
                {allPeriodeStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-black/20 transition-all">
                    <td className="p-3 font-bold font-sans theme-text-primary text-xs">{stat.nama_periode}</td>
                    <td className="p-3 text-right text-emerald-300 font-bold">{formatRupiah(stat.totalMasuk)}</td>
                    <td className="p-3 text-right text-rose-300 font-bold">{formatRupiah(stat.totalKeluar)}</td>
                    <td className="p-3 text-right theme-text-accent">{formatRupiah(stat.totalRencanaBudget)}</td>
                    <td className={`p-3 text-right font-black ${stat.saldoBersih >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
                      {formatRupiah(stat.saldoBersih)}
                    </td>
                    <td className="p-3 text-center">
                      {stat.is_closed ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-black text-[9px] uppercase">Arsip (Closed)</span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-black text-[9px] uppercase">Aktif (Running)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
