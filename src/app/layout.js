'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

// 🎨 ICON MODERN DARI LUCIDE REACT
import { 
  Home, 
  BarChart3, 
  Gift, 
  ClipboardList, 
  Menu, 
  ChevronRight, 
  Lock, 
  LogOut, 
  Building2, 
  Copy, 
  Check, 
  X,
  CreditCard,   
  Calendar,     
  Images,       
  Users,        
  Settings,
  Sparkles
} from 'lucide-react';

// 🎨 THEME STYLES - DENGAN TEMA DEFAULT BARU YANG FRESH & SEGAR (LIGHT/GLASS)
const THEME_STYLES = {
  'default': { 
    body: 'bg-gradient-to-br from-slate-100 via-indigo-50/60 to-cyan-50 text-slate-800', 
    card: 'bg-white/80 backdrop-blur-xl border-slate-200/80 text-slate-800 shadow-xl shadow-indigo-500/5', 
    navBg: 'bg-slate-900/90 backdrop-blur-xl border-slate-800 text-white shadow-2xl shadow-slate-900/30', 
    innerBg: 'bg-slate-50 border border-slate-200/80', 
    textMuted: 'text-slate-500', 
    accentText: 'text-indigo-600' 
  },
  'emerald-cyber': { 
    body: 'bg-[#04201a] text-emerald-100', 
    card: 'bg-[#09382e]/80 border-emerald-500/40 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.2)]', 
    navBg: 'bg-[#09382e]/90 border-emerald-500/50', 
    innerBg: 'bg-[#04201a]/90 border border-emerald-500/30', 
    textMuted: 'text-emerald-300/80', 
    accentText: 'text-emerald-300' 
  },
  'midnight-blue': { 
    body: 'bg-[#071326] text-blue-100', 
    card: 'bg-[#122748]/80 border-blue-500/40 text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.2)]', 
    navBg: 'bg-[#122748]/90 border-blue-500/50', 
    innerBg: 'bg-[#071326]/90 border border-blue-500/30', 
    textMuted: 'text-blue-300/80', 
    accentText: 'text-sky-300' 
  },
  'nordic-frost': { 
    body: 'bg-[#0a192f] text-slate-100', 
    card: 'bg-[#172a45]/80 border-cyan-400/40 text-slate-100 shadow-[0_0_25px_rgba(34,211,238,0.2)]', 
    navBg: 'bg-[#172a45]/90 border-cyan-400/50', 
    innerBg: 'bg-[#0a192f]/90 border border-cyan-400/30', 
    textMuted: 'text-slate-300', 
    accentText: 'text-cyan-300' 
  }
};

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false); 
  const [showMainMenuDrawer, setShowMainMenuDrawer] = useState(false); 
  const [passwordInput, setPasswordInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    checkAdminSession();
    loadHeaderSettings();
    setShowMainMenuDrawer(false); 

    const recordVisitorLog = async () => {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        let ipAddress = 'unknown';
        try {
          const res = await fetch('https://api.ipify.org?format=json');
          const ipData = await res.json();
          ipAddress = ipData.ip;
        } catch (e) {
          console.log('Gagal ambil IP');
        }

        await supabase.from('visitor_logs').insert({
          path: pathname,
          ip_address: ipAddress,
          user_agent: window.navigator.userAgent || 'unknown'
        });
      } catch (err) {
        console.error('Gagal log visitor:', err);
      }
    };

    recordVisitorLog();

    const updateTime = () => {
      const sekarang = new Date();
      setTimeString(sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDateString(sekarang.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };

    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
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

  const parseBankInfo = (rawText) => {
    if (!rawText) return [];
    let cleanText = rawText.replace('Rekening Donasi -->', '').trim();
    const rawParts = cleanText.split(/---|\|/);
    
    return rawParts.map(part => {
      const text = part.trim();
      let bankName = 'BANK';
      let accountNum = '';
      let holderName = '-';

      if (text.includes(':')) {
        const splitColon = text.split(':');
        bankName = splitColon[0].trim();
        const rest = splitColon[1].trim();
        
        if (rest.toUpperCase().includes('AN.')) {
          const splitAN = rest.split(/AN\.|AN/i);
          accountNum = splitAN[0].trim();
          holderName = splitAN[1].replace(/^[.\s-]+|[.\s-]+$/g, '').trim();
        } else {
          accountNum = rest;
        }
      } else {
        accountNum = text;
      }

      return { bank: bankName, number: accountNum, name: holderName };
    }).filter(item => item.number.length > 0);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text.replace(/\s+/g, ''));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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

  const drawerMenus = [
    { name: 'Transaksi Kas', href: '/transaksi', icon: CreditCard, color: 'text-emerald-500 bg-emerald-50' },
    { name: 'Jadwal Acara', href: '/acara', icon: Calendar, color: 'text-amber-500 bg-amber-50' },
    { name: 'Galeri Dokumentasi', href: '/dokumentasi', icon: Images, color: 'text-purple-500 bg-purple-50' },
    { name: 'Kepanitiaan', href: '/kepanitiaan', icon: Users, color: 'text-blue-500 bg-blue-50' },
    ...(isAdmin ? [{ name: 'Setelan Sistem', href: '/pengaturan', icon: Settings, color: 'text-rose-500 bg-rose-50' }] : [])
  ];

  const listRekening = parseBankInfo(bankInfo);

  return (
    <html lang="id" className={`${currentStyle.body} min-h-screen`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${currentStyle.body} font-['Plus_Jakarta_Sans',sans-serif] min-h-screen flex flex-col pb-24 transition-all duration-300 antialiased`}>
        
        <div className={`w-full min-h-screen flex flex-col`}>
          
          {/* HEADER SEGAR & CERAH DENGAN ORNAMEN GLASS */}
          <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 relative">
            <div className={`p-4 md:p-6 ${currentStyle.card} rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full relative overflow-hidden border border-white/60 shadow-lg`}>
              
              {/* DEKORASI BUBBLE GLOW */}
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-300/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-cyan-300/30 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-row items-center gap-3 sm:gap-4 flex-1 min-w-0 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 rounded-2xl shrink-0 shadow-md">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                </div>
                
                <div className="text-left space-y-1 min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                    <h1 className="text-xs sm:text-sm font-extrabold tracking-tight uppercase leading-tight text-slate-800 break-words">
                      {orgName}
                    </h1>
                    <span className={`w-fit px-2 py-0.5 text-[9px] rounded-full font-mono font-black uppercase shadow-xs ${isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {isAdmin ? '⚡ ADMIN MODE' : 'PUBLIC'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal break-words font-medium">
                    {address}
                  </p>
                </div>
              </div>

              {/* LIVE CLOCK */}
              {timeString && (
                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-200/60 pt-2 sm:pt-0 shrink-0 relative z-10">
                  <span className="text-sm font-black font-mono tracking-wider text-indigo-900 bg-indigo-50/80 px-2.5 py-0.5 rounded-lg border border-indigo-100">{timeString}</span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wide mt-1">{dateString}</span>
                </div>
              )}

            </div>
          </div>

          {/* MAIN CONTENT */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 mb-12">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="py-6 border-t border-slate-200/80 text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-20 sm:mb-4">
            Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}
          </footer>

        </div>

        {/* 🚀 FLOATING BOTTOM NAV BAR DENGAN DESAIN ANIMATED POP-UP CERAH */}
        <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4">
          <div className="bg-slate-900/90 backdrop-blur-2xl h-16 rounded-3xl w-full max-w-md flex items-center justify-around px-3 shadow-2xl shadow-indigo-900/20 border border-slate-700/80">
            
            <Link href="/" className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${pathname === '/' ? 'text-indigo-400 font-black bg-indigo-500/20 scale-105 border border-indigo-400/30' : 'text-slate-400 hover:text-white'}`}>
              <Home className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Home</span>
            </Link>

            <Link href="/stat" className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${pathname === '/stat' ? 'text-cyan-400 font-black bg-cyan-500/20 scale-105 border border-cyan-400/30' : 'text-slate-400 hover:text-white'}`}>
              <BarChart3 className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Stat</span>
            </Link>

            {/* TOMBOL UTAMA DONASI CERAH (AQUAMARINE NEON) */}
            <button onClick={() => setShowDonationModal(true)} className="flex flex-col items-center justify-center w-13 h-13 rounded-2xl text-slate-950 bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-300 hover:scale-110 shadow-lg shadow-emerald-400/30 transform active:scale-95 transition-all -mt-3 border-2 border-white">
              <Gift className="w-6 h-6 stroke-[2.5]" />
            </button>

            <Link href="/anggaran" className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${pathname === '/anggaran' ? 'text-amber-400 font-black bg-amber-500/20 scale-105 border border-amber-400/30' : 'text-slate-400 hover:text-white'}`}>
              <ClipboardList className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Budget</span>
            </Link>

            <button onClick={() => setShowMainMenuDrawer(true)} className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${showMainMenuDrawer ? 'text-purple-400 font-black bg-purple-500/20 scale-105 border border-purple-400/30' : 'text-slate-400 hover:text-white'}`}>
              <Menu className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Menu</span>
            </button>

          </div>
        </div>

        {/* MODAL DONASI CERAH & ELEGAN */}
        {showDonationModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowDonationModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600">
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-1">
                <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl mx-auto mb-2 border border-emerald-200/80 shadow-xs">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Rekening Donasi Jemaah</h3>
                <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto font-medium">
                  Salurkan infak & sedekah jariyah Anda melalui opsi rekening resmi berikut:
                </p>
              </div>
              
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5">
                {listRekening.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase">
                        {item.bank}
                      </span>
                      <p className="text-xs font-black font-mono tracking-wider pt-1 text-slate-800 select-all">
                        {item.number}
                      </p>
                      <p className="text-[9px] text-slate-500 font-sans truncate font-medium">
                        AN. <span className="font-bold text-slate-700">{item.name}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCopy(item.number, idx)}
                      className={`px-3 py-2 rounded-xl font-mono text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1 ${copiedIndex === idx ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                    >
                      {copiedIndex === idx ? <><Check className="w-3.5 h-3.5" /> Disalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowDonationModal(false)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all font-mono uppercase">
                Tutup Window
              </button>
            </div>
          </div>
        )}

        {/* DRAWER MENU CERAH DENGAN IKON COLORFUL */}
        {showMainMenuDrawer && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end justify-center" onClick={() => setShowMainMenuDrawer(false)}>
            <div className="w-full max-w-md bg-white border-t border-slate-200 rounded-t-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2" />
              <div className="text-center">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Navigasi Halaman</h4>
              </div>
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {drawerMenus.map((dm) => {
                  const IconComponent = dm.icon;
                  return (
                    <Link 
                      key={dm.href} 
                      href={dm.href} 
                      onClick={() => setShowMainMenuDrawer(false)}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs text-left flex justify-between items-center transition-all ${
                        pathname === dm.href 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${pathname === dm.href ? 'bg-white/20 text-white' : dm.color}`}>
                          <IconComponent className="w-4 h-4 shrink-0" />
                        </div>
                        <span>{dm.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-slate-200">
                {isAdmin ? (
                  <button onClick={() => { handleLogout(); setShowMainMenuDrawer(false); }} className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all">
                    <LogOut className="w-4 h-4" /> Keluar Mode Admin
                  </button>
                ) : (
                  <button onClick={() => { setShowLoginModal(true); setShowMainMenuDrawer(false); }} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all">
                    <Lock className="w-4 h-4" /> Otorisasi Login Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL LOGIN CERAH */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="text-center">
                <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-2xl mx-auto mb-2 border border-indigo-200/80">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Otorisasi Sistem</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Masukkan kata sandi untuk masuk ke Mode Admin</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="password" placeholder="Password Admin" required autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-center font-mono tracking-widest text-slate-800 focus:outline-none focus:border-indigo-500" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowLoginModal(false); setPasswordInput(''); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase rounded-2xl shadow-md shadow-indigo-500/20 transition-all">Masuk</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
