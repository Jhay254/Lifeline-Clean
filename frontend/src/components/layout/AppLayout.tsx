import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <Sidebar className="hidden md:block" />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
