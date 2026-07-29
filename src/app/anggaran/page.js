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
    } fontally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return showToast('Aksi ditolak. Anda belum login sebagai admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('Periode ini telah ditutup buku!', 'error');
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
        showToast('Rencana & realisasi anggaran berhasil diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('budgets').insert([payload]);
        if (error) throw error;
        showToast('Pos rencana anggaran baru berhasil ditambahkan!', 'success');
      }

      setAllocationName('');
      if (categoryOptions.length > 0) setCategory(categoryOptions[0]);
      setPlannedAmount('');
      setRealizedAmount('');
      setEditingId(null);
      await loadBudgets();
    } catch (err) {
      console.error(err);
      showToast(`Gagal menyimpan: ${err?.message || err}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (b) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('Periode ini sudah ditutup buku!', 'error');
    setEditingId(b.id);
    setAllocationName(b.category || b.category_name || b.name || b.title || '');
    setPlannedAmount(b.planned_amount || '');
    setRealizedAmount(b.real_amount || b.realized_amount || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('Periode ini sudah ditutup buku!', 'error');

    showConfirm(
      'Hapus Pos Anggaran',
      'Apakah Anda yakin ingin menghapus pos alokasi anggaran ini?',
      async () => {
        try {
          const supabase = getSupabase();
          const { error } = await supabase.from('budgets').delete().eq('id', id);
          if (error) throw error;
          showToast('Pos anggaran berhasil dihapus.', 'success');
          await loadBudgets();
        } catch (err) {
          showToast(`Gagal menghapus: ${err?.message || err}`, 'error');
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

      {/* 🔔 MODERN FLOATING TOAST ALERT (POSISI ATAS TENGAH LAYAR) */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-2xl flex items-start gap-3 shadow-2xl backdrop-blur-2xl border transition-all ${
            toast.type === 'error' 
              ? 'bg-rose-950/85 border-rose-500/50 text-rose-200 shadow-rose-950/60' 
              : toast.type === 'info'
              ? 'bg-cyan-950/85 border-cyan-500/50 text-cyan-200 shadow-cyan-950/60'
              : 'bg-emerald-950/85 border-emerald-500/50 text-emerald-200 shadow-emerald-950/60'
          }`}>
            <div className="shrink-0 p-1 rounded-xl bg-white/10 mt-0.5">
              {toast.type === 'error' ? (
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              ) : toast.type === 'info' ? (
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[11px] uppercase tracking-wider opacity-90">
                {toast.type === 'error' ? 'Gagal' : toast.type === 'info' ? 'Informasi' : 'Berhasil'}
              </h4>
              <p className="font-mono text-xs mt-0.5 leading-relaxed font-semibold">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="text-white/60 hover:text-white p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ❓ CUSTOM CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="max-w-sm w-full p-6 space-y-4 shadow-2xl border theme-border text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
              </svg>
            </div>
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
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
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Rencana Anggaran & Alokasi Haul
          </h2>
          <p className="text-[10px] theme-text-tertiary font-mono mt-0.5 flex items-center gap-1">
            Mode: {isAdmin ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Admin Kontrol Penuh
              </span>
            ) : (
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Public Read-Only
              </span>
            )}
          </p>
        </div>

        {periodeList.length > 0 && (
          <div className="flex items-center bg-black/30 p-1 border theme-border rounded-xl">
            <span className="text-[9px] font-mono font-bold theme-text-tertiary px-2 uppercase flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Periode Haul:
            </span>
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
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Data anggaran bersifat Read-Only.</span>
          </span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
        </GlassCard>
      )}

      {/* CARD REKAP TOTAL PLAFON & REALISASI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-mono theme-text-secondary uppercase font-bold">Total Rencana Anggaran</p>
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-black mt-1 theme-text-accent">{formatRupiah(totalRencana)}</h3>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-mono theme-text-secondary uppercase font-bold">Total Realisasi Belanja</p>
            <div className="p-1.5 rounded-lg bg-rose-400/10 text-rose-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5ptm-16.5 3h6m-6 3h6m-6 3h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-black mt-1 text-rose-300">{formatRupiah(totalRealisasi)}</h3>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-mono theme-text-secondary uppercase font-bold">Sisa / Selisih Plafon</p>
            <div className={`p-1.5 rounded-lg ${totalSelisih >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
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
              {editingId ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              )}
              {editingId ? 'Perbarui Anggaran & Realisasi' : 'Tambah Anggaran Baru'}
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
                className="w-full py-2.5 btn-theme-primary font-black text-xs uppercase rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : editingId ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>Simpan Perubahan</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Simpan Anggaran</span>
                  </>
                )}
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
            <div className="w-10 h-10 rounded-full bg-white/5 border theme-border flex items-center justify-center mx-auto theme-text-tertiary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-xs theme-text-secondary font-medium font-sans">
              {currentPeriodeObj?.is_closed ? 'Periode ini sudah ditutup buku.' : 'Anda berada di Mode Publik (Read-Only).'}
            </p>
            <p className="text-[10px] theme-text-tertiary font-mono">
              {currentPeriodeObj?.is_closed ? 'Data rencana anggaran telah dikunci.' : 'Gunakan login admin untuk mengelola rencana anggaran.'}
            </p>
          </GlassCard>
        )}

        {/* 📊 TABEL DAFTAR RENCANA ANGGARAN */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          <h3 className="text-xs font-black theme-text-primary uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Rencana Anggaran vs Realisasi Belanja ({budgetList.length})
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
                              <svg className="w-4 h-4 text-amber-400 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEdit(b)} 
                                  className="theme-text-accent hover:underline font-bold text-[11px] flex items-center gap-0.5"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(b.id)} 
                                  className="text-rose-400 hover:underline font-bold text-[11px] flex items-center gap-0.5"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
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
