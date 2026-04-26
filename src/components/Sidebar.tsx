import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, LogOut, Package, PieChart, BarChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import logoUrl from '../assets/logo.png';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { logout, user } = useAuth();
  const [imgError, setImgError] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'CRM (Clientes)', path: '/clients', icon: Users },
    { name: 'Oportunidades (ERP)', path: '/opportunities', icon: BarChart },
    { name: 'Importações', path: '/sales', icon: Package },
    { name: 'Relatórios', path: '/reports', icon: PieChart },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-[100dvh]">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1 shrink-0">
            <img 
              src={logoUrl} 
              alt="Primeway Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight">Primeway</span>
        </div>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto text-sm font-medium">
        <div className="px-6 py-2 text-slate-500 uppercase text-[10px] tracking-widest font-bold">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-6 py-3 transition-colors",
              isActive ? "bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-500" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold">{user?.email?.[0].toUpperCase()}</span>
            )}
          </div>
          <div className="text-xs font-medium truncate">
            <p className="text-white truncate">{user?.displayName || 'Admin'}</p>
            <p className="text-slate-500 italic truncate">{user?.email || 'Gestão'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors ml-2 shrink-0"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
