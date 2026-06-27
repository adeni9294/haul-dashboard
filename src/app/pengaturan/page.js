'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PengaturanPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // State Pengaturan Identitas
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [theme, setTheme] = useState('dark_amber');
  const [logoUrl, setLogoUrl] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [phoneContact, setPhoneContact] = useState('');
  const [targetNotes, setTargetNotes] = useState('');

  // State Manajemen Kategori Dinamis
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }

    async function loadData() {
      try {
        if (!supabaseUrl || !supabaseKey) return;

        // Fetch Data Pengaturan
        const { data: setConfig } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'main_config')
          .single();

        if (setConfig) {
          setOrgName(setConfig.org_name || '');
          setAddress(setConfig.address || '');
          setBankInfo(setConfig.bank_info || '');
          setTheme(setConfig.theme || 'dark_amber');
          setLogoUrl(setConfig.logo_url || '');
          setAnnouncement(setConfig.announcement || '');
          setPhoneContact(setConfig.phone_contact || '');
          setTargetNotes(setConfig.target_notes || '');
        }

        // Fetch Data Kategori dari Database
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (catData) setCategories(catData);

      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fungsi Unggah Logo
  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file || !isAdmin) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
      setLogoUrl(data.publicUrl);
      alert('Logo terunggah! Jangan lupa simpan pengaturan di bawah.');
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Fungsi Tambah Kategori Baru
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim() || !isAdmin || addingCategory) return;

    setAddingCategory(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategory.trim() }])
        .select();

      if (error) throw error;
      alert('Kategori baru berhasil ditambahkan!');
      if (data) setCategories([...categories, data[0]].sort((a,b) => a.name.localeCompare(b.name)));
      setNewCategory('');
    } catch (err) {
      alert(`Gagal menambah kategori: ${err.message}`);
    } finally {
      setAddingCategory(false);
    }
  };

  // Fungsi Hapus Kategori
  const handleDeleteCategory = async (id, name) => {
    if (!isAdmin || !confirm(`Hapus kategori "${name}"? Kategori yang sudah terpakai di Transaksi sebaiknya jangan dihapus.`)) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isAdmin || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('settings').upsert({
        id: 'main_config', org_name: orgName, address, bank_info: bankInfo,
        theme, logo_url: logoUrl, announcement, phone_contact: phoneContact, target_notes: targetNotes
      });
      if (error) throw error;
      alert('Pengaturan global berhasil disimpan!');
      window.location.reload();
    } catch (err) {
      alert(err.message);
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
    <div className="space-y-6 max-w-4xl mx-auto px-2 pb-12">
      <div>
        <h2 className="text-xl font-bold text-white">⚙️ Pengaturan Global Workspace</h2>
        <p className="text-xs text-slate-400">Modifikasi penuh identitas kepanitiaan, kelola kategori kas, logo, dan info operasional.</p>
      </div>

      {/* BLOCK 1: MANAJEMEN KATEGORI DINAMIS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 md:p-6 space-y-4">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-3">🗂️ Manajemen Kategori Buku Kas</h3>
        
        {isAdmin ? (
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input 
              type="text" required value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Ketik Nama Kategori Baru... (Contoh: Donatur Sembako)"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button type="submit" disabled={addingCategory} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all">
              {addingCategory ? '⏳...' : '➕ Tambah'}
            </button>
          </form>
        ) : (
          <p className="text-[11px] text-slate-500">🔒 Aktifkan Mode Admin untuk mengelola/menambah kategori kustom.</p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((c) => (
            <div key={c.id} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <span>📁 {c.name}</span>
              {isAdmin && (
                <button type="button" onClick={() => handleDeleteCategory(c.id, c.name)} className="text-slate-600 hover:text-red-400 font-bold ml-1">✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BLOCK 2: IDENTITAS & KUSTOMISASI KORPORAT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <form onSubmit={handleSaveSettings} className="p-4 md:p-6 space-y-6">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-3">🎨 Kustomisasi Tampilan & Header</h3>
          
          <div className="grid grid-cols-1 gap-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Nama Organisasi / Panitia</label>
                <input type="text" required value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Nomor Kontak / WhatsApp Sekretariat</label>
                <input type="text" value={phoneContact} onChange={(e) => setPhoneContact(e.target.value)} placeholder="08123456xxx" className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none font-mono" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Alamat / Lokasi Sekretariat</label>
              <textarea rows="2" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"></textarea>
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Informasi Rekening Bank Panitia</label>
              <input type="text" value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Teks Pengumuman / Info Depan</label>
                <textarea rows="2" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Catatan Tambahan Progres Anggaran</label>
                <textarea rows="2" value={targetNotes} onChange={(e) => setTargetNotes(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">⚙️ Berkas Gambar Logo</label>
                <div className="space-y-2">
                  <input type="file" accept="image/*" disabled={!isAdmin || uploading} onChange={handleUploadLogo} className="w-full text-slate-400 text-[11px] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-slate-800 file:text-slate-200 file:cursor-pointer" />
                  {logoUrl && (
                    <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                      <img src={logoUrl} alt="Preview Logo" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{logoUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Pilih Tema Gaya Visual</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none">
                  <option value="dark_amber">Premium Dark Amber (Emas Gelap)</option>
                  <option value="dark_emerald">Classic Dark Emerald (Hijau Islami)</option>
                  <option value="dark_slate">Minimalist Modern Slate (Abu-abu)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-4 flex flex-col md:flex-row justify-between gap-3">
            {!isAdmin && <p className="text-[11px] text-rose-400 font-medium text-center">🔒 Masuk ke Mode Admin untuk menyimpan kustomisasi.</p>}
            <button type="submit" disabled={!isAdmin || submitting || uploading} className="w-full md:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 text-xs font-black uppercase rounded-xl shadow-md transition-all md:ml-auto">
              {submitting ? '⏳ Memproses...' : '💾 Simpan Konformasi Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
