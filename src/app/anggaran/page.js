'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [budgets, setBudgets] = useState([]);
  const [categoryName, setCategoryName] = useState(''); 
  const [plannedAmount, setPlannedAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
  };

  useEffect(() => { 
    setIsAdmin(localStorage.getItem('is_admin_haul') === 'true');
    loadBudgets(); 
  }, []);

  async function loadBudgets() {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('budgets').select('*').order('id', { ascending: false });
    if (!error && data) setBudgets(data);
  }

  // FUNGSI KHUSUS UNTUK MEMVERIFIKASI PASSWORD DI DATABASE SETTINGS
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

    return true; // Password cocok
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim() || !plannedAmount) return;

    // Verifikasi password asli di database sebelum melakukan Write/Simpan
    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    const supabase = getSupabase();
    const payload = { 
      category: categoryName.trim(), 
      planned_amount: parseInt(plannedAmount, 10) 
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('budgets').update(payload).eq('id', editingId).select();
        if (error) throw error;
        alert('🎯 Rencana anggaran berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('budgets').insert([payload]).select();
        if (error) throw error;
        alert('✅ Rencana anggaran berhasil ditambahkan!');
      }

      setCategoryName(''); 
      setPlannedAmount('');
      setEditingId(null);
      await loadBudgets();
    } catch (err) { 
      console.error(err);
      const detailEror = `Kode: ${err?.code || '-'}\nPesan: ${err?.message || err}\nDetail: ${err?.details || '-'}`;
      alert(`❌ Gagal menyimpan anggaran:\n\n${detailEror}`); 
    }
  };

  const handleEdit = async (b) => {
    // Verifikasi password sebelum mengisi form edit
    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    setEditingId(b.id);
    setCategoryName(b.category || ''); 
    setPlannedAmount(b.planned_amount || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus anggaran ini?')) {
      // Verifikasi password sebelum data didelete dari database
      const lolosVerifikasi = await verifikasiAksesAdmin();
      if (!lolosVerifikasi) return;

      const supabase = getSupabase();
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (!error) {
        alert('🗑️ Anggaran berhasil dihapus!');
        await loadBudgets();
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form diubah agar selalu tampil (bisa diakses publik, tapi terkunci sandi saat tombol diklik) */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Perbarui Anggaran' : '➕ Tambah Target Anggaran'}</h3>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Keperluan Pos / Kategori</label>
          <input type="text" required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nominal Alokasi (Rp)</label>
          <input type="number" required value={plannedAmount} onChange={(e) => setPlannedAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
        </div>
        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400 transition-all">
          {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggaran'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setCategoryName(''); setPlannedAmount(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
        )}
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Plafon Anggaran ({budgets.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {budgets.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada data anggaran.</p>
          ) : (
            budgets.map(b => (
              <div key={b.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <span>💡 {b.category}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-amber-500">Rp {Number(b.planned_amount || 0).toLocaleString('id-ID')}</span>
                  {/* Tombol aksi dibiarkan menyala agar Anda sebagai admin bisa mengkliknya kapan saja */}
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(b)} className="text-amber-500 font-bold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(b.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
