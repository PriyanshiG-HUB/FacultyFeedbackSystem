import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { AdminDashboardProps } from '../../types';
import { StatCard } from '../../Components/ui/StatCard';
import { Card } from '../../Components/ui/Card';
import { Star, ArrowRight, Users, BookOpen, GraduationCap, Layers, FileText, AlertTriangle } from 'lucide-react';
import Link from '../../Components/shared/Link';
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
  hodInfo = {
    name: 'Dr. Grace Hopper',
    role: 'Head of Department (HOD)',
    department: 'Information Technology',
    departmentCode: 'IT',
  },
  stats,
  submissionTrends,
  facultyPerformance = [
    { facultyName: 'Dr. Sarah Jenkins', avgRating: 4.92, totalFeedback: 185 },
    { facultyName: 'Prof. Michael Chang', avgRating: 4.85, totalFeedback: 160 },
    { facultyName: 'Dr. Anita Sharma', avgRating: 4.65, totalFeedback: 140 },
    { facultyName: 'Dr. Robert Smith', avgRating: 4.45, totalFeedback: 120 },
    { facultyName: 'Dr. Emily Brown', avgRating: 4.28, totalFeedback: 110 },
  ],
  recentFeedback,
}: AdminDashboardProps) {
  const departmentName = hodInfo?.department || 'Information Technology';

  const quickLinks = [
    { label: 'View Faculty', href: '#Admin/Faculty/Index', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'View Students', href: '#Admin/Students/Index', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'View Subjects', href: '#Admin/Subjects/Index', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'View Batches', href: '#Admin/Batches/Index', icon: Layers, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'View Reports', href: '#Admin/Reports/Index', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Critical Feedback', href: '#Admin/CriticalComments/Index', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  ];

  return (
    <AdminLayout title="HOD Department Dashboard" currentPath="#Admin/Dashboard">
      {/* Department Header Badge */}
      <div className="bg-gradient-to-r from-[#193073] via-[#1e3a8a] to-[#254cb8] rounded-2xl p-5 sm:p-6 text-white shadow-md border border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-100 text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            HOD PORTAL SCOPE &bull; {departmentName}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{departmentName} — Overview</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Authenticated HOD: <span className="font-bold text-white">{hodInfo.name}</span> ({hodInfo.role})
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-xl font-bold border border-white/25 text-white">
            {departmentName} Department Only
          </span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
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
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-3 flex items-center gap-2.5 transition-all hover:shadow-sm group cursor-pointer"
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
          title={`Feedback Submission Volume (${departmentName})`}
          subtitle={`Weekly submission growth for ${departmentName}`}
          className="lg:col-span-7"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={submissionTrends}>
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

        {/* Faculty Average Ratings Bar Chart for Current Department */}
        <Card
          title={`Faculty Average Ratings (${departmentName})`}
          subtitle="Mean feedback score out of 5.0 for department faculty"
          className="lg:col-span-5"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={12} />
                <YAxis dataKey="facultyName" type="category" stroke="#64748b" fontSize={11} width={120} />
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
        title={`Live Feedback Activity Stream (${departmentName})`}
        subtitle="Real-time incoming feedback from department student portal"
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
          {recentFeedback.map((item) => (
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

