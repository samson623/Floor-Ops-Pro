/**
 * Supabase Database Types
 * =======================
 * Auto-generated type definitions matching our PostgreSQL schema.
 * These types are synced with the supabase_migration.sql schema.
 * 
 * To regenerate from live database:
 * npx supabase gen types typescript --project-id jiqogdiygvsetjxszfzb > src/lib/supabase/types.ts
 * 
 * @author FloorOps Pro Engineering
 * @version 2.0.0
 * @synced 2026-01-08
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    phone: string | null;
                    role: 'owner' | 'pm' | 'foreman' | 'installer' | 'office_admin' | 'warehouse_manager' | 'warehouse_staff' | 'sub' | 'client';
                    avatar_url: string | null;
                    active: boolean | null;
                    created_at: string | null;
                    last_login_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id: string;
                    name: string;
                    email: string;
                    phone?: string | null;
                    role: 'owner' | 'pm' | 'foreman' | 'installer' | 'office_admin' | 'warehouse_manager' | 'warehouse_staff' | 'sub' | 'client';
                    avatar_url?: string | null;
                    active?: boolean | null;
                    created_at?: string | null;
                    last_login_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    name?: string;
                    email?: string;
                    phone?: string | null;
                    role?: 'owner' | 'pm' | 'foreman' | 'installer' | 'office_admin' | 'warehouse_manager' | 'warehouse_staff' | 'sub' | 'client';
                    avatar_url?: string | null;
                    active?: boolean | null;
                    last_login_at?: string | null;
                    updated_at?: string | null;
                };
            };
            crews: {
                Row: {
                    id: string;
                    name: string;
                    code: string;
                    lead_id: string | null;
                    specialty: string | null;
                    capacity_sqft_daily: number | null;
                    is_active: boolean | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    name: string;
                    code: string;
                    lead_id?: string | null;
                    specialty?: string | null;
                    capacity_sqft_daily?: number | null;
                    is_active?: boolean | null;
                    created_at?: string | null;
                };
                Update: {
                    name?: string;
                    code?: string;
                    lead_id?: string | null;
                    specialty?: string | null;
                    capacity_sqft_daily?: number | null;
                    is_active?: boolean | null;
                };
            };
            crew_members: {
                Row: {
                    id: string;
                    crew_id: string;
                    user_id: string | null;
                    role: 'lead' | 'installer' | 'helper' | 'apprentice' | null;
                    joined_at: string | null;
                };
                Insert: {
                    id?: string;
                    crew_id: string;
                    user_id?: string | null;
                    role?: 'lead' | 'installer' | 'helper' | 'apprentice' | null;
                    joined_at?: string | null;
                };
                Update: {
                    crew_id?: string;
                    user_id?: string | null;
                    role?: 'lead' | 'installer' | 'helper' | 'apprentice' | null;
                };
            };
            vendors: {
                Row: {
                    id: number;
                    name: string;
                    type: string;
                    phone: string | null;
                    email: string | null;
                    address: string | null;
                    rep_name: string | null;
                    rep_phone: string | null;
                    rep_email: string | null;
                    payment_terms: string | null;
                    notes: string | null;
                    is_active: boolean | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: number;
                    name: string;
                    type: string;
                    phone?: string | null;
                    email?: string | null;
                    address?: string | null;
                    rep_name?: string | null;
                    rep_phone?: string | null;
                    rep_email?: string | null;
                    payment_terms?: string | null;
                    notes?: string | null;
                    is_active?: boolean | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    name?: string;
                    type?: string;
                    phone?: string | null;
                    email?: string | null;
                    address?: string | null;
                    rep_name?: string | null;
                    rep_phone?: string | null;
                    rep_email?: string | null;
                    payment_terms?: string | null;
                    notes?: string | null;
                    is_active?: boolean | null;
                    updated_at?: string | null;
                };
            };
            projects: {
                Row: {
                    id: number;
                    key: string;
                    name: string;
                    client: string;
                    address: string;
                    sqft: number;
                    type: string;
                    value: number;
                    progress: number | null;
                    status: 'active' | 'scheduled' | 'pending' | 'completed';
                    start_date: string;
                    due_date: string;
                    crew_id: string | null;
                    created_by: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    deleted_at: string | null;
                    deleted_by: string | null;
                };
                Insert: {
                    id?: number;
                    key: string;
                    name: string;
                    client: string;
                    address: string;
                    sqft: number;
                    type: string;
                    value: number;
                    progress?: number | null;
                    status: 'active' | 'scheduled' | 'pending' | 'completed';
                    start_date: string;
                    due_date: string;
                    crew_id?: string | null;
                    created_by?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    key?: string;
                    name?: string;
                    client?: string;
                    address?: string;
                    sqft?: number;
                    type?: string;
                    value?: number;
                    progress?: number | null;
                    status?: 'active' | 'scheduled' | 'pending' | 'completed';
                    start_date?: string;
                    due_date?: string;
                    crew_id?: string | null;
                    updated_at?: string | null;
                    deleted_at?: string | null;
                    deleted_by?: string | null;
                };
            };
            project_financials: {
                Row: {
                    project_id: number;
                    contract: number;
                    costs: number | null;
                    margin: number | null;
                    updated_at: string | null;
                };
                Insert: {
                    project_id: number;
                    contract: number;
                    costs?: number | null;
                    margin?: number | null;
                    updated_at?: string | null;
                };
                Update: {
                    contract?: number;
                    costs?: number | null;
                    margin?: number | null;
                    updated_at?: string | null;
                };
            };
            user_project_assignments: {
                Row: {
                    id: string;
                    user_id: string;
                    project_id: number;
                    role: string | null;
                    assigned_at: string | null;
                    assigned_by: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    project_id: number;
                    role?: string | null;
                    assigned_at?: string | null;
                    assigned_by?: string | null;
                };
                Update: {
                    user_id?: string;
                    project_id?: number;
                    role?: string | null;
                };
            };
            milestones: {
                Row: {
                    id: number;
                    project_id: number;
                    title: string;
                    date: string;
                    status: 'completed' | 'current' | 'upcoming';
                    created_at: string | null;
                };
                Insert: {
                    id?: number;
                    project_id: number;
                    title: string;
                    date: string;
                    status: 'completed' | 'current' | 'upcoming';
                    created_at?: string | null;
                };
                Update: {
                    project_id?: number;
                    title?: string;
                    date?: string;
                    status?: 'completed' | 'current' | 'upcoming';
                };
            };
            punch_items: {
                Row: {
                    id: number;
                    project_id: number;
                    text: string;
                    priority: 'critical' | 'high' | 'medium' | 'low';
                    status: 'open' | 'assigned' | 'in-progress' | 'needs-verification' | 'completed' | 'on-hold' | null;
                    category: 'flooring' | 'transition' | 'grout' | 'baseboard' | 'damage' | 'installation' | 'cleanup' | 'touch-up' | 'other' | null;
                    reporter: string;
                    reporter_id: string | null;
                    reported_date: string | null;
                    assigned_to: string | null;
                    assigned_to_id: string | null;
                    assigned_date: string | null;
                    assigned_by: string | null;
                    location: string | null;
                    room: string | null;
                    area: string | null;
                    due: string;
                    due_time: string | null;
                    completed: boolean | null;
                    completed_by: string | null;
                    completed_by_id: string | null;
                    completed_date: string | null;
                    verification_required: boolean | null;
                    verified_by: string | null;
                    verified_by_id: string | null;
                    verified_date: string | null;
                    notes: string | null;
                    internal_notes: string | null;
                    tags: string[] | null;
                    estimated_hours: number | null;
                    actual_hours: number | null;
                    visible_to_client: boolean | null;
                    client_approval_required: boolean | null;
                    walkthrough_session_id: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    deleted_at: string | null;
                    deleted_by: string | null;
                };
                Insert: {
                    id?: number;
                    project_id: number;
                    text: string;
                    priority: 'critical' | 'high' | 'medium' | 'low';
                    status?: 'open' | 'assigned' | 'in-progress' | 'needs-verification' | 'completed' | 'on-hold' | null;
                    category?: 'flooring' | 'transition' | 'grout' | 'baseboard' | 'damage' | 'installation' | 'cleanup' | 'touch-up' | 'other' | null;
                    reporter: string;
                    reporter_id?: string | null;
                    reported_date?: string | null;
                    assigned_to?: string | null;
                    assigned_to_id?: string | null;
                    assigned_date?: string | null;
                    assigned_by?: string | null;
                    location?: string | null;
                    room?: string | null;
                    area?: string | null;
                    due: string;
                    due_time?: string | null;
                    completed?: boolean | null;
                    notes?: string | null;
                    internal_notes?: string | null;
                    tags?: string[] | null;
                    estimated_hours?: number | null;
                    visible_to_client?: boolean | null;
                    client_approval_required?: boolean | null;
                    walkthrough_session_id?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    project_id?: number;
                    text?: string;
                    priority?: 'critical' | 'high' | 'medium' | 'low';
                    status?: 'open' | 'assigned' | 'in-progress' | 'needs-verification' | 'completed' | 'on-hold' | null;
                    category?: 'flooring' | 'transition' | 'grout' | 'baseboard' | 'damage' | 'installation' | 'cleanup' | 'touch-up' | 'other' | null;
                    assigned_to?: string | null;
                    assigned_to_id?: string | null;
                    assigned_date?: string | null;
                    assigned_by?: string | null;
                    location?: string | null;
                    room?: string | null;
                    area?: string | null;
                    due?: string;
                    due_time?: string | null;
                    completed?: boolean | null;
                    completed_by?: string | null;
                    completed_by_id?: string | null;
                    completed_date?: string | null;
                    verification_required?: boolean | null;
                    verified_by?: string | null;
                    verified_by_id?: string | null;
                    verified_date?: string | null;
                    notes?: string | null;
                    internal_notes?: string | null;
                    tags?: string[] | null;
                    actual_hours?: number | null;
                    updated_at?: string | null;
                    deleted_at?: string | null;
                    deleted_by?: string | null;
                };
            };
            daily_logs: {
                Row: {
                    id: string;
                    project_id: number;
                    date: string;
                    total_crew_count: number;
                    total_hours: number;
                    overtime_hours: number | null;
                    work_completed: string;
                    sqft_completed: number | null;
                    phase: 'demo' | 'prep' | 'acclimation' | 'install' | 'cure' | 'punch' | 'closeout' | null;
                    areas_worked: string[] | null;
                    percent_complete: number | null;
                    weather: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'windy' | 'extreme-heat' | 'extreme-cold';
                    temperature: number | null;
                    humidity: number | null;
                    has_delays: boolean | null;
                    total_delay_minutes: number | null;
                    safety_notes: string | null;
                    incident_reported: boolean | null;
                    incident_id: string | null;
                    client_on_site: boolean | null;
                    client_name: string | null;
                    client_notes: string | null;
                    site_conditions: string | null;
                    signed_by: string | null;
                    signed_by_id: string | null;
                    signed_at: string | null;
                    signature_data: string | null;
                    created_by: string;
                    created_by_id: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    last_modified_by: string | null;
                    submitted_offline: boolean | null;
                    synced_at: string | null;
                    deleted_at: string | null;
                    deleted_by: string | null;
                };
                Insert: {
                    id?: string;
                    project_id: number;
                    date: string;
                    total_crew_count: number;
                    total_hours: number;
                    overtime_hours?: number | null;
                    work_completed: string;
                    sqft_completed?: number | null;
                    phase?: 'demo' | 'prep' | 'acclimation' | 'install' | 'cure' | 'punch' | 'closeout' | null;
                    areas_worked?: string[] | null;
                    percent_complete?: number | null;
                    weather: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'windy' | 'extreme-heat' | 'extreme-cold';
                    temperature?: number | null;
                    humidity?: number | null;
                    has_delays?: boolean | null;
                    total_delay_minutes?: number | null;
                    safety_notes?: string | null;
                    incident_reported?: boolean | null;
                    incident_id?: string | null;
                    client_on_site?: boolean | null;
                    client_name?: string | null;
                    client_notes?: string | null;
                    site_conditions?: string | null;
                    signed_by?: string | null;
                    signed_by_id?: string | null;
                    signed_at?: string | null;
                    signature_data?: string | null;
                    created_by: string;
                    created_by_id?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                    last_modified_by?: string | null;
                    submitted_offline?: boolean | null;
                    synced_at?: string | null;
                };
                Update: {
                    project_id?: number;
                    date?: string;
                    total_crew_count?: number;
                    total_hours?: number;
                    overtime_hours?: number | null;
                    work_completed?: string;
                    sqft_completed?: number | null;
                    phase?: 'demo' | 'prep' | 'acclimation' | 'install' | 'cure' | 'punch' | 'closeout' | null;
                    areas_worked?: string[] | null;
                    percent_complete?: number | null;
                    weather?: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'windy' | 'extreme-heat' | 'extreme-cold';
                    temperature?: number | null;
                    humidity?: number | null;
                    has_delays?: boolean | null;
                    total_delay_minutes?: number | null;
                    safety_notes?: string | null;
                    incident_reported?: boolean | null;
                    site_conditions?: string | null;
                    signed_by?: string | null;
                    signed_by_id?: string | null;
                    signed_at?: string | null;
                    signature_data?: string | null;
                    updated_at?: string | null;
                    last_modified_by?: string | null;
                    synced_at?: string | null;
                    deleted_at?: string | null;
                    deleted_by?: string | null;
                };
            };
            schedule_phases: {
                Row: {
                    id: string;
                    project_id: number;
                    phase: 'demo' | 'prep' | 'acclimation' | 'install' | 'cure' | 'punch' | 'closeout';
                    name: string;
                    start_date: string;
                    end_date: string;
                    actual_start_date: string | null;
                    actual_end_date: string | null;
                    status: 'pending' | 'in-progress' | 'completed' | 'delayed' | 'blocked' | null;
                    dependencies: string[] | null;
                    assigned_crew_id: string | null;
                    progress: number | null;
                    baseline_start: string | null;
                    baseline_end: string | null;
                    variance_days: number | null;
                    blocked_by: string | null;
                    blocking_reason: 'materials' | 'weather' | 'subfloor' | 'crew' | 'client' | 'other' | null;
                    notes: string | null;
                    is_critical_path: boolean | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    project_id: number;
                    phase: 'demo' | 'prep' | 'acclimation' | 'install' | 'cure' | 'punch' | 'closeout';
                    name: string;
                    start_date: string;
                    end_date: string;
                    actual_start_date?: string | null;
                    actual_end_date?: string | null;
                    status?: 'pending' | 'in-progress' | 'completed' | 'delayed' | 'blocked' | null;
                    dependencies?: string[] | null;
                    assigned_crew_id?: string | null;
                    progress?: number | null;
                    baseline_start?: string | null;
                    baseline_end?: string | null;
                    variance_days?: number | null;
                    blocked_by?: string | null;
                    blocking_reason?: 'materials' | 'weather' | 'subfloor' | 'crew' | 'client' | 'other' | null;
                    notes?: string | null;
                    is_critical_path?: boolean | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    phase?: 'demo' | 'prep' | 'acclimation' | 'install' | 'cure' | 'punch' | 'closeout';
                    name?: string;
                    start_date?: string;
                    end_date?: string;
                    actual_start_date?: string | null;
                    actual_end_date?: string | null;
                    status?: 'pending' | 'in-progress' | 'completed' | 'delayed' | 'blocked' | null;
                    dependencies?: string[] | null;
                    assigned_crew_id?: string | null;
                    progress?: number | null;
                    baseline_start?: string | null;
                    baseline_end?: string | null;
                    variance_days?: number | null;
                    blocked_by?: string | null;
                    blocking_reason?: 'materials' | 'weather' | 'subfloor' | 'crew' | 'client' | 'other' | null;
                    notes?: string | null;
                    is_critical_path?: boolean | null;
                    updated_at?: string | null;
                };
            };
            warehouse_inventory: {
                Row: {
                    id: string;
                    sku: string;
                    name: string;
                    description: string | null;
                    category: string | null;
                    manufacturer: string | null;
                    unit: string;
                    quantity_on_hand: number | null;
                    quantity_reserved: number | null;
                    quantity_available: number | null;
                    reorder_point: number | null;
                    reorder_qty: number | null;
                    lead_time_days: number | null;
                    unit_cost: number | null;
                    last_cost: number | null;
                    avg_cost: number | null;
                    default_location_id: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    deleted_at: string | null;
                    deleted_by: string | null;
                };
                Insert: {
                    id?: string;
                    sku: string;
                    name: string;
                    description?: string | null;
                    category?: string | null;
                    manufacturer?: string | null;
                    unit: string;
                    quantity_on_hand?: number | null;
                    quantity_reserved?: number | null;
                    reorder_point?: number | null;
                    reorder_qty?: number | null;
                    lead_time_days?: number | null;
                    unit_cost?: number | null;
                    last_cost?: number | null;
                    avg_cost?: number | null;
                    default_location_id?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    sku?: string;
                    name?: string;
                    description?: string | null;
                    category?: string | null;
                    manufacturer?: string | null;
                    unit?: string;
                    quantity_on_hand?: number | null;
                    quantity_reserved?: number | null;
                    reorder_point?: number | null;
                    reorder_qty?: number | null;
                    lead_time_days?: number | null;
                    unit_cost?: number | null;
                    last_cost?: number | null;
                    avg_cost?: number | null;
                    default_location_id?: string | null;
                    updated_at?: string | null;
                    deleted_at?: string | null;
                    deleted_by?: string | null;
                };
            };
            purchase_orders: {
                Row: {
                    id: string;
                    project_id: number | null;
                    po_number: string;
                    vendor_id: number | null;
                    vendor_name: string;
                    status: 'draft' | 'submitted' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled' | null;
                    order_date: string | null;
                    expected_delivery: string | null;
                    actual_delivery: string | null;
                    subtotal: number;
                    tax: number | null;
                    shipping: number | null;
                    total: number;
                    notes: string | null;
                    created_by: string | null;
                    approved_by: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    deleted_at: string | null;
                    deleted_by: string | null;
                };
                Insert: {
                    id?: string;
                    project_id?: number | null;
                    po_number: string;
                    vendor_id?: number | null;
                    vendor_name: string;
                    status?: 'draft' | 'submitted' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled' | null;
                    order_date?: string | null;
                    expected_delivery?: string | null;
                    actual_delivery?: string | null;
                    subtotal: number;
                    tax?: number | null;
                    shipping?: number | null;
                    total: number;
                    notes?: string | null;
                    created_by?: string | null;
                    approved_by?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    project_id?: number | null;
                    po_number?: string;
                    vendor_id?: number | null;
                    vendor_name?: string;
                    status?: 'draft' | 'submitted' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled' | null;
                    order_date?: string | null;
                    expected_delivery?: string | null;
                    actual_delivery?: string | null;
                    subtotal?: number;
                    tax?: number | null;
                    shipping?: number | null;
                    total?: number;
                    notes?: string | null;
                    approved_by?: string | null;
                    updated_at?: string | null;
                    deleted_at?: string | null;
                    deleted_by?: string | null;
                };
            };
            change_orders: {
                Row: {
                    id: string;
                    project_id: number;
                    number: number;
                    description: string;
                    reason: string;
                    cost_impact: number;
                    time_impact: number | null;
                    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'executed' | null;
                    created_date: string;
                    submitted_date: string | null;
                    approved_date: string | null;
                    executed_date: string | null;
                    approved_by: string | null;
                    photos: string[] | null;
                    notes: string | null;
                    created_by: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    deleted_at: string | null;
                    deleted_by: string | null;
                };
                Insert: {
                    id?: string;
                    project_id: number;
                    number: number;
                    description: string;
                    reason: string;
                    cost_impact: number;
                    time_impact?: number | null;
                    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'executed' | null;
                    created_date: string;
                    submitted_date?: string | null;
                    approved_date?: string | null;
                    executed_date?: string | null;
                    approved_by?: string | null;
                    photos?: string[] | null;
                    notes?: string | null;
                    created_by?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    project_id?: number;
                    number?: number;
                    description?: string;
                    reason?: string;
                    cost_impact?: number;
                    time_impact?: number | null;
                    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'executed' | null;
                    submitted_date?: string | null;
                    approved_date?: string | null;
                    executed_date?: string | null;
                    approved_by?: string | null;
                    photos?: string[] | null;
                    notes?: string | null;
                    updated_at?: string | null;
                    deleted_at?: string | null;
                    deleted_by?: string | null;
                };
            };
            messages: {
                Row: {
                    id: number;
                    project_id: number | null;
                    sender_id: string | null;
                    sender_name: string;
                    sender_role: 'pm' | 'client' | 'crew' | 'office' | 'system' | null;
                    content: string;
                    type: 'text' | 'system' | 'update' | 'alert' | null;
                    thread_id: number | null;
                    reply_count: number | null;
                    mentions: string[] | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: number;
                    project_id?: number | null;
                    sender_id?: string | null;
                    sender_name: string;
                    sender_role?: 'pm' | 'client' | 'crew' | 'office' | 'system' | null;
                    content: string;
                    type?: 'text' | 'system' | 'update' | 'alert' | null;
                    thread_id?: number | null;
                    reply_count?: number | null;
                    mentions?: string[] | null;
                    created_at?: string | null;
                };
                Update: {
                    project_id?: number | null;
                    sender_id?: string | null;
                    sender_name?: string;
                    sender_role?: 'pm' | 'client' | 'crew' | 'office' | 'system' | null;
                    content?: string;
                    type?: 'text' | 'system' | 'update' | 'alert' | null;
                    thread_id?: number | null;
                    reply_count?: number | null;
                    mentions?: string[] | null;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    title: string;
                    message: string;
                    link: string | null;
                    action_url: string | null;
                    read: boolean | null;
                    project_id: number | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: string;
                    title: string;
                    message: string;
                    link?: string | null;
                    action_url?: string | null;
                    read?: boolean | null;
                    project_id?: number | null;
                    created_at?: string | null;
                };
                Update: {
                    user_id?: string;
                    type?: string;
                    title?: string;
                    message?: string;
                    link?: string | null;
                    action_url?: string | null;
                    read?: boolean | null;
                    project_id?: number | null;
                };
            };
            client_invoices: {
                Row: {
                    id: string;
                    project_id: number | null;
                    invoice_number: string;
                    status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | null;
                    invoice_date: string;
                    due_date: string;
                    subtotal: number;
                    tax: number | null;
                    total: number;
                    amount_paid: number | null;
                    notes: string | null;
                    created_by: string | null;
                    created_at: string | null;
                    sent_at: string | null;
                    paid_at: string | null;
                    deleted_at: string | null;
                    deleted_by: string | null;
                };
                Insert: {
                    id?: string;
                    project_id?: number | null;
                    invoice_number: string;
                    status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | null;
                    invoice_date: string;
                    due_date: string;
                    subtotal: number;
                    tax?: number | null;
                    total: number;
                    amount_paid?: number | null;
                    notes?: string | null;
                    created_by?: string | null;
                    created_at?: string | null;
                    sent_at?: string | null;
                    paid_at?: string | null;
                };
                Update: {
                    project_id?: number | null;
                    invoice_number?: string;
                    status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | null;
                    invoice_date?: string;
                    due_date?: string;
                    subtotal?: number;
                    tax?: number | null;
                    total?: number;
                    amount_paid?: number | null;
                    notes?: string | null;
                    sent_at?: string | null;
                    paid_at?: string | null;
                    deleted_at?: string | null;
                    deleted_by?: string | null;
                };
            };
            audit_log: {
                Row: {
                    id: string;
                    table_name: string;
                    record_id: string;
                    action: 'INSERT' | 'UPDATE' | 'DELETE';
                    old_data: Json | null;
                    new_data: Json | null;
                    changed_fields: string[] | null;
                    user_id: string | null;
                    user_email: string | null;
                    user_role: string | null;
                    ip_address: string | null;
                    user_agent: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    table_name: string;
                    record_id: string;
                    action: 'INSERT' | 'UPDATE' | 'DELETE';
                    old_data?: Json | null;
                    new_data?: Json | null;
                    changed_fields?: string[] | null;
                    user_id?: string | null;
                    user_email?: string | null;
                    user_role?: string | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    table_name?: string;
                    record_id?: string;
                    action?: 'INSERT' | 'UPDATE' | 'DELETE';
                    old_data?: Json | null;
                    new_data?: Json | null;
                    changed_fields?: string[] | null;
                    user_id?: string | null;
                    user_email?: string | null;
                    user_role?: string | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                };
            };
        };
        Views: {
            v_active_projects: {
                Row: {
                    id: number | null;
                    key: string | null;
                    name: string | null;
                    client: string | null;
                    status: string | null;
                    start_date: string | null;
                    due_date: string | null;
                    sqft: number | null;
                };
            };
            v_open_punch_items: {
                Row: {
                    id: number | null;
                    project_id: number | null;
                    project_name: string | null;
                    project_key: string | null;
                    text: string | null;
                    priority: string | null;
                    status: string | null;
                    due: string | null;
                    assigned_to: string | null;
                };
            };
            v_overdue_punch_items: {
                Row: {
                    id: number | null;
                    project_id: number | null;
                    project_name: string | null;
                    text: string | null;
                    priority: string | null;
                    due: string | null;
                };
            };
            v_low_inventory: {
                Row: {
                    id: string | null;
                    sku: string | null;
                    name: string | null;
                    category: string | null;
                    quantity_available: number | null;
                    reorder_point: number | null;
                };
            };
            v_outstanding_invoices: {
                Row: {
                    id: string | null;
                    project_id: number | null;
                    project_name: string | null;
                    invoice_number: string | null;
                    status: string | null;
                    due_date: string | null;
                    total: number | null;
                };
            };
        };
        Functions: {
            get_user_role: {
                Args: Record<string, never>;
                Returns: string;
            };
        };
        Enums: {
            [_ in never]: never;
        };
    };
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row'];

// Convenience aliases
export type Profile = Tables<'profiles'>;
export type Project = Tables<'projects'>;
export type ProjectFinancials = Tables<'project_financials'>;
export type PunchItem = Tables<'punch_items'>;
export type DailyLog = Tables<'daily_logs'>;
export type SchedulePhase = Tables<'schedule_phases'>;
export type WarehouseInventory = Tables<'warehouse_inventory'>;
export type PurchaseOrder = Tables<'purchase_orders'>;
export type ChangeOrder = Tables<'change_orders'>;
export type Message = Tables<'messages'>;
export type Notification = Tables<'notifications'>;
export type Vendor = Tables<'vendors'>;
export type ClientInvoice = Tables<'client_invoices'>;
export type AuditLog = Tables<'audit_log'>;
export type Crew = Tables<'crews'>;
export type CrewMember = Tables<'crew_members'>;
export type Milestone = Tables<'milestones'>;
export type UserProjectAssignment = Tables<'user_project_assignments'>;
