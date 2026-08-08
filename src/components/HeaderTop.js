'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client di luar komponen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default function HeaderTop() {
  const [orgName, setOrgName] = useState('Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus');
  const [address, setAddress] = useState('Blok. Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon');
  const [bankInfo, setBankInfo] = useState('Bank Mandiri - 134xxxxxxxx | BCA - 822xxxxxxx | BJB - 009xxxxxxx');
  const [logoUrl, setLogoUrl] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadHeaderSettings() {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('settings')
          .select('org_name, address, bank_info, logo_url')
          .eq('id', 'main_config')
          .maybeSingle();

        if (error) {
          console.warn("Gagal mengambil konfigurasi Supabase:", error.message);
          return;
        }

        if (data) {
          if (data.org_name) setOrgName(data.org_name);
          if (data.address) setAddress(data.address);
          if (data.bank_info) setBankInfo(data.bank_info);
          if (data.logo_url) setLogoUrl(data.logo_url);
        }
      } catch (err) {
        console.error("Gagal memuat header dinamis, menggunakan data bawaan:", err);
      }
    }

    loadHeaderSettings();
  }, []);

  return (
    <div className="p-4 sm:p-5 bg-slate-900 border-slate-800 text-slate-100 border rounded-2xl shadow-xl w-full max-w-xl mx-auto space-y-3.5 mb-5 transition-all">
      {/* Bagian Atas: Logo, Nama Organisasi, Badge Admin & Alamat */}
      <div className="flex items-start gap-3.5">
        {/* Container Logo */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-slate-950 border border-slate-800/60 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
          {logoUrl && !imageError ? (
            <Image 
              src={logoUrl} 
              alt="Logo Resmi" 
              fill 
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
              <path d="M2 22h20"/><path d="M12 2v3"/><path d="M12 7a5 5 0 0 1 5 5v10H7V12a5 5 0 0 1 5-5z"/>
            </svg>
          )}
        </div>

        {/* Detail Teks Organisasi */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase leading-tight">
              {orgName}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              ⚡ ADMIN
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-cyan-400/90 flex items-center gap-1 truncate">
            <span>📍</span>
            <span className="truncate">{address}</span>
          </p>
        </div>
      </div>

      {/* Bagian Bawah: Tombol Sholat & Jam/Tanggal */}
      <div className="pt-3 border-t border-white/10 flex flex-row items-center justify-between gap-2 text-xs">
        <button className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 rounded-full transition-colors text-[11px] font-medium cursor-pointer">
          <span>🕌</span>
          <span>Jadwal Sholat</span>
        </button>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
          <span>10.59.26</span>
          <span>•</span>
          <span>Sab, 25 Jul 2026</span>
        </div>
      </div>

      {/* Catatan Info Bank */}
      {bankInfo && (
        <div className="text-[10px] text-cyan-400/90 font-mono pt-1 text-center sm:text-left truncate opacity-80">
          💳 {bankInfo}
        </div>
      )}
    </div>
  );
}
