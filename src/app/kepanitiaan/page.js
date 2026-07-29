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
  const [viewMode, setViewMode] = useState('chart'); // 'chart' atau 'list'

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

  async function loadPanitia() {
    try {
      setLoading(true);
      const supabase = getSupabase();

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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return showToast('Aksi ditolak. Anda belum login sebagai admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini telah ditutup buku.', 'error');
    if (!nama.trim()) return;

    const supabase = getSupabase();
    
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

  // 💡 HELPER: KELOMPOKKAN ANGGOTA SESUAI LEVEL JABATAN UNTUK BAGAN HIERARKI
  const getCategorizedCommittee = () => {
    const topTier = [];     // Pelindung, Penasehat, Penanggung Jawab, Ketua, Wakil Ketua
    const middleTier = [];  // Sekretaris, Bendahara, Koordinator Utama
    const sectionTier = []; // Seksi-Seksi & Anggota Operasional

    panitiaList.forEach((p) => {
      const pos = (p.position || '').toLowerCase();
      if (
        pos.includes('pelindung') || 
        pos.includes('penasehat') || 
        pos.includes('penasihat') ||
        pos.includes('penanggung jawab') || 
        pos.includes('ketua') || 
        pos.includes('pimpinan')
      ) {
        topTier.push(p);
      } else if (
        pos.includes('sekretaris') || 
        pos.includes('bendahara') || 
        pos.includes('koordinator')
      ) {
        middleTier.push(p);
      } else {
        sectionTier.push(p);
      }
    });

    return { topTier, middleTier, sectionTier };
  };

  const { topTier, middleTier, sectionTier } = getCategorizedCommittee();

  // 🚀 TAMPILAN SKELETON LOADING
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0 pb-12">
        <div className="flex items-center justify-center gap-3 py-6 text-amber-400 font-mono text-xs tracking-widest uppercase">
          <svg className="animate-spin h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">Memuat Bagan Struktur Kepanitiaan...</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 h-64 animate-pulse bg-slate-900/40 border border-white/5" />
          <GlassCard className="lg:col-span-2 p-6 h-64 animate-pulse bg-slate-900/40 border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs theme-text-primary relative">

      {/* 🔔 FLOATING TOAST NOTIFICATION (POSISI CENTER ATAS) */}
      {toast.show && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md transition-all duration-300">
          <div className={`px-5 py-3.5 border-2 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
            toast.type === 'error' 
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50' 
              : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50'
          }`}>
            <span className="text-lg shrink-0">{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span className="font-mono font-bold text-xs leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ❓ CUSTOM CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="max-w-sm w-full p-6 space-y-4 shadow-2xl border theme-border text-center">
            <div className="text-3xl">❓</div>
            <h3 className="font-bold text-sm theme-text-primary uppercase tracking-wider">{confirmModal.title}</h3>
            <p className="text-xs theme-text-secondary leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 theme-text-secondary font-mono rounded-xl border theme-border transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold rounded-xl transition-all shadow-md"
              >
                Ya, Hapus
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* HEADER PAGE STATUS, PERIODE SELECTOR & MODE SWITCHER */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 theme-text-primary">
            <span>👥</span> Struktur Organisasi & Kepanitiaan
          </h2>
          <p className="text-[10px] theme-text-tertiary font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* TOGGLE VIEW MODE (BAGAN VS LIST) */}
          <div className="flex bg-black/40 p-1 border theme-border rounded-xl font-mono text-[10px]">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'chart' 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              🌳 Bagan Organisasi
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'list' 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'theme-text-secondary hover:theme-text-primary'
              }`}
            >
              📋 Daftar Anggota
            </button>
          </div>

          {/* SELECTOR PERIODE */}
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
                    {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </GlassCard>

      {/* INDIKATOR TUTUP BUKU */}
      {currentPeriodeObj?.is_closed && (
        <GlassCard className="p-3 border-amber-500/40 flex items-center justify-between text-amber-300 font-mono text-xs">
          <span>🔒 Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Susunan kepanitiaan bersifat Read-Only.</span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORM INPUT ADMIN (GLASSMORPHISM) */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
          <GlassCard className="p-6 h-fit space-y-4">
            <h3 className="text-xs font-black theme-text-accent uppercase tracking-wider flex items-center gap-2">
              <span>{editingId ? '🔄' : '➕'}</span> {editingId ? 'Perbarui Data Panitia' : 'Tambah Anggota Panitia'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Contoh: Ketua Panitia / Seksi Konsumsi" 
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
              
              <button type="submit" className="w-full py-2.5 btn-theme-primary font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer">
                {editingId ? '💾 Simpan Perubahan' : 'Simpan Panitia'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { setEditingId(null); setNama(''); setJabatan(''); setNomorHp(''); }} 
                  className="w-full py-1.5 bg-black/30 hover:bg-black/50 theme-text-secondary text-xs font-bold rounded-xl mt-2 transition-all border theme-border cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </form>
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

        {/* UTAMA: BAGAN HIERARKI ATAU DAFTAR ANGGOTA */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          
          {/* MODE 1: BAGAN ORGANISASI (ORG CHART) */}
          {viewMode === 'chart' ? (
            <div className="space-y-8 py-2">
              <div className="border-b theme-border pb-3 flex justify-between items-center">
                <h3 className="text-xs font-black theme-text-primary uppercase tracking-wider flex items-center gap-2">
                  <span>🌳</span> Bagan Hirarki Kepanitiaan ({panitiaList.length})
                </h3>
              </div>

              {panitiaList.length === 0 ? (
                <p className="text-xs theme-text-tertiary font-mono py-8 text-center">Belum ada daftar kepanitiaan pada periode ini.</p>
              ) : (
                <div className="space-y-8">
                  
                  {/* LEVEL 1: PIMPINAN & KETUA */}
                  {topTier.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                          ⭐ Pimpinan & Penasehat
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4">
                        {topTier.map((p) => (
                          <div 
                            key={p.id} 
                            className="w-full sm:w-64 p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-slate-900/60 border-2 border-amber-400/50 text-center shadow-lg relative group"
                          >
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-lg">
                              👤
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide">{p.name}</h4>
                            <p className="text-[11px] font-bold text-amber-300 font-mono mt-0.5">{p.position}</p>
                            {p.phone && p.phone !== '-' && (
                              <p className="text-[10px] text-slate-400 font-mono mt-1">📱 {p.phone}</p>
                            )}

                            {isAdmin && !currentPeriodeObj?.is_closed && (
                              <div className="mt-3 pt-2 border-t border-white/10 flex justify-center gap-3 font-mono text-[10px]">
                                <button onClick={() => handleEdit(p)} className="text-amber-400 hover:underline font-bold">Edit</button>
                                <button onClick={() => handleDelete(p.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GARIS KONEKTOR VISUAL */}
                  {topTier.length > 0 && middleTier.length > 0 && (
                    <div className="w-0.5 h-6 bg-amber-400/40 mx-auto" />
                  )}

                  {/* LEVEL 2: BPH (SEKRETARIS & BENDAHARA) */}
                  {middleTier.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 rounded-full">
                          ⚙️ Badan Pengurus Harian (BPH)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {middleTier.map((p) => (
                          <div 
                            key={p.id} 
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-400/30 flex items-center gap-3 shadow-md group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-base shrink-0">
                              📑
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-slate-100 uppercase truncate">{p.name}</h4>
                              <p className="text-[10px] font-mono text-cyan-300 font-semibold">{p.position}</p>
                              {p.phone && p.phone !== '-' && (
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">📱 {p.phone}</p>
                              )}
                            </div>

                            {isAdmin && !currentPeriodeObj?.is_closed && (
                              <div className="flex gap-2 font-mono text-[10px] shrink-0">
                                <button onClick={() => handleEdit(p)} className="text-amber-400 hover:underline font-bold">Edit</button>
                                <button onClick={() => handleDelete(p.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GARIS KONEKTOR VISUAL */}
                  {middleTier.length > 0 && sectionTier.length > 0 && (
                    <div className="w-0.5 h-6 bg-cyan-400/40 mx-auto" />
                  )}

                  {/* LEVEL 3: SEKSI-SEKSI SEKSI & OPERASIONAL */}
                  {sectionTier.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 rounded-full">
                          🛠️ Seksi & Anggota Pelaksana
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sectionTier.map((p) => (
                          <div 
                            key={p.id} 
                            className="p-3 rounded-xl bg-black/30 border border-white/10 flex justify-between items-center text-xs hover:border-emerald-400/30 transition-all"
                          >
                            <div>
                              <p className="font-bold text-slate-200 uppercase">{p.name}</p>
                              <p className="text-[10px] text-emerald-400 font-mono font-medium">{p.position}</p>
                            </div>

                            {isAdmin && !currentPeriodeObj?.is_closed && (
                              <div className="flex gap-2 font-mono text-[10px]">
                                <button onClick={() => handleEdit(p)} className="text-amber-400 hover:underline font-bold">Edit</button>
                                <button onClick={() => handleDelete(p.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          ) : (

            /* MODE 2: DAFTAR FLAT (TABEL / LIST) */
            <div className="space-y-3">
              <h3 className="text-xs font-black theme-text-primary uppercase tracking-wider flex items-center gap-2 border-b theme-border pb-3">
                <span>📋</span> Daftar Seluruh Anggota ({panitiaList.length})
              </h3>
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {panitiaList.length === 0 ? (
                  <p className="text-xs theme-text-tertiary font-mono py-6 text-center">Belum ada daftar kepanitiaan yang ditemukan pada periode ini.</p>
                ) : (
                  panitiaList.map((p) => (
                    <div key={p.id} className="p-3.5 bg-black/20 border theme-border rounded-xl flex justify-between items-center text-xs hover:border-white/30 transition-all">
                      <div>
                        <p className="font-bold theme-text-primary text-sm tracking-wide uppercase">{p.name || 'Tanpa Nama'}</p>
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
            </div>
          )}

        </GlassCard>

      </div>
    </div>
  );
}
