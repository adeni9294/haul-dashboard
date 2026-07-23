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

  // ➕ State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  const [currentPeriodeObj, setCurrentPeriodeObj] = useState(null);

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
  }, [selectedPeriodeId]);

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

  // Mengambil data dari tabel 'committee' berdasarkan periode
  async function loadPanitia() {
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
        const found = listPeriode.find(p => p.id === activePeriodeId) || listPeriode[0];
        setCurrentPeriodeObj(found);
      }

      // 2. Query Data Kepanitiaan berdasarkan Periode
      let query = supabase
        .from('committee')
        .select('*')
        .order('id', { ascending: true });

      if (activePeriodeId) {
        query = query.eq('periode_id', activePeriodeId);
      }

      const { data, error } = await query;

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
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini telah ditutup buku. Tidak dapat merubah data kepanitiaan.');
    if (!nama.trim()) return;

    const supabase = getSupabase();
    
    // Payload disesuaikan dengan struktur kolom database + periode_id
    const payload = { 
      name: nama.trim(),
      position: jabatan.trim() || '-',
      phone: nomorHp.trim() || '-',
      periode_id: selectedPeriodeId
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
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini sudah ditutup buku!');
    setEditingId(p.id);
    setNama(p.name || '');
    setJabatan(p.position || '');
    setNomorHp(p.phone || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini sudah ditutup buku!');
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

  if (loading) return <div className="text-center py-12 text-xs font-mono opacity-70">Memuat struktur kepanitiaan...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* HEADER PAGE STATUS & PERIODE SELECTOR (GLASSMORPISM) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <span>👥</span> Susunan Kepanitiaan Haul
          </h2>
          <p className="text-[10px] opacity-80 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        {/* SELECTOR PERIODE */}
        {periodeList.length > 0 && (
          <div className="flex items-center bg-black/30 p-1 border border-white/20 rounded-xl">
            <span className="text-[9px] font-mono font-bold text-slate-300 px-2 uppercase">Periode Haul:</span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-black/40 border border-white/20 text-[10px] text-amber-300 rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* INDIKATOR TUTUP BUKU */}
      {currentPeriodeObj?.is_closed && (
        <div className="bg-amber-500/20 border border-amber-400/40 p-3 rounded-xl flex items-center justify-between text-amber-300 font-mono text-xs backdrop-blur-md">
          <span>🔒 Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Susunan kepanitiaan bersifat Read-Only.</span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORM INPUT ADMIN (GLASSMORPISM) */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
          <form onSubmit={handleSubmit} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl h-fit space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>{editingId ? '🔄' : '➕'}</span> {editingId ? 'Perbarui Data Panitia' : 'Tambah Anggota Panitia'}
            </h3>
            <div>
              <label className="block text-[11px] text-slate-200 mb-1 font-semibold">Nama Anggota Panitia</label>
              <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Ahmad Deni" className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl text-xs text-white focus:outline-none placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-200 mb-1 font-semibold">Jabatan / Posisi</label>
              <input type="text" value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Contoh: Bendahara" className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl text-xs text-white focus:outline-none placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-200 mb-1 font-semibold">Nomor WhatsApp / Phone</label>
              <input type="text" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} placeholder="Contoh: +62 812-3456-789" className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl text-xs text-white focus:outline-none font-mono placeholder:text-slate-400" />
            </div>
            
            <button type="submit" className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl transition-all shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Panitia'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setNama(''); setJabatan(''); setNomorHp(''); }} className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold rounded-xl mt-2 transition-all">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl h-fit text-center space-y-2 shadow-xl">
            <p className="text-xs text-slate-200 font-medium">
              {currentPeriodeObj?.is_closed ? '🔒 Periode ini sudah ditutup buku.' : '💡 Anda berada di Mode Publik (Lihat Saja).'}
            </p>
            <p className="text-[10px] opacity-70 font-mono">
              {currentPeriodeObj?.is_closed ? 'Struktur kepanitiaan telah dikunci.' : 'Gunakan akses admin untuk mengaktifkan formulir manajemen panitia.'}
            </p>
          </div>
        )}

        {/* DATA UTAMA STRUKTUR LIST (GLASSMORPISM) */}
        <div className="lg:col-span-2 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-3 shadow-xl">
          <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Susunan Kepanitiaan Terdaftar ({panitiaList.length})
          </h3>
          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {panitiaList.length === 0 ? (
              <p className="text-xs opacity-70 font-mono py-6 text-center">Belum ada daftar kepanitiaan yang ditemukan pada periode ini.</p>
            ) : (
              panitiaList.map((p) => (
                <div key={p.id} className="p-3.5 bg-black/20 border border-white/10 rounded-xl flex justify-between items-center text-xs hover:border-white/30 transition-all">
                  <div>
                    {/* Kolom name */}
                    <p className="font-bold text-white text-sm tracking-wide">{p.name || 'Tanpa Nama'}</p>
                    
                    {/* Kolom position dan phone */}
                    <div className="flex flex-col gap-0.5 text-[10px] opacity-80 font-mono mt-1">
                      <p>💼 Jabatan: <span className="text-amber-300 font-sans font-semibold">{p.position || '-'}</span></p>
                      <p>📞 Phone: <span className="text-slate-200">{p.phone || '-'}</span></p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-3 font-mono text-[11px] shrink-0 ml-2">
                      {currentPeriodeObj?.is_closed ? (
                        <span className="text-amber-300 italic text-[10px]">🔒 Terkunci</span>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(p)} className="text-amber-300 hover:underline font-bold">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="text-rose-300 hover:underline font-bold">Hapus</button>
                        </>
                      )}
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
