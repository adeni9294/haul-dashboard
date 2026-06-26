export default function Home() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
        Selamat Datang di Haul Dashboard
      </h2>
      <p className="text-gray-400 mb-6">
        Sistem manajemen infrastruktur administrasi digital Anda telah berjalan dengan baik.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="p-6 bg-gray-950 border border-gray-800 rounded-xl">
          <h3 className="font-semibold text-amber-500 mb-2">Database Terhubung</h3>
          <p className="text-sm text-gray-400">Silakan pilih salah satu menu di sebelah kiri untuk mengelola data tabel Supabase Anda.</p>
        </div>
        <div className="p-6 bg-gray-950 border border-gray-800 rounded-xl">
          <h3 className="font-semibold text-amber-500 mb-2">Struktur Menu Siap</h3>
          <p className="text-sm text-gray-400">Navigasi mencakup seluruh 6 tabel utama yang siap dikonfigurasikan.</p>
        </div>
      </div>
    </div>
  );
}