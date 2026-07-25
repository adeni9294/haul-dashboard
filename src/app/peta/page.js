'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Navigation, Compass, Phone, Shield, Car } from 'lucide-react';

export default function PetaPage() {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=Blok+Cibogo+Kidul+Desa+Warujaya+Kecamatan+Depok+Kabupaten+Cirebon`;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between theme-bg-secondary theme-border p-4 rounded-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold theme-text-accent hover:opacity-80">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Utama
        </Link>
        <span className="text-xs font-mono theme-text-secondary">📍 Panduan Lokasi Haul</span>
      </div>

      <div className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase theme-text-primary">Maqbaroh Buyut Kepuh & Buyut Besus</h2>
            <p className="text-xs theme-text-secondary">Blok Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon</p>
          </div>
        </div>

        <a 
          href={googleMapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Navigation className="w-4 h-4 fill-current" /> Buka di Google Maps / Waze Navigasi
        </a>
      </div>

      {/* Peta Interactive Embed */}
      <div className="theme-bg-secondary border theme-border p-2 rounded-3xl overflow-hidden shadow-lg">
        <iframe
          title="Peta Lokasi Haul"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15849.208154162817!2d108.44123125!3d-6.74581235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6ee32961555555%3A0x1!2sWarujaya%2C%20Depok%2C%20Cirebon!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
          className="w-full h-72 rounded-2xl border-0"
          loading="lazy"
          allowFullScreen
        ></iframe>
      </div>

      {/* Panduan Fasilitas */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider theme-text-secondary px-1">
          🗺️ Panduan Akses & Fasilitas Jemaah
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 theme-bg-secondary border theme-border rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Car className="w-4 h-4" /> Parkir Mobil & Motor
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Area Lapangan Bola Desa Warujaya & Halaman SD Negeri Warujaya (Diarahkan Banser & Karang Taruna).
            </p>
          </div>

          <div className="p-4 theme-bg-secondary border theme-border rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Compass className="w-4 h-4" /> Tempat Wudhu & Toilet
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Tersedia di Musholla Al-Barokah Cibogo Kidul dan Posko Utama Samping Maqbaroh.
            </p>
          </div>

          <div className="p-4 theme-bg-secondary border theme-border rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Shield className="w-4 h-4" /> Posko Keamanan & Kesehatan
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Tim Medis Puskesmas Depok & Pengamanan Gabungan Polsek, Koramil, serta Banser NU.
            </p>
          </div>

          <div className="p-4 theme-bg-secondary border theme-border rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
              <Phone className="w-4 h-4" /> Call Center Panitia
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed font-mono">
              Hubungi Sekretariat Haul: +62 822-xxxx-xxxx (Posko Utama)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
