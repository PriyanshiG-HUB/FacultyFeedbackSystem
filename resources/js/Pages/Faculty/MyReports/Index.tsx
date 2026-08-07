import React from 'react';
import FacultyLayout from '../../../Layouts/FacultyLayout';
import { FacultyReportsIndexProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import Link from '../../../Components/shared/Link';
import { Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Index({ facultyName, reports }: FacultyReportsIndexProps) {
  return (
    <FacultyLayout facultyName={facultyName}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Feedback Evaluation Reports</h2>
          <p className="text-xs text-slate-500">Semester performance metrics based on anonymous student responses</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Overall Aggregate Score</p>
            <p className="text-lg font-extrabold text-slate-900">4.86 <span className="text-xs text-amber-700 font-normal">/ 5.0</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const responseRate = Math.round((report.respondedStudents / report.totalStudents) * 100);

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
                      <span>{report.overallScore.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Response Rate</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {report.respondedStudents} / {report.totalStudents}{' '}
                      <span className="text-xs text-slate-500 font-medium">({responseRate}%)</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
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
