
"use client";

import { useState, useEffect } from 'react';
import type { DecodedToken, OnlineOrder, MenuItem } from '@/lib/types';
import { getOnlineOrdersForUser, getMenuItems } from '../actions';
import { getSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyOrdersPage() {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [orders, setOrders] = useState<OnlineOrder[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const session = await getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }
                if (session.role !== 'user') {
                    router.push('/unauthorized');
                    return;
                }
                setUser(session);
                
                const [userOrders, menuItemsData] = await Promise.all([
                    getOnlineOrdersForUser(session.id),
                    getMenuItems()
                ]);

                setOrders(userOrders);
                setMenuItems(menuItemsData);
            } catch (error) {
                console.error("Failed to load orders:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
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
            <h1 className="font-headline text-3xl md:text-4xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Here is a history of all your online orders.</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {orders.length > 0 ? (
                    orders.map(order => {
                        const orderItemsWithNames = order.items.map(item => {
                            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                            return { ...item, name: menuItem?.name || "Unknown Item" };
                        });

                        return (
                            <Card key={order.id}>
                                <CardHeader>
                                    <CardTitle>Order #{order.id.slice(-6)}</CardTitle>
                                    <CardDescription>{format(new Date(order.timestamp), 'PPP p')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Badge className="capitalize mb-4">{order.status.replace('_', ' ')}</Badge>
                                    <ul className="space-y-1 text-sm">
                                        {orderItemsWithNames.map(item => (
                                            <li key={item.menuItemId} className="flex justify-between">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span className="font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <div className="w-full">
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span className="font-mono">₹{order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })
                ) : (
                    <Card className="sm:col-span-1 md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>No Orders Found</CardTitle>
                            <CardDescription>You haven't placed any orders yet.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/menu">Start Ordering Now</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
