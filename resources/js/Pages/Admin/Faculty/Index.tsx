import { isAdministratorRole } from '../../../utils/permissions';
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { FacultyItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { Plus, Mail, Filter, RefreshCw, AlertCircle, Trash2, Edit2 } from 'lucide-react';

import { getDepartmentName } from '../../../utils/departmentScope';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

interface DesignationOption {
  id: number;
  designation_name: string;
}

export default function Index() {
  const { user } = useAuth();
  const isAdministrator = isAdministratorRole(user?.role);
  const assignedDepartmentCode = user?.role === 'HOD' ? user?.hod_department_code : null;

  const initialFilter = !isAdministrator && assignedDepartmentCode
    ? getDepartmentName(assignedDepartmentCode)
    : 'all';

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(initialFilter);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [facultyList, setFacultyList] = useState<FacultyItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedDesignationId, setSelectedDesignationId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isAdministrator && assignedDepartmentCode) {
      setSelectedDeptFilter(getDepartmentName(assignedDepartmentCode));
    }
  }, [isAdministrator, assignedDepartmentCode]);

  const fetchFacultyAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [facRes, deptsRes, desigRes] = await Promise.all([
        api.get('/faculty'),
        api.get('/departments'),
        api.get('/designations').catch(() => ({ data: [] })),
      ]);

      if (Array.isArray(deptsRes.data)) {
        const deptOptions: DepartmentOption[] = deptsRes.data.map((d: any) => ({
          id: d.id,
          code: d.department_code,
          name: d.department_name,
        }));
        setDepartments(deptOptions);
      }

      if (Array.isArray(desigRes.data) && desigRes.data.length > 0) {
        setDesignations(desigRes.data);
      } else {
        setDesignations([
          { id: 1, designation_name: 'Professor' },
          { id: 2, designation_name: 'Associate Professor' },
          { id: 3, designation_name: 'Assistant Professor' },
        ]);
      }

      if (Array.isArray(facRes.data)) {
        const mapped: FacultyItem[] = facRes.data.map((f: any) => ({
          id: f.id,
          name: f.full_name,
          email: f.email,
          department: f.department?.department_name || f.department?.department_code || 'Department Scope',
          department_id: f.department_id,
          designation: f.designation?.designation_name || 'Professor',
          designation_id: f.designation_id,
          status: f.status === 'INACTIVE' ? 'Inactive' : 'Active',
        }));
        setFacultyList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load faculty directory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacultyAndMetadata();
  }, [fetchFacultyAndMetadata]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setFormError('');
    setFieldErrors({});
    if (departments.length > 0) setSelectedDeptId(departments[0].id);
    if (designations.length > 0) setSelectedDesignationId(designations[0].id);
    setIsModalOpen(true);
  };

  const handleEditClick = (faculty: any) => {
    setEditingId(faculty.id);
    setName(faculty.name);
    setEmail(faculty.email);
    setSelectedDeptId(faculty.department_id || departments[0]?.id || '');
    setSelectedDesignationId(faculty.designation_id || designations[0]?.id || '');
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload: any = {
        full_name: name.trim(),
        email: email.trim(),
        department_id: Number(selectedDeptId),
        designation_id: Number(selectedDesignationId),
        status: 'ACTIVE',
      };

      if (editingId) {
        await api.put(`/faculty/${editingId}`, payload);
      } else {
        await api.post('/faculty', payload);
      }
      
      await fetchFacultyAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || (editingId ? 'Failed to update faculty member.' : 'Failed to create faculty member.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (facultyId: number, facultyName: string) => {
    if (!confirm(`Are you sure you want to delete faculty member "${facultyName}"?`)) return;
    try {
      await api.delete(`/faculty/${facultyId}`);
      await fetchFacultyAndMetadata();
    } catch (err: any) {
      if (err.status === 409) {
        if (confirm(`Faculty member "${facultyName}" has active teaching assignments or dependencies.\n\nDo you want to permanently delete this faculty member AND all associated assignments?`)) {
          try {
            await api.delete(`/faculty/${facultyId}?cascade=true`);
            await fetchFacultyAndMetadata();
          } catch (cascadeErr: any) {
            alert(cascadeErr.message || 'Failed to delete faculty member.');
          }
        }
      } else {
        alert(err.message || 'Cannot delete faculty member.');
      }
    }
  };

  const filteredFaculty = facultyList.filter((f) => {
    if (!isAdministrator && assignedDepartmentCode) {
      const targetDeptName = getDepartmentName(assignedDepartmentCode).toLowerCase();
      return f.department.toLowerCase().includes(targetDeptName) || targetDeptName.includes(f.department.toLowerCase());
    }
    if (selectedDeptFilter === 'all') return true;
    return f.department.toLowerCase() === selectedDeptFilter.toLowerCase();
  });

  const columns: Column<FacultyItem>[] = [
    {
      header: 'Faculty Name',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-brand-navy font-bold text-xs">
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
    {
      header: 'Action',
      accessor: (row) => {
        return (
          <div className="flex items-center gap-1.5">
            {isAdministrator && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(row);
                  }}
                  className="p-1.5"
                  title="Edit Faculty"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFaculty(row.id, row.name);
                  }}
                  className="text-rose-600 hover:bg-rose-50 border-rose-200 p-1.5"
                  title="Delete Faculty"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout
      title="Faculty Directory"
      currentPath="#Admin/Faculty/Index"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900">Faculty Members</h2>
          <p className="text-xs text-slate-500">
            {isAdministrator
              ? 'Complete faculty directory across all departments'
              : `Faculty members for ${getDepartmentName(assignedDepartmentCode)}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdministrator ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="px-3 py-1 bg-brand-50 text-blue-800 font-extrabold text-xs rounded-lg border border-blue-200">
              Scope: {getDepartmentName(assignedDepartmentCode)} Only
            </span>
          )}

          <Button variant="outline" size="sm" onClick={fetchFacultyAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdministrator && (
            <Button variant="primary" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Faculty
            </Button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <DataTable data={filteredFaculty} columns={columns} searchPlaceholder="Search faculty by name, email, or department..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Faculty Member" : "Register Faculty Member"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Dr. Robert Vance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.full_name?.[0]}
            required
          />
          <Input
            label="Institutional Email"
            type="email"
            placeholder="r.vance@univ.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email?.[0]}
            required
          />
          <Select
            label="Department Assignment"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(Number(e.target.value))}
            error={fieldErrors.department_id?.[0]}
            required
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </Select>
          <Select
            label="Designation"
            value={selectedDesignationId}
            onChange={(e) => setSelectedDesignationId(Number(e.target.value))}
            error={fieldErrors.designation_id?.[0]}
            required
          >
            {designations.map((desig) => (
              <option key={desig.id} value={desig.id}>
                {desig.designation_name}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Faculty' : 'Register Faculty')}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

