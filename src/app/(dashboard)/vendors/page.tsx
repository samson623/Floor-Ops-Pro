'use client';

import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Phone, Mail, User, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VendorsPage() {
    const { data } = useData();

    return (
        <>
            <TopBar
                title="Vendors"
                breadcrumb="Directory"
                showNewProject={false}
            >
                <Button onClick={() => toast.info('Add vendor coming soon')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
                </Button>
            </TopBar>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Search */}
                <div className="relative max-w-md">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search vendors..." className="pl-9" />
                </div>

                {/* Vendors Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.vendors.map(vendor => (
                        <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                                        <Store className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg truncate">{vendor.name}</h3>
                                        <p className="text-sm text-muted-foreground">{vendor.type}</p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span>{vendor.rep}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <a href={`tel:${vendor.phone}`} className="hover:text-primary transition-colors">
                                            {vendor.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => toast.success('Calling...')}
                                    >
                                        <Phone className="w-4 h-4 mr-1" />
                                        Call
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => toast.info('Email vendor...')}
                                    >
                                        <Mail className="w-4 h-4 mr-1" />
                                        Email
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {data.vendors.length === 0 && (
                    <div className="text-center py-12">
                        <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No vendors added yet.</p>
                        <Button className="mt-4" onClick={() => toast.info('Add vendor coming soon')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Vendor
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
