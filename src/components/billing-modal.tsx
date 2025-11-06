
"use client";

import type { Bill, Order, MenuItem, DecodedToken, RazorpayOrder } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, IndianRupee, Loader2, Printer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useState, useEffect } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Logo from './logo';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

declare const Razorpay: any;

// Fallback UPI ID if Razorpay is not configured. Loaded from environment variables.
const FALLBACK_UPI_ID = process.env.NEXT_PUBLIC_FALLBACK_UPI_ID || "dasjojo7-1@okicici";


interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: Bill | null;
    onPayBill: (billId: string) => void;
    orders: Order[];
    menuItems: MenuItem[];
    currentUser: DecodedToken;
}

export default function BillingModal({ isOpen, onClose, bill, onPayBill, orders, menuItems, currentUser }: BillingModalProps) {
    const [loading, setLoading] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    
    // Check if Razorpay is configured
    const isRazorpayConfigured = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Reset paid state when a new bill is opened
    useEffect(() => {
        if (bill) {
            setIsPaid(bill.status === 'paid');
        }
    }, [bill]);

    // Consolidate all items from the billed orders for display.
    const allItems = orders.flatMap(order => 
        order.items.map(item => {
            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
            return {
                ...item,
                name: menuItem?.name || 'Unknown Item'
            };
        })
    );
    
    // Group items by name and sum quantities
    const groupedItems = allItems.reduce((acc, item) => {
        const existing = acc.get(item.name);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            acc.set(item.name, { ...item });
        }
        return acc;
    }, new Map<string, typeof allItems[0]>());
    
    const finalItems = Array.from(groupedItems.values());

    const handleSuccessfulPayment = () => {
        if (!bill) return;
        onPayBill(bill.id);
        setIsPaid(true);
        setLoading(false);
    };

    const handleRazorpayPayment = async () => {
        if (!bill) return;
        setLoading(true);

        try {
            // 1. Create a Razorpay Order on the server
            const razorpayOrder = await createRazorpayOrder(bill.total, bill.id);
            if (!razorpayOrder) {
                throw new Error("Could not create Razorpay order.");
            }

            // 2. Configure and open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Bhinna Shad Restaurant",
                description: `Bill for ${bill.tableNumber ? `Table ${bill.tableNumber}` : `Pickup Order ${bill.id.slice(-4)}`}`,
                order_id: razorpayOrder.id,
                handler: async function (response: any) {
                    // 3. Verify the payment on the server
                    try {
                        await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        
                        toast({ title: "Payment Successful!", description: "The bill has been marked as paid." });
                        handleSuccessfulPayment();

                    } catch (verifyError) {
                         const errorMessage = verifyError instanceof Error ? verifyError.message : "Payment verification failed.";
                         toast({ title: "Verification Failed", description: errorMessage, variant: "destructive" });
                         setLoading(false);
                    }
                },
                prefill: {
                    name: "Customer",
                    email: "customer@example.com",
                    contact: "9999999999",
                },
                notes: {
                    billId: bill.id,
                    tableNumber: bill.tableNumber,
                },
                theme: {
                    color: "#59331d", // Matches the app's primary color (dark brown)
                },
            };

            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast({
                    title: "Payment Failed",
                    description: response.error.description || "The payment could not be completed.",
                    variant: "destructive"
                });
                setLoading(false);
            });
            rzp.open();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                title: "Payment Error",
                description: errorMessage,
                variant: "destructive"
            });
            setLoading(false);
        }
    }
    
    const handleManualPayment = () => {
        if (!bill) return;
        setLoading(true);
        handleSuccessfulPayment();
    }
    
    const handlePrint = () => {
        const printContent = document.getElementById('printable-bill');
        if (printContent) {
            const newWindow = window.open('', '', 'height=800,width=800');
            if (newWindow) {
                newWindow.document.write('<html><head><title>Print Bill</title>');
                const styles = `<style>
                    @page { margin: 0; size: 58mm auto; }
                    body { 
                        font-family: 'monospace', sans-serif; 
                        margin: 0; 
                        padding: 0;
                        color: #000; 
                        background: #fff; 
                        font-size: 8px;
                        -webkit-print-color-adjust: exact;
                    }
                    .printable-container { padding: 0 1mm; width: 56mm; }
                    .logo-container { text-align: center; margin-bottom: 5px; }
                    .logo-container img { max-width: 80px; height: auto; }
                    .address-details, .bill-details { text-align: center; font-size: 8px; line-height: 1.2; margin-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                    th, td { padding: 1px 0; vertical-align: top; word-wrap: break-word; text-align: left; }
                    .col-item { width: 40%; padding-right: 2px;}
                    .col-qty { width: 15%; text-align: center; }
                    .col-rate { width: 20%; text-align: right; }
                    .col-amount { width: 25%; text-align: right; padding-left: 2px;}
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                    .totals-section { margin-top: 5px; padding-top: 5px; border-top: 1px dashed #000; }
                    .totals-section div { display: flex; justify-content: space-between; }
                    .grand-total { font-size: 12px; font-weight: bold; }
                    .footer-text { text-align: center; font-size: 8px; margin-top: 10px; }
                    .dashed-line { border-top: 1px dashed #000; margin: 5px 0; }
                    .paid-stamp { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-12deg); z-index: 10; opacity: 0.5; }
                    .paid-stamp span { font-size: 2.5rem; font-weight: bold; color: #000; border: 4px solid #000; border-radius: 0.5rem; padding: 0.5rem 1rem; }
                </style>`;
                newWindow.document.write(styles);
                newWindow.document.write('</head><body>');
                newWindow.document.write(printContent.innerHTML);
                newWindow.document.write('</body></html>');
                newWindow.document.close();
                newWindow.onload = () => {
                    newWindow.print();
                    newWindow.close();
                };
            }
        }
    };
    
    const dialogTitle = bill 
      ? bill.tableNumber 
        ? `Bill for Table ${bill.tableNumber}` 
        : `Bill for Pickup Order`
      : 'Bill';

    if (!isOpen || !bill) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                 {/* This is the hidden, styled-for-print div */}
                <div id="printable-bill" className="hidden">
                    <div className="printable-container" style={{position: 'relative'}}>
                        {isPaid && (
                           <div className="paid-stamp">
                                <span>PAID</span>
                            </div>
                        )}
                        <div className="logo-container">
                            <img src="/logo_bhinnashad.png" alt="Bhinna Shad Logo" />
                        </div>
                        <div className="address-details">
                            <p style={{fontWeight: 'bold', fontSize: '10px' }}>Bhinna Shad Restaurant</p>
                            <p>117-NH, Sarisha Ashram More, Diamond Harbour</p>
                            <p>South 24 Parganas, PIN - 743368, WB, INDIA</p>
                        </div>
                        <div className="dashed-line" />
                        <div className="bill-details">
                            <p><strong>Bill No:</strong> {bill.id.slice(-6)}</p>
                            {bill.tableNumber && <p><strong>Table:</strong> {bill.tableNumber}</p>}
                            <p><strong>Date:</strong> {format(new Date(bill.timestamp), "dd/MM/yy hh:mm a")}</p>
                        </div>
                        <div className="dashed-line" />
                        <table>
                            <thead>
                                <tr>
                                    <th className="col-item">Item</th>
                                    <th className="col-qty">Qty</th>
                                    <th className="col-rate">Rate</th>
                                    <th className="col-amount">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finalItems.map((item, index) => (
                                    <tr key={`${item.menuItemId}-${index}`}>
                                        <td className="col-item">{item.name}</td>
                                        <td className="col-qty">{item.quantity}</td>
                                        <td className="col-rate">{(item.price).toFixed(2)}</td>
                                        <td className="col-amount">{(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="totals-section">
                            <div>
                                <span>Subtotal</span>
                                <span>{bill.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="grand-total">
                                <span>Grand Total</span>
                                <span>₹{bill.total.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <p className="footer-text">Thank you for visiting!</p>
                        <p className="footer-text" style={{marginTop: '2px'}}>Amounts are inclusive of all taxes.</p>
                    </div>
                </div>

                <div className="no-print">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">{dialogTitle}</DialogTitle>
                        <DialogDescription>
                            Review the bill and proceed to payment or print the receipt.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="relative">
                        {isPaid && (
                             <div className="absolute inset-0 flex items-center justify-center z-10">
                                <span className="text-5xl sm:text-8xl font-bold text-primary/10 border-4 border-primary/20 rounded-lg p-4 sm:p-8 transform -rotate-12">
                                    PAID
                                </span>
                            </div>
                        )}
                        <div className={cn("space-y-4 my-4", isPaid && "opacity-50")}>
                            <Separator />
                            <div className="text-sm space-y-2">
                                <h4 className="font-semibold mb-2">Order Summary:</h4>
                                {finalItems.map((item, index) => (
                                    <div key={`${item.menuItemId}-${index}`} className="flex justify-between items-start">
                                        <span className="break-all pr-2">{item.quantity}x {item.name}</span>
                                        <span className="font-mono text-right flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-mono">₹{bill.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base mt-1">
                                    <span>Total</span>
                                    <span className="font-mono">₹{bill.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {!isPaid && (
                        <>
                            {isRazorpayConfigured ? (
                                <div className="mt-6">
                                     <Button type="button" onClick={handleRazorpayPayment} disabled={loading} className="w-full">
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <IndianRupee className="mr-2 h-4 w-4"/>}
                                        {loading ? 'Processing...' : 'Pay with Razorpay'}
                                    </Button>
                                </div>
                            ) : (
                                 <Alert>
                                    <AlertTitle>Manual Payment</AlertTitle>
                                    <AlertDescription>
                                        Use the button below to confirm payment has been received via cash or other offline methods.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    )}

                    <DialogFooter className="mt-6 flex-col sm:flex-row sm:justify-between gap-2">
                        <Button type="button" variant="outline" onClick={handlePrint} disabled={loading}>
                            <Printer className="mr-2 h-4 w-4"/> {isPaid ? 'Print Paid Receipt' : 'Print Bill'}
                        </Button>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            {!isRazorpayConfigured && !isPaid && (
                                <Button type="button" onClick={handleManualPayment} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4"/>}
                                    {loading ? 'Confirming...' : 'Confirm Payment'}
                                </Button>
                            )}
                             <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Close</Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
