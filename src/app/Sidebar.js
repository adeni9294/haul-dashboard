'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // Cek status login admin secara realtime saat halaman dimuat
  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdmin(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAdmin(false);
    alert('Anda telah keluar dari Mode Admin.');
    router.push('/');
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const menus = [
    { name: 'Dashboard', slug: '/' },
    { name: 'Transaksi', slug: '/transaksi' },
    { name: 'Anggaran', slug: '/anggaran' },
    { name: 'Kepanitiaan', slug: '/kepanitiaan' },
    { name: 'Acara & Schedule', slug: '/acara' },
  ];

  // Tambahkan menu Pengaturan ke daftar jika admin terverifikasi
  if (isAdmin) {
    menus.push({ name: 'Pengaturan', slug: '/pengaturan' });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 min-h-screen p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div className="mb-8 px-2">
          <h1 className="text-lg font-black tracking-wider text-amber-500 font-mono">HAUL SYSTEM</h1>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-semibold">Workspace Management</p>
        </div>
        
        <nav className="space-y-1.5">
          {menus.map((menu, index) => {
            const isActive = pathname === menu.slug || (menu.slug === '/' && pathname === '');
            return (
              <Link 
                key={index} 
                href={menu.slug}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {menu.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="pt-4 border-t border-slate-800 px-2">
        {isAdmin ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium font-mono">Mode: Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full text-center px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200"
            >
              Keluar Admin
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium font-mono">Mode: Publik</span>
            </div>
            <Link 
              href="/login" 
              className="block w-full text-center px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-xl text-xs font-bold transition-all duration-200"
            >
              🔒 Masuk Admin
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
