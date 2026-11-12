'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const saveCatalogId = searchParams.get('save')

  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendOTP = async () => {
    if (!phone || phone.length !== 11) {
      setError('شماره موبایل را کامل وارد کنید.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setStep('code')
    setCountdown(120) // ۲ دقیقه
  }

  const verifyOTP = async () => {
    if (code.length !== 6) {
      setError('کد ۶ رقمی را وارد کنید.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, saveCatalogId }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    // ذخیره token
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user_id', data.userId)

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 max-w-sm w-full">
        {/* لوگو */}
        <Link href="/" className="block text-center mb-8">
          <span className="text-2xl font-bold text-brand-600">آنکاتالوگ</span>
        </Link>

        <h1 className="text-xl font-bold text-neutral-800 mb-1 text-center">
          {step === 'phone' ? 'ورود / ثبت‌نام' : 'کد تأیید را وارد کنید'}
        </h1>
        <p className="text-sm text-neutral-500 text-center mb-6">
          {step === 'phone'
            ? 'با شماره موبایل وارد شوید'
            : `کد ارسال شده به ${phone} را وارد کنید`}
        </p>

        {step === 'phone' ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                شماره موبایل
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="09xxxxxxxxx"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                کد تأیید
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="------"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                dir="ltr"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors mb-3"
            >
              {loading ? 'در حال بررسی...' : 'تأیید و ورود'}
            </button>
            <button
              onClick={() => { setStep('phone'); setCode(''); setError('') }}
              className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2"
            >
              تغییر شماره
            </button>
            {countdown > 0 && (
              <p className="text-center text-xs text-neutral-400 mt-2">
                ارسال مجدد تا {countdown} ثانیه دیگر
              </p>
            )}
            {countdown === 0 && (
              <button
                onClick={() => { sendOTP(); setCountdown(120) }}
                className="w-full text-sm text-brand-600 hover:text-brand-700 py-2 mt-1"
              >
                ارسال مجدد کد
              </button>
            )}
          </>
        )}

        {saveCatalogId && (
          <div className="mt-6 p-3 bg-brand-50 rounded-xl border border-brand-200">
            <p className="text-xs text-brand-700 text-center">
              پس از ورود، کتابچه شما به حسابتان منتقل می‌شود
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
