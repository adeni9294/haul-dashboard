'use client';
import { useState, useEffect } from 'react';

export default function PengaturanPage() {
  // 1. State Utama untuk Mengumpulkan Semua Pengaturan (Sistem Sekali Simpan)
  const [form, setForm] = useState({
    targetNominal: '50000000',
    tahunAcara: '2026',
    bank1: 'Bank Mandiri - 134xxxxxxxx (a.n Panitia Haul)',
    bank2: 'BCA - 822xxxxxxx (a.n Panitia Haul)',
    bank3: 'BJB - 009xxxxxxx (a.n Panitia Haul)',
    namaAdmin: 'Ahmad Deni',
    kontakAdmin: '0812xxxxxxxx',
    emailAdmin: 'admin@sat.com',
    sandiBaru: '',
    konfirmasiSandi: ''
  });

  // 2. State untuk Manajemen Kategori Custom (Pemasukan & Pengeluaran)
  const [kategoriPemasukan, setKategoriPemasukan] = useState([
    'Iuran wajib warga cibogo kidul (ahli waris)',
    'Iuran wajib warga luar cibogo kidul (ahli waris)',
    'Perantauan (Ahli waris)',
    'Donatur Khitanan Massal',
    'Donatur lain-lain'
  ]);

  const [kategoriPengeluaran, setKategoriPengeluaran] = useState([
    'Logistik & Perlengkapan', 'Administrasi', 'Santunan', 'Khitanan Massal',
    'Akomodasi & Transportasi', 'Konsumsi pengunjung', 'Konsumsi VIP',
    'Honorarium', 'Pubdekdok', 'Dana tak terduga', 'Acara(Hiburan & Atraksi)'
  ]);

  const [inputPemasukan, setInputPemasukan] = useState('');
  const [inputPengeluaran, setInputPengeluaran] = useState('');

  // Fungsi Tambah/Hapus Kategori
  const handleAddKategori = (tipe) => {
    if (tipe === 'masuk' && inputPemasukan.trim()) {
      setKategoriPemasukan([...kategoriPemasukan, inputPemasukan.trim()]);
      setInputPemasukan('');
    } else if (tipe === 'keluar' && inputPengeluaran.trim()) {
      setKategoriPengeluaran([...kategoriPengeluaran, inputPengeluaran.trim()]);
      setInputPengeluaran('');
    }
  };

  const handleRemoveKategori = (tipe, index) => {
    if (tipe === 'masuk') {
      setKategoriPemasukan(kategoriPemasukan.filter((_, i) => i !== index));
    } else {
      setKategoriPengeluaran(kategoriPengeluaran.filter((_, i) => i !== index));
    }
  };

  // 3. Fungsi Eksekusi Simpan Massal (Batch Update)
  const handleSaveAll = (e) => {
    e.preventDefault();
    if (form.sandiBaru && form.sandiBaru !== form.konfirmasiSandi) {
      alert('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }
    
    // Proses simpan data (Nanti dihubungkan ke Supabase / LocalStorage)
    alert('Sukses! Semua konfigurasi pengaturan, rekening, dan kategori berhasil diperbarui secara cloud.');
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-8 max-w-5xl animate-fadeIn pb-12">
      <div>
        <h2 className="text-xl font-bold text-white">⚙️ Pengaturan Pusat Kontrol Admin</h2>
        <p className="text-xs text-slate-400">Kelola target anggaran, rekening dashboard, kategori transaksi, cloud logo, dan akun pengurus.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOK A: TARGET, TAHUN & REKENING DONASI */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-slate-800/60 pb-2">📍 Target & Rekening Donasi</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Nominal (Rp)</label>
              <input type="number" value={form.targetNominal} onChange={(e) => setForm({...form, targetNominal: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tahun Pelaksanaan</label>
              <input type="text" value={form.tahunAcara} onChange={(e) => setForm({...form, tahunAcara: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-400">Pengaturan 3 Rekening Donasi (Tampil di Dashboard)</label>
            <input type="text" value={form.bank1} onChange={(e) => setForm({...form, bank1: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" placeholder="Rekening 1" />
            <input type="text" value={form.bank2} onChange={(e) => setForm({...form, bank2: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" placeholder="Rekening 2" />
            <input type="text" value={form.bank3} onChange={(e) => setForm({...form, bank3: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" placeholder="Rekening 3" />
          </div>
        </div>

        {/* BLOK B: PROFIL ADMIN & UBAH KATA SANDI */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-slate-800/60 pb-2">👤 Akun & Keamanan Admin</h3>
          <div className="space-y-2">
            <input type="text" value={form.namaAdmin} onChange={(e) => setForm({...form, namaAdmin: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" placeholder="Nama Admin" />
            <input type="text" value={form.kontakAdmin} onChange={(e) => setForm({...form, kontakAdmin: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" placeholder="No Kontak WhatsApp" />
            <input type="email" value={form.emailAdmin} onChange={(e) => setForm({...form, emailAdmin: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" placeholder="Email Admin" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sandi Baru</label>
              <input type="password" value={form.sandiBaru} onChange={(e) => setForm({...form, sandiBaru: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" placeholder="Sandi baru..." />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Konfirmasi Sandi</label>
              <input type="password" value={form.konfirmasiSandi} onChange={(e) => setForm({...form, konfirmasiSandi: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" placeholder="Ulangi sandi..." />
            </div>
          </div>
        </div>

        {/* BLOK C: DAFTAR KATEGORI PEMASUKAN */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800/60 pb-2">📥 Kategori Jenis Pemasukan</h3>
          <div className="flex gap-2">
            <input type="text" value={inputPemasukan} onChange={(e) => setInputPemasukan(e.target.value)} placeholder="Tambah kategori pemasukan..." className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            <button type="button" onClick={() => handleAddKategori('masuk')} className="px-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500">+</button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
            {kategoriPemasukan.map((kat, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg border border-slate-800/40">
                <span className="text-slate-300">{kat}</span>
                <button type="button" onClick={() => handleRemoveKategori('masuk', index)} className="text-red-400 hover:text-red-500 font-bold px-1">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* BLOK D: DAFTAR KATEGORI PENGELUARAN */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider border-b border-slate-800/60 pb-2">📤 Kategori Jenis Pengeluaran</h3>
          <div className="flex gap-2">
            <input type="text" value={inputPengeluaran} onChange={(e) => setInputPengeluaran(e.target.value)} placeholder="Tambah kategori pengeluaran..." className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            <button type="button" onClick={() => handleAddKategori('keluar')} className="px-3 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-500">+</button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
            {kategoriPengeluaran.map((kat, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg border border-slate-800/40">
                <span className="text-slate-300">{kat}</span>
                <button type="button" onClick={() => handleRemoveKategori('keluar', index)} className="text-red-400 hover:text-red-500 font-bold px-1">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER ACTION: SATU TOMBOL SIMPAN MASSAL */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center shadow-lg">
        <p className="text-[11px] text-slate-500">Seluruh konfigurasi kategori otomatis terintegrasi ke dalam modul Transaksi.</p>
        <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all">
          💾 Simpan Semua Pengaturan
        </button>
      </div>
    </form>
  );
}
