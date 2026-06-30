'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [loading, setLoading] = useState(true);
  const [budgetList, setBudgetList] = useState([]);
  
  // State form internal tetap menggunakan nama pembantu agar UI tidak bingung
  const [category, setCategory] = useState(''); 
  const [amount, setAmount] = useState('');
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
    loadBudgets();

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

  async function loadBudgets() {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('budgets') 
        .select('*')
        .order('id', { ascending: false });

      if (!error && data) {
        setBudgetList(data);
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
    if (!category.trim() || !amount) return;

    const supabase = getSupabase();
    
    // PERBAIKAN UTAMA: Payload disesuaikan ke struktur asli Supabase Anda (name & amount)
    // Hapus parameter 'type' agar tidak memicu error skema cache
    const payload = { 
      name: category.trim(), 
      amount: parseFloat(amount) || 0
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('budgets').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('🟢 Anggaran berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('budgets').insert([payload]);
        if (error) throw error;
        alert('🟢 Anggaran baru berhasil ditambahkan!');
      }

      setCategory(''); 
      setAmount(''); 
      setEditingId(null);
      await loadBudgets();
    } catch (err) {
      console.error(err);
      alert(`❌ Gagal menyimpan: ${err.message || err}`);
    }
  };

  const handleEdit = (b) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    setEditingId(b.id);
    setCategory(b.name || ''); // Membaca dari kolom 'name' database
    setAmount((b.amount || 0).toString()); // Membaca dari kolom 'amount' database
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (!confirm('Apakah Anda yakin ingin menghapus rencana anggaran ini?')) return;
    
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      alert('🗑️ Anggaran berhasil dihapus.');
      await loadBudgets();
    } catch (err) {
      alert(`❌ Gagal menghapus: ${err.message}`);
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(num);
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Memuat rencana anggaran...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* HEADER PAGE STATUS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider">📋 Rencana Anggaran & Alokasi Haul</h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERFACE KONDISIONAL FORM INPUT */}
        {isAdmin ? (
          <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">{editingId ? '🔄 Perbarui Anggaran' : '➕ Tambah Anggaran'}</h3>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Alokasi / Kategori</label>
              <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Contoh: Tenda & Panggung" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Jumlah Anggaran (Rp)</label>
              <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Contoh: 5000000" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono text-amber-400 font-bold" />
            </div>
            
            {/* Input Jenis Aliran dinonaktifkan sementara karena tidak ada kolom 'type' di DB */}
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggaran'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setCategory(''); setAmount(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium font-sans">💡 Anda berada di Mode Publik (Read-Only).</p>
            <p className="text-[10px] text-slate-500 font-mono">Gunakan tombol login admin pada Header utama untuk memunculkan panel input anggaran.</p>
          </div>
        )}

        {/* LIST DAFTAR RENCANA ANGGARAN */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">📊 Rencana Anggaran Terdaftar ({budgetList.length})</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {budgetList.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-6 text-center">Belum ada data anggaran yang tersimpan.</p>
            ) : (
              budgetList.map(b => (
                <div key={b.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs hover:border-slate-700/80 transition-all">
                  <div>
                    {/* Membaca dari b.name */}
                    <p className="font-bold text-white text-sm">{b.name || 'Kategori Tanpa Nama'}</p>
                    <p className="text-[11px] font-mono font-bold mt-0.5 text-rose-400">
                      📤 Alokasi: {formatRupiah(b.amount || 0)}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 font-mono">
                      <button onClick={() => handleEdit(b)} className="text-amber-400 hover:underline font-bold">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
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
