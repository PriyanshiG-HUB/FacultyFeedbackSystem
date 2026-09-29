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
        return <Users className="w-5 h-5 text-indigo-600 shrink-0" />;
      case 'building':
        return <Building2 className="w-5 h-5 text-purple-600 shrink-0" />;
      case 'star':
        return <Star className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />;
      case 'check-circle':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'book-open':
        return <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-amber-600 shrink-0" />;
      default:
        return <Star className="w-5 h-5 text-indigo-600 shrink-0" />;
    }
  };

  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full ${className}`}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 truncate" title={label}>
            {label}
          </span>
          <div className="p-2.5 bg-indigo-50/50 border border-indigo-100/50 rounded-xl group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300 shrink-0">
            {getIcon()}
          </div>
        </div>
        <div className="mt-5 flex items-baseline justify-between flex-wrap gap-2">
          <h4 className="text-3xl font-black text-indigo-950 tracking-tight whitespace-nowrap">
            {value}
          </h4>
          {change && (
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-600 shrink-0" />
              )}
              <span className="whitespace-nowrap">{change}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

