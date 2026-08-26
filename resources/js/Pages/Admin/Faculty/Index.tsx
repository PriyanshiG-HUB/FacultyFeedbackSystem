import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { FacultyIndexProps, FacultyItem, FacultyFeedbackDetails } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Card } from '../../../Components/ui/Card';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { Plus, Mail, Filter, Star, CheckCircle2, BarChart3, PieChart, BookOpen, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

import { getDepartmentName } from '../../../utils/departmentScope';
import { api } from '../../../lib/api';

const PARAMETER_COLORS = ['#0284c7', '#4f46e5', '#059669', '#d97706'];

interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

interface DesignationOption {
  id: number;
  designation_name: string;
}

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: FacultyIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const initialFilter = !isAdministrator && assignedDepartmentCode
    ? getDepartmentName(assignedDepartmentCode)
    : 'all';

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(initialFilter);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [facultyList, setFacultyList] = useState<FacultyItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedDesignationId, setSelectedDesignationId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Synchronize filter when role/assigned department prop changes
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
        if (deptOptions.length > 0 && selectedDeptId === '') {
          setSelectedDeptId(deptOptions[0].id);
        }
      }

      if (Array.isArray(desigRes.data) && desigRes.data.length > 0) {
        setDesignations(desigRes.data);
        if (selectedDesignationId === '') {
          setSelectedDesignationId(desigRes.data[0].id);
        }
      } else {
        // Fallback default designations
        const defaultDesigs = [
          { id: 1, designation_name: 'Professor' },
          { id: 2, designation_name: 'Associate Professor' },
          { id: 3, designation_name: 'Assistant Professor' },
        ];
        setDesignations(defaultDesigs);
        if (selectedDesignationId === '') {
          setSelectedDesignationId(1);
        }
      }

      if (Array.isArray(facRes.data)) {
        const mapped: FacultyItem[] = facRes.data.map((f: any) => ({
          id: f.id,
          name: f.full_name,
          email: f.email,
          department: f.department?.department_name || f.department?.department_code || 'Information Technology',
          designation: f.designation?.designation_name || 'Professor',
          status: f.status === 'INACTIVE' ? 'Inactive' : 'Active',
        }));
        setFacultyList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load faculty directory.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeptId, selectedDesignationId]);

  useEffect(() => {
    fetchFacultyAndMetadata();
  }, [fetchFacultyAndMetadata]);

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setEmployeeCode('');
    setFormError('');
    setFieldErrors({});
    if (departments.length > 0) {
      setSelectedDeptId(departments[0].id);
    }
    if (designations.length > 0) {
      setSelectedDesignationId(designations[0].id);
    }
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
      if (employeeCode.trim()) {
        payload.employee_code = employeeCode.trim();
      }

      await api.post('/faculty', payload);
      await fetchFacultyAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create faculty member.');
      }
    } finally {
      setIsSubmitting(false);
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

  const selectedFaculty = filteredFaculty.find((f) => f.id === selectedFacultyId) || facultyList.find((f) => f.id === selectedFacultyId) || null;

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
    {
      header: 'Action',
      accessor: (row) => {
        const isSelected = row.id === selectedFacultyId;
        return (
          <Button
            size="sm"
            variant={isSelected ? 'primary' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFacultyId(isSelected ? null : row.id);
            }}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        );
      },
    },
  ];

  // Selected Faculty Details Data Fallback
  const details: FacultyFeedbackDetails | null = selectedFaculty
    ? selectedFaculty.feedbackDetails || {
        overallScore: 4.80,
        totalResponses: 120,
        parameterScores: {
          punctuality: 4.80,
          subjectKnowledge: 4.85,
          clarityOfTeaching: 4.75,
          studyMaterial: 4.80,
        },
        scoreDistribution: [
          { rating: '5 Stars', count: 85 },
          { rating: '4 Stars', count: 28 },
          { rating: '3 Stars', count: 5 },
          { rating: '2 Stars', count: 2 },
          { rating: '1 Star', count: 0 },
        ],
      }
    : null;

  const parameterChartData = details
    ? [
        { parameter: 'Punctuality', score: details.parameterScores.punctuality },
        { parameter: 'Knowledge', score: details.parameterScores.subjectKnowledge },
        { parameter: 'Clarity', score: details.parameterScores.clarityOfTeaching },
        { parameter: 'Material', score: details.parameterScores.studyMaterial },
      ]
    : [];

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
              ? 'Complete faculty directory and individual feedback ratings across all departments'
              : `Faculty members and feedback performance for ${getDepartmentName(assignedDepartmentCode)}`}
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
            <span className="px-3 py-1 bg-blue-50 text-blue-800 font-extrabold text-xs rounded-lg border border-blue-200">
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

      {/* Selected Faculty Performance Card */}
      {selectedFaculty && details ? (
        <Card className="mt-6 border-indigo-200 bg-linear-to-b from-white to-slate-50/50 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                {selectedFaculty.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedFaculty.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedFaculty.designation} &bull; {selectedFaculty.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Overall Score</p>
                <div className="flex items-center gap-1.5 text-lg font-black text-slate-900">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <span>{details.overallScore.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Responses</p>
                <p className="text-lg font-black text-indigo-600 font-mono">{details.totalResponses}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
            {/* Chart 1: Parameter-wise Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  Evaluation Parameters
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Avg Score (Max 5.0)</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={parameterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="parameter" stroke="#64748b" fontSize={10} />
                    <YAxis domain={[0, 5]} stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: any) => [`${value} / 5.0`, 'Score']}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {parameterChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PARAMETER_COLORS[index % PARAMETER_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Score Distribution */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-emerald-600" />
                  Rating Distribution
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Student Responses</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={details.scoreDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis dataKey="rating" type="category" stroke="#64748b" fontSize={10} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Responses" fill="#059669" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300/80 rounded-xl p-6 text-center text-slate-500 text-sm mt-6 flex flex-col items-center justify-center gap-2">
          <UserCheck className="w-8 h-8 text-slate-400" />
          <p className="font-medium text-slate-700">Select a faculty member to view feedback details.</p>
          <p className="text-xs text-slate-400">Click any row in the faculty directory table above to display parameter metrics and feedback charts.</p>
        </div>
      )}

      {/* Add Faculty Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Faculty Member">
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
          <Input
            label="Employee Code (Optional)"
            placeholder="e.g. EMP-IT-005"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
            error={fieldErrors.employee_code?.[0]}
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
              {isSubmitting ? 'Saving...' : 'Register Faculty'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
