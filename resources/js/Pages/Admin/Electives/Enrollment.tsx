import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ElectiveEnrollmentProps, ElectiveEnrollmentStudent } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Input, Select } from '../../../Components/ui/Input';
import Link from '../../../Components/shared/Link';
import { ArrowLeft, UserCheck, UserMinus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';

export default function Enrollment(_props: ElectiveEnrollmentProps) {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | ''>('');
  const [students, setStudents] = useState<ElectiveEnrollmentStudent[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Parse offering_id from URL hash if available
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('offering_id=')) {
      const match = hash.match(/offering_id=(\d+)/);
      if (match && match[1]) {
        setSelectedOfferingId(Number(match[1]));
      }
    }
  }, []);

  const fetchOfferingsAndStudents = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [offeringsRes, studentsRes] = await Promise.all([
        api.get('/subject-offerings'),
        api.get('/students'),
      ]);

      const offeringList: any[] = Array.isArray(offeringsRes.data) ? offeringsRes.data : [];
      setOfferings(offeringList);

      let currentOfferingId = selectedOfferingId;
      if (currentOfferingId === '' && offeringList.length > 0) {
        currentOfferingId = offeringList[0].id;
        setSelectedOfferingId(offeringList[0].id);
      }

      // Fetch enrollments for the selected offering if available
      let enrollmentsMap: Record<number, number> = {}; // student_id -> enrollment_id
      if (currentOfferingId !== '') {
        try {
          const enrollRes = await api.get(`/elective-enrollments?subject_offering_id=${currentOfferingId}`);
          if (Array.isArray(enrollRes.data)) {
            enrollRes.data.forEach((e: any) => {
              enrollmentsMap[e.student_id] = e.id;
            });
          }
        } catch {
          // If no enrollments
        }
      }

      const allStudents: any[] = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const mappedStudents: ElectiveEnrollmentStudent[] = allStudents.map((s: any) => ({
        id: s.id,
        rollNumber: s.roll_no,
        name: s.full_name,
        division: s.division?.division_code ? `${s.division.division_code} (${s.batch?.batch_title || 'Batch'})` : 'Division 1',
        section: s.section?.section_code || 'A1',
        isEnrolled: Boolean(enrollmentsMap[s.id]),
        enrollmentId: enrollmentsMap[s.id] || null,
      }));

      setStudents(mappedStudents);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load enrollment roster.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedOfferingId]);

  useEffect(() => {
    fetchOfferingsAndStudents();
  }, [fetchOfferingsAndStudents]);

  const currentOffering = offerings.find((o) => o.id === Number(selectedOfferingId)) || offerings[0] || null;

  const handleToggleEnrollment = async (student: ElectiveEnrollmentStudent) => {
    if (!currentOffering || actionLoadingId !== null) return;
    setActionLoadingId(student.id);

    try {
      if (student.isEnrolled && student.enrollmentId) {
        // Remove enrollment
        await api.delete(`/elective-enrollments/${student.enrollmentId}`);
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, isEnrolled: false, enrollmentId: null } : s))
        );
      } else {
        // Enroll student
        const res = await api.post('/elective-enrollments', {
          student_id: student.id,
          subject_offering_id: currentOffering.id,
          status: 'ENROLLED',
        });
        const newEnrollmentId = res.data?.id;
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, isEnrolled: true, enrollmentId: newEnrollmentId } : s))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update student enrollment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const enrolledCount = students.filter((s) => s.isEnrolled).length;

  return (
    <AdminLayout title="Elective Enrollment" currentPath="#Admin/Electives/Enrollment">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="#Admin/Electives/Index">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Electives
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentOffering?.subject?.subject_name || 'Elective Course Enrollment'}
            </h2>
            <p className="text-xs text-slate-500">
              Code: <span className="font-mono text-blue-700 font-bold">{currentOffering?.subject?.subject_code || '---'}</span> &bull; Batch: {currentOffering?.batch?.batch_title || 'General'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {offerings.length > 0 && (
            <div className="w-64">
              <Select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(Number(e.target.value))}
              >
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.subject?.subject_code} &mdash; {o.subject?.subject_name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={fetchOfferingsAndStudents} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-right shadow-2xs">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Enrolled</p>
            <p className="text-lg font-extrabold text-emerald-600 font-mono">
              {enrolledCount}{' '}
              <span className="text-xs text-slate-500 font-normal">
                / {currentOffering?.enrollment_capacity || students.length} Capacity
              </span>
            </p>
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {offerings.length === 0 ? (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-800 space-y-3">
          <p className="font-bold text-base">No Elective Subject Offerings Configured Yet</p>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Before assigning student enrollment cohorts, create an offering for an elective subject in the Electives Catalog.
          </p>
          <Link href="#Admin/Electives/Index">
            <Button variant="primary" size="sm">
              Go to Electives Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <Card title="Elective Cohort Assignment Interface">
          <div className="space-y-4">
            <div className="relative w-full sm:w-72">
              <Input
                placeholder="Search by student roll number or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
              {filtered.length > 0 ? (
                filtered.map((s) => {
                  const isProcessing = actionLoadingId === s.id;
                  return (
                    <div key={s.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700">
                          {s.rollNumber}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.division}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={s.isEnrolled ? 'danger' : 'primary'}
                        disabled={isProcessing}
                        onClick={() => handleToggleEnrollment(s)}
                      >
                        {s.isEnrolled ? (
                          <>
                            <UserMinus className="w-3.5 h-3.5 mr-1" />
                            {isProcessing ? 'Removing...' : 'Remove'}
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            {isProcessing ? 'Enrolling...' : 'Enroll Student'}
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No matching students found.
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}
