import React, { useRef, useState } from 'react'
import { AlertCircle, Loader2, RefreshCw, Upload } from 'lucide-react'
import { uploadAdminImage } from '../../api/media'
import { useTheme } from '../../context/ThemeContext'

interface ImageUploadFieldProps {
  label?: string
  value: string
  onChange: (value: string, mediaId?: string) => void
  purpose?: string
  aspectRatio?: '16/9' | '4/3' | 'square'
  placeholder?: string
  className?: string
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  purpose = 'package',
  aspectRatio = '16/9',
  placeholder = 'Choose Image File or Drag & Drop',
  className = '',
}) => {
  const { theme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [lastSelectedFile, setLastSelectedFile] = useState<File | null>(null)

  const processUpload = async (file: File) => {
    setUploadError(null)

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit')
      return
    }

    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      setUploadError('SVG images are not supported. Use PNG, JPG, or WebP.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Selected file is not an image.')
      return
    }

    setLastSelectedFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const result = await uploadAdminImage(file, purpose, (percent) => {
        setUploadProgress(percent)
      })
      onChange(result.url, result.id)
      setLastSelectedFile(null)
    } catch {
      setUploadError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void processUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      void processUpload(file)
    }
  }

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '4/3'
      ? 'aspect-4/3'
      : 'aspect-16/9'

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}

      {value ? (
        <div
          className={`relative ${aspectClass} rounded-[4px] overflow-hidden border border-slate-200 dark:border-slate-700 group`}
        >
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
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[4px] p-5 cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 hover:border-blue-500 bg-slate-800/40 hover:bg-slate-800/60'
              : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Uploading to S3... {uploadProgress}%
              </span>
              <div className="w-36 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-center">
                {placeholder}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, WebP supported (max 10MB)
              </span>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <div className="flex items-center justify-between p-2 rounded-[4px] bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{uploadError}</span>
          </div>
          {lastSelectedFile && (
            <button
              type="button"
              onClick={() => void processUpload(lastSelectedFile)}
              className="flex items-center gap-1 font-semibold underline hover:no-underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
