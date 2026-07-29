'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';
import {
  PieChart,
  Plus,
  Edit3,
  Trash2,
  Search,
  FileSpreadsheet,
  Printer,
  Target,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Lock,
  X,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🌐 KAMUS MULTI-BAHASA
const translations = {
  id: {
    title: "Rencana Anggaran & Plafon Biaya",
    subtitle: "● Penetapan Target Belanja, Alokasi Pos & Monitoring Realisasi",
    btnTambah: "Tambah Anggaran",
    btnExcel: "Excel Data",
    btnCetak: "Cetak Anggaran",
    searchPlaceholder: "Cari pos kategori atau uraian...",
    thCat: "Kategori Pos",
    thPlan: "Plafon Target (Rencana)",
    thReal: "Realisasi Belanja",
    thPercent: "% Serapan",
    thAction: "Aksi",
    noData: "Belum ada alokasi anggaran yang ditetapkan.",
    syncData: "Memuat alokasi & kalkulasi anggaran...",
    lpjTitle: "LAPORAN PERENCANAAN ANGGARAN BIAYA HAUL",
    lpjPeriod: "Dicetak pada:",
    totalPlan: "Total Target Plafon Anggaran",
    totalReal: "Total Realisasi Pengeluaran",
    signKnow: "Mengetahui,",
    signChair: "Ketua Panitia",
    signMade: "Dibuat Oleh,",
    signTreasurer: "Bendahara",
    signGroup: "PANITIA HAUL 2026",
    city: "Cirebon",
    selectPeriod: "PERIODE HAUL:",
    statusClosed: "(Tutup Buku)",
    statusActive: "(Aktif)"
  },
  jv: { 
    title: "Rencana Anggaran & Plafon Biaya",
    subtitle: "● Watesan Blonjo, Alokasi Pos & Pengawasan Realisasi",
    btnTambah: "Tambah Anggaran",
    btnExcel: "Pragat Excel",
    btnCetak: "Cetak Anggaran",
    searchPlaceholder: "Goleki kategori utawa uraian...",
    thCat: "Pos Kategori",
    thPlan: "Plafon Rencana",
    thReal: "Realisasi Blonjo",
    thPercent: "% Serapan",
    thAction: "Aksi",
    noData: "Durung ana rencana anggaran.",
    syncData: "Nembe ngebuka kalkulasi anggaran...",
    lpjTitle: "LAPORAN RENCANA ANGGARAN BIAYA HAUL",
    lpjPeriod: "Maca dina:",
    totalPlan: "Total Target Plafon",
    totalReal: "Total Realisasi Blonjo",
    signKnow: "Weruh,",
    signChair: "Ketua Panitia",
    signMade: "Sing Gawe,",
    signTreasurer: "Bendahara",
    signGroup: "PANITIA HAUL 2026",
    city: "Cirebon",
    selectPeriod: "PERIODE HAUL:",
    statusClosed: "(Rampung)",
    statusActive: "(Mlaku)"
  },
  en: {
    title: "Budget Plan & Cost Ceiling",
    subtitle: "● Target Spending, Allocation Category & Realization Monitoring",
    btnTambah: "Add Budget Plan",
    btnExcel: "Export Excel",
    btnCetak: "Print Budget Report",
    searchPlaceholder: "Search category or description...",
    thCat: "Category Pos",
    thPlan: "Planned Ceiling",
    thReal: "Actual Realization",
    thPercent: "% Absorbed",
    thAction: "Action",
    noData: "No budget allocations established yet.",
    syncData: "Loading budget allocations...",
    lpjTitle: "HAUL BUDGET COST PLANNING REPORT",
    lpjPeriod: "Printed as of:",
    totalPlan: "Total Planned Ceiling Target",
    totalReal: "Total Actual Expenditure",
    signKnow: "Approved By,",
    signChair: "Committee Chairman",
    signMade: "Prepared By,",
    signTreasurer: "Committee Treasurer",
    signGroup: "2026 HAUL COMMITTEE",
    city: "Cirebon",
    selectPeriod: "HAUL PERIOD:",
    statusClosed: "(Closed)",
    statusActive: "(Active)"
  }
};

export default function AnggaranPage() {
  const [lang, setLang] = useState('id');
  const t = translations[lang] || translations['id'];

  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // 🔔 Custom Toast State (Top Center)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // 🗑️ State Modal Konfirmasi Hapus
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  const [currentPeriodeObj, setCurrentPeriodeObj] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [metaOrg, setMetaOrg] = useState({ 
    name: 'PANITIA HAUL MAQBAROH BUYUT KEPUH & BUYUT BESUS', 
    address: 'Blok Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon',
    ketua: '....................',
    bendahara: '....................'
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Form State
  const [formCategory, setFormCategory] = useState('');
  const [formPlannedAmount, setFormPlannedAmount] = useState('');
  const [formNote, setFormNote] = useState('');

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
  }, [selectedPeriodeId]);

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
          bendahara: committeeDb.find(c => c.position?.toLowerCase() === 'bendahara')?.name || prev.bendahara
        }));
      }

      // Load Categories
      const { data: catDb } = await supabase.from('category').select('*').order('name', { ascending: true });
      if (catDb && catDb.length > 0) {
        setCategories(catDb);
        if (!formCategory) setFormCategory(catDb[0].name);
      }

      // 🛡️ LOAD BUDGETS & TRANSAKSI DENGAN FALLBACK UNTUK DATA TANPA PERIODE_ID (NULL)
      const { data: budgetDb } = await supabase.from('budgets').select('*');
      const { data: expensesDb } = await supabase.from('transactions').select('*');

      // Filter lokal untuk menangani data anggaran lama yang `periode_id`-nya NULL
      const filteredBudgetDb = (budgetDb || []).filter(b => {
        if (!activePeriodeId) return true;
        return !b.periode_id || b.periode_id === activePeriodeId || b.periode_id === Number(activePeriodeId);
      });

      const filteredExpensesDb = (expensesDb || []).filter(e => {
        if (!activePeriodeId) return true;
        return !e.periode_id || e.periode_id === activePeriodeId || e.periode_id === Number(activePeriodeId);
      });

      // Kalkulasi Realisasi per Kategori
      const mapRealisasi = {};
      if (filteredExpensesDb) {
        filteredExpensesDb.forEach(item => {
          const type = (item.type || '').toLowerCase().trim();
          if (type === 'keluar' || type === 'pengeluaran') {
            const cat = item.category || 'Lain-lain';
            mapRealisasi[cat] = (mapRealisasi[cat] || 0) + Math.abs(parseFloat(item.amount) || 0);
          }
        });
      }

      const budgetMerged = filteredBudgetDb.map(b => {
        const catName = b.category_name || b.category || b.kategori || 'Lain-lain';
        const target = parseFloat(b.planned_amount || b.amount || b.nominal) || 0;
        const real = mapRealisasi[catName] || 0;
        const serapan = target > 0 ? parseFloat(((real / target) * 100).toFixed(1)) : 0;

        return {
          ...b,
          category_name: catName,
          planned_amount: target,
          actual_realized: real,
          percent_absorbed: serapan,
          note: b.note || b.keterangan || ''
        };
      });

      setBudgets(budgetMerged);
    } catch (e) {
      console.error("Gagal load anggaran:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (currentPeriodeObj?.is_closed) {
      showToast('Periode ini telah ditutup buku. Tidak dapat mengubah alokasi.', 'warning');
      return;
    }

    const cleanAmount = parseFloat(formPlannedAmount.toString().replace(/[^0-9.-]/g, '')) || 0;
    if (cleanAmount <= 0) return;

    const payload = {
      category_name: formCategory,
      planned_amount: cleanAmount,
      note: formNote.trim(),
      periode_id: selectedPeriodeId
    };

    try {
      if (isEditMode) {
        await supabase.from('budgets').update(payload).eq('id', selectedId);
        showToast('Plafon anggaran berhasil diperbarui.', 'success');
      } else {
        await supabase.from('budgets').insert([payload]);
        showToast('Plafon anggaran baru berhasil ditambahkan.', 'success');
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan anggaran.', 'error');
    }
  };

  const triggerEdit = (item) => {
    if (currentPeriodeObj?.is_closed) {
      showToast('Periode ini sudah ditutup buku dan bersifat Read-Only!', 'warning');
      return;
    }
    setSelectedId(item.id);
    setIsEditMode(true);
    setFormCategory(item.category_name || (categories.length > 0 ? categories[0].name : ''));
    setFormPlannedAmount(item.planned_amount || '');
    setFormNote(item.note || '');
    setShowModal(true);
  };

  const executeDelete = async () => {
    const { id } = deleteConfirm;
    setDeleteConfirm({ show: false, id: null });
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      showToast('Alokasi anggaran berhasil dihapus.', 'success');
      await loadData();
    } catch (err) {
      showToast(`Gagal hapus: ${err.message}`, 'error');
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormPlannedAmount('');
    setFormNote('');
    if (categories.length > 0) setFormCategory(categories[0].name);
    setShowModal(false);
  };

  const filteredBudgets = budgets.filter(item => {
    const matchSearch = 
      (item.category_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.note || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const grandTotalPlan = filteredBudgets.reduce((acc, curr) => acc + (parseFloat(curr.planned_amount) || 0), 0);
  const grandTotalReal = filteredBudgets.reduce((acc, curr) => acc + (parseFloat(curr.actual_realized) || 0), 0);

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const handleExportExcelManual = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Kategori,Plafon Target,Realisasi Belanja,Persentase Serapan,Catatan\n";
      
      filteredBudgets.forEach(b => {
        const row = `"${b.category_name}",${b.planned_amount},${b.actual_realized},"${b.percent_absorbed}%","${b.note || ''}"\n`;
        csvContent += row;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `RENCANA_ANGGARAN_HAUL_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Berhasil mengunduh Rencana Anggaran ke Excel/CSV.', 'success');
    } catch (err) {
      showToast('Gagal mengekspor data: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-xs font-mono theme-text-primary">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <span>{t.syncData}</span>
      </div>
    );
  }

  return (
    <div id="root-anggaran-container" className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs theme-text-primary relative">
      
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
              {toast.type === 'info' && <PieChart className="w-5 h-5 text-cyan-400 shrink-0" />}
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
            <h3 className="font-bold text-sm uppercase theme-text-primary">Konfirmasi Hapus Anggaran</h3>
            <p className="text-xs theme-text-secondary leading-relaxed">Apakah Anda yakin ingin menghapus pos alokasi anggaran ini secara permanen?</p>
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

          html, body, main, #root-anggaran-container {
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
                <PieChart className="w-4 h-4 text-purple-400" />
                {t.title}
              </h2>
              {isAdmin ? (
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  ADMIN
                </span>
              ) : (
                <span className="bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  PUBLIC
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono mt-0.5 theme-text-tertiary">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {periodeList.length > 0 && (
              <div className="flex items-center bg-black/30 p-1 border theme-border rounded-xl mr-1">
                <span className="text-[9px] font-mono font-bold theme-text-tertiary px-2 uppercase">{t.selectPeriod}</span>
                <select
                  value={selectedPeriodeId || ''}
                  onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
                  className="bg-black/40 border theme-border text-[10px] theme-text-accent rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
                >
                  {periodeList.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.nama_periode} {p.is_closed ? t.statusClosed : t.statusActive}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex bg-black/30 p-1 border theme-border rounded-xl mr-1">
              <button onClick={() => setLang('id')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${lang === 'id' ? 'bg-[#BFEC25] text-black font-black' : 'theme-text-secondary'}`}>ID 🇮🇩</button>
              <button onClick={() => setLang('jv')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${lang === 'jv' ? 'bg-[#BFEC25] text-black font-black' : 'theme-text-secondary'}`}>JV 🎯</button>
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${lang === 'en' ? 'bg-[#BFEC25] text-black font-black' : 'theme-text-secondary'}`}>EN 🇬🇧</button>
            </div>

            {isAdmin && !currentPeriodeObj?.is_closed && (
              <button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-initial px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>{t.btnTambah}</span>
              </button>
            )}
            
            <button onClick={handleExportExcelManual} className="flex-1 sm:flex-initial px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.btnExcel}</span>
            </button>
            <button onClick={() => window.print()} className="flex-1 sm:flex-initial px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              <span>{t.btnCetak}</span>
            </button>
          </div>
        </GlassCard>

        {currentPeriodeObj?.is_closed && (
          <GlassCard className="p-3 border-amber-500/40 flex items-center justify-between text-amber-300 font-mono text-xs">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku pada {currentPeriodeObj.tanggal_selesai}. Data bersifat Read-Only.</span>
            </span>
            <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
          </GlassCard>
        )}

        {/* REKAP CARD BANYAK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <GlassCard className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-mono theme-text-tertiary uppercase flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-purple-400" /> Total Plafon Anggaran Target
              </p>
              <h3 className="text-lg font-black font-mono theme-text-accent">{formatRupiah(grandTotalPlan)}</h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Target className="w-6 h-6" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-mono theme-text-tertiary uppercase flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-rose-400" /> Total Realisasi Belanja Operasional
              </p>
              <h3 className="text-lg font-black font-mono text-rose-300">{formatRupiah(grandTotalReal)}</h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </GlassCard>
        </div>

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

        {/* TABEL ANGGARAN */}
        <GlassCard className="p-0 overflow-x-auto max-h-[500px] overflow-y-auto shadow-xl relative scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[620px] sm:min-w-full">
            <thead>
              <tr className="bg-black/40 theme-text-secondary border-b theme-border font-mono uppercase text-[9px] tracking-wider sticky top-0 z-20 backdrop-blur-md">
                <th className="p-3">{t.thCat}</th>
                <th className="p-3 text-right w-36">{t.thPlan}</th>
                <th className="p-3 text-right w-36">{t.thReal}</th>
                <th className="p-3 text-center w-40">{t.thPercent}</th>
                {isAdmin && <th className="p-3 text-center w-28">{t.thAction}</th>}
              </tr>
            </thead>
            <tbody className="divide-y theme-border theme-text-primary">
              {filteredBudgets.map((bItem, idx) => {
                const percent = bItem.percent_absorbed;
                let colorClass = 'bg-emerald-500';
                if (percent > 100) colorClass = 'bg-rose-500';
                else if (percent > 85) colorClass = 'bg-amber-500';
                else if (percent > 50) colorClass = 'bg-cyan-500';

                return (
                  <tr key={idx} className="hover:bg-black/20 transition-all">
                    <td className="p-3 font-semibold uppercase text-xs">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{bItem.category_name}</span>
                      </div>
                      {bItem.note && <p className="text-[10px] font-normal normal-case theme-text-tertiary mt-0.5 italic">{bItem.note}</p>}
                    </td>
                    <td className="p-3 text-right font-mono font-bold theme-text-accent text-xs">
                      {formatRupiah(bItem.planned_amount)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-300 text-xs">
                      {formatRupiah(bItem.actual_realized)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold px-1">
                          <span className={percent > 100 ? 'text-rose-400 font-black' : 'theme-text-secondary'}>{percent}%</span>
                          <span className="text-[9px] opacity-70 theme-text-tertiary">
                            {percent > 100 ? 'Melebihi' : percent > 85 ? 'Hampir Habis' : 'Aman'}
                          </span>
                        </div>
                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border theme-border">
                          <div className={`h-full ${colorClass} transition-all duration-500 rounded-full`} style={{ width: `${Math.min(percent, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-center space-x-2 font-mono whitespace-nowrap">
                        {currentPeriodeObj?.is_closed ? (
                          <span className="theme-text-accent italic text-[10px] flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Terkunci
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" onClick={() => triggerEdit(bItem)} className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors cursor-pointer" title="Edit">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => setDeleteConfirm({ show: true, id: bItem.id })} className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredBudgets.length === 0 && (
                <tr><td colSpan={isAdmin ? 5 : 4} className="p-6 text-center theme-text-tertiary font-mono">{t.noData}</td></tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>

      {/* REGISTRASI MODAL INPUT ANGGARAN */}
      {showModal && isAdmin && !currentPeriodeObj?.is_closed && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
          <GlassCard className="p-6 w-full max-w-md space-y-4 shadow-2xl border theme-border">
            <h3 className="text-sm font-black uppercase tracking-wider theme-text-accent flex items-center gap-2">
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
              <span>{isEditMode ? 'Ubah Plafon Anggaran' : 'Tetapkan Plafon Anggaran Baru'}</span>
            </h3>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Kategori Pos Anggaran</label>
                <select 
                  required 
                  value={formCategory} 
                  onChange={e => setFormCategory(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none theme-text-primary cursor-pointer text-xs font-bold"
                >
                  {categories.map((c, i) => <option key={i} value={c.name} className="bg-slate-900 text-white">{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Nominal Target Plafon (Rupiah)</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 5000000" 
                  required 
                  value={formPlannedAmount} 
                  onChange={e => setFormPlannedAmount(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none font-mono text-right font-bold theme-text-accent text-sm" 
                />
              </div>

              <div>
                <label className="block theme-text-secondary mb-1 font-semibold text-[11px]">Catatan Operasional (Opsional)</label>
                <input 
                  type="text" 
                  placeholder="Misal: Alokasi Sound System & Terop" 
                  value={formNote} 
                  onChange={e => setFormNote(e.target.value)} 
                  className="w-full px-3 py-2 bg-black/30 border theme-border rounded-xl focus:outline-none theme-text-primary text-xs" 
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 bg-black/30 border theme-border theme-text-secondary font-bold rounded-xl text-xs cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl shadow-lg text-xs cursor-pointer">Simpan Plafon</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* 🖨️ AREA CETAK ANGGARAN */}
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
                <th className="border-r border-black py-2 px-2 text-left">{t.thCat}</th>
                <th className="border-r border-black py-2 px-2 text-right w-36">{t.thPlan}</th>
                <th className="border-r border-black py-2 px-2 text-right w-36">{t.thReal}</th>
                <th className="py-2 px-2 text-center w-24">{t.thPercent}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {filteredBudgets.map((bItem, idx) => (
                <tr key={idx} className="border-b border-black">
                  <td className="border-r border-black py-2 px-2 uppercase font-bold text-gray-900">
                    {bItem.category_name}
                    {bItem.note && <p className="text-[8px] font-normal normal-case italic text-gray-600 mt-0.5">{bItem.note}</p>}
                  </td>
                  <td className="border-r border-black py-2 px-2 text-right font-mono font-bold">{formatRupiah(bItem.planned_amount)}</td>
                  <td className="border-r border-black py-2 px-2 text-right font-mono font-bold text-rose-900">{formatRupiah(bItem.actual_realized)}</td>
                  <td className="py-2 px-2 text-center font-mono font-bold">{bItem.percent_absorbed}%</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold font-mono text-[11px] border-t-2 border-black">
                <td className="border-r border-black py-2 px-2 text-left uppercase font-sans">TOTAL KESELURUHAN</td>
                <td className="border-r border-black py-2 px-2 text-right text-purple-900">{formatRupiah(grandTotalPlan)}</td>
                <td className="border-r border-black py-2 px-2 text-right text-rose-900">{formatRupiah(grandTotalReal)}</td>
                <td className="py-2 px-2 text-center">
                  {grandTotalPlan > 0 ? ((grandTotalReal / grandTotalPlan) * 100).toFixed(1) : 0}%
                </td>
              </tr>
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
                <p className="font-bold uppercase tracking-wider mb-14 text-gray-800">{t.signMade}<br />{t.signTreasurer}</p>
                <p className="font-bold underline uppercase text-black">{metaOrg.bendahara}</p>
                <p className="text-[8px] text-gray-600 font-medium mt-0.5">{t.signGroup}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
