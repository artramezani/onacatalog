import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const { phone, code, saveCatalogId } = await req.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'اطلاعات ناقص است.' }, { status: 400 })
    }

    // پیدا کردن کد معتبر
    const { data: otpRecord } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!otpRecord) {
      return NextResponse.json({ error: 'کد وارد شده اشتباه یا منقضی شده است.' }, { status: 400 })
    }

    // علامت‌گذاری کد به عنوان مصرف‌شده
    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id)

    // ساخت یا پیدا کردن کاربر در Supabase Auth
    // ابتدا ببین کاربر با این شماره وجود داره
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
            u => u.phone === phone.replace(/^0/, '98') || u.user_metadata?.phone === phone

    )

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      // ساخت کاربر جدید
            const e164 = phone.replace(/^0/, '+98')

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone: e164,
        phone_confirm: true,
        user_metadata: { phone },
      })


            if (createError || !newUser.user) {
        console.error('createUser error:', createError)
        throw new Error(`خطا در ساخت حساب کاربری: ${createError?.message ?? 'unknown'}`)
      }


      userId = newUser.user.id

      // ساخت پروفایل
      await supabaseAdmin.from('profiles').insert({
        id: userId,
        phone,
      })
    }

    // اگر کاربر مهمان کتابچه داشت، به حساب اضافه می‌کنیم
    if (saveCatalogId) {
      await supabaseAdmin
        .from('catalogs')
        .update({ user_id: userId, is_guest: false })
        .eq('id', saveCatalogId)
        .is('user_id', null)
    }

    // ساخت session token برای کاربر
    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${phone}@oncatalog.ir`, // ایمیل ساختگی برای session
    })

    // چون از phone auth استفاده می‌کنیم، یه custom token می‌سازیم
    // اینجا یه JWT ساده می‌سازیم
    const token = jwt.sign(
      { userId, phone, exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 },
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

        const response = NextResponse.json({ success: true, token, userId })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // ۳۰ روز
    })

    return response

  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'خطای داخلی سرور.' }, { status: 500 })
  }
}
