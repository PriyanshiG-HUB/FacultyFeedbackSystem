import React, { useState, useEffect } from 'react';
import FacultyLayout from '../../../Layouts/FacultyLayout';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import Link from '../../../Components/shared/Link';
import { ArrowLeft, Star, Download, ShieldCheck, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

const getQueryParamsFromHash = () => {
  const hash = window.location.hash;
  const queryStringIndex = hash.indexOf('?');
  if (queryStringIndex !== -1) {
    const queryString = hash.substring(queryStringIndex + 1);
    return new URLSearchParams(queryString);
  }
  return new URLSearchParams();
};

export default function Show() {
  const { user } = useAuth();
  const params = getQueryParamsFromHash();

  const queryFacultyId = params.get('facultyId');
  const queryAssignmentId = params.get('teachingAssignmentId');
  const subjectCode = params.get('subjectCode') || 'SUB';
  const subjectName = params.get('subjectName') || 'Subject Name';
  const batchName = params.get('batchName') || 'N/A';
  const academicYear = params.get('academicYear') || 'N/A';
  const queryTotalStudents = parseInt(params.get('totalStudents') || '0', 10);
  const initialOverallScore = parseFloat(params.get('overallScore') || '0');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let facultyId = queryFacultyId ? parseInt(queryFacultyId, 10) : user?.faculty?.id;
      if (!facultyId) {
        const meRes = await api.get('/auth/me');
        if (meRes?.user?.faculty?.id) {
          facultyId = meRes.user.faculty.id;
        }
      }

      if (facultyId) {
        let url = `/faculty-reports/report?faculty_id=${facultyId}`;
        if (queryAssignmentId) {
          url += `&teaching_assignment_id=${queryAssignmentId}`;
        }
        const res = await api.get(url);
        if (res?.data) {
          setReportData(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to load faculty detailed report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [queryFacultyId, queryAssignmentId, user]);

  const effectiveScore = reportData?.overall_average != null
    ? Number(reportData.overall_average)
    : initialOverallScore;

  const totalSubmitted = reportData?.total_responses != null
    ? Number(reportData.total_responses)
    : 0;

  const totalStudents = reportData?.total_students != null && reportData.total_students > 0
    ? Number(reportData.total_students)
    : (queryTotalStudents > 0 ? queryTotalStudents : (totalSubmitted > 0 ? totalSubmitted : 60));

  const responseRate = reportData?.response_rate != null
    ? Number(reportData.response_rate)
    : (totalStudents > 0 ? Math.round((totalSubmitted / totalStudents) * 100) : 0);

  // Category Metric Breakdown
  const categoryMetrics = (reportData?.category_metrics || reportData?.metrics || []).map((m: any) => ({
    category: m.category || m.category_name,
    score: Number(m.score || m.avg_score || 0),
  }));

  // Student comments
  const studentComments: { text: string; rating: number; date: string }[] = [];
  if (reportData?.comment_cards && Array.isArray(reportData.comment_cards)) {
    reportData.comment_cards.forEach((card: any) => {
      if (Array.isArray(card.comments)) {
        card.comments.forEach((cmt: string) => {
          if (cmt && cmt !== 'NA') {
            studentComments.push({
              text: cmt,
              rating: effectiveScore > 0 ? Math.round(effectiveScore) : 5,
              date: reportData.generated_date || 'Recent Submission',
            });
          }
        });
      }
    });
  }

  const handleDownload = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const element = document.getElementById('faculty-detailed-report-area');
      if (!element) {
        window.print();
        return;
      }

      const cleanCode = (reportData?.subject?.subject_code || subjectCode).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Faculty_Performance_Report_${cleanCode}.pdf`;

      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await (window as any).html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <FacultyLayout>
      <div id="faculty-detailed-report-area" className="space-y-6">
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
                  {reportData?.subject?.subject_code || subjectCode}
                </span>
                <h2 className="text-xl font-bold font-heading text-slate-900">
                  {reportData?.subject?.subject_name || subjectName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {batchName} &bull; {reportData?.subject?.academic_year || academicYear}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={isDownloadingPdf}
            className="bg-teal-600 hover:bg-teal-700 border-teal-600 focus:ring-teal-500"
          >
            {isDownloadingPdf ? (
              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1.5" />
            )}
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
              Calculated from {totalSubmitted} included student submissions
            </p>
          </Card>

          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submissions Considered</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalSubmitted}</span>
              <span className="text-xs text-slate-500 font-medium">/ {totalStudents} Enrolled</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {totalSubmitted > 0 ? '100% of submitted forms considered' : 'Awaiting student feedback'}
            </p>
          </Card>

          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Effective Response Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-700">
                {Math.round(responseRate)}%
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                {responseRate >= 60 ? 'High Confidence' : (responseRate > 0 ? 'Moderate Confidence' : 'Pending')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {totalSubmitted} active submissions out of {totalStudents} enrolled
            </p>
          </Card>
        </div>

        {/* Category Parameter Breakdown Chart */}
        <Card title="Category Metric Breakdown" subtitle="Detailed evaluation rating per category metric (Included submissions)">
          <div className="h-72 w-full pt-2">
            {categoryMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryMetrics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={180} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="score" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <p>No category breakdown data available for this report.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Student Qualitative Comments */}
        <Card title="Qualitative Student Feedback & Remarks" subtitle="Anonymous student comments and suggestions">
          <div className="divide-y divide-slate-100 space-y-3">
            {studentComments.length > 0 ? (
              studentComments.map((c: any, i: number) => (
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
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs italic">
                No qualitative student remarks submitted yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </FacultyLayout>
  );
}
