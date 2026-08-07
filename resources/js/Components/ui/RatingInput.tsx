import React from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  maxRating = 5,
  disabled = false,
  label,
  description,
}) => {
  return (
    <div className="space-y-2 bg-slate-50/80 border border-slate-200/90 p-4 rounded-xl shadow-2xs">
      {label && (
        <div>
          <h4 className="text-sm font-bold text-slate-900">{label}</h4>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isSelected = starValue <= value;

          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled}
              onClick={() => onChange(starValue)}
              className={`p-2 rounded-lg transition-all transform hover:scale-105 focus:outline-none ${
                isSelected
                  ? 'bg-amber-400 text-amber-950 border border-amber-500 shadow-xs'
                  : 'bg-white text-slate-300 hover:text-amber-400 border border-slate-200 shadow-2xs'
              }`}
            >
              <Star className={`w-5 h-5 ${isSelected ? 'fill-amber-950' : ''}`} />
            </button>
          );
        })}
        <span className="ml-3 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80">
          {value} / {maxRating}
        </span>
      </div>
    </div>
  );
};
