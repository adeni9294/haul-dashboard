'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menus = [
    { name: 'Dashboard', slug: '/' },
    { name: 'Transaksi', slug: '/transaksi' },
    { name: 'Anggaran', slug: '/anggaran' },
    { name: 'Kepanitiaan', slug: '/kepanitiaan' },
    { name: 'Acara & Schedule', slug: '/acara' },
    { name: 'Pengaturan', slug: '/pengaturan' },
  ];

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
      
      <div className="pt-4 border-t border-slate-800 px-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        <span className="text-xs text-slate-400 font-medium">Status: Public Mode</span>
      </div>
    </aside>
  );
}
