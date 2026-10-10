import React from 'react';
import { Users, Building2, Star, CheckCircle2, TrendingUp, TrendingDown, BookOpen, Clock } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: 'users' | 'building' | 'star' | 'check-circle' | 'book-open' | 'clock' | string;
  className?: string;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon = 'star',
  className = '',
  compact = false,
}) => {
  // Semantic Accent Colors for CHARUSAT theme
  const getPalette = () => {
    const lowerLabel = label.toLowerCase();
    
    // Departments → blue/navy
    if (lowerLabel.includes('department') || icon === 'building') {
      return {
        text: 'text-[#0D1C42]',
        iconText: 'text-[#22396F]',
        iconBg: 'bg-[#22396F]/10',
        border: 'border-slate-200',
        hoverBorder: 'group-hover:border-[#22396F]/30',
      };
    }
    // Faculty → indigo
    if (lowerLabel.includes('facult') || icon === 'users') {
      return {
        text: 'text-[#0D1C42]',
        iconText: 'text-indigo-600',
        iconBg: 'bg-indigo-50',
        border: 'border-slate-200',
        hoverBorder: 'group-hover:border-indigo-200',
      };
    }
    // Students → violet
    if (lowerLabel.includes('student') || icon === 'book-open') {
      return {
        text: 'text-[#0D1C42]',
        iconText: 'text-violet-600',
        iconBg: 'bg-violet-50',
        border: 'border-slate-200',
        hoverBorder: 'group-hover:border-violet-200',
      };
    }
    // Rating → warm gold
    if (lowerLabel.includes('rating') || icon === 'star') {
      return {
        text: 'text-[#0D1C42]',
        iconText: 'text-amber-500',
        iconBg: 'bg-[#FCF1D0]/60',
        border: 'border-slate-200',
        hoverBorder: 'group-hover:border-amber-200',
      };
    }
    // Submissions → teal/green
    if (lowerLabel.includes('submission') || icon === 'check-circle') {
      return {
        text: 'text-[#0D1C42]',
        iconText: 'text-teal-600',
        iconBg: 'bg-teal-50',
        border: 'border-slate-200',
        hoverBorder: 'group-hover:border-teal-200',
      };
    }
    // Default fallback
    return {
      text: 'text-[#0D1C42]',
      iconText: 'text-slate-600',
      iconBg: 'bg-slate-100',
      border: 'border-slate-200',
      hoverBorder: 'group-hover:border-slate-300',
    };
  };

  const getIcon = (className: string) => {
    switch (icon) {
      case 'users':
        return <Users className={className} />;
      case 'building':
        return <Building2 className={className} />;
      case 'star':
        return <Star className={className} />;
      case 'check-circle':
        return <CheckCircle2 className={className} />;
      case 'book-open':
        return <BookOpen className={className} />;
      case 'clock':
        return <Clock className={className} />;
      default:
        return <Star className={className} />;
    }
  };

  const palette = getPalette();

  return (
    <div
      className={`group relative flex flex-col bg-white border ${palette.border} ${palette.hoverBorder} ${compact ? 'rounded-xl p-3' : 'rounded-[14px] p-5'} shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 h-full ${className}`}
    >
      <div className={`flex items-start justify-between gap-2 ${compact ? 'mb-2' : 'mb-4'}`}>
        <h3 className={`${compact ? 'text-[11px]' : 'text-[12px]'} font-semibold uppercase tracking-wider text-slate-500 leading-snug line-clamp-2`}>
          {label}
        </h3>
        <div
          className={`flex items-center justify-center ${compact ? 'w-8 h-8 rounded-md' : 'w-10 h-10 rounded-lg'} shrink-0 ${palette.iconBg} group-hover:scale-105 transition-transform duration-300`}
        >
          {getIcon(`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${palette.iconText}`)}
        </div>
      </div>

      <div className="mb-auto">
        <div className={`${compact ? 'text-[22px] sm:text-[24px]' : 'text-[30px]'} font-extrabold tracking-tight ${palette.text} leading-none`}>
          {value}
        </div>
      </div>

      {change && (
        <div className={`${compact ? 'mt-2' : 'mt-4'} flex items-center gap-1.5`}>
          {icon === 'check-circle' && label.toLowerCase().includes('critical') && isPositive ? (
            <div className="flex items-center justify-center rounded-full p-0.5 bg-emerald-100/60 text-emerald-700">
               <TrendingDown className="w-3 h-3" />
            </div>
          ) : (
            <div
              className={`flex items-center justify-center rounded-full p-0.5 ${
                isPositive ? 'bg-emerald-100/60 text-emerald-700' : 'bg-rose-100/60 text-rose-700'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
            </div>
          )}
          <span className={`${compact ? 'text-[10px]' : 'text-[12px]'} font-medium text-slate-500 leading-tight truncate`}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
};
