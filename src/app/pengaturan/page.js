'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PengaturanPage() {
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [theme, setTheme] = useState('slate-dark');
  const [announcement, setAnnouncement] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

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
    { id: 'cyberpunk-2076', name: '🦾 Cyberpunk (Kuning Hitam)' }
  ];

  useEffect(() => { 
    loadPengaturan(); 
  }, []);

  async function loadPengaturan() {
    try {
      const { data } = await supabase.from('settings').select('*').eq('id', 'main_config').single();
      if (data) {
        setOrgName(data.org_name || '');
        setAddress(data.address || '');
        setBankInfo(data.bank_info || '');
        setLogoUrl(data.logo_url || '');
        setAnnouncement(data.announcement || '');
        setTheme(data.theme || 'slate-dark');
      }
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);
    } catch (err) { console.error(err); }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('settings').upsert({ 
        id: 'main_config', 
        org_name: orgName, 
        address, 
        bank_info: bankInfo, 
        logo_url: logoUrl, 
        theme, 
        announcement 
      });
      alert('Konfigurasi identitas & tema gaya berhasil disimpan!');
      window.location.reload();
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form onSubmit={handleSaveConfig} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase border-b border-slate-800 pb-2">🎨 Profil & Pilihan Tema</h3>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Gaya Tema Warna</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold">
            {availableThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Organisasi</label>
          <input type="text" placeholder="Nama Panitia..." value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Alamat Kesekretariatan</label>
          <input type="text" placeholder="Alamat Resmi..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Rekening Pembayaran Kop resmi</label>
          <input type="text" placeholder="Info Rekening..." value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Link URL Foto Logo Resmi Gambar</label>
          <input type="text" placeholder="Link URL Gambar Logo..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Teks Banner Informasi Beranda Utama</label>
          <textarea placeholder="Teks Informasi Utama..." value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none" rows={3} />
        </div>
        <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl">{loading ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}</button>
      </form>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-slate-300 uppercase border-b border-slate-800 pb-2">📁 Kategori Pos Buku Kas</h3>
        <form onSubmit={async (e) => { e.preventDefault(); if (newCategory.trim()) { await supabase.from('categories').insert([{ name: newCategory.trim() }]); setNewCategory(''); loadPengaturan(); } }} className="flex gap-2">
          <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nama Pos Baru..." className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
          <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">Tambah</button>
        </form>
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[350px]">
          {categories.map(c => (
            <div key={c.id} className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <span className="text-slate-300">🏷️ {c.name}</span>
              <button type="button" onClick={async () => { if (confirm('Hapus kategori ini?')) { await supabase.from('categories').delete().eq('id', c.id); loadPengaturan(); } }} className="text-rose-400 font-bold">Hapus</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
