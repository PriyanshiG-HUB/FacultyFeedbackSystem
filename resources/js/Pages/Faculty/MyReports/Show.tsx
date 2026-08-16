import React, { useState, useEffect, useMemo } from 'react';
import FacultyLayout from '../../../Layouts/FacultyLayout';
import { FacultyReportShowProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import Link from '../../../Components/shared/Link';
import { ArrowLeft, Star, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  getMergedSubmissions,
  calculateFacultyOverallScore,
} from '../../../utils/feedbackExclusionStore';

export default function Show({ report }: FacultyReportShowProps) {
  const [submissions, setSubmissions] = useState(() => getMergedSubmissions());

  useEffect(() => {
    const handleUpdate = () => {
      setSubmissions(getMergedSubmissions());
    };
    window.addEventListener('feedback_exclusion_updated', handleUpdate);
    return () => window.removeEventListener('feedback_exclusion_updated', handleUpdate);
  }, []);

  const courseSubmissions = useMemo(() => {
    return submissions.filter(
      (s) => s.subjectCode === report.subjectCode || s.subjectName.toLowerCase() === report.subjectName.toLowerCase()
    );
  }, [submissions, report]);

  const courseStats = useMemo(() => {
    return calculateFacultyOverallScore(courseSubmissions.length > 0 ? courseSubmissions : submissions);
  }, [courseSubmissions, submissions]);

  const effectiveScore = courseStats.includedCount > 0 ? courseStats.averageScore : report.overallScore;

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
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Overall Average Score</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              HOD Moderated
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-900">{effectiveScore.toFixed(2)}</span>
            <span className="text-xs text-amber-700 font-medium">/ 5.0 Rating</span>
          </div>
          <p className="text-[11px] text-amber-800/80 font-medium mt-1">
            Calculated from {courseStats.includedCount} included student submissions
          </p>
        </Card>

        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submissions Considered</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{courseStats.includedCount}</span>
            <span className="text-xs text-slate-500 font-medium">/ {courseStats.totalSubmissions} Total Submitted</span>
          </div>
          {courseStats.excludedCount > 0 ? (
            <p className="text-[11px] font-bold text-rose-600 mt-1">
              ({courseStats.excludedCount} complete submission{courseStats.excludedCount > 1 ? 's' : ''} excluded from score by HOD)
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium mt-1">100% of submitted forms considered</p>
          )}
        </Card>

        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Effective Response Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              {Math.round((courseStats.includedCount / (report.totalStudents || 65)) * 100)}%
            </span>
            <span className="text-xs text-emerald-600 font-bold">High Confidence</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {courseStats.includedCount} active submissions out of {report.totalStudents} enrolled
          </p>
        </Card>
      </div>

      {/* Category Parameter Breakdown Chart */}
      <Card title="Category Metric Breakdown" subtitle="Detailed evaluation rating per category metric (Included submissions)">
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
