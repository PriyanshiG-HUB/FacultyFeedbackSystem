import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DivisionsIndexProps, DivisionItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Layers, Plus } from 'lucide-react';

export default function Index({ divisions }: DivisionsIndexProps) {
  const columns: Column<DivisionItem>[] = [
    {
      header: 'Division Name',
      accessor: (row) => <span className="font-semibold text-slate-100">{row.name}</span>,
      sortable: true,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Academic Term',
      accessor: (row) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
          {row.academicYear}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Student Count',
      accessor: (row) => <span>{row.studentCount} Students</span>,
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Academic Divisions" currentPath="#Admin/Divisions/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Divisions & Sections</h2>
          <p className="text-xs text-slate-400">Classroom division groupings for student cohort allocation</p>
        </div>
        <Button variant="primary" onClick={() => alert('Create Division action')}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Division
        </Button>
      </div>

      <DataTable data={divisions} columns={columns} searchPlaceholder="Search division or department..." />
    </AdminLayout>
  );
}
