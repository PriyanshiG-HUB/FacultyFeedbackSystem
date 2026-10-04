import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './Input';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
  actions?: (row: T) => React.ReactNode;
  headerAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  selectedRowKey?: (row: T) => boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  onSearchChange,
  actions,
  headerAction,
  onRowClick,
  selectedRowKey,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearchChange) onSearchChange(val);
    setCurrentPage(1);
  };

  // Filter
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some(
      (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(String(bVal))
        : String(bVal).localeCompare(aVal);
    }
    return sortDirection === 'asc' ? (aVal < bVal ? -1 : 1) : aVal > bVal ? -1 : 1;
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (colKey: keyof T | undefined) => {
    if (!colKey) return;
    if (sortColumn === colKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b-2 border-slate-200 text-xs font-bold text-brand-dark uppercase tracking-wider">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-5 py-4 ${col.className || ''} ${
                      col.sortable ? 'cursor-pointer select-none hover:text-brand-primary transition-colors' : ''
                    }`}
                    onClick={() =>
                      col.sortable && typeof col.accessor === 'string'
                        ? handleSort(col.accessor as keyof T)
                        : null
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.header}</span>
                      {col.sortable && sortColumn === col.accessor && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-brand-primary" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-brand-primary" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="px-5 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => {
                  const isSelected = selectedRowKey ? selectedRowKey(row) : false;
                  return (
                     <tr
                      key={rowIdx}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50'
                      } ${
                        isSelected
                          ? 'bg-brand-50/50 border-l-4 border-l-brand-primary font-medium'
                          : ''
                      }`}
                    >
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className={`px-5 py-3.5 ${col.className || ''}`}>
                          {typeof col.accessor === 'function'
                            ? col.accessor(row)
                            : String(row[col.accessor] ?? '')}
                        </td>
                      ))}
                      {actions && <td className="px-5 py-3.5 text-right">{actions(row)}</td>}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-5 py-12 text-center text-slate-400 bg-slate-50/30"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-6 h-6 text-slate-300" />
                      <span>No matching records found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-brand-dark">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-brand-dark">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-bold text-brand-dark">{sortedData.length}</span> results
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-white border border-slate-200 hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700 text-slate-700 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-brand-dark">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-white border border-slate-200 hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700 text-slate-700 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
