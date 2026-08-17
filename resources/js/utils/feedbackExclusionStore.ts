import { FeedbackSubmissionItem, QuestionAnswerItem } from '../types';

export const SYSTEM_QUESTIONS = [
  { id: 1, text: 'The faculty explains concepts clearly.' },
  { id: 2, text: 'The faculty demonstrates good subject knowledge.' },
  { id: 3, text: 'The faculty completes the syllabus effectively.' },
  { id: 4, text: 'The faculty provides useful study material.' },
  { id: 5, text: 'The faculty maintains punctuality and classroom engagement.' },
];

export const getRatingLabel = (rating: number): string => {
  switch (rating) {
    case 1:
      return 'Strongly Disagree';
    case 2:
      return 'Disagree';
    case 3:
      return 'Neutral';
    case 4:
      return 'Agree';
    case 5:
      return 'Strongly Agree';
    default:
      return 'Neutral';
  }
};

export const INITIAL_MOCK_SUBMISSIONS: FeedbackSubmissionItem[] = [
  // --- Dr. Sarah Jenkins (IT / Database Management Systems) ---
  {
    id: 'FS-IT-101',
    studentRoll: '22IT045',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    academicYear: '2025-26',
    semester: 7,
    division: 'IT-1',
    departmentCode: 'IT',
    submittedAt: '10 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'The explanation was difficult to follow and pacing was too fast during SQL joins.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 3, ratingLabel: 'Neutral' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Classes often started late.' },
    ],
  },
  {
    id: 'FS-IT-102',
    studentRoll: '22IT052',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    academicYear: '2025-26',
    semester: 7,
    division: 'IT-1',
    departmentCode: 'IT',
    submittedAt: '10 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Concepts were rushed without clearing basic prerequisites.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 4, ratingLabel: 'Agree' },
    ],
  },
  {
    id: 'FS-IT-103',
    studentRoll: '22IT071',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    academicYear: '2025-26',
    semester: 7,
    division: 'IT-1',
    departmentCode: 'IT',
    submittedAt: '11 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Difficult to follow derivations.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 3, ratingLabel: 'Neutral' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 1, ratingLabel: 'Strongly Disagree' },
    ],
  },
  {
    id: 'FS-IT-104',
    studentRoll: '22IT089',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    academicYear: '2025-26',
    semester: 7,
    division: 'IT-1',
    departmentCode: 'IT',
    submittedAt: '11 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 4, ratingLabel: 'Agree' },
    ],
  },
  {
    id: 'FS-IT-105',
    studentRoll: '22IT092',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    academicYear: '2025-26',
    semester: 7,
    division: 'IT-1',
    departmentCode: 'IT',
    submittedAt: '12 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Need more step-by-step query execution demos.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 3, ratingLabel: 'Neutral' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 2, ratingLabel: 'Disagree' },
    ],
  },
  {
    id: 'FS-IT-106',
    studentRoll: '22IT001',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    academicYear: '2025-26',
    semester: 7,
    division: 'IT-1',
    departmentCode: 'IT',
    submittedAt: '09 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 5, ratingLabel: 'Strongly Agree', comment: 'Exceptional teaching methodology and clear SQL query explanations.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 5, ratingLabel: 'Strongly Agree' },
    ],
  },
  {
    id: 'FS-IT-107',
    studentRoll: '22IT002',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    academicYear: '2025-26',
    semester: 7,
    division: 'IT-1',
    departmentCode: 'IT',
    submittedAt: '09 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 5, ratingLabel: 'Strongly Agree', comment: 'Always approachable and resolves doubts quickly during lab sessions.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 5, ratingLabel: 'Strongly Agree' },
    ],
  },
  {
    id: 'FS-IT-108',
    studentRoll: '22IT003',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    academicYear: '2025-26',
    semester: 7,
    division: 'IT-1',
    departmentCode: 'IT',
    submittedAt: '09 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 4, ratingLabel: 'Agree' },
    ],
  },

  // --- Prof. Sagar Patel (CE / Java Programming & OOP) ---
  {
    id: 'FS-CE-201',
    studentRoll: '22CE045',
    facultyId: 'FAC_SAGAR',
    facultyName: 'Prof. Sagar Patel',
    subjectCode: 'CE701',
    subjectName: 'Java Programming & OOP',
    academicYear: '2025-26',
    semester: 7,
    division: 'CE-1',
    departmentCode: 'CE',
    submittedAt: '08 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Very difficult to follow multithreading and garbage collection topics.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Syllabus was rushed in last two weeks.' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 1, ratingLabel: 'Strongly Disagree' },
    ],
  },
  {
    id: 'FS-CE-202',
    studentRoll: '22CE046',
    facultyId: 'FAC_SAGAR',
    facultyName: 'Prof. Sagar Patel',
    subjectCode: 'CE701',
    subjectName: 'Java Programming & OOP',
    academicYear: '2025-26',
    semester: 7,
    division: 'CE-1',
    departmentCode: 'CE',
    submittedAt: '08 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 4, ratingLabel: 'Agree' },
    ],
  },
  {
    id: 'FS-CE-203',
    studentRoll: '22CE047',
    facultyId: 'FAC_SAGAR',
    facultyName: 'Prof. Sagar Patel',
    subjectCode: 'CE701',
    subjectName: 'Java Programming & OOP',
    academicYear: '2025-26',
    semester: 7,
    division: 'CE-1',
    departmentCode: 'CE',
    submittedAt: '08 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Concepts were not explained clearly.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 1, ratingLabel: 'Strongly Disagree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 1, ratingLabel: 'Strongly Disagree' },
    ],
  },
  {
    id: 'FS-CE-204',
    studentRoll: '22CE048',
    facultyId: 'FAC_SAGAR',
    facultyName: 'Prof. Sagar Patel',
    subjectCode: 'CE701',
    subjectName: 'Java Programming & OOP',
    academicYear: '2025-26',
    semester: 7,
    division: 'CE-1',
    departmentCode: 'CE',
    submittedAt: '08 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 5, ratingLabel: 'Strongly Agree', comment: 'Great teaching style and helpful assignment feedbacks.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 5, ratingLabel: 'Strongly Agree' },
    ],
  },

  // --- Dr. Donald Knuth (CSE / Advanced Data Structures) ---
  {
    id: 'FS-CSE-301',
    studentRoll: '22CSE001',
    facultyId: 'FAC_KNUTH',
    facultyName: 'Dr. Donald Knuth',
    subjectCode: 'CSE701',
    subjectName: 'Advanced Data Structures',
    academicYear: '2025-26',
    semester: 7,
    division: 'CSE-1',
    departmentCode: 'CSE',
    submittedAt: '09 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 5, ratingLabel: 'Strongly Agree', comment: 'Inspiring lectures on algorithm analysis and tree balancing.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 5, ratingLabel: 'Strongly Agree' },
    ],
  },
  {
    id: 'FS-CSE-302',
    studentRoll: '22CSE015',
    facultyId: 'FAC_KNUTH',
    facultyName: 'Dr. Donald Knuth',
    subjectCode: 'CSE701',
    subjectName: 'Advanced Data Structures',
    academicYear: '2025-26',
    semester: 7,
    division: 'CSE-1',
    departmentCode: 'CSE',
    submittedAt: '10 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Pacing during B-Tree derivations was extremely fast.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 3, ratingLabel: 'Neutral' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 2, ratingLabel: 'Disagree' },
    ],
  },

  // --- Dr. Anita Roy (AIML / Machine Learning) ---
  {
    id: 'FS-AIML-401',
    studentRoll: '22AIML001',
    facultyId: 'FAC_ROY',
    facultyName: 'Dr. Anita Roy',
    subjectCode: 'AIML701',
    subjectName: 'Machine Learning & Neural Networks',
    academicYear: '2025-26',
    semester: 7,
    division: 'AIML-1',
    departmentCode: 'AIML',
    submittedAt: '11 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 5, ratingLabel: 'Strongly Agree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 4, ratingLabel: 'Agree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 5, ratingLabel: 'Strongly Agree' },
    ],
  },
  {
    id: 'FS-AIML-402',
    studentRoll: '22AIML012',
    facultyId: 'FAC_ROY',
    facultyName: 'Dr. Anita Roy',
    subjectCode: 'AIML701',
    subjectName: 'Machine Learning & Neural Networks',
    academicYear: '2025-26',
    semester: 7,
    division: 'AIML-1',
    departmentCode: 'AIML',
    submittedAt: '11 Aug 2026',
    evaluationStatus: 'included',
    answers: [
      { questionId: 1, questionText: SYSTEM_QUESTIONS[0].text, rating: 1, ratingLabel: 'Strongly Disagree', comment: 'Math derivations for backpropagation were not clear.' },
      { questionId: 2, questionText: SYSTEM_QUESTIONS[1].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 3, questionText: SYSTEM_QUESTIONS[2].text, rating: 3, ratingLabel: 'Neutral' },
      { questionId: 4, questionText: SYSTEM_QUESTIONS[3].text, rating: 2, ratingLabel: 'Disagree' },
      { questionId: 5, questionText: SYSTEM_QUESTIONS[4].text, rating: 1, ratingLabel: 'Strongly Disagree' },
    ],
  },
];

const STORAGE_KEY = 'faculty_feedback_submission_overrides_v2';

export interface SubmissionOverride {
  evaluationStatus: 'included' | 'excluded';
  exclusionReason?: string | null;
  excludedBy?: string | null;
  excludedAt?: string | null;
}

export const getSubmissionOverridesMap = (): Record<string, SubmissionOverride> => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading submission overrides from sessionStorage:', e);
  }
  return {};
};

export const saveSubmissionOverridesMap = (map: Record<string, SubmissionOverride>) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('feedback_exclusion_updated'));
  } catch (e) {
    console.error('Error saving submission overrides to sessionStorage:', e);
  }
};

export const getMergedSubmissions = (): FeedbackSubmissionItem[] => {
  const overrides = getSubmissionOverridesMap();
  let customSubmissions: FeedbackSubmissionItem[] = [];
  try {
    const rawCustom = localStorage.getItem('faculty_feedback_custom_submissions');
    if (rawCustom) {
      customSubmissions = JSON.parse(rawCustom);
    }
  } catch (e) {}

  const allSubmissions = [...customSubmissions, ...INITIAL_MOCK_SUBMISSIONS];

  return allSubmissions.map((item) => {
    if (overrides[item.id]) {
      return {
        ...item,
        ...overrides[item.id],
      };
    }
    return item;
  });
};

export const saveSubmissionToStore = (data: Partial<FeedbackSubmissionItem>): FeedbackSubmissionItem => {
  let customSubmissions: FeedbackSubmissionItem[] = [];
  try {
    const rawCustom = localStorage.getItem('faculty_feedback_custom_submissions');
    if (rawCustom) {
      customSubmissions = JSON.parse(rawCustom);
    }
  } catch (e) {}

  const newSub: FeedbackSubmissionItem = {
    id: data.id || `FS-LIVE-${Date.now().toString().slice(-4)}`,
    studentRoll: data.studentRoll || '22IT045',
    facultyId: String(data.facultyId || 'FAC_JENKINS'),
    facultyName: data.facultyName || 'Dr. Sarah Jenkins',
    subjectCode: data.subjectCode || 'IT501',
    subjectName: data.subjectName || 'Data Structures & Algorithms',
    academicYear: data.academicYear || '2025-26',
    semester: Number(data.semester) || 5,
    division: data.division || 'IT-1',
    departmentCode: data.departmentCode || 'IT',
    submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    evaluationStatus: 'included',
    answers: data.answers || [],
  };

  const updated = [newSub, ...customSubmissions];
  try {
    localStorage.setItem('faculty_feedback_custom_submissions', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}

  return newSub;
};

export const excludeSubmission = (
  submissionId: string,
  reason: string,
  hodName: string = 'HOD'
): FeedbackSubmissionItem[] => {
  const overrides = getSubmissionOverridesMap();
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  overrides[submissionId] = {
    evaluationStatus: 'excluded',
    exclusionReason: reason,
    excludedBy: hodName,
    excludedAt: dateStr,
  };

  saveSubmissionOverridesMap(overrides);
  return getMergedSubmissions();
};

export const bulkExcludeSubmissions = (
  submissionIds: string[],
  reason: string,
  hodName: string = 'HOD'
): FeedbackSubmissionItem[] => {
  const overrides = getSubmissionOverridesMap();
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  submissionIds.forEach((subId) => {
    overrides[subId] = {
      evaluationStatus: 'excluded',
      exclusionReason: reason,
      excludedBy: hodName,
      excludedAt: dateStr,
    };
  });

  saveSubmissionOverridesMap(overrides);
  return getMergedSubmissions();
};

export const includeSubmission = (submissionId: string): FeedbackSubmissionItem[] => {
  const overrides = getSubmissionOverridesMap();
  delete overrides[submissionId];
  saveSubmissionOverridesMap(overrides);
  return getMergedSubmissions();
};

// Calculates Faculty Overall Score based ONLY on INCLUDED complete submissions
export const calculateFacultyOverallScore = (submissions: FeedbackSubmissionItem[]) => {
  const totalSubmissions = submissions.length;
  const includedSubmissions = submissions.filter((s) => s.evaluationStatus === 'included');
  const excludedSubmissions = submissions.filter((s) => s.evaluationStatus === 'excluded');

  const includedCount = includedSubmissions.length;
  const excludedCount = excludedSubmissions.length;

  let averageScore = 0;
  if (includedCount > 0) {
    let totalSum = 0;
    let totalAnswersCount = 0;

    includedSubmissions.forEach((sub) => {
      sub.answers.forEach((ans) => {
        totalSum += ans.rating;
        totalAnswersCount += 1;
      });
    });

    if (totalAnswersCount > 0) {
      averageScore = Number((totalSum / totalAnswersCount).toFixed(2));
    }
  }

  return {
    totalSubmissions,
    includedCount,
    excludedCount,
    averageScore,
  };
};

// Calculates Question-Wise Rating Distribution based ONLY on INCLUDED complete submissions
export const calculateQuestionDistribution = (
  submissions: FeedbackSubmissionItem[],
  questionId: number
) => {
  const includedSubmissions = submissions.filter((s) => s.evaluationStatus === 'included');
  const distribution = {
    stronglyDisagree: 0, // rating = 1
    disagree: 0,         // rating = 2
    neutral: 0,          // rating = 3
    agree: 0,            // rating = 4
    stronglyAgree: 0,    // rating = 5
    totalIncludedCount: includedSubmissions.length,
    questionAverage: 0,
  };

  let sum = 0;
  let count = 0;

  includedSubmissions.forEach((sub) => {
    const ans = sub.answers.find((a) => a.questionId === questionId);
    if (ans) {
      count += 1;
      sum += ans.rating;
      if (ans.rating === 1) distribution.stronglyDisagree += 1;
      else if (ans.rating === 2) distribution.disagree += 1;
      else if (ans.rating === 3) distribution.neutral += 1;
      else if (ans.rating === 4) distribution.agree += 1;
      else if (ans.rating === 5) distribution.stronglyAgree += 1;
    }
  });

  if (count > 0) {
    distribution.questionAverage = Number((sum / count).toFixed(2));
  }

  return distribution;
};
