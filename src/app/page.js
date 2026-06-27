'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMasuk: 0, totalKeluar: 0, saldo: 0 });
  const [announcement, setAnnouncement] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    async function loadDashboardData() {
      if (!supabaseUrl || !supabaseKey) return;
      try {
        setLoading(true);

        // 1. Ambil data konfigurasi pengumuman & tema utama
        const { data: configData } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'main_config')
          .single();
        
        if (configData) {
          setAnnouncement(configData.announcement || 'Selamat Datang di Sistem Informasi Keuangan Panitia Haul Maqbaroh.');
          if (configData.theme) {
            document.body.className = `theme-${configData.theme} bg-slate-950 text-slate-100 min-h-screen antialiased`;
          }
        }

        // 2. Ambil data transaksi kas untuk menghitung total saldo secara live
        const { data: trxData } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (trxData) {
          let masuk = 0;
          let keluar = 0;
          trxData.forEach(t => {
            if (t.type === 'masuk') masuk += Number(t.amount || 0);
            if (t.type === 'keluar') keluar += Number(t.amount || 0);
          });
          setStats({ totalMasuk: masuk, totalKeluar: keluar, saldo: masuk - keluar });
          setRecentTransactions(trxData.slice(0, 5)); // Ambil 5 transaksi terbaru saja untuk ringkasan
        }

      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xs font-mono text-slate-400 animate-pulse">⏳ Memuat data statistik panitia...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BAGIAN JUDUL UTAMA */}
      <div>
        <h2 className="text-xl font-bold text-white">📊 Dashboard Ringkasan Panitia</h2>
        <p className="text-xs text-slate-400">Pantau pergerakan anggaran, total saldo masuk/keluar, dan info aktual panitia.</p>
      </div>

      {/* BANNER PENGUMUMAN DINAMIS */}
      {announcement && (
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">📢 Pengumuman Internal</h4>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{announcement}</p>
        </div>
      )}

      {/* 3 KARTU INFORMASI UTAMA (SALDO, MASUK, KELUAR) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KARTU SALDO UTAMA */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-sm relative">
          <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1">💰 Sisa Saldo Kas Utama</p>
          <h3 className="text-xl font-black text-white font-mono">{formatRupiah(stats.saldo)}</h3>
          <div className="absolute top-4 right-4 text-xl opacity-20">💳</div>
        </div>

        {/* KARTU TOTAL MASUK */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">📈 Total Dana Masuk</p>
          <h3 className="text-lg font-bold text-emerald-400 font-mono">{formatRupiah(stats.totalMasuk)}</h3>
        </div>

        {/* KARTU TOTAL KELUAR */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider mb-1">📉 Total Dana Keluar</p>
          <h3 className="text-lg font-bold text-rose-400 font-mono">{formatRupiah(stats.totalKeluar)}</h3>
        </div>
      </div>

      {/* TABEL RINGKASAN AKTIVITAS TERBARU */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">⏱️ 5 Transaksi Buku Kas Terakhir</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="pb-2 font-semibold">Keterangan / Pos</th>
                <th className="pb-2 font-semibold">Tipe</th>
                <th className="pb-2 font-semibold text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-slate-500 font-mono text-[11px]">Belum ada riwayat transaksi kas masuk atau keluar.</td>
                </tr>
              ) : (
                recentTransactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/40">
                    <td className="py-2.5 font-medium text-slate-300">
                      <div>{t.description}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{t.category || 'Umum'}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${t.type === 'masuk' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type === 'masuk' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className={`py-2.5 text-right font-mono font-bold ${t.type === 'masuk' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'masuk' ? '+' : '-'}{formatRupiah(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
