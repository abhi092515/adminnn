"use client";

import { useSubTopics, type SubTopic } from "@/hooks/use-sub-topics";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function SubTopicsPage() {
  const { subTopics, isLoading, deleteSubTopic } = useSubTopics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Sub-Topics</h1>
        <Link href="/sub-topics/new"><Button><Plus className="h-4 w-4 mr-2" />Add New Sub-Topic</Button></Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Sub-Topic Name</TableHead><TableHead>Parent Topic</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>)
               : subTopics?.map((item, index) => (
                // ✅ FIX: Use `item._id` for the key, as sent by the API
                <TableRow key={item._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.subTopicName}</TableCell>
                  <TableCell>{item.topic?.topicName || 'N/A'}</TableCell>
                  <TableCell><Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {/* ✅ FIX: Use `item._id` for the edit link */}
                    <Link href={`/sub-topics/edit/${item._id}`}><Button variant="ghost" size="icon" asChild><a><Edit className="h-4 w-4" /></a></Button></Link>
                    {/* ✅ FIX: Use `item._id` for the delete action */}
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteSubTopic.mutate(item._id)}><Trash2 className="h-4 w-4" /></Button>
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