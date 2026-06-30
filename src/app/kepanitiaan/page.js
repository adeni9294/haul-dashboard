'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function KepanitiaanPage() {
  const [panitiaList, setPanitiaList] = useState([]);
  const [namaKepanitiaan, setNamaKepanitiaan] = useState(''); 
  const [editingId, setEditingId] = useState(null);

  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
  };

  useEffect(() => { 
    loadPanitia(); 
  }, []);

  // Mengambil data dari tabel categories (atau sesuaikan dengan nama tabel kepanitiaan Anda)
  async function loadPanitia() {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: false });
    if (!error && data) setPanitiaList(data);
  }

  // GERBANG KEAMANAN: Memvalidasi sandi langsung ke row settings di database
  async function verifikasiAksesAdmin() {
    const passwordInput = prompt("Masukkan Password Admin untuk melakukan aksi ini:");
    if (!passwordInput) return false;

    const supabase = getSupabase();
    const { data: settingsData, error } = await supabase
      .from('settings')
      .select('admin_password')
      .eq('id', 'main_config')
      .single();

    if (error || !settingsData) {
      alert("❌ Gagal terhubung ke sistem keamanan database.");
      return false;
    }

    if (passwordInput !== settingsData.admin_password) {
      alert("❌ Password Salah! Akses ditolak.");
      return false;
    }

    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaKepanitiaan.trim()) return;

    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    const supabase = getSupabase();
    // Sesuaikan payload ini dengan nama kolom di tabel categories Anda (misal: 'name' atau 'kategori')
    const payload = { 
      name: namaKepanitiaan.trim() 
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId).select();
        if (error) throw error;
        alert('🎯 Data kepanitiaan berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('categories').insert([payload]).select();
        if (error) throw error;
        alert('✅ Data kepanitiaan berhasil ditambahkan!');
      }

      setNamaKepanitiaan(''); 
      setEditingId(null);
      await loadPanitia();
    } catch (err) { 
      console.error(err);
      alert(`❌ Gagal menyimpan data kepanitiaan.`); 
    }
  };

  const handleEdit = async (p) => {
    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    setEditingId(p.id);
    setNamaKepanitiaan(p.name || ''); // Sesuaikan properti kolom database
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus data kepanitiaan ini?')) {
      const lolosVerifikasi = await verifikasiAksesAdmin();
      if (!lolosVerifikasi) return;

      const supabase = getSupabase();
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        alert('🗑️ Data kepanitiaan berhasil dihapus!');
        await loadPanitia();
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* FORM UTAMA */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase">
          {editingId ? '🔄 Perbarui Kepanitiaan' : '➕ Tambah Struktur / Bagian Panitia'}
        </h3>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Bagian / Pos Kepanitiaan</label>
          <input 
            type="text" 
            required 
            value={namaKepanitiaan} 
            onChange={(e) => setNamaKepanitiaan(e.target.value)} 
            placeholder="Contoh: Sie Konsumsi, Sie Humas"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" 
          />
        </div>
        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400 transition-all">
          {editingId ? '💾 Simpan Perubahan' : 'Simpan Kepanitiaan'}
        </button>
        {editingId && (
          <button 
            type="button" 
            onClick={() => { setEditingId(null); setNamaKepanitiaan(''); }} 
            className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2"
          >
            Batal Edit
          </button>
        )}
      </form>

      {/* DAFTAR DATA */}
      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Struktur Kepanitiaan ({panitiaList.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {panitiaList.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada data kepanitiaan.</p>
          ) : (
            panitiaList.map(p => (
              <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <span>👥 {p.name || p.category}</span>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-amber-500 font-bold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
