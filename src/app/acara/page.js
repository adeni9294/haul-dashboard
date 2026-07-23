'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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

  const getSupabase = () => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  };

  useEffect(() => {
    checkAdminSession();
    loadSchedules();

    const interval = setInterval(checkAdminSession, 500);
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
    if (!isAdmin) return alert('Aksi ditolak. Anda belum login sebagai admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini telah ditutup buku. Tidak dapat merubah jadwal.');
    if (!agenda.trim() || !timeStart.trim() || !dateEvent) return;

    const supabase = getSupabase();
    
    const payload = { 
      agenda: agenda.trim(),
      time_start: timeStart.trim(),
      time_end: timeEnd.trim() || 'S.D Selesai',
      pic: pic.trim() || '-',
      event_date: dateEvent,
      periode_id: selectedPeriodeId // ➕ Relasi ke Periode Aktif
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('schedules').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('🟢 Jadwal acara berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('schedules').insert([payload]);
        if (error) throw error;
        alert('🟢 Jadwal acara baru berhasil ditambahkan!');
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
      alert(`❌ Gagal menyimpan: ${err?.message || err}`);
    }
  };

  const handleEdit = (s) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini sudah ditutup buku!');
    setEditingId(s.id);
    setAgenda(s.agenda || '');
    setTimeStart(s.time_start || '');
    setTimeEnd(s.time_end || '');
    setPic(s.pic || '');
    setDateEvent(s.event_date || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini sudah ditutup buku!');
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal agenda ini?')) return;
      
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      alert('🗑️ Acara berhasil dihapus.');
      await loadSchedules();
    } catch (err) {
      alert(`❌ Gagal menghapus: ${err?.message || err}`);
    }
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

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Memuat susunan acara...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
        
      {/* HEADER PAGE STATUS & PERIODE SELECTOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider">📅 Susunan Agenda & Rundown Acara</h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        {/* SELECTOR PERIODE */}
        {periodeList.length > 0 && (
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl">
            <span className="text-[9px] font-mono font-bold text-slate-400 px-2 uppercase">Periode Haul:</span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-[10px] text-amber-400 rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* INDIKATOR TUTUP BUKU */}
      {currentPeriodeObj?.is_closed && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between text-amber-400 font-mono text-xs">
          <span>🔒 Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Susunan acara bersifat Read-Only.</span>
          <span className="bg-amber-500 text-black px-2 py-0.5 rounded font-bold text-[10px] uppercase">Arsip</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* INTERFACE FORM INPUT */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
          <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">{editingId ? '🔄 Perbarui Acara' : '➕ Tambah Rundown Acara'}</h3>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tanggal Acara</label>
              <input type="date" required value={dateEvent} onChange={(e) => setDateEvent(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Mulai</label>
                <input type="text" required value={timeStart} onChange={(e) => setTimeStart(e.target.value)} placeholder="08:00" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Selesai</label>
                <input type="text" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} placeholder="09:30 / Selesai" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Kegiatan / Agenda</label>
              <input type="text" required value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Contoh: Pembukaan & Tahlil" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">PIC (Penanggung Jawab)</label>
              <input type="text" value={pic} onChange={(e) => setPic(e.target.value)} placeholder="Contoh: Warya & Kurma" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Rundown'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setAgenda(''); setTimeStart(''); setTimeEnd(''); setPic(''); setDateEvent(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium font-sans">
              {currentPeriodeObj?.is_closed ? '🔒 Periode ini sudah ditutup buku.' : '💡 Anda berada di Mode Publik (Read-Only).'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {currentPeriodeObj?.is_closed ? 'Susunan agenda kegiatan telah dikunci.' : 'Gunakan login admin untuk mengelola manajemen jadwal rundown.'}
            </p>
          </div>
        )}

        {/* LIST DAFTAR RUNDOWN ACARA */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">📋 Susunan Agenda Rundown ({scheduleList.length})</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {scheduleList.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-6 text-center">Belum ada jadwal rundown acara pada periode ini.</p>
            ) : (
              scheduleList.map((s) => (
                <div key={s.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs hover:border-slate-700/80 transition-all">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        🗓️ {formatDate(s.event_date)}
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                        ⏰ {s.time_start || '-'} - {s.time_end || '-'} WIB
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm mt-1.5">{s.agenda || 'Agenda Tanpa Nama'}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">PIC: {s.pic || '-'}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 font-mono">
                      {currentPeriodeObj?.is_closed ? (
                        <span className="text-amber-500 italic text-[10px]">🔒 Terkunci</span>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(s)} className="text-amber-400 hover:underline font-bold">Edit</button>
                          <button onClick={() => handleDelete(s.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
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
