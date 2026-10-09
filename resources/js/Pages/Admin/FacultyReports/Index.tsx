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
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.summary-grid', '.comment-card', '.faculty-box', '.footer-note', 'tr'] }
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
          --blue: #22396F;
          --blue-dark: #0D1C42;
          --cream: #FCF1D0;
          --brand-accent: #FCF1D0;
          --text: #1a202c;
          --text-muted: #718096;
          --border: #e2e8f0;
          --bg-soft: #f8fafc;
        }

        .a4-preview-wrapper {
          width: 100%;
          overflow-x: auto;
          padding: 32px 16px 60px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          display: flex;
          justify-content: center;
        }

        .a4-document {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 15mm 20mm;
          background: #ffffff;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 10px rgba(0,0,0,0.05);
          border-radius: 8px;
          box-sizing: border-box;
          color: var(--text);
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          position: relative;
        }

        .top-header {
          padding: 0 0 24px;
          text-align: center;
          position: relative;
          border-bottom: 2px solid var(--bg-soft);
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80px;
        }

        .charusat-report-logo {
          height: 70px;
          object-fit: contain;
          position: absolute;
          left: 0;
          top: 0;
        }

        .header-text-container {
          width: 100%;
          text-align: center;
        }

        .department-title {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .report-main-title {
          margin: 8px 0 20px;
          color: var(--blue-dark);
          font-size: 24px;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }

        .faculty-box {
          background: linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 100%);
          border-radius: 12px;
          padding: 20px 24px;
          text-align: left;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 10px 25px -5px rgba(13, 28, 66, 0.4);
          width: 100%;
          box-sizing: border-box;
        }

        .faculty-box-left h2 {
          margin: 0;
          font-size: 20px;
          color: var(--cream);
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.01em;
        }

        .faculty-box-left .dept {
          margin-top: 6px;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
          font-size: 13px;
          letter-spacing: 0.03em;
        }

        .meta-info {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          text-align: right;
          line-height: 1.6;
        }

        .meta-info strong {
          color: #ffffff;
          font-weight: 700;
        }

        .subject-card {
          margin-bottom: 24px;
        }

        .subject-head {
          background: var(--bg-soft);
          color: var(--blue-dark);
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 800;
          border-radius: 8px;
          border-left: 6px solid var(--blue);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-title {
          margin: 24px 0 16px;
          color: var(--blue-dark);
          font-size: 16px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          page-break-after: avoid;
          break-after: avoid;
        }
        
        .section-title::before {
           content: '';
           display: block;
           width: 24px;
           height: 4px;
           background: var(--blue);
           border-radius: 2px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-box {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .summary-label {
          font-weight: 700;
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .average-score {
          margin-top: 8px;
          color: var(--blue-dark);
          font-size: 36px;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
        }

        .distribution-list {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .distribution-list div {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          padding: 8px 12px;
          background: var(--bg-soft);
          border-radius: 6px;
        }

        .distribution-list strong {
          font-weight: 800;
          color: var(--blue-dark);
        }

        .table-wrap {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          margin-bottom: 24px;
        }

        table.perf-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        table.perf-table th {
          background: var(--blue-dark);
          color: #ffffff;
          font-weight: 600;
          padding: 14px 16px;
          text-align: center;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        table.perf-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          text-align: center;
          color: var(--text);
          font-weight: 500;
        }

        table.perf-table tr:last-child td {
          border-bottom: none;
        }

        table.perf-table tr:nth-child(even) td {
          background: var(--bg-soft);
        }

        table.perf-table th:first-child,
        table.perf-table td:first-child {
          text-align: left;
          width: 40%;
        }

        .avg-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          background: var(--cream);
          color: var(--blue-dark);
          border-radius: 6px;
          font-weight: 800;
          font-size: 11px;
        }

        .comment-card {
          margin: 12px 0;
          padding: 16px 20px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-left: 4px solid var(--blue);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .comment-question {
          color: var(--blue-dark);
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .comment-list {
          margin: 0;
          padding-left: 18px;
          color: var(--text-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .comment-list li {
          margin-bottom: 4px;
        }

        .footer-note {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          text-align: center;
          color: var(--text-muted);
          font-size: 11px;
        }

        .report-controls {
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 28px;
          background: rgba(255, 255, 255, 0.85);
          border-top: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px);
          z-index: 10;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
        }

        .report-controls button {
          border: 0;
          border-radius: 8px;
          padding: 10px 20px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .report-controls button.print {
          background: linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(13, 28, 66, 0.3);
        }

        .report-controls button.print:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(13, 28, 66, 0.4);
        }

        .report-controls button.compact {
          background: #ffffff;
          color: var(--blue-dark);
          border: 1px solid var(--border);
        }
        
        .report-controls button.compact:hover {
          background: var(--bg-soft);
        }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          nav, header, aside, .no-print, .report-controls { display: none !important; }
          body, html { background: #fff !important; padding: 0 !important; margin: 0 !important; width: 210mm !important; }
          .a4-preview-wrapper { padding: 0 !important; background: #fff !important; display: block !important; overflow: visible !important; }
          .a4-document { width: 210mm !important; margin: 0 !important; box-shadow: none !important; border: none !important; padding: 12mm 15mm !important; }
          .summary-grid, .comment-card, .faculty-box, .footer-note { break-inside: avoid !important; page-break-inside: avoid !important; }
          table.perf-table tr { break-inside: avoid !important; page-break-inside: avoid !important; }
        }
      `}</style>

      {/* Top Header & Page Title */}
      <div className="no-print space-y-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-brand-navy via-[#162754] to-brand-primary p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md shadow-inner border border-white/10">
                <UserCheck className="w-6 h-6 text-brand-accent" />
              </span>
              <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">Faculty Reports</h1>
            </div>
            <p className="text-sm text-blue-100 max-w-xl leading-relaxed">
              Generate and analyze high-resolution Teacher Performance Evaluation Reports. Explore dynamic insights based on validated student feedback.
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <Button
              variant="outline"
              size="lg"
              onClick={handleGenerateReport}
              disabled={isLoadingReport || !selectedFacultyId}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingReport ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf || !reportData}
              className="bg-brand-accent text-brand-navy hover:bg-yellow-300 font-bold shadow-lg hover:shadow-xl transition-all border-none"
            >
              {isDownloadingPdf ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isDownloadingPdf ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {/* Filter & Selection Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search / Select Faculty */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-brand-primary" /> Target Faculty
              </label>
              <Select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoadingFaculty}
                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-brand-primary focus:ring-brand-primary/20 h-11 text-sm font-semibold text-brand-navy"
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
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-brand-primary" /> Filter Subject / Academic Year
              </label>
              <Select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoadingAssignments || !selectedFacultyId}
                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-brand-primary focus:ring-brand-primary/20 h-11 text-sm font-semibold text-brand-navy"
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
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-brand-primary" /> Search Query Filter
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Filter faculty by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-brand-primary focus:ring-brand-primary/20 h-11 text-sm font-semibold text-brand-navy"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {selectedFacultyObj && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-primary" />
                <span>
                  <strong>Department:</strong> {selectedFacultyObj.department_name} ({selectedFacultyObj.department_code})
                </span>
                <span className="text-slate-300">&bull;</span>
                <span>
                  <strong>Designation:</strong> {selectedFacultyObj.designation_name}
                </span>
              </div>
              <span className="font-semibold text-brand-navy bg-brand-50 px-2 py-0.5 rounded border border-blue-200">
                Active Faculty DB Profile
              </span>
            </div>
          )}
        </div>

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
          <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-sm">Calculating feedback statistics from database...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-4">
          <div className="a4-preview-wrapper">
            <div className="a4-document" id="faculty-report-printable-area">
              <header className="top-header">
                <img src="/main_logo.png" alt="CHARUSAT" className="charusat-report-logo" />
                <div className="header-text-container">
                  <p className="department-title">{reportData.faculty.department_full_name}</p>
                  <h1 className="report-main-title">Faculty Performance Evaluation Report</h1>
                </div>

                <div className="faculty-box">
                  <div className="faculty-box-left">
                    <h2>{reportData.faculty.full_name}</h2>
                    <div className="dept">{reportData.faculty.department_code} • {reportData.faculty.designation_name}</div>
                  </div>
                  <div className="meta-info">
                    Report Generated: <strong>{reportData.generated_date}</strong><br/>
                    Total Responses: <strong>{reportData.total_responses}</strong>
                  </div>
                </div>
              </header>

              <div className="blue-divider"></div>

              <section className="subject-card">
                <div className="subject-head">
                  <span>Subject: {reportData.subject.subject_name} ({reportData.subject.course_type})</span>
                  <span>Responses: {reportData.total_responses} &nbsp;|&nbsp; Avg: {reportData.overall_average.toFixed(2)}/5.0 ({reportData.overall_percentage}%)</span>
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
