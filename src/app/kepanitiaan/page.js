'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function KepanitiaanPage() {
  const [committeeList, setCommitteeList] = useState([]);
  const [memberName, setMemberName] = useState(''); 
  const [positionName, setPositionName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
  };

  useEffect(() => {
    const supabase = getSupabase();
    loadCommittee();

    async function fetchInitialAdminStatus() {
      const { data, error } = await supabase
        .from('settings')
        .select('is_admin_active')
        .eq('id', 'main_config')
        .single();
      if (!error && data) {
        setIsAdmin(data.is_admin_active);
      }
    }
    fetchInitialAdminStatus();

    const settingsChannel = supabase
      .channel('public:settings-comm')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.main_config' },
        (payload) => {
          if (payload.new && typeof payload.new.is_admin_active !== 'undefined') {
            setIsAdmin(payload.new.is_admin_active);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  async function loadCommittee() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('committee')
      .select('*')
      .order('id', { ascending: false });
    
    if (!error && data) setCommitteeList(data);
  }

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
    if (!memberName.trim() || !positionName.trim() || !phoneNumber.trim()) return;

    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    const supabase = getSupabase();
    const payload = { name: memberName.trim(), position: positionName.trim(), phone: phoneNumber.trim() };

    try {
      if (editingId) {
        const { error } = await supabase.from('committee').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('🎯 Data panitia berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('committee').insert([payload]);
        if (error) throw error;
        alert('✅ Anggota panitia berhasil ditambahkan!');
      }

      setMemberName(''); setPositionName(''); setPhoneNumber(''); setEditingId(null);
      loadCommittee();
    } catch (err) {
      console.error(err);
      alert(`❌ Gagal menyimpan data panitia.`);
    }
  };

  const handleEdit = async (c) => {
    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    setEditingId(c.id);
    setMemberName(c.name || ''); setPositionName(c.position || ''); setPhoneNumber(c.phone || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus anggota kepanitiaan ini?')) {
      const lolosVerifikasi = await verifikasiAksesAdmin();
      if (!lolosVerifikasi) return;

      const supabase = getSupabase();
      const { error } = await supabase.from('committee').delete().eq('id', id);
      if (!error) {
        alert('🗑️ Anggota panitia berhasil dihapus!');
        loadCommittee();
      } else {
        alert('❌ Gagal menghapus data dari database.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {isAdmin ? (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Perbarui Anggota' : '➕ Tambah Panitia'}</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Nama Anggota Panitia</label>
            <input type="text" required value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Contoh: Ahmad Deni" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Jabatan / Posisi</label>
            <input type="text" required value={positionName} onChange={(e) => setPositionName(e.target.value)} placeholder="Contoh: Bendahara" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Nomor WhatsApp</label>
            <input type="text" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Contoh: 08123456789" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
          </div>
          <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400 transition-all">
            {editingId ? '💾 Simpan Perubahan' : 'Simpan Panitia'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setMemberName(''); setPositionName(''); setPhoneNumber(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
          )}
        </form>
      ) : (
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">💡 Anda berada di Mode Publik (Lihat Saja).</p>
        </div>
      )}

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Susunan Kepanitiaan ({committeeList.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {committeeList.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada data susunan panitia.</p>
          ) : (
            committeeList.map(c => (
              <div key={c.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-white text-sm">👤 {c.name}</span>
                  <div className="flex gap-3 text-[11px] text-slate-400 font-mono">
                    <span>💼 {c.position}</span>
                    {c.phone && <span className="text-emerald-400 font-bold">📞 {c.phone}</span>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(c)} className="text-amber-500 font-bold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
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
