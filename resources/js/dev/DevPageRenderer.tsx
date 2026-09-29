import React, { useState, useEffect } from 'react';
import { mockPropsMap } from './mockProps';
import { getAuthToken, setAuthToken, api, setStoredUserInfo, getStoredUserInfo, removeAuthToken } from '../lib/api';

// Admin Page Imports
import AdminDashboard from '../Pages/Admin/Dashboard';
import AdminDepartmentsIndex from '../Pages/Admin/Departments/Index';
import AdminDepartmentsCreate from '../Pages/Admin/Departments/Create';
import AdminFacultyIndex from '../Pages/Admin/Faculty/Index';
import AdminSubjectsIndex from '../Pages/Admin/Subjects/Index';
import AdminDivisionsIndex from '../Pages/Admin/Divisions/Index';
import AdminSectionsIndex from '../Pages/Admin/Sections/Index';
import AdminBatchesIndex from '../Pages/Admin/Batches/Index';
import AdminAcademicYearsIndex from '../Pages/Admin/AcademicYears/Index';
import AdminStudentsIndex from '../Pages/Admin/Students/Index';
import AdminElectivesIndex from '../Pages/Admin/Electives/Index';
import AdminElectiveEnrollment from '../Pages/Admin/Electives/Enrollment';
import AdminSessionAssignmentsIndex from '../Pages/Admin/SessionAssignments/Index';
import AdminFeedbackImportIndex from '../Pages/Admin/FeedbackImport/Index';
import AdminAnalyticsIndex from '../Pages/Admin/Analytics/Index';
import AdminReportsIndex from '../Pages/Admin/Reports/Index';
import AdminFacultyReportsIndex from '../Pages/Admin/FacultyReports/Index';
import AdminCriticalCommentsIndex from '../Pages/Admin/CriticalComments/Index';
import AdminSettingsIndex from '../Pages/Admin/Settings/Index';
import AdminPublishForm from '../Pages/Admin/Feedback/PublishForm';
import AdminTimetablesIndex from '../Pages/Admin/Timetables/Index';

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
  'Admin/Sections/Index': AdminSectionsIndex,
  'Admin/Batches/Index': AdminBatchesIndex,
  'Admin/AcademicYears/Index': AdminAcademicYearsIndex,
  'Admin/Students/Index': AdminStudentsIndex,
  'Admin/Electives/Index': AdminElectivesIndex,
  'Admin/Electives/Enrollment': AdminElectiveEnrollment,
  'Admin/SessionAssignments/Index': AdminSessionAssignmentsIndex,
  'Admin/FeedbackImport/Index': AdminFeedbackImportIndex,
  'Admin/Analytics/Index': AdminAnalyticsIndex,
  'Admin/Reports/Index': AdminReportsIndex,
  'Admin/FacultyReports/Index': AdminFacultyReportsIndex,
  'Admin/CriticalComments/Index': AdminCriticalCommentsIndex,
  'Admin/Settings/Index': AdminSettingsIndex,
  'Admin/Feedback/PublishForm': AdminPublishForm,
  'Admin/Timetables/Index': AdminTimetablesIndex,
  'Faculty/Login': FacultyLogin,
  'Faculty/MyReports/Index': FacultyReportsIndex,
  'Faculty/MyReports/Show': FacultyReportShow,
  'Student/Identify': StudentIdentify,
  'Student/Feedback/Show': StudentFeedbackShow,
};

const isPublicPage = (pageKey: string): boolean => {
  return pageKey === 'Faculty/Login' || pageKey === 'Student/Identify';
};

const getInitialPage = (): string => {
  const hash = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
  const token = getAuthToken();
  if (!token) {
    if (hash === 'Student/Identify') return 'Student/Identify';
    return 'Faculty/Login';
  }
  if (hash && componentRegistry[hash]) {
    return hash;
  }
  const storedUser = getStoredUserInfo();
  if (storedUser?.role === 'STUDENT') return 'Student/Feedback/Show';
  if (storedUser?.role === 'FACULTY') return 'Faculty/MyReports/Index';
  return 'Admin/Dashboard';
};

export const DevPageRenderer: React.FC = () => {
  const [activePage, setActivePage] = useState<string>(getInitialPage);
  const [devRoleMode, setDevRoleMode] = useState<string>('admin');
  const [studentDivisionMode, setStudentDivisionMode] = useState<string>('Division 1');
  const [authUser, setAuthUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getAuthToken();
      const currentRoute = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];

      if (!token) {
        if (isMounted) {
          setAuthUser(null);
          setIsAuthReady(true);
          if (!isPublicPage(currentRoute)) {
            const target = 'Faculty/Login';
            window.location.hash = `#${target}`;
            setActivePage(target);
          }
        }
        return;
      }

      try {
        const meRes = await api.get('/auth/me');
        if (meRes?.user && isMounted) {
          setAuthUser(meRes.user);
          setStoredUserInfo(meRes.user);
        } else if (isMounted) {
          removeAuthToken();
          setAuthUser(null);
          if (!isPublicPage(currentRoute)) {
            window.location.hash = '#Faculty/Login';
            setActivePage('Faculty/Login');
          }
        }
      } catch (err) {
        if (isMounted) {
          removeAuthToken();
          setAuthUser(null);
          if (!isPublicPage(currentRoute)) {
            window.location.hash = '#Faculty/Login';
            setActivePage('Faculty/Login');
          }
        }
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    initAuth();

    const handleHashChange = () => {
      const routeKey = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
      const token = getAuthToken();

      if (!token && !isPublicPage(routeKey)) {
        const target = 'Faculty/Login';
        window.location.hash = `#${target}`;
        setActivePage(target);
        return;
      }

      if (routeKey && componentRegistry[routeKey]) {
        setActivePage(routeKey);
      }
    };

    const handleAuthLogout = () => {
      if (isMounted) {
        setAuthUser(null);
        setActivePage('Faculty/Login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      isMounted = false;
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const changePage = (pageKey: string) => {
    const token = getAuthToken();
    if (!token && !isPublicPage(pageKey)) {
      window.location.hash = '#Faculty/Login';
      setActivePage('Faculty/Login');
      return;
    }
    setActivePage(pageKey);
    window.location.hash = `#${pageKey}`;
  };

  const isCurrentPublic = isPublicPage(activePage);
  const currentToken = getAuthToken();
  const PageComponent = (!currentToken && !isCurrentPublic)
    ? (activePage.startsWith('Student/') ? StudentIdentify : FacultyLogin)
    : (componentRegistry[activePage] || (currentToken ? AdminDashboard : FacultyLogin));
  const baseProps = mockPropsMap[activePage] || mockPropsMap[currentToken ? 'Admin/Dashboard' : 'Faculty/Login'];

  // Role Scope Props Generation (Real Authenticated User vs Dev Switcher)
  let userRole: 'admin' | 'hod' = devRoleMode.startsWith('hod_') ? 'hod' : 'admin';
  let assignedDepartmentCode: string | null = null;
  let hodInfo = {
    name: 'Administrator',
    role: 'System Administrator',
    department: 'All Departments',
    departmentCode: 'ALL',
  };

  if (authUser) {
    const isHodUser = authUser.role === 'HOD' || authUser.canonical_role === 'HOD' || !!authUser.is_hod;
    if (isHodUser) {
      userRole = 'hod';
      assignedDepartmentCode = authUser.hod_department_code || authUser.faculty?.department?.department_code || null;
      hodInfo = {
        name: authUser.faculty?.full_name || authUser.email || 'Head of Department',
        role: 'Head of Department',
        department: authUser.faculty?.department?.department_name || 'Department Scope',
        departmentCode: assignedDepartmentCode || 'DEPT',
      };
    } else if (authUser.role === 'SUPER_ADMIN' || authUser.role === 'ADMIN') {
      userRole = 'admin';
      assignedDepartmentCode = null;
    }
  } else {
    if (devRoleMode === 'hod_ce') {
      assignedDepartmentCode = 'CE';
      hodInfo = {
        name: 'Dr. Robert Vance',
        role: 'Head of Department',
        department: 'Computer Engineering',
        departmentCode: 'CE',
      };
    } else if (devRoleMode === 'hod_it') {
      assignedDepartmentCode = 'IT';
      hodInfo = {
        name: 'Dr. Sarah Jenkins',
        role: 'Head of Department',
        department: 'Information Technology',
        departmentCode: 'IT',
      };
    } else if (devRoleMode === 'hod_cse') {
      assignedDepartmentCode = 'CSE';
      hodInfo = {
        name: 'Dr. Vikram Shah',
        role: 'Head of Department',
        department: 'Computer Science & Engineering',
        departmentCode: 'CSE',
      };
    } else if (devRoleMode === 'hod_aiml') {
      assignedDepartmentCode = 'AIML';
      hodInfo = {
        name: 'Dr. Anita Roy',
        role: 'Head of Department',
        department: 'Artificial Intelligence & Machine Learning',
        departmentCode: 'AIML',
      };
    }
  }

  const studentProp = baseProps?.student
    ? {
        ...baseProps.student,
        division: studentDivisionMode,
        divisionCode: studentDivisionMode === 'Division A' ? 'IT-1' : 'IT-2',
      }
    : undefined;

  const activeProps = {
    ...baseProps,
    ...(studentProp ? { student: studentProp } : {}),
    userRole,
    assignedDepartmentCode,
    hodInfo,
    departmentName: hodInfo.department,
    ...(authUser && activePage.startsWith('Faculty/') ? {
      facultyName: authUser.faculty?.full_name || authUser.faculty?.name || authUser.name || authUser.email
    } : {}),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative">
      {/* Dev Harness Header Bar - Embedded at the top header */}
      <header className="hidden sticky top-0 z-50 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md">
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
                <option value="Admin/Sections/Index">Admin &rarr; Sections/Index</option>
                <option value="Admin/Batches/Index">Admin &rarr; Batches/Index</option>
                <option value="Admin/AcademicYears/Index">Admin &rarr; AcademicYears/Index</option>
                <option value="Admin/Students/Index">Admin &rarr; Students/Index</option>
                <option value="Admin/Electives/Index">Admin &rarr; Electives/Index</option>
                <option value="Admin/Electives/Enrollment">Admin &rarr; Electives/Enrollment</option>
                <option value="Admin/SessionAssignments/Index">Admin &rarr; SessionAssignments/Index</option>
                <option value="Admin/FeedbackImport/Index">Admin &rarr; FeedbackImport/Index</option>
                <option value="Admin/Analytics/Index">Admin &rarr; Analytics/Index</option>
                <option value="Admin/Reports/Index">Admin &rarr; Reports/Index</option>
                <option value="Admin/FacultyReports/Index">Admin &rarr; FacultyReports/Index</option>
                <option value="Admin/CriticalComments/Index">Admin &rarr; CriticalComments/Index</option>
                <option value="Admin/Feedback/PublishForm">Admin &rarr; Feedback/PublishForm</option>
                <option value="Admin/Timetables/Index">Admin &rarr; Timetables/Index</option>
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
              <option value="hod_aiml">HOD &mdash; AIML</option>
            </select>
          </div>

          {/* Role Shortcut Badges & Compact Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const token = getAuthToken();
                if (!token) {
                  changePage('Faculty/Login');
                } else {
                  setDevRoleMode('admin');
                  changePage('Admin/Dashboard');
                }
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
              type="button"
              onClick={() => {
                const token = getAuthToken();
                if (!token) {
                  changePage('Faculty/Login');
                } else {
                  changePage('Faculty/MyReports/Index');
                }
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                activePage.startsWith('Faculty/')
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => {
                const token = getAuthToken();
                if (!token) {
                  changePage('Student/Identify');
                } else {
                  changePage('Student/Feedback/Show');
                }
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                activePage.startsWith('Student/')
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
          </div>

          {/* Auth State Badge in Header Bar */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            {authUser ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono text-[10px] font-bold">
                Auth: {authUser.role} ({authUser.email})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700/80 font-mono text-[10px] font-bold">
                Auth: Unauthenticated
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Render Active Inertia Page with Injected Controller Props once Auth is Ready */}
      {isAuthReady ? (
        <PageComponent key={`${activePage}-${devRoleMode}`} {...activeProps} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[450px] gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wide">Connecting to Academic Database...</span>
        </div>
      )}
    </div>
  );
};

export default DevPageRenderer;
