'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface SubscriptionTier {
    id: string;
    name: string;
    price: number;
    features: string[];
    isActive: boolean;
}

export default function MonetizationPage() {
    const [tiers, setTiers] = useState<SubscriptionTier[]>([
        {
            id: '1',
            name: 'Free',
            price: 0,
            features: ['Sample chapters', 'Public profile'],
            isActive: true,
        },
        {
            id: '2',
            name: 'Bronze',
            price: 9.99,
            features: ['Full biography access', 'All chapters'],
            isActive: true,
        },
        {
            id: '3',
            name: 'Gold',
            price: 29.99,
            features: ['Full biography', 'Diary insights', 'Deeper analysis', 'Priority support'],
            isActive: true,
        },
    ]);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);

    const handleEdit = (tier: SubscriptionTier) => {
        setEditingTier(tier);
        setEditDialogOpen(true);
    };

    const handleSave = () => {
        // TODO: Save to backend
        setEditDialogOpen(false);
        setEditingTier(null);
    };

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Monetization</h1>
                            <p className="text-muted-foreground">
                                Manage your subscription tiers and pricing
                            </p>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Tier
                        </Button>
                    </div>

                    {/* Revenue Summary */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all tiers
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$0</div>
                                <p className="text-xs text-muted-foreground">
                                    Your share: $0 (40%)
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$0</div>
                                <p className="text-xs text-muted-foreground">
                                    Minimum: $50
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Subscription Tiers */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Subscription Tiers</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {tiers.map((tier) => (
                                <Card key={tier.id} className={tier.price === 0 ? 'border-gray-300' : 'border-blue-300'}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{tier.name}</CardTitle>
                                            {tier.isActive ? (
                                                <Badge variant="outline" className="text-green-600">Active</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-600">Inactive</Badge>
                                            )}
                                        </div>
                                        <CardDescription>
                                            <span className="text-3xl font-bold">${tier.price}</span>
                                            {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 mb-4">
                                            {tier.features.map((feature, index) => (
                                                <li key={index} className="text-sm flex items-start">
                                                    <span className="mr-2">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleEdit(tier)}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                            {tier.price > 0 && (
                                                <Button variant="outline" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Subscription Tier</DialogTitle>
                            <DialogDescription>
                                Update the pricing and features for this tier
                            </DialogDescription>
                        </DialogHeader>
                        {editingTier && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Tier Name</Label>
                                    <Input
                                        id="name"
                                        value={editingTier.name}
                                        onChange={(e) =>
                                            setEditingTier({ ...editingTier, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="price">Price (USD/month)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={editingTier.price}
                                        onChange={(e) =>
                                            setEditingTier({ ...editingTier, price: parseFloat(e.target.value) })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="features">Features (one per line)</Label>
                                    <Textarea
                                        id="features"
                                        rows={5}
                                        value={editingTier.features.join('\n')}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                features: e.target.value.split('\n').filter(Boolean),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </ProtectedRoute>
    );
}
