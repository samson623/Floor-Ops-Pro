'use client';

import { useState } from 'react';
import {
    Project,
    ContractScope,
    ScopeItem,
    ScopeChange
} from '@/lib/data';
import { usePermissions, PermissionGate, PriceDisplay } from '@/components/permission-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Plus,
    History,
    FileSignature,
    Layers,
    ArrowRight,
    MapPin
} from 'lucide-react';

interface ScopeTabProps {
    project: Project;
    onUpdate?: (updates: Partial<Project>) => void;
}

export function ScopeTab({ project, onUpdate }: ScopeTabProps) {
    const { can, canViewPricing } = usePermissions();
    const showPricing = canViewPricing();
    const [expandedSections, setExpandedSections] = useState<string[]>(['scope', 'changes']);

    const scope = project.contractScope;
    const changeOrders = project.changeOrders || [];

    // Calculate change order metrics
    const approvedCOs = changeOrders.filter(co => co.status === 'approved');
    const pendingCOs = changeOrders.filter(co => co.status === 'submitted' || co.status === 'draft');
    const coValueChange = approvedCOs.reduce((sum, co) => sum + co.costImpact, 0);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    // Render scope item row
    const renderScopeItem = (item: ScopeItem) => (
        <div
            key={item.id}
            className={`flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors ${!item.included ? 'opacity-50' : ''
                }`}
        >
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{item.description}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                        {item.category}
                    </Badge>
                    {!item.included && (
                        <Badge variant="destructive" className="text-xs">
                            Excluded
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.area}
                    </span>
                    {item.sqft && (
                        <span>{item.sqft} sqft</span>
                    )}
                </div>
                {item.excludedReason && (
                    <p className="text-sm text-red-500 mt-1">{item.excludedReason}</p>
                )}
            </div>
        </div>
    );

    // If no scope data, show placeholder with change order info
    if (!scope) {
        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <FileSignature className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Contract Value</p>
                                    {showPricing ? (
                                        <p className="text-2xl font-bold">${project.value.toLocaleString()}</p>
                                    ) : (
                                        <p className="text-lg text-muted-foreground">—</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Approved COs</p>
                                    <p className="text-2xl font-bold">{approvedCOs.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-yellow-500/10">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending COs</p>
                                    <p className="text-2xl font-bold">{pendingCOs.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${coValueChange >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    {coValueChange >= 0 ? (
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">CO Impact</p>
                                    {showPricing ? (
                                        <p className={`text-2xl font-bold ${coValueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {coValueChange >= 0 ? '+' : ''}${Math.abs(coValueChange).toLocaleString()}
                                        </p>
                                    ) : (
                                        <p className="text-lg text-muted-foreground">—</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Empty State */}
                <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Detailed Scope Defined</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Define the contract scope to track line items, changes, and variations from the original agreement.
                        </p>
                        <PermissionGate permission="EDIT_CONTRACT_SCOPE">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Define Contract Scope
                            </Button>
                        </PermissionGate>
                    </CardContent>
                </Card>

                {/* Change Orders Summary */}
                {changeOrders.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" />
                                Change Order History
                            </CardTitle>
                            <CardDescription>
                                Track scope modifications via change orders
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {changeOrders.slice(0, 5).map(co => (
                                    <div key={co.id} className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={co.status === 'approved' ? 'default' : co.status === 'submitted' ? 'secondary' : 'destructive'}
                                            >
                                                {co.status}
                                            </Badge>
                                            <div>
                                                <p className="font-medium">{co.id}: {co.desc}</p>
                                                <p className="text-sm text-muted-foreground">{co.reason}</p>
                                            </div>
                                        </div>
                                        {showPricing && (
                                            <div className={`font-bold ${co.costImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {co.costImpact >= 0 ? '+' : ''}${Math.abs(co.costImpact).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // Full scope view
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <FileSignature className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Contract Value</p>
                                {showPricing ? (
                                    <p className="text-2xl font-bold">${project.value.toLocaleString()}</p>
                                ) : (
                                    <p className="text-lg text-muted-foreground">—</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Layers className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Scope Items</p>
                                <p className="text-2xl font-bold">{scope.scopeItems.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">In Scope</p>
                                <p className="text-2xl font-bold">{scope.scopeItems.filter(i => i.included).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <History className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Scope Changes</p>
                                <p className="text-2xl font-bold">{scope.scopeChanges.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Scope Description */}
            <Card>
                <CardHeader
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleSection('scope')}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {expandedSections.includes('scope') ? (
                                <ChevronDown className="w-5 h-5" />
                            ) : (
                                <ChevronRight className="w-5 h-5" />
                            )}
                            <CardTitle>Contract Scope</CardTitle>
                        </div>
                    </div>
                    <CardDescription className="ml-7">
                        Last updated: {new Date(scope.lastUpdated).toLocaleDateString()} by {scope.updatedBy}
                    </CardDescription>
                </CardHeader>
                {expandedSections.includes('scope') && (
                    <CardContent className="pt-0 space-y-4">
                        {/* Original Scope */}
                        <div className="p-4 bg-muted/30 rounded-lg">
                            <p className="text-sm font-medium mb-2">Original Scope</p>
                            <p className="text-sm text-muted-foreground">{scope.originalScope}</p>
                        </div>

                        {/* Current Scope */}
                        {scope.currentScope !== scope.originalScope && (
                            <div className="p-4 bg-blue-500/10 rounded-lg">
                                <p className="text-sm font-medium mb-2">Current Scope</p>
                                <p className="text-sm text-muted-foreground">{scope.currentScope}</p>
                            </div>
                        )}

                        {/* Scope Items */}
                        {scope.scopeItems.length > 0 && (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="py-2 px-4 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
                                    Scope Line Items
                                </div>
                                {scope.scopeItems.map(item => renderScopeItem(item))}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Scope Change History */}
            <PermissionGate permission="VIEW_SCOPE_HISTORY">
                <Card>
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleSection('changes')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {expandedSections.includes('changes') ? (
                                    <ChevronDown className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )}
                                <CardTitle>Scope Change History</CardTitle>
                                <Badge variant="outline">{scope.scopeChanges.length} changes</Badge>
                            </div>
                            <PermissionGate permission="EDIT_CONTRACT_SCOPE">
                                <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Change
                                </Button>
                            </PermissionGate>
                        </div>
                        <CardDescription className="ml-7">
                            Audit trail of all scope modifications
                        </CardDescription>
                    </CardHeader>
                    {expandedSections.includes('changes') && (
                        <CardContent className="pt-0">
                            {scope.scopeChanges.length > 0 ? (
                                <div className="space-y-4">
                                    {scope.scopeChanges.map((change, index) => (
                                        <div key={change.id} className="relative pl-6 pb-6 last:pb-0">
                                            {/* Timeline line */}
                                            {index < scope.scopeChanges.length - 1 && (
                                                <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-border" />
                                            )}
                                            {/* Timeline dot */}
                                            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${change.impact === 'addition' ? 'bg-green-500 border-green-600' :
                                                change.impact === 'modification' ? 'bg-yellow-500 border-yellow-600' :
                                                    'bg-red-500 border-red-600'
                                                }`} />

                                            <div className="bg-muted/30 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={
                                                                change.impact === 'addition' ? 'default' :
                                                                    change.impact === 'modification' ? 'secondary' : 'destructive'
                                                            }>
                                                                {change.impact}
                                                            </Badge>
                                                            {change.changeOrderId && (
                                                                <Badge variant="outline">{change.changeOrderId}</Badge>
                                                            )}
                                                        </div>
                                                        <p className="font-medium mt-1">{change.description}</p>
                                                    </div>
                                                    {showPricing && change.valueImpact !== undefined && (
                                                        <div className={`font-bold ${change.valueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {change.valueImpact >= 0 ? '+' : ''}${Math.abs(change.valueImpact).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                                {change.affectedAreas.length > 0 && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Areas: {change.affectedAreas.join(', ')}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span>{new Date(change.date).toLocaleDateString()}</span>
                                                    {change.approvedBy && <span>by {change.approvedBy}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No scope changes recorded</p>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            </PermissionGate>
        </div>
    );
}
