'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';
import {
  TrendingUp,
  BarChart3,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Target,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Archive,
  X,
  Calendar,
  Layers
} from 'lucide-react';

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

  // 🔔 Custom Toast State (Center Top Modern)
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
        <div className="flex items-center justify-center gap-3 py-10 text-amber-400 font-mono text-xs tracking-widest uppercase">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
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

      {/* 🔔 FLOATING TOAST NOTIFICATION MODERN (POSISI ATAS TENGAH) */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] animate-in fade-in slide-in-from-top duration-300">
          <div className={`px-4 py-3 rounded-2xl backdrop-blur-xl flex items-center justify-between gap-3 shadow-2xl border-2 ${
            toast.type === 'error' 
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200' 
              : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span className="font-semibold text-xs leading-snug truncate">{toast.message}</span>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0">
              <X className="w-4 h-4 opacity-80 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER & SELECTOR PERIODE */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 theme-text-primary">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Statistik & Pencapaian Finansial Haul</span>
          </h2>
          <p className="text-[10px] theme-text-tertiary font-mono mt-0.5">Komparasi pencapaian antar periode & realisasi target anggaran</p>
        </div>

        {periodeList.length > 0 && (
          <div className="flex items-center bg-black/30 p-1 border theme-border rounded-xl">
            <span className="text-[9px] font-mono font-bold theme-text-tertiary px-2 uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" /> Fokus Periode:
            </span>
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
          <Target className="w-4 h-4 text-amber-400" />
          <span>Indikator Pencapaian Utama:</span> 
          <span className="theme-text-accent font-black">{currentSummary.namaPeriode}</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono theme-text-tertiary uppercase">Total Pemasukan</p>
              <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="text-base font-black font-mono text-emerald-300">{formatRupiah(currentSummary.totalMasuk)}</h4>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono theme-text-tertiary uppercase">Total Pengeluaran</p>
              <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="text-base font-black font-mono text-rose-300">{formatRupiah(currentSummary.totalKeluar)}</h4>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono theme-text-tertiary uppercase">Sisa Kas Bersih</p>
              <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className={`text-base font-black font-mono ${currentSummary.saldoBersih >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
              {formatRupiah(currentSummary.saldoBersih)}
            </h4>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono theme-text-tertiary uppercase">Target Anggaran</p>
              <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Target className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="text-base font-black font-mono theme-text-accent">{formatRupiah(currentSummary.totalRencanaBudget)}</h4>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono theme-text-tertiary uppercase">Serapan Anggaran</p>
              <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <PieChart className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="text-base font-black font-mono text-purple-300">
              {currentSummary.persentaseSerapan}% <span className="text-[9px] font-normal opacity-70">terserap</span>
            </h4>
          </GlassCard>
        </div>
      </div>

      {/* SECTION 2: KOMPARASI ANTAR PERIODE */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider theme-text-secondary flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>Komparasi Kinerja Keuangan Antar Periode Haul</span>
        </h3>

        <GlassCard className="p-0 overflow-hidden shadow-xl">
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
                    <td className="p-3 font-bold font-sans theme-text-primary text-xs flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{stat.nama_periode}</span>
                    </td>
                    <td className="p-3 text-right text-emerald-300 font-bold">{formatRupiah(stat.totalMasuk)}</td>
                    <td className="p-3 text-right text-rose-300 font-bold">{formatRupiah(stat.totalKeluar)}</td>
                    <td className="p-3 text-right theme-text-accent">{formatRupiah(stat.totalRencanaBudget)}</td>
                    <td className={`p-3 text-right font-black ${stat.saldoBersih >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
                      {formatRupiah(stat.saldoBersih)}
                    </td>
                    <td className="p-3 text-center">
                      {stat.is_closed ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-black text-[9px] uppercase inline-flex items-center gap-1">
                          <Archive className="w-3 h-3" /> Arsip (Closed)
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-black text-[9px] uppercase inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Aktif (Running)
                        </span>
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
