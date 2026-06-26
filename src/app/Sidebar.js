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
    <aside className="w-64 bg-black text-white min-h-screen p-5 border-r border-gray-800 flex flex-col justify-between">
      <div>
        <div className="mb-8 px-2">
          <h1 className="text-lg font-bold tracking-wider text-yellow-500">HAUL DASHBOARD</h1>
          <p className="text-xs text-gray-500 mt-0.5">Workspace Management</p>
        </div>
        
        <nav className="space-y-1">
          {menus.map((menu, index) => (
            <Link 
              key={index} 
              href={`/${menu.slug}`}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-900 hover:text-white transition-colors"
            >
              {menu.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="px-2 pt-4 border-t border-gray-900 text-xs text-gray-500">
        Status: <span className="text-green-500 font-medium">Production</span>
      </div>
    </aside>
  );
}