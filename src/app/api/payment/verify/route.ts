import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const PLANS: Record<string, { months: number }> = {
  '6month':  { months: 6  },
  '12month': { months: 12 },
  '60month': { months: 60 },
}
const ZP = process.env.ZARINPAL_SANDBOX === 'true'
  ? 'https://sandbox.zarinpal.com'
  : 'https://payment.zarinpal.com'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const paymentId = searchParams.get('paymentId')
  const authority  = searchParams.get('Authority')
  const status     = searchParams.get('Status')

  if (status !== 'OK' || !authority || !paymentId) {
    return NextResponse.redirect(
      new URL('/dashboard?payment=failed', req.url)
    )
  }

  try {
    // پیدا کردن پرداخت
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (!payment || payment.status !== 'pending') {
      return NextResponse.redirect(new URL('/dashboard?payment=failed', req.url))
    }

    // تأیید پرداخت از ZarinPal
    const verifyRes = await fetch(`${ZP}/pg/v4/payment/verify.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: payment.amount,
        authority,
      }),
    })

    const verifyData = await verifyRes.json()

    if (verifyData.data?.code !== 100 && verifyData.data?.code !== 101) {
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', paymentId)

      return NextResponse.redirect(new URL('/dashboard?payment=failed', req.url))
    }

    const refId = verifyData.data.ref_id.toString()

    // آپدیت پرداخت
    await supabaseAdmin
      .from('payments')
      .update({ status: 'success', ref_id: refId })
      .eq('id', paymentId)

    // ساخت یا تمدید اشتراک
    const months = PLANS[payment.plan]?.months ?? 6
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + months)

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, expires_at')
      .eq('user_id', payment.user_id)
      .single()

    if (existingSub) {
      // تمدید از تاریخ فعلی انقضا
      const currentExpiry = new Date(existingSub.expires_at)
      const newExpiry = currentExpiry > new Date() ? currentExpiry : new Date()
      newExpiry.setMonth(newExpiry.getMonth() + months)

      await supabaseAdmin
        .from('subscriptions')
        .update({ expires_at: newExpiry.toISOString(), status: 'active', plan: payment.plan })
        .eq('id', existingSub.id)
    } else {
      await supabaseAdmin.from('subscriptions').insert({
        user_id: payment.user_id,
        plan: payment.plan,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      })
    }

    // حذف انقضا از کتابچه‌های کاربر
    await supabaseAdmin
      .from('catalogs')
      .update({ expires_at: null })
      .eq('user_id', payment.user_id)

    return NextResponse.redirect(
      new URL(`/dashboard?payment=success&ref=${refId}`, req.url)
    )
  } catch (err) {
    console.error('Payment verify error:', err)
    return NextResponse.redirect(new URL('/dashboard?payment=error', req.url))
  }
}
