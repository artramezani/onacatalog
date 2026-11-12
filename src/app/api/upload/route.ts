import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'فایلی ارسال نشده است.' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'فقط فایل PDF قابل قبول است.' }, { status: 400 })
    }

    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'حجم فایل بیشتر از ۵۰ مگابایت است.' }, { status: 400 })
    }

    // ساخت شناسه یکتا برای کتابچه
    const catalogId = uuidv4()
    const guestToken = uuidv4()
    const slug = guestToken.slice(0, 12) // یه slug کوتاه

    // آپلود PDF به Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfPath = `${catalogId}/original.pdf`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('catalogs')
      .upload(pdfPath, buffer, { contentType: 'application/pdf' })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'خطا در ذخیره فایل.' }, { status: 500 })
    }

    // ثبت کتابچه در دیتابیس
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // ۷ روز رایگان

    const { error: dbError } = await supabaseAdmin
      .from('catalogs')
      .insert({
        id: catalogId,
        slug,
        guest_token: guestToken,
        is_guest: true,
        status: 'processing',
        expires_at: expiresAt.toISOString(),
        title: file.name.replace('.pdf', ''),
      })

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'خطا در ثبت اطلاعات.' }, { status: 500 })
    }

    // شروع پردازش (در background)
    // این رو به صورت async می‌فرستیم و منتظر نمی‌مونیم
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catalogId }),
    }).catch(console.error)

    return NextResponse.json({ catalogId, slug })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'خطای غیرمنتظره. لطفاً دوباره تلاش کنید.' }, { status: 500 })
  }
}
