'use client'
import Header from '@/components/Header'
import UploadBox from '@/components/UploadBox'

const steps = [
  { num: '۱', title: 'آپلود PDF', desc: 'فایل PDF خود را بکشید یا انتخاب کنید' },
  { num: '۲', title: 'تبدیل خودکار', desc: 'در چند ثانیه کتابچه آماده می‌شود' },
  { num: '۳', title: 'اشتراک لینک', desc: 'لینک اختصاصی را با دیگران به اشتراک بگذارید' },
]

const features = [
  { icon: '🔗', title: 'لینک اختصاصی', desc: 'آدرس منحصر به فرد برای هر کتابچه' },
  { icon: '📱', title: 'سازگار با موبایل', desc: 'تجربه عالی روی همه دستگاه‌ها' },
  { icon: '↩️', title: 'ورق‌زدن واقعی', desc: 'انیمیشن روان و طبیعی صفحات' },
  { icon: '📊', title: 'آمار بازدید', desc: 'ببینید چند نفر کتابچه شما را دیدند' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 leading-tight mb-4">
          PDF خود را به<br />
          <span className="text-brand-600">کتابچه ورق‌خور</span> تبدیل کنید
        </h1>
        <p className="text-lg text-neutral-600 mb-12 max-w-xl mx-auto">
          در چند ثانیه، یک لینک زیبا و قابل اشتراک‌گذاری بسازید. بدون نصب، بدون پیچیدگی.
        </p>
        <UploadBox />
      </section>

      {/* مراحل */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-neutral-800">چطور کار می‌کند؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(s => (
            <div key={s.num} className="bg-white rounded-2xl p-6 border border-neutral-200 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-3">
                {s.num}
              </div>
              <h3 className="font-semibold text-neutral-800 mb-1">{s.title}</h3>
              <p className="text-sm text-neutral-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ویژگی‌ها */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-neutral-800">چرا آنکاتالوگ؟</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-5 border border-neutral-200 text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-neutral-800 mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-neutral-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA پایین */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-brand-600 rounded-3xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-2">همین الان امتحان کنید</h2>
          <p className="text-brand-200 mb-6">۷ روز رایگان، بدون نیاز به کارت بانکی</p>
          <a
            href="#"
            onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="inline-block bg-white text-brand-600 font-bold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors"
          >
            آپلود PDF
          </a>
        </div>
      </section>

      <footer className="border-t border-neutral-200 text-center py-6 text-sm text-neutral-400">
        © ۱۴۰۵ آنکاتالوگ — تمام حقوق محفوظ است
      </footer>
    </main>
  )
}
