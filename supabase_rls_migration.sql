-- ============================================================
-- FLOOROPS PRO - COMPLETE RLS SECURITY LOCKDOWN
-- Run this AFTER your existing migration
-- ============================================================

-- ============================================================
-- PART 1: MULTI-TENANCY FOUNDATION
-- ============================================================

-- Companies table (root of all multi-tenancy)
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

-- Add company_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);

-- Add company_id to core tables
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON public.projects(company_id);

ALTER TABLE public.crews ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_crews_company ON public.crews(company_id);

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_vendors_company ON public.vendors(company_id);

ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_estimates_company ON public.estimates(company_id);

ALTER TABLE public.warehouse_inventory ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_company ON public.warehouse_inventory(company_id);

ALTER TABLE public.warehouse_locations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_company ON public.warehouse_locations(company_id);

-- ============================================================
-- PART 2: SECURITY HELPER FUNCTIONS
-- ============================================================

-- Get current user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is in same company
CREATE OR REPLACE FUNCTION public.is_same_company(target_company_id UUID)
RETURNS BOOLEAN AS $$
  SELECT target_company_id = public.get_user_company_id();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check project access (company + role/assignment)
CREATE OR REPLACE FUNCTION public.can_access_project(target_project_id INTEGER)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.profiles prof ON prof.id = auth.uid()
    WHERE p.id = target_project_id
      AND p.company_id = prof.company_id
      AND (
        prof.role IN ('owner', 'pm', 'office_admin', 'warehouse_manager')
        OR EXISTS (
          SELECT 1 FROM public.user_project_assignments upa 
          WHERE upa.project_id = p.id AND upa.user_id = auth.uid()
        )
      )
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- PART 3: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_item_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log_delays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moisture_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moisture_test_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subfloor_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subfloor_test_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walkthrough_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walkthrough_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_labor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcontractor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scope_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scope_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 4: RLS POLICIES - CORE TABLES
-- ============================================================

-- Drop existing policies first (safe re-run)
DROP POLICY IF EXISTS "companies_select" ON public.companies;
DROP POLICY IF EXISTS "companies_update" ON public.companies;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- COMPANIES: View own company only
CREATE POLICY "companies_select" ON public.companies FOR SELECT 
  USING (id = get_user_company_id());

CREATE POLICY "companies_update" ON public.companies FOR UPDATE 
  USING (id = get_user_company_id() AND get_user_role() = 'owner');

-- PROFILES: View same company, update own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT 
  USING (company_id = get_user_company_id());

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE 
  USING (id = auth.uid());

-- PROJECTS: Company + role-based access
CREATE POLICY "projects_select" ON public.projects FOR SELECT 
  USING (
    company_id = get_user_company_id()
    AND (
      get_user_role() IN ('owner', 'pm', 'office_admin', 'warehouse_manager')
      OR id IN (SELECT project_id FROM public.user_project_assignments WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "projects_insert" ON public.projects FOR INSERT 
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm'));

CREATE POLICY "projects_update" ON public.projects FOR UPDATE 
  USING (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm'));

CREATE POLICY "projects_delete" ON public.projects FOR DELETE 
  USING (company_id = get_user_company_id() AND get_user_role() = 'owner');

-- PROJECT FINANCIALS: Pricing roles only
DROP POLICY IF EXISTS "financials_select" ON public.project_financials;
DROP POLICY IF EXISTS "financials_insert" ON public.project_financials;
DROP POLICY IF EXISTS "financials_update" ON public.project_financials;

CREATE POLICY "financials_select" ON public.project_financials FOR SELECT 
  USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE company_id = get_user_company_id()
    )
    AND get_user_role() IN ('owner', 'pm', 'office_admin')
  );

CREATE POLICY "financials_insert" ON public.project_financials FOR INSERT 
  WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE company_id = get_user_company_id())
    AND get_user_role() IN ('owner', 'pm')
  );

CREATE POLICY "financials_update" ON public.project_financials FOR UPDATE 
  USING (
    project_id IN (SELECT id FROM public.projects WHERE company_id = get_user_company_id())
    AND get_user_role() IN ('owner', 'pm')
  );

-- USER PROJECT ASSIGNMENTS
DROP POLICY IF EXISTS "assignments_select" ON public.user_project_assignments;
DROP POLICY IF EXISTS "assignments_insert" ON public.user_project_assignments;
DROP POLICY IF EXISTS "assignments_delete" ON public.user_project_assignments;

CREATE POLICY "assignments_select" ON public.user_project_assignments FOR SELECT 
  USING (
    project_id IN (SELECT id FROM public.projects WHERE company_id = get_user_company_id())
  );

CREATE POLICY "assignments_insert" ON public.user_project_assignments FOR INSERT 
  WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE company_id = get_user_company_id())
    AND get_user_role() IN ('owner', 'pm')
  );

CREATE POLICY "assignments_delete" ON public.user_project_assignments FOR DELETE 
  USING (
    project_id IN (SELECT id FROM public.projects WHERE company_id = get_user_company_id())
    AND get_user_role() IN ('owner', 'pm')
  );

-- CREWS: Company-scoped
CREATE POLICY "crews_select" ON public.crews FOR SELECT 
  USING (company_id = get_user_company_id());

CREATE POLICY "crews_insert" ON public.crews FOR INSERT 
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm'));

CREATE POLICY "crews_update" ON public.crews FOR UPDATE 
  USING (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm', 'foreman'));

-- CREW MEMBERS: Via crew company
CREATE POLICY "crew_members_select" ON public.crew_members FOR SELECT 
  USING (crew_id IN (SELECT id FROM public.crews WHERE company_id = get_user_company_id()));

CREATE POLICY "crew_members_insert" ON public.crew_members FOR INSERT 
  WITH CHECK (crew_id IN (SELECT id FROM public.crews WHERE company_id = get_user_company_id()));

-- CREW AVAILABILITY: Via crew company
CREATE POLICY "crew_availability_select" ON public.crew_availability FOR SELECT 
  USING (crew_id IN (SELECT id FROM public.crews WHERE company_id = get_user_company_id()));

CREATE POLICY "crew_availability_insert" ON public.crew_availability FOR INSERT 
  WITH CHECK (crew_id IN (SELECT id FROM public.crews WHERE company_id = get_user_company_id()));

CREATE POLICY "crew_availability_update" ON public.crew_availability FOR UPDATE 
  USING (crew_id IN (SELECT id FROM public.crews WHERE company_id = get_user_company_id()));

-- VENDORS: Company-scoped
CREATE POLICY "vendors_select" ON public.vendors FOR SELECT 
  USING (company_id = get_user_company_id());

CREATE POLICY "vendors_insert" ON public.vendors FOR INSERT 
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm', 'office_admin'));

CREATE POLICY "vendors_update" ON public.vendors FOR UPDATE 
  USING (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm', 'office_admin'));

-- MILESTONES: Via project
CREATE POLICY "milestones_select" ON public.milestones FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "milestones_insert" ON public.milestones FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm'));

CREATE POLICY "milestones_update" ON public.milestones FOR UPDATE 
  USING (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm'));

-- ============================================================
-- PART 5: RLS POLICIES - PUNCH LIST SYSTEM
-- ============================================================

DROP POLICY IF EXISTS "punch_select" ON public.punch_items;
DROP POLICY IF EXISTS "punch_insert" ON public.punch_items;
DROP POLICY IF EXISTS "punch_update" ON public.punch_items;

CREATE POLICY "punch_select" ON public.punch_items FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "punch_insert" ON public.punch_items FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman', 'installer'));

CREATE POLICY "punch_update" ON public.punch_items FOR UPDATE 
  USING (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman', 'installer'));

CREATE POLICY "punch_photos_select" ON public.punch_item_photos FOR SELECT 
  USING (punch_item_id IN (SELECT id FROM public.punch_items WHERE can_access_project(project_id)));

CREATE POLICY "punch_photos_insert" ON public.punch_item_photos FOR INSERT 
  WITH CHECK (punch_item_id IN (SELECT id FROM public.punch_items WHERE can_access_project(project_id)));

CREATE POLICY "punch_history_select" ON public.punch_item_history FOR SELECT 
  USING (punch_item_id IN (SELECT id FROM public.punch_items WHERE can_access_project(project_id)));

-- ============================================================
-- PART 6: RLS POLICIES - DAILY LOGS
-- ============================================================

DROP POLICY IF EXISTS "daily_logs_select" ON public.daily_logs;
DROP POLICY IF EXISTS "daily_logs_insert" ON public.daily_logs;

CREATE POLICY "daily_logs_select" ON public.daily_logs FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "daily_logs_insert" ON public.daily_logs FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman', 'installer'));

CREATE POLICY "daily_logs_update" ON public.daily_logs FOR UPDATE 
  USING (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman'));

CREATE POLICY "daily_log_crew_select" ON public.daily_log_crew FOR SELECT 
  USING (daily_log_id IN (SELECT id FROM public.daily_logs WHERE can_access_project(project_id)));

CREATE POLICY "daily_log_delays_select" ON public.daily_log_delays FOR SELECT 
  USING (daily_log_id IN (SELECT id FROM public.daily_logs WHERE can_access_project(project_id)));

CREATE POLICY "daily_log_photos_select" ON public.daily_log_photos FOR SELECT 
  USING (daily_log_id IN (SELECT id FROM public.daily_logs WHERE can_access_project(project_id)));

CREATE POLICY "daily_log_materials_select" ON public.daily_log_materials FOR SELECT 
  USING (daily_log_id IN (SELECT id FROM public.daily_logs WHERE can_access_project(project_id)));

-- ============================================================
-- PART 7: RLS POLICIES - SCHEDULE
-- ============================================================

CREATE POLICY "schedule_phases_select" ON public.schedule_phases FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "schedule_phases_insert" ON public.schedule_phases FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm'));

CREATE POLICY "schedule_phases_update" ON public.schedule_phases FOR UPDATE 
  USING (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm'));

CREATE POLICY "schedule_items_select" ON public.schedule_items FOR SELECT 
  USING (can_access_project(project_id));

-- ============================================================
-- PART 8: RLS POLICIES - MATERIALS & PURCHASE ORDERS
-- ============================================================

CREATE POLICY "project_materials_select" ON public.project_materials FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "project_materials_insert" ON public.project_materials FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman', 'warehouse_manager'));

CREATE POLICY "purchase_orders_select" ON public.purchase_orders FOR SELECT 
  USING (project_id IS NULL OR can_access_project(project_id));

CREATE POLICY "purchase_orders_insert" ON public.purchase_orders FOR INSERT 
  WITH CHECK (get_user_role() IN ('owner', 'pm', 'office_admin', 'warehouse_manager'));

CREATE POLICY "purchase_orders_update" ON public.purchase_orders FOR UPDATE 
  USING (get_user_role() IN ('owner', 'pm', 'office_admin', 'warehouse_manager'));

CREATE POLICY "po_items_select" ON public.purchase_order_items FOR SELECT 
  USING (purchase_order_id IN (SELECT id FROM public.purchase_orders WHERE project_id IS NULL OR can_access_project(project_id)));

CREATE POLICY "material_deliveries_select" ON public.material_deliveries FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "material_deliveries_insert" ON public.material_deliveries FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman', 'warehouse_manager'));

-- ============================================================
-- PART 9: RLS POLICIES - WAREHOUSE (Company-Scoped)
-- ============================================================

CREATE POLICY "warehouse_locations_select" ON public.warehouse_locations FOR SELECT 
  USING (company_id = get_user_company_id());

CREATE POLICY "warehouse_locations_insert" ON public.warehouse_locations FOR INSERT 
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'warehouse_manager'));

CREATE POLICY "warehouse_inventory_select" ON public.warehouse_inventory FOR SELECT 
  USING (company_id = get_user_company_id());

CREATE POLICY "warehouse_inventory_insert" ON public.warehouse_inventory FOR INSERT 
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm', 'warehouse_manager'));

CREATE POLICY "warehouse_inventory_update" ON public.warehouse_inventory FOR UPDATE 
  USING (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm', 'warehouse_manager', 'warehouse_staff'));

CREATE POLICY "inventory_lots_select" ON public.inventory_lots FOR SELECT 
  USING (inventory_id IN (SELECT id FROM public.warehouse_inventory WHERE company_id = get_user_company_id()));

CREATE POLICY "inventory_locations_select" ON public.inventory_locations FOR SELECT 
  USING (inventory_id IN (SELECT id FROM public.warehouse_inventory WHERE company_id = get_user_company_id()));

CREATE POLICY "warehouse_allocations_select" ON public.warehouse_allocations FOR SELECT 
  USING (inventory_id IN (SELECT id FROM public.warehouse_inventory WHERE company_id = get_user_company_id()));

CREATE POLICY "warehouse_transfers_select" ON public.warehouse_transfers FOR SELECT 
  USING (
    from_location_id IN (SELECT id FROM public.warehouse_locations WHERE company_id = get_user_company_id())
    OR to_location_id IN (SELECT id FROM public.warehouse_locations WHERE company_id = get_user_company_id())
  );

CREATE POLICY "warehouse_transfer_items_select" ON public.warehouse_transfer_items FOR SELECT 
  USING (transfer_id IN (SELECT id FROM public.warehouse_transfers));

CREATE POLICY "warehouse_transactions_select" ON public.warehouse_transactions FOR SELECT 
  USING (inventory_id IN (SELECT id FROM public.warehouse_inventory WHERE company_id = get_user_company_id()));

-- ============================================================
-- PART 10: RLS POLICIES - SAFETY & COMPLIANCE
-- ============================================================

CREATE POLICY "moisture_tests_select" ON public.moisture_tests FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "moisture_tests_insert" ON public.moisture_tests FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman', 'installer'));

CREATE POLICY "moisture_test_readings_select" ON public.moisture_test_readings FOR SELECT 
  USING (test_id IN (SELECT id FROM public.moisture_tests WHERE can_access_project(project_id)));

CREATE POLICY "subfloor_tests_select" ON public.subfloor_tests FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "subfloor_test_readings_select" ON public.subfloor_test_readings FOR SELECT 
  USING (test_id IN (SELECT id FROM public.subfloor_tests WHERE can_access_project(project_id)));

CREATE POLICY "safety_incidents_select" ON public.safety_incidents FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "safety_incidents_insert" ON public.safety_incidents FOR INSERT 
  WITH CHECK (can_access_project(project_id));

CREATE POLICY "site_conditions_select" ON public.site_conditions FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "compliance_checklists_select" ON public.compliance_checklists FOR SELECT 
  USING (can_access_project(project_id));

-- ============================================================
-- PART 11: RLS POLICIES - CHANGE ORDERS, WALKTHROUGHS, QA
-- ============================================================

CREATE POLICY "change_orders_select" ON public.change_orders FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "change_orders_insert" ON public.change_orders FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman'));

CREATE POLICY "change_order_history_select" ON public.change_order_history FOR SELECT 
  USING (change_order_id IN (SELECT id FROM public.change_orders WHERE can_access_project(project_id)));

CREATE POLICY "walkthrough_sessions_select" ON public.walkthrough_sessions FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "walkthrough_attendees_select" ON public.walkthrough_attendees FOR SELECT 
  USING (session_id IN (SELECT id FROM public.walkthrough_sessions WHERE can_access_project(project_id)));

CREATE POLICY "completion_certificates_select" ON public.completion_certificates FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "qa_checklists_select" ON public.qa_checklists FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "qa_checklist_items_select" ON public.qa_checklist_items FOR SELECT 
  USING (checklist_id IN (SELECT id FROM public.qa_checklists WHERE can_access_project(project_id)));

-- ============================================================
-- PART 12: RLS POLICIES - ESTIMATES & INVOICING
-- ============================================================

CREATE POLICY "estimates_select" ON public.estimates FOR SELECT 
  USING (company_id = get_user_company_id());

CREATE POLICY "estimates_insert" ON public.estimates FOR INSERT 
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm', 'office_admin'));

CREATE POLICY "estimates_update" ON public.estimates FOR UPDATE 
  USING (company_id = get_user_company_id() AND get_user_role() IN ('owner', 'pm', 'office_admin'));

CREATE POLICY "estimate_rooms_select" ON public.estimate_rooms FOR SELECT 
  USING (estimate_id IN (SELECT id FROM public.estimates WHERE company_id = get_user_company_id()));

CREATE POLICY "estimate_materials_select" ON public.estimate_materials FOR SELECT 
  USING (estimate_id IN (SELECT id FROM public.estimates WHERE company_id = get_user_company_id()));

CREATE POLICY "estimate_labor_select" ON public.estimate_labor FOR SELECT 
  USING (estimate_id IN (SELECT id FROM public.estimates WHERE company_id = get_user_company_id()));

CREATE POLICY "client_invoices_select" ON public.client_invoices FOR SELECT 
  USING (project_id IS NULL OR can_access_project(project_id));

CREATE POLICY "client_invoices_insert" ON public.client_invoices FOR INSERT 
  WITH CHECK (get_user_role() IN ('owner', 'pm', 'office_admin'));

CREATE POLICY "invoice_items_select" ON public.invoice_items FOR SELECT 
  USING (invoice_id IN (SELECT id FROM public.client_invoices));

CREATE POLICY "invoice_payments_select" ON public.invoice_payments FOR SELECT 
  USING (invoice_id IN (SELECT id FROM public.client_invoices));

CREATE POLICY "subcontractor_invoices_select" ON public.subcontractor_invoices FOR SELECT 
  USING (project_id IS NULL OR can_access_project(project_id));

-- ============================================================
-- PART 13: RLS POLICIES - MESSAGES, NOTIFICATIONS, MISC
-- ============================================================

DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;

CREATE POLICY "messages_select" ON public.messages FOR SELECT 
  USING (project_id IS NULL OR can_access_project(project_id));

CREATE POLICY "messages_insert" ON public.messages FOR INSERT 
  WITH CHECK (project_id IS NULL OR can_access_project(project_id));

CREATE POLICY "message_reads_select" ON public.message_reads FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "message_reads_insert" ON public.message_reads FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "message_attachments_select" ON public.message_attachments FOR SELECT 
  USING (message_id IN (SELECT id FROM public.messages WHERE project_id IS NULL OR can_access_project(project_id)));

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "contract_scopes_select" ON public.contract_scopes FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "scope_items_select" ON public.scope_items FOR SELECT 
  USING (scope_id IN (SELECT id FROM public.contract_scopes WHERE can_access_project(project_id)));

CREATE POLICY "scope_changes_select" ON public.scope_changes FOR SELECT 
  USING (scope_id IN (SELECT id FROM public.contract_scopes WHERE can_access_project(project_id)));

CREATE POLICY "project_photos_select" ON public.project_photos FOR SELECT 
  USING (can_access_project(project_id));

CREATE POLICY "project_photos_insert" ON public.project_photos FOR INSERT 
  WITH CHECK (can_access_project(project_id) AND get_user_role() IN ('owner', 'pm', 'foreman', 'installer'));

CREATE POLICY "audit_log_select" ON public.audit_log FOR SELECT 
  USING (user_id = auth.uid() OR get_user_role() = 'owner');

-- ============================================================
-- COMPLETE! All 50+ tables now have RLS policies
-- ============================================================

