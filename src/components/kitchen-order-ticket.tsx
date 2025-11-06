
"use client";

import type { Order, MenuItem, Waiter } from '@/lib/types';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';

interface KitchenOrderTicketProps {
    order: Order | null;
    menuItems: MenuItem[];
    waiters: Waiter[];
    onPrintComplete: () => void;
}

export default function KitchenOrderTicket({ order, menuItems, waiters, onPrintComplete }: KitchenOrderTicketProps) {
    const printFrameRef = useRef<HTMLIFrameElement>(null);
    const waiterName = order?.waiterId === 'manager' ? 'Manager' : waiters.find(w => w.id === order?.waiterId)?.name || 'N/A';
    
    const handlePrint = () => {
        if (!order || !printFrameRef.current) return;

        const printContent = `
            <html>
            <head>
                <title>KOT</title>
                <style>
                    @page { margin: 0; size: 58mm auto; }
                    body { 
                        font-family: 'monospace', sans-serif; 
                        margin: 0; 
                        padding: 0;
                        color: #000; 
                        background: #fff;
                        height: auto !important;
                        font-size: 10px;
                        line-height: 1.4;
                    }
                    .kot-container { padding: 0 1mm; width: 56mm;}
                    .header { text-align: center; }
                    .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
                    .details { font-size: 10px; display: flex; justify-content: space-between;}
                    .item-list { margin: 5px 0; padding-top: 5px; border-top: 1px dashed #000; }
                    .item { font-size: 12px; margin-bottom: 2px; }
                    .item-name { font-weight: bold; }
                    .dashed-line { border-top: 1px dashed #000; margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="kot-container">
                    <div class="header">
                        <h1>KOT</h1>
                    </div>
                    <div class="dashed-line"></div>
                    <div class="details">
                        <span>Order: <strong>${order.orderType === 'pickup' ? `Pickup` : `Table ${order.tableNumber}`}</strong></span>
                        <span>By: ${waiterName}</span>
                    </div>
                    <div class="details">
                        <span>KOT No: ${order.id.slice(-6)}</span>
                        <span>${format(new Date(order.timestamp), "dd/MM hh:mm")}</span>
                    </div>
                    <div class="item-list">
                        ${order.items.map(item => {
                            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                            return `<div class="item">
                                        <span>${item.quantity}x</span>
                                        <span class="item-name">${menuItem?.name || 'Unknown Item'}</span>
                                    </div>`
                        }).join('')}
                    </div>
                </div>
            </body>
            </html>
        `;

        const frame = printFrameRef.current;
        if (frame.contentWindow) {
            frame.contentWindow.document.open();
            frame.contentWindow.document.write(printContent);
            frame.contentWindow.document.close();
            frame.contentWindow.focus();
            frame.contentWindow.print();
        }
        
        // Callback to reset state after triggering print
        onPrintComplete();
    };
    
    useEffect(() => {
        if (order) {
           // A small delay to ensure the DOM is ready for printing.
           const timer = setTimeout(() => handlePrint(), 100);
           return () => clearTimeout(timer);
        }
    }, [order]);
    

    return (
        <iframe
            ref={printFrameRef}
            style={{ position: 'absolute', width: 0, height: 0, border: 'none', visibility: 'hidden' }}
            title="Print Frame"
        ></iframe>
    );
}
