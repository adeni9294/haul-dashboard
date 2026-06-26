import Sidebar from './components/Sidebar';
import './globals.css'; // pastikan css Anda ter-import

export const metadata = {
  title: 'Haul Dashboard',
  description: 'Digital Workspace Administration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-gray-900 text-gray-100 antialiased min-h-screen">
        {/* Menu Navigasi Samping */}
        <Sidebar />
        
        {/* Konten Utama Halaman */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-gray-800 flex items-center px-8 bg-gray-950/50">
            <span className="text-sm text-gray-400">Status: <span className="text-green-400 font-semibold">Live Production</span></span>
          </header>
          <main className="p-8 flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}