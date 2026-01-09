-- ============================================================
-- FLOOROPS PRO - COMPLETE SUPABASE MIGRATION
-- Copy and paste this entire file into Supabase SQL Editor
-- Run in one execution
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- SECTION 1: PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN (
    'owner', 'pm', 'foreman', 'installer', 'office_admin',
    'warehouse_manager', 'warehouse_staff', 'sub', 'client'
  )),
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_active ON public.profiles(active) WHERE active = true;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'installer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 2: CREWS
-- ============================================================

CREATE TABLE public.crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES public.profiles(id),
  specialty TEXT,
  capacity_sqft_daily INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  role TEXT CHECK (role IN ('lead', 'installer', 'helper', 'apprentice')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(crew_id, user_id)
);

CREATE TABLE public.crew_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN DEFAULT true,
  hours_booked DECIMAL(4,2) DEFAULT 0,
  notes TEXT,
  UNIQUE(crew_id, date)
);

CREATE INDEX idx_crew_availability_date ON public.crew_availability(crew_id, date);

-- ============================================================
-- SECTION 3: VENDORS
-- ============================================================

CREATE TABLE public.vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  rep_name TEXT,
  rep_phone TEXT,
  rep_email TEXT,
  payment_terms TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 4: PROJECTS
-- ============================================================

CREATE TABLE public.projects (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  address TEXT NOT NULL,
  sqft INTEGER NOT NULL CHECK (sqft > 0),
  type TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL CHECK (value >= 0),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL CHECK (status IN ('active', 'scheduled', 'pending', 'completed')),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  crew_id UUID REFERENCES public.crews(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_dates CHECK (due_date >= start_date)
);

CREATE TABLE public.project_financials (
  project_id INTEGER PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  contract DECIMAL(12,2) NOT NULL CHECK (contract >= 0),
  costs DECIMAL(12,2) DEFAULT 0 CHECK (costs >= 0),
  margin DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, project_id)
);

CREATE TABLE public.milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'current', 'upcoming')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_due_date ON public.projects(due_date);
CREATE INDEX idx_projects_crew ON public.projects(crew_id);
CREATE INDEX idx_user_assignments_user ON public.user_project_assignments(user_id);
CREATE INDEX idx_user_assignments_project ON public.user_project_assignments(project_id);
CREATE INDEX idx_milestones_project ON public.milestones(project_id);

-- ============================================================
-- SECTION 5: PUNCH LIST SYSTEM
-- ============================================================

CREATE TABLE public.punch_items (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN (
    'open', 'assigned', 'in-progress', 'needs-verification', 'completed', 'on-hold'
  )),
  category TEXT CHECK (category IN (
    'flooring', 'transition', 'grout', 'baseboard', 'damage',
    'installation', 'cleanup', 'touch-up', 'other'
  )),
  reporter TEXT NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id),
  reported_date TIMESTAMPTZ DEFAULT now(),
  assigned_to TEXT,
  assigned_to_id UUID REFERENCES public.profiles(id),
  assigned_date TIMESTAMPTZ,
  assigned_by TEXT,
  location TEXT,
  room TEXT,
  area TEXT,
  due DATE NOT NULL,
  due_time TIME,
  completed BOOLEAN DEFAULT false,
  completed_by TEXT,
  completed_by_id UUID REFERENCES public.profiles(id),
  completed_date TIMESTAMPTZ,
  verification_required BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_by_id UUID REFERENCES public.profiles(id),
  verified_date TIMESTAMPTZ,
  notes TEXT,
  internal_notes TEXT,
  tags TEXT[],
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  visible_to_client BOOLEAN DEFAULT true,
  client_approval_required BOOLEAN DEFAULT false,
  walkthrough_session_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.punch_item_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punch_item_id INTEGER NOT NULL REFERENCES public.punch_items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  taken_by TEXT NOT NULL,
  taken_by_id UUID REFERENCES public.profiles(id),
  type TEXT CHECK (type IN ('before', 'during', 'after', 'issue', 'verification'))
);

CREATE TABLE public.punch_item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punch_item_id INTEGER NOT NULL REFERENCES public.punch_items(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'created', 'assigned', 'updated', 'prioritized', 'completed',
    'verified', 'reopened', 'photo-added', 'note-added'
  )),
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  notes TEXT
);

CREATE INDEX idx_punch_project ON public.punch_items(project_id);
CREATE INDEX idx_punch_status ON public.punch_items(status) WHERE status != 'completed';
CREATE INDEX idx_punch_priority ON public.punch_items(priority);
CREATE INDEX idx_punch_assigned ON public.punch_items(assigned_to_id) WHERE assigned_to_id IS NOT NULL;
CREATE INDEX idx_punch_due ON public.punch_items(due) WHERE completed = false;
CREATE INDEX idx_punch_overdue ON public.punch_items(due) WHERE completed = false AND due < CURRENT_DATE;
CREATE INDEX idx_punch_photos_item ON public.punch_item_photos(punch_item_id);
CREATE INDEX idx_punch_history_item ON public.punch_item_history(punch_item_id);

-- ============================================================
-- SECTION 6: DAILY LOGS
-- ============================================================

CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_crew_count INTEGER NOT NULL CHECK (total_crew_count > 0),
  total_hours DECIMAL(5,2) NOT NULL CHECK (total_hours >= 0),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  work_completed TEXT NOT NULL,
  sqft_completed INTEGER CHECK (sqft_completed >= 0),
  phase TEXT CHECK (phase IN ('demo', 'prep', 'acclimation', 'install', 'cure', 'punch', 'closeout')),
  areas_worked TEXT[],
  percent_complete INTEGER CHECK (percent_complete >= 0 AND percent_complete <= 100),
  weather TEXT NOT NULL CHECK (weather IN (
    'sunny', 'cloudy', 'rain', 'snow', 'windy', 'extreme-heat', 'extreme-cold'
  )),
  temperature INTEGER,
  humidity INTEGER CHECK (humidity >= 0 AND humidity <= 100),
  has_delays BOOLEAN DEFAULT false,
  total_delay_minutes INTEGER DEFAULT 0 CHECK (total_delay_minutes >= 0),
  safety_notes TEXT,
  incident_reported BOOLEAN DEFAULT false,
  incident_id UUID,
  client_on_site BOOLEAN DEFAULT false,
  client_name TEXT,
  client_notes TEXT,
  site_conditions TEXT,
  signed_by TEXT,
  signed_by_id UUID REFERENCES public.profiles(id),
  signed_at TIMESTAMPTZ,
  signature_data TEXT,
  created_by TEXT NOT NULL,
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_modified_by UUID REFERENCES public.profiles(id),
  submitted_offline BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  UNIQUE(project_id, date)
);

CREATE TABLE public.daily_log_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('lead', 'installer', 'helper', 'apprentice')),
  hours_worked DECIMAL(5,2) NOT NULL CHECK (hours_worked >= 0),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  notes TEXT
);

CREATE TABLE public.daily_log_delays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'weather', 'material-delay', 'material-defect', 'access-restriction',
    'client-delay', 'subcontractor-delay', 'equipment-failure',
    'site-condition', 'inspection-required', 'labor-shortage', 'other'
  )),
  description TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0),
  responsible_party TEXT CHECK (responsible_party IN (
    'client', 'supplier', 'weather', 'subcontractor', 'internal', 'gc', 'other'
  )),
  cost_impact DECIMAL(10,2),
  schedule_impact INTEGER,
  photos TEXT[],
  documented_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.daily_log_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  taken_by TEXT NOT NULL,
  type TEXT CHECK (type IN ('progress', 'issue', 'delay', 'completion', 'safety', 'before', 'after')),
  location TEXT
);

CREATE TABLE public.daily_log_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  quantity_used DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  lot_number TEXT,
  waste_amount DECIMAL(10,2),
  waste_reason TEXT
);

CREATE INDEX idx_daily_logs_project ON public.daily_logs(project_id);
CREATE INDEX idx_daily_logs_date ON public.daily_logs(date DESC);
CREATE INDEX idx_daily_logs_project_date ON public.daily_logs(project_id, date DESC);
CREATE INDEX idx_daily_log_delays_log ON public.daily_log_delays(daily_log_id);

-- ============================================================
-- SECTION 7: SCHEDULE
-- ============================================================

CREATE TABLE public.schedule_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('demo', 'prep', 'acclimation', 'install', 'cure', 'punch', 'closeout')),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_start_date DATE,
  actual_end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'delayed', 'blocked')),
  dependencies UUID[],
  assigned_crew_id UUID REFERENCES public.crews(id),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  baseline_start DATE,
  baseline_end DATE,
  variance_days INTEGER,
  blocked_by TEXT,
  blocking_reason TEXT CHECK (blocking_reason IN ('materials', 'weather', 'subfloor', 'crew', 'client', 'other')),
  notes TEXT,
  is_critical_path BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.schedule_items (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  type TEXT CHECK (type IN ('primary', 'success', 'warning', 'muted')),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_schedule_phases_project ON public.schedule_phases(project_id);
CREATE INDEX idx_schedule_items_date ON public.schedule_items(date);

-- ============================================================
-- SECTION 8: MATERIALS & PURCHASE ORDERS
-- ============================================================

CREATE TABLE public.project_materials (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  qty DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  status TEXT CHECK (status IN ('delivered', 'ordered', 'low')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES public.projects(id),
  po_number TEXT UNIQUE NOT NULL,
  vendor_id INTEGER REFERENCES public.vendors(id),
  vendor_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'ordered', 'partial', 'received', 'cancelled')),
  order_date DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  sku TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  received_quantity DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE public.material_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  purchase_order_id UUID REFERENCES public.purchase_orders(id),
  material_name TEXT NOT NULL,
  sku TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  expected_date DATE NOT NULL,
  actual_date DATE,
  status TEXT CHECK (status IN ('pending', 'scheduled', 'in-transit', 'delivered', 'delayed', 'partial')),
  vendor_name TEXT NOT NULL,
  vendor_contact TEXT,
  cost DECIMAL(12,2) NOT NULL,
  delivered_quantity DECIMAL(10,2),
  location TEXT,
  photos TEXT[],
  notes TEXT,
  received_by TEXT,
  received_by_id UUID REFERENCES public.profiles(id),
  received_at TIMESTAMPTZ,
  acclimation_required BOOLEAN DEFAULT false,
  acclimation_start_date DATE,
  acclimation_days_required INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_po_project ON public.purchase_orders(project_id);
CREATE INDEX idx_po_status ON public.purchase_orders(status);
CREATE INDEX idx_deliveries_project ON public.material_deliveries(project_id);
CREATE INDEX idx_deliveries_status ON public.material_deliveries(status);

-- ============================================================
-- SECTION 9: WAREHOUSE
-- ============================================================

CREATE TABLE public.warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  zone TEXT,
  aisle TEXT,
  rack TEXT,
  shelf TEXT,
  bin TEXT,
  capacity_sqft DECIMAL(10,2),
  current_usage_sqft DECIMAL(10,2) DEFAULT 0,
  location_type TEXT CHECK (location_type IN ('receiving', 'storage', 'staging', 'shipping', 'quarantine')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.warehouse_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  manufacturer TEXT,
  unit TEXT NOT NULL,
  quantity_on_hand DECIMAL(12,2) DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved DECIMAL(12,2) DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_available DECIMAL(12,2) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  reorder_point DECIMAL(10,2),
  reorder_qty DECIMAL(10,2),
  lead_time_days INTEGER,
  unit_cost DECIMAL(10,2),
  last_cost DECIMAL(10,2),
  avg_cost DECIMAL(10,2),
  default_location_id UUID REFERENCES public.warehouse_locations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.inventory_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.warehouse_inventory(id) ON DELETE CASCADE,
  lot_number TEXT NOT NULL,
  dye_lot TEXT,
  received_date DATE NOT NULL,
  expiry_date DATE,
  quantity DECIMAL(12,2) NOT NULL CHECK (quantity >= 0),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'hold', 'quarantine', 'expired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(inventory_id, lot_number)
);

CREATE TABLE public.inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.warehouse_inventory(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.warehouse_locations(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES public.inventory_lots(id),
  quantity DECIMAL(12,2) NOT NULL CHECK (quantity >= 0)
);

CREATE TABLE public.warehouse_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.warehouse_inventory(id),
  lot_id UUID REFERENCES public.inventory_lots(id),
  project_id INTEGER REFERENCES public.projects(id),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  allocated_by UUID REFERENCES public.profiles(id),
  allocated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

CREATE TABLE public.warehouse_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number TEXT UNIQUE NOT NULL,
  from_location_id UUID REFERENCES public.warehouse_locations(id),
  to_location_id UUID REFERENCES public.warehouse_locations(id),
  to_project_id INTEGER REFERENCES public.projects(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'in-transit', 'completed', 'cancelled')),
  requested_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  picked_by UUID REFERENCES public.profiles(id),
  received_by UUID REFERENCES public.profiles(id),
  requested_date TIMESTAMPTZ DEFAULT now(),
  approved_date TIMESTAMPTZ,
  shipped_date TIMESTAMPTZ,
  received_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.warehouse_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES public.warehouse_transfers(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES public.warehouse_inventory(id),
  lot_id UUID REFERENCES public.inventory_lots(id),
  quantity_requested DECIMAL(10,2) NOT NULL CHECK (quantity_requested > 0),
  quantity_picked DECIMAL(10,2),
  quantity_received DECIMAL(10,2)
);

CREATE TABLE public.warehouse_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.warehouse_inventory(id),
  location_id UUID REFERENCES public.warehouse_locations(id),
  lot_id UUID REFERENCES public.inventory_lots(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'receive', 'issue', 'transfer-out', 'transfer-in',
    'adjustment', 'damage', 'return', 'cycle-count'
  )),
  quantity DECIMAL(12,2) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  performed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_sku ON public.warehouse_inventory(sku);
CREATE INDEX idx_inventory_category ON public.warehouse_inventory(category);
CREATE INDEX idx_lots_inventory ON public.inventory_lots(inventory_id);
CREATE INDEX idx_lots_status ON public.inventory_lots(status);
CREATE INDEX idx_inv_locations ON public.inventory_locations(inventory_id, location_id);
CREATE INDEX idx_allocations_project ON public.warehouse_allocations(project_id);
CREATE INDEX idx_transfers_status ON public.warehouse_transfers(status);
CREATE INDEX idx_transactions_date ON public.warehouse_transactions(performed_at DESC);
CREATE INDEX idx_transactions_inventory ON public.warehouse_transactions(inventory_id);

-- ============================================================
-- SECTION 10: SAFETY & COMPLIANCE
-- ============================================================

CREATE TABLE public.moisture_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  test_type TEXT CHECK (test_type IN ('rh-probe', 'calcium-chloride', 'pin-meter', 'tramex', 'other')),
  ambient_temp INTEGER,
  ambient_rh INTEGER,
  slab_temp INTEGER,
  max_allowed DECIMAL(5,2),
  pass_fail TEXT CHECK (pass_fail IN ('pass', 'fail', 'pending')),
  notes TEXT,
  equipment_used TEXT,
  calibration_date DATE,
  performed_by UUID REFERENCES public.profiles(id),
  performed_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.moisture_test_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.moisture_tests(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  value DECIMAL(5,2) NOT NULL,
  depth DECIMAL(4,2),
  probe_id TEXT
);

CREATE TABLE public.subfloor_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  test_type TEXT CHECK (test_type IN ('10ft-straightedge', 'laser-level', 'floor-profiler', 'other')),
  standard TEXT,
  pass_fail TEXT CHECK (pass_fail IN ('pass', 'fail', 'pending')),
  notes TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  performed_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subfloor_test_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.subfloor_tests(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  deviation DECIMAL(4,2) NOT NULL,
  over_10ft BOOLEAN DEFAULT true
);

CREATE TABLE public.safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL,
  incident_time TIME,
  incident_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'serious', 'critical')),
  description TEXT NOT NULL,
  location TEXT,
  reported_by UUID REFERENCES public.profiles(id),
  reported_by_name TEXT NOT NULL,
  witnesses TEXT[],
  immediate_action TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  status TEXT CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.site_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT,
  reported_by UUID REFERENCES public.profiles(id),
  reported_by_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('identified', 'mitigating', 'resolved')),
  mitigation_plan TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.compliance_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  completed_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_moisture_tests_project ON public.moisture_tests(project_id);
CREATE INDEX idx_safety_incidents_project ON public.safety_incidents(project_id);

-- ============================================================
-- SECTION 11: CHANGE ORDERS
-- ============================================================

CREATE TABLE public.change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  cost_impact DECIMAL(12,2) NOT NULL,
  time_impact INTEGER,
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'executed')),
  created_date DATE NOT NULL,
  submitted_date DATE,
  approved_date DATE,
  executed_date DATE,
  approved_by TEXT,
  photos TEXT[],
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, number)
);

CREATE TABLE public.change_order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES public.change_orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  date DATE NOT NULL,
  by_name TEXT NOT NULL
);

CREATE INDEX idx_change_orders_project ON public.change_orders(project_id);

-- ============================================================
-- SECTION 12: WALKTHROUGHS & COMPLETION
-- ============================================================

CREATE TABLE public.walkthrough_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pre-install', 'mid-project', 'final', 'punch')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  areas_reviewed TEXT[],
  notes TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  client_feedback TEXT,
  weather TEXT,
  photos TEXT[],
  created_by TEXT NOT NULL,
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.walkthrough_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.walkthrough_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('client', 'pm', 'installer', 'lead', 'gc', 'architect', 'other')),
  email TEXT,
  phone TEXT,
  attended BOOLEAN DEFAULT true
);

CREATE TABLE public.completion_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER UNIQUE NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  contract_value DECIMAL(12,2) NOT NULL,
  change_orders_total DECIMAL(12,2) DEFAULT 0,
  final_value DECIMAL(12,2) NOT NULL,
  completion_date DATE NOT NULL,
  generated_date DATE DEFAULT CURRENT_DATE,
  client_signature TEXT,
  client_signed_by TEXT,
  client_signed_at TIMESTAMPTZ,
  contractor_signature TEXT,
  contractor_signed_by TEXT,
  contractor_signed_at TIMESTAMPTZ,
  all_punch_items_closed BOOLEAN DEFAULT false,
  final_walkthrough_complete BOOLEAN DEFAULT false,
  qa_checklists_complete BOOLEAN DEFAULT false,
  photos_documented BOOLEAN DEFAULT false,
  warranty_start_date DATE,
  warranty_end_date DATE,
  warranty_terms TEXT,
  outstanding_items TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending-signature', 'client-signed', 'fully-executed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_walkthroughs_project ON public.walkthrough_sessions(project_id);

-- ============================================================
-- SECTION 13: QA CHECKLISTS
-- ============================================================

CREATE TABLE public.qa_checklists (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('prep', 'install', 'closeout')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.qa_checklist_items (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER NOT NULL REFERENCES public.qa_checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  notes TEXT,
  checked_by TEXT,
  checked_at TIMESTAMPTZ
);

-- ============================================================
-- SECTION 14: ESTIMATES
-- ============================================================

CREATE TABLE public.estimates (
  id SERIAL PRIMARY KEY,
  client TEXT NOT NULL,
  address TEXT NOT NULL,
  contact TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
  created_date DATE NOT NULL,
  sent_date DATE,
  approved_date DATE,
  deposit_percent INTEGER DEFAULT 50,
  notes TEXT,
  materials_cost DECIMAL(12,2),
  labor_cost DECIMAL(12,2),
  subtotal DECIMAL(12,2),
  margin DECIMAL(12,2),
  total DECIMAL(12,2),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.estimate_rooms (
  id SERIAL PRIMARY KEY,
  estimate_id INTEGER NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  width DECIMAL(8,2) NOT NULL,
  length DECIMAL(8,2) NOT NULL,
  sqft DECIMAL(10,2) GENERATED ALWAYS AS (width * length) STORED,
  material TEXT NOT NULL,
  waste_percent INTEGER DEFAULT 10
);

CREATE TABLE public.estimate_materials (
  id SERIAL PRIMARY KEY,
  estimate_id INTEGER NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_per_sqft DECIMAL(10,2),
  price_per_unit DECIMAL(10,2),
  sqft DECIMAL(10,2),
  qty DECIMAL(10,2),
  total DECIMAL(12,2) NOT NULL
);

CREATE TABLE public.estimate_labor (
  id SERIAL PRIMARY KEY,
  estimate_id INTEGER NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  hours DECIMAL(8,2),
  rate DECIMAL(10,2),
  sqft DECIMAL(10,2),
  rate_per_sqft DECIMAL(10,2),
  trips INTEGER,
  total DECIMAL(12,2) NOT NULL
);

-- ============================================================
-- SECTION 15: INVOICING
-- ============================================================

CREATE TABLE public.client_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES public.projects(id),
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'void')),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  amount_due DECIMAL(12,2) GENERATED ALWAYS AS (total - amount_paid) STORED,
  notes TEXT,
  terms TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.client_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL
);

CREATE TABLE public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.client_invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  reference TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subcontractor_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES public.projects(id),
  subcontractor_name TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('submitted', 'pending-approval', 'approved', 'paid', 'disputed')),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  notes TEXT,
  submitted_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_client_invoices_project ON public.client_invoices(project_id);
CREATE INDEX idx_client_invoices_status ON public.client_invoices(status);
CREATE INDEX idx_sub_invoices_project ON public.subcontractor_invoices(project_id);

-- ============================================================
-- SECTION 16: MESSAGES & NOTIFICATIONS
-- ============================================================

CREATE TABLE public.messages (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  sender_name TEXT NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('pm', 'client', 'crew', 'office', 'system')),
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'system', 'update', 'alert')),
  thread_id INTEGER REFERENCES public.messages(id),
  reply_count INTEGER DEFAULT 0,
  mentions TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id INTEGER NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE TABLE public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id INTEGER NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('image', 'file')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  project_id INTEGER REFERENCES public.projects(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_project ON public.messages(project_id);
CREATE INDEX idx_messages_thread ON public.messages(thread_id);
CREATE INDEX idx_message_reads_user ON public.message_reads(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);

-- ============================================================
-- SECTION 17: CONTRACT SCOPE
-- ============================================================

CREATE TABLE public.contract_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER UNIQUE NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  original_scope TEXT NOT NULL,
  current_scope TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE public.scope_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id UUID NOT NULL REFERENCES public.contract_scopes(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('flooring', 'demo', 'prep', 'install', 'transition', 'misc')),
  description TEXT NOT NULL,
  area TEXT,
  sqft DECIMAL(10,2),
  included BOOLEAN DEFAULT true,
  excluded_reason TEXT
);

CREATE TABLE public.scope_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id UUID NOT NULL REFERENCES public.contract_scopes(id) ON DELETE CASCADE,
  change_order_id UUID REFERENCES public.change_orders(id),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  impact TEXT CHECK (impact IN ('addition', 'removal', 'modification')),
  affected_areas TEXT[],
  sqft_impact DECIMAL(10,2),
  value_impact DECIMAL(12,2),
  approved_by TEXT
);

-- ============================================================
-- SECTION 18: PROJECT PHOTOS
-- ============================================================

CREATE TABLE public.project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase TEXT CHECK (phase IN ('demo', 'prep', 'acclimation', 'install', 'cure', 'punch', 'closeout', 'pre-construction', 'complete', 'issue')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  location TEXT,
  taken_by TEXT NOT NULL,
  taken_by_id UUID REFERENCES public.profiles(id),
  tags TEXT[],
  is_before_photo BOOLEAN DEFAULT false,
  linked_photo_id UUID,
  change_order_id UUID REFERENCES public.change_orders(id),
  punch_item_id INTEGER REFERENCES public.punch_items(id)
);

CREATE INDEX idx_project_photos_project ON public.project_photos(project_id);
CREATE INDEX idx_project_photos_phase ON public.project_photos(project_id, phase);

-- ============================================================
-- SECTION 19: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles: users can read all, update own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Projects: role-based access
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (
  get_user_role() IN ('owner', 'pm', 'office_admin', 'warehouse_manager')
  OR id IN (SELECT project_id FROM public.user_project_assignments WHERE user_id = auth.uid())
);

CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (
  get_user_role() IN ('owner', 'pm')
);

CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (
  get_user_role() IN ('owner', 'pm')
);

-- Financials: pricing roles only
CREATE POLICY "financials_select" ON public.project_financials FOR SELECT USING (
  get_user_role() IN ('owner', 'pm', 'office_admin')
);

-- User assignments: self or admin
CREATE POLICY "assignments_select" ON public.user_project_assignments FOR SELECT USING (
  user_id = auth.uid() OR get_user_role() IN ('owner', 'pm', 'office_admin')
);

-- Punch items: project access
CREATE POLICY "punch_select" ON public.punch_items FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
      get_user_role() IN ('owner', 'pm', 'office_admin', 'foreman', 'warehouse_manager')
      OR id IN (SELECT project_id FROM public.user_project_assignments WHERE user_id = auth.uid())
  )
);

CREATE POLICY "punch_insert" ON public.punch_items FOR INSERT WITH CHECK (
  get_user_role() IN ('owner', 'pm', 'foreman', 'installer')
);

CREATE POLICY "punch_update" ON public.punch_items FOR UPDATE USING (
  get_user_role() IN ('owner', 'pm', 'foreman', 'installer')
);

-- Daily logs: project access
CREATE POLICY "daily_logs_select" ON public.daily_logs FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
      get_user_role() IN ('owner', 'pm', 'office_admin', 'foreman')
      OR id IN (SELECT project_id FROM public.user_project_assignments WHERE user_id = auth.uid())
  )
);

CREATE POLICY "daily_logs_insert" ON public.daily_logs FOR INSERT WITH CHECK (
  get_user_role() IN ('owner', 'pm', 'foreman', 'installer')
);

-- Messages: project access
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  project_id IS NULL 
  OR project_id IN (
    SELECT id FROM public.projects WHERE 
      get_user_role() IN ('owner', 'pm', 'office_admin')
      OR id IN (SELECT project_id FROM public.user_project_assignments WHERE user_id = auth.uid())
  )
);

CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (true);

-- Notifications: own only
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- SECTION 20: OPERATIONAL TRIGGERS & FUNCTIONS
-- ============================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_project_financials
  BEFORE UPDATE ON public.project_financials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_punch_items
  BEFORE UPDATE ON public.punch_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_daily_logs
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_schedule_phases
  BEFORE UPDATE ON public.schedule_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_project_materials
  BEFORE UPDATE ON public.project_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_purchase_orders
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_warehouse_inventory
  BEFORE UPDATE ON public.warehouse_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_change_orders
  BEFORE UPDATE ON public.change_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_estimates
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_vendors
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SECTION 21: AUDIT LOG TABLE
-- ============================================================

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES public.profiles(id),
  user_email TEXT,
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_table ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_record ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_date ON public.audit_log(created_at DESC);

-- Audit trigger function for critical tables
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[];
  key TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, user_id, user_email)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, old_data, auth.uid(), 
            (SELECT email FROM public.profiles WHERE id = auth.uid()));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    -- Find changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(old_data) AS o(key, value)
    WHERE o.value IS DISTINCT FROM new_data->o.key;
    
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, changed_fields, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, old_data, new_data, changed_fields, auth.uid(),
            (SELECT email FROM public.profiles WHERE id = auth.uid()));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    INSERT INTO public.audit_log (table_name, record_id, action, new_data, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, new_data, auth.uid(),
            (SELECT email FROM public.profiles WHERE id = auth.uid()));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_punch_items
  AFTER INSERT OR UPDATE OR DELETE ON public.punch_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_daily_logs
  AFTER INSERT OR UPDATE OR DELETE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_change_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.change_orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_purchase_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_client_invoices
  AFTER INSERT OR UPDATE OR DELETE ON public.client_invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_warehouse_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.warehouse_transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_safety_incidents
  AFTER INSERT OR UPDATE OR DELETE ON public.safety_incidents
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- ============================================================
-- SECTION 22: SOFT DELETE SUPPORT
-- ============================================================

-- Add soft delete columns to critical tables
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.punch_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.punch_items ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.client_invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.client_invoices ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.warehouse_inventory ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.warehouse_inventory ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

-- Indexes for soft delete queries (filter out deleted records)
CREATE INDEX idx_projects_not_deleted ON public.projects(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_punch_items_not_deleted ON public.punch_items(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_daily_logs_not_deleted ON public.daily_logs(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_change_orders_not_deleted ON public.change_orders(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_purchase_orders_not_deleted ON public.purchase_orders(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_client_invoices_not_deleted ON public.client_invoices(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_estimates_not_deleted ON public.estimates(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_not_deleted ON public.warehouse_inventory(id) WHERE deleted_at IS NULL;

-- Soft delete helper function
CREATE OR REPLACE FUNCTION public.soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = now();
  NEW.deleted_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 23: ADDITIONAL PERFORMANCE INDEXES
-- ============================================================

-- Text search indexes using pg_trgm
CREATE INDEX idx_projects_name_trgm ON public.projects USING gin(name gin_trgm_ops);
CREATE INDEX idx_projects_client_trgm ON public.projects USING gin(client gin_trgm_ops);
CREATE INDEX idx_punch_items_text_trgm ON public.punch_items USING gin(text gin_trgm_ops);
CREATE INDEX idx_inventory_name_trgm ON public.warehouse_inventory USING gin(name gin_trgm_ops);
CREATE INDEX idx_vendors_name_trgm ON public.vendors USING gin(name gin_trgm_ops);

-- Composite indexes for common query patterns
CREATE INDEX idx_projects_status_due ON public.projects(status, due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_punch_project_status ON public.punch_items(project_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_punch_assigned_status ON public.punch_items(assigned_to_id, status) WHERE deleted_at IS NULL AND assigned_to_id IS NOT NULL;
CREATE INDEX idx_daily_logs_project_date_v2 ON public.daily_logs(project_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_status_due ON public.client_invoices(status, due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_po_status_expected ON public.purchase_orders(status, expected_delivery) WHERE deleted_at IS NULL;

-- Indexes for dashboard aggregations
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_punch_reported_date ON public.punch_items(reported_date DESC);
CREATE INDEX idx_invoices_created_at ON public.client_invoices(created_at DESC);

-- ============================================================
-- SECTION 24: VIEWS FOR COMMON QUERIES
-- ============================================================

-- Active projects view (excludes soft-deleted)
CREATE OR REPLACE VIEW public.v_active_projects AS
SELECT * FROM public.projects WHERE deleted_at IS NULL;

-- Open punch items view
CREATE OR REPLACE VIEW public.v_open_punch_items AS
SELECT p.*, pr.name AS project_name, pr.key AS project_key
FROM public.punch_items p
JOIN public.projects pr ON p.project_id = pr.id
WHERE p.deleted_at IS NULL 
  AND p.completed = false 
  AND pr.deleted_at IS NULL;

-- Overdue punch items view
CREATE OR REPLACE VIEW public.v_overdue_punch_items AS
SELECT p.*, pr.name AS project_name
FROM public.punch_items p
JOIN public.projects pr ON p.project_id = pr.id
WHERE p.deleted_at IS NULL 
  AND p.completed = false 
  AND p.due < CURRENT_DATE
  AND pr.deleted_at IS NULL;

-- Low inventory view
CREATE OR REPLACE VIEW public.v_low_inventory AS
SELECT * FROM public.warehouse_inventory 
WHERE deleted_at IS NULL 
  AND reorder_point IS NOT NULL 
  AND quantity_available <= reorder_point;

-- Outstanding invoices view
CREATE OR REPLACE VIEW public.v_outstanding_invoices AS
SELECT i.*, p.name AS project_name
FROM public.client_invoices i
LEFT JOIN public.projects p ON i.project_id = p.id
WHERE i.deleted_at IS NULL 
  AND i.status IN ('sent', 'partial', 'overdue');

-- ============================================================
-- DONE! Complete database with:
-- ✓ 50+ tables
-- ✓ 80+ indexes (including text search)
-- ✓ Row Level Security policies
-- ✓ updated_at auto-triggers
-- ✓ Comprehensive audit logging
-- ✓ Soft delete support on critical tables
-- ✓ Performance views for common queries
-- 
-- NEXT: Create storage buckets in Supabase Dashboard:
-- 1. project-photos (public, 5MB limit)
-- 2. punch-photos (public, 5MB limit)  
-- 3. daily-log-photos (public, 5MB limit)
-- 4. signatures (private, 1MB limit)
-- 5. documents (private, 10MB limit)
-- 6. avatars (public, 2MB limit)
-- ============================================================
