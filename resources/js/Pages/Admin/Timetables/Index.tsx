import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { TimetableEntry } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { useForm } from '../../../Components/shared/useForm';
import { Plus, Edit2, RefreshCw, AlertCircle, Trash2, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { api } from '../../../lib/api';

export default function TimetableIndex({ userRole = 'admin', assignedDepartmentCode = null }: { userRole?: 'admin' | 'hod', assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

  const [timetableList, setTimetableList] = useState<TimetableEntry[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const form = useForm({
    teaching_assignment_id: '',
    day: 'Monday',
    start_time: '',
    end_time: '',
    room: '',
    status: 'ACTIVE'
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [timetableRes, assignmentsRes] = await Promise.all([
        api.get('/timetables' + (assignedDepartmentCode && !isAdministrator ? `?department_code=${assignedDepartmentCode}` : '')),
        api.get('/teaching-assignments')
      ]);
      setTimetableList(timetableRes.data || []);
      setTeachingAssignments(assignmentsRes.data || []);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load timetables.');
    } finally {
      setIsLoading(false);
    }
  }, [assignedDepartmentCode, isAdministrator]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedEntryId(null);
    setFormError('');
    setFieldErrors({});
    form.setData({
      teaching_assignment_id: teachingAssignments[0]?.id?.toString() || '',
      day: 'Monday',
      start_time: '09:00',
      end_time: '10:00',
      room: '',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setIsEditMode(true);
    setSelectedEntryId(entry.id);
    setFormError('');
    setFieldErrors({});
    form.setData({
      teaching_assignment_id: entry.teaching_assignment_id?.toString() || '',
      day: entry.day,
      start_time: entry.start_time.substring(0, 5),
      end_time: entry.end_time.substring(0, 5),
      room: entry.room || '',
      status: entry.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    
    try {
      const payload = {
        teaching_assignment_id: parseInt(form.data.teaching_assignment_id),
        day: form.data.day,
        start_time: form.data.start_time,
        end_time: form.data.end_time,
        room: form.data.room,
        status: form.data.status
      };

      if (isEditMode && selectedEntryId) {
        await api.put(`/timetables/${selectedEntryId}`, payload);
      } else {
        await api.post('/timetables', payload);
      }
      
      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to save timetable entry.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;
    try {
      await api.delete(`/timetables/${id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Cannot delete timetable entry.');
    }
  };

  const columns: Column<TimetableEntry>[] = [
    {
      header: 'Day & Time',
      accessor: (row) => (
        <div>
          <div className="font-bold text-indigo-700">{row.day}</div>
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {row.start_time.substring(0, 5)} - {row.end_time.substring(0, 5)}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Subject & Faculty',
      accessor: (row) => (
        <div>
          <div className="font-bold text-slate-900 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            {row.teaching_assignment?.subject?.subject_name} ({row.teaching_assignment?.subject?.subject_code})
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
            <User className="w-3 h-3 text-slate-400" />
            {row.teaching_assignment?.faculty?.full_name}
          </div>
        </div>
      ),
      sortable: false,
    },
    {
      header: 'Target Group',
      accessor: (row) => (
        <div className="text-xs font-semibold text-slate-700">
          <div>Batch: {row.teaching_assignment?.batch?.batch_title}</div>
          <div>Div: {row.teaching_assignment?.division?.division_code || 'All'} | Sec: {row.teaching_assignment?.section?.section_code || 'All'}</div>
        </div>
      ),
      sortable: false,
    },
    {
      header: 'Room',
      accessor: (row) => (
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
          {row.room ? (
            <>
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {row.room}
            </>
          ) : (
            <span className="text-slate-400 italic">Not Assigned</span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-2 py-1 text-[10px] font-extrabold uppercase rounded border ${row.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
          {row.status}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Timetable Management"
      currentPath="#Admin/Timetables/Index"
      userRole={userRole}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Timetable Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic schedules, avoiding faculty, student, and room conflicts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdministrator && (
            <Button variant="primary" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Entry
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
        data={timetableList}
        columns={columns}
        searchPlaceholder="Search timetables..."
        actions={(row) =>
          isAdministrator && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(row.id)}
                className="text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Timetable Entry' : 'Add Timetable Entry'}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          <Select
            label="Teaching Assignment *"
            value={form.data.teaching_assignment_id}
            onChange={(e) => form.setData('teaching_assignment_id', e.target.value)}
            error={fieldErrors.teaching_assignment_id?.[0] || fieldErrors.faculty?.[0] || fieldErrors.batch?.[0] || fieldErrors.division?.[0] || fieldErrors.section?.[0]}
            required
          >
            <option value="" disabled>Select Assignment</option>
            {teachingAssignments.map((ta) => (
              <option key={ta.id} value={ta.id}>
                {ta.subject?.subject_code} - {ta.faculty?.full_name} ({ta.batch?.batch_title}, {ta.division?.division_code || 'All Div'})
              </option>
            ))}
          </Select>

          <Select
            label="Day of Week *"
            value={form.data.day}
            onChange={(e) => form.setData('day', e.target.value)}
            error={fieldErrors.day?.[0]}
            required
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d}>{d}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time *"
              type="time"
              value={form.data.start_time}
              onChange={(e) => form.setData('start_time', e.target.value)}
              error={fieldErrors.start_time?.[0]}
              required
            />
            <Input
              label="End Time *"
              type="time"
              value={form.data.end_time}
              onChange={(e) => form.setData('end_time', e.target.value)}
              error={fieldErrors.end_time?.[0]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room"
              value={form.data.room}
              onChange={(e) => form.setData('room', e.target.value)}
              error={fieldErrors.room?.[0]}
              placeholder="e.g. Room 101"
            />
            <Select
              label="Status"
              value={form.data.status}
              onChange={(e) => form.setData('status', e.target.value)}
              error={fieldErrors.status?.[0]}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={form.processing}>
              {form.processing ? 'Saving...' : (isEditMode ? 'Update Entry' : 'Save Entry')}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
