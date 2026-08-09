import React, { useState } from 'react';
import StudentLayout from '../../../Layouts/StudentLayout';
import { StudentFeedbackShowProps, FeedbackSubjectItem, FacultyOption } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { useForm } from '../../../Components/shared/useForm';
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
  HelpCircle,
  UserCheck,
  Check,
} from 'lucide-react';

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export default function Show({ student, subjects: propSubjects, feedbackItems }: StudentFeedbackShowProps) {
  // Normalize subjects array
  const subjectsList: FeedbackSubjectItem[] = propSubjects || feedbackItems || [];

  // Expanded subject row state
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(subjectsList[0]?.id || null);

  // Map of completed faculty IDs per subject: { [subjectId]: [facultyId1, facultyId2] }
  const [completedFacultyMap, setCompletedFacultyMap] = useState<Record<number, number[]>>({});

  // Selected faculty ID per subject dropdown: { [subjectId]: facultyId }
  const [selectedFacultyMap, setSelectedFacultyMap] = useState<Record<number, number>>({});

  // Comments per faculty: { [`${subjectId}_${facultyId}`]: commentText }
  const [facultyComments, setFacultyComments] = useState<Record<string, string>>({});

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState<boolean>(false);

  const form = useForm({
    ratings: {} as Record<string, number>, // Key: `${subjectId}_${facultyId}_${paramId}`
  });

  const toggleSubjectExpand = (subjectId: number) => {
    setExpandedSubjectId((prev) => (prev === subjectId ? null : subjectId));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleFacultySelect = (subjectId: number, facultyIdStr: string) => {
    const facultyId = Number(facultyIdStr);
    setSelectedFacultyMap((prev) => {
      const next = { ...prev };
      if (facultyId) {
        next[subjectId] = facultyId;
      } else {
        delete next[subjectId];
      }
      return next;
    });
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleRatingSelect = (subjectId: number, facultyId: number, paramId: string, value: number) => {
    const ratingKey = `${subjectId}_${facultyId}_${paramId}`;
    form.setData('ratings', {
      ...form.data.ratings,
      [ratingKey]: value,
    });
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleFacultySubmit = (subjectId: number, facultyId: number) => {
    const subject = subjectsList.find((s) => (s.id || s.assignmentId) === subjectId);
    if (!subject) return;

    const facultyObj = subject.facultyOptions?.find((f) => f.id === facultyId);
    const errors: string[] = [];

    // Validate that all 5 questions are answered for this subject + faculty
    subject.parameters.forEach((param) => {
      const ratingKey = `${subjectId}_${facultyId}_${param.id}`;
      if (!form.data.ratings[ratingKey]) {
        errors.push(`Please answer question "${param.statement || param.label}" for ${facultyObj?.name || 'selected faculty'}.`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Add faculty to completed list for this subject
    const currentCompleted = completedFacultyMap[subjectId] || [];
    if (!currentCompleted.includes(facultyId)) {
      const nextCompleted = [...currentCompleted, facultyId];
      setCompletedFacultyMap((prev) => ({
        ...prev,
        [subjectId]: nextCompleted,
      }));
    }

    // Reset selected faculty dropdown for this subject
    setSelectedFacultyMap((prev) => {
      const next = { ...prev };
      delete next[subjectId];
      return next;
    });

    setValidationErrors([]);
    setSuccessToast(`Feedback for ${facultyObj?.name} submitted successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Subject status helper
  const getSubjectStatus = (subject: FeedbackSubjectItem) => {
    const subjectId = subject.id || subject.assignmentId || 0;
    const assigned = subject.facultyOptions || [];
    const totalCount = assigned.length;
    const completedList = completedFacultyMap[subjectId] || [];
    const completedCount = completedList.length;

    if (completedCount === 0) {
      return {
        status: 'pending',
        isComplete: false,
        badge: (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Pending
          </span>
        ),
      };
    } else if (completedCount < totalCount) {
      return {
        status: 'in-progress',
        isComplete: false,
        badge: (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> In Progress ({completedCount}/{totalCount})
          </span>
        ),
      };
    } else {
      return {
        status: 'completed',
        isComplete: true,
        badge: (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
          </span>
        ),
      };
    }
  };

  // Calculate overall portal completion
  const totalFacultyCount = subjectsList.reduce((acc, s) => acc + (s.facultyOptions?.length || 0), 0);
  const totalCompletedFacultyCount = Object.values(completedFacultyMap).reduce((acc, list) => acc + list.length, 0);
  const isAllSubjectsCompleted = totalFacultyCount > 0 && totalCompletedFacultyCount === totalFacultyCount;

  // Student details
  const studentName = student?.name || 'Alexander Wright';
  const studentRole = student?.role || 'Student';
  const studentId = student?.studentId || 'STU-2022-045';
  const studentRoll = student?.rollNumber || '22CE045';
  const studentProgram = student?.program || 'B.Tech Computer Engineering';
  const studentBatch = student?.batch || 'Batch 2022–2026';
  const studentDivision = student?.division || 'Division A';

  if (isFinalSubmitted) {
    return (
      <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
        <div className="w-full max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center p-8 space-y-6 animate-fadeIn border-emerald-200 bg-white shadow-xl rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Anonymous & Encrypted
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">All Faculty Feedback Completed!</h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Thank you, <span className="font-bold text-slate-900">{studentName}</span>. You have successfully submitted feedback for all {subjectsList.length} subjects and {totalCompletedFacultyCount} faculty members.
              </p>
            </div>

            {/* Submitted Summary Receipt */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-3 text-xs">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                Session Evaluation Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 font-medium">
                <div>
                  <span className="text-slate-400 block text-[10px]">STUDENT ID / ROLL</span>
                  <span className="font-mono text-indigo-700 font-bold">{studentId} ({studentRoll})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PROGRAM</span>
                  <span className="text-slate-900 font-semibold">{studentProgram}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BATCH & DIVISION</span>
                  <span className="text-slate-900 font-semibold">{studentBatch} &bull; {studentDivision}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">EVALUATION STATUS</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Completed
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => (window.location.hash = '#Student/Identify')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20"
            >
              Return to Portal Home
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout studentInfo={{ rollNumber: studentRoll, division: studentDivision }}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
              <BookOpen className="w-3 h-3 text-indigo-600" /> Course & Faculty Evaluation
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Feedback</h1>
          </div>

          {/* Overall Progress Pill */}
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto">
            <span>Overall Progress: </span>
            <span className="font-bold text-indigo-700">
              {totalCompletedFacultyCount} / {totalFacultyCount} Faculty Evaluated
            </span>
          </div>
        </div>

        {/* Success Notification Toast */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-xs animate-fadeIn text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Validation Errors Summary Alert */}
        {validationErrors.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-xs animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-rose-800">
              <h4 className="font-extrabold text-rose-900 text-sm">Please answer all required questions:</h4>
              <ul className="list-disc list-inside space-y-0.5 font-medium text-rose-700">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* COMPACT SCALABLE SUBJECT LIST TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span>Your Enrolled Subjects ({subjectsList.length})</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              Click any subject row below to expand its faculty evaluation form
            </span>
          </div>

          <div className="divide-y divide-slate-200/80">
            {subjectsList.map((subject, idx) => {
              const subjectId = subject.id || subject.assignmentId || idx + 1;
              const isExpanded = expandedSubjectId === subjectId;
              const statusInfo = getSubjectStatus(subject);
              const completedList = completedFacultyMap[subjectId] || [];
              const selectedFacId = selectedFacultyMap[subjectId];
              const selectedFacObj = subject.facultyOptions?.find((f) => f.id === selectedFacId);

              return (
                <div key={subjectId} className="transition-all">
                  {/* Subject List Row */}
                  <div
                    onClick={() => toggleSubjectExpand(subjectId)}
                    className={`px-5 py-4 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                      isExpanded
                        ? 'bg-indigo-50/70 font-semibold border-l-4 border-l-indigo-600'
                        : 'hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <span className="font-mono text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded border border-indigo-100 shrink-0">
                        {subject.subjectCode}
                      </span>
                      <div className="truncate">
                        <span className="text-sm font-bold text-slate-900 truncate block">
                          {subject.subjectName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {subject.department} &bull; {subject.credits} Credits ({subject.facultyOptions?.length} Faculty)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {statusInfo.badge}
                      <div className="text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Subject Detail Panel */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-slate-50/60 border-t border-slate-200/80 space-y-4 animate-fadeIn">
                      {/* Simple Compact Faculty Information Line */}
                      <div className="text-xs text-slate-600 font-medium">
                        <span className="font-bold text-slate-800">Faculties: </span>
                        <span>{subject.facultyOptions?.map((fac) => fac.name).join(', ')}</span>
                      </div>

                      {/* Dropdown or All Completed Message */}
                      {statusInfo.isComplete ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>All faculty evaluation forms for this subject have been submitted. Thank you!</span>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                          <label htmlFor={`fac_select_${subjectId}`} className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                            Faculty Teaching This Subject <span className="text-rose-500">*</span>
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Select a faculty member from the dropdown below to open their evaluation form.
                          </p>

                          <div className="relative max-w-md">
                            <select
                              id={`fac_select_${subjectId}`}
                              value={selectedFacId || ''}
                              onChange={(e) => handleFacultySelect(subjectId, e.target.value)}
                              className="w-full appearance-none bg-white border border-slate-300 hover:border-indigo-400 focus:border-indigo-500 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs cursor-pointer transition-all"
                            >
                              <option value="">-- Select Faculty --</option>
                              {subject.facultyOptions?.map((fac) => {
                                const isFacDone = completedList.includes(fac.id);
                                return (
                                  <option key={fac.id} value={fac.id} disabled={isFacDone}>
                                    {fac.name} ({fac.designation}) {isFacDone ? '— [Completed ✓]' : ''}
                                  </option>
                                );
                              })}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Revealed Questionnaire for Selected Faculty */}
                      {selectedFacObj && !completedList.includes(selectedFacObj.id) && (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6 shadow-sm animate-fadeIn">
                          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Course & Faculty Evaluation</span>
                              <span className="text-sm font-extrabold text-slate-900">{subject.subjectName} ({subject.subjectCode})</span>
                            </div>
                            <div className="sm:text-right">
                              <span className="text-[10px] font-medium text-slate-500 block">EVALUATING FACULTY</span>
                              <span className="text-xs font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 inline-block">
                                {selectedFacObj.name} ({selectedFacObj.designation})
                              </span>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Please rate the following statements for {selectedFacObj.name}:
                            </h4>

                            {subject.parameters.map((param, qIdx) => {
                              const ratingKey = `${subjectId}_${selectedFacObj.id}_${param.id}`;
                              const currentRating = form.data.ratings[ratingKey];

                              return (
                                <div key={param.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 space-y-3">
                                  <div className="space-y-1">
                                    <h5 className="text-sm font-bold text-slate-900">
                                      {param.statement || `${qIdx + 1}. ${param.label}`} <span className="text-rose-500">*</span>
                                    </h5>
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
                                              name={`radio_${subjectId}_${selectedFacObj.id}_${param.id}`}
                                              value={opt.value}
                                              checked={isChecked}
                                              onChange={() => handleRatingSelect(subjectId, selectedFacObj.id, param.id, opt.value)}
                                              className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                            />
                                            <span className="leading-snug">{opt.label}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </fieldset>
                                </div>
                              );
                            })}
                          </div>

                          {/* Optional Comments for this Faculty */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Constructive Comments for {selectedFacObj.name} (Optional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder={`Share detailed feedback for ${selectedFacObj.name} regarding lectures, pace, or course material...`}
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                              value={facultyComments[`${subjectId}_${selectedFacObj.id}`] || ''}
                              onChange={(e) =>
                                setFacultyComments({
                                  ...facultyComments,
                                  [`${subjectId}_${selectedFacObj.id}`]: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* Submit Action for this Faculty */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <span className="text-xs text-slate-500 font-medium">
                              Responses will be securely encrypted and anonymized.
                            </span>
                            <Button
                              type="button"
                              onClick={() => handleFacultySubmit(subjectId, selectedFacObj.id)}
                              variant="primary"
                              size="md"
                              className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 px-6"
                            >
                              <Send className="w-3.5 h-3.5 mr-2" />
                              Submit Feedback for {selectedFacObj.name}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Completion Action Banner */}
        {isAllSubjectsCompleted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">All Course & Faculty Evaluations Completed!</h3>
              <p className="text-xs text-slate-600">
                You have evaluated all {subjectsList.length} enrolled subjects and {totalCompletedFacultyCount} assigned faculty members.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setIsFinalSubmitted(true)}
              variant="primary"
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20 px-8"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              View Final Evaluation Receipt
            </Button>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
