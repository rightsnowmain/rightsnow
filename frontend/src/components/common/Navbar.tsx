import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'ප්‍රධාන පිටුව (Home)', path: '/' },
  { name: 'සියලු ලිපි (Articles)', path: '/articles' },
  { name: 'ලේඛනාගාරය (Archive)', path: '/archive' },
  { name: 'පුවත්පත් (Newspapers)', path: '/newspapers' },
  { name: 'කතුවරුන් (Authors)', path: '/authors' },
  { name: 'ප්‍රවර්ග (Categories)', path: '/categories' },
  { name: 'අප ගැන (About)', path: '/about' },
  { name: 'සම්බන්ධීකරණය (Contact)', path: '/contact' },
];

export const Navbar: React.FC = () => {
  return (
    <nav className="border-t border-slate-200 bg-white shadow-sm overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-4 py-2 text-sm font-semibold whitespace-nowrap">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md transition ${
                isActive
                  ? 'bg-rose-50 text-rose-900 border-b-2 border-rose-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
