import React from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
  studentInfo?: {
    rollNumber?: string;
    division?: string;
  };
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children, studentInfo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-slate-50 to-sky-50/70 text-slate-800 flex flex-col justify-between relative overflow-hidden">
      {/* Background soft ambient shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-sky-200/30 blur-[100px] pointer-events-none" />

      {/* Student Feedback Portal Header Navbar */}
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md relative shadow-2xs">
        {/* Left Side: Branding Icon + Title + Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 leading-tight">Student Feedback Portal</h1>
            <p className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase">Anonymous & Confidential</p>
          </div>
        </div>

        {/* Right Side: Student Roll & Division Info */}
        {studentInfo?.rollNumber || studentInfo?.division ? (
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 bg-slate-100/90 px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs font-mono">
            {studentInfo.rollNumber && (
              <span>
                Roll: <span className="text-indigo-700 font-bold">{studentInfo.rollNumber}</span>
              </span>
            )}
            {studentInfo.rollNumber && studentInfo.division && (
              <span className="text-slate-300 font-normal">|</span>
            )}
            {studentInfo.division && (
              <span>
                Division: <span className="text-slate-900 font-bold">{studentInfo.division}</span>
              </span>
            )}
          </div>
        ) : null}
      </header>

      {/* Main Form Box Container */}
      <main className="flex-1 flex flex-col relative z-10 w-full">{children}</main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 relative z-10 border-t border-slate-200/80 bg-white/60">
        Strictly Confidential Evaluation Portal &bull; Academic Office
      </footer>
    </div>
  );
};

export default StudentLayout;
