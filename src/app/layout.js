'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

const THEME_STYLES = {
  'emerald-cyber': { body: 'bg-zinc-950 text-emerald-100', card: 'bg-zinc-900 border-zinc-800 text-emerald-100', navBg: 'bg-zinc-900 border-zinc-800', innerBg: 'bg-zinc-950 border border-zinc-850', textMuted: 'text-zinc-500', accentText: 'text-emerald-400' },
  'velvet-rose': { body: 'bg-neutral-950 text-rose-100', card: 'bg-neutral-900 border-purple-950 text-rose-100', navBg: 'bg-purple-950 border-purple-900', innerBg: 'bg-purple-950 border border-purple-900/60', textMuted: 'text-purple-400', accentText: 'text-rose-400' },
  'neon-sunset': { body: 'bg-stone-950 text-orange-100', card: 'bg-stone-900 border-stone-800 text-orange-100', navBg: 'bg-stone-900 border-stone-800', innerBg: 'bg-stone-950 border border-stone-850', textMuted: 'text-stone-500', accentText: 'text-orange-400' },
  'amber-gold': { body: 'bg-gray-950 text-amber-100', card: 'bg-gray-900 border-gray-800 text-amber-100', navBg: 'bg-gray-900 border-gray-800', innerBg: 'bg-gray-950 border border-gray-850', textMuted: 'text-gray-500', accentText: 'text-amber-400' },
  'midnight-blue': { body: 'bg-slate-950 text-blue-100', card: 'bg-slate-900 border-blue-950 text-blue-100', navBg: 'bg-blue-950 border-blue-900', innerBg: 'bg-blue-950 border border-blue-900/40', textMuted: 'text-blue-400', accentText: 'text-blue-400' },
  'nordic-frost': { body: 'bg-slate-900 text-slate-100', card: 'bg-slate-800 border-slate-750 text-slate-100', navBg: 'bg-slate-800 border-slate-700', innerBg: 'bg-slate-900 border border-slate-750', textMuted: 'text-slate-400', accentText: 'text-cyan-400' },
  'dracula-vamp': { body: 'bg-neutral-950 text-purple-200', card: 'bg-zinc-900 border-fuchsia-950 text-purple-200', navBg: 'bg-neutral-900 border-fuchsia-950', innerBg: 'bg-black border border-fuchsia-950/60', textMuted: 'text-neutral-500', accentText: 'text-fuchsia-400' },
  'forest-moss': { body: 'bg-stone-950 text-stone-100', card: 'bg-stone-900 border-emerald-950 text-stone-100', navBg: 'bg-emerald-950 border-emerald-900', innerBg: 'bg-emerald-950 border border-emerald-900/40', textMuted: 'text-stone-400', accentText: 'text-green-400' },
  'cyberpunk-2077': { body: 'bg-zinc-950 text-yellow-400', card: 'bg-black border-yellow-500 text-yellow-400', navBg: 'bg-black border-yellow-500', innerBg: 'bg-zinc-950 border border-yellow-600/40', textMuted: 'text-yellow-600', accentText: 'text-yellow-400' },
  'ocean-breeze': { body: 'bg-teal-950 text-teal-100', card: 'bg-teal-900 border-teal-800 text-teal-100', navBg: 'bg-teal-900 border-teal-800', innerBg: 'bg-teal-950 border border-teal-850', textMuted: 'text-teal-400', accentText: 'text-cyan-300' },
  'rose-gold': { body: 'bg-stone-950 text-rose-200', card: 'bg-stone-900 border-rose-950 text-rose-200', navBg: 'bg-rose-950 border-rose-900/50', innerBg: 'bg-rose-950 border border-rose-900/40', textMuted: 'text-stone-500', accentText: 'text-rose-300' },
  'lavender-dream': { body: 'bg-neutral-950 text-indigo-200', card: 'bg-neutral-900 border-indigo-950 text-indigo-200', navBg: 'bg-indigo-950 border-indigo-900/50', innerBg: 'bg-indigo-950 border border-indigo-900/40', textMuted: 'text-neutral-500', accentText: 'text-indigo-400' },
  'coffee-latte': { body: 'bg-stone-950 text-amber-100', card: 'bg-stone-900 border-amber-950 text-amber-100', navBg: 'bg-amber-950 border-amber-900/40', innerBg: 'bg-amber-950 border border-amber-900/30', textMuted: 'text-stone-500', accentText: 'text-amber-500' },
  'toxic-lime': { body: 'bg-zinc-950 text-lime-400', card: 'bg-zinc-900 border-lime-950 text-lime-400', navBg: 'bg-zinc-900 border-lime-900', innerBg: 'bg-zinc-950 border border-lime-900/40', textMuted: 'text-zinc-600', accentText: 'text-lime-400' },
  'crimson-tide': { body: 'bg-neutral-950 text-red-200', card: 'bg-neutral-900 border-red-950 text-red-200', navBg: 'bg-red-950 border-red-900/50', innerBg: 'bg-red-950 border border-red-900/40', textMuted: 'text-neutral-500', accentText: 'text-red-400' },
  'solarized-dark': { body: 'bg-slate-950 text-teal-200', card: 'bg-slate-900 border-teal-950 text-teal-200', navBg: 'bg-slate-900 border-teal-950', innerBg: 'bg-slate-950 border border-teal-900/40', textMuted: 'text-slate-500', accentText: 'text-teal-400' },
  'default': { body: 'bg-slate-950 text-slate-100', card: 'bg-slate-900 border-slate-800 text-slate-100', navBg: 'bg-slate-900 border-slate-800', innerBg: 'bg-slate-950 border border-slate-800/60', textMuted: 'text-slate-400', accentText: 'text-amber-500' }
};

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false); // Modal info rekening
  const [showMainMenuDrawer, setShowMainMenuDrawer] = useState(false); // Tirai menu utama
  const [passwordInput, setPasswordInput] = useState('');
  
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => {
    checkAdminSession();
    loadHeaderSettings();
    setShowMainMenuDrawer(false); // Tutup drawer otomatis setiap ganti halaman
  }, [pathname]);

  async function checkAdminSession() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) {
      setIsAdmin(false);
      return;
    }
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      setIsAdmin(!!isValid);
    } catch (err) {
      setIsAdmin(false);
    }
  }

  async function loadHeaderSettings() {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      const { data } = await supabase.from('settings').select('*').eq('id', 'main_config');

      if (data && data.length > 0) {
        const config = data[0];
        if (config.org_name) setOrgName(config.org_name);
        if (config.address) setAddress(config.address);
        if (config.bank_info) setBankInfo(config.bank_info);
        if (config.logo_url) setLogoUrl(config.logo_url);
        if (config.theme && THEME_STYLES[config.theme]) setCurrentThemeKey(config.theme);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      const { data: isValid, error } = await supabase.rpc('verify_admin_password', { p_password: passwordInput });

      if (!error && isValid) {
        localStorage.setItem('admin_password_haul', passwordInput);
        setIsAdmin(true);
        setShowLoginModal(false);
        setPasswordInput('');
        alert('🟢 Login Berhasil!');
        window.location.reload();
      } else {
        alert('❌ Password salah!');
      }
    } catch (err) {
      alert('❌ Gagal terhubung ke server autentikasi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_password_haul');
    setIsAdmin(false);
    alert('🚪 Keluar dari mode Admin.');
    window.location.reload();
  };

  const currentStyle = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  // STRUKTUR TERBENTUK: Menu sekunder yang dimasukkan ke tirai Menu Utama (☰)
  const drawerMenus = [
    { name: '💰 Transaksi Kas', href: '/transaksi' },
    { name: '📅 Jadwal Acara', href: '/acara' },
    { name: '📸 Galeri Dokumentasi', href: '/dokumentasi' },
    { name: '👥 Kepanitiaan', href: '/kepanitiaan' },
    ...(isAdmin ? [{ name: '⚙️ Setelan Sistem', href: '/pengaturan' }] : [])
  ];

  return (
    <html lang="id" className={`${currentStyle.body} min-h-screen`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${currentStyle.body} font-['Poppins'] min-h-screen flex flex-col pb-24 sm:pb-6 transition-all duration-300 antialiased`}>
        
        <div className={`w-full min-h-screen ${currentStyle.body} flex flex-col`}>
          
          {/* HEADER ATAS MODERN */}
          <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 relative">
            <div className={`p-4 md:p-6 ${currentStyle.card} border rounded-2xl flex flex-row items-center gap-4 shadow-xl w-full relative`}>
              
              <div className={`w-12 h-12 md:w-16 md:h-16 ${currentStyle.innerBg} rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner`}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentStyle.accentText}><path d="M2 22h20"/><path d="M12 2v3"/><path d="M12 7a5 5 0 0 1 5 5v10H7V12a5 5 0 0 1 5-5z"/></svg>
                )}
              </div>
              
              <div className="text-left space-y-0.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xs md:text-sm font-bold text-white tracking-wide uppercase truncate max-w-[180px] sm:max-w-none">{orgName}</h1>
                  <span className={`px-1.5 py-0.5 text-[8px] rounded font-mono font-bold uppercase ${currentStyle.innerBg} ${currentStyle.accentText}`}>
                    {isAdmin ? 'ADMIN' : 'PUBLIC'}
                  </span>
                </div>
                <p className={`text-[10px] ${currentStyle.textMuted} truncate max-w-[240px] sm:max-w-none`}>{address}</p>
              </div>
            </div>
          </div>

          {/* AREA KONTEN HALAMAN */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">{children}</main>

          {/* FOOTER DESKTOP */}
          <footer className={`hidden sm:block py-4 border-t border-white/5 text-center text-[10px] ${currentStyle.textMuted} font-mono`}>
            Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}
          </footer>

          {/* BAR NAVIGASI BAWAH MODERN (FIXED 5 TOMBOL) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-black/80 to-transparent sm:p-4 sm:static sm:bg-none sm:w-full sm:max-w-7xl sm:mx-auto">
            <nav className={`grid grid-cols-5 items-center justify-between text-center ${currentStyle.navBg} border p-2 rounded-2xl text-[10px] font-bold w-full sm:w-max sm:mx-auto sm:gap-4 sm:px-6 shadow-2xl`}>
              
              {/* Menu 1: Dashboard */}
              <Link href="/" className={`flex flex-col items-center gap-1 py-1 rounded-xl transition-all ${pathname === '/' ? currentStyle.accentText : currentStyle.textMuted}`}>
                <span className="text-lg">🏠</span>
                <span className="text-[9px] sm:text-xs">Dashboard</span>
              </Link>

              {/* Menu 2: Statistik */}
              <Link href="/stat" className={`flex flex-col items-center gap-1 py-1 rounded-xl transition-all ${pathname === '/stat' ? currentStyle.accentText : currentStyle.textMuted}`}>
                <span className="text-lg">📊</span>
                <span className="text-[9px] sm:text-xs">Statistik</span>
              </Link>

              {/* Menu 3 (Tengah): Tombol (+) Hybrid */}
              <button 
                onClick={() => setShowDonationModal(true)}
                className="flex items-center justify-center mx-auto w-11 h-11 bg-lime-500 text-black rounded-full shadow-lg transform -translate-y-2 hover:scale-105 active:scale-95 transition-all text-xl font-black"
              >
                +
              </button>

              {/* Menu 4: Anggaran */}
              <Link href="/anggaran" className={`flex flex-col items-center gap-1 py-1 rounded-xl transition-all ${pathname === '/anggaran' ? currentStyle.accentText : currentStyle.textMuted}`}>
                <span className="text-lg">💰</span>
                <span className="text-[9px] sm:text-xs">Anggaran</span>
              </Link>

              {/* Menu 5: Menu Utama Tirai */}
              <button 
                onClick={() => setShowMainMenuDrawer(true)} 
                className={`flex flex-col items-center gap-1 py-1 rounded-xl transition-all ${showMainMenuDrawer ? currentStyle.accentText : currentStyle.textMuted}`}
              >
                <span className="text-lg">☰</span>
                <span className="text-[9px] sm:text-xs">Menu Utama</span>
              </button>

            </nav>
          </div>

        </div>

        {/* POP-UP MODAL: INFORMASI REKENING DONASI / TOMBOL (+) */}
        {showDonationModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className={`border ${currentStyle.navBg} p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl text-center`}>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">💳 Rekening Donasi Jemaah</h3>
              <p className={`text-xs ${currentStyle.textMuted}`}>Salurkan infak & sedekah jariyah Anda untuk kesuksesan agenda Haul melalui rekening resmi:</p>
              
              <div className={`p-4 ${currentStyle.innerBg} rounded-xl font-mono text-xs text-left whitespace-pre-line leading-relaxed text-lime-400`}>
                {bankInfo}
              </div>

              <div className="pt-2">
                <button onClick={() => setShowDonationModal(false)} className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all">Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* DRAWER TIRAI SLIDE-UP: MENU UTAMA (☰) */}
        {showMainMenuDrawer && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center transition-all animate-fade-in" onClick={() => setShowMainMenuDrawer(false)}>
            <div 
              className={`w-full max-w-md ${currentStyle.card} border-t rounded-t-3xl p-6 space-y-4 shadow-2xl transform transition-transform animate-slide-up`}
              onClick={(e) => e.stopPropagation()} // Mencegah tirai menutup saat area dalam diklik
            >
              <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-2" />
              <div className="text-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Navigasi Halaman</h4>
              </div>

              {/* LIST MENU TRANSISI KE HALAMAN LAIN */}
              <div className="grid grid-cols-1 gap-2 pt-2">
                {drawerMenus.map((dm) => (
                  <Link 
                    key={dm.href} 
                    href={dm.href} 
                    className={`w-full py-3 px-4 rounded-xl font-medium text-xs text-left flex justify-between items-center ${pathname === dm.href ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20' : `${currentStyle.innerBg} text-white hover:bg-zinc-800`}`}
                  >
                    <span>{dm.name}</span>
                    <span className="opacity-40">›</span>
                  </Link>
                ))}
              </div>

              {/* TOMBOL MODAL LOGIN / LOGOUT ADMIN DI DALAM DRAWER MENU */}
              <div className="pt-4 border-t border-zinc-800">
                {isAdmin ? (
                  <button onClick={() => { handleLogout(); setShowMainMenuDrawer(false); }} className="w-full py-3 bg-rose-950 text-rose-400 border border-rose-900 rounded-xl text-xs font-bold uppercase tracking-wide">
                    🚪 Keluar Mode Admin
                  </button>
                ) : (
                  <button onClick={() => { setShowLoginModal(true); setShowMainMenuDrawer(false); }} className="w-full py-3 bg-lime-500 text-black rounded-xl text-xs font-black uppercase tracking-wide shadow-md">
                    🔑 Otorisasi Login Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL LOGIN POPUP */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className={`border ${currentStyle.navBg} p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl`}>
              <div className="text-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">🔒 Otorisasi Sistem</h3>
                <p className={`text-xs ${currentStyle.textMuted} mt-1`}>Masukkan kata sandi untuk masuk ke Mode Admin</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="password" placeholder="Password Admin" required autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full px-3 py-2 ${currentStyle.innerBg} rounded-xl text-xs text-white focus:outline-none text-center font-mono tracking-widest`} />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowLoginModal(false); setPasswordInput(''); }} className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl">Batal</button>
                  <button type="submit" className="flex-1 py-2 bg-lime-500 text-black text-xs font-black uppercase rounded-xl">Masuk</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
