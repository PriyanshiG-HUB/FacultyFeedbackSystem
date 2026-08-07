import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ElectivesIndexProps, ElectiveItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import Link from '../../../Components/shared/Link';
import { BookOpen, Users, ArrowRight } from 'lucide-react';

export default function Index({ electives }: ElectivesIndexProps) {
  const columns: Column<ElectiveItem>[] = [
    {
      header: 'Code',
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-900 border border-slate-800 rounded text-brand-400">
          {row.subjectCode}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Elective Subject',
      accessor: (row) => <span className="font-semibold text-slate-100">{row.subjectName}</span>,
      sortable: true,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Target Batch & Sem',
      accessor: (row) => (
        <div className="text-xs">
          <p className="text-slate-200">{row.batch}</p>
          <p className="text-slate-400">Semester {row.semester}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Enrollment Capacity',
      accessor: (row) => {
        const percentage = Math.round((row.enrolledCount / row.maxSeats) * 100);
        return (
          <div className="space-y-1 w-36">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {row.enrolledCount} / {row.maxSeats}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Elective Courses Catalog" currentPath="#Admin/Electives/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Elective Subject Management</h2>
          <p className="text-xs text-slate-400">Manage elective offerings and student enrollment assignments</p>
        </div>
        <Link href="#Admin/Electives/Enrollment">
          <Button variant="primary">
            <Users className="w-4 h-4 mr-1.5" />
            Manage Student Enrollment
          </Button>
        </Link>
      </div>

      <DataTable
        data={electives}
        columns={columns}
        searchPlaceholder="Search electives by code, title or department..."
        actions={(row) => (
          <Link href="#Admin/Electives/Enrollment">
            <Button variant="ghost" size="sm">
              <span>Enrollments</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        )}
      />
    </AdminLayout>
  );
}
