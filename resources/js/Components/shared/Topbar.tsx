import React, { useState } from 'react';
import { Bell, ShieldCheck, User, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  pageTitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  pageTitle = 'Dashboard',
}) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const isAdministrator = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const roleBadgeText = isAdministrator
    ? 'Administrator • All Departments'
    : user?.role === 'HOD' && user?.faculty?.department?.department_code
    ? `HOD • ${user.faculty.department.department_code}`
    : user?.role === 'FACULTY' 
    ? `Faculty • ${user.faculty?.department?.department_code || ''}`
    : user?.role;

  const displayUserName = user?.faculty?.full_name || user?.full_name || user?.email || 'User';

  const onLogoutClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-20 bg-slate-50 border-b border-brand-primary/10 border-t-4 border-t-brand-navy sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold font-heading text-brand-dark tracking-tight">{pageTitle}</h2>
        <span
          className="hidden sm:inline-flex items-center px-3 py-1 rounded-sm text-[11px] font-bold bg-white text-brand-primary border border-brand-primary/20 uppercase tracking-widest shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-accent fill-brand-accent/30" />
          {roleBadgeText}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications (Optional/Placeholder for future) */}
        <button className="text-slate-400 hover:text-brand-primary transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-brand-accent rounded-full border border-white"></span>
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <User className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <p className="text-sm font-bold text-brand-dark font-heading">{displayUserName}</p>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">{roleBadgeText}</p>
            </div>
          </div>
          
          <button
            id="topbar-logout-button"
            onClick={onLogoutClick}
            disabled={isLoggingOut}
            title={isLoggingOut ? 'Logging out...' : 'Logout of session'}
            aria-label="Logout"
            className="p-2 ml-2 rounded-lg bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all border border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600 pointer-events-none" />
            ) : (
              <LogOut className="w-4 h-4 pointer-events-none" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
