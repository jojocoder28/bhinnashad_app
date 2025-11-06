
"use client";

import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { MenuItem, Order, Table, OrderItem, OrderType } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Search, Package, Utensils } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Label } from './ui/label';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  waiterId: string;
  onCreateOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status' | 'items'> & { items: Omit<OrderItem, 'price'>[] }, tableId: string | null) => void;
  onUpdateOrder: (orderId: string, items: Omit<OrderItem, 'price'>[]) => void;
  tables: Table[];
  editingOrder: Order | null;
  isManager: boolean;
}

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Please select an item'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
});

const orderFormSchema = z.object({
  orderType: z.enum(['dine-in', 'pickup']),
  tableId: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Please add at least one item to the order'),
}).refine(data => data.orderType === 'pickup' || (data.orderType === 'dine-in' && !!data.tableId), {
    message: "Table number is required for dine-in orders.",
    path: ["tableId"],
});

export default function OrderForm({ isOpen, onClose, menuItems, waiterId, onCreateOrder, onUpdateOrder, tables, editingOrder, isManager }: OrderFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderType: 'dine-in',
      tableId: '',
      items: [{ menuItemId: '', quantity: 1 }],
    },
  });

  const categories = useMemo(() => {
    const availableItems = menuItems.filter(item => item.isAvailable);
    return ['All', ...Array.from(new Set(availableItems.map(item => item.category)))];
  }, [menuItems]);
  
  const availableMenuItems = useMemo(() => {
    return menuItems
        .filter(item => item.isAvailable)
        .filter(item => {
            const matchesCategory = !selectedCategory || selectedCategory === 'All' || item.category === selectedCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
  }, [menuItems, selectedCategory, searchTerm]);


  useEffect(() => {
    if (isOpen) {
        if (editingOrder) {
          const table = tables.find(t => t.tableNumber === editingOrder.tableNumber);
          form.reset({
            orderType: editingOrder.orderType,
            tableId: table?.id || '',
            items: editingOrder.items.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })),
          });
        } else {
           form.reset({
            orderType: 'dine-in',
            tableId: '',
            items: [{ menuItemId: '', quantity: 1 }]
          });
        }
        // Reset filters when opening
        setSearchTerm('');
        setSelectedCategory(null);
    }
  }, [isOpen, editingOrder, form, tables]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (values: z.infer<typeof orderFormSchema>) => {
    if (editingOrder && onUpdateOrder) {
        onUpdateOrder(editingOrder.id, values.items);
    } else {
        const selectedTable = values.tableId ? tables.find(t => t.id === values.tableId) : null;
        
        const orderData = {
          orderType: values.orderType as OrderType,
          tableNumber: selectedTable?.tableNumber,
          items: values.items,
          waiterId,
        }
        onCreateOrder(orderData, values.tableId || null);
    }
    
    handleClose();
  };
  
  const handleClose = () => {
    form.reset({
      tableId: '',
      items: [{ menuItemId: '', quantity: 1 }]
    });
    onClose();
  }
  
  const isEditing = !!editingOrder;
  const waiterTables = tables.filter(t => t.status === 'available' || t.waiterId === waiterId);
  const orderType = form.watch('orderType');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className='font-headline'>{isEditing ? 'Edit Order' : 'Create New Order'}</DialogTitle>
          <DialogDescription>{isEditing ? `Updating order for ${editingOrder.orderType === 'dine-in' ? `Table ${editingOrder.tableNumber}` : 'a pickup order'}.` : 'Fill in the details to place a new order.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             
             {isManager && !isEditing && (
                <FormField
                    control={form.control}
                    name="orderType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Order Type</FormLabel>
                            <FormControl>
                                <ToggleGroup 
                                    type="single" 
                                    className="w-full grid grid-cols-2" 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                >
                                    <ToggleGroupItem value="dine-in" aria-label="Dine-in">
                                        <Utensils className="mr-2"/> Dine-in
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="pickup" aria-label="Self-pickup">
                                        <Package className="mr-2"/> Self-Pickup
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </FormControl>
                        </FormItem>
                    )}
                />
             )}

            {orderType === 'dine-in' && (
                <FormField
                control={form.control}
                name="tableId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Table Number</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ''} disabled={isEditing}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an available table" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {waiterTables.map(table => (
                            <SelectItem key={table.id} value={table.id} disabled={!isEditing && table.status === 'occupied' && table.waiterId !== waiterId}>
                            Table {table.tableNumber} {table.status === 'occupied' && table.waiterId !== waiterId ? '(Occupied by another waiter)' : ''}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            
            <div className="space-y-4">
              <FormLabel>Order Items</FormLabel>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                 <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search for an item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                 <Select onValueChange={(value) => setSelectedCategory(value === 'All' ? null : value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
              <ScrollArea className="h-60 mt-2 pr-4">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`items.${index}.menuItemId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableMenuItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} - ₹{item.price.toFixed(2)}
                                </SelectItem>
                              ))}
                               {availableMenuItems.length === 0 && (
                                <div className="text-center p-4 text-sm text-muted-foreground">No items match your search.</div>
                               )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className='w-20'>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              </ScrollArea>
               {form.formState.errors.items && typeof form.formState.errors.items === 'object' && 'message' in form.formState.errors.items && (
                 <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>
               )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append({ menuItemId: '', quantity: 1 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button type="submit">{isEditing ? 'Update Order' : 'Place Order'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
