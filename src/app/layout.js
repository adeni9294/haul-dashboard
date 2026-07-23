'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

// 🌐 KAMUS PALET TEMA BERWARNA MODERN (NON-BLACK DOMINANT)
const THEME_STYLES = {
  'emerald-cyber': { 
    body: 'bg-[#062c22] text-emerald-100', 
    card: 'bg-[#0a4234]/80 border-emerald-500/30 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.15)]', 
    navBg: 'bg-[#0a4234]/90 border-emerald-500/40', 
    innerBg: 'bg-[#062c22]/90 border border-emerald-500/30', 
    textMuted: 'text-emerald-300/70', 
    accentText: 'text-emerald-400' 
  },
  'velvet-rose': { 
    body: 'bg-[#2d091e] text-rose-100', 
    card: 'bg-[#431230]/80 border-rose-500/30 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.15)]', 
    navBg: 'bg-[#431230]/90 border-rose-500/40', 
    innerBg: 'bg-[#2d091e]/90 border border-rose-500/30', 
    textMuted: 'text-purple-300/70', 
    accentText: 'text-rose-400' 
  },
  'neon-sunset': { 
    body: 'bg-[#2a1305] text-orange-100', 
    card: 'bg-[#421f0b]/80 border-orange-500/30 text-orange-100 shadow-[0_0_25px_rgba(249,115,22,0.15)]', 
    navBg: 'bg-[#421f0b]/90 border-orange-500/40', 
    innerBg: 'bg-[#2a1305]/90 border border-orange-500/30', 
    textMuted: 'text-orange-300/70', 
    accentText: 'text-orange-400' 
  },
  'amber-gold': { 
    body: 'bg-[#231a02] text-amber-100', 
    card: 'bg-[#3b2d07]/80 border-amber-500/30 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.15)]', 
    navBg: 'bg-[#3b2d07]/90 border-amber-500/40', 
    innerBg: 'bg-[#231a02]/90 border border-amber-500/30', 
    textMuted: 'text-amber-300/70', 
    accentText: 'text-amber-400' 
  },
  'midnight-blue': { 
    body: 'bg-[#0b192c] text-blue-100', 
    card: 'bg-[#1e3e62]/80 border-blue-400/30 text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.15)]', 
    navBg: 'bg-[#1e3e62]/90 border-blue-400/40', 
    innerBg: 'bg-[#0b192c]/90 border border-blue-400/30', 
    textMuted: 'text-blue-300/70', 
    accentText: 'text-blue-400' 
  },
  'nordic-frost': { 
    body: 'bg-[#0f172a] text-slate-100', 
    card: 'bg-[#1e293b]/80 border-cyan-500/30 text-slate-100 shadow-[0_0_25px_rgba(6,182,212,0.15)]', 
    navBg: 'bg-[#1e293b]/90 border-cyan-500/40', 
    innerBg: 'bg-[#0f172a]/90 border border-cyan-500/30', 
    textMuted: 'text-slate-400', 
    accentText: 'text-cyan-400' 
  },
  'dracula-vamp': { 
    body: 'bg-[#1a0b2e] text-purple-200', 
    card: 'bg-[#2b124c]/80 border-fuchsia-500/30 text-purple-200 shadow-[0_0_25px_rgba(217,70,239,0.15)]', 
    navBg: 'bg-[#2b124c]/90 border-fuchsia-500/40', 
    innerBg: 'bg-[#1a0b2e]/90 border border-fuchsia-500/30', 
    textMuted: 'text-purple-300/70', 
    accentText: 'text-fuchsia-400' 
  },
  'forest-moss': { 
    body: 'bg-[#14231a] text-stone-100', 
    card: 'bg-[#1f3729]/80 border-green-500/30 text-stone-100 shadow-[0_0_25px_rgba(34,197,94,0.15)]', 
    navBg: 'bg-[#1f3729]/90 border-green-500/40', 
    innerBg: 'bg-[#14231a]/90 border border-green-500/30', 
    textMuted: 'text-stone-300/70', 
    accentText: 'text-green-400' 
  },
  'ocean-breeze': { 
    body: 'bg-[#042f2e] text-teal-100', 
    card: 'bg-[#115e59]/80 border-teal-400/30 text-teal-100 shadow-[0_0_25px_rgba(20,184,166,0.15)]', 
    navBg: 'bg-[#115e59]/90 border-teal-400/40', 
    innerBg: 'bg-[#042f2e]/90 border border-teal-400/30', 
    textMuted: 'text-teal-300/70', 
    accentText: 'text-cyan-300' 
  },
  'lavender-dream': { 
    body: 'bg-[#1e1b4b] text-indigo-100', 
    card: 'bg-[#312e81]/80 border-indigo-400/30 text-indigo-100 shadow-[0_0_25px_rgba(129,140,248,0.15)]', 
    navBg: 'bg-[#312e81]/90 border-indigo-400/40', 
    innerBg: 'bg-[#1e1b4b]/90 border border-indigo-400/30', 
    textMuted: 'text-indigo-300/70', 
    accentText: 'text-indigo-400' 
  },
  'coffee-latte': { 
    body: 'bg-[#2a1a08] text-amber-100', 
    card: 'bg-[#422a0f]/80 border-amber-600/30 text-amber-100 shadow-[0_0_25px_rgba(217,119,6,0.15)]', 
    navBg: 'bg-[#422a0f]/90 border-amber-600/40', 
    innerBg: 'bg-[#2a1a08]/90 border border-amber-600/30', 
    textMuted: 'text-amber-300/70', 
    accentText: 'text-amber-500' 
  },
  'default': { 
    body: 'bg-[#12161A] text-slate-100', 
    card: 'bg-[#1E2329]/90 border-slate-700/60 text-slate-100 shadow-[0_0_25px_rgba(191,236,37,0.1)]', 
    navBg: 'bg-[#1E2329]/90 border-slate-700/60', 
    innerBg: 'bg-[#12161A]/80 border border-slate-700/50', 
    textMuted: 'text-slate-400', 
    accentText: 'text-[#BFEC25]' 
  }
};

const extractColorClass = (classes, type) => {
  if (!classes) return '';
  const part = classes.split(' ').find(c => c.startsWith(type));
  if (!part) return '';
  if (part.includes('[') && part.includes(']')) {
    return part.substring(part.indexOf('[') + 1, part.indexOf(']'));
  }
  return '';
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
          console.log('Gagal mendapatkan IP via ipify.');
        }

        await supabase.from('visitor_logs').insert({
          path: pathname,
          ip_address: ipAddress,
          user_agent: window.navigator.userAgent || 'unknown'
        });
      } catch (err) {
        console.error('Gagal menyimpan log pengunjung:', err);
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
    { 
      name: 'Transaksi Kas', 
      href: '/transaksi',
      icon: (
        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Jadwal Acara', 
      href: '/acara',
      icon: (
        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Galeri Dokumentasi', 
      href: '/dokumentasi',
      icon: (
        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Kepanitiaan', 
      href: '/kepanitiaan',
      icon: (
        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    ...(isAdmin ? [{ 
      name: 'Setelan Sistem', 
      href: '/pengaturan',
      icon: (
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }] : [])
  ];

  const listRekening = parseBankInfo(bankInfo);

  const customHexBg = extractColorClass(currentStyle.body, 'bg-[');
  const customHexCard = extractColorClass(currentStyle.card, 'bg-[');
  const customHexBorder = extractColorClass(currentStyle.card, 'border-[');
  const customHexAccent = extractColorClass(currentStyle.accentText, 'text-[');

  return (
    <html lang="id" className={`${currentStyle.body} min-h-screen`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body 
        className={`${currentStyle.body} font-['Poppins'] min-h-screen flex flex-col pb-24 transition-all duration-300 antialiased`}
        style={{
          '--bg-body-custom': customHexBg || '',
          '--bg-card-custom': customHexCard || '',
          '--border-custom': customHexBorder || '',
          '--text-accent': customHexAccent || ''
        }}
      >
        
        <div className={`w-full min-h-screen ${currentStyle.body} flex flex-col`}>
          
          {/* HEADER ATAS MODERN DENGAN SENTUHAN GLASSMORPISM */}
          <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 relative">
            <div className={`p-4 md:p-6 ${currentStyle.card} backdrop-blur-xl border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full relative`}>
              
              <div className="flex flex-row items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 md:w-16 md:h-16 ${currentStyle.innerBg} rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner`}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentStyle.accentText}><path d="M2 22h20"/><path d="M12 2v3"/><path d="M12 7a5 5 0 0 1 5 5v10H7V12a5 5 0 0 1 5-5z"/></svg>
                  )}
                </div>
                
                <div className="text-left space-y-1 min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                    <h1 className="text-[11px] sm:text-sm font-black text-white tracking-wide uppercase leading-tight break-words">
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

              {/* LIVE CLOCK WIDGET */}
              {timeString && (
                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0 shrink-0">
                  <span className="text-sm font-black font-mono tracking-widest text-white">{timeString}</span>
                  <span className="text-[10px] font-medium text-slate-300 font-mono tracking-wide">{dateString}</span>
                </div>
              )}

            </div>
          </div>

          {/* AREA KONTEN HALAMAN UTAMA */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 mb-12">
            {children}
          </main>

          {/* FOOTER DESKTOP */}
          <footer className={`py-6 border-t border-white/10 text-center text-[9px] ${currentStyle.textMuted} font-mono uppercase tracking-widest mb-20 sm:mb-4`}>
            Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}
          </footer>

        </div>

        {/* BOTTOM NAV DESIGN FLOATING */}
        <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4">
          <div className={`${currentStyle.navBg} backdrop-blur-xl h-16 rounded-2xl w-full max-w-md flex items-center justify-around px-2 shadow-2xl shadow-black/80 border`}>
            
            <Link href="/" className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${pathname === '/' ? `${currentStyle.accentText} bg-white/10 shadow-md` : 'text-slate-400 hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="text-[8px] font-bold font-mono mt-0.5 tracking-tighter">Home</span>
            </Link>

            <Link href="/stat" className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${pathname === '/stat' ? `${currentStyle.accentText} bg-white/10` : 'text-slate-400 hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span className="text-[8px] font-bold font-mono mt-0.5 tracking-tighter">Stat</span>
            </Link>

            {/* NAV TENGAH: BUTTON DONASI */}
            <button onClick={() => setShowDonationModal(true)} className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-black bg-[#BFEC25] hover:bg-[#a3cb1b] shadow-lg shadow-[#BFEC25]/20 transform active:scale-95 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.85.85 2.23.85 3.08 0L15 8"/>
              </svg>
            </button>

            <Link href="/anggaran" className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${pathname === '/anggaran' ? `${currentStyle.accentText} bg-white/10` : 'text-slate-400 hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
              <span className="text-[8px] font-bold font-mono mt-0.5 tracking-tighter">Budget</span>
            </Link>

            <button onClick={() => setShowMainMenuDrawer(true)} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${showMainMenuDrawer ? `${currentStyle.accentText} bg-white/10` : 'text-slate-400 hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              <span className="text-[8px] font-bold font-mono mt-0.5 tracking-tighter">Menu</span>
            </button>

          </div>
        </div>

        {/* POP-UP MODAL DONASI */}
        {showDonationModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`${currentStyle.card} border p-5 rounded-[24px] w-full max-w-sm space-y-4 shadow-2xl relative`}>
              <div className="text-center space-y-1">
                <div className="text-xl">💳</div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Rekening Donasi Jemaah</h3>
                <p className="text-[10px] text-slate-300 max-w-[280px] mx-auto leading-normal">
                  Salurkan infak & sedekah jariyah Anda untuk kesuksesan agenda Haul melalui opsi rekening resmi berikut:
                </p>
              </div>
              
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5">
                {listRekening.length === 0 ? (
                  <div className={`p-4 ${currentStyle.innerBg} rounded-xl font-mono text-[10px] text-center text-amber-400`}>
                    {bankInfo}
                  </div>
                ) : (
                  listRekening.map((item, idx) => (
                    <div key={idx} className={`p-3 ${currentStyle.innerBg} rounded-xl flex items-center justify-between gap-3 group transition-all`}>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-[#BFEC25] border border-amber-500/20 uppercase tracking-wide">
                          {item.bank}
                        </span>
                        <p className="text-xs font-black font-mono text-white tracking-wide pt-1 select-all">
                          {item.number}
                        </p>
                        <p className="text-[9px] text-slate-400 font-sans truncate">
                          AN. <span className="text-slate-200 font-medium">{item.name}</span>
                        </p>
                      </div>
                      <button 
                        onClick={() => handleCopy(item.number, idx)}
                        className={`px-2.5 py-1.5 rounded-lg font-mono text-[9px] font-bold tracking-wider uppercase transition-all shrink-0 ${copiedIndex === idx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        {copiedIndex === idx ? 'Disalin' : 'Salin'}
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-1">
                <button onClick={() => setShowDonationModal(false)} className="w-full py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700/40 shadow-md font-mono">
                  TUTUP WINDOW
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DRAWER MENU UTAMA */}
        {showMainMenuDrawer && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center transition-all" onClick={() => setShowMainMenuDrawer(false)}>
            <div className={`w-full max-w-md ${currentStyle.card} border-t rounded-t-3xl p-6 space-y-4 shadow-2xl transform transition-transform`} onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />
              <div className="text-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300">Navigasi Halaman</h4>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {drawerMenus.map((dm) => (
                  <Link 
                    key={dm.href} 
                    href={dm.href} 
                    onClick={() => setShowMainMenuDrawer(false)}
                    className={`w-full py-2.5 px-3.5 rounded-xl font-medium text-xs text-left flex justify-between items-center transition-all ${
                      pathname === dm.href 
                        ? 'bg-[#BFEC25]/10 text-[#BFEC25] border border-[#BFEC25]/30' 
                        : `${currentStyle.innerBg} text-white hover:bg-white/10`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                        {dm.icon}
                      </div>
                      <span className="font-semibold">{dm.name}</span>
                    </div>
                    <span className="opacity-40 text-sm">›</span>
                  </Link>
                ))}
              </div>
              <div className="pt-4 border-t border-white/10">
                {isAdmin ? (
                  <button onClick={() => { handleLogout(); setShowMainMenuDrawer(false); }} className="w-full py-3 bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-900 rounded-xl text-xs font-bold uppercase tracking-wide transition-all">
                    🚪 Keluar Mode Admin
                  </button>
                ) : (
                  <button onClick={() => { setShowLoginModal(true); setShowMainMenuDrawer(false); }} className="w-full py-3 bg-[#BFEC25] hover:bg-[#a8d41e] text-black rounded-xl text-xs font-black uppercase tracking-wide shadow-md transition-all">
                    🔑 Otorisasi Login Admin
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
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">🔒 Otorisasi Sistem</h3>
                <p className="text-xs text-slate-300 mt-1">Masukkan kata sandi untuk masuk ke Mode Admin</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="password" placeholder="Password Admin" required autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full px-3 py-2 ${currentStyle.innerBg} rounded-xl text-xs text-white focus:outline-none text-center font-mono tracking-widest`} />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowLoginModal(false); setPasswordInput(''); }} className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl">Batal</button>
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
