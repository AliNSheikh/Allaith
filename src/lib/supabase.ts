import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Order, MaintenanceRequest, StoreSettings, AnalyticsVisitRecord, HeroSlide, PhoneRequest } from '../types';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const targetUrl = url || envUrl || (typeof window !== 'undefined' ? localStorage.getItem('laith_supabase_url') : null);
  const targetKey = anonKey || envKey || (typeof window !== 'undefined' ? localStorage.getItem('laith_supabase_key') : null);

  if (!targetUrl || !targetKey) {
    return null;
  }

  if (cachedClient && currentUrl === targetUrl && currentKey === targetKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(targetUrl, targetKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentUrl = targetUrl;
    currentKey = targetKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export interface SupabaseAuthResult {
  success: boolean;
  user?: any;
  error?: string;
  source: 'supabase_auth' | 'supabase_table' | 'local_fallback';
}

/**
 * Authenticates admin via Supabase.
 */
export async function authenticateAdminWithSupabase(
  identifier: string,
  passwordInput: string,
  options?: {
    customUrl?: string;
    customKey?: string;
    fallbackUsername?: string;
    fallbackPassword?: string;
  }
): Promise<SupabaseAuthResult> {
  const client = getSupabaseClient(options?.customUrl, options?.customKey);
  const trimmedId = identifier.trim();
  const trimmedPass = passwordInput.trim();

  if (client) {
    try {
      if (trimmedId.includes('@')) {
        const { data, error } = await client.auth.signInWithPassword({
          email: trimmedId,
          password: trimmedPass
        });

        if (error) {
          return {
            success: false,
            error: error.message || 'بيانات الدخول غير صحيحة عبر Supabase',
            source: 'supabase_auth'
          };
        }

        return {
          success: true,
          user: data.user,
          source: 'supabase_auth'
        };
      } else {
        // Look up by username in store_admins
        const { data, error } = await client
          .from('store_admins')
          .select('*')
          .eq('username', trimmedId)
          .single();

        if (!error && data) {
          if (data.password === trimmedPass || data.password_hash === trimmedPass) {
            return {
              success: true,
              user: data,
              source: 'supabase_table'
            };
          } else {
            return {
              success: false,
              error: 'كلمة المرور غير صحيحة لحساب الإدارة في Supabase',
              source: 'supabase_table'
            };
          }
        }
      }
    } catch (err: any) {
      console.warn('Supabase authentication check warning:', err);
    }
  }

  // Local fallback when Supabase is not connected
  const validUser = (options?.fallbackUsername || 'admin').trim();
  const validPass = (options?.fallbackPassword || 'laith2026').trim();

  if (trimmedId === validUser && trimmedPass === validPass) {
    return {
      success: true,
      user: { username: validUser, role: 'master_admin' },
      source: 'local_fallback'
    };
  }

  return {
    success: false,
    error: 'بيانات تسجيل الدخول غير صحيحة',
    source: client ? 'supabase_auth' : 'local_fallback'
  };
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, anonKey);
    const { error } = await client.from('store_settings').select('count', { count: 'exact', head: true });
    
    if (error && error.code === 'PGRST301') {
      return { success: false, message: 'Invalid JWT / API Key. Please verify your Supabase anon public key.' };
    }
    return { success: true, message: 'Connected successfully to Supabase project!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: PRODUCTS
// ========================================================

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch products from Supabase:', error.message);
      return null;
    }
    return (data || []) as Product[];
  } catch (e) {
    console.warn('Error querying products from Supabase:', e);
    return null;
  }
}

export async function upsertProductToSupabase(prod: Product): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('products')
      .upsert({
        id: prod.id,
        title_ar: prod.title_ar,
        title_en: prod.title_en,
        slug: prod.slug,
        description_ar: prod.description_ar,
        description_en: prod.description_en,
        category_id: prod.category_id,
        brand: prod.brand,
        price: prod.price,
        price_usd: prod.price_usd,
        compare_at_price: prod.compare_at_price,
        compare_at_price_usd: prod.compare_at_price_usd,
        has_discount: prod.has_discount,
        discount_percent: prod.discount_percent,
        condition: prod.condition,
        condition_details: prod.condition_details,
        device_type: prod.device_type,
        images: prod.images,
        variants: prod.variants,
        variant_combinations: prod.variant_combinations,
        specs: prod.specs,
        stock_quantity: prod.stock_quantity,
        is_featured: prod.is_featured,
        is_archived: prod.is_archived ?? false,
        rating: prod.rating,
        reviews_count: prod.reviews_count,
        sku: prod.sku,
        warranty_ar: prod.warranty_ar,
        warranty_en: prod.warranty_en,
        created_at: prod.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Failed to upsert product to Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('Exception upserting product to Supabase:', e);
    return { success: false, error: e?.message };
  }
}

export async function deleteProductFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete product from Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('Exception deleting product from Supabase:', e);
    return { success: false, error: e?.message };
  }
}

export async function archiveProductInSupabase(id: string, isArchived: boolean): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('products')
      .update({ is_archived: isArchived })
      .eq('id', id);

    if (error) {
      console.error('Failed to archive product in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('Exception archiving product in Supabase:', e);
    return { success: false, error: e?.message };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: CATEGORIES
// ========================================================

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return null;
    return (data || []) as Category[];
  } catch {
    return null;
  }
}

export async function upsertCategoryToSupabase(cat: Category): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('categories')
      .upsert({
        id: cat.id,
        name_ar: cat.name_ar,
        name_en: cat.name_en,
        slug: cat.slug,
        image_url: cat.image_url,
        sort_order: cat.sort_order,
        is_archived: cat.is_archived ?? false
      }, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function deleteCategoryFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function archiveCategoryInSupabase(id: string, isArchived: boolean): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('categories')
      .update({ is_archived: isArchived })
      .eq('id', id);

    if (error) {
      console.error('Failed to archive category in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('Exception archiving category in Supabase:', e);
    return { success: false, error: e?.message };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: HERO SLIDES
// ========================================================

export async function fetchHeroSlidesFromSupabase(): Promise<HeroSlide[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) return null;
    return data.map((d: any) => ({
      id: d.id,
      title_ar: d.title_ar,
      title_en: d.title_en,
      subtitle_ar: d.subtitle_ar || '',
      subtitle_en: d.subtitle_en || '',
      tag_ar: d.tag_ar || '',
      tag_en: d.tag_en || '',
      image: d.image_url || d.image,
      button_text_ar: d.button_text_ar || 'تصفح الآن',
      button_text_en: d.button_text_en || 'Shop Now',
      button_link: d.link || d.button_link || '#catalog'
    }));
  } catch {
    return null;
  }
}

export async function upsertHeroSlideToSupabase(slide: HeroSlide, index = 0): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('hero_slides')
      .upsert({
        id: slide.id,
        title_ar: slide.title_ar,
        title_en: slide.title_en,
        subtitle_ar: slide.subtitle_ar,
        subtitle_en: slide.subtitle_en,
        tag_ar: slide.tag_ar,
        tag_en: slide.tag_en,
        image_url: slide.image,
        link: slide.button_link,
        sort_order: index,
        is_active: true
      }, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function deleteHeroSlideFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client.from('hero_slides').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: STORE SETTINGS
// ========================================================

export async function fetchSettingsFromSupabase(): Promise<Partial<StoreSettings> | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) return null;
    return {
      site_name_ar: data.site_name_ar,
      site_name_en: data.site_name_en,
      custom_logo_url: data.custom_logo_url || data.logo_url,
      whatsapp_number: data.whatsapp_number,
      maintenance_whatsapp: data.maintenance_whatsapp,
      usd_exchange_rate: Number(data.usd_exchange_rate) || 15000,
      store_address_ar: data.store_address_ar,
      store_address_en: data.store_address_en,
      store_phone: data.store_phone,
      store_email: data.store_email,
      store_lat: Number(data.store_lat) || 35.524917,
      store_lng: Number(data.store_lng) || 35.852556
    };
  } catch {
    return null;
  }
}

export async function upsertSettingsToSupabase(settings: StoreSettings): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('store_settings')
      .upsert({
        id: 'default',
        site_name_ar: settings.site_name_ar,
        site_name_en: settings.site_name_en,
        logo_url: settings.custom_logo_url || settings.logo_url,
        custom_logo_url: settings.custom_logo_url,
        whatsapp_number: settings.whatsapp_number,
        maintenance_whatsapp: settings.maintenance_whatsapp,
        usd_exchange_rate: settings.usd_exchange_rate,
        store_address_ar: settings.store_address_ar,
        store_address_en: settings.store_address_en,
        store_phone: settings.store_phone,
        store_email: settings.store_email,
        store_lat: settings.store_lat,
        store_lng: settings.store_lng,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

// ========================================================
// FULL STORE CATALOG SEED & SYNC
// ========================================================

export async function syncEntireCatalogToSupabase(
  products: Product[],
  categories: Category[],
  heroSlides: HeroSlide[],
  settings: StoreSettings
): Promise<{ success: boolean; message: string; count?: number }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured yet. Please enter project URL & anon key.' };
  }

  try {
    // 1. Settings
    await upsertSettingsToSupabase(settings);

    // 2. Categories
    for (const cat of categories) {
      await upsertCategoryToSupabase(cat);
    }

    // 3. Products
    for (const prod of products) {
      await upsertProductToSupabase(prod);
    }

    // 4. Hero Slides
    for (let i = 0; i < heroSlides.length; i++) {
      await upsertHeroSlideToSupabase(heroSlides[i], i);
    }

    return {
      success: true,
      message: `تم مزامنة ${products.length} منتجاً و ${categories.length} قسماً و ${heroSlides.length} بانرات مع Supabase بنجاح!`,
      count: products.length
    };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Sync failed' };
  }
}

// ========================================================
// REALTIME SUBSCRIPTION FOR LIVE STOREFRONT UPDATES
// ========================================================

export function subscribeToStoreSync(
  onTableChange: (table: string, eventType: string, payload: any) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('store-sync-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        onTableChange('products', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        onTableChange('categories', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, (payload) => {
        onTableChange('hero_slides', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, (payload) => {
        onTableChange('store_settings', payload.eventType, payload);
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Realtime subscription not supported or error:', e);
    return () => {};
  }
}

/**
 * Complete SQL Migration Script for Supabase
 * Can be run directly inside the Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- Al-Laith for Telecommunications (متجر الليث للاتصالات)
-- Complete Supabase PostgreSQL Database Schema
-- Run this in your Supabase project's SQL Editor
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name_ar TEXT NOT NULL DEFAULT 'الليث للاتصالات',
    site_name_en TEXT NOT NULL DEFAULT 'Al-Laith Telecom',
    logo_url TEXT,
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
    footer_quick_links JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Products Table (Includes multi-attribute variants, Amazon-style specs, discounts & archive flag)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT NOT NULL,
    price NUMERIC NOT NULL, -- SYP price
    price_usd NUMERIC,      -- USD price
    compare_at_price NUMERIC,
    compare_at_price_usd NUMERIC,
    has_discount BOOLEAN DEFAULT false,
    discount_percent NUMERIC DEFAULT 0,
    condition TEXT DEFAULT 'new',
    condition_details TEXT,
    device_type TEXT DEFAULT 'smartphone',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    variants JSONB DEFAULT '[]'::jsonb,
    variant_combinations JSONB DEFAULT '[]'::jsonb, -- e.g. [{"attributes":{"Storage":"256GB","Color":"Black"},"price_usd":1000,"stock_quantity":10}]
    specs JSONB DEFAULT '[]'::jsonb,                 -- Amazon-style Key/Value pairs
    stock_quantity INT DEFAULT 10,
    is_featured BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,              -- Hidden from public storefront when true
    rating NUMERIC DEFAULT 5.0,
    reviews_count INT DEFAULT 1,
    sku TEXT,
    warranty_ar TEXT,
    warranty_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table (Sales Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    governorate TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'SYP',
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'confirmed', 'shipped', 'delivered', 'cancelled'
    google_sheets_synced BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Maintenance & Tech Lab Requests
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
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_progress', 'resolved', 'cancelled'
    notes_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Analytics & Visits Table (Timeframe tracking & permanent storage)
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

-- 8. Indexes for Instant Performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_archived ON public.products(is_archived);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.analytics_visits(timestamp);

-- 9. Row Level Security (Public Read, Admin Full Access)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_visits ENABLE ROW LEVEL SECURITY;

-- Allow public read of unarchived products
CREATE POLICY "Public can view unarchived products" ON public.products
    FOR SELECT USING (is_archived = false);

-- Allow public read of unarchived categories
CREATE POLICY "Public can view unarchived categories" ON public.categories
    FOR SELECT USING (is_archived = false);

-- Allow public read of store settings
CREATE POLICY "Public can view settings" ON public.store_settings
    FOR SELECT USING (true);

-- Allow public to insert orders and maintenance requests
CREATE POLICY "Public can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create maintenance requests" ON public.maintenance_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can record visits" ON public.analytics_visits
    FOR INSERT WITH CHECK (true);

-- Allow all operations for anon/service key
CREATE POLICY "Full access with anon key for products" ON public.products FOR ALL USING (true);
CREATE POLICY "Full access with anon key for categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Full access with anon key for settings" ON public.store_settings FOR ALL USING (true);
CREATE POLICY "Full access with anon key for orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Full access with anon key for maintenance" ON public.maintenance_requests FOR ALL USING (true);
CREATE POLICY "Full access with anon key for analytics" ON public.analytics_visits FOR ALL USING (true);
`;
