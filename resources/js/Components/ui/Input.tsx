import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, className = '', id, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-brand-dark uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-sm text-sm text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-300 focus:border-brand-primary focus:ring-brand-primary/10'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-semibold mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, error, children, className = '', id, ...props }) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-brand-dark uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-sm text-sm text-brand-dark focus:outline-none focus:ring-4 transition-all ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-300 focus:border-brand-primary focus:ring-brand-primary/10'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-600 font-semibold mt-1.5">{error}</p>}
    </div>
  );
};
