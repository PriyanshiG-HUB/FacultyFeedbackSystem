import React, { useState } from 'react';
import { User, LogOut, Loader2 } from 'lucide-react';
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
    <header className="h-16 bg-slate-50 border-b border-brand-primary/10 border-t-4 border-t-brand-navy sticky top-0 z-40 flex items-center justify-end px-4 sm:px-6 shadow-sm">
      {/* Minimal Right Header: User Info & Logout */}
      <div className="flex items-center gap-3">
        <Link
          href="#Admin/Profile"
          title="Manage Profile & Password Settings"
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-brand-navy group-hover:bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors">
            <User className="w-4 h-4 text-brand-accent" />
          </div>

          <div className="flex flex-col text-left leading-tight">
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
          className="p-2 ml-1 rounded-lg bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all border border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-600 pointer-events-none" />
          ) : (
            <LogOut className="w-4 h-4 pointer-events-none" />
          )}
        </button>
      </div>
    </header>
  );
};