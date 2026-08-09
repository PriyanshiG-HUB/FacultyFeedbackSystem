import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { CriticalCommentsIndexProps, CriticalCommentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { AlertTriangle, Star, CheckCircle, Clock } from 'lucide-react';

export default function Index({ departmentName = 'Computer Engineering', comments: initialComments }: CriticalCommentsIndexProps) {
  const [comments, setComments] = useState(initialComments);

  const toggleStatus = (id: number) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'Reviewed' ? 'Pending' : 'Reviewed' } : c
      )
    );
  };

  const columns: Column<CriticalCommentItem>[] = [
    {
      header: 'Severity',
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
            row.severity === 'High'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          {row.severity} Severity
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Faculty & Course',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.facultyName}</p>
          <p className="text-xs text-slate-500">{row.subjectName}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Rating Score',
      accessor: (row) => (
        <div className="flex items-center gap-1 font-bold text-rose-700 text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          <Star className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
          <span>{row.rating}.0 / 5.0</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Student Comment Text',
      accessor: (row) => <span className="text-slate-700 italic text-xs font-medium">"{row.comment}"</span>,
    },
    {
      header: 'Review Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Critical Feedback Moderation" currentPath="#Admin/CriticalComments/Index">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">
          HOD Portal &bull; {departmentName}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{departmentName} — Flagged Critical Feedback</h2>
        <p className="text-xs text-slate-500">Actionable student concerns and low-rating feedback moderation queue for {departmentName}</p>
      </div>

      <DataTable
        data={comments}
        columns={columns}
        searchPlaceholder="Search flagged comments by faculty or text..."
        actions={(row) => (
          <Button
            variant={row.status === 'Reviewed' ? 'outline' : 'primary'}
            size="sm"
            onClick={() => toggleStatus(row.id)}
          >
            {row.status === 'Reviewed' ? (
              <>
                <Clock className="w-3.5 h-3.5 mr-1" />
                Mark Pending
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Mark Reviewed
              </>
            )}
          </Button>
        )}
      />
    </AdminLayout>
  );
}

