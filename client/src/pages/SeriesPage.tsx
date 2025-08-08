"use client";

import { useState } from "react";
import { Link } from "wouter";
import { useSeries, type Series } from "@/hooks/useSeries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Loader2, Plus, Edit, Trash2, Search, Eye, BookText, BookCheck, ClipboardList
} from "lucide-react";

export default function SeriesPage() {
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { series, isLoading, updateSeries } = useSeries(searchTerm);

    const handleSearch = () => setSearchTerm(inputValue);
    const handleReset = () => {
        setInputValue('');
        setSearchTerm('');
    };

    const handleStatusToggle = (s: Series) => {
        updateSeries.mutate({
            id: s._id,
            data: { status: s.status === 'active' ? 'inactive' : 'active' }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">All Series</h1>
                <Link href="/series/new"><Button><Plus className="h-4 w-4 mr-2" /> Add New</Button></Link>
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
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">#Sno.</TableHead>
                                    <TableHead>Series Name</TableHead>
                                    <TableHead>Series Time</TableHead>
                                    <TableHead>Ques Count</TableHead>
                                    <TableHead>Attempt Limit</TableHead>
                                    <TableHead>View</TableHead>
                                    <TableHead>Assign Ques</TableHead>
                                    <TableHead>View Assign Ques</TableHead>
                                    <TableHead>Instruction</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={11} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                                ) : series?.length === 0 ? (
                                    <TableRow><TableCell colSpan={11} className="h-24 text-center">No series found.</TableCell></TableRow>
                                ) : (
                                    series?.map((s, index) => (
                                        <TableRow key={s._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{s.name}</TableCell>
                                            <TableCell>{s.durationMinutes} min</TableCell>
                                            <TableCell>{s.questionCount}</TableCell>
                                            <TableCell>{s.attemptLimit}</TableCell>
                                            <TableCell><Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button></TableCell>
                                            <TableCell><Button variant="outline" size="icon"><BookText className="h-4 w-4" /></Button></TableCell>
                                            <TableCell><Button variant="outline" size="icon"><BookCheck className="h-4 w-4" /></Button></TableCell>
                                            <TableCell><Button variant="outline" size="icon"><ClipboardList className="h-4 w-4" /></Button></TableCell>
                                            <TableCell><Switch checked={s.status === 'active'} onCheckedChange={() => handleStatusToggle(s)} /></TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/series/edit/${s._id}`}><Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button></Link>
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