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

  // Gabungan kategori untuk alokasi anggaran target
  const daftarKategori = [
    'Iuran wajib warga cibogo kidul (ahli waris)',
    'Iuran wajib warga luar cibogo kidul (ahli waris)',
    'Perantauan (Ahli waris)',
    'Donatur Khitanan Massal',
    'Donatur lain-lain',
    'Logistik & Perlengkapan', 
    'Administrasi', 
    'Santunan', 
    'Khitanan Massal',
    'Akomodasi & Transportasi', 
    'Konsumsi pengunjung', 
    'Konsumsi VIP',
    'Honorarium', 
    'Pubdekdok', 
    'Dana tak terduga', 
    'Acara(Hiburan & Atraksi)'
  ];

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }
    setCategory(daftarKategori[0]);

    // Ambil data anggaran dari Supabase
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
          .select('*')
          .order('created_at', { ascending: false });

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
      
      // Simpan data target alokasi dana anggaran ke tabel budgets
      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            category,
            amount: Number(amount),
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      alert('Sukses! Target anggaran berhasil disimpan permanen.');
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
    <div className="space-y-6 max-w-6xl animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white">🎯 Manajemen Target Anggaran</h2>
        <p className="text-xs text-slate-400">Penetapan batas maksimum rencana pengeluaran atau target akumulasi pemasukan iuran.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INPUT ALOKASI TARGET */}
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
                className="w
