'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isAdmin, onLogout }) {
  const pathname = usePathname();
  
  const menus = [
    { name: 'Dashboard', slug: '/' },
    { name: 'Transaksi', slug: '/transaksi' },
    { name: 'Anggaran', slug: '/anggaran' },
    { name: 'Kepanitiaan', slug: '/kepanitiaan' },
    { name: 'Acara & Schedule', slug: '/acara' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 min-h-screen p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div className="mb-8 px-2 text-center md:text-left">
          <h1 className="text-xl font-black tracking-wider text-amber-500 font-mono">HAUL SYSTEM</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Production v2.0</p>
        </div>
        
        <nav className="space-y-1.5">
          {menus.map((menu, index) => {
            const isActive = pathname === menu.slug || (menu.slug === '/' && pathname === '');
            return (
              <Link 
                key={index} 
                href={menu.slug}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {menu.name}
              </Link>
            );
          })}

          {/* Menu Pengaturan Hanya Muncul Jika Sudah Login Admin */}
          {isAdmin && (
            <Link 
              href="/pengaturan"
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                pathname === '/pengaturan' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              ⚙️ Pengaturan
            </Link>
          )}
        </nav>
      </div>
      
      <div className="pt-4 border-t border-slate-800 px-2">
        {isAdmin ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium">Mode: Admin</span>
            </div>
            <button 
              onClick={onLogout}
              className="w-full text-center px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-xs font-semibold transition-all duration-200"
            >
              Keluar Admin
            </button>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="block w-full text-center px-4 py-2 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-lg text-xs font-semibold transition-all duration-200"
          >
            Masuk Sebagai Admin
          </Link>
        )}
      </div>
    </aside>
  );
}