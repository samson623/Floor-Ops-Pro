# Demo Mode Implementation Plan

## Goal
Enable users to explore Floor Ops Pro through a "Try Demo" button that grants read-only access to the application using a shared demo account (`demo@floorops.com`).

## Proposed Changes

### ✅ Authentication & Demo User (COMPLETE)

#### [MODIFY] [permission-context.tsx](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/components/permission-context.tsx)
- ✅ Add `isDemoMode` boolean to `PermissionContextType` and state
- ✅ Add `signInAsDemo()` function that switches to demo user (ID: 99)
- ✅ Create demo user object in `DEFAULT_USERS` with `role: 'demo'` (view-only)
- ✅ Export `isDemoMode` flag for components to check

#### [MODIFY] [permissions.ts](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/lib/permissions.ts)
- ✅ Add `'demo'` to `UserRole` type
- ✅ Define demo role in `ROLE_DEFINITIONS`
- ✅ Add demo role permissions (view-only) to `ROLE_PERMISSIONS`
- ✅ Add demo user (ID: 99) to `DEFAULT_USERS`

---

### ✅ Read-Only Enforcement (COMPLETE)

#### [MODIFY] [services.ts](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/lib/supabase/services.ts)
- ✅ Add `isDemoMode()` check helper function that reads from localStorage
- ✅ Add `getDemoModeError()` helper to return demo mode error
- ✅ Wrap all `create`, `update`, `delete`, `adjust` operations with demo mode check
- ✅ Affected services: `ProjectsService`, `PunchItemsService`, `DailyLogsService`, `InventoryService`, `PurchaseOrdersService`, `MessagesService`, `StorageService`

---

### ✅ Demo Sign-In Flow (COMPLETE)

#### [NEW] [demo page.tsx](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/app/(marketing)/demo/page.tsx)
- ✅ Create dedicated demo landing page
- ✅ Auto-sign in to demo account on mount
- ✅ Redirect to dashboard after animation
- ✅ Show "Entering Demo Mode..." loading state

#### [MODIFY] [landing page.tsx](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/app/(marketing)/landing/page.tsx)
- ✅ Update "Try Demo" buttons to navigate to `/demo` instead of `/login`

---

### ✅ Visual Indicators (COMPLETE)

#### [NEW] [demo-mode-banner.tsx](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/components/demo-mode-banner.tsx)
- ✅ Create persistent top banner component
- ✅ Display: "🎭 Demo Mode - Exploring Floor Ops Pro (changes won't be saved)"
- ✅ Add "Exit Demo" button that signs out
- ✅ Styled with gradient background and dismissible option

#### [MODIFY] [dashboard layout.tsx](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/app/(dashboard)/layout.tsx)
- ✅ Import and render `<DemoModeBanner />` when in demo mode

#### [MODIFY] [login page.tsx](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/app/(dashboard)/login/page.tsx)
- ✅ Add demo role to `ROLE_CAPABILITIES` mapping

---

### ✅ Demo Data (Local Mock Data) (COMPLETE)

#### [NEW] [demo-data.ts](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/lib/demo-data.ts)
- ✅ Created comprehensive mock data file with:
  - 3 sample projects (Downtown Loft, TechHub Office, Lakeside Cottage)
  - 3 punch items with different statuses and priorities
  - 2 daily logs with realistic content
  - 2 inventory items
  - 2 purchase orders
  - 2 messages with thread structure
  - 2 notifications

#### [MODIFY] [services.ts](file:///C:/Users/1sams/OneDrive/Desktop/_Floor%20Ops%20Pro/src/lib/supabase/services.ts)
- ✅ All read operations return mock data when in demo mode:
  - `ProjectsService.getAll`, `getById`, `getWithFinancials`, `search`
  - `PunchItemsService.getByProject`, `getOpen`, `getOverdue`
  - `DailyLogsService.getByProject`
  - `InventoryService.getAll`, `getLowStock`, `getByCategory`
  - `PurchaseOrdersService.getAll`, `getByProject`
  - `MessagesService.getByProject`
  - `NotificationsService.getForUser`, `getUnreadCount`

---

## ✅ IMPLEMENTATION COMPLETE

All phases of the demo mode implementation have been completed and verified.

---

## Verification Plan

### Automated Tests
None required for this feature (UI/UX focused, manual testing is sufficient).

### Manual Verification

#### Test 1: Demo Sign-In Flow
1. Open browser to `http://localhost:3000/landing`
2. Click "Try Demo" button in navigation bar
3. **Verify:** Redirected to `/demo`
4. **Verify:** See "Entering Demo Mode..." animation
5. **Verify:** After 2 seconds, redirected to `/dashboard`
6. **Verify:** Demo mode banner appears at top
7. **Verify:** User menu shows "Demo User"

#### Test 2: Read-Only Enforcement (Projects)
1. While in demo mode, go to Projects page
2. Click "+ New Project" button
3. **Verify:** Button is disabled OR modal opens but save is disabled
4. **Verify:** Toast appears: "Demo mode: Changes are not saved"
5. Try to edit existing project
6. **Verify:** Save button is disabled
7. **Verify:** No changes persist after refresh

#### Test 3: Read-Only Enforcement (Other Features)
Repeat Test 2 for:
- Punch items (create/edit)
- Daily logs (create/edit)
- Invoices (create/edit)
- Crew members (create/edit/delete)
- Materials (adjust inventory)

#### Test 4: Demo Mode Banner
1. In demo mode, verify banner is visible on all pages
2. Click "Exit Demo" in banner
3 **Verify:** Signed out and redirected to `/landing`
4. **Verify:** Demo mode banner disappears

#### Test 5: Entry Points
1. From landing page hero section, click "Explore the Platform"
2. **Verify:** Enters demo mode correctly
3. Sign out, return to landing page
4. From CTA section, click "Try the Demo"
5. **Verify:** Enters demo mode correctly

---

## Notes

- **Demo user ID:** 99 (to avoid conflicts with real users)
- **Demo email:** `demo@floorops.com`
- **Demo role:** `'demo'` (new role with all mutation permissions disabled)
- **Enforcement layers:** Service layer (primary) + UI layer (UX)
- **Visual feedback:** Banner + disabled buttons + toast notifications
- **No authentication required:** Demo user is auto-logged-in via permission context
