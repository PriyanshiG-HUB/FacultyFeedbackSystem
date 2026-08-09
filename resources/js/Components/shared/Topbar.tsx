import React from 'react';
import { Bell, ShieldCheck, User } from 'lucide-react';

interface TopbarProps {
  pageTitle?: string;
  userName?: string;
  userRole?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  pageTitle = 'Dashboard',
  userName = 'Dr. Grace Hopper',
  userRole = 'HOD — Information Technology',
}) => {
  return (
    <header className="h-16 bg-white/90 border-b border-slate-200/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8 shadow-2xs">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{pageTitle}</h2>
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
          Academic Year 2025-26
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-900">{userName}</p>
            <p className="text-[10px] text-slate-500 font-medium">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
