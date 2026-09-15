import React from 'react';
import { useStore } from '../context/StoreContext';
import { initialPromotionalOffers } from '../data/initialData';
import { ArrowRight, ArrowLeft, Flame, Sparkles } from 'lucide-react';

export const PromotionalOffers: React.FC = () => {
  const { locale, t, setSelectedProductId, setCurrentView } = useStore();
  const offers = initialPromotionalOffers;
  const isAr = locale === 'ar';

  const handleOfferClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('pdp');
  };

  return (
    <section className="py-12 sm:py-16 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-2">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{isAr ? 'عروض وباقات الليث الحصرية' : 'Exclusive Al-Laith Deals & Bundles'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {t('exclusive_offers')}
            </h2>
          </div>
          <p className="text-sm text-stone-500 max-w-md">
            {isAr
              ? 'أفضل الأسعار المنافسة في السوق السوري مع هدايا حماية وكفالة معتمدة.'
              : 'Competitive Syrian market pricing with bundled accessories and certified warranty.'}
          </p>
        </div>

        {/* Offers Grid - Strict 2 columns on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              onClick={() => handleOfferClick(offer.link)}
              className="group relative bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1"
            >
              {/* Visual Banner - Strict 1:1 Aspect Ratio */}
              <div className="relative w-full aspect-square overflow-hidden bg-stone-100">
                <img
                  src={offer.image}
                  alt={offer.title_en}
                  className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 sm:top-3 sm:right-3 sm:rtl:right-auto sm:rtl:left-3 z-10">
                  <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-black bg-rose-600 text-white shadow-sm">
                    {isAr ? offer.badge_ar : offer.badge_en}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 sm:bottom-3 sm:left-3 sm:rtl:left-auto sm:rtl:right-3 z-10">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold bg-white/95 text-stone-900 shadow-sm backdrop-blur-xs">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
                    <span>{isAr ? `وفر ${offer.discount_percent}%` : `Save ${offer.discount_percent}%`}</span>
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content Box */}
              <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-base md:text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                    {isAr ? offer.title_ar : offer.title_en}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-500 mt-1 sm:mt-2 leading-relaxed line-clamp-2">
                    {isAr ? offer.subtitle_ar : offer.subtitle_en}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="mt-3 sm:mt-5 pt-2 sm:pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-stone-900 group-hover:text-emerald-700">
                  <span>{t('view_offer')}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
