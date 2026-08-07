import React from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-slate-50 to-sky-50/70 text-slate-800 flex flex-col justify-between relative overflow-hidden">
      {/* Background soft ambient shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-sky-200/30 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md relative z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900">Student Evaluation Portal</h1>
            <p className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase">Anonymous & Confidential</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SSL 256-Bit Encrypted</span>
        </div>
      </header>

      {/* Main Form Box Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6 relative z-10">
        <div className="w-full max-w-3xl">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 relative z-10 border-t border-slate-200/80 bg-white/60">
        Strictly Confidential Evaluation Portal &bull; Academic Office
      </footer>
    </div>
  );
};

export default StudentLayout;
