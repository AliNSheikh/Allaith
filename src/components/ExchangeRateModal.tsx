import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Calculator,
  ArrowRightLeft,
  Check,
  Building2,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ExchangeRateModal: React.FC = () => {
  const {
    locale,
    t,
    exchangeRateData,
    isExchangeRateLoading,
    refreshExchangeRate,
    isExchangeModalOpen,
    setIsExchangeModalOpen,
    liraDisplayMode,
    setLiraDisplayMode,
    applyLiveRateToCatalog
  } = useStore();

  const [calcUsd, setCalcUsd] = useState<string>('100');
  const [calcMode, setCalcMode] = useState<'usd-to-syp' | 'syp-to-usd'>('usd-to-syp');
  const [selectedCity, setSelectedCity] = useState<'damascus' | 'alhasakah'>('damascus');

  if (!isExchangeModalOpen || !exchangeRateData) return null;

  const isAr = locale === 'ar';
  const isPositiveChange = exchangeRateData.change_percent >= 0;

  // Selected city data
  const cityData = selectedCity === 'alhasakah' && exchangeRateData.cities?.alhasakah
    ? exchangeRateData.cities.alhasakah
    : {
        name_ar: 'دمشق',
        buy: exchangeRateData.old_lira.buy,
        sell: exchangeRateData.old_lira.sell,
        change: exchangeRateData.change_percent,
        new_buy: exchangeRateData.new_lira.buy,
        new_sell: exchangeRateData.new_lira.sell
      };

  // Calculator calculations
  const usdNumber = parseFloat(calcUsd) || 0;
  const calculatedOldSyp = Math.round(usdNumber * cityData.sell);
  const calculatedNewSyp = Number(((usdNumber * cityData.sell) / 100).toFixed(2));

  const formatTime = (isoString?: string) => {
    if (!isoString) return isAr ? 'منذ قليل' : 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(isAr ? 'ar-SY' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id="exchange-rate-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsExchangeModalOpen(false)}
    >
      <div
        id="exchange-rate-modal-content"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
              $
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('live_dollar_rate')}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {isAr ? 'لحظي مباشر' : 'Live'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>{isAr ? 'المصدر المعتمد:' : 'Source:'}</span>
                <a
                  href="https://sp-today.com/en"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  sp-today.com
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(exchangeRateData.updated_at || exchangeRateData.fetched_at)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-rate-button"
              onClick={() => refreshExchangeRate(true)}
              disabled={isExchangeRateLoading}
              title={t('refresh_rate')}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isExchangeRateLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
            <button
              id="close-exchange-modal-button"
              onClick={() => setIsExchangeModalOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* City Selector */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl text-sm font-medium">
            <div className="flex items-center gap-2 text-xs text-slate-500 px-2 font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'السوق المحلي:' : 'Market:'}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                id="select-city-damascus"
                onClick={() => setSelectedCity('damascus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCity === 'damascus'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('damascus_market')}
              </button>
              {exchangeRateData.cities?.alhasakah && (
                <button
                  id="select-city-alhasakah"
                  onClick={() => setSelectedCity('alhasakah')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCity === 'alhasakah'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {t('alhasakah_market')}
                </button>
              )}
            </div>
          </div>

          {/* Comparative Cards: New vs Old Syrian Lira */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Syrian Lira Card (بحذف صفرين) */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    جديدة
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t('new_syrian_lira')}
                    </h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                      {t('two_zeros_removed')}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  New SYP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('buy_price')} (شراء)
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {cityData.new_buy.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">ليرة جديدة لكل 1$</span>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('sell_price')} (مبيع)
                  </span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {cityData.new_sell.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                    ليرة جديدة لكل 1$
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-emerald-500/10">
                <span>المعادلة الرسمية:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  1 ل.س جديدة = 100 ل.س قديمة
                </span>
              </div>
            </div>

            {/* Old Syrian Lira Card */}
            <div className="relative p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-600 text-white font-bold text-xs flex items-center justify-center">
                    قديمة
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t('old_syrian_lira')}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      القيمة الرقمية التقليدية المتداولة
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  Old SYP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('buy_price')} (شراء)
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {cityData.buy.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">ل.س قديمة لكل 1$</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('sell_price')} (مبيع)
                  </span>
                  <div className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {cityData.sell.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">ل.س قديمة لكل 1$</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>حركة السوق:</span>
                <span className={`inline-flex items-center gap-1 font-bold ${isPositiveChange ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositiveChange ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {cityData.change >= 0 ? `+${cityData.change}%` : `${cityData.change}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Real-Time Currency Calculator */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('converter_title')}
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                {isAr ? `حسب سعر المبيع: 1$ = ${cityData.sell.toLocaleString()} ل.س` : `Rate: 1$ = ${cityData.sell.toLocaleString()} SYP`}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  {isAr ? 'المبلغ بالدولار الأمريكي ($):' : 'Amount in USD ($):'}
                </label>
                <div className="relative">
                  <input
                    id="calc-usd-input"
                    type="number"
                    min="1"
                    step="1"
                    value={calcUsd}
                    onChange={(e) => setCalcUsd(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="100"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    $
                  </span>
                </div>
              </div>

              {/* Conversion Output Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* New Lira Equivalent */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                    {isAr ? 'بالليرة السورية الجديدة:' : 'In New Syrian Lira:'}
                  </span>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {calculatedNewSyp.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600/80">ليرة جديدة</span>
                </div>

                {/* Old Lira Equivalent */}
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                    {isAr ? 'بالليرة السورية القديمة:' : 'In Old Syrian Lira:'}
                  </span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {calculatedOldSyp.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">ليرة قديمة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Store Display Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {t('display_preference')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                id="display-both-liras-button"
                onClick={() => setLiraDisplayMode('both')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  liraDisplayMode === 'both'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {liraDisplayMode === 'both' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{t('display_both_liras')}</span>
              </button>

              <button
                id="display-new-lira-button"
                onClick={() => setLiraDisplayMode('new')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  liraDisplayMode === 'new'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {liraDisplayMode === 'new' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{t('display_new_lira')}</span>
              </button>

              <button
                id="display-old-lira-button"
                onClick={() => setLiraDisplayMode('old')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  liraDisplayMode === 'old'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {liraDisplayMode === 'old' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{t('display_old_lira')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <button
            id="apply-live-rate-button"
            onClick={applyLiveRateToCatalog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('apply_to_catalog')}</span>
          </button>

          <button
            id="close-rate-modal-btn"
            onClick={() => setIsExchangeModalOpen(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            {locale === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
