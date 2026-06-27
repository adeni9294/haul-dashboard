'use client';

export default function PengaturanPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white">⚙️ Pengaturan Sistem Admin</h2>
        <p className="text-xs text-slate-400">Konfigurasi target, tema antarmuka, cloud logo, kategori default, dan akun admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Konten pengaturan akan diintegrasikan di sini */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-amber-500 mb-3">Target & Rekening</h3>
          <p className="text-xs text-slate-500">Form setup target nominal dan 3 rekening donasi dasbor.</p>
        </div>
        
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-amber-500 mb-3">Cloud Logo & Tema</h3>
          <p className="text-xs text-slate-500">Pilihan 10 tema elegan dan upload logo ke Supabase Storage.</p>
        </div>
      </div>

      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-end">
        <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all">
          💾 Simpan Semua Pengaturan
        </button>
      </div>
    </div>
  );
}
