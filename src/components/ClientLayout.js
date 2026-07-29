'use client';

import { useState, useEffect, useRef } from 'react';
import SplashScreen from '@/components/SplashScreen';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlassCard from '@/components/GlassCard';

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
  MapPin,
  CheckCircle2,
  AlertCircle,
  Info,
  BookOpen,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RotateCcw,
  Power
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Helper untuk konversi VAPID Key Public Base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const THEME_STYLES = {
  'default': { name: 'Default Navy', accentBadge: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold', accentText: 'text-cyan-400' },
  'emerald-cyber': { name: 'Emerald Cyber', accentBadge: 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 font-bold', accentText: 'text-emerald-400' },
  'velvet-rose': { name: 'Velvet Rose', accentBadge: 'bg-pink-500/20 text-pink-400 border border-pink-500/30 font-bold', accentText: 'text-pink-400' },
  'neon-sunset': { name: 'Neon Sunset', accentBadge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold', accentText: 'text-orange-400' },
  'nordic-frost': { name: 'Nordic Frost', accentBadge: 'bg-sky-400/20 text-sky-400 border border-sky-400/30 font-bold', accentText: 'text-sky-400' },
  'tokyo-night': { name: 'Tokyo Night', accentBadge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold', accentText: 'text-purple-400' },
  'amber-gold': { name: 'Amber Gold', accentBadge: 'bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold', accentText: 'text-amber-400' },
  'cyberpunk-2076': { name: 'Cyberpunk 2076', accentBadge: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 font-bold', accentText: 'text-yellow-400' },
  'ocean-deep': { name: 'Ocean Deep', accentBadge: 'bg-blue-600/20 text-blue-400 border border-blue-600/30 font-bold', accentText: 'text-blue-400' },
  'forest-moss': { name: 'Forest Moss', accentBadge: 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 font-bold', accentText: 'text-emerald-400' },
  'crimson-tide': { name: 'Crimson Tide', accentBadge: 'bg-red-600/20 text-red-400 border border-red-600/30 font-bold', accentText: 'text-red-400' },
  'obsidian-stark': { name: 'Obsidian Stark', accentBadge: 'bg-slate-400/20 text-slate-300 border border-slate-400/30 font-bold', accentText: 'text-slate-300' },
  'dracula-vamp': { name: 'Dracula Vamp', accentBadge: 'bg-purple-600/20 text-purple-400 border border-purple-600/30 font-bold', accentText: 'text-purple-400' },
  'coffee-latte': { name: 'Coffee Latte', accentBadge: 'bg-amber-700/20 text-amber-500 border border-amber-700/30 font-bold', accentText: 'text-amber-500' },
  'mint-fresh': { name: 'Mint Fresh', accentBadge: 'bg-teal-400/20 text-teal-300 border border-teal-400/30 font-bold', accentText: 'text-teal-300' },
  'retro-wave': { name: 'Retro Wave', accentBadge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold', accentText: 'text-rose-400' }
};

const DAFTAR_KOTA = [
  { id: '1219', name: 'Kab. Cirebon', city: 'Cirebon', country: 'Indonesia', lat: -6.7589, lng: 108.4812 },
  { id: '1220', name: 'Kota Cirebon', city: 'Cirebon', country: 'Indonesia', lat: -6.7320, lng: 108.5523 },
  { id: '1211', name: 'Kota Bandung', city: 'Bandung', country: 'Indonesia', lat: -6.9175, lng: 107.6191 },
  { id: '1205', name: 'Kab. Bandung Barat', city: 'Ngamprah', country: 'Indonesia', lat: -6.8423, lng: 107.5028 },
  { id: '1301', name: 'DKI Jakarta', city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { id: '1214', name: 'Kab. Indramayu', city: 'Indramayu', country: 'Indonesia', lat: -6.3263, lng: 108.3200 },
  { id: '1215', name: 'Kab. Majalengka', city: 'Majalengka', country: 'Indonesia', lat: -6.8361, lng: 108.2278 },
  { id: '1213', name: 'Kab. Kuningan', city: 'Kuningan', country: 'Indonesia', lat: -6.9760, lng: 108.4831 },
  { id: '1501', name: 'Kota Semarang', city: 'Semarang', country: 'Indonesia', lat: -6.9667, lng: 110.4167 },
  { id: '1609', name: 'Kota Surabaya', city: 'Surabaya', country: 'Indonesia', lat: -7.2575, lng: 112.7521 }
];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false); 
  const [showSholatModal, setShowSholatModal] = useState(false);
  const [showMainMenuDrawer, setShowMainMenuDrawer] = useState(false); 
  const [passwordInput, setPasswordInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // 🌙 / ☀️ STATE TOGGLE MODE GELAP / TERANG
  const [appMode, setAppMode] = useState('dark');

  const [toastConfig, setToastConfig] = useState({ show: false, type: 'info', title: '', message: '', action: null });

  const showToast = (type, title, message, action = null) => {
    setToastConfig({ show: true, type, title, message, action });
  };

  const closeToast = () => {
    if (toastConfig.action) toastConfig.action();
    setToastConfig({ show: false, type: 'info', title: '', message: '', action: null });
  };
  
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => {
    const savedMode = localStorage.getItem('app_mode') || 'dark';
    setAppMode(savedMode);
    applyAppMode(savedMode);

    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && THEME_STYLES[savedTheme]) {
      setCurrentThemeKey(savedTheme);
    }

    // Registrasi Web Push Notification saat aplikasi pertama kali dimuat
    subscribeUserToPush();
  }, []);

  // 📱 PENANGANAN TOMBOL BACK HP DI PWABUILDER / TWA
  useEffect(() => {
    if (pathname === '/') {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        // Saat tombol Back HP ditekan di halaman Home, langsung keluar dari aplikasi PWABuilder
        window.location.replace('about:blank');
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [pathname]);

  // 🔔 FUNGSI REGISTRASI SERVICE WORKER & WEB PUSH NOTIFICATIONS
  const subscribeUserToPush = async () => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notification tidak didukung di browser ini.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission !== 'granted') {
        console.log('Izin notifikasi belum diberikan atau ditolak.');
        return;
      }

      const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''; 
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription && PUBLIC_VAPID_KEY) {
        const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      if (subscription && supabase) {
        const subJson = subscription.toJSON();
        await supabase.from('push_subscriptions').upsert(
          {
            endpoint: subJson.endpoint,
            keys_p256dh: subJson.keys?.p256dh || '',
            keys_auth: subJson.keys?.auth || ''
          },
          { onConflict: 'endpoint' }
        );
        console.log('Berhasil terdaftar untuk Web Push Notification!');
      }
    } catch (err) {
      console.error('Gagal meregister Web Push:', err);
    }
  };

  const applyAppMode = (mode) => {
    const root = document.documentElement;
    const body = document.body;

    if (mode === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark');
      body.classList.add('light-mode');
      body.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light-mode');
      body.classList.add('dark');
      body.classList.remove('light-mode');
    }
  };

  const toggleAppMode = () => {
    const nextMode = appMode === 'dark' ? 'light' : 'dark';
    setAppMode(nextMode);
    localStorage.setItem('app_mode', nextMode);
    applyAppMode(nextMode);
  };

  useEffect(() => {
    document.body.className = document.body.className
      .replace(/theme-[^\s]+/g, '')
      .trim();

    document.body.classList.add(`theme-${currentThemeKey}`);
  }, [currentThemeKey]);

  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  const [jadwalSholat, setJadwalSholat] = useState(null);
  const [tanggalHijriah, setTanggalHijriah] = useState('');
  const [kotaSholat, setKotaSholat] = useState('KAB. CIREBON');
  const [selectedKotaId, setSelectedKotaId] = useState('1219');
  const [isAlarmActive, setIsAlarmActive] = useState(true);
  
  const [isPlayingAdzan, setIsPlayingAdzan] = useState(false);
  const [currentActiveSholat, setCurrentActiveSholat] = useState('');
  const audioRef = useRef(null);
  const lastTriggeredSholat = useRef('');

  useEffect(() => {
    setIsMounted(true);
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const handleTouchEnd = (e) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        const tag = e.target.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    checkAdminSession();
    loadHeaderSettings();

    const savedKotaId = localStorage.getItem('manual_kota_id') || '1219';
    setSelectedKotaId(savedKotaId);

    if (savedKotaId === 'auto') {
      fetchJadwalAutoGPS();
    } else {
      const foundKota = DAFTAR_KOTA.find(k => k.id === savedKotaId);
      if (foundKota) setKotaSholat(foundKota.name.toUpperCase());
      fetchJadwalSholatDirect(savedKotaId);
    }
  }, [selectedKotaId]);

  useEffect(() => {
    const updateTime = () => {
      const sekarang = new Date();
      const jamMenitDetik = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      
      setTimeString(jamMenitDetik);
      setDateString(sekarang.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));

      if (jadwalSholat && isAlarmActive) {
        checkSholatAlarm(jamMenitDetik.slice(0, 5));
      }
    };

    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
  }, [jadwalSholat, isAlarmActive]);

  useEffect(() => {
    setShowMainMenuDrawer(false);
  }, [pathname]);

  // 🧹 FUNGSI MEMBERSIHKAN CACHE PWA DI BROWSER
  const handleClearPWACache = async () => {
    try {
      showToast('info', 'Pembersihan Dimulai', 'Sedang menghapus file temporary & cache PWA...');

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }

      const savedAdminPassword = localStorage.getItem('admin_password_haul');
      const savedThemeMode = localStorage.getItem('app_mode');
      const savedAppTheme = localStorage.getItem('app-theme');

      localStorage.clear();

      if (savedAdminPassword) localStorage.setItem('admin_password_haul', savedAdminPassword);
      if (savedThemeMode) localStorage.setItem('app_mode', savedThemeMode);
      if (savedAppTheme) localStorage.setItem('app-theme', savedAppTheme);

      showToast('success', 'Cache Dibersihkan!', 'PWA telah segar kembali. Memuat ulang aplikasi...');

      setTimeout(() => {
        window.location.reload(true);
      }, 1500);

    } catch (error) {
      console.error('Gagal menghapus cache:', error);
      showToast('error', 'Gagal Hapus Cache', 'Terjadi kendala saat membersihkan memori PWA.');
    }
  };

  // 🚪 FUNGSI KELUAR DARI APLIKASI (OPTIMAL UNTUK PWABUILDER / TWA APK)
  const handleExitApp = () => {
    setShowMainMenuDrawer(false);

    if (typeof window !== 'undefined') {
      // 1. Coba window.close() standar
      try {
        window.close();
      } catch (e) {
        console.log('window.close diblokir browser:', e);
      }

      // 2. Trik langsung memutus history stack di TWA/PWABuilder Android
      // Mengarahkan ke about:blank memicu sistem Android memutus activity PWA
      window.location.replace('about:blank');
    }
  };

  async function fetchJadwalSholatDirect(idKota) {
    try {
      const foundKota = DAFTAR_KOTA.find(k => k.id === idKota) || DAFTAR_KOTA[0];
      
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${foundKota.lat}&longitude=${foundKota.lng}&method=20`);
      const result = await res.json();
      
      if (result && result.code === 200 && result.data) {
        const timings = result.data.timings;
        const hijri = result.data.date.hijri;

        setJadwalSholat({
          imsak: timings.Imsak,
          subuh: timings.Fajr,
          terbit: timings.Sunrise,
          dzuhur: timings.Dhuhr,
          ashar: timings.Asr,
          maghrib: timings.Maghrib,
          isya: timings.Isha
        });

        if (hijri) {
          setTanggalHijriah(`${hijri.day} ${hijri.month.en} ${hijri.year} H`);
        }
      }
    } catch (e) {
      console.error('Gagal mengambil data jadwal sholat Aladhan:', e);
    }
  }

  async function fetchJadwalAutoGPS() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=20`);
            const result = await res.json();
            
            if (result && result.code === 200 && result.data) {
              const timings = result.data.timings;
              const hijri = result.data.date.hijri;

              setKotaSholat('LOKASI SAYA (GPS)');
              setJadwalSholat({
                imsak: timings.Imsak,
                subuh: timings.Fajr,
                terbit: timings.Sunrise,
                dzuhur: timings.Dhuhr,
                ashar: timings.Asr,
                maghrib: timings.Maghrib,
                isya: timings.Isha
              });

              if (hijri) {
                setTanggalHijriah(`${hijri.day} ${hijri.month.en} ${hijri.year} H`);
              }
              return;
            }
            fetchJadwalSholatDirect('1219');
          } catch (e) {
            fetchJadwalSholatDirect('1219');
          }
        },
        () => fetchJadwalSholatDirect('1219'),
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      fetchJadwalSholatDirect('1219');
    }
  }

  const handleSelectKotaManual = (e) => {
    const id = e.target.value;
    setSelectedKotaId(id);
    localStorage.setItem('manual_kota_id', id);

    if (id === 'auto') {
      fetchJadwalAutoGPS();
    } else {
      const foundKota = DAFTAR_KOTA.find(k => k.id === id);
      if (foundKota) setKotaSholat(foundKota.name.toUpperCase());
      fetchJadwalSholatDirect(id);
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
        playAlarmSound(s.name);
        triggerNotification(s.name);
      }
    });
  };

  const playAlarmSound = (namaSholat = 'Dzuhur') => {
    try {
      stopAdzanSound();

      const isSubuh = namaSholat.toLowerCase() === 'subuh';
      const audioFile = isSubuh ? '/audio/adzan-subuh.mp3' : '/audio/adzan-biasa.mp3';

      const audio = new Audio(audioFile);
      audio.volume = 1.0;
      audioRef.current = audio;

      setCurrentActiveSholat(namaSholat);
      setIsPlayingAdzan(true);

      audio.play().catch((err) => {
        console.warn(`Autoplay adzan diblokir browser:`, err);
      });

      audio.onended = () => {
        setIsPlayingAdzan(false);
        setCurrentActiveSholat('');
      };
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  const stopAdzanSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlayingAdzan(false);
    setCurrentActiveSholat('');
  };

  const triggerNotification = (namaSholat) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`🕌 Waktu Sholat ${namaSholat} Tiba!`, {
        body: `Telah masuk waktu sholat ${namaSholat} untuk wilayah ${kotaSholat} dan sekitarnya.`,
        icon: logoUrl || '/favicon.ico'
      });
    } else {
      showToast('info', '🕌 Waktu Sholat Tiba', `Telah masuk waktu sholat ${namaSholat} untuk wilayah ${kotaSholat} dan sekitarnya.`);
    }
  };

  async function checkAdminSession() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword || !supabase) return setIsAdmin(false);
    try {
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      setIsAdmin(!!isValid);
    } catch (err) {
      setIsAdmin(false);
    }
  }

  async function loadHeaderSettings() {
    if (!supabase) return;
    try {
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
    if (!supabase) return;
    try {
      const { data: isValid, error } = await supabase.rpc('verify_admin_password', { p_password: passwordInput });

      if (!error && isValid) {
        localStorage.setItem('admin_password_haul', passwordInput);
        setIsAdmin(true);
        setShowLoginModal(false);
        setPasswordInput('');
        showToast('success', 'Otorisasi Berhasil', 'Anda berhasil masuk ke Mode Admin.', () => window.location.reload());
      } else {
        showToast('error', 'Otorisasi Gagal', 'Kata sandi Admin yang Anda masukkan salah!');
      }
    } catch (err) {
      showToast('error', 'Gangguan Koneksi', 'Gagal terhubung ke server autentikasi Supabase.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_password_haul');
    setIsAdmin(false);
    showToast('info', 'Log Out Berhasil', 'Anda telah keluar dari Mode Admin.', () => window.location.reload());
  };

  const currentStyle = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];
  const listRekening = parseBankInfo(bankInfo);

  // 📖 DRAWER MENUS (DENGAN ACTION & LINK REPLACE UNTUK TWA)
  const drawerMenus = [
    { name: 'Jadwal Sholat & Alarm', action: () => setShowSholatModal(true), icon: Clock, color: 'text-emerald-400 bg-emerald-500/20' },
    { name: 'Yasin, Tahlil & Doa NU', href: '/yasin', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/20' },
    { name: 'Peta & Lokasi Haul', href: '/peta', icon: MapPin, color: 'text-rose-400 bg-rose-500/20' },
    { name: 'Transaksi Kas', href: '/transaksi', icon: CreditCard, color: 'text-cyan-400 bg-cyan-500/20' },
    { name: 'Jadwal Acara', href: '/acara', icon: Calendar, color: 'text-amber-400 bg-amber-500/20' },
    { name: 'Galeri Dokumentasi', href: '/dokumentasi', icon: Images, color: 'text-purple-400 bg-purple-500/20' },
    { name: 'Kepanitiaan', href: '/kepanitiaan', icon: Users, color: 'text-blue-400 bg-blue-500/20' },
    { name: 'Bersihkan Cache PWA', action: handleClearPWACache, icon: RotateCcw, color: 'text-amber-400 bg-amber-500/20' },
    { name: 'Keluar Aplikasi', action: handleExitApp, icon: Power, color: 'text-rose-400 bg-rose-500/20' },
    ...(isAdmin ? [{ name: 'Setelan Sistem', href: '/pengaturan', icon: Settings, color: 'text-rose-400 bg-rose-500/20' }] : [])
  ];

  return (
    <SplashScreen>
      <div className="font-['Plus_Jakarta_Sans',sans-serif] min-h-screen flex flex-col pb-24 md:pb-8 transition-all duration-300 antialiased relative overflow-x-hidden">
        <div className="w-full min-h-screen flex flex-col relative z-10">
          
          {/* HEADER RESPONSIF ADAPTIF MODE DARK/LIGHT */}
          <header className="w-full max-w-xl md:max-w-5xl mx-auto px-3 sm:px-6 pt-4 relative">
            <div 
              className={`backdrop-blur-md p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full relative overflow-hidden transition-all duration-300 border-2 ${
                appMode === 'light'
                  ? 'bg-amber-100/80 border-amber-400/60 shadow-lg shadow-amber-500/10'
                  : 'bg-amber-500/10 border-amber-500/40 shadow-xl shadow-amber-500/20'
              }`}
            >
              
              {/* Sisi Kiri: Logo, Judul & Alamat */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg ${
                  appMode === 'light'
                    ? 'border-amber-600/80 bg-amber-200/60 shadow-amber-600/20'
                    : 'border-amber-400/80 bg-amber-950/40 shadow-amber-500/30'
                }`}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className={`w-6 h-6 ${appMode === 'light' ? 'text-amber-700' : 'text-amber-400'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className={`text-xs sm:text-sm font-black tracking-wide uppercase leading-tight ${
                      appMode === 'light' ? 'text-amber-900' : 'text-amber-300 drop-shadow-sm'
                    }`}>
                      {orgName}
                    </h1>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black font-mono shadow-sm ${
                      appMode === 'light'
                        ? 'bg-amber-500/20 text-amber-900 border border-amber-500/40'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    }`}>
                      {isAdmin ? '⚡ ADMIN' : 'PUBLIC'}
                    </span>
                  </div>

                  <p className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-medium md:whitespace-normal ${
                    appMode === 'light' ? 'text-slate-700' : 'text-amber-200/80'
                  }`}>
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${appMode === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                    <span className="truncate md:whitespace-normal">{address}</span>
                  </p>
                </div>
              </div>

              {/* Sisi Kanan: Toggle Mode Gelap/Terang, Jadwal Sholat & Live Clock */}
              <div className={`pt-3 md:pt-0 border-t md:border-t-0 flex flex-wrap items-center justify-between md:justify-end gap-2.5 text-xs shrink-0 ${
                appMode === 'light' ? 'border-amber-300/60' : 'border-amber-500/30'
              }`}>
                
                {/* 🌙 / ☀️ TOMBOL TOGGLE DARK & LIGHT MODE */}
                <button
                  onClick={toggleAppMode}
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 font-bold shadow-sm cursor-pointer border ${
                    appMode === 'light'
                      ? 'bg-white/80 hover:bg-white text-slate-800 border-amber-400/50'
                      : 'bg-black/40 hover:bg-black/60 text-amber-300 border-amber-400/40'
                  }`}
                  title={appMode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                >
                  {appMode === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                      <span className="text-[10px] font-mono hidden sm:inline uppercase">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-mono hidden sm:inline uppercase">Dark</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => setShowSholatModal(true)} 
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 font-bold shadow-sm cursor-pointer border ${
                    appMode === 'light'
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border-amber-500/40'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-400/40'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 animate-pulse ${appMode === 'light' ? 'text-amber-700' : 'text-amber-400'}`} />
                  <span>Jadwal Sholat</span>
                </button>

                {isMounted && timeString && (
                  <div className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold shrink-0 ${
                    appMode === 'light' ? 'text-amber-900' : 'text-amber-300'
                  }`}>
                    <span>{timeString}</span>
                    <span>•</span>
                    <span>{dateString}</span>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* MAIN CONTENT RESPONSIF */}
          <main className="flex-1 max-w-xl md:max-w-5xl w-full mx-auto px-3 sm:px-6 pt-4 pb-6">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="py-4 border-t theme-border theme-text-tertiary text-center text-[10px] font-mono tracking-widest uppercase mb-4 transition-colors duration-300">
            Dashboard Panitia Haul Maqbaroh Buyut Kepuh &copy; {new Date().getFullYear()}
          </footer>

        </div>

        {/* 🎯 BOTTOM NAV BAR DOCK */}
        <div className="fixed bottom-0 left-0 right-0 w-full z-50 theme-bg-secondary/95 backdrop-blur-md border-t theme-border theme-shadow">
          <div className="w-full max-w-md md:max-w-xl mx-auto h-16 flex items-center justify-around px-3">
            <Link 
              href="/" 
              replace
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                pathname === '/' 
                  ? 'theme-text-accent font-black bg-black/10 dark:bg-white/10 scale-105 border border-slate-300 dark:border-white/20 shadow-md' 
                  : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-0.5">Home</span>
            </Link>

            <Link 
              href="/stat" 
              replace
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                pathname === '/stat' 
                  ? 'theme-text-accent font-black bg-black/10 dark:bg-white/10 scale-105 border border-slate-300 dark:border-white/20 shadow-md' 
                  : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-0.5">Stat</span>
            </Link>

            <button 
              onClick={() => setShowDonationModal(true)} 
              className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl theme-text-primary theme-gradient-main hover:scale-105 shadow-lg transition-all duration-300 cursor-pointer"
            >
              <Gift className="w-6 h-6 stroke-[2.5]" />
            </button>

            <Link 
              href="/anggaran" 
              replace
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                pathname === '/anggaran' 
                  ? 'theme-text-accent font-black bg-black/10 dark:bg-white/10 scale-105 border border-slate-300 dark:border-white/20 shadow-md' 
                  : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-0.5">Budget</span>
            </Link>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMainMenuDrawer((prev) => !prev);
              }} 
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 cursor-pointer ${
                showMainMenuDrawer 
                  ? 'theme-text-accent font-black bg-black/10 dark:bg-white/10 scale-105 border border-slate-300 dark:border-white/20 shadow-md' 
                  : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              <Menu className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-0.5">Menu</span>
            </button>

          </div>
        </div>

        {/* 📢 POP-UP OTOMATIS SAAT ADZAN BERBUNYI */}
        {isPlayingAdzan && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md animate-bounce">
            <GlassCard className="p-4 border-2 border-emerald-400 bg-emerald-950/90 backdrop-blur-xl rounded-3xl shadow-2xl flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 shrink-0 animate-pulse">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300 truncate">
                    🕌 Adzan {currentActiveSholat}
                  </h4>
                  <p className="text-[10px] text-emerald-100 font-mono truncate">
                    Telah masuk waktu sholat {currentActiveSholat}
                  </p>
                </div>
              </div>

              <button
                onClick={stopAdzanSound}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase rounded-2xl shadow-lg border border-rose-400 flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                <VolumeX className="w-4 h-4" />
                <span>Matikan</span>
              </button>
            </GlassCard>
          </div>
        )}

        {/* 🕌 MODAL JADWAL SHOLAT */}
        {showSholatModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="theme-bg-secondary border border-emerald-500/40 p-5 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative theme-text-primary transition-all duration-300">
              <button onClick={() => setShowSholatModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full theme-bg-tertiary hover:theme-bg-tertiary theme-border theme-text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-1">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 w-fit rounded-2xl mx-auto mb-2 border border-emerald-400/30">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-500 dark:text-emerald-300">Jadwal Sholat Hari Ini</h3>
                <p className="text-[10px] font-mono theme-text-secondary uppercase">📍 {kotaSholat} & Sekitarnya</p>
                {tanggalHijriah && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 w-fit mx-auto mt-1">
                    🌙 {tanggalHijriah}
                  </p>
                )}
              </div>

              <div className="p-2.5 theme-bg-tertiary border border-emerald-500/30 rounded-2xl space-y-1">
                <label className="text-[9px] font-bold theme-text-secondary flex items-center gap-1 uppercase font-mono">
                  <MapPin className="w-3 h-3 text-cyan-500 dark:text-cyan-400" /> Lokasi Kota / Wilayah:
                </label>
                <select
                  value={selectedKotaId}
                  onChange={handleSelectKotaManual}
                  className="w-full theme-bg-secondary text-xs theme-text-primary font-bold px-3 py-2 rounded-xl border theme-border focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {DAFTAR_KOTA.map((k) => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                  <option value="auto">🌐 Deteksi Otomatis (GPS)</option>
                </select>
              </div>

              <div className="p-3 theme-bg-tertiary border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isAlarmActive ? <Bell className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-bounce" /> : <BellOff className="w-4 h-4 text-rose-400" />}
                    <span className="text-xs font-bold theme-text-primary">Adzan Otomatis</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAlarmActive(!isAlarmActive);
                      if (!isAlarmActive) playAlarmSound('Dzuhur');
                    }}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase font-mono transition-all cursor-pointer ${isAlarmActive ? 'bg-emerald-500 text-slate-950' : 'theme-bg-secondary theme-text-secondary'}`}
                  >
                    {isAlarmActive ? 'Aktif 🔔' : 'Mute 🔕'}
                  </button>
                </div>

                <div className="flex gap-2 pt-1 border-t theme-border">
                  {isPlayingAdzan ? (
                    <button 
                      onClick={stopAdzanSound}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" /> Hentikan Suara Adzan
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => playAlarmSound('Subuh')}
                        className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Tes Subuh
                      </button>
                      <button 
                        onClick={() => playAlarmSound('Dzuhur')}
                        className="flex-1 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-cyan-500 dark:text-cyan-400" /> Tes Dzuhur
                      </button>
                    </>
                  )}
                </div>
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
                    <div key={idx} className="p-2 theme-bg-tertiary border theme-border rounded-xl flex justify-between items-center">
                      <span className="text-[11px] font-bold theme-text-secondary">{s.name}</span>
                      <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/30 dark:border-emerald-800">{s.time} WIB</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs font-mono theme-text-secondary animate-pulse">
                  Mendeteksi lokasi & jadwal sholat...
                </div>
              )}

              <button onClick={() => setShowSholatModal(false)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black rounded-xl transition-all font-mono uppercase cursor-pointer">
                Tutup Jadwal
              </button>
            </div>
          </div>
        )}

        {/* MODAL DONASI */}
        {showDonationModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="theme-bg-secondary border theme-border p-5 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative theme-text-primary transition-all duration-300">
              <button onClick={() => setShowDonationModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full theme-bg-tertiary hover:theme-bg-tertiary theme-border theme-text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-1">
                <div className="p-3 bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 w-fit rounded-2xl mx-auto mb-2 border border-emerald-400/30">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider theme-text-primary">Rekening Donasi Jemaah</h3>
                <p className="text-[10px] theme-text-secondary max-w-[280px] mx-auto font-medium">
                  Salurkan infak & sedekah jariyah Anda melalui opsi rekening resmi berikut:
                </p>
              </div>
              
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5">
                {listRekening.map((item, idx) => (
                  <div key={idx} className="p-3 theme-bg-tertiary border theme-border rounded-2xl flex items-center justify-between gap-3 shadow-md">
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="inline-block text-[9px] font-black font-mono px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase border border-amber-300">
                        {item.bank}
                      </span>
                      <p className="text-xs font-black font-mono tracking-wider theme-text-primary select-all">
                        {item.number}
                      </p>
                      <p className="text-[9px] theme-text-secondary truncate font-medium">
                        AN. <span className="font-bold theme-text-primary">{item.name}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCopy(item.number, idx)}
                      className={`px-3 py-2 rounded-xl font-mono text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1 cursor-pointer ${copiedIndex === idx ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'theme-bg-secondary theme-text-secondary border theme-border hover:theme-bg-tertiary'}`}
                    >
                      {copiedIndex === idx ? <><Check className="w-3.5 h-3.5" /> Disalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowDonationModal(false)} className="w-full py-2.5 theme-bg-tertiary hover:theme-bg-tertiary theme-text-secondary text-xs font-bold rounded-xl transition-all font-mono uppercase border theme-border cursor-pointer">
                Tutup Window
              </button>
            </div>
          </div>
        )}

        {/* 📱 DRAWER MENU */}
        {showMainMenuDrawer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0" onClick={() => setShowMainMenuDrawer(false)} />
            <div 
              className="w-full max-w-lg theme-bg-secondary border theme-border rounded-3xl p-5 shadow-2xl theme-text-primary relative z-10 transition-all duration-300 flex flex-col max-h-[85vh]" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b theme-border shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">📌</span>
                  <h4 className="text-xs font-black uppercase tracking-widest theme-text-secondary">Navigasi Halaman</h4>
                </div>
                <button 
                  onClick={() => setShowMainMenuDrawer(false)} 
                  className="p-1 rounded-xl theme-bg-tertiary hover:theme-bg-tertiary theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto my-3 pr-1 flex-1 scrollbar-thin">
                <div className="grid grid-cols-2 gap-2.5">
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
                          className="p-3 rounded-2xl font-bold text-xs text-left flex items-center gap-3 transition-all theme-bg-tertiary hover:theme-bg-tertiary theme-text-primary border theme-border group cursor-pointer"
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${dm.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="leading-tight text-[11px]">{dm.name}</span>
                        </button>
                      );
                    }

                    return (
                      <Link 
                        key={dm.href} 
                        href={dm.href} 
                        replace
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMainMenuDrawer(false);
                        }}
                        className={`p-3 rounded-2xl font-bold text-xs text-left flex items-center gap-3 transition-all active:scale-95 group ${
                          pathname === dm.href 
                            ? 'theme-gradient-main text-white shadow-lg border border-white/20' 
                            : 'theme-bg-tertiary hover:theme-bg-tertiary theme-text-primary border theme-border'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${pathname === dm.href ? 'bg-white/20 text-white' : dm.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="leading-tight text-[11px]">{dm.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t theme-border shrink-0">
                {isAdmin ? (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      setShowMainMenuDrawer(false); 
                      handleLogout(); 
                    }} 
                    className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
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
                    className="w-full py-3 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:shadow-purple-600/50 cursor-pointer"
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
            <div className="theme-bg-secondary border theme-border p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl theme-text-primary transition-all duration-300">
              <div className="text-center">
                <div className="p-3 bg-amber-500/20 text-amber-500 dark:text-amber-300 w-fit rounded-2xl mx-auto mb-2 border border-amber-400/30">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider theme-text-primary">Otorisasi Sistem</h3>
                <p className="text-xs theme-text-secondary mt-1 font-medium">Masukkan kata sandi untuk masuk ke Mode Admin</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="password" placeholder="Password Admin" required autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl text-xs focus:outline-none focus:border-cyan-500 transition-all" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowLoginModal(false); setPasswordInput(''); }} className="flex-1 py-3 theme-bg-tertiary hover:theme-bg-tertiary theme-text-secondary text-xs font-bold rounded-2xl border theme-border transition-all cursor-pointer">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-extrabold text-xs uppercase rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer">Masuk</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🔔 CUSTOM FLOATING TOAST DIALOG (CENTER TOP) */}
        {toastConfig.show && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md transition-all duration-300">
            <div className={`px-5 py-3.5 border-2 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
              toastConfig.type === 'error' 
                ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50' 
                : toastConfig.type === 'info'
                ? 'bg-cyan-950/90 border-cyan-500/80 text-cyan-200 shadow-cyan-950/50'
                : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50'
            }`}>
              <span className="text-lg shrink-0">
                {toastConfig.type === 'error' ? '⚠️' : toastConfig.type === 'info' ? 'ℹ️' : '✅'}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-mono font-black text-xs uppercase">{toastConfig.title}</h4>
                <p className="font-mono text-[11px] opacity-90 truncate">{toastConfig.message}</p>
              </div>
              <button onClick={closeToast} className="text-xs font-bold hover:underline opacity-80 cursor-pointer">Tutup</button>
            </div>
          </div>
        )}

      </div>
    </SplashScreen>
  );
}
