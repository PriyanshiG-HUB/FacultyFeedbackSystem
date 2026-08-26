import { PublishedFormItem } from '../types';
import { SYSTEM_QUESTIONS } from './feedbackExclusionStore';
import { api } from '../lib/api';

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
    division: 'Division 1',
    batch: '2022-26',
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
    id: 'FORM-CE-501',
    assignmentId: 5,
    title: 'Faculty Feedback — Semester 5 (Theory of Computation)',
    academicYear: '2025-26',
    semester: 5,
    departmentCode: 'CE',
    departmentName: 'Computer Engineering',
    division: 'Division 1',
    section: 'All',
    batch: '2022-26',
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
      return INITIAL_PUBLISHED_FORMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
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

export const fetchPublishedFormsFromApi = async (): Promise<PublishedFormItem[]> => {
  try {
    const res = await api.get('/feedback-forms');
    if (res && Array.isArray(res.data)) {
      const apiForms: PublishedFormItem[] = res.data.map((form: any) => {
        const ta = form.teaching_assignment || {};
        return {
          id: String(form.id || form.form_code),
          numericId: form.id,
          assignmentId: form.teaching_assignment_id,
          title: form.title,
          academicYear: ta.academic_year?.year_code || '2025-26',
          semester: ta.semester_id || 5,
          departmentCode: ta.batch?.department?.department_code || 'IT',
          departmentName: ta.batch?.department?.department_name || 'Information Technology',
          division: ta.division?.division_code || 'Division 1',
          section: ta.section?.section_code || 'All',
          batch: ta.batch?.batch_title || '2022-26',
          facultyId: String(ta.faculty_id || 'FAC_JENKINS'),
          facultyName: ta.faculty?.full_name || 'Faculty Member',
          facultyDesignation: ta.faculty?.designation?.designation_name || 'Professor',
          subjectCode: ta.subject?.subject_code || 'SUB101',
          subjectName: ta.subject?.subject_name || 'Subject',
          questions: (form.questions || []).map((q: any) => ({
            id: q.id,
            statement: q.question_text,
          })),
          status: form.is_published ? 'Published' : 'Unpublished',
          createdBy: form.created_by_user_account?.email || 'Admin',
          createdAt: form.created_at ? new Date(form.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Aug 2026',
          publishedAt: form.published_at ? new Date(form.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
        };
      });

      savePublishedForms(apiForms);
      return apiForms;
    }
  } catch (err) {
    console.warn('API unavailable for published forms, using fallback cache');
  }
  return getPublishedForms();
};

export const savePublishedForm = async (formData: Partial<PublishedFormItem>): Promise<PublishedFormItem> => {
  const current = getPublishedForms();
  const id = formData.id || `FORM-${formData.departmentCode || 'IT'}-${Date.now().toString().slice(-4)}`;
  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  let apiCreatedForm: any = null;

  if (formData.assignmentId) {
    const payload = {
      teaching_assignment_id: formData.assignmentId,
      title: formData.title,
      form_code: `FF-${Date.now()}`,
      window_start_date: '2026-08-01',
      window_end_date: '2026-12-31',
      is_anonymous: true,
      questions: (formData.questions || []).map((q, idx) => ({
        question_text: q.statement || q.statement,
        question_type: 'RATING',
        display_order: idx + 1,
        is_required: true,
        max_rating: 5,
      })),
    };

    const res = await api.post('/feedback-forms', payload);
    apiCreatedForm = res.data;
    if (apiCreatedForm?.id && formData.status === 'Published') {
      await api.post(`/feedback-forms/${apiCreatedForm.id}/publish`);
    }
  }

  const existingIndex = current.findIndex((f) => f.id === id);
  const newForm: PublishedFormItem = {
    id: apiCreatedForm?.id ? String(apiCreatedForm.id) : id,
    numericId: apiCreatedForm?.id,
    assignmentId: formData.assignmentId,
    title: formData.title || `Faculty Feedback — Semester ${formData.semester || 5} (${formData.subjectName || 'Subject'})`,
    academicYear: formData.academicYear || '2025-26',
    semester: Number(formData.semester) || 5,
    departmentCode: formData.departmentCode || 'IT',
    departmentName: formData.departmentName || 'Information Technology',
    division: formData.division || 'Division 1',
    section: formData.section || 'All',
    batch: formData.batch || '2022-26',
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

export const togglePublishStatus = async (formId: string): Promise<PublishedFormItem | null> => {
  const current = getPublishedForms();
  const index = current.findIndex((f) => f.id === formId);
  if (index === -1) return null;

  const form = current[index];
  const nextStatus: 'Published' | 'Unpublished' = form.status === 'Published' ? 'Unpublished' : 'Published';
  const numericId = form.numericId || (form.id.match(/^\d+$/) ? parseInt(form.id, 10) : null);

  if (numericId) {
    const endpoint = nextStatus === 'Published' ? `/feedback-forms/${numericId}/publish` : `/feedback-forms/${numericId}/unpublish`;
    await api.post(endpoint);
  }

  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

export const deletePublishedForm = async (formId: string): Promise<void> => {
  const current = getPublishedForms();
  const form = current.find((f) => f.id === formId);
  const numericId = form?.numericId || (formId.match(/^\d+$/) ? parseInt(formId, 10) : null);

  if (numericId) {
    await api.delete(`/feedback-forms/${numericId}`);
  }

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
