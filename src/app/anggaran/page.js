'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [budgets, setBudgets] = useState([]);
  
  // State Form Input Anggaran
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const daftarKategori = [
    "Iuran wajib warga cibogo kidul (ahli waris)",
    "Iuran wajib warga luar cibogo kidul (ahli waris)",
    "Perantauan (Ahli waris)",
    "Donatur Khitanan Massal",
    "Donatur lain-lain",
    "Logistik & Perlengkapan", 
    "Administrasi", 
    "Santunan", 
    "Khitanan Massal",
    "Akomodasi & Transportasi", 
    "Konsumsi pengunjung", 
    "Konsumsi VIP",
    "Honorarium", 
    "Pubdekdok", 
    "Dana tak terduga", 
    "Acara (Hiburan & Atraksi)"
  ];

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }
    setCategory(daftarKategori[0]);

    async function fetchBudgets() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          setLoading(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('budgets')
          .select('*');

        if (error) throw error;
        if (data) setBudgets(data);
      } catch (err) {
        console.error('Error fetching budgets:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin || submitting) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      alert('Konfigurasi database belum lengkap!');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Menggunakan planned_amount agar sama dengan gambar_10.png Anda
      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            category: category,
            planned_amount: Number(amount)
          }
        ])
        .select();

      if (error) throw error;

      alert('Sukses! Target anggaran berhasil disimpan.');
      if (data) {
        setBudgets([data[0], ...budgets]);
      }
      setAmount('');
    } catch (err) {
      alert(`Gagal menyimpan anggaran: ${err.message}`);
    } finally {
      setSubmitting(false);
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
      <div>
        <h2 className="text-xl font-bold text-white">🎯 Manajemen Target Anggaran</h2>
        <p className="text-xs text-slate-400">Penetapan batas maksimum rencana pengeluaran atau target akumulasi pemasukan iuran.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {isAdmin ? (
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-2">🎯 Set Target Dana</h3>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Kategori Khas</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  {daftarKategori.map((kat, idx) => (
                    <option key={idx} value={kat}>{kat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Nominal (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 5000000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all disabled:bg-slate-800"
              >
                {submitting ? '⏳ Menyimpan...' : '💾 Simpan Anggaran'}
              </button>
            </form>
          ) : (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">🔒 Mode Pengisian Terkunci</p>
              <p className="text-[11px] text-slate-500">Silakan aktifkan mode admin di menu pojok kiri bawah untuk mengatur alokasi anggaran.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📊 Alokasi Target Plafon Anggaran Aktif</h3>
            
            {budgets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px]">
                      <th className="pb-3 font-semibold">Nama Kategori</th>
                      <th className="pb-3 font-semibold text-right">Target Plafon Dana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {budgets.map((bg) => (
                      <tr key={bg.id} className="hover:bg-slate-950/20 transition-all">
                        <td className="py-3 font-bold text-slate-200">
                          🎯 {bg.category}
                        </td>
                        <td className="py-3 text-right font-bold text-amber-400">
                          Rp {Number(bg.planned_amount || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Belum ada target plafon anggaran yang dikonfigurasi di database cloud.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
