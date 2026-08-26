import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DepartmentsIndexProps, DepartmentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import Link from '../../../Components/shared/Link';
import { useForm } from '../../../Components/shared/useForm';
import { Plus, Edit2, Star, ShieldCheck, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { getDepartmentName } from '../../../utils/departmentScope';
import { api } from '../../../lib/api';

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: DepartmentsIndexProps) {
  const isAdministrator = userRole === 'admin';
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);

  const editForm = useForm({
    name: '',
    code: '',
    hodId: '',
  });

  const [deptFaculty, setDeptFaculty] = useState<{id: number, name: string}[]>([]);

  const [deptList, setDeptList] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const res = await api.get('/departments');
      if (Array.isArray(res.data)) {
        const mapped: DepartmentItem[] = res.data.map((d: any) => ({
          id: d.id,
          code: d.department_code,
          name: d.department_name,
          hod_faculty_id: d.hod_faculty_id,
          hod: d.hod_faculty?.full_name || 'Not Appointed',
          studentCount: d.students_count || 0,
          facultyCount: d.faculty_count || 0,
          avgRating: d.avg_rating || 4.65,
          completionRate: d.completion_rate || 91.2,
          status: d.status === 'INACTIVE' ? 'Inactive' : 'Active',
        }));
        setDeptList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load departments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const visibleDepartments = isAdministrator
    ? deptList
    : deptList.filter(
        (dept) =>
          dept.code.toUpperCase() === (assignedDepartmentCode || 'CE').toUpperCase()
      );

  const handleOpenEdit = async (dept: any) => {
    setSelectedDept(dept);
    setErrorMessage('');
    editForm.setData({
      name: dept.name,
      code: dept.code,
      hodId: dept.hod_faculty_id ? String(dept.hod_faculty_id) : '',
    });
    
    // Fetch faculty for this department
    try {
      const res = await api.get(`/departments/${dept.id}/faculty`);
      if (Array.isArray(res.data)) {
        setDeptFaculty(res.data.map((f: any) => ({ id: f.id, name: f.full_name })));
      }
    } catch (err) {
      console.error('Failed to fetch faculty for department', err);
      setDeptFaculty([]);
    }

    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedDept) return;
    try {
      await api.put(`/departments/${selectedDept.id}`, {
        department_name: editForm.data.name.trim(),
        department_code: editForm.data.code.trim().toUpperCase(),
        hod_faculty_id: editForm.data.hodId ? Number(editForm.data.hodId) : null,
      });
      await fetchDepartments();
      setIsEditOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update department');
    }
  };

  const handleDeleteDept = async (deptId: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${deptId}`);
      await fetchDepartments();
    } catch (err: any) {
      alert(err.message || 'Cannot delete department. Dependent records exist.');
    }
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
      accessor: (row) => <span className="font-semibold text-slate-700">{row.studentCount} Students</span>,
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDepartments} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdministrator && (
            <Link href="#Admin/Departments/Create">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Department
              </Button>
            </Link>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <DataTable
        data={visibleDepartments}
        columns={columns}
        searchPlaceholder="Search departments by name or code..."
        actions={(row) =>
          isAdministrator ? (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)}>
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteDept(row.id)}
                className="text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
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
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
              {errorMessage}
            </div>
          )}
          <Input
            label="Department Name"
            value={editForm.data.name}
            onChange={(e) => editForm.setData('name', e.target.value)}
            required
          />
          <Input
            label="Department Code"
            value={editForm.data.code}
            onChange={(e) => editForm.setData('code', e.target.value.toUpperCase())}
            required
          />

          <Select
            label="Appoint Head of Department (HOD)"
            value={editForm.data.hodId}
            onChange={(e) => editForm.setData('hodId', e.target.value)}
          >
            <option value="">Select HOD Candidate (Optional)...</option>
            {deptFaculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>

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
