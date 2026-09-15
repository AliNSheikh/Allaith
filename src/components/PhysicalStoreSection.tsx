import React from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Clock, Phone, Navigation, ShieldCheck, Award, Wrench } from 'lucide-react';

export const PhysicalStoreSection: React.FC = () => {
  const { locale, t, storeSettings } = useStore();
  const isAr = locale === 'ar';

  const address = isAr ? storeSettings.store_address_ar : storeSettings.store_address_en;
  const hours = isAr ? storeSettings.store_hours_ar : storeSettings.store_hours_en;

  const googleMapsUrl = storeSettings.google_maps_url || `https://www.google.com/maps?q=${storeSettings.store_lat || 35.524917},${storeSettings.store_lng || 35.852556}`;

  return (
    <section className="py-14 sm:py-20 bg-stone-100 border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Info Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('visit_our_store')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              {isAr ? 'تفضل بزيارة صالتنا الرئيسية ومركز الصيانة المعتمد' : 'Visit Our Flagship Experience & Certified Repair Hub'}
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {t('store_subtitle')}
            </p>

            {/* Info Cards */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    {t('store_address_label')}
                  </h4>
                  <p className="text-sm font-semibold text-stone-900 mt-0.5">{address}</p>
                  <p className="text-[11px] font-mono text-stone-500 mt-1">
                    35°31'29.7"N 35°51'09.2"E
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    {t('store_hours_label')}
                  </h4>
                  <p className="text-sm font-semibold text-stone-900 mt-0.5">{hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    {t('store_contact_label')}
                  </h4>
                  <p className="text-sm font-semibold text-stone-900 mt-0.5" dir="ltr">
                    {storeSettings.store_phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigate CTA */}
            <div className="pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-all shadow-md hover:shadow-lg"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>{t('get_directions')}</span>
              </a>
            </div>
          </div>

          {/* Right / Embedded Map Presentation */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-stone-200 aspect-[4/3] sm:aspect-[16/10]">
              {/* Map Canvas Visual (Using OpenStreetMap Embed or Stylized Tile Preview) */}
              <iframe
                title="Store Location Map"
                src={`https://maps.google.com/maps?q=${storeSettings.store_lat},${storeSettings.store_lng}&hl=${locale}&z=15&output=embed`}
                className="w-full h-full border-0 filter saturate-125"
                loading="lazy"
                aria-label="Interactive Map"
              />

              {/* Floating Overlay Badge on Map */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 rtl:sm:right-auto rtl:sm:left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200 shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black">
                  ص
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    {isAr ? storeSettings.site_name_ar : storeSettings.site_name_en}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    {isAr ? 'مفتوح الآن لاستقبالكم' : 'Open Today • Welcoming Visitors'}
                  </p>
                </div>
              </div>
            </div>

            {/* Credibility highlights */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80 border border-stone-200/80 text-xs text-stone-700">
                <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{t('authorized_distributor')}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80 border border-stone-200/80 text-xs text-stone-700">
                <Wrench className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>{isAr ? 'فحص وصيانة فورية بالمعرض' : 'Express On-site Repair Lab'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
