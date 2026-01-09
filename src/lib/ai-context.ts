import type { Database } from './data';

/**
 * Builds comprehensive context from app data for the AI assistant.
 * This gives the AI full knowledge of the application state.
 */
export function buildAIContext(data: Database) {
    return {
        // All Projects with full details
        projects: data.projects.map(p =>
            `• ${p.name} (${p.status}) - ${p.progress}% complete, Due: ${p.dueDate}, Client: ${p.client}, Value: $${p.value?.toLocaleString() || 0}, Address: ${p.address}, Sqft: ${p.sqft}`
        ).join('\n'),

        // All open punch items
        punchItems: data.projects.flatMap(p =>
            (p.punchList || []).filter(i => !i.completed).map(i =>
                `• [${i.priority.toUpperCase()}] ${i.text} - Project: ${p.name}, Location: ${i.location || 'N/A'}, Due: ${i.due}, Assigned: ${i.assignedTo || 'Unassigned'}`
            )
        ).join('\n') || 'No open punch items.',

        // Recent Daily Logs
        dailyLogs: data.projects.flatMap(p =>
            (p.dailyLogs || []).slice(0, 3).map(log =>
                `• ${log.date} - ${p.name}: ${log.workCompleted || log.notes || 'Work completed'}. Crew: ${log.totalCrewCount || log.crew || 0}, Hours: ${log.totalHours || log.hours || 0}${log.hasDelays ? ' ⚠️ Had delays' : ''}`
            )
        ).join('\n') || 'No recent daily logs.',

        // Estimates
        estimates: data.estimates?.map(e =>
            `• ${e.client} - Status: ${e.status}, Value: $${e.totals?.total?.toLocaleString() || 0}, Address: ${e.address}`
        ).join('\n') || 'No estimates.',

        // Vendors
        vendors: data.vendors?.map(v =>
            `• ${v.name} (${v.type}) - Rep: ${v.rep}, Phone: ${v.phone}`
        ).join('\n') || 'No vendors.',

        // Inventory (all items)
        inventory: data.inventory?.map(i =>
            `• ${i.name} (SKU: ${i.sku}) - Stock: ${i.stock}, Reserved: ${i.reserved}${i.stock < i.reserved ? ' ⚠️ LOW STOCK' : ''}`
        ).join('\n') || 'No inventory data.',

        // Team Members
        team: data.teamMembers?.map((t: any) =>
            `• ${t.name} - Role: ${t.role}${t.phone ? ', Phone: ' + t.phone : ''}`
        ).join('\n') || 'No team data.',

        // Subcontractors
        subcontractors: data.subcontractors?.map((s: any) =>
            `• ${s.name} - Trade: ${s.trade || 'General'}, Rating: ${s.rating || 'N/A'}/5, Contact: ${s.contactName || 'N/A'}`
        ).join('\n') || 'No subcontractors.',

        // Client Invoices
        invoices: data.clientInvoices?.map((inv: any) =>
            `• Invoice #${inv.invoiceNumber} - Client: ${inv.clientName}, Amount: $${inv.total?.toLocaleString() || 0}, Status: ${inv.status}, Due: ${inv.dueDate}`
        ).join('\n') || 'No invoices.',

        // Recent Messages
        messages: data.messages?.slice(0, 10).map(m =>
            `• ${m.from}: ${m.content?.substring(0, 100) || m.preview}${m.unread ? ' (UNREAD)' : ''}`
        ).join('\n') || 'No messages.',

        // Schedule items
        schedule: data.projects.flatMap(p =>
            (p.schedule || []).slice(0, 5).map((s) =>
                `• ${s.title} (${p.name}) - ${s.time}`
            )
        ).join('\n') || 'No scheduled tasks.',

        // Change Orders
        changeOrders: data.projects.flatMap(p =>
            (p.changeOrders || []).map(co =>
                `• CO#${co.number} (${p.name}) - ${co.desc}, Status: ${co.status}, Cost Impact: $${co.costImpact?.toLocaleString() || 0}`
            )
        ).join('\n') || 'No change orders.',

        // Purchase Orders
        purchaseOrders: data.purchaseOrders?.map((po: any) =>
            `• PO#${po.poNumber} - Vendor: ${po.vendorName}, Total: $${po.totalAmount?.toLocaleString() || 0}, Status: ${po.status}`
        ).join('\n') || 'No purchase orders.',

        // Deliveries
        deliveries: data.deliveries?.map((d: any) =>
            `• ${d.materialName} - Expected: ${d.expectedDate}, Status: ${d.status}, Vendor: ${d.vendorName}`
        ).join('\n') || 'No pending deliveries.'
    };
}
