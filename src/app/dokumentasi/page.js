'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
    if (!isAdmin) return alert('Aksi ditolak. Anda belum login sebagai admin!');
    if (!formFile || !formTitle.trim()) return alert('Harap isi judul kegiatan dan pilih berkas foto!');

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

      alert('🟢 Foto dokumentasi kegiatan berhasil disimpan!');
      resetForm();
      await loadPhotos();
    } catch (err) {
      alert(`❌ Gagal menyimpan dokumentasi:\n${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const triggerHapus = async (item) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus foto "${item.title}" secara permanen?`)) return;
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

      alert('🗑️ Foto dokumentasi berhasil dihapus.');
      await loadPhotos();
    } catch (err) {
      alert(`❌ Gagal menghapus: ${err.message}`);
    }
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
      alert('Gagal mengunduh berkas foto.');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormFile(null);
    setShowModal(false);
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono opacity-70">Membuka album dokumentasi...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* AREA UTAMA PANEL KONTROL & SELECTOR PERIODE (GLASSMORPISM) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <span>📸</span> Galeri Dokumentasi Kegiatan Haul
          </h2>
          <p className="text-[10px] opacity-80 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* SELECTOR PERIODE HAUL */}
          {periodeList.length > 0 && (
            <div className="flex items-center bg-black/30 p-1 border border-white/20 rounded-xl">
              <span className="text-[9px] font-mono font-bold text-slate-300 px-2 uppercase">Periode:</span>
              <select
                value={selectedPeriodeId || ''}
                onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
                className="bg-black/40 border border-white/20 text-[10px] text-amber-300 rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
              >
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                    {p.nama_periode}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase rounded-xl transition-all shadow-md text-[10px]">
              ➕ Tambah Foto
            </button>
          )}
        </div>
      </div>

      {/* STRUKTUR GRID DAFTAR FOTO */}
      {photos.length === 0 ? (
        <div className="p-12 text-center opacity-70 font-mono border border-dashed border-white/20 bg-white/5 backdrop-blur-xl rounded-2xl">
          Belum ada arsip foto dokumentasi kegiatan yang diunggah untuk periode ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl hover:border-white/40 transition-all group">
              <div className="relative bg-black/40 aspect-video w-full flex items-center justify-center overflow-hidden">
                <img 
                  src={p.image_url} 
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3.5 flex justify-between items-center bg-black/20 border-t border-white/10">
                <span className="text-xs font-bold text-slate-100 truncate max-w-[150px] sm:max-w-[180px] tracking-wide">
                  {p.title}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleDownload(p.image_url, p.title)}
                    className="bg-white/10 hover:bg-white/20 text-slate-100 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/20 transition-all"
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
            </div>
          ))}
        </div>
      )}

      {/* MODAL DIALOG POP-UP INPUT FOTO (GLASSMORPISM) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSavePhoto} className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span>➕</span> Unggah Dokumentasi Baru
            </h3>
            
            <div>
              <label className="block text-slate-200 mb-1 font-semibold">Nama / Judul Dokumentasi Kegiatan</label>
              <input 
                type="text" 
                required 
                placeholder="Contoh: Pendirian Tenda Utama Maqbaroh"
                value={formTitle} 
                onChange={e => setFormTitle(e.target.value)} 
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl focus:outline-none font-medium text-white placeholder:text-slate-400" 
              />
            </div>

            <div>
              <label className="block text-slate-200 mb-1 font-semibold">Pilih File Foto Gambar</label>
              <input 
                type="file" 
                required
                accept="image/*"
                onChange={e => setFormFile(e.target.files[0])} 
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-white/20 file:text-white file:font-bold hover:file:bg-white/30 cursor-pointer focus:outline-none" 
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={resetForm} disabled={uploading} className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl disabled:opacity-50 transition-all">Batal</button>
              <button type="submit" disabled={uploading} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase rounded-xl shadow-lg disabled:opacity-50 transition-all">
                {uploading ? '⏳ Mengunggah...' : 'Simpan Foto'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
