import React, { useState, useEffect, useMemo } from 'react';
import FacultyLayout from '../../../Layouts/FacultyLayout';
import { FacultyReportsIndexProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import Link from '../../../Components/shared/Link';
import { Star, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  getMergedSubmissions,
  calculateFacultyOverallScore,
} from '../../../utils/feedbackExclusionStore';

export default function Index({ facultyName = 'Dr. Sarah Jenkins', reports }: FacultyReportsIndexProps) {
  const [submissions, setSubmissions] = useState(() => getMergedSubmissions());

  useEffect(() => {
    const handleUpdate = () => {
      setSubmissions(getMergedSubmissions());
    };
    window.addEventListener('feedback_exclusion_updated', handleUpdate);
    return () => window.removeEventListener('feedback_exclusion_updated', handleUpdate);
  }, []);

  // Compute aggregate stats across all faculty submissions
  const overallStats = useMemo(() => {
    const facultySubmissions = submissions.filter(
      (s) => s.facultyName.toLowerCase().includes(facultyName.toLowerCase()) || s.facultyId === 'FAC_JENKINS'
    );
    const targetSubmissions = facultySubmissions.length > 0 ? facultySubmissions : submissions;
    return calculateFacultyOverallScore(targetSubmissions);
  }, [submissions, facultyName]);

  return (
    <FacultyLayout facultyName={facultyName}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Feedback Evaluation Reports</h2>
          <p className="text-xs text-slate-500">Semester performance metrics based on anonymous student responses</p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Aggregate Score</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-extrabold text-slate-900">
                {overallStats.averageScore > 0 ? overallStats.averageScore.toFixed(2) : '4.86'}
              </p>
              <span className="text-xs text-amber-700 font-normal">/ 5.0</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 ml-1">
                {overallStats.includedCount} Submissions Included
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Evaluation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const courseSubmissions = submissions.filter(
            (s) => s.subjectCode === report.subjectCode || s.subjectName.toLowerCase() === report.subjectName.toLowerCase()
          );

          const courseStats = calculateFacultyOverallScore(
            courseSubmissions.length > 0 ? courseSubmissions : submissions
          );

          const effectiveScore = courseStats.includedCount > 0 ? courseStats.averageScore : report.overallScore;

          return (
            <Card key={report.id} className="relative group hover:border-teal-400 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {report.subjectCode}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">{report.subjectName}</h3>
                    <p className="text-xs text-slate-500">{report.batchName} &bull; {report.academicYear}</p>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Evaluation Rating</span>
                    <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-lg mt-0.5">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                      <span>{effectiveScore.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Submissions Considered</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {courseStats.includedCount}{' '}
                      <span className="text-xs text-slate-500 font-medium">/ {courseStats.totalSubmissions} Total</span>
                    </p>
                    {courseStats.excludedCount > 0 && (
                      <p className="text-[10px] font-bold text-rose-600 mt-0.5">
                        ({courseStats.excludedCount} complete submission{courseStats.excludedCount > 1 ? 's' : ''} excluded by HOD)
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>HOD Moderated Score</span>
                  </div>

                  <Link href="#Faculty/MyReports/Show">
                    <Button variant="primary" size="sm" className="bg-teal-600 hover:bg-teal-700 border-teal-600 focus:ring-teal-500 shadow-teal-600/20">
                      <span>View Detailed Report</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </FacultyLayout>
  );
}
