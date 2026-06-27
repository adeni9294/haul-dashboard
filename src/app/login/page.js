'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Autentikasi dasar awal (Nanti disinkronkan dengan tabel admin Supabase)
    if (password === 'adminhaul2026') {
      // Simpan status login di local storage atau state global
      localStorage.setItem('isAdminAuthenticated', 'true');
      alert('Login Berhasil sebagai Admin!');
      
      // Redirect langsung ke halaman pengaturan setelah sukses
      router.push('/pengaturan');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      setError('Kata sandi admin salah! Silakan coba lagi.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-amber-500 font-mono tracking-wider">LOGIN ADMIN</h2>
        <p className="text-xs text-slate-400 mt-1">Gunakan sandi pengurus untuk masuk ke mode pengelolaan data.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kata Sandi Admin</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan sandi..." 
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            required
          />
        </div>

        {error && <p className="text-xs text-red-500 font-medium font-mono">{error}</p>}

        <button 
          type="submit" 
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all"
        >
          Masuk Sistem
        </button>
      </form>
    </div>
  );
}
