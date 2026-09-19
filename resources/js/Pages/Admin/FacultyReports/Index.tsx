import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Input, Select } from '../../../Components/ui/Input';
import { UserCheck, Search, Printer, Download, RefreshCw, FileText, Sparkles, Filter, Building2 } from 'lucide-react';
import { api } from '../../../lib/api';

interface FacultyOption {
  id: number;
  full_name: string;
  email: string;
  department_id: number;
  department_name: string;
  department_code: string;
  designation_name: string;
}

interface AssignmentOption {
  id: number;
  subject_id: number;
  subject_code: string;
  subject_name: string;
  course_type: string;
  batch_title: string;
  academic_year_code: string;
  semester_no: number;
  display_label: string;
  total_responses: number;
}

interface QuestionStat {
  question_id: number;
  question_text: string;
  category_name: string;
  strongly_agree_pct: number;
  agree_pct: number;
  neutral_pct: number;
  disagree_pct: number;
  strongly_disagree_pct: number;
  avg_score: number;
  avg_pct: number;
}

interface CommentCardData {
  question_text: string;
  comments: string[];
}

interface FacultyReportData {
  faculty: {
    id: number;
    full_name: string;
    email: string;
    department_name: string;
    department_code: string;
    department_full_name: string;
    designation_name: string;
  };
  subject: {
    subject_name: string;
    subject_code: string;
    course_type: string;
    academic_year: string;
  };
  generated_date: string;
  total_responses: number;
  overall_average: number;
  overall_percentage: number;
  distribution: {
    strongly_agree: number;
    agree: number;
    neutral: number;
    disagree: number;
    strongly_disagree: number;
  };
  question_statistics: QuestionStat[];
  comment_cards: CommentCardData[];
}

export default function Index() {
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<AssignmentOption[]>([]);
  
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | ''>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLoadingFaculty, setIsLoadingFaculty] = useState<boolean>(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(false);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');

  const [reportData, setReportData] = useState<FacultyReportData | null>(null);
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Fetch Faculty Members
  const fetchFaculty = useCallback(async () => {
    setIsLoadingFaculty(true);
    setFetchError('');
    try {
      const res = await api.get(`/faculty-reports/faculty-list${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
      if (res && res.success && Array.isArray(res.data)) {
        setFacultyList(res.data);
        if (res.data.length > 0 && (selectedFacultyId === '' || selectedFacultyId === null)) {
          const firstId = Number(res.data[0].id);
          if (!isNaN(firstId) && firstId > 0) {
            setSelectedFacultyId(firstId);
          }
        }
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to fetch faculty list.');
    } finally {
      setIsLoadingFaculty(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // Fetch Teaching Assignments when Selected Faculty changes
  useEffect(() => {
    const facultyIdNum = Number(selectedFacultyId);
    if (!selectedFacultyId || isNaN(facultyIdNum) || facultyIdNum <= 0) {
      setAssignmentsList([]);
      setSelectedAssignmentId('');
      return;
    }

    const fetchAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        const res = await api.get(`/faculty-reports/assignments?faculty_id=${facultyIdNum}`);
        if (res && res.success && Array.isArray(res.data)) {
          setAssignmentsList(res.data);
          setSelectedAssignmentId(''); // Default to 'All'
        }
      } catch {
        setAssignmentsList([]);
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, [selectedFacultyId]);

  // Fetch Report Data
  const handleGenerateReport = async () => {
    const facultyIdNum = Number(selectedFacultyId);
    if (!selectedFacultyId || isNaN(facultyIdNum) || facultyIdNum <= 0) return;

    setIsLoadingReport(true);
    setFetchError('');
    try {
      let url = `/faculty-reports/report?faculty_id=${facultyIdNum}`;
      if (selectedAssignmentId) {
        url += `&teaching_assignment_id=${selectedAssignmentId}`;
      }
      const res = await api.get(url);

      if (res && res.success && res.data) {
        setReportData(res.data);
      } else {
        setFetchError('Failed to load report data from backend.');
      }
    } catch (err: any) {
      setFetchError(err?.message || 'An error occurred while generating the report.');
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Auto-generate report when faculty is selected
  useEffect(() => {
    if (selectedFacultyId) {
      handleGenerateReport();
    }
  }, [selectedFacultyId, selectedAssignmentId]);

  const handleDownloadPDF = async () => {
    if (!reportData || isDownloadingPdf) return;

    setIsDownloadingPdf(true);
    try {
      // Dynamically load html2pdf.js if not available
      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const element = document.getElementById('faculty-report-printable-area');
      if (!element) {
        window.print();
        return;
      }

      const facultyCleanName = reportData.faculty.full_name.replace(/[^a-zA-Z0-9]/g, '_');
      const subjectCleanCode = (reportData.subject.subject_code || 'All').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Teacher_Performance_Report_${facultyCleanName}_${subjectCleanCode}.pdf`;

      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.summary-grid', '.table-wrap', '.comment-card', '.faculty-box', '.footer-note'] }
      };

      await (window as any).html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback to print dialog if html2pdf fails or network issues occur
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const selectedFacultyObj = facultyList.find((f) => f.id === selectedFacultyId);

  return (
    <AdminLayout>
      <style>{`
        :root {
          --blue: #2f6fd3;
          --blue-dark: #1f5bb5;
          --green: #15956f;
          --green-light: #e8f7f1;
          --orange: #f2b66d;
          --orange-bg: #fff8ee;
          --border: #d9dee7;
          --text: #26313d;
          --muted: #687384;
          --bg: #f5f7fa;
          --white: #fff;
        }

        .a4-preview-wrapper {
          width: 100%;
          overflow-x: auto;
          padding: 24px 16px 40px;
          background: #f1f5f9;
          display: flex;
          justify-content: center;
        }

        .a4-document {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 12mm 15mm;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-radius: 4px;
          box-sizing: border-box;
          color: #1e293b;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11.5px;
          line-height: 1.4;
          position: relative;
        }

        .top-header {
          padding: 0 0 12px;
          text-align: center;
        }

        .department-title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.01em;
        }

        .report-main-title {
          margin: 4px 0 10px;
          color: #2563eb;
          font-size: 16px;
          font-weight: 800;
        }

        .faculty-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          padding: 8px 14px;
          text-align: center;
          margin-bottom: 10px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .faculty-box h2 {
          margin: 0;
          font-size: 15px;
          color: #1e293b;
          font-weight: 800;
        }

        .faculty-box .dept {
          margin-top: 2px;
          color: #475569;
          font-weight: 700;
          font-size: 12px;
        }

        .meta-info {
          margin: 0 0 10px;
          font-size: 11px;
          color: #475569;
          font-weight: 600;
          text-align: center;
          line-height: 1.4;
        }

        .blue-divider {
          height: 3px;
          background: #2563eb;
          margin-bottom: 12px;
          border-radius: 2px;
        }

        .subject-card {
          border: 1px solid #cbd5e1;
          border-left: 5px solid #10b981;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
          page-break-inside: auto;
          break-inside: auto;
        }

        .subject-head {
          background: #ecfdf5;
          color: #047857;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.4;
          border-bottom: 1px solid #a7f3d0;
        }

        .section-inner {
          padding: 10px 12px;
        }

        .section-title {
          margin: 10px 0 8px;
          padding: 5px 8px;
          background: #f8fafc;
          border-left: 3px solid #3b82f6;
          font-size: 12px;
          font-weight: 800;
          border-radius: 0 4px 4px 0;
        }

        .summary-grid {
          display: flex;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 10px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .summary-box {
          flex: 1;
          padding: 10px 14px;
        }

        .summary-box + .summary-box {
          border-left: 1px solid #e2e8f0;
        }

        .summary-label {
          font-weight: 800;
          font-size: 11.5px;
          color: #475569;
        }

        .average-score {
          margin-top: 4px;
          color: #2563eb;
          font-size: 26px;
          font-weight: 800;
        }

        .distribution-list {
          margin-top: 4px;
        }

        .distribution-list div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 2px 0;
          font-size: 11px;
        }

        .distribution-list strong {
          font-weight: 800;
        }

        .table-wrap {
          overflow-x: auto;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          margin-bottom: 8px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        table.perf-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 11px;
        }

        table.perf-table th,
        table.perf-table td {
          border: 1px solid #cbd5e1;
          padding: 5px 6px;
          vertical-align: middle;
          text-align: center;
        }

        table.perf-table th {
          background: #f8fafc;
          font-weight: 800;
          color: #334155;
        }

        table.perf-table th:first-child,
        table.perf-table td:first-child {
          width: 44%;
          text-align: left;
          padding-left: 8px;
        }

        table.perf-table tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .avg-tag {
          display: inline-block;
          padding: 2px 5px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
          font-weight: 800;
          font-size: 10.5px;
        }

        .comments-section {
          margin-top: 8px;
        }

        .comment-card {
          margin: 6px 0;
          padding: 8px 10px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 6px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .comment-question {
          color: #b45309;
          font-weight: 800;
          font-size: 11.5px;
        }

        .comment-list {
          margin: 3px 0 0;
          padding-left: 14px;
          color: #475569;
          font-size: 11px;
          line-height: 1.35;
        }

        .footer-note {
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 10.5px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .report-controls {
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 28px;
          background: rgba(255, 255, 255, 0.96);
          border-top: 1px solid #d9dee7;
          backdrop-filter: blur(8px);
          z-index: 10;
        }

        .report-controls button {
          border: 0;
          border-radius: 6px;
          padding: 9px 14px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .report-controls button.print {
          background: #2563eb;
          color: white;
        }

        .report-controls button.print:hover {
          background: #1d4ed8;
        }

        .report-controls button.compact {
          background: #e9edf3;
          color: #374151;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          nav, header, aside, .no-print, .report-controls {
            display: none !important;
          }
          body, html {
            background: #fff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 210mm !important;
          }
          .a4-preview-wrapper {
            padding: 0 !important;
            background: #fff !important;
            display: block !important;
            overflow: visible !important;
          }
          .a4-document {
            width: 210mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 12mm 15mm !important;
          }
          .summary-grid, .table-wrap, .comment-card, .faculty-box, .footer-note {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          table.perf-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Top Header & Page Title */}
      <div className="no-print space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                <UserCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Reports</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Search and view dynamic Teacher Performance Evaluation Reports for faculty members based on actual student feedback responses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateReport}
              disabled={isLoadingReport || !selectedFacultyId}
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoadingReport ? 'animate-spin' : ''}`} />
              Refresh Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf || !reportData}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDownloadingPdf ? (
                <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1.5" />
              )}
              {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </Button>
          </div>
        </div>

        {/* Filter & Selection Card */}
        <Card className="border-blue-100 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search / Select Faculty */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Search & Select Faculty
              </label>
              <Select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoadingFaculty}
              >
                <option value="">-- Select Faculty Member --</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.full_name} ({f.department_code}) - {f.designation_name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Select Subject / Teaching Assignment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Filter Subject / Academic Year
              </label>
              <Select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoadingAssignments || !selectedFacultyId}
              >
                <option value="">All Assigned Subjects (Aggregated Report)</option>
                {assignmentsList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.display_label} ({a.total_responses} responses)
                  </option>
                ))}
              </Select>
            </div>

            {/* Search By Name/Email Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Search Query Filter
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Filter faculty by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {selectedFacultyObj && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>
                  <strong>Department:</strong> {selectedFacultyObj.department_name} ({selectedFacultyObj.department_code})
                </span>
                <span className="text-slate-300">&bull;</span>
                <span>
                  <strong>Designation:</strong> {selectedFacultyObj.designation_name}
                </span>
              </div>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Active Faculty DB Profile
              </span>
            </div>
          )}
        </Card>

        {fetchError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}
      </div>

      {/* Report Template View Container */}
      {isLoadingReport ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-sm">Calculating feedback statistics from database...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-4">
          <div className="a4-preview-wrapper">
            <div className="a4-document" id="faculty-report-printable-area">
              <header className="top-header">
                <p className="department-title">{reportData.faculty.department_full_name}</p>
                <h1 className="report-main-title">Teacher Performance Report</h1>

                <div className="faculty-box">
                  <h2>{reportData.faculty.full_name}</h2>
                  <div className="dept">Department: {reportData.faculty.department_code}</div>
                </div>

                <div className="meta-info">
                  Subject: {reportData.subject.subject_name} | Academic Year: {reportData.subject.academic_year} | Report
                  Generated: {reportData.generated_date} | Total Responses: {reportData.total_responses}
                </div>
              </header>

              <div className="blue-divider"></div>

              <section className="subject-card">
                <div className="subject-head">
                  Subject: {reportData.subject.subject_name} ({reportData.subject.course_type}) &nbsp; | &nbsp; Responses:{' '}
                  {reportData.total_responses} &nbsp; | &nbsp; Average: {reportData.overall_average.toFixed(2)}/5.0 (
                  {reportData.overall_percentage}%)
                </div>

                <div className="section-inner">
                  <div className="section-title">Performance Summary</div>

                  <div className="summary-grid">
                    <div className="summary-box">
                      <div className="summary-label">Average Rating</div>
                      <div className="average-score">{reportData.overall_percentage}%</div>
                    </div>

                    <div className="summary-box">
                      <div className="summary-label">Rating Distribution</div>
                      <div className="distribution-list">
                        <div>
                          <span>Strongly Agree:</span>
                          <strong>{reportData.distribution.strongly_agree}%</strong>
                        </div>
                        <div>
                          <span>Agree:</span>
                          <strong>{reportData.distribution.agree}%</strong>
                        </div>
                        <div>
                          <span>Neutral:</span>
                          <strong>{reportData.distribution.neutral}%</strong>
                        </div>
                        <div>
                          <span>Disagree:</span>
                          <strong>{reportData.distribution.disagree}%</strong>
                        </div>
                        <div>
                          <span>Strongly Disagree:</span>
                          <strong>{reportData.distribution.strongly_disagree}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="section-title">Question-wise Statistics</div>

                  <div className="table-wrap">
                    <table className="perf-table">
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>S.Agree</th>
                          <th>Agree</th>
                          <th>Neutral</th>
                          <th>Disagree</th>
                          <th>S.Disagree</th>
                          <th>Avg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.question_statistics.map((q, idx) => (
                          <tr key={idx}>
                            <td>{q.question_text}</td>
                            <td>{q.strongly_agree_pct}%</td>
                            <td>{q.agree_pct}%</td>
                            <td>{q.neutral_pct}%</td>
                            <td>{q.disagree_pct}%</td>
                            <td>{q.strongly_disagree_pct}%</td>
                            <td>
                              <span className="avg-tag">{q.avg_pct}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!isCompactMode && reportData.comment_cards && reportData.comment_cards.length > 0 && (
                    <>
                      <div className="section-title">Student Comments on Feedback</div>

                      <div className="comments-section">
                        {reportData.comment_cards.map((card, idx) => (
                          <div className="comment-card" key={idx}>
                            <div className="comment-question">{card.question_text}</div>
                            <ul className="comment-list">
                              {card.comments.map((comment, cIdx) => (
                                <li key={cIdx}>{comment}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>

              <footer className="footer-note">
                This report was automatically generated by the Student Feedback System
                <br />
                {reportData.faculty.department_full_name} - Academic Year {reportData.subject.academic_year}
              </footer>
            </div>
          </div>

          <div className="report-controls no-print" data-html2canvas-ignore="true">
            <button
              className="compact"
              onClick={() => setIsCompactMode(!isCompactMode)}
            >
              {isCompactMode ? 'Full View' : 'Compact View'}
            </button>
            <button className="print" onClick={handleDownloadPDF} disabled={isDownloadingPdf}>
              {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
          </div>
        </div>
      ) : (
        <Card className="py-16 text-center text-slate-500">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No Faculty Selected</p>
          <p className="text-xs text-slate-400 mt-1">Please select a faculty member from the dropdown above to generate their performance report.</p>
        </Card>
      )}
    </AdminLayout>
  );
}
