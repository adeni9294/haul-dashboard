'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Loader2, 
  Sparkles,
  ShieldAlert,
  CalendarDays,
  AlignLeft
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🌐 KAMUS MULTI-BAHASA
const translations = {
  id: {
    title: "Jadwal & Agenda Acara Haul",
    subtitle: "● Susunan Acara, Waktu, Lokasi & Penceramah/Pengisi Acara",
    btnTambah: "Tambah Acara",
    btnExcel: "Excel Data",
    btnCetak: "Cetak Jadwal",
    searchPlaceholder: "Cari nama acara, lokasi, atau penceramah...",
    thDate: "Waktu & Tanggal",
    thTitle: "Nama Agenda Acara",
    thLocation: "Lokasi / Tempat",
    thSpeaker: "Pengisi Acara / Penceramah",
    thAction: "Aksi",
    noData: "Belum ada agenda acara yang dijadwalkan.",
    syncData: "Memuat susunan acara haul...",
    lpjTitle: "SUSUNAN JADWAL & AGENDA ACARA HAUL",
    lpjPeriod: "Dicetak pada:",
    signKnow: "Mengetahui,",
    signChair: "Ketua Panitia",
    signMade: "Dibuat Oleh,",
    signSecretary: "Sekretaris",
    signGroup: "PANITIA HAUL 2026",
    city: "Cirebon"
  },
  jv: { 
    title: "Jadwal & Agenda Acara Haul",
    subtitle: "● Rintikan Acara, Waktu, Panggonan & Penceramah",
    btnTambah: "Tambah Acara",
    btnExcel: "Pragat Excel",
    btnCetak: "Cetak Jadwal",
    searchPlaceholder: "Goleki acara, panggonan, utawa penceramah...",
    thDate: "Waktu & Tanggal",
    thTitle: "Arane Acara",
    thLocation: "Panggonan",
    thSpeaker: "Penceramah / Pengisi Acara",
    thAction: "Aksi",
    noData: "Durung ana jadwal acara.",
    syncData: "Nembe ngebuka rintikan acara haul...",
    lpjTitle: "RINTIKAN JADWAL ACARA HAUL",
    lpjPeriod: "Maca dina:",
    signKnow: "Weruh,",
    signChair: "Ketua Panitia",
    signMade: "Sing Gawe,",
    signSecretary: "Sekretaris",
    signGroup: "PANITIA HAUL 2026",
    city: "Cirebon"
  },
  en: {
    title: "Haul Event Schedule & Agenda",
    subtitle: "● Event rundown, time, location & speakers",
    btnTambah: "Add Event",
    btnExcel: "Export Excel",
    btnCetak: "Print Rundown",
    searchPlaceholder: "Search event, location, or speaker...",
    thDate: "Date & Time",
    thTitle: "Event Name",
    thLocation: "Location / Venue",
    thSpeaker: "Speaker / Performer",
    thAction: "Action",
    noData: "No event schedules found.",
    syncData: "Loading event rundown...",
    lpjTitle: "HAUL EVENT RUNDOWN SCHEDULE",
    lpjPeriod: "Printed as of:",
    signKnow: "Approved By,",
    signChair: "Committee Chairman",
    signMade: "Prepared By,",
    signSecretary: "Secretary",
    signGroup: "2026 HAUL COMMITTEE",
    city: "Cirebon"
  }
};

export default function AcaraPage() {
  const [lang, setLang] = useState('id');
  const t = translations[lang] || translations['id'];

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  
  // 🔔 STATE NOTIFIKASI MODERN
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // 🗑️ STATE MODAL KONFIRMASI HAPUS
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [isAdmin, setIsAdmin] = useState(false);
  const [metaOrg, setMetaOrg] = useState({ 
    name: 'PANITIA HAUL MAQBAROH BUYUT KEPUH & BUYUT BESUS', 
    address: 'Blok Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon',
    ketua: '....................',
    sekretaris: '....................'
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('08:00');
  const [formLocation, setFormLocation] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const [search, setSearch] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  useEffect(() => {
    checkAdminSessionAndLoad();
    loadData();

    const interval = setInterval(checkAdminSessionOnly, 1000);
    return () => clearInterval(interval);
  }, []);

  async function checkAdminSessionAndLoad() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      setIsAdmin(!!isValid);
    } catch (err) {
      setIsAdmin(false);
    }
  }

  async function checkAdminSessionOnly() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) return setIsAdmin(false);
    try {
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      setIsAdmin(!!isValid);
    } catch (err) {
      setIsAdmin(false);
    }
  }

  async function loadData() {
    try {
      setLoading(true);

      const { data: setDb } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (setDb && setDb.length > 0) {
        setMetaOrg(prev => ({
          ...prev,
          name: setDb[0].org_name || prev.name,
          address: setDb[0].address || prev.address
        }));
      }

      const { data: committeeDb } = await supabase.from('committee').select('*');
      if (committeeDb && committeeDb.length > 0) {
        setMetaOrg(prev => ({
          ...prev,
          ketua: committeeDb.find(c => c.position?.toLowerCase() === 'ketua')?.name || prev.ketua,
          sekretaris: committeeDb.find(c => c.position?.toLowerCase() === 'sekretaris')?.name || prev.sekretaris
        }));
      }

      // 🛡️ AMBIL DATA DENGAN QUERY SAFETY (TANPA ORDER STRICT SUPABAS KARENA NAMA FIELD BISA BEDA)
      const { data: eventsDb, error } = await supabase
        .from('events')
        .select('*');

      if (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } else {
        // Normalisasi data jika nama kolom di DB berbeda
        const normalized = (eventsDb || []).map(item => ({
          id: item.id,
          title: item.title || item.nama_acara || item.name || 'Agenda Acara',
          event_date: item.event_date || item.date || item.tanggal || new Date().toISOString().split('T')[0],
          event_time: item.event_time || item.time || item.jam || '08:00',
          location: item.location || item.lokasi || item.tempat || '',
          speaker: item.speaker || item.penceramah || item.pengisi_acara || '',
          description: item.description || item.keterangan || item.note || ''
        }));

        // Sort lokal berdasarkan tanggal & jam
        normalized.sort((a, b) => {
          const dateA = `${a.event_date} ${a.event_time}`;
          const dateB = `${b.event_date} ${b.event_time}`;
          return dateA.localeCompare(dateB);
        });

        setEvents(normalized);
      }
    } catch (e) {
      console.error("Gagal load acara:", e);
      setEvents([]);
    } fontally {
      setLoading(false);
    }
  }

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const payload = {
      title: formTitle.trim(),
      event_date: formDate,
      event_time: formTime,
      location: formLocation.trim(),
      speaker: formSpeaker.trim(),
      description: formDescription.trim()
    };

    try {
      if (isEditMode) {
        await supabase.from('events').update(payload).eq('id', selectedId);
        showToast('Agenda acara berhasil diperbarui.', 'success');
      } else {
        await supabase.from('events').insert([payload]);
        showToast('Agenda acara baru berhasil ditambahkan.', 'success');
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan agenda acara.', 'error');
    }
  };

  const triggerEdit = (item) => {
    setSelectedId(item.id);
    setIsEditMode(true);
    setFormTitle(item.title || '');
    setFormDate(item.event_date || new Date().toISOString().split('T')[0]);
    setFormTime(item.event_time || '08:00');
    setFormLocation(item.location || '');
    setFormSpeaker(item.speaker || '');
    setFormDescription(item.description || '');
    setShowModal(true);
  };

  const executeDelete = async () => {
    const { id } = deleteConfirm;
    setDeleteConfirm({ show: false, id: null });
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      showToast('Agenda acara berhasil dihapus.', 'success');
      await loadData();
    } catch (err) {
      showToast(`Gagal hapus: ${err.message}`, 'error');
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('08:00');
    setFormLocation('');
    setFormSpeaker('');
    setFormDescription('');
    setShowModal(false);
  };

  const filteredEvents = events.filter(item => {
    const matchSearch = 
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.speaker || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleExportExcelManual = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Tanggal,Jam,Nama Acara,Lokasi,Penceramah/Pengisi,Keterangan\n";
      
      filteredEvents.forEach(e => {
        const row = `"${e.event_date}","${e.event_time}","${e.title}","${e.location}","${e.speaker}","${e.description}"\n`;
        csvContent += row;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `JADWAL_ACARA_HAUL_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Berhasil mengunduh Jadwal Acara ke Excel/CSV.', 'success');
    } catch (err) {
      showToast('Gagal mengekspor data: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-xs font-mono theme-text-primary">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span>{t.syncData}</span>
      </div>
    );
  }

  return (
    <div id="root-acara-container" className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs theme-text-primary relative">
      
      {/* 🔔 FLOATING TOAST NOTIFICATION MODERN */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] print:hidden animate-in fade-in slide-in-from-top duration-300">
          <div className={`px-4 py-3 rounded-2xl backdrop-blur-xl flex items-center justify-between gap-3 shadow-2xl border-2 ${
            toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200' :
            toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/80 text-rose-200' :
            toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/80 text-amber-200' :
            'bg-slate-900/90 border-slate-700 text-white'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {toast.type === 'warning' && <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
              <span className="font-semibold text-xs leading-snug truncate">{toast.message}</span>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0">
              <X className="w-4 h-4 opacity-80 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}

      {/* 🗑️ MODAL DIALOG KONFIRMASI HAPUS MODERN */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <GlassCard className="max-w-sm w-full text-center space-y-4 p-6 shadow-2xl border theme-border">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm uppercase theme-text-primary">Konfirmasi Hapus Agenda</h3>
            <p className="text-xs theme-text-secondary leading-relaxed">Apakah Anda yakin ingin menghapus agenda acara ini secara permanen?</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="flex-1 py-2.5 bg-black/30 hover:bg-black/50 theme-text-secondary font-bold rounded-xl text-xs border theme-border cursor-pointer">Batal</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs uppercase shadow-lg cursor-pointer">Hapus</button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 🛠️ PRINT STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }

          html, body, main, #root-acara-container {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }

          .print\\:hidden, nav, header, sidebar, button, .lucide {
            display: none !important;
          }

          .hidden.print\\:block {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
          }

          .cetak-wrapper-logo, .cetak-wrapper-logo img {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-page-wrapper {
            background: white !important;
            color: black !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      {/* AREA UTAMA INTERFACE */}
      <div className="print:hidden space-y-4">
        
        {/* HEADER & TOP CONTROLS */}
        <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-amber-400" />
                {t.title}
              </h2>
              {isAdmin ? (
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  ADMIN
                </span>
              ) : (
                <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  PUBLIC
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono mt-0.5 theme-text-tertiary">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-black/30 p-1 border theme-border rounded-xl mr-1">
              <button onClick={() => setLang('id')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${lang === 'id' ? 'bg-[#BFEC25] text-black font-black' : 'theme-text-secondary'}`}>ID 🇮🇩</button>
              <button onClick={() => setLang('jv')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${lang === 'jv' ? 'bg-[#BFEC25] text-black font-black' : 'theme-text-secondary'}`}>JV 🎯</button>
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${lang === 'en' ? 'bg-[#BFEC25] text-black font-black' : 'theme-text-secondary'}`}>EN 🇬🇧</button>
            </div>

            {isAdmin && (
              <button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>{t.btnTambah}</span>
              </button>
            )}
            
            <button onClick={handleExportExcelManual} className="flex-1 sm:flex-initial px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.btnExcel}</span>
            </button>
            <button onClick={() => window.print()} className="flex-1 sm:flex-initial px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              <span>{t.btnCetak}</span>
            </button>
          </div>
        </GlassCard>

        {/* SEARCH BAR */}
        <GlassCard className="p-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none theme-text-primary placeholder:theme-text-tertiary text-xs" 
            />
          </div>
        </GlassCard>

        {/* LIST EVENT CARDS / GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredEvents.map((item, idx) => (
            <GlassCard key={idx} className="p-4 relative group hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                
                {/* Header Card: Tanggal & Waktu */}
                <div className="flex items-center justify-between gap-2 border-b theme-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <CalendarIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-mono font-bold text-xs theme-text-accent">{item.event_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold theme-text-secondary bg-black/20 px-2 py-1 rounded-lg border theme-border">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{item.event_time} WIB</span>
                  </div>
                </div>

                {/* Judul Acara */}
                <h3 className="font-extrabold text-sm theme-text-primary uppercase tracking-wide leading-snug pt-1 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.title}</span>
                </h3>

                {/* Info Lokasi & Penceramah */}
                <div className="space-y-1.5 pt-1 text-xs">
                  {item.location && (
                    <div className="flex items-center gap-2 theme-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                  {item.speaker && (
                    <div className="flex items-center gap-2 theme-text-secondary font-semibold">
                      <User className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{item.speaker}</span>
                    </div>
                  )}
                  {item.description && (
                    <div className="flex items-start gap-2 theme-text-tertiary pt-1 italic text-[11px] leading-relaxed">
                      <AlignLeft className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{item.description}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Bar Admin */}
              {isAdmin && (
                <div className="pt-2 border-t theme-border flex items-center justify-end gap-2 font-mono">
                  <button 
                    onClick={() => triggerEdit(item)} 
                    className="px-2.5 py-1 text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({ show: true, id: item.id })} 
                    className="px-2.5 py-1 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              )}
            </GlassCard>
          ))}

          {filteredEvents.length === 0 && (
            <div className="col-span-1 md:col-span-2 p-8 text-center theme-text-tertiary font-mono border theme-border rounded-2xl bg-black/20">
              <CalendarDays className="w-10 h-10 mx-auto opacity-40 mb-2" />
              <p>{t.noData}</p>
            </div>
          )}
        </div>
      </div>

      {/* REGISTRASI MODAL INPUT ACARA */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
          <GlassCard className="p-6 w-full max-w-md space-y-4 shadow-2xl border theme-border">
            <h3 className="text-sm font-black uppercase tracking-wider theme-text-accent flex items-center gap-2">
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
              <span>{isEditMode ? 'Ubah Agenda Acara' : 'Registrasi Agenda Acara Baru'}</span>
            </h3>
            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Nama Agenda Acara</label>
                <input 
                  type="text" 
                  placeholder="Misal: Pembacaan Yasin & Tahlil" 
                  required 
                  value={formTitle} 
                  onChange={e => setFormTitle(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none theme-text-primary text-xs font-bold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Tanggal</label>
                  <input 
                    type="date" 
                    required 
                    value={formDate} 
                    onChange={e => setFormDate(e.target.value)} 
                    className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none text-center font-mono theme-text-primary text-xs" 
                  />
                </div>
                <div>
                  <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Waktu / Jam (WIB)</label>
                  <input 
                    type="time" 
                    required 
                    value={formTime} 
                    onChange={e => setFormTime(e.target.value)} 
                    className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none text-center font-mono theme-text-primary text-xs" 
                  />
                </div>
              </div>

              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Lokasi / Tempat Acara</label>
                <input 
                  type="text" 
                  placeholder="Misal: Panggung Utama Maqbaroh" 
                  value={formLocation} 
                  onChange={e => setFormLocation(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none theme-text-primary text-xs" 
                />
              </div>

              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Penceramah / Pengisi Acara</label>
                <input 
                  type="text" 
                  placeholder="Misal: KH. Hasanuddin" 
                  value={formSpeaker} 
                  onChange={e => setFormSpeaker(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none theme-text-primary text-xs" 
                />
              </div>

              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Keterangan Tambahan</label>
                <textarea 
                  rows={2} 
                  placeholder="Catatan tambahan (Opsional)" 
                  value={formDescription} 
                  onChange={e => setFormDescription(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none theme-text-primary text-xs resize-none" 
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 bg-black/30 border theme-border theme-text-secondary font-bold rounded-xl text-xs cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase rounded-xl shadow-lg text-xs cursor-pointer">Simpan Agenda</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* 🖨️ AREA CETAK JADWAL ACARA */}
      <div className="hidden print:block bg-white text-black p-0 font-serif text-[11px] leading-relaxed w-full">
        <div className="print-page-wrapper">
          
          <div className="flex items-center justify-between border-b-4 border-double border-black pb-3 mb-4">
            <div className="cetak-wrapper-logo w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <img 
                src={`${supabaseUrl}/storage/v1/object/public/logos/logo_system.png`}
                alt="Logo Resmi" 
                className="w-16 h-16 object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg font-bold uppercase font-sans tracking-wide leading-tight">{metaOrg.name}</h1>
              <p className="text-[9px] font-sans italic text-gray-700 mt-0.5">{metaOrg.address}</p>
            </div>
            <div className="w-16 h-16 flex-shrink-0"></div>
          </div>
          
          <div className="text-center mb-5">
            <h2 className="text-sm font-bold uppercase underline tracking-widest font-sans">{t.lpjTitle}</h2>
            <p className="text-[9px] text-gray-600 mt-0.5">{t.lpjPeriod} {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : lang === 'jv' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <table className="w-full border-collapse border-2 border-black text-[10px] mb-6 font-sans">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-black uppercase text-[9px] tracking-wider text-center font-bold">
                <th className="border-r border-black py-2 px-2 w-28">{t.thDate}</th>
                <th className="border-r border-black py-2 px-2">{t.thTitle}</th>
                <th className="border-r border-black py-2 px-2 w-36">{t.thLocation}</th>
                <th className="py-2 px-2 w-40">{t.thSpeaker}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {filteredEvents.map((item, idx) => (
                <tr key={idx} className="border-b border-black">
                  <td className="border-r border-black py-2 px-2 text-center font-mono font-semibold">
                    {item.event_date}<br />
                    <span className="text-[9px] text-gray-700">{item.event_time} WIB</span>
                  </td>
                  <td className="border-r border-black py-2 px-2 uppercase font-bold text-gray-900">
                    {item.title}
                    {item.description && <p className="text-[8px] font-normal normal-case italic text-gray-600 mt-0.5">{item.description}</p>}
                  </td>
                  <td className="border-r border-black py-2 px-2">{item.location || '-'}</td>
                  <td className="py-2 px-2 font-medium">{item.speaker || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 break-inside-avoid">
            <p className="text-right text-[10px] text-gray-800 italic mb-8 font-sans">
              {t.city}, {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : lang === 'jv' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="grid grid-cols-2 gap-8 text-center text-[10px] font-sans">
              <div>
                <p className="font-bold uppercase tracking-wider mb-14 text-gray-800">{t.signKnow}<br />{t.signChair}</p>
                <p className="font-bold underline uppercase text-black">{metaOrg.ketua}</p>
                <p className="text-[8px] text-gray-600 font-medium mt-0.5">{t.signGroup}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider mb-14 text-gray-800">{t.signMade}<br />{t.signSecretary}</p>
                <p className="font-bold underline uppercase text-black">{metaOrg.sekretaris}</p>
                <p className="text-[8px] text-gray-600 font-medium mt-0.5">{t.signGroup}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
