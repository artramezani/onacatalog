import type { Metadata } from 'next'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'آنکاتالوگ – PDF خود را به کتابچه ورق‌خور تبدیل کنید',
  description: 'PDF خود را در چند ثانیه به یک کتابچه زیبا و قابل اشتراک‌گذاری تبدیل کنید',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  )
}
