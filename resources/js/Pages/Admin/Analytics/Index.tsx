import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { AnalyticsIndexProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Star } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function Index({
  departmentName = 'Computer Engineering',
  departmentRatings,
  topFaculty,
  scoreDistribution,
}: AnalyticsIndexProps) {
  return (
    <AdminLayout title="Analytics & Insights" currentPath="#Admin/Analytics/Index">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">
          HOD Portal &bull; {departmentName}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{departmentName} — Feedback Analytics</h2>
        <p className="text-xs text-slate-500">Deep-dive performance metrics across subjects and parameters for {departmentName}</p>
      </div>

      {/* Multi-parameter Subject Comparison Chart */}
      <Card title={`Subject Parameter Scores Comparison (${departmentName})`} subtitle="Scores breakdown out of 5.0 across key evaluation categories">
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentRatings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 5]} stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="punctuality" name="Punctuality" fill="#0284c7" radius={[2, 2, 0, 0]} />
              <Bar dataKey="knowledge" name="Subject Knowledge" fill="#4f46e5" radius={[2, 2, 0, 0]} />
              <Bar dataKey="clarity" name="Clarity of Teaching" fill="#059669" radius={[2, 2, 0, 0]} />
              <Bar dataKey="material" name="Study Material" fill="#d97706" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Distribution Histogram */}
        <Card title="Overall Score Distribution" subtitle="Histogram of student ratings range" className="lg:col-span-6">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="range" type="category" stroke="#64748b" fontSize={11} width={150} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Performing Faculty Leaderboard */}
        <Card title="Top Faculty Leaderboard" subtitle="Highest rated faculty based on student evaluations" className="lg:col-span-6">
          <div className="divide-y divide-slate-100">
            {topFaculty.map((f, rank) => (
              <div key={f.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      rank === 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : rank === 1
                        ? 'bg-slate-100 text-slate-700 border border-slate-300'
                        : rank === 2
                        ? 'bg-amber-700/10 text-amber-900 border border-amber-700/20'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    #{rank + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{f.name}</p>
                    <p className="text-xs text-slate-500">{f.department}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-amber-700 font-extrabold text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{f.avgRating.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{f.totalResponses} responses</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
