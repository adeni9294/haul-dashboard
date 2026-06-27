'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function KepanitiaanPage() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => { 
    loadMembers(); 
  }, []);

  async function loadMembers() {
    const { data, error } = await supabase.from('committee').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setMembers(data);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const payload = { 
      member_name: name.trim(), 
      role_position: role.trim(), 
      phone_number: phone.trim() 
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('committee').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('Data anggota panitia berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('committee').insert([payload]);
        if (error) throw error;
        alert('Anggota panitia baru berhasil ditambahkan!');
      }

      // CLEAR FORM INPUT
      setName(''); 
      setRole(''); 
      setPhone(''); 
      setEditingId(null);
      
      // RE-LOAD LIST LIVE SECARA SINKRON
      await loadMembers();
    } catch (err) { 
      alert(`Gagal memproses data: ${err.message}`); 
    }
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    setName(m.member_name);
    setRole(m.role_position);
    setPhone(m.phone_number || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus nama pengurus ini?')) {
      const { error } = await supabase.from('committee').delete().eq('id', id);
      if (!error) await loadMembers();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase">
          {editingId ? '🔄 Mode Edit Panitia' : '👥 Tambah Anggota Panitia'}
        </h3>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Lengkap</label>
          <input type="text" placeholder="Nama Lengkap..." required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Jabatan / Bidang Tugas</label>
          <input type="text" placeholder="Contoh: Ketua, Sekretaris, Seksi Humas" required value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">No HP / WhatsApp (Opsional)</label>
          <input type="text" placeholder="Contoh: 0812xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
        </div>
        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-xl hover:bg-amber-400 transition-all">
          {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggota'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setName(''); setRole(''); setPhone(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl">Batal Edit</button>
        )}
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Struktur Organisasi Pengurus ({members.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {members.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada struktur panitia yang terdaftar.</p>
          ) : (
            members.map(m => (
              <div key={m.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-200">👤 {m.member_name}</p>
                  <p className="text-[11px] text-amber-500 font-medium">{m.role_position} {m.phone_number && <span className="text-slate-500 text-[10px] ml-1">({m.phone_number})</span>}</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleEdit(m)} className="text-amber-500 hover:underline font-bold">Edit</button>
                  <button type="button" onClick={() => handleDelete(m.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
