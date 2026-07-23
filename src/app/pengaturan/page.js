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

  // State Unggah Gambar
  const [isUploading, setIsUploading] = useState(false);

  // State Ubah Sandi
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State Kategori Pos Kas
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('pemasukan');

  // ➕ State Kelola Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [namaPeriodeInput, setNamaPeriodeInput] = useState('');
  const [saldoAwalInput, setSaldoAwalInput] = useState('');
  const [editingPeriodeId, setEditingPeriodeId] = useState(null);

  // 🎨 SINKRONISASI 12 TEMA BARU BEDA KARAKTER
  const listTema = [
    { id: 'default', name: 'Default Charcoal (Abu/Neon Lime)' },
    { id: 'emerald-cyber', name: 'Emerald Cyber (Hijau Zamrud)' },
    { id: 'crimson-tide', name: 'Crimson Tide (Merah Ruby)' },
    { id: 'midnight-blue', name: 'Midnight Blue (Biru Samudra)' },
    { id: 'dracula-vamp', name: 'Dracula Dark (Ungu Violet/Neon)' },
    { id: 'amber-gold', name: 'Amber Gold (Kuning Emas)' },
    { id: 'neon-sunset', name: 'Neon Sunset (Jingga Warm)' },
    { id: 'coffee-latte', name: 'Coffee Latte (Cokelat Klasik)' },
    { id: 'nordic-frost', name: 'Nordic Frost (Cyan/Biru Salju)' },
    { id: 'rose-gold', name: 'Rose Gold (Quartz / Pink)' },
    { id: 'toxic-lime', name: 'Toxic Lime (Hijau Lemon Neon)' },
    { id: 'light-clean', name: 'Light Clean (Tema Terang / Putih)' }
  ];

  const getSupabase = () => {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  };

  useEffect(() => {
    validateAdminFromSupabase();
    loadSettings();
    loadCategories();
    loadPeriodeList();
  }, []);

  async function validateAdminFromSupabase() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) {
      setIsAdmin(false);
      return;
    }
    const supabase = getSupabase();
    const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
    setIsAdmin(!!isValid);
  }

  async function loadSettings() {
    const supabase = getSupabase();
    const { data } = await supabase.from('settings').select('*').eq('id', 'main_config');
    if (data && data.length > 0) {
      const c = data[0];
      setOrgName(c.org_name || '');
      setAddress(c.address || '');
      setBankInfo(c.bank_info || '');
      setBannerText(c.announcement || c.banner_text || '');
      setLogoUrl(c.logo_url || '');
      setTheme(c.theme || 'default');
    }
  }

  async function loadCategories() {
    const supabase = getSupabase();
    const { data } = await supabase.from('category').select('*').order('id', { ascending: true });
    if (data) setCategories(data);
  }

  async function loadPeriodeList() {
    const supabase = getSupabase();
    const { data } = await supabase.from('periode_haul').select('*').order('created_at', { ascending: false });
    if (data) setPeriodeList(data);
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

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
      setLogoUrl(publicUrl);
      alert('📸 Gambar berhasil diunggah! Tekan tombol "Simpan Konfigurasi" di bawah untuk mengaktifkan.');
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
    const savedPassword = localStorage.getItem('admin_password_haul') || 'admin123';

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
      alert('✅ Konfigurasi & Pilihan tema berhasil disimpan dengan aman di Supabase!');
      window.location.reload();
    } else {
      console.error(error);
      alert(`❌ Gagal menyimpan:\nPesan: ${error.message || error}\nDetail: ${error.details || '-'}`);
    }
  };

  const handleSavePeriode = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak!');
    if (!namaPeriodeInput.trim()) return;

    const supabase = getSupabase();
    const payload = {
      nama_periode: namaPeriodeInput.trim(),
      saldo_awal: parseFloat(saldoAwalInput) || 0
    };

    try {
      if (editingPeriodeId) {
        const { error } = await supabase.from('periode_haul').update(payload).eq('id', editingPeriodeId);
        if (error) throw error;
        alert('🟢 Periode berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('periode_haul').insert([payload]);
        if (error) throw error;
        alert('🟢 Periode baru berhasil dibuat!');
      }

      setNamaPeriodeInput('');
      setSaldoAwalInput('');
      setEditingPeriodeId(null);
      await loadPeriodeList();
    } catch (err) {
      alert(`❌ Gagal menyimpan periode: ${err.message}`);
    }
  };

  const handleEditPeriode = (p) => {
    setEditingPeriodeId(p.id);
    setNamaPeriodeInput(p.nama_periode);
    setSaldoAwalInput(p.saldo_awal?.toString() || '0');
  };

  const handleTutupBuku = async (periodeObj) => {
    if (!confirm(`Apakah Anda yakin ingin MENUTUP BUKU untuk ${periodeObj.nama_periode}?\n\nSemua transaksi pada periode ini akan DIKUNCI dan sisa saldo akhir akan otomatis dipindahkan menjadi Saldo Awal periode berikutnya.`)) return;

    try {
      const supabase = getSupabase();
      const { error } = await supabase.rpc('proses_tutup_buku', { p_periode_id: periodeObj.id });
      if (error) throw error;

      alert('🟢 Berhasil! Periode ini resmi Ditutup Buku.');
      await loadPeriodeList();
    } catch (err) {
      alert(`❌ Gagal tutup buku: ${err.message || err}`);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('❌ Konfirmasi sandi baru tidak cocok!');
    if (newPassword.length < 4) return alert('❌ Sandi baru minimal harus 4 karakter!');

    const supabase = getSupabase();
    try {
      const { error } = await supabase.rpc('change_admin_password_secure', {
        p_old_password: currentPassword,
        p_new_password: newPassword
      });

      if (!error) {
        alert('🎯 Sukses! Sandi Admin resmi diperbarui di database Supabase.');
        localStorage.setItem('admin_password_haul', newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        window.location.reload();
      } else {
        alert(`❌ Gagal mengubah sandi: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ Terjadi kesalahan sistem: ${err.message || err}`);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const supabase = getSupabase();
    
    const { error } = await supabase.from('category').insert([
      { 
        name: newCategory.trim(),
        type: categoryType 
      }
    ]);

    if (!error) {
      setNewCategory('');
      await loadCategories();
    } else {
      alert('❌ Gagal menambah kategori baru.');
    }
  };

  const handleUpdateCategoryType = async (id, updatedType) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('category')
      .update({ type: updatedType })
      .eq('id', id);

    if (!error) {
      setCategories(categories.map(cat => cat.id === id ? { ...cat, type: updatedType } : cat));
    } else {
      alert('❌ Gagal memperbarui jenis kategori.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Hapus kategori pos buku kas ini?')) return;
    const supabase = getSupabase();
    const { error } = await supabase.from('category').delete().eq('id', id);
    if (!error) {
      await loadCategories();
    } else {
      alert('❌ Gagal menghapus kategori.');
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-slate-300 text-xs font-mono bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-md mx-auto mt-10">
        🔒 Halaman dilindungi. Silakan login sebagai admin di header atas untuk mengaktifkan setelan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24 text-xs text-white">
      
      {/* KOLOM KIRI: FORM CONFIG & TEMA */}
      <div className="space-y-6">
        <form onSubmit={handleSaveConfig} className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-2">
            <span>⚙️</span> Pengaturan Aplikasi
          </h3>
          
          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Pilih Tema Tampilan Beranda</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl text-white focus:outline-none cursor-pointer font-bold">
              {listTema.map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white">{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Nama Organisasi</label>
            <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none text-white" />
          </div>

          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Teks Banner Informasi Beranda Utama</label>
            <textarea rows="2" value={bannerText} onChange={(e) => setBannerText(e.target.value)} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none text-white" />
          </div>

          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Alamat Lembaga</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none text-white" />
          </div>

          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Info Rekening Bank (💳)</label>
            <input type="text" value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none text-white" />
          </div>

          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Logo Organisasi Resmi</label>
            <div className="flex items-center gap-4 p-3 bg-black/30 border border-white/20 rounded-xl">
              <div className="w-12 h-12 rounded-full border border-white/20 bg-black/40 overflow-hidden shrink-0 flex items-center justify-center">
                {logoUrl ? <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-[9px] text-slate-400">NO LOGO</span>}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" id="upload-logo-input" onChange={handleUploadLogo} disabled={isUploading} className="hidden" />
                <label htmlFor="upload-logo-input" className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${isUploading ? 'bg-white/10 text-slate-400' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                  {isUploading ? '⏳ Mengunggah...' : '📁 Pilih Gambar Logo'}
                </label>
                <p className="text-[9px] text-slate-300 mt-1 truncate max-w-[180px]">{logoUrl || 'Belum ada file dipilih'}</p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase rounded-xl transition-all shadow-md">
            💾 Simpan Konfigurasi & Tema
          </button>
        </form>

        {/* 🏛️ PANEL KELOLA PERIODE HAUL */}
        <div className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-purple-300 font-bold uppercase tracking-wider flex items-center gap-2">
            <span>🏛️</span> Kelola Periode Haul
          </h3>

          <form onSubmit={handleSavePeriode} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Nama Periode (Misal: Haul 2027)" 
                required 
                value={namaPeriodeInput} 
                onChange={(e) => setNamaPeriodeInput(e.target.value)} 
                className="px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none text-white placeholder:text-slate-400" 
              />
              <input 
                type="number" 
                placeholder="Saldo Kas Awal (Rp)" 
                value={saldoAwalInput} 
                onChange={(e) => setSaldoAwalInput(e.target.value)} 
                className="px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none text-amber-300 font-mono font-bold placeholder:text-slate-400" 
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md">
                {editingPeriodeId ? '💾 Perbarui Periode' : '➕ Tambah Periode Baru'}
              </button>
              {editingPeriodeId && (
                <button type="button" onClick={() => { setEditingPeriodeId(null); setNamaPeriodeInput(''); setSaldoAwalInput(''); }} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl">Batal</button>
              )}
            </div>
          </form>

          {/* LIST DAFTAR PERIODE */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {periodeList.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-2.5 bg-black/20 border border-white/10 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{p.nama_periode}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${p.is_closed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                      {p.is_closed ? '🔒 Closed' : '🟢 Active'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-mono mt-0.5">Saldo Awal: <strong className="text-amber-300">{formatRupiah(p.saldo_awal)}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleEditPeriode(p)} className="text-amber-300 font-mono font-bold hover:underline text-[11px]">Edit</button>
                  
                  {/* TOMBOL TUTUP BUKU */}
                  {!p.is_closed && (
                    <button 
                      type="button" 
                      onClick={() => handleTutupBuku(p)} 
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-400 border border-amber-400/40 text-amber-300 hover:text-black font-mono font-bold rounded-lg text-[10px] transition-all"
                    >
                      🔒 Tutup Buku
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KOLOM KANAN: KATEGORI POS BUKU KAS & UBAH SANDI */}
      <div className="space-y-6">
        <div className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-slate-200 font-bold uppercase tracking-wider flex items-center gap-2">
            <span>📁</span> Kategori Pos Buku Kas
          </h3>
          
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Nama Pos Baru..." 
              required 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)} 
              className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none text-white placeholder:text-slate-400" 
            />
            
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="px-2 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none text-white cursor-pointer font-bold"
            >
              <option value="pemasukan" className="bg-zinc-900 text-emerald-400">📥 Pemasukan</option>
              <option value="pengeluaran" className="bg-zinc-900 text-rose-400">📤 Pengeluaran</option>
            </select>

            <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-all shrink-0 shadow-md">
              Tambah
            </button>
          </form>

          {/* LIST KATEGORI DENGAN EDIT PILIHAN JENIS LANGSUNG */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex justify-between items-center p-2.5 bg-black/20 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="truncate font-semibold">🏷️ {cat.name}</span>
                  
                  <select
                    value={cat.type || ''}
                    onChange={(e) => handleUpdateCategoryType(cat.id, e.target.value)}
                    className={`px-1.5 py-0.5 rounded text-[10px] bg-black/40 border focus:outline-none cursor-pointer font-mono font-bold ${
                      cat.type === 'pemasukan' 
                        ? 'text-emerald-300 border-emerald-500/50' 
                        : cat.type === 'pengeluaran' 
                        ? 'text-rose-300 border-rose-500/50' 
                        : 'text-slate-300 border-white/20'
                    }`}
                  >
                    <option value="" disabled className="bg-zinc-900 text-white">-- Pilih Jenis --</option>
                    <option value="pemasukan" className="text-emerald-400 bg-zinc-900">📥 Pemasukan</option>
                    <option value="pengeluaran" className="text-rose-400 bg-zinc-900">📤 Pengeluaran</option>
                  </select>
                </div>
                <button type="button" onClick={() => handleDeleteCategory(cat.id)} className="text-rose-300 font-bold hover:underline ml-2 shrink-0">Hapus</button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-rose-300 font-bold uppercase tracking-wider flex items-center gap-2">
            <span>🔒</span> Ubah Sandi Otorisasi Admin
          </h3>
          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Sandi Lama Saat Ini</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none font-mono text-center text-white" />
          </div>
          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Sandi Baru</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none font-mono text-center text-white" />
          </div>
          <div>
            <label className="block text-slate-200 mb-1 font-semibold">Konfirmasi Sandi Baru</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none font-mono text-center text-white" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase rounded-xl transition-all shadow-md">
            🔑 Perbarui Sandi Admin
          </button>
        </form>
      </div>

    </div>
  );
}
