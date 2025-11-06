

"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, Trash2, PlusCircle, MinusCircle } from "lucide-react";
import type { MenuItem, DecodedToken } from "@/lib/types";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createOnlineOrder, createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CartItem = MenuItem & { quantity: number };

interface ShoppingCartProps {
    cart: CartItem[];
    updateQuantity: (itemId: string, newQuantity: number) => void;
    clearCart: () => void;
    user: DecodedToken | null;
}

declare const Razorpay: any;

export default function ShoppingCart({ cart, updateQuantity, clearCart, user }: ShoppingCartProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (!user) {
            toast({
                title: "Please Login",
                description: "You must be logged in to place an order.",
                variant: "destructive",
            });
            setIsOpen(false);
            router.push('/login');
            return;
        }

        setLoading(true);

        try {
            // 1. Create a pending online order in our database
            const pendingOrder = await createOnlineOrder(
                user.id,
                cart.map(item => ({ menuItemId: item.id, quantity: item.quantity, price: item.price })),
                subtotal
            );

            // 2. Create a Razorpay Order
            const razorpayOrder = await createRazorpayOrder(subtotal, pendingOrder.id);

            // 3. Configure and open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Bhinna Shad Restaurant",
                description: `Online Order #${pendingOrder.id.slice(-6)}`,
                order_id: razorpayOrder.id,
                handler: async function (response: any) {
                    try {
                        // 4. Verify payment on our server
                        const verificationResult = await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verificationResult.success) {
                            toast({ title: "Payment Successful!", description: "Your order has been confirmed." });
                            clearCart();
                            setIsOpen(false);
                            router.push('/my-orders');
                        } else {
                            throw new Error("Payment verification failed.");
                        }

                    } catch (verifyError) {
                        const errorMessage = verifyError instanceof Error ? verifyError.message : "Payment verification failed.";
                        toast({ title: "Verification Failed", description: errorMessage, variant: "destructive" });
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                notes: {
                    onlineOrderId: pendingOrder.id,
                    userId: user.id,
                },
                theme: {
                    color: "#59331d",
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
            const errorMessage = error instanceof Error ? error.message : "Could not initiate checkout.";
            toast({ title: "Checkout Error", description: errorMessage, variant: "destructive" });
            setLoading(false);
        }
    };


    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                    <ShoppingCartIcon />
                    {itemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{itemCount}</Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex h-full flex-col">
                <SheetHeader>
                    <SheetTitle>Your Shopping Cart</SheetTitle>
                    <SheetDescription>Review your items before checking out.</SheetDescription>
                </SheetHeader>
                {cart.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto">
                          <ScrollArea className="h-full">
                              <div className="flex flex-col gap-4 pr-4 my-4">
                                  {cart.map(item => (
                                      <div key={item.id} className="flex items-center gap-4">
                                          <div className="flex-grow">
                                              <p className="font-semibold">{item.name}</p>
                                              <p className="text-sm text-muted-foreground font-mono">₹{item.price.toFixed(2)}</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                  <MinusCircle />
                                              </Button>
                                              <span>{item.quantity}</span>
                                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                  <PlusCircle />
                                              </Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </ScrollArea>
                        </div>
                        <SheetFooter className="mt-auto flex flex-col gap-2 pt-4 border-t">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Subtotal</span>
                                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                            </div>
                            {user ? (
                                 <Button className="w-full" onClick={handleCheckout} disabled={loading}>
                                    {loading ? 'Processing...' : `Checkout (₹${subtotal.toFixed(2)})`}
                                </Button>
                            ) : (
                                <Button className="w-full" asChild>
                                    <Link href="/login">Login to Checkout</Link>
                                </Button>
                            )}

                            <Button variant="outline" className="w-full" onClick={clearCart}>
                                <Trash2 className="mr-2"/> Clear Cart
                            </Button>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <ShoppingCartIcon className="w-20 h-20 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mt-4">Your cart is empty</h3>
                        <p className="text-muted-foreground mt-2">Add some delicious food to get started!</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
