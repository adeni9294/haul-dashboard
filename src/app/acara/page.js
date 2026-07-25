'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';

export default function AcaraPage() {
  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState([]);
  const [agenda, setAgenda] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [pic, setPic] = useState('');
  const [dateEvent, setDateEvent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ➕ State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  const [currentPeriodeObj, setCurrentPeriodeObj] = useState(null);

  // 🔔 Custom Toast & Modal Alert States
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
    loadSchedules();

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

  async function loadSchedules() {
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

      // 2. Query Data Rundown Acara berdasarkan Periode
      let query = supabase
        .from('schedules')
        .select('*')
        .order('event_date', { ascending: true })
        .order('time_start', { ascending: true });

      if (activePeriodeId) {
        query = query.eq('periode_id', activePeriodeId);
      }

      const { data, error } = await query;

      if (!error && data) {
        setScheduleList(data);
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
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini telah ditutup buku. Tidak dapat merubah jadwal.', 'error');
    if (!agenda.trim() || !timeStart.trim() || !dateEvent) return;

    const supabase = getSupabase();
    
    const payload = { 
      agenda: agenda.trim(),
      time_start: timeStart.trim(),
      time_end: timeEnd.trim() || 'S.D Selesai',
      pic: pic.trim() || '-',
      event_date: dateEvent,
      periode_id: selectedPeriodeId
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('schedules').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('🟢 Jadwal acara berhasil diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('schedules').insert([payload]);
        if (error) throw error;
        showToast('🟢 Jadwal acara baru berhasil ditambahkan!', 'success');
      }

      setAgenda('');
      setTimeStart('');
      setTimeEnd('');
      setPic('');
      setDateEvent('');
      setEditingId(null);
      await loadSchedules();
    } catch (err) {
      console.error(err);
      showToast(`❌ Gagal menyimpan: ${err?.message || err}`, 'error');
    }
  };

  const handleEdit = (s) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini sudah ditutup buku!', 'error');
    setEditingId(s.id);
    setAgenda(s.agenda || '');
    setTimeStart(s.time_start || '');
    setTimeEnd(s.time_end || '');
    setPic(s.pic || '');
    setDateEvent(s.event_date || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini sudah ditutup buku!', 'error');

    showConfirm(
      'Hapus Jadwal Acara',
      'Apakah Anda yakin ingin menghapus jadwal agenda ini dari rundown?',
      async () => {
        try {
          const supabase = getSupabase();
          const { error } = await supabase.from('schedules').delete().eq('id', id);
          if (error) throw error;
          showToast('🗑️ Acara berhasil dihapus.', 'success');
          await loadSchedules();
        } catch (err) {
          showToast(`❌ Gagal menghapus: ${err?.message || err}`, 'error');
        } finally {
          closeConfirm();
        }
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
      return String(dateString);
    }
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono opacity-70 theme-text-primary">Memuat susunan acara...</div>;

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
            <span>📅</span> Susunan Agenda & Rundown Acara
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
          <span>🔒 Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Susunan acara bersifat Read-Only.</span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERFACE FORM INPUT (GLASSMORPISM) */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
          <GlassCard className="p-6 h-fit space-y-4">
            <h3 className="text-xs font-black theme-text-accent uppercase tracking-wider flex items-center gap-2">
              <span>{editingId ? '🔄' : '➕'}</span> {editingId ? 'Perbarui Acara' : 'Tambah Rundown Acara'}
            </h3>
            <div>
              <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Tanggal Acara</label>
              <input type="date" required value={dateEvent} onChange={(e) => setDateEvent(e.target.value)} className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Mulai</label>
                <input type="text" required value={timeStart} onChange={(e) => setTimeStart(e.target.value)} placeholder="08:00" className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none font-mono placeholder:theme-text-tertiary" />
              </div>
              <div>
                <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Selesai</label>
                <input type="text" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} placeholder="09:30 / Selesai" className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none font-mono placeholder:theme-text-tertiary" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Nama Kegiatan / Agenda</label>
              <input type="text" required value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Contoh: Pembukaan & Tahlil" className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none placeholder:theme-text-tertiary" />
            </div>
            <div>
              <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">PIC (Penanggung Jawab)</label>
              <input type="text" value={pic} onChange={(e) => setPic(e.target.value)} placeholder="Contoh: Warya & Kurma" className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none placeholder:theme-text-tertiary" />
            </div>
            <button type="submit" className="w-full py-2.5 btn-theme-primary font-black text-xs uppercase rounded-xl transition-all shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Rundown'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setAgenda(''); setTimeStart(''); setTimeEnd(''); setPic(''); setDateEvent(''); }} className="w-full py-1.5 bg-black/30 hover:bg-black/50 theme-text-secondary text-xs font-bold rounded-xl mt-2 transition-all border theme-border">Batal Edit</button>
            )}
          </GlassCard>
        ) : (
          <GlassCard className="p-6 h-fit text-center space-y-2">
            <p className="text-xs theme-text-secondary font-medium font-sans">
              {currentPeriodeObj?.is_closed ? '🔒 Periode ini sudah ditutup buku.' : '💡 Anda berada di Mode Publik (Read-Only).'}
            </p>
            <p className="text-[10px] theme-text-tertiary font-mono">
              {currentPeriodeObj?.is_closed ? 'Susunan agenda kegiatan telah dikunci.' : 'Gunakan login admin untuk mengelola manajemen jadwal rundown.'}
            </p>
          </GlassCard>
        )}

        {/* LIST DAFTAR RUNDOWN ACARA (GLASSMORPISM) */}
        <GlassCard className="lg:col-span-2 p-6 space-y-3">
          <h3 className="text-xs font-black theme-text-primary uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Susunan Agenda Rundown ({scheduleList.length})
          </h3>
          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {scheduleList.length === 0 ? (
              <p className="text-xs theme-text-tertiary font-mono py-6 text-center">Belum ada jadwal rundown acara pada periode ini.</p>
            ) : (
              scheduleList.map((s) => (
                <div key={s.id} className="p-3.5 bg-black/20 border theme-border rounded-xl flex justify-between items-center text-xs hover:border-white/30 transition-all">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-black/40 theme-text-accent border theme-border px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        🗓️ {formatDate(s.event_date)}
                      </span>
                      <span className="bg-black/20 theme-text-secondary px-2 py-0.5 rounded text-[10px] font-mono border theme-border">
                        ⏰ {s.time_start || '-'} - {s.time_end || '-'} WIB
                      </span>
                    </div>
                    <p className="font-bold theme-text-primary text-sm mt-1.5 tracking-wide">{s.agenda || 'Agenda Tanpa Nama'}</p>
                    <p className="text-[10px] theme-text-tertiary font-mono mt-0.5">PIC: {s.pic || '-'}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 font-mono shrink-0 ml-2">
                      {currentPeriodeObj?.is_closed ? (
                        <span className="theme-text-accent italic text-[10px]">🔒 Terkunci</span>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(s)} className="theme-text-accent hover:underline font-bold">Edit</button>
                          <button onClick={() => handleDelete(s.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
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
