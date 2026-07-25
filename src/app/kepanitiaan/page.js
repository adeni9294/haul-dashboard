'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';

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

    const interval = setInterval(checkAdminSession, 1000);
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
    if (!isAdmin) return showToast('Aksi ditolak. Anda belum login sebagai admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini telah ditutup buku. Tidak dapat merubah data kepanitiaan.', 'error');
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
        showToast('🟢 Data kepanitiaan berhasil diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('committee').insert([payload]);
        if (error) throw error;
        showToast('🟢 Anggota panitia baru berhasil ditambahkan!', 'success');
      }

      setNama('');
      setJabatan('');
      setNomorHp('');
      setEditingId(null);
      await loadPanitia();
    } catch (err) {
      console.error(err);
      showToast(`❌ Gagal menyimpan data: ${err?.message || err}`, 'error');
    }
  };

  const handleEdit = (p) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini sudah ditutup buku!', 'error');
    setEditingId(p.id);
    setNama(p.name || '');
    setJabatan(p.position || '');
    setNomorHp(p.phone || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini sudah ditutup buku!', 'error');

    showConfirm(
      'Hapus Anggota Panitia',
      'Apakah Anda yakin ingin menghapus anggota panitia ini dari susunan kepanitiaan?',
      async () => {
        try {
          const supabase = getSupabase();
          const { error } = await supabase.from('committee').delete().eq('id', id);
          if (error) throw error;
          showToast('🗑️ Anggota panitia berhasil dihapus.', 'success');
          await loadPanitia();
        } catch (err) {
          showToast(`❌ Gagal menghapus: ${err?.message || err}`, 'error');
        } finally {
          closeConfirm();
        }
      }
    );
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono opacity-70 theme-text-primary">Memuat struktur kepanitiaan...</div>;

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

      {/* HEADER PAGE STATUS & PERIODE SELECTOR (GLASSMORPISM) */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 theme-text-primary">
            <span>👥</span> Susunan Kepanitiaan Haul
          </h2>
          <p className="text-[10px] theme-text-tertiary font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        {/* SELECTOR PERIODE */}
        {periodeList.length > 0 && (
          <div className="flex items-center bg-black/30 p-1 border theme-border rounded-xl">
            <span className="text-[9px] font-mono font-bold theme-text-tertiary px-2 uppercase">Periode Haul:</span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-black/40 border theme-border text-[10px] theme-text-accent rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </GlassCard>

      {/* INDIKATOR TUTUP BUKU */}
      {currentPeriodeObj?.is_closed && (
        <GlassCard className="p-3 border-amber-500/40 flex items-center justify-between text-amber-300 font-mono text-xs">
          <span>🔒 Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Susunan kepanitiaan bersifat Read-Only.</span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORM INPUT ADMIN (GLASSMORPISM) */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
          <GlassCard className="p-6 h-fit space-y-4">
            <h3 className="text-xs font-black theme-text-accent uppercase tracking-wider flex items-center gap-2">
              <span>{editingId ? '🔄' : '➕'}</span> {editingId ? 'Perbarui Data Panitia' : 'Tambah Anggota Panitia'}
            </h3>
            <div>
              <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Nama Anggota Panitia</label>
              <input 
                type="text" 
                required 
                value={nama} 
                onChange={(e) => setNama(e.target.value)} 
                placeholder="Contoh: Ahmad Deni" 
                className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none placeholder:theme-text-tertiary" 
              />
            </div>
            <div>
              <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Jabatan / Posisi</label>
              <input 
                type="text" 
                value={jabatan} 
                onChange={(e) => setJabatan(e.target.value)} 
                placeholder="Contoh: Bendahara" 
                className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none placeholder:theme-text-tertiary" 
              />
            </div>
            <div>
              <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Nomor WhatsApp / Phone</label>
              <input 
                type="text" 
                value={nomorHp} 
                onChange={(e) => setNomorHp(e.target.value)} 
                placeholder="Contoh: +62 812-3456-789" 
                className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none font-mono placeholder:theme-text-tertiary" 
              />
            </div>
            
            <button type="submit" className="w-full py-2.5 btn-theme-primary font-black text-xs uppercase rounded-xl transition-all shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Panitia'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setNama(''); setJabatan(''); setNomorHp(''); }} 
                className="w-full py-1.5 bg-black/30 hover:bg-black/50 theme-text-secondary text-xs font-bold rounded-xl mt-2 transition-all border theme-border"
              >
                Batal Edit
              </button>
            )}
          </GlassCard>
        ) : (
          <GlassCard className="p-6 h-fit text-center space-y-2">
            <p className="text-xs theme-text-secondary font-medium">
              {currentPeriodeObj?.is_closed ? '🔒 Periode ini sudah ditutup buku.' : '💡 Anda berada di Mode Publik (Lihat Saja).'}
            </p>
            <p className="text-[10px] theme-text-tertiary font-mono">
              {currentPeriodeObj?.is_closed ? 'Struktur kepanitiaan telah dikunci.' : 'Gunakan akses admin untuk mengaktifkan formulir manajemen panitia.'}
            </p>
          </GlassCard>
        )}

        {/* DATA UTAMA STRUKTUR LIST (GLASSMORPISM) */}
        <GlassCard className="lg:col-span-2 p-6 space-y-3">
          <h3 className="text-xs font-black theme-text-primary uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Susunan Kepanitiaan Terdaftar ({panitiaList.length})
          </h3>
          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {panitiaList.length === 0 ? (
              <p className="text-xs theme-text-tertiary font-mono py-6 text-center">Belum ada daftar kepanitiaan yang ditemukan pada periode ini.</p>
            ) : (
              panitiaList.map((p) => (
                <div key={p.id} className="p-3.5 bg-black/20 border theme-border rounded-xl flex justify-between items-center text-xs hover:border-white/30 transition-all">
                  <div>
                    {/* Kolom name */}
                    <p className="font-bold theme-text-primary text-sm tracking-wide">{p.name || 'Tanpa Nama'}</p>
                    
                    {/* Kolom position dan phone */}
                    <div className="flex flex-col gap-0.5 text-[10px] theme-text-secondary font-mono mt-1">
                      <p>💼 Jabatan: <span className="theme-text-accent font-sans font-semibold">{p.position || '-'}</span></p>
                      <p>📞 Phone: <span className="theme-text-primary">{p.phone || '-'}</span></p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-3 font-mono text-[11px] shrink-0 ml-2">
                      {currentPeriodeObj?.is_closed ? (
                        <span className="theme-text-accent italic text-[10px]">🔒 Terkunci</span>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(p)} className="theme-text-accent hover:underline font-bold">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
