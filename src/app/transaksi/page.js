'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TransaksiPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
  // State Form Input
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('pemasukan');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  // Kategori default panitia
  const kategoriPemasukan = [
    'Iuran wajib warga cibogo kidul (ahli waris)',
    'Iuran wajib warga luar cibogo kidul (ahli waris)',
    'Perantauan (Ahli waris)',
    'Donatur Khitanan Massal',
    'Donatur lain-lain'
  ];

  const kategoriPengeluaran = [
    'Logistik & Perlengkapan', 'Administrasi', 'Santunan', 'Khitanan Massal',
    'Akomodasi & Transportasi', 'Konsumsi pengunjung', 'Konsumsi VIP',
    'Honorarium', 'Pubdekdok', 'Dana tak terduga', 'Acara(Hiburan & Atraksi)'
  ];

  // Inisialisasi Supabase secara aman
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    // 1. Cek status login admin dari localStorage
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }

    // Set kategori default awal
    setCategory(kategoriPemasukan[0]);

    // 2. Tarik Riwayat Transaksi dari Supabase
    async function fetchTransactions() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  // Handler perubahan tipe otomatis mengubah kategori pertama yang dipilih
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'pemasukan' ? kategoriPemasukan[0] : kategoriPengeluaran[0]);
  };

  // Handler Submit Transaksi Baru (Hanya untuk mode Admin)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase || !isAdmin || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            amount: Number(amount),
            type,
            category,
            note,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      alert('Sukses! Data transaksi berhasil disimpan secara cloud.');
      if (data) {
        setTransactions([data[0], ...transactions]);
      }
      
      // Reset Form
      setAmount('');
      setNote('');
    } catch (err) {
      alert(`Gagal menyimpan data: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[250px]">
        <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white">💰 Modul Arus Kas Transaksi</h2>
        <p className="text-xs text-slate-400">Pencatatan aktual pemasukan iuran dan pengeluaran operasional panitia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: FORM ENTRI TRANSAKSI (HANYA MUNCUL DI MODE ADMIN) */}
        <div className="lg:col-span-1">
          {isAdmin ? (
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-2">➕ Input Kas Baru</h3>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleTypeChange('pemasukan')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${type === 'pemasukan' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                  >
                    📥 Pemasukan
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleTypeChange('pengeluaran')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${type === 'pengeluaran' ? 'bg-red-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                  >
                    📤 Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nominal Angka (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Kategori Khas</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  {type === 'pemasukan' 
                    ? kategoriPemasukan.map((kat, idx) => <option key={idx} value={kat}>{kat}</option>)
                    : kategoriPengeluaran.map((kat, idx) => <option key={idx} value={kat}>{kat}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Keterangan Catatan Tambahan</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nama pengirim/tujuan belanja..." 
                  className="w-full h-16 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all disabled:bg-slate-800"
              >
                {submitting ? '⏳ Memproses...' : '💾 Simpan Transaksi'}
              </button>
            </form>
          ) : (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">🔒 Mode Pengisian Terkunci</p>
              <p className="text-[11px] text-slate-500">Anda masuk sebagai publik. Silakan klik tombol masuk admin di sudut kiri bawah untuk mengisi rekam arus kas.</p>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: TABEL RIWAYAT TRANSAKSI AKTUAL */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📜 Jurnal Pembukuan Kas Panitia</h3>
            
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px]">
                      <th className="pb-3 font-semibold">Kategori / Catatan</th>
                      <th className="pb-3 font-semibold">Tipe</th>
                      <th className="pb-3 font-semibold text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-950/20 transition-all">
                        <td className="py-3 pr-2">
                          <div className="font-bold text-slate-200">{tx.category}</div>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">{tx.note || '-'}</div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === 'pemasukan' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {tx.type === 'pemasukan' ? 'MASUK' : 'KELUAR'}
                          </span>
                        </td>
                        <td className={`py-3 text-right font-bold ${tx.type === 'pemasukan' ? 'text-emerald-400' : 'text-red-400'}`}>
                          Rp {Number(tx.amount).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Belum ada rekaman entri kas di database cloud Supabase.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
