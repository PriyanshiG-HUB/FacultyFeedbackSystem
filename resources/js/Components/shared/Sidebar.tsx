import React from 'react';
import Link from './Link';
import { useAuth } from '../../context/AuthContext';
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
  UserCheck,
  AlertTriangle,
  Settings,
  User,
  GraduationCap as StudentIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, isCollapsed = false, onToggleCollapse }) => {
  const { user } = useAuth();

  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '#Admin/Dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '#Admin/Analytics/Index', icon: BarChart3 },
        { name: 'Reports', href: '#Admin/Reports/Index', icon: FileText },
        { name: 'Faculty Reports', href: '#Admin/FacultyReports/Index', icon: UserCheck },
      ],
    },
    {
      title: 'FEEDBACK',
      items: [
        { name: 'Publish Form', href: '#Admin/Feedback/PublishForm', icon: Send },
        { name: 'Critical Feedback', href: '#Admin/CriticalComments/Index', icon: AlertTriangle },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { name: 'Departments', href: '#Admin/Departments/Index', icon: Building2 },
        { name: 'Faculty Directory', href: '#Admin/Faculty/Index', icon: Users },
        { name: 'Subjects', href: '#Admin/Subjects/Index', icon: BookOpen },
        { name: 'Divisions', href: '#Admin/Divisions/Index', icon: Layers },
        { name: 'Sections', href: '#Admin/Sections/Index', icon: Layers },
        { name: 'Batches', href: '#Admin/Batches/Index', icon: GraduationCap },
        { name: 'Academic Years', href: '#Admin/AcademicYears/Index', icon: CalendarRange },
        { name: 'Students', href: '#Admin/Students/Index', icon: StudentIcon },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Elective Catalog', href: '#Admin/Electives/Index', icon: FileSpreadsheet },
        { name: 'Session Allocations', href: '#Admin/SessionAssignments/Index', icon: CalendarRange },
        { name: 'Timetables', href: '#Admin/Timetables/Index', icon: CalendarRange },
        { name: 'Data Import', href: '#Admin/FeedbackImport/Index', icon: UploadCloud },
        { name: 'Profile & Account', href: '#Admin/Profile', icon: User },
        { name: 'System Settings', href: '#Admin/Settings/Index', icon: Settings },
      ],
    },
  ];

  const roleText = user?.role === 'SUPER_ADMIN' ? 'Super Admin' 
                 : user?.role === 'ADMIN' ? 'Administrator'
                 : user?.role === 'HOD' ? 'Head of Department'
                 : user?.role === 'FACULTY' ? 'Faculty Member'
                 : 'Staff';

  const deptText = user?.faculty?.department?.name || '';

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-brand-dark flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300 ease-in-out border-r border-brand-navy`}
    >
      {/* Brand Header & Toggle */}
      <div className="flex flex-col border-b border-brand-navy/60 bg-brand-dark pb-4 relative">
        <div className="h-16 flex items-center justify-between px-4">
          <div className="flex-1 flex justify-center">
            <img src="/main_logo.png" alt="Main CHARUSAT Logo" className={`object-contain transition-all duration-300 ${isCollapsed ? 'h-10 w-10 rounded-full' : 'h-14 w-14 mt-4 bg-white p-1 rounded-sm shadow-md shadow-brand-navy/50'}`} />
          </div>
          {/* Sidebar Toggle Button */}
          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="absolute right-2 top-4 p-1.5 rounded-lg text-slate-400 hover:text-brand-accent hover:bg-brand-navy/80 transition-colors shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex flex-col items-center mt-3 px-4 text-center">
            <h1 className="font-heading font-extrabold text-brand-accent tracking-wide leading-tight text-sm uppercase">
              CHARUSAT
            </h1>
            <h2 className="text-[11px] font-medium text-white/90 mt-0.5">
              Faculty Feedback System
            </h2>
            
            <div className="mt-4 w-full bg-brand-navy/40 border border-brand-primary/30 rounded-sm p-2 flex flex-col items-center">
              <span className="text-[10px] uppercase font-semibold tracking-widest text-brand-accent/70">{roleText}</span>
              {deptText && (
                <span className="text-xs font-bold text-white truncate max-w-full mt-0.5" title={deptText}>{deptText}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Collapsed Rail Toggle Button */}
      {onToggleCollapse && isCollapsed && (
        <div className="p-2 border-b border-brand-navy flex justify-center bg-brand-dark">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-accent hover:bg-brand-navy transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-8 scrollbar-thin scrollbar-thumb-brand-navy">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-heading font-bold text-brand-accent/60 uppercase tracking-[0.2em]">
                {group.title}
              </h3>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const itemPath = item.href.replace('#', '');
                const normCurrentPath = currentPath.replace('#', '');
                const isActive = normCurrentPath === itemPath || normCurrentPath.startsWith(`${itemPath}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center gap-3 ${
                      isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
                    } rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-primary text-white border border-brand-primary/50 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-brand-navy border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brand-accent' : 'text-slate-400 group-hover:text-brand-accent/70'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Portal Switcher Footnote */}
      <div className="p-4 border-t border-brand-navy bg-brand-dark">
        {!isCollapsed ? (
          <div className="bg-brand-navy/50 rounded-lg p-3 border border-brand-navy">
            <p className="text-slate-400 font-medium text-xs mb-2">Switch Portal</p>
            <div className="flex gap-2">
              <Link
                href="#Faculty/MyReports/Index"
                className="flex-1 text-center py-2 bg-brand-navy hover:bg-brand-primary text-slate-200 hover:text-white rounded text-xs font-medium transition-colors border border-brand-primary/30"
              >
                Faculty
              </Link>
              <Link
                href="#Student/Identify"
                className="flex-1 text-center py-2 bg-brand-accent hover:brightness-95 text-brand-dark font-semibold rounded text-xs transition-colors"
              >
                Student
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <Link
              href="#Faculty/MyReports/Index"
              title="Faculty Portal"
              className="w-10 h-10 flex items-center justify-center bg-brand-navy hover:bg-brand-primary text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors border border-brand-primary/30"
            >
              F
            </Link>
            <Link
              href="#Student/Identify"
              title="Student Portal"
              className="w-10 h-10 flex items-center justify-center bg-brand-accent hover:brightness-95 text-brand-dark rounded-lg text-xs font-bold transition-colors"
            >
              S
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
