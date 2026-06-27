'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TransaksiPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // Membaca kategori dinamis

  // State Input Form Transaksi
  const [type, setType] = useState('pemasukan');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  // State Pilihan Format Dokumen LPJ
  const [exportFormat, setExportFormat] = useState('excel');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }

    async function loadTransaksiDanKategori() {
      try {
        if (!supabaseUrl || !supabaseKey) return;

        // 1. Ambil data transaksi
        const { data: transData } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        if (transData) setTransactions(transData);

        // 2. Ambil data kategori dinamis dari database hasil input Pengaturan
        const { data: catData } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });
        
        if (catData && catData.length > 0) {
          setCategories(catData);
          setCategory(catData[0].name); // Set default value form
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTransaksiDanKategori();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin || submitting || !category) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ type, category, amount: Number(amount), note }])
        .select();

      if (error) throw error;
      alert('Transaksi kas berhasil dicatat!');
      if (data) setTransactions([data[0], ...transactions]);
      setAmount('');
      setNote('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ENGINE PROSES CETAK MULTI-FORMAT (EXCEL, CSV, PDF)
  const handleCetakLPJ = () => {
    if (transactions.length === 0) {
      alert('Belum ada data transaksi yang bisa dicetak!');
      return;
    }

    let totalMasuk = 0;
    let totalKeluar = 0;
    
    // 1. Kalkulasi Akumulasi Dana
    transactions.forEach(t => {
      const nom = Number(t.amount || 0);
      if (String(t.type).toLowerCase() === 'pemasukan') totalMasuk += nom;
      else totalKeluar += nom;
    });

    // --- PROSES EXCEL / CSV ---
    if (exportFormat === 'excel' || exportFormat === 'csv') {
      const headers = ['No', 'Tanggal', 'Kategori Pos Kas', 'Jenis', 'Nominal (Rp)', 'Keterangan Catatan'];
      const rows = transactions.map((item, idx) => [
        idx + 1,
        item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-',
        `"${item.category || ''}"`,
        item.type || '',
        item.amount || 0,
        `"${item.note || ''}"`
      ]);

      rows.push([]);
      rows.push(['', '', '', 'TOTAL PEMASUKAN', totalMasuk]);
      rows.push(['', '', '', 'TOTAL PENGELUARAN', totalKeluar]);
      rows.push(['', '', '', 'SISA SALDO AKHIR', totalMasuk - totalKeluar]);

      // Untuk Excel (.xls) kita pakai format Tab-Separated, sedangkan CSV menggunakan koma biasa
      const separator = exportFormat === 'excel' ? '\t' : ',';
      const fileExtension = exportFormat === 'excel' ? 'xls' : 'csv';
      const mimeType = exportFormat === 'excel' ? 'data:application/vnd.ms-excel;charset=utf-8,\uFEFF' : 'data:text/csv;charset=utf-8,\uFEFF';

      const content = mimeType + [headers.join(separator), ...rows.map(e => e.join(separator))].join('\n');
      const encodedUri = encodeURI(content);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `LAPORAN_PERTANGGUNGJAWABAN_HAUL.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } 
    
    // --- PROSES CETAK PDF (Format Layout Cetak Printer Bersih) ---
    else if (exportFormat === 'pdf') {
      const printWindow = window.open('', '_blank');
      let tableRowsHtml = '';
      
      transactions.forEach((item, idx) => {
        tableRowsHtml += `
          <tr style="border-bottom: 1px solid #ddd; font-family: monospace;">
            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px;">${item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
            <td style="padding: 8px;">${item.category || ''}</td>
            <td style="padding: 8px; font-weight: bold; color: ${String(item.type).toLowerCase() === 'pemasukan' ? '#10b981' : '#f43f5e'}">${item.type}</td>
            <td style="padding: 8px; text-align: right;">Rp ${Number(item.amount).toLocaleString('id-ID')}</td>
            <td style="padding: 8px; color: #555;">${item.note || '-'}</td>
          </tr>
        `;
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak LPJ Kas Haul</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th { background-color: #f8fafc; padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left; }
              .summary-box { margin-top: 30px; float: right; width: 300px; border-top: 2px dashed #333; padding-top: 10px; font-size: 13px; }
              .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-family: monospace; }
            </style>
          </head>
          <body>
            <h2 style="text-align: center; margin-bottom: 2px;">LAPORAN PERTANGGUNGJAWABAN DANA KAS</h2>
            <p style="text-align: center; font-size: 12px; margin-top: 0; color: #666;">Dokumen Lampiran Pembukuan Keuangan Transaksi Otomatis</p>
            <hr/>
            <table>
              <thead>
                <tr>
                  <th>No</th><th>Tanggal</th><th>Kategori Pos</th><th>Jenis</th><th style="text-align: right;">Nominal Angka</th><th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
            
            <div class="summary-box">
              <div class="summary-row"><span>Total Pemasukan:</span><span style="color:#10b981;font-weight:bold;">Rp ${totalMasuk.toLocaleString('id-ID')}</span></div>
              <div class="summary-row"><span>Total Pengeluaran:</span><span style="color:#f43f5e;font-weight:bold;">Rp ${totalKeluar.toLocaleString('id-ID')}</span></div>
              <div class="summary-row" style="border-top:1px solid #ddd; padding-top:6px; font-weight:bold;"><span>Sisa Saldo Akhir:</span><span style="color:#d97706;">Rp ${(totalMasuk - totalKeluar).toLocaleString('id-ID')}</span></div>
            </div>

            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[250px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* HEADER DAN TOOL DOWNLOAD FORMAT LPJ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">💰 Alur Pencatatan Buku Kas</h2>
          <p className="text-xs text-slate-400">Kelola operasional pembukuan keuangan dan unduh berkas arsip pelaporan berkala.</p>
        </div>
        
        {/* WIDGET SELEKTOR FORMAT LPJ */}
        <div className="flex items-center gap-2 bg-slate-900 p-2 border border-slate-800 rounded-xl max-w-full md:max-w-auto">
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none cursor-pointer font-bold"
          >
            <option value="excel">📊 Dokumen Microsoft Excel (.xls)</option>
            <option value="csv">📋 Berkas Data CSV (.csv)</option>
            <option value="pdf">📄 Cetak Langsung / Simpan PDF (.pdf)</option>
          </select>
          <button
            onClick={handleCetakLPJ}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all whitespace-nowrap"
          >
            🖨️ Cetak
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INPUT TRANSAKSI */}
        <div className="lg:col-span-1">
          {isAdmin ? (
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-2">➕ Catat Arus Kas</h3>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jenis Kas</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none">
                  <option value="pemasukan">📥 Pemasukan (Cash In)</option>
                  <option value="pengeluaran">📤 Pengeluaran (Cash Out)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Kategori Pos</label>
                {categories.length > 0 ? (
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[10px] text-rose-400">Kategori kosong! Sila isi di menu Pengaturan dahulu.</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nominal (Rp)</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Contoh: 150000" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Keterangan Catatan</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Hamba allah dari blok manis" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
              </div>
              <button type="submit" disabled={submitting || !category} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                {submitting ? '⏳ Menyimpan...' : '💾 Simpan Transaksi'}
              </button>
            </form>
          ) : (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">🔒 Mode Pengisian Terkunci</p>
              <p className="text-[11px] text-slate-500">Silakan aktifkan mode admin untuk mencatat arus kas masuk/keluar.</p>
            </div>
          )}
        </div>

        {/* DAFTAR RIWAYAT */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📋 Riwayat Kas Buku Besar</h3>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px]">
                      <th className="pb-3">Kategori & Catatan</th>
                      <th className="pb-3 text-right">Nominal Sesi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-950/20 transition-all">
                        <td className="py-3">
                          <p className="font-bold text-slate-200">{t.category}</p>
                          {t.note && <p className="text-[10px] text-slate-500 mt-0.5">📝 {t.note}</p>}
                        </td>
                        <td className={`py-3 text-right font-bold ${String(t.type).toLowerCase() === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {String(t.type).toLowerCase() === 'pemasukan' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Belum ada riwayat transaksi kas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
