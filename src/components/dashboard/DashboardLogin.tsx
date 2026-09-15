import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const DashboardLogin: React.FC = () => {
  const { locale, loginAdmin, returnToStorefront, storeSettings } = useStore();
  const isAr = locale === 'ar';

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('laith2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const ok = loginAdmin(username, password);
      setIsLoading(false);
      if (!ok) {
        setError(isAr ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
      }
    }, 400);
  };

  const storeLogo = storeSettings.custom_logo_url || storeSettings.logo_url || '/al-laith-logo-horizontal.svg';

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4 relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-stone-950/80 backdrop-blur-xl border border-stone-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center mb-2">
            <img
              src={storeLogo}
              alt="Al-Laith Telecom"
              className="h-9 object-contain filter drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-xl font-black text-stone-100 mt-2">
            {isAr ? 'لوحة تحكم الإدارة المركزية' : 'Al-Laith Admin Portal'}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {isAr ? 'منطقة إدارية خاصة ومحمية - متجر الليث للاتصالات' : 'Protected Management Console - Al-Laith Telecom'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              {isAr ? 'اسم المستخدم' : 'Username'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-stone-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-stone-900/90 border border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-100 rounded-xl py-2.5 ps-10 pe-3 text-sm transition-all outline-none"
                placeholder={isAr ? 'اسم مستخدم المدير' : 'Admin username'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-stone-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-stone-900/90 border border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-100 rounded-xl py-2.5 ps-10 pe-3 text-sm transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Default Credentials Hint for Admin Ease */}
          <div className="p-3 bg-stone-900/60 border border-stone-800/80 rounded-xl text-[11px] text-stone-400 space-y-1">
            <div className="font-semibold text-stone-300 flex items-center justify-between">
              <span>{isAr ? 'بيانات الدخول الافتراضية للمدير:' : 'Default Admin Credentials:'}</span>
              <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded">
                {isAr ? 'قابلة للتغيير' : 'Configurable'}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span>{isAr ? 'المستخدم:' : 'User:'} <strong className="text-stone-200">admin</strong></span>
              <span>{isAr ? 'كلمة المرور:' : 'Pass:'} <strong className="text-stone-200">laith2026</strong></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isAr ? 'تسجيل الدخول للوحة التحكم' : 'Log In to Dashboard'}</span>
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </form>

        {/* Return to storefront */}
        <div className="mt-6 pt-6 border-t border-stone-800 text-center">
          <button
            type="button"
            onClick={returnToStorefront}
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isAr ? '← العودة إلى واجهة متجر الليث' : '← Return to Al-Laith Store'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
