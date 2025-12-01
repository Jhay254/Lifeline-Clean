import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back! Here's an overview of your biography.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border bg-card p-6">
                            <div className="text-sm font-medium text-muted-foreground">Total Subscribers</div>
                            <div className="text-2xl font-bold">0</div>
                        </div>
                        <div className="rounded-lg border bg-card p-6">
                            <div className="text-sm font-medium text-muted-foreground">Monthly Revenue</div>
                            <div className="text-2xl font-bold">$0</div>
                        </div>
                        <div className="rounded-lg border bg-card p-6">
                            <div className="text-sm font-medium text-muted-foreground">Data Sources</div>
                            <div className="text-2xl font-bold">0</div>
                        </div>
                        <div className="rounded-lg border bg-card p-6">
                            <div className="text-sm font-medium text-muted-foreground">Chapters</div>
                            <div className="text-2xl font-bold">0</div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
