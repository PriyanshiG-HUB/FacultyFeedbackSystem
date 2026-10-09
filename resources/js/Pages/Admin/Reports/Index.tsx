import { isAdministratorRole } from '../../../utils/permissions';
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ReportsIndexProps, ReportItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { FileText, Download, Send, Plus, RefreshCw, AlertCircle, Filter } from 'lucide-react';
import { getDepartmentName } from '../../../utils/departmentScope';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function Index() {
  const { user } = useAuth();
  const isAdministrator = isAdministratorRole(user?.role);
  
  const effectiveDeptCode = user?.hod_department_code || user?.faculty?.department?.department_code || null;
  const currentDeptName = user?.faculty?.department?.department_name || getDepartmentName(effectiveDeptCode) || 'Department Scope';

  const initialDeptFilter = !isAdministrator && effectiveDeptCode ? effectiveDeptCode.toUpperCase() : 'ALL';
  const [deptFilter, setDeptFilter] = useState<string>(initialDeptFilter);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [title, setTitle] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('');
  const [term, setTerm] = useState<'ODD' | 'EVEN'>('ODD');
  const [sampleSize, setSampleSize] = useState<string>('50');

  const fetchReportsAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [reportsRes, deptsRes, ayRes] = await Promise.all([
        api.get('/reports'),
        api.get('/departments'),
        api.get('/academic-years'),
      ]);

      if (Array.isArray(deptsRes.data)) setDepartments(deptsRes.data);
      if (Array.isArray(ayRes.data)) setAcademicYears(ayRes.data);

      if (Array.isArray(reportsRes.data)) {
        const mapped: ReportItem[] = reportsRes.data.map((r: any) => ({
          id: r.id,
          title: r.title,
          academicYear: r.academic_year?.year_code || '2025-26',
          term: r.term || 'ODD',
          department: r.department?.department_name || 'All Departments',
          departmentCode: r.department?.department_code || 'ALL',
          generatedAt: r.generated_at ? new Date(r.generated_at).toLocaleDateString() : 'Recent',
          totalResponses: r.sample_size || 0,
          status: r.is_published || r.status === 'PUBLISHED' ? 'Published' : 'Draft',
        }));
        setReports(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportsAndMetadata();
  }, [fetchReportsAndMetadata]);

  const handleOpenAddModal = () => {
    setFormError('');
    setTitle('Faculty Performance Comprehensive Evaluation Report');
    setSelectedDeptId(departments[0]?.id || '');
    setSelectedAcademicYearId(academicYears[0]?.id || '');
    setTerm('ODD');
    setSampleSize('120');
    setIsModalOpen(true);
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload: any = {
        title: title.trim(),
        academic_year_id: Number(selectedAcademicYearId),
        term,
        sample_size: parseInt(sampleSize, 10) || 50,
        is_published: true,
        status: 'PUBLISHED',
      };
      if (selectedDeptId !== '') {
        payload.department_id = Number(selectedDeptId);
      }

      await api.post('/reports', payload);
      await fetchReportsAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to generate report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePublish = async (row: ReportItem) => {
    try {
      const newStatus = row.status === 'Published' ? 'DRAFT' : 'PUBLISHED';
      const isPub = newStatus === 'PUBLISHED';
      await api.put(`/reports/${row.id}`, { status: newStatus, is_published: isPub });
      await fetchReportsAndMetadata();
    } catch (err: any) {
      alert(err.message || 'Failed to update report status.');
    }
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const handleDownload = async (row: ReportItem) => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const res = await api.get('/admin/dashboard?department_code=' + (row.departmentCode || 'ALL'));
      
      // Load html2pdf dynamically
      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      let facultyPerformance = res?.faculty_performance || [];
      // Sort highest to lowest
      facultyPerformance.sort((a: any, b: any) => b.avg_rating - a.avg_rating);
      
      setPrintData({
        title: row.title,
        department: row.department,
        academicYear: row.academicYear,
        term: row.term,
        faculty_performance: facultyPerformance
      });
      
      // Wait for React to render the printable area
      setTimeout(() => {
        const element = document.getElementById('department-report-printable-area');
        if (element) {
          const opt = {
            margin: 10,
            filename: `${row.department.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          (window as any).html2pdf().set(opt).from(element).save().then(() => {
             setIsDownloadingPdf(false);
             setPrintData(null);
          });
        } else {
             setIsDownloadingPdf(false);
        }
      }, 500);

    } catch (err) {
      alert("Failed to generate PDF");
      setIsDownloadingPdf(false);
      setPrintData(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    const rDeptCode = (r.departmentCode || '').toUpperCase();
    if (!isAdministrator && effectiveDeptCode) {
      if (rDeptCode !== 'ALL' && rDeptCode !== effectiveDeptCode.toUpperCase()) return false;
    }
    if (isAdministrator && deptFilter !== 'ALL') {
      if (rDeptCode !== 'ALL' && rDeptCode !== deptFilter.toUpperCase()) return false;
    }
    return true;
  });

  const columns: Column<ReportItem>[] = [
    {
      header: 'Report Title',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-brand-primary shrink-0" />
          <div>
            <p className="font-bold text-slate-900">{row.title}</p>
            <p className="text-[11px] text-slate-500">Generated on {row.generatedAt}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Department',
      accessor: (row) => <span className="text-slate-800 font-medium">{row.department}</span>,
      sortable: true,
    },
    {
      header: 'Academic Term',
      accessor: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{row.academicYear}</p>
          <p className="text-slate-500">{row.term} Term</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Sample Size',
      accessor: (row) => <span className="font-semibold text-slate-700">{row.totalResponses} Responses</span>,
      sortable: true,
    },
    {
      header: 'Publication Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Department Evaluation Reports"
      currentPath="#Admin/Reports/Index"
      userRoleType={isAdministrator ? 'admin' : 'hod'}
      departmentScope={isAdministrator ? 'All Departments' : currentDeptName}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900">Evaluation & Accreditation Reports</h2>
          <p className="text-xs text-slate-500">
            Official department evaluation reports ready for publication and faculty download
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdministrator ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.department_code}>
                    {d.department_name} ({d.department_code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="px-3 py-1 bg-brand-50 text-blue-800 font-extrabold text-xs rounded-lg border border-blue-200">
              Scope: {currentDeptName} Only
            </span>
          )}

          <Button variant="outline" size="sm" onClick={fetchReportsAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdministrator && (
            <Button variant="primary" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Generate New Report
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

      <DataTable
        data={filteredReports}
        columns={columns}
        searchPlaceholder="Search reports by title or term..."
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant={row.status === 'Published' ? 'outline' : 'secondary'}
              size="sm"
              onClick={() => togglePublish(row)}
            >
              {row.status === 'Published' ? 'Unpublish' : 'Publish Report'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleDownload(row)} disabled={isDownloadingPdf}>
              {isDownloadingPdf ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />}
              {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </div>
        )}
      />

      {/* Generate Report Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Department Evaluation Report">
        <form onSubmit={handleCreateReport} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Report Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department (Optional)"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Institution-wide (All Departments)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name} ({d.department_code})
                </option>
              ))}
            </Select>

            <Select
              label="Academic Year *"
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(Number(e.target.value))}
              required
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.year_code}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Term"
              value={term}
              onChange={(e) => setTerm(e.target.value as 'ODD' | 'EVEN')}
            >
              <option value="ODD">ODD Term</option>
              <option value="EVEN">EVEN Term</option>
            </Select>

            <Input
              label="Sample Response Count"
              type="number"
              value={sampleSize}
              onChange={(e) => setSampleSize(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Generate & Save Report'}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Hidden Printable Area */}
      {printData && (
        <div style={{ display: 'none' }}>
          <div id="department-report-printable-area" style={{ padding: '20px', fontFamily: 'sans-serif', color: '#000', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
              <img src="/charusat_logo.png" alt="CHARUSAT" style={{ height: '60px', objectFit: 'contain' }} />
              <h1 style={{ fontSize: '24px', margin: '15px 0 5px' }}>{printData.title}</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{printData.department} • Academic Year {printData.academicYear} ({printData.term} Term)</p>
            </div>
            
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>Faculty Performance Leaderboard</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: '12px 10px', border: '1px solid #ddd' }}>Rank</th>
                  <th style={{ padding: '12px 10px', border: '1px solid #ddd' }}>Faculty Member</th>
                  <th style={{ padding: '12px 10px', border: '1px solid #ddd', textAlign: 'center' }}>Total Responses</th>
                  <th style={{ padding: '12px 10px', border: '1px solid #ddd', textAlign: 'center' }}>Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {printData.faculty_performance.map((fac: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>#{idx + 1}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{fac.faculty_name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{fac.total_responses}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: fac.avg_rating >= 4 ? '#059669' : fac.avg_rating >= 3 ? '#d97706' : '#dc2626' }}>{fac.avg_rating}/5.0</td>
                  </tr>
                ))}
                {printData.faculty_performance.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', color: '#666' }}>No faculty data available for this department.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div style={{ marginTop: '40px', fontSize: '10px', color: '#999', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              Generated on {new Date().toLocaleDateString()} • Faculty Feedback Management System
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
