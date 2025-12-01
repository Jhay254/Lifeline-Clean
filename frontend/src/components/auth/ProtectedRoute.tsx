'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');

        if (!token) {
            // Store intended destination
            localStorage.setItem('redirectAfterLogin', pathname);
            router.push('/login');
        }
    }, [router, pathname]);

    // Check authentication on client side
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (!token) {
            return null; // Don't render anything while redirecting
        }
    }

    return <>{children}</>;
}
