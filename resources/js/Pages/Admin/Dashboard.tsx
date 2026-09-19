import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { AdminDashboardProps } from '../../types';
import { StatCard } from '../../Components/ui/StatCard';
import { Card } from '../../Components/ui/Card';
import {
  Star,
  ArrowRight,
  Users,
  BookOpen,
  GraduationCap,
  Layers,
  FileText,
  AlertTriangle,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Lightbulb,
  Sparkles,
  PieChart,
  BarChart2,
  UserCheck,
  Zap,
  Info,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
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

export default function Dashboard({
  userRole = 'admin',
  assignedDepartmentCode = null,
  hodInfo = {
    name: 'Administrator',
    role: 'System Administrator',
    department: 'All Departments',
    departmentCode: 'ALL',
  },
  departmentOverviews = mockDepartmentSummaries,
}: AdminDashboardProps) {
  const isAdministrator = userRole === 'admin';

  // Selected Department Filter State for Admin
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>(
    assignedDepartmentCode || (isAdministrator ? 'ALL' : hodInfo.departmentCode || 'IT')
  );

  useEffect(() => {
    if (!isAdministrator && assignedDepartmentCode) {
      setSelectedDeptCode(assignedDepartmentCode);
    }
  }, [userRole, assignedDepartmentCode, isAdministrator]);

  // Live Backend Data State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    import('../../lib/api')
      .then(({ api }) => {
        const query = selectedDeptCode ? `?department_code=${selectedDeptCode}` : '';
        api.get(`/admin/dashboard${query}`).then((res) => {
          if (res && res.kpis) {
            setDashboardData(res);
          }
        }).catch((err) => {
          console.error('Dashboard fetch error:', err);
        }).finally(() => {
          setIsLoading(false);
        });
      });
  }, [selectedDeptCode]);

  const currentDepartmentName = isAdministrator
    ? selectedDeptCode === 'ALL'
      ? 'All Departments'
      : getDepartmentName(selectedDeptCode)
    : hodInfo.department || getDepartmentName(assignedDepartmentCode);

  // Fallback defaults if API is loading or empty
  const kpis = dashboardData?.kpis || {
    total_students: 420,
    submitted_students: 326,
    pending_students: 94,
    completion_rate: 77.6,
    target_rate: 85.0,
    total_faculty: 28,
    faculty_evaluated: 24,
    department_avg_rating: 4.18,
    critical_feedback_count: 7,
  };

  const attentionItems = dashboardData?.requires_attention || [
    {
      id: 'att-pending',
      type: 'warning',
      title: '94 students have not submitted feedback',
      action_label: 'View Pending Students',
      action_href: '#Admin/Students/Index',
    },
    {
      id: 'att-critical',
      type: 'critical',
      title: '7 low rating / critical feedback items require review',
      action_label: 'Review Feedback',
      action_href: '#Admin/CriticalComments/Index',
    },
    {
      id: 'att-closing',
      type: 'info',
      title: '2 feedback forms are closing soon',
      action_label: 'View Forms',
      action_href: '#Admin/Reports/Index',
    },
    {
      id: 'att-low-comp',
      type: 'warning',
      title: 'Operating Systems (IT504) feedback completion is only 56%',
      action_label: 'View Details',
      action_href: '#Admin/Reports/Index',
    },
  ];

  const participation = dashboardData?.participation || {
    total_students: 420,
    submitted: 326,
    pending: 94,
    completion_pct: 77.6,
    target_pct: 85.0,
    submission_trends: [
      { week: 'Week 1', submissions: 120, avgRating: 4.05 },
      { week: 'Week 2', submissions: 310, avgRating: 4.12 },
      { week: 'Week 3', submissions: 450, avgRating: 4.18 },
      { week: 'Week 4', submissions: 240, avgRating: 4.22 },
      { week: 'Week 5', submissions: 120, avgRating: 4.18 },
    ],
  };

  const subjectCoverage = dashboardData?.subject_coverage || [
    { subject_id: 1, subject_code: 'IT501', subject_name: 'Data Structures', faculty_name: 'Dr. Sarah Jenkins', responses: '112 / 120', completion_pct: 93 },
    { subject_id: 2, subject_code: 'IT502', subject_name: 'DBMS', faculty_name: 'Prof. Michael Chang', responses: '98 / 120', completion_pct: 82 },
    { subject_id: 3, subject_code: 'IT503', subject_name: 'Computer Networks', faculty_name: 'Dr. Anita Sharma', responses: '120 / 120', completion_pct: 100 },
    { subject_id: 4, subject_code: 'IT504', subject_name: 'Operating Systems', faculty_name: 'Dr. Robert Smith', responses: '67 / 120', completion_pct: 56 },
  ];

  const facultyPerformance = dashboardData?.faculty_performance || [
    { faculty_name: 'Dr. Sarah Jenkins', avg_rating: 4.92, total_responses: 185, trend: '+0.18' },
    { faculty_name: 'Prof. Michael Chang', avg_rating: 4.85, total_responses: 160, trend: '+0.12' },
    { faculty_name: 'Dr. Anita Sharma', avg_rating: 4.65, total_responses: 140, trend: '+0.08' },
    { faculty_name: 'Dr. Robert Smith', avg_rating: 4.45, total_responses: 120, trend: '+0.05' },
  ];

  const subjectPerformance = dashboardData?.subject_performance || [
    { subject_code: 'IT501', subject_name: 'Data Structures', avg_rating: 4.42, total_responses: 112 },
    { subject_code: 'IT502', subject_name: 'Database Management Systems', avg_rating: 4.31, total_responses: 98 },
    { subject_code: 'IT503', subject_name: 'Computer Networks', avg_rating: 4.18, total_responses: 120 },
    { subject_code: 'IT504', subject_name: 'Operating Systems', avg_rating: 3.92, total_responses: 67 },
  ];

  const criticalSummary = dashboardData?.critical_summary || {
    unreviewed: 3,
    under_review: 2,
    resolved: 2,
    latest_snippets: [
      { id: 1, comment: 'Lab sessions need more practical database examples.', subject: 'DBMS', faculty: 'Prof. Michael Chang', rating: 2.0 },
      { id: 2, comment: 'More explanation required during kernel threading practical sessions.', subject: 'Operating Systems', faculty: 'Dr. Robert Smith', rating: 2.0 },
    ],
  };

  const departmentTrend = dashboardData?.department_trend || [
    { cycle: 'Semester 3', rating: 4.01 },
    { cycle: 'Semester 4', rating: 4.18 },
    { cycle: 'Semester 5', rating: 4.32 },
  ];

  const departmentInsights = dashboardData?.department_insights || [
    { type: 'warning', text: 'Student participation (77.6%) is currently 7.4% below the target (85.0%).' },
    { type: 'positive', text: 'Computer Networks (IT503) has the highest feedback completion (100%).' },
    { type: 'warning', text: 'Operating Systems (IT504) has the lowest feedback completion (56%).' },
    { type: 'positive', text: 'Department average rating (4.18 / 5.0) increased compared with the previous feedback cycle.' },
  ];

  const quickActions = [
    { label: 'Publish Feedback Form', href: '#Admin/Feedback/PublishForm', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Faculty Reports', href: '#Admin/FacultyReports/Index', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'Generate Department Report', href: '#Admin/Reports/Index', icon: FileText, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Review Critical Feedback', href: '#Admin/CriticalComments/Index', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { label: 'View Pending Students', href: '#Admin/Students/Index', icon: GraduationCap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'View Analytics', href: '#Admin/Analytics/Index', icon: BarChart2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  return (
    <AdminLayout
      title={isAdministrator ? 'Administrator Dashboard' : `HOD • ${currentDepartmentName}`}
      currentPath="#Admin/Dashboard"
      userName={hodInfo.name}
      userRole={userRole}
      departmentScope={currentDepartmentName}
    >
      {/* 1. Header Banner - Administrator vs HOD Scope */}
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
              <span className="text-emerald-300 font-bold">Scope filter: {currentDepartmentName}</span>
            ) : (
              <span>
                Department Scope: <strong className="text-white">{currentDepartmentName} ({assignedDepartmentCode})</strong> &bull; Authenticated HOD: <strong className="text-white">{hodInfo.name}</strong>
              </span>
            )}
          </p>
        </div>

        {/* Admin Department Selector Dropdown */}
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

      {/* 2. Management KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* Total Students */}
        <StatCard
          label="Total Students"
          value={kpis.total_students}
          change={`${kpis.pending_students} Pending`}
          isPositive={kpis.pending_students === 0}
          icon="users"
        />

        {/* Feedback Submitted */}
        <StatCard
          label="Feedback Submitted"
          value={`${kpis.submitted_students} / ${kpis.total_students}`}
          change={`${kpis.completion_rate}% Rate`}
          isPositive={kpis.completion_rate >= kpis.target_rate}
          icon="check-circle"
        />

        {/* Completion Rate */}
        <StatCard
          label="Completion Rate"
          value={`${kpis.completion_rate}%`}
          change={`Target ${kpis.target_rate}%`}
          isPositive={kpis.completion_rate >= kpis.target_rate}
          icon="check-circle"
        />

        {/* Faculty Evaluated */}
        <StatCard
          label="Faculty Evaluated"
          value={`${kpis.faculty_evaluated} / ${kpis.total_faculty}`}
          change={`${Math.round((kpis.faculty_evaluated / (kpis.total_faculty || 1)) * 100)}% Evaluated`}
          isPositive={true}
          icon="users"
        />

        {/* Department Average Rating */}
        <StatCard
          label="Department Avg"
          value={`${kpis.department_avg_rating} / 5`}
          change="↑ vs last cycle"
          isPositive={true}
          icon="star"
        />

        {/* Critical Feedback */}
        <StatCard
          label="Critical Feedback"
          value={kpis.critical_feedback_count}
          change={kpis.critical_feedback_count > 0 ? "Requires Review" : "No Issues"}
          isPositive={kpis.critical_feedback_count === 0}
          icon="star"
        />
      </div>

      {/* 3. Requires Your Attention Section */}
      {attentionItems.length > 0 && (
        <Card className="border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-white to-rose-50/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 animate-bounce" />
              Requires Your Attention ({attentionItems.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Department Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionItems.map((item: any) => {
              const isCritical = item.type === 'critical';
              const isInfo = item.type === 'info';
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isCritical
                      ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                      : isInfo
                      ? 'bg-blue-50/90 border-blue-200 text-blue-900'
                      : 'bg-amber-50/90 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isCritical ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></span>
                    ) : isInfo ? (
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold tracking-tight">{item.title}</span>
                  </div>
                  <Link
                    href={item.action_href || '#'}
                    className={`text-xs font-extrabold px-3 py-1 rounded-lg border whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                      isCritical
                        ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                        : isInfo
                        ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                        : 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
                    }`}
                  >
                    {item.action_label}
                  </Link>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4. Student Feedback Participation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submission Trend Area Chart */}
        <Card
          title={`Student Feedback Participation (${currentDepartmentName})`}
          subtitle={`Submission growth & trend for ${currentDepartmentName}`}
          className="lg:col-span-8"
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={participation.submission_trends}>
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
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

        {/* Participation Summary Card */}
        <Card
          title="Participation Metrics"
          subtitle="Department summary stats"
          className="lg:col-span-4"
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Total Students</span>
              <span className="text-sm font-extrabold text-slate-900">{participation.total_students}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Feedback Submitted</span>
              <span className="text-sm font-extrabold text-emerald-600">{participation.submitted}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Pending Submissions</span>
              <span className="text-sm font-extrabold text-rose-600">{participation.pending}</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-slate-700">Completion: {participation.completion_pct}%</span>
                <span className="text-blue-600">Target: {participation.target_pct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, participation.completion_pct)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Feedback Coverage by Subject */}
      <Card
        title={`Feedback Coverage by Subject (${currentDepartmentName})`}
        subtitle="Subject-wise feedback completion breakdown"
        action={
          <Link href="#Admin/Reports/Index" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View All Forms &rarr;
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Assigned Faculty</th>
                <th className="py-2.5 px-3 text-center">Responses (Submitted / Target)</th>
                <th className="py-2.5 px-3 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectCoverage.map((item: any) => (
                <tr key={item.subject_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-slate-900 block">{item.subject_name}</span>
                    <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {item.subject_code}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {item.faculty_name}
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-slate-800">
                    {item.responses}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            item.completion_pct >= 80
                              ? 'bg-emerald-500'
                              : item.completion_pct >= 60
                              ? 'bg-blue-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.completion_pct}%` }}
                        ></div>
                      </div>
                      <span className={`font-extrabold ${item.completion_pct < 60 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.completion_pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. Faculty Performance & Context Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Faculty Average Ratings Bar Chart */}
        <Card
          title={`Faculty Performance Overview (${currentDepartmentName})`}
          subtitle="Mean feedback score out of 5.0 for department faculty"
          className="lg:col-span-7"
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={12} />
                <YAxis dataKey="faculty_name" type="category" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="avg_rating" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Faculty Context Ratings List */}
        <Card
          title="Faculty Ratings Breakdown"
          subtitle="Rating context & response count"
          className="lg:col-span-5"
        >
          <div className="divide-y divide-slate-100">
            {facultyPerformance.map((fac: any, idx: number) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{fac.faculty_name}</h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {fac.total_responses} responses
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-extrabold text-amber-800">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{fac.avg_rating} / 5</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {fac.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 7. Subject Performance & Critical Feedback Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Performance List */}
        <Card
          title={`Subject Performance Ratings (${currentDepartmentName})`}
          subtitle="Average feedback score by subject"
          className="lg:col-span-6"
        >
          <div className="divide-y divide-slate-100">
            {subjectPerformance.map((subj: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">{subj.subject_name}</span>
                  <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {subj.subject_code}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({subj.total_responses} responses)
                  </span>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md">
                    {subj.avg_rating} / 5.0
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Critical Feedback Summary */}
        <Card
          title="Critical Feedback Summary"
          subtitle="Unreviewed remarks & low rating alerts"
          className="lg:col-span-6"
          action={
            <Link href="#Admin/CriticalComments/Index" className="text-xs font-bold text-rose-600 hover:text-rose-700">
              View All Critical Feedback &rarr;
            </Link>
          }
        >
          <div className="space-y-4">
            {/* Status Pills */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full border border-rose-200">
                {criticalSummary.unreviewed} Unreviewed
              </span>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                {criticalSummary.under_review} Under Review
              </span>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                {criticalSummary.resolved} Resolved
              </span>
            </div>

            {/* Snippets */}
            <div className="space-y-2.5">
              {criticalSummary.latest_snippets.map((snip: any) => (
                <div key={snip.id} className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-1">
                  <p className="text-xs font-semibold text-slate-800 italic">"{snip.comment}"</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Subject: <strong>{snip.subject}</strong> &bull; Faculty: <strong>{snip.faculty}</strong>
                    </span>
                    <span className="font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                      Rating: {snip.rating}.0
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 8. Department Performance Trend & Automated Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-cycle Department Trend */}
        <Card
          title={`Department Performance Trend (${currentDepartmentName})`}
          subtitle="Rating progression across feedback cycles"
          className="lg:col-span-5"
        >
          <div className="space-y-3 pt-2">
            {departmentTrend.map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">{item.cycle}</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${(item.rating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-700 font-mono">
                    {item.rating} / 5.0
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Department Automated Insights */}
        <Card
          title="Department Insights"
          subtitle="Automated factual analysis from live database"
          className="lg:col-span-7"
        >
          <div className="space-y-2.5 pt-1">
            {departmentInsights.map((insight: any, idx: number) => {
              const isWarn = insight.type === 'warning';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    isWarn
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  {isWarn ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-bold leading-relaxed">{insight.text}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 9. Quick Actions Grid (HOD Action Shortcuts) */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Prioritized HOD Management Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((link, idx) => {
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
    </AdminLayout>
  );
}

function maxOne(num: number): number {
  return num > 0 ? num : 1;
}


