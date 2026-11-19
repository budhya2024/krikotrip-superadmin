import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  aspectRatio?: '16/9' | '4/3' | 'square';
  placeholder?: string;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  aspectRatio = '16/9',
  placeholder = 'Choose Image File or Drag & Drop',
  className = '',
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '4/3'
      ? 'aspect-4/3'
      : 'aspect-16/9';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}

      {value ? (
        <div className={`relative ${aspectClass} rounded-[4px] overflow-hidden border border-slate-200 dark:border-slate-700 group`}>
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-900 rounded-[4px] hover:bg-slate-100 shadow-sm cursor-pointer"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-[4px] hover:bg-rose-700 shadow-sm cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[4px] p-5 cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 hover:border-blue-500 bg-slate-800/40 hover:bg-slate-800/60'
              : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30'
          }`}
        >
          <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-center">
            {placeholder}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            PNG, JPG, WEBP supported
          </span>
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
