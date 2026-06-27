'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function HeaderTop() {
  const [config, setConfig] = useState({
    org_name: 'Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus',
    address: 'Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon',
    bank_info: 'Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx',
    logo_url: ''
  });

  useEffect(() => {
    async function loadHeaderSettings() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'main_config')
          .single();

        if (data) {
          setConfig({
            org_name: data.org_name || config.org_name,
            address: data.address || config.address,
            bank_info: data.bank_info || config.bank_info,
            logo_url: data.logo_url || ''
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadHeaderSettings();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-lg">
      {/* ELEMEN LOGO DINAMIS - Berubah Otomatis Setelah Upload Berhasil */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 rounded-full border border-slate-800/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
        {config.logo_url ? (
          <img src={config.logo_url} alt="Logo Resmi" className="w-full h-full object-cover" />
        ) : (
          <div className="text-[10px] md:text-xs font-black text-amber-500 font-mono tracking-widest animate-pulse">LOGO</div>
        )}
      </div>

      {/* INFORMASI UTAMA PANITIA */}
      <div className="text-center md:text-left space-y-1 flex-1">
        <h1 className="text-sm md:text-base font-black text-amber-500 tracking-wide">{config.org_name}</h1>
        <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">{config.address}</p>
        <p className="text-[9px] md:text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-850 max-w-max mx-auto md:mx-0">
          💳 {config.bank_info}
        </p>
      </div>
    </div>
  );
}
