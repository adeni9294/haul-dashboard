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

  // State Upload Gambar
  const [isUploading, setIsUploading] = useState(false);

  // State Ubah Sandi
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State Kategori
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

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
    if (!localStorage.getItem('admin_password_haul')) {
      localStorage.setItem('admin_password_haul', 'admin123');
    }
    loadSettings();
    loadCategories();
  }, []);

  async function loadSettings() {
    const supabase = getSupabase();
    const { data } = await supabase.from('settings').select('*').eq('id', 'main_config');
    if (data && data.length > 0) {
      const c = data[0];
      setOrgName(c.org_name || '');
      setAddress(c.address || '');
      setBankInfo(c.bank_info || '');
      setBannerText(c.banner_text || c.banner_info || c.welcome_text || '');
      setLogoUrl(c.logo_url || '');
      setTheme(c.theme || 'default');
    }
  }

  async function loadCategories() {
    const supabase = getSupabase();
    const { data } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (data) setCategories(data);
  }

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const supabase = getSupabase();

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      alert('📸 Logo berhasil diunggah! Jangan lupa klik Simpan Konfigurasi bawah.');
    } catch (error) {
      console.error(error);
      alert(`❌ Gagal mengunggah gambar: ${error.message || error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    
    const supabase = getSupabase();
    
    // Mengambil kata sandi aktif yang tersimpan di browser admin (default: admin123)
    const savedPassword = localStorage.getItem('admin_password_haul') || 'admin123';

    try {
      // Memanggil fungsi RPC database yang melewati RLS secara aman menggunakan parameter sandi
      const { error } = await supabase.rpc('update_settings_secure', {
        p_password: savedPassword,
        p_org_name: orgName,
        p_address: address,
        p_bank_info: bankInfo,
        p_banner_text: bannerText,
        p_logo_url: logoUrl,
        p_theme: theme
      });
      
      if (!error) {
        alert('✅ Konfigurasi & Tema aplikasi berhasil disimpan dengan aman!');
        window.location.reload();
      } else {
        console.error(error);
        alert(`❌ Gagal menyimpan:\nPesan: ${error.message || error}\nDetail: ${error.details || '-'}`);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ Terjadi kesalahan sistem: ${err.message || err}`);
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const supabase = getSupabase();
    
    const { error } = await supabase.from('categories').insert([{ name: newCategory.trim() }]);
    if (!error) {
      setNewCategory('');
      await loadCategories();
    } else {
      alert('❌ Gagal menambah kategori baru.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Hapus kategori pos buku kas ini?')) return;
    const supabase = getSupabase();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      await loadCategories();
    } else {
      alert('❌ Gagal menghapus kategori.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs font-mono">
        🔒 Halaman ini dilindungi. Silakan login sebagai admin untuk mengakses pengaturan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24 text-xs text-white">
      
      {/* KOLOM KIRI: FORM CONFIG & TEMA */}
      <div className="space-y-6">
        <form onSubmit={handleSaveConfig} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-amber-500 font-bold uppercase tracking-wider">⚙️ Pengaturan Aplikasi</h3>
          
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
            <label className="block text-slate-400 mb-1">Logo Organisasi Resmi</label>
            <div className="flex items-center gap-4 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                {logoUrl ? <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-[9px] text-slate-600">NO LOGO</span>}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="upload-logo-input"
                  onChange={handleUploadLogo} 
                  disabled={isUploading}
                  className="hidden" 
                />
                <label 
                  htmlFor="upload-logo-input" 
                  className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    isUploading ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isUploading ? '⏳ Mengunggah...' : '📁 Pilih Gambar Logo'}
                </label>
                <p className="text-[9px] text-slate-500 mt-1 truncate max-w-[180px]">{logoUrl || 'Belum ada file dipilih'}</p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-black uppercase rounded-xl hover:bg-amber-400 transition-all">
            💾 Simpan Konfigurasi & Tema
          </button>
        </form>
      </div>

      {/* KOLOM KANAN: KATEGORI POS BUKU KAS & UBAH SANDI */}
      <div className="space-y-6">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-slate-300 font-bold uppercase tracking-wider">📁 Kategori Pos Buku Kas</h3>
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input type="text" placeholder="Nama Pos Baru..." required value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white" />
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-all">Tambah</button>
          </form>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span>🏷️ {cat.name}</span>
                <button type="button" onClick={() => handleDeleteCategory(cat.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
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
            {/* PERBAIKAN TYPO: Sekarang menggunakan setConfirmPassword */}
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none font-mono text-center" />
          </div>
          <button type="submit" className="w-full py-2 bg-rose-600 text-white font-black uppercase rounded-xl hover:bg-rose-500 transition-all">
            🔑 Perbarui Sandi Admin
          </button>
        </form>
      </div>

    </div>
  );
}
