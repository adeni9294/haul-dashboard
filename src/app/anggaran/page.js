'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [budgetList, setBudgetList] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('pengeluaran'); 
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
  };

  useEffect(() => {
    // SINKRONISASI STATUS ADMIN DENGAN LOGIKA HEADER
    const checkAdminStatus = () => {
      const status1 = localStorage.getItem('is_admin') === 'true';
      const status2 = localStorage.getItem('is_admin_haul') === 'true';
      setIsAdmin(status1 || status2);
    };

    // Jalankan saat komponen dimuat
    checkAdminStatus();
    loadBudgets();

    // Dengarkan perubahan status secara instan tanpa refresh halaman
    window.addEventListener('storage', checkAdminStatus);
    const interval = setInterval(checkAdminStatus, 400);

    return () => {
      window.removeEventListener('storage', checkAdminStatus);
      clearInterval(interval);
    };
  }, []);

  async function loadBudgets() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('budgets') 
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      setBudgetList(data);
    }
  }

  async function verifikasiAksesAdmin() {
    const passwordInput = prompt("Masukkan Password Admin untuk melakukan aksi ini:");
    if (!passwordInput) return false;

    const supabase = getSupabase();
    const { data: settingsData, error } = await supabase
      .from('settings')
      .select('admin_password')
      .eq('id', 'main_config')
      .single();

    if (error || !settingsData) {
      alert("❌ Gagal terhubung ke sistem keamanan database.");
      return false;
    }

    if (passwordInput !== settingsData.admin_password) {
      alert("❌ Password Salah! Akses ditolak.");
      return false;
    }

    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    const supabase = getSupabase();
    
    // Payload disesuaikan ke kolom planned_amount
    const payload = { 
      title: title.trim(), 
      planned_amount: parseFloat(amount),
      type: type 
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('budgets').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('🎯 Anggaran berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('budgets').insert([payload]);
        if (error) throw error;
        alert('✅ Anggaran berhasil ditambahkan!');
      }

      setTitle(''); setAmount(''); setEditingId(null);
      loadBudgets();
    } catch (err) {
      console.error(err);
      alert('❌ Gagal menyimpan data anggaran.');
    }
  };

  const handleEdit = async (b) => {
    const lolosVerifikasi = await verifikasiAksesAdmin();
    if (!lolosVerifikasi) return;

    // Membaca nominal dari planned_amount
    const nilaiUang = b.planned_amount ?? 0;

    setEditingId(b.id);
    setTitle(b.title || ''); 
    setAmount(nilaiUang.toString()); 
    setType(b.type || 'pengeluaran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus rencana anggaran ini?')) {
      const lolosVerifikasi = await verifikasiAksesAdmin();
      if (!lolosVerifikasi) return;

      const supabase = getSupabase();
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (!error) {
        alert('🗑️ Anggaran berhasil dihapus!');
        loadBudgets();
      } else {
        alert('❌ Gagal menghapus anggaran.');
      }
    }
  };

  // Fungsi pemformat mata uang rupiah berbasis kolom planned_amount
  const formatRupiah = (item) => {
    const nilaiRaw = item.planned_amount ?? 0;
    const nilaiAngka = parseFloat(nilaiRaw);
    
    if (isNaN(nilaiAngka)) return 'Rp 0';
    return `Rp ${nilaiAngka.toLocaleString('id-ID')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* KONDISIONAL BAR FORM INPUT ANGGARAN */}
      {isAdmin ? (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Perbarui Anggaran' : '➕ Tambah Anggaran'}</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Nama Alokasi / Kategori</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Konsumsi Utama" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Jumlah Anggaran (Rp)</label>
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Contoh: 5000000" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Jenis</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none">
              <option value="pengeluaran">Pengeluaran</option>
              <option value="pemasukan">Pemasukan Target</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400">
            {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggaran'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setTitle(''); setAmount(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
          )}
        </form>
      ) : (
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">💡 Anda berada di Mode Publik (Lihat Saja).</p>
        </div>
      )}

      {/* TAMPILAN DATA RENCANA ANGGARAN */}
      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Rencana Anggaran ({budgetList.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {budgetList.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada rencana anggaran.</p>
          ) : (
            budgetList.map(b => (
              <div key={b.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{b.title || 'Tanpa Nama Kategori'}</p>
                  <p className={`text-[11px] font-mono font-bold mt-0.5 ${b.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {b.type === 'pemasukan' ? '📥 Target: ' : '📤 Alokasi: '} 
                    {formatRupiah(b)}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(b)} className="text-amber-500 font-bold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(b.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
