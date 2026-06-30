'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PanitiaPage() {
  const [loading, setLoading] = useState(true);
  const [committeeList, setCommitteeList] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
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
    loadCommittee();

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

  async function loadCommittee() {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('committee') // sesuaikan dengan nama tabel di database Anda
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) {
        setCommitteeList(data);
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
    if (!name.trim() || !role.trim()) return;

    const supabase = getSupabase();
    const payload = { 
      name: name.trim(), 
      role: role.trim(),
      whatsapp: whatsapp.trim() 
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('committee').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('🟢 Data panitia berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('committee').insert([payload]);
        if (error) throw error;
        alert('🟢 Panitia baru berhasil ditambahkan!');
      }

      setName(''); 
      setRole(''); 
      setWhatsapp('');
      setEditingId(null);
      await loadCommittee();
    } catch (err) {
      console.error(err);
      alert(`❌ Gagal menyimpan: ${err.message || err}`);
    }
  };

  const handleEdit = (c) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    setEditingId(c.id);
    setName(c.name || '');
    setRole(c.role || '');
    setWhatsapp(c.whatsapp || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (!confirm('Apakah Anda yakin ingin menghapus anggota panitia ini?')) return;
    
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('committee').delete().eq('id', id);
      if (error) throw error;
      alert('🗑️ Anggota panitia berhasil dihapus.');
      await loadCommittee();
    } catch (err) {
      alert(`❌ Gagal menghapus: ${err.message}`);
    }
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Memuat data panitia...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider">👥 Susunan Kepanitiaan Haul</h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL INPUT ADMIN */}
        {isAdmin ? (
          <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">{editingId ? '🔄 Perbarui Panitia' : '➕ Tambah Panitia'}</h3>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Anggota Panitia</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Ahmad Deni" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Jabatan / Posisi</label>
              <input type="text" required value={role} onChange={(e) => setRole(e.target.value)} placeholder="Contoh: Bendahara" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nomor WhatsApp</label>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Contoh: 08123456789" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Panitia'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setName(''); setRole(''); setWhatsapp(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium font-sans">💡 Anda berada di Mode Publik (Read-Only).</p>
            <p className="text-[10px] text-slate-500 font-mono">Gunakan login admin untuk memodifikasi struktur kepanitiaan.</p>
          </div>
        )}

        {/* LIST DAFTAR PANITIA */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">📋 Susunan Kepanitiaan ({committeeList.length})</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {committeeList.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-6 text-center">Belum ada data kepanitiaan.</p>
            ) : (
              committeeList.map(c => (
                <div key={c.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs hover:border-slate-700/80 transition-all">
                  <div>
                    <p className="font-bold text-white text-sm">{c.name}</p>
                    <p className="text-[11px] text-amber-400 font-medium mt-0.5">🔹 {c.role}</p>
                    {c.whatsapp && <p className="text-[10px] text-slate-500 font-mono mt-0.5">📞 {c.whatsapp}</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 font-mono">
                      <button onClick={() => handleEdit(c)} className="text-amber-400 hover:underline font-bold">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
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
