'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function KepanitiaanPage() {
  const [loading, setLoading] = useState(true);
  const [panitiaList, setPanitiaList] = useState([]);
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Inisialisasi Supabase Client
  const getSupabase = () => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  };

  useEffect(() => {
    checkAdminSession();
    loadPanitia();

    const interval = setInterval(checkAdminSession, 500);
    return () => clearInterval(interval);
  }, []);

  // Memeriksa status login admin
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

  // Mengambil data dari tabel 'committee'
  async function loadPanitia() {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('committee')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) {
        setPanitiaList(data);
      } else if (error) {
        console.error("Error mengambil data:", error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Simpan & Edit Data ke database
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak. Anda belum login sebagai admin!');
    if (!nama.trim()) return;

    const supabase = getSupabase();
    
    // Payload disesuaikan persis dengan struktur kolom database Anda
    const payload = { 
      name: nama.trim(),
      position: jabatan.trim() || '-',
      phone: nomorHp.trim() || '-'
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('committee').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('🟢 Data kepanitiaan berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('committee').insert([payload]);
        if (error) throw error;
        alert('🟢 Anggota panitia baru berhasil ditambahkan!');
      }

      setNama('');
      setJabatan('');
      setNomorHp('');
      setEditingId(null);
      await loadPanitia();
    } catch (err) {
      console.error(err);
      alert(`❌ Gagal menyimpan data: ${err?.message || err}`);
    }
  };

  const handleEdit = (p) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    setEditingId(p.id);
    setNama(p.name || '');
    setJabatan(p.position || '');
    setNomorHp(p.phone || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (!confirm('Apakah Anda yakin ingin menghapus anggota panitia ini?')) return;
    
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('committee').delete().eq('id', id);
      if (error) throw error;
      alert('🗑️ Anggota panitia berhasil dihapus.');
      await loadPanitia();
    } catch (err) {
      alert(`❌ Gagal menghapus: ${err?.message || err}`);
    }
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Memuat struktur kepanitiaan...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider">👥 Susunan Kepanitiaan Haul</h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORM INPUT ADMIN */}
        {isAdmin ? (
          <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">
              {editingId ? '🔄 Perbarui Data Panitia' : '➕ Tambah Anggota Panitia'}
            </h3>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Anggota Panitia</label>
              <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Ahmad Deni" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Jabatan / Posisi</label>
              <input type="text" value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Contoh: Bendahara" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nomor WhatsApp / Phone</label>
              <input type="text" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} placeholder="Contoh: +62 812-3456-789" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
            </div>
            
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Panitia'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setNama(''); setJabatan(''); setNomorHp(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium">💡 Anda berada di Mode Publik (Lihat Saja).</p>
            <p className="text-[10px] text-slate-500 font-mono">Gunakan akses admin untuk mengaktifkan formulir manajemen panitia.</p>
          </div>
        )}

        {/* DATA UTAMA STRUKTUR LIST */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">📋 Susunan Kepanitiaan Terdaftar ({panitiaList.length})</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {panitiaList.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-6 text-center">Belum ada daftar kepanitiaan yang ditemukan di tabel database.</p>
            ) : (
              panitiaList.map((p) => (
                <div key={p.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs hover:border-slate-700/80 transition-all">
                  <div>
                    {/* Kolom name */}
                    <p className="font-bold text-white text-sm">{p.name || 'Tanpa Nama'}</p>
                    
                    {/* Kolom position dan phone */}
                    <div className="flex flex-col gap-0.5 text-[10px] text-slate-400 font-mono mt-1">
                      <p>💼 Jabatan: <span className="text-amber-400 font-sans font-medium">{p.position || '-'}</span></p>
                      <p>📞 Phone: <span className="text-slate-300">{p.phone || '-'}</span></p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-3 font-mono text-[11px]">
                      <button onClick={() => handleEdit(p)} className="text-amber-400 hover:underline font-bold">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
