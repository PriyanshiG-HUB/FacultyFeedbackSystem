import React from 'react';
import Link from './Link';
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  FileSpreadsheet,
  CalendarRange,
  UploadCloud,
  BarChart3,
  FileText,
  AlertTriangle,
  Settings,
  GraduationCap as StudentIcon,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '#Admin/Dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '#Admin/Analytics', icon: BarChart3 },
        { name: 'Reports', href: '#Admin/Reports', icon: FileText },
        { name: 'Critical Feedback', href: '#Admin/CriticalComments', icon: AlertTriangle },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { name: 'Departments', href: '#Admin/Departments/Index', icon: Building2 },
        { name: 'Faculty Directory', href: '#Admin/Faculty/Index', icon: Users },
        { name: 'Subjects', href: '#Admin/Subjects/Index', icon: BookOpen },
        { name: 'Divisions', href: '#Admin/Divisions/Index', icon: Layers },
        { name: 'Batches', href: '#Admin/Batches/Index', icon: GraduationCap },
        { name: 'Students', href: '#Admin/Students/Index', icon: StudentIcon },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Elective Catalog', href: '#Admin/Electives/Index', icon: FileSpreadsheet },
        { name: 'Session Allocations', href: '#Admin/SessionAssignments/Index', icon: CalendarRange },
        { name: 'Data Import', href: '#Admin/FeedbackImport/Index', icon: UploadCloud },
        { name: 'System Settings', href: '#Admin/Settings/Index', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-[calc(100vh-41px)] fixed left-0 top-[41px] z-30 shadow-xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 bg-white">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-600/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">Faculty Feedback</h1>
          <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase">Academic Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{group.title}</h3>
            <nav className="space-y-0.5 mt-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href || currentPath.replace('#', '') === item.href.replace('#', '');

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Portal Switcher Footnote */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs text-xs">
          <p className="text-slate-500 font-semibold">Switch Role Portals</p>
          <div className="flex gap-2 mt-2">
            <Link
              href="#Faculty/MyReports/Index"
              className="flex-1 text-center py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold border border-slate-200/60"
            >
              Faculty
            </Link>
            <Link
              href="#Student/Identify"
              className="flex-1 text-center py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold border border-indigo-200/60"
            >
              Student
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
