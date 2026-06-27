'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  const [activeTheme, setActiveTheme] = useState('slate-dark');

  useEffect(() => {
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
          if (config.theme) setActiveTheme(config.theme);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadHeaderSettings();
  }, [pathname]); // Memuat ulang data konfigurasi setiap kali perpindahan menu terjadi

  const menuItems = [
    { name: '📊 Dashboard', path: '/' },
    { name: '💰 Buku Kas', path: '/transaksi' },
    { name: '📈 Anggaran', path: '/anggaran' },
    { name: '👥 Kepanitiaan', path: '/kepanitiaan' },
    { name: '📅 Acara & Schedule', path: '/acara' },
    { name: '⚙️ Pengaturan', path: '/pengaturan' },
  ];

  return (
    <html lang="id">
      {/* Menggabungkan variabel tema aktif ke dalam class body */}
      <body className={`theme-${activeTheme} bg-slate-950 text-slate-100 min-h-screen antialiased transition-colors duration-300`}>
        <div className="flex flex-col min-h-screen">
          <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6">
            <div className="p-4 md:p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-lg w-full">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <div className="text-xs text-amber-500 font-mono">LOGO</div>}
              </div>
              <div className="text-center md:text-left space-y-1 flex-1">
                <h1 className="text-sm md:text-base font-black text-amber-500 tracking-wide">{orgName}</h1>
                <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed">{address}</p>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 mt-1">💳 {bankInfo}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-64 shrink-0">
              <nav className="flex md:flex-col gap-2 p-2 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-x-auto">
                {menuItems.map((item) => (
                  <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold w-full ${pathname === item.path ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </aside>
            <main className="flex-1 min-w-0 bg-slate-900/20 border border-slate-800/40 p-4 md:p-6 rounded-2xl">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
