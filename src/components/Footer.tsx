import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Wrench,
  Phone,
  MapPin,
  Clock,
  Lock,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    locale,
    t,
    setCurrentView,
    storeSettings,
    showToast
  } = useStore();

  const isAr = locale === 'ar';

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(isAr ? 'شكراً لاشتراكك في نشرة متجر الليث!' : 'Thank you for subscribing to Al-Laith newsletter!');
  };

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-16 pb-24 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-800/50">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">{t('original_warranty')}</p>
              <p className="text-[11px] text-stone-400">{isAr ? 'كفالة معتمدة في سوريا' : 'Official Syria Warranty'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-800/50">
            <Truck className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">{t('fast_delivery')}</p>
              <p className="text-[11px] text-stone-400">{isAr ? 'شحن لكافة المحافظات' : 'All Syrian Governorates'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-800/50">
            <Wrench className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">{isAr ? 'مخبر صيانة متخصص' : 'Certified Tech Lab'}</p>
              <p className="text-[11px] text-stone-400">{isAr ? 'قطع غيار وفحص إلكتروني' : 'Original Hardware Spares'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-800/50">
            <RotateCcw className="w-6 h-6 text-rose-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">{t('easy_returns')}</p>
              <p className="text-[11px] text-stone-400">{isAr ? 'فحص عند الاستلام' : 'Inspect on Delivery'}</p>
            </div>
          </div>
        </div>

        {/* Links & Newsletter Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {storeSettings.footer_logo_url || storeSettings.custom_logo_url ? (
                <img
                  src={storeSettings.footer_logo_url || storeSettings.custom_logo_url}
                  alt={isAr ? storeSettings.site_name_ar : storeSettings.site_name_en}
                  className="h-10 w-auto max-w-[180px] object-contain"
                />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-white text-stone-900 flex items-center justify-center font-black text-lg">
                    ل
                  </div>
                  <span className="text-xl font-black text-white tracking-tight">
                    {isAr ? storeSettings.site_name_ar : storeSettings.site_name_en}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {isAr
                ? 'متجر الليث للاتصالات في سوريا: أحدث الهواتف الذكية، الأجهزة اللوحية، الإكسسوارات الأصلية، ومخبر صيانة إلكتروني متخصص.'
                : 'Al-Laith for Telecommunications in Syria: Latest smartphones, tablets, original accessories, and certified repair laboratory.'}
            </p>

            <div className="pt-2 text-xs space-y-1.5 text-stone-400">
              <a
                href={storeSettings.google_maps_url || `https://www.google.com/maps?q=${storeSettings.store_lat || 35.524917},${storeSettings.store_lng || 35.852556}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
                title={isAr ? 'فتح الموقع في Google Maps' : 'Open in Google Maps'}
              >
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{isAr ? storeSettings.store_address_ar : storeSettings.store_address_en}</span>
              </a>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span dir="ltr">{storeSettings.store_phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{isAr ? storeSettings.store_hours_ar : storeSettings.store_hours_en}</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold tracking-wider uppercase">{t('quick_links')}</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('home')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('catalog')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('offers')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('promotions')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? 'الأجهزة والملحقات' : 'Devices & Accessories'}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold tracking-wider uppercase">
              {isAr ? 'خدمة الزبائن والشحن' : 'Customer Care'}
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>{isAr ? 'الشحن والتوصيل للمحافظات' : 'Syria Governorates Shipping'}</li>
              <li>{isAr ? 'الدفع نقداً عند الاستلام' : 'Cash on Delivery Terms'}</li>
              <li>{isAr ? 'كفالة الأجهزة والاستبدال' : 'Warranty & Replacements'}</li>
              <li>{isAr ? 'صيانة الهواتف المعتمدة' : 'Authorized Phone Repair'}</li>
              <li>{isAr ? 'طلب جهاز غير متوفر' : 'Special Device Orders'}</li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">
              {isAr ? 'عروض وتخفيضات الليث' : 'Exclusive Updates'}
            </h4>
            <p className="text-xs text-stone-400">
              {isAr
                ? 'اشترك ليصلك جديد الأسعار وتحديثات توفر الأجهزة في السوق السوري.'
                : 'Subscribe to get device availability and price updates in Syria.'}
            </p>
            <form onSubmit={handleNewsletter} className="space-y-2">
              <input
                type="email"
                required
                placeholder={isAr ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-stone-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isAr ? 'اشتراك' : 'Subscribe'}</span>
                {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Security */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {isAr ? storeSettings.site_name_ar : storeSettings.site_name_en}. All rights reserved.</p>

          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[11px]">
              {isAr ? 'متجر الليث للاتصالات - اللاذقية، سوريا • دفع آمن عند الاستلام' : 'Al-Laith Telecom - Latakia, Syria • Cash on Delivery'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
