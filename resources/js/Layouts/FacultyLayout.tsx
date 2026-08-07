import React from 'react';
import Link from '../Components/shared/Link';
import { GraduationCap, LogOut, FileText, User } from 'lucide-react';

interface FacultyLayoutProps {
  children: React.ReactNode;
  facultyName?: string;
}

export const FacultyLayout: React.FC<FacultyLayoutProps> = ({
  children,
  facultyName = 'Dr. Sarah Jenkins',
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Faculty Navbar */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900">Faculty Portal</h1>
            <span className="text-[10px] font-semibold text-teal-700">Department of Computer Engineering</span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="#Faculty/MyReports/Index"
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-teal-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-teal-600" />
            My Feedback Reports
          </Link>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-xs font-bold text-teal-700">
              <User className="w-4 h-4 text-teal-700" />
            </div>
            <span className="text-xs font-bold text-slate-900">{facultyName}</span>
          </div>

          <Link
            href="#Faculty/Login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 hover:text-rose-600 transition-colors border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Link>
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
