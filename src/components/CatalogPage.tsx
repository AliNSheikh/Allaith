import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductCompareModal } from './ProductCompareModal';
import { Product } from '../types';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowDownUp,
  Search,
  Check,
  Sparkles,
  RefreshCw,
  Zap,
  ShieldCheck,
  Flame,
  Star,
  Scale,
  AlertCircle,
  ArrowLeftRight
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const {
    locale,
    t,
    products,
    categories,
    activeCategoryFilter,
    setActiveCategoryFilter,
    storeSettings
  } = useStore();

  const isAr = locale === 'ar';

  // Filters State
  const [selectedCondition, setSelectedCondition] = useState<'all' | 'new' | 'used'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPriceUSD, setMaxPriceUSD] = useState<number>(2500);
  const [sortBy, setSortBy] = useState<
    'newest' | 'condition_new_first' | 'condition_used_first' | 'price_low' | 'price_high' | 'rating' | 'name_az' | 'name_za'
  >('newest');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compare Feature State (allows comparing up to 2 devices)
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareWarning, setCompareWarning] = useState<string | null>(null);

  const handleToggleCompare = (product: Product) => {
    const isAlreadySelected = comparedProducts.some((p) => p.id === product.id);

    if (isAlreadySelected) {
      setComparedProducts((prev) => prev.filter((p) => p.id !== product.id));
      setCompareWarning(null);
    } else {
      if (comparedProducts.length >= 2) {
        setCompareWarning(
          isAr
            ? 'يمكنك مقارنة هاتفين فقط في المرة الواحدة. قم بإلغاء أحدهما أولاً.'
            : 'You can compare at most two phones at a time. Please remove one first.'
        );
        setTimeout(() => setCompareWarning(null), 4000);
        return;
      }
      setComparedProducts((prev) => [...prev, product]);
      setCompareWarning(null);
    }
  };

  const handleRemoveComparedProduct = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearCompare = () => {
    setComparedProducts([]);
    setCompareWarning(null);
  };

  // Active unarchived products and categories only on storefront catalog
  const activeProducts = useMemo(() => products.filter((p) => !p.is_archived), [products]);
  const activeCategories = useMemo(() => categories.filter((c) => !c.is_archived), [categories]);

  // Extract unique brands from active products
  const brands = useMemo(() => {
    const bSet = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.brand) bSet.add(p.brand);
    });
    return Array.from(bSet);
  }, [activeProducts]);

  // Counts for quick condition badges
  const conditionCounts = useMemo(() => {
    let newCount = 0;
    let usedCount = 0;
    activeProducts.forEach((p) => {
      if (p.condition === 'used') {
        usedCount++;
      } else {
        newCount++;
      }
    });
    return { all: activeProducts.length, new: newCount, used: usedCount };
  }, [activeProducts]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...activeProducts];

    // Condition filter (New vs Used)
    if (selectedCondition === 'new') {
      list = list.filter((p) => p.condition === 'new' || (!p.condition && p.is_new));
    } else if (selectedCondition === 'used') {
      list = list.filter((p) => p.condition === 'used');
    }

    // Alert Tag filter
    if (selectedTag !== 'all') {
      if (selectedTag === 'sale') {
        list = list.filter(
          (p) => (p.compare_at_price && p.compare_at_price > p.price) || (p.tags && p.tags.includes('sale'))
        );
      } else {
        list = list.filter((p) => p.tags && p.tags.includes(selectedTag));
      }
    }

    // Category filter
    if (activeCategoryFilter) {
      list = list.filter((p) => p.category_id === activeCategoryFilter);
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    // In-stock filter
    if (inStockOnly) {
      list = list.filter((p) => p.stock_quantity > 0);
    }

    // Price filter (Normalized via USD)
    if (maxPriceUSD < 2500) {
      list = list.filter((p) => {
        if (p.pricing_type === 'inquire') return true;
        const usdVal = p.price_usd || Math.round(p.price / storeSettings.usd_exchange_rate_syp);
        return usdVal <= maxPriceUSD;
      });
    }

    // Search filter
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.title_ar.toLowerCase().includes(q) ||
          p.title_en.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.condition_details && p.condition_details.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      // Condition Sorting: New First
      if (sortBy === 'condition_new_first') {
        const scoreA = a.condition === 'new' || a.is_new ? 1 : 0;
        const scoreB = b.condition === 'new' || b.is_new ? 1 : 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // Condition Sorting: Used First
      if (sortBy === 'condition_used_first') {
        const scoreA = a.condition === 'used' ? 1 : 0;
        const scoreB = b.condition === 'used' ? 1 : 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name_az') {
        const nameA = isAr ? a.title_ar : a.title_en;
        const nameB = isAr ? b.title_ar : b.title_en;
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'name_za') {
        const nameA = isAr ? a.title_ar : a.title_en;
        const nameB = isAr ? b.title_ar : b.title_en;
        return nameB.localeCompare(nameA);
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [
    products,
    selectedCondition,
    selectedTag,
    activeCategoryFilter,
    selectedBrand,
    inStockOnly,
    maxPriceUSD,
    catalogSearch,
    sortBy,
    isAr,
    storeSettings.usd_exchange_rate_syp
  ]);

  const handleResetFilters = () => {
    setSelectedCondition('all');
    setSelectedTag('all');
    setActiveCategoryFilter(null);
    setSelectedBrand('all');
    setInStockOnly(false);
    setMaxPriceUSD(2500);
    setCatalogSearch('');
    setSortBy('newest');
  };

  const hasActiveFilters =
    selectedCondition !== 'all' ||
    selectedTag !== 'all' ||
    activeCategoryFilter !== null ||
    selectedBrand !== 'all' ||
    inStockOnly ||
    maxPriceUSD < 2500 ||
    catalogSearch.trim() !== '';

  const alertTagsList = [
    { key: 'all', label: t('all') || (isAr ? 'الكل' : 'All'), icon: null },
    { key: 'deal_of_the_day', label: t('tag_deal_of_the_day') || (isAr ? 'عرض اليوم' : 'Daily Deals'), icon: Zap },
    { key: 'lab_certified', label: t('tag_lab_certified') || (isAr ? 'فحص مخبري 100%' : 'Lab Tested'), icon: ShieldCheck },
    { key: 'bestseller', label: t('tag_bestseller') || (isAr ? 'الأكثر طلباً' : 'Bestsellers'), icon: Star },
    { key: 'sale', label: t('tag_sale') || (isAr ? 'تخفيضات' : 'Sale'), icon: Flame }
  ];

  return (
    <div className="py-6 sm:py-10 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Page Title & Sort Bar */}
        <div className="flex flex-col gap-4 mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {t('catalog_title')}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                {t('showing_count', { count: filteredProducts.length })}
              </p>
            </div>

            {/* Controls: Search in catalog, Sorting, Mobile Filter Toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Catalog inline search */}
              <div className="relative flex-1 sm:w-60 min-w-[160px]">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 absolute top-2.5 sm:top-3 left-3 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={isAr ? 'بحث بالاسم أو الكود...' : 'Search catalog...'}
                  className="w-full pl-8 pr-3 rtl:pl-3 rtl:pr-8 sm:pl-9 sm:pr-3 sm:rtl:pl-3 sm:rtl:pr-9 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Select including Condition Sorting (New First / Used First) */}
              <div className="flex items-center gap-1.5">
                <ArrowDownUp className="w-4 h-4 text-stone-500 hidden sm:block" />
                <select
                  id="catalog-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white text-stone-800 shadow-xs focus:outline-none focus:border-stone-900 cursor-pointer"
                >
                  <option value="newest">{t('sort_newest')}</option>
                  <option value="condition_new_first">{t('sort_condition_new_first')}</option>
                  <option value="condition_used_first">{t('sort_condition_used_first')}</option>
                  <option value="price_low">{t('sort_price_low')}</option>
                  <option value="price_high">{t('sort_price_high')}</option>
                  <option value="rating">{t('sort_rating')}</option>
                  <option value="name_az">{t('sort_name_az')}</option>
                  <option value="name_za">{t('sort_name_za')}</option>
                </select>
              </div>

              {/* Compare Quick Action in Toolbar */}
              {comparedProducts.length > 0 && (
                <button
                  id="catalog-quick-compare-btn"
                  type="button"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">{t('compare')}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-mono">
                    {comparedProducts.length}/2
                  </span>
                </button>
              )}

              {/* Mobile Filter Button */}
              <button
                id="mobile-filter-open-btn"
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold shadow-xs active:scale-95"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t('filters')}</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>
          </div>

          {/* Condition Classification Bar (All vs New vs Used) - Highly Accessible on Mobile */}
          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Condition Segmented Pills */}
            <div className="flex items-center p-1 bg-stone-100 rounded-xl max-w-full overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCondition('all')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  selectedCondition === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{t('condition_all') || (isAr ? 'كافة الأجهزة' : 'All Devices')}</span>
                <span className="text-[10px] opacity-60">({conditionCounts.all})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCondition('new')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  selectedCondition === 'new'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('condition_new')}</span>
                <span className="text-[10px] opacity-70">({conditionCounts.new})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCondition('used')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  selectedCondition === 'used'
                    ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('condition_used')}</span>
                <span className="text-[10px] opacity-70">({conditionCounts.used})</span>
              </button>
            </div>

            {/* Alert Tags Filter Chips (Deal of the day, Lab certified, Bestseller, etc.) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-stone-400 hidden xl:inline">
                {isAr ? 'علامات التنبيه:' : 'Alert Tags:'}
              </span>
              {alertTagsList.map((tag) => {
                const Icon = tag.icon;
                const isSelected = selectedTag === tag.key;
                return (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => setSelectedTag(tag.key)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3 text-amber-400" />}
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Layout: Sticky Sidebar + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Desktop Sticky Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-stone-700" />
                <span>{t('filters')}</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('clear_filters')}</span>
                </button>
              )}
            </div>

            {/* Condition Classification Filter (Sidebar) */}
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                {t('condition_label')}
              </h4>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCondition('all')}
                  className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                    selectedCondition === 'all'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span>{t('condition_all') || (isAr ? 'كافة الحالات' : 'All Conditions')}</span>
                  <span className="text-[10px] opacity-70">({conditionCounts.all})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCondition('new')}
                  className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                    selectedCondition === 'new'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('condition_new')}</span>
                  </span>
                  <span className="text-[10px] opacity-70">({conditionCounts.new})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCondition('used')}
                  className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                    selectedCondition === 'used'
                      ? 'bg-amber-400 text-stone-950 border-amber-400 font-black'
                      : 'text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('condition_used')}</span>
                  </span>
                  <span className="text-[10px] opacity-70">({conditionCounts.used})</span>
                </button>
              </div>
            </div>

            {/* Categories Filter */}
            <div className="pt-3 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                {t('categories')}
              </h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter(null)}
                  className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    activeCategoryFilter === null
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{t('all')}</span>
                  <span className="text-[11px] opacity-70">({activeProducts.length})</span>
                </button>

                {activeCategories.map((cat) => {
                  const catCount = activeProducts.filter((p) => p.category_id === cat.id).length;
                  const isSelected = activeCategoryFilter === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat.id)}
                      className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>{isAr ? cat.name_ar : cat.name_en}</span>
                      <span className="text-[11px] opacity-70">({catCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Currency Price Range Slider ($ USD and SYP) */}
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span>{t('price_range')}</span>
                <span className="text-emerald-700 font-mono font-black">
                  ${maxPriceUSD.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium mb-2">
                {isAr
                  ? `حتى ${(maxPriceUSD * storeSettings.usd_exchange_rate_syp).toLocaleString()} ل.س`
                  : `Up to ${(maxPriceUSD * storeSettings.usd_exchange_rate_syp).toLocaleString()} SYP`}
              </p>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={maxPriceUSD}
                onChange={(e) => setMaxPriceUSD(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                <span>$50</span>
                <span>$2,500</span>
              </div>
            </div>

            {/* Brands Filter */}
            <div className="pt-3 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                {t('brand')}
              </h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className={`w-full text-left rtl:text-right px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedBrand === 'all'
                      ? 'font-bold text-stone-900 bg-stone-100'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {t('all')}
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left rtl:text-right px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedBrand === brand
                        ? 'font-bold text-stone-900 bg-stone-100'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{brand}</span>
                    {selectedBrand === brand && <Check className="w-3.5 h-3.5 text-stone-900" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Checkbox */}
            <div className="pt-3 border-t border-stone-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 accent-stone-900"
                />
                <span className="text-xs font-semibold text-stone-800">
                  {t('in_stock_only')}
                </span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area - STRICTLY 2-COLUMNS ON MOBILE (grid-cols-2) */}
          <main className="lg:col-span-9">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    enableCompare={true}
                    isCompared={comparedProducts.some((p) => p.id === product.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  {t('no_results')}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-5">
                  {isAr
                    ? 'جرب ضبط معايير البحث أو تصفير الفلاتر للعثور على الأجهزة المتاحة.'
                    : 'Try loosening your search filters to find available devices.'}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  {t('clear_filters')}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="font-extrabold text-stone-900">{t('filters')}</h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Condition Filter (Mobile Drawer) */}
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  {t('condition_label')}
                </h4>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCondition('all')}
                    className={`w-full text-right rtl:text-right ltr:text-left p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                      selectedCondition === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span>{t('condition_all') || (isAr ? 'كافة الحالات' : 'All Conditions')}</span>
                    <span className="text-[10px] opacity-70">({conditionCounts.all})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCondition('new')}
                    className={`w-full text-right rtl:text-right ltr:text-left p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                      selectedCondition === 'new' ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span>✨ {t('condition_new')}</span>
                    <span className="text-[10px] opacity-70">({conditionCounts.new})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCondition('used')}
                    className={`w-full text-right rtl:text-right ltr:text-left p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                      selectedCondition === 'used' ? 'bg-amber-400 text-stone-950 font-black' : 'bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span>🔄 {t('condition_used')}</span>
                    <span className="text-[10px] opacity-70">({conditionCounts.used})</span>
                  </button>
                </div>
              </div>

              {/* Alert Tag Filter (Mobile Drawer) */}
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  {isAr ? 'علامات التنبيه' : 'Alert Tags'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {alertTagsList.map((tag) => (
                    <button
                      key={tag.key}
                      type="button"
                      onClick={() => setSelectedTag(tag.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        selectedTag === tag.key
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  {t('categories')}
                </h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryFilter(null);
                    }}
                    className={`w-full text-right rtl:text-right ltr:text-left p-2 rounded-lg text-xs font-medium ${
                      activeCategoryFilter === null ? 'bg-stone-900 text-white font-bold' : 'hover:bg-stone-100'
                    }`}
                  >
                    {t('all')}
                  </button>
                  {activeCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveCategoryFilter(c.id);
                      }}
                      className={`w-full text-right rtl:text-right ltr:text-left p-2 rounded-lg text-xs font-medium ${
                        activeCategoryFilter === c.id ? 'bg-stone-900 text-white font-bold' : 'hover:bg-stone-100'
                      }`}
                    >
                      {isAr ? c.name_ar : c.name_en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                  <span>{t('price_range')}</span>
                  <span className="font-mono text-emerald-700">${maxPriceUSD}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="50"
                  value={maxPriceUSD}
                  onChange={(e) => setMaxPriceUSD(Number(e.target.value))}
                  className="w-full accent-stone-900"
                />
              </div>

              {/* In stock */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-stone-900"
                />
                <span className="text-xs font-semibold text-stone-800">{t('in_stock_only')}</span>
              </label>
            </div>

            <div className="pt-5 border-t border-stone-200 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold"
              >
                {t('clear_filters')}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
              >
                {isAr ? 'عرض النتائج' : 'Show Results'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Compare Dock Bar when 1 or 2 products selected */}
      {comparedProducts.length > 0 && (
        <aside
          id="catalog-compare-floating-dock"
          aria-label="Comparison dock"
          className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 bg-[#181e23]/95 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-stone-700/80 flex items-center justify-between gap-3 max-w-xl w-[calc(100%-1.5rem)] sm:w-auto animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Thumbnails of selected phones */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center -space-x-2 rtl:space-x-reverse">
              {comparedProducts.map((p) => (
                <div
                  key={p.id}
                  className="relative group w-11 h-11 rounded-xl bg-stone-800 border border-stone-600 overflow-hidden shadow-xs shrink-0"
                >
                  <img
                    src={p.images[0]}
                    alt={isAr ? p.title_ar : p.title_en}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveComparedProduct(p.id);
                    }}
                    className="absolute inset-0 bg-rose-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title={isAr ? 'إزالة' : 'Remove'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {comparedProducts.length < 2 && (
                <div className="w-11 h-11 rounded-xl border-2 border-dashed border-stone-600 bg-stone-800/40 flex items-center justify-center text-stone-400 text-xs font-bold shrink-0">
                  +1
                </div>
              )}
            </div>

            <div className="text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('compare')} ({comparedProducts.length}/2)</span>
              </div>
              <p className="text-[10px] text-stone-400 line-clamp-1 max-w-[180px] sm:max-w-xs">
                {comparedProducts.length === 1
                  ? isAr
                    ? 'اختر هاتفاً ثانياً للمقارنة'
                    : 'Select a 2nd phone to compare'
                  : isAr
                  ? 'جاهز لمقارنة المواصفات جنباً إلى جنب'
                  : 'Ready for side-by-side comparison'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="open-compare-modal-btn"
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${
                comparedProducts.length === 2
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>
                {comparedProducts.length === 2
                  ? isAr
                    ? 'عرض المقارنة'
                    : 'Compare Now'
                  : isAr
                  ? 'عرض (1/2)'
                  : 'View (1/2)'}
              </span>
            </button>

            <button
              id="clear-compare-btn"
              type="button"
              onClick={handleClearCompare}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
              title={isAr ? 'إلغاء التحديد' : 'Clear'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Compare Limit Toast Notification */}
      {compareWarning && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 max-w-md"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed flex-1">
            {compareWarning}
          </p>
          <button
            type="button"
            onClick={() => setCompareWarning(null)}
            className="p-1 text-stone-400 hover:text-white rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Side-by-Side Specifications Comparison Modal */}
      <ProductCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={comparedProducts}
        onRemoveProduct={handleRemoveComparedProduct}
      />
    </div>
  );
};
