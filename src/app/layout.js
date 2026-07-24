'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

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
  Clock,
  Compass,
  Bell,
  BellOff,
  MapPin
} from 'lucide-react';

const THEME_STYLES = {
  'default': { 
    bodyBg: '#080d1a',
    bodyClass: 'bg-[#080d1a] text-slate-100', 
    liquidCard: 'bg-[#11192e]/80 backdrop-blur-2xl border border-slate-700/80 shadow-2xl text-slate-100', 
    navBg: 'bg-[#080d1a]', 
    innerBg: 'bg-[#1a243b]/60 border border-slate-700/60', 
    textMuted: 'text-slate-300', 
    accentText: 'text-cyan-400',
    accentBadge: 'bg-cyan-500 text-slate-950 font-black'
  },
  'cyberpunk-neon': { 
    bodyBg: '#090514',
    bodyClass: 'bg-[#090514] text-cyan-100', 
    liquidCard: 'bg-[#160a2c]/80 backdrop-blur-2xl border border-fuchsia-500/40 shadow-[0_10px_35px_rgba(217,70,239,0.2)] text-cyan-100', 
    navBg: 'bg-[#090514]', 
    innerBg: 'bg-purple-950/60 border border-fuchsia-500/30', 
    textMuted: 'text-fuchsia-200', 
    accentText: 'text-cyan-300',
    accentBadge: 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-black'
  },
  'emerald-cyber': { 
    bodyBg: '#021814',
    bodyClass: 'bg-[#021814] text-emerald-100', 
    liquidCard: 'bg-[#052e24]/80 backdrop-blur-2xl border border-emerald-400/30 shadow-[0_10px_30px_rgba(16,185,129,0.2)] text-emerald-100', 
    navBg: 'bg-[#021814]', 
    innerBg: 'bg-emerald-900/50 border border-emerald-500/30', 
    textMuted: 'text-emerald-200', 
    accentText: 'text-emerald-300',
    accentBadge: 'bg-emerald-400 text-black font-black'
  },
  'midnight-blue': { 
    bodyBg: '#050c1a',
    bodyClass: 'bg-[#050c1a] text-blue-100', 
    liquidCard: 'bg-[#0a1a36]/80 backdrop-blur-2xl border border-blue-400/30 shadow-[0_10px_30px_rgba(59,130,246,0.2)] text-blue-100', 
    navBg: 'bg-[#050c1a]', 
    innerBg: 'bg-blue-900/50 border border-blue-500/30', 
    textMuted: 'text-blue-200', 
    accentText: 'text-sky-300',
    accentBadge: 'bg-sky-400 text-slate-950 font-black'
  }
};

// Daftar Kota Populer untuk Pilihan Manual
const DAFTAR_KOTA = [
  { id: '1202', name: 'Kab. Cirebon' },
  { id: '1212', name: 'Kota Cirebon' },
  { id: '1211', name: 'Kota Bandung' },
  { id: '1219', name: 'Kab. Bandung Barat' },
  { id: '1301', name: 'DKI Jakarta' },
  { id: '1214', name: 'Kab. Indramayu' },
  { id: '1215', name: 'Kab. Majalengka' },
  { id: '1213', name: 'Kab. Kuningan' },
  { id: '1501', name: 'Kota Semarang' },
  { id: '1609', name: 'Kota Surabaya' }
];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false); 
  const [showSholatModal, setShowSholatModal] = useState(false);
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

  // State Jadwal Sholat & Alarm
  const [jadwalSholat, setJadwalSholat] = useState(null);
  const [kotaSholat, setKotaSholat] = useState('Memuat lokasi...');
  const [selectedKotaId, setSelectedKotaId] = useState('');
  const [isAlarmActive, setIsAlarmActive] = useState(true);
  const lastTriggeredSholat = useRef('');

  useEffect(() => {
    checkAdminSession();
    loadHeaderSettings();

    // Cek apakah ada kota tersimpan di local storage
    const savedKotaId = localStorage.getItem('manual_kota_id');
    if (savedKotaId) {
      setSelectedKotaId(savedKotaId);
      fetchJadwalSholat(savedKotaId);
    } else {
      fetchJadwalSholat();
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const updateTime = () => {
      const sekarang = new Date();
      const jamMenitDetik = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const jamMenit = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      setTimeString(jamMenitDetik);
      setDateString(sekarang.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));

      if (jadwalSholat && isAlarmActive) {
        checkSholatAlarm(jamMenit);
      }
    };

    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
  }, [pathname, jadwalSholat, isAlarmActive]);

  // Tutup drawer otomatis jika halaman berpindah
  useEffect(() => {
    setShowMainMenuDrawer(false);
  }, [pathname]);

  async function fetchJadwalSholat(forcedId = null) {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      // Jika user memilih kota secara manual, gunakan ID tersebut
      if (forcedId) {
        const resJadwal = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${forcedId}/${yyyy}/${mm}/${dd}`);
        const resultJadwal = await resJadwal.json();
        if (resultJadwal && resultJadwal.status && resultJadwal.data) {
          setJadwalSholat(resultJadwal.data.jadwal);
          setKotaSholat(resultJadwal.data.lokasi);
        }
        return;
      }

      // Jika tidak ada pilihan manual, coba deteksi via GPS
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
              const resCoord = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${lat}/${lon}`);
              const resultCoord = await resCoord.json();
              
              if (resultCoord && resultCoord.status && resultCoord.data && resultCoord.data.id) {
                const idKota = resultCoord.data.id;
                const namaKota = resultCoord.data.lokasi;
                
                const resJadwal = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${idKota}/${yyyy}/${mm}/${dd}`);
                const resultJadwal = await resJadwal.json();
                
                if (resultJadwal && resultJadwal.status && resultJadwal.data) {
                  setJadwalSholat(resultJadwal.data.jadwal);
                  setKotaSholat(namaKota);
                  return;
                }
              }
              fetchCirebonDirect(yyyy, mm, dd);
            } catch (e) {
              fetchCirebonDirect(yyyy, mm, dd);
            }
          },
          (error) => {
            fetchCirebonDirect(yyyy, mm, dd);
          },
          { timeout: 8000, enableHighAccuracy: false }
        );
      } else {
        fetchCirebonDirect(yyyy, mm, dd);
      }
    } catch (err) {
      console.error('Gagal mengambil jadwal sholat:', err);
    }
  }

  async function fetchCirebonDirect(yyyy, mm, dd) {
    try {
      const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/1202/${yyyy}/${mm}/${dd}`);
      const result = await res.json();
      if (result && result.status && result.data) {
        setJadwalSholat(result.data.jadwal);
        setKotaSholat(result.data.lokasi || 'KAB. CIREBON');
      }
    } catch (e) {
      console.error('Gagal ambil data Cirebon:', e);
    }
  }

  const handleSelectKotaManual = (e) => {
    const id = e.target.value;
    setSelectedKotaId(id);
    if (id === 'auto') {
      localStorage.removeItem('manual_kota_id');
      fetchJadwalSholat();
    } else {
      localStorage.setItem('manual_kota_id', id);
      fetchJadwalSholat(id);
    }
  };
  
  const checkSholatAlarm = (currentHHMM) => {
    if (!jadwalSholat) return;

    const daftarWaktu = [
      { name: 'Subuh', time: jadwalSholat.subuh },
      { name: 'Dzuhur', time: jadwalSholat.dzuhur },
      { name: 'Ashar', time: jadwalSholat.ashar },
      { name: 'Maghrib', time: jadwalSholat.maghrib },
      { name: 'Isya', time: jadwalSholat.isya }
    ];

    daftarWaktu.forEach(s => {
      if (s.time === currentHHMM && lastTriggeredSholat.current !== `${s.name}_${currentHHMM}`) {
        lastTriggeredSholat.current = `${s.name}_${currentHHMM}`;
        playAlarmSound();
        triggerNotification(s.name);
      }
    });
  };

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1.5);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 2);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const triggerNotification = (namaSholat) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`🕌 Waktu Sholat ${namaSholat} Tiba!`, {
        body: `Telah masuk waktu sholat ${namaSholat} untuk wilayah ${kotaSholat} dan sekitarnya.`,
        icon: logoUrl || '/favicon.ico'
      });
    } else {
      alert(`🕌 Waktu Sholat ${namaSholat} Telah Tiba!`);
    }
  };

  async function checkAdminSession() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) return setIsAdmin(false);
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
  const listRekening = parseBankInfo(bankInfo);

  const drawerMenus = [
    { name: 'Jadwal Sholat & Alarm', action: () => setShowSholatModal(true), icon: Clock, color: 'text-emerald-400 bg-emerald-500/20' },
    { name: 'Transaksi Kas', href: '/transaksi', icon: CreditCard, color: 'text-cyan-400 bg-cyan-500/20' },
    { name: 'Jadwal Acara', href: '/acara', icon: Calendar, color: 'text-amber-400 bg-amber-500/20' },
    { name: 'Galeri Dokumentasi', href: '/dokumentasi', icon: Images, color: 'text-purple-400 bg-purple-500/20' },
    { name: 'Kepanitiaan', href: '/kepanitiaan', icon: Users, color: 'text-blue-400 bg-blue-500/20' },
    ...(isAdmin ? [{ name: 'Setelan Sistem', href: '/pengaturan', icon: Settings, color: 'text-rose-400 bg-rose-500/20' }] : [])
  ];

  return (
    <html lang="id" style={{ backgroundColor: currentStyle.bodyBg }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="color-scheme" content="dark light" />
        
        {/* 🚀 TAG MANIFEST PWA & APK SUPPORT */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#080d1a" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body 
        style={{ backgroundColor: currentStyle.bodyBg }} 
        className={`${currentStyle.bodyClass} font-['Plus_Jakarta_Sans',sans-serif] min-h-screen flex flex-col pb-32 transition-all duration-300 antialiased relative overflow-x-hidden`}
      >
        
        <div className="w-full min-h-screen flex flex-col relative z-10">
          
          {/* HEADER */}
          <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 relative">
            <div className={`p-4 md:p-6 ${currentStyle.liquidCard} rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full relative overflow-hidden transition-all duration-300`}>
              
              <div className="flex flex-row items-center gap-3 sm:gap-4 flex-1 min-w-0 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 p-0.5 rounded-2xl shrink-0 shadow-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className={`w-6 h-6 ${currentStyle.accentText}`} />
                    )}
                  </div>
                </div>
                
                <div className="text-left space-y-1 min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                    <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase leading-tight text-white break-words">
                      {orgName}
                    </h1>
                    <span className={`w-fit px-2.5 py-0.5 text-[9px] rounded-full font-mono font-black uppercase ${currentStyle.accentBadge}`}>
                      {isAdmin ? '⚡ ADMIN' : 'PUBLIC'}
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-200/90 font-mono leading-normal break-words font-semibold">
                    📍 {address}
                  </p>
                </div>
              </div>

              {/* LIVE CLOCK & RAPID SHOLAT BUTTON */}
              <div className="flex items-center gap-2 sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0 shrink-0 relative z-10">
                <button 
                  onClick={() => setShowSholatModal(true)} 
                  className="flex items-center gap-1.5 text-xs font-black font-mono tracking-wider text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-500/40 backdrop-blur-md shadow-inner transition-all"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Jadwal Sholat</span>
                </button>
                {timeString && (
                  <span className={`text-[10px] font-bold font-mono tracking-wide ${currentStyle.textMuted}`}>{timeString} • {dateString}</span>
                )}
              </div>

            </div>
          </div>

          {/* MAIN CONTENT */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 mb-8">
            {children}
            <div className="h-12 w-full pointer-events-none" />
          </main>

          {/* FOOTER */}
          <footer className={`py-6 border-t border-white/10 text-center text-[10px] ${currentStyle.textMuted} font-bold tracking-widest uppercase mb-6`}>
            Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}
          </footer>

        </div>

{/* 🎯 BOTTOM NAV BAR DOCK SOLID DENGAN KONTRAS MENYALA/MATI YANG PAS */}
<div 
  style={{ backgroundColor: currentStyle.bodyBg }}
  className="fixed bottom-0 left-0 right-0 w-full z-50 border-t border-slate-800 shadow-[0_-12px_30px_rgba(0,0,0,0.95)]"
>
  <div className="w-full max-w-md mx-auto h-16 flex items-center justify-around px-3">
    
    {/* 1. HOME */}
    <Link 
      href="/" 
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
        pathname === '/' 
          ? `${currentStyle.accentText} font-black bg-cyan-500/10 scale-105 border border-cyan-400/40 shadow-md shadow-cyan-500/20` 
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <Home className="w-5 h-5" />
      <span className="text-[9px] font-bold mt-0.5">Home</span>
    </Link>

    {/* 2. STAT */}
    <Link 
      href="/stat" 
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
        pathname === '/stat' 
          ? `${currentStyle.accentText} font-black bg-cyan-500/10 scale-105 border border-cyan-400/40 shadow-md shadow-cyan-500/20` 
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <BarChart3 className="w-5 h-5" />
      <span className="text-[9px] font-bold mt-0.5">Stat</span>
    </Link>

    {/* 3. DONASI (TETAP MENONJOL/MENYALA) */}
    <button 
      onClick={() => setShowDonationModal(true)} 
      className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-slate-950 bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-300 hover:scale-105 shadow-lg shadow-cyan-400/30 transform active:scale-95 transition-all -mt-3 border-2 border-slate-900"
    >
      <Gift className="w-6 h-6 stroke-[2.5]" />
    </button>

    {/* 4. BUDGET */}
    <Link 
      href="/anggaran" 
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
        pathname === '/anggaran' 
          ? `${currentStyle.accentText} font-black bg-cyan-500/10 scale-105 border border-cyan-400/40 shadow-md shadow-cyan-500/20` 
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <ClipboardList className="w-5 h-5" />
      <span className="text-[9px] font-bold mt-0.5">Budget</span>
    </Link>

    {/* 5. MENU */}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        setShowMainMenuDrawer((prev) => !prev);
      }} 
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
        showMainMenuDrawer 
          ? `${currentStyle.accentText} font-black bg-cyan-500/10 scale-105 border border-cyan-400/40 shadow-md shadow-cyan-500/20` 
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <Menu className="w-5 h-5" />
      <span className="text-[9px] font-bold mt-0.5">Menu</span>
    </button>

  </div>
</div>

        {/* 🕌 MODAL JADWAL SHOLAT AUTOMATIC + SELEKSI KOTA MANUAL */}
        {showSholatModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-slate-900 to-emerald-950 border border-emerald-500/40 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-white">
              <button onClick={() => setShowSholatModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white">
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-1">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 w-fit rounded-2xl mx-auto mb-2 border border-emerald-400/30">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">Jadwal Sholat Hari Ini</h3>
                <p className="text-[10px] font-mono text-emerald-200/80">📍 {kotaSholat} & Sekitarnya</p>
              </div>

              {/* DROPDOWN MANUAL PILIH KOTA */}
              <div className="p-2.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-1">
                <label className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase font-mono">
                  <MapPin className="w-3 h-3 text-cyan-400" /> Lokasi Kota / Wilayah:
                </label>
                <select
                  value={selectedKotaId}
                  onChange={handleSelectKotaManual}
                  className="w-full bg-slate-800 text-xs text-emerald-300 font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="auto">🌐 Deteksi Otomatis (GPS)</option>
                  {DAFTAR_KOTA.map((k) => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>

              {/* TOGGLE MUTE/UNMUTE ALARM */}
              <div className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isAlarmActive ? <Bell className="w-4 h-4 text-emerald-400 animate-bounce" /> : <BellOff className="w-4 h-4 text-rose-400" />}
                  <span className="text-xs font-bold text-slate-200">Alarm Waktu Sholat</span>
                </div>
                <button 
                  onClick={() => {
                    setIsAlarmActive(!isAlarmActive);
                    if (!isAlarmActive) playAlarmSound();
                  }}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase font-mono transition-all ${isAlarmActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}
                >
                  {isAlarmActive ? 'Aktif 🔔' : 'Mute 🔕'}
                </button>
              </div>

              {jadwalSholat ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { name: 'Imsak', time: jadwalSholat.imsak },
                    { name: 'Subuh', time: jadwalSholat.subuh },
                    { name: 'Terbit', time: jadwalSholat.terbit },
                    { name: 'Dzuhur', time: jadwalSholat.dzuhur },
                    { name: 'Ashar', time: jadwalSholat.ashar },
                    { name: 'Maghrib', time: jadwalSholat.maghrib },
                    { name: 'Isya', time: jadwalSholat.isya }
                  ].map((s, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-300">{s.name}</span>
                      <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-800">{s.time} WIB</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs font-mono text-slate-400 animate-pulse">
                  Mendeteksi lokasi & jadwal sholat...
                </div>
              )}

              <button onClick={() => setShowSholatModal(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black rounded-2xl transition-all font-mono uppercase shadow-lg shadow-emerald-600/30">
                Tutup Jadwal
              </button>
            </div>
          </div>
        )}

        {/* MODAL DONASI */}
        {showDonationModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-white">
              <button onClick={() => setShowDonationModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white">
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-1">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 w-fit rounded-2xl mx-auto mb-2 border border-emerald-400/30">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Rekening Donasi Jemaah</h3>
                <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto font-medium">
                  Salurkan infak & sedekah jariyah Anda melalui opsi rekening resmi berikut:
                </p>
              </div>
              
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5">
                {listRekening.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between gap-3 shadow-md">
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="inline-block text-[9px] font-black font-mono px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase border border-amber-300 shadow-xs">
                        {item.bank}
                      </span>
                      <p className="text-xs font-black font-mono tracking-wider text-white select-all">
                        {item.number}
                      </p>
                      <p className="text-[9px] text-slate-400 font-sans truncate font-medium">
                        AN. <span className="font-bold text-slate-200">{item.name}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCopy(item.number, idx)}
                      className={`px-3 py-2 rounded-xl font-mono text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1 ${copiedIndex === idx ? 'bg-emerald-500 text-black shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'}`}
                    >
                      {copiedIndex === idx ? <><Check className="w-3.5 h-3.5" /> Disalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowDonationModal(false)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-2xl transition-all font-mono uppercase border border-slate-700">
                Tutup Window
              </button>
            </div>
          </div>
        )}

        {/* 📱 DRAWER MENU */}
        {showMainMenuDrawer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center">
            <div 
              className="absolute inset-0 z-0" 
              onClick={() => setShowMainMenuDrawer(false)} 
            />

            <div 
              className="w-full max-w-md bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 space-y-4 shadow-2xl text-white relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-2" />
              <div className="text-center">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Navigasi Halaman</h4>
              </div>
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {drawerMenus.map((dm, idx) => {
                  const IconComponent = dm.icon;
                  if (dm.action) {
                    return (
                      <button 
                        key={idx}
                        onClick={(e) => { 
                          e.stopPropagation();
                          setShowMainMenuDrawer(false);
                          dm.action(); 
                        }}
                        className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-left flex justify-between items-center transition-all bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${dm.color}`}>
                            <IconComponent className="w-4 h-4 shrink-0" />
                          </div>
                          <span>{dm.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>
                    );
                  }
                  return (
                    <Link 
                      key={dm.href} 
                      href={dm.href} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMainMenuDrawer(false);
                      }}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs text-left flex justify-between items-center transition-all active:scale-95 ${
                        pathname === dm.href 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30' 
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700'
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
              <div className="pt-4 border-t border-slate-800">
                {isAdmin ? (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      setShowMainMenuDrawer(false); 
                      handleLogout(); 
                    }} 
                    className="w-full py-3 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95"
                  >
                    <LogOut className="w-4 h-4" /> Keluar Mode Admin
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      setShowMainMenuDrawer(false); 
                      setShowLoginModal(true); 
                    }} 
                    className="w-full py-3.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95"
                  >
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
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-white">
              <div className="text-center">
                <div className="p-3 bg-amber-500/20 text-amber-300 w-fit rounded-2xl mx-auto mb-2 border border-amber-400/30">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Otorisasi Sistem</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Masukkan kata sandi untuk masuk ke Mode Admin</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="password" placeholder="Password Admin" required autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-center font-mono tracking-widest text-white focus:outline-none focus:border-cyan-400" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowLoginModal(false); setPasswordInput(''); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-2xl">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-extrabold text-xs uppercase rounded-2xl shadow-md">Masuk</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
