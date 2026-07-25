'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';

export default function DokumentasiPage() {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // ➕ State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);

  // State Form Modal Tambah Dokumentasi
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formFile, setFormFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🔔 Custom Toast & Confirm Modal States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  };

  useEffect(() => {
    checkAdminSession();
    loadPhotos();
  }, [selectedPeriodeId]);

  const getSupabase = () => {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  };

  async function checkAdminSession() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) return setIsAdmin(false);
    try {
      const supabase = getSupabase();
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      setIsAdmin(!!isValid);
    } catch (err) {
      setIsAdmin(false);
    }
  }

  async function loadPhotos() {
    try {
      setLoading(true);
      const supabase = getSupabase();

      // 1. Memuat Daftar Periode
      let activePeriodeId = selectedPeriodeId;
      const { data: listPeriode } = await supabase
        .from('periode_haul')
        .select('*')
        .order('created_at', { ascending: false });

      if (listPeriode && listPeriode.length > 0) {
        setPeriodeList(listPeriode);
        if (!activePeriodeId) {
          activePeriodeId = listPeriode[0].id;
          setSelectedPeriodeId(activePeriodeId);
        }
      }

      // 2. Query Data Foto berdasarkan Periode
      let query = supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (activePeriodeId) {
        query = query.eq('periode_id', activePeriodeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPhotos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSavePhoto = async (e) => {
    e.preventDefault();
    if (!isAdmin) return showToast('Aksi ditolak. Anda belum login sebagai admin!', 'error');
    if (!formFile || !formTitle.trim()) return showToast('Harap isi judul kegiatan dan pilih berkas foto!', 'error');

    try {
      setUploading(true);
      const supabase = getSupabase();

      // A. Upload file fisik gambar ke Storage Bucket 'dokumentasi'
      const fileExt = formFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `kegiatan/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dokumentasi')
        .upload(filePath, formFile);

      if (uploadError) throw uploadError;

      // B. Ambil URL Publik aset gambar
      const { data: { publicUrl } } = supabase.storage
        .from('dokumentasi')
        .getPublicUrl(filePath);

      // C. Masukkan catatan baris ke tabel database 'photos' + periode_id
      const { error: insertError } = await supabase
        .from('photos')
        .insert([{ 
          title: formTitle.trim(), 
          image_url: publicUrl,
          periode_id: selectedPeriodeId
        }]);

      if (insertError) throw insertError;

      showToast('🟢 Foto dokumentasi kegiatan berhasil disimpan!', 'success');
      resetForm();
      await loadPhotos();
    } catch (err) {
      showToast(`❌ Gagal menyimpan dokumentasi: ${err.message || err}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const triggerHapus = (item) => {
    showConfirm(
      'Hapus Dokumentasi Foto',
      `Apakah Anda yakin ingin menghapus foto "${item.title}" secara permanen?`,
      async () => {
        try {
          const supabase = getSupabase();

          // Hapus file fisik dari Supabase Storage
          const urlParts = item.image_url.split('/storage/v1/object/public/dokumentasi/');
          const filePath = urlParts[1];
          if (filePath) {
            await supabase.storage.from('dokumentasi').remove([filePath]);
          }

          // Hapus baris metadata dari Tabel Database
          const { error } = await supabase.from('photos').delete().eq('id', item.id);
          if (error) throw error;

          showToast('🗑️ Foto dokumentasi berhasil dihapus.', 'success');
          await loadPhotos();
        } catch (err) {
          showToast(`❌ Gagal menghapus: ${err.message}`, 'error');
        } finally {
          closeConfirm();
        }
      }
    );
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      showToast('Gagal mengunduh berkas foto.', 'error');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormFile(null);
    setShowModal(false);
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono opacity-70 theme-text-primary">Membuka album dokumentasi...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs theme-text-primary relative">

      {/* 🔔 FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <GlassCard className={`px-4 py-3 border flex items-center gap-3 shadow-2xl ${
            toast.type === 'error' ? 'border-rose-500/50 text-rose-300' : 'border-emerald-500/50 text-emerald-300'
          }`}>
            <span className="text-base">{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span className="font-mono font-bold text-xs">{toast.message}</span>
          </GlassCard>
        </div>
      )}

      {/* ❓ CUSTOM CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="max-w-sm w-full p-6 space-y-4 shadow-2xl border theme-border text-center">
            <div className="text-3xl">❓</div>
            <h3 className="font-bold text-sm theme-text-primary uppercase tracking-wider">{confirmModal.title}</h3>
            <p className="text-xs theme-text-secondary leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 bg-black/30 hover:bg-black/50 theme-text-secondary font-mono rounded-xl border theme-border transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-500/80 hover:bg-rose-600 text-white font-mono font-bold rounded-xl transition-all shadow-md"
              >
                Ya, Hapus
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* AREA UTAMA PANEL KONTROL & SELECTOR PERIODE */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 theme-text-primary">
            <span>📸</span> Galeri Dokumentasi Kegiatan Haul
          </h2>
          <p className="text-[10px] theme-text-tertiary font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* SELECTOR PERIODE HAUL */}
          {periodeList.length > 0 && (
            <div className="flex items-center bg-black/30 p-1 border theme-border rounded-xl">
              <span className="text-[9px] font-mono font-bold theme-text-tertiary px-2 uppercase">Periode:</span>
              <select
                value={selectedPeriodeId || ''}
                onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
                className="bg-black/40 border theme-border text-[10px] theme-text-accent rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
              >
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.nama_periode}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)} 
              className="px-4 py-2 btn-theme-primary font-black uppercase rounded-xl transition-all shadow-md text-[10px]"
            >
              ➕ Tambah Foto
            </button>
          )}
        </div>
      </GlassCard>

      {/* STRUKTUR GRID DAFTAR FOTO */}
      {photos.length === 0 ? (
        <GlassCard className="p-12 text-center theme-text-tertiary font-mono border-dashed">
          Belum ada arsip foto dokumentasi kegiatan yang diunggah untuk periode ini.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p, idx) => (
            <GlassCard key={idx} className="overflow-hidden flex flex-col justify-between group hover:border-white/40 transition-all p-0">
              <div className="relative bg-black/40 aspect-video w-full flex items-center justify-center overflow-hidden">
                <img 
                  src={p.image_url} 
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3.5 flex justify-between items-center bg-black/20 border-t theme-border">
                <span className="text-xs font-bold theme-text-primary truncate max-w-[150px] sm:max-w-[180px] tracking-wide">
                  {p.title}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleDownload(p.image_url, p.title)}
                    className="bg-black/30 hover:bg-black/50 theme-text-primary text-[11px] font-bold px-3 py-1.5 rounded-xl border theme-border transition-all"
                  >
                    Unduh
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => triggerHapus(p)}
                      className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* MODAL DIALOG POP-UP INPUT FOTO (GLASSMORPISM) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="p-6 w-full max-w-md space-y-4 shadow-2xl border theme-border">
            <h3 className="text-sm font-black uppercase tracking-wider theme-text-accent flex items-center gap-2">
              <span>➕</span> Unggah Dokumentasi Baru
            </h3>
            
            <form onSubmit={handleSavePhoto} className="space-y-4">
              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Nama / Judul Dokumentasi Kegiatan</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: Pendirian Tenda Utama Maqbaroh"
                  value={formTitle} 
                  onChange={e => setFormTitle(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none font-medium text-xs theme-text-primary placeholder:theme-text-tertiary" 
                />
              </div>

              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Pilih File Foto Gambar</label>
                <input 
                  type="file" 
                  required
                  accept="image/*"
                  onChange={e => setFormFile(e.target.files[0])} 
                  className="w-full text-xs theme-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-black/40 file:text-white file:font-bold hover:file:bg-black/60 cursor-pointer focus:outline-none" 
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={resetForm} 
                  disabled={uploading} 
                  className="flex-1 py-2 bg-black/30 hover:bg-black/50 theme-text-secondary font-bold rounded-xl border theme-border disabled:opacity-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={uploading} 
                  className="flex-1 py-2 btn-theme-primary font-black uppercase rounded-xl shadow-lg disabled:opacity-50 transition-all text-xs"
                >
                  {uploading ? '⏳ Mengunggah...' : 'Simpan Foto'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
