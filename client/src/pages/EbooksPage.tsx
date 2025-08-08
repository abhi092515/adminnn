import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Plus, Edit, Trash2, Loader2, MoreHorizontal, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useEbooks } from '@/hooks/use-ebooks';
import { type Ebook } from "@/types";

export default function EbooksPage() {
  const [deletingEbook, setDeletingEbook] = useState<Ebook | null>(null);
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    ebooks,
    isLoading,
    error,
    deleteEbook,
    toggleEbookStatus,
  } = useEbooks();

  const processedEbooks = useMemo(() => {
    if (!ebooks) return [];
    const filtered = ebooks.filter(ebook =>
      ebook.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = [...filtered];
    if (sortOrder === 'desc') {
      return sorted.reverse();
    }
    return sorted;
  }, [ebooks, searchTerm, sortOrder]);

  const handleAddEbook = () => setLocation('/ebooks/new');
  const handleEditEbook = (ebook: Ebook) => setLocation(`/ebooks/edit/${ebook.id}`);
  const handleDeleteEbook = (ebook: Ebook) => setDeletingEbook(ebook);
  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  const handleToggleStatus = (ebook: Ebook) => {
    const newStatus = ebook.status === 'active' ? 'inactive' : 'active';
    toggleEbookStatus.mutate({ ebookId: ebook.id, status: newStatus });
  };

  const confirmDelete = () => {
    if (deletingEbook) {
      deleteEbook.mutate(deletingEbook.id, {
        onSuccess: () => setDeletingEbook(null)
      });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage E-books</h1>
        <Button onClick={handleAddEbook}>
          <Plus className="h-4 w-4 mr-2" />
          Add New E-book
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All E-books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by e-book title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-1/3"
              />
            </div>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">S.No</TableHead>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedEbooks.length > 0 ? (
                  processedEbooks.map((ebook, index) => (
                    <TableRow key={ebook.id} className="hover:bg-muted/50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell><img src={ebook.image1 || 'https://via.placeholder.com/50x60'} alt={ebook.title} className="w-12 h-16 object-cover rounded-md border" /></TableCell>
                      <TableCell className="font-medium">{ebook.title}</TableCell>
                      <TableCell>₹{ebook.newPrice}</TableCell>
                      <TableCell>
                          <Badge onClick={() => handleToggleStatus(ebook)}
                            variant={toggleEbookStatus.isPending && toggleEbookStatus.variables?.ebookId === ebook.id ? "secondary" : (ebook.status === 'active' ? 'default' : 'destructive')}
                            className="cursor-pointer w-20 justify-center transition-all hover:opacity-80">
                              {toggleEbookStatus.isPending && toggleEbookStatus.variables?.ebookId === ebook.id 
                                ? <Loader2 className="h-4 w-4 animate-spin" /> 
                                : ebook.status
                              }
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditEbook(ebook)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteEbook(ebook)} className="text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">No E-books Found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingEbook} onOpenChange={() => setDeletingEbook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the e-book "{deletingEbook?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteEbook.isPending}>
              {deleteEbook.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}