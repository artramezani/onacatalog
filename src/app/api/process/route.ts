import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { fromBuffer } from 'pdf2pic'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 300 // ۵ دقیقه

export async function POST(req: NextRequest) {
  try {
    const { catalogId } = await req.json()

    if (!catalogId) {
      return NextResponse.json({ error: 'catalogId required' }, { status: 400 })
    }

    // دانلود PDF از Storage
    const { data: pdfData, error: downloadError } = await supabaseAdmin.storage
      .from('catalogs')
      .download(`${catalogId}/original.pdf`)

    if (downloadError || !pdfData) {
      throw new Error('خطا در دانلود PDF')
    }

    const pdfBuffer = Buffer.from(await pdfData.arrayBuffer())

    // تبدیل PDF به تصویر
    const convert = fromBuffer(pdfBuffer, {
      density: 150,
      format: 'jpeg',
      width: 1200,
      height: 1600,
    })

    // پیدا کردن تعداد صفحات
    const pdfParse = (await import('pdf-parse')).default
    const pdfInfo = await pdfParse(pdfBuffer)
    const pageCount = Math.min(pdfInfo.numpages, 200) // حداکثر ۲۰۰ صفحه

    const uploadedPages = []

    for (let i = 1; i <= pageCount; i++) {
      // تبدیل صفحه به JPEG
      const pageResult = await convert(i, { responseType: 'buffer' })

      if (!pageResult.buffer) continue

      // فشرده‌سازی با sharp و تبدیل به WebP
      const webpBuffer = await sharp(pageResult.buffer)
        .webp({ quality: 85 })
        .resize(1200, null, { withoutEnlargement: true })
        .toBuffer()

      // ساخت thumbnail
      const thumbBuffer = await sharp(pageResult.buffer)
        .webp({ quality: 70 })
        .resize(300, null, { withoutEnlargement: true })
        .toBuffer()

      // آپلود تصویر کامل
      const imagePath = `${catalogId}/pages/page-${i}.webp`
      const thumbPath = `${catalogId}/thumbs/page-${i}.webp`

      await supabaseAdmin.storage
        .from('catalogs')
        .upload(imagePath, webpBuffer, { contentType: 'image/webp' })

      await supabaseAdmin.storage
        .from('catalogs')
        .upload(thumbPath, thumbBuffer, { contentType: 'image/webp' })

      // URL عمومی
      const { data: imageUrl } = supabaseAdmin.storage
        .from('catalogs')
        .getPublicUrl(imagePath)

      const { data: thumbUrl } = supabaseAdmin.storage
        .from('catalogs')
        .getPublicUrl(thumbPath)

      uploadedPages.push({
        catalog_id: catalogId,
        page_number: i,
        image_url: imageUrl.publicUrl,
        thumbnail_url: thumbUrl.publicUrl,
      })

      // آپدیت progress در دیتابیس
      await supabaseAdmin
        .from('catalogs')
        .update({ page_count: i })
        .eq('id', catalogId)
    }

    // ذخیره همه صفحات
    await supabaseAdmin.from('catalog_pages').insert(uploadedPages)

    // تصویر جلد = صفحه اول
    const coverUrl = uploadedPages[0]?.image_url

    // آپدیت وضعیت نهایی
    await supabaseAdmin
      .from('catalogs')
      .update({
        status: 'active',
        page_count: pageCount,
        cover_url: coverUrl,
      })
      .eq('id', catalogId)

    return NextResponse.json({ success: true, pageCount })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Process error:', err)

    // ثبت خطا در دیتابیس
    const { catalogId } = await req.json().catch(() => ({}))
    if (catalogId) {
      await supabaseAdmin
        .from('catalogs')
        .update({ status: 'error' })
        .eq('id', catalogId)
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
