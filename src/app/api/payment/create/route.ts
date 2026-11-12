import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { v4 as uuidv4 } from 'uuid'

const PLANS: Record<string, { price: number; months: number; label: string }> = {
  '6month':  { price: 1490000, months: 6,  label: 'شش ماهه' },
  '12month': { price: 2490000, months: 12, label: 'یک ساله' },
  '60month': { price: 7490000, months: 60, label: 'پنج ساله' },
}

const ZP = process.env.ZARINPAL_SANDBOX === 'true'
  ? 'https://sandbox.zarinpal.com'
  : 'https://payment.zarinpal.com'

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json()

    if (!plan || !userId || !PLANS[plan]) {
      return NextResponse.json({ error: 'اطلاعات پرداخت نادرست است.' }, { status: 400 })
    }

    const planInfo = PLANS[plan]
    const paymentId = uuidv4()

    // ثبت پرداخت در دیتابیس
    await supabaseAdmin.from('payments').insert({
      id: paymentId,
      user_id: userId,
      amount: planInfo.price,
      plan,
      status: 'pending',
    })

    // درخواست به ZarinPal
    const zarinRes = await fetch(`${ZP}/pg/v4/payment/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: planInfo.price,
        description: `خرید اشتراک ${planInfo.label} آنکاتالوگ`,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify?paymentId=${paymentId}`,
        metadata: { userId, plan },
      }),
    })

    const zarinData = await zarinRes.json()

    if (zarinData.data?.code !== 100) {
      throw new Error('خطا در اتصال به درگاه پرداخت')
    }

    const authority = zarinData.data.authority

    // ذخیره authority
    await supabaseAdmin
      .from('payments')
      .update({ authority })
      .eq('id', paymentId)

    return NextResponse.json({
  paymentUrl: `${ZP}/pg/StartPay/${authority}`,
})

  } catch (err) {
  const message = err instanceof Error ? err.message : 'خطای ناشناخته'
  return NextResponse.json({ error: message }, { status: 500 })

  }
}
