import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ExchangeRateBar: React.FC = () => {
  const {
    locale,
    exchangeRateData,
    isExchangeRateLoading,
    refreshExchangeRate,
    setIsExchangeModalOpen,
    liraDisplayMode
  } = useStore();

  if (!exchangeRateData) return null;

  const isAr = locale === 'ar';
  const isPositive = exchangeRateData.change_percent >= 0;

  return (
    <div
      id="exchange-rate-live-bar"
      className="bg-slate-900 text-white border-b border-slate-800 text-xs py-1.5 px-3 sm:px-4 select-none"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left / Primary Live Dollar Rates */}
        <div
          id="exchange-rate-clickable-ticker"
          onClick={() => setIsExchangeModalOpen(true)}
          className="flex items-center flex-wrap gap-2.5 sm:gap-3.5 cursor-pointer group hover:opacity-90 transition-opacity"
          title={isAr ? 'انقر لعرض تفاصيل الأسعار والمحول' : 'Click to open details and calculator'}
        >
          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{isAr ? 'الدولار لحظياً' : 'Live USD'}</span>
          </div>

          {/* Dollar Symbol */}
          <span className="font-bold text-slate-300">
            1$ =
          </span>

          {/* Both New & Old Syrian Lira Rates */}
          <div className="flex items-center flex-wrap gap-2 text-[11px] sm:text-xs">
            {/* New Syrian Lira (الجديدة) */}
            <div className="flex items-center gap-1 bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-md font-semibold">
              <span className="text-emerald-400 font-bold">
                {isAr ? 'الجديدة:' : 'New:'}
              </span>
              <span className="font-mono font-bold text-white">
                {exchangeRateData.new_lira.sell.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-300/80">
                {isAr ? 'ل.س' : 'SYP'}
              </span>
            </div>

            {/* Old Syrian Lira (القديمة) */}
            <div className="flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-md font-semibold">
              <span className="text-slate-400">
                {isAr ? 'القديمة:' : 'Old:'}
              </span>
              <span className="font-mono font-bold text-white">
                {exchangeRateData.old_lira.sell.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">
                {isAr ? 'ل.س' : 'SYP'}
              </span>
            </div>
          </div>

          {/* Daily Change Badge (hidden on smallest screens) */}
          <div className={`hidden md:inline-flex items-center gap-0.5 text-[11px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isPositive ? `+${exchangeRateData.change_percent}%` : `${exchangeRateData.change_percent}%`}</span>
          </div>

          {/* Prompt Arrow */}
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-emerald-400/90 group-hover:translate-x-0.5 transition-transform font-medium">
            <Calculator className="w-3 h-3" />
            <span>{isAr ? 'تفاصيل ومحول' : 'Details & Calc'}</span>
          </span>
        </div>

        {/* Right / Refresh Controls */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <button
            id="exchange-bar-refresh-button"
            onClick={(e) => {
              e.stopPropagation();
              refreshExchangeRate();
            }}
            disabled={isExchangeRateLoading}
            title={isAr ? 'تحديث سعر الصرف' : 'Refresh Exchange Rate'}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isExchangeRateLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden xs:inline text-[10px]">
              {isAr ? 'تحديث' : 'Sync'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
