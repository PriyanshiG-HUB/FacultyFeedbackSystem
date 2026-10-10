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
      {/* Optional Admin Department Selector (Minimal Bar) */}
      {isAdministrator && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Department Scope:</span>
          </div>
          <select
            value={selectedDeptCode}
            onChange={(e) => setSelectedDeptCode(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer transition-colors"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.department_code}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column (8 cols on desktop): Top Row (4 Stat Cards) + Submission Chart + Top Performing Faculty */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Top 4 Stat Cards in 1 Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatCard 
              label="Active Faculty" 
              value={stats.total_faculty || 0} 
              icon="users" 
              change={isAdministrator && selectedDeptCode === 'ALL' ? 'Institute wide' : 'In department'} 
              compact={true}
            />
            <StatCard 
              label="Students Eligible" 
              value={kpis.total_students || 0} 
              icon="book-open" 
              change="Active forms" 
              compact={true}
            />
            <StatCard 
              label="Overall Avg Rating" 
              value={(kpis.department_avg_rating || 0).toFixed(2)} 
              icon="star" 
              change="Out of 5.0" 
              isPositive={true} 
              compact={true}
            />
            <StatCard 
              label="Submissions" 
              value={`${kpis.submitted_students || 0}`} 
              icon="check-circle" 
              change={`${kpis.completion_rate || 0}% Done`} 
              compact={true}
            />
          </div>

          {/* Feedback Submission Volume Chart */}
          <Card className="p-0 border border-slate-200 shadow-xs overflow-hidden rounded-xl bg-white">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 border border-indigo-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] font-extrabold text-slate-900 tracking-tight leading-tight">Feedback Submission Volume</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Cumulative responses over current active window</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-brand-navy">{participation.completion_pct || 0}%</span>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Total Completion</p>
              </div>
            </div>
            <div className="p-4 h-[240px]">
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
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 700 }}
                      labelStyle={{ fontWeight: 700, color: '#64748b', marginBottom: '2px' }}
                    />
                    <Area type="monotone" dataKey="submissions" name="Responses" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSubmissions)" activeDot={{ r: 5, strokeWidth: 0, fill: '#4f46e5' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">No trend data available</div>
              )}
            </div>
          </Card>

          {/* Top Performing Faculty Table */}
          <Card className="p-0 border border-slate-200 shadow-xs overflow-hidden rounded-xl bg-white">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-[14px] font-extrabold text-slate-900 tracking-tight leading-tight">Top Performing Faculty</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Based on aggregated student evaluations</p>
                </div>
              </div>
              <Link href="#Admin/FacultyReports/Index" className="text-[10px] font-bold uppercase tracking-wider text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1">
                Full Report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty Member</th>
                    <th className="text-right py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Rating</th>
                    <th className="text-right py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Responses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facultyPerformance.length > 0 ? facultyPerformance.map((fac: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200 shrink-0">
                            {idx + 1}
                          </div>
                          <p className="font-bold text-slate-900 leading-snug">{fac.faculty_name}</p>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          <span className="font-black text-emerald-700 text-xs">{fac.avg_rating}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-500">
                        {fac.total_responses}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400 text-xs font-medium">No faculty performance data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols on desktop): Linear Quick Actions + Requires Attention Panel */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Quick Actions (Linear Icon-and-Text List) */}
          <Card className="p-0 border border-slate-200 shadow-xs overflow-hidden rounded-xl bg-white">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <h3 className="text-[14px] font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Quick Actions
              </h3>
            </div>
            <div className="p-2 flex flex-col divide-y divide-slate-100">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-brand-primary group-hover:bg-brand-50 group-hover:border-indigo-100 transition-colors shrink-0">
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-brand-dark transition-colors">
                      {action.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Requires Attention Section */}
          <Card className="p-0 border border-slate-200 shadow-xs overflow-hidden rounded-xl bg-white flex flex-col flex-1">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <h3 className="text-[14px] font-extrabold text-slate-900">Requires Attention</h3>
              </div>
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {attentionItems.length}
              </span>
            </div>
            <div className="p-3 flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[380px]">
              {attentionItems.length > 0 ? attentionItems.map((item: any) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border flex flex-col gap-2 transition-all hover:shadow-xs ${
                    item.type === 'critical' ? 'bg-rose-50/80 border-rose-200 text-rose-950' :
                    item.type === 'warning' ? 'bg-amber-50/80 border-amber-200 text-amber-950' :
                    'bg-blue-50/80 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 ${
                      item.type === 'critical' ? 'text-rose-600' :
                      item.type === 'warning' ? 'text-amber-600' :
                      'text-brand-primary'
                    }`}>
                      {item.type === 'critical' ? <AlertTriangle className="w-4 h-4" /> :
                       item.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                       <Info className="w-4 h-4" />}
                    </div>
                    <p className="text-xs font-bold leading-snug">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex justify-end pt-1 border-t border-black/5">
                    <Link
                      href={item.action_href}
                      className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        item.type === 'critical' ? 'text-rose-700 hover:text-rose-800' :
                        item.type === 'warning' ? 'text-amber-700 hover:text-amber-800' :
                        'text-brand-navy hover:text-blue-800'
                      }`}
                    >
                      {item.action_label} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No attention items required.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

