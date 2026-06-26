import Link from 'next/link';

export default function Sidebar() {
  const menus = [
    { name: 'Bank Accounts', slug: 'bank-accounts' },
    { name: 'Budgets', slug: 'budgets' },
    { name: 'Categories', slug: 'categories' },
    { name: 'Committee', slug: 'committee' },
    { name: 'Settings', slug: 'settings' },
    { name: 'Transactions', slug: 'transactions' },
  ];

  return (
    <aside className="w-64 bg-gray-950 text-white min-h-screen p-5 border-r border-gray-800">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-wider text-amber-500">HAUL DASHBOARD</h1>
        <p className="text-xs text-gray-400 mt-1">Workspace Infrastructure</p>
      </div>
      
      <nav className="space-y-2">
        {menus.map((menu, index) => (
          <Link 
            key={index} 
            href={`/${menu.slug}`}
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
          >
            {menu.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}