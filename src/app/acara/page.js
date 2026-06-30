'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AcaraPage() {
  const [schedules, setSchedules] = useState([]);
  const [dateEvent, setDateEvent] = useState('');     
  const [timeStart, setTimeStart] = useState('08:00'); 
  const [timeEnd, setTimeEnd] = useState('09:30');    
  const [agenda, setAgenda] = useState('');           
  const [pic, setPic] = useState('');                 
  const [editingId, setEditingId] = useState(null);
  
  // State untuk melacak status login admin di browser
  const [isAdmin, setIsAdmin] = useState(false);

  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
  };

  useEffect(() => { 
    // Sinkronkan status admin dengan localStorage sistem
    const adminStatus = localStorage.getItem('is_admin_haul') === 'true';
    setIsAdmin(adminStatus);

    // Set default tanggal input ke hari ini
    setDateEvent(new Date().toISOString().split('T')[0]);
    loadSchedules(); 
  }, []);

  async function loadSchedules() {
    const supabase = getSupabase();
    setSchedules([]);

    const { data, error } = await supabase.from('schedules')
      .select('*')
      .order('date_event', { ascending: true })
      .order('time_start', { ascending: true });
      
    if (!error && data) setSchedules(data);
  }

  // GERBANG VALIDASI DB: Verifikasi keamanan sekunder lewat database
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
    if (!agenda.trim() || !dateEvent) return;

    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    const supabase = getSupabase();
    const payload = { 
      date_event: dateEvent,
      time_start: timeStart.trim(), 
      time_end: timeEnd.trim(), 
      agenda: agenda.trim(), 
      pic: pic.trim() 
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('schedules').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('🎯 Rundown acara berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('schedules').insert([payload]);
        if (error) throw error;
        alert('✅ Rundown acara berhasil ditambahkan!');
      }

      setAgenda(''); 
      setPic(''); 
      setEditingId(null);
      window.location.reload();

    } catch (err) { 
      console.error(err);
      alert(`❌ Gagal menyimpan acara.`); 
    }
  };

  const handleEdit = async (s) => {
    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    setEditingId(s.id);
    setDateEvent(s.date_event || '');
    setTimeStart(s.time_start || '');
    setTimeEnd(s.time_end || '');
    setAgenda(s.agenda || '');
    setPic(s.pic || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus rundown jadwal ini?')) {
      const lolosVerifikasi = await verifikasiAksesAdmin();
      if (!lolosVerifikasi) return;

      const supabase = getSupabase();
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      
      if (!error) {
        alert('🗑️ Jadwal rundown berhasil dihapus!');
        window.location.reload();
      } else {
        alert('❌ Gagal menghapus jadwal dari database.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* KONDISIONAL FORM: Sembunyikan form / Tampilkan info mode publik */}
      {isAdmin ? (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Perbarui Acara' : '➕ Tambah Rundown Acara'}</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Tanggal Acara</label>
            <input type="date" required value={dateEvent} onChange={(e) => setDateEvent(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Mulai</label>
              <input type="text" placeholder="08:00" required value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center font-mono focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Selesai</label>
              <input type="text" placeholder="09:30" required value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center font-mono focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Nama Kegiatan / Agenda</label>
            <input type="text" required value={agenda} onChange={(e) => setAgenda(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">PIC (Penanggung Jawab)</label>
            <input type="text" value={pic} onChange={(e) => setPic(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400 transition-all">
            {editingId ? '💾 Simpan Perubahan' : 'Simpan Rundown'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setAgenda(''); setPic(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
          )}
        </form>
      ) : (
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">💡 Anda berada di Mode Publik (Lihat Saja).</p>
        </div>
      )}

      {/* DAFTAR AGENDA RUNDOWN */}
      <div className={isAdmin ? "lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md" : "lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md"}>
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Susunan Agenda Rundown ({schedules.length})</h3>
        <div className="space-y-2 max-h-[550px] overflow-y-auto">
          {schedules.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada jadwal rundown.</p>
          ) : (
            schedules.map(s => (
              <div key={s.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-amber-400 font-mono">
                    🗓️ {s.date_event ? new Date(s.date_event).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sesi'} 
                    <span className="text-slate-400 ml-2">⏱️ {s.time_start} - {s.time_end} WIB</span>
                  </p>
                  <p className="text-slate-200 mt-0.5 font-medium">{s.agenda}</p>
                  <p className="text-[10px] text-slate-500">PIC: {s.pic || '-'}</p>
                </div>
                
                {/* KONDISIONAL TOMBOL: Aksi hanya dirender jika masuk mode Admin */}
                {isAdmin && (
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(s)} className="text-amber-500 font-bold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
