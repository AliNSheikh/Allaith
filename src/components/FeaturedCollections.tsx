import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ArrowRight, ArrowLeft, Layers } from 'lucide-react';

export const FeaturedCollections: React.FC = () => {
  const {
    locale,
    t,
    products,
    categories,
    setCurrentView,
    setActiveCategoryFilter
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [showAll, setShowAll] = useState<boolean>(false);
  const isAr = locale === 'ar';

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter((p) => p.category_id === activeTab);

  const INITIAL_LIMIT = 10;
  const hasMore = filteredProducts.length > INITIAL_LIMIT;
  const displayedProducts = showAll ? filteredProducts : filteredProducts.slice(0, INITIAL_LIMIT);

  const handleTabChange = (catId: string) => {
    setActiveTab(catId);
    setShowAll(false);
  };

  const handleExploreMore = () => {
    setActiveCategoryFilter(activeTab === 'all' ? null : activeTab);
    setCurrentView('catalog');
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5 text-stone-600" />
              <span>{isAr ? 'مختارات الموسم والجديد' : 'Seasonal Curated Picks'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {t('featured_products')}
            </h2>
          </div>

          {/* Collection Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {t('all')}
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleTabChange(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === cat.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {isAr ? cat.name_ar : cat.name_en}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid - Strict 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination / View All / Explore Action */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasMore && !showAll && (
            <button
              id="homepage-view-all-products-btn"
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 text-white hover:bg-stone-800 font-bold text-sm transition-all shadow-md active:scale-95"
            >
              <span>
                {isAr ? `عرض الكل (${filteredProducts.length} منتج)` : `View All (${filteredProducts.length} Products)`}
              </span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          )}

          {hasMore && showAll && (
            <button
              id="homepage-collapse-products-btn"
              type="button"
              onClick={() => setShowAll(false)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-sm transition-all"
            >
              <span>{isAr ? 'عرض 10 عناصر فقط' : 'Show Only 10 Items'}</span>
            </button>
          )}

          <button
            id="view-full-catalog-btn"
            type="button"
            onClick={handleExploreMore}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all ${
              !hasMore || showAll
                ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-md'
                : 'border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>{t('explore_collection')}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </section>
  );
};
