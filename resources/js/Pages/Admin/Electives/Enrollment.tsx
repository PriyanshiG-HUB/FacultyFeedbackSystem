import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ElectiveEnrollmentProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Input } from '../../../Components/ui/Input';
import Link from '../../../Components/shared/Link';
import { ArrowLeft, UserCheck, UserMinus, Search, Save } from 'lucide-react';

export default function Enrollment({ elective, availableStudents: initialStudents }: ElectiveEnrollmentProps) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');

  const toggleEnrollment = (id: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnrolled: !s.isEnrolled } : s))
    );
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const enrolledCount = students.filter((s) => s.isEnrolled).length;

  return (
    <AdminLayout title="Elective Enrollment" currentPath="#Admin/Electives/Enrollment">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="#Admin/Electives/Index">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Electives
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{elective.subjectName}</h2>
            <p className="text-xs text-slate-400">
              Code: <span className="font-mono text-brand-400">{elective.subjectCode}</span> &bull; Batch: {elective.batch}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-right">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Enrolled</p>
          <p className="text-lg font-extrabold text-emerald-400">
            {enrolledCount} <span className="text-xs text-slate-500 font-normal">/ {students.length} Students</span>
          </p>
        </div>
      </div>

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

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
            {filtered.map((s) => (
              <div key={s.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300">
                    {s.rollNumber}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.division}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={s.isEnrolled ? 'danger' : 'primary'}
                  onClick={() => toggleEnrollment(s.id)}
                >
                  {s.isEnrolled ? (
                    <>
                      <UserMinus className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Enroll Student
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <Button
              variant="primary"
              onClick={() => alert(`Saved enrollment changes for ${enrolledCount} students.`)}
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Enrollment Changes
            </Button>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
