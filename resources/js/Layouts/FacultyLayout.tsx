import React, { useState } from 'react';
import Link from '../Components/shared/Link';
import { GraduationCap, LogOut, FileText, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FacultyLayoutProps {
  children: React.ReactNode;
}

export const FacultyLayout: React.FC<FacultyLayoutProps> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const facultyName = user?.faculty?.full_name || user?.full_name || user?.email || 'Faculty';
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Faculty Navbar */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-navy to-indigo-900 flex items-center justify-center shadow-md shadow-indigo-900/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900">Faculty Portal</h1>
            <span className="text-[10px] font-semibold text-brand-navy">Feedback Dashboard</span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="#Faculty/MyReports/Index"
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-brand-navy transition-colors"
          >
            <FileText className="w-4 h-4 text-brand-primary" />
            My Feedback Reports
          </Link>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 border border-indigo-200 flex items-center justify-center text-xs font-bold text-brand-navy">
              <User className="w-4 h-4 text-brand-navy" />
            </div>
            <span className="text-xs font-bold text-slate-900">{facultyName}</span>
          </div>

          <button
            id="faculty-logout-button"
            onClick={onLogoutClick}
            disabled={isLoggingOut}
            aria-label="Logout"
            title={isLoggingOut ? 'Logging out...' : 'Logout of session'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 hover:text-rose-600 transition-colors border border-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600 pointer-events-none" />
            ) : (
              <LogOut className="w-3.5 h-3.5 pointer-events-none" />
            )}
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">{children}</main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        Faculty Feedback System &copy; 2026 Academic Evaluation Division
      </footer>
    </div>
  );
};

export default FacultyLayout;
