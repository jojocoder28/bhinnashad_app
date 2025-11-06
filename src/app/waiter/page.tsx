
"use client";

import { useState, useEffect, useRef } from 'react';
import type { Order, MenuItem, Waiter, Table, DecodedToken, OrderItem, Bill } from '@/lib/types';
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getMenuItems,
  getWaiters,
  getTables,
  getBills
} from '../actions';

import WaiterView from '@/components/waiter-view';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import { getSession } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/loading-spinner';
import OrderForm from '@/components/order-form';

const POLLING_INTERVAL = 5000; // 5 seconds

export default function WaiterPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Use a ref to track if the modal is open, to control polling
  const isModalOpenRef = useRef(false);
  useEffect(() => {
    isModalOpenRef.current = isOrderFormOpen;
  }, [isOrderFormOpen]);


  useEffect(() => {
    async function initialFetch() {
      try {
        setLoading(true);
        const session = await getSession();
         if (!session) {
            router.push('/login');
            return;
        }
        setUser(session);
        await fetchData();
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast({
          title: "Error",
          description: "Could not load data from the database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    initialFetch();

    const intervalId = setInterval(() => {
        // Only fetch data if the order form is NOT open
        if (!isModalOpenRef.current) {
            fetchData();
        }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);

  }, [toast, router]);

  async function fetchData() {
    try {
        const [ordersData, menuItemsData, waitersData, tablesData, billsData] = await Promise.all([
          getOrders(),
          getMenuItems(),
          getWaiters(),
          getTables(),
          getBills(),
        ]);

        setOrders(ordersData);
        setMenuItems(menuItemsData);
        setWaiters(waitersData);
        setTables(tablesData);
        setBills(billsData);
      } catch (error) {
         // Silently fail on subsequent fetches
         console.error("Silent fetch error:", error);
      }
  }


  const handleCreateOrder = async (orderData: Omit<Order, 'id' | 'timestamp' | 'status' | 'items'> & { items: Omit<OrderItem, 'price'>[] }, tableId: string) => {
    try {
      const newOrder = await createOrder(orderData, tableId);
      setOrders(prev => [newOrder, ...prev]);
      setTables(prev => prev.map(t => t.id === tableId ? {...t, status: 'occupied'} : t));
      toast({
        title: "Order Created",
        description: `New order for table ${newOrder.tableNumber} has been placed.`,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to create order.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateOrder = async (orderId: string, items: Omit<OrderItem, 'price'>[]) => {
     try {
      const updatedOrder = await updateOrder(orderId, items);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      toast({
        title: "Order Updated",
        description: `Order for table ${updatedOrder.tableNumber} has been updated.`,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to update order.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      const tablesData = await getTables();
      setTables(tablesData);
      toast({
        title: "Order Cancelled",
        description: `The order has been successfully cancelled.`,
        variant: "destructive"
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to cancel order.",
        variant: "destructive",
      });
    }
  };


  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      const [ordersData, tablesData] = await Promise.all([getOrders(), getTables()]);
      setOrders(ordersData);
      setTables(tablesData);
      toast({
        title: "Order Updated",
        description: `Order status has been changed to ${status}.`,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenOrderForm = (order: Order | null) => {
    setEditingOrder(order);
    setIsOrderFormOpen(true);
  };
  
  const handleCloseOrderForm = () => {
    setIsOrderFormOpen(false);
    setEditingOrder(null);
  };


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
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Waiter Dashboard</h1>
        <WaiterView
            orders={orders}
            bills={bills}
            menuItems={menuItems}
            waiters={waiters}
            tables={tables}
            onUpdateStatus={handleUpdateOrderStatus}
            onCreateOrder={handleCreateOrder}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            onOpenOrderForm={handleOpenOrderForm}
            currentUser={user}
            />

        <OrderForm
            isOpen={isOrderFormOpen}
            onClose={handleCloseOrderForm}
            menuItems={menuItems}
            waiterId={waiters.find(w => w.userId === user.id)?.id || ''}
            onCreateOrder={handleCreateOrder}
            onUpdateOrder={handleUpdateOrder}
            tables={tables}
            editingOrder={editingOrder}
        />
    </DashboardLayout>
  );
}

    