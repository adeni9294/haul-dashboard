'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Bell, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Logika pengambilan data tetap sama agar fitur tidak malfungsi
    const { data: trans } = await supabase.from('transactions').select('amount, type');
    let m = 0, k = 0;
    trans?.forEach(t => t.type === 'in' ? m += t.amount : k += t.amount);
    setStats({ masuk: m, keluar: k, saldo: m - k });

    const { data: set } = await supabase.from('settings').select('announcement').eq('id', 'main_config').single();
    if (set) setAnnouncement(set.announcement);
  }

  return (
    <div className="space-y-6 pb-24 px-4 pt-4">
      
      {/* 1. HEADER (Profil & Notifikasi) */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-xs">Selamat Datang,</p>
          <h2 className="text-lg font-bold text-white">Panitia Haul</h2>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-full text-amber-500">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* 2. KARTU SALDO (Tampilan Modern) */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <p className="text-slate-400 text-sm font-medium">Total Kas Haul</p>
        <h1 className="text-3xl font-black text-white mt-1">Rp {stats.saldo.toLocaleString()}</h1>
        
        <div className="mt-6 flex gap-4 border-t border-slate-800 pt-4">
          <div className="flex-1 flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><ArrowUpCircle className="text-emerald-400" size={18} /></div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Masuk</p>
              <p className="font-bold text-white text-xs">Rp {stats.masuk.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 rounded-lg"><ArrowDownCircle className="text-rose-400" size={18} /></div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Keluar</p>
              <p className="font-bold text-white text-xs">Rp {stats.keluar.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PENGUMUMAN (Opsional) */}
      {announcement && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
          <p className="text-xs text-amber-100/70">{announcement}</p>
        </div>
      )}

      {/* 4. TEMPAT KONTEN LAMA (Fungsi tidak berubah) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200">Aktivitas Terakhir</h2>
        {/* Tempatkan komponen tabel atau list transaksi lama Anda di bawah sini */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 text-center">Data transaksi akan muncul di sini.</p>
        </div>
      </div>
    </div>
  );
}
