import React from 'react';

interface LaithLogoProps {
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'icon' | 'emblem';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const LaithLogo: React.FC<LaithLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
  showText = true,
}) => {
  const iconSizeClass = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  }[size];

  // If emblem / icon only:
  if (variant === 'icon' || variant === 'emblem' || !showText) {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${iconSizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="laithSlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2E3741" />
              <stop offset="50%" stopColor="#1B2228" />
              <stop offset="100%" stopColor="#12171B" />
            </linearGradient>
            <linearGradient id="laithSage" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#729A84" />
              <stop offset="60%" stopColor="#58816C" />
              <stop offset="100%" stopColor="#466856" />
            </linearGradient>
            <linearGradient id="laithSheen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CCD7D0" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#A1B2A8" />
            </linearGradient>
            <clipPath id="laithCircle">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          <g clipPath="url(#laithCircle)">
            {/* Sage Green background */}
            <rect x="0" y="0" width="100" height="100" fill="url(#laithSage)" />
            {/* Slate Metallic Phone silhouette */}
            <path d="M0 0 L0 100 L56 100 L56 0 Z" fill="url(#laithSlate)" />
            <rect x="15" y="16" width="26" height="68" rx="5" fill="#161C21" stroke="#2D3842" strokeWidth="1.5" />
            {/* Central dividing diagonal cuts with sheen */}
            <path d="M48 0 L55 28 L46 56 L60 84 L52 100" stroke="url(#laithSheen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="74" r="2.2" fill="#58816C" />
          </g>
          {/* Subtle outer borders */}
          <circle cx="50" cy="50" r="48" stroke="#1B2228" strokeWidth="1.5" fill="none" opacity="0.35" />
          <circle cx="50" cy="50" r="47.5" stroke="url(#laithSheen)" strokeWidth="1" fill="none" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // Vertical stacked variant
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <div className={iconSizeClass}>
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="vSlate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2E3741" />
                <stop offset="50%" stopColor="#1B2228" />
                <stop offset="100%" stopColor="#12171B" />
              </linearGradient>
              <linearGradient id="vSage" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#729A84" />
                <stop offset="60%" stopColor="#58816C" />
                <stop offset="100%" stopColor="#466856" />
              </linearGradient>
              <linearGradient id="vSheen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CCD7D0" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#A1B2A8" />
              </linearGradient>
              <clipPath id="vCircle">
                <circle cx="50" cy="50" r="48" />
              </clipPath>
            </defs>
            <g clipPath="url(#vCircle)">
              <rect x="0" y="0" width="100" height="100" fill="url(#vSage)" />
              <path d="M0 0 L0 100 L56 100 L56 0 Z" fill="url(#vSlate)" />
              <rect x="15" y="16" width="26" height="68" rx="5" fill="#161C21" stroke="#2D3842" strokeWidth="1.5" />
              <path d="M48 0 L55 28 L46 56 L60 84 L52 100" stroke="url(#vSheen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="28" cy="74" r="2.2" fill="#58816C" />
            </g>
            <circle cx="50" cy="50" r="48" stroke="#1B2228" strokeWidth="1.5" fill="none" opacity="0.35" />
          </svg>
        </div>

        <div className="mt-3">
          <h2 className="font-serif font-black text-2xl text-stone-900 tracking-wide leading-none" style={{ fontFamily: "'Amiri', serif" }}>
            اللَّيْثُ لِلِاتِّصَالَاتْ
          </h2>
          <p className="font-sans font-extrabold text-[11px] text-stone-600 tracking-[0.25em] uppercase mt-1">
            AL-LAITH TELECOM
          </p>
        </div>
      </div>
    );
  }

  // Default: Horizontal brand mark
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Emblem */}
      <div className={`relative shrink-0 ${iconSizeClass}`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-xs">
          <defs>
            <linearGradient id="hSlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2E3741" />
              <stop offset="50%" stopColor="#1B2228" />
              <stop offset="100%" stopColor="#12171B" />
            </linearGradient>
            <linearGradient id="hSage" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#729A84" />
              <stop offset="60%" stopColor="#58816C" />
              <stop offset="100%" stopColor="#466856" />
            </linearGradient>
            <linearGradient id="hSheen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CCD7D0" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#A1B2A8" />
            </linearGradient>
            <clipPath id="hCircle">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>
          <g clipPath="url(#hCircle)">
            <rect x="0" y="0" width="100" height="100" fill="url(#hSage)" />
            <path d="M0 0 L0 100 L56 100 L56 0 Z" fill="url(#hSlate)" />
            <rect x="15" y="16" width="26" height="68" rx="5" fill="#161C21" stroke="#2D3842" strokeWidth="1.5" />
            <path d="M48 0 L55 28 L46 56 L60 84 L52 100" stroke="url(#hSheen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="74" r="2.2" fill="#58816C" />
          </g>
          <circle cx="50" cy="50" r="48" stroke="#1B2228" strokeWidth="1.5" fill="none" opacity="0.3" />
          <circle cx="50" cy="50" r="47.5" stroke="url(#hSheen)" strokeWidth="1" fill="none" opacity="0.6" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col text-right rtl:text-right ltr:text-left leading-tight">
        <span
          className="text-base sm:text-lg font-black text-stone-900 tracking-tight"
          style={{ fontFamily: "'Amiri', 'Fustat', serif" }}
        >
          اللَّيْثُ لِلِاتِّصَالَاتْ
        </span>
        <span className="text-[9px] sm:text-[10px] font-extrabold text-stone-500 font-sans tracking-[0.2em] uppercase">
          AL-LAITH TELECOM
        </span>
      </div>
    </div>
  );
};
