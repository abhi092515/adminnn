"use client";

import { useState } from "react";
import { Link } from "wouter";
import { useInstructions, type Instruction } from "@/hooks/useInstructions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Copy, Search } from "lucide-react";

export default function InstructionsPage() {
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { instructions, isLoading, updateInstruction } = useInstructions(searchTerm);

    const handleSearch = () => {
        setSearchTerm(inputValue);
    };

    const handleReset = () => {
        setInputValue('');
        setSearchTerm('');
    };

    const handleStatusToggle = (instruction: Instruction) => {
        updateInstruction.mutate({
            id: instruction._id,
            data: { status: instruction.status === 'active' ? 'inactive' : 'active' }
        });
    };

    const handleCopyToClipboard = (text?: string) => {
      if (text) {
          navigator.clipboard.writeText(text);
          toast.success("Instruction copied to clipboard!");
      }
  };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">All Instruction</h1>
                <Link href="/instructions/new"><Button><Plus className="h-4 w-4 mr-2" /> Add New</Button></Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1">
                            <label htmlFor="series-search" className="text-sm font-medium">Series Name</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="series-search"
                                    placeholder="Search by series name..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-end gap-2 h-full">
                            <Button onClick={handleSearch}>Submit</Button>
                            <Button variant="outline" onClick={handleReset}>Reset</Button>
                        </div>
                    </div>
                </CardHeader>
                {/* ✅ FIX: Removed padding from CardContent */}
                <CardContent className="p-0">
                    {/* ✅ FIX: Removed the extra div wrapper around the Table */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Sr. No.</TableHead>
                                <TableHead>Series Name</TableHead>
                                <TableHead>Instruction</TableHead>
                                <TableHead className="w-[100px]">Copy</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : instructions?.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">No instructions found.</TableCell></TableRow>
                            ) : (
                                instructions?.map((inst, index) => (
                                    <TableRow key={inst._id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{inst.series?.name || 'General'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-md truncate">{inst.generalInstructionEnglish || 'N/A'}</TableCell>
                                        <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(inst.generalInstructionEnglish)}><Copy className="h-4 w-4" /></Button>
                                        </TableCell>
                                        <TableCell><Switch checked={inst.status === 'active'} onCheckedChange={() => handleStatusToggle(inst)} /></TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/instructions/edit/${inst._id}`}><Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button></Link>
                                            <Button variant="ghost" size="icon" className="text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}