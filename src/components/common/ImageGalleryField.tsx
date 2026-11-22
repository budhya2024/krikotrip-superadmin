import React, { useRef, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react'
import { uploadAdminImage } from '../../api/media'
import { useTheme } from '../../context/ThemeContext'

interface ImageGalleryFieldProps {
  label?: string
  images: string[]
  onChange: (images: string[]) => void
  purpose?: string
  maxImages?: number
  className?: string
}

export const ImageGalleryField: React.FC<ImageGalleryFieldProps> = ({
  label,
  images,
  onChange,
  purpose = 'package',
  maxImages = 20,
  className = '',
}) => {
  const { theme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFilesUpload = async (files: FileList | File[]) => {
    setUploadError(null)
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    if (images.length + fileArray.length > maxImages) {
      setUploadError(`Maximum of ${maxImages} images allowed in gallery.`)
      return
    }

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of fileArray) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB limit.`)
        }
        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
          throw new Error(`SVG images are not supported.`)
        }
        const res = await uploadAdminImage(file, purpose)
        uploadedUrls.push(res.url)
      }
      onChange([...images, ...uploadedUrls])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload images.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return
    const updated = [...images]
    const temp = updated[index]
    const targetVal = updated[targetIndex]
    if (temp !== undefined && targetVal !== undefined) {
      updated[index] = targetVal
      updated[targetIndex] = temp
      onChange(updated)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label} ({images.length}/{maxImages})
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="group relative aspect-4/3 rounded-[4px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
          >
            <img src={url} alt={`Gallery item ${idx + 1}`} className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 rounded-[3px] bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'left')}
                  className="p-1 rounded-[3px] bg-white/90 text-slate-900 disabled:opacity-30 hover:bg-white cursor-pointer shadow-xs"
                  title="Move left"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[10px] font-bold text-white px-1 py-0.5 rounded bg-black/40">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, 'right')}
                  className="p-1 rounded-[3px] bg-white/90 text-slate-900 disabled:opacity-30 hover:bg-white cursor-pointer shadow-xs"
                  title="Move right"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-4/3 rounded-[4px] border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-700 hover:border-blue-500 bg-slate-800/30 hover:bg-slate-800/60'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30'
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Add Photos
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-1.5 p-2 rounded-[4px] bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            void handleFilesUpload(e.target.files)
          }
        }}
      />
    </div>
  )
}
