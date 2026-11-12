'use client'

import { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { useRouter } from 'next/navigation'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export default function UploadBox() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // بررسی خطاهای ابتدایی
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0]
      if (err.code === 'file-too-large') {
        setErrorMsg(`حجم فایل بیشتر از ۵۰ مگابایت است. لطفاً فایل را فشرده کنید.`)
      } else if (err.code === 'file-invalid-type') {
        setErrorMsg('فقط فایل PDF قابل قبول است.')
      } else {
        setErrorMsg('فایل قابل قبول نیست.')
      }
      setStatus('error')
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    setStatus('uploading')
    setProgress(10)
    setErrorMsg('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // شبیه‌سازی پیشرفت آپلود
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 80))
      }, 500)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'خطا در آپلود')
      }

      const data = await res.json()
      router.push(`/processing/${data.catalogId}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'خطا در ارتباط با سرور. مجدداً تلاش کنید.')
    }
  }, [router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: status === 'uploading',
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-brand-500 bg-brand-50 scale-[1.02]'
            : status === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-neutral-300 bg-white hover:border-brand-400 hover:bg-brand-50'
          }
          ${status === 'uploading' ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />

        {status === 'idle' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-neutral-800 mb-2">
              {isDragActive ? 'رها کنید...' : 'فایل PDF را اینجا بکشید یا کلیک کنید'}
            </p>
            <p className="text-sm text-neutral-500">
              بدون نیاز به ثبت‌نام &nbsp;·&nbsp; ۷ روز رایگان &nbsp;·&nbsp; حداکثر ۵۰ مگابایت
            </p>
          </>
        )}

        {status === 'uploading' && (
          <>
            <p className="text-lg font-semibold text-neutral-800 mb-4">در حال آپلود...</p>
            <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-neutral-500">{progress}٪</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-base font-medium text-red-700 mb-2">{errorMsg}</p>
            <p className="text-sm text-neutral-500">کلیک کنید تا دوباره امتحان کنید</p>
          </>
        )}
      </div>
    </div>
  )
}
