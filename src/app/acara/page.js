'use client';
import { useState, useEffect } from 'react';
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
  }, []);

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
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date_event', { ascending: true })
        .order('time_start', { ascending: true });

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
    if (!agenda.trim() || !timeStart.trim() || !dateEvent) return;

    const supabase = getSupabase();
    const payload = { 
      agenda: agenda.trim(),
      time_start: timeStart.trim(),
      time_end: timeEnd.trim() || 'S.D Selesai',
      pic: pic.trim() || '-',
      date_event: dateEvent
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
      setEditingId(null);
      await loadSchedules();
    } catch (err) {
      console.error(err);
      alert(`❌ Gagal menyimpan: ${err.message || err}`);
    }
  };

  const handleEdit = (s) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    setEditingId(s.id);
    setAgenda(s.agenda || '');
    setTimeStart(s.time_start || '');
    setTimeEnd(s.time_end || '');
    setPic(s.pic || '');
    setDateEvent(s.date_event || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal agenda ini?')) return;
    
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      alert('🗑️ Acara berhasil dihapus.');
      await loadSchedules();
    } catch (err) {
      alert(`❌ Gagal menghapus: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Memuat susunan acara...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider">📅 Susunan Agenda & Rundown Acara</h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL INPUT ADMIN */}
        {isAdmin ? (
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
              <button type="button" onClick={() => { setEditingId(null); setAgenda(''); setTimeStart(''); setTimeEnd(''); setPic(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium font-sans">💡 Anda berada di Mode Publik (Read-Only).</p>
            <p className="text-[10px] text-slate-500 font-mono">Gunakan login admin untuk mengelola manajemen jadwal rundown.</p>
          </div>
        )}

        {/* LIST DAFTAR ACARA */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">📋 Susunan Agenda Rundown ({scheduleList.length})</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {scheduleList.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-6 text-center">Belum ada jadwal rundown acara.</p>
            ) : (
              scheduleList.map(s => (
                <div key={s.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs hover:border-slate-700/80 transition-all">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        🗓️ {formatDate(s.date_event)}
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                        ⏰ {s.time_start} - {s.time_end} WIB
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm mt-1.5">{s.agenda}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">PIC: {s.pic}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 font-mono">
                      <button onClick={() => handleEdit(s)} className="text-amber-400 hover:underline font-bold">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
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
