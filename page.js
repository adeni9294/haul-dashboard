'use client';
export default function Dashboard() {
  // Simulasi Data Terintegrasi (Nanti ditarik otomatis dari Supabase)
  const dashboardData = {
    pemasukan: 45000000,
    pengeluaran: 21500000,
    saldo: 23500000,
    targetNominal: 50000000,
    progresPersen: 90
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Baris Atas: Ringkasan Finansial Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pemasukan</p>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">Rp {dashboardData.pemasukan.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/20 text-6xl font-bold select-none">📈</div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden group hover:border-red-500/30 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pengeluaran</p>
          <p className="text-2xl font-black text-red-400 mt-2 font-mono">Rp {dashboardData.pengeluaran.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/20 text-6xl font-bold select-none">📉</div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sisa Saldo Akhir</p>
          <p className="text-2xl font-black text-amber-400 mt-2 font-mono">Rp {dashboardData.saldo.toLocaleString('id-ID')}</p>
          <div className="absolute -right-2 -bottom-2 text-slate-800/20 text-6xl font-bold select-none">💰</div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Target Capaian</span>
            <span className="text-blue-400 font-mono font-bold text-sm">{dashboardData.progresPersen}%</span>
          </div>
          <p className="text-lg font-black text-white mt-1.5 font-mono">Rp {dashboardData.targetNominal.toLocaleString('id-ID')}</p>
          <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 overflow-hidden border border-slate-800/50">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${dashboardData.progresPersen}%` }}></div>
          </div>
        </div>
      </div>

      {/* Baris Kedua: Pemisahan Detil Indikator Berdasarkan Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">📍 Rincian Pemasukan</h3>
          <div className="space-y-2 font-mono text-xs text-slate-300">
            <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-lg"><span>Iuran Warga Cibogo Kidul</span><span className="font-bold text-emerald-400">Rp 25.000.000</span></div>
            <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-lg"><span>Iuran Luar Cibogo Kidul</span><span className="font-bold text-emerald-400">Rp 10.000.000</span></div>
            <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-lg"><span>Donatur Khitanan Massal</span><span className="font-bold text-emerald-400">Rp 10.000.000</span></div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">📍 Rincian Pengeluaran</h3>
          <div className="space-y-2 font-mono text-xs text-slate-300">
            <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-lg"><span>Logistik & Perlengkapan</span><span className="font-bold text-red-400">Rp 12.000.000</span></div>
            <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-lg"><span>Konsumsi Pengunjung</span><span className="font-bold text-red-400">Rp 6.500.000</span></div>
            <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-lg"><span>Khitanan Massal (Medis)</span><span className="font-bold text-red-400">Rp 3.000.000</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}