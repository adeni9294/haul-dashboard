'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

// PEMETAAN WARNA TEMA UNTUK KOTAK DAN LATAR BELAKANG GLOBAL
const THEME_STYLES = {
  'emerald-cyber': {
    body: 'bg-zinc-950 text-emerald-100 selection:bg-emerald-500/20',
    card: 'bg-zinc-900 border-zinc-800 text-emerald-100',
    navBg: 'bg-zinc-900/95 border-zinc-800/80 backdrop-blur-md',
    innerBg: 'bg-zinc-950',
    textMuted: 'text-zinc-400',
    accentText: 'text-emerald-400'
  },
  'velvet-rose': {
    body: 'bg-neutral-950 text-rose-100 selection:bg-rose-500/20',
    card: 'bg-neutral-900 border-neutral-800 text-rose-100',
    navBg: 'bg-purple-950/90 border-purple-900/60 backdrop-blur-md',
    innerBg: 'bg-neutral-950',
    textMuted: 'text-neutral-400',
    accentText: 'text-rose-400'
  },
  'neon-sunset': {
    body: 'bg-stone-950 text-orange-100 selection:bg-orange-500/20',
    card: 'bg-stone-900 border-stone-800 text-orange-100',
    navBg: 'bg-stone-900/95 border-stone-800/80 backdrop-blur-md',
    innerBg: 'bg-stone-950',
    textMuted: 'text-stone-400',
    accentText: 'text-orange-400'
  },
  'amber-gold': {
    body: 'bg-gray-950 text-amber-100 selection:bg-amber-500/20',
    card: 'bg-gray-900 border-gray-800 text-amber-100',
    navBg: 'bg-gray-900/95 border-gray-800/80 backdrop-blur-md',
    innerBg: 'bg-gray-950',
    textMuted: 'text-gray-400',
    accentText: 'text-amber-400'
  },
  'default': {
    body: 'bg-slate-950 text-slate-100 selection:bg-amber-500/30',
    card: 'bg-slate-900 border-slate-800 text-slate-100',
    navBg: 'bg-slate-900/95 border-slate-800/80 backdrop-blur-md',
    innerBg: 'bg-slate-950',
    textMuted: 'text-slate-400',
    accentText: 'text-amber-500'
  }
};

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => {
    const loggedIn = localStorage.getItem('is_admin_haul') === 'true';
    setIsAdmin(loggedIn);
    loadHeaderSettings();
  }, [pathname]);

  async function loadHeaderSettings() {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'main_config');

      if (!error && data && data.length > 0) {
        const config = data[0];
        if (config.org_name) setOrgName(config.org_name);
        if (config.address) setAddress(config.address);
        if (config.bank_info) setBankInfo(config.bank_info);
        if (config.logo_url) setLogoUrl(config.logo_url);
        
        if (config.theme && THEME_STYLES[config.theme]) {
          setCurrentThemeKey(config.theme);
        }
      }
    } catch (err) {
      console.error(err);
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

  const currentStyle = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  // Array data menu navigasi agar tidak berulang
  const menus = [
    { name: '📊 Dashboard', href: '/' },
    { name: '💰 Transaksi', href: '/transaksi' },
    { name: '📈 Anggaran', href: '/anggaran' },
    { name: '📅 Acara', href: '/acara' },
    { name: '👥 Panitia', href: '/kepanitiaan' },
    ...(isAdmin ? [{ name: '⚙️ Setelan', href: '/pengaturan' }] : [])
  ];

  return (
    <html lang="id">
      <body className={`${currentStyle.body} font-sans min-h-screen flex flex-col pb-28 sm:pb-6 transition-all duration-300`}>
        
        {/* HEADER ATAS */}
        <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 relative">
          <div className={`p-4 md:p-6 ${currentStyle.card} border backdrop-blur-sm rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-lg w-full relative`}>
            
            <div className="absolute top-4 right-4 z-10">
              {isAdmin ? (
                <button onClick={handleLogout} className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-900 rounded-xl text-[11px] font-mono font-bold hover:bg-rose-900 hover:text-white transition-all">
                  🚪 Keluar Admin
                </button>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className={`px-3 py-1 ${currentStyle.innerBg} border border-slate-800/40 rounded-xl text-[11px] font-mono font-bold ${currentStyle.accentText} transition-all`}>
                  🔒 Login Admin
                </button>
              )}
            </div>

            <div className={`w-16 h-16 md:w-20 md:h-20 ${currentStyle.innerBg} rounded-full border border-slate-800/40 flex items-center justify-center overflow-hidden shrink-0 shadow-inner`}>
              {logoUrl ? <img src={logoUrl} alt="Logo Organisasi" className="w-full h-full object-cover" /> : <div className="text-[10px] text-slate-600 font-mono">NO LOGO</div>}
            </div>
            
            <div className="text-center md:text-left space-y-1 flex-1 pr-0 md:pr-16">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className={`text-sm md:text-base font-black ${currentStyle.accentText} tracking-wide uppercase`}>{orgName}</h1>
                <span className={`w-fit px-2 py-0.5 text-[9px] rounded-md font-mono font-bold uppercase mx-auto md:mx-0 ${currentStyle.innerBg} border border-slate-800/60 ${currentStyle.textMuted}`}>
                  {isAdmin ? '🟢 Admin Mode' : '🔵 Public View'}
                </span>
              </div>
              <p className={`text-[10px] md:text-xs ${currentStyle.textMuted} leading-relaxed`}>{address}</p>
              <p className={`text-[9px] md:text-[10px] ${currentStyle.textMuted} font-mono pt-1 border-t border-slate-800/40 mt-1`}>💳 {bankInfo}</p>
            </div>
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>

        {/* FOOTER */}
        <footer className={`py-4 mb-20 sm:mb-0 border-t border-slate-800/20 text-center text-[11px] ${currentStyle.textMuted} font-mono`}>
          Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}
        </footer>

        {/* NAVIGASI MENU (DIBAWAH UNTUK HP, DIATAS UNTUK PCSecara Otomatis) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-0 sm:static sm:w-full sm:max-w-7xl sm:mx-auto sm:px-4 sm:mb-4">
          <nav className={`grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 ${currentStyle.navBg} border p-2 rounded-2xl text-[11px] sm:text-xs font-bold w-full sm:w-fit shadow-2xl sm:shadow-none text-center`}>
            {menus.map((m) => (
              <Link 
                key={m.href} 
                href={m.href} 
                className={`py-2 px-1 sm:px-4 rounded-xl transition-all truncate ${
                  pathname === m.href 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                    : `${currentStyle.textMuted} hover:text-white`
                }`}
              >
                {m.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* MODAL LOGIN POPUP */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`border ${currentStyle.navBg} p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl`}>
              <div className="text-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">🔒 Otorisasi Sistem</h3>
                <p className={`text-xs ${currentStyle.textMuted} mt-1`}>Masukkan kata sandi untuk masuk ke Mode Admin</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="password" placeholder="Password Admin" required autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full px-3 py-2 ${currentStyle.innerBg} border border-slate-800 rounded-xl text-xs text-white focus:outline-none text-center font-mono tracking-widest`} />
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
