"use client";

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { usePackages, type Package } from "@/hooks/usePackages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    Loader2, Plus, Edit, Trash2, Search, Copy, FileSpreadsheet, Printer, FileDown,
    ChevronLeft, ChevronRight, BookKey
} from "lucide-react";

export default function PackagesListPage() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    
    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const { data, isLoading, isFetching, updatePackage } = usePackages(page, debouncedSearchTerm);
    
    const handleStatusToggle = (pkg: Package) => {
        updatePackage.mutate({ id: pkg._id, data: { status: pkg.status === 'active' ? 'inactive' : 'active' } });
    };

    const handleExport = (type: string) => {
        toast.info(`'${type}' export feature is not yet implemented.`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">All Packages</h1>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by package name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => handleExport('Copy')}><Copy className="h-4 w-4 mr-2" />Copy</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><FileSpreadsheet className="h-4 w-4 mr-2" />CSV</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><FileDown className="h-4 w-4 mr-2" />PDF</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('Print')}><Printer className="h-4 w-4 mr-2" />Print</Button>
                            <Link href="/packages/new"><Button><Plus className="h-4 w-4 mr-2" /> Add New</Button></Link>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Sr. No.</TableHead>
                                    <TableHead className="w-[100px]">Image</TableHead>
                                    <TableHead>Package Name</TableHead>
                                    <TableHead>Package Price</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                                ) : data?.packages.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="h-24 text-center">No packages found.</TableCell></TableRow>
                                ) : (
                                    data?.packages.map((pkg, index) => (
                                        <TableRow key={pkg._id}>
                                            <TableCell>{((data.currentPage - 1) * 10) + index + 1}</TableCell>
                                            <TableCell>
                                                <img src={pkg.image || 'https://via.placeholder.com/64x48.png?text=No+Img'} alt={pkg.name} className="w-16 h-12 object-cover rounded" />
                                            </TableCell>
                                            <TableCell className="font-medium">{pkg.name}</TableCell>
                                            <TableCell>₹{pkg.price}</TableCell>
                                            <TableCell>{pkg.priority}</TableCell>
                                            <TableCell><Switch checked={pkg.status === 'active'} onCheckedChange={() => handleStatusToggle(pkg)} /></TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/packages/assign-series/${pkg._id}`}><Button variant="ghost" size="icon" title="Assign Series"><BookKey className="h-4 w-4" /></Button></Link>
                                                <Link href={`/packages/edit/${pkg._id}`}><Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button></Link>
                                                <Button variant="ghost" size="icon" className="text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-muted-foreground">
                            Page {data?.currentPage} of {data?.totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={page === data?.totalPages || data?.packages.length === 0}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}