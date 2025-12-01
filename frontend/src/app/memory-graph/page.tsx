'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemoryGraphVisualization } from '@/components/network/MemoryGraphVisualization';
import { api } from '@/lib/api';
import { RefreshCw, Network, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface GraphData {
    nodes: Array<{ id: string; name: string; email: string }>;
    edges: Array<{ source: string; target: string; strength: number; relationshipType?: string; sharedEvents?: number }>;
    totalConnections: number;
}

export default function MemoryGraphPage() {
    const [graph, setGraph] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [detecting, setDetecting] = useState(false);

    useEffect(() => {
        loadGraph();
    }, []);

    const loadGraph = async () => {
        try {
            setLoading(true);
            const response = await api.get('/network/memory-graph');
            setGraph(response.data);
        } catch (error) {
            console.error('Failed to load memory graph:', error);
            toast.error('Failed to load memory graph');
        } finally {
            setLoading(false);
        }
    };

    const runDetection = async () => {
        try {
            setDetecting(true);
            toast.info('Running collision detection...');

            await api.post('/network/detect-collisions');

            toast.success('Collision detection complete!');
            await loadGraph();
        } catch (error) {
            console.error('Detection failed:', error);
            toast.error('Failed to detect collisions');
        } finally {
            setDetecting(false);
        }
    };

    const avgStrength = graph && graph.edges.length > 0
        ? Math.round(graph.edges.reduce((sum, e) => sum + e.strength, 0) / graph.edges.length)
        : 0;

    const totalSharedEvents = graph?.edges?.reduce((sum, e) => sum + (e.sharedEvents || 0), 0) || 0;

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Memory Graph</h1>
                            <p className="text-muted-foreground">
                                Your network of shared memories and connections
                            </p>
                        </div>
                        <Button onClick={runDetection} disabled={detecting}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${detecting ? 'animate-spin' : ''}`} />
                            {detecting ? 'Detecting...' : 'Detect Collisions'}
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Connections</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{graph?.totalConnections || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    People you've shared experiences with
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Shared Events</CardTitle>
                                <Network className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalSharedEvents}</div>
                                <p className="text-xs text-muted-foreground">
                                    Detected memory collisions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Strength</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{avgStrength}</div>
                                <p className="text-xs text-muted-foreground">
                                    Connection strength score (0-100)
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Graph Visualization */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Network Visualization</CardTitle>
                            <CardDescription>Interactive map of your memory connections</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-[600px] flex items-center justify-center">
                                    <div className="text-muted-foreground">Loading graph...</div>
                                </div>
                            ) : graph && graph.nodes.length > 0 ? (
                                <MemoryGraphVisualization graph={graph} />
                            ) : (
                                <div className="h-[600px] flex flex-col items-center justify-center">
                                    <Network className="h-16 w-16 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">
                                        No connections found. Click "Detect Collisions" to find shared memories.
                                    </p>
                                    <Button onClick={runDetection} disabled={detecting}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Detect Collisions
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
