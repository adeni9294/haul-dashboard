'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PengaturanPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // State Pengaturan Lengkap
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [theme, setTheme] = useState('dark_amber');
  const [logoUrl, setLogoUrl] = useState('');
  
  // Menu pengaturan tambahan Anda yang sempat hilang
  const [announcement, setAnnouncement] = useState('');
  const [phoneContact, setPhoneContact] = useState('');
  const [targetNotes, setTargetNotes] = useState('');

  // Konfigurasi Client Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }

    async function fetchSettings() {
      try {
        if (!supabaseUrl || !supabaseKey) return;
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
          setAnnouncement(data.announcement || '');
          setPhoneContact(data.phone_contact || '');
          setTargetNotes(data.target_notes || '');
        }
      } catch (err) {
        console.error('Error loading settings:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Fungsi Sistem Pengunggahan (Upload) Berkas Gambar Logo Langsung
  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isAdmin) {
      alert('Akses ditolak. Anda harus berada dalam Mode Admin!');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Unggah gambar ke Supabase Storage bucket 'logos'
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil tautan URL publik gambar yang berhasil diunggah
      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      alert('Berhasil! Gambar logo baru terunggah ke cloud storage. Jangan lupa klik tombol Simpan Pengaturan di bawah.');
    } catch (err) {
      alert(`Gagal mengunggah file: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isAdmin || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'main_config',
          org_name: orgName,
          address: address,
          bank_info: bankInfo,
          theme: theme,
          logo_url: logoUrl,
          announcement: announcement,
          phone_contact: phoneContact,
          target_notes: targetNotes
        });

      if (error) throw error;
      alert('Sukses! Seluruh susunan konfigurasi sistem berhasil diperbarui secara global.');
      window.location.reload();
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
    <div className="space-y-6 max-w-4xl mx-auto px-2 pb-12 animate-fadeIn">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-white">⚙️ Pengaturan Global Workspace</h2>
        <p className="text-[11px] md:text-xs text-slate-400">Modifikasi penuh identitas kepanitiaan, informasi keuangan, berkas media logo, dan optimalisasi tampilan.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <form onSubmit={handleSaveSettings} className="p-4 md:p-6 space-y-6">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-3">🎨 Kustomisasi Menu Lengkap</h3>
          
          <div className="grid grid-cols-1 gap-4 text-xs">
            {/* Bagian 1: Identitas Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Nama Organisasi / Panitia</label>
                <input 
                  type="text" required value={orgName} onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Nomor Kontak / WhatsApp Sekretariat</label>
                <input 
                  type="text" value={phoneContact} onChange={(e) => setPhoneContact(e.target.value)}
                  placeholder="Contoh: 081234567xxx"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Bagian 2: Alamat & Rekening */}
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Alamat / Lokasi Sekretariat</label>
              <textarea 
                rows="2" value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Informasi Rekening Bank Panitia</label>
              <input 
                type="text" value={bankInfo} onChange={(e) => setBankInfo(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Bagian 3: Pengumuman & Catatan Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Teks Pengumuman / Berita Terkini</label>
                <textarea 
                  rows="3" value={announcement} onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Teks ini akan muncul sebagai info banner utama di halaman depan..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Catatan Tambahan Progres Anggaran</label>
                <textarea 
                  rows="3" value={targetNotes} onChange={(e) => setTargetNotes(e.target.value)}
                  placeholder="Catatan kecil di bawah bagan progres target keuangan..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>
            </div>

            {/* Bagian 4: Sistem Upload Logo & Tema Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">⚙️ Berkas Gambar Logo (Sistem Upload)</label>
                <div className="space-y-2">
                  <input 
                    type="file" accept="image/*" disabled={!isAdmin || uploading} onChange={handleUploadLogo}
                    className="w-full text-slate-400 text-[11px] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:cursor-pointer"
                  />
                  {logoUrl && (
                    <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800/80 rounded-xl">
                      <img src={logoUrl} alt="Preview Logo" className="w-8 h-8 rounded-lg object-cover bg-slate-900 border border-slate-800" />
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{logoUrl}</span>
                    </div>
                  )}
                  {uploading && <p className="text-[10px] text-amber-400 animate-pulse">⏳ Sedang mengunggah berkas ke Supabase storage...</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Pilih Tema Gaya Visual</label>
                <select
                  value={theme} onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="dark_amber">Premium Dark Amber (Emas Gelap)</option>
                  <option value="dark_emerald">Classic Dark Emerald (Hijau Islami)</option>
                  <option value="dark_slate">Minimalist Modern Slate (Abu-abu)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tombol Simpan Responsif Mobile */}
          <div className="border-t border-slate-800/60 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {!isAdmin && (
              <p className="text-[11px] text-rose-400 font-medium bg-rose-500/5 border border-rose-500/10 px-3 py-2 rounded-xl text-center md:text-left">
                🔒 Fitur terkunci! Silakan aktifkan Mode Admin di pojok kiri bawah untuk dapat mengubah konfigurasi.
              </p>
            )}
            <button 
              type="submit" disabled={!isAdmin || submitting || uploading}
              className="w-full md:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all md:ml-auto"
            >
              {submitting ? '⏳ Memproses...' : '💾 Simpan Konformasi Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
