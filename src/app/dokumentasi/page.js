'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DokumentasiPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // State untuk form upload admin
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Inisialisasi Supabase di dalam komponen agar aman dari undefined env
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    fetchPhotos()
    checkAdminSession()
  }, [])

  // DISESUAIKAN: Pengecekan Admin disamakan persis dengan layout.js Anda
  async function checkAdminSession() {
    const savedPassword = localStorage.getItem('admin_password_haul')
    if (!savedPassword) {
      setIsAdmin(false)
      return
    }
    try {
      const { data: isValid } = await supabase.rpc('verify_admin_password', { 
        p_password: savedPassword 
      })
      setIsAdmin(!!isValid)
    } catch (err) {
      setIsAdmin(false)
    }
  }

  // Mengambil data foto dari Supabase Database
  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error) {
      console.error('Gagal memuat foto:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi mengunduh foto langsung ke perangkat
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${filename.replace(/\s+/g, '_')}.jpg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      alert('Gagal mengunduh foto')
    }
  }

  // Fungsi proses upload file oleh Admin
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return alert('Harap isi judul dan pilih foto!')

    try {
      setUploading(true)

      // A. Upload file fisik ke Supabase Storage (Bucket: dokumentasi)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `kegiatan/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('dokumentasi')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // B. Ambil URL Publik dari file yang berhasil diupload
      const { data: { publicUrl } } = supabase.storage
        .from('dokumentasi')
        .getPublicUrl(filePath)

      // C. Simpan metadata & URL ke tabel 'photos' di Database
      const { error: insertError } = await supabase
        .from('photos')
        .insert([{ title, image_url: publicUrl }])

      if (insertError) throw insertError

      alert('🟢 Foto dokumentasi berhasil ditambahkan!')
      setTitle('')
      setFile(null)
      fetchPhotos()
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Fungsi hapus foto khusus admin
  const handleDelete = async (id, imageUrl) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto kegiatan ini?')) return

    try {
      // Ekstrak nama file dari URL untuk menghapusnya di Storage
      const urlParts = imageUrl.split('/storage/v1/object/public/dokumentasi/')
      const filePath = urlParts[1]

      if (filePath) {
        await supabase.storage.from('dokumentasi').remove([filePath])
      }

      // Hapus data dari Database
      const { error } = await supabase.from('photos').delete().eq('id', id)
      if (error) throw error

      alert('🟢 Foto berhasil dihapus!')
      fetchPhotos()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="w-full text-zinc-100 p-2 sm:p-4">
      {/* PANEL ADMIN (Otomatis muncul karena deteksi localStorage tersinkronisasi) */}
      {isAdmin && (
        <div className="mb-8 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl shadow-xl">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">
            🛠️ Panel Admin: Tambah Dokumentasi Kegiatan
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Nama / Judul Kegiatan</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pembelian Alat Drumband Baru"
                className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Pilih File Gambar (Foto)</label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-200 file:font-bold hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black p-2.5 rounded-xl transition-all disabled:opacity-50 uppercase tracking-wider shadow-md"
            >
              {uploading ? '⏳ Sedang Mengunggah...' : '🚀 Unggah Foto Kegiatan'}
            </button>
          </form>
        </div>
      )}

      {/* GALERI FOTO */}
      {loading ? (
        <div className="text-zinc-500 text-xs text-center font-mono py-12">Mengambil berkas foto dari cloud...</div>
      ) : photos.length === 0 ? (
        <div className="text-zinc-500 text-xs text-center font-mono py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          Belum ada foto dokumentasi kegiatan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg">
              <div className="relative">
                <img 
                  src={photo.image_url} 
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-3.5 flex justify-between items-center bg-zinc-950/40 border-t border-zinc-900">
                <span className="text-xs font-bold text-zinc-200 truncate max-w-[160px]">
                  {photo.title}
                </span>
                
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleDownload(photo.image_url, photo.title)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-zinc-700 transition-all"
                  >
                    Unduh
                  </button>

                  {/* Tombol Hapus otomatis sinkron jika Anda admin */}
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(photo.id, photo.image_url)}
                      className="bg-rose-950/40 hover:bg-rose-900 border border-rose-900 text-rose-200 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
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
    </div>
  )
}
