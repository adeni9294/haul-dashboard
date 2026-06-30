'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DokumentasiPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // State untuk form upload admin
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchPhotos()
    checkUserSession()
  }, [])

  // Cek apakah ada session admin yang aktif
  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setIsAdmin(true)
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

  // Fungsi mengunduh foto langsung ke perangkat publik
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

      // A. Upload file fisik ke Supabase Storage
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

      alert('Foto dokumentasi berhasil ditambahkan!')
      setTitle('')
      setFile(null)
      // Refresh list galeri foto
      fetchPhotos()
    } catch (error) {
      alert(`Error: ${error.message}`)
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

      alert('Foto berhasil dihapus!')
      fetchPhotos()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-zinc-100 p-6 pb-24">
      {/* Header Halaman */}
      <div className="border-b border-zinc-800 pb-4 mb-6">
        <h1 className="text-xl font-bold text-[#1fa57a]">MENU DOKUMENTASI</h1>
        <p className="text-xs text-zinc-400 mt-1">Daftar dokumentasi dan foto kegiatan lapangan</p>
      </div>

      {/* PANEL ADMIN (Hanya muncul jika user terautentikasi/login sebagai admin) */}
      {isAdmin && (
        <div className="mb-8 p-5 bg-[#18181c] border border-zinc-800 rounded-lg max-w-xl">
          <h2 className="text-sm font-semibold text-[#1fa57a] mb-4">PANEL ADMIN: TAMBAH DOKUMENTASI</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Nama / Judul Kegiatan</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pembelian Alat Drumband"
                className="w-full text-xs p-2.5 bg-[#0f0f11] border border-zinc-800 rounded text-white focus:outline-none focus:border-[#1fa57a]"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Pilih File Foto</label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[#1fa57a] hover:bg-[#167d5c] text-white text-xs font-medium p-2.5 rounded transition-all disabled:opacity-50"
            >
              {uploading ? 'Sedang Mengunggah...' : 'UNGGUH FOTO KE CLOUD'}
            </button>
          </form>
        </div>
      )}

      {/* GALERI FOTO (Bisa dilihat oleh Publik & Admin) */}
      {loading ? (
        <div className="text-zinc-400 text-xs text-center py-10">Memuat berkas foto...</div>
      ) : photos.length === 0 ? (
        <div className="text-zinc-500 text-xs text-center py-10">Belum ada foto dokumentasi kegiatan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-[#18181c] border border-zinc-800 rounded-lg overflow-hidden flex flex-col justify-between shadow-md">
              <div className="relative group">
                <img 
                  src={photo.image_url} 
                  alt={photo.title}
                  className="w-full h-44 object-cover"
                />
              </div>
              <div className="p-3 flex justify-between items-center bg-[#141417]">
                <span className="text-xs font-medium text-zinc-300 truncate max-w-[150px]">
                  {photo.title}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(photo.image_url, photo.title)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] px-2.5 py-1 rounded border border-zinc-700 transition-all"
                  >
                    Unduh
                  </button>

                  {/* Tombol Hapus khusus Admin */}
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(photo.id, photo.image_url)}
                      className="bg-red-950/40 hover:bg-red-900 border border-red-900 text-red-200 text-[11px] px-2.5 py-1 rounded transition-all"
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
