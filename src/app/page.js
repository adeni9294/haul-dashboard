'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const THEME_STYLES = {
  'emerald-cyber': { card: 'bg-zinc-900 border-zinc-800 text-emerald-50 shadow-2xl', innerBg: 'bg-zinc-950 border border-zinc-850', textMuted: 'text-zinc-500', accentText: 'text-emerald-400', progressBg: 'from-emerald-600 to-emerald-400' },
  'velvet-rose': { card: 'bg-neutral-900 border-purple-900/60 text-rose-50 shadow-2xl', innerBg: 'bg-purple-950 border border-purple-900/40', textMuted: 'text-purple-300', accentText: 'text-rose-400', progressBg: 'from-rose-600 to-fuchsia-500' },
  'neon-sunset': { card: 'bg-stone-900 border-stone-800 text-orange-50 shadow-2xl', innerBg: 'bg-stone-950 border border-stone-850', textMuted: 'text-stone-400', accentText: 'text-orange-400', progressBg: 'from-orange-600 to-orange-400' },
  'amber-gold': { card: 'bg-gray-900 border-gray-800 text-amber-50 shadow-2xl', innerBg: 'bg-gray-950 border border-gray-850', textMuted: 'text-gray-400', accentText: 'text-amber-400', progressBg: 'from-amber-600 to-amber-400' },
  'midnight-blue': { card: 'bg-slate-900 border-blue-900 text-blue-50 shadow-2xl', innerBg: 'bg-blue-950 border border-blue-900/40', textMuted: 'text-blue-400', accentText: 'text-blue-400', progressBg: 'from-blue-600 to-cyan-500' },
  'nordic-frost': { card: 'bg-slate-800 border-slate-750 text-slate-50 shadow-2xl', innerBg: 'bg-slate-900 border border-slate-750', textMuted: 'text-slate-400', accentText: 'text-cyan-400', progressBg: 'from-cyan-600 to-teal-400' },
  'default': { card: 'bg-[#12161A] border-[#1E2329] text-slate-100 shadow-2xl', innerBg: 'bg-black/30 border border-slate-800/40', textMuted: 'text-slate-400', accentText: 'text-amber-500', progressBg: 'from-[#BFEC25] to-[#A3CB1B]' }
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 0 });
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);
  const [catSummaryMasuk, setCatSummaryMasuk] = useState([]);
  const [catSummaryKeluar, setCatSummaryKeluar] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => { loadDashboardData(); }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

      // 1. Ambil Pengaturan Banner, Logo, dan Tema Utama
      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (settingsData && settingsData.length > 0) {
        setAnnouncement(settingsData[0].announcement || settingsData[0].banner_text || '');
        if (settingsData[0].logo_url) setLogoUrl(settingsData[0].logo_url);
        if (settingsData[0].theme) setCurrentThemeKey(settingsData[0].theme);
      }

      // 2. Ambil Data Target Anggaran Plafon
      const { data: budgetsData } = await supabase.from('budgets').select('planned_amount');
      let totalPlafonDinamis = 0;
      if (budgetsData) {
        budgetsData.forEach(b => { totalPlafonDinamis += parseFloat(b.planned_amount) || 0; });
      }

      // 3. Ambil Rincian Seluruh Transaksi
      const { data: trans, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (!error && trans) {
        let calcMasuk = 0; let calcKeluar = 0;
        const listMasuk = []; const listKeluar = [];
        const incomeMap = {}; const expenseMap = {};

        trans.forEach((item) => {
          const nominal = parseFloat(item.amount || item.nominal) || 0;
          const rawType = (item.type || item.jenis || item.category_type || '').toString().toLowerCase().trim();
          const catName = (item.category || item.kategori || 'Lain-lain').toString().trim();
          const catNameLower = catName.toLowerCase();

          if (
            rawType === 'masuk' || 
            rawType === 'pemasukan' || 
            rawType === 'income' ||
            catNameLower.includes('masuk') || 
            catNameLower.includes('iuran') || 
            catNameLower.includes('sumbangan') ||
            catNameLower.includes('kas awal')
          ) {
            calcMasuk += nominal;
            listMasuk.push(item);
            incomeMap[catName] = (incomeMap[catName] || 0) + nominal;
          } else {
            calcKeluar += nominal;
            listKeluar.push(item);
            expenseMap[catName] = (expenseMap[catName] || 0) + nominal;
          }
        });

        const parseChart = (map, total) => Object.keys(map).map(key => ({
          label: key, value: map[key], percentage: total > 0 ? parseFloat(((map[key] / total) * 100).toFixed(1)) : 0
        })).sort((a,b) => b.value - a.value);

        setCatSummaryMasuk(parseChart(incomeMap, calcMasuk));
        setCatSummaryKeluar(parseChart(expenseMap, calcKeluar));
        setTotals({ total: calcMasuk - calcKeluar, masuk: calcMasuk, keluar: calcKeluar });
        setRincianMasuk(listMasuk.slice(0, 5));
        setRincianKeluar(listKeluar.slice(0, 5));

        let hitungPersen = 0;
        if (totalPlafonDinamis > 0) {
          hitungPersen = Math.round((calcKeluar / totalPlafonDinamis) * 100);
        }
        setProgress({ percent: hitungPersen, current: calcKeluar, target: totalPlafonDinamis });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  
  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        ⏳ Memuat antarmuka Cirebonan Premium...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-4 sm:px-6 pb-28 -mt-1">
      
      {/* 1. TEXT BANNER INFOMASI */}
      {announcement && (
        <div className="w-full bg-[#BFEC25]/10 border border-[#BFEC25]/20 py-2.5 px-4 rounded-2xl overflow-hidden flex items-center shadow-inner">
          <div className="animate-marquee inline-block text-[#BFEC25] font-bold text-[10px] sm:text-xs tracking-widest uppercase font-mono">
            📢 {announcement}
          </div>
        </div>
      )}

      {/* 2. AREA UTAMA KARTU SALDO & CARD PEMASUKAN/PENGELUARAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* KARTU SALDO UTAMA BERMOTIF MEGA MENDUNG ASLI HIGHT-CONTRAST */}
        <div className="bg-[#BFEC25] text-black p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-between h-52 shadow-xl shadow-[#BFEC25]/20 border border-[#BFEC25]/40 transition-transform duration-300 hover:scale-[1.01]">
          
          {/* HIGH-CONTRAST MEGA MENDUNG PATTERN */}
          <div className="absolute inset-y-0 right-0 w-[60%] opacity-[0.25] pointer-events-none select-none z-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200">
              <g fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {/* Awan Atas */}
                <path d="M120,30 C145,10 175,15 185,35 C195,55 175,75 145,70 C115,65 105,40 120,30 Z" />
                <path d="M130,40 C150,25 170,28 177,42 C184,56 170,70 150,66 C130,62 123,48 130,40 Z" />
                <path d="M140,50 C152,40 162,42 166,50 C170,58 162,66 152,64 C142,62 138,56 140,50 Z" />
                {/* Awan Tengah */}
                <path d="M50,100 C75,80 105,85 115,105 C125,125 105,145 75,140 C45,135 35,110 50,100 Z" />
                <path d="M60,110 C78,95 98,98 105,112 C112,126 98,140 78,136 C58,132 51,118 60,110 Z" />
                {/* Awan Bawah */}
                <path d="M110,120 C135,100 165,105 175,125 C185,145 165,165 135,160 C105,155 95,130 110,120 Z" />
                <path d="M120,130 C140,115 160,118 167,132 C174,146 160,160 140,156 C120,152 113,138 120,130 Z" />
              </g>
            </svg>
          </div>

          <div className="relative z-10">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest opacity-60">KAS UTAMA HAUL</span>
            <p className="text-[11px] font-semibold opacity-70 mt-0.5">Sisa Saldo Kas Bersih</p>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-black tracking-tight leading-none text-black">
              {formatRupiah(totals.total)}
            </h2>
            <div className="flex justify-between items-center mt-5 font-mono text-[10px] tracking-wider opacity-60">
              <span>**** **** **** 2026</span>
              <span className="font-bold uppercase tracking-wide">PANITIA HAUL</span>
            </div>
          </div>
        </div>

        {/* REKAP KOTAK NOMINAL MASUK & KELUAR */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className={`p-5 ${style.card} border rounded-[28px] flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/30`}>
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm shadow-sm">🟢</div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Uang Masuk</p>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl font-['Space_Grotesk']">{formatRupiah(totals.masuk)}</h3>
              <p className="text-[10px] text-emerald-400 font-medium mt-1">✓ {catSummaryMasuk.length} Kategori Kontribusi</p>
            </div>
          </div>

          <div className={`p-5 ${style.card} border rounded-[28px] flex flex-col justify-between transition-all duration-300 hover:border-rose-500/30`}>
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-sm shadow-sm">🔴</div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Uang Belanja</p>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl font-['Space_Grotesk']">{formatRupiah(totals.keluar)}</h3>
              <p className="text-[10px] text-rose-400 font-medium mt-1">⚡ {catSummaryKeluar.length} Pos Alokasi Terpakai</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. PROGRESS TARGET ANGGERAN BAR */}
      <div className={`p-5 ${style.card} border rounded-2xl space-y-3 shadow-xl`}>
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> Progres Capaian Target Plafon Anggaran
          </h3>
          <span className="text-[#BFEC25] font-mono text-xs font-black bg-[#BFEC25]/10 px-2 py-0.5 rounded-md">{progress.percent}%</span>
        </div>
        <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-slate-800/80">
          <div className={`h-full bg-gradient-to-r ${style.progressBg} rounded-full transition-all duration-500`} style={{ width: `${Math.min(progress.percent, 100)}%` }}></div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-0.5">
          <span>Terpakai: <strong className="text-slate-300">{formatRupiah(progress.current)}</strong></span>
          <span>Plafon Target: <strong className="text-slate-300">{formatRupiah(progress.target)}</strong></span>
        </div>
      </div>

      {/* 4. REKAP NOMINAL TOTAL PER KATEGORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-5 ${style.card} border rounded-2xl space-y-3.5 shadow-xl`}>
          <h4 className="text-[10px] font-black text-[#BFEC25] uppercase tracking-widest border-b border-white/5 pb-2">📊 Rekap Kategori Uang Masuk</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryMasuk.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-800/40 last:border-0 last:pb-0">
                <span className="text-slate-300 flex items-center gap-1">🔹 {c.label}</span>
                <span className="font-mono font-bold text-[#BFEC25]">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-5 ${style.card} border rounded-2xl space-y-3.5 shadow-xl`}>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-white/5 pb-2">📊 Rekap Alokasi Anggaran Belanja</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {catSummaryKeluar.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-800/40 last:border-0 last:pb-0">
                <span className="text-slate-300 flex items-center gap-1">🔸 {c.label}</span>
                <span className="font-mono font-bold text-rose-400">{formatRupiah(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. DATA RINCIAN MUTASI TERAKHIR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-5 ${style.card} border-l-4 border-l-[#BFEC25] rounded-2xl space-y-3.5 shadow-xl`}>
          <h5 className="text-[10px] font-black text-[#BFEC25] uppercase tracking-wider">Pemasukan Terakhir (Deposits)</h5>
          <div className="space-y-3">
            {rincianMasuk.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-1">Belum ada mutasi masuk.</p>
            ) : (
              rincianMasuk.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs pb-1 border-b border-slate-800/20 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-100 font-bold truncate">{t.note || t.keterangan || t.description}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <p className="font-mono font-black text-[#BFEC25] shrink-0 ml-3 text-sm">+{formatRupiah(t.amount)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`p-5 ${style.card} border-l-4 border-l-rose-500 rounded-2xl space-y-3.5 shadow-xl`}>
          <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Pengeluaran Terakhir (Withdrawals)</h5>
          <div className="space-y-3">
            {rincianKeluar.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-1">Belum ada mutasi belanja.</p>
            ) : (
              rincianKeluar.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs pb-1 border-b border-slate-800/20 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-100 font-bold truncate">{t.note || t.keterangan || t.description}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t.transaction_date}</p>
                  </div>
                  <p className="font-mono font-black text-rose-400 shrink-0 ml-3 text-sm">-{formatRupiah(t.amount)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. BOTTOM NAV GLASSMORPHISM FLOATING BAR */}
      <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 h-16 rounded-2xl w-full max-w-md flex items-center justify-around px-2 shadow-2xl shadow-black/90">
          
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${activeTab === 'home' ? 'text-[#BFEC25] bg-white/5 shadow-md shadow-black/30' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[8px] font-bold font-mono mt-0.5 tracking-tighter">Home</span>
          </button>

          <button onClick={() => { setActiveTab('stat'); window.location.href = '/stat'; }} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${activeTab === 'stat' ? 'text-[#BFEC25] bg-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span className="text-[8px] font-bold font-mono mt-0.5 tracking-tighter">Stat</span>
          </button>

          <button onClick={() => { setActiveTab('plus'); window.location.href = '/transaksi'; }} className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-black bg-[#BFEC25] hover:bg-[#a3cb1b] shadow-lg shadow-[#BFEC25]/20 transform active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>

          <button onClick={() => { setActiveTab('budget'); window.location.href = '/anggaran'; }} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${activeTab === 'budget' ? 'text-[#BFEC25] bg-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            <span className="text-[8px] font-bold font-mono mt-0.5 tracking-tighter">Budget</span>
          </button>

          <button onClick={() => { setActiveTab('menu'); window.location.href = '/pengaturan'; }} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${activeTab === 'menu' ? 'text-[#BFEC25] bg-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <span className="text-[8px] font-bold font-mono mt-0.5 tracking-tighter">Menu</span>
          </button>

        </div>
      </div>

    </div>
  );
}
