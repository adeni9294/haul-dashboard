'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DokumentasiPage() {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // State Form Modal Tambah Dokumentasi (Sesuai Gaya Transaksi)
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formFile, setFormFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAdminSession();
    loadPhotos();
  }, []);

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
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

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

      // Proteksi Tambahan: Validasi RPC Ulang Sesaat Sebelum Upload (Anti-bypass RLS)
      const savedPassword = localStorage.getItem('admin_password_haul');
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      if (!isValid) throw new Error('Otorisasi admin tidak sah atau kadaluarsa!');

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

      // C. Masukkan catatan baris ke tabel database 'photos'
      const { error: insertError } = await supabase
        .from('photos')
        .insert([{ title: formTitle.trim(), image_url: publicUrl }]);

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

      // Hapus file fisik dari Supabase Storage jika jalur path sesuai
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
      document.body.appendChild(a)
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

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Membuka album dokumentasi...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* AREA UTAMA PANEL KONTROL (KONSISTEN DENGAN TRANSAKSI) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider">📸 Galeri Dokumentasi Kegiatan Haul</h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>
        {isAdmin && (
          <div className="w-full sm:w-auto">
            <button onClick={() => setShowModal(true)} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white font-bold uppercase rounded-xl hover:bg-emerald-500 transition-all shadow-md">
              ➕ Tambah Foto
            </button>
          </div>
        )}
      </div>

      {/* STRUKTUR GRID DAFTAR FOTO (ALBUM) */}
      {photos.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-mono border border-dashed border-slate-800 bg-slate-900/20 rounded-xl">
          Belum ada arsip foto dokumentasi kegiatan yang diunggah.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
              <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center overflow-hidden">
                <img 
                  src={p.image_url} 
                  alt={p.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3.5 flex justify-between items-center bg-slate-950/40 border-t border-slate-800/60">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[150px] sm:max-w-[180px]">
                  {p.title}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleDownload(p.image_url, p.title)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-all"
                  >
                    Unduh
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => triggerHapus(p)}
                      className="bg-rose-950/40 hover:bg-rose-900 border border-rose-900/60 text-rose-300 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
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

      {/* ================= MODAL DIALOG POP-UP INPUT FOTO DOKUMENTASI ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleSavePhoto} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl text-slate-200">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">➕ Unggah Dokumentasi Baru</h3>
            
            <div>
              <label className="block text-slate-400 mb-1">Nama / Judul Dokumentasi Kegiatan</label>
              <input 
                type="text" 
                required 
                placeholder="Contoh: Pendirian Tenda Utama Maqbaroh"
                value={formTitle} 
                onChange={e => setFormTitle(e.target.value)} 
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none font-medium" 
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Pilih File Foto Gambar</label>
              <input 
                type="file" 
                required
                accept="image/*"
                onChange={e => setFormFile(e.target.files[0])} 
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200 file:font-bold hover:file:bg-slate-700 cursor-pointer focus:outline-none" 
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={resetForm} disabled={uploading} className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl disabled:opacity-50">Batal</button>
              <button type="submit" mercantile="true" disabled={uploading} className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black uppercase rounded-xl shadow-lg disabled:opacity-50">
                {uploading ? '⏳ Mengunggah...' : 'Simpan Foto'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
