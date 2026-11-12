'use client'

import { useEffect, useState } from 'react'

// توجه: این صفحه فقط باید با IP ادمین یا رمز اضافی محافظت بشه
// در حال حاضر فقط در localhost قابل دسترسه

interface RecentCatalog {
  id: string
  title: string
  status: string
  page_count: number
  view_count: number
  created_at: string
    profiles: { phone: string }[] | null
}

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalCatalogs: 0,
    activeCatalogs: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    todayUploads: 0,
  })
  const [recentCatalogs, setRecentCatalogs] = useState<RecentCatalog[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

  const res = await fetch('/api/admin/stats')
const {
  totalCatalogs, activeCatalogs, totalUsers, activeSubs, todayUploads, recent,
} = await res.json()

      setStats({
        totalCatalogs: totalCatalogs ?? 0,
        activeCatalogs: activeCatalogs ?? 0,
        totalUsers: totalUsers ?? 0,
        activeSubscriptions: activeSubs ?? 0,
        todayUploads: todayUploads ?? 0,
      })

      setRecentCatalogs(recent ?? [])
    }

    fetchStats()
  }, [])

  const statCards = [
    { label: 'کل کتابچه‌ها', value: stats.totalCatalogs, color: 'bg-blue-50 text-blue-700' },
    { label: 'کتابچه‌های فعال', value: stats.activeCatalogs, color: 'bg-green-50 text-green-700' },
    { label: 'کاربران', value: stats.totalUsers, color: 'bg-purple-50 text-purple-700' },
    { label: 'اشتراک فعال', value: stats.activeSubscriptions, color: 'bg-amber-50 text-amber-700' },
    { label: 'آپلود امروز', value: stats.todayUploads, color: 'bg-brand-50 text-brand-700' },
  ]

  return (
    <main className="min-h-screen bg-neutral-100 p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">پنل مدیریت آنکاتالوگ</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6">
        <h2 className="font-bold mb-4">آخرین کتابچه‌ها</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-right py-2 font-medium text-neutral-500">عنوان</th>
              <th className="text-right py-2 font-medium text-neutral-500">کاربر</th>
              <th className="text-right py-2 font-medium text-neutral-500">صفحات</th>
              <th className="text-right py-2 font-medium text-neutral-500">بازدید</th>
              <th className="text-right py-2 font-medium text-neutral-500">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {recentCatalogs.map(c => (
              <tr key={c.id} className="border-b border-neutral-50">
                <td className="py-2 max-w-[180px] truncate">{c.title}</td>
                <td className="py-2 text-neutral-400">{c.profiles?.[0]?.phone ?? '—'}</td>

                <td className="py-2">{c.page_count}</td>
                <td className="py-2">{c.view_count}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full
                    ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {c.status === 'active' ? 'فعال' : c.status === 'processing' ? 'پردازش' : c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
