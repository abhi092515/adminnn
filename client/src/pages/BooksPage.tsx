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
import { useBooks } from '@/hooks/use-books';
import { type Book } from "@/types";

export default function BooksPage() {
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    books,
    isLoading,
    error,
    deleteBook,
    toggleBookStatus,
  } = useBooks();

  const processedBooks = useMemo(() => {
    if (!books) return [];
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = [...filtered];
    if (sortOrder === 'desc') return sorted.reverse();
    return sorted;
  }, [books, searchTerm, sortOrder]);

  const handleAddBook = () => setLocation('/books/new');
  const handleEditBook = (book: Book) => setLocation(`/books/edit/${book.id}`);
  const handleDeleteBook = (book: Book) => setDeletingBook(book);
  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  const handleToggleStatus = (book: Book) => {
    const newStatus = book.status === 'active' ? 'inactive' : 'active';
    toggleBookStatus.mutate({ bookId: book.id, status: newStatus });
  };

  const confirmDelete = () => {
    if (deletingBook) {
      deleteBook.mutate(deletingBook.id, {
        onSuccess: () => setDeletingBook(null)
      });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Books</h1>
        <Button onClick={handleAddBook}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Book
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Books</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by book title..."
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
                  <TableHead className="w-[100px]">#Sr</TableHead>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedBooks.length > 0 ? (
                  processedBooks.map((book, index) => (
                    <TableRow key={book.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell><img src={book.image1} alt={book.title} className="w-12 h-16 object-cover rounded-md border" /></TableCell>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>₹{book.newPrice}</TableCell>
                      <TableCell>
                        <Badge
                          onClick={() => handleToggleStatus(book)}
                          variant={toggleBookStatus.isPending && toggleBookStatus.variables?.bookId === book.id ? "secondary" : (book.status === 'active' ? 'default' : 'destructive')}
                          className="cursor-pointer w-24 justify-center"
                        >
                          {toggleBookStatus.isPending && toggleBookStatus.variables?.bookId === book.id ? <Loader2 className="h-4 w-4 animate-spin" /> : book.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditBook(book)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteBook(book)} className="text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="h-48 text-center">No books found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={!!deletingBook} onOpenChange={() => setDeletingBook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>Permanently delete "{deletingBook?.title}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteBook.isPending}>
              {deleteBook.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}