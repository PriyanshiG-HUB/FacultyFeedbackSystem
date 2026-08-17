import React, { useState, useEffect } from 'react';
import StudentLayout from '../../../Layouts/StudentLayout';
import { StudentFeedbackShowProps, FeedbackSubjectItem, FacultyOption, FeedbackParameter, PublishedFormItem } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import {
  getPublishedForms,
  subscribeToPublishedForms,
} from '../../../utils/publishedFormsStore';
import { saveSubmissionToStore, SYSTEM_QUESTIONS } from '../../../utils/feedbackExclusionStore';
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
  FileCheck,
  Clock,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';

const LIKERT_OPTIONS = [
  { value: 5, label: 'Strongly Agree' },
  { value: 4, label: 'Agree' },
  { value: 3, label: 'Neutral' },
  { value: 2, label: 'Disagree' },
  { value: 1, label: 'Strongly Disagree' },
];

const DEFAULT_PARAMETERS: FeedbackParameter[] = SYSTEM_QUESTIONS.map((q) => ({
  id: `p${q.id}`,
  statement: `${q.id}. ${q.text}`,
  description: 'Parameter evaluation scale 1 to 5',
}));

// Read completed form submission keys from localStorage
const getSubmittedFormKeys = (): string[] => {
  try {
    const raw = localStorage.getItem('student_submitted_form_keys');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch (e) {
    console.error('Error reading submitted form keys:', e);
  }
  return [];
};

// Save completed submission key to localStorage
const saveSubmittedFormKey = (key: string) => {
  try {
    const current = getSubmittedFormKeys();
    if (!current.includes(key)) {
      const updated = [...current, key];
      localStorage.setItem('student_submitted_form_keys', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('Error saving submitted form key:', e);
  }
};

// Helper to parse query parameters from hash
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
  // Student Information
  const studentRoll = student?.rollNumber || '22IT045';
  const studentName = student?.name || 'Alex Turner';
  const studentDept = (student?.departmentCode || student?.department || 'IT').toUpperCase();
  const studentDivision = student?.division || 'Division A';
  const studentBatch = student?.batch || 'Batch 2022-2026';
  const studentSem = student?.semester || 5;

  // Published Forms & Realtime Sync State
  const [publishedForms, setPublishedForms] = useState<PublishedFormItem[]>(getPublishedForms());
  const [submittedFormKeys, setSubmittedFormKeys] = useState<string[]>(getSubmittedFormKeys());

  // Active form questionnaire state when opening a specific form
  const [activeFormId, setActiveFormId] = useState<string | null>(
    getQueryParamsFromHash().get('formId')
  );

  // Ratings for active questionnaire: { [qId]: number }
  const [ratings, setRatings] = useState<Record<string, number>>({});
  // Question comments: { [qId]: string }
  const [questionComments, setQuestionComments] = useState<Record<string, string>>({});

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state with store updates and hash changes
  useEffect(() => {
    const handleSync = () => {
      setPublishedForms(getPublishedForms());
      setSubmittedFormKeys(getSubmittedFormKeys());
      const queryParams = getQueryParamsFromHash();
      const fId = queryParams.get('formId');
      setActiveFormId(fId);
    };

    handleSync();
    const unsubStore = subscribeToPublishedForms(handleSync);
    window.addEventListener('hashchange', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      unsubStore();
      window.removeEventListener('hashchange', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter forms targeting this student that are currently PUBLISHED
  const eligiblePublishedForms = publishedForms.filter((form) => {
    // MUST BE PUBLISHED (Unpublished forms are completely hidden)
    if (form.status !== 'Published') return false;

    // Check Department Match
    const formDept = (form.departmentCode || '').toUpperCase();
    const isDeptMatch =
      formDept === 'ALL' ||
      formDept === studentDept ||
      (studentDept === 'IT' && (formDept === 'IT' || form.departmentName?.includes('Information'))) ||
      (studentDept === 'CE' && (formDept === 'CE' || form.departmentName?.includes('Computer')));

    if (!isDeptMatch) return false;

    // Check Semester Match (matches student semester or default 5/7)
    const isSemMatch =
      !form.semester ||
      form.semester === studentSem ||
      form.semester === 5 ||
      form.semester === 7;

    return isSemMatch;
  });

  // Find active form object if in Questionnaire view mode
  const activeForm = activeFormId ? publishedForms.find((f) => f.id === activeFormId) : null;
  const isCurrentFormSubmitted = activeForm ? submittedFormKeys.includes(`${studentRoll}_${activeForm.id}`) : false;

  // Open feedback questionnaire for a published form
  const handleOpenFormQuestionnaire = (formId: string) => {
    setActiveFormId(formId);
    window.location.hash = `#Student/Feedback/Show?formId=${formId}`;
  };

  // Return to forms list
  const handleBackToList = () => {
    setActiveFormId(null);
    setRatings({});
    setQuestionComments({});
    setValidationErrors([]);
    window.location.hash = '#Student/Feedback/Show';
  };

  // Handle rating radio button click
  const handleRatingSelect = (qId: string | number, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [String(qId)]: value,
    }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  // Handle comment text input
  const handleCommentChange = (qId: string | number, text: string) => {
    setQuestionComments((prev) => ({
      ...prev,
      [String(qId)]: text,
    }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  // Pre-submit validation
  const handlePreSubmitValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) return;

    const errors: string[] = [];
    const questions = activeForm.questions && activeForm.questions.length > 0
      ? activeForm.questions
      : SYSTEM_QUESTIONS.map((q) => ({ id: q.id, statement: q.text }));

    questions.forEach((q, idx) => {
      const qKey = String(q.id);
      const rating = ratings[qKey];
      if (!rating) {
        errors.push(`Question ${idx + 1}: Please select a rating.`);
      } else if (rating === 1) {
        const comment = (questionComments[qKey] || '').trim();
        if (!comment) {
          errors.push(`Question ${idx + 1}: Please provide a constructive comment explaining why you selected 'Strongly Disagree'.`);
        }
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setIsConfirmModalOpen(true);
  };

  // Confirm submission & record
  const handleConfirmSubmission = () => {
    if (!activeForm) return;

    const submissionKey = `${studentRoll}_${activeForm.id}`;
    saveSubmittedFormKey(submissionKey);

    // Save to feedback store
    const questions = activeForm.questions && activeForm.questions.length > 0
      ? activeForm.questions
      : SYSTEM_QUESTIONS.map((q) => ({ id: q.id, statement: q.text }));

    const answers = questions.map((q) => {
      const qKey = String(q.id);
      const r = ratings[qKey] || 3;
      return {
        questionId: Number(q.id),
        questionText: q.statement,
        rating: r,
        ratingLabel: r === 5 ? 'Strongly Agree' : r === 4 ? 'Agree' : r === 3 ? 'Neutral' : r === 2 ? 'Disagree' : 'Strongly Disagree',
        comment: questionComments[qKey] || undefined,
      };
    });

    saveSubmissionToStore({
      studentRoll,
      facultyId: String(activeForm.facultyId),
      facultyName: activeForm.facultyName,
      subjectCode: activeForm.subjectCode,
      subjectName: activeForm.subjectName,
      academicYear: activeForm.academicYear,
      semester: activeForm.semester,
      division: studentDivision,
      departmentCode: studentDept,
      answers,
    });

    setIsConfirmModalOpen(false);
    setSuccessToast(`Feedback for ${activeForm.facultyName} (${activeForm.subjectName}) submitted successfully!`);

    setTimeout(() => {
      setSuccessToast(null);
      handleBackToList();
    }, 1500);
  };

  // =========================================================================
  // VIEW MODE A: LIST OF PUBLISHED FEEDBACK FORMS FOR STUDENT
  // =========================================================================
  if (!activeFormId) {
    return (
      <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Student Evaluation Portal
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Feedback Forms</h1>
              <p className="text-xs text-slate-500">
                View and submit feedback for active evaluation forms published by your Head of Department.
              </p>
            </div>

            {/* Student Identity Badge */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs text-xs space-y-1 shrink-0">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-slate-900">{studentName}</span>
                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 rounded">
                  {studentRoll}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {studentDept} &bull; Semester {studentSem} &bull; {studentDivision}
              </p>
            </div>
          </div>

          {/* Success Toast */}
          {successToast && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-xs text-xs text-emerald-800 font-bold animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* MAIN CHECK: IF NO PUBLISHED FORMS AVAILABLE FOR STUDENT */}
          {eligiblePublishedForms.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 my-8 bg-white border-slate-200 shadow-sm rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                <FileCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  No current feedback form available.
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  There are currently no active feedback collection forms published by the Head of Department for your academic target group ({studentDept} &bull; Semester {studentSem}).
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Status: Evaluation Window Closed
                </span>
              </div>
            </Card>
          ) : (
            /* PUBLISHED FORMS ROSTER LIST */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Active Published Feedback Forms ({eligiblePublishedForms.length})
                </h2>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Live Evaluation Window Open
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {eligiblePublishedForms.map((form) => {
                  const isSubmitted = submittedFormKeys.includes(`${studentRoll}_${form.id}`);

                  return (
                    <div
                      key={form.id}
                      className={`bg-white border rounded-2xl p-5 space-y-4 shadow-2xs transition-all ${
                        isSubmitted
                          ? 'border-emerald-200/80 bg-emerald-50/20'
                          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      {/* Top Form Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                            {form.subjectCode}
                          </span>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                              {form.subjectName}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Semester {form.semester} &bull; {form.departmentName} ({form.academicYear})
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="self-start sm:self-auto">
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-extrabold">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Pending Submission
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Faculty Details & Action Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                              isSubmitted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {form.facultyName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                              Evaluating Faculty:
                            </span>
                            <p className="text-sm font-extrabold text-slate-900">{form.facultyName}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {form.facultyDesignation || 'Faculty Member'} &bull; {form.questions.length} Evaluation Criteria
                            </p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div>
                          {isSubmitted ? (
                            <button
                              disabled
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>Feedback Submitted</span>
                            </button>
                          ) : (
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => handleOpenFormQuestionnaire(form.id)}
                              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md shadow-indigo-600/20 px-5 py-2.5"
                            >
                              <span>Give Feedback</span>
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </StudentLayout>
    );
  }

  // =========================================================================
  // VIEW MODE B: DEDICATED QUESTIONNAIRE PAGE (for active Published Form)
  // =========================================================================
  if (!activeForm) {
    return (
      <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
        <div className="w-full max-w-xl mx-auto px-4 py-12 text-center space-y-4">
          <Card className="p-8 space-y-4 bg-white border-slate-200 shadow-lg">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Feedback Form Not Found</h2>
            <p className="text-xs text-slate-500">
              The requested evaluation form was not found or has been unpublished by the Head of Department.
            </p>
            <Button variant="primary" onClick={handleBackToList}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Form Selection
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  if (isCurrentFormSubmitted) {
    return (
      <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
        <div className="w-full max-w-xl mx-auto px-4 py-12 text-center space-y-4">
          <Card className="p-8 space-y-5 bg-white border-emerald-200 shadow-xl rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Feedback Already Submitted</h2>
              <p className="text-xs text-slate-600">
                You have already completed the evaluation for <strong className="text-slate-900">{activeForm.facultyName}</strong> ({activeForm.subjectName}).
              </p>
            </div>
            <Button variant="primary" onClick={handleBackToList} className="bg-indigo-600 hover:bg-indigo-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Active Forms
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  const questionsToRender = activeForm.questions && activeForm.questions.length > 0
    ? activeForm.questions
    : SYSTEM_QUESTIONS.map((q) => ({ id: q.id, statement: q.text }));

  const totalQuestions = questionsToRender.length;
  const answeredCount = questionsToRender.filter((q) => !!ratings[String(q.id)]).length;

  return (
    <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation & Title Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Active Forms</span>
          </button>

          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Progress: {answeredCount} / {totalQuestions} Answered
          </span>
        </div>

        {/* Target Form Summary Header Card */}
        <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-blue-900 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center font-extrabold text-lg border border-white/20">
                {activeForm.facultyName.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                  Target Faculty Member
                </span>
                <h1 className="text-xl font-extrabold tracking-tight">{activeForm.facultyName}</h1>
                <p className="text-xs text-slate-300 font-medium">
                  {activeForm.facultyDesignation || 'Professor'} &bull; {activeForm.departmentName}
                </p>
              </div>
            </div>

            <div className="sm:text-right space-y-1 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-600/60 inline-block">
                {activeForm.subjectCode}
              </span>
              <h2 className="text-sm font-bold text-white leading-tight">{activeForm.subjectName}</h2>
              <p className="text-[11px] text-slate-400">
                Semester {activeForm.semester} &bull; Academic Year {activeForm.academicYear}
              </p>
            </div>
          </div>
        </Card>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-700 font-semibold shadow-xs">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Please resolve the following validation issues:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-5">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Questionnaire Form */}
        <form onSubmit={handlePreSubmitValidation} className="space-y-6">
          {questionsToRender.map((param, index) => {
            const qKey = String(param.id);
            const currentRating = ratings[qKey];
            const isStronglyDisagree = currentRating === 1;

            return (
              <Card key={param.id} className="p-5 sm:p-6 space-y-4 border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
                {/* Question Title */}
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                    Question {index + 1} of {totalQuestions}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {param.statement}
                  </h3>
                </div>

                {/* Likert Scale Radio Options */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                  {LIKERT_OPTIONS.map((option) => {
                    const isSelected = currentRating === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRatingSelect(qKey, option.value)}
                        className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-extrabold border-indigo-600 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                        }`}
                      >
                        <span className="text-sm font-bold">{option.value}</span>
                        <span className="text-[10px] leading-tight opacity-90">{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Conditional Feedback Comment box */}
                {isStronglyDisagree && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="block text-xs font-bold text-rose-700">
                      Constructive Feedback Comment Required *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Please explain the specific area needing improvement for this rating..."
                      value={questionComments[qKey] || ''}
                      onChange={(e) => handleCommentChange(qKey, e.target.value)}
                      className="w-full p-3 bg-rose-50/50 border border-rose-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}
              </Card>
            );
          })}

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <Button type="button" variant="outline" onClick={handleBackToList}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-lg shadow-indigo-600/30 px-8"
            >
              <Send className="w-4 h-4 mr-2" />
              <span>Submit Evaluation Feedback</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Feedback Submission"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to submit your evaluation for{' '}
            <strong className="text-slate-900">{activeForm?.facultyName}</strong> ({activeForm?.subjectName})?
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anonymity Guaranteed</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Your response will be recorded without your student identity attached. Once submitted, you cannot edit or re-submit this evaluation.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Back to Questionnaire
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSubmission}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold"
            >
              Confirm &amp; Submit
            </Button>
          </div>
        </div>
      </Modal>
    </StudentLayout>
  );
}
