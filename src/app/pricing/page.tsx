import Header from '@/components/Header'
import Link from 'next/link'

const plans = [
  {
    id: '6month',
    name: 'شش ماهه',
    price: '۱۴۹,۰۰۰',
    priceNum: 149000,
    period: '۶ ماه',
    perMonth: '۲۴,۸۰۰',
    features: [
      'کتابچه‌های نامحدود',
      'تا ۲۰۰ صفحه در هر کتابچه',
      'لینک اختصاصی',
      'آمار بازدید',
      'بدون انقضا',
      'پشتیبانی ایمیلی',
    ],
    highlight: false,
  },
  {
    id: '12month',
    name: 'یک ساله',
    price: '۲۴۹,۰۰۰',
    priceNum: 249000,
    period: '۱ سال',
    perMonth: '۲۰,۷۵۰',
    features: [
      'همه امکانات نسخه شش ماهه',
      'حفاظت با رمز',
      'دانلود PDF',
      'QR Code',
      'اولویت پشتیبانی',
      'دامنه اختصاصی (به زودی)',
    ],
    highlight: true,
    badge: 'محبوب‌ترین',
  },
  {
    id: '60month',
    name: 'پنج ساله',
    price: '۷۴۹,۰۰۰',
    priceNum: 749000,
    period: '۵ سال',
    perMonth: '۱۲,۴۸۳',
    features: [
      'همه امکانات یک ساله',
      'دسترسی مادام‌العمر',
      'API دسترسی',
      'White-label',
      'پشتیبانی VIP',
      'امکانات آینده رایگان',
    ],
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">انتخاب پلان</h1>
          <p className="text-neutral-500">
            ۷ روز اول رایگان، بدون نیاز به کارت بانکی
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl border p-6 relative
                ${plan.highlight
                  ? 'border-brand-500 ring-2 ring-brand-500 shadow-lg'
                  : 'border-neutral-200'
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6 bg-brand-600 text-white text-xs px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <h2 className="text-lg font-bold text-neutral-800 mb-1">{plan.name}</h2>
              <div className="mb-1">
                <span className="text-3xl font-extrabold text-neutral-900">{plan.price}</span>
                <span className="text-sm text-neutral-400 mr-1">تومان / {plan.period}</span>
              </div>
              <p className="text-xs text-neutral-400 mb-5">{plan.perMonth} تومان در ماه</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/checkout?plan=${plan.id}`}
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors
                  ${plan.highlight
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
              >
                شروع با {plan.name}
              </Link>
            </div>
          ))}
        </div>

        {/* سوالات متداول قیمت */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-8">سوالات متداول</h2>
          {[
            { q: 'آیا می‌توانم پلان را تغییر دهم؟', a: 'بله، در هر زمان می‌توانید پلان خود را ارتقا دهید.' },
            { q: 'روش پرداخت چیست؟', a: 'پرداخت از طریق درگاه ZarinPal و با کارت‌های بانکی ایرانی انجام می‌شود.' },
            { q: 'پس از انقضا چه اتفاقی می‌افتد؟', a: 'کتابچه‌های شما ۳۰ روز پس از انقضا نگه‌داری می‌شوند و پس از تمدید قابل دسترس خواهند بود.' },
          ].map(item => (
            <div key={item.q} className="border-b border-neutral-200 py-4">
              <p className="font-medium text-neutral-800 mb-1">{item.q}</p>
              <p className="text-sm text-neutral-500">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
