"use client";

import { useSeoUrls, type SeoUrl } from "@/hooks/useSeoUrls";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner"; // ✅ FIX: Added the missing import for toast

export default function SeoUrlsPage() {
    const { seoUrls, isLoading, deleteSeoUrl, updateSeoUrl } = useSeoUrls();

    const handleStatusToggle = (url: SeoUrl) => {
        updateSeoUrl.mutate(
            {
                id: url._id,
                data: { isActive: !url.isActive },
            },
            {
                onSuccess: () => toast.success("Status updated."),
                onError: (err: any) => toast.error(err.message),
            }
        );
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">All SEO URLs</h1>
                <Link href="/seo-urls/new">
                    <Button><Plus className="h-4 w-4 mr-2" />Add New URL</Button>
                </Link>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">#S.No.</TableHead>
                                <TableHead>Page URL</TableHead>
                                <TableHead>Page Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {seoUrls?.map((url, index) => (
                                <TableRow key={url._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-mono">{url.page_url}</TableCell>
                                    <TableCell>{url.page_title}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={url.isActive}
                                            onCheckedChange={() => handleStatusToggle(url)}
                                            aria-label="Toggle status"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/seo-urls/edit/${url._id}`}>
                                            <Button variant="ghost" size="icon" asChild><a><Edit className="h-4 w-4"/></a></Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteSeoUrl.mutate(url._id)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}