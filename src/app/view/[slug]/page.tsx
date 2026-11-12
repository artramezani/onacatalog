'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'

function ViewContent() {
  const params = useParams()
  const slug = params.slug as string

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p>در حال بارگذاری کاتالوگ: {slug}</p>
    </main>
  )
}

export default function ViewPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">در حال بارگذاری...</p>}>
      <ViewContent />
    </Suspense>
  )
}
