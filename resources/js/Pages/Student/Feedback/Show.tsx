import React, { useState, useEffect } from 'react';
import StudentLayout from '../../../Layouts/StudentLayout';
import { StudentFeedbackShowProps, FeedbackSubjectItem, FacultyOption, FeedbackParameter, PublishedFormItem } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
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

const DEFAULT_QUESTIONS = [
  { id: 1, statement: 'The faculty explains concepts clearly.' },
  { id: 2, statement: 'The faculty demonstrates good subject knowledge.' },
  { id: 3, statement: 'The faculty completes the syllabus effectively.' },
  { id: 4, statement: 'The faculty provides useful study material.' },
  { id: 5, statement: 'The faculty maintains punctuality and classroom engagement.' },
];

const DEFAULT_PARAMETERS: FeedbackParameter[] = DEFAULT_QUESTIONS.map((q) => ({
  id: `p${q.id}`,
  statement: `${q.id}. ${q.statement}`,
  description: 'Parameter evaluation scale 1 to 5',
}));

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
import { useAuth } from '../../../context/AuthContext';
export default function Show() {
  const { user } = useAuth();
  const activeStudent = user?.student;

  // Student Information
  const studentRoll = activeStudent?.roll_no || user?.email || 'N/A';
  const studentName = activeStudent?.full_name || user?.full_name || 'N/A';
  const studentDept = (activeStudent?.department?.department_code || 'IT').toUpperCase();
  const studentDivision = activeStudent?.division?.division_code || 'N/A';
  const studentSection = activeStudent?.section?.section_code || 'N/A';
  const studentBatch = activeStudent?.batch?.batch_title || 'N/A';
  const studentSem = activeStudent?.division?.semester_id || activeStudent?.semester?.semester_no || activeStudent?.semester_id || 'N/A';

  // Published Forms state from MySQL API
  const [publishedForms, setPublishedForms] = useState<PublishedFormItem[]>([]);

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

  const loadFromApi = async () => {
    try {
      const { api } = await import('../../../lib/api');
      const res = await api.get('/student/feedback-forms');
      const formsData = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : null);
      if (formsData) {
        const apiForms: PublishedFormItem[] = formsData.map((f: any) => {
          const ta = f.teaching_assignment || {};
          return {
            id: String(f.id),
            numericId: f.id,
            assignmentId: f.teaching_assignment_id,
            title: f.title,
            academicYear: ta.academic_year?.year_code || '2025-26',
            semester: ta.semester?.semester_no || ta.semester_id || 5,
            departmentCode: ta.batch?.department?.department_code || ta.subject?.department?.department_code || 'IT',
            departmentName: ta.batch?.department?.department_name || ta.subject?.department?.department_name || 'Information Technology',
            division: ta.division?.division_code || 'All Divisions',
            section: ta.section?.section_code || 'All',
            batch: ta.batch?.batch_title || '2022-26',
            facultyId: String(ta.faculty_id || 'FAC'),
            facultyName: ta.faculty?.full_name || 'Faculty Member',
            facultyDesignation: ta.faculty?.designation?.designation_name || 'Faculty',
            subjectCode: ta.subject?.subject_code || 'SUB101',
            subjectName: ta.subject?.subject_name || 'Subject',
            questions: Array.isArray(f.questions)
              ? f.questions.map((q: any) => ({ id: q.id, statement: q.question_text || q.statement, question_type: q.question_type || 'RATING' }))
              : DEFAULT_QUESTIONS.map((q: any) => ({ id: q.id, statement: q.statement, question_type: 'RATING' })),
            status: f.is_published ? 'Published' : 'Draft',
            has_submitted: Boolean(f.has_submitted),
            createdBy: f.creator?.full_name || 'Administrator',
            createdAt: f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Recent',
            publishedAt: f.published_at ? new Date(f.published_at).toLocaleDateString() : undefined,
          };
        });
        setPublishedForms(apiForms as any[]);
      }
    } catch {
      // Use local store as fallback
      setPublishedForms([]);
    }
  };

  // Sync state with backend API and store updates
  useEffect(() => {
    loadFromApi();

    const handleSync = () => {
      const queryParams = getQueryParamsFromHash();
      const fId = queryParams.get('formId');
      setActiveFormId(fId);
    };

    handleSync();
    window.addEventListener('hashchange', handleSync);

    return () => {
      window.removeEventListener('hashchange', handleSync);
    };
  }, []);

  // Filter forms targeting this student that are currently PUBLISHED
  // Note: The backend /student/feedback-forms already returns eligible forms based on academic hierarchy
  const eligiblePublishedForms = publishedForms.filter((form) => {
    // MUST BE PUBLISHED
    if (String(form.status).toUpperCase() !== 'PUBLISHED') return false;
    return true;
  });

  // Find active form object if in Questionnaire view mode
  const activeForm = activeFormId ? publishedForms.find((f) => f.id === activeFormId) : null;
  const isCurrentFormSubmitted = Boolean(activeForm?.has_submitted);

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
      : DEFAULT_QUESTIONS;

    const formResponseType = ((activeForm as any).responseType || (activeForm as any).response_type || 'RATING').toUpperCase();

    questionsToRender.forEach((q: any, idx) => {
      const qKey = String(q.id);
      const formResponseType = ((activeForm as any).responseType || (activeForm as any).response_type || 'RATING').toUpperCase();
      const qType = formResponseType === 'BOTH' ? 'BOTH' : ((q.question_type || formResponseType).toUpperCase());
      const rating = ratings[qKey];
      const comment = (questionComments[qKey] || '').trim();

      if (qType === 'TEXT') {
        if (!comment) {
          errors.push(`Question ${idx + 1}: Text response is required.`);
        }
      } else if (qType === 'RATING') {
        if (!rating) {
          errors.push(`Question ${idx + 1}: Rating selection (1 to 5) is required.`);
        }
        if (!comment) {
          errors.push(`Question ${idx + 1}: Feedback comment is required.`);
        }
      } else if (qType === 'BOTH') {
        if (!rating) {
          errors.push(`Question ${idx + 1}: Rating selection (1 to 5) is required.`);
        }
        if (!comment) {
          errors.push(`Question ${idx + 1}: Feedback comment is required.`);
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

  // Confirm submission & record to MySQL database
  const handleConfirmSubmission = async () => {
    if (!activeForm) return;

    const numericFormId = activeForm.numericId || (activeForm.id.match(/\d+/) ? parseInt(activeForm.id.match(/\d+/)![0], 10) : null);
    if (!numericFormId) {
      setValidationErrors(['Invalid feedback form identifier.']);
      setIsConfirmModalOpen(false);
      return;
    }

    const questions = activeForm.questions && activeForm.questions.length > 0
      ? activeForm.questions
      : DEFAULT_QUESTIONS;

    try {
      const { api } = await import('../../../lib/api');
      await api.post(`/student/feedback-forms/${numericFormId}/submit`, {
        overall_remark: Object.values(questionComments).filter(Boolean).join('; ') || 'Submitted via portal',
        answers: questions.map((q) => ({
          question_id: Number(q.id),
          rating_value: ratings[String(q.id)] || 5,
        })),
      });

      setIsConfirmModalOpen(false);
      setSuccessToast(`Feedback for ${activeForm.facultyName} (${activeForm.subjectName}) submitted successfully!`);

      await loadFromApi();

      setTimeout(() => {
        setSuccessToast(null);
        handleBackToList();
      }, 1500);
    } catch (err: any) {
      setIsConfirmModalOpen(false);
      const msg = err.message || (err.data && err.data.message) || 'Failed to submit feedback to server.';
      setValidationErrors([msg]);
      return;
    }
  };

  // =========================================================================
  // VIEW MODE A: LIST OF PUBLISHED FEEDBACK FORMS FOR STUDENT
  // =========================================================================
  if (!activeFormId) {
    return (
      <StudentLayout>
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-sm bg-brand-dark p-8 sm:p-10 text-white shadow-md mb-8 border-l-4 border-l-brand-primary">
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FCF1D0 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-primary/20 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-sm shadow-md">
                    <img src="/main_logo.png" alt="CHARUSAT" className="h-10 object-contain" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-navy/60 backdrop-blur-md border border-brand-primary/40 rounded-sm text-brand-accent text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    <BookOpen className="w-3.5 h-3.5 text-brand-accent" /> Student Evaluation Portal
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight drop-shadow-sm text-white">Faculty Feedback</h1>
                <p className="text-brand-accent/80 font-medium text-sm leading-relaxed">
                  View and submit feedback for active evaluation forms published by your Head of Department. Your responses shape the future of our academic excellence.
                </p>
              </div>

              {/* Student Identity Badge */}
              <div className="bg-brand-navy/60 backdrop-blur-md border border-brand-primary/40 rounded-sm p-5 shadow-xl text-xs space-y-3 shrink-0 sm:min-w-[240px] transition-transform hover:scale-[1.02] duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/30 flex items-center justify-center border border-brand-primary shrink-0">
                    <UserCheck className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white block text-sm">{studentName}</span>
                    <span className="font-mono text-[10px] text-brand-accent uppercase tracking-widest">
                      Roll: {studentRoll}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-brand-primary/30">
                  <p className="text-[11px] text-brand-accent/90 font-bold leading-tight uppercase tracking-wider">
                    {studentDept} &bull; Sem {studentSem} &bull; {studentDivision}
                  </p>
                </div>
              </div>
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
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-indigo-100 text-brand-primary flex items-center justify-center mx-auto shadow-2xs">
                <FileCheck className="w-8 h-8 text-brand-primary" />
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
                  const isSubmitted = Boolean(form.has_submitted);

                  return (
                    <div
                      key={form.id}
                      className={`group relative overflow-hidden bg-white border rounded-2xl p-6 space-y-5 shadow-sm transition-all duration-300 ${isSubmitted
                        ? 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 to-white'
                        : 'border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1'
                        }`}
                    >
                      {/* Decorative background glow for pending */}
                      {!isSubmitted && (
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors pointer-events-none"></div>
                      )}

                      {/* Top Form Header */}
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-[11px] font-bold text-brand-navy bg-brand-50 px-3 py-1.5 rounded-md border border-indigo-200/60 shadow-xs">
                            {form.subjectCode}
                          </span>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-brand-navy transition-colors">
                              {form.subjectName}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              Semester {form.semester} &bull; {form.departmentName} ({form.academicYear})
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="self-start sm:self-auto shrink-0">
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black uppercase tracking-wider shadow-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300/80 text-[11px] font-black uppercase tracking-wider shadow-xs">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Faculty Details & Action Button */}
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm ${isSubmitted
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-brand-navy border border-indigo-200/60'
                              }`}
                          >
                            {form.facultyName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-widest mb-0.5">
                              Evaluating Faculty
                            </span>
                            <p className="text-sm font-extrabold text-slate-900">{form.facultyName}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {form.facultyDesignation || 'Faculty Member'} &bull; {form.questions.length} Evaluation Criteria
                            </p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          {isSubmitted ? (
                            <button
                              disabled
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-50 text-slate-400 font-bold text-xs border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4 text-emerald-500" />
                              <span>Completed</span>
                            </button>
                          ) : (
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => handleOpenFormQuestionnaire(form.id)}
                              className="w-full sm:w-auto bg-indigo-800 hover:bg-indigo-900 text-white font-extrabold shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/40 px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                            >
                              <span>Evaluate Now</span>
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
      <StudentLayout>
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
      <StudentLayout>
        <div className="w-full max-w-xl mx-auto px-4 py-12 text-center space-y-4">
          <Card className="p-8 space-y-5 bg-white border-emerald-200 shadow-xl rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Feedback Already Submitted</h2>
              <p className="text-xs text-slate-600">
                You have already completed the evaluation for <strong className="text-slate-900">{activeForm.facultyName}</strong> ({activeForm.subjectName}).
              </p>
            </div>
            <Button variant="primary" onClick={handleBackToList} className="bg-brand-primary hover:bg-brand-navy">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Active Forms
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  const rawQuestions = activeForm.questions && activeForm.questions.length > 0
    ? activeForm.questions
    : DEFAULT_QUESTIONS;

  // Deduplicate questions by statement text so each question renders as a single card (Rating first, Text second)
  const questionsToRender: any[] = [];
  const seenStatements = new Set<string>();

  for (const q of rawQuestions) {
    const stmtKey = (q.statement || (q as any).question_text || '').trim().toLowerCase();
    if (!stmtKey || !seenStatements.has(stmtKey)) {
      if (stmtKey) seenStatements.add(stmtKey);
      questionsToRender.push(q);
    }
  }

  const totalQuestions = questionsToRender.length;
  const answeredCount = questionsToRender.filter((q) => {
    const qKey = String(q.id);
    const formResponseType = ((activeForm as any).responseType || (activeForm as any).response_type || 'RATING').toUpperCase();
    const qType = formResponseType === 'BOTH' ? 'BOTH' : ((q.question_type || formResponseType).toUpperCase());
    const rating = ratings[qKey];
    const comment = (questionComments[qKey] || '').trim();

    if (qType === 'TEXT') {
      return !!comment;
    } else if (qType === 'RATING') {
      return rating === 1 ? (!!rating && !!comment) : !!rating;
    } else if (qType === 'BOTH') {
      return !!rating && !!comment;
    }
    return !!rating;
  }).length;

  return (
    <StudentLayout>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation & Title Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Active Forms</span>
          </button>

          <span className="text-xs font-black text-brand-navy bg-brand-50 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
            Progress: <span className="text-indigo-900">{answeredCount} / {totalQuestions}</span> Answered
          </span>
        </div>

        {/* Target Form Summary Header Card */}
        <Card className="relative overflow-hidden p-8 bg-brand-dark text-white border border-brand-primary/20 shadow-md rounded-sm space-y-4 border-l-4 border-l-brand-primary">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FCF1D0 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-primary/20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-sm bg-white text-brand-dark flex items-center justify-center font-black text-2xl shadow-sm">
                {activeForm.facultyName.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-accent drop-shadow-sm">
                  Evaluating Faculty Member
                </span>
                <h1 className="text-2xl font-black font-heading tracking-tight text-white">{activeForm.facultyName}</h1>
                <p className="text-xs text-brand-accent/80 font-medium mt-0.5">
                  {activeForm.facultyDesignation || 'Professor'} &bull; {activeForm.departmentName}
                </p>
              </div>
            </div>

            <div className="sm:text-right space-y-1.5 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
              <span className="font-mono text-[11px] font-black text-brand-dark bg-brand-accent px-3 py-1.5 rounded-sm shadow-inner inline-block">
                {activeForm.subjectCode}
              </span>
              <h2 className="text-base font-extrabold text-white leading-tight">{activeForm.subjectName}</h2>
              <p className="text-[11px] text-brand-accent/70 font-medium uppercase tracking-widest">
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
          {questionsToRender.map((param: any, index) => {
            const qKey = String(param.id);
            const formResponseType = ((activeForm as any).responseType || (activeForm as any).response_type || 'RATING').toUpperCase();
            const qType = formResponseType === 'BOTH' ? 'BOTH' : ((param.question_type || formResponseType).toUpperCase());
            const currentRating = ratings[qKey];
            const isStronglyDisagree = currentRating === 1;

            const isRatingVisible = qType === 'RATING' || qType === 'BOTH';
            const isTextVisible = true;

            return (
              <Card key={param.id} className="p-6 sm:p-8 space-y-5 border border-slate-200/80 shadow-md hover:shadow-xl hover:border-indigo-300/60 rounded-2xl transition-all duration-300 bg-white">
                {/* Question Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-brand-primary uppercase tracking-widest">
                      Question {index + 1} of {totalQuestions}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                      {qType === 'BOTH' ? 'Rating + Text' : qType === 'TEXT' ? 'Text Response' : 'Rating (1-5)'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {param.statement}
                  </h3>
                </div>

                {/* Rating Scale Options (For RATING and BOTH) */}
                {isRatingVisible && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Rating (1 to 5) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {LIKERT_OPTIONS.map((option) => {
                        const isSelected = currentRating === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleRatingSelect(qKey, option.value)}
                            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${isSelected
                              ? 'bg-brand-primary text-white font-extrabold border-brand-primary shadow-md shadow-brand-primary/30 ring-2 ring-brand-primary/20'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                              }`}
                          >
                            <span className="text-sm font-bold">{option.value}</span>
                            <span className="text-[10px] leading-tight opacity-90">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Text Response / Additional Feedback Box */}
                {isTextVisible && (
                  <div className={`space-y-2 ${isRatingVisible ? 'pt-3 border-t border-slate-100' : 'pt-1'}`}>
                    <label className="block text-xs font-bold text-slate-800">
                      {qType === 'TEXT'
                        ? 'Your Answer / Response *'
                        : 'Feedback Comments / Remarks *'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        qType === 'TEXT'
                          ? 'Type your detailed answer or feedback comments here...'
                          : qType === 'BOTH'
                            ? 'Share any additional details, examples, or explanations regarding your evaluation...'
                            : 'Please explain the specific area needing improvement for this rating...'
                      }
                      value={questionComments[qKey] || ''}
                      onChange={(e) => handleCommentChange(qKey, e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
              className="bg-brand-primary hover:bg-brand-navy text-white font-extrabold shadow-lg shadow-brand-primary/30 px-8"
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
