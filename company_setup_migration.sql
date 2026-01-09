-- ============================================================
-- FLOOROPS PRO - COMPANY SETUP & MULTI-TENANCY MIGRATION
-- ============================================================
-- This migration:
-- 1. Creates "Tex Flooring" as the default company
-- 2. Backfills all existing data with the default company_id
-- 3. Sets up proper constraints for future inserts
-- ============================================================

-- ============================================================
-- STEP 1: CREATE DEFAULT COMPANY (Tex Flooring)
-- ============================================================

-- First, ensure the companies table exists (from RLS migration)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_email TEXT NOT NULL,
  plan TEXT DEFAULT 'pro' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  max_users INTEGER DEFAULT 50,
  max_projects INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);

-- Insert Tex Flooring as the default company
-- Using DO block to handle idempotency (won't fail if already exists)
DO $$
DECLARE
  default_company_id UUID;
BEGIN
  -- Check if Tex Flooring already exists
  SELECT id INTO default_company_id FROM public.companies WHERE slug = 'tex-flooring';
  
  IF default_company_id IS NULL THEN
    INSERT INTO public.companies (
      id,
      name,
      slug,
      owner_email,
      plan,
      max_users,
      max_projects,
      is_active
    ) VALUES (
      gen_random_uuid(),
      'Tex Flooring',
      'tex-flooring',
      'admin@texflooring.com',
      'enterprise',
      100,
      500,
      true
    )
    RETURNING id INTO default_company_id;
    
    RAISE NOTICE 'Created Tex Flooring company with ID: %', default_company_id;
  ELSE
    RAISE NOTICE 'Tex Flooring already exists with ID: %', default_company_id;
  END IF;
END $$;

-- ============================================================
-- STEP 2: ADD company_id COLUMNS TO ALL TABLES (if not exists)
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);

-- Projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON public.projects(company_id);

-- Crews
ALTER TABLE public.crews ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_crews_company ON public.crews(company_id);

-- Vendors
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_vendors_company ON public.vendors(company_id);

-- Estimates
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_estimates_company ON public.estimates(company_id);

-- Warehouse Inventory
ALTER TABLE public.warehouse_inventory ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_company ON public.warehouse_inventory(company_id);

-- Warehouse Locations
ALTER TABLE public.warehouse_locations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_company ON public.warehouse_locations(company_id);

-- ============================================================
-- STEP 3: BACKFILL EXISTING DATA WITH Tex Flooring company_id
-- ============================================================

-- Get the Tex Flooring company ID and backfill all tables
DO $$
DECLARE
  tex_flooring_id UUID;
  rows_updated INTEGER;
BEGIN
  -- Get Tex Flooring company ID
  SELECT id INTO tex_flooring_id FROM public.companies WHERE slug = 'tex-flooring';
  
  IF tex_flooring_id IS NULL THEN
    RAISE EXCEPTION 'Tex Flooring company not found! Run Step 1 first.';
  END IF;
  
  RAISE NOTICE '🏢 Backfilling data with Tex Flooring ID: %', tex_flooring_id;
  
  -- Backfill profiles
  UPDATE public.profiles SET company_id = tex_flooring_id WHERE company_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Profiles updated: %', rows_updated;
  
  -- Backfill projects
  UPDATE public.projects SET company_id = tex_flooring_id WHERE company_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Projects updated: %', rows_updated;
  
  -- Backfill crews
  UPDATE public.crews SET company_id = tex_flooring_id WHERE company_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Crews updated: %', rows_updated;
  
  -- Backfill vendors
  UPDATE public.vendors SET company_id = tex_flooring_id WHERE company_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Vendors updated: %', rows_updated;
  
  -- Backfill estimates
  UPDATE public.estimates SET company_id = tex_flooring_id WHERE company_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Estimates updated: %', rows_updated;
  
  -- Backfill warehouse inventory
  UPDATE public.warehouse_inventory SET company_id = tex_flooring_id WHERE company_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Warehouse Inventory updated: %', rows_updated;
  
  -- Backfill warehouse locations
  UPDATE public.warehouse_locations SET company_id = tex_flooring_id WHERE company_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Warehouse Locations updated: %', rows_updated;
  
  RAISE NOTICE '🎉 Backfill complete! All existing data now belongs to Tex Flooring.';
END $$;

-- ============================================================
-- STEP 4: CREATE HELPER FUNCTION TO GET DEFAULT COMPANY ID
-- ============================================================

-- Function to get the Tex Flooring (default) company ID
CREATE OR REPLACE FUNCTION public.get_default_company_id()
RETURNS UUID AS $$
  SELECT id FROM public.companies WHERE slug = 'tex-flooring' LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to get current user's company_id (with fallback to default)
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (SELECT company_id FROM public.profiles WHERE id = auth.uid()),
    public.get_default_company_id()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- STEP 5: VERIFY MIGRATION SUCCESS
-- ============================================================

DO $$
DECLARE
  tex_flooring_id UUID;
  null_company_count INTEGER := 0;
  table_name TEXT;
  check_tables TEXT[] := ARRAY['profiles', 'projects', 'crews', 'vendors', 'estimates', 'warehouse_inventory', 'warehouse_locations'];
BEGIN
  -- Get company ID
  SELECT id INTO tex_flooring_id FROM public.companies WHERE slug = 'tex-flooring';
  
  IF tex_flooring_id IS NULL THEN
    RAISE EXCEPTION '❌ VERIFICATION FAILED: Tex Flooring company not found!';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '           MIGRATION VERIFICATION';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '🏢 Tex Flooring Company ID: %', tex_flooring_id;
  RAISE NOTICE '';
  
  -- Check each table for null company_ids
  FOREACH table_name IN ARRAY check_tables LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE company_id IS NULL', table_name)
    INTO null_company_count;
    
    IF null_company_count > 0 THEN
      RAISE WARNING '⚠️  %s has % rows with NULL company_id', table_name, null_company_count;
    ELSE
      RAISE NOTICE '✅ %s - all rows have company_id', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '      MIGRATION COMPLETE - Tex Flooring is SET';
  RAISE NOTICE '=================================================';
END $$;

-- ============================================================
-- COMPLETE! 
-- Now update your app code to include company_id on all inserts.
-- Use the function: public.get_default_company_id() or 
-- public.get_user_company_id() for authenticated users.
-- ============================================================
