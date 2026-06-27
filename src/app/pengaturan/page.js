'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PengaturanPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [theme, setTheme] = useState('slate-dark');
  const [announcement, setAnnouncement] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
  };

  const availableThemes = [
    { id: 'slate-dark', name: '🌌 Slate Classic (Bawaan)' },
    { id: 'emerald-cyber', name: '📟 Emerald Cyber (Hijau Hitam)' },
    { id: 'velvet-rose', name: '🔮 Velvet Rose (Ungu Gelap)' },
    { id: 'neon-sunset', name: '🌆 Neon Sunset (Oranye Jingga)' },
    { id: 'amber-gold', name: '👑 Amber Gold (Emas Hitam)' }
  ];

  useEffect(() => { 
    loadPengaturan(); 
  }, []);

  async function loadPengaturan() {
    try {
      const supabase = getSupabase();
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

  // FUNGSI UPLOAD LOGO LANGSUNG KE SUPABASE STORAGE
  const handleUploadLogo = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const supabase = getSupabase();

      // 1. Upload file ke bucket 'logos'
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Ambil URL Publik Gambar
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      alert('✅ Foto logo berhasil diunggah ke storage database!');
    } catch (error) {
      alert(`Gagal upload logo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = getSupabase();
      await supabase.from('settings').upsert({ 
        id: 'main_config', 
        org_name: orgName, 
        address, 
        bank_info: bankInfo, 
        logo_url: logoUrl, 
        theme, 
        announcement 
      });
      alert('💾 Konfigurasi identitas & tema gaya sukses diperbarui!');
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
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none">
            {availableThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* INPUT UPLOAD FILE BARU */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Upload File Logo Organisasi</label>
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-xl">
            <input type="file" accept="image/*" onChange={handleUploadLogo} disabled={uploading} className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer w-full" />
          </div>
          {uploading && <p className="text-[10px] text-amber-500 font-mono mt-1 animate-pulse">⏳ Mengunggah file ke server...</p>}
          {logoUrl && (
            <div className="mt-2 flex items-center gap-2">
              <img src={logoUrl} alt="Preview" className="w-8 h-8 rounded-full border border-slate-800 object-cover" />
              <span className="text-[10px] text-emerald-400 font-mono truncate max-w-xs">File terhubung aman</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Organisasi</label>
          <input type="text" placeholder="Nama Panitia..." value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Alamat Kesekretariatan</label>
          <input type="text" placeholder="Alamat Resmi..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Rekening Pembayaran Kop Resmi</label>
          <input type="text" placeholder="Info Rekening..." value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Teks Banner Informasi Beranda Utama</label>
          <textarea placeholder="Teks Informasi Utama..." value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none focus:outline-none" rows={3} />
        </div>
        <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl transition-all hover:bg-amber-400">{loading ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}</button>
      </form>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl h-fit">
        <h3 className="text-xs font-bold text-slate-300 uppercase border-b border-slate-800 pb-2">📁 Kategori Pos Buku Kas</h3>
        <form onSubmit={async (e) => { e.preventDefault(); if (newCategory.trim()) { const s = getSupabase(); await s.from('categories').insert([{ name: newCategory.trim() }]); setNewCategory(''); loadPengaturan(); } }} className="flex gap-2">
          <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nama Pos Baru..." className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400">Tambah</button>
        </form>
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[300px]">
          {categories.map(c => (
            <div key={c.id} className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <span className="text-slate-300">🏷️ {c.name}</span>
              <button type="button" onClick={async () => { if (confirm('Hapus kategori ini?')) { const s = getSupabase(); await s.from('categories').delete().eq('id', c.id); loadPengaturan(); } }} className="text-rose-400 font-bold hover:underline">Hapus</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
