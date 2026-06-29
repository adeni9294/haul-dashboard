'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

// KUNCI UTAMA: Warna background dasar (body) harus solid & pekat agar tidak tembus warna browser HP
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
  const [passwordInput, setPasswordInput] = useState('');
  
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => {
    checkAdminSession();
    loadHeaderSettings();
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

  const menus = [
    { name: '📊 Dashboard', href: '/' },
    { name: '💰 Transaksi', href: '/transaksi' },
    { name: '📈 Anggaran', href: '/anggaran' },
    { name: '📅 Acara', href: '/acara' },
    { name: '👥 Panitia', href: '/kepanitiaan' },
    ...(isAdmin ? [{ name: '⚙️ Setelan', href: '/pengaturan' }] : [])
  ];

  return (
    // PERBAIKAN UTAMA: Pasang h-full dan class body tema langsung di HTML agar area terluar sinkron
    <html lang="id" className={`${currentStyle.body} min-h-screen`}>
      <body className={`${currentStyle.body} font-sans min-h-screen flex flex-col pb-28 sm:pb-6 transition-all duration-300`}>
        
        {/* WRAPPER UTAMA UNTUK MEMASTIKAN TIDAK ADA BACKGROUND PUTIH YANG BOCOR */}
        <div className={`w-full min-h-screen ${currentStyle.body} flex flex-col`}>
          
          {/* HEADER ATAS */}
          <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 relative">
            <div className={`p-4 md:p-6 ${currentStyle.card} border rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-xl w-full relative`}>
              <div className="absolute top-4 right-4 z-10">
                {isAdmin ? (
                  <button onClick={handleLogout} className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-900 rounded-xl text-[11px] font-mono font-bold hover:bg-rose-900 hover:text-white transition-all">🚪 Keluar Admin</button>
                ) : (
                  <button onClick={() => setShowLoginModal(true)} className={`px-3 py-1 ${currentStyle.innerBg} rounded-xl text-[11px] font-mono font-bold ${currentStyle.accentText}`}>🔒 Login Admin</button>
                )}
              </div>

              <div className={`w-16 h-16 md:w-20 md:h-20 ${currentStyle.innerBg} rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-inner`}>
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <div className="text-[10px] text-slate-600 font-mono">NO LOGO</div>}
              </div>
              
              <div className="text-center md:text-left space-y-1 flex-1 pr-0 md:pr-16">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h1 className={`text-sm md:text-base font-black ${currentStyle.accentText} tracking-wide uppercase`}>{orgName}</h1>
                  <span className={`w-fit px-2 py-0.5 text-[9px] rounded-md font-mono font-bold uppercase mx-auto md:mx-0 ${currentStyle.innerBg} ${currentStyle.textMuted}`}>{isAdmin ? '🟢 Admin Mode' : '🔵 Public View'}</span>
                </div>
                <p className={`text-[10px] md:text-xs ${currentStyle.textMuted} leading-relaxed font-medium`}>{address}</p>
                <p className={`text-[9px] md:text-[10px] ${currentStyle.textMuted} font-mono pt-1 border-t border-white/5 mt-1`}>💳 {bankInfo}</p>
              </div>
            </div>
          </div>

          {/* KONTEN UTAMA */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">{children}</main>

          {/* FOOTER */}
          <footer className={`py-4 mb-20 sm:mb-0 border-t border-white/5 text-center text-[11px] ${currentStyle.textMuted} font-mono`}>Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}</footer>

          {/* BOTTOM NAVBAR UNTUK HP */}
          <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-0 sm:static sm:w-full sm:max-w-7xl sm:mx-auto sm:px-4 sm:mb-4">
            <nav className={`grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 ${currentStyle.navBg} border p-2 rounded-2xl text-[11px] sm:text-xs font-bold w-full sm:w-fit text-center shadow-2xl sm:shadow-none`}>
              {menus.map((m) => (
                <Link key={m.href} href={m.href} className={`py-2 px-1 sm:px-4 rounded-xl transition-all truncate ${pathname === m.href ? 'bg-amber-500 text-slate-950 shadow-md font-black' : `${currentStyle.textMuted} hover:text-white`}`}>{m.name}</Link>
              ))}
            </nav>
          </div>

        </div>

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
