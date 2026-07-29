'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';

export default function AnggaranPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [budgetList, setBudgetList] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  // State Form Anggaran
  const [allocationName, setAllocationName] = useState('');
  const [category, setCategory] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [realizedAmount, setRealizedAmount] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  const [currentPeriodeObj, setCurrentPeriodeObj] = useState(null);

  // Custom Toast & Confirm Modal States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  };

  const getSupabase = () => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  };

  useEffect(() => {
    checkAdminSession();
    loadBudgets();

    const interval = setInterval(checkAdminSession, 1000);
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

      // 2. Memuat Opsi Kategori
      const { data: catDb } = await supabase.from('category').select('*').order('name', { ascending: true });
      if (catDb && catDb.length > 0) {
        const catNames = catDb.map(c => c.name);
        setCategoryOptions(catNames);
        if (!category) setCategory(catNames[0]);
      }

      // 3. Query Data Rencana Anggaran
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
    if (!isAdmin) return showToast('Aksi ditolak. Anda belum login sebagai admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini telah ditutup buku!', 'error');
    if (!allocationName.trim() || !plannedAmount) {
      return showToast('Harap isi Nama Alokasi dan Jumlah Rencana Anggaran!', 'error');
    }

    const supabase = getSupabase();
    const cleanPlanned = parseFloat(plannedAmount.toString().replace(/[^0-9.-]/g, '')) || 0;
    const cleanRealized = parseFloat((realizedAmount || '0').toString().replace(/[^0-9.-]/g, '')) || 0;

    const payload = { 
      category: allocationName.trim(), 
      planned_amount: cleanPlanned,
      real_amount: cleanRealized, 
      periode_id: selectedPeriodeId
    };

    try {
      setSubmitting(true);
      if (editingId) {
        const { error } = await supabase.from('budgets').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('🟢 Rencana & realisasi anggaran berhasil diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('budgets').insert([payload]);
        if (error) throw error;
        showToast('🟢 Pos rencana anggaran baru berhasil ditambahkan!', 'success');
      }

      setAllocationName('');
      if (categoryOptions.length > 0) setCategory(categoryOptions[0]);
      setPlannedAmount('');
      setRealizedAmount('');
      setEditingId(null);
      await loadBudgets();
    } catch (err) {
      console.error(err);
      showToast(`❌ Gagal menyimpan: ${err?.message || err}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (b) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini sudah ditutup buku!', 'error');
    setEditingId(b.id);
    setAllocationName(b.category || b.category_name || b.name || b.title || '');
    setPlannedAmount(b.planned_amount || '');
    setRealizedAmount(b.real_amount || b.realized_amount || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('🔒 Periode ini sudah ditutup buku!', 'error');

    showConfirm(
      'Hapus Pos Anggaran',
      'Apakah Anda yakin ingin menghapus pos alokasi anggaran ini?',
      async () => {
        try {
          const supabase = getSupabase();
          const { error } = await supabase.from('budgets').delete().eq('id', id);
          if (error) throw error;
          showToast('🗑️ Pos anggaran berhasil dihapus.', 'success');
          await loadBudgets();
        } catch (err) {
          showToast(`❌ Gagal menghapus: ${err?.message || err}`, 'error');
        } finally {
          closeConfirm();
        }
      }
    );
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const totalRencana = budgetList.reduce((acc, curr) => acc + (parseFloat(curr.planned_amount) || 0), 0);
  const totalRealisasi = budgetList.reduce((acc, curr) => acc + (parseFloat(curr.real_amount || curr.realized_amount) || 0), 0);
  const totalSelisih = totalRencana - totalRealisasi;

  // 🚀 TAMPILAN SKELETON LOADING MODERN
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0 pb-12">
        <div className="flex items-center justify-center gap-3 py-6 text-amber-400 font-mono text-xs tracking-widest uppercase">
          <svg className="animate-spin h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">Memuat Data Anggaran & Alokasi...</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-900/40 border border-white/5 p-4 animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 h-64 animate-pulse bg-slate-900/40 border border-white/5" />
          <GlassCard className="lg:col-span-2 p-6 h-64 animate-pulse bg-slate-900/40 border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs theme-text-primary relative">

      {/* 🔔 FLOATING TOAST NOTIFICATION (DI TENGAH ATAS LAYAR) */}
      {toast.show && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md transition-all duration-300">
          <div className={`px-5 py-3.5 border-2 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
            toast.type === 'error' 
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50' 
              : toast.type === 'info'
              ? 'bg-cyan-950/90 border-cyan-500/80 text-cyan-200 shadow-cyan-950/50'
              : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50'
          }`}>
            <span className="text-lg shrink-0">{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅'}</span>
            <span className="font-mono font-bold text-xs leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ❓ CUSTOM CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="max-w-sm w-full p-6 space-y-4 shadow-2xl border theme-border text-center">
            <div className="text-3xl">❓</div>
            <h3 className="font-bold text-sm theme-text-primary uppercase tracking-wider">{confirmModal.title}</h3>
            <p className="text-xs theme-text-secondary leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 theme-text-secondary font-mono rounded-xl border theme-border transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold rounded-xl transition-all shadow-md"
              >
                Ya, Hapus
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* HEADER PAGE STATUS & PERIODE SELECTOR */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 theme-text-primary">
            <span>📋</span> Rencana Anggaran & Alokasi Haul
          </h2>
          <p className="text-[10px] theme-text-tertiary font-mono mt-0.5">Mode: {isAdmin ? '🟢 Admin Kontrol Penuh' : '🔵 Public Read-Only'}</p>
        </div>

        {periodeList.length > 0 && (
          <div className="flex items-center bg-black/30 p-1 border theme-border rounded-xl">
            <span className="text-[9px] font-mono font-bold theme-text-tertiary px-2 uppercase">Periode Haul:</span>
            <select
              value={selectedPeriodeId || ''}
              onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
              className="bg-black/40 border theme-border text-[10px] theme-text-accent rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.nama_periode} {p.is_closed ? '(Tutup Buku)' : '(Aktif)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </GlassCard>

      {/* INDIKATOR TUTUP BUKU */}
      {currentPeriodeObj?.is_closed && (
        <GlassCard className="p-3 border-amber-500/40 flex items-center justify-between text-amber-300 font-mono text-xs">
          <span>🔒 Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Data anggaran bersifat Read-Only.</span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
        </GlassCard>
      )}

      {/* CARD REKAP TOTAL PLAFON & REALISASI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <p className="text-[10px] font-mono theme-text-secondary uppercase font-bold">Total Rencana Anggaran</p>
          <h3 className="text-xl font-black mt-1 theme-text-accent">{formatRupiah(totalRencana)}</h3>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[10px] font-mono theme-text-secondary uppercase font-bold">Total Realisasi Belanja</p>
          <h3 className="text-xl font-black mt-1 text-rose-300">{formatRupiah(totalRealisasi)}</h3>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[10px] font-mono theme-text-secondary uppercase font-bold">Sisa / Selisih Plafon</p>
          <h3 className={`text-xl font-black mt-1 ${totalSelisih >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
            {formatRupiah(totalSelisih)}
          </h3>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERFACE FORM INPUT MANUAL */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
          <GlassCard className="p-6 h-fit space-y-4">
            <h3 className="text-xs font-black theme-text-accent uppercase tracking-wider flex items-center gap-2">
              <span>{editingId ? '🔄' : '➕'}</span> {editingId ? 'Perbarui Anggaran & Realisasi' : 'Tambah Anggaran Baru'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Nama Alokasi</label>
                <input 
                  type="text" 
                  required 
                  value={allocationName} 
                  onChange={(e) => setAllocationName(e.target.value)} 
                  placeholder="Contoh: Sewa Tenda Utama & Panggung" 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none placeholder:theme-text-tertiary" 
                />
              </div>

              <div>
                <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Jumlah Rencana Anggaran (Rp)</label>
                <input 
                  type="number" 
                  required 
                  value={plannedAmount} 
                  onChange={(e) => setPlannedAmount(e.target.value)} 
                  placeholder="Contoh: 5000000" 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-accent font-mono font-bold focus:outline-none placeholder:theme-text-tertiary" 
                />
              </div>

              <div>
                <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Jumlah Realisasi Belanja (Rp)</label>
                <input 
                  type="number" 
                  value={realizedAmount} 
                  onChange={(e) => setRealizedAmount(e.target.value)} 
                  placeholder="Contoh: 4500000 (Opsional/Manual)" 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs text-rose-300 font-mono font-bold focus:outline-none placeholder:theme-text-tertiary" 
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-2.5 btn-theme-primary font-black text-xs uppercase rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? '⏳ Menyimpan...' : editingId ? '💾 Simpan Perubahan' : 'Simpan Anggaran'}
              </button>

              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { setEditingId(null); setAllocationName(''); setPlannedAmount(''); setRealizedAmount(''); }} 
                  className="w-full py-1.5 bg-black/30 hover:bg-black/50 theme-text-secondary text-xs font-bold rounded-xl transition-all border theme-border"
                >
                  Batal Edit
                </button>
              )}
            </form>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 h-fit text-center space-y-2">
            <p className="text-xs theme-text-secondary font-medium font-sans">
              {currentPeriodeObj?.is_closed ? '🔒 Periode ini sudah ditutup buku.' : '💡 Anda berada di Mode Publik (Read-Only).'}
            </p>
            <p className="text-[10px] theme-text-tertiary font-mono">
              {currentPeriodeObj?.is_closed ? 'Data rencana anggaran telah dikunci.' : 'Gunakan login admin untuk mengelola rencana anggaran.'}
            </p>
          </GlassCard>
        )}

        {/* 📊 TABEL DAFTAR RENCANA ANGGARAN */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          <h3 className="text-xs font-black theme-text-primary uppercase tracking-wider flex items-center gap-2">
            <span>📊</span> Rencana Anggaran vs Realisasi Belanja ({budgetList.length})
          </h3>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto pr-1 border theme-border rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-black/60 sticky top-0 backdrop-blur-md z-10 border-b theme-border font-mono text-[10px] uppercase theme-text-tertiary">
                <tr>
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-4">Nama Alokasi</th>
                  <th className="py-3 px-4 text-right">Rencana</th>
                  <th className="py-3 px-4 text-right">Realisasi</th>
                  <th className="py-3 px-4 text-right">Sisa / Selisih</th>
                  {isAdmin && <th className="py-3 px-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y theme-border font-mono">
                {budgetList.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-xs theme-text-tertiary">
                      Belum ada daftar alokasi anggaran pada periode ini.
                    </td>
                  </tr>
                ) : (
                  budgetList.map((b, index) => {
                    const plan = parseFloat(b.planned_amount) || 0;
                    const real = parseFloat(b.real_amount || b.realized_amount) || 0;
                    const selisih = plan - real;
                    const percentUsed = plan > 0 ? Math.min(Math.round((real / plan) * 100), 100) : 0;
                    const titleName = b.category || b.category_name || b.name || b.title || 'Tanpa Nama Alokasi';

                    return (
                      <tr key={b.id} className="hover:bg-white/5 transition-all">
                        {/* NO */}
                        <td className="py-3 px-3 text-[10px] theme-text-tertiary">{index + 1}</td>

                        {/* NAMA ALOKASI */}
                        <td className="py-3 px-4 font-bold theme-text-primary font-sans uppercase">
                          {titleName}
                        </td>

                        {/* RENCANA */}
                        <td className="py-3 px-4 text-right theme-text-accent font-bold">
                          {formatRupiah(plan)}
                        </td>

                        {/* REALISASI + PROGRESS BAR */}
                        <td className="py-3 px-4 text-right text-rose-300">
                          <div>{formatRupiah(real)}</div>
                          <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden mt-1 ml-auto max-w-[100px]">
                            <div 
                              className={`h-full ${real > plan ? 'bg-rose-500' : 'bg-emerald-400'}`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        </td>

                        {/* SISA / SELISIH */}
                        <td className={`py-3 px-4 text-right font-bold ${selisih >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                          {formatRupiah(selisih)}
                        </td>

                        {/* AKSI */}
                        {isAdmin && (
                          <td className="py-3 px-3 text-center">
                            {currentPeriodeObj?.is_closed ? (
                              <span className="theme-text-accent italic text-[10px]">🔒</span>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEdit(b)} 
                                  className="theme-text-accent hover:underline font-bold text-[11px]"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(b.id)} 
                                  className="text-rose-400 hover:underline font-bold text-[11px]"
                                >
                                  Hapus
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
