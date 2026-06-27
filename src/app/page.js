'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  // 1. Data Finansial Utama (Nanti otomatis ditarik dari kalkulasi database tabel transaksi)
  const [keuangan, setKeuangan] = useState({
    pemasukan: 38500000,
    pengeluaran: 14200000,
    targetNominal: 50000000,
  });

  // 2. Data Rincian per Kategori sesuai spesifikasi panitia
  const rincianPemasukan = [
    { nama: 'Iuran Warga Cibogo Kidul', jumlah: 20000000 },
    { nama: 'Iuran Warga Luar Cibogo Kidul', jumlah: 8500000 },
    { nama: 'Perantauan (Ahli Waris)', list: true, jumlah: 5000000 },
    { nama: 'Donatur Khitanan Massal', jumlah: 5000000 },
  ];

  const rincianPengeluaran = [
    { nama: 'Logistik & Perlengkapan', jumlah: 6000000 },
    { nama: 'Konsumsi Pengunjung', jumlah: 4500000 },
    { nama: 'Khitanan Massal (Medis)', jumlah: 2500000 },
    { nama: 'Administrasi & Pubdekdok', jumlah: 1200000 },
  ];

  // Hitung Sisa Saldo & Persentase Progres Target
  const sisaSaldo = keuangan.pemasukan - keuangan.pengeluaran;
  const progresPersen = Math.min(Math.round((keuangan.pemasukan / keuangan.targetNominal) * 100), 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: RINGKASAN KARTU UTAMA (MODERN & ELEGAN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KARTU PEMASUKAN */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden hover:border-emerald-500/30 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pemasukan</p>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">Rp {keuangan.pemasukan.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/10 text-6xl font-bold select-none">📈</div>
        </div>

        {/* KARTU PENGELUARAN */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden hover:border-red-500/30 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pengeluaran</p>
          <p className="text-2xl font-black text-red-400 mt-2 font-mono">Rp {keuangan.pengeluaran.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/10 text-6xl font-bold select-none">📉</div>
        </div>

        {/* KARTU SALDO AKHIR */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden hover:border-amber-500/30 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sisa Saldo Akhir</p>
          <p className="text-2xl font-black text-amber-400 mt-2 font-mono">Rp {sisaSaldo.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/10 text-6xl font-bold select-none">💰</div>
        </div>

        {/* KARTU PROGRESS TARGET */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Progres Target</span>
            <span className="text-blue-400 font-mono font-bold text-sm">{progresPersen}%</span>
          </div>
          <p className="text-lg font-black text-white mt-1.5 font-mono">Rp {keuangan.targetNominal.toLocaleString('id-ID')}</p>
          <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 overflow-hidden border border-slate-800/50">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progresPersen}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DETAIL DATA RINCIAN BY KATEGORI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RINCIAN INDIKATOR PEMASUKAN */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-md">
          <div className="border-b border-slate-800/60 pb-3 mb-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">📥 Rincian Kategori Pemasukan</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-mono">Aktif</span>
          </div>
          <div className="space-y-2 font-mono text-xs">
            {rincianPemasukan.map((item, index) => (
              <div key={index} className="flex justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl hover:bg-slate-950/80 transition-all">
                <span className="text-slate-300">{item.nama}</span>
                <span className="font-bold text-emerald-400">Rp {item.jumlah.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RINCIAN INDIKATOR PENGELUARAN */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-md">
          <div className="border-b border-slate-800/60 pb-3 mb-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">📤 Rincian Kategori Pengeluaran</h3>
            <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md font-mono">Aktif</span>
          </div>
          <div className="space-y-2 font-mono text-xs">
            {rincianPengeluaran.map((item, index) => (
              <div key={index} className="flex justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl hover:bg-slate-950/80 transition-all">
                <span className="text-slate-300">{item.nama}</span>
                <span className="font-bold text-red-400">Rp {item.jumlah.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
