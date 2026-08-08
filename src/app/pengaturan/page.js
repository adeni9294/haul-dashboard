'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';
import { 
  Building2, 
  MapPin, 
  Lock, 
  FolderPlus, 
  Calendar, 
  Upload, 
  Save, 
  Key, 
  AlertCircle, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Navigation
} from 'lucide-react';

export default function PengaturanPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
   
  // State Toast Modal Dialog
  const [toastConfig, setToastConfig] = useState({ show: false, type: 'info', title: '', message: '' });
   
  // State Dialog Konfirmasi Aksi
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });

  // State Konfigurasi Identitas
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // State Pengaturan Peta Lokasi
  const [mapTitle, setMapTitle] = useState('');
  const [mapLat, setMapLat] = useState('');
  const [mapLon, setMapLon] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [mapAddressDetail, setMapAddressDetail] = useState('');

  // State Ubah Sandi
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State Kategori Pos Kas
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('pemasukan');

  // State Kelola Periode Haul
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
      await loadMapSettings();
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
    }
  }

  async function loadMapSettings() {
    const supabase = getSupabase();
    const { data } = await supabase.from('map_settings').select('*').eq('id', 'main_map').single();
    if (data) {
      setMapTitle(data.title || '');
      setMapLat(data.latitude || '');
      setMapLon(data.longitude || '');
      setMapEmbedUrl(data.embed_url || '');
      setMapAddressDetail(data.address_detail || '');
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
      p_logo_url: logoUrl
    });

    if (!error) {
      showToast('success', 'Berhasil Disimpan', 'Konfigurasi identitas organisasi berhasil diperbarui!');
    } else {
      console.error(error);
      showToast('error', 'Gagal Menyimpan', error.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleShareLocationGPS = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Tidak Didukung', 'Browser Anda tidak mendukung fitur Geolocation.');
      return;
    }

    showToast('info', 'Mendeteksi GPS', 'Mohon izinkan akses lokasi pada perangkat Anda...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setMapLat(lat.toString());
        setMapLon(lon.toString());
        setMapEmbedUrl(`https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`);
        
        showToast('success', 'Lokasi Didapat', `Koordinat GPS berhasil diset otomatis: ${lat}, ${lon}`);
      },
      (error) => {
        showToast('error', 'Gagal Mendeteksi', 'Pastikan izin akses lokasi (GPS) pada browser/perangkat Anda aktif.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveMapConfig = async (e) => {
    e.preventDefault();
    if (!isAdmin) return showToast('error', 'Akses Ditolak', 'Aksi dibatasi khusus admin.');

    const supabase = getSupabase();
    const { error } = await supabase
      .from('map_settings')
      .upsert({
        id: 'main_map',
        title: mapTitle,
        latitude: mapLat,
        longitude: mapLon,
        embed_url: mapEmbedUrl,
        address_detail: mapAddressDetail,
        updated_at: new Date()
      });

    if (!error) {
      showToast('success', 'Peta Diperbarui', 'Titik koordinat dan pengaturan peta berhasil disimpan!');
    } else {
      console.error(error);
      showToast('error', 'Gagal Simpan Peta', error.message || 'Terjadi kesalahan sistem.');
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

  // SKELETON LOADING STATE
  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center justify-center gap-3 py-6 text-amber-400 font-mono text-xs tracking-widest uppercase">
          <svg className="animate-spin h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">Memuat Pengaturan Sistem & Otorisasi...</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 h-64 animate-pulse theme-bg-secondary theme-border" />
          <GlassCard className="p-6 h-64 animate-pulse theme-bg-secondary theme-border" />
        </div>
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 theme-text-primary relative">
      
      {/* FLOATING TOAST NOTIFICATION */}
      {toastConfig.show && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md transition-all duration-300">
          <div className={`px-5 py-3.5 border-2 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
            toastConfig.type === 'error' 
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50' 
              : toastConfig.type === 'info'
              ? 'bg-cyan-950/90 border-cyan-500/80 text-cyan-200 shadow-cyan-950/50'
              : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50'
          }`}>
            <span className="text-lg shrink-0">
              {toastConfig.type === 'error' ? '⚠️' : toastConfig.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="font-mono font-black text-xs uppercase">{toastConfig.title}</h4>
              <p className="font-mono text-[11px] opacity-90 truncate">{toastConfig.message}</p>
            </div>
            <button onClick={closeToast} className="text-xs font-bold hover:underline opacity-80 cursor-pointer">Tutup</button>
          </div>
        </div>
      )}

      {/* HEADER PAGE */}
      <GlassCard className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 theme-text-accent" />
            Setelan Sistem & Antarmuka
          </h2>
          <p className="text-[11px] theme-text-secondary mt-1 font-medium">
            Kelola identitas organisasi, koordinat peta lokasi (ShareLoc), periode haul, dan kata sandi admin.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          ⚡ OTORISASI ADMIN AKTIF
        </span>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KOLOM KIRI: IDENTITAS & PETA */}
        <div className="space-y-6">
          
          {/* SEKSI 1: IDENTITAS & KOP ORGANISASI */}
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
                    className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-cyan-500 font-semibold text-xs" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Teks Banner Informasi Beranda Utama</label>
                  <textarea 
                    rows="2" 
                    value={bannerText} 
                    onChange={(e) => setBannerText(e.target.value)} 
                    className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-cyan-500 text-xs" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Alamat Lembaga</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-cyan-500 text-xs" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Info Rekening Bank Donasi (💳)</label>
                  <input 
                    type="text" 
                    value={bankInfo} 
                    onChange={(e) => setBankInfo(e.target.value)} 
                    placeholder="Mandiri : 1234xxx | BCA : 5678xxx"
                    className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-cyan-500 font-mono text-[11px]" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Logo Organisasi Resmi</label>
                  <div className="flex items-center gap-3 p-3 theme-bg-tertiary border theme-border rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl border theme-border theme-bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-[9px] theme-text-tertiary">NO LOGO</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input type="file" accept="image/*" id="upload-logo-input" onChange={handleUploadLogo} disabled={isUploading} className="hidden" />
                      <label htmlFor="upload-logo-input" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${isUploading ? 'bg-slate-700 text-slate-400' : 'btn-theme-primary'}`}>
                        <Upload className="w-3.5 h-3.5" />
                        {isUploading ? 'Mengunggah...' : 'Pilih Logo'}
                      </label>
                      <p className="text-[9px] theme-text-tertiary mt-1 truncate">{logoUrl || 'Belum ada logo diunggah'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 btn-theme-primary font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer">
                <Save className="w-4 h-4" />
                Simpan Konfigurasi Organisasi
              </button>
            </form>
          </GlassCard>

          {/* SEKSI 2: PENGATURAN PETA LOKASI HAUL */}
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <form onSubmit={handleSaveMapConfig} className="space-y-4">
              <div className="border-b theme-border pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider theme-text-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  Pengaturan Peta Lokasi Haul
                </h3>
                <button
                  type="button"
                  onClick={handleShareLocationGPS}
                  className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 rounded-xl font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Ambil titik koordinat otomatis dari GPS HP/Laptop Anda saat ini"
                >
                  📍 Ambil Lokasi Saat Ini (ShareLoc)
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Judul Lokasi / Makam</label>
                  <input 
                    type="text" 
                    value={mapTitle} 
                    onChange={(e) => setMapTitle(e.target.value)} 
                    placeholder="Contoh: Maqbaroh Buyut Kepuh & Buyut Besus"
                    className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none focus:border-rose-500 font-semibold text-xs" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold theme-text-secondary mb-1">Latitude (Garis Lintang)</label>
                    <input 
                      type="text" 
                      value={mapLat} 
                      onChange={(e) => setMapLat(e.target.value)} 
                      placeholder="-6.6983"
                      className="px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-xs w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold theme-text-secondary mb-1">Longitude (Garis Bujur)</label>
                    <input 
                      type="text" 
                      value={mapLon} 
                      onChange={(e) => setMapLon(e.target.value)} 
                      placeholder="108.4812"
                      className="px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-xs w-full" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">URL Embed Google Maps (Src Iframe)</label>
                  <input 
                    type="text" 
                    value={mapEmbedUrl} 
                    onChange={(e) => setMapEmbedUrl(e.target.value)} 
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-[11px]" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Detail Alamat Lengkap Peta</label>
                  <textarea 
                    rows="2" 
                    value={mapAddressDetail} 
                    onChange={(e) => setMapAddressDetail(e.target.value)} 
                    placeholder="Blok Cibogo Kidul RT/RW 002/003 Desa Warujaya..."
                    className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none text-xs" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer">
                <Navigation className="w-4 h-4" />
                Simpan Koordinat & Peta
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
                  className="px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none" 
                />
                <input 
                  type="number" 
                  placeholder="Saldo Kas Awal (Rp)" 
                  value={saldoAwalInput} 
                  onChange={(e) => setSaldoAwalInput(e.target.value)} 
                  className="px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-accent font-mono font-bold rounded-2xl focus:outline-none" 
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-md text-xs uppercase font-mono cursor-pointer">
                  {editingPeriodeId ? '💾 Perbarui Periode' : '➕ Tambah Periode Baru'}
                </button>
                {editingPeriodeId && (
                  <button type="button" onClick={() => { setEditingPeriodeId(null); setNamaPeriodeInput(''); setSaldoAwalInput(''); }} className="px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-secondary rounded-2xl text-xs cursor-pointer">Batal</button>
                )}
              </div>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {periodeList.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 theme-bg-tertiary border theme-border rounded-2xl text-xs">
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
                    <button type="button" onClick={() => handleEditPeriode(p)} className="p-1.5 theme-text-accent hover:opacity-100 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                    {!p.is_closed && (
                      <button 
                        type="button" 
                        onClick={() => handleTutupBuku(p)} 
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-400 border border-amber-400/40 text-amber-300 hover:text-black font-mono font-bold rounded-xl text-[9px] transition-all cursor-pointer"
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
                className="flex-1 px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none" 
              />
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="px-3 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none cursor-pointer font-bold"
              >
                <option value="pemasukan" className="bg-zinc-900 text-emerald-400 dark:bg-zinc-900 dark:text-emerald-400">📥 Pemasukan</option>
                <option value="pengeluaran" className="bg-zinc-900 text-rose-400 dark:bg-zinc-900 dark:text-rose-400">📤 Pengeluaran</option>
              </select>
              <button type="submit" className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl transition-all shrink-0 shadow-md uppercase font-mono cursor-pointer">
                Tambah
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center p-3 theme-bg-tertiary border theme-border rounded-2xl text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="truncate font-semibold theme-text-primary">🏷️ {cat.name}</span>
                    <select
                      value={cat.type || ''}
                      onChange={(e) => handleUpdateCategoryType(cat.id, e.target.value)}
                      className={`px-2 py-0.5 rounded-lg theme-bg-secondary border text-[10px] focus:outline-none cursor-pointer font-mono font-bold ${
                        cat.type === 'pemasukan' 
                          ? 'text-emerald-400 border-emerald-500/50' 
                          : cat.type === 'pengeluaran' 
                          ? 'text-rose-400 border-rose-500/50' 
                          : 'theme-text-secondary border-slate-700'
                      }`}
                    >
                      <option value="" disabled className="bg-zinc-900 text-white dark:bg-zinc-900 dark:text-white">Pilih Jenis</option>
                      <option value="pemasukan" className="text-emerald-400 bg-zinc-900 dark:bg-zinc-900 dark:text-emerald-400">📥 Pemasukan</option>
                      <option value="pengeluaran" className="text-rose-400 bg-zinc-900 dark:bg-zinc-900 dark:text-rose-400">📤 Pengeluaran</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-rose-400 hover:text-rose-300 ml-2 shrink-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
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
                  <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-center" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Sandi Baru</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-center" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold theme-text-secondary mb-1">Konfirmasi Sandi Baru</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 theme-bg-tertiary border theme-border theme-text-primary rounded-2xl focus:outline-none font-mono text-center" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Lock className="w-4 h-4" />
                Perbarui Sandi Admin
              </button>
            </form>
          </GlassCard>

        </div>

      </div>

      {/* MODAL KONFIRMASI AKSI */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
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
                className="flex-1 py-3 theme-bg-tertiary border theme-border theme-text-secondary font-bold text-xs uppercase rounded-2xl cursor-pointer"
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
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase rounded-2xl shadow-lg transition-all cursor-pointer"
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
