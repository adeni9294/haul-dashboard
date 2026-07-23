'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [loading, setLoading] = useState(true);
  const [budgetList, setBudgetList] = useState([]);
  const [category, setCategory] = useState(''); 
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ➕ State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  const [currentPeriodeObj, setCurrentPeriodeObj] = useState(null);

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
  }, [selectedPeriodeId]);

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

      // 1. Memuat Daftar Periode
      let activePeriodeId = selectedPeriodeId;
      const { data: listPeriode } = await supabase
        .from('periode_haul')
        .select('*')
        .order('created_at', { ascending: false });

      if (listPeriode && listPeriode.length > 0) {
        setPeriodeList(listPeriode);
        if (!activePeriodeId) {
          activePeriodeId = listPeriode[0].id;
          setSelectedPeriodeId(activePeriodeId);
        }
        const found = listPeriode.find(p => p.id === activePeriodeId) || listPeriode[0];
        setCurrentPeriodeObj(found);
      }

      // 2. Query Data Anggaran berdasarkan Periode
      let query = supabase.from('budgets').select('*').order('id', { ascending: false });
      if (activePeriodeId) {
        query = query.eq('periode_id', activePeriodeId);
      }

      const { data, error } = await query;

      if (!error && data) {
        setBudgetList(data);
      }
    } catch (e) {
      console.error(e);
    } fontally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak. Anda belum login sebagai admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini telah ditutup buku. Tidak dapat merubah anggaran.');
    if (!category.trim() || !amount) return;

    const supabase = getSupabase();
    
    const payload = { 
      category: category.trim(), 
      planned_amount: parseInt(amount, 10) || 0,
      periode_id: selectedPeriodeId // ➕ Connect to Active Period
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
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini sudah ditutup buku!');
    setEditingId(b.id);
    setCategory(b.category || '');
    setAmount((b.planned_amount || 0).toString()); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini sudah ditutup buku!');
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
      
      {/* HEADER PAGE STATUS & PERIODE SELECTOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider">📋 Rencana Anggaran & Alokasi Haul</h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        {/* SELECTOR PERIODE */}
        {periodeList.length > 0 && (
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl">
            <span className="text-[9px] font-mono font-bold text-slate-400 px-2 uppercase">Periode Haul:</span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-[10px] text-amber-400 rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* INDIKATOR TUTUP BUKU */}
      {currentPeriodeObj?.is_closed && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between text-amber-400 font-mono text-xs">
          <span>🔒 Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Rencana anggaran bersifat Read-Only.</span>
          <span className="bg-amber-500 text-black px-2 py-0.5 rounded font-bold text-[10px] uppercase">Arsip</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERFACE KONDISIONAL FORM INPUT */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
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
            
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggaran'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setCategory(''); setAmount(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium font-sans">
              {currentPeriodeObj?.is_closed ? '🔒 Periode ini sudah ditutup buku.' : '💡 Anda berada di Mode Publik (Read-Only).'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {currentPeriodeObj?.is_closed ? 'Pengubahan alokasi anggaran telah dikunci.' : 'Gunakan login admin untuk mengedit anggaran.'}
            </p>
          </div>
        )}

        {/* LIST DAFTAR RENCANA ANGGARAN */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">📊 Rencana Anggaran Terdaftar ({budgetList.length})</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {budgetList.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-6 text-center">Belum ada data anggaran yang tersimpan pada periode ini.</p>
            ) : (
              budgetList.map(b => (
                <div key={b.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs hover:border-slate-700/80 transition-all">
                  <div>
                    <p className="font-bold text-white text-sm">{b.category || 'Kategori Tanpa Nama'}</p>
                    <p className="text-[11px] font-mono font-bold mt-0.5 text-amber-400">
                      💰 Nilai Anggaran: {formatRupiah(b.planned_amount || 0)}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 font-mono">
                      {currentPeriodeObj?.is_closed ? (
                        <span className="text-amber-500 italic text-[10px]">🔒 Terkunci</span>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(b)} className="text-amber-400 hover:underline font-bold">Edit</button>
                          <button onClick={() => handleDelete(b.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                        </>
                      )}
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
