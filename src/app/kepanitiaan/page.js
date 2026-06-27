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

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const { data } = await supabase.from('committee').select('*').order('created_at', { ascending: false });
    if (data) setMembers(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    const payload = { member_name: name.trim(), role_position: role.trim(), phone_number: phone.trim() };

    try {
      if (editingId) {
        await supabase.from('committee').update(payload).eq('id', editingId);
        setEditingId(null);
      } else {
        await supabase.from('committee').insert([payload]);
      }
      setName(''); setRole(''); setPhone(''); setEditingId(null);
      loadMembers();
      alert('Data struktur panitia sukses disimpan!');
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Mode Edit Struktur' : '👥 Tambah Anggota Panitia'}</h3>
        <input type="text" placeholder="Nama Lengkap..." required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        <input type="text" placeholder="Jabatan / Bidang Tugas..." required value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        <input type="text" placeholder="No HP/WhatsApp..." value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-xl">Simpan Anggota</button>
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Struktur Organisasi Pengurus</h3>
        {members.map(m => (
          <div key={m.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-200">👤 {m.member_name}</p>
              <p className="text-[11px] text-amber-500">{m.role_position}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setEditingId(m.id); setName(m.member_name); setRole(m.role_position); setPhone(m.phone_number || ''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-amber-500 font-bold">Edit</button>
              <button type="button" onClick={async () => { if (confirm('Hapus nama pengurus ini?')) { await supabase.from('committee').delete().eq('id', m.id); loadMembers(); } }} className="text-rose-400 font-bold">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
