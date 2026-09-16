import React from 'react';

/**
 * Shimmer effect animation classes
 */
const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-stone-200/50 before:to-transparent";
const darkShimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-stone-700/40 before:to-transparent";

/**
 * ProductCardSkeleton
 * Matches the layout and dimensions of ProductCard for zero layout shift
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-2xl border border-stone-200/80 p-2.5 sm:p-4 flex flex-col justify-between shadow-xs"
    >
      <div className="space-y-3">
        {/* Top badges & action buttons placeholder */}
        <div className="flex items-center justify-between">
          <div className={`h-5 w-16 rounded-full bg-stone-200 ${shimmerClass}`} />
          <div className={`h-7 w-7 rounded-full bg-stone-100 ${shimmerClass}`} />
        </div>

        {/* Product Image Stage Placeholder */}
        <div className={`aspect-square w-full rounded-xl bg-stone-100 flex items-center justify-center ${shimmerClass}`}>
          <div className="w-12 h-12 rounded-2xl bg-stone-200/60" />
        </div>

        {/* Brand & Stock Pill */}
        <div className="flex items-center justify-between pt-1">
          <div className={`h-3.5 w-14 rounded-md bg-stone-200 ${shimmerClass}`} />
          <div className={`h-3.5 w-12 rounded-md bg-emerald-100/60 ${shimmerClass}`} />
        </div>

        {/* Product Title Lines */}
        <div className="space-y-1.5">
          <div className={`h-4 w-11/12 rounded bg-stone-200 ${shimmerClass}`} />
          <div className={`h-4 w-3/4 rounded bg-stone-200/70 ${shimmerClass}`} />
        </div>

        {/* Amazon-style Specs Chips */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className={`h-4 w-14 rounded-md bg-stone-100 ${shimmerClass}`} />
          <div className={`h-4 w-12 rounded-md bg-stone-100 ${shimmerClass}`} />
        </div>
      </div>

      {/* Pricing & Cart Action Area */}
      <div className="mt-4 pt-3 border-t border-stone-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className={`h-5 w-24 rounded bg-stone-200 ${shimmerClass}`} />
            <div className={`h-3 w-16 rounded bg-stone-100 ${shimmerClass}`} />
          </div>
          <div className={`h-8 w-8 rounded-xl bg-stone-100 ${shimmerClass}`} />
        </div>
      </div>
    </div>
  );
};

/**
 * ProductGridSkeleton
 * Responsive grid matching Catalog and Featured Collections layouts
 */
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div
      aria-label="Loading products..."
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`prod-skel-${i}`} />
      ))}
    </div>
  );
};

/**
 * HeroSliderSkeleton
 * Image Carousel skeleton matching the homepage hero slider
 */
export const HeroSliderSkeleton: React.FC = () => {
  return (
    <section aria-hidden="true" className="relative w-full bg-stone-900 overflow-hidden">
      <div className="relative min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Shimmering Dark Stage Background */}
        <div className={`absolute inset-0 bg-stone-950 ${darkShimmerClass}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/80 to-stone-950/40" />
        </div>

        {/* Content Box */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10 w-full">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            {/* Pill Tag */}
            <div className={`h-7 w-32 rounded-full bg-stone-800 border border-stone-700/60 ${darkShimmerClass}`} />

            {/* Headline */}
            <div className="space-y-3">
              <div className={`h-9 sm:h-12 w-11/12 rounded-xl bg-stone-800 ${darkShimmerClass}`} />
              <div className={`h-9 sm:h-12 w-4/5 rounded-xl bg-stone-800/80 ${darkShimmerClass}`} />
            </div>

            {/* Subtitle */}
            <div className="space-y-2 pt-1">
              <div className={`h-4 w-full max-w-lg rounded bg-stone-800/60 ${darkShimmerClass}`} />
              <div className={`h-4 w-3/4 max-w-md rounded bg-stone-800/50 ${darkShimmerClass}`} />
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <div className={`h-12 w-36 rounded-full bg-stone-800 ${darkShimmerClass}`} />
              <div className={`h-12 w-32 rounded-full bg-stone-800/60 border border-stone-700/50 ${darkShimmerClass}`} />
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <div className="w-8 h-2 rounded-full bg-stone-700" />
          <div className="w-2 h-2 rounded-full bg-stone-800" />
          <div className="w-2 h-2 rounded-full bg-stone-800" />
        </div>
      </div>
    </section>
  );
};

/**
 * ProductDetailSkeleton
 * Skeleton for ProductDetailPage including gallery and specs
 */
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className={`h-4 w-16 rounded bg-stone-200 ${shimmerClass}`} />
        <div className="h-4 w-3 text-stone-300">/</div>
        <div className={`h-4 w-24 rounded bg-stone-200 ${shimmerClass}`} />
        <div className="h-4 w-3 text-stone-300">/</div>
        <div className={`h-4 w-36 rounded bg-stone-200 ${shimmerClass}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Carousel / Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Stage Image */}
          <div className={`aspect-square w-full rounded-3xl bg-stone-100 border border-stone-200/80 ${shimmerClass}`} />

          {/* Thumbnail Carousel Row */}
          <div className="flex items-center gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`thumb-skel-${i}`}
                className={`w-20 h-20 rounded-xl bg-stone-100 border border-stone-200 shrink-0 ${shimmerClass}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Details, Price, Options & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className={`h-4 w-24 rounded-full bg-stone-200 ${shimmerClass}`} />
            <div className={`h-8 w-4/5 rounded-xl bg-stone-200 ${shimmerClass}`} />
            <div className={`h-4 w-40 rounded bg-stone-100 ${shimmerClass}`} />
          </div>

          {/* Price Box */}
          <div className={`p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 ${shimmerClass}`}>
            <div className="h-8 w-48 rounded bg-stone-200" />
            <div className="h-4 w-32 rounded bg-stone-100" />
          </div>

          {/* Attributes / Variants */}
          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-stone-200" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-20 rounded-xl bg-stone-100 border border-stone-200" />
              <div className="h-9 w-20 rounded-xl bg-stone-100 border border-stone-200" />
              <div className="h-9 w-20 rounded-xl bg-stone-100 border border-stone-200" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className={`h-12 w-full rounded-2xl bg-stone-200 ${shimmerClass}`} />
            <div className={`h-12 w-full rounded-2xl bg-emerald-100/70 border border-emerald-200 ${shimmerClass}`} />
          </div>

          {/* Specs Table Skeleton */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <div className="h-4 w-32 rounded bg-stone-200" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="h-10 rounded-xl bg-stone-50 border border-stone-200/60" />
              <div className="h-10 rounded-xl bg-stone-50 border border-stone-200/60" />
              <div className="h-10 rounded-xl bg-stone-50 border border-stone-200/60" />
              <div className="h-10 rounded-xl bg-stone-50 border border-stone-200/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
