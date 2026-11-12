import Link from 'next/link'

export default function Header() {
  return (
    <header className="w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* لوگو — راست */}
        <Link href="/" className="text-xl font-bold text-brand-600 tracking-tight">
          آنکاتالوگ
        </Link>

        {/* منو — چپ */}
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link href="/pricing" className="hover:text-brand-600 transition-colors">
            قیمت‌ها
          </Link>
          <Link href="/faq" className="hover:text-brand-600 transition-colors">
            سوالات متداول
          </Link>
          <Link
            href="/login"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            ورود / ثبت‌نام
          </Link>
        </nav>
      </div>
    </header>
  )
}
