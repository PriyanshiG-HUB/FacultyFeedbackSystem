import React from 'react';
import { Sidebar } from '../Components/shared/Sidebar';
import { Topbar } from '../Components/shared/Topbar';
import { getStoredUserInfo } from '../lib/api';
import { getDepartmentName } from '../utils/departmentScope';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentPath?: string;
  userName?: string;
  userRole?: string;
  userRoleType?: 'admin' | 'hod';
  departmentScope?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title = 'Dashboard',
  currentPath = '',
  userName,
  userRole,
  userRoleType,
  departmentScope,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  const storedUser = getStoredUserInfo();

  const isHodUser =
    storedUser?.role === 'HOD' ||
    storedUser?.canonical_role === 'HOD' ||
    !!storedUser?.is_hod;

  const isAdministrator =
    storedUser?.role === 'ADMIN' ||
    storedUser?.role === 'SUPER_ADMIN';

  const resolvedRole: 'admin' | 'hod' =
    userRoleType ||
    (isAdministrator ? 'admin' : isHodUser ? 'hod' : 'admin');

  const resolvedName =
    userName ||
    storedUser?.faculty?.full_name ||
    storedUser?.faculty?.name ||
    storedUser?.email ||
    (resolvedRole === 'hod' ? 'Head of Department' : 'Administrator');

  const resolvedDept =
    departmentScope ||
    storedUser?.faculty?.department?.department_name ||
    getDepartmentName(storedUser?.hod_department_code) ||
    (resolvedRole === 'hod' ? 'Department Scope' : 'All Departments');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'pl-20' : 'pl-64'
          }`}
      >
        <Topbar
          pageTitle={title}
          userName={resolvedName}
          userRole={userRole}
          userRoleType={resolvedRole}
          departmentScope={resolvedDept}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;