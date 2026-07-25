'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, MapPin, Navigation, ExternalLink, Loader2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default function PetaPage() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMapConfig() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('map_settings')
          .select('*')
          .eq('id', 'main_map')
          .single();

        if (data) {
          setMapData(data);
        }
      } catch (err) {
        console.error('Gagal memuat pengaturan peta:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMapConfig();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Tombol Kembali */}
      <div className="flex items-center justify-between theme-bg-secondary theme-border p-4 rounded-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold theme-text-accent hover:opacity-80">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Utama
        </Link>
      </div>

      {/* Header Judul */}
      <div className="text-center space-y-1 py-2">
        <h2 className="text-base font-black uppercase tracking-wider theme-text-primary flex items-center justify-center gap-2">
          <MapPin className="w-5 h-5 text-rose-400" /> Peta & Lokasi Utama Haul
        </h2>
        <p className="text-xs theme-text-secondary font-medium">
          Panduan arah dan titik lokasi ziarah akbar Maqbaroh Buyut Kepuh & Buyut Besus
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
          <p className="text-xs theme-text-secondary font-mono">Memuat titik koordinat lokasi...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Kotak Informasi Lokasi */}
          <div className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-3 shadow-md">
            <h3 className="text-sm font-black theme-text-primary uppercase flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" /> {mapData?.title || 'Lokasi Haul'}
            </h3>
            <p className="text-xs theme-text-secondary leading-relaxed">
              {mapData?.address_detail || 'Alamat belum diatur oleh Admin.'}
            </p>
            {mapData?.embed_url && (
              <div className="pt-2">
                <a 
                  href={`https://maps.google.com/?q=${mapData.latitude},${mapData.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md hover:opacity-90 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Buka di Google Maps Langsung
                </a>
              </div>
            )}
          </div>

          {/* Frame Google Maps Embed */}
          <div className="theme-bg-secondary border theme-border p-2 rounded-3xl overflow-hidden shadow-lg h-[400px]">
            {mapData?.embed_url ? (
              <iframe
                title="Peta Lokasi Haul"
                src={mapData.embed_url}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '1.2rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs theme-text-secondary font-mono">
                URL Embed Peta belum dikonfigurasi.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
