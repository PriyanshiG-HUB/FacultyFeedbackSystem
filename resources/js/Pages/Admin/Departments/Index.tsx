import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DepartmentsIndexProps, DepartmentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input } from '../../../Components/ui/Input';
import Link from '../../../Components/shared/Link';
import { useForm } from '../../../Components/shared/useForm';
import { Plus, Edit2 } from 'lucide-react';

export default function Index({ departments }: DepartmentsIndexProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);

  const editForm = useForm({
    name: '',
    code: '',
    hod: '',
  });

  const handleOpenEdit = (dept: DepartmentItem) => {
    setSelectedDept(dept);
    editForm.setData({
      name: dept.name,
      code: dept.code,
      hod: dept.hod,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    editForm.submit('put', `#Admin/Departments/${selectedDept?.id}`, {
      onSuccess: () => setIsEditOpen(false),
    });
  };

  const columns: Column<DepartmentItem>[] = [
    {
      header: 'Dept Code',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-1 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">
          {row.code}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Department Name',
      accessor: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
      sortable: true,
    },
    {
      header: 'Head of Department',
      accessor: 'hod',
      sortable: true,
    },
    {
      header: 'Faculty Count',
      accessor: (row) => <span>{row.facultyCount} Members</span>,
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Department Management" currentPath="#Admin/Departments/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Departments</h2>
          <p className="text-xs text-slate-500">Manage university departments, course allocations, and HODs</p>
        </div>
        <Link href="#Admin/Departments/Create">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Department
          </Button>
        </Link>
      </div>

      <DataTable
        data={departments}
        columns={columns}
        searchPlaceholder="Search departments by name or code..."
        actions={(row) => (
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)}>
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        )}
      />

      {/* Edit Department Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Department Details">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Department Name"
            value={editForm.data.name}
            onChange={(e) => editForm.setData('name', e.target.value)}
            required
          />
          <Input
            label="Department Code"
            value={editForm.data.code}
            onChange={(e) => editForm.setData('code', e.target.value)}
            required
          />
          <Input
            label="Head of Department (HOD)"
            value={editForm.data.hod}
            onChange={(e) => editForm.setData('hod', e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={editForm.processing}>
              {editForm.processing ? 'Saving...' : 'Update Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
