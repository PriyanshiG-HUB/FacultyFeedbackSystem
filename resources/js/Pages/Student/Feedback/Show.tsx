import React, { useState, useEffect } from 'react';
import StudentLayout from '../../../Layouts/StudentLayout';
import { StudentFeedbackShowProps, FeedbackSubjectItem, FacultyOption, FeedbackParameter } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import {
  CheckCircle2,
  User,
  Send,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  UserCheck,
  Check,
} from 'lucide-react';

const LIKERT_OPTIONS = [
  { value: 5, label: 'Strongly Agree' },
  { value: 4, label: 'Agree' },
  { value: 3, label: 'Neutral' },
  { value: 2, label: 'Disagree' },
  { value: 1, label: 'Strongly Disagree' },
];

const DEFAULT_PARAMETERS: FeedbackParameter[] = [
  { id: 'p1', statement: '1. The faculty explains concepts clearly.', description: 'Pacing, clarity, and real-world examples during lectures' },
  { id: 'p2', statement: '2. The faculty demonstrates good subject knowledge.', description: 'Command over fundamental and advanced concepts' },
  { id: 'p3', statement: '3. The faculty completes the syllabus effectively.', description: 'Structured coverage of curriculum and practical labs' },
  { id: 'p4', statement: '4. The faculty provides useful study material.', description: 'Quality of notes, reference material, and practice problems' },
  { id: 'p5', statement: '5. The faculty maintains punctuality and classroom engagement.', description: 'Regularity, interactive teaching, and addressing student questions' },
];

// Helper to safely read completed faculty IDs from sessionStorage
const getCompletedFacultyIds = (): string[] => {
  try {
    const raw = sessionStorage.getItem('studentFeedbackCompleted');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    }
  } catch (e) {
    console.error('Error reading studentFeedbackCompleted from sessionStorage:', e);
  }
  return [];
};

// Helper to save a completed faculty ID to sessionStorage
const saveCompletedFacultyId = (facId: string | number) => {
  try {
    const current = getCompletedFacultyIds();
    const strId = String(facId);
    if (!current.includes(strId)) {
      const updated = [...current, strId];
      sessionStorage.setItem('studentFeedbackCompleted', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('Error saving studentFeedbackCompleted to sessionStorage:', e);
  }
};

// Helper to parse query parameters from window.location.hash (e.g. #Student/Feedback/Show?facultyId=1)
const getQueryParamsFromHash = () => {
  const hash = window.location.hash;
  const queryStringIndex = hash.indexOf('?');
  if (queryStringIndex !== -1) {
    const queryString = hash.substring(queryStringIndex + 1);
    return new URLSearchParams(queryString);
  }
  return new URLSearchParams();
};

export default function Show({ student, subjects: propSubjects, feedbackItems, parameters: propParameters }: StudentFeedbackShowProps) {
  const questionsList = propParameters || DEFAULT_PARAMETERS;
  const subjectsList: FeedbackSubjectItem[] = propSubjects || feedbackItems || [];

  // Completed faculty IDs state synced with sessionStorage
  const [completedIds, setCompletedIds] = useState<string[]>(getCompletedFacultyIds());

  // Active faculty ID in dedicated questionnaire mode
  const [activeFacultyId, setActiveFacultyId] = useState<string | null>(
    getQueryParamsFromHash().get('facultyId')
  );

  // Ratings for current questionnaire: { [paramId]: number }
  const [ratings, setRatings] = useState<Record<string, number>>({});
  // Per-question comments: { [paramId]: string }
  const [questionComments, setQuestionComments] = useState<Record<string, string>>({});
  const [commentText, setCommentText] = useState<string>('');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state with hash changes and sessionStorage storage events
  useEffect(() => {
    const handleHashAndStorage = () => {
      setCompletedIds(getCompletedFacultyIds());
      const queryParams = getQueryParamsFromHash();
      const facId = queryParams.get('facultyId');
      setActiveFacultyId(facId);
    };

    handleHashAndStorage();
    window.addEventListener('hashchange', handleHashAndStorage);
    window.addEventListener('storage', handleHashAndStorage);

    return () => {
      window.removeEventListener('hashchange', handleHashAndStorage);
      window.removeEventListener('storage', handleHashAndStorage);
    };
  }, []);

  // Find active faculty and associated subject details when in Questionnaire Mode
  let activeFaculty: FacultyOption | null = null;
  let activeSubject: FeedbackSubjectItem | null = null;

  if (activeFacultyId) {
    for (const sub of subjectsList) {
      const foundFac = sub.facultyOptions?.find((f) => String(f.id) === String(activeFacultyId));
      if (foundFac) {
        activeFaculty = foundFac;
        activeSubject = sub;
        break;
      }
    }
  }

  const activeParams = activeSubject?.parameters || questionsList;
  const totalQuestionsCount = activeParams.length;
  const answeredQuestionsCount = activeParams.filter((p) => !!ratings[p.id]).length;
  const isFacultyAlreadyCompleted = activeFacultyId ? completedIds.includes(String(activeFacultyId)) : false;

  // Handle open feedback form in NEW TAB
  const handleOpenFeedbackInNewTab = (facId: number) => {
    window.open(`#Student/Feedback/Show?facultyId=${facId}`, '_blank');
  };

  // Return to Faculty Selection
  const handleBackToSelection = () => {
    setRatings({});
    setQuestionComments({});
    setCommentText('');
    setValidationErrors([]);
    window.location.hash = '#Student/Feedback/Show';
  };

  // Rating radio button selection handler
  const handleRatingSelect = (paramId: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [paramId]: value,
    }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  // Per-question comment text handler
  const handleQuestionCommentChange = (paramId: string, text: string) => {
    setQuestionComments((prev) => ({
      ...prev,
      [paramId]: text,
    }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  // Submit button click -> validate required ratings AND conditional comments for Strongly Disagree
  const handlePreSubmitValidation = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    activeParams.forEach((param: FeedbackParameter, idx: number) => {
      const rating = ratings[param.id];
      if (!rating) {
        errors.push(`Question ${idx + 1}: "${param.statement || param.label}" is required.`);
      } else if (rating === 1) {
        const comment = (questionComments[param.id] || '').trim();
        if (comment === '') {
          errors.push(`Question ${idx + 1}: Please provide a comment when selecting Strongly Disagree.`);
        }
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);
    setIsConfirmModalOpen(true);
  };

  // Final confirmation modal submission action
  const handleConfirmSubmission = () => {
    if (!activeFacultyId) return;

    // Persist completion state in sessionStorage
    saveCompletedFacultyId(activeFacultyId);

    setIsConfirmModalOpen(false);
    setSuccessToast(`Feedback for ${activeFaculty?.name || 'Faculty Member'} submitted successfully!`);

    // Reset questionnaire form state
    setRatings({});
    setQuestionComments({});
    setCommentText('');

    // Redirect CURRENT tab to Faculty Selection page
    setTimeout(() => {
      setSuccessToast(null);
      window.location.hash = '#Student/Feedback/Show';
    }, 1200);
  };

  // Student details
  const studentName = student?.name || 'Alex Turner';
  const studentRoll = student?.rollNumber || '22IT045';
  const studentProgram = student?.program || 'B.Tech (Information Technology)';
  const studentBatch = student?.batch || 'Batch 2022-2026';
  const studentDivision = student?.division || 'Division A';
  const studentDept = student?.departmentCode || student?.department || 'IT';
  const studentDivCode = student?.divisionCode || student?.division || 'IT-1';

  // Helper to filter faculty options for a subject based on student's department + division
  const getFilteredFacultyForSubject = (subject: FeedbackSubjectItem): FacultyOption[] => {
    const rawOptions = subject.facultyOptions || [];
    return rawOptions.filter((fac) => {
      // Check department match
      const facDept = fac.departmentCode || fac.department;
      const deptMatch =
        !facDept ||
        facDept === studentDept ||
        facDept === student?.department ||
        (studentDept === 'IT' && facDept === 'Information Technology') ||
        (facDept === 'IT' && student?.department === 'Information Technology');

      // Check division match
      const facDiv = fac.divisionCode || fac.division;
      const divMatch =
        !facDiv ||
        facDiv === studentDivCode ||
        facDiv === studentDivision ||
        (studentDivCode === 'IT-1' && facDiv === 'Division A') ||
        (studentDivision === 'Division A' && facDiv === 'IT-1') ||
        (studentDivCode === 'IT-2' && facDiv === 'Division B') ||
        (studentDivision === 'Division B' && facDiv === 'IT-2');

      return deptMatch && divMatch;
    });
  };

  // Calculate overall portal completion counts scoped to current student's division
  const totalFacultyInPortal = subjectsList.reduce(
    (acc, s) => acc + getFilteredFacultyForSubject(s).length,
    0
  );
  const totalCompletedCount = subjectsList.reduce((acc, s) => {
    const assigned = getFilteredFacultyForSubject(s);
    const doneInSubject = assigned.filter((f) => completedIds.includes(String(f.id)));
    return acc + doneInSubject.length;
  }, 0);

  // =========================================================================
  // VIEW MODE A: FACULTY SELECTION LIST PAGE (no facultyId in URL/hash)
  // =========================================================================
  if (!activeFacultyId) {
    return (
      <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                <BookOpen className="w-3 h-3 text-indigo-600" /> Course & Faculty Evaluation
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Select Faculty for Feedback</h1>
              <p className="text-xs text-slate-500">
                Click <strong className="text-indigo-600">Give Feedback</strong> to open the evaluation questionnaire for a faculty member in a new tab.
              </p>
            </div>

            {/* Progress Counter Pill */}
            <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto flex items-center gap-2">
              <span className="text-slate-500">Overall Progress:</span>
              <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {totalCompletedCount} / {totalFacultyInPortal} Completed
              </span>
            </div>
          </div>

          {/* Success Toast */}
          {successToast && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-xs animate-fadeIn text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Enrolled Subjects & Faculty Roster List */}
          <div className="space-y-4">
            {subjectsList.map((subject, sIdx) => {
              const facultyOptions = getFilteredFacultyForSubject(subject);

              return (
                <div key={subject.id || sIdx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  {/* Subject Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                        {subject.subjectCode}
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                          {subject.subjectName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {subject.department} &bull; {subject.credits} Credits ({subject.type || 'Core'})
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium self-start sm:self-auto">
                      {facultyOptions.length} Assigned Faculty
                    </span>
                  </div>

                  {/* Faculty Roster Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {facultyOptions.length === 0 ? (
                      <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 text-xs font-medium text-center">
                        No faculty assigned for your division.
                      </div>
                    ) : (
                      facultyOptions.map((fac) => {
                        const isCompleted = completedIds.includes(String(fac.id));

                        return (
                          <div
                            key={fac.id}
                            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                              isCompleted
                                ? 'bg-emerald-50/40 border-emerald-200/80'
                                : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {fac.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{fac.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{fac.designation}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-start sm:self-center">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-xs font-extrabold shadow-2xs">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ✓ Feedback Completed
                                </span>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleOpenFeedbackInNewTab(fac.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-600/20 px-4 py-2"
                                >
                                  <span>Give Feedback</span>
                                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </StudentLayout>
    );
  }

  // =========================================================================
  // VIEW MODE B: DEDICATED QUESTIONNAIRE PAGE (for selected faculty member)
  // =========================================================================

  // If faculty ID in URL was invalid or already completed
  if (!activeFaculty || !activeSubject) {
    return (
      <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
        <div className="w-full max-w-xl mx-auto px-4 py-12 text-center space-y-4">
          <Card className="p-8 space-y-4 bg-white border-slate-200 shadow-lg">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Faculty Selection Not Found</h2>
            <p className="text-xs text-slate-500">
              The requested faculty member evaluation was not found or is invalid.
            </p>
            <Button variant="primary" onClick={handleBackToSelection}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Faculty Selection
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  if (isFacultyAlreadyCompleted) {
    return (
      <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
        <div className="w-full max-w-xl mx-auto px-4 py-12 text-center space-y-4">
          <Card className="p-8 space-y-5 bg-white border-emerald-200 shadow-xl rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Feedback Already Submitted</h2>
              <p className="text-xs text-slate-600">
                You have already completed the evaluation for <strong className="text-slate-900">{activeFaculty.name}</strong> ({activeSubject.subjectName}).
              </p>
            </div>
            <Button variant="primary" onClick={handleBackToSelection} className="bg-indigo-600 hover:bg-indigo-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Faculty Selection
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  const progressPercent = Math.round((answeredQuestionsCount / totalQuestionsCount) * 100);

  return (
    <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation & Back Action Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToSelection}
            className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-slate-400 group-hover:text-indigo-600" />
            <span>Back to Faculty Selection</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-extrabold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Strict Anonymity Guaranteed
          </span>
        </div>

        {/* Dedicated Faculty Header Banner */}
        <div className="bg-gradient-to-r from-[#193073] via-[#1e3a8a] to-[#254cb8] rounded-2xl p-6 text-white shadow-md border border-blue-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-white/15 backdrop-blur-md text-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/20">
                COURSE EVALUATION QUESTIONNAIRE
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">{activeFaculty.name}</h1>
              <p className="text-xs text-blue-100 font-semibold mt-0.5">
                {activeFaculty.designation} &bull; {activeSubject.subjectName} ({activeSubject.subjectCode})
              </p>
              <p className="text-[11px] text-blue-200 mt-1">
                Department: {activeSubject.department}
              </p>
            </div>

            {/* Live Question Progress Card */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Question Progress</span>
              <span className="text-lg font-extrabold text-white font-mono block">
                {answeredQuestionsCount} / {totalQuestionsCount}
              </span>
              <span className="text-[10px] text-emerald-300 font-bold block">{progressPercent}% Answered</span>
            </div>
          </div>

          {/* Sticky/Header Animated Progress Bar */}
          <div className="w-full bg-blue-950/60 h-2 rounded-full overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Validation Errors Alert Banner */}
        {validationErrors.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-xs animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-rose-800">
              <h4 className="font-extrabold text-rose-900 text-sm">Please complete all required evaluation statements:</h4>
              <ul className="list-disc list-inside space-y-0.5 font-medium text-rose-700">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Questionnaire Form */}
        <form onSubmit={handlePreSubmitValidation} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Evaluation Statements for {activeFaculty.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rate each statement on a scale from 1 (Strongly Disagree) to 5 (Strongly Agree).
              </p>
            </div>

            {activeParams.map((param: FeedbackParameter, qIdx: number) => {
              const currentRating = ratings[param.id];
              const isStronglyDisagree = currentRating === 1;
              const paramComment = questionComments[param.id] || '';
              const isCommentMissing = isStronglyDisagree && paramComment.trim() === '';

              return (
                <div
                  key={param.id}
                  id={`question_block_${param.id}`}
                  className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3 ${
                    isCommentMissing && validationErrors.length > 0
                      ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-400'
                      : currentRating
                      ? 'bg-indigo-50/20 border-indigo-200/80'
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      {param.statement || `${qIdx + 1}. ${param.label}`} <span className="text-rose-500">*</span>
                    </h4>
                    {param.description && <p className="text-xs text-slate-500">{param.description}</p>}
                  </div>

                  <fieldset>
                    <legend className="sr-only">{param.statement || param.label}</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {LIKERT_OPTIONS.map((opt) => {
                        const isChecked = currentRating === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none ${
                              isChecked
                                ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-100/50 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`radio_${param.id}`}
                              value={opt.value}
                              checked={isChecked}
                              onChange={() => handleRatingSelect(param.id, opt.value)}
                              className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="leading-snug">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Conditional Required Comment Box when Strongly Disagree is selected */}
                  {isStronglyDisagree && (
                    <div className="mt-3 pt-3 border-t border-rose-200/70 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <label htmlFor={`comment_${param.id}`} className="text-slate-800 flex items-center gap-1.5">
                          <span>Comment</span>
                          <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                            * Required
                          </span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-medium">Please explain your rating choice</span>
                      </div>

                      <textarea
                        id={`comment_${param.id}`}
                        rows={2}
                        placeholder="Please explain why you selected Strongly Disagree for this statement..."
                        value={paramComment}
                        onChange={(e) => handleQuestionCommentChange(param.id, e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-2xs transition-all ${
                          isCommentMissing && validationErrors.length > 0
                            ? 'border-2 border-rose-500 bg-rose-50/50 focus:ring-2 focus:ring-rose-500/20'
                            : 'border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                        }`}
                      />

                      {isCommentMissing && validationErrors.length > 0 && (
                        <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>⚠ Please provide a comment when selecting Strongly Disagree.</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Constructive Comment Box (Optional) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Constructive Comments for {activeFaculty.name} (Optional)
              </label>
              <textarea
                rows={3}
                placeholder={`Share specific comments regarding lectures, pacing, or teaching style for ${activeFaculty.name}...`}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 font-medium">
              Progress: <strong className="text-indigo-700">{answeredQuestionsCount} of {totalQuestionsCount}</strong> required statements completed.
            </span>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleBackToSelection}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 px-8"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback for {activeFaculty.name}
              </Button>
            </div>
          </div>
        </form>

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={`Submit Feedback for ${activeFaculty.name}?`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 text-sm">
              Are you sure you want to submit your evaluation for <strong className="text-slate-900">{activeFaculty.name}</strong> ({activeSubject.subjectName})?
            </p>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-medium leading-relaxed">
              Once submitted, your ratings and comments cannot be edited or resubmitted for this evaluation cycle.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmSubmission}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Confirm & Submit Feedback
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </StudentLayout>
  );
}
