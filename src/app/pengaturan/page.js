'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PengaturanPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Form Komponen Pengaturan
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [theme, setTheme] = useState('dark_amber');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }

    async function fetchSettings() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'main_config')
          .single();

        if (data) {
          setOrgName(data.org_name || '');
          setAddress(data.address || '');
          setBankInfo(data.bank_info || '');
          setTheme(data.theme || 'dark_amber');
          setLogoUrl(data.logo_url || '');
        }
      } catch (err) {
        console.error('Error loading settings:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isAdmin || submitting) return;

    setSubmitting(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'main_config',
          org_name: orgName,
          address: address,
          bank_info: bankInfo,
          theme: theme,
          logo_url: logoUrl
        });

      if (error) throw error;
      alert('Sukses! Konfigurasi sistem berhasil diperbarui secara global.');
      window.location.reload(); // Memuat ulang aplikasi agar logo & teks header langsung berubah
    } catch (err) {
      alert(`Gagal menyimpan pengaturan: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[250px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 md:px-0 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white">⚙️ Pengaturan Sistem Workspace</h2>
        <p className="text-xs text-slate-400">Modifikasi identitas kepanitiaan, informasi rekening bank, tautan logo, dan tema visual dashboard.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <form onSubmit={handleSaveSettings} className="p-4 md:p-6 space-y-5">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-3">🎨 Kustomisasi Workspace</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Organisasi / Panitia</label>
              <input 
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Contoh: Panitia Haul Maqbaroh Buyut..."
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Alamat / Lokasi Sekretariat</label>
              <textarea 
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tulis alamat lengkap blok, RT/RW, dan nama desa..."
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Informasi Rekening Bank Panitia (Tampil di Header)</label>
              <input 
                type="text"
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                placeholder="Contoh: Bank Mandiri - 134xxx (a.n...) | BCA - 822xxx"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tautan URL Gambar Logo</label>
                <input 
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://link-gambar.com/logo.png"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Tema Warna</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="dark_amber">Premium Dark Amber (Emas Gelap)</option>
                  <option value="dark_emerald">Classic Dark Emerald (Hijau Islami)</option>
                  <option value="dark_slate">Minimalist Modern Slate (Abu-abu)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {!isAdmin && (
              <p className="text-[11px] text-rose-400 font-medium bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-lg w-full md:w-auto text-center">
                🔒 Simpan terkunci! Silakan aktifkan Mode Admin di pojok kiri bawah.
              </p>
            )}
            <button 
              type="submit" 
              disabled={!isAdmin || submitting}
              className="w-full md:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all ml-auto"
            >
              {submitting ? '⏳ Menyimpan...' : '💾 Simpan Konformasi Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
