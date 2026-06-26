import Sidebar from './components/Sidebar';
import './globals.css';

export const metadata = {
  title: 'Haul Dashboard',
  description: 'Digital Workspace Administration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-neutral-950 text-neutral-100 antialiased min-h-screen">
        {/* Menu Navigasi Samping */}
        <Sidebar />
        
        {/* Konten Utama Aplikasi */}
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-gray-950 flex items-center justify-between px-8 bg-neutral-950">
            <span className="text-xs text-gray-500 font-mono">System Active</span>
          </header>
          
          <main className="p-8 flex-1 bg-neutral-900/40">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}