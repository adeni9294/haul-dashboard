'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [pemasukan, setPemasukan] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);
  const [targetAnggaran, setTargetAnggaran] = useState(0);
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          setLoading(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Ambil data transaksi
        const { data: transData, error: transError } = await supabase
          .from('transactions')
          .select('*');

        if (transError) throw transError;

        // 2. Ambil data target anggaran
        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .select('planned_amount');

        if (budgetError) throw budgetError;

        let totalMasuk = 0;
        let totalKeluar = 0;
        const mapMasuk = {};
        const mapKeluar = {};

        if (transData) {
          transData.forEach(item => {
            const nominal = Number(item.amount || 0);
            // Ubah tipe ke huruf kecil semua saat pengecekan agar aman dari case-sensitive
            const itemType = String(item.type || '').toLowerCase();
            
            if (itemType === 'pemasukan') {
              totalMasuk += nominal;
              mapMasuk[item.category] = (mapMasuk[item.category] || 0) + nominal;
            } else if (itemType === 'pengeluaran') {
              totalKeluar += nominal;
              mapKeluar[item.category] = (mapKeluar[item.category] || 0) + nominal;
            }
          });
        }

        // Hitung total target anggaran
        let totalTarget = 0;
        if (budgetData) {
          budgetData.forEach(b => {
            totalTarget += Number(b.planned_amount || 0);
          });
        }

        setTargetAnggaran(totalTarget > 0 ? totalTarget : 50000000);
        setPemasukan(totalMasuk);
        setPengeluaran(totalKeluar);
        
        setRincianMasuk(Object.entries(mapMasuk).map(([category, amount]) => ({ category, amount })));
        setRincianKeluar(Object.entries(mapKeluar).map(([category, amount]) => ({ category, amount })));

      } catch (err) {
        console.error('Error dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const saldoAkhir = pemasukan - pengeluaran;
  const persentaseProgres = targetAnggaran > 0 ? Math.min(Math.round((pemasukan / targetAnggaran) * 100), 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn">
      {/* CARD TOP SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden shadow-md">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TOTAL PEMASUKAN</p>
          <p className="text-xl font-mono font-black text-emerald-400 mt-1">Rp {pemasukan.toLocaleString('id-ID')}</p>
          <div className="absolute -bottom-2 -right-2 text-emerald-500/5 text-6xl font-black">IN</div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden shadow-md">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TOTAL PENGELUARAN</p>
          <p className="text-xl font-mono font-black text-rose-400 mt-1">Rp {pengeluaran.toLocaleString('id-ID')}</p>
          <div className="absolute -bottom-2 -right-2 text-rose-500/5 text-6xl font-black">OUT</div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden shadow-md">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">SISA SALDO AKHIR</p>
          <p className="text-xl font-mono font-black text-amber-400 mt-1">Rp {saldoAkhir.toLocaleString('id-ID')}</p>
          <div className="absolute -bottom-2 -right-2 text-amber-500/5 text-6xl font-black">BAL</div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">PROGRES TARGET</p>
            <span className="text-xs font-mono font-black text-amber-400">{persentaseProgres}%</span>
          </div>
          <p className="text-xl font-mono font-black text-white mt-1">Rp {targetAnggaran.toLocaleString('id-ID')}</p>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800/50">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${persentaseProgres}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* BLOCK DETAIL SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PEMASUKAN */}
        <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">📥 Rincian Aktual Pemasukan</h3>
          {rincianMasuk.length > 0 ? (
            <div className="space-y-2">
              {rincianMasuk.map((rm, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl text-[11px] font-mono">
                  <span className="text-slate-300 font-medium">{rm.category}</span>
                  <span className="text-emerald-400 font-bold">Rp {rm.amount.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">Belum ada data masuk dari database Supabase.</p>
          )}
        </div>

        {/* PENGELUARAN */}
        <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">📤 Rincian Aktual Pengeluaran</h3>
          {rincianKeluar.length > 0 ? (
            <div className="space-y-2">
              {rincianKeluar.map((rk, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl text-[11px] font-mono">
                  <span className="text-slate-300 font-medium">{rk.category}</span>
                  <span className="text-rose-400 font-bold">Rp {rk.amount.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">Belum ada data keluar dari database Supabase.</p>
          )}
        </div>
      </div>
    </div>
  );
}
