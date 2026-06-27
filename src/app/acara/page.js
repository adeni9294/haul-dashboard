'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AcaraSchedulePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);

  // State Form Input Rundown
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [agenda, setAgenda] = useState('');
  const [pic, setPic] = useState('');

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }

    // Ambil susunan acara dari Supabase
    async function fetchSchedules() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          setLoading(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .order('time_start', { ascending: true }); // Diurutkan berdasarkan jam mulai

        if (error) throw error;
        if (data) setEvents(data);
      } catch (err) {
        console.error('Error fetching schedules:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin || submitting) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      alert('Konfigurasi database belum lengkap!');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('schedules')
        .insert([
          { 
            time_start: timeStart, 
            time_end: timeEnd, 
            agenda: agenda, 
            pic: pic 
          }
        ])
        .select();

      if (error) throw error;

      alert('Sukses! Agenda rundown berhasil ditambahkan.');
      if (data) {
        // Gabung data baru lalu urutkan ulang berdasarkan jam mulai secara lokal
        const updatedEvents = [...events, data[0]].sort((a, b) => a.time_start.localeCompare(b.time_start));
        setEvents(updatedEvents);
      }
      setTimeStart('');
      setTimeEnd('');
      setAgenda('');
      setPic('');
    } catch (err) {
      alert(`Gagal menyimpan agenda: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin || !confirm('Apakah Anda yakin ingin menghapus agenda acara ini?')) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(events.filter(e => e.id !== id));
      alert('Agenda berhasil dihapus.');
    } catch (err) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[250px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white">📅 Rundown & Schedule Acara</h2>
        <p className="text-xs text-slate-400">Susunan rangkaian susunan kegiatan puncak acara Haul secara berkala.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INPUT AGENDA BARU */}
        <div className="lg:col-span-1">
          {isAdmin ? (
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-2">➕ Tambah Agenda</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jam Mulai</label>
                  <input 
                    type="text" 
                    required
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    placeholder="08:00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jam Selesai</label>
                  <input 
                    type="text" 
                    required
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    placeholder="09:30"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Agenda Kegiatan</label>
                <textarea 
                  rows="2"
                  required
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Contoh: Pembukaan & Tahlil Bersama"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Penanggung Jawab / PIC</label>
                <input 
                  type="text" 
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Contoh: Ust. Syarif / Seksi Acara"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                {submitting ? '⏳ Menyimpan...' : '💾 Simpan Agenda'}
              </button>
            </form>
          ) : (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">🔒 Mode Pengisian Terkunci</p>
              <p className="text-[11px] text-slate-500">Silakan aktifkan mode admin untuk menyusun tata urutan jadwal acara.</p>
            </div>
          )}
        </div>

        {/* TIMELINE RUNDOWN */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📋 Lini Masa Rangkaian Kegiatan</h3>
            
            {events.length > 0 ? (
              <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
                {events.map((ev) => (
                  <div key={ev.id} className="relative group">
                    {/* Penanda Bulat Timeline */}
                    <div className="absolute -left-[31px] top-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-slate-950 shadow"></div>
                    
                    <div className="p-4 bg-slate-950/50 border border-slate-800/60 rounded-xl flex justify-between items-start hover:border-slate-700/60 transition-all">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono font-bold text-amber-400">
                          ⏰ {ev.time_start} - {ev.time_end} WIB
                        </span>
                        <h4 className="text-xs md:text-sm font-bold text-slate-100 pt-1">{ev.agenda}</h4>
                        {ev.pic && <p className="text-[11px] text-slate-400">👤 PJ: <span className="text-slate-300 font-medium">{ev.pic}</span></p>}
                      </div>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(ev.id)}
                          className="text-slate-600 hover:text-red-400 text-xs font-bold px-2 py-1 transition-all"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Belum ada susunan rundown acara yang tersimpan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
