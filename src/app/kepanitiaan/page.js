'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function KepanitiaanPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState([]);

  // State Form Input Panitia
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  const daftarJabatan = [
    'Penasihat', 'Ketua Panitia', 'Wakil Ketua', 'Sekretaris', 'Bendahara',
    'Seksi Logistik & Perlengkapan', 'Seksi Santunan', 'Seksi Khitanan Massal',
    'Seksi Akomodasi & Transportasi', 'Seksi Konsumsi', 'Seksi Honorarium',
    'Seksi Pubdekdok', 'Seksi Acara & Hiburan', 'Seksi Keamanan / Ketertiban'
  ];

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }
    setRole(daftarJabatan[0]);

    // Ambil data panitia dari Supabase
    async function fetchCommittees() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          setLoading(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('committees')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data) setMembers(data);
      } catch (err) {
        console.error('Error fetching committees:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCommittees();
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
        .from('committees')
        .insert([{ name, role, phone }])
        .select();

      if (error) throw error;

      alert('Sukses! Data anggota panitia berhasil ditambahkan.');
      if (data) {
        setMembers([...members, data[0]]);
      }
      setName('');
      setPhone('');
    } catch (err) {
      alert(`Gagal menyimpan data: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin || !confirm('Apakah Anda yakin ingin menghapus anggota panitia ini?')) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from('committees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== id));
      alert('Anggota panitia berhasil dihapus.');
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
        <h2 className="text-xl font-bold text-white">👥 Struktur Kepanitiaan Haul</h2>
        <p className="text-xs text-slate-400">Daftar personil pengurus pembagian kerja internal panitia pelaksana.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM INPUT BARU */}
        <div className="lg:col-span-1">
          {isAdmin ? (
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-2">➕ Tambah Panitia</h3>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kang Ahmad"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jabatan / Tugas</label>
                <select 
                  value={role} 
                  onChange={(e) => setCategory(e.target.value)} // Mengikuti handler state pilihan
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  onChange={(e) => setRole(e.target.value)}
                >
                  {daftarJabatan.map((jab, idx) => (
                    <option key={idx} value={jab}>{jab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">No. WhatsApp/HP (Opsional)</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567xx"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                {submitting ? '⏳ Menyimpan...' : '💾 Simpan Panitia'}
              </button>
            </form>
          ) : (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">🔒 Mode Pengisian Terkunci</p>
              <p className="text-[11px] text-slate-500">Silakan aktifkan mode admin untuk menambah atau mengedit susunan panitia.</p>
            </div>
          )}
        </div>

        {/* DAFTAR PANITIA */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📋 Struktur Pengurus Aktif</h3>
            
            {members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((m) => (
                  <div key={m.id} className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">{m.role}</p>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">{m.name}</h4>
                      {m.phone && <p className="text-[11px] text-slate-500 font-mono mt-1">📞 {m.phone}</p>}
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="text-slate-600 hover:text-red-400 text-xs font-bold px-2 py-1 transition-all"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Belum ada personil panitia yang didaftarkan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
