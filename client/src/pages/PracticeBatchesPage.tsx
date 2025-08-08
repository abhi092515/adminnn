"use client";

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { usePracticeBatches, type PracticeBatch } from "@/hooks/usePracticeBatches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    Loader2, Plus, Edit, Trash2, Search, Copy, FileSpreadsheet, Printer, FileDown, ClipboardList
} from "lucide-react";

export default function PracticeBatchesPage() {
    const { batches, isLoading, updatePracticeBatch } = usePracticeBatches();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredBatches = useMemo(() => {
        if (!batches) return [];
        return batches.filter(batch =>
            batch.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [batches, searchTerm]);

    const handleStatusToggle = (batch: PracticeBatch) => {
        updatePracticeBatch.mutate({ 
            id: batch._id, 
            data: { status: batch.status === 'active' ? 'inactive' : 'active' } 
        });
    };

    const handleExport = (type: string) => {
        toast.info(`'${type}' export feature is not yet implemented.`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">All Batches</h1>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title..."
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
                            <Link href="/practice-batch/new"><Button><Plus className="h-4 w-4 mr-2" /> Add New</Button></Link>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">#S.No.</TableHead>
                                    <TableHead className="w-[100px]">Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Short Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                                ) : filteredBatches.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">No batches found.</TableCell></TableRow>
                                ) : (
                                    filteredBatches.map((batch, index) => (
                                        <TableRow key={batch._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <img src={batch.image || 'https://via.placeholder.com/64x48.png?text=No+Img'} alt={batch.title} className="w-16 h-12 object-cover rounded" />
                                            </TableCell>
                                            <TableCell className="font-medium">{batch.title}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{batch.shortDescription}</TableCell>
                                            <TableCell><Switch checked={batch.status === 'active'} onCheckedChange={() => handleStatusToggle(batch)} /></TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/practice-batch/assign/${batch._id}`}><Button variant="ghost" size="icon" title="Assignments"><ClipboardList className="h-4 w-4" /></Button></Link>
                                                <Link href={`/practice-batch/edit/${batch._id}`}><Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button></Link>
                                                <Button variant="ghost" size="icon" className="text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}