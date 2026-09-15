-- ==============================================================================
-- متجر الليث للاتصالات - Al-Laith for Telecommunications
-- ملف إنشاء وإعداد قاعدة بيانات Supabase الكاملة (Supabase PostgreSQL Schema)
-- ==============================================================================
--
-- 📋 خطوات التثبيت والربط السريع (Setup Guide):
-- ------------------------------------------------------------------------------
-- 1. افتح حساباً في منصة Supabase (https://supabase.com) وأنشئ مشروعاً جديداً (New Project).
-- 2. من القائمة الجانبية في لوحة تحكم Supabase، انقر على أيقونة (SQL Editor).
-- 3. انسخ كامل محتويات هذا الملف والصقها في نافذة الـ SQL Editor ثم اضغط زر "Run" الأخضر.
-- 4. توجه إلى (Project Settings) > (API) وانسخ القيم التالية:
--    - Project URL (رابط المشروع)
--    - anon public key (المفتاح العام للمشروع)
-- 5. افتح لوحة تحكم متجر الليث (/admin) وسجل الدخول باستخدام:
--    - اسم المستخدم: admin
--    - كلمة المرور: laith2026
--    (يمكنك تغيير كلمة المرور أو إضافة مستخدمين جدد مباشرة من جدول store_admins)
-- ==============================================================================

-- 1. تفعيل ملحق توليد المعرفات الفريدة UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. جدول مدراء ومسؤولي لوحة التحكم (Store Admins & Authentication)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_admins (
    id TEXT PRIMARY KEY DEFAULT ('adm_' || substr(md5(random()::text), 1, 8)),
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL DEFAULT 'مدير متجر الليث',
    role TEXT NOT NULL DEFAULT 'super_admin', -- 'super_admin', 'manager', 'sales_editor'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج حساب المدير الافتراضي
INSERT INTO public.store_admins (id, username, email, password, full_name, role)
VALUES ('adm_master', 'admin', 'admin@allaith.sy', 'laith2026', 'المدير العام', 'super_admin')
ON CONFLICT (username) DO UPDATE SET 
    password = EXCLUDED.password,
    role = EXCLUDED.role;

-- ==============================================================================
-- 3. جدول إعدادات المتجر وسعر الصرف (Store Settings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name_ar TEXT NOT NULL DEFAULT 'الليث للاتصالات',
    site_name_en TEXT NOT NULL DEFAULT 'Al-Laith Telecom',
    logo_url TEXT DEFAULT '/al-laith-logo-horizontal.svg',
    custom_logo_url TEXT,
    whatsapp_number TEXT DEFAULT '963944000000',
    maintenance_whatsapp TEXT DEFAULT '963944000000',
    usd_exchange_rate NUMERIC DEFAULT 15000,
    store_address_ar TEXT DEFAULT 'اللاذقية - شارع 8 آذار',
    store_address_en TEXT DEFAULT 'Latakia - 8th of March St',
    store_phone TEXT DEFAULT '+96341234567',
    store_email TEXT DEFAULT 'info@allaith.sy',
    store_lat NUMERIC DEFAULT 35.524917,
    store_lng NUMERIC DEFAULT 35.852556,
    google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/wY4L4aT5aK9b1s8fA',
    announcement_ar TEXT DEFAULT 'أهلاً بكم في متجر الليث للاتصالات - اللاذقية. أفضل أسعار الهواتف وكفالة رسمية 12 شهراً.',
    announcement_en TEXT DEFAULT 'Welcome to Al-Laith Telecom - Latakia. Best phone deals & certified 12-month warranty.',
    admin_username TEXT DEFAULT 'admin',
    admin_password TEXT DEFAULT 'laith2026',
    google_sheets_webhook_url TEXT,
    google_sheets_sync_enabled BOOLEAN DEFAULT false,
    delivery_fee NUMERIC DEFAULT 0,
    free_delivery_threshold NUMERIC DEFAULT 1000000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج الإعدادات الأولية
INSERT INTO public.store_settings (id, site_name_ar, site_name_en, admin_username, admin_password)
VALUES ('default', 'الليث للاتصالات', 'Al-Laith Telecom', 'admin', 'laith2026')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. جدول فئات وأقسام المنتجات (Categories)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    icon_name TEXT,
    sort_order INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. جدول المنتجات الكامل (Products)
-- يدعم الأرشفة، الخصومات، الروابط التلقائية الفريدة، والـ SKU
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT NOT NULL,
    price NUMERIC NOT NULL,              -- السعر الأساسي بالليرة السورية
    price_usd NUMERIC,                   -- السعر المقابل بالدولار
    compare_at_price NUMERIC,            -- السعر قبل الخصم بالليرة
    compare_at_price_usd NUMERIC,        -- السعر قبل الخصم بالدولار
    has_discount BOOLEAN DEFAULT false,
    discount_percent NUMERIC DEFAULT 0,  -- نسبة الخصم المئوية
    pricing_strategy TEXT DEFAULT 'manual_both', -- 'manual_both', 'auto_daily_rate', 'fixed_usd'
    pricing_type TEXT DEFAULT 'fixed',           -- 'fixed', 'inquire'
    condition TEXT DEFAULT 'new',                -- 'new', 'used'
    condition_details TEXT,
    device_type TEXT DEFAULT 'smartphone',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    variants JSONB DEFAULT '[]'::jsonb,
    variant_combinations JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '[]'::jsonb,             -- جدول المواصفات (المعالج، الشاشة، الكاميرا...)
    stock_quantity INT DEFAULT 10,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,           -- حالة الأرشفة (مخفي من الواجهة عند القيمة true)
    rating NUMERIC DEFAULT 5.0,
    reviews_count INT DEFAULT 1,
    sku TEXT,                                    -- كود SKU المولد تلقائياً
    warranty_ar TEXT DEFAULT 'كفالة الليث المعتمدة 12 شهراً',
    warranty_en TEXT DEFAULT 'Certified 12-Month Al-Laith Warranty',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 6. جدول طلبات المبيعات وسلة الشراء (Orders)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    governorate TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL,                 -- مصفوفة العناصر والكميات والأسعار
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'SYP',
    status TEXT NOT NULL DEFAULT 'new',   -- 'new', 'confirmed', 'shipped', 'delivered', 'cancelled'
    payment_method TEXT DEFAULT 'cod',
    google_sheets_synced BOOLEAN DEFAULT false,
    synced_to_sheets BOOLEAN DEFAULT false,
    sheets_sync_timestamp TIMESTAMP WITH TIME ZONE,
    whatsapp_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. جدول طلبات الصيانة ومختبر الليث التقني (Maintenance Requests)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    device_type TEXT NOT NULL,
    device_model TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    photo_url TEXT,
    preferred_date TEXT,
    status TEXT NOT NULL DEFAULT 'new',   -- 'new', 'in_progress', 'resolved', 'cancelled'
    notes_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 8. جدول طلبات توفير الأجهزة الخاصة (Phone Sourcing Requests)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.phone_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    device_type TEXT NOT NULL,
    specifications TEXT,
    storage TEXT,
    color TEXT,
    condition TEXT DEFAULT 'new',
    status TEXT NOT NULL DEFAULT 'new',   -- 'new', 'contacted', 'fulfilled', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 9. جدول بنرات السلايدر في الصفحة الرئيسية (Hero Slides)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_ar TEXT,
    subtitle_en TEXT,
    tag_ar TEXT,
    tag_en TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    bg_gradient TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 10. جدول سجلات وتحليلات الزوار (Visitor Analytics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_visits (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    device TEXT DEFAULT 'desktop',
    visitor_id TEXT NOT NULL,
    duration_seconds INT DEFAULT 0
);

-- ==============================================================================
-- 11. الفهارس لتسريع البحث والاستعلامات (Indexes)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_archived ON public.products(is_archived);
CREATE INDEX IF NOT EXISTS idx_categories_archived ON public.categories(is_archived);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_phone_requests_status ON public.phone_requests(status);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.analytics_visits(timestamp);

-- ==============================================================================
-- 12. قواعد الحماية وسياسات الوصول (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE public.store_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_visits ENABLE ROW LEVEL SECURITY;

-- السماح للعامة بعرض المنتجات والفئات غير المؤرشفة
CREATE POLICY "Public can view unarchived products" ON public.products
    FOR SELECT USING (is_archived = false);

CREATE POLICY "Public can view unarchived categories" ON public.categories
    FOR SELECT USING (is_archived = false);

CREATE POLICY "Public can view active hero slides" ON public.hero_slides
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view store settings" ON public.store_settings
    FOR SELECT USING (true);

-- السماح للعامة بإنشاء الطلبات واستمارات الصيانة وتتبع الزيارات
CREATE POLICY "Public can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create maintenance requests" ON public.maintenance_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create phone requests" ON public.phone_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can log analytics visits" ON public.analytics_visits
    FOR INSERT WITH CHECK (true);

-- سياسات التحقق من بيانات دخول الإدارة بواسطة المفتاح العام (Anon Key)
CREATE POLICY "Allow anon to verify admin credentials" ON public.store_admins
    FOR SELECT USING (true);

-- إتاحة التحكم الكامل لجميع العمليات عبر مفتاح Supabase Anon/Service
CREATE POLICY "Full access with anon key for products" ON public.products FOR ALL USING (true);
CREATE POLICY "Full access with anon key for categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Full access with anon key for settings" ON public.store_settings FOR ALL USING (true);
CREATE POLICY "Full access with anon key for orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Full access with anon key for maintenance" ON public.maintenance_requests FOR ALL USING (true);
CREATE POLICY "Full access with anon key for phone_requests" ON public.phone_requests FOR ALL USING (true);
CREATE POLICY "Full access with anon key for hero_slides" ON public.hero_slides FOR ALL USING (true);
CREATE POLICY "Full access with anon key for analytics" ON public.analytics_visits FOR ALL USING (true);
CREATE POLICY "Full access with anon key for store_admins" ON public.store_admins FOR ALL USING (true);

-- ==============================================================================
-- تم إنشاء هيكل قاعدة بيانات متجر الليث للاتصالات بنجاح!
-- All database tables and security policies initialized.
-- ==============================================================================
