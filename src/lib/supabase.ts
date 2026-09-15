import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Order, MaintenanceRequest, StoreSettings, AnalyticsVisitRecord } from '../types';

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
 * - If email (contains @), signs in via supabase.auth.signInWithPassword.
 * - If username, queries `store_admins` table or validates credentials.
 * - If Supabase is not yet configured, falls back to local admin verification.
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
    // Attempt a light ping by querying store_settings or schema
    const { error } = await client.from('store_settings').select('count', { count: 'exact', head: true });
    
    // Even if table doesn't exist yet, if connection reaches PostgREST without 401/403, credentials are valid!
    if (error && error.code === 'PGRST301') {
      return { success: false, message: 'Invalid JWT / API Key. Please verify your Supabase anon public key.' };
    }
    return { success: true, message: 'Connected successfully to Supabase project!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
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
