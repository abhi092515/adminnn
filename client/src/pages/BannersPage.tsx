"use client";

import React, { useState, useMemo } from 'react';
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Copy, FileText, ChevronDown, Loader2, ArrowUpDown, ImageIcon } from "lucide-react";
import { useBanners } from '@/hooks/use-banners';
import { type Banner } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function BannersPage() {
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Banner; direction: 'asc' | 'desc' }>({ key: 'priority', direction: 'asc' });
  const ITEMS_PER_PAGE = 5;

  const { banners, isLoading, error, updateStatus, deleteBanner } = useBanners();

  // Memoized calculations for filtering, sorting, and pagination
  const { paginatedBanners, totalPages } = useMemo(() => {
    if (!banners) return { paginatedBanners: [], totalPages: 0 };

    const filtered = banners.filter(banner =>
      (banner.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const sorted = [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
    const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    return { paginatedBanners: paginated, totalPages };
  }, [banners, searchTerm, currentPage, sortConfig]);
  
  // Handlers for navigation and actions
  const handleAddBanner = () => setLocation('/banners/new');
  const handleEditBanner = (id: string) => setLocation(`/banners/edit/${id}`);
  const handleSort = (key: keyof Banner) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  const handleStatusToggle = (banner: Banner) => {
    updateStatus.mutate({ bannerId: banner.id, isActive: !banner.isActive });
  };
  const confirmDelete = () => {
    if (deletingBanner) {
      deleteBanner.mutate(deletingBanner.id, {
        onSuccess: () => setDeletingBanner(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-32" /></div>
        <Card><CardHeader><Skeleton className="h-10 w-full" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (error) return <div className="text-center py-12 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Banners</h1>
        <Button onClick={handleAddBanner}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline">Export Options <ChevronDown className="h-4 w-4 ml-2" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Copy</DropdownMenuItem>
                <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Sr. No.</TableHead>
                  <TableHead>Website Banner</TableHead>
                  <TableHead>Mobile Banner</TableHead>
                  <TableHead className="w-[120px]">
                    <Button variant="ghost" onClick={() => handleSort('priority')} className="px-2">
                      Priority <ArrowUpDown className="h-4 w-4 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[150px]">Status</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBanners.length > 0 ? (
                  paginatedBanners.map((banner, index) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                      <TableCell>
                        <img src={banner.websiteBannerUrl} alt={banner.title} className="h-16 w-auto object-contain rounded-md bg-muted" onError={(e) => e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}/>
                      </TableCell>
                      <TableCell>
                        <img src={banner.mobileBannerUrl} alt={banner.title} className="h-16 w-auto object-contain rounded-md bg-muted" onError={(e) => e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}/>
                      </TableCell>
                      <TableCell>{banner.priority}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banner.isActive}
                            onCheckedChange={() => handleStatusToggle(banner)}
                            disabled={updateStatus.isPending && updateStatus.variables?.bannerId === banner.id}
                            aria-label="Toggle status"
                          />
                          <span className="text-sm text-muted-foreground">{banner.isActive ? 'Active' : 'Inactive'}</span>
                          {updateStatus.isPending && updateStatus.variables?.bannerId === banner.id && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditBanner(banner.id)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingBanner(banner)} className="text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <h3 className="text-lg font-semibold">No Banners Found</h3>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm ? `Your search for "${searchTerm}" did not match any banners.` : "You haven't added any banners yet."}
                        </p>
                        {!searchTerm && <Button onClick={handleAddBanner} size="sm"><Plus className="h-4 w-4 mr-2" />Add a Banner</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-end space-x-4">
         <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages}>Next</Button>
      </div>

       <AlertDialog open={!!deletingBanner} onOpenChange={() => setDeletingBanner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the "{deletingBanner?.title}" banner.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteBanner.isPending}>
              {deleteBanner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}