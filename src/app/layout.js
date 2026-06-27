'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Cek status login saat halaman pertama kali dimuat
  useEffect(() => {
    const loggedIn = localStorage.getItem('is_admin_haul') === 'true';
    setIsAdmin(loggedIn);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Silakan ganti 'admin123' dengan password yang Anda inginkan
    if (passwordInput === 'admin123') {
      localStorage.setItem('is_admin_haul', 'true');
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput('');
      alert('Login Berhasil sebagai Admin!');
      window.location.reload();
    } else {
      alert('Password salah!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('is_admin_haul');
    setIsAdmin(false);
    alert('Keluar dari mode Admin.');
    window.location.reload();
  };

  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col selection:bg-amber-500/30">
        {/* TOP BAR / NAVIGATION */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🕋</span>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase text-white">Sistem Informasi Haul</h1>
              <p className="text-[10px] text-slate-500 font-mono">
                Status: {isAdmin ? <span className="text-amber-500 font-bold">🟢 ADMIN MODE</span> : <span className="text-emerald-400 font-bold">🔵 PUBLIC VIEW</span>}
              </p>
            </div>
          </div>

          {/* NAVBAR UTAMA */}
          <nav className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-xl text-xs font-bold">
            <Link href="/" className={`px-3 py-1.5 rounded-lg transition-all ${pathname === '/' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Transaksi</Link>
            <Link href="/anggaran" className={`px-3 py-1.5 rounded-lg transition-all ${pathname === '/anggaran' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Anggaran</Link>
            <Link href="/acara" className={`px-3 py-1.5 rounded-lg transition-all ${pathname === '/acara' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Acara</Link>
            <Link href="/kepanitiaan" className={`px-3 py-1.5 rounded-lg transition-all ${pathname === '/kepanitiaan' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Panitia</Link>
            
            {/* MENU PENGATURAN KEMBALI DISEDIAKAN (KHUSUS MODE ADMIN) */}
            {isAdmin && (
              <Link href="/pengaturan" className={`px-3 py-1.5 rounded-lg transition-all ${pathname === '/pengaturan' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                ⚙️ Pengaturan
              </Link>
            )}
          </nav>

          <div>
            {isAdmin ? (
              <button onClick={handleLogout} className="px-3 py-1.5 bg-rose-950 text-rose-400 border border-rose-900 rounded-xl text-xs font-bold hover:bg-rose-900 hover:text-white transition-all">
                Keluar Admin
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="px-3 py-1.5 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 hover:text-white transition-all">
                Login Admin
              </button>
            )}
          </div>
        </header>

        {/* MAIN CONTENT CONTAINER */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="py-4 border-t border-slate-900 text-center text-[11px] text-slate-600 font-mono">
          Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}
        </footer>

        {/* MODAL LOGIN POPUP */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl">
              <div className="text-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">🔒 Otorisasi Sistem</h3>
                <p className="text-xs text-slate-400 mt-1">Masukkan kata sandi untuk masuk ke Mode Admin</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input 
                  type="password" 
                  placeholder="Masukkan Password Admin" 
                  required 
                  autoFocus
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none text-center font-mono tracking-widest"
                />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowLoginModal(false); setPasswordInput(''); }} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase rounded-xl transition-all">
                    Masuk
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
