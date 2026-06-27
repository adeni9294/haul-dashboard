'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client secara aman di sisi klien
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [targetNominal, setTargetNominal] = useState(50000000); // Nilai default bawaan
  const [ringkasan, setRingkasan] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0
  });
  
  const [rincianPemasukan, setRincianPemasukan] = useState([]);
  const [rincianPengeluaran, setRincianPengeluaran] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. Ambil Pengaturan Target Nominal dari tabel settings jika ada
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'target_nominal')
          .single();
        
        if (settingsData) {
          setTargetNominal(Number(settingsData.value));
        }

        // 2. Ambil Semua Data Transaksi untuk Kalkulasi Keuangan Realtime
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('amount, type, category');

        if (error) throw error;

        if (transactions) {
          let totalMasuk = 0;
          let totalKeluar = 0;
          
          // Map untuk menampung penjumlahan per kategori secara dinamis
          const mapMasuk = {};
          const mapKeluar = {};

          transactions.forEach((tx) => {
            const nominal = Number(tx.amount);
            // Validasi jenis tipe transaksi: 'pemasukan' atau 'pengeluaran'
            if (tx.type === 'pemasukan') {
              totalMasuk += nominal;
              mapMasuk[tx.category] = (mapMasuk[tx.category] || 0) + nominal;
            } else if (tx.type === 'pengeluaran') {
              totalKeluar += nominal;
              mapKeluar[tx.category] = (mapKeluar[tx.category] || 0) + nominal;
            }
          });

          setRingkasan({
            pemasukan: totalMasuk,
            pengeluaran: totalKeluar,
            saldo: totalMasuk - totalKeluar
          });

          // Ubah hasil pengelompokan map objek menjadi bentuk Array agar bisa di-render (.map)
          setRincianPemasukan(
            Object.keys(mapMasuk).map(key => ({ nama: key, jumlah: mapMasuk[key] }))
          );
          setRincianPengeluaran(
            Object.keys(mapKeluar).map(key => ({ nama: key, jumlah: mapKeluar[key] }))
          );
        }

      } catch (err) {
        console.error('Gagal mengambil kueri data dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Hitung persentase progres target secara realtime
  const progresPersen = targetNominal > 0 
    ? Math.min(Math.round((ringkasan.pemasukan / targetNominal) * 100), 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono">Menghubungkan ke Cloud Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: INDIKATOR KARTU FINANSIAL REALTIME */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pemasukan</p>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">Rp {ringkasan.pemasukan.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/10 text-6xl font-bold select-none">📈</div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pengeluaran</p>
          <p className="text-2xl font-black text-red-400 mt-2 font-mono">Rp {ringkasan.pengeluaran.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/10 text-6xl font-bold select-none">📉</div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sisa Saldo Akhir</p>
          <p className="text-2xl font-black text-amber-400 mt-2 font-mono">Rp {ringkasan.saldo.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/10 text-6xl font-bold select-none">💰</div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Progres Target</span>
            <span className="text-blue-400 font-mono font-bold text-sm">{progresPersen}%</span>
          </div>
          <p className="text-lg font-black text-white mt-1.5 font-mono">Rp {targetNominal.toLocaleString('id-ID')}</p>
          <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 overflow-hidden border border-slate-800/50">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full" style={{ width: `${progresPersen}%` }}></div>
          </div>
        </div>
      </div>

      {/* SECTION 2: GRAFIK RINCIAN SINKRON OTOMATIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KATEGORI PEMASUKAN */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">📥 Rincian Aktual Pemasukan</h3>
          {rincianPemasukan.length > 0 ? (
            <div className="space-y-2 font-mono text-xs">
              {rincianPemasukan.map((item, i) => (
                <div key={i} className="flex justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <span className="text-slate-300">{item.nama}</span>
                  <span className="font-bold text-emerald-400">Rp {item.jumlah.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">Belum ada data masuk dari database Supabase.</p>
          )}
        </div>

        {/* KATEGORI PENGELUARAN */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">📤 Rincian Aktual Pengeluaran</h3>
          {rincianPengeluaran.length > 0 ? (
            <div className="space-y-2 font-mono text-xs">
              {rincianPengeluaran.map((item, i) => (
                <div key={i} className="flex justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <span className="text-slate-300">{item.nama}</span>
                  <span className="font-bold text-red-400">Rp {item.jumlah.toLocaleString('id-ID')}</span>
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
