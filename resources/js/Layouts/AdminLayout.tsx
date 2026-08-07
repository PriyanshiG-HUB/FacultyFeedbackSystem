import React from 'react';
import { Sidebar } from '../Components/shared/Sidebar';
import { Topbar } from '../Components/shared/Topbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentPath?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Portal', currentPath = '' }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar currentPath={currentPath} />

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        <Topbar pageTitle={title} />
        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
