'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PengaturanPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState('default');
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // State untuk Ubah Sandi
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Daftar 15 Tema Modern Baru + Default
  const listTema = [
    { id: 'default', name: 'Slate Default (Bawaan)' },
    { id: 'emerald-cyber', name: 'Emerald Cyber (Hijau Hitam)' },
    { id: 'velvet-rose', name: 'Velvet Rose (Ungu Gelap)' },
    { id: 'neon-sunset', name: 'Neon Sunset (Oranye Estetik)' },
    { id: 'amber-gold', name: 'Amber Gold (Kuning Mewah)' },
    { id: 'midnight-blue', name: 'Midnight Blue (Biru Samudra)' },
    { id: 'nordic-frost', name: 'Nordic Frost (Abu Elegan)' },
    { id: 'dracula-vamp', name: 'Dracula Dark (Ungu Vampir)' },
    { id: 'forest-moss', name: 'Forest Moss (Hijau Alam)' },
    { id: 'cyberpunk-2077', name: 'Cyberpunk 2077 (Kuning Neon)' },
    { id: 'ocean-breeze', name: 'Ocean Breeze (Toska Segar)' },
    { id: 'rose-gold', name: 'Rose Gold (Emas Merah Muda)' },
    { id: 'lavender-dream', name: 'Lavender Dream (Ungu Lembut)' },
    { id: 'coffee-latte', name: 'Coffee Latte (Cokelat Klasik)' },
    { id: 'toxic-lime', name: 'Toxic Lime (Hijau Lemon)' },
    { id: 'crimson-tide', name: 'Crimson Tide (Merah Berani)' },
    { id: 'solarized-dark', name: 'Solarized Dark (Hijau Kelabu)' }
  ];

  const getSupabase = () => {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  };

  useEffect(() => {
    setIsAdmin(localStorage.getItem('is_admin_haul') === 'true');
    // Inisialisasi sandi default jika belum pernah diatur
    if (!localStorage.getItem('admin_password_haul')) {
      localStorage.setItem('admin_password_haul', 'admin123');
    }
    loadSettings();
  }, []);

  async function loadSettings() {
    const supabase = getSupabase();
    const { data } = await supabase.from('settings').select('*').eq('id', 'main_config');
    if (data && data.length > 0) {
      const c = data[0];
      setOrgName(c.org_name || '');
      setAddress(c.address || '');
      setBankInfo(c.bank_info || '');
      setBannerText(c.banner_text || '');
      setLogoUrl(c.logo_url || '');
      setTheme(c.theme || 'default');
    }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    
    const supabase = getSupabase();
    const payload = { org_name: orgName, address, bank_info: bankInfo, banner_text: bannerText, logo_url: logoUrl, theme };

    const { error } = await supabase.from('settings').update(payload).eq('id', 'main_config');
    if (!error) {
      alert('✅ Konfigurasi & Tema aplikasi berhasil disimpan!');
      window.location.reload();
    } else {
      alert('❌ Gagal menyimpan konfigurasi.');
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    const savedPassword = localStorage.getItem('admin_password_haul') || 'admin123';

    if (currentPassword !== savedPassword) {
      return alert('❌ Sandi lama yang Anda masukkan salah!');
    }
    if (newPassword !== confirmPassword) {
      return alert('❌ Konfirmasi sandi baru tidak cocok!');
    }
    if (newPassword.length < 4) {
      return alert('❌ Sandi baru minimal harus 4 karakter!');
    }

    localStorage.setItem('admin_password_haul', newPassword);
    alert('🎯 Sandi Admin berhasil diubah!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs font-mono">
        🔒 Halaman ini dilindungi. Silakan login sebagai admin di header atas untuk mengakses pengaturan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
      {/* FORM 1: PENGATURAN INFORMASI & TEMA */}
      <form onSubmit={handleSaveConfig} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl text-xs text-white">
        <h3 className="text-amber-500 font-bold uppercase tracking-wider">⚙️ Pengaturan Aplikasi & 15 Tema</h3>
        
        <div>
          <label className="block text-slate-400 mb-1">Pilih Tema Tampilan Beranda</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none">
            {listTema.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Nama Organisasi</label>
          <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none" />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Teks Banner Informasi Beranda Utama</label>
          <textarea rows="2" value={bannerText} onChange={(e) => setBannerText(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none" />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Alamat Lembaga</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none" />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Info Rekening Bank (💳)</label>
          <input type="text" value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none" />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">URL Link Logo Gambar</label>
          <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none" />
        </div>

        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-black uppercase rounded-xl hover:bg-amber-400 transition-all">
          💾 Simpan Konfigurasi & Tema
        </button>
      </form>

      {/* FORM 2: KOTAK UBAH SANDI ADMIN */}
      <form onSubmit={handleUpdatePassword} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl text-xs text-white h-fit">
        <h3 className="text-rose-400 font-bold uppercase tracking-wider">🔒 Ubah Sandi Otorisasi Admin</h3>
        
        <div>
          <label className="block text-slate-400 mb-1">Sandi Lama Saat Ini</label>
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none font-mono text-center" />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Sandi Baru</label>
          <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none font-mono text-center" />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Konfirmasi Sandi Baru</label>
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none font-mono text-center" />
        </div>

        <button type="submit" className="w-full py-2 bg-rose-600 text-white font-black uppercase rounded-xl hover:bg-rose-500 transition-all">
          🔑 Perbarui Sandi Admin
        </button>
      </form>
    </div>
  );
}
