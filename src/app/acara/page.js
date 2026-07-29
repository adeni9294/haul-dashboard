'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';
import {
  Calendar,
  Clock,
  User,
  PlusCircle,
  Pencil,
  Trash2,
  Printer,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Lock,
  RefreshCw,
  HelpCircle,
  Radio,
  Loader2,
  Save,
  X
} from 'lucide-react';

export default function AcaraPage() {
  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState([]);
  const [agenda, setAgenda] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [pic, setPic] = useState('');
  const [dateEvent, setDateEvent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const printRef = useRef(null);

  // State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  const [currentPeriodeObj, setCurrentPeriodeObj] = useState(null);

  // Custom Toast & Modal Alert States
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
    loadSchedules();

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

  async function loadSchedules() {
    try {
      setLoading(true);
      const supabase = getSupabase();

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

      let query = supabase
        .from('schedules')
        .select('*')
        .order('event_date', { ascending: true })
        .order('time_start', { ascending: true });

      if (activePeriodeId) {
        query = query.eq('periode_id', activePeriodeId);
      }

      const { data, error } = await query;

      if (!error && data) {
        setScheduleList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return showToast('Aksi ditolak. Anda belum login sebagai admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('Periode ini telah ditutup buku. Tidak dapat merubah jadwal.', 'error');
    if (!agenda.trim() || !timeStart.trim() || !dateEvent) return;

    const supabase = getSupabase();
    
    const payload = { 
      agenda: agenda.trim(),
      time_start: timeStart.trim(),
      time_end: timeEnd.trim() || 'S.D Selesai',
      pic: pic.trim() || '-',
      event_date: dateEvent,
      periode_id: selectedPeriodeId
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('schedules').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Jadwal acara berhasil diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('schedules').insert([payload]);
        if (error) throw error;
        showToast('Jadwal acara baru berhasil ditambahkan!', 'success');
      }

      setAgenda('');
      setTimeStart('');
      setTimeEnd('');
      setPic('');
      setDateEvent('');
      setEditingId(null);
      await loadSchedules();
    } catch (err) {
      console.error(err);
      showToast(`Gagal menyimpan: ${err?.message || err}`, 'error');
    }
  };

  const handleEdit = (s) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('Periode ini sudah ditutup buku!', 'error');
    setEditingId(s.id);
    setAgenda(s.agenda || '');
    setTimeStart(s.time_start || '');
    setTimeEnd(s.time_end || '');
    setPic(s.pic || '');
    setDateEvent(s.event_date || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (!isAdmin) return showToast('Aksi ditolak. Anda bukan admin!', 'error');
    if (currentPeriodeObj?.is_closed) return showToast('Periode ini sudah ditutup buku!', 'error');

    showConfirm(
      'Hapus Jadwal Acara',
      'Apakah Anda yakin ingin menghapus jadwal agenda ini dari rundown?',
      async () => {
        try {
          const supabase = getSupabase();
          const { error } = await supabase.from('schedules').delete().eq('id', id);
          if (error) throw error;
          showToast('Acara berhasil dihapus.', 'success');
          await loadSchedules();
        } catch (err) {
          showToast(`Gagal menghapus: ${err?.message || err}`, 'error');
        } finally {
          closeConfirm();
        }
      }
    );
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadImageNative = async () => {
    try {
      setDownloading(true);
      showToast('Mengkonversi jadwal ke Gambar...', 'info');

      const { toPng } = await import('html-to-image');

      if (printRef.current) {
        const dataUrl = await toPng(printRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#050b14',
          cacheBust: true,
          filter: (node) => {
            return !node.classList?.contains('print:hidden');
          }
        });

        const link = document.createElement('a');
        link.download = `Rundown_Acara_Haul_${currentPeriodeObj?.nama_periode || '2026'}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Berhasil mengunduh gambar jadwal acara!', 'success');
      }
    } catch (err) {
      console.error("Gambar download error:", err);
      showToast('Gagal unduh gambar. Gunakan fitur Cetak PDF/Screenshot.', 'error');
    } finally {
      setDownloading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
      return String(dateString);
    }
  };

  // LOGIKA STATUS JADWAL ACARA
  const getEventStatus = (eventDateStr, timeStartStr, timeEndStr) => {
    if (!eventDateStr) return { label: 'Coming Soon', icon: Clock, style: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
    
    const now = new Date();
    const [year, month, day] = eventDateStr.split('-').map(Number);
    
    let startHour = 0, startMin = 0;
    if (timeStartStr && timeStartStr.includes(':')) {
      const [h, m] = timeStartStr.split(':').map(Number);
      startHour = h || 0;
      startMin = m || 0;
    }

    let endHour = 23, endMin = 59;
    if (timeEndStr && timeEndStr.includes(':')) {
      const [h, m] = timeEndStr.split(':').map(Number);
      endHour = h || 23;
      endMin = m || 59;
    }

    const startDate = new Date(year, month - 1, day, startHour, startMin);
    const endDate = new Date(year, month - 1, day, endHour, endMin);

    if (now < startDate) {
      return { 
        label: 'Coming Soon', 
        icon: Clock,
        style: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/40 shadow-sm shadow-cyan-500/10' 
      };
    } else if (now >= startDate && now <= endDate) {
      return { 
        label: 'Live Now', 
        icon: Radio,
        style: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse font-black' 
      };
    } else {
      return { 
        label: 'Selesai', 
        icon: CheckCircle2,
        style: 'bg-slate-800/60 text-slate-400 border-slate-700/50' 
      };
    }
  };

  // SKELETON LOADING STATE
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0 pb-12">
        <div className="flex items-center justify-center gap-3 py-6 text-amber-400 font-mono text-xs tracking-widest uppercase">
          <Loader2 className="animate-spin h-5 w-5 text-amber-400" />
          <span className="animate-pulse">Memuat Susunan Agenda Acara...</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 h-48 animate-pulse bg-slate-900/40 border border-white/5" />
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 rounded-xl bg-slate-900/40 border border-amber-500/10 p-4 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs theme-text-primary relative">

      {/* CSS Cetak PDF */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: black !important;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-card {
            border: 1px solid #ccc !important;
            background: #fff !important;
            color: #000 !important;
            margin-bottom: 8px !important;
          }
        }
      `}} />

      {/* FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md print:hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className={`px-4 py-3 border rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
            toast.type === 'error' 
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50' 
              : toast.type === 'info'
              ? 'bg-cyan-950/90 border-cyan-500/80 text-cyan-200 shadow-cyan-950/50'
              : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50'
          }`}>
            <span className="shrink-0">
              {toast.type === 'error' ? (
                <XCircle className="w-5 h-5 text-rose-400" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-cyan-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </span>
            <span className="font-mono font-medium text-xs leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <GlassCard className="max-w-sm w-full p-6 space-y-4 shadow-2xl border theme-border text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm theme-text-primary uppercase tracking-wider">{confirmModal.title}</h3>
              <p className="text-xs theme-text-secondary leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 theme-text-secondary font-mono text-xs rounded-xl border theme-border transition-all flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Batal
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* HEADER PAGE STATUS, PERIODE SELECTOR & DOWNLOAD BUTTONS */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 print:hidden">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 theme-text-primary">
            <Calendar className="w-4 h-4 text-amber-400" />
            Susunan Agenda & Rundown Acara
          </h2>
          <p className="text-[10px] theme-text-tertiary font-mono mt-0.5 flex items-center gap-1.5">
            <span>Mode:</span>
            <span className={isAdmin ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
              {isAdmin ? 'Admin Kontrol Penuh' : 'Public Read-Only'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {periodeList.length > 0 && (
            <div className="flex items-center bg-black/30 p-1 border theme-border rounded-xl">
              <span className="text-[9px] font-mono font-bold theme-text-tertiary px-2 uppercase">Periode:</span>
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

          {/* TOMBOL CETAK PDF / UNDUH GAMBAR */}
          <button
            onClick={handleDownloadImageNative}
            disabled={downloading}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md text-[10px] flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            Simpan Gambar
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md text-[10px] flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / PDF
          </button>
        </div>
      </GlassCard>

      {/* INDIKATOR TUTUP BUKU */}
      {currentPeriodeObj?.is_closed && (
        <GlassCard className="p-3 border-amber-500/40 flex items-center justify-between text-amber-300 font-mono text-xs print:hidden">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku. Susunan acara bersifat Read-Only.</span>
          </span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0">Arsip</span>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERFACE FORM INPUT */}
        {isAdmin && !currentPeriodeObj?.is_closed ? (
          <GlassCard className="p-6 h-fit space-y-4 print:hidden">
            <h3 className="text-xs font-black theme-text-accent uppercase tracking-wider flex items-center gap-2">
              {editingId ? <RefreshCw className="w-4 h-4 text-amber-400" /> : <PlusCircle className="w-4 h-4 text-amber-400" />}
              {editingId ? 'Perbarui Acara' : 'Tambah Rundown Acara'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] theme-text-secondary mb-1 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400/80" /> Tanggal Acara
                </label>
                <input 
                  type="date" 
                  required 
                  value={dateEvent} 
                  onChange={(e) => setDateEvent(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none font-mono" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] theme-text-secondary mb-1 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400/80" /> Mulai
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={timeStart} 
                    onChange={(e) => setTimeStart(e.target.value)} 
                    placeholder="08:00" 
                    className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none font-mono placeholder:theme-text-tertiary" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] theme-text-secondary mb-1 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400/80" /> Selesai
                  </label>
                  <input 
                    type="text" 
                    value={timeEnd} 
                    onChange={(e) => setTimeEnd(e.target.value)} 
                    placeholder="09:30 / Selesai" 
                    className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none font-mono placeholder:theme-text-tertiary" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] theme-text-secondary mb-1 font-semibold">Nama Kegiatan / Agenda</label>
                <input 
                  type="text" 
                  required 
                  value={agenda} 
                  onChange={(e) => setAgenda(e.target.value)} 
                  placeholder="Contoh: Pembukaan & Tahlil" 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none placeholder:theme-text-tertiary" 
                />
              </div>
              <div>
                <label className="block text-[11px] theme-text-secondary mb-1 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400/80" /> PIC (Penanggung Jawab)
                </label>
                <input 
                  type="text" 
                  value={pic} 
                  onChange={(e) => setPic(e.target.value)} 
                  placeholder="Contoh: Warya & Kurma" 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl text-xs theme-text-primary focus:outline-none placeholder:theme-text-tertiary" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-2.5 btn-theme-primary font-black text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Simpan Perubahan' : 'Simpan Rundown'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { setEditingId(null); setAgenda(''); setTimeStart(''); setTimeEnd(''); setPic(''); setDateEvent(''); }} 
                  className="w-full py-1.5 bg-black/30 hover:bg-black/50 theme-text-secondary text-xs font-bold rounded-xl mt-2 transition-all border theme-border flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Batal Edit
                </button>
              )}
            </form>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 h-fit text-center space-y-2 print:hidden">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-xs theme-text-secondary font-semibold font-sans">
              {currentPeriodeObj?.is_closed ? 'Periode ini sudah ditutup buku.' : 'Anda berada di Mode Publik (Read-Only).'}
            </p>
            <p className="text-[10px] theme-text-tertiary font-mono">
              {currentPeriodeObj?.is_closed ? 'Susunan agenda kegiatan telah dikunci.' : 'Gunakan login admin untuk mengelola manajemen jadwal rundown.'}
            </p>
          </GlassCard>
        )}

        {/* LIST DAFTAR RUNDOWN ACARA MODERN */}
        <div id="printable-area" className="lg:col-span-2">
          <GlassCard className="p-6 space-y-3">
            <div ref={printRef} className="space-y-4 p-3 rounded-xl bg-slate-950/80">
              <div className="flex justify-between items-center border-b theme-border pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  SUSUNAN AGENDA RUNDOWN HAUL ({scheduleList.length})
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">
                  {currentPeriodeObj?.nama_periode || ''}
                </span>
              </div>

              {/* TIMELINE RUNDOWN CONTAINER */}
              <div className="space-y-3 relative pl-2 sm:pl-4 border-l-2 border-slate-800/80 my-2">
                {scheduleList.length === 0 ? (
                  <p className="text-xs font-mono py-6 text-center opacity-70">Belum ada jadwal rundown acara pada periode ini.</p>
                ) : (
                  scheduleList.map((s) => {
                    const status = getEventStatus(s.event_date, s.time_start, s.time_end);
                    const StatusIcon = status.icon;

                    return (
                      <div 
                        key={s.id} 
                        className="print-card relative p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-white/10 hover:border-amber-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs transition-all shadow-md group"
                      >
                        {/* Dot Timeline Visual Indicator */}
                        <div className="absolute -left-[15px] sm:-left-[23px] top-6 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-950 shadow-sm shadow-amber-400/50 print:hidden" />

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-black/40 border theme-border px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatDate(s.event_date)}
                            </span>
                            <span className="bg-black/30 border theme-border px-2.5 py-0.5 rounded-lg text-[10px] font-mono text-amber-300 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {s.time_start || '-'} - {s.time_end || '-'} WIB
                            </span>

                            {/* STATUS BADGE */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border flex items-center gap-1 ${status.style}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>

                          <p className="font-extrabold text-sm sm:text-base tracking-wide text-slate-100 group-hover:text-amber-300 transition-colors">
                            {s.agenda || 'Agenda Tanpa Nama'}
                          </p>
                          <p className="text-[10px] opacity-80 font-mono text-slate-400 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>PIC:</span>
                            <strong className="text-slate-300">{s.pic || '-'}</strong>
                          </p>
                        </div>

                        {/* TOMBOL AKSI ADMIN */}
                        {isAdmin && (
                          <div className="flex gap-2 font-mono shrink-0 ml-auto sm:ml-2 print:hidden pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto justify-end">
                            {currentPeriodeObj?.is_closed ? (
                              <span className="italic text-[10px] text-slate-500 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Terkunci
                              </span>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleEdit(s)} 
                                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 transition-all font-bold text-[10px] flex items-center gap-1"
                                >
                                  <Pencil className="w-3 h-3" />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(s.id)} 
                                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition-all font-bold text-[10px] flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Hapus
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
