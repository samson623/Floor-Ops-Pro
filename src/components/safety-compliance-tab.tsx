'use client';

import React, { useState } from 'react';
import {
    Shield,
    Droplets,
    Ruler,
    AlertTriangle,
    ClipboardCheck,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Camera,
    FileText,
    Users,
    Calendar,
    ThermometerSun,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    MoistureTest,
    SubfloorFlatnessTest,
    SiteCondition,
    SafetyIncident,
    ComplianceChecklist,
    RISK_LEVEL_CONFIG,
    MOISTURE_LIMITS,
    Project
} from '@/lib/data';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/components/permission-context';

// Props interface
interface SafetyComplianceTabProps {
    project: Project;
    onAddMoistureTest?: () => void;
    onAddSubfloorTest?: () => void;
    onAddSiteCondition?: () => void;
    onReportIncident?: () => void;
    onCreateChecklist?: () => void;
}

// Risk level badge component
function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' | 'critical' }) {
    const config = RISK_LEVEL_CONFIG[level];
    const colorClasses = {
        low: 'bg-green-500/10 text-green-500 border-green-500/20',
        medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
        <Badge variant="outline" className={cn('font-medium', colorClasses[level])}>
            {config.label}
        </Badge>
    );
}

// Pass/Fail badge component
function PassFailBadge({ passed }: { passed: boolean }) {
    return passed ? (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Pass
        </Badge>
    ) : (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
            <XCircle className="h-3 w-3" /> Fail
        </Badge>
    );
}

// Moisture Test Card Component
function MoistureTestCard({ test }: { test: MoistureTest }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="border-border/40 bg-card/50">
            <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        test.passed ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                        <Droplets className={cn(
                            "h-5 w-5",
                            test.passed ? "text-green-500" : "text-red-500"
                        )} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{test.testType === 'rh-probe' ? 'RH Probe Test' : 'Calcium Chloride Test'}</p>
                            <PassFailBadge passed={test.passed} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {new Date(test.testDate).toLocaleDateString()} • {test.readings.length} locations • Highest: {test.highestReading}% RH
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                        Limit: {test.manufacturerLimit}% RH
                    </Badge>
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
            </div>
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border/40 mt-0">
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Ambient Temp</p>
                            <p className="font-medium">{test.ambientTemp}°F</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Ambient RH</p>
                            <p className="font-medium">{test.ambientRH}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Average Reading</p>
                            <p className="font-medium">{test.averageReading.toFixed(1)}% RH</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tested By</p>
                            <p className="font-medium">{test.testedBy}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Test Locations</p>
                        <div className="space-y-2">
                            {test.readings.map((reading, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                    <span className="text-sm">{reading.location}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "font-mono text-sm font-medium",
                                            reading.value <= test.manufacturerLimit ? "text-green-500" : "text-red-500"
                                        )}>
                                            {reading.value}% RH
                                        </span>
                                        {reading.value <= test.manufacturerLimit ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {test.notes && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm">{test.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

// Subfloor Test Card Component
function SubfloorTestCard({ test }: { test: SubfloorFlatnessTest }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="border-border/40 bg-card/50">
            <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        test.passed ? "bg-green-500/10" : "bg-orange-500/10"
                    )}>
                        <Ruler className={cn(
                            "h-5 w-5",
                            test.passed ? "text-green-500" : "text-orange-500"
                        )} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">Flatness Test - {test.subfloorType}</p>
                            <PassFailBadge passed={test.passed} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {new Date(test.testDate).toLocaleDateString()} • {test.areasTested.length} areas • Condition: {test.subfloorCondition}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {test.remediationRequired && (
                        <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                            Remediation Required
                        </Badge>
                    )}
                    {test.remediationComplete && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                            Remediation Complete
                        </Badge>
                    )}
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
            </div>
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border/40 mt-0">
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Worst Gap (10')</p>
                            <p className="font-medium">{test.worstGap}" / {test.maxAllowableGap}" max</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Worst Lippage</p>
                            <p className="font-medium">{test.worstLippage}" / {test.maxAllowableLippage}" max</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Standard</p>
                            <p className="font-medium capitalize">{test.standard.replace('-', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tested By</p>
                            <p className="font-medium">{test.testedBy}</p>
                        </div>
                    </div>
                    {test.remediationRequired && test.remediationType && (
                        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg">
                            <p className="text-sm font-medium text-orange-500 mb-1">Remediation: {test.remediationType}</p>
                            <p className="text-sm text-muted-foreground">
                                Est. {test.estimatedRemediationHours} hours • ${test.estimatedRemediationCost}
                            </p>
                        </div>
                    )}
                    {test.notes && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm">{test.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

// Site Condition Card Component
function SiteConditionCard({ condition }: { condition: SiteCondition }) {
    const [expanded, setExpanded] = useState(false);
    const isResolved = condition.status === 'resolved' || condition.status === 'accepted';

    return (
        <Card className={cn(
            "border-border/40",
            isResolved ? "bg-muted/30 opacity-75" : "bg-card/50"
        )}>
            <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${RISK_LEVEL_CONFIG[condition.riskLevel].color}20` }}>
                        <AlertTriangle className="h-5 w-5" style={{ color: RISK_LEVEL_CONFIG[condition.riskLevel].color }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium capitalize">{condition.conditionType.replace(/-/g, ' ')}</p>
                            <RiskBadge level={condition.riskLevel} />
                            {isResolved && (
                                <Badge variant="outline" className="bg-muted text-muted-foreground">
                                    {condition.status}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{condition.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
            </div>
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border/40">
                    <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Affected Areas</p>
                        <div className="flex flex-wrap gap-1">
                            {condition.affectedAreas.map((area, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{area}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{condition.impactsSchedule ? 'Impacts Schedule' : 'No Schedule Impact'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{condition.impactsBudget ? 'Impacts Budget' : 'No Budget Impact'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{condition.requiresClientApproval ? 'Client Approval Required' : 'No Approval Needed'}</span>
                        </div>
                    </div>
                    {condition.mitigations.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs text-muted-foreground mb-2">Mitigations</p>
                            <div className="space-y-2">
                                {condition.mitigations.map((m, idx) => (
                                    <div key={idx} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                                        {m.verified ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm">{m.action}</p>
                                            <p className="text-xs text-muted-foreground">By {m.implementedBy}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

// Compliance Checklist Card Component
function ComplianceChecklistCard({ checklist }: { checklist: ComplianceChecklist }) {
    const [expanded, setExpanded] = useState(false);
    const statusColors = {
        'not-started': 'bg-gray-500/10 text-gray-500',
        'in-progress': 'bg-amber-500/10 text-amber-500',
        'completed': 'bg-green-500/10 text-green-500',
        'requires-attention': 'bg-red-500/10 text-red-500',
    };

    return (
        <Card className="border-border/40 bg-card/50">
            <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        checklist.status === 'completed' ? "bg-green-500/10" : "bg-primary/10"
                    )}>
                        <ClipboardCheck className={cn(
                            "h-5 w-5",
                            checklist.status === 'completed' ? "text-green-500" : "text-primary"
                        )} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{checklist.title}</p>
                            <Badge variant="outline" className={cn("text-xs", statusColors[checklist.status])}>
                                {checklist.status.replace('-', ' ')}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {new Date(checklist.date).toLocaleDateString()} • {checklist.itemsChecked}/{checklist.totalItems} items
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-lg font-bold text-primary">{checklist.percentComplete}%</p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                    </div>
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
            </div>
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border/40">
                    <div className="mt-4 space-y-1">
                        {checklist.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30">
                                {item.checked ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : item.na ? (
                                    <span className="h-4 w-4 flex items-center justify-center text-xs text-muted-foreground">N/A</span>
                                ) : (
                                    <div className="h-4 w-4 rounded border border-border" />
                                )}
                                <span className={cn("text-sm flex-1", item.checked ? "text-muted-foreground" : "")}>
                                    {item.text}
                                </span>
                                {item.required && !item.checked && !item.na && (
                                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">Required</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                    {checklist.completedBy && (
                        <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                            <p className="text-sm text-green-600">
                                Completed by {checklist.completedBy} on {new Date(checklist.completedAt || '').toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

// Main Safety & Compliance Tab Component
export function SafetyComplianceTab({
    project,
    onAddMoistureTest,
    onAddSubfloorTest,
    onAddSiteCondition,
    onReportIncident,
    onCreateChecklist
}: SafetyComplianceTabProps) {
    const { can } = usePermissions();
    const [activeSection, setActiveSection] = useState('overview');

    // Calculate summary stats
    // Calculate summary stats
    const activeSiteConditions = (project.siteConditions || []).filter(c => c.status === 'active' || c.status === 'mitigated');
    const criticalConditions = activeSiteConditions.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high');
    const passedMoistureTests = (project.moistureTests || []).filter(t => t.passed).length;
    const passedSubfloorTests = (project.subfloorTests || []).filter(t => t.passed).length;
    const completedChecklists = (project.complianceChecklists || []).filter(c => c.status === 'completed').length;
    const openIncidents = (project.safetyIncidents || []).filter(i => i.status !== 'closed').length;

    return (
        <div className="space-y-6">
            {/* Overview Section */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className={cn(
                    "p-4 cursor-pointer transition-all border-2",
                    activeSection === 'moisture' ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/50"
                )} onClick={() => setActiveSection('moisture')}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Droplets className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <div>
                                <p className="text-2xl font-bold">{(project.moistureTests || []).length}</p>
                                <p className="text-xs text-muted-foreground">Moisture Tests</p>
                            </div>
                        </div>
                    </div>
                    {(project.moistureTests || []).length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">{passedMoistureTests} passed</span>
                        </div>
                    )}
                </Card>

                <Card className={cn(
                    "p-4 cursor-pointer transition-all border-2",
                    activeSection === 'subfloor' ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/50"
                )} onClick={() => setActiveSection('subfloor')}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Ruler className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <div>
                                <p className="text-2xl font-bold">{(project.subfloorTests || []).length}</p>
                                <p className="text-xs text-muted-foreground">Subfloor Tests</p>
                            </div>
                        </div>
                    </div>
                    {(project.subfloorTests || []).length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">{passedSubfloorTests} passed</span>
                        </div>
                    )}
                </Card>

                <Card className={cn(
                    "p-4 cursor-pointer transition-all border-2",
                    activeSection === 'conditions' ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/50"
                )} onClick={() => setActiveSection('conditions')}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            criticalConditions.length > 0 ? "bg-red-500/10" : "bg-green-500/10"
                        )}>
                            <AlertTriangle className={cn(
                                "h-5 w-5",
                                criticalConditions.length > 0 ? "text-red-500" : "text-green-500"
                            )} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeSiteConditions.length}</p>
                            <p className="text-xs text-muted-foreground">Site Conditions</p>
                        </div>
                    </div>
                    {criticalConditions.length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-500 font-medium">{criticalConditions.length} high risk</span>
                        </div>
                    )}
                </Card>

                <Card className={cn(
                    "p-4 cursor-pointer transition-all border-2",
                    activeSection === 'incidents' ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/50"
                )} onClick={() => setActiveSection('incidents')}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            openIncidents > 0 ? "bg-red-500/10" : "bg-green-500/10"
                        )}>
                            <Shield className={cn(
                                "h-5 w-5",
                                openIncidents > 0 ? "text-red-500" : "text-green-500"
                            )} />
                        </div>
                        <div>
                            <div>
                                <p className="text-2xl font-bold">{(project.safetyIncidents || []).length}</p>
                                <p className="text-xs text-muted-foreground">Safety Incidents</p>
                            </div>
                        </div>
                    </div>
                    {openIncidents > 0 ? (
                        <div className="mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span className="text-xs text-amber-500">{openIncidents} open</span>
                        </div>
                    ) : (
                        <div className="mt-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-500">No open incidents</span>
                        </div>
                    )}
                </Card>

                <Card className={cn(
                    "p-4 cursor-pointer transition-all border-2",
                    activeSection === 'checklists' ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/50"
                )} onClick={() => setActiveSection('checklists')}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <ClipboardCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <div>
                                <p className="text-2xl font-bold">{(project.complianceChecklists || []).length}</p>
                                <p className="text-xs text-muted-foreground">Checklists</p>
                            </div>
                        </div>
                    </div>
                    {(project.complianceChecklists || []).length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">{completedChecklists} completed</span>
                        </div>
                    )}
                </Card>
            </div>

            {/* Detail Sections */}
            {activeSection === 'moisture' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Droplets className="h-5 w-5 text-blue-500" />
                                Moisture Testing
                            </CardTitle>
                            <CardDescription>
                                ASTM F2170 (RH Probe) and F1869 (Calcium Chloride) compliant testing
                            </CardDescription>
                        </div>
                        {can('CREATE_MOISTURE_TEST') && (
                            <Button onClick={onAddMoistureTest} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Moisture Test
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {(project.moistureTests || []).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Droplets className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No moisture tests recorded yet</p>
                                <p className="text-sm">Add a moisture test to document concrete RH levels</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(project.moistureTests || []).map((test) => (
                                    <MoistureTestCard key={test.id} test={test} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeSection === 'subfloor' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-purple-500" />
                                Subfloor Flatness
                            </CardTitle>
                            <CardDescription>
                                ASTM F710 compliant flatness and levelness documentation
                            </CardDescription>
                        </div>
                        {can('CREATE_SUBFLOOR_TEST') && (
                            <Button onClick={onAddSubfloorTest} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Flatness Test
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {(project.subfloorTests || []).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Ruler className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No subfloor tests recorded yet</p>
                                <p className="text-sm">Add a flatness test to document lippage and levelness</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(project.subfloorTests || []).map((test) => (
                                    <SubfloorTestCard key={test.id} test={test} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeSection === 'conditions' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Site Conditions & Risk Controls
                            </CardTitle>
                            <CardDescription>
                                Document and mitigate site hazards before they become problems
                            </CardDescription>
                        </div>
                        {can('MANAGE_SITE_CONDITIONS') && (
                            <Button onClick={onAddSiteCondition} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Condition
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {(project.siteConditions || []).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No site conditions documented</p>
                                <p className="text-sm">Document site conditions and risks for this project</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(project.siteConditions || [])
                                    .sort((a, b) => {
                                        const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                                        const statusOrder = { active: 0, mitigated: 1, resolved: 2, accepted: 3 };
                                        if (statusOrder[a.status] !== statusOrder[b.status]) {
                                            return statusOrder[a.status] - statusOrder[b.status];
                                        }
                                        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
                                    })
                                    .map((condition) => (
                                        <SiteConditionCard key={condition.id} condition={condition} />
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeSection === 'incidents' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-red-500" />
                                Safety Incidents
                            </CardTitle>
                            <CardDescription>
                                OSHA-aligned incident reporting and corrective action tracking
                            </CardDescription>
                        </div>
                        {can('REPORT_SAFETY_INCIDENT') && (
                            <Button onClick={onReportIncident} variant="destructive" className="gap-2">
                                <Plus className="h-4 w-4" /> Report Incident
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {(project.safetyIncidents || []).length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Shield className="h-8 w-8 text-green-500" />
                                </div>
                                <p className="text-green-600 font-medium">No Safety Incidents</p>
                                <p className="text-sm text-muted-foreground">Great job maintaining a safe work environment!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(project.safetyIncidents || []).map((incident) => (
                                    <Card key={incident.id} className="border-red-500/20 bg-red-500/5">
                                        <div className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                    <Shield className="h-5 w-5 text-red-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium capitalize">{incident.incidentType.replace(/-/g, ' ')}</p>
                                                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                                                </div>
                                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                                    {incident.severity}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeSection === 'checklists' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5 text-emerald-500" />
                                Compliance Checklists
                            </CardTitle>
                            <CardDescription>
                                Daily safety, site setup, and specialized safety checklists
                            </CardDescription>
                        </div>
                        {can('MANAGE_COMPLIANCE_CHECKLISTS') && (
                            <Button onClick={onCreateChecklist} className="gap-2">
                                <Plus className="h-4 w-4" /> Create Checklist
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {(project.complianceChecklists || []).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No compliance checklists created</p>
                                <p className="text-sm">Create a daily safety checklist to track compliance</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(project.complianceChecklists || [])
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((checklist) => (
                                        <ComplianceChecklistCard key={checklist.id} checklist={checklist} />
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeSection === 'overview' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Safety Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(project.moistureTests || []).length > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Droplets className="h-5 w-5 text-blue-500" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Moisture Test - {project.moistureTests[0].passed ? 'Passed' : 'Failed'}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(project.moistureTests[0].testDate).toLocaleDateString()}</p>
                                        </div>
                                        <PassFailBadge passed={project.moistureTests[0].passed} />
                                    </div>
                                )}
                                {(project.subfloorTests || []).length > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Ruler className="h-5 w-5 text-purple-500" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Subfloor Test - {project.subfloorTests[0].passed ? 'Passed' : 'Remediation Required'}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(project.subfloorTests[0].testDate).toLocaleDateString()}</p>
                                        </div>
                                        <PassFailBadge passed={project.subfloorTests[0].passed} />
                                    </div>
                                )}
                                {(project.complianceChecklists || []).length > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <ClipboardCheck className="h-5 w-5 text-emerald-500" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{project.complianceChecklists[0].title}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(project.complianceChecklists[0].date).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline">{project.complianceChecklists[0].status}</Badge>
                                    </div>
                                )}
                                {(project.moistureTests || []).length === 0 && (project.subfloorTests || []).length === 0 && (project.complianceChecklists || []).length === 0 && (
                                    <div className="text-center py-4 text-muted-foreground">
                                        <p className="text-sm">No safety activity recorded yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {can('CREATE_MOISTURE_TEST') && (
                                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={onAddMoistureTest}>
                                        <Droplets className="h-6 w-6 text-blue-500" />
                                        <span>Add Moisture Test</span>
                                    </Button>
                                )}
                                {can('CREATE_SUBFLOOR_TEST') && (
                                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={onAddSubfloorTest}>
                                        <Ruler className="h-6 w-6 text-purple-500" />
                                        <span>Add Flatness Test</span>
                                    </Button>
                                )}
                                {can('MANAGE_SITE_CONDITIONS') && (
                                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={onAddSiteCondition}>
                                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                                        <span>Add Condition</span>
                                    </Button>
                                )}
                                {can('MANAGE_COMPLIANCE_CHECKLISTS') && (
                                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={onCreateChecklist}>
                                        <ClipboardCheck className="h-6 w-6 text-emerald-500" />
                                        <span>Daily Checklist</span>
                                    </Button>
                                )}
                            </div>
                            {can('REPORT_SAFETY_INCIDENT') && (
                                <Button
                                    variant="destructive"
                                    className="w-full mt-4 gap-2"
                                    onClick={onReportIncident}
                                >
                                    <Shield className="h-4 w-4" />
                                    Report Safety Incident
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default SafetyComplianceTab;
