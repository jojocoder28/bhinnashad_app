
"use client";

import { useState, useEffect, useRef } from 'react';
import type { Order, MenuItem, DecodedToken, Waiter, Bill, Table, OrderItem, StockItem, StockUsageLog } from '@/lib/types';
import {
  getOrders,
  updateOrderStatus,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getWaiters,
  cancelOrder,
  getBills,
  createBillForTable,
  markBillAsPaid,
  getTables,
  getStockItems,
  getStockUsageLogs,
  recordStockUsage,
  createOrder,
  updateOrder,
} from '../actions';

import ManagerView from '@/components/manager-view';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import { getSession } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/loading-spinner';
import KitchenOrderTicket from '@/components/kitchen-order-ticket';
import OrderForm from '@/components/order-form';
import BillingModal from '@/components/billing-modal';

const POLLING_INTERVAL = 5000; // 5 seconds

export default function ManagerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockUsageLogs, setStockUsageLogs] = useState<StockUsageLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [orderToPrintKOT, setOrderToPrintKOT] = useState<Order | null>(null);
  const [billToPrint, setBillToPrint] = useState<Bill | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [notifiedOrderIds, setNotifiedOrderIds] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const router = useRouter();
  const isInitialFetchRef = useRef(true);


  // Use a ref to track if the modal is open, to control polling
  const isModalOpenRef = useRef(false);
  useEffect(() => {
    isModalOpenRef.current = isOrderFormOpen || !!billToPrint;
  }, [isOrderFormOpen, billToPrint]);

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
        // Only fetch data if a modal is NOT open
        if (!isModalOpenRef.current) {
            fetchData();
        }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [toast, router]);
  
  async function fetchData() {
    try {
        const [
            ordersData, menuItemsData, waitersData, billsData, tablesData, 
            stockItemsData, stockLogsData
        ] = await Promise.all([
          getOrders(),
          getMenuItems(),
          getWaiters(),
          getBills(),
          getTables(),
          getStockItems(),
          getStockUsageLogs(),
        ]);
        
        // On the very first fetch, populate the notified IDs with all existing pending orders
        if (isInitialFetchRef.current) {
            const initialPendingIds = new Set(ordersData.filter(o => o.status === 'pending').map(o => o.id));
            setNotifiedOrderIds(initialPendingIds);
            isInitialFetchRef.current = false;
        } else {
            // On subsequent fetches, find orders that are pending and haven't been notified yet
            const newPendingOrders = ordersData.filter(o => o.status === 'pending' && !notifiedOrderIds.has(o.id));

            if (newPendingOrders.length > 0) {
                const newNotifiedIds = new Set(notifiedOrderIds);
                newPendingOrders.forEach(order => {
                    const waiterName = waitersData.find(w => w.id === order.waiterId)?.name || 'a waiter';
                    toast({
                        title: "New Order for Approval",
                        description: `A new order from ${waiterName} for Table ${order.tableNumber} is waiting.`,
                    });
                    newNotifiedIds.add(order.id);
                });
                setNotifiedOrderIds(newNotifiedIds);
            }
        }

        setOrders(ordersData);
        setMenuItems(menuItemsData);
        setWaiters(waitersData);
        setBills(billsData);
        setTables(tablesData);
        setStockItems(stockItemsData);
        setStockUsageLogs(stockLogsData);
      } catch (error) {
        // Silently fail on subsequent fetches
        console.error("Silent fetch error:", error);
      }
  }


  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { updatedOrder, bill } = await updateOrderStatus(orderId, status);
      
      const ordersData = await getOrders();
      const billsData = await getBills();
      setOrders(ordersData);
      setBills(billsData);
      
      if (status === 'approved') {
        const approvedOrder = ordersData.find(o => o.id === orderId);
        if (approvedOrder) {
          setOrderToPrintKOT(approvedOrder);
        }
      }
      
      // If a bill was created and returned (for pickup orders), open the billing modal
      if (bill) {
        setBillToPrint(bill);
      }

      toast({
        title: "Order Updated",
        description: `Order status has been changed to ${updatedOrder.status}.`,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      await cancelOrder(orderId, reason);
      const ordersData = await getOrders();
      setOrders(ordersData);
      toast({
        title: "Order Cancelled",
        description: `The order has been cancelled.`,
        variant: "destructive"
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to cancel order.",
        variant: "destructive",
      });
    }
  }

  const handleAddMenuItem = async (itemData: Omit<MenuItem, 'id'>) => {
    try {
      const newItem = await addMenuItem(itemData);
      setMenuItems(prev => [...prev, newItem]);
      toast({
        title: "Menu Item Added",
        description: `${newItem.name} has been added to the menu.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add menu item.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMenuItem = async (updatedItem: MenuItem) => {
    try {
      await updateMenuItem(updatedItem);
      const updatedMenuItems = await getMenuItems();
      setMenuItems(updatedMenuItems);
       toast({
        title: "Menu Item Updated",
        description: `${updatedItem.name} has been updated.`,
      });
    } catch(error) {
        toast({
        title: "Error",
        description: "Failed to update menu item.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await deleteMenuItem(itemId);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
       toast({
        title: "Menu Item Deleted",
        description: `An item has been removed from the menu.`,
        variant: 'destructive'
      });
    } catch (error) {
        toast({
        title: "Error",
        description: "Failed to delete menu item.",
        variant: "destructive",
      });
    }
  };

  const handleCreateBill = async (tableNumber: number): Promise<Bill | void> => {
    try {
        const newBill = await createBillForTable(tableNumber);
        setBills(prev => [newBill, ...prev]);
        const updatedOrders = await getOrders();
        setOrders(updatedOrders);
        toast({
            title: "Bill Generated",
            description: `Bill for table ${tableNumber} has been created.`
        });
        return newBill;
    } catch (error) {
         toast({
            title: "Error Generating Bill",
            description: "Could not create bill. Ensure there are served orders.",
            variant: "destructive"
        });
    }
  }

  const handlePayBill = async (billId: string) => {
    try {
        await markBillAsPaid(billId);
        const [updatedBills, updatedTables, updatedStock] = await Promise.all([getBills(), getTables(), getStockItems()]);
        setBills(updatedBills);
        setTables(updatedTables);
        setStockItems(updatedStock);
        toast({
            title: "Payment Recorded",
            description: "Bill has been marked as paid and table is now available.",
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to mark bill as paid.",
            variant: "destructive"
        });
    }
  }
  
  const handleRecordStockUsage = async (data: Omit<StockUsageLog, 'id' | 'timestamp'>) => {
    try {
      await recordStockUsage(data);
      const [updatedStockItems, updatedLogs] = await Promise.all([
        getStockItems(),
        getStockUsageLogs()
      ]);
      setStockItems(updatedStockItems);
      setStockUsageLogs(updatedLogs);
      toast({
        title: "Stock Usage Recorded",
        description: "The stock levels have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not record stock usage.",
        variant: "destructive",
      });
    }
  };

  const handleCreateOrder = async (orderData: Omit<Order, 'id' | 'timestamp' | 'status' | 'items'> & { items: Omit<OrderItem, 'price'>[] }, tableId: string | null) => {
    try {
      const newOrder = await createOrder(orderData, tableId, true); // isManagerCreating = true
      setOrders(prev => [newOrder, ...prev]);
      if(tableId) {
        setTables(prev => prev.map(t => t.id === tableId ? {...t, status: 'occupied'} : t));
      }

      if (newOrder.status === 'approved') {
          setOrderToPrintKOT(newOrder);
      }
      toast({
        title: "Order Created & Approved",
        description: `New ${newOrder.orderType === 'pickup' ? 'pickup order' : `order for table ${newOrder.tableNumber}`} sent to kitchen.`,
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
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Manager Dashboard</h1>
         <ManagerView
            orders={orders}
            bills={bills}
            menuItems={menuItems}
            waiters={waiters}
            tables={tables}
            stockItems={stockItems}
            stockUsageLogs={stockUsageLogs}
            onUpdateStatus={handleUpdateOrderStatus}
            onCancelOrder={handleCancelOrder}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onCreateBill={handleCreateBill}
            onPayBill={handlePayBill}
            onRecordStockUsage={handleRecordStockUsage}
            onOpenOrderForm={handleOpenOrderForm}
            onPrintBill={setBillToPrint}
            currentUser={user}
          />
        <KitchenOrderTicket
            order={orderToPrintKOT}
            menuItems={menuItems}
            waiters={waiters}
            onPrintComplete={() => setOrderToPrintKOT(null)}
        />
        <OrderForm
            isOpen={isOrderFormOpen}
            onClose={handleCloseOrderForm}
            menuItems={menuItems}
            waiterId={"manager"} // Use a special ID for manager-created orders
            onCreateOrder={handleCreateOrder}
            onUpdateOrder={handleUpdateOrder}
            tables={tables}
            editingOrder={editingOrder}
            isManager={true}
        />
         <BillingModal
            isOpen={!!billToPrint}
            onClose={() => setBillToPrint(null)}
            bill={billToPrint}
            onPayBill={handlePayBill}
            orders={orders.filter(o => billToPrint?.orderIds.includes(o.id))}
            menuItems={menuItems}
            currentUser={user}
        />
    </DashboardLayout>
  );
}

    