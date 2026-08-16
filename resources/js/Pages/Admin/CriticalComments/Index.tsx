import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { CriticalCommentsIndexProps, FeedbackSubmissionItem, QuestionAnswerItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Card } from '../../../Components/ui/Card';
import { Modal } from '../../../Components/ui/Modal';
import {
  SYSTEM_QUESTIONS,
  getMergedSubmissions,
  excludeSubmission,
  bulkExcludeSubmissions,
  includeSubmission,
  calculateFacultyOverallScore,
  calculateQuestionDistribution,
} from '../../../utils/feedbackExclusionStore';
import {
  AlertTriangle,
  Star,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  RotateCcw,
  ShieldAlert,
  Info,
  Building2,
  ListFilter,
  CheckSquare,
  Square,
  HelpCircle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function Index({
  departmentName = 'Information Technology',
  userRole = 'hod',
  assignedDepartmentCode,
  comments,
  submissions: propSubmissions,
}: CriticalCommentsIndexProps) {
  // Synchronized mock feedback submissions state
  const [submissions, setSubmissions] = useState<FeedbackSubmissionItem[]>(() => getMergedSubmissions());

  // Storage listener for cross-component updates
  useEffect(() => {
    const handleUpdate = () => {
      setSubmissions(getMergedSubmissions());
    };
    window.addEventListener('feedback_exclusion_updated', handleUpdate);
    return () => window.removeEventListener('feedback_exclusion_updated', handleUpdate);
  }, []);

  // Filter States
  const [selectedFaculty, setSelectedFaculty] = useState<string>('Dr. Sarah Jenkins');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2025-26');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedQuestionFilter, setSelectedQuestionFilter] = useState<number | 'ALL'>(1); // Default Q1
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'ALL'>(1); // Default 1 (Strongly Disagree)

  // Selection state for bulk actions
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);

  // Active Modals
  const [fullFeedbackSubmission, setFullFeedbackSubmission] = useState<FeedbackSubmissionItem | null>(null);
  const [excludeModalSubmission, setExcludeModalSubmission] = useState<FeedbackSubmissionItem | null>(null);
  const [isBulkExcludeModalOpen, setIsBulkExcludeModalOpen] = useState<boolean>(false);
  const [includeModalSubmission, setIncludeModalSubmission] = useState<FeedbackSubmissionItem | null>(null);

  // Exclusion Form Input
  const [exclusionReason, setExclusionReason] = useState<string>('');
  const [reasonError, setReasonError] = useState<string>('');

  // Extract Faculty Options based on Active Role & Scope
  const facultyOptions = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => {
      if (userRole === 'hod' && assignedDepartmentCode && s.departmentCode && s.departmentCode !== assignedDepartmentCode) {
        return; // Skip faculty outside HOD's department
      }
      map.set(s.facultyName, s.facultyName);
    });
    return Array.from(map.values());
  }, [submissions, userRole, assignedDepartmentCode]);

  // Keep selectedFaculty aligned with available options when preview access level changes
  useEffect(() => {
    if (facultyOptions.length > 0 && !facultyOptions.includes(selectedFaculty)) {
      setSelectedFaculty(facultyOptions[0]);
    }
  }, [facultyOptions, selectedFaculty]);

  // Extract Subject Options
  const subjectOptions = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    submissions.forEach((s) => {
      if (userRole === 'hod' && assignedDepartmentCode && s.departmentCode && s.departmentCode !== assignedDepartmentCode) {
        return;
      }
      map.set(s.subjectCode, { code: s.subjectCode, name: s.subjectName });
    });
    return Array.from(map.values());
  }, [submissions, userRole, assignedDepartmentCode]);

  // Filter Submissions based on Selected Faculty / Course Scope
  const scopedSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (userRole === 'hod' && assignedDepartmentCode && s.departmentCode && s.departmentCode !== assignedDepartmentCode) {
        return false;
      }
      if (selectedFaculty !== 'ALL' && s.facultyName !== selectedFaculty) return false;
      if (selectedSubject !== 'ALL' && s.subjectCode !== selectedSubject) return false;
      if (selectedAcademicYear !== 'ALL' && s.academicYear !== selectedAcademicYear) return false;
      if (selectedSemester !== 'ALL' && String(s.semester) !== selectedSemester) return false;
      if (selectedDivision !== 'ALL' && s.division !== selectedDivision) return false;

      return true;
    });
  }, [submissions, selectedFaculty, selectedSubject, selectedAcademicYear, selectedSemester, selectedDivision, assignedDepartmentCode, userRole]);

  // Calculate Overall Faculty Score (Included Complete Submissions Only)
  const facultyOverallStats = useMemo(() => {
    return calculateFacultyOverallScore(scopedSubmissions);
  }, [scopedSubmissions]);

  // Filter submissions for the drill-down table
  const tableSubmissions = useMemo(() => {
    if (selectedQuestionFilter === 'ALL') return scopedSubmissions;

    return scopedSubmissions.filter((sub) => {
      const qAns = sub.answers.find((a) => a.questionId === selectedQuestionFilter);
      if (!qAns) return false;
      if (selectedRatingFilter !== 'ALL' && qAns.rating !== selectedRatingFilter) return false;
      return true;
    });
  }, [scopedSubmissions, selectedQuestionFilter, selectedRatingFilter]);

  // Handle Bulk Checkbox Toggles
  const handleToggleSelect = (id: string) => {
    setSelectedSubmissionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Exclusion Handler
  const handleOpenExcludeSingle = (sub: FeedbackSubmissionItem) => {
    setExcludeModalSubmission(sub);
    setExclusionReason('');
    setReasonError('');
  };

  const handleConfirmExcludeSingle = () => {
    if (!excludeModalSubmission) return;
    if (!exclusionReason.trim()) {
      setReasonError('Reason for exclusion is required for moderation review.');
      return;
    }

    const updated = excludeSubmission(excludeModalSubmission.id, exclusionReason.trim(), userRole === 'admin' ? 'Administrator' : `HOD (${departmentName})`);
    setSubmissions(updated);

    if (fullFeedbackSubmission && fullFeedbackSubmission.id === excludeModalSubmission.id) {
      const updatedItem = updated.find((s) => s.id === excludeModalSubmission.id);
      if (updatedItem) setFullFeedbackSubmission(updatedItem);
    }

    setExcludeModalSubmission(null);
    setExclusionReason('');
    setReasonError('');
  };

  // Bulk Exclusion Handler
  const handleConfirmBulkExclude = () => {
    if (selectedSubmissionIds.length === 0) return;
    if (!exclusionReason.trim()) {
      setReasonError('Reason for exclusion is required for moderation review.');
      return;
    }

    const updated = bulkExcludeSubmissions(selectedSubmissionIds, exclusionReason.trim(), userRole === 'admin' ? 'Administrator' : `HOD (${departmentName})`);
    setSubmissions(updated);
    setSelectedSubmissionIds([]);
    setIsBulkExcludeModalOpen(false);
    setExclusionReason('');
    setReasonError('');
  };

  // Single Re-Inclusion Handler
  const handleOpenIncludeSingle = (sub: FeedbackSubmissionItem) => {
    setIncludeModalSubmission(sub);
  };

  const handleConfirmIncludeSingle = () => {
    if (!includeModalSubmission) return;

    const updated = includeSubmission(includeModalSubmission.id);
    setSubmissions(updated);

    if (fullFeedbackSubmission && fullFeedbackSubmission.id === includeModalSubmission.id) {
      const updatedItem = updated.find((s) => s.id === includeModalSubmission.id);
      if (updatedItem) setFullFeedbackSubmission(updatedItem);
    }

    setIncludeModalSubmission(null);
  };

  // Role Scope Display Formatting
  const isAdministrator = userRole === 'admin';
  const roleBadgeText = isAdministrator
    ? 'Administrator • All Departments'
    : `HOD Portal • ${departmentName} Scope`;
  const pageHeaderTitle = isAdministrator
    ? 'System Administrator — Faculty Feedback Moderation'
    : `${departmentName} — Faculty Feedback Moderation Console`;

  // Columns for Submissions Table
  const columns: Column<FeedbackSubmissionItem>[] = [
    {
      header: 'Select',
      accessor: (row) => (
        <input
          type="checkbox"
          checked={selectedSubmissionIds.includes(row.id)}
          onChange={() => handleToggleSelect(row.id)}
          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
        />
      ),
    },
    {
      header: 'Student Roll',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
          {row.studentRoll}
        </span>
      ),
      sortable: true,
    },
    {
      header: selectedQuestionFilter !== 'ALL' ? `Q${selectedQuestionFilter} Rating` : 'Form Average',
      accessor: (row) => {
        if (selectedQuestionFilter !== 'ALL') {
          const ans = row.answers.find((a) => a.questionId === selectedQuestionFilter);
          if (!ans) return <span>-</span>;
          return (
            <span
              className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded border ${
                ans.rating <= 2
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : ans.rating >= 4
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              {ans.rating}.0 — {ans.ratingLabel}
            </span>
          );
        }

        const avg = row.answers.reduce((acc, a) => acc + a.rating, 0) / row.answers.length;
        return (
          <span className="font-bold text-xs text-slate-800">
            {avg.toFixed(1)} / 5.0
          </span>
        );
      },
      sortable: true,
    },
    {
      header: 'Submitted Date',
      accessor: (row) => <span className="text-xs text-slate-500">{row.submittedAt}</span>,
      sortable: true,
    },
    {
      header: 'Submission Status',
      accessor: (row) => {
        if (row.evaluationStatus === 'included') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Included
            </span>
          );
        }
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Excluded by HOD
            </span>
            {row.exclusionReason && (
              <span className="text-[10px] text-rose-600 font-medium italic truncate max-w-[180px]" title={row.exclusionReason}>
                Reason: {row.exclusionReason}
              </span>
            )}
          </div>
        );
      },
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Feedback Moderation Console" currentPath="#Admin/CriticalComments/Index">
      <div className="space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {roleBadgeText}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {pageHeaderTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect complete student feedback forms and manage faculty evaluation inclusions/exclusions.
            </p>
          </div>
        </div>

        {/* 1. HOD FACULTY & COURSE SELECTION TOOLBAR */}
        <Card className="bg-white border-slate-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Select Faculty & Evaluation Scope</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Faculty Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Faculty *</label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {facultyOptions.map((fName) => (
                  <option key={fName} value={fName}>
                    {fName}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject / Course</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Subjects</option>
                {subjectOptions.map((subj) => (
                  <option key={subj.code} value={subj.code}>
                    {subj.code} - {subj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Academic Years</option>
                <option value="2025-26">2025-26</option>
                <option value="2024-25">2024-25</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Semesters</option>
                <option value="7">Semester 7</option>
                <option value="5">Semester 5</option>
                <option value="3">Semester 3</option>
                <option value="1">Semester 1</option>
              </select>
            </div>

            {/* Division */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Division</label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Divisions</option>
                <option value="IT-1">Division IT-1</option>
                <option value="IT-2">Division IT-2</option>
                <option value="CE-1">Division CE-1</option>
                <option value="CSE-1">Division CSE-1</option>
                <option value="AIML-1">Division AIML-1</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 2. FACULTY OVERALL EVALUATION KPI BANNER */}
        <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-900 shadow-xl overflow-hidden relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {selectedFaculty} — Overall Evaluation Score
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {facultyOverallStats.averageScore.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-slate-300">/ 5.0 Overall Average Rating</span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                Score calculated from ONLY <span className="text-emerald-400 font-bold">{facultyOverallStats.includedCount} included submissions</span> out of {facultyOverallStats.totalSubmissions} total.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-4 lg:pt-0 lg:pl-6 text-center">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Submissions</span>
                <p className="text-xl font-black text-white mt-0.5">{facultyOverallStats.totalSubmissions}</p>
              </div>

              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/50">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Included Complete</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{facultyOverallStats.includedCount}</p>
              </div>

              <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/50">
                <span className="text-[10px] font-bold text-rose-400 uppercase">Excluded by HOD</span>
                <p className="text-xl font-black text-rose-400 mt-0.5">{facultyOverallStats.excludedCount}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. QUESTION-WISE RESPONSE DISTRIBUTION & SIGNAL SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-indigo-600" />
              Question-Wise Response Distribution (INCLUDED Submissions Only)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click "View Responses" on any question to inspect student feedback forms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYSTEM_QUESTIONS.map((q) => {
              // Recalculates dynamically using ONLY INCLUDED submissions
              const dist = calculateQuestionDistribution(scopedSubmissions, q.id);
              const isSelectedQ = selectedQuestionFilter === q.id;

              return (
                <Card
                  key={q.id}
                  className={`transition-all border ${
                    isSelectedQ
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Q{q.id}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{dist.questionAverage.toFixed(2)} / 5.0</span>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-900 leading-snug line-clamp-2" title={q.text}>
                      {q.text}
                    </p>

                    {/* Distribution Breakdown Mini Progress Bars */}
                    <div className="space-y-1.5 pt-1 text-[11px]">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          Strongly Disagree (1):
                        </span>
                        <span className="font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          {dist.stronglyDisagree} {dist.stronglyDisagree === 1 ? 'student' : 'students'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Disagree (2):</span>
                        <span className="font-semibold">{dist.disagree}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Neutral (3):</span>
                        <span className="font-semibold">{dist.neutral}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Agree (4):</span>
                        <span className="font-semibold">{dist.agree}</span>
                      </div>

                      <div className="flex items-center justify-between text-emerald-700 font-medium">
                        <span>Strongly Agree (5):</span>
                        <span className="font-bold">{dist.stronglyAgree}</span>
                      </div>
                    </div>

                    {/* Question Action Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedQuestionFilter(q.id);
                          setSelectedRatingFilter(1); // Default Strongly Disagree
                        }}
                        className={`text-xs font-bold transition-all px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                          dist.stronglyDisagree > 0
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          View {dist.stronglyDisagree} Strongly Disagree {dist.stronglyDisagree === 1 ? 'Response' : 'Responses'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedQuestionFilter(q.id);
                          setSelectedRatingFilter('ALL');
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        All Responses &rarr;
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 4. SUBMISSIONS DRILL-DOWN TABLE */}
        <div className="space-y-3 pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Student Feedback Submissions Queue
                {selectedQuestionFilter !== 'ALL' && (
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Question {selectedQuestionFilter}
                  </span>
                )}
                {selectedRatingFilter !== 'ALL' && (
                  <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Rating {selectedRatingFilter} (Strongly Disagree)
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500">
                Showing {tableSubmissions.length} submissions for {selectedFaculty}
              </p>
            </div>

            {/* Table Filter Selectors & Reset */}
            <div className="flex items-center gap-2">
              <select
                value={selectedQuestionFilter}
                onChange={(e) => setSelectedQuestionFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Questions (Q1-Q5)</option>
                {SYSTEM_QUESTIONS.map((q) => (
                  <option key={q.id} value={q.id}>
                    Question {q.id}
                  </option>
                ))}
              </select>

              <select
                value={selectedRatingFilter}
                onChange={(e) => setSelectedRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Ratings (1-5)</option>
                <option value={1}>1 — Strongly Disagree</option>
                <option value={2}>2 — Disagree</option>
                <option value={3}>3 — Neutral</option>
                <option value={4}>4 — Agree</option>
                <option value={5}>5 — Strongly Agree</option>
              </select>

              {(selectedQuestionFilter !== 'ALL' || selectedRatingFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSelectedQuestionFilter('ALL');
                    setSelectedRatingFilter('ALL');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedSubmissionIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-indigo-900 text-white rounded-xl shadow-md animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>{selectedSubmissionIds.length} complete submission(s) selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubmissionIds([])}
                  className="text-white border-slate-700 hover:bg-slate-800"
                >
                  Deselect All
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsBulkExcludeModalOpen(true);
                    setExclusionReason('');
                    setReasonError('');
                  }}
                  className="bg-rose-600 hover:bg-rose-700 border-rose-600 shadow-rose-900/40"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Exclude Selected Submissions ({selectedSubmissionIds.length})
                </Button>
              </div>
            </div>
          )}

          <DataTable
            data={tableSubmissions}
            columns={columns}
            searchPlaceholder="Search by student roll or date..."
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFullFeedbackSubmission(row)}
                  className="hover:border-indigo-500 hover:text-indigo-600"
                >
                  <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  View Full Feedback
                </Button>

                {row.evaluationStatus === 'included' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenExcludeSingle(row)}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Exclude
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenIncludeSingle(row)}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Include Again
                  </Button>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. VIEW FULL FEEDBACK MODAL (COMPLETE SUBMISSION FORM INSPECTION) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!fullFeedbackSubmission}
        onClose={() => setFullFeedbackSubmission(null)}
        title="Complete Student Feedback Submission"
        maxWidth="lg"
      >
        {fullFeedbackSubmission && (
          <div className="space-y-5">
            {/* Status Header Badge */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Submission Status</span>
              {fullFeedbackSubmission.evaluationStatus === 'included' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Included in Faculty Evaluation
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Excluded by HOD
                </span>
              )}
            </div>

            {/* Submission Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{fullFeedbackSubmission.facultyName}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Subject</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {fullFeedbackSubmission.subjectCode} - {fullFeedbackSubmission.subjectName}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Student Identity</span>
                <p className="text-xs font-bold font-mono text-indigo-700 mt-0.5">
                  Roll No: {fullFeedbackSubmission.studentRoll}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Term</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {fullFeedbackSubmission.academicYear} &bull; Sem {fullFeedbackSubmission.semester} ({fullFeedbackSubmission.division})
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Submission ID</span>
                <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">{fullFeedbackSubmission.id}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Submitted Date</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{fullFeedbackSubmission.submittedAt}</p>
              </div>
            </div>

            {/* List of ALL 5 Questions in Complete Submission Form */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-1">
                Evaluation Questionnaire Responses (5 Questions)
              </span>

              <div className="space-y-3 divide-y divide-slate-100">
                {fullFeedbackSubmission.answers.map((ans, idx) => (
                  <div key={ans.questionId} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {idx + 1}. {ans.questionText}
                      </p>

                      <div
                        className={`shrink-0 inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded border ${
                          ans.rating <= 2
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : ans.rating >= 4
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{ans.rating} / 5 &mdash; {ans.ratingLabel}</span>
                      </div>
                    </div>

                    {ans.comment && (
                      <p className="text-xs italic text-slate-800 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80 font-medium">
                        "{ans.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusion Audit Record (If Excluded) */}
            {fullFeedbackSubmission.evaluationStatus === 'excluded' && (
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Exclusion Audit Record</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-rose-900 pt-1">
                  <p>
                    <strong className="text-rose-700">Excluded By:</strong> {fullFeedbackSubmission.excludedBy || 'HOD'}
                  </p>
                  <p>
                    <strong className="text-rose-700">Excluded Date:</strong> {fullFeedbackSubmission.excludedAt || 'Recent'}
                  </p>
                </div>
                {fullFeedbackSubmission.exclusionReason && (
                  <div className="pt-1 border-t border-rose-200">
                    <strong className="text-rose-700 text-[11px]">Reason for Exclusion:</strong>
                    <p className="text-xs text-rose-950 font-semibold mt-0.5 bg-white p-2 rounded border border-rose-200">
                      "{fullFeedbackSubmission.exclusionReason}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setFullFeedbackSubmission(null)}>
                Close Form
              </Button>

              {fullFeedbackSubmission.evaluationStatus === 'included' ? (
                <Button
                  variant="primary"
                  className="bg-rose-600 hover:bg-rose-700 border-rose-600 focus:ring-rose-500"
                  onClick={() => {
                    const item = fullFeedbackSubmission;
                    setFullFeedbackSubmission(null);
                    handleOpenExcludeSingle(item);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Exclude This Complete Feedback
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 focus:ring-emerald-500"
                  onClick={() => {
                    const item = fullFeedbackSubmission;
                    setFullFeedbackSubmission(null);
                    handleOpenIncludeSingle(item);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Include Again
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 6. SINGLE SUBMISSION EXCLUSION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!excludeModalSubmission}
        onClose={() => {
          setExcludeModalSubmission(null);
          setReasonError('');
        }}
        title="Exclude this feedback submission?"
        maxWidth="md"
      >
        {excludeModalSubmission && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold text-amber-950">
                  This will exclude this student's complete feedback submission from {excludeModalSubmission.facultyName}'s overall evaluation.
                </p>
                <ul className="list-disc list-inside space-y-0.5 pt-1 text-[11px] text-amber-800">
                  <li>Original submission will remain stored and available for review.</li>
                  <li>ALL 5 question answers in this submission will stop contributing to overall evaluation and question statistics.</li>
                  <li>This exclusion applies ONLY to {excludeModalSubmission.facultyName}'s evaluation.</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <p>
                <strong>Faculty:</strong> {excludeModalSubmission.facultyName} ({excludeModalSubmission.subjectCode})
              </p>
              <p>
                <strong>Student Roll:</strong> {excludeModalSubmission.studentRoll} &bull; Date: {excludeModalSubmission.submittedAt}
              </p>
            </div>

            {/* Reason Textarea */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Reason for exclusion <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={exclusionReason}
                onChange={(e) => {
                  setExclusionReason(e.target.value);
                  if (e.target.value.trim()) setReasonError('');
                }}
                placeholder="e.g. Response pattern requires moderation review."
                className={`w-full text-xs p-3 rounded-lg border ${
                  reasonError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                } focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium text-slate-900 bg-white`}
              />
              {reasonError && <p className="text-[11px] font-bold text-rose-600 mt-1">{reasonError}</p>}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setExcludeModalSubmission(null);
                  setReasonError('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-rose-600 hover:bg-rose-700 border-rose-600 focus:ring-rose-500"
                onClick={handleConfirmExcludeSingle}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Exclude Feedback
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 7. BULK SUBMISSION EXCLUSION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isBulkExcludeModalOpen}
        onClose={() => {
          setIsBulkExcludeModalOpen(false);
          setReasonError('');
        }}
        title={`Exclude ${selectedSubmissionIds.length} selected feedback submissions?`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 space-y-1">
              <p className="font-bold text-rose-950">
                You are about to exclude {selectedSubmissionIds.length} complete student feedback submissions from {selectedFaculty}'s evaluation score.
              </p>
              <p className="text-[11px] text-rose-800">
                Selected Student Rolls: {selectedSubmissionIds.map((id) => {
                  const s = submissions.find((sub) => sub.id === id);
                  return s ? s.studentRoll : id;
                }).join(', ')}
              </p>
            </div>
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              Reason for exclusion <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={exclusionReason}
              onChange={(e) => {
                setExclusionReason(e.target.value);
                if (e.target.value.trim()) setReasonError('');
              }}
              placeholder="e.g. Bulk moderation review of suspicious response patterns."
              className={`w-full text-xs p-3 rounded-lg border ${
                reasonError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
              } focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium text-slate-900 bg-white`}
            />
            {reasonError && <p className="text-[11px] font-bold text-rose-600 mt-1">{reasonError}</p>}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkExcludeModalOpen(false);
                setReasonError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-rose-600 hover:bg-rose-700 border-rose-600 focus:ring-rose-500"
              onClick={handleConfirmBulkExclude}
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Confirm Bulk Exclusion
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 8. RE-INCLUDE SUBMISSION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!includeModalSubmission}
        onClose={() => setIncludeModalSubmission(null)}
        title="Include this feedback again?"
        maxWidth="md"
      >
        {includeModalSubmission && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-1">
                <p className="font-bold text-emerald-950">
                  This complete feedback submission will be included in {includeModalSubmission.facultyName}'s overall evaluation and question statistics.
                </p>
                <p className="text-[11px] text-emerald-800">
                  Student Roll {includeModalSubmission.studentRoll}'s ratings will be added back into all aggregate metrics.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setIncludeModalSubmission(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 focus:ring-emerald-500"
                onClick={handleConfirmIncludeSingle}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Confirm Include Again
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
