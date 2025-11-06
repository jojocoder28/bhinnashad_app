
"use client";

import { useState, useMemo } from 'react';
import type { MenuItem, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, FilePenLine, MoreVertical, Search } from 'lucide-react';
import MenuItemForm from './menu-item-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface MenuManagementProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  currentUserRole: UserRole;
}

export default function MenuManagement({ menuItems, onAddMenuItem, onUpdateMenuItem, onDeleteMenuItem, currentUserRole }: MenuManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleOpenForm = (item: MenuItem | null = null) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleSaveItem = (itemData: Omit<MenuItem, 'id'> | MenuItem) => {
    if ('id' in itemData) {
      onUpdateMenuItem(itemData);
    } else {
      onAddMenuItem(itemData);
    }
  };

  const handleAvailabilityChange = (item: MenuItem, checked: boolean) => {
    onUpdateMenuItem({ ...item, isAvailable: checked });
  }

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = !selectedCategory || selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchTerm]);

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

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-2xl font-headline font-semibold">Manage Menu</h3>
        {isAdmin && (
            <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
            </Button>
        )}
      </div>

       <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search for a dish..."
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
        </CardContent>
      </Card>


       {Object.keys(groupedMenu).length > 0 ? Object.entries(groupedMenu).map(([category, items]) => (
        <div key={category}>
            <h4 className="text-xl font-headline font-semibold mb-4">{category}</h4>
             <Separator className="mb-6"/>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                    <Card key={item.id} className="flex flex-col">
                        <CardHeader className="p-0 relative">
                             <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                                <Image 
                                    src={item.imageUrl || 'https://placehold.co/400x300.png'} 
                                    alt={item.name} 
                                    width={400} 
                                    height={300} 
                                    className="object-cover w-full h-full"
                                    data-ai-hint={`${item.category} ${item.name}`}
                                />
                            </div>
                             {isAdmin && (
                                <div className="absolute top-2 right-2">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                                            <MoreVertical />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenForm(item)}>
                                            <FilePenLine className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDeleteMenuItem(item.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                             )}
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                             <CardTitle className="text-lg font-headline">{item.name}</CardTitle>
                             <p className="font-mono text-primary font-semibold mt-1">₹{item.price.toFixed(2)}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <div className="flex items-center space-x-2 w-full">
                                <Switch 
                                    id={`availability-${item.id}`} 
                                    checked={item.isAvailable}
                                    onCheckedChange={(checked) => handleAvailabilityChange(item, checked)}
                                    disabled={!isAdmin && currentUserRole !== 'manager'}
                                />
                                <Label htmlFor={`availability-${item.id}`} className={item.isAvailable ? 'text-primary' : 'text-destructive'}>
                                    {item.isAvailable ? 'Available' : 'Not Available'}
                                </Label>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
       )) : (
        <Card className="col-span-full border-dashed py-20">
            <CardHeader className="text-center">
                <CardTitle>No Dishes Found</CardTitle>
                <CardDescription>Your search or filter returned no results. Try adjusting your criteria.</CardDescription>
            </CardHeader>
        </Card>
       )}

      {isFormOpen && (
        <MenuItemForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveItem}
          item={editingItem}
        />
      )}
    </div>
  );
}
