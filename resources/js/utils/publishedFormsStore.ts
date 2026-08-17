import { PublishedFormItem } from '../types';
import { SYSTEM_QUESTIONS } from './feedbackExclusionStore';

const STORAGE_KEY = 'faculty_feedback_published_forms';
const EVENT_NAME = 'faculty_feedback_published_forms_changed';

export const INITIAL_PUBLISHED_FORMS: PublishedFormItem[] = [
  {
    id: 'FORM-IT-501',
    title: 'Faculty Feedback — Semester 5 (Data Structures)',
    academicYear: '2025-26',
    semester: 5,
    departmentCode: 'IT',
    departmentName: 'Information Technology',
    division: 'Division A',
    batch: 'Batch 2022-2026',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    facultyDesignation: 'Professor',
    subjectCode: 'IT501',
    subjectName: 'Data Structures & Algorithms',
    questions: SYSTEM_QUESTIONS.map((q) => ({ id: q.id, statement: q.text })),
    status: 'Published',
    createdBy: 'Dr. Sarah Jenkins (HOD IT)',
    createdAt: '15 Aug 2026',
    publishedAt: '15 Aug 2026',
  },
  {
    id: 'FORM-IT-502',
    title: 'Faculty Feedback — Semester 5 (DBMS)',
    academicYear: '2025-26',
    semester: 5,
    departmentCode: 'IT',
    departmentName: 'Information Technology',
    division: 'Division A',
    batch: 'Batch 2022-2026',
    facultyId: 'FAC_SAGAR',
    facultyName: 'Prof. Sagar Patel',
    facultyDesignation: 'Assistant Professor',
    subjectCode: 'IT502',
    subjectName: 'Database Management Systems',
    questions: SYSTEM_QUESTIONS.map((q) => ({ id: q.id, statement: q.text })),
    status: 'Unpublished',
    createdBy: 'Dr. Sarah Jenkins (HOD IT)',
    createdAt: '16 Aug 2026',
  },
  {
    id: 'FORM-IT-701',
    title: 'Faculty Feedback — Semester 7 (Database Systems)',
    academicYear: '2025-26',
    semester: 7,
    departmentCode: 'IT',
    departmentName: 'Information Technology',
    division: 'Division A',
    batch: 'Batch 2022-2026',
    facultyId: 'FAC_JENKINS',
    facultyName: 'Dr. Sarah Jenkins',
    facultyDesignation: 'Professor',
    subjectCode: 'IT701',
    subjectName: 'Database Management Systems',
    questions: SYSTEM_QUESTIONS.map((q) => ({ id: q.id, statement: q.text })),
    status: 'Published',
    createdBy: 'Dr. Sarah Jenkins (HOD IT)',
    createdAt: '12 Aug 2026',
    publishedAt: '12 Aug 2026',
  },
  {
    id: 'FORM-CE-501',
    title: 'Faculty Feedback — Semester 5 (Theory of Computation)',
    academicYear: '2025-26',
    semester: 5,
    departmentCode: 'CE',
    departmentName: 'Computer Engineering',
    division: 'Division A',
    batch: 'Batch 2022-2026',
    facultyId: 'FAC_TURING',
    facultyName: 'Dr. Alan Turing',
    facultyDesignation: 'Professor & HOD',
    subjectCode: 'CE501',
    subjectName: 'Theory of Computation',
    questions: SYSTEM_QUESTIONS.map((q) => ({ id: q.id, statement: q.text })),
    status: 'Published',
    createdBy: 'Dr. Alan Turing (HOD CE)',
    createdAt: '14 Aug 2026',
    publishedAt: '14 Aug 2026',
  },
];

const emitChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
    window.dispatchEvent(new Event('storage'));
  }
};

export const getPublishedForms = (): PublishedFormItem[] => {
  if (typeof window === 'undefined') return INITIAL_PUBLISHED_FORMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PUBLISHED_FORMS));
      return INITIAL_PUBLISHED_FORMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error reading published forms from localStorage:', err);
  }
  return INITIAL_PUBLISHED_FORMS;
};

export const savePublishedForms = (forms: PublishedFormItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
    emitChange();
  } catch (err) {
    console.error('Error saving published forms to localStorage:', err);
  }
};

export const savePublishedForm = (formData: Partial<PublishedFormItem>): PublishedFormItem => {
  const current = getPublishedForms();
  const id = formData.id || `FORM-${formData.departmentCode || 'IT'}-${Date.now().toString().slice(-4)}`;
  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const existingIndex = current.findIndex((f) => f.id === id);

  const newForm: PublishedFormItem = {
    id,
    title: formData.title || `Faculty Feedback — Semester ${formData.semester || 5} (${formData.subjectName || 'Subject'})`,
    academicYear: formData.academicYear || '2025-26',
    semester: Number(formData.semester) || 5,
    departmentCode: formData.departmentCode || 'IT',
    departmentName: formData.departmentName || 'Information Technology',
    division: formData.division || 'Division A',
    batch: formData.batch || 'Batch 2022-2026',
    facultyId: formData.facultyId || 'FAC_JENKINS',
    facultyName: formData.facultyName || 'Dr. Sarah Jenkins',
    facultyDesignation: formData.facultyDesignation || 'Professor',
    subjectCode: formData.subjectCode || 'IT501',
    subjectName: formData.subjectName || 'Data Structures & Algorithms',
    questions: formData.questions && formData.questions.length > 0
      ? formData.questions
      : SYSTEM_QUESTIONS.map((q) => ({ id: q.id, statement: q.text })),
    status: formData.status || 'Published',
    createdBy: formData.createdBy || 'HOD',
    createdAt: formData.createdAt || nowStr,
    publishedAt: formData.status === 'Published' ? (formData.publishedAt || nowStr) : undefined,
  };

  let updated: PublishedFormItem[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = newForm;
  } else {
    updated = [newForm, ...current];
  }

  savePublishedForms(updated);
  return newForm;
};

export const togglePublishStatus = (formId: string): PublishedFormItem | null => {
  const current = getPublishedForms();
  const index = current.findIndex((f) => f.id === formId);
  if (index === -1) return null;

  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const form = current[index];
  const nextStatus: 'Published' | 'Unpublished' = form.status === 'Published' ? 'Unpublished' : 'Published';

  const updatedForm: PublishedFormItem = {
    ...form,
    status: nextStatus,
    publishedAt: nextStatus === 'Published' ? (form.publishedAt || nowStr) : undefined,
  };

  const updatedList = [...current];
  updatedList[index] = updatedForm;
  savePublishedForms(updatedList);
  return updatedForm;
};

export const setPublishStatus = (formId: string, status: 'Published' | 'Unpublished'): PublishedFormItem | null => {
  const current = getPublishedForms();
  const index = current.findIndex((f) => f.id === formId);
  if (index === -1) return null;

  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const form = current[index];

  const updatedForm: PublishedFormItem = {
    ...form,
    status,
    publishedAt: status === 'Published' ? (form.publishedAt || nowStr) : undefined,
  };

  const updatedList = [...current];
  updatedList[index] = updatedForm;
  savePublishedForms(updatedList);
  return updatedForm;
};

export const deletePublishedForm = (formId: string): void => {
  const current = getPublishedForms();
  const filtered = current.filter((f) => f.id !== formId);
  savePublishedForms(filtered);
};

export const subscribeToPublishedForms = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
};
