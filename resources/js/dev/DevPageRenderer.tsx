import React, { useState, useEffect } from 'react';
import { mockPropsMap } from './mockProps';

// Admin Page Imports
import AdminDashboard from '../Pages/Admin/Dashboard';
import AdminDepartmentsIndex from '../Pages/Admin/Departments/Index';
import AdminDepartmentsCreate from '../Pages/Admin/Departments/Create';
import AdminFacultyIndex from '../Pages/Admin/Faculty/Index';
import AdminSubjectsIndex from '../Pages/Admin/Subjects/Index';
import AdminDivisionsIndex from '../Pages/Admin/Divisions/Index';
import AdminBatchesIndex from '../Pages/Admin/Batches/Index';
import AdminStudentsIndex from '../Pages/Admin/Students/Index';
import AdminElectivesIndex from '../Pages/Admin/Electives/Index';
import AdminElectiveEnrollment from '../Pages/Admin/Electives/Enrollment';
import AdminSessionAssignmentsIndex from '../Pages/Admin/SessionAssignments/Index';
import AdminFeedbackImportIndex from '../Pages/Admin/FeedbackImport/Index';
import AdminAnalyticsIndex from '../Pages/Admin/Analytics/Index';
import AdminReportsIndex from '../Pages/Admin/Reports/Index';
import AdminCriticalCommentsIndex from '../Pages/Admin/CriticalComments/Index';
import AdminSettingsIndex from '../Pages/Admin/Settings/Index';

// Faculty Page Imports
import FacultyLogin from '../Pages/Faculty/Login';
import FacultyReportsIndex from '../Pages/Faculty/MyReports/Index';
import FacultyReportShow from '../Pages/Faculty/MyReports/Show';

// Student Page Imports
import StudentIdentify from '../Pages/Student/Identify';
import StudentFeedbackShow from '../Pages/Student/Feedback/Show';

import { Monitor, Layers, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

const componentRegistry: Record<string, React.ComponentType<any>> = {
  'Admin/Dashboard': AdminDashboard,
  'Admin/Departments/Index': AdminDepartmentsIndex,
  'Admin/Departments/Create': AdminDepartmentsCreate,
  'Admin/Faculty/Index': AdminFacultyIndex,
  'Admin/Subjects/Index': AdminSubjectsIndex,
  'Admin/Divisions/Index': AdminDivisionsIndex,
  'Admin/Batches/Index': AdminBatchesIndex,
  'Admin/Students/Index': AdminStudentsIndex,
  'Admin/Electives/Index': AdminElectivesIndex,
  'Admin/Electives/Enrollment': AdminElectiveEnrollment,
  'Admin/SessionAssignments/Index': AdminSessionAssignmentsIndex,
  'Admin/FeedbackImport/Index': AdminFeedbackImportIndex,
  'Admin/Analytics/Index': AdminAnalyticsIndex,
  'Admin/Reports/Index': AdminReportsIndex,
  'Admin/CriticalComments/Index': AdminCriticalCommentsIndex,
  'Admin/Settings/Index': AdminSettingsIndex,
  'Faculty/Login': FacultyLogin,
  'Faculty/MyReports/Index': FacultyReportsIndex,
  'Faculty/MyReports/Show': FacultyReportShow,
  'Student/Identify': StudentIdentify,
  'Student/Feedback/Show': StudentFeedbackShow,
};

export const DevPageRenderer: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('Admin/Dashboard');
  const [devRoleMode, setDevRoleMode] = useState<string>('admin');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && componentRegistry[hash]) {
        setActivePage(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changePage = (pageKey: string) => {
    setActivePage(pageKey);
    window.location.hash = `#${pageKey}`;
  };

  const PageComponent = componentRegistry[activePage] || AdminDashboard;
  const baseProps = mockPropsMap[activePage] || mockPropsMap['Admin/Dashboard'];

  // Role Scope Mock Props Generation
  const isHodRole = devRoleMode.startsWith('hod_');
  const userRole = isHodRole ? 'hod' : 'admin';
  
  let assignedDepartmentCode: string | null = null;
  let hodInfo = baseProps.hodInfo || {
    name: 'Administrator',
    role: 'System Administrator',
    department: 'All Departments',
    departmentCode: 'ALL',
  };

  if (devRoleMode === 'hod_ce') {
    assignedDepartmentCode = 'CE';
    hodInfo = {
      name: 'Dr. Alan Turing',
      role: 'Head of Department (HOD)',
      department: 'Computer Engineering',
      departmentCode: 'CE',
    };
  } else if (devRoleMode === 'hod_it') {
    assignedDepartmentCode = 'IT';
    hodInfo = {
      name: 'Dr. Grace Hopper',
      role: 'Head of Department (HOD)',
      department: 'Information Technology',
      departmentCode: 'IT',
    };
  } else if (devRoleMode === 'hod_cse') {
    assignedDepartmentCode = 'CSE';
    hodInfo = {
      name: 'Dr. Donald Knuth',
      role: 'Head of Department (HOD)',
      department: 'Computer Science & Engineering',
      departmentCode: 'CSE',
    };
  } else {
    hodInfo = {
      name: 'Administrator',
      role: 'System Administrator',
      department: 'All Departments',
      departmentCode: 'ALL',
    };
  }

  const activeProps = {
    ...baseProps,
    userRole,
    assignedDepartmentCode,
    hodInfo,
    departmentName: hodInfo.department,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative">
      {/* Dev Harness Header Bar - Embedded at the top header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md">
        <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Brand & Active Inertia Route */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-100 text-xs">Inertia Dev Switcher</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 font-mono">
                Inertia::render('<span className="text-emerald-400 font-bold">{activePage}</span>')
              </span>
            </div>
          </div>

          {/* Controller Page Selector Dropdown */}
          <div className="flex items-center gap-2 flex-1 max-w-sm justify-center">
            <label className="hidden md:inline-block text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Page:
            </label>
            <select
              value={activePage}
              onChange={(e) => changePage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
            >
              <optgroup label="ADMIN CONTROLLERS">
                <option value="Admin/Dashboard">Admin &rarr; Dashboard</option>
                <option value="Admin/Departments/Index">Admin &rarr; Departments/Index</option>
                <option value="Admin/Departments/Create">Admin &rarr; Departments/Create</option>
                <option value="Admin/Faculty/Index">Admin &rarr; Faculty/Index</option>
                <option value="Admin/Subjects/Index">Admin &rarr; Subjects/Index</option>
                <option value="Admin/Divisions/Index">Admin &rarr; Divisions/Index</option>
                <option value="Admin/Batches/Index">Admin &rarr; Batches/Index</option>
                <option value="Admin/Students/Index">Admin &rarr; Students/Index</option>
                <option value="Admin/Electives/Index">Admin &rarr; Electives/Index</option>
                <option value="Admin/Electives/Enrollment">Admin &rarr; Electives/Enrollment</option>
                <option value="Admin/SessionAssignments/Index">Admin &rarr; SessionAssignments/Index</option>
                <option value="Admin/FeedbackImport/Index">Admin &rarr; FeedbackImport/Index</option>
                <option value="Admin/Analytics/Index">Admin &rarr; Analytics/Index</option>
                <option value="Admin/Reports/Index">Admin &rarr; Reports/Index</option>
                <option value="Admin/CriticalComments/Index">Admin &rarr; CriticalComments/Index</option>
                <option value="Admin/Settings/Index">Admin &rarr; Settings/Index</option>
              </optgroup>
              <optgroup label="FACULTY CONTROLLERS">
                <option value="Faculty/Login">Faculty &rarr; Login</option>
                <option value="Faculty/MyReports/Index">Faculty &rarr; MyReports/Index</option>
                <option value="Faculty/MyReports/Show">Faculty &rarr; MyReports/Show</option>
              </optgroup>
              <optgroup label="STUDENT CONTROLLERS">
                <option value="Student/Identify">Student &rarr; Identify</option>
                <option value="Student/Feedback/Show">Student &rarr; Feedback/Show</option>
              </optgroup>
            </select>
          </div>

          {/* Dev Role Preview Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <label className="hidden lg:inline-block text-[11px] font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap">
              Preview Access Level:
            </label>
            <select
              value={devRoleMode}
              onChange={(e) => setDevRoleMode(e.target.value)}
              className="bg-amber-950/80 border border-amber-600/70 hover:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-amber-200 font-extrabold focus:outline-none cursor-pointer"
            >
              <option value="admin">Administrator &mdash; All Departments</option>
              <option value="hod_ce">HOD &mdash; Computer Engineering</option>
              <option value="hod_it">HOD &mdash; Information Technology</option>
              <option value="hod_cse">HOD &mdash; CSE</option>
            </select>
          </div>

          {/* Role Shortcut Badges & Compact Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDevRoleMode('admin');
                changePage('Admin/Dashboard');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                userRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => changePage('Faculty/MyReports/Index')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                activePage.startsWith('Faculty/')
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => changePage('Student/Feedback/Show')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                activePage.startsWith('Student/')
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
          </div>
        </div>
      </header>

      {/* Render Active Inertia Page with Injected Controller Props */}
      <PageComponent {...activeProps} />
    </div>
  );
};

export default DevPageRenderer;
