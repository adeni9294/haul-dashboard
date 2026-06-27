'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMasuk: 0, totalKeluar: 0, saldo: 0 });
  const [targetAnggaran, setTargetAnggaran] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  const [pemasukanKategori, setPemasukanKategori] = useState([]);
  const [pengeluaranKategori, setPengeluaranKategori] = useState([]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    async function loadDashboardData() {
      if (!supabaseUrl || !supabaseKey) return;
      try {
        setLoading(true);

        // 1. Ambil data konfigurasi pengumuman halaman utama
        const { data: configData, error: configError } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'main_config');

        setAnnouncement('Selamat Datang di Sistem Informasi Keuangan Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus.');

        if (!configError && configData && configData.length > 0) {
          const config = configData[0];
          if (config.announcement) setAnnouncement(config.announcement);
        }

        // 2. Ambil data target plafon anggaran dari tabel budgets
        const { data: budgetData } = await supabase
          .from('budgets')
          .select('planned_amount');

        let totalTarget = 0;
        if (budgetData) {
          budgetData.forEach(b => {
            totalTarget += Number(b.planned_amount || 0);
          });
        }
        setTargetAnggaran(totalTarget);

        // 3. Ambil data transaksi kas untuk kalkulasi widget
        const { data: trxData } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (trxData) {
          let masuk = 0;
          let keluar = 0;
          let mapMasuk = {};
          let mapKeluar = {};

          trxData.forEach(t => {
            const nominal = Number(t.amount || 0);
            const tipeKas = String(t.type || '').toLowerCase().trim();
            const kategori = t.category || 'Umum';
            
            if (tipeKas === 'pemasukan' || tipeKas === 'masuk') {
              masuk += nominal;
              mapMasuk[kategori] = (mapMasuk[kategori] || 0) + nominal;
            } else if (tipeKas === 'pengeluaran' || tipeKas === 'keluar') {
              keluar += nominal;
              mapKeluar[kategori] = (mapKeluar[kategori] || 0) + nominal;
            }
          });

          setStats({ totalMasuk: masuk, totalKeluar: keluar, saldo: masuk - keluar });
          
          setPemasukanKategori(Object.entries(mapMasuk).map(([category, amount]) => ({ category, amount })));
          setPengeluaranKategori(Object.entries(mapKeluar).map(([category, amount]) => ({ category, amount })));
          setRecentTransactions(trxData.slice(0, 5));
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
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
  };

  const persentaseProgres = targetAnggaran > 0 ? Math.min(Math.round((stats.totalMasuk / targetAnggaran) * 100), 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xs font-mono text-slate-400 animate-pulse">⏳ Menyusun ulang ringkasan papan kendali utama...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* JUDUL */}
      <div>
        <h2 className="text-xl font-bold text-white">📊 Dashboard Ringkasan Panitia</h2>
        <p className="text-xs text-slate-400">Pantau pergerakan anggaran, total saldo masuk/keluar, dan info aktual panitia.</p>
      </div>

      {/* PENGUMUMAN */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">📢 Pengumuman Internal</h4>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{announcement}</p>
      </div>

      {/* 4 KARTU RINGKASAN UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-sm relative">
          <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1">💰 Sisa Saldo Kas Utama</p>
          <h3 className="text-lg font-black text-white font-mono">{formatRupiah(stats.saldo)}</h3>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">📈 Total Dana Masuk</p>
          <h3 className="text-lg font-bold text-emerald-400 font-mono">{formatRupiah(stats.totalMasuk)}</h3>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider mb-1">📉 Total Dana Keluar</p>
          <h3 className="text-lg font-bold text-rose-400 font-mono">{formatRupiah(stats.totalKeluar)}</h3>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">🎯 Progres Target</p>
            <span className="text-xs font-mono font-black text-amber-500">{persentaseProgres}%</span>
          </div>
          <h3 className="text-lg font-bold text-white font-mono">{formatRupiah(targetAnggaran)}</h3>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${persentaseProgres}%` }}></div>
          </div>
        </div>
      </div>

      {/* SEKSI: RINCIAN SINKRON PER KATEGORI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PEMASUKAN */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">📥 Rincian Pemasukan per Kategori</h3>
          {pemasukanKategori.length > 0 ? (
            <div className="space-y-2">
              {pemasukanKategori.map((pk, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/40 rounded-xl text-xs font-mono">
                  <span className="text-slate-300 font-medium text-[11px] truncate max-w-[200px]">🏷️ {pk.category}</span>
                  <span className="text-emerald-400 font-bold">{formatRupiah(pk.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">Belum ada rincian dana masuk yang tercatat.</p>
          )}
        </div>

        {/* PENGELUARAN */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">📤 Rincian Pengeluaran per Kategori</h3>
          {pengeluaranKategori.length > 0 ? (
            <div className="space-y-2">
              {pengeluaranKategori.map((pk, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/40 rounded-xl text-xs font-mono">
                  <span className="text-slate-300 font-medium text-[11px] truncate max-w-[200px]">📦 {pk.category}</span>
                  <span className="text-rose-400 font-bold">{formatRupiah(pk.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">Belum ada rincian dana keluar yang tercatat.</p>
          )}
        </div>

      </div>

      {/* TABEL MUTASI JALUR KAS TERAKHIR */}
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
                recentTransactions.map((t, idx) => {
                  const isPemasukan = String(t.type).toLowerCase() === 'pemasukan' || String(t.type).toLowerCase() === 'masuk';
                  const teksCatatan = t.description || t.note || 'Tanpa Catatan';
                  return (
                    <tr key={idx} className="hover:bg-slate-950/40">
                      <td className="py-2.5 font-medium text-slate-300">
                        <div>{teksCatatan}</div>
                        <span className="text-[10px] text-slate-500 font-mono">{t.category || 'Umum'}</span>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${isPemasukan ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {isPemasukan ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className={`py-2.5 text-right font-mono font-bold ${isPemasukan ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPemasukan ? '+' : '-'}{formatRupiah(t.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
