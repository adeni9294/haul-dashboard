'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AcaraPage() {
  const [schedules, setSchedules] = useState([]);
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [title, setTitle] = useState('');
  const [pic, setPic] = useState('');
  const [editingId, setEditingId] = useState(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => { 
    setEventDate(new Date().toISOString().split('T')[0]);
    loadSchedules(); 
  }, []);

  async function loadSchedules() {
    const { data, error } = await supabase.from('schedules').select('*').order('event_date', { ascending: true }).order('start_time', { ascending: true });
    if (!error && data) {
      setSchedules(data);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Perbaikan: Tambahkan created_at agar lolos constraint NOT NULL Supabase
    const payload = { 
      event_date: eventDate, 
      start_time: startTime, 
      end_time: endTime, 
      activity_title: title.trim(), 
      pic_name: pic.trim(),
      created_at: new Date().toISOString()
    };

    try {
      if (editingId) {
        const updatePayload = { event_date: payload.event_date, start_time: payload.start_time, end_time: payload.end_time, activity_title: payload.activity_title, pic_name: payload.pic_name };
        const { error } = await supabase.from('schedules').update(updatePayload).eq('id', editingId);
        if (error) throw error;
        alert('Rundown acara berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('schedules').insert([payload]);
        if (error) throw error;
        alert('Rundown acara baru berhasil ditambahkan!');
      }

      setTitle(''); 
      setPic(''); 
      setEditingId(null);
      
      await loadSchedules();
    } catch (err) { 
      alert(`Gagal memproses data: ${err.message}`); 
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setStartTime(s.start_time);
    setEndTime(s.end_time);
    setTitle(s.activity_title);
    setPic(s.pic_name || '');
    if (s.event_date) setEventDate(s.event_date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus rundown jadwal ini?')) {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (!error) await loadSchedules();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase">
          {editingId ? '🔄 Mode Perbarui Acara' : '➕ Tambah Rundown Acara'}
        </h3>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Tanggal</label>
          <input type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Mulai</label>
            <input type="text" placeholder="08:00" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center font-mono focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Selesai</label>
            <input type="text" placeholder="09:30" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center font-mono focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Kegiatan Agenda</label>
          <input type="text" placeholder="Contoh: Pembukaan & Tahlil" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Penanggung Jawab (PIC)</label>
          <input type="text" placeholder="Contoh: Ust. Ahmad" required value={pic} onChange={(e) => setPic(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400 transition-all">
          {editingId ? '💾 Simpan Perubahan' : 'Simpan Rundown'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setTitle(''); setPic(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl">Batal Edit</button>
        )}
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Susunan Agenda Rundown Terjadwal ({schedules.length})</h3>
        <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
          {schedules.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada jadwal rundown yang diatur.</p>
          ) : (
            schedules.map(s => (
              <div key={s.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-amber-400 font-mono">⏱️ {s.start_time} - {s.end_time} WIB {s.event_date && <span className="text-[10px] text-slate-500 ml-1">({new Date(s.event_date).toLocaleDateString('id-ID')})</span>}</p>
                  <p className="text-slate-200 mt-0.5 font-medium">{s.activity_title}</p>
                  <p className="text-[10px] text-slate-500">PIC: {s.pic_name}</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleEdit(s)} className="text-amber-500 hover:underline font-bold">Edit</button>
                  <button type="button" onClick={() => handleDelete(s.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
