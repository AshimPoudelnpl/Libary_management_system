import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path) => {
    return location.pathname === path
      ? 'bg-indigo-600 text-white'
      : 'text-gray-700 hover:bg-gray-100';
  };

  const adminMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/books', icon: '📚', label: 'Books' },
    { path: '/users', icon: '👥', label: 'Users' },
    { path: '/issues', icon: '📋', label: 'Issues' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const userMenuItems = [
    { path: '/user-dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/catalog', icon: '📚', label: 'Catalog' },
    { path: '/my-books', icon: '📖', label: 'My Books' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <aside
      className={`bg-white shadow-lg transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } min-h-[calc(100vh-4rem)] fixed left-0 top-16 z-40`}
    >
      <div className="flex flex-col h-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 text-gray-600 hover:bg-gray-100 transition"
        >
          <span className="text-2xl">{isOpen ? '◀' : '▶'}</span>
        </button>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive(
                item.path
              )}`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

