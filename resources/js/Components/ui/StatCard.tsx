import React from 'react';
import { Users, Building2, Star, CheckCircle2, TrendingUp, TrendingDown, BookOpen, Clock } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: 'users' | 'building' | 'star' | 'check-circle' | 'book-open' | 'clock' | string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon = 'star',
  className = '',
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="w-5 h-5 text-brand-primary shrink-0" />;
      case 'building':
        return <Building2 className="w-5 h-5 text-brand-navy shrink-0" />;
      case 'star':
        return <Star className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />;
      case 'check-circle':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'book-open':
        return <BookOpen className="w-5 h-5 text-brand-primary shrink-0" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-slate-500 shrink-0" />;
      default:
        return <Star className="w-5 h-5 text-brand-primary shrink-0" />;
    }
  };

  const getStyleByIcon = () => {
    switch (icon) {
      case 'users':
        return 'border-l-4 border-l-brand-primary bg-white';
      case 'building':
        return 'border-t-4 border-t-brand-navy bg-white';
      case 'star':
        return 'bg-brand-accent/30 border-l-4 border-l-amber-400';
      case 'check-circle':
        return 'bg-emerald-50/50 border-l-4 border-l-emerald-500';
      default:
        return 'border-l-4 border-l-brand-primary bg-white';
    }
  };

  const getIconBg = () => {
    switch (icon) {
      case 'users':
        return 'bg-brand-50 border-brand-primary/20';
      case 'building':
        return 'bg-brand-navy/5 border-brand-navy/20';
      case 'star':
        return 'bg-amber-100 border-amber-200';
      case 'check-circle':
        return 'bg-emerald-100 border-emerald-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className={`${getStyleByIcon()} border-y border-r border-slate-200/60 rounded-sm p-6 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between h-full ${className}`}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600 truncate" title={label}>
            {label}
          </span>
          <div className={`p-2.5 rounded-lg border ${getIconBg()} group-hover:scale-105 transition-all duration-300 shrink-0`}>
            {getIcon()}
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
          <h4 className="text-3xl font-heading font-extrabold text-brand-dark tracking-tight whitespace-nowrap">
            {value}
          </h4>
          {change && (
            <span
              className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-sm shrink-0 ${
                isPositive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-rose-600 shrink-0" />
              )}
              <span className="whitespace-nowrap uppercase tracking-wider">{change}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
