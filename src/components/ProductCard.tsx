import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import {
  Star,
  Heart,
  ShoppingBag,
  Check,
  MessageCircle,
  Sparkles,
  RefreshCw,
  Zap,
  Flame,
  ShieldCheck,
  Clock,
  Truck,
  Scale
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  enableCompare?: boolean;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  enableCompare = false,
  isCompared = false,
  onToggleCompare
}) => {
  const {
    locale,
    t,
    addToCart,
    setSelectedProductId,
    setCurrentView,
    toggleWishlist,
    isInWishlist,
    formatProductPrice,
    getWhatsAppPriceInquiryUrl
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isAr = locale === 'ar';
  const title = isAr ? product.title_ar : product.title_en;
  const inWishlist = isInWishlist(product.id);

  const isInquireOnly = product.pricing_type === 'inquire';
  const priceData = formatProductPrice(product);

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setCurrentView('pdp');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInquireOnly) {
      window.open(getWhatsAppPriceInquiryUrl(product), '_blank');
      return;
    }
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const currentImage = isHovered && product.images.length > 1
    ? product.images[1]
    : product.images[0];

  // Helper to format custom alert tags
  const renderTagBadge = (tagKey: string) => {
    switch (tagKey) {
      case 'deal_of_the_day':
        return {
          label: t('tag_deal_of_the_day') || (isAr ? 'عرض اليوم' : 'Deal'),
          bg: 'bg-amber-500 text-stone-950 font-black',
          icon: <Zap className="w-2.5 h-2.5 fill-stone-950" />
        };
      case 'sale':
      case 'special_sale':
        return {
          label: t('tag_sale') || (isAr ? 'تخفيض' : 'Sale'),
          bg: 'bg-rose-600 text-white font-extrabold',
          icon: <Flame className="w-2.5 h-2.5" />
        };
      case 'lab_certified':
        return {
          label: t('tag_lab_certified') || (isAr ? 'فحص مخبري' : 'Lab Tested'),
          bg: 'bg-sky-600 text-white font-bold',
          icon: <ShieldCheck className="w-2.5 h-2.5" />
        };
      case 'bestseller':
        return {
          label: t('tag_bestseller') || (isAr ? 'الأكثر طلباً' : 'Bestseller'),
          bg: 'bg-indigo-600 text-white font-bold',
          icon: <Star className="w-2.5 h-2.5 fill-white" />
        };
      case 'limited_stock':
        return {
          label: t('tag_limited_stock') || (isAr ? 'كمية محدودة' : 'Limited'),
          bg: 'bg-red-600 text-white font-bold',
          icon: <Clock className="w-2.5 h-2.5" />
        };
      case 'free_shipping':
        return {
          label: t('tag_free_shipping') || (isAr ? 'شحن مجاني' : 'Free Ship'),
          bg: 'bg-emerald-600 text-white font-bold',
          icon: <Truck className="w-2.5 h-2.5" />
        };
      default:
        return {
          label: tagKey,
          bg: 'bg-stone-800 text-white font-semibold',
          icon: null
        };
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl sm:rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1"
    >
      {/* Top Image Container - Strict 1:1 Aspect Ratio */}
      <div className="relative w-full aspect-square bg-stone-50 overflow-hidden">
        <img
          src={currentImage}
          alt={title}
          className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Floating Badges & Alert Tags (Top Corner) */}
        <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 sm:top-3 sm:left-3 sm:rtl:right-3 flex flex-col gap-1 sm:gap-1.5 z-10 max-w-[80%]">
          {/* Condition Badge (Used vs New) */}
          {product.condition === 'used' ? (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-full bg-amber-400 text-stone-950 text-[9px] sm:text-[11px] font-black shadow-xs">
              <RefreshCw className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span>{t('badge_used')}</span>
            </span>
          ) : product.condition === 'new' || product.is_new ? (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-full bg-stone-900 text-white text-[9px] sm:text-[11px] font-bold shadow-xs">
              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-300" />
              <span>{t('badge_new')}</span>
            </span>
          ) : null}

          {/* Pricing Inquiry Badge */}
          {isInquireOnly && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold shadow-xs">
              <MessageCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </span>
          )}

          {/* Price Sale Badge */}
          {(priceData.isDiscounted || (product.discount_percent && product.discount_percent > 0)) && !isInquireOnly && (
            <span className="inline-block px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-full bg-rose-600 text-white text-[9px] sm:text-[11px] font-black shadow-xs">
              {product.discount_percent ? `-${product.discount_percent}%` : (isAr ? 'خصم' : 'Sale')}
            </span>
          )}

          {/* Alert Tags (e.g., deal_of_the_day, lab_certified, bestseller) */}
          {product.tags && product.tags.slice(0, 2).map((tagKey) => {
            const badge = renderTagBadge(tagKey);
            return (
              <span
                key={tagKey}
                className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[9px] sm:text-[10px] shadow-xs ${badge.bg}`}
              >
                {badge.icon}
                <span className="truncate">{badge.label}</span>
              </span>
            );
          })}
        </div>

        {/* Floating Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label="Wishlist"
          className="absolute top-2 right-2 rtl:right-auto rtl:left-2 sm:top-3 sm:right-3 sm:rtl:left-3 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-700 hover:text-rose-600 hover:bg-white flex items-center justify-center shadow-xs transition-colors"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              inWishlist ? 'text-rose-600 fill-rose-600' : 'text-stone-600'
            }`}
          />
        </button>

        {/* Floating Compare Toggle Button */}
        {enableCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare?.(product);
            }}
            aria-label={t('compare')}
            className={`absolute top-10 sm:top-13 right-2 rtl:right-auto rtl:left-2 sm:right-3 sm:rtl:left-3 z-10 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
              isCompared
                ? 'bg-[#181e23] text-white ring-2 ring-emerald-500 scale-105'
                : 'bg-white/90 backdrop-blur-xs text-stone-700 hover:text-stone-950 hover:bg-white'
            }`}
            title={isCompared ? t('clear_compare') : t('compare')}
          >
            <Scale className={`w-3 h-3 ${isCompared ? 'text-emerald-400' : 'text-stone-600'}`} />
            <span className="hidden sm:inline">{t('compare')}</span>
            {isCompared && <Check className="w-3 h-3 text-emerald-400" />}
          </button>
        )}

        {/* Quick Add or Quick Inquire Button on Desktop Hover */}
        <div className="hidden sm:block absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!isInquireOnly && product.stock_quantity <= 0}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all ${
              isInquireOnly
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : product.stock_quantity <= 0
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
            }`}
          >
            {isInquireOnly ? (
              <>
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{t('inquire_about_price')}</span>
              </>
            ) : justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t('added_to_cart')}</span>
              </>
            ) : product.stock_quantity <= 0 ? (
              <span>{t('out_of_stock')}</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('quick_add')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Body - Optimized for 2-column mobile and desktop */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stock Status */}
          <div className="flex items-center justify-between gap-1 mb-1 text-[10px] sm:text-xs">
            <span className="text-stone-600 font-bold tracking-wide uppercase text-[9px] sm:text-[11px] bg-stone-100 px-1.5 sm:px-2 py-0.5 rounded">
              {product.brand}
            </span>
            {isInquireOnly ? (
              <span className="text-emerald-700 text-[9px] sm:text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">{isAr ? 'متاح بالطلب' : 'On Order'}</span>
              </span>
            ) : product.stock_quantity > 0 ? (
              product.stock_quantity <= 5 ? (
                <span className="text-amber-700 text-[9px] sm:text-[10px] font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  {t('low_stock')} ({product.stock_quantity})
                </span>
              ) : (
                <span className="text-emerald-700 text-[9px] sm:text-[10px] font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  {t('in_stock')}
                </span>
              )
            ) : (
              <span className="text-rose-600 text-[9px] sm:text-[10px] font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                {t('out_of_stock')}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-stone-900 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug min-h-[2rem] sm:min-h-[2.5rem]">
            {title}
          </h3>

          {/* Used condition detail teaser if available */}
          {product.condition === 'used' && product.condition_details && (
            <p className="text-[10px] sm:text-[11px] text-amber-900 font-medium bg-amber-50/80 rounded px-1.5 py-0.5 mt-1 line-clamp-1 border border-amber-200/50">
              {product.condition_details}
            </p>
          )}

          {/* Ratings */}
          <div className="flex items-center gap-1 mt-1 sm:mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-stone-800">{product.rating}</span>
            <span className="text-[9px] sm:text-[11px] text-stone-400">({product.reviews_count})</span>
          </div>
        </div>

        {/* Pricing & Mobile Quick Action Button */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-stone-100 flex items-end justify-between gap-1.5">
          {/* Price Displays */}
          <div className="flex-1 min-w-0">
            {isInquireOnly ? (
              <div>
                <div className="flex items-center gap-1 text-emerald-700 font-black text-xs sm:text-sm md:text-base">
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{priceData.primary}</span>
                </div>
                <div className="text-[9px] sm:text-[11px] text-stone-500 font-medium mt-0.5 truncate">
                  {priceData.secondary}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                  <span className="text-xs sm:text-base md:text-lg font-black text-stone-900">
                    {priceData.primary}
                  </span>
                  {priceData.compareAt && (
                    <span className="text-[9px] sm:text-xs text-stone-400 line-through">
                      {priceData.compareAt}
                    </span>
                  )}
                </div>
                {priceData.secondary && (
                  <div className="text-[9px] sm:text-[11px] text-stone-500 font-medium mt-0.5 truncate">
                    ≈ {priceData.secondary}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile One-Tap Quick Action Button */}
          <div className="sm:hidden shrink-0">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!isInquireOnly && product.stock_quantity <= 0}
              aria-label={isInquireOnly ? t('inquire_about_price') : t('quick_add')}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-xs active:scale-90 ${
                isInquireOnly
                  ? 'bg-emerald-600 text-white'
                  : justAdded
                  ? 'bg-emerald-600 text-white'
                  : product.stock_quantity <= 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 text-white active:bg-stone-800'
              }`}
            >
              {isInquireOnly ? (
                <MessageCircle className="w-3.5 h-3.5" />
              ) : justAdded ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
