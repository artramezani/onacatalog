
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'آنکاتالوگ — PDF خود را به کتابچه ورق‌خور تبدیل کنید',
  description: 'PDF خود را در چند ثانیه به یک کتابچه زیبا و قابل اشتراک‌گذاری تبدیل کنید',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-vazir bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  )
}
