import React from 'react';
import { Sidebar } from '../Components/shared/Sidebar';
import { Topbar } from '../Components/shared/Topbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentPath?: string;
  userName?: string;
  userRole?: 'admin' | 'hod';
  departmentScope?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title = 'Dashboard',
  currentPath = '',
  userName,
  userRole,
  departmentScope,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
        <Topbar
          pageTitle={title}
          userName={userName}
          userRoleType={userRole}
          departmentScope={departmentScope}
        />
        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
