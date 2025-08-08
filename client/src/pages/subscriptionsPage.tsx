// "use client";

// import { useSubscriptions } from "@/hooks/useSubscriptions";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // ✅ CHANGED: Import Link from 'wouter' instead of 'next/link'
// import { Link } from "wouter";

// export default function SubscriptionsPage() {
//     const { subscriptions, isLoading, deleteSubscription } = useSubscriptions();

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center h-64">
//                 <Loader2 className="h-8 w-8 animate-spin" />
//             </div>
//         );
//     }

//     return (
//         <div className="p-4 md:p-6 space-y-6">
//             <div className="flex items-center justify-between">
//                 <h1 className="text-2xl font-bold">Manage Subscriptions</h1>
//                 {/* ✅ CHANGED: Using the wouter Link component */}
//                 <Link href="/subscriptions/new">
//                     <Button>
//                         <Plus className="h-4 w-4 mr-2" /> Add New
//                     </Button>
//                 </Link>
//             </div>
//             <Card>
//                 <CardHeader><CardTitle>All Subscriptions</CardTitle></CardHeader>
//                 <CardContent>
//                     <div className="border rounded-lg">
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead>Name</TableHead>
//                                     <TableHead>Amount</TableHead>
//                                     <TableHead>Duration</TableHead>
//                                     <TableHead>Status</TableHead>
//                                     <TableHead className="text-right">Actions</TableHead>
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {subscriptions?.map((sub: any) => (
//                                     <TableRow key={sub._id}>
//                                         <TableCell className="font-medium">{sub.name}</TableCell>
//                                         <TableCell>₹{sub.amount}</TableCell>
//                                         <TableCell>{sub.durationInDays} days</TableCell>
//                                         <TableCell>
//                                             <Badge variant={sub.status === 'active' ? 'default' : 'destructive'}>
//                                                 {sub.status}
//                                             </Badge>
//                                         </TableCell>
//                                         <TableCell className="text-right">
//                                             {/* ✅ CHANGED: Using the wouter Link component */}
//                                             <Link href={`/subscriptions/edit/${sub._id}`}>
//                                                 <Button variant="ghost" size="icon" asChild>
//                                                     <a><Edit className="h-4 w-4" /></a>
//                                                 </Button>
//                                             </Link>
//                                             <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteSubscription.mutate(sub._id)}>
//                                                 <Trash2 className="h-4 w-4" />
//                                             </Button>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
"use client";

import { useState, useMemo } from "react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Search, Copy, FileSpreadsheet, Printer, FileDown, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { toast } from "sonner";

// Define a type for our subscription data for better type safety
type Subscription = {
    _id: string;
    name: string;
    amount: number;
    durationInDays: number;
    priority: number;
    status: 'active' | 'inactive';
};

export default function SubscriptionsListPage() {
    const { subscriptions, isLoading, deleteSubscription } = useSubscriptions();
    const [searchTerm, setSearchTerm] = useState("");
    // ✅ State to manage sorting configuration
    const [sortConfig, setSortConfig] = useState<{ key: keyof Subscription; direction: 'asc' | 'desc' } | null>(null);

    // ✅ Memoized logic now includes both filtering and sorting
    const processedSubscriptions = useMemo(() => {
        if (!subscriptions) return [];
        
        let filtered: Subscription[] = subscriptions.filter((sub: Subscription) =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return filtered;
    }, [subscriptions, searchTerm, sortConfig]);

    // ✅ Function to handle sort requests from column headers
    const requestSort = (key: keyof Subscription) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof Subscription) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortConfig.direction === 'asc' ? '🔼' : '🔽';
    };

    const handleExport = (type: string) => {
        toast.info(`'${type}' export feature is not yet implemented.`);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-2xl font-bold">Manage Subscriptions</h1>
                <div className="flex items-center gap-2">
                    <Link href="/subscriptions/new"><Button><Plus className="h-4 w-4 mr-2" /> Add New</Button></Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleExport('Copy')}><Copy className="h-4 w-4 mr-2" />Copy</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><FileSpreadsheet className="h-4 w-4 mr-2" />CSV</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><FileDown className="h-4 w-4 mr-2" />PDF</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('Print')}><Printer className="h-4 w-4 mr-2" />Print</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Sr. No.</TableHead>
                                    {/* ✅ Clickable Headers for Sorting */}
                                    <TableHead><Button variant="ghost" onClick={() => requestSort('name')}>Name {getSortIndicator('name')}</Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => requestSort('amount')}>Amount {getSortIndicator('amount')}</Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => requestSort('durationInDays')}>Duration {getSortIndicator('durationInDays')}</Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => requestSort('priority')}>Priority {getSortIndicator('priority')}</Button></TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedSubscriptions.length > 0 ? (
                                    processedSubscriptions.map((sub: Subscription, index: number) => (
                                        <TableRow key={sub._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{sub.name}</TableCell>
                                            <TableCell>₹{sub.amount}</TableCell>
                                            <TableCell>{sub.durationInDays} days</TableCell>
                                            <TableCell>{sub.priority ?? 0}</TableCell>
                                            <TableCell><Badge variant={sub.status === 'active' ? 'default' : 'destructive'}>{sub.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/subscriptions/edit/${sub._id}`}><Button variant="ghost" size="icon" asChild><a><Edit className="h-4 w-4" /></a></Button></Link>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteSubscription.mutate(sub._id)}><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">No subscriptions found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}