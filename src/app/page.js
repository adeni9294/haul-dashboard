'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowUpCircle, ArrowDownCircle, Bell, PieChart, Target } from 'lucide-react';

// Inisialisasi Supabase aman build Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// DEFINISI WARNA TEMA (Sesuaikan dengan pilihan di Pengaturan Anda)
const CONFIG_TEMA = {
  'Emerald Cyber (Hijau Hitam)': {
    bg: 'bg-slate-950',
    card: 'bg-slate-900 border-slate-800',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    accent: 'text-emerald-400',
    primary: 'text-amber-500',
    bar: 'from-amber-500 to-yellow-400'
  },
  'Velvet Rose (Ungu Gelap)': {
    bg: 'bg-neutral-950',
    card: 'bg-purple-950/40 border-purple-900/50',
    text: 'text-purple-50',
    textMuted: 'text-purple-300/70',
    accent: 'text-fuchsia-400',
    primary: 'text-pink-500',
    bar: 'from-pink-500 to-fuchsia-400'
  }
};

export default function Dashboard() {
  const [stats, setStats] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ in: {}, out: {} });
  const [totalAnggaran, setTotalAnggaran] = useState(0);
  const [progressPersen, setProgressPersen] = useState(0);
  
  // State Tema Dinamis
  const [temaAktif, setTemaAktif] = useState('Emerald Cyber (Hijau Hitam)');

  useEffect(() => {
    // Ambil tema yang disimpan oleh menu pengaturan di localStorage
    const savedTheme = localStorage.getItem('gaya_tema_warna'); 
    if (savedTheme && CONFIG_TEMA[savedTheme]) {
      setTemaAktif(savedTheme);
    }

    if (supabase) loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const { data: trans } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
      const { data: budgetsData } = await supabase.from('budgets').select('*');

      if (!trans) return;

      let m = 0, k = 0;
      let catIn = {}, catOut = {};
      
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
      
      let totalTarget = 0;
      if (budgetsData && budgetsData.length > 0) {
        totalTarget = budgetsData.reduce((sum, b) => sum + Number(b.planned_amount || 0), 0);
      }

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
      console.error(err);
    }
  }

  // Ambil palet warna aktif berdasarkan state tema
  const t = CONFIG_TEMA[temaAktif] || CONFIG_TEMA['Emerald Cyber (Hijau Hitam)'];

  return (
    // Membungkus seluruh halaman dengan background tema dinamis agar tidak belang
    <div className={`min-h-screen ${t.bg} ${t.text} space-y-6 pb-24 px-4 pt-4 transition-colors duration-300`}>
      
      {/* 1. HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <p className={`${t.textMuted} text-xs`}>Selamat Datang,</p>
          <h2 className="text-lg font-bold">Panitia Haul</h2>
        </div>
        <Bell className={t.primary} size={20} />
      </header>

      {/* 2. KARTU SALDO */}
      <div className={`p-6 ${t.card} border rounded-3xl shadow-2xl`}>
        <p className={`${t.textMuted} text-sm`}>Total Kas Haul</p>
        <h1 className="text-3xl font-black mt-1">
          {stats.saldo < 0 ? `- Rp ${Math.abs(stats.saldo).toLocaleString('id-ID')}` : `Rp ${stats.saldo.toLocaleString('id-ID')}`}
        </h1>
        <div className="mt-6 flex gap-4 border-t border-slate-800/60 pt-4">
          <div className="flex-1 flex items-center gap-2">
            <ArrowUpCircle className="text-emerald-400" size={18} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Masuk</p>
              <p className="font-bold text-xs">Rp {stats.masuk.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <ArrowDownCircle className="text-rose-400" size={18} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Keluar</p>
              <p className="font-bold text-xs">Rp {stats.keluar.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROGRES TARGET ANGGARAN */}
      <div className={`p-4 ${t.card} border rounded-2xl`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Target size={16} className={t.primary} />
            <p className="text-xs font-bold text-slate-300">Progres Target</p>
          </div>
          <p className={`text-xs font-mono ${t.primary} font-bold`}>{progressPersen}%</p>
        </div>
        
        <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-slate-800/40">
          <div 
            className={`bg-gradient-to-r ${t.bar} h-full transition-all duration-300`}
            style={{ width: `${Math.min(progressPersen, 100)}%` }}
          ></div>
        </div>
        
        <div className={`flex justify-between items-center mt-2 text-[10px] ${t.textMuted}`}>
          <p>Terkumpul: <span className="text-emerald-400 font-bold">Rp {stats.masuk.toLocaleString('id-ID')}</span></p>
          <p>Target Plafon: <span className="text-slate-200 font-bold">Rp {totalAnggaran.toLocaleString('id-ID')}</span></p>
        </div>
      </div>

      {/* 4. RINCIAN KATEGORI */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <PieChart size={16} className={t.primary}/> Rincian
        </h2>
        {/* Menggunakan grid-cols-1 di HP dan grid-cols-2 di laptop agar tidak sempit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 ${t.card} border rounded-2xl`}>
            <p className="text-[10px] text-emerald-400 mb-2 uppercase font-bold">Masuk</p>
            {Object.entries(categories.in).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[11px] py-1 text-slate-300 border-b border-slate-900 last:border-0">
                <span>{k}</span>
                <span className="font-mono">Rp {v.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
          <div className={`p-4 ${t.card} border rounded-2xl`}>
            <p className="text-[10px] text-rose-400 mb-2 uppercase font-bold">Keluar</p>
            {Object.entries(categories.out).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[11px] py-1 text-slate-300 border-b border-slate-900 last:border-0">
                <span>{k}</span>
                <span className="font-mono">Rp {v.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. AKTIVITAS TERAKHIR */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold">Aktivitas Terakhir</h2>
        {transactions.map((tItem, i) => {
          const isPemasukan = tItem.type === 'in' || (tItem.type && tItem.type.toLowerCase().includes('pemasukan'));
          return (
            <div key={i} className={`flex justify-between items-center p-3 ${t.card} border rounded-xl`}>
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-bold truncate">{tItem.note || tItem.category}</p>
                <p className="text-[9px] text-slate-500">
                  {tItem.transaction_date ? new Date(tItem.transaction_date).toLocaleDateString('id-ID') : ''}
                </p>
              </div>
              <p className={`text-xs font-bold shrink-0 ${isPemasukan ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPemasukan ? '+' : '-'} Rp {(tItem.amount || 0).toLocaleString('id-ID')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
