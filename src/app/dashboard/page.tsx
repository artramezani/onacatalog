'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import UploadBox from '@/components/UploadBox'

interface Catalog {
  id: string
  slug: string
  title: string
  status: string
  page_count: number
  view_count: number
  cover_url: string | null
  expires_at: string | null
  created_at: string
}
interface Subscription {
  plan: string
  status: string
  expires_at: string | null
}


export default function DashboardPage() {
  const { user, loading, logout } = useAuth(true)
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [fetching, setFetching] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      // دریافت کتابچه‌ها
      const { data: cats } = await supabase
        .from('catalogs')
        .select('id, slug, title, status, page_count, view_count, cover_url, expires_at, created_at')
        .eq('user_id', user.userId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

      setCatalogs(cats ?? [])

      // دریافت اشتراک
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.userId)
        .eq('status', 'active')
        .single()

      setSubscription(sub)
      setFetching(false)
    }

    fetchData()
  }, [user])

  const deleteCatalog = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟ این عمل قابل برگشت نیست.')) return

    await supabase
      .from('catalogs')
      .update({ status: 'deleted' })
      .eq('id', id)

    setCatalogs(prev => prev.filter(c => c.id !== id))
  }

  const formatDate = (d: string | null) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
}

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* هدر داشبورد */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-600">آنکاتالوگ</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">{user?.phone}</span>
            <button
              onClick={logout}
              className="text-sm text-neutral-500 hover:text-red-500 transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* خلاصه وضعیت */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <p className="text-3xl font-bold text-neutral-900">{catalogs.length}</p>
            <p className="text-sm text-neutral-500 mt-1">کتابچه</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <p className="text-3xl font-bold text-neutral-900">
              {catalogs.reduce((s, c) => s + (c.view_count ?? 0), 0)}
            </p>
            <p className="text-sm text-neutral-500 mt-1">بازدید کل</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm font-semibold text-neutral-700">
              {subscription
                ? `اشتراک ${subscription.plan}`
                : 'رایگان'}
            </p>
            {subscription && (
              <p className="text-xs text-neutral-400 mt-1">
                تا {formatDate(subscription.expires_at)}
              </p>
            )}
            {!subscription && (
              <Link href="/pricing" className="text-xs text-brand-600 mt-1 block hover:underline">
                ارتقا دهید
              </Link>
            )}
          </div>
        </div>

        {/* آپلود */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-800">کتابچه‌های من</h2>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="bg-brand-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors"
            >
              + کتابچه جدید
            </button>
          </div>

          {showUpload && (
            <div className="mb-6">
              <UploadBox />
            </div>
          )}
        </div>

        {/* لیست کتابچه‌ها */}
        {catalogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
            <div className="text-5xl mb-4">📄</div>
            <p className="font-medium text-neutral-700 mb-2">هنوز کتابچه‌ای ندارید</p>
            <p className="text-sm text-neutral-400">اولین PDF خود را آپلود کنید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogs.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex">
                {/* تصویر جلد */}
                <div className="w-24 bg-neutral-100 flex-shrink-0">
                  {c.cover_url ? (
                    <img src={c.cover_url} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
                  )}
                </div>

                {/* اطلاعات */}
                <div className="p-4 flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-800 truncate mb-1">{c.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
                    <span>{c.page_count} صفحه</span>
                    <span>{c.view_count} بازدید</span>
                    {c.expires_at && (
                      <span className={new Date(c.expires_at) < new Date() ? 'text-red-400' : ''}>
                        {new Date(c.expires_at) < new Date() ? 'منقضی' : `تا ${formatDate(c.expires_at)}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {c.status === 'active' && (
                      <Link
                        href={`/view/${c.slug}`}
                        target="_blank"
                        className="text-xs bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
                      >
                        مشاهده
                      </Link>
                    )}
                    {c.status === 'processing' && (
                      <Link
                        href={`/processing/${c.id}`}
                        className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg"
                      >
                        در حال پردازش...
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/view/${c.slug}`)
                        alert('لینک کپی شد')
                      }}
                      className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      کپی لینک
                    </button>
                    <button
                      onClick={() => deleteCatalog(c.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 transition-colors mr-auto"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
