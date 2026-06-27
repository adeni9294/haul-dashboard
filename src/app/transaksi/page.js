'use client';

export default function TransaksiPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Pencatatan Transaksi Keuangan</h2>
          <p className="text-xs text-slate-400">Arus keluar masuk kas Panitia Haul.</p>
        </div>
        <button className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:bg-amber-400 transition-all">
          + Tambah Transaksi (Admin)
        </button>
      </div>

      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl min-h-[150px] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Riwayat Kas Arus Transaksi</h3>
          <button className="text-xs text-amber-500 font-mono border border-amber-500/30 px-3 py-1 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 transition-all">
            🖨️ Cetak Laporan LPJ Profesional
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center my-auto">Belum ada data transaksi keuangan yang tercatat.</p>
      </div>
    </div>
  );
}
