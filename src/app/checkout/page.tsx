'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

function CheckoutContent() {
  const { user, loading } = useAuth(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const plan = searchParams.get('plan') ?? '12month'

  useEffect(() => {
    if (loading || !user) return

    const startPayment = async () => {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user.userId }),
      })

      const data = await res.json()

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        router.push('/pricing?error=payment')
      }
    }

    startPayment()
  }, [user, loading, plan, router])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">در حال انتقال به درگاه پرداخت...</p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
