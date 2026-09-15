import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Maximize2,
  X,
  Sparkles
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    locale,
    t,
    products,
    selectedProductId,
    setCurrentView,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatProductPrice,
    getWhatsAppProductUrl,
    getWhatsAppPriceInquiryUrl,
    showToast
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [variantName: string]: string }>(() => {
    const initial: { [key: string]: string } = {};
    if (product?.variants) {
      product.variants.forEach((v) => {
        initial[v.name_en] = v.options[0];
      });
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Accordion tabs state
  const [openTab, setOpenTab] = useState<'specs' | 'warranty' | 'delivery' | 'return'>('specs');

  if (!product) {
    return (
      <div className="py-16 text-center text-stone-500">
        <p>{t('no_products')}</p>
        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold"
        >
          {t('catalog')}
        </button>
      </div>
    );
  }

  const isAr = locale === 'ar';
  const title = isAr ? product.title_ar : product.title_en;
  const description = isAr ? product.description_ar : product.description_en;
  const inWishlist = isInWishlist(product.id);

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option
    }));
  };

  const handleAddToCart = () => {
    if (product.stock_quantity <= 0) return;
    addToCart(product, quantity, selectedVariants);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(isAr ? 'تم نسخ رابط المنتج!' : 'Product link copied to clipboard!');
    }
  };

  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  return (
    <div className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? 'العودة إلى الكتالوج' : 'Back to Catalog'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="p-2 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded-full transition-colors"
              title={t('wishlist')}
            >
              <Heart
                className={`w-4 h-4 ${inWishlist ? 'text-rose-600 fill-rose-600' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Media Gallery (Thumbnails + Main Stage) - All strict 1:1 square */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Column */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] flex-shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-stone-50 aspect-square ${
                      selectedImageIndex === idx
                        ? 'border-stone-900 shadow-sm ring-2 ring-stone-900/10'
                        : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image with Strict 1:1 Aspect Ratio */}
            <div className="relative flex-1 rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-50 border border-stone-200/90 aspect-square group">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={title}
                className="w-full h-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Lightbox trigger */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-stone-700 hover:bg-white shadow-md transition-all hover:scale-105"
                title="Lightbox Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex flex-col gap-1.5 z-10">
                {product.condition === 'used' ? (
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-extrabold shadow-sm flex items-center gap-1">
                    {t('badge_used')}
                  </span>
                ) : product.condition === 'new' || product.is_new ? (
                  <span className="px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-semibold shadow-sm">
                    {t('badge_new')}
                  </span>
                ) : null}

                {product.pricing_type === 'inquire' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm">
                    {isAr ? 'السعر عند الطلب' : 'Price on Request'}
                  </span>
                )}

                {discountPercent && (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-sm">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info & Purchase Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Brand, Device Type & SKU */}
              <div className="flex items-center justify-between text-xs text-stone-500 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                    {product.brand}
                  </span>
                  {product.device_type && (
                    <span className="font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
                      {t(`dev_${product.device_type}`) || product.device_type}
                    </span>
                  )}
                </div>
                <span className="font-mono">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug">
                {title}
              </h1>

              {/* Product Alert Tags if present */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {product.tags.map((tagKey) => (
                    <span
                      key={tagKey}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs bg-amber-100 text-amber-900 border border-amber-300"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t(`tag_${tagKey}`) || tagKey}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Condition Callout Box */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  product.condition === 'used'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    product.condition === 'used'
                      ? 'bg-amber-400 text-stone-900 font-black'
                      : 'bg-stone-900 text-white'
                  }`}
                >
                  {product.condition === 'used' ? '♻' : '★'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold">
                    {product.condition === 'used'
                      ? (isAr ? 'حالة الجهاز: مستعمل ومفحوص مخبرياً' : 'Condition: Used & Lab-Certified')
                      : (isAr ? 'حالة الجهاز: جديد كلياً (مختوم بالكرتونة)' : 'Condition: Brand New (Factory Sealed)')}
                  </div>
                  <p className="text-[11px] leading-relaxed mt-0.5 opacity-90">
                    {product.condition_details ||
                      (product.condition === 'used'
                        ? (isAr
                            ? 'تم إجراء فحص فني شامل للوحة الأم، البطارية، الحساسات، والشاشة في مخبر صيانة الليث المعتمد.'
                            : 'Inspected for full motherboard, battery, sensors, and screen functionality at Al-Laith Lab.')
                        : (isAr
                            ? 'الجهاز جديد مع كفالة الليث الرسمية وجميع الملحقات الأصلية من الشركة المصنعة.'
                            : 'Factory sealed device with official Al-Laith warranty and complete in-box accessories.'))}
                  </p>
                </div>
              </div>

              {/* Rating & Stock */}
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-900">{product.rating}</span>
                  <span className="text-xs text-stone-400">({product.reviews_count} {t('reviews')})</span>
                </div>

                <div>
                  {product.pricing_type === 'inquire' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {isAr ? 'متوفر بالطلب الفوري' : 'Available on Order'}
                    </span>
                  ) : product.stock_quantity > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t('in_stock')} ({product.stock_quantity})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {t('out_of_stock')}
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing Display: SYP, USD or Inquire */}
              {product.pricing_type === 'inquire' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-xl sm:text-2xl">
                    <MessageCircle className="w-6 h-6 text-emerald-600" />
                    <span>{t('price_on_request')}</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-medium mt-1 leading-relaxed">
                    {isAr
                      ? 'يتم تحديد سعر هذا الجهاز يومياً وفق أسعار الصرف العالمية والتوريد المباشر. اضغط على الزر أدناه لمعرفة السعر الفوري وخيارات الاستلام في دمشق.'
                      : 'Real-time market price provided upon direct WhatsApp inquiry. Contact our team for immediate quote and Damascus delivery.'}
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900">
                      {formatProductPrice(product).primary}
                    </span>
                    {formatProductPrice(product).compareAt && (
                      <span className="text-sm sm:text-base text-stone-400 line-through">
                        {formatProductPrice(product).compareAt}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
                        {isAr ? 'خصم متاح' : 'Discounted'}
                      </span>
                    )}
                  </div>
                  {formatProductPrice(product).secondary && (
                    <p className="text-xs text-stone-500 font-semibold mt-1">
                      {isAr ? 'المعادل بالعملة الأخرى:' : 'Equivalent:'}{' '}
                      <span className="text-stone-800 font-bold">
                        {formatProductPrice(product).secondary}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Short Description */}
              <p className="text-stone-600 text-sm leading-relaxed">
                {description}
              </p>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  {product.variants.map((variant, vIdx) => {
                    const vName = isAr ? variant.name_ar : variant.name_en;
                    const selected = selectedVariants[variant.name_en] || variant.options[0];

                    return (
                      <div key={vIdx} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-stone-700">{vName}:</span>
                          <span className="text-stone-900 font-bold">{selected}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {variant.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleVariantSelect(variant.name_en, opt)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                selected === opt
                                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons: If Inquire, show large WhatsApp button. Else, show quantity + add to cart + secondary WhatsApp */}
              <div className="pt-4 space-y-3">
                {product.pricing_type === 'inquire' ? (
                  <a
                    id="pdp-whatsapp-inquire-main"
                    href={getWhatsAppPriceInquiryUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span>{t('inquire_whatsapp_cta')}</span>
                  </a>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-8 h-8 rounded-lg bg-white text-stone-800 font-bold hover:bg-stone-100 flex items-center justify-center disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-stone-900">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                          disabled={quantity >= product.stock_quantity}
                          className="w-8 h-8 rounded-lg bg-white text-stone-800 font-bold hover:bg-stone-100 flex items-center justify-center disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        id="pdp-add-to-cart-btn"
                        type="button"
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity <= 0}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
                          justAdded
                            ? 'bg-emerald-600 text-white'
                            : product.stock_quantity <= 0
                            ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                            : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                        }`}
                      >
                        {justAdded ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>{t('added_to_cart')}</span>
                          </>
                        ) : product.stock_quantity <= 0 ? (
                          <span>{t('out_of_stock')}</span>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>{t('add_to_cart')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Direct WhatsApp Product Inquiry Button */}
                    <a
                      id="pdp-whatsapp-inquiry-btn"
                      href={getWhatsAppProductUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>{t('direct_whatsapp_inquiry')}</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Value Guarantees Banner */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-stone-200 text-center text-[11px] text-stone-600">
              <div className="p-2 rounded-lg bg-stone-50">
                <Truck className="w-4 h-4 mx-auto text-stone-800 mb-1" />
                <span className="font-semibold block">{t('fast_delivery')}</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-50">
                <ShieldCheck className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
                <span className="font-semibold block">{t('original_warranty')}</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-50">
                <RotateCcw className="w-4 h-4 mx-auto text-blue-700 mb-1" />
                <span className="font-semibold block">{t('easy_returns')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Accordion Tabs: Specs, Warranty, Delivery, Returns */}
        <div className="mt-14 max-w-4xl mx-auto border-t border-stone-200 pt-8">
          <div className="flex border-b border-stone-200 gap-4 overflow-x-auto pb-px">
            {[
              { id: 'specs', label: t('specs_tab') },
              { id: 'warranty', label: t('warranty_tab') },
              { id: 'delivery', label: t('delivery_tab') },
              { id: 'return', label: t('return_tab') }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOpenTab(tab.id as typeof openTab)}
                className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${
                  openTab === tab.id
                    ? 'text-stone-900 border-b-2 border-stone-900'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {openTab === 'specs' && (
              <div className="space-y-3">
                {product.specs && product.specs.length > 0 ? (
                  <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 overflow-hidden">
                    {product.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="grid grid-cols-3 p-3.5 text-xs sm:text-sm bg-white even:bg-stone-50/60"
                      >
                        <span className="font-bold text-stone-600">
                          {isAr ? spec.key_ar : spec.key_en}
                        </span>
                        <span className="col-span-2 text-stone-900 font-medium">
                          {isAr ? spec.val_ar : spec.val_en}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">{description}</p>
                )}
              </div>
            )}

            {openTab === 'warranty' && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-sm text-stone-700 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>{isAr ? 'تفاصيل الضمان وخدمة ما بعد البيع' : 'Warranty Coverage & Service'}</span>
                </div>
                <p>{isAr ? product.warranty_ar : product.warranty_en}</p>
                <p className="text-xs text-stone-500">
                  {isAr
                    ? 'كفالة معتمدة في سوريا مع توفر مخبر صيانة متخصص وتبديل القطع بقطع أصلية مكفولة.'
                    : 'Certified warranty in Syria with specialized repair labs and original components.'}
                </p>
              </div>
            )}

            {openTab === 'delivery' && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-sm text-stone-700 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <Truck className="w-5 h-5 text-stone-800" />
                  <span>{isAr ? 'سياسة الشحن والتوصيل في سوريا' : 'Shipping in Syria'}</span>
                </div>
                <p>
                  {isAr
                    ? 'توصيل مأجور وسريع لكافة المحافظات السورية (دمشق، ريف دمشق، حلب، حمص، اللاذقية، طرطوس، حماة...) خلال 24 إلى 48 ساعة مع إمكانية الدفع عند الاستلام.'
                    : 'Fast insured shipping across all Syrian governorates within 24 to 48 hours with Cash on Delivery.'}
                </p>
              </div>
            )}

            {openTab === 'return' && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-sm text-stone-700 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <span>{isAr ? 'سياسة الاسترجاع والاستبدال' : 'Returns & Exchange'}</span>
                </div>
                <p>
                  {isAr
                    ? 'يحق للزبون فحص الجهاز عند الاستلام، والاستبدال الفوري في حال وجود أي عيب مصنعي خلال أسبوع من الشراء.'
                    : 'Immediate replacement guarantee upon inspection in case of manufacturer defect.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-6">
              {t('related_products')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={product.images[selectedImageIndex] || product.images[0]}
            alt={title}
            className="max-w-full max-h-[85vh] aspect-square object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
