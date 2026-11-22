import React, { useRef, useState } from 'react'
import axios from 'axios'
import { AlertCircle, Film, Link as LinkIcon, Loader2, X } from 'lucide-react'
import { completeVideoUpload, presignVideoUpload } from '../../api/media'
import { useTheme } from '../../context/ThemeContext'

interface VideoUploadFieldProps {
  label?: string
  value: string
  onChange: (value: string, mediaId?: string) => void
  placeholder?: string
  className?: string
}

export const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Choose video file (MP4/WebM) or paste URL',
  className = '',
}) => {
  const { theme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState(value)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setUploadError(null)

    if (file.size > 200 * 1024 * 1024) {
      setUploadError('Video file exceeds 200MB maximum limit.')
      return
    }

    const validTypes = ['video/mp4', 'video/webm']
    if (!validTypes.includes(file.type)) {
      setUploadError('Only MP4 and WebM video formats are supported.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const presign = await presignVideoUpload(file.type, file.size, 'video')

      await axios.put(presign.uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(pct)
          }
        },
      })

      const completed = await completeVideoUpload(presign.mediaId)
      onChange(completed.url, completed.id)
      setUrlInput(completed.url)
    } catch {
      setUploadError('Video upload failed. Please verify the connection and try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError(null)
    const trimmed = urlInput.trim()
    if (!trimmed.startsWith('https://')) {
      setUploadError('Video URL must be a valid secure HTTPS link.')
      return
    }
    onChange(trimmed)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </label>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-[4px] text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`px-2 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                activeMode === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`px-2 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                activeMode === 'url'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Paste URL
            </button>
          </div>
        </div>
      )}

      {value ? (
        <div className="relative rounded-[4px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 group aspect-video">
          <video src={value} controls className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setUrlInput('')
              }}
              className="p-1.5 rounded-[4px] bg-rose-600 text-white hover:bg-rose-700 text-xs shadow-md cursor-pointer"
              title="Remove video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : activeMode === 'upload' ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (file) {
              void handleFileUpload(file)
            }
          }}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[4px] p-6 cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 hover:border-blue-500 bg-slate-800/40 hover:bg-slate-800/60'
              : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Uploading directly to S3... {uploadProgress}%
              </span>
              <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Film className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-center">
                {placeholder}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                MP4 or WebM (max 200MB direct upload)
              </span>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://domain.com/video.mp4"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 text-xs font-semibold rounded-[4px] bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs"
          >
            Attach URL
          </button>
        </form>
      )}

      {uploadError && (
        <div className="flex items-center gap-1.5 p-2 rounded-[4px] bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            void handleFileUpload(file)
          }
        }}
      />
    </div>
  )
}
