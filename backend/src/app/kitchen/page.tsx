
"use client";

import DashboardLayout from '@/components/dashboard-layout';
import { getSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { DecodedToken } from '@/lib/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function KitchenPage() {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session);
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  if (loading || !user) {
    return (
        <DashboardLayout user={user}>
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
        <div className="text-center py-10">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Page Removed</CardTitle>
                    <CardDescription>
                        The Kitchen role has been removed. All order preparation is now managed by the Manager.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/manager">Go to Manager Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </DashboardLayout>
  );
}

    