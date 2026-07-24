'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [loading, setLoading] = useState(true);
  const [budgetList, setBudgetList] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  // State Form Anggaran
  const [allocationName, setAllocationName] = useState('');
  const [category, setCategory] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [realizedAmount, setRealizedAmount] = useState('');
  
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

      // 2. Memuat Opsi Kategori dari tabel 'category' (kolom 'name')
      const { data: catDb } = await supabase.from('category').select('*').order('name', { ascending: true });
      if (catDb && catDb.length > 0) {
        const catNames = catDb.map(c => c.name);
        setCategoryOptions(catNames);
        if (!category) setCategory(catNames[0]);
      }

      // 3. Query Data Rencana Anggaran (budgets)
      let budgetQuery = supabase.from('budgets').select('*').order('id', { ascending: true });
      if (activePeriodeId) budgetQuery = budgetQuery.eq('periode_id', activePeriodeId);
      const { data: bData } = await budgetQuery;

      setBudgetList(bData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak. Anda belum login sebagai admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini telah ditutup buku!');
    if (!allocationName.trim() || !plannedAmount) return;

    const supabase = getSupabase();
    const cleanPlanned = parseFloat(plannedAmount.toString().replace(/[^0-9.-]/g, '')) || 0;
    const cleanRealized = parseFloat((realizedAmount || '0').toString().replace(/[^0-9.-]/g, '')) || 0;

    // Menyimpan Nama Alokasi langsung ke kolom 'category' pada tabel budgets
    const payload = { 
      category: allocationName.trim(), 
      planned_amount: cleanPlanned,
      real_amount: cleanRealized, 
      periode_id: selectedPeriodeId
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('budgets').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('🟢 Rencana & realisasi anggaran berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('budgets').insert([payload]);
        if (error) throw error;
        alert('🟢 Pos rencana anggaran baru berhasil ditambahkan!');
      }

      setAllocationName('');
      if (categoryOptions.length > 0) setCategory(categoryOptions[0]);
      setPlannedAmount('');
      setRealizedAmount('');
      setEditingId(null);
      await loadBudgets();
    } catch (err) {
      console.error(err);
      alert(`❌ Gagal menyimpan: ${err?.message || err}`);
    }
  };

  const handleEdit = (b) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini sudah ditutup buku!');
    setEditingId(b.id);
    setAllocationName(b.category || b.category_name || b.name || b.title || '');
    setPlannedAmount(b.planned_amount || '');
    setRealizedAmount(b.real_amount || b.realized_amount || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (currentPeriodeObj?.is_closed) return alert('🔒 Periode ini sudah ditutup buku!');
    if (!confirm('Apakah Anda yakin ingin menghapus pos anggaran ini?')) return;
      
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      alert('🗑️ Pos anggaran berhasil dihapus.');
      await loadBudgets();
    } catch (err) {
      alert(`❌ Gagal menghapus: ${err?.message || err}`);
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const totalRencana = budgetList.reduce((acc, curr) => acc + (parseFloat(curr.planned_amount) || 0), 0);
  const totalRealisasi = budgetList.reduce((acc, curr) => acc + (parseFloat(curr.real_amount || curr.realized_amount) || 0), 0);
  const totalSelisih = totalRencana - totalRealisasi;

  if (loading) return <div className="text-center py-12 text-xs font-mono opacity-70">Memuat data anggaran...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
        
      {/* HEADER PAGE STATUS & PERIODE SELECTOR (GLASS) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Rencana Anggaran & Alokasi Haul
          </h2>
          <p className="text-[10px] opacity-80 font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        {periodeList.length > 0 && (
          <div className="flex items-center bg-black/30 p-1 border border-white/20 rounded-xl">
            <span className="text-[9px] font-mono font-bold text-slate-300 px-2 uppercase">Periode Haul:</span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-black/40 border border-white/20 text-[10px] text-amber-300 rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* INDIKATOR TUTUP BUKU */}
      {currentPeriodeObj?.is_closed && (
        <div className="bg-amber-500/20 border border-amber-400/40 p-3 rounded-xl flex items-center justify-between text-amber-300 font-mono text-xs backdrop-blur-md">
          <span>🔒 Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Data anggaran bersifat Read-Only.</span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
        </div>
      )}

      {/* CARD REKAP TOTAL PLAFON & REALISASI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <p className="text-[10px] font-mono opacity-80 uppercase font-bold">Total Rencana Anggaran</p>
          <h3 className="text-xl font-black font-['Space_Grotesk'] mt-1 text-amber-300">{formatRupiah(totalRencana)}</h3>
        </div>
        <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <p className="text-[10px] font-mono opacity-80 uppercase font-bold">Total Realisasi Belanja</p>
          <h3 className="text-xl font-black font-['Space_Grotesk'] mt-1 text-rose-300">{formatRupiah(totalRealisasi)}</h3>
        </div>
        <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <p className="text-[10px] font-mono opacity-80 uppercase font-bold">Sisa / Selisih Plafon</p>
          <h3 className={`text-xl font-black font-['Space_Grotesk'] mt-1 ${totalSelisih >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
            {formatRupiah(totalSelisih)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* INTERFACE FORM INPUT MANUAL */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
          <form onSubmit={handleSubmit} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl h-fit space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>{editingId ? '🔄' : '➕'}</span> {editingId ? 'Perbarui Anggaran & Realisasi' : 'Tambah Anggaran Baru'}
            </h3>
            
            {/* NAMA ALOKASI (Disimpan ke kolom 'category') */}
            <div>
              <label className="block text-[11px] text-slate-200 mb-1 font-semibold">Nama Alokasi</label>
              <input 
                type="text" 
                required 
                value={allocationName} 
                onChange={(e) => setAllocationName(e.target.value)} 
                placeholder="Contoh: Sewa Tenda Utama & Panggung" 
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl text-xs text-white focus:outline-none placeholder:text-slate-400" 
              />
            </div>

            {/* JUMLAH RENCANA ANGGARAN */}
            <div>
              <label className="block text-[11px] text-slate-200 mb-1 font-semibold">Jumlah Rencana Anggaran (Rp)</label>
              <input 
                type="number" 
                required 
                value={plannedAmount} 
                onChange={(e) => setPlannedAmount(e.target.value)} 
                placeholder="Contoh: 5000000" 
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl text-xs text-amber-300 font-mono font-bold focus:outline-none placeholder:text-slate-400" 
              />
            </div>

            {/* JUMLAH REALISASI (FLEKSIBEL / MANUAL) */}
            <div>
              <label className="block text-[11px] text-slate-200 mb-1 font-semibold">Jumlah Realisasi Belanja (Rp)</label>
              <input 
                type="number" 
                value={realizedAmount} 
                onChange={(e) => setRealizedAmount(e.target.value)} 
                placeholder="Contoh: 4500000 (Opsional/Manual)" 
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-xl text-xs text-rose-300 font-mono font-bold focus:outline-none placeholder:text-slate-400" 
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl transition-all shadow-md">
              {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggaran'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setAllocationName(''); setPlannedAmount(''); setRealizedAmount(''); }} className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold rounded-xl mt-2 transition-all">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl h-fit text-center space-y-2 shadow-xl">
            <p className="text-xs text-slate-200 font-medium font-sans">
              {currentPeriodeObj?.is_closed ? '🔒 Periode ini sudah ditutup buku.' : '💡 Anda berada di Mode Publik (Read-Only).'}
            </p>
            <p className="text-[10px] opacity-70 font-mono">
              {currentPeriodeObj?.is_closed ? 'Data rencana anggaran telah dikunci.' : 'Gunakan login admin untuk mengelola rencana anggaran.'}
            </p>
          </div>
        )}

        {/* LIST DAFTAR RENCANA ANGGARAN, REALISASI MANUAL, DAN SELISIH */}
        <div className="lg:col-span-2 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-3 shadow-xl">
          <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>📊</span> Rencana Anggaran vs Realisasi Belanja ({budgetList.length})
          </h3>
          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {budgetList.length === 0 ? (
              <p className="text-xs opacity-70 font-mono py-6 text-center">Belum ada daftar alokasi anggaran pada periode ini.</p>
            ) : (
              budgetList.map((b) => {
                const plan = parseFloat(b.planned_amount) || 0;
                const real = parseFloat(b.real_amount || b.realized_amount) || 0;
                const selisih = plan - real;
                const percentUsed = plan > 0 ? Math.min(Math.round((real / plan) * 100), 100) : 0;
                const titleName = b.category || b.category_name || b.name || b.title || 'Tanpa Nama Alokasi';

                return (
                  <div key={b.id} className="p-3.5 bg-black/20 border border-white/10 rounded-xl space-y-2 hover:border-white/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white text-sm tracking-wide uppercase">{titleName}</p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-3 font-mono text-[11px] shrink-0 ml-2">
                          {currentPeriodeObj?.is_closed ? (
                            <span className="text-amber-300 italic text-[10px]">🔒 Terkunci</span>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(b)} className="text-amber-300 hover:underline font-bold">Edit</button>
                              <button onClick={() => handleDelete(b.id)} className="text-rose-300 hover:underline font-bold">Hapus</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* RINCIAN NOMINAL 3 KOLOM */}
                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px] border-t border-white/10">
                      <div>
                        <span className="opacity-60 block text-[9px] uppercase">Rencana:</span>
                        <strong className="text-amber-300 text-xs">{formatRupiah(plan)}</strong>
                      </div>
                      <div>
                        <span className="opacity-60 block text-[9px] uppercase">Realisasi (Manual):</span>
                        <strong className="text-rose-300 text-xs">{formatRupiah(real)}</strong>
                      </div>
                      <div>
                        <span className="opacity-60 block text-[9px] uppercase">Sisa / Selisih:</span>
                        <strong className={`text-xs ${selisih >= 0 ? 'text-emerald-300' : 'text-rose-400 font-black'}`}>
                          {formatRupiah(selisih)}
                        </strong>
                      </div>
                    </div>

                    {/* PROGRESS BAR SERAPAN */}
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${real > plan ? 'bg-rose-500' : 'bg-emerald-400'}`} 
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
