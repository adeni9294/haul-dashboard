'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './globals.css';

export default function RootLayout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [time, setTime] = useState('');
  const [theme, setTheme] = useState('emerald-luxury');
  const [config, setConfig] = useState({
    logo: null,
    bank1: 'Bank Mandiri - 134xxxxxxxx (a.n Panitia Haul)',
    bank2: 'BCA - 822xxxxxxx (a.n Panitia Haul)',
    bank3: 'BJB - 009xxxxxxx (a.n Panitia Haul)'
  });

  // Jam Realtime Efek
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' - ' + now.toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Skema 10 Tema Elegan & Modern (Tidak Didominasi Warna Putih)
  const themeClasses = {
    'emerald-luxury': 'bg-slate-950 text-slate-100',
    'royal-gold': 'bg-neutral-950 text-amber-100',
    'midnight-blue': 'bg-zinc-950 text-indigo-100',
    'deep-crimson': 'bg-stone-950 text-rose-100',
    'dark-charcoal': 'bg-neutral-900 text-neutral-100',
    'cyberpunk-neon': 'bg-gray-950 text-cyan-400',
    'vintage-bronze': 'bg-stone-900 text-amber-200/90',
    'oceanic-abyss': 'bg-slate-900 text-sky-100',
    'amethyst-purple': 'bg-neutral-950 text-purple-200',
    'forest-deep': 'bg-zinc-900 text-emerald-200'
  };

  return (
    <html lang="id">
      <body className={`flex min-h-screen antialiased transition-all duration-300 ${themeClasses[theme] || themeClasses['emerald-luxury']}`}>
        {/* Navigasi Utama */}
        <Sidebar isAdmin={isAdmin} onLogout={() => setIsAdmin(false)} />
        
        {/* Sisi Konten Kanan */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Megah Sesuai Permintaan */}
          <header className="p-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-amber-500/30 flex items-center justify-between overflow-hidden shadow-inner">
                {config.logo ? (
                  <img src={config.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-amber-500 font-bold m-auto">LOGO</span>
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-lg font-black tracking-wide text-amber-500">Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus</h2>
                <p className="text-xs text-slate-400 font-medium">Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 text-[11px] text-slate-500 font-mono mt-1">
                  <span>💳 {config.bank1}</span>
                  <span>💳 {config.bank2}</span>
                  <span>💳 {config.bank3}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right font-mono text-xs bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800 shadow-sm text-amber-400/80">
              ⏱️ {time || 'Memuat Waktu...'}
            </div>
          </header>
          
          {/* Main Content Render */}
          <main className="p-8 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}