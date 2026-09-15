import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import {
  X,
  Scale,
  Check,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Star,
  Layers,
  Cpu,
  Smartphone,
  Zap,
  Camera,
  Battery,
  Wifi,
  HardDrive
} from 'lucide-react';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct
}) => {
  const {
    locale,
    t,
    formatProductPrice,
    addToCart,
    getWhatsAppPriceInquiryUrl,
    setSelectedProductId,
    setCurrentView
  } = useStore();

  if (!isOpen || products.length === 0) return null;

  const isAr = locale === 'ar';
  const p1 = products[0];
  const p2 = products[1] || null;

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('pdp');
    onClose();
  };

  const handleAddToCart = (product: Product) => {
    if (product.pricing_type === 'inquire') {
      window.open(getWhatsAppPriceInquiryUrl(product), '_blank');
      return;
    }
    addToCart(product, 1);
  };

  // Extract all unique specs keys across both products
  const allSpecKeys = React.useMemo(() => {
    const keysMap = new Map<string, { ar: string; en: string }>();
    products.forEach((p) => {
      p.specs?.forEach((s) => {
        const normalizedKey = s.key_en.toLowerCase().trim();
        if (!keysMap.has(normalizedKey)) {
          keysMap.set(normalizedKey, { ar: s.key_ar, en: s.key_en });
        }
      });
    });
    return Array.from(keysMap.entries()).map(([normKey, label]) => ({
      normKey,
      key_ar: label.ar,
      key_en: label.en
    }));
  }, [products]);

  const getSpecValue = (product: Product, normKey: string): string => {
    const found = product.specs?.find(
      (s) => s.key_en.toLowerCase().trim() === normKey
    );
    if (!found) return '—';
    return isAr ? found.val_ar : found.val_en;
  };

  const p1Price = formatProductPrice(p1);
  const p2Price = p2 ? formatProductPrice(p2) : null;

  // Calculate price difference if both products have numeric prices
  const priceDifference = React.useMemo(() => {
    if (!p2 || p1.pricing_type === 'inquire' || p2.pricing_type === 'inquire') {
      return null;
    }
    const diffSYP = Math.abs(p1.price - p2.price);
    const diffUSD =
      p1.price_usd && p2.price_usd ? Math.abs(p1.price_usd - p2.price_usd) : null;
    const cheaper = p1.price < p2.price ? p1 : p2;
    const expensive = p1.price > p2.price ? p1 : p2;
    return {
      diffSYP,
      diffUSD,
      cheaper,
      expensive,
      isEqual: p1.price === p2.price
    };
  }, [p1, p2]);

  return (
    <div
      id="product-compare-modal-overlay"
      className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#181e23] via-[#232a31] to-[#2c3740] px-4 sm:px-7 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span>{isAr ? 'مقارنة المواصفات التقنية' : 'Specifications Comparison'}</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-white text-[10px]">
                  {products.length} / 2
                </span>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-white leading-snug">
                {p2
                  ? `${isAr ? p1.title_ar : p1.title_en} × ${isAr ? p2.title_ar : p2.title_en}`
                  : `${isAr ? p1.title_ar : p1.title_en}`}
              </h3>
            </div>
          </div>

          <button
            id="close-compare-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">
          {/* Top Devices Overview Cards (Side-by-Side) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 items-stretch">
            {/* Product 1 Card */}
            <div className="relative bg-stone-50 rounded-2xl p-3 sm:p-5 border border-stone-200/90 flex flex-col justify-between group">
              <button
                type="button"
                onClick={() => onRemoveProduct(p1.id)}
                className="absolute top-2 rtl:left-2 ltr:right-2 p-1.5 rounded-full bg-white text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-colors z-10 shadow-2xs"
                title={isAr ? 'إزالة من المقارنة' : 'Remove from compare'}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div>
                <div
                  onClick={() => handleProductClick(p1.id)}
                  className="w-full aspect-square max-w-[180px] mx-auto rounded-xl bg-white border border-stone-200 overflow-hidden mb-3 cursor-pointer group-hover:scale-102 transition-transform shadow-xs"
                >
                  <img
                    src={p1.images[0]}
                    alt={isAr ? p1.title_ar : p1.title_en}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-600 bg-stone-200 px-2 py-0.5 rounded">
                    {p1.brand}
                  </span>
                  {p1.condition === 'used' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 text-[10px] sm:text-xs font-black">
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>{t('badge_used')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] sm:text-xs font-bold">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>{t('badge_new')}</span>
                    </span>
                  )}
                </div>

                <h4
                  onClick={() => handleProductClick(p1.id)}
                  className="text-xs sm:text-base font-black text-stone-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors leading-tight min-h-[2.5rem]"
                >
                  {isAr ? p1.title_ar : p1.title_en}
                </h4>

                {p1.condition === 'used' && p1.condition_details && (
                  <p className="text-[10px] sm:text-xs text-amber-900 bg-amber-100/70 p-1.5 rounded-lg font-medium mt-1.5 line-clamp-2 border border-amber-200/60">
                    {p1.condition_details}
                  </p>
                )}

                {/* Pricing Display */}
                <div className="mt-2.5 pt-2 border-t border-stone-200/80">
                  <div className="text-xs sm:text-lg font-black text-stone-900">
                    {p1Price.primary}
                  </div>
                  {p1Price.secondary && (
                    <div className="text-[10px] sm:text-xs text-stone-500 font-medium">
                      ≈ {p1Price.secondary}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={() => handleAddToCart(p1)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
                >
                  {p1.pricing_type === 'inquire' ? (
                    <>
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('inquire_about_price')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t('add_to_cart')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Product 2 Card (or Empty State) */}
            {p2 ? (
              <div className="relative bg-stone-50 rounded-2xl p-3 sm:p-5 border border-stone-200/90 flex flex-col justify-between group">
                <button
                  type="button"
                  onClick={() => onRemoveProduct(p2.id)}
                  className="absolute top-2 rtl:left-2 ltr:right-2 p-1.5 rounded-full bg-white text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-colors z-10 shadow-2xs"
                  title={isAr ? 'إزالة من المقارنة' : 'Remove from compare'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div
                    onClick={() => handleProductClick(p2.id)}
                    className="w-full aspect-square max-w-[180px] mx-auto rounded-xl bg-white border border-stone-200 overflow-hidden mb-3 cursor-pointer group-hover:scale-102 transition-transform shadow-xs"
                  >
                    <img
                      src={p2.images[0]}
                      alt={isAr ? p2.title_ar : p2.title_en}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-600 bg-stone-200 px-2 py-0.5 rounded">
                      {p2.brand}
                    </span>
                    {p2.condition === 'used' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 text-[10px] sm:text-xs font-black">
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>{t('badge_used')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] sm:text-xs font-bold">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        <span>{t('badge_new')}</span>
                      </span>
                    )}
                  </div>

                  <h4
                    onClick={() => handleProductClick(p2.id)}
                    className="text-xs sm:text-base font-black text-stone-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors leading-tight min-h-[2.5rem]"
                  >
                    {isAr ? p2.title_ar : p2.title_en}
                  </h4>

                  {p2.condition === 'used' && p2.condition_details && (
                    <p className="text-[10px] sm:text-xs text-amber-900 bg-amber-100/70 p-1.5 rounded-lg font-medium mt-1.5 line-clamp-2 border border-amber-200/60">
                      {p2.condition_details}
                    </p>
                  )}

                  {/* Pricing Display */}
                  <div className="mt-2.5 pt-2 border-t border-stone-200/80">
                    <div className="text-xs sm:text-lg font-black text-stone-900">
                      {p2Price?.primary}
                    </div>
                    {p2Price?.secondary && (
                      <div className="text-[10px] sm:text-xs text-stone-500 font-medium">
                        ≈ {p2Price.secondary}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p2)}
                    className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
                  >
                    {p2.pricing_type === 'inquire' ? (
                      <>
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('inquire_about_price')}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t('add_to_cart')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50/60 rounded-2xl p-6 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-stone-200/70 text-stone-500 flex items-center justify-center mb-3">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-800 mb-1">
                  {isAr ? 'اختر هاتفاً ثانياً للمقارنة' : 'Select a 2nd Phone'}
                </h4>
                <p className="text-xs text-stone-500 max-w-[200px] mb-4">
                  {isAr
                    ? 'قم بتفعيل زر المقارنة على أي هاتف في الكتالوج لعرضه جنباً إلى جنب هنا.'
                    : 'Toggle compare on any phone in the catalog to see it side-by-side.'}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  {isAr ? 'تصفح الكتالوج' : 'Browse Catalog'}
                </button>
              </div>
            )}
          </div>

          {/* Price Difference Highlight Banner (If 2 products available) */}
          {priceDifference && !priceDifference.isEqual && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isAr ? (
                    <>
                      فارق السعر بين الهاتفين:{' '}
                      <strong className="font-mono text-emerald-800">
                        {priceDifference.diffSYP.toLocaleString()} ل.س
                      </strong>
                      {priceDifference.diffUSD
                        ? ` (~$${priceDifference.diffUSD} USD)`
                        : ''}
                      . جهاز (
                      <strong>
                        {isAr
                          ? priceDifference.cheaper.title_ar
                          : priceDifference.cheaper.title_en}
                      </strong>
                      ) أوفر في الميزانية.
                    </>
                  ) : (
                    <>
                      Price difference:{' '}
                      <strong className="font-mono text-emerald-800">
                        {priceDifference.diffSYP.toLocaleString()} SYP
                      </strong>
                      {priceDifference.diffUSD
                        ? ` (~$${priceDifference.diffUSD} USD)`
                        : ''}
                      .{' '}
                      <strong>
                        {priceDifference.cheaper.title_en}
                      </strong>{' '}
                      is more budget-friendly.
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Detailed Side-by-Side Specs Table */}
          <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-xs">
            <div className="bg-stone-100 px-4 py-3 border-b border-stone-200">
              <h4 className="text-xs sm:text-sm font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#547b66]" />
                <span>{t('specs_comparison')}</span>
              </h4>
            </div>

            <div className="divide-y divide-stone-100 text-xs sm:text-sm">
              {/* Row: Brand */}
              <div className="grid grid-cols-12 p-3 sm:p-4 hover:bg-stone-50/50 transition-colors">
                <div className="col-span-4 font-bold text-stone-500 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{isAr ? 'الشركة المصنعة' : 'Brand'}</span>
                </div>
                <div className="col-span-4 font-semibold text-stone-900">
                  {p1.brand}
                </div>
                <div className="col-span-4 font-semibold text-stone-900">
                  {p2 ? p2.brand : '—'}
                </div>
              </div>

              {/* Row: Condition */}
              <div className="grid grid-cols-12 p-3 sm:p-4 hover:bg-stone-50/50 transition-colors bg-stone-50/30">
                <div className="col-span-4 font-bold text-stone-500 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                  <span>{isAr ? 'حالة الجهاز' : 'Condition'}</span>
                </div>
                <div className="col-span-4 font-semibold text-stone-900">
                  {p1.condition === 'used' ? (
                    <span className="text-amber-800 font-bold">
                      {t('badge_used')} {p1.condition_details ? `(${p1.condition_details})` : ''}
                    </span>
                  ) : (
                    <span className="text-emerald-800 font-bold">{t('badge_new')}</span>
                  )}
                </div>
                <div className="col-span-4 font-semibold text-stone-900">
                  {p2 ? (
                    p2.condition === 'used' ? (
                      <span className="text-amber-800 font-bold">
                        {t('badge_used')} {p2.condition_details ? `(${p2.condition_details})` : ''}
                      </span>
                    ) : (
                      <span className="text-emerald-800 font-bold">{t('badge_new')}</span>
                    )
                  ) : (
                    '—'
                  )}
                </div>
              </div>

              {/* Row: Warranty */}
              <div className="grid grid-cols-12 p-3 sm:p-4 hover:bg-stone-50/50 transition-colors">
                <div className="col-span-4 font-bold text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>{isAr ? 'الكفالة والضمان' : 'Warranty'}</span>
                </div>
                <div className="col-span-4 text-stone-800">
                  {(isAr ? p1.warranty_ar : p1.warranty_en) || (isAr ? 'كفالة الليث المعتمدة' : 'Official Warranty')}
                </div>
                <div className="col-span-4 text-stone-800">
                  {p2 ? (isAr ? p2.warranty_ar : p2.warranty_en) || (isAr ? 'كفالة الليث المعتمدة' : 'Official Warranty') : '—'}
                </div>
              </div>

              {/* Row: Storage / Variants */}
              <div className="grid grid-cols-12 p-3 sm:p-4 hover:bg-stone-50/50 transition-colors bg-stone-50/30">
                <div className="col-span-4 font-bold text-stone-500 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-stone-400" />
                  <span>{isAr ? 'الخيارات والسعات' : 'Options & Variants'}</span>
                </div>
                <div className="col-span-4 text-stone-800 space-y-1">
                  {p1.variants && p1.variants.length > 0 ? (
                    p1.variants.map((v, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-semibold">{isAr ? v.name_ar : v.name_en}:</span>{' '}
                        {v.options.join(', ')}
                      </div>
                    ))
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="col-span-4 text-stone-800 space-y-1">
                  {p2 ? (
                    p2.variants && p2.variants.length > 0 ? (
                      p2.variants.map((v, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold">{isAr ? v.name_ar : v.name_en}:</span>{' '}
                          {v.options.join(', ')}
                        </div>
                      ))
                    ) : (
                      <span>—</span>
                    )
                  ) : (
                    '—'
                  )}
                </div>
              </div>

              {/* Product Specifications from specs array */}
              {allSpecKeys.map(({ normKey, key_ar, key_en }) => {
                const val1 = getSpecValue(p1, normKey);
                const val2 = p2 ? getSpecValue(p2, normKey) : '—';
                const isDiff = p2 && val1 !== val2 && val1 !== '—' && val2 !== '—';

                return (
                  <div
                    key={normKey}
                    className={`grid grid-cols-12 p-3 sm:p-4 hover:bg-stone-50/70 transition-colors ${
                      isDiff ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="col-span-4 font-bold text-stone-600 flex items-center gap-1.5">
                      {isDiff && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                      <span>{isAr ? key_ar : key_en}</span>
                    </div>
                    <div className="col-span-4 text-stone-900 leading-relaxed font-medium">
                      {val1}
                    </div>
                    <div className="col-span-4 text-stone-900 leading-relaxed font-medium">
                      {val2}
                    </div>
                  </div>
                );
              })}

              {/* Stock Status Row */}
              <div className="grid grid-cols-12 p-3 sm:p-4 hover:bg-stone-50/50 transition-colors">
                <div className="col-span-4 font-bold text-stone-500">
                  {isAr ? 'توفر المخزون' : 'Stock Availability'}
                </div>
                <div className="col-span-4">
                  {p1.pricing_type === 'inquire' ? (
                    <span className="text-emerald-700 font-bold">{isAr ? 'متاح بالطلب' : 'On Order'}</span>
                  ) : p1.stock_quantity > 0 ? (
                    <span className="text-emerald-700 font-bold">{t('in_stock')} ({p1.stock_quantity})</span>
                  ) : (
                    <span className="text-rose-600 font-semibold">{t('out_of_stock')}</span>
                  )}
                </div>
                <div className="col-span-4">
                  {p2 ? (
                    p2.pricing_type === 'inquire' ? (
                      <span className="text-emerald-700 font-bold">{isAr ? 'متاح بالطلب' : 'On Order'}</span>
                    ) : p2.stock_quantity > 0 ? (
                      <span className="text-emerald-700 font-bold">{t('in_stock')} ({p2.stock_quantity})</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">{t('out_of_stock')}</span>
                    )
                  ) : (
                    '—'
                  )}
                </div>
              </div>

              {/* Rating Row */}
              <div className="grid grid-cols-12 p-3 sm:p-4 hover:bg-stone-50/50 transition-colors bg-stone-50/30">
                <div className="col-span-4 font-bold text-stone-500 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{isAr ? 'تقييم المستخدمين' : 'Rating'}</span>
                </div>
                <div className="col-span-4 font-bold text-stone-900">
                  ⭐ {p1.rating} ({p1.reviews_count} {isAr ? 'تقييم' : 'reviews'})
                </div>
                <div className="col-span-4 font-bold text-stone-900">
                  {p2 ? `⭐ ${p2.rating} (${p2.reviews_count} ${isAr ? 'تقييم' : 'reviews'})` : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-stone-50 px-4 sm:px-7 py-3.5 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-stone-500 hidden sm:block">
            {isAr
              ? 'جميع الأجهزة تخضع لكفالة مركز الليث للاتصالات في اللاذقية.'
              : 'All devices backed by Al-Laith Official Warranty in Latakia.'}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
