'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowUpCircle, ArrowDownCircle, PieChart } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ in: [], out: [] }); // Untuk menyimpan rincian per kategori

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // 1. Ambil transaksi utama
    const { data: trans } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(5);
    
    // 2. Ambil data pengelompokan kategori (Asumsi ada kolom 'category' di tabel 'transactions')
    const { data: grouped } = await supabase.from('transactions').select('category, amount, type');
    
    let m = 0, k = 0;
    let catIn = {}, catOut = {};
    
    grouped?.forEach(t => {
      if (t.type === 'in') {
        m += t.amount;
        catIn[t.category] = (catIn[t.category] || 0) + t.amount;
      } else {
        k += t.amount;
        catOut[t.category] = (catOut[t.category] || 0) + t.amount;
      }
    });
    
    setStats({ masuk: m, keluar: k, saldo: m - k });
    setTransactions(trans || []);
    setCategories({ in: catIn, out: catOut });
  }

  return (
    <div className="space-y-6 pb-24 px-4 pt-4">
      {/* ... (Header & Kartu Saldo tetap sama seperti sebelumnya) ... */}

      {/* 4. RINCIAN PER KATEGORI */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <PieChart size={16} className="text-amber-500" /> Rincian Kategori
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-emerald-400 mb-2 uppercase">Pemasukan</p>
            {Object.entries(categories.in).map(([cat, val]) => (
              <div key={cat} className="flex justify-between text-xs py-1">
                <span className="text-slate-400">{cat}</span>
                <span className="text-white">Rp {val.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-rose-400 mb-2 uppercase">Pengeluaran</p>
            {Object.entries(categories.out).map(([cat, val]) => (
              <div key={cat} className="flex justify-between text-xs py-1">
                <span className="text-slate-400">{cat}</span>
                <span className="text-white">Rp {val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ... (Daftar Transaksi Terakhir) ... */}
    </div>
  );
}
