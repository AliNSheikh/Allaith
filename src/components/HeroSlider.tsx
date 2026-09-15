import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { initialHeroSlides } from '../data/initialData';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';

export const HeroSlider: React.FC = () => {
  const { locale, t, setCurrentView, setActiveCategoryFilter } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = initialHeroSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];
  const isAr = locale === 'ar';

  return (
    <section className="relative w-full bg-stone-900 overflow-hidden">
      {/* Slide Visuals */}
      <div className="relative min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Background Image with Ambient Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/75 to-transparent rtl:bg-gradient-to-l" />
        </div>

        {/* Slide Content Box */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10 w-full">
          <div className="max-w-2xl text-white space-y-4 sm:space-y-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isAr ? slide.tag_ar : slide.tag_en}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-stone-50">
              {isAr ? slide.title_ar : slide.title_en}
            </h1>

            {/* Subtitle */}
            <p className="text-stone-300 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-xl">
              {isAr ? slide.subtitle_ar : slide.subtitle_en}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                id="hero-cta-shop-now-btn"
                type="button"
                onClick={() => {
                  setActiveCategoryFilter(null);
                  setCurrentView('catalog');
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-stone-950 font-bold text-sm sm:text-base hover:bg-stone-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>{isAr ? slide.button_text_ar : slide.button_text_en}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                id="hero-cta-explore-btn"
                type="button"
                onClick={() => {
                  setActiveCategoryFilter(null);
                  setCurrentView('catalog');
                }}
                className="px-5 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white font-medium text-sm sm:text-base hover:bg-white/20 transition-all"
              >
                {t('explore_collection')}
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="absolute bottom-8 right-8 rtl:right-auto rtl:left-8 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/10"
          >
            {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/10"
          >
            {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </section>
  );
};
