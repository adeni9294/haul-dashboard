'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

// 🎨 ICON MODERN DARI LUCIDE REACT (DITAMBAHKAN IKON UNTUK DRAWER MENU)
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
  CreditCard,   // ➕ Ikon Transaksi
  Calendar,     // ➕ Ikon Jadwal
  Images,       // ➕ Ikon Galeri
  Users,        // ➕ Ikon Kepanitiaan
  Settings      // ➕ Ikon Pengaturan
} from 'lucide-react';

const THEME_STYLES = {
  'emerald-cyber': { 
    body: 'bg-[#04201a] text-emerald-100', 
    card: 'bg-[#09382e]/80 border-emerald-500/40 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.2)]', 
    navBg: 'bg-[#09382e]/90 border-emerald-500/50', 
    innerBg: 'bg-[#04201a]/90 border border-emerald-500/30', 
    textMuted: 'text-emerald-300/80', 
    accentText: 'text-emerald-300' 
  },
  'crimson-tide': { 
    body: 'bg-[#2b070b] text-red-100', 
    card: 'bg-[#480d14]/80 border-red-500/40 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.2)]', 
    navBg: 'bg-[#480d14]/90 border-red-500/50', 
    innerBg: 'bg-[#2b070b]/90 border border-red-500/30', 
    textMuted: 'text-red-300/80', 
    accentText: 'text-rose-400' 
  },
  'midnight-blue': { 
    body: 'bg-[#071326] text-blue-100', 
    card: 'bg-[#122748]/80 border-blue-500/40 text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.2)]', 
    navBg: 'bg-[#122748]/90 border-blue-500/50', 
    innerBg: 'bg-[#071326]/90 border border-blue-500/30', 
    textMuted: 'text-blue-300/80', 
    accentText: 'text-sky-300' 
  },
  'dracula-vamp': { 
    body: 'bg-[#18092b] text-purple-100', 
    card: 'bg-[#2d124d]/80 border-fuchsia-500/40 text-purple-100 shadow-[0_0_25px_rgba(217,70,239,0.2)]', 
    navBg: 'bg-[#2d124d]/90 border-fuchsia-500/50', 
    innerBg: 'bg-[#18092b]/90 border border-fuchsia-500/30', 
    textMuted: 'text-purple-300/80', 
    accentText: 'text-fuchsia-300' 
  },
  'amber-gold': { 
    body: 'bg-[#241a03] text-amber-100', 
    card: 'bg-[#423007]/80 border-amber-500/40 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.2)]', 
    navBg: 'bg-[#423007]/90 border-amber-500/50', 
    innerBg: 'bg-[#241a03]/90 border border-amber-500/30', 
    textMuted: 'text-amber-300/80', 
    accentText: 'text-amber-300' 
  },
  'neon-sunset': { 
    body: 'bg-[#2b1003] text-orange-100', 
    card: 'bg-[#481c07]/80 border-orange-500/40 text-orange-100 shadow-[0_0_25px_rgba(249,115,22,0.2)]', 
    navBg: 'bg-[#481c07]/90 border-orange-500/50', 
    innerBg: 'bg-[#2b1003]/90 border border-orange-500/30', 
    textMuted: 'text-orange-300/80', 
    accentText: 'text-orange-300' 
  },
  'coffee-latte': { 
    body: 'bg-[#21150c] text-amber-100', 
    card: 'bg-[#382516]/80 border-amber-700/40 text-amber-100 shadow-[0_0_25px_rgba(180,83,9,0.2)]', 
    navBg: 'bg-[#382516]/90 border-amber-700/50', 
    innerBg: 'bg-[#21150c]/90 border border-amber-700/30', 
    textMuted: 'text-amber-200/70', 
    accentText: 'text-amber-400' 
  },
  'nordic-frost': { 
    body: 'bg-[#0a192f] text-slate-100', 
    card: 'bg-[#172a45]/80 border-cyan-400/40 text-slate-100 shadow-[0_0_25px_rgba(34,211,238,0.2)]', 
    navBg: 'bg-[#172a45]/90 border-cyan-400/50', 
    innerBg: 'bg-[#0a192f]/90 border border-cyan-400/30', 
    textMuted: 'text-slate-300', 
    accentText: 'text-cyan-300' 
  },
  'rose-gold': { 
    body: 'bg-[#260c1a] text-rose-100', 
    card: 'bg-[#42172f]/80 border-rose-400/40 text-rose-100 shadow-[0_0_25px_rgba(251,113,133,0.2)]', 
    navBg: 'bg-[#42172f]/90 border-rose-400/50', 
    innerBg: 'bg-[#260c1a]/90 border border-rose-400/30', 
    textMuted: 'text-rose-200/80', 
    accentText: 'text-rose-300' 
  },
  'toxic-lime': { 
    body: 'bg-[#112204] text-lime-100', 
    card: 'bg-[#1f3a09]/80 border-lime-400/40 text-lime-100 shadow-[0_0_25px_rgba(163,230,53,0.2)]', 
    navBg: 'bg-[#1f3a09]/90 border-lime-400/50', 
    innerBg: 'bg-[#112204]/90 border border-lime-400/30', 
    textMuted: 'text-lime-200/80', 
    accentText: 'text-lime-300' 
  },
  'light-clean': { 
    body: 'bg-[#f1f5f9] text-slate-900', 
    card: 'bg-white/90 border-slate-300 text-slate-900 shadow-xl', 
    navBg: 'bg-white/90 border-slate-300', 
    innerBg: 'bg-slate-100 border border-slate-200', 
    textMuted: 'text-slate-600', 
    accentText: 'text-emerald-600' 
  },
  'default': { 
    body: 'bg-[#0d1117] text-slate-100', 
    card: 'bg-[#161b22]/90 border-slate-700/60 text-slate-100 shadow-[0_0_25px_rgba(191,236,37,0.15)]', 
    navBg: 'bg-[#161b22]/90 border-slate-700/60', 
    innerBg: 'bg-[#0d1117]/80 border border-slate-700/50', 
    textMuted: 'text-slate-400', 
    accentText: 'text-[#BFEC25]' 
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

  // 📌 SEKARANG DRAWER MENUS MEMILIKI PROPERTI IKON
  const drawerMenus = [
    { name: 'Transaksi Kas', href: '/transaksi', icon: CreditCard },
    { name: 'Jadwal Acara', href: '/acara', icon: Calendar },
    { name: 'Galeri Dokumentasi', href: '/dokumentasi', icon: Images },
    { name: 'Kepanitiaan', href: '/kepanitiaan', icon: Users },
    ...(isAdmin ? [{ name: 'Setelan Sistem', href: '/pengaturan', icon: Settings }] : [])
  ];

  const listRekening = parseBankInfo(bankInfo);

  return (
    <html lang="id" className={`${currentStyle.body} min-h-screen`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${currentStyle.body} font-['Poppins'] min-h-screen flex flex-col pb-24 transition-all duration-300 antialiased`}>
        
        <div className={`w-full min-h-screen ${currentStyle.body} flex flex-col`}>
          
          {/* HEADER ATAS */}
          <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 relative">
            <div className={`p-4 md:p-6 ${currentStyle.card} backdrop-blur-xl border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full relative`}>
              
              <div className="flex flex-row items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 md:w-16 md:h-16 ${currentStyle.innerBg} rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner`}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className={`w-6 h-6 ${currentStyle.accentText}`} />
                  )}
                </div>
                
                <div className="text-left space-y-1 min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                    <h1 className="text-[11px] sm:text-sm font-black tracking-wide uppercase leading-tight break-words">
                      {orgName}
                    </h1>
                    <span className={`w-fit px-1.5 py-0.5 text-[8px] rounded font-mono font-bold uppercase ${currentStyle.innerBg} ${currentStyle.accentText}`}>
                      {isAdmin ? 'ADMIN' : 'PUBLIC'}
                    </span>
                  </div>
                  <p className={`text-[9px] sm:text-[10px] ${currentStyle.textMuted} leading-normal break-words`}>
                    {address}
                  </p>
                </div>
              </div>

              {/* LIVE CLOCK */}
              {timeString && (
                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0 shrink-0">
                  <span className="text-sm font-black font-mono tracking-widest">{timeString}</span>
                  <span className="text-[10px] font-medium opacity-80 font-mono tracking-wide">{dateString}</span>
                </div>
              )}

            </div>
          </div>

          {/* MAIN CONTENT */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 mb-12">
            {children}
          </main>

          {/* FOOTER */}
          <footer className={`py-6 border-t border-white/10 text-center text-[9px] ${currentStyle.textMuted} font-mono uppercase tracking-widest mb-20 sm:mb-4`}>
            Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}
          </footer>

        </div>

        {/* 🚀 BOTTOM NAV FLOATING MODERN (ICON LUCIDE REACT) */}
        <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4">
          <div className={`${currentStyle.navBg} backdrop-blur-xl h-16 rounded-2xl w-full max-w-md flex items-center justify-around px-2 shadow-2xl border border-white/20`}>
            
            <Link href="/" className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === '/' ? `${currentStyle.accentText} bg-white/10` : 'opacity-70 hover:opacity-100 text-white'}`}>
              <Home className="w-5 h-5" />
              <span className="text-[9px] font-bold font-mono mt-1">Home</span>
            </Link>

            <Link href="/stat" className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === '/stat' ? `${currentStyle.accentText} bg-white/10` : 'opacity-70 hover:opacity-100 text-white'}`}>
              <BarChart3 className="w-5 h-5" />
              <span className="text-[9px] font-bold font-mono mt-1">Stat</span>
            </Link>

            <button onClick={() => setShowDonationModal(true)} className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-black bg-[#BFEC25] hover:bg-[#a3cb1b] shadow-lg transform active:scale-95 transition-all">
              <Gift className="w-5 h-5 stroke-[2.5]" />
            </button>

            <Link href="/anggaran" className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === '/anggaran' ? `${currentStyle.accentText} bg-white/10` : 'opacity-70 hover:opacity-100 text-white'}`}>
              <ClipboardList className="w-5 h-5" />
              <span className="text-[9px] font-bold font-mono mt-1">Budget</span>
            </Link>

            <button onClick={() => setShowMainMenuDrawer(true)} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${showMainMenuDrawer ? `${currentStyle.accentText} bg-white/10` : 'opacity-70 hover:opacity-100 text-white'}`}>
              <Menu className="w-5 h-5" />
              <span className="text-[9px] font-bold font-mono mt-1">Menu</span>
            </button>

          </div>
        </div>

        {/* MODAL DONASI */}
        {showDonationModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`${currentStyle.card} border p-5 rounded-[24px] w-full max-w-sm space-y-4 shadow-2xl relative`}>
              <button onClick={() => setShowDonationModal(false)} className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-1">
                <div className="p-3 bg-[#BFEC25]/20 text-[#BFEC25] w-fit rounded-2xl mx-auto mb-2 border border-[#BFEC25]/30">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider">Rekening Donasi Jemaah</h3>
                <p className={`text-[10px] ${currentStyle.textMuted} max-w-[280px] mx-auto`}>
                  Salurkan infak & sedekah jariyah Anda melalui opsi rekening resmi berikut:
                </p>
              </div>
              
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5">
                {listRekening.map((item, idx) => (
                  <div key={idx} className={`p-3 ${currentStyle.innerBg} rounded-xl flex items-center justify-between gap-3`}>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                        {item.bank}
                      </span>
                      <p className="text-xs font-black font-mono tracking-wide pt-1 select-all">
                        {item.number}
                      </p>
                      <p className={`text-[9px] ${currentStyle.textMuted} font-sans truncate`}>
                        AN. <span className="font-medium">{item.name}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCopy(item.number, idx)}
                      className={`px-2.5 py-1.5 rounded-lg font-mono text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1 ${copiedIndex === idx ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {copiedIndex === idx ? <><Check className="w-3 h-3" /> Disalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowDonationModal(false)} className="w-full py-2.5 bg-white/10 text-xs font-bold rounded-xl hover:bg-white/20 transition-all font-mono">
                TUTUP WINDOW
              </button>
            </div>
          </div>
        )}

        {/* DRAWER MENU (📌 SUDAH MENAMPILKAN IKON) */}
        {showMainMenuDrawer && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowMainMenuDrawer(false)}>
            <div className={`w-full max-w-md ${currentStyle.card} border-t rounded-t-3xl p-6 space-y-4 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />
              <div className="text-center">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-80">Navigasi Halaman</h4>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {drawerMenus.map((dm) => {
                  const IconComponent = dm.icon;
                  return (
                    <Link 
                      key={dm.href} 
                      href={dm.href} 
                      onClick={() => setShowMainMenuDrawer(false)}
                      className={`w-full py-2.5 px-3.5 rounded-xl font-medium text-xs text-left flex justify-between items-center transition-all ${
                        pathname === dm.href 
                          ? 'bg-[#BFEC25]/20 text-[#BFEC25] border border-[#BFEC25]/40' 
                          : `${currentStyle.innerBg} hover:bg-white/10`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-4 h-4 text-[#BFEC25] shrink-0" />
                        <span>{dm.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </Link>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-white/10">
                {isAdmin ? (
                  <button onClick={() => { handleLogout(); setShowMainMenuDrawer(false); }} className="w-full py-3 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" /> Keluar Mode Admin
                  </button>
                ) : (
                  <button onClick={() => { setShowLoginModal(true); setShowMainMenuDrawer(false); }} className="w-full py-3 bg-[#BFEC25] hover:bg-[#a8d41e] text-black rounded-xl text-xs font-black uppercase tracking-wide shadow-md flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" /> Otorisasi Login Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL LOGIN */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`${currentStyle.card} border p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl`}>
              <div className="text-center">
                <Lock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Otorisasi Sistem</h3>
                <p className={`text-xs ${currentStyle.textMuted} mt-1`}>Masukkan kata sandi untuk masuk ke Mode Admin</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="password" placeholder="Password Admin" required autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full px-3 py-2 ${currentStyle.innerBg} rounded-xl text-xs text-center font-mono tracking-widest`} />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowLoginModal(false); setPasswordInput(''); }} className="flex-1 py-2 bg-white/10 text-xs font-bold rounded-xl">Batal</button>
                  <button type="submit" className="flex-1 py-2 bg-[#BFEC25] text-black text-xs font-black uppercase rounded-xl">Masuk</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
