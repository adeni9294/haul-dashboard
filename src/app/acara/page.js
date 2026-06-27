'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AcaraPage() {
  const [schedules, setSchedules] = useState([]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [title, setTitle] = useState('');
  const [pic, setPic] = useState('');
  const [editingId, setEditingId] = useState(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => { loadSchedules(); }, []);

  async function loadSchedules() {
    const { data } = await supabase.from('schedules').select('*').order('start_time', { ascending: true });
    if (data) setSchedules(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { start_time: startTime, end_time: endTime, activity_title: title, pic_name: pic };

    if (editingId) {
      await supabase.from('schedules').update(payload).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('schedules').insert([payload]);
    }

    setTitle('');
    setPic('');
    loadSchedules();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setStartTime(item.start_time);
    setEndTime(item.end_time);
    setTitle(item.activity_title);
    setPic(item.pic_name || '');
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus rundown agenda ini?')) {
      await supabase.from('schedules').delete().eq('id', id);
      loadSchedules();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4">
        <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Koreksi Rundown' : '➕ Tambah Rundown Acara'}</h3>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" label="Mulai" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
          <input type="text" label="Selesai" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        </div>
        <input type="text" placeholder="Nama Agenda Kegiatan..." required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        <input type="text" placeholder="Penanggung Jawab (PIC)..." required value={pic} onChange={(e) => setPic(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-xl">Simpan Rundown</button>
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Susunan Acara Terjadwal</h3>
        {schedules.map(s => (
          <div key={s.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-amber-400">⏱️ {s.start_time} - {s.end_time} WIB</p>
              <p className="text-slate-200 mt-0.5">{s.activity_title}</p>
              <p className="text-[10px] text-slate-500">PIC: {s.pic_name}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleEdit(s)} className="text-amber-500 hover:underline">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="text-rose-400 hover:underline">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
