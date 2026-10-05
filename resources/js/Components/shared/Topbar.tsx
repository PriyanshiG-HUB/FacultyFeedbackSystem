import React, { useState } from 'react';
import { Bell, ShieldCheck, User, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredUserInfo } from '../../lib/api';
import { getDepartmentName } from '../../utils/departmentScope';

import Link from './Link';

interface TopbarProps {
  pageTitle?: string;
  userName?: string;
  userRole?: string;
  userRoleType?: 'admin' | 'hod';
  departmentScope?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  pageTitle = 'Dashboard',
  userName,
  userRole,
  userRoleType,
  departmentScope,
}) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  /*
   * Preserve the real authenticated user from AuthContext.
   * Fall back to stored user information only when necessary.
   */
  const storedUser = getStoredUserInfo();

  const isHodUser =
    user?.role === 'HOD' ||
    storedUser?.role === 'HOD' ||
    storedUser?.canonical_role === 'HOD' ||
    !!storedUser?.is_hod;

  const isAdministrator =
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    storedUser?.role === 'ADMIN' ||
    storedUser?.role === 'SUPER_ADMIN';

  const effectiveRoleType: 'admin' | 'hod' =
    userRoleType || (isAdministrator ? 'admin' : isHodUser ? 'hod' : 'admin');

  const resolvedUserName =
    user?.faculty?.full_name ||
    user?.full_name ||
    user?.email ||
    userName ||
    storedUser?.faculty?.full_name ||
    storedUser?.faculty?.name ||
    storedUser?.email ||
    (effectiveRoleType === 'hod' ? 'Head of Department' : 'Administrator');

  const resolvedDeptScope =
    user?.faculty?.department?.department_name ||
    departmentScope ||
    storedUser?.faculty?.department?.department_name ||
    getDepartmentName(storedUser?.hod_department_code) ||
    (effectiveRoleType === 'hod' ? 'Department Scope' : 'All Departments');

  const roleBadgeText = isAdministrator
    ? 'Administrator • All Departments'
    : isHodUser
      ? `HOD • ${resolvedDeptScope}`
      : user?.role || userRole || effectiveRoleType;

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
        <h2 className="text-2xl font-bold font-heading text-brand-dark tracking-tight">
          {pageTitle}
        </h2>

        <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-sm text-[11px] font-bold bg-white text-brand-primary border border-brand-primary/20 uppercase tracking-widest shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-accent fill-brand-accent/30" />
          {roleBadgeText}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button
          type="button"
          className="text-slate-400 hover:text-brand-primary transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />

          <span className="absolute top-0 right-0 w-2 h-2 bg-brand-accent rounded-full border border-white" />
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
          <Link
            href="#Admin/Profile"
            title="Manage Profile & Password Settings"
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-brand-navy group-hover:bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors">
              <User className="w-4 h-4 text-brand-accent" />
            </div>

            <div className="hidden md:flex flex-col text-left leading-tight">
              <p className="text-sm font-bold text-brand-dark group-hover:text-brand-primary font-heading transition-colors">
                {resolvedUserName}
              </p>

              <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                {roleBadgeText}
              </p>
            </div>
          </Link>

          <button
            type="button"
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