
"use client";

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AboutPage() {
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
                        <CardTitle className="font-headline text-4xl">About Bhinna Shad</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                        <p>
                            Welcome to Bhinna Shad, where culinary tradition meets modern dining. Our name, meaning "Different Tastes," reflects our philosophy of offering a diverse and authentic gastronomic experience that caters to every palate.
                        </p>
                        <p>
                            Nestled in the heart of the city, Bhinna Shad was founded with a simple mission: to serve delicious, high-quality food in a warm and inviting atmosphere. We believe in the power of food to bring people together, and every dish we create is a testament to our passion for flavor and our commitment to excellence.
                        </p>
                        <p>
                            Our chefs draw inspiration from age-old family recipes, giving them a contemporary twist to create dishes that are both familiar and exciting. We source our ingredients from local farmers and trusted suppliers to ensure that every meal is fresh, wholesome, and bursting with flavor.
                        </p>
                         <p>
                            Thank you for choosing Bhinna Shad. We look forward to serving you and making your dining experience a memorable one.
                        </p>
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
