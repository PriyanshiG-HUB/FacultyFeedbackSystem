import React from 'react';
import FacultyLayout from '../../../Layouts/FacultyLayout';
import { FacultyReportShowProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import Link from '../../../Components/shared/Link';
import { ArrowLeft, Star, Download } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function Show({ report }: FacultyReportShowProps) {
  const handleDownload = () => {
    alert(`Downloading official evaluation report PDF for ${report.subjectName}`);
  };

  return (
    <FacultyLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="#Faculty/MyReports/Index">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              All Reports
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {report.subjectCode}
              </span>
              <h2 className="text-xl font-bold text-slate-900">{report.subjectName}</h2>
            </div>
            <p className="text-xs text-slate-500">
              {report.batchName} &bull; Semester {report.semester} &bull; {report.academicYear}
            </p>
          </div>
        </div>

        <Button variant="primary" onClick={handleDownload} className="bg-teal-600 hover:bg-teal-700 border-teal-600 focus:ring-teal-500">
          <Download className="w-4 h-4 mr-1.5" />
          Download PDF Report
        </Button>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-gradient-to-br from-amber-50/80 to-amber-100/30 border-amber-200">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Overall Average Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-900">{report.overallScore.toFixed(2)}</span>
            <span className="text-xs text-amber-700 font-medium">/ 5.0 Rating</span>
          </div>
        </Card>

        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responses Recorded</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{report.respondedStudents}</span>
            <span className="text-xs text-slate-500 font-medium">/ {report.totalStudents} Enrolled</span>
          </div>
        </Card>

        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Response Completion Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              {Math.round((report.respondedStudents / report.totalStudents) * 100)}%
            </span>
            <span className="text-xs text-emerald-600 font-bold">High Confidence</span>
          </div>
        </Card>
      </div>

      {/* Category Parameter Breakdown Chart */}
      <Card title="Category Metric Breakdown" subtitle="Detailed evaluation rating per category metric">
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.metrics} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={12} />
              <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={180} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Bar dataKey="score" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Student Qualitative Comments */}
      <Card title="Qualitative Student Feedback & Remarks" subtitle="Anonymous student comments and suggestions">
        <div className="divide-y divide-slate-100 space-y-3">
          {report.comments.map((c, i) => (
            <div key={i} className="pt-3 first:pt-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{c.rating}.0 Rating</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{c.date}</span>
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80 italic">
                "{c.text}"
              </p>
            </div>
          ))}
        </div>
      </Card>
    </FacultyLayout>
  );
}
