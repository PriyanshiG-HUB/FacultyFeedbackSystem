import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { AdminDashboardProps } from '../../types';
import { StatCard } from '../../Components/ui/StatCard';
import { Card } from '../../Components/ui/Card';
import { Star, ArrowRight } from 'lucide-react';
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
  stats,
  submissionTrends,
  departmentPerformance,
  recentFeedback,
}: AdminDashboardProps) {
  return (
    <AdminLayout title="System Dashboard" currentPath="#Admin/Dashboard">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submissions Trend Area Chart */}
        <Card
          title="Feedback Submission Volume"
          subtitle="Weekly submission growth for current academic semester"
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

        {/* Department Performance Bar Chart */}
        <Card
          title="Department Average Ratings"
          subtitle="Mean feedback score out of 5.0"
          className="lg:col-span-5"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={12} />
                <YAxis dataKey="department" type="category" stroke="#64748b" fontSize={11} width={110} />
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
        title="Live Feedback Activity Stream"
        subtitle="Real-time incoming feedback from student portal"
        action={
          <Link
            href="#Admin/Analytics/Index"
            className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700"
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
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
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
