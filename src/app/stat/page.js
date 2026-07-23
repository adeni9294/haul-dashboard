'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
      const { data: listPeriode } = await supabase
        .from('periode_haul')
        .select('*')
        .order('created_at', { ascending: false });

      if (!listPeriode || listPeriode.length === 0) {
        setLoading(false);
        return;
      }

      setPeriodeList(listPeriode);
      setSelectedPeriodeId(listPeriode[0].id);

      // 2. Ambil Data dari Tabel 'transactions' dan 'budgets'
      const { data: allTransactions } = await supabase.from('transactions').select('*');
      const { data: allBudgets } = await supabase.from('budgets').select('*');

      // 3. Mapping Statistik per Periode Berdasarkan Kolom 'type' di 'transactions'
      const statsMap = listPeriode.map(p => {
        const pId = p.id;

        let masuk = 0;
        let kel = 0;
        let rencanaBudget = 0;

        // Hitung dari transactions
        if (allTransactions) {
          allTransactions.forEach(t => {
            const matchPeriode = t.periode_id === pId || !t.periode_id;
            if (matchPeriode) {
              const typeVal = (t.type || '').toString().trim();
              const nominal = Math.abs(parseFloat(t.amount || 0));

              // Sesuai dengan database: 'Pemasukan' atau 'keluar'
              if (typeVal.toLowerCase() === 'pemasukan') {
                masuk += nominal;
              } else if (typeVal.toLowerCase() === 'keluar') {
                kel += nominal;
              }
            }
          });
        }

        // Hitung Rencana Anggaran (Budget)
        if (allBudgets) {
          allBudgets.forEach(b => {
            const matchPeriode = b.periode_id === pId || !b.periode_id;
            if (matchPeriode) {
              rencanaBudget += parseFloat(b.planned_amount || 0);
            }
          });
        }

        const saldo = masuk - kel;

        return {
          id: pId,
          nama_periode: p.nama_periode,
          is_closed: p.is_closed,
          totalMasuk: masuk,
          totalKeluar: kel,
          saldoBersih: saldo,
          totalRencanaBudget: rencanaBudget
        };
      });

      setAllPeriodeStats(statsMap);
    } catch (err) {
      console.error("Gagal kalkulasi statistik:", err);
    } finally {
      setLoading(false);
    }
  }

  function calculateCurrentPeriod(pId) {
    const found = allPeriodeStats.find(s => s.id === pId);
    if (!found) return;

    const serapan = found.totalRencanaBudget > 0 
      ? Math.round((found.totalKeluar / found.totalRencanaBudget) * 100) 
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

  if (loading) return <div className="text-center py-12 text-xs font-mono opacity-70">Menghitung statistik pencapaian...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* HEADER & SELECTOR PERIODE (GLASS) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <span>📈</span> Statistik & Pencapaian Finansial Haul
          </h2>
          <p className="text-[10px] opacity-80 font-mono mt-0.5">Komparasi pencapaian antar periode & realisasi target anggaran</p>
        </div>

        {periodeList.length > 0 && (
          <div className="flex items-center bg-black/30 p-1 border border-white/20 rounded-xl">
            <span className="text-[9px] font-mono font-bold text-slate-300 px-2 uppercase">Fokus Periode:</span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-black/40 border border-white/20 text-[10px] text-amber-300 rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SECTION 1: PENCAPAIAN TARGET PADA PERIODE TERPILIH */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <span>🎯</span> Indikator Pencapaian Utama: <span className="text-amber-300 font-black">{currentSummary.namaPeriode}</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-1">
            <p className="text-[10px] font-mono opacity-80 uppercase">Total Pemasukan (Kas Masuk)</p>
            <h4 className="text-lg font-black font-mono text-emerald-300">{formatRupiah(currentSummary.totalMasuk)}</h4>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-1">
            <p className="text-[10px] font-mono opacity-80 uppercase">Total Pengeluaran (Realisasi)</p>
            <h4 className="text-lg font-black font-mono text-rose-300">{formatRupiah(currentSummary.totalKeluar)}</h4>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-1">
            <p className="text-[10px] font-mono opacity-80 uppercase">Target Rencana Anggaran</p>
            <h4 className="text-lg font-black font-mono text-amber-300">{formatRupiah(currentSummary.totalRencanaBudget)}</h4>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-1">
            <p className="text-[10px] font-mono opacity-80 uppercase">Serapan Anggaran vs Rencana</p>
            <h4 className="text-lg font-black font-mono text-blue-300">{currentSummary.persentaseSerapan}% <span className="text-[10px] font-normal opacity-70">terserap</span></h4>
          </div>
        </div>
      </div>

      {/* SECTION 2: KOMPARASI ANTAR PERIODE (TAHUN KE TAHUN) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <span>📊</span> Komparasi Kinerja Keuangan Antar Periode Haul (Tahun ke Tahun)
        </h3>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-black/40 text-slate-200 border-b border-white/20 font-mono uppercase text-[9px] tracking-wider">
                  <th className="p-3">Periode Haul</th>
                  <th className="p-3 text-right">Total Pemasukan</th>
                  <th className="p-3 text-right">Total Pengeluaran</th>
                  <th className="p-3 text-right">Target Anggaran</th>
                  <th className="p-3 text-right">Sisa Saldo Kas Bersih</th>
                  <th className="p-3 text-center">Status Buku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-100 font-mono text-[11px]">
                {allPeriodeStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-white/5 transition-all">
                    <td className="p-3 font-bold font-sans text-white text-xs">{stat.nama_periode}</td>
                    <td className="p-3 text-right text-emerald-300 font-bold">{formatRupiah(stat.totalMasuk)}</td>
                    <td className="p-3 text-right text-rose-300 font-bold">{formatRupiah(stat.totalKeluar)}</td>
                    <td className="p-3 text-right text-amber-300">{formatRupiah(stat.totalRencanaBudget)}</td>
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
        </div>
      </div>

    </div>
  );
}
