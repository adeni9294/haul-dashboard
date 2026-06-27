'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('is_admin_haul') === 'true';
    setIsAdmin(loggedIn);
    loadHeaderSettings();
  }, [pathname]);

async function loadHeaderSettings() {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      // Tambahkan { cache: 'no-store' } jika perlu atau gunakan query yang memaksa fresh data
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'main_config');

      if (!error && data && data.length > 0) {
        const config = data[0];
        // ... (biarkan setting orgName, address, dll tetap ada)
        
        // SINKRONISASI TEMA dengan cara memaksa update state
        if (config.theme) {
          const themeMap = {
            'emerald-cyber': 'bg-zinc-950 text-emerald-100 selection:bg-emerald-500/20',
            'velvet-rose': 'bg-neutral-950 text-rose-100 selection:bg-rose-500/20',
            'neon-sunset': 'bg-stone-950 text-orange-100 selection:bg-orange-500/20',
            'amber-gold': 'bg-gray-950 text-amber-100 selection:bg-amber-gold/20',
            'slate-dark': 'bg-slate-950 text-slate-100 selection:bg-amber-500/30'
          };
          setThemeClass(themeMap[config.theme] || themeMap['slate-dark']);
        }
      }
    } catch (err) {
      console.error("Gagal memuat tema:", err);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
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
        
        {/* HEADER ATAS DENGAN KOP LOGO PANITIA */}
        <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 relative">
          <div className="p-4 md:p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-lg w-full relative">
            
            {/* Tombol Login/Logout */}
            <div className="absolute top-4 right-4 z-10">
              {isAdmin ? (
                <button onClick={handleLogout} className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-900 rounded-xl text-[11px] font-mono font-bold hover:bg-rose-900 hover:text-white transition-all">
                  🚪 Keluar Admin
                </button>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-mono font-bold text-amber-500 transition-all">
                  🔒 Login Admin
                </button>
              )}
            </div>

            {/* Logo Organisasi */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <div className="text-xs text-amber-500 font-mono">LOGO</div>}
            </div>
            
            {/* Teks Identitas */}
            <div className="text-center md:text-left space-y-1 flex-1 pr-16">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-sm md:text-base font-black text-amber-500 tracking-wide uppercase">{orgName}</h1>
                <span className={`w-fit px-2 py-0.5 text-[9px] rounded-md font-mono font-bold uppercase mx-auto md:mx-0 ${isAdmin ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {isAdmin ? '🟢 Admin' : '🔵 Publik'}
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed">{address}</p>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 mt-1">💳 {bankInfo}</p>
            </div>
          </div>
        </div>

        {/* NAVBAR UTAMA */}
        <div className="w-full max-w-7xl mx-auto px-4 pt-4">
          <nav className="flex items-center gap-1 bg-slate-900/40 border border-slate-800/80 p-1.5 rounded-2xl text-xs font-bold w-fit">
            <Link href="/" className={`px-4 py-2 rounded-xl transition-all ${pathname === '/' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}>📊 Dashboard</Link>
            <Link href="/transaksi" className={`px-4 py-2 rounded-xl transition-all ${pathname === '/transaksi' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}>💰 Transaksi</Link>
            <Link href="/anggaran" className={`px-4 py-2 rounded-xl transition-all ${pathname === '/anggaran' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}>📈 Anggaran</Link>
            <Link href="/acara" className={`px-4 py-2 rounded-xl transition-all ${pathname === '/acara' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}>📅 Acara</Link>
            <Link href="/kepanitiaan" className={`px-4 py-2 rounded-xl transition-all ${pathname === '/kepanitiaan' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}>👥 Panitia</Link>
            {isAdmin && (
              <Link href="/pengaturan" className={`px-4 py-2 rounded-xl transition-all ${pathname === '/pengaturan' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}>⚙️ Pengaturan</Link>
            )}
          </nav>
        </div>

        {/* HALAMAN KONTEN */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>

        {/* POPUP MODAL LOGIN */}
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
                  placeholder="Password Admin" 
                  required 
                  autoFocus
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none text-center font-mono tracking-widest"
                />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowLoginModal(false); setPasswordInput(''); }} className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl">Batal</button>
                  <button type="submit" className="flex-1 py-2 bg-amber-500 text-slate-950 text-xs font-black uppercase rounded-xl">Masuk</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
