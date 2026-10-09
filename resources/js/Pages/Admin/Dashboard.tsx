import { isAdministratorRole } from '../../utils/permissions';
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
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
  Loader2
} from 'lucide-react';
import Link from '../../Components/shared/Link';

import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
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

export default function Dashboard() {
  const { user } = useAuth();
  
  const isAdministrator = isAdministratorRole(user?.role);
  const assignedDepartmentCode = user?.role === 'HOD' ? user?.hod_department_code : null;
  const hodInfoName = user?.full_name || user?.faculty?.full_name || user?.email || 'HOD';

  // Selected Department Filter State for Admin
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>(
    assignedDepartmentCode || (isAdministrator ? 'ALL' : 'IT')
  );

  useEffect(() => {
    if (!isAdministrator && assignedDepartmentCode) {
      setSelectedDeptCode(assignedDepartmentCode);
    }
  }, [user, assignedDepartmentCode, isAdministrator]);

  // Live Backend Data State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    api.get('/departments').then((res) => {
      if (res && res.data) setDepartments(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
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
  }, [selectedDeptCode]);

  const currentDepartmentName = dashboardData?.department_info?.name || (selectedDeptCode === 'ALL' ? 'All Departments' : selectedDeptCode);

  const kpis = dashboardData?.kpis || {};
  const attentionItems = dashboardData?.requires_attention || [];
  const participation = dashboardData?.participation || { submission_trends: [] };
  const subjectCoverage = dashboardData?.subject_coverage || [];
  const facultyPerformance = dashboardData?.faculty_performance || [];
  const subjectPerformance = dashboardData?.subject_performance || [];
  const criticalSummary = dashboardData?.critical_summary || { latest_snippets: [] };
  const departmentTrend = dashboardData?.department_trend || [];
  const departmentInsights = dashboardData?.department_insights || [];
  const stats = dashboardData?.stats || {};

  const quickActions = [
    { label: 'Publish Feedback Form', href: '#Admin/Feedback/PublishForm', icon: FileText, color: 'text-brand-primary bg-brand-50 border-blue-200' },
    { label: 'Faculty Reports', href: '#Admin/FacultyReports/Index', icon: UserCheck, color: 'text-brand-primary bg-brand-50 border-indigo-200' },
    { label: 'Generate Department Report', href: '#Admin/Reports/Index', icon: FileText, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Review Critical Feedback', href: '#Admin/CriticalComments/Index', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { label: 'View Pending Students', href: '#Admin/Students/Index', icon: GraduationCap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'View Analytics', href: '#Admin/Analytics/Index', icon: BarChart2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard" currentPath="#Admin/Dashboard">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isAdministrator ? 'Administrator Dashboard' : `HOD • ${currentDepartmentName}`}
      currentPath="#Admin/Dashboard"
    >
      {/* 1. Header Banner - Administrator vs HOD Scope */}
      <div className="relative overflow-hidden rounded-sm bg-brand-dark p-6 sm:p-8 text-white shadow-md mb-4 border-l-4 border-l-brand-primary flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FCF1D0 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-brand-primary/20 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex-1 flex items-start sm:items-center gap-5">
          <div className="hidden sm:flex shrink-0 bg-white p-2 rounded-sm shadow-lg">
            <img src="/charusat_logo.png" alt="CHARUSAT" className="w-16 object-contain" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-navy/60 backdrop-blur-md rounded-sm text-brand-accent text-[10px] font-bold uppercase tracking-widest mb-3 border border-brand-primary/40 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              {isAdministrator ? 'ADMINISTRATOR ACCESS LEVEL' : `HOD • ${currentDepartmentName.toUpperCase()}`}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight drop-shadow-sm text-white">
              CHARUSAT Academic Portal
            </h1>
            <p className="text-xs text-brand-accent/80 mt-1.5 font-medium max-w-2xl leading-relaxed uppercase tracking-wider">
              {isAdministrator ? (
                <span className="font-bold">Scope filter: {currentDepartmentName}</span>
              ) : (
                <span>
                  Department Scope: <strong className="text-white">{currentDepartmentName} ({assignedDepartmentCode})</strong> &bull; Authenticated HOD: <strong className="text-white">{hodInfoName}</strong>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Admin Department Selector Dropdown */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {isAdministrator ? (
            <div className="bg-brand-navy/60 backdrop-blur-md p-3 rounded-sm border border-brand-primary/30 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm">
              <label className="text-[11px] font-black uppercase tracking-widest text-brand-accent whitespace-nowrap pl-1">
                Department:
              </label>
              <select
                value={selectedDeptCode}
                onChange={(e) => setSelectedDeptCode(e.target.value)}
                className="bg-brand-dark border border-brand-primary rounded-sm px-4 py-2 text-sm text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer transition-colors shadow-sm"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.department_code}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-brand-navy/60 backdrop-blur-md p-4 rounded-sm border border-brand-primary/30 text-right shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-1">Status</p>
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold bg-brand-dark px-3 py-1.5 rounded-sm border border-emerald-800/50">
                <CheckCircle2 className="w-4 h-4" />
                ACTIVE CYCLE
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary KPI Grid - Realtime Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isAdministrator && selectedDeptCode === 'ALL' && (
          <StatCard label="Active Departments" value={stats.total_departments || 0} icon="building" change="Configured across institute" />
        )}
        <StatCard label="Active Faculty" value={stats.total_faculty || 0} icon="users" change={isAdministrator && selectedDeptCode === 'ALL' ? 'Total across institute' : 'In this department'} />
        <StatCard label="Students Eligible" value={kpis.total_students || 0} icon="book-open" change="For active forms" />
        <StatCard label="Overall Avg Rating" value={(kpis.department_avg_rating || 0).toFixed(2)} icon="star" change="Out of 5.0" isPositive={true} />
        <StatCard label="Submissions" value={`${kpis.submitted_students || 0}`} icon="check-circle" change={`${kpis.completion_rate || 0}% Completion`} />
        {isAdministrator && selectedDeptCode !== 'ALL' && (
          <StatCard label="Critical Comments" value={kpis.critical_feedback_count || 0} icon="check-circle" change="Needs HOD Review" isPositive={kpis.critical_feedback_count === 0} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 border-0 shadow-xs ring-1 ring-slate-200 overflow-hidden rounded-2xl bg-white">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-indigo-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight">Feedback Submission Volume</h3>
                  <p className="text-xs text-slate-500 font-medium">Cumulative responses over current active window</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-brand-navy">{participation.completion_pct || 0}%</span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Completion</p>
              </div>
            </div>
            <div className="p-6 h-[280px]">
              {participation.submission_trends && participation.submission_trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={participation.submission_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 700 }}
                      labelStyle={{ fontWeight: 700, color: '#64748b', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="submissions" name="Responses" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No trend data available</div>
              )}
            </div>
          </Card>
          
          <Card className="p-0 border-0 shadow-xs ring-1 ring-slate-200 overflow-hidden rounded-2xl bg-white">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight">Top Performing Faculty</h3>
                  <p className="text-xs text-slate-500 font-medium">Based on aggregated student evaluations</p>
                </div>
              </div>
              <Link href="#Admin/FacultyReports/Index" className="text-[11px] font-bold uppercase tracking-wider text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                Full Report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="text-left py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty Member</th>
                    <th className="text-right py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Rating</th>
                    <th className="text-right py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Responses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facultyPerformance.length > 0 ? facultyPerformance.map((fac: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{fac.faculty_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                          <span className="font-black text-emerald-700 text-xs">{fac.avg_rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right font-medium text-slate-500">
                        {fac.total_responses}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 text-sm font-medium">No faculty performance data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-0 border-0 shadow-xs ring-1 ring-slate-200 overflow-hidden rounded-2xl bg-white flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-900">Requires Attention</h3>
              </div>
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">{attentionItems.length}</span>
            </div>
            <div className="p-3 flex-1 flex flex-col gap-2 overflow-y-auto max-h-[250px]">
              {attentionItems.length > 0 ? attentionItems.map((item: any) => (
                <div key={item.id} className={`p-4 rounded-xl border flex flex-col gap-3 transition-all hover:shadow-md ${
                  item.type === 'critical' ? 'bg-rose-50 border-rose-200 shadow-sm shadow-rose-100' :
                  item.type === 'warning' ? 'bg-amber-50 border-amber-200 shadow-sm shadow-amber-100' :
                  'bg-brand-50 border-blue-200 shadow-sm shadow-brand-100'
                }`}>
                  <div className="flex gap-3">
                    <div className={`mt-0.5 shrink-0 ${
                      item.type === 'critical' ? 'text-rose-600' :
                      item.type === 'warning' ? 'text-amber-600' :
                      'text-brand-primary'
                    }`}>
                      {item.type === 'critical' ? <AlertTriangle className="w-5 h-5" /> :
                       item.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                       <Info className="w-5 h-5" />}
                    </div>
                    <p className={`text-sm font-bold leading-tight ${
                      item.type === 'critical' ? 'text-rose-950' :
                      item.type === 'warning' ? 'text-amber-950' :
                      'text-blue-950'
                    }`}>
                      {item.title}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Link href={item.action_href} className={`text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                      item.type === 'critical' ? 'text-rose-700 hover:text-rose-800' :
                      item.type === 'warning' ? 'text-amber-700 hover:text-amber-800' :
                      'text-brand-navy hover:text-blue-800'
                    }`}>
                      {item.action_label} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-400 text-sm font-medium">No attention items required.</div>
              )}
            </div>
          </Card>
          
          <Card className="p-5 border-0 shadow-xs ring-1 ring-slate-200 rounded-2xl bg-white">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.href} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:scale-105 hover:shadow-md ${action.color}`}>
                  <action.icon className="w-6 h-6 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight opacity-90">{action.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

