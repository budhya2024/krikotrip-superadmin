import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface DropdownFilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

interface DropdownFilterProps {
  label: string;
  value: string;
  options: DropdownFilterOption[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

export const DropdownFilter: React.FC<DropdownFilterProps> = ({
  label,
  value,
  options,
  onChange,
  icon,
  className = '',
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-[4px] border text-xs font-semibold transition-all cursor-pointer select-none ${value !== 'All' && value !== ''
            ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-600'
            : theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-blue-600 dark:text-blue-400 shrink-0">
          {icon || selectedOption?.icon}
        </span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">{label}:</span>
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
          {selectedOption?.label || value}
        </span>
        {selectedOption?.badge !== undefined && (
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-[4px] font-semibold ${selectedOption.badgeColor ||
              'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}
          >
            {selectedOption.badge}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 min-w-[210px] w-max max-w-[280px] rounded-[4px] border py-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 ${theme === 'dark'
              ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-slate-950/80'
              : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/80'
            }`}
        >
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
            <span>Filter by {label}</span>
            <span className="text-[10px] font-normal text-slate-400">{options.length} options</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-xs font-medium cursor-pointer transition-colors ${isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : theme === 'dark'
                        ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-white' : ''}`}>
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {opt.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-[4px] font-semibold ${isSelected
                            ? 'bg-white/20 text-white'
                            : opt.badgeColor ||
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
