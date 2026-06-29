'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowUpCircle, ArrowDownCircle, Bell, PieChart, Target } from 'lucide-react';

// Inisialisasi Supabase aman build Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// DEFINISI UTUH GAYA WARNA TIAP TEMA (MENGGANTIKAN SLATE-900 BASSIS)
const THEME_STYLES = {
  'emerald-cyber': {
    bg: 'bg-zinc-950',
    card: 'bg-zinc-900/80 border-zinc-800 text-emerald-100',
    textMuted: 'text-zinc-400',
    accentText: 'text-emerald-400',
    bar: 'from-emerald-500 to-teal-400'
  },
  'velvet-rose': {
    bg: 'bg-neutral-950',
    card: 'bg-purple-950/30 border-purple-900/40 text-rose-100',
    textMuted: 'text-purple-300/60',
    accentText: 'text-rose-400',
    bar: 'from-rose-500 to-fuchsia-400'
  },
  'neon-sunset': {
    bg: 'bg-stone-950',
    card: 'bg-stone-900/80 border-stone-800 text-orange-100',
    textMuted: 'text-stone-400',
    accentText: 'text-orange-400',
    bar: 'from-orange-500 to-amber-400'
  },
  'amber-gold': {
    bg: 'bg-gray-950',
    card: 'bg-gray-900/80 border-gray-800 text-amber-100',
    textMuted: 'text-gray-400',
    accentText: 'text-amber-400',
    bar: 'from-amber-500 to-yellow-400'
  },
  'default': {
    bg: 'bg-slate-950',
    card: 'bg-slate-900/90 border-slate-800 text-slate-100',
    textMuted: 'text-slate-400',
    accentText: 'text-amber-500',
    bar: 'from-amber-500 to-yellow-400'
  }
};

export default function Dashboard() {
  const [stats, setStats] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ in: {}, out: {} });
  const [totalAnggaran, setTotalAnggaran] = useState(0);
  const [progressPersen, setProgressPersen] = useState(0);
  
  const [bannerText, setBannerText] = useState('Selamat Datang, Panitia Haul');
  const [currentThemeKey, setCurrentThemeKey] = useState('default');

  useEffect(() => {
    if (supabase) loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const { data: trans } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
      const { data: budgetsData } = await supabase.from('budgets').select('*');
      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      
      if (settingsData && settingsData.length > 0) {
        const config = settingsData[0];
        
        // Membaca input Teks Banner Utama Anda ("wewara")
        const teksDariDb = config.banner_text || config.banner_info || config.welcome_text || config.teks_banner;
        if (teksDariDb) setBannerText(teksDariDb);

        // Membaca kode tema aktif dari database ("velvet-rose")
        if (config.theme && THEME_STYLES[config.theme]) {
          setCurrentThemeKey(config.theme);
        }
      }

      if (!trans) return;

      let m = 0, k = 0;
      let catIn = {}, catOut = {};
      
      trans.forEach(t => {
        const isPemasukan = t.type === 'in' || (t.type && t.type.toLowerCase().includes('pemasukan'));
        if (isPemasukan) {
          m += Number(t.amount || 0);
          catIn[t.category] = (catIn[t.category] || 0) + Number(t.amount || 0);
        } else {
          k += Number(t.amount || 0);
          catOut[t.category] = (catOut[t.category] || 0) + Number(t.amount || 0);
        }
      });
      
      let totalTarget = 0;
      if (budgetsData && budgetsData.length > 0) {
        totalTarget = budgetsData.reduce((sum, b) => sum + Number(b.planned_amount || 0), 0);
      }

      let persen = 0;
      if (totalTarget > 0) {
        persen = Math.round((m / totalTarget) * 100);
      }
      
      setStats({ masuk: m, keluar: k, saldo: m - k });
      setTransactions(trans.slice(0, 5)); 
      setCategories({ in: catIn, out: catOut });
      setTotalAnggaran(totalTarget);
      setProgressPersen(persen);
    } catch (err) {
      console.error(err);
    }
  }

  // Pilih palet warna aktif berdasarkan respons database
  const style = THEME_STYLES[currentThemeKey] || THEME_STYLES['default'];

  return (
    // PERBAIKAN UTAMA: Mengganti semua warna keras menjadi kelas dinamis dari objek tema `style`
    <div className={`space-y-6 min-h-screen transition-colors duration-300`}>
      
      {/* 1. HEADER BANNER */}
      <header className="flex justify-between items-start pt-2">
        <div className="min-w-0 flex-1">
          <p className={`${style.textMuted} text-[11px] uppercase tracking-wider`}>Informasi Beranda</p>
          <h2 className={`text-base font-black tracking-wide uppercase mt-0.5 whitespace-pre-wrap leading-snug ${style.accentText}`}>
            {bannerText}
          </h2>
        </div>
        <Bell className={`${style.accentText} shrink-0 mt-1 ml-4`} size={20} />
      </header>

      {/* 2. KARTU SALDO (Sudah Menggunakan Warna Tema) */}
      <div className={`p-6 ${style.card} border rounded-3xl shadow-2xl transition-all`}>
        <p className={`${style.textMuted} text-sm`}>Total Kas Haul</p>
        <h1 className="text-3xl font-black mt-1">
          {stats.saldo < 0 ? `- Rp ${Math.abs(stats.saldo).toLocaleString('id-ID')}` : `Rp ${stats.saldo.toLocaleString('id-ID')}`}
        </h1>
        <div className="mt-6 flex gap-4 border-t border-white/5 pt-4">
          <div className="flex-1 flex items-center gap-2">
            <ArrowUpCircle className="text-emerald-400" size={18} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Masuk</p>
              <p className="font-bold text-xs">Rp {stats.masuk.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <ArrowDownCircle className="text-rose-400" size={18} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Keluar</p>
              <p className="font-bold text-xs">Rp {stats.keluar.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROGRES TARGET ANGGARAN (Sudah Menggunakan Warna Tema) */}
      <div className={`p-4 ${style.card} border rounded-2xl transition-all`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Target size={16} className={style.accentText} />
            <p className="text-xs font-bold opacity-90">Progres Target</p>
          </div>
          <p className={`text-xs font-mono ${style.accentText} font-bold`}>{progressPersen}%</p>
        </div>
        
        <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5">
          <div 
            className={`bg-gradient-to-r ${style.bar} h-full transition-all duration-300`}
            style={{ width: `${Math.min(progressPersen, 100)}%` }}
          ></div>
        </div>
        
        <div className={`flex justify-between items-center mt-2 text-[10px] ${style.textMuted}`}>
          <p>Terkumpul: <span className="text-emerald-400 font-bold">Rp {stats.masuk.toLocaleString('id-ID')}</span></p>
          <p>Target Plafon: <span className="font-bold">Rp {totalAnggaran.toLocaleString('id-ID')}</span></p>
        </div>
      </div>

      {/* 4. RINCIAN KATEGORI (Sudah Menggunakan Warna Tema) */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <PieChart size={16} className={style.accentText}/> Rincian
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 ${style.card} border rounded-2xl transition-all`}>
            <p className="text-[10px] text-emerald-400 mb-2 uppercase font-bold">Masuk</p>
            {Object.entries(categories.in).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] py-1 border-b border-white/5 last:border-0 opacity-90">
                <span>{k}</span>
                <span>Rp {v.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
          <div className={`p-4 ${style.card} border rounded-2xl transition-all`}>
            <p className="text-[10px] text-rose-400 mb-2 uppercase font-bold">Keluar</p>
            {Object.entries(categories.out).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] py-1 border-b border-white/5 last:border-0 opacity-90">
                <span>{k}</span>
                <span>Rp {v.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. AKTIVITAS TERAKHIR (Sudah Menggunakan Warna Tema) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold">Aktivitas Terakhir</h2>
        {transactions.map((t, i) => {
          const isPemasukan = t.type === 'in' || (t.type && t.type.toLowerCase().includes('pemasukan'));
          return (
            <div key={i} className={`flex justify-between items-center p-3 ${style.card} border rounded-xl transition-all`}>
              <div>
                <p className="text-xs font-bold opacity-90">{t.note || t.category}</p>
                <p className="text-[9px] text-slate-500">
                  {t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('id-ID') : ''}
                </p>
              </div>
              <p className={`text-xs font-bold ${isPemasukan ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPemasukan ? '+' : '-'} Rp {(t.amount || 0).toLocaleString('id-ID')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
