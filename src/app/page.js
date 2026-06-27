'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowUpCircle, ArrowDownCircle, Bell, PieChart } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ in: {}, out: {} });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Mengambil data
    const { data: trans } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    
    if (!trans) return;

    let m = 0, k = 0;
    let catIn = {}, catOut = {};
    
    trans.forEach(t => {
      // Pastikan 'type' sesuai dengan data di database Anda ('in'/'out')
      if (t.type === 'in') {
        m += t.amount;
        catIn[t.category] = (catIn[t.category] || 0) + t.amount;
      } else {
        k += t.amount;
        catOut[t.category] = (catOut[t.category] || 0) + t.amount;
      }
    });
    
    setStats({ masuk: m, keluar: k, saldo: m - k });
    setTransactions(trans.slice(0, 5)); // Ambil 5 terbaru
    setCategories({ in: catIn, out: catOut });
  }

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 text-white">
      {/* 1. HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-xs">Selamat Datang,</p>
          <h2 className="text-lg font-bold">Panitia Haul</h2>
        </div>
        <Bell className="text-amber-500" size={20} />
      </header>

      {/* 2. KARTU SALDO */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <p className="text-slate-400 text-sm">Total Kas Haul</p>
        <h1 className="text-3xl font-black mt-1">Rp {stats.saldo.toLocaleString()}</h1>
        <div className="mt-6 flex gap-4 border-t border-slate-800 pt-4">
          <div className="flex-1 flex items-center gap-2">
            <ArrowUpCircle className="text-emerald-400" size={18} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Masuk</p>
              <p className="font-bold text-xs">Rp {stats.masuk.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <ArrowDownCircle className="text-rose-400" size={18} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Keluar</p>
              <p className="font-bold text-xs">Rp {stats.keluar.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RINCIAN KATEGORI */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><PieChart size={16} className="text-amber-500"/> Rincian</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-emerald-400 mb-2 uppercase">Masuk</p>
            {Object.entries(categories.in).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] py-1 text-slate-300"><span>{k}</span><span>Rp {v.toLocaleString()}</span></div>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-rose-400 mb-2 uppercase">Keluar</p>
            {Object.entries(categories.out).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] py-1 text-slate-300"><span>{k}</span><span>Rp {v.toLocaleString()}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. AKTIVITAS */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold">Aktivitas Terakhir</h2>
        {transactions.map((t, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div>
              <p className="text-xs font-bold">{t.description}</p>
              <p className="text-[9px] text-slate-500">{new Date(t.created_at).toLocaleDateString()}</p>
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
