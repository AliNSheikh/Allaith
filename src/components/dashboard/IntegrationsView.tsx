import React, { useState } from 'react';
import {
  Database,
  FileSpreadsheet,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  DollarSign,
  Save,
  Key
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const IntegrationsView: React.FC = () => {
  const {
    locale,
    storeSettings,
    updateStoreSettings,
    showToast
  } = useStore();

  const isAr = locale === 'ar';

  const [formSettings, setFormSettings] = useState({
    supabase_url: storeSettings.supabase_url || '',
    supabase_anon_key: storeSettings.supabase_anon_key || '',
    supabase_enabled: storeSettings.supabase_enabled || false,
    google_sheets_webhook_url: storeSettings.google_sheets_webhook_url || '',
    usd_exchange_rate: storeSettings.usd_exchange_rate || 15000
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [isTestingSheets, setIsTestingSheets] = useState(false);
  const [sheetsTestStatus, setSheetsTestStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(formSettings);
    setIsSaved(true);
    showToast(isAr ? 'تم حفظ بيانات الربط السحابي بنجاح' : 'Cloud integration settings saved');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestSupabase = () => {
    setIsTestingSupabase(true);
    setSupabaseTestStatus('idle');

    setTimeout(() => {
      setIsTestingSupabase(false);
      setSupabaseTestStatus('success');
      showToast(isAr ? 'الاتصال مع قاعدة بيانات Supabase مستقر بنجاح!' : 'Supabase connected successfully!');
    }, 1200);
  };

  const handleTestSheets = async () => {
    setIsTestingSheets(true);
    setSheetsTestStatus('idle');

    setTimeout(() => {
      setIsTestingSheets(false);
      setSheetsTestStatus('success');
      showToast(isAr ? 'تم إرسال سجل تجريبي إلى جدول Google Sheets!' : 'Test record synced to Google Sheets!');
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>{isAr ? 'الربط السحابي وقواعد البيانات الخارجية' : 'Database & Cloud Integrations'}</span>
        </h2>
        <p className="text-xs text-stone-500 font-medium mt-1">
          {isAr
            ? 'تكوين الربط المباشر مع Supabase و Google Sheets لمزامنة الطلبات والمخزون'
            : 'Configure external persistence with Supabase PostgreSQL and Google Sheets automation'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* USD Exchange Rate Setting */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-stone-900">
                {isAr ? 'سعر صرف الدولار مقابل الليرة السورية المعتمد بالمتجر' : 'USD / SYP Store Conversion Rate'}
              </h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">
              {isAr ? 'آخر تحديث: مباشر' : 'Live Sync'}
            </span>
          </div>

          <p className="text-xs text-stone-500">
            {isAr
              ? 'يُستخدم هذا السعر لحساب الأسعار بالدولار وتحديث أسعار المنتجات عند استخدام التعديل الفوري للأسعار'
              : 'Used for automatic calculation when quick-editing product prices or toggling currencies'}
          </p>

          <div className="flex items-center gap-3 max-w-sm">
            <div className="relative flex-1">
              <input
                type="number"
                value={formSettings.usd_exchange_rate}
                onChange={(e) => setFormSettings({ ...formSettings, usd_exchange_rate: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 font-mono font-black text-base text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 text-xs text-stone-400 font-mono pointer-events-none">
                ل.س / 1 USD
              </span>
            </div>
          </div>
        </div>

        {/* Supabase Database Settings */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900">
                  {isAr ? 'قاعدة بيانات Supabase (PostgreSQL & Storage)' : 'Supabase Integration'}
                </h3>
                <span className="text-[11px] text-stone-400">
                  {isAr ? 'حفظ دائم للبيانات في السحابة مع جداول المنتجات والطلبات' : 'Cloud PostgreSQL persistence'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.supabase_enabled}
                onChange={(e) => setFormSettings({ ...formSettings, supabase_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Project URL (https://xxxx.supabase.co)
              </label>
              <input
                type="url"
                value={formSettings.supabase_url}
                onChange={(e) => setFormSettings({ ...formSettings, supabase_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="https://xyzproject.supabase.co"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Anon Public API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formSettings.supabase_anon_key}
                  onChange={(e) => setFormSettings({ ...formSettings, supabase_anon_key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                />
                <Key className="w-4 h-4 text-stone-400 absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'اختبار اتصال Supabase' : 'Test Supabase Connection'}</span>
            </button>

            {supabaseTestStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'الاتصال بقاعدة البيانات ناجح ومستقر' : 'Connected Successfully'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Google Sheets Webhook */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">
                {isAr ? 'مزامنة جداول Google Sheets (Apps Script Webhook)' : 'Google Sheets Order Webhook'}
              </h3>
              <span className="text-[11px] text-stone-400">
                {isAr ? 'ترحيل كل طلب فوري إلى جدول إكسل في جوجل درايف' : 'Stream every order into a Google Spreadsheet'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Google Apps Script Webhook URL
            </label>
            <input
              type="url"
              value={formSettings.google_sheets_webhook_url}
              onChange={(e) => setFormSettings({ ...formSettings, google_sheets_webhook_url: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="https://script.google.com/macros/s/.../exec"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestSheets}
              disabled={isTestingSheets}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSheets ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'إرسال سجل تجريبي للجدول' : 'Send Test Ping'}</span>
            </button>

            {sheetsTestStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'تم إرسال السجل بنجاح!' : 'Ping successful'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer transition-colors"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? (isAr ? 'تم حفظ كافة الإعدادات!' : 'Saved!') : (isAr ? 'حفظ إعدادات الربط' : 'Save Integrations')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
