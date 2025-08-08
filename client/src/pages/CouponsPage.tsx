"use client";

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCoupons } from '@/hooks/useCoupons';
import { type Coupon } from "@/types";
import { Loader2 } from "lucide-react";

export default function CouponsPage() {
  const [_, setLocation] = useLocation();
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const { coupons, isLoading, deleteCoupon } = useCoupons();

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const handleAddCoupon = () => setLocation('/coupons/new');
  const handleEditCoupon = (id: string) => setLocation(`/coupons/edit/${id}`);
  
  const confirmDelete = () => {
    if (deletingCoupon) {
      deleteCoupon.mutate(deletingCoupon.id, { onSuccess: () => setDeletingCoupon(null) });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Coupons</h1>
        <Button onClick={handleAddCoupon}><Plus className="h-4 w-4 mr-2" /> Add New Coupon</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Coupons</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons && coupons.length > 0 ? (
                  coupons.map(coupon => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                      <TableCell className="capitalize">{coupon.type}</TableCell>
                      <TableCell>{coupon.type === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</TableCell>
                      <TableCell>{formatDate(coupon.expireDate)}</TableCell>
                      <TableCell><Badge variant={coupon.isActive ? "default" : "destructive"}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCoupon(coupon.id)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingCoupon(coupon)} className="text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">No coupons found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={!!deletingCoupon} onOpenChange={() => setDeletingCoupon(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the "{deletingCoupon?.code}" coupon.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteCoupon.isPending}>
              {deleteCoupon.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}