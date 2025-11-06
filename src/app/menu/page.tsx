

"use client";

import { useState, useMemo, useEffect } from 'react';
import type { MenuItem, DecodedToken } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import Logo from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Utensils, Soup, Fish, Beef, Vegan, Cookie, Search, PlusCircle, MinusCircle, UserCircle, LogOut } from 'lucide-react';
import { getMenuItems, getOnlineOrdersForUser, logout } from '../actions';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { getSession } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import ShoppingCart from '@/components/shopping-cart';

const AnimatedBackground = () => (
    <div className="area">
        <ul className="circles">
            <li><Utensils/></li>
            <li><Soup/></li>
            <li><Fish/></li>
            <li><Beef/></li>
            <li><Vegan/></li>
            <li><Cookie/></li>
            <li><Fish/></li>
            <li><Utensils/></li>
            <li><Soup/></li>
            <li><Cookie/></li>
        </ul>
    </div >
)

type CartItem = MenuItem & { quantity: number };

export default function MenuPage() {
    const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const { toast } = useToast();

    // Effect to load initial data and cart from localStorage
    useEffect(() => {
        async function loadData() {
            try {
                // Load cart from localStorage
                const savedCart = localStorage.getItem('shoppingCart');
                if (savedCart) {
                    setCart(JSON.parse(savedCart));
                }

                const [items, session] = await Promise.all([
                    getMenuItems(),
                    getSession()
                ]);
                setAllMenuItems(items);
                setUser(session);
            } catch (error) {
                console.error("Failed to load initial data", error);
                 toast({
                    title: "Error",
                    description: "Could not load menu data.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [toast]);
    
    // Effect to save cart to localStorage whenever it changes
    useEffect(() => {
        // Don't save the initial empty cart on first render
        if (cart.length > 0 || localStorage.getItem('shoppingCart')) {
          localStorage.setItem('shoppingCart', JSON.stringify(cart));
        }
    }, [cart]);


    const handleLogout = async () => {
        await logout();
        setUser(null);
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
    };

    const categories = useMemo(() => {
        const availableItems = allMenuItems.filter(item => item.isAvailable);
        return ['All', ...Array.from(new Set(availableItems.map(item => item.category)))];
    }, [allMenuItems]);

    const filteredMenuItems = useMemo(() => {
        return allMenuItems
            .filter(item => item.isAvailable)
            .filter(item => {
                const matchesCategory = !selectedCategory || selectedCategory === 'All' || item.category === selectedCategory;
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesCategory && matchesSearch;
            });
    }, [allMenuItems, selectedCategory, searchTerm]);

    const groupedMenu = useMemo(() => {
         return filteredMenuItems.reduce((acc, item) => {
            const { category } = item;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, MenuItem[]>);
    }, [filteredMenuItems]);
    
    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem => 
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
        toast({
            title: "Added to Cart",
            description: `${item.name} has been added to your cart.`,
        });
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== itemId);
            }
            return prevCart.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('shoppingCart');
    }

    if (loading) {
        return (
             <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <LoadingSpinner className="w-10 h-10" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
            <AnimatedBackground />
             <header className="py-6 px-4 md:px-8 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-20">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Logo />
                         <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Bhinna Shad</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" asChild>
                                    <Link href="/my-orders">
                                        <UserCircle /> My Orders
                                    </Link>
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleLogout}>
                                    <LogOut />
                                </Button>
                            </div>
                        ) : (
                             <Button asChild variant="outline">
                                <Link href="/login">Login / Sign Up</Link>
                            </Button>
                        )}
                        <ShoppingCart cart={cart} updateQuantity={updateQuantity} clearCart={clearCart} user={user}/>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="font-headline text-4xl md:text-5xl font-bold text-primary tracking-tight">Our Menu</h2>
                    <p className="text-muted-foreground mt-2 text-lg">A taste of tradition, crafted with passion.</p>
                </div>

                <Card className="mb-8 p-4 bg-card/90 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search for a dish..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                             {categories.map(category => (
                                <Button 
                                    key={category}
                                    variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                                    className="whitespace-nowrap"
                                >
                                    {category}
                                </Button>
                             ))}
                        </div>
                    </div>
                </Card>


                <div className="space-y-12">
                    {Object.entries(groupedMenu).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="text-3xl font-headline font-semibold mb-2">{category}</h3>
                            <Separator className="mb-8"/>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                                {items.map(item => {
                                    const cartItem = cart.find(ci => ci.id === item.id);
                                    return (
                                    <Card key={item.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/90 backdrop-blur-sm">
                                        <CardHeader className="p-0">
                                            <div className="aspect-[4/3] overflow-hidden">
                                                <Image 
                                                    src={item.imageUrl || 'https://placehold.co/400x300.png'} 
                                                    alt={item.name} 
                                                    width={400} 
                                                    height={300} 
                                                    className="object-cover w-full h-full"
                                                    data-ai-hint={`${item.category} ${item.name}`}
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3 md:p-4 flex-grow flex flex-col">
                                             <CardTitle className="text-base md:text-xl font-headline text-primary">{item.name}</CardTitle>
                                             <div className="flex-grow" />
                                             <p className="font-mono text-primary font-bold text-sm md:text-lg mt-2 md:mt-4">₹{item.price.toFixed(2)}</p>
                                        </CardContent>
                                        <CardFooter className="p-3 md:p-4">
                                            {cartItem ? (
                                                <div className="flex items-center justify-between w-full">
                                                     <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}>
                                                        <MinusCircle />
                                                     </Button>
                                                     <span className="font-bold text-lg">{cartItem.quantity}</span>
                                                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}>
                                                        <PlusCircle />
                                                     </Button>
                                                </div>
                                            ) : (
                                                <Button className="w-full" onClick={() => addToCart(item)}>
                                                    <PlusCircle className="mr-2"/> Add to Cart
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                )})}
                            </div>
                        </div>
                    ))}
                     {filteredMenuItems.length === 0 && (
                        <Card className="col-span-full border-dashed py-20 bg-card/90 backdrop-blur-sm">
                            <CardHeader className="text-center">
                                <CardTitle>No Dishes Found</CardTitle>
                                <CardDescription>Your search or filter returned no results. Try something else!</CardDescription>
                            </CardHeader>
                        </Card>
                     )}
                </div>
            </main>
             <footer className="mt-16 py-8 bg-card/80 backdrop-blur-sm border-t relative z-10">
                <div className="container mx-auto text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Bhinna Shad Restaurant. All Rights Reserved.</p>
                    <div className="flex justify-center gap-4 mt-2 text-sm">
                        <Link href="/about" className="hover:text-primary underline">About Us</Link>
                        <Link href="/contact" className="hover:text-primary underline">Contact</Link>
                        <Link href="/login" className="hover:text-primary underline md:hidden">Staff Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
