'use client';

export default function KepanitiaanPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Susunan Kepanitiaan Haul</h2>
          <p className="text-xs text-slate-400">Struktur organisasi Panitia Haul Maqbaroh Buyut Kepuh & Buyut Besus.</p>
        </div>
        <button className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:bg-amber-400 transition-all">
          + Edit Pengurus (Admin)
        </button>
      </div>

      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl min-h-[150px] flex items-center justify-center">
        <p className="text-xs text-slate-500 text-center">Data susunan panitia belum dimasukkan.</p>
      </div>
    </div>
  );
}
