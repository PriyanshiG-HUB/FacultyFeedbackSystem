import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { FacultyIndexProps, FacultyItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { useForm } from '../../../Components/shared/useForm';
import { Plus, Mail, Filter } from 'lucide-react';

import { getDepartmentName, filterItemsByDepartment } from '../../../utils/departmentScope';

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
  faculty,
  departments,
}: FacultyIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const initialFilter = !isAdministrator && assignedDepartmentCode
    ? getDepartmentName(assignedDepartmentCode)
    : 'all';

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(initialFilter);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Synchronize filter when role/assigned department prop changes
  React.useEffect(() => {
    if (!isAdministrator && assignedDepartmentCode) {
      setSelectedDeptFilter(getDepartmentName(assignedDepartmentCode));
    }
  }, [isAdministrator, assignedDepartmentCode]);

  const form = useForm({
    name: '',
    email: '',
    department: departments[0]?.name || '',
    designation: 'Assistant Professor',
  });

  const filteredFaculty = faculty.filter((f) => {
    if (!isAdministrator && assignedDepartmentCode) {
      const targetDeptName = getDepartmentName(assignedDepartmentCode).toLowerCase();
      return f.department.toLowerCase().includes(targetDeptName) || targetDeptName.includes(f.department.toLowerCase());
    }
    if (selectedDeptFilter === 'all') return true;
    return f.department.toLowerCase() === selectedDeptFilter.toLowerCase();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit('post', '#Admin/Faculty/Index', {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const columns: Column<FacultyItem>[] = [
    {
      header: 'Faculty Name',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-[11px] text-slate-500 font-medium">{row.designation}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Email Address',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.email}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Faculty Directory"
      currentPath="#Admin/Faculty/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty Members</h2>
          <p className="text-xs text-slate-500">
            {isAdministrator
              ? 'View and manage teaching staff across all academic departments'
              : `View faculty members assigned to ${getDepartmentName(assignedDepartmentCode)}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Department Filter for Admin vs Scope Indicator for HOD */}
          {isAdministrator ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="px-3 py-1 bg-blue-50 text-blue-800 font-extrabold text-xs rounded-lg border border-blue-200">
              Scope: {getDepartmentName(assignedDepartmentCode)} Only
            </span>
          )}

          {isAdministrator && (
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Register Faculty
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={filteredFaculty}
        columns={columns}
        searchPlaceholder="Search faculty by name, email or department..."
      />

      {/* Add Faculty Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Faculty Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Robert Vance"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            required
          />
          <Input
            label="Institutional Email"
            type="email"
            placeholder="r.vance@univ.edu"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
            required
          />
          <Select
            label="Department Assignment"
            value={form.data.department}
            onChange={(e) => form.setData('department', e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </Select>
          <Select
            label="Designation"
            value={form.data.designation}
            onChange={(e) => form.setData('designation', e.target.value)}
          >
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Lecturer">Lecturer</option>
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={form.processing}>
              {form.processing ? 'Saving...' : 'Register Faculty'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
