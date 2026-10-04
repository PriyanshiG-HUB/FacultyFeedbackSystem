import { FeedbackSubmissionItem } from '../types';

export const SYSTEM_QUESTIONS = [
  { id: 1, text: 'Faculty arrives on time and conducts lectures regularly.' },
  { id: 2, text: 'Faculty demonstrates comprehensive knowledge of the course subject.' },
  { id: 3, text: 'Course concepts, principles, and problems are explained with clarity.' },
  { id: 4, text: 'Faculty provides relevant study materials, assignments, and guidance.' },
  { id: 5, text: 'Faculty encourages interactive participation and addresses student queries effectively.' }
];

export const calculateFacultyOverallScore = (submissions: FeedbackSubmissionItem[]) => {
  const completeSubmissions = submissions.filter(
    (s) => s.answers && s.answers.length > 0 && s.evaluationStatus === 'included'
  );
  if (completeSubmissions.length === 0) return { averageScore: 0, includedCount: 0, excludedCount: submissions.filter(s => s.evaluationStatus === 'excluded').length, totalSubmissions: submissions.length };
  const allRatings = completeSubmissions.flatMap((s) => s.answers.map((a) => a.rating));
  const sum = allRatings.reduce((acc, r) => acc + r, 0);
  return {
    averageScore: sum / allRatings.length,
    includedCount: completeSubmissions.length,
    excludedCount: submissions.filter((s) => s.evaluationStatus === 'excluded').length,
    totalSubmissions: submissions.length,
  };
};

interface DistributionStats {
  questionAverage: number;
  stronglyDisagree: number;
  disagree: number;
  neutral: number;
  agree: number;
  stronglyAgree: number;
}

export const calculateQuestionDistribution = (submissions: FeedbackSubmissionItem[], questionId: number): DistributionStats => {
  const completeSubmissions = submissions.filter(
    (s) => s.answers && s.answers.length > 0 && s.evaluationStatus === 'included'
  );
  if (completeSubmissions.length === 0) return { questionAverage: 0, stronglyDisagree: 0, disagree: 0, neutral: 0, agree: 0, stronglyAgree: 0 };
  
  const ratings: number[] = [];
  completeSubmissions.forEach((sub) => {
    sub.answers.forEach((ans) => {
      if (ans.questionId === questionId) {
        ratings.push(ans.rating);
      }
    });
  });
  
  if (ratings.length === 0) return { questionAverage: 0, stronglyDisagree: 0, disagree: 0, neutral: 0, agree: 0, stronglyAgree: 0 };
  
  const avg = ratings.reduce((sum, val) => sum + val, 0) / ratings.length;
  
  return {
    questionAverage: avg,
    stronglyDisagree: ratings.filter(r => r === 1).length,
    disagree: ratings.filter(r => r === 2).length,
    neutral: ratings.filter(r => r === 3).length,
    agree: ratings.filter(r => r === 4).length,
    stronglyAgree: ratings.filter(r => r === 5).length,
  };
};
