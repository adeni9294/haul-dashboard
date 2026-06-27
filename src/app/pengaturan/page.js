'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PengaturanPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // State Konfigurasi Aplikasi (Lama + Baru)
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [theme, setTheme] = useState('slate-dark');
  const [announcement, setAnnouncement] = useState(''); // State Baru untuk Pengumuman
  const [budgetNote, setBudgetNote] = useState(''); // State Baru untuk Catatan Anggaran

  // State Kategori Dinamis
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  // State Target Anggaran Dinamis
  const [budgets, setBudgets] = useState([]);
  const [newBudgetItem, setNewBudgetItem] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const availableThemes = [
    { id: 'slate-dark', name: '🌌 Slate Classic (Bawaan)' },
    { id: 'emerald-cyber', name: '📟 Emerald Cyber (Hijau Neon)' },
    { id: 'velvet-rose', name: '🔮 Velvet Rose (Ungu Rose)' },
    { id: 'neon-sunset', name: '🌆 Neon Sunset (Oranye Jingga)' },
    { id: 'nordic-frost', name: '❄️ Nordic Frost (Biru Es)' },
    { id: 'tokyo-night', name: '🗼 Tokyo Night (Ungu Gelap)' },
    { id: 'amber-gold', name: '👑 Amber Gold (Emas Mewah)' },
    { id: 'cyberpunk-2076', name: '🦾 Cyberpunk (Kuning Hitam)' },
    { id: 'ocean-deep', name: '🌊 Ocean Deep (Biru Samudra)' },
    { id: 'forest-moss', name: '🌲 Forest Moss (Hijau Lumut)' },
    { id: 'crimson-tide', name: '🩸 Crimson Tide (Merah Marun)' },
    { id: 'obsidian-stark', name: '🖤 Obsidian Stark (Hitam Pekat)' },
    { id: 'dracula-vamp', name: '🧛 Dracula (Ungu Klasik AI)' },
    { id: 'coffee-latte', name: '☕ Coffee Latte (Cokelat Estetik)' },
    { id: 'mint-fresh', name: '🍃 Mint Fresh (Hijau Toska)' },
    { id: 'retro-wave', name: '📼 Retro Wave (Merah Muda Vapor)' }
  ];

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }
    loadSemuaPengaturan();
  }, []);

  async function loadSemuaPengaturan() {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      // 1. Ambil data Main Config, Tema, Pengumuman, dan Catatan Anggaran
      const { data: configData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'main_config')
        .single();
      
      if (configData) {
        setOrgName(configData.org_name || '');
        setAddress(configData.address || '');
        setBankInfo(configData.bank_info || '');
        setLogoUrl(configData.logo_url || '');
        setAnnouncement(configData.announcement || ''); // Load data pengumuman
        setBudgetNote(configData.budget_note || ''); // Load data catatan anggaran
        if (configData.theme) {
          setTheme(configData.theme);
          document.body.className = `theme-${configData.theme} bg-slate-950 text-slate-100 min-h-screen antialiased`;
        }
      }

      // 2. Ambil Kategori
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);

      // 3. Ambil Anggaran
      const { data: budData } = await supabase.from('budgets').select('*');
      if (budData) setBudgets(budData);

    } catch (err) {
      console.error(err);
    }
  }

  // MENYIMPAN KONFIGURASI TERMASUK PENGUMUMAN DAN CATATAN ANGGARAN
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'main_config',
          org_name: orgName,
          address: address,
          bank_info: bankInfo,
          logo_url: logoUrl,
          theme: theme,
          announcement: announcement, // Menyimpan teks pengumuman ke database
          budget_note: budgetNote // Menyimpan catatan anggaran ke database
        });

      if (error) throw error;
      
      document.body.className = `theme-${theme} bg-slate-950 text-slate-100 min-h-screen antialiased`;
      
      alert('Semua pengaturan dan catatan berhasil diperbarui!');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await supabase.from('categories').insert([{ name: newCategory.trim() }]);
      setNewCategory('');
      loadSemuaPengaturan();
    } catch (err) { console.error(err); }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudgetItem.trim() || !newBudgetAmount) return;
    try {
      await supabase.from('budgets').insert([{ item_name: newBudgetItem.trim(), planned_amount: Number(newBudgetAmount) }]);
      setNewBudgetItem('');
      setNewBudgetAmount('');
      loadSemuaPengaturan();
    } catch (err) { console.error(err); }
  };

  const handleLoginAdmin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('isAdminAuthenticated', 'true');
      setIsAdmin(true);
      alert('Akses Admin Berhasil Diberikan!');
    } else {
      alert('Password Salah!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white">⚙️ Ruang Kendali Pengaturan</h2>
        <p className="text-xs text-slate-400">Atur profil identitas organisasi, sesuaikan tema, pengumuman, dan pos anggaran.</p>
      </div>

      {!isAdmin ? (
        <form onSubmit={handleLoginAdmin} className="max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">🔒 Verifikasi Keamanan Admin</h3>
          <input 
            type="password" 
            placeholder="Masukkan Password Admin" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
          />
          <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl uppercase">Buka Akses</button>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SISI KIRI: FORM CONFIG UTAMA */}
          <form onSubmit={handleSaveConfig} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider border-b border-slate-800 pb-2">🎨 Profil, Tema & Pengumuman</h3>
            
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Pilih Tema Tampilan Modern</label>
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-bold"
              >
                {availableThemes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Organisasi / Panitia</label>
              <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Alamat Resmi</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Informasi Rekening Bank (Kop)</label>
              <input type="text" value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Link URL Foto Logo Resmi</label>
              <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono" />
            </div>

            {/* KOLOM TEKS PENGUMUMAN BERFUNGSI 100% */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">📋 Teks Pengumuman Halaman Utama</label>
              <textarea 
                value={announcement} 
                onChange={(e) => setAnnouncement(e.target.value)} 
                placeholder="Tulis informasi atau pengumuman penting panitia di sini..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none resize-none"
              />
            </div>

            {/* KOLOM CATATAN ANGGARAN BERFUNGSI 100% */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">📝 Catatan Tambahan Anggaran</label>
              <textarea 
                value={budgetNote} 
                onChange={(e) => setBudgetNote(e.target.value)} 
                placeholder="Tulis catatan, kebijakan keuangan, atau keterangan target anggaran..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none resize-none"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase rounded-xl shadow-lg">
              {loading ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </form>

          {/* SISI KANAN: KATEGORI & ANGGARAN */}
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📁 Tambah Kategori Pos Kas</h3>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nama pos baru..." className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
                <button type="submit" className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">Tambah</button>
              </form>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {categories.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded-lg">🏷️ {c.name}</span>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📈 Alokasi Anggaran</h3>
              <form onSubmit={handleAddBudget} className="space-y-2">
                <input type="text" value={newBudgetItem} onChange={(e) => setNewBudgetItem(e.target.value)} placeholder="Nama kebutuhan..." className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
                <input type="number" value={newBudgetAmount} onChange={(e) => setNewBudgetAmount(e.target.value)} placeholder="Nominal target Rp..." className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono" />
                <button type="submit" className="w-full py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">Simpan Anggaran</button>
              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
