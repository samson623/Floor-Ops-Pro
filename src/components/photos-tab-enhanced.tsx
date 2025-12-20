'use client';

import { useState, useMemo } from 'react';
import {
    Project,
    PhasePhoto,
    PhaseType
} from '@/lib/data';
import { usePermissions, PermissionGate } from '@/components/permission-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Camera,
    Image as ImageIcon,
    Calendar,
    MapPin,
    User,
    Tag,
    Plus,
    Grid,
    LayoutList,
    Filter,
    Clock,
    ArrowLeftRight,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    Download,
    Link2,
    Loader2
} from 'lucide-react';
import { useCameraCapture } from '@/hooks/useCameraCapture';

interface PhotosTabEnhancedProps {
    project: Project;
    onUpdate?: (updates: Partial<Project>) => void;
}

const PHASE_CONFIG: Record<PhaseType | 'pre-construction' | 'issue', { label: string; color: string; bgColor: string }> = {
    'pre-construction': { label: 'Pre-Construction', color: 'text-slate-600', bgColor: 'bg-slate-500/10' },
    demo: { label: 'Demo', color: 'text-red-600', bgColor: 'bg-red-500/10' },
    prep: { label: 'Prep', color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
    acclimation: { label: 'Acclimation', color: 'text-yellow-600', bgColor: 'bg-yellow-500/10' },
    install: { label: 'Install', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
    cure: { label: 'Cure', color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
    punch: { label: 'Punch', color: 'text-pink-600', bgColor: 'bg-pink-500/10' },
    closeout: { label: 'Closeout', color: 'text-green-600', bgColor: 'bg-green-500/10' },
    issue: { label: 'Issue', color: 'text-red-600', bgColor: 'bg-red-500/10' }
};

export function PhotosTabEnhanced({ project, onUpdate }: PhotosTabEnhancedProps) {
    const { can } = usePermissions();
    const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'comparison'>('grid');
    const [filterPhase, setFilterPhase] = useState<string>('all');
    const [filterTag, setFilterTag] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<PhasePhoto | null>(null);
    const [comparisonPhotos, setComparisonPhotos] = useState<{ before: PhasePhoto | null; after: PhasePhoto | null }>({ before: null, after: null });

    // Enterprise camera capture with permissions
    const {
        photos: capturedPhotos,
        isCapturing,
        hasPermission: canUploadPhotos,
        capturePhoto,
        removePhoto: removeCameraPhoto
    } = useCameraCapture({ maxPhotos: 20, captureLocation: true });

    const phasePhotos = project.phasePhotos || [];
    const legacyPhotos = project.photos || [];

    // Get all unique phases
    const phases = useMemo(() => {
        const uniquePhases = new Set(phasePhotos.map(p => p.phase));
        return Array.from(uniquePhases);
    }, [phasePhotos]);

    // Get all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        phasePhotos.forEach(p => p.tags?.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [phasePhotos]);

    // Filter photos
    const filteredPhotos = useMemo(() => {
        return phasePhotos.filter(photo => {
            if (filterPhase !== 'all' && photo.phase !== filterPhase) return false;
            if (filterTag && !photo.tags?.includes(filterTag)) return false;
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const matchesCaption = photo.caption?.toLowerCase().includes(search);
                const matchesLocation = photo.location?.toLowerCase().includes(search);
                const matchesTags = photo.tags?.some(t => t.toLowerCase().includes(search));
                if (!matchesCaption && !matchesLocation && !matchesTags) return false;
            }
            return true;
        });
    }, [phasePhotos, filterPhase, filterTag, searchTerm]);

    // Group photos by phase for timeline view
    const photosByPhase = useMemo(() => {
        const grouped: Record<string, PhasePhoto[]> = {};
        filteredPhotos.forEach(photo => {
            if (!grouped[photo.phase]) grouped[photo.phase] = [];
            grouped[photo.phase].push(photo);
        });
        // Sort each group by timestamp
        Object.keys(grouped).forEach(phase => {
            grouped[phase].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        });
        return grouped;
    }, [filteredPhotos]);

    // Find before/after pairs
    const beforeAfterPairs = useMemo(() => {
        const pairs: { before: PhasePhoto; after: PhasePhoto }[] = [];
        const beforePhotos = phasePhotos.filter(p => p.isBeforePhoto);
        const afterPhotos = phasePhotos.filter(p => p.linkedPhotoId);

        beforePhotos.forEach(before => {
            const after = afterPhotos.find(a => a.linkedPhotoId === before.id);
            if (after) {
                pairs.push({ before, after });
            }
        });

        return pairs;
    }, [phasePhotos]);

    // Metrics
    const metrics = useMemo(() => ({
        total: phasePhotos.length,
        byPhase: phases.reduce((acc, phase) => {
            acc[phase] = phasePhotos.filter(p => p.phase === phase).length;
            return acc;
        }, {} as Record<string, number>),
        issues: phasePhotos.filter(p => p.punchItemId).length,
        beforeAfter: beforeAfterPairs.length
    }), [phasePhotos, phases, beforeAfterPairs]);

    // Toggle comparison photo selection
    const toggleComparisonSelect = (photo: PhasePhoto) => {
        if (photo.isBeforePhoto) {
            setComparisonPhotos(prev => ({ ...prev, before: prev.before?.id === photo.id ? null : photo }));
        } else {
            setComparisonPhotos(prev => ({ ...prev, after: prev.after?.id === photo.id ? null : photo }));
        }
    };

    // Render photo card
    const renderPhotoCard = (photo: PhasePhoto, showSelection: boolean = false) => {
        const phaseConfig = PHASE_CONFIG[photo.phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.install;
        const isSelected = comparisonPhotos.before?.id === photo.id || comparisonPhotos.after?.id === photo.id;

        return (
            <Card
                key={photo.id}
                className={`overflow-hidden group cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                onClick={() => showSelection ? toggleComparisonSelect(photo) : setSelectedPhoto(photo)}
            >
                {/* Photo placeholder - in production, use actual image */}
                <div className="relative aspect-[4/3] bg-muted flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />

                    {/* Overlay badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className={`${phaseConfig.bgColor} ${phaseConfig.color} border-0 text-xs`}>
                            {phaseConfig.label}
                        </Badge>
                        {photo.isBeforePhoto && (
                            <Badge variant="secondary" className="text-xs">Before</Badge>
                        )}
                        {photo.punchItemId && (
                            <Badge variant="destructive" className="text-xs">Issue</Badge>
                        )}
                    </div>

                    {/* Selection indicator */}
                    {showSelection && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'bg-white/80 border-muted-foreground/30'
                            }`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <CardContent className="p-3">
                    {photo.caption && (
                        <p className="text-sm font-medium line-clamp-2 mb-2">{photo.caption}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(photo.timestamp).toLocaleDateString()}
                        </span>
                        {photo.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {photo.location}
                            </span>
                        )}
                    </div>
                    {photo.tags && photo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {photo.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                    {tag}
                                </Badge>
                            ))}
                            {photo.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    +{photo.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    // Empty state
    if (phasePhotos.length === 0 && legacyPhotos.length === 0) {
        return (
            <div className="space-y-6">
                <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Camera className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Photos Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Document project progress with phase-organized photos. Track before/after comparisons and link photos to punch items.
                        </p>
                        <PermissionGate permission="VIEW_PHASE_PHOTOS">
                            <Button onClick={capturePhoto} disabled={isCapturing}>
                                {isCapturing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                                Take Photo
                            </Button>
                        </PermissionGate>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Camera className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Photos</p>
                                <p className="text-2xl font-bold">{metrics.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <ArrowLeftRight className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Before/After</p>
                                <p className="text-2xl font-bold">{metrics.beforeAfter}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Tag className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tagged</p>
                                <p className="text-2xl font-bold">{phasePhotos.filter(p => p.tags?.length).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <Link2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Issue Photos</p>
                                <p className="text-2xl font-bold">{metrics.issues}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search photos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Phase Filter */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={filterPhase === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterPhase('all')}
                    >
                        All
                    </Button>
                    {phases.slice(0, 4).map(phase => {
                        const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.install;
                        return (
                            <Button
                                key={phase}
                                variant={filterPhase === phase ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterPhase(phase)}
                                className={filterPhase !== phase ? config.color : ''}
                            >
                                {config.label}
                            </Button>
                        );
                    })}
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('timeline')}
                    >
                        <LayoutList className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('comparison')}
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                </div>

                <PermissionGate permission="TAG_PHASE_PHOTOS">
                    <Button size="sm" onClick={capturePhoto} disabled={isCapturing}>
                        {isCapturing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                        Take Photo
                    </Button>
                </PermissionGate>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPhotos.map(photo => renderPhotoCard(photo))}
                </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="space-y-8">
                    {Object.entries(photosByPhase).map(([phase, photos]) => {
                        const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.install;
                        return (
                            <div key={phase}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge className={`${config.bgColor} ${config.color} border-0`}>
                                        {config.label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {photos.length} photo{photos.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {photos.map(photo => renderPhotoCard(photo))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Comparison View */}
            {viewMode === 'comparison' && (
                <div className="space-y-6">
                    {/* Existing Before/After Pairs */}
                    {beforeAfterPairs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Before & After Comparisons</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    {beforeAfterPairs.map((pair, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">Before</p>
                                                {renderPhotoCard(pair.before)}
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">After</p>
                                                {renderPhotoCard(pair.after)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Manual Comparison Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Create Comparison</CardTitle>
                            <CardDescription>Select a before and after photo to compare</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm font-medium mb-2">Before Photo</p>
                                    {comparisonPhotos.before ? (
                                        <div className="relative">
                                            {renderPhotoCard(comparisonPhotos.before)}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-2 right-2"
                                                onClick={() => setComparisonPhotos(prev => ({ ...prev, before: null }))}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="aspect-[4/3] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                                            Select a "Before" photo below
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-2">After Photo</p>
                                    {comparisonPhotos.after ? (
                                        <div className="relative">
                                            {renderPhotoCard(comparisonPhotos.after)}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-2 right-2"
                                                onClick={() => setComparisonPhotos(prev => ({ ...prev, after: null }))}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="aspect-[4/3] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                                            Select an "After" photo below
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Photo selection grid */}
                            <div className="grid grid-cols-4 gap-3">
                                {phasePhotos.map(photo => renderPhotoCard(photo, true))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Legacy Photos (from original project.photos) */}
            {legacyPhotos.length > 0 && phasePhotos.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Project Photos</CardTitle>
                        <CardDescription>Photos from quick capture</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {legacyPhotos.map((photo, index) => (
                                <Card key={index} className="overflow-hidden">
                                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                    </div>
                                    <CardContent className="p-3">
                                        <p className="text-sm text-muted-foreground">{photo}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Photo Detail Modal would go here */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div
                        className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="aspect-video bg-muted flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    {selectedPhoto.caption && (
                                        <h3 className="text-lg font-semibold mb-2">{selectedPhoto.caption}</h3>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(selectedPhoto.timestamp).toLocaleString()}
                                        </span>
                                        {selectedPhoto.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {selectedPhoto.location}
                                            </span>
                                        )}
                                        {selectedPhoto.takenBy && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {selectedPhoto.takenBy}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSelectedPhoto(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedPhoto.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
