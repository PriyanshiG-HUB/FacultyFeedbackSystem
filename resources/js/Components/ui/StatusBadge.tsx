import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, className = '' }) => {
  let computedVariant = variant;

  if (!computedVariant) {
    const lower = status.toLowerCase();
    if (['active', 'completed', 'success', 'published', 'reviewed', 'core'].includes(lower)) {
      computedVariant = 'success';
    } else if (['pending', 'on leave', 'processing', 'draft', 'medium', 'elective'].includes(lower)) {
      computedVariant = 'warning';
    } else if (['inactive', 'failed', 'high', 'graduated', 'critical'].includes(lower)) {
      computedVariant = 'danger';
    } else {
      computedVariant = 'info';
    }
  }

  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 font-semibold',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border shadow-2xs ${styles[computedVariant]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          computedVariant === 'success'
            ? 'bg-emerald-500'
            : computedVariant === 'warning'
            ? 'bg-amber-500'
            : computedVariant === 'danger'
            ? 'bg-rose-500'
            : computedVariant === 'info'
            ? 'bg-indigo-500'
            : 'bg-slate-500'
        }`}
      />
      {status}
    </span>
  );
};
