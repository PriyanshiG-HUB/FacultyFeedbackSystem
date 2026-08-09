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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, isCollapsed = false, onToggleCollapse }) => {
  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '#Admin/Dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '#Admin/Analytics/Index', icon: BarChart3 },
        { name: 'Reports', href: '#Admin/Reports/Index', icon: FileText },
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
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-[#1e3a8a] border-r border-blue-900/60 flex flex-col h-[calc(100vh-41px)] fixed left-0 top-[41px] z-30 shadow-xl transition-all duration-300 ease-in-out`}
    >
      {/* Brand Header & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-blue-900/60 bg-[#162a66]">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md shadow-blue-950/40 shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-800" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-extrabold text-sm text-white tracking-tight leading-tight truncate">Faculty Feedback</h1>
              <span className="text-[10px] font-extrabold tracking-wider text-blue-200 uppercase block truncate">IT HOD Portal</span>
            </div>
          )}
        </div>

        {/* Sidebar Toggle Button */}
        {onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/80 transition-colors shrink-0"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapsed Rail Toggle Button (when collapsed) */}
      {onToggleCollapse && isCollapsed && (
        <div className="p-2 border-b border-blue-900/60 flex justify-center bg-[#162a66]">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="p-1.5 rounded-lg text-white hover:bg-blue-800/80 transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-blue-600">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-extrabold text-blue-200/90 uppercase tracking-widest">{group.title}</h3>
            )}
            <nav className="space-y-1 mt-1.5">
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
                      isCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
                    } rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-blue-950 font-extrabold shadow-md shadow-blue-950/30 border border-white/60'
                        : 'text-blue-100 hover:text-white hover:bg-blue-800/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-blue-200 group-hover:text-white'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Portal Switcher Footnote */}
      <div className="p-3 border-t border-blue-900/60 bg-[#162a66]">
        {!isCollapsed ? (
          <div className="bg-blue-950/60 rounded-xl p-3 border border-blue-800/80 text-xs">
            <p className="text-blue-200 font-semibold text-[11px]">Switch Role Portals</p>
            <div className="flex gap-2 mt-2">
              <Link
                href="#Faculty/MyReports/Index"
                className="flex-1 text-center py-1.5 bg-blue-800/80 hover:bg-blue-700 text-blue-100 rounded-lg text-[11px] font-semibold border border-blue-700/60 transition-colors"
              >
                Faculty
              </Link>
              <Link
                href="#Student/Identify"
                className="flex-1 text-center py-1.5 bg-white hover:bg-blue-50 text-blue-950 font-extrabold rounded-lg text-[11px] border border-white/60 transition-colors"
              >
                Student
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center py-1">
            <Link
              href="#Faculty/MyReports/Index"
              title="Faculty Portal"
              className="p-2 bg-blue-800 hover:bg-blue-700 text-blue-100 rounded-lg text-[10px] font-bold border border-blue-700/60"
            >
              F
            </Link>
            <Link
              href="#Student/Identify"
              title="Student Portal"
              className="p-2 bg-white hover:bg-blue-50 text-blue-950 rounded-lg text-[10px] font-extrabold border border-white/60"
            >
              S
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

