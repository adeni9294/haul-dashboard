'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [transactions, setTransactions] = useState([]);
  const [target] = useState(300000); // Sesuaikan dengan target Anda

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Ambil data transaksi
    const { data: trans } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(5);
    
    let m = 0, k = 0;
    trans?.forEach(t => t.type === 'in' ? m += t.amount : k += t.amount);
    
    setStats({ masuk: m, keluar: k, saldo: m - k });
    setTransactions(trans || []);
  }

  const progress = (stats.masuk / target) * 100;

  return (
    <div className="space-y-6 pb-24 px-4 pt-4">
      {/* 1. KARTU SALDO UTAMA */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <p className="text-slate-400 text-sm">Total Kas Haul</p>
        <h1 className="text-3xl font-black text-white mt-1">Rp {stats.saldo.toLocaleString()}</h1>
        
        {/* KAS MASUK & KELUAR (YANG HILANG TADI) */}
        <div className="mt-6 flex gap-4 border-t border-slate-800 pt-4">
          <div className="flex-1 flex items-center gap-2">
            <ArrowUpCircle className="text-emerald-400" size={18} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Masuk</p>
              <p className="font-bold text-white text-xs">Rp {stats.masuk.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <ArrowDownCircle className="text-rose-400" size={18} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Keluar</p>
              <p className="font-bold text-white text-xs">Rp {stats.keluar.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROGRES TARGET */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Progres Target</span>
          <span className="text-white font-bold">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
      </div>

      {/* 3. DAFTAR TRANSAKSI */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200">Aktivitas Terakhir</h2>
        {transactions.map((t, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div>
              <p className="text-xs font-bold text-white">{t.description || 'Transaksi'}</p>
              <p className="text-[10px] text-slate-500">{new Date(t.created_at).toLocaleDateString()}</p>
            </div>
            <p className={`text-xs font-bold ${t.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {t.type === 'in' ? '+' : '-'} Rp {t.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
