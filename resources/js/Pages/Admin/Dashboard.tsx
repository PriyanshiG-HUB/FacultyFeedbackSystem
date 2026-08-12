import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { AdminDashboardProps, DepartmentSummary } from '../../types';
import { StatCard } from '../../Components/ui/StatCard';
import { Card } from '../../Components/ui/Card';
import { Star, ArrowRight, Users, BookOpen, GraduationCap, Layers, FileText, AlertTriangle, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from '../../Components/shared/Link';
import {
  ADMIN_DEPARTMENT_OPTIONS,
  getDepartmentName,
} from '../../utils/departmentScope';
import { mockDepartmentSummaries } from '../../dev/mockProps';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

const mockDepartmentStatsMap: Record<string, any> = {
  ALL: {
    stats: [
      { label: 'Total Submissions', value: '5,420', change: '+12.8% across 5 depts', isPositive: true, icon: 'check-circle' },
      { label: 'Overall Avg Score', value: '4.54 / 5.0', change: '+0.15 points vs last term', isPositive: true, icon: 'star' },
      { label: 'Active Faculty Members', value: '145', change: 'Across 5 Departments', isPositive: true, icon: 'users' },
      { label: 'Active Student Batches', value: '24', change: '89.0% Overall Completion', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 620, avgRating: 4.38 },
      { month: 'Week 2', submissions: 1350, avgRating: 4.45 },
      { month: 'Week 3', submissions: 1980, avgRating: 4.52 },
      { month: 'Week 4', submissions: 990, avgRating: 4.60 },
      { month: 'Week 5', submissions: 480, avgRating: 4.54 },
    ],
    facultyPerformance: [
      { facultyName: 'Dr. Donald Knuth (CSE)', avgRating: 4.96, totalFeedback: 210 },
      { facultyName: 'Dr. Sarah Jenkins (IT)', avgRating: 4.92, totalFeedback: 185 },
      { facultyName: 'Dr. Alan Turing (CE)', avgRating: 4.88, totalFeedback: 175 },
      { facultyName: 'Prof. Michael Chang (IT)', avgRating: 4.85, totalFeedback: 160 },
      { facultyName: 'Dr. Claude Shannon (ECE)', avgRating: 4.78, totalFeedback: 150 },
    ],
    recentFeedback: [
      { id: 101, studentRoll: '22IT045', facultyName: 'Dr. Sarah Jenkins', subject: 'Database Management Systems', rating: 5, date: '10 mins ago', commentSnippet: 'Exceptional teaching methodology and clear SQL query explanations.' },
      { id: 102, studentRoll: '22CE018', facultyName: 'Dr. Alan Turing', subject: 'Theory of Computation', rating: 5, date: '18 mins ago', commentSnippet: 'Turing machines and automata concepts explained with supreme clarity.' },
      { id: 103, studentRoll: '22CS089', facultyName: 'Dr. Donald Knuth', subject: 'Advanced Algorithms', rating: 5, date: '35 mins ago', commentSnippet: 'Inspiring lectures on algorithm analysis and tree balancing.' },
      { id: 104, studentRoll: '22EC012', facultyName: 'Dr. Claude Shannon', subject: 'Digital Signal Processing', rating: 4, date: '1 hour ago', commentSnippet: 'Great hands-on Fourier transform demonstrations.' },
    ],
  },
  CE: {
    stats: [
      { label: 'CE Department Submissions', value: '1,380', change: '+15.4% in CE dept', isPositive: true, icon: 'check-circle' },
      { label: 'CE Avg Faculty Score', value: '4.65 / 5.0', change: '+0.22 points vs last term', isPositive: true, icon: 'star' },
      { label: 'Active CE Faculty', value: '32', change: 'Computer Engineering Dept', isPositive: true, icon: 'users' },
      { label: 'Active CE Student Batches', value: '6', change: '91.5% Completion Rate', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 150, avgRating: 4.40 },
      { month: 'Week 2', submissions: 360, avgRating: 4.52 },
      { month: 'Week 3', submissions: 520, avgRating: 4.62 },
      { month: 'Week 4', submissions: 230, avgRating: 4.70 },
      { month: 'Week 5', submissions: 120, avgRating: 4.65 },
    ],
    facultyPerformance: [
      { facultyName: 'Dr. Alan Turing', avgRating: 4.94, totalFeedback: 195 },
      { facultyName: 'Prof. Dennis Ritchie', avgRating: 4.88, totalFeedback: 170 },
      { facultyName: 'Dr. Barbara Liskov', avgRating: 4.72, totalFeedback: 155 },
      { facultyName: 'Dr. John von Neumann', avgRating: 4.55, totalFeedback: 130 },
    ],
    recentFeedback: [
      { id: 201, studentRoll: '22CE018', facultyName: 'Dr. Alan Turing', subject: 'Theory of Computation', rating: 5, date: '15 mins ago', commentSnippet: 'Turing machines and state diagrams rendered simple.' },
      { id: 202, studentRoll: '22CE042', facultyName: 'Prof. Dennis Ritchie', subject: 'Systems Programming', rating: 5, date: '40 mins ago', commentSnippet: 'C pointers and memory allocation explained step by step.' },
    ],
  },
  IT: {
    stats: [
      { label: 'IT Department Submissions', value: '1,240', change: '+14.2% in IT dept', isPositive: true, icon: 'check-circle' },
      { label: 'IT Avg Faculty Score', value: '4.52 / 5.0', change: '+0.18 points vs last term', isPositive: true, icon: 'star' },
      { label: 'Active IT Faculty', value: '28', change: 'Information Technology Dept', isPositive: true, icon: 'users' },
      { label: 'Active IT Student Batches', value: '6', change: '89.2% Completion Rate', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 120, avgRating: 4.35 },
      { month: 'Week 2', submissions: 310, avgRating: 4.42 },
      { month: 'Week 3', submissions: 450, avgRating: 4.50 },
      { month: 'Week 4', submissions: 240, avgRating: 4.58 },
      { month: 'Week 5', submissions: 120, avgRating: 4.52 },
    ],
    facultyPerformance: [
      { facultyName: 'Dr. Sarah Jenkins', avgRating: 4.92, totalFeedback: 185 },
      { facultyName: 'Prof. Michael Chang', avgRating: 4.85, totalFeedback: 160 },
      { facultyName: 'Dr. Anita Sharma', avgRating: 4.65, totalFeedback: 140 },
      { facultyName: 'Dr. Robert Smith', avgRating: 4.45, totalFeedback: 120 },
    ],
    recentFeedback: [
      { id: 101, studentRoll: '22IT045', facultyName: 'Dr. Sarah Jenkins', subject: 'Database Management Systems', rating: 5, date: '10 mins ago', commentSnippet: 'Exceptional teaching methodology and clear SQL query explanations.' },
      { id: 102, studentRoll: '22IT012', facultyName: 'Prof. Michael Chang', subject: 'Database Management Systems', rating: 4, date: '25 mins ago', commentSnippet: 'Very interactive sessions and useful lab demonstrations.' },
    ],
  },
  CSE: {
    stats: [
      { label: 'CSE Department Submissions', value: '1,520', change: '+18.1% in CSE dept', isPositive: true, icon: 'check-circle' },
      { label: 'CSE Avg Faculty Score', value: '4.70 / 5.0', change: '+0.25 points vs last term', isPositive: true, icon: 'star' },
      { label: 'Active CSE Faculty', value: '35', change: 'Computer Science & Eng. Dept', isPositive: true, icon: 'users' },
      { label: 'Active CSE Student Batches', value: '6', change: '94.0% Completion Rate', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 180, avgRating: 4.50 },
      { month: 'Week 2', submissions: 410, avgRating: 4.62 },
      { month: 'Week 3', submissions: 580, avgRating: 4.75 },
      { month: 'Week 4', submissions: 240, avgRating: 4.78 },
      { month: 'Week 5', submissions: 110, avgRating: 4.70 },
    ],
    facultyPerformance: [
      { facultyName: 'Dr. Donald Knuth', avgRating: 4.96, totalFeedback: 210 },
      { facultyName: 'Prof. Tim Berners-Lee', avgRating: 4.90, totalFeedback: 190 },
      { facultyName: 'Dr. Margaret Hamilton', avgRating: 4.82, totalFeedback: 175 },
      { facultyName: 'Dr. Edsger Dijkstra', avgRating: 4.68, totalFeedback: 150 },
    ],
    recentFeedback: [
      { id: 301, studentRoll: '22CS089', facultyName: 'Dr. Donald Knuth', subject: 'Advanced Algorithms', rating: 5, date: '35 mins ago', commentSnippet: 'Inspiring lectures on algorithm analysis and tree balancing.' },
      { id: 302, studentRoll: '22CS014', facultyName: 'Prof. Tim Berners-Lee', subject: 'Web Architecture', rating: 5, date: '1 hour ago', commentSnippet: 'Superb explanations of HTTP protocol and REST principles.' },
    ],
  },
  ECE: {
    stats: [
      { label: 'ECE Department Submissions', value: '1,020', change: '+8.6% in ECE dept', isPositive: true, icon: 'check-circle' },
      { label: 'ECE Avg Faculty Score', value: '4.40 / 5.0', change: '+0.10 points vs last term', isPositive: true, icon: 'star' },
      { label: 'Active ECE Faculty', value: '24', change: 'Electronics & Comm. Dept', isPositive: true, icon: 'users' },
      { label: 'Active ECE Student Batches', value: '6', change: '86.5% Completion Rate', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 90, avgRating: 4.25 },
      { month: 'Week 2', submissions: 240, avgRating: 4.35 },
      { month: 'Week 3', submissions: 390, avgRating: 4.42 },
      { month: 'Week 4', submissions: 200, avgRating: 4.48 },
      { month: 'Week 5', submissions: 100, avgRating: 4.40 },
    ],
    facultyPerformance: [
      { facultyName: 'Dr. Claude Shannon', avgRating: 4.85, totalFeedback: 165 },
      { facultyName: 'Prof. Nikola Tesla', avgRating: 4.75, totalFeedback: 145 },
      { facultyName: 'Dr. Heinrich Hertz', avgRating: 4.38, totalFeedback: 120 },
    ],
    recentFeedback: [
      { id: 401, studentRoll: '22EC012', facultyName: 'Dr. Claude Shannon', subject: 'Digital Signal Processing', rating: 4, date: '1 hour ago', commentSnippet: 'Great hands-on Fourier transform demonstrations.' },
    ],
  },
  ME: {
    stats: [
      { label: 'ME Department Submissions', value: '980', change: '+6.4% in ME dept', isPositive: true, icon: 'check-circle' },
      { label: 'ME Avg Faculty Score', value: '4.35 / 5.0', change: '+0.08 points vs last term', isPositive: true, icon: 'star' },
      { label: 'Active ME Faculty', value: '26', change: 'Mechanical Engineering Dept', isPositive: true, icon: 'users' },
      { label: 'Active ME Student Batches', value: '6', change: '84.0% Completion Rate', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 80, avgRating: 4.20 },
      { month: 'Week 2', submissions: 230, avgRating: 4.30 },
      { month: 'Week 3', submissions: 370, avgRating: 4.38 },
      { month: 'Week 4', submissions: 210, avgRating: 4.40 },
      { month: 'Week 5', submissions: 90, avgRating: 4.35 },
    ],
    facultyPerformance: [
      { facultyName: 'Dr. James Watt', avgRating: 4.80, totalFeedback: 150 },
      { facultyName: 'Prof. Rudolf Diesel', avgRating: 4.62, totalFeedback: 135 },
      { facultyName: 'Dr. Henry Ford', avgRating: 4.30, totalFeedback: 110 },
    ],
    recentFeedback: [
      { id: 501, studentRoll: '22ME005', facultyName: 'Dr. James Watt', subject: 'Thermodynamics', rating: 5, date: '2 hours ago', commentSnippet: 'Heat cycle concepts explained using real engine models.' },
    ],
  },
};

export default function Dashboard({
  userRole = 'admin',
  assignedDepartmentCode = null,
  hodInfo = {
    name: 'Administrator',
    role: 'System Administrator',
    department: 'All Departments',
    departmentCode: 'ALL',
  },
  stats: initialStats,
  submissionTrends: initialSubmissionTrends,
  facultyPerformance: initialFacultyPerformance,
  recentFeedback: initialRecentFeedback,
  departmentOverviews = mockDepartmentSummaries,
}: AdminDashboardProps) {
  const isAdministrator = userRole === 'admin';

  // Selected Department Filter State for Admin
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>(
    assignedDepartmentCode || (isAdministrator ? 'ALL' : hodInfo.departmentCode || 'CE')
  );

  useEffect(() => {
    if (!isAdministrator && assignedDepartmentCode) {
      setSelectedDeptCode(assignedDepartmentCode);
    }
  }, [userRole, assignedDepartmentCode, isAdministrator]);

  // Derive department-specific mock statistics based on selectedDeptCode
  const currentDeptData =
    mockDepartmentStatsMap[selectedDeptCode] || mockDepartmentStatsMap['ALL'];

  const activeStats = currentDeptData.stats || initialStats;
  const activeTrends = currentDeptData.submissionTrends || initialSubmissionTrends;
  const activeFacultyPerformance = currentDeptData.facultyPerformance || initialFacultyPerformance;
  const activeRecentFeedback = currentDeptData.recentFeedback || initialRecentFeedback;

  const currentDepartmentName = isAdministrator
    ? selectedDeptCode === 'ALL'
      ? 'All Departments'
      : getDepartmentName(selectedDeptCode)
    : hodInfo.department || getDepartmentName(assignedDepartmentCode);

  const quickLinks = [
    { label: 'View Faculty', href: '#Admin/Faculty/Index', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'View Students', href: '#Admin/Students/Index', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'View Subjects', href: '#Admin/Subjects/Index', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'View Batches', href: '#Admin/Batches/Index', icon: Layers, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'View Reports', href: '#Admin/Reports/Index', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Critical Feedback', href: '#Admin/CriticalComments/Index', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  ];

  return (
    <AdminLayout
      title={isAdministrator ? 'Administrator Dashboard' : `HOD • ${currentDepartmentName}`}
      currentPath="#Admin/Dashboard"
      userName={hodInfo.name}
      userRole={userRole}
      departmentScope={currentDepartmentName}
    >
      {/* Header Banner - Administrator vs HOD Scope */}
      <div className="bg-gradient-to-r from-[#193073] via-[#1e3a8a] to-[#254cb8] rounded-2xl p-5 sm:p-6 text-white shadow-md border border-blue-800/80 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-100 text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {isAdministrator ? 'ADMINISTRATOR ACCESS LEVEL' : `HOD • ${currentDepartmentName.toUpperCase()}`}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {isAdministrator ? 'System Administration & Department Portal' : `${currentDepartmentName} — HOD Overview`}
          </h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            {isAdministrator ? (
              <span className="text-emerald-300 font-bold">You have access to all departments.</span>
            ) : (
              <span>
                Department Scope: <strong className="text-white">{currentDepartmentName} ({assignedDepartmentCode})</strong> &bull; Authenticated HOD: <strong className="text-white">{hodInfo.name}</strong>
              </span>
            )}
          </p>
        </div>

        {/* Admin Department Selector Dropdown / Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {isAdministrator ? (
            <div className="bg-white/15 backdrop-blur-md p-2 rounded-xl border border-white/25 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200 whitespace-nowrap pl-1">
                Department:
              </label>
              <select
                value={selectedDeptCode}
                onChange={(e) => setSelectedDeptCode(e.target.value)}
                className="bg-white text-blue-950 font-bold text-xs px-3 py-1.5 rounded-lg border border-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {ADMIN_DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm rounded-xl font-bold border border-emerald-400/40 text-emerald-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Scope: {currentDepartmentName} Only
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeStats.map((stat: any, idx: number) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Department Overview Cards Section (Admin View & HOD Overview) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            {isAdministrator ? 'All Department Metrics Overview' : `${currentDepartmentName} Key Metrics`}
          </h3>
          {isAdministrator && (
            <span className="text-[11px] font-bold text-slate-400">
              Click a department to filter overview
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {departmentOverviews
            .filter((dept) => (!isAdministrator && assignedDepartmentCode ? dept.code === assignedDepartmentCode : true))
            .map((dept) => {
              const isSelected = isAdministrator && selectedDeptCode === dept.code;
              return (
                <div
                  key={dept.code}
                  onClick={() => isAdministrator && setSelectedDeptCode(dept.code)}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20 bg-indigo-50/20'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700">
                      {dept.code}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{dept.avgRating.toFixed(2)}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-900 truncate" title={dept.name}>
                    {dept.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate mb-3">
                    HOD: {dept.hod}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Students</p>
                      <p className="font-bold text-slate-800">{dept.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Faculty</p>
                      <p className="font-bold text-slate-800">{dept.facultyCount}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">Completion:</span>
                    <span className="font-extrabold text-emerald-600">{dept.completionRate}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Department Management Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <Link
                key={idx}
                href={link.href}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-3 flex items-center gap-2.5 transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className={`p-2 rounded-lg border ${link.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submissions Trend Area Chart */}
        <Card
          title={`Feedback Submission Volume (${currentDepartmentName})`}
          subtitle={`Weekly submission growth for ${currentDepartmentName}`}
          className="lg:col-span-7"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTrends}>
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSubmissions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Faculty Average Ratings Bar Chart */}
        <Card
          title={`Faculty Average Ratings (${currentDepartmentName})`}
          subtitle="Mean feedback score out of 5.0 for department faculty"
          className="lg:col-span-5"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeFacultyPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={12} />
                <YAxis dataKey="facultyName" type="category" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="avgRating" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Feed Table */}
      <Card
        title={`Live Feedback Activity Stream (${currentDepartmentName})`}
        subtitle="Real-time incoming feedback from student evaluation portal"
        action={
          <Link
            href="#Admin/Analytics/Index"
            className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        }
      >
        <div className="divide-y divide-slate-100">
          {activeRecentFeedback.map((item: any) => (
            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.studentRoll}
                  </span>
                  <span className="text-slate-400 text-xs">&rarr;</span>
                  <span className="text-sm font-bold text-slate-900">{item.facultyName}</span>
                  <span className="text-xs text-slate-500">({item.subject})</span>
                </div>
                <p className="text-xs text-slate-600 italic">"{item.commentSnippet}"</p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-800">{item.rating}.0</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}

