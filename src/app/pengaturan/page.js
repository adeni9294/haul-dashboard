'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';
import { 
  Building2, 
  MapPin, 
  CreditCard, 
  Palette, 
  Lock, 
  FolderPlus, 
  Calendar, 
  Upload, 
  Save, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

// 🎨 SINKRONISASI 16 TEMA RESMI CLIENTLAYOUT.JS
const THEME_OPTIONS = [
  { key: 'default', name: 'Default Navy', color: 'bg-cyan-500' },
  { key: 'emerald-cyber', name: 'Emerald Cyber', color: 'bg-emerald-400' },
  { key: 'velvet-rose', name: 'Velvet Rose', color: 'bg-pink-500' },
  { key: 'neon-sunset', name: 'Neon Sunset', color: 'bg-orange-500' },
  { key: 'nordic-frost', name: 'Nordic Frost', color: 'bg-sky-400' },
  { key: 'tokyo-night', name: 'Tokyo Night', color: 'bg-purple-500' },
  { key: 'amber-gold', name: 'Amber Gold', color: 'bg-amber-400' },
  { key: 'cyberpunk-2076', name: 'Cyberpunk 2076', color: 'bg-yellow-400' },
  { key: 'ocean-deep', name: 'Ocean Deep', color: 'bg-blue-600' },
  { key: 'forest-moss', name: 'Forest Moss', color: 'bg-emerald-600' },
  { key: 'crimson-tide', name: 'Crimson Tide', color: 'bg-red-600' },
  { key: 'obsidian-stark', name: 'Obsidian Stark', color: 'bg-slate-400' },
  { key: 'dracula-vamp', name: 'Dracula Vamp', color: 'bg-purple-600' },
  { key: 'coffee-latte', name: 'Coffee Latte', color: 'bg-amber-700' },
  { key: 'mint-fresh', name: 'Mint Fresh', color: 'bg-teal-400' },
  { key: 'retro-wave', name: 'Retro Wave', color: 'bg-rose-500' }
];

export default function PengaturanPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 🔔 State Toast Modal Dialog
  const [toastConfig, setToastConfig] = useState({ show: false, type: 'info', title: '', message: '' });
  
  // ❓ State Dialog Konfirmasi Aksi
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });

  // 📝 State Konfigurasi
  const [theme, setTheme] = useState('default');
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 🔒 State Ubah Sandi
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 📁 State Kategori Pos Kas
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('pemasukan');

  // 🏛️ State Kelola Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [namaPeriodeInput, setNamaPeriodeInput] = useState('');
  const [saldoAwalInput, setSaldoAwalInput] = useState('');
  const [editingPeriodeId, setEditingPeriodeId] = useState(null);

  const getSupabase = () => {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  };

  const showToast = (type, title, message) => {
    setToastConfig({ show: true, type, title, message });
  };

  const closeToast = () => {
    setToastConfig({ show: false, type: 'info', title: '', message: '' });
  };

  const askConfirm = (title, message, action) => {
    setConfirmModal({ show: true, title, message, action });
  };

  useEffect(() => {
    initData();
  }, []);

  async function initData() {
    try {
      setLoading(true);
      await validateAdminFromSupabase();
      await loadSettings();
      await loadCategories();
      await loadPeriodeList();
    } finally {
      setLoading(false);
    }
  }

  async function validateAdminFromSupabase() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) {
      setIsAdmin(false);
      return;
    }
    const supabase = getSupabase();
    try {
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      setIsAdmin(!!isValid);
    } catch (err) {
      setIsAdmin(false);
    }
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

  // 🎨 Mengubah Tema Secara Real-time di Browser
  const handleThemeChange = (selectedKey) => {
    setTheme(selectedKey);
    localStorage.setItem('app-theme', selectedKey);
    document.body.className = document.body.className.replace(/theme-[^\s]+/g, '').trim();
    document.body.classList.add(`theme-${selectedKey}`);
  };

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
      showToast('success', 'Gambar Diunggah', 'Logo berhasil diunggah! Tekan tombol "Simpan Konfigurasi" untuk mengaktifkan.');
    } catch (error) {
      console.error(error);
      showToast('error', 'Gagal Unggah', `Terjadi kesalahan: ${error.message || error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!isAdmin) return showToast('error', 'Akses Ditolak', 'Aksi dibatasi khusus admin.');

    const supabase = getSupabase();
    const savedPassword = localStorage.getItem('admin_password_haul') || '';

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
      showToast('success', 'Berhasil Disimpan', 'Konfigurasi & Pilihan tema berhasil diperbarui!');
    } else {
      console.error(error);
      showToast('error', 'Gagal Menyimpan', error.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleSavePeriode = async (e) => {
    e.preventDefault();
    if (!isAdmin) return showToast('error', 'Akses Ditolak', 'Aksi dibatasi khusus admin.');
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
        showToast('success', 'Periode Diperbarui', 'Data periode berhasil disimpan.');
      } else {
        const { error } = await supabase.from('periode_haul').insert([payload]);
        if (error) throw error;
        showToast('success', 'Periode Baru', 'Periode baru berhasil dibuat.');
      }

      setNamaPeriodeInput('');
      setSaldoAwalInput('');
      setEditingPeriodeId(null);
      await loadPeriodeList();
    } catch (err) {
      showToast('error', 'Gagal Simpan', err.message);
    }
  };

  const handleEditPeriode = (p) => {
    setEditingPeriodeId(p.id);
    setNamaPeriodeInput(p.nama_periode);
    setSaldoAwalInput(p.saldo_awal?.toString() || '0');
  };

  const handleTutupBuku = (periodeObj) => {
    askConfirm(
      'Konfirmasi Tutup Buku',
      `Apakah Anda yakin ingin MENUTUP BUKU untuk ${periodeObj.nama_periode}? Semua transaksi akan DIKUNCI dan saldo akhir akan dipindahkan ke periode berikutnya.`,
      async () => {
        try {
          const supabase = getSupabase();
          const { error } = await supabase.rpc('proses_tutup_buku', { p_periode_id: periodeObj.id });
          if (error) throw error;

          showToast('success', 'Tutup Buku Berhasil', `Periode ${periodeObj.nama_periode} resmi ditutup.`);
          await loadPeriodeList();
        } catch (err) {
          showToast('error', 'Gagal Tutup Buku', err.message || err);
        }
      }
    );
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showToast('error', 'Sandi Tidak Cocok', 'Konfirmasi sandi baru tidak sesuai!');
    if (newPassword.length < 4) return showToast('error', 'Sandi Terlalu Pendek', 'Sandi baru minimal 4 karakter!');

    const supabase = getSupabase();
    try {
      const { error } = await supabase.rpc('change_admin_password_secure', {
        p_old_password: currentPassword,
        p_new_password: newPassword
      });

      if (!error) {
        localStorage.setItem('admin_password_haul', newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('success', 'Sandi Diperbarui', 'Sandi Admin resmi diperbarui. Silakan login ulang.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('error', 'Gagal Ubah Sandi', error.message);
      }
    } catch (err) {
      showToast('error', 'Gangguan Sistem', err.message || err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const supabase = getSupabase();

    const { error } = await supabase.from('category').insert([
      { name: newCategory.trim(), type: categoryType }
    ]);

    if (!error) {
      setNewCategory('');
      showToast('success', 'Kategori Ditambah', 'Pos kategori kas berhasil disimpan.');
      await loadCategories();
    } else {
      showToast('error', 'Gagal Tambah', 'Gagal menambah kategori baru.');
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
      showToast('success', 'Kategori Diperbarui', 'Jenis kategori berhasil diubah.');
    } else {
      showToast('error', 'Gagal Ubah', 'Gagal memperbarui jenis kategori.');
    }
  };

  const handleDeleteCategory = (id) => {
    askConfirm(
      'Hapus Kategori',
      'Apakah Anda yakin ingin menghapus kategori pos buku kas ini?',
      async () => {
        const supabase = getSupabase();
        const { error } = await supabase.from('category').delete().eq('id', id);
        if (!error) {
          showToast('success', 'Terhapus', 'Kategori berhasil dihapus.');
          await loadCategories();
        } else {
          showToast('error', 'Gagal Hapus', 'Kategori gagal dihapus.');
        }
      }
    );
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (loading) {
    return (
      <div className="text-center py-16 text-xs font-mono theme-text-secondary animate-pulse">
        Mendeteksi otorisasi & memuat pengaturan...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <GlassCard className="p-8 text-center max-w-md mx-auto my-12 shadow-2xl space-y-3">
        <Lock className="w-10 h-10 theme-text-accent mx-auto" />
        <h3 className="text-sm font-extrabold uppercase theme-text-primary">Akses Dibatasi</h3>
        <p className="text-xs theme-text-secondary">
          Halaman pengaturan dikunci. Silakan lakukan <strong>Otorisasi Login Admin</strong> melalui tombol Menu di navigasi bawah untuk membuka setelan.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 theme-text-primary">
      
      {/* HEADER PAGE */}
      <GlassCard className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 theme-text-accent" />
            Setelan Sistem & Antarmuka
          </h2>
          <p className="text-[11px] theme-text-secondary mt-1 font-medium">
            Kelola tema tampilan global, identitas organisasi, periode haul, dan kata sandi admin.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          ⚡ OTORISASI ADMIN AKTIF
        </span>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KOLOM KIRI: FORM TEMA & KONFIGURASI APLIKASI */}
        <div className="space-y-6">
          
          {/* SEKSI 1: TEMA GLOBAL */}
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider theme-text-primary border-b theme-border pb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 theme-text-accent" />
              Pilihan Tema Tampilan Beranda
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_OPTIONS.map((th) => {
                const isSelected = theme === th.key;
                return (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => handleThemeChange(th.key)}
                    className={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-1.5 ${
                      isSelected 
                        ? 'bg-black/30 border-cyan-400 shadow-md scale-[1.02]' 
                        : 'bg-black/10 theme-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${th.color}`} />
                      <span className="text-[10px] font-bold theme-text-primary truncate">{th.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 theme-text-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* SEKSI 2: IDENTITAS & KOP ORGANISASI */}
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider theme-text-primary border-b theme-border pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 theme-text-accent" />
                Identitas Organisasi & Kontak
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Nama Organisasi</label>
                  <input 
                    type="text" 
                    value={orgName} 
                    onChange={(e) => setOrgName(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-cyan-500 font-semibold text-xs" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Teks Banner Informasi Beranda Utama</label>
                  <textarea 
                    rows="2" 
                    value={bannerText} 
                    onChange={(e) => setBannerText(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-cyan-500 text-xs" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Alamat Lembaga</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-cyan-500 text-xs" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Info Rekening Bank Donasi (💳)</label>
                  <input 
                    type="text" 
                    value={bankInfo} 
                    onChange={(e) => setBankInfo(e.target.value)} 
                    placeholder="Mandiri : 1234xxx | BCA : 5678xxx"
                    className="w-full px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-cyan-500 font-mono text-[11px]" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Logo Organisasi Resmi</label>
                  <div className="flex items-center gap-3 p-3 bg-black/20 border theme-border rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl border theme-border bg-black/30 overflow-hidden shrink-0 flex items-center justify-center">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-[9px] theme-text-tertiary">NO LOGO</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input type="file" accept="image/*" id="upload-logo-input" onChange={handleUploadLogo} disabled={isUploading} className="hidden" />
                      <label htmlFor="upload-logo-input" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${isUploading ? 'bg-black/30 text-slate-400' : 'btn-theme-primary'}`}>
                        <Upload className="w-3.5 h-3.5" />
                        {isUploading ? 'Mengunggah...' : 'Pilih Logo'}
                      </label>
                      <p className="text-[9px] theme-text-tertiary mt-1 truncate">{logoUrl || 'Belum ada logo diunggah'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 btn-theme-primary font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2">
                <Save className="w-4 h-4" />
                Simpan Konfigurasi & Tema
              </button>
            </form>
          </GlassCard>

          {/* SEKSI 3: KELOLA PERIODE HAUL */}
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider theme-text-primary border-b theme-border pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 theme-text-accent" />
              Kelola Periode Pembukuan Haul
            </h3>

            <form onSubmit={handleSavePeriode} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input 
                  type="text" 
                  placeholder="Nama Periode (Contoh: Haul 2027)" 
                  required 
                  value={namaPeriodeInput} 
                  onChange={(e) => setNamaPeriodeInput(e.target.value)} 
                  className="px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none" 
                />
                <input 
                  type="number" 
                  placeholder="Saldo Kas Awal (Rp)" 
                  value={saldoAwalInput} 
                  onChange={(e) => setSaldoAwalInput(e.target.value)} 
                  className="px-4 py-2.5 bg-black/30 border theme-border theme-text-accent font-mono font-bold rounded-2xl focus:outline-none" 
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-md text-xs uppercase font-mono">
                  {editingPeriodeId ? '💾 Perbarui Periode' : '➕ Tambah Periode Baru'}
                </button>
                {editingPeriodeId && (
                  <button type="button" onClick={() => { setEditingPeriodeId(null); setNamaPeriodeInput(''); setSaldoAwalInput(''); }} className="px-4 py-2.5 bg-black/30 border theme-border theme-text-secondary rounded-2xl text-xs">Batal</button>
                )}
              </div>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {periodeList.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-black/20 border theme-border rounded-2xl text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold theme-text-primary">{p.nama_periode}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${p.is_closed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                        {p.is_closed ? '🔒 Closed' : '🟢 Active'}
                      </span>
                    </div>
                    <p className="text-[10px] theme-text-secondary font-mono mt-0.5">Saldo Awal: <strong className="theme-text-accent">{formatRupiah(p.saldo_awal)}</strong></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleEditPeriode(p)} className="p-1.5 theme-text-accent hover:opacity-100"><Edit2 className="w-3.5 h-3.5" /></button>
                    {!p.is_closed && (
                      <button 
                        type="button" 
                        onClick={() => handleTutupBuku(p)} 
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-400 border border-amber-400/40 text-amber-300 hover:text-black font-mono font-bold rounded-xl text-[9px] transition-all"
                      >
                        🔒 Tutup Buku
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* KOLOM KANAN: KATEGORI POS & OTORISASI SANDI */}
        <div className="space-y-6">
          
          {/* SEKSI 4: KATEGORI POS BUKU KAS */}
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider theme-text-primary border-b theme-border pb-3 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 theme-text-accent" />
              Kategori Pos Buku Kas
            </h3>

            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 text-xs">
              <input 
                type="text" 
                placeholder="Nama Pos Kategori Baru..." 
                required 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)} 
                className="flex-1 px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none" 
              />
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="px-3 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none cursor-pointer font-bold"
              >
                <option value="pemasukan" className="bg-zinc-900 text-emerald-400">📥 Pemasukan</option>
                <option value="pengeluaran" className="bg-zinc-900 text-rose-400">📤 Pengeluaran</option>
              </select>
              <button type="submit" className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl transition-all shrink-0 shadow-md uppercase font-mono">
                Tambah
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-black/20 border theme-border rounded-2xl text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="truncate font-semibold theme-text-primary">🏷️ {cat.name}</span>
                    <select
                      value={cat.type || ''}
                      onChange={(e) => handleUpdateCategoryType(cat.id, e.target.value)}
                      className={`px-2 py-0.5 rounded-lg bg-black/30 border text-[10px] focus:outline-none cursor-pointer font-mono font-bold ${
                        cat.type === 'pemasukan' 
                          ? 'text-emerald-300 border-emerald-500/50' 
                          : cat.type === 'pengeluaran' 
                          ? 'text-rose-300 border-rose-500/50' 
                          : 'theme-text-secondary border-slate-700'
                      }`}
                    >
                      <option value="" disabled className="bg-zinc-900 text-white">Pilih Jenis</option>
                      <option value="pemasukan" className="text-emerald-400 bg-zinc-900">📥 Pemasukan</option>
                      <option value="pengeluaran" className="text-rose-400 bg-zinc-900">📤 Pengeluaran</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-rose-400 hover:text-rose-300 ml-2 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* SEKSI 5: UBAH SANDI OTORISASI */}
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider theme-text-primary border-b theme-border pb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-rose-400" />
                Ubah Sandi Otorisasi Admin
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Sandi Lama Saat Ini</label>
                  <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-center" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Sandi Baru</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-center" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Konfirmasi Sandi Baru</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 bg-black/30 border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-center" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Perbarui Sandi Admin
              </button>
            </form>
          </GlassCard>

        </div>

      </div>

      {/* 🔔 CUSTOM MODAL TOAST DIALOG */}
      {toastConfig.show && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-sm w-full space-y-4 shadow-2xl text-center relative overflow-hidden">
            <div className="mx-auto w-fit p-3 rounded-2xl border mb-1">
              {toastConfig.type === 'success' && (
                <div className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 p-2 rounded-xl border">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}
              {toastConfig.type === 'error' && (
                <div className="bg-rose-500/20 text-rose-400 border-rose-400/30 p-2 rounded-xl border">
                  <AlertCircle className="w-8 h-8" />
                </div>
              )}
              {toastConfig.type === 'info' && (
                <div className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 p-2 rounded-xl border">
                  <Info className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider theme-text-primary">{toastConfig.title}</h3>
              <p className="text-xs theme-text-secondary leading-relaxed font-medium">{toastConfig.message}</p>
            </div>

            <button
              onClick={closeToast}
              className="w-full py-3 btn-theme-primary font-black text-xs uppercase rounded-2xl shadow-lg transition-all"
            >
              Mengerti & Lanjutkan
            </button>
          </GlassCard>
        </div>
      )}

      {/* ❓ MODAL KONFIRMASI AKSI */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-sm w-full space-y-4 shadow-2xl text-center relative overflow-hidden">
            <div className="mx-auto w-fit p-3 rounded-2xl border mb-1 bg-amber-500/20 text-amber-300 border-amber-400/30">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider theme-text-primary">{confirmModal.title}</h3>
              <p className="text-xs theme-text-secondary leading-relaxed font-medium">{confirmModal.message}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ show: false, title: '', message: '', action: null })}
                className="flex-1 py-3 bg-black/30 border theme-border theme-text-secondary font-bold text-xs uppercase rounded-2xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const act = confirmModal.action;
                  setConfirmModal({ show: false, title: '', message: '', action: null });
                  if (act) act();
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase rounded-2xl shadow-lg transition-all"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
