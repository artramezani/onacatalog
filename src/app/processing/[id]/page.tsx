'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function ProcessingContent() {
  const params = useParams()
  const router = useRouter()
  const catalogId = params.id as string

  const [status, setStatus] = useState<string>('processing')
  const [pageCount, setPageCount] = useState(0)

  useEffect(() => {
    if (!catalogId) return

    // بررسی وضعیت هر ۲ ثانیه
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('catalogs')
        .select('status, page_count, slug')
        .eq('id', catalogId)
        .single()

      if (!data) return

      setStatus(data.status)
      setPageCount(data.page_count)

      if (data.status === 'active') {
        clearInterval(interval)
        router.push(`/view/${data.slug}`)
      } else if (data.status === 'error') {
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [catalogId, router])

  const steps = [
    { label: 'آپلود فایل', done: true },
    { label: 'تبدیل صفحات', done: status === 'active', active: status === 'processing' },
    { label: 'ساخت لینک', done: status === 'active' },
  ]

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-10 max-w-md w-full text-center">
        {status === 'error' ? (
          <>
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-xl font-bold text-red-600 mb-2">خطا در پردازش</h1>
            <p className="text-neutral-500 mb-6 text-sm">مشکلی در تبدیل فایل پیش آمد.</p>
            <Link href="/" className="bg-brand-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
              بازگشت و تلاش دوباره
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-neutral-800 mb-2">در حال ساخت کتابچه...</h1>
            {pageCount > 0 && (
              <p className="text-neutral-500 text-sm mb-6">{pageCount} صفحه پردازش شد</p>
            )}

            <div className="space-y-3 text-right">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                    ${step.done ? 'bg-green-500 text-white' : step.active ? 'bg-brand-600 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm ${step.active ? 'font-semibold text-brand-600' : step.done ? 'text-neutral-700' : 'text-neutral-400'}`}>
                    {step.label}
                  </span>
                  {step.active && (
                    <span className="text-xs text-brand-500 animate-pulse">در حال پردازش...</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">در حال بارگذاری...</p>}>
      <ProcessingContent />
    </Suspense>
  )
}
