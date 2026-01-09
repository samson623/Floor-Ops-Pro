/**
 * Supabase Integration - Main Export
 * ===================================
 * Central export point for all Supabase functionality.
 * 
 * Usage:
 *   import { useProjects, ProjectsService, isSupabaseConfigured } from '@/lib/supabase';
 * 
 * @author FloorOps Pro Engineering
 * @version 2.0.0
 */

// Client
export { createClient, createServerSupabaseClient, getSupabaseClient, isSupabaseConfigured } from './client';

// Types
export type {
    Database,
    Json,
    Tables,
    InsertTables,
    UpdateTables,
    Views,
    Profile,
    Project,
    ProjectFinancials,
    PunchItem,
    DailyLog,
    SchedulePhase,
    WarehouseInventory,
    PurchaseOrder,
    ChangeOrder,
    Message,
    Notification,
    Vendor,
    ClientInvoice,
    AuditLog,
} from './types';

// Services
export {
    ProjectsService,
    PunchItemsService,
    DailyLogsService,
    InventoryService,
    PurchaseOrdersService,
    MessagesService,
    NotificationsService,
    StorageService,
    syncQueue,
    type ServiceResult,
} from './services';

// Hooks
export {
    // Status
    useSupabaseStatus,
    // Auth
    useAuth,
    // Projects
    useProjects,
    useProject,
    useProjectWithFinancials,
    useProjectSearch,
    // Punch Items
    usePunchItems,
    useOpenPunchItems,
    useOverduePunchItems,
    // Daily Logs
    useDailyLogs,
    useDailyLogsByDateRange,
    // Inventory
    useInventory,
    useLowStockItems,
    useInventoryByCategory,
    // Purchase Orders
    usePurchaseOrders,
    useProjectPurchaseOrders,
    // Messages (real-time)
    useProjectMessages,
    // Notifications (real-time)
    useNotifications,
    // Mutations
    useMutation,
    useCreateProject,
    useUpdateProject,
    useCreatePunchItem,
    useUpdatePunchItem,
    useCompletePunchItem,
    useCreateDailyLog,
    useSubmitDailyLog,
    useCreatePurchaseOrder,
    useAdjustInventory,
} from './hooks';
