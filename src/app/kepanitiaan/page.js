'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function KepanitiaanPage() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
  };

  useEffect(() => { 
    setIsAdmin(localStorage.getItem('is_admin_haul') === 'true');
    loadMembers(); 
  }, []);

  async function loadMembers() {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('committee').select('*').order('id', { ascending: false });
    if (!error && data) setMembers(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak!');
    if (!name.trim() || !role.trim()) return;

    const supabase = getSupabase();
    // PAYLOAD FIX: Menyesuaikan nama kolom asli di Supabase Anda (name, role, phone)
    const payload = { 
      name: name.trim(), 
      role: role.trim(), 
      phone: phone.trim() 
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('committee').update(payload).eq('id', editingId).select();
        if (error) throw error;
        alert('🎯 Data panitia berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('committee').insert([payload]).select();
        if (error) throw error;
        alert('✅ Anggota panitia berhasil ditambahkan!');
      }
      setName(''); setRole(''); setPhone(''); setEditingId(null);
      await loadMembers();
    } catch (err) { 
      console.error("Eror Supabase Panitia:", err);
      const detailEror = `Kode: ${err?.code || '-'}\nPesan: ${err?.message || err}\nDetail: ${err?.details || '-'}`;
      alert(`❌ Gagal menyimpan panitia:\n\n${detailEror}`); 
    }
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    setName(m.name || '');  // FIX: Membaca dari b.name
    setRole(m.role || '');  // FIX: Membaca dari b.role
    setPhone(m.phone || ''); // FIX: Membaca dari b.phone
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (confirm('Hapus nama pengurus ini?')) {
      const supabase = getSupabase();
      const { error } = await supabase.from('committee').delete().eq('id', id);
      if (!error) await loadMembers();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {isAdmin ? (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Mode Edit Panitia' : '👥 Tambah Anggota Panitia'}</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Nama Lengkap</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Jabatan / Bidang Tugas</label>
            <input type="text" required value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">No HP / WhatsApp (Opsional)</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
          </div>
          <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-xl hover:bg-amber-400">
            {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggota'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setName(''); setRole(''); setPhone(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
          )}
        </form>
      ) : (
        <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl h-fit text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">💡 Anda berada di Mode Publik (Lihat Saja).</p>
        </div>
      )}

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Struktur Organisasi Pengurus ({members.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {members.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada struktur panitia.</p>
          ) : (
            members.map(m => (
              <div key={m.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  {/* FIX: Render m.name dan m.role sesuai kolom Supabase */}
                  <p className="font-bold text-slate-200">👤 {m.name}</p>
                  <p className="text-[11px] text-amber-500 font-medium">{m.role} {m.phone ? `(${m.phone})` : ''}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(m)} className="text-amber-500 font-bold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
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
