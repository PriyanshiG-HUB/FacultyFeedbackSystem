import React, { useState, useEffect, useMemo } from 'react';
import FacultyLayout from '../../../Layouts/FacultyLayout';
import { FacultyReportsIndexProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import Link from '../../../Components/shared/Link';
import { Star, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { calculateFacultyOverallScore } from '../../../utils/feedbackCalculations';
import { useAuth } from '../../../context/AuthContext';

export default function Index() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [apiDashboardStats, setApiDashboardStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  
  const activeFacultyName = user?.faculty?.full_name || user?.full_name || user?.email || 'Faculty Member';

  useEffect(() => {
    import('../../../lib/api').then(({ api }) => {
      api.get('/faculty/dashboard').then((res) => {
        if (res.data) setApiDashboardStats(res.data);
      }).catch(() => {});
      
      api.get('/faculty/feedback-forms').then((res) => {
        if (res.data?.data) {
          const apiReports = res.data.data.map((f: any) => ({
            id: f.id,
            subjectName: f.teaching_assignment?.subject?.subject_name || 'Subject',
            subjectCode: f.teaching_assignment?.subject?.subject_code || 'SUB',
            batchName: f.teaching_assignment?.batch?.batch_title || 'Batch',
            academicYear: f.teaching_assignment?.academic_year?.year_code || 'Year',
            totalStudents: f.teaching_assignment?.total_students || 0,
            respondedStudents: 0,
            overallScore: 0,
            status: f.is_published ? 'Published' : 'Pending Review'
          }));
          setReports(apiReports);
        }
      }).catch(() => {});
    });

    const handleUpdate = () => {
      setSubmissions([]);
    };
    window.addEventListener('feedback_exclusion_updated', handleUpdate);
    return () => window.removeEventListener('feedback_exclusion_updated', handleUpdate);
  }, []);

  // Compute aggregate stats across all faculty submissions
  const overallStats = useMemo(() => {
    const facultySubmissions = submissions.filter(
      (s: any) => s.facultyName.toLowerCase().includes(activeFacultyName.toLowerCase())
    );
    const targetSubmissions = facultySubmissions.length > 0 ? facultySubmissions : submissions;
    return calculateFacultyOverallScore(targetSubmissions);
  }, [submissions, activeFacultyName]);

  return (
    <FacultyLayout >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Feedback Evaluation Reports</h2>
          <p className="text-xs text-slate-500 mt-1">Semester performance metrics based on anonymous student responses</p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-brand-primary shrink-0" />
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Aggregate Score</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <p className="text-xl font-extrabold text-slate-900">
                {apiDashboardStats?.stats?.average_rating != null
                  ? Number(apiDashboardStats.stats.average_rating).toFixed(2)
                  : (overallStats.averageScore > 0 ? overallStats.averageScore.toFixed(2) : '0.00')}
              </p>
              <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
              <span className="text-[10px] font-bold text-brand-navy bg-brand-50 px-2 py-0.5 rounded border border-indigo-200 ml-2">
                {apiDashboardStats?.stats?.total_feedback_responses != null
                  ? `${apiDashboardStats.stats.total_feedback_responses} Submissions Included`
                  : `${overallStats.includedCount} Submissions Included`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Evaluation Cards */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 border-dashed rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">No Active Reports Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            There are currently no published feedback reports available for your assigned subjects. Once a feedback cycle completes and is published by the HOD, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const courseSubmissions = submissions.filter(
              (s: any) => s.subjectCode === report.subjectCode || s.subjectName.toLowerCase() === report.subjectName.toLowerCase()
            );

            const courseStats = calculateFacultyOverallScore(
              courseSubmissions.length > 0 ? courseSubmissions : submissions
            );

            const effectiveScore = courseStats.includedCount > 0 ? courseStats.averageScore : report.overallScore;

            return (
              <Card key={report.id} className="relative group hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand-navy bg-brand-50 px-2 py-0.5 rounded border border-indigo-200">
                        {report.subjectCode}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{report.subjectName}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{report.batchName} &bull; {report.academicYear}</p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Evaluation Rating</span>
                      <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-xl mt-1">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                        <span>{effectiveScore.toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Submissions Considered</span>
                      <p className="text-base font-extrabold text-slate-900 mt-1">
                        {courseStats.includedCount}{' '}
                        <span className="text-xs text-slate-400 font-medium">/ {courseStats.totalSubmissions} Total</span>
                      </p>
                      {courseStats.excludedCount > 0 && (
                        <p className="text-[10px] font-bold text-rose-600 mt-1">
                          ({courseStats.excludedCount} complete submission{courseStats.excludedCount > 1 ? 's' : ''} excluded by HOD)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <ShieldCheck className="w-4 h-4 text-brand-primary" />
                      <span>HOD Moderated Score</span>
                    </div>

                    <Link href={`#Faculty/MyReports/Show?subjectCode=${report.subjectCode}&subjectName=${encodeURIComponent(report.subjectName)}&overallScore=${effectiveScore.toFixed(2)}`}>
                      <Button variant="primary" size="sm" className="bg-brand-primary hover:bg-brand-navy border-brand-primary focus:ring-brand-primary shadow-brand-primary/20 text-xs px-4">
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
      )}
    </FacultyLayout>
  );
}
