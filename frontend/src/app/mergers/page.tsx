'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Users, DollarSign, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { MergerApprovalDialog } from '@/components/network/MergerApprovalDialog';

interface Merger {
    id: string;
    eventTitle: string;
    eventDate: string;
    participants: string[];
    approvalStatus: Record<string, string>;
    mergedContent: Record<string, any>;
    isPublished: boolean;
    price?: number;
    salesCount: number;
    createdAt: string;
}

export default function MergersPage() {
    const [pendingMergers, setPendingMergers] = useState<Merger[]>([]);
    const [myMergers, setMyMergers] = useState<Merger[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMerger, setSelectedMerger] = useState<Merger | null>(null);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

    useEffect(() => {
        loadMergers();
    }, []);

    const loadMergers = async () => {
        try {
            setLoading(true);
            const [pendingRes, myRes] = await Promise.all([
                api.get('/mergers/pending'),
                api.get('/mergers/my-mergers'),
            ]);
            setPendingMergers(pendingRes.data);
            setMyMergers(myRes.data);
        } catch (error) {
            console.error('Failed to load mergers:', error);
            toast.error('Failed to load mergers');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (merger: Merger) => {
        setSelectedMerger(merger);
        setApprovalDialogOpen(true);
    };

    const handleApprovalComplete = () => {
        setApprovalDialogOpen(false);
        setSelectedMerger(null);
        loadMergers();
        toast.success('Merger approved! Waiting for other participants.');
    };

    const totalRevenue = myMergers.reduce((sum, m) => sum + (m.price || 0) * m.salesCount, 0);

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Story Mergers</h1>
                        <p className="text-muted-foreground">
                            Collaborate on shared memories and create multi-perspective narratives
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingMergers.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting your approval
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Published Mergers</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{myMergers.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Your collaborative stories
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {myMergers.reduce((sum, m) => sum + m.salesCount, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all mergers
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Revenue Earned</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">
                                    From merger sales
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pending Approvals */}
                    {pendingMergers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Approvals</CardTitle>
                                <CardDescription>
                                    Review and approve merger proposals
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {pendingMergers.map((merger) => (
                                        <div key={merger.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{merger.eventTitle}</h3>
                                                        <Badge variant="outline">
                                                            {new Date(merger.eventDate).toLocaleDateString()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {merger.participants.length} participants
                                                    </p>
                                                    <Button onClick={() => handleApprove(merger)}>
                                                        Add Your Perspective
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Published Mergers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Published Mergers</CardTitle>
                            <CardDescription>
                                Collaborative stories you've contributed to
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Loading mergers...
                                </div>
                            ) : myMergers.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        No published mergers yet. When shared memories are detected, you can create collaborative stories.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myMergers.map((merger) => (
                                        <div key={merger.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{merger.eventTitle}</h3>
                                                        <Badge variant="outline">
                                                            {new Date(merger.eventDate).toLocaleDateString()}
                                                        </Badge>
                                                        <Badge variant="secondary">
                                                            {merger.participants.length} voices
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>{merger.salesCount} sales</span>
                                                        {merger.price && <span>${merger.price.toFixed(2)}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Approval Dialog */}
                {selectedMerger && (
                    <MergerApprovalDialog
                        merger={selectedMerger}
                        open={approvalDialogOpen}
                        onOpenChange={setApprovalDialogOpen}
                        onComplete={handleApprovalComplete}
                    />
                )}
            </AppLayout>
        </ProtectedRoute>
    );
}
