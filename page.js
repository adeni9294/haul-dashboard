export default function Home() {
  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-white mb-2">
        Selamat Datang di Haul Dashboard
      </h2>
      <p className="text-sm text-neutral-400 leading-relaxed">
        Struktur navigasi utama untuk manajemen administrasi digital Anda telah berhasil diaktifkan. Silakan pilih salah satu menu di panel sebelah kiri untuk mulai mengelola tabel data.
      </p>
      
      <div className="mt-6 p-4 rounded-xl bg-black/40 border border-gray-900 text-xs text-neutral-500">
        💡 Kueri basis data dinamis dapat dikonfigurasikan pada masing-masing sub-halaman menu di atas.
      </div>
    </div>
  );
}