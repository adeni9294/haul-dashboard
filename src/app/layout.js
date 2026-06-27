'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import '@/app/globals.css'; // Sesuaikan jalur impor CSS global proyek Anda jika berbeda

export default function RootLayout({ children }) {
  // State Identitas Header Dinamis
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    async function loadHeaderSettings() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Membaca data settings secara aman
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'main_config');

        if (!error && data && data.length > 0) {
          const config = data[0];
          if (config.org_name) setOrgName(config.org_name);
          if (config.address) setAddress(config.address);
          if (config.bank_info) setBankInfo(config.bank_info);
          if (config.logo_url) setLogoUrl(config.logo_url);
        }
      } catch (err) {
        console.error("Gagal memuat header dinamis:", err);
      }
    }
    loadHeaderSettings();
  }, []);

  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-amber-500/30">
        <div className="flex flex-col min-h-screen">
          
          {/* BANNER KOP HEADER ATAS DINAMIS */}
          <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6">
            <div className="p-4 md:p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-lg w-full">
              {/* Lingkaran Logo Dinamis */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Resmi" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[10px] md:text-xs font-black text-amber-500 font-mono tracking-widest">LOGO</div>
                )}
              </div>

              {/* Teks Informasi */}
              <div className="text-center md:text-left space-y-1 flex-1">
                <h1 className="text-sm md:text-base font-black text-amber-500 tracking-wide">{orgName}</h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">{address}</p>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 max-w-max mx-auto md:mx-0 mt-1">
                  💳 {bankInfo}
                </p>
              </div>
            </div>
          </div>

          {/* AREA KONTEN UTAMA DAN NAVIGASI */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
