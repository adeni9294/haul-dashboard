'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, masuk: 0, keluar: 0 });
  const [progress, setProgress] = useState({ percent: 0, current: 0, target: 15300000 });
  const [rincianMasuk, setRincianMasuk] = useState([]);
  const [rincianKeluar, setRincianKeluar] = useState([]);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      // 1. Ambil Data Pengaturan & Target Plafon dari Database
      let targetDana = 15300000; // Default fallback
      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (settingsData && settingsData.length > 0) {
        setAnnouncement(settingsData[0].announcement || settingsData[0].banner_text || '');
        
        // Membaca target dari target_notes atau target_amount jika ada
        const dbTarget = settingsData[0].target_notes || settingsData[0].target_amount;
        if (dbTarget) {
          const parsingTarget = parseInt(dbTarget);
          if (!isNaN(parsingTarget) && parsingTarget > 0) {
            targetDana = parsingTarget;
          }
        }
      }

      // 2. Ambil Data Transaksi
      const { data: trans, error } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
      
      if (!error && trans) {
        let calcMasuk = 0;
        let calcKeluar = 0;
        const listMasuk = [];
        const listKeluar = [];

        trans.forEach((item) => {
          const nominal = parseFloat(item.amount || item.nominal) || 0;
          
          // Ambil nilai type / jenis / category_type dan ubah ke huruf kecil semua agar aman
          const rawType = (item.type || item.jenis || item.category_type || '').toString().toLowerCase().trim();

          // Cek kecocokan jenis transaksi secara fleksibel
          if (rawType === 'masuk' || rawType === 'pemasukan' || rawType === 'income') {
            calcMasuk += nominal;
            listMasuk.push(item);
          } else if (rawType === 'keluar' || rawType === 'pengeluaran' || rawType === 'expense') {
            calcKeluar += nominal;
            listKeluar.push(item);
          } else {
            // Fallback cadangan: Jika tidak terdeteksi tapi nominal positif masuk ke "masuk"
            if (nominal >= 0) {
              calcMasuk += nominal;
              listMasuk.push(item);
            } else {
              calcKeluar += Math.abs(nominal);
              listKeluar.push(item);
            }
          }
        });

        const sisaKas = calcMasuk - calcKeluar;
        setTotals({ total: sisaKas, masuk: calcMasuk, keluar: calcKeluar });
        setRincianMasuk(listMasuk.slice(0, 5));
        setRincianKeluar(listKeluar.slice(0, 5));

        // Kalkulasi Persentase Target Progres Dana Masuk
        const hitungPersen = Math.min(Math.round((calcMasuk / targetDana) * 100), 100);
        setProgress({ percent: hitungPersen, current: calcMasuk, target: targetDana });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 font-mono text-xs text-slate-400">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Menyelaraskan Data Transaksi Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. TEXT BANNER */}
      {announcement && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl overflow-hidden relative flex items-center">
          <div className="animate-marquee whitespace-nowrap text-amber-400 font-medium text-xs tracking-wide">
            📢 {announcement}
          </div>
        </div>
      )}

      {/* 2. KARTU UTAMA TOTAL SISA KAS */}
      <div className="p-6 md:p-8 bg-slate-900 border border-slate-800/80 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Total Sisa Kas Haul</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1">
            {formatRupiah(totals.total)}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
          {/* Sub Box Masuk */}
          <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Total Dana Masuk</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{formatRupiah(totals.masuk)}</p>
            </div>
          </div>

          {/* Sub Box Keluar */}
          <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Total Dana Keluar</p>
              <p className="text-base font-bold text-rose-400 mt-0.5">{formatRupiah(totals.keluar)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROGRES TARGET PLAFON */}
      <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-lg space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-sm">🎯</span>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Progres Capaian Target</h3>
          </div>
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-mono text-xs font-black rounded-md border border-amber-500/20">
            {progress.percent}%
          </span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 p-0.5">
          <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000" style={{ width: `${progress.percent}%` }}></div>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
          <p>Terkumpul: <span className="text-slate-200 font-bold">{formatRupiah(progress.current)}</span></p>
          <p>Target Plafon: <span className="text-slate-200 font-bold">{formatRupiah(progress.target)}</span></p>
        </div>
      </div>

      {/* 4. SEKSYEN RINCIAN BARU */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-sm">🕒</span>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Rincian Alur Transaksi Terakhir</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KAS MASUK */}
          <div className="p-5 bg-slate-900 border-l-4 border-l-emerald-500 border-y border-r border-slate-800/80 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">🟢 KAS MASUK</span>
              <span className="text-[10px] text-slate-500 font-mono">5 Record Terbaru</span>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-slate-800/30 pr-1">
              {rincianMasuk.length > 0 ? rincianMasuk.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-start pt-2 first:pt-0">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="text-slate-200 font-medium text-xs truncate">{item.description || item.keterangan || item.notes || 'Transaksi Masuk'}</p>
                    <p className="text-[9px] font-mono text-slate-500">{item.transaction_date || item.tanggal || '-'}</p>
                  </div>
                  <p className="text-xs font-bold font-mono text-emerald-400 shrink-0">+{formatRupiah(item.amount || item.nominal)}</p>
                </div>
              )) : (
                <p className="text-[10px] text-slate-600 font-mono py-4 text-center">Belum ada data iuran masuk.</p>
              )}
            </div>
          </div>

          {/* KAS KELUAR */}
          <div className="p-5 bg-slate-900 border-l-4 border-l-rose-500 border-y border-r border-slate-800/80 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
              <span className="text-xs font-black uppercase text-rose-400 tracking-wider">🔴 KAS KELUAR</span>
              <span className="text-[10px] text-slate-500 font-mono">5 Record Terbaru</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-slate-800/30 pr-1">
              {rincianKeluar.length > 0 ? rincianKeluar.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-start pt-2 first:pt-0">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="text-slate-200 font-medium text-xs truncate">{item.description || item.keterangan || item.notes || 'Transaksi Keluar'}</p>
                    <p className="text-[9px] font-mono text-slate-500">{item.transaction_date || item.tanggal || '-'}</p>
                  </div>
                  <p className="text-xs font-bold font-mono text-rose-400 shrink-0">-{formatRupiah(item.amount || item.nominal)}</p>
                </div>
              )) : (
                <p className="text-[10px] text-slate-600 font-mono py-4 text-center">Belum ada catatan belanja keluar.</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
