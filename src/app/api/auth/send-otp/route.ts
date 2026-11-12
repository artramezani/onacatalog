import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import axios from 'axios'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!/^09[0-9]{9}$/.test(phone)) {
      return NextResponse.json({ error: 'شماره موبایل معتبر نیست.' }, { status: 400 })
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone)
      .gte('created_at', tenMinutesAgo)

    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌ها بیش از حد مجاز است. ۱۰ دقیقه دیگر تلاش کنید.' },
        { status: 429 }
      )
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()

    const { error: insertError } = await supabaseAdmin.from('otp_codes').insert({
      phone,
      code,
      expires_at: expiresAt,
    })

    if (insertError) {
      console.error('OTP insert error:', insertError)
      return NextResponse.json({ error: 'خطا در ذخیره کد.' }, { status: 500 })
    }

    // ... بعد از ساخت و ذخیره کد ۶ رقمی:
    await axios.post(
  `https://api.kavenegar.com/v1/${process.env.KAVENEGAR_API_KEY}/verify/lookup.json`,
  null,
  {
    params: {
      receptor: phone,
      token: code,
      template: 'verify',
    },
  }
)


    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('send-otp error:', error)
    return NextResponse.json({ error: 'خطای سرور.' }, { status: 500 })
  }
}
