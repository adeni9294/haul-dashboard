'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function HeaderTop() {
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
        
        // Menggunakan query aman tanpa .single() untuk mencegah error jika data kosong
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
        console.error("Gagal memuat header dinamis, menggunakan data bawaan:", err);
      }
    }
    loadHeaderSettings();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-lg w-full mb-6">
      {/* ELEMEN LOGO - Menampilkan Gambar jika ada, jika tidak ada kembali ke teks LOGO */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo Resmi" className="w-full h-full object-cover" />
        ) : (
          <div className="text-[10px] md:text-xs font-black text-amber-500 font-mono tracking-widest">LOGO</div>
        )}
      </div>

      {/* INFORMASI PANITIA */}
      <div className="text-center md:text-left space-y-1 flex-1">
        <h1 className="text-sm md:text-base font-black text-amber-500 tracking-wide">{orgName}</h1>
        <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">{address}</p>
        <p className="text-[9px] md:text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 max-w-max mx-auto md:mx-0 mt-1">
          💳 {bankInfo}
        </p>
      </div>
    </div>
  );
}
