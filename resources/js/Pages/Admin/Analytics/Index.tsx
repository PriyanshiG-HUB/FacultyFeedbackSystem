import { isAdministratorRole } from '../../../utils/permissions';
import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { AnalyticsIndexProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Star, LayoutGrid, BarChart2, Filter } from 'lucide-react';
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

import { getDepartmentName, ADMIN_DEPARTMENT_OPTIONS } from '../../../utils/departmentScope';
import { useAuth } from '../../../context/AuthContext';

export default function Index() {
  const { user } = useAuth();
  const isAdministrator = isAdministratorRole(user?.role);
  const assignedDepartmentCode = user?.role === 'HOD' ? user?.hod_department_code : null;

  
  const [selectedDeptCode, setSelectedDeptCode] = React.useState<string>(
    assignedDepartmentCode || 'ALL'
  );

  const currentDeptName = isAdministrator
    ? selectedDeptCode === 'ALL'
      ? 'All Departments'
      : getDepartmentName(selectedDeptCode)
    : assignedDepartmentCode || 'Department' || getDepartmentName(assignedDepartmentCode);

  const hasData = false; // Based on current hardcoded logic where data=[]

  return (
    <AdminLayout
      title="Analytics & Insights"
      currentPath="#Admin/Analytics/Index"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-navy border border-brand-primary/30 rounded-sm text-brand-accent text-[11px] font-bold uppercase tracking-widest mb-1 shadow-sm">
            {isAdministrator ? 'ADMINISTRATOR SCOPE' : 'HOD SCOPE'} &bull; {currentDeptName}
          </div>
          <h2 className="text-xl font-black font-heading text-brand-dark">{currentDeptName} — Feedback Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Deep-dive performance metrics across subjects and parameters for {currentDeptName}</p>
        </div>

        {isAdministrator && (
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-sm border border-slate-200 text-xs shadow-sm">
            <Filter className="w-3.5 h-3.5 text-brand-primary" />
            <select
              value={selectedDeptCode}
              onChange={(e) => setSelectedDeptCode(e.target.value)}
              className="bg-transparent text-brand-dark font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              {ADMIN_DEPARTMENT_OPTIONS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Multi-parameter Subject Comparison Chart */}
      <Card title={`Subject Parameter Scores Comparison (${assignedDepartmentCode || 'Department'})`} subtitle="Scores breakdown out of 5.0 across key evaluation categories">
        <div className="h-80 w-full pt-4">
          {!hasData ? (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-sm">
               <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                  <BarChart2 className="w-6 h-6 text-brand-primary/40" />
               </div>
               <p className="text-sm font-bold text-slate-500">No feedback responses available yet</p>
               <p className="text-[11px] text-slate-400 mt-1">Data will populate once students submit feedback for this department.</p>
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="department" stroke="#0D1C42" fontSize={11} fontWeight={600} />
                <YAxis domain={[0, 5]} stroke="#0D1C42" fontSize={12} fontWeight={600} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#22396F', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="punctuality" name="Punctuality" fill="#22396F" radius={[2, 2, 0, 0]} />
                <Bar dataKey="knowledge" name="Subject Knowledge" fill="#0D1C42" radius={[2, 2, 0, 0]} />
                <Bar dataKey="clarity" name="Clarity of Teaching" fill="#FCF1D0" radius={[2, 2, 0, 0]} />
                <Bar dataKey="material" name="Study Material" fill="#64748b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Distribution Histogram */}
        <Card title="Overall Score Distribution" subtitle="Histogram of student ratings range" className="lg:col-span-6">
          <div className="h-64 w-full pt-4">
            {!hasData ? (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-sm">
               <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                  <LayoutGrid className="w-6 h-6 text-brand-primary/40" />
               </div>
               <p className="text-sm font-bold text-slate-500">Distribution data unavailable</p>
             </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis type="number" stroke="#0D1C42" fontSize={12} fontWeight={600} />
                  <YAxis dataKey="range" type="category" stroke="#0D1C42" fontSize={11} width={150} fontWeight={600} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#22396F', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="count" fill="#22396F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Top Performing Faculty Leaderboard */}
        <Card title="Top Faculty Leaderboard" subtitle="Highest rated faculty based on student evaluations" className="lg:col-span-6">
          <div className="divide-y divide-slate-100 min-h-[16rem]">
            {!hasData ? (
              <div className="h-full flex flex-col items-center justify-center py-10">
                <div className="p-4 bg-white rounded-full shadow-sm mb-3 border border-slate-100">
                  <Star className="w-6 h-6 text-brand-accent/60" />
                </div>
                <p className="text-sm font-bold text-slate-500">No leaderboard data</p>
              </div>
            ) : (
              ([] as any[]).map((f, rank) => (
                <div key={f.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-sm flex items-center justify-center font-bold text-xs ${
                        rank === 0
                          ? 'bg-brand-accent text-brand-dark shadow-sm'
                          : rank === 1
                          ? 'bg-slate-200 text-slate-700'
                          : rank === 2
                          ? 'bg-amber-700/20 text-amber-900'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      #{rank + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark">{f.name}</p>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{f.department}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-brand-dark font-extrabold text-sm">
                      <Star className="w-4 h-4 fill-brand-accent text-brand-accent" />
                      <span>{f.avgRating.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{f.totalResponses} responses</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
