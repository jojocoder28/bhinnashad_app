
"use client";

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="py-6 px-4 md:px-8 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-20">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Logo />
                        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Bhinna Shad</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline">
                            <Link href="/menu">Back to Menu</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 relative z-10">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="font-headline text-4xl">Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <p className="text-lg text-muted-foreground">
                            We'd love to hear from you! Whether you have a question about our menu, want to make a reservation, or just want to say hello, here's how you can reach us.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-8 h-8 text-primary mt-1"/>
                                <div>
                                    <h3 className="text-xl font-semibold">Address</h3>
                                    <p className="text-muted-foreground">
                                        117-NH, Sarisha Ashram More<br/>
                                        Diamond Harbour, South 24 Parganas<br/>
                                        PIN - 743368, WB, INDIA
                                    </p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <Phone className="w-8 h-8 text-primary mt-1"/>
                                <div>
                                    <h3 className="text-xl font-semibold">Phone</h3>
                                    <p className="text-muted-foreground">
                                        +91 98765 43210
                                    </p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <Mail className="w-8 h-8 text-primary mt-1"/>
                                <div>
                                    <h3 className="text-xl font-semibold">Email</h3>
                                    <p className="text-muted-foreground">
                                        contact@bhinnashad.com
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
            
            <footer className="mt-16 py-8 bg-card/80 backdrop-blur-sm border-t relative z-10">
                <div className="container mx-auto text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Bhinna Shad Restaurant. All Rights Reserved.</p>
                     <div className="flex justify-center gap-4 mt-2 text-sm">
                        <Link href="/about" className="hover:text-primary underline">About Us</Link>
                        <Link href="/contact" className="hover:text-primary underline">Contact</Link>
                        <Link href="/login" className="hover:text-primary underline">Staff Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
