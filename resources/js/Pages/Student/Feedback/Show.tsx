import React, { useState } from 'react';
import StudentLayout from '../../../Layouts/StudentLayout';
import { StudentFeedbackShowProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { RatingInput } from '../../../Components/ui/RatingInput';
import { Button } from '../../../Components/ui/Button';
import { useForm } from '../../../Components/shared/useForm';
import { CheckCircle2, User, Send, Sparkles } from 'lucide-react';

export default function Show({ student, feedbackItems }: StudentFeedbackShowProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form ratings state structure
  const initialRatings: Record<string, number> = {};
  const initialComments: Record<number, string> = {};

  feedbackItems.forEach((item) => {
    item.parameters.forEach((param) => {
      initialRatings[`${item.assignmentId}_${param.id}`] = 5;
    });
    initialComments[item.assignmentId] = '';
  });

  const form = useForm({
    ratings: initialRatings,
    comments: initialComments,
  });

  const handleRatingChange = (assignmentId: number, paramId: string, rating: number) => {
    form.setData('ratings', {
      ...form.data.ratings,
      [`${assignmentId}_${paramId}`]: rating,
    });
  };

  const handleCommentChange = (assignmentId: number, comment: string) => {
    form.setData('comments', {
      ...form.data.comments,
      [assignmentId]: comment,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit('post', '#Student/Feedback/Submitted', {
      onSuccess: () => {
        setIsSubmitted(true);
      },
    });
  };

  if (isSubmitted) {
    return (
      <StudentLayout>
        <Card className="max-w-xl mx-auto text-center p-8 space-y-6 animate-fadeIn border-emerald-200 bg-white shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Feedback Submitted Successfully!</h2>
            <p className="text-xs text-slate-600">
              Thank you, <span className="font-bold text-slate-900">{student.name}</span>. Your ratings have been anonymously logged into the system.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Student Roll:</span>
              <span className="font-mono text-slate-900 font-bold">{student.rollNumber}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Batch & Division:</span>
              <span className="text-slate-900 font-semibold">{student.batch} ({student.division})</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Evaluation Status:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 100% Completed
              </span>
            </div>
          </div>

          <Button variant="primary" onClick={() => (window.location.hash = '#Student/Identify')}>
            Submit Feedback for Another Session
          </Button>
        </Card>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Student Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Authenticated Student Session</span>
            <h2 className="text-xl font-extrabold text-slate-900">{student.name}</h2>
            <p className="text-xs text-slate-500">{student.batch} &bull; {student.division}</p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 self-start sm:self-center shadow-2xs">
            {student.rollNumber}
          </span>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {feedbackItems.map((item, idx) => (
            <Card key={item.assignmentId} className="space-y-6 border-slate-200 bg-white shadow-sm">
              {/* Faculty & Subject Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Subject {idx + 1}: {item.subjectCode}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{item.subjectName}</h3>
                  <p className="text-xs text-slate-500">{item.department}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-900">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>{item.facultyName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{item.facultyDesignation}</span>
                </div>
              </div>

              {/* Rating Parameters */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Rate Teaching Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.parameters.map((param) => {
                    const ratingKey = `${item.assignmentId}_${param.id}`;
                    const currentRating = form.data.ratings[ratingKey] || 5;

                    return (
                      <RatingInput
                        key={param.id}
                        label={param.label}
                        description={param.description}
                        value={currentRating}
                        onChange={(r) => handleRatingChange(item.assignmentId, param.id, r)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Qualitative Comments Textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Constructive Comments & Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Share detailed feedback for ${item.facultyName} regarding lectures, pace, or course material...`}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                  value={form.data.comments[item.assignmentId] || ''}
                  onChange={(e) => handleCommentChange(item.assignmentId, e.target.value)}
                />
              </div>
            </Card>
          ))}

          {/* Submit Action Bar */}
          <div className="sticky bottom-6 z-20 bg-white/95 border border-slate-200 p-4 rounded-xl backdrop-blur-md flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-bold text-slate-900">Ready to Submit Feedback?</p>
              <p className="text-[11px] text-slate-500">All responses will be securely encrypted and anonymized.</p>
            </div>
            <Button type="submit" variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 focus:ring-indigo-500 shadow-indigo-600/20" disabled={form.processing}>
              <Send className="w-4 h-4 mr-2" />
              {form.processing ? 'Submitting...' : 'Submit Anonymous Feedback'}
            </Button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}
