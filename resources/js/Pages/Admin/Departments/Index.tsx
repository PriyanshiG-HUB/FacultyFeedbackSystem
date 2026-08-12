import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DepartmentsIndexProps, DepartmentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input } from '../../../Components/ui/Input';
import Link from '../../../Components/shared/Link';
import { useForm } from '../../../Components/shared/useForm';
import { Plus, Edit2, Star, ShieldCheck, Eye } from 'lucide-react';
import { getDepartmentName } from '../../../utils/departmentScope';

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
  departments,
}: DepartmentsIndexProps) {
  const isAdministrator = userRole === 'admin';
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);

  const editForm = useForm({
    name: '',
    code: '',
    hod: '',
  });

  // Filter departments for HOD view
  const visibleDepartments = isAdministrator
    ? departments
    : departments.filter(
        (dept) =>
          dept.code.toUpperCase() === (assignedDepartmentCode || 'CE').toUpperCase()
      );

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
        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700">
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
      header: 'Head of Department (HOD)',
      accessor: (row) => <span className="font-semibold text-slate-800">{row.hod}</span>,
      sortable: true,
    },
    {
      header: 'Students',
      accessor: (row) => <span className="font-semibold text-slate-700">{row.studentCount || 120} Students</span>,
      sortable: true,
    },
    {
      header: 'Faculty',
      accessor: (row) => <span className="font-semibold text-slate-700">{row.facultyCount} Members</span>,
      sortable: true,
    },
    {
      header: 'Avg Rating',
      accessor: (row) => (
        <div className="flex items-center gap-1 font-bold text-amber-700 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{(row.avgRating || 4.5).toFixed(2)}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Completion Rate',
      accessor: (row) => (
        <span className="font-extrabold text-emerald-600 text-xs">
          {row.completionRate || 89.0}%
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Academic Departments"
      currentPath="#Admin/Departments/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      {/* Header Banner & Role Scope Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Academic Departments</h2>
            {!isAdministrator && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Assigned Department Scope
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdministrator
              ? 'Administrator Overview: Managing all university academic departments and HOD allocations'
              : `HOD Scope: Viewing record data for ${getDepartmentName(assignedDepartmentCode)} (${assignedDepartmentCode})`}
          </p>
        </div>

        {isAdministrator && (
          <Link href="#Admin/Departments/Create">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Department
            </Button>
          </Link>
        )}
      </div>

      <DataTable
        data={visibleDepartments}
        columns={columns}
        searchPlaceholder="Search departments by name or code..."
        actions={(row) =>
          isAdministrator ? (
            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)}>
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
          ) : (
            <span className="text-xs font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded">
              Assigned Scope
            </span>
          )
        }
      />

      {/* Edit Department Modal (Admin Only) */}
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
