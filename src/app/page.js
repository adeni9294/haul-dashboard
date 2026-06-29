'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowUpCircle, ArrowDownCircle, Bell, PieChart, Target } from 'lucide-react';

// Inisialisasi Supabase di luar komponen agar aman saat proses build produksi Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Dashboard() {
  const [stats, setStats] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ in: {}, out: {} });
  
  // State Anggaran Dana
  const [totalAnggaran, setTotalAnggaran] = useState(0);
  const [progressPersen, setProgressPersen] = useState(0);

  useEffect(() => {
    if (!supabase) {
      console.error("Konfigurasi ENV Supabase tidak ditemukan.");
      return;
    }
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // 1. Mengambil data transaksi keseluruhan
      const { data: trans, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (transError) throw transError;

      // 2. Mengambil data anggaran (mencoba tabel 'budgets', jika tidak ada fallback ke 'anggaran')
      let budgetsData = [];
      const { data: bData, error: budgetError } = await supabase.from('budgets').select('*');
      
      if (!budgetError && bData) {
        budgetsData = bData;
      } else {
        const { data: altData } = await supabase.from('anggaran').select('*');
        if (altData) budgetsData = altData;
      }

      if (!trans) return;

      let m = 0, k = 0;
      let catIn = {}, catOut = {};
      
      // Hitung akumulasi masuk dan keluar
      trans.forEach(t => {
        const isPemasukan = t.type === 'in' || (t.type && t.type.toLowerCase().includes('pemasukan'));

        if (isPemasukan) {
          m += Number(t.amount || 0);
          catIn[t.category] = (catIn[t.category] || 0) + Number(t.amount || 0);
        } else {
          k += Number(t.amount || 0);
          catOut[t.category] = (catOut[t.category] || 0) + Number(t.amount || 0);
        }
      });
      
      // Hitung total alokasi plafon anggaran (Rp 15.300.000)
      let totalTarget = 0;
      if (budgetsData && budgetsData.length > 0) {
        totalTarget = budgetsData.reduce((sum, b) => {
          const nilaiNominal = b.amount || b.nominal || b.nominal_alokasi || 0;
          return sum + Number(nilaiNominal);
        }, 0);
      }

      // RUMUS UTAMA: (Pemasukan / Total Target Anggaran) * 100%
      let persen = 0;
      if (totalTarget > 0) {
        persen = Math.round((m / totalTarget) * 100);
      }
      
      setStats({ masuk: m, keluar: k, saldo: m - k });
      setTransactions(trans.slice(0, 5)); 
      setCategories({ in: catIn, out: catOut });
      setTotalAnggaran(totalTarget);
      setProgressPersen(persen);
    } catch (err) {
      console.error("Gagal memuat data dasbor:", err);
    }
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
        <h1 className="text-3xl font-black mt-1">
          {stats.saldo < 0 ? `- Rp ${Math.abs(stats.saldo).toLocaleString()}` : `Rp ${stats.saldo.toLocaleString()}`}
        </h1>
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

      {/* 3. PROGRES TARGET ANGGARAN */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-amber-500" />
            <p className="text-xs font-bold text-slate-300">Progres Target</p>
          </div>
          <p className="text-xs font-mono text-amber-400 font-bold">{progressPersen}%</p>
        </div>
        
        {/* Progress Bar Line */}
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
            // Batasi visual bar maksimal 100% lebar kontainer agar tidak meluap keluar box jika persentase > 100%
            style={{ width: `${Math.min(progressPersen, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
          <p>Terkumpul: <span className="text-emerald-400 font-bold">Rp {stats.masuk.toLocaleString()}</span></p>
          <p>Target Plafon: <span className="text-slate-200 font-bold">Rp {totalAnggaran.toLocaleString()}</span></p>
        </div>
      </div>

      {/* 4. RINCIAN KATEGORI */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <PieChart size={16} className="text-amber-500"/> Rincian
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-emerald-400 mb-2 uppercase">Masuk</p>
            {Object.entries(categories.in).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] py-1 text-slate-300">
                <span>{k}</span>
                <span>Rp {v.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-rose-400 mb-2 uppercase">Keluar</p>
            {Object.entries(categories.out).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] py-1 text-slate-300">
                <span>{k}</span>
                <span>Rp {v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. AKTIVITAS TERAKHIR */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold">Aktivitas Terakhir</h2>
        {transactions.map((t, i) => {
          const isPemasukan = t.type === 'in' || (t.type && t.type.toLowerCase().includes('pemasukan'));
          return (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div>
                <p className="text-xs font-bold">{t.note || t.category}</p>
                <p className="text-[9px] text-slate-500">
                  {t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : ''}
                </p>
              </div>
              <p className={`text-xs font-bold ${isPemasukan ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPemasukan ? '+' : '-'} Rp {(t.amount || 0).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
