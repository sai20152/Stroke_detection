
import React from 'react';
import { mockAuth } from '../services/firebaseMock';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, activeView }) => {
  const user = mockAuth.getCurrentUser();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'tests', label: 'Test Records', icon: '🔊' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">N</div>
            <h1 className="text-xl font-bold tracking-tight">NeuroVoice</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 ml-13">Stroke Detection AI</p>
        </div>

        <nav className="flex-1 mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-colors ${
                activeView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-semibold capitalize text-slate-800">
            {activeView}
          </h2>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500">System Status: <span className="text-green-500 font-medium">Online</span></span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
