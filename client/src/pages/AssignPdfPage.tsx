// // "use client";

// // import { useState, useMemo } from 'react';
// // import { useRoute } from 'wouter';
// // import { usePdfs, type Pdf, type PdfFilterOptions } from '@/hooks/use-pdfs';
// // import { useCourses } from '@/hooks/use-courses';
// // import { useToast } from "@/hooks/use-toast";

// // // Import UI components
// // import { Input } from '@/components/ui/input';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // import { Badge } from '@/components/ui/badge';
// // import { Search, Loader2, Link as LinkIcon, AlertCircle, Trash2, FileText } from 'lucide-react';
// // import { Skeleton } from '@/components/ui/skeleton';
// // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// // export default function AssignPdfPage() {
// //     const [, params] = useRoute("/courses/assign-pdf/:courseId");
// //     const courseId = params?.courseId || '';
// //     const { toast } = useToast();

// //     // State for managing filters and search
// //     const [filters, setFilters] = useState<PdfFilterOptions>({});
// //     const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
// //     const [searchTerm, setSearchTerm] = useState("");
    
// //     // Hooks for fetching data and performing mutations
// //     const { getPdfs, assignPdf, unassignPdf } = usePdfs();
// //     const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

// //     const courseQuery = useCourseById(courseId);
// //     const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
// //     const pdfsQuery = getPdfs(filters);

// //     // Memoized lists for assigned and available PDFs
// //     const assignedPdfs = useMemo(() => courseQuery.data?.assignedPdfs || [], [courseQuery.data]);
// //     const assignedPdfIds = useMemo(() => new Set(assignedPdfs.map(p => p._id)), [assignedPdfs]);
    
// //     const availablePdfs = useMemo(() => {
// //         const allFetchedPdfs = pdfsQuery.data || [];
// //         return allFetchedPdfs.filter(p => !assignedPdfIds.has(p._id));
// //     }, [pdfsQuery.data, assignedPdfIds]);

// //     const searchedAvailablePdfs = useMemo(() => {
// //         if (!searchTerm) return availablePdfs;
// //         const lowerCaseSearchTerm = searchTerm.toLowerCase();
// //         return availablePdfs.filter(p =>
// //             (p.title || '').toLowerCase().includes(lowerCaseSearchTerm) ||
// //             (p.teacherName || '').toLowerCase().includes(lowerCaseSearchTerm)
// //         );
// //     }, [availablePdfs, searchTerm]);
    
// //     const searchedAssignedPdfs = useMemo(() => {
// //         if (!searchTerm) return assignedPdfs;
// //         const lowerCaseSearchTerm = searchTerm.toLowerCase();
// //         return assignedPdfs.filter(p =>
// //             (p.title || '').toLowerCase().includes(lowerCaseSearchTerm) ||
// //             (p.teacherName || '').toLowerCase().includes(lowerCaseSearchTerm)
// //         );
// //     }, [assignedPdfs, searchTerm]);

// //     // Event Handlers
// //     const handleMainCategoryChange = (value: string) => {
// //         const mainCategoryId = value === "all" ? undefined : value;
// //         setSelectedMainCategory(mainCategoryId);
// //         setFilters({ mainCategoryId, categoryId: undefined });
// //     };

// //     const handleCategoryChange = (value: string) => {
// //         const categoryId = value === "all" ? undefined : value;
// //         setFilters(prev => ({ ...prev, categoryId }));
// //     };
    
// //     const handleAssignClick = (pdfId: string) => {
// //         if (!courseId) return;
// //         assignPdf.mutate({ courseId, pdfId });
// //     };

// //     const handleUnassignClick = (pdfId: string | null | undefined) => {
// //         if (!courseId || !pdfId) {
// //             toast({
// //                 title: "Error",
// //                 description: "Cannot unassign PDF due to a missing ID.",
// //                 variant: "destructive",
// //             });
// //             return;
// //         }
// //         unassignPdf.mutate({ courseId, pdfId });
// //     };

// //     if (courseQuery.isLoading) {
// //         return <Skeleton className="h-screen w-full" />;
// //     }

// //     return (
// //         <div className="space-y-6">
// //             <h1 className="text-2xl font-bold">
// //                 Assign PDFs to: <span className="text-primary">{courseQuery.data?.title}</span>
// //             </h1>

// //             <Tabs defaultValue="available">
// //                 <TabsList className="grid w-full grid-cols-2">
// //                     <TabsTrigger value="available">Available PDFs</TabsTrigger>
// //                     <TabsTrigger value="assigned">Assigned PDFs ({assignedPdfs.length})</TabsTrigger>
// //                 </TabsList>
                
// //                 <TabsContent value="available">
// //                     <Card>
// //                         <CardHeader>
// //                             <CardTitle>Browse Available PDFs</CardTitle>
// //                             <CardDescription>
// //                                 Search and filter PDFs to assign. Showing {searchedAvailablePdfs.length} available.
// //                             </CardDescription>
// //                         </CardHeader>
// //                         <CardContent className="space-y-4">
// //                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                                <Select onValueChange={handleMainCategoryChange}>
// //                                     <SelectTrigger><SelectValue placeholder="Filter by Main Category" /></SelectTrigger>
// //                                     <SelectContent>
// //                                         <SelectItem value="all">All Main Categories</SelectItem>
// //                                         {mainCategories?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.mainCategoryName}</SelectItem>))}
// //                                     </SelectContent>
// //                                 </Select>
// //                                 <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery.isLoading}>
// //                                     <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
// //                                     <SelectContent>
// //                                         <SelectItem value="all">All Categories</SelectItem>
// //                                         {categoriesQuery.data?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>))}
// //                                     </SelectContent>
// //                                 </Select>
// //                                 <div className="relative">
// //                                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                                     <Input placeholder="Search available PDFs..." onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
// //                                 </div>
// //                             </div>
// //                             <Table>
// //                                 <TableHeader><TableRow><TableHead>PDF Details</TableHead><TableHead>Teacher</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
// //                                 <TableBody>
// //                                     {pdfsQuery.isLoading ? (
// //                                         <TableRow><TableCell colSpan={4}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
// //                                     ) : searchedAvailablePdfs.length === 0 ? (
// //                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No available PDFs found.</TableCell></TableRow>
// //                                     ) : (
// //                                         searchedAvailablePdfs.map((pdf) => (
// //                                             <TableRow key={pdf.id}>
// //                                                 <TableCell className="font-medium">{pdf.title}</TableCell>
// //                                                 <TableCell>{pdf.teacherName}</TableCell>
// //                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
// //                                                 <TableCell>
// //                                                     <Button size="sm" onClick={() => handleAssignClick(pdf.id)} disabled={assignPdf.isPending}><LinkIcon className="h-4 w-4 mr-2" />Assign</Button>
// //                                                 </TableCell>
// //                                             </TableRow>
// //                                         ))
// //                                     )}
// //                                 </TableBody>
// //                             </Table>
// //                         </CardContent>
// //                     </Card>
// //                 </TabsContent>

// //                 <TabsContent value="assigned">
// //                     <Card>
// //                         <CardHeader>
// //                             <CardTitle>Assigned PDFs Configuration</CardTitle>
// //                             <CardDescription>View and manage the PDFs assigned to this course.</CardDescription>
// //                         </CardHeader>
// //                         <CardContent className="space-y-4">
// //                             <div className="relative md:w-1/3">
// //                                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                                 <Input placeholder="Search assigned PDFs..." onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
// //                             </div>
// //                             <Table>
// //                                 <TableHeader><TableRow><TableHead>PDF</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Is Free</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
// //                                 <TableBody>
// //                                      {courseQuery.isLoading ? (
// //                                         <TableRow><TableCell colSpan={5}><Skeleton className="h-16 w-full" /></TableCell></TableRow>
// //                                      ) : searchedAssignedPdfs.length === 0 ? (
// //                                         <TableRow><TableCell colSpan={5} className="text-center h-24">No PDFs assigned yet.</TableCell></TableRow>
// //                                     ) : (
// //                                         searchedAssignedPdfs.map((pdf) => (
// //                                             <TableRow key={pdf.id}>
// //                                                 <TableCell className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500"/><span className="font-medium">{pdf.title}</span></TableCell>
// //                                                 <TableCell>{pdf.priority}</TableCell>
// //                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
// //                                                 <TableCell>{pdf.isFree ? <Check className="text-green-500"/> : <X className="text-red-500"/>}</TableCell>
// //                                                 <TableCell>
// //                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(pdf.id)} disabled={unassignPdf.isPending}><Trash2 className="h-4 w-4 mr-2" />Unassign</Button>
// //                                                 </TableCell>
// //                                             </TableRow>
// //                                         ))
// //                                     )}
// //                                 </TableBody>
// //                             </Table>
// //                         </CardContent>
// //                     </Card>
// //                 </TabsContent>
// //             </Tabs>
// //         </div>
// //     );
// // }
// "use client";

// import { useState, useMemo } from 'react';
// import { useRoute } from 'wouter';
// import { usePdfs, type Pdf, type PdfFilterOptions } from '@/hooks/use-pdfs';
// import { useCourses } from '@/hooks/use-courses';
// import { useToast } from "@/hooks/use-toast";

// // Import UI components
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Search, Loader2, Link as LinkIcon, AlertCircle, Trash2, FileText, Check, X } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// export default function AssignPdfPage() {
//     const [, params] = useRoute("/courses/assign-pdf/:courseId");
//     const courseId = params?.courseId || '';
//     const { toast } = useToast();

//     // State for managing filters and search
//     const [filters, setFilters] = useState<PdfFilterOptions>({});
//     const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
//     const [searchTerm, setSearchTerm] = useState("");
    
//     // Hooks for fetching data and performing mutations
//     const { getPdfs, assignPdf, unassignPdf } = usePdfs();
//     const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

//     const courseQuery = useCourseById(courseId);
//     const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
//     const pdfsQuery = getPdfs(filters);

//     // ✅ FIX: Combine all list calculations into a single, synchronized useMemo hook.
//     const { assignedPdfs, availablePdfs } = useMemo(() => {
//         // Master list of all PDFs that match the current filters
//         const allFetchedPdfs = pdfsQuery.data || [];
        
//         // List of assigned PDFs from the course data, ensuring they have a consistent `.id` property
//         const normalizedAssigned = (courseQuery.data?.assignedPdfs || [])
//             .filter(p => p && (p.id || p._id)) // Filter out invalid entries
//             .map(p => ({ ...p, id: p.id || p._id })); // Normalize to use .id

//         // Create a Set of assigned IDs for efficient lookup
//         const assignedPdfIds = new Set(normalizedAssigned.map(p => p.id));
        
//         // Available PDFs are all fetched PDFs that are not in the assigned set
//         const available = allFetchedPdfs.filter(p => !assignedPdfIds.has(p.id));

//         // Apply search filter if it exists
//         if (!searchTerm) {
//             return { assignedPdfs: normalizedAssigned, availablePdfs: available };
//         }

//         const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
//         const searchedAssigned = normalizedAssigned.filter(p =>
//             (p.title || '').toLowerCase().includes(lowerCaseSearchTerm) ||
//             (p.teacherName || '').toLowerCase().includes(lowerCaseSearchTerm)
//         );

//         const searchedAvailable = available.filter(p =>
//             (p.title || '').toLowerCase().includes(lowerCaseSearchTerm) ||
//             (p.teacherName || '').toLowerCase().includes(lowerCaseSearchTerm)
//         );

//         return { assignedPdfs: searchedAssigned, availablePdfs: searchedAvailable };

//     }, [courseQuery.data, pdfsQuery.data, searchTerm]); // Dependencies that trigger recalculation

//     // Event Handlers
//     const handleMainCategoryChange = (value: string) => {
//         const mainCategoryId = value === "all" ? undefined : value;
//         setSelectedMainCategory(mainCategoryId);
//         setFilters({ mainCategoryId, categoryId: undefined });
//     };

//     const handleCategoryChange = (value: string) => {
//         const categoryId = value === "all" ? undefined : value;
//         setFilters(prev => ({ ...prev, categoryId }));
//     };
    
//     const handleAssignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) return;
//         assignPdf.mutate({ courseId, pdfId });
//     };

//     const handleUnassignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) {
//             toast({
//                 title: "Error",
//                 description: "Cannot unassign PDF due to a missing ID.",
//                 variant: "destructive",
//             });
//             return;
//         }
//         unassignPdf.mutate({ courseId, pdfId });
//     };

//     if (courseQuery.isLoading) {
//         return <Skeleton className="h-screen w-full" />;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">
//                 Assign PDFs to: <span className="text-primary">{courseQuery.data?.title}</span>
//             </h1>

//             <Tabs defaultValue="available">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="available">Available PDFs</TabsTrigger>
//                     <TabsTrigger value="assigned">Assigned PDFs ({assignedPdfs.length})</TabsTrigger>
//                 </TabsList>
                
//                 <TabsContent value="available">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Browse Available PDFs</CardTitle>
//                             <CardDescription>
//                                 Search and filter PDFs to assign. Showing {availablePdfs.length} available.
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                <Select onValueChange={handleMainCategoryChange}>
//                                     <SelectTrigger><SelectValue placeholder="Filter by Main Category" /></SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">All Main Categories</SelectItem>
//                                         {mainCategories?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.mainCategoryName}</SelectItem>))}
//                                     </SelectContent>
//                                 </Select>
//                                 <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery.isLoading}>
//                                     <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">All Categories</SelectItem>
//                                         {categoriesQuery.data?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>))}
//                                     </SelectContent>
//                                 </Select>
//                                 <div className="relative">
//                                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                     <Input placeholder="Search available PDFs..." onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                                 </div>
//                             </div>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF Details</TableHead><TableHead>Teacher</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                     {pdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
//                                     ) : availablePdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No available PDFs found.</TableCell></TableRow>
//                                     ) : (
//                                         availablePdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="font-medium">{pdf.title}</TableCell>
//                                                 <TableCell>{pdf.teacherName}</TableCell>
//                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" onClick={() => handleAssignClick(pdf.id)} disabled={assignPdf.isPending}><LinkIcon className="h-4 w-4 mr-2" />Assign</Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="assigned">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Assigned PDFs Configuration</CardTitle>
//                             <CardDescription>View and manage the PDFs assigned to this course.</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="relative md:w-1/3">
//                                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                 <Input placeholder="Search assigned PDFs..." onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                             </div>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF</TableHead><TableHead>Status</TableHead><TableHead>Is Free</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                      {courseQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4}><Skeleton className="h-16 w-full" /></TableCell></TableRow>
//                                      ) : assignedPdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No PDFs assigned yet.</TableCell></TableRow>
//                                     ) : (
//                                         assignedPdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500"/><span className="font-medium">{pdf.title}</span></TableCell>
//                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
//                                                 <TableCell>{pdf.isFree ? <Check className="h-5 w-5 text-green-500"/> : <X className="h-5 w-5 text-red-500"/>}</TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(pdf.id)} disabled={unassignPdf.isPending}><Trash2 className="h-4 w-4 mr-2" />Unassign</Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// }
// "use client";

// import { useState, useMemo } from 'react';
// import { useRoute } from 'wouter';
// import { usePdfs, type Pdf, type PdfFilterOptions } from '@/hooks/use-pdfs';
// import { useCourses } from '@/hooks/use-courses';
// import { useToast } from "@/hooks/use-toast";

// // Import UI components
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Search, Loader2, Link as LinkIcon, Trash2, FileText, Check, X } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// export default function AssignPdfPage() {
//     const [, params] = useRoute("/courses/assign-pdf/:courseId");
//     const courseId = params?.courseId || '';
//     const { toast } = useToast();

//     // State for managing filters and search
//     const [filters, setFilters] = useState<PdfFilterOptions>({});
//     const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
//     const [searchTerm, setSearchTerm] = useState("");
    
//     // Hooks for fetching data and performing mutations
//     // Pass courseId to the hook for cache invalidation
//     const { getPdfs, assignPdf, unassignPdf } = usePdfs(courseId);
//     const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

//     const courseQuery = useCourseById(courseId);
//     const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
//     const pdfsQuery = getPdfs(filters);

//     // ✅ CORE LOGIC: This hook derives both lists from the source queries.
//     // When courseQuery.data changes after a mutation, this automatically recalculates.
//     const { assignedPdfs, availablePdfs } = useMemo(() => {
//         // Master list of all PDFs that match the current filters
//         const allFetchedPdfs = pdfsQuery.data || [];
        
//         // List of assigned PDFs from the course data, ensuring they have a consistent `.id` property
//         const normalizedAssigned = (courseQuery.data?.assignedPdfs || [])
//             .filter(p => p && (p.id || p._id)) // Filter out invalid entries
//             .map(p => ({ ...p, id: p.id || p._id })); // Normalize to use .id

//         // Create a Set of assigned IDs for efficient lookup (O(1) time complexity)
//         const assignedPdfIds = new Set(normalizedAssigned.map(p => p.id));
        
//         // Available PDFs are all fetched PDFs that are NOT in the assigned set
//         const available = allFetchedPdfs.filter(p => !assignedPdfIds.has(p.id));

//         // Apply search filter if it exists
//         if (!searchTerm) {
//             return { assignedPdfs: normalizedAssigned, availablePdfs: available };
//         }

//         const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
//         const searchedAssigned = normalizedAssigned.filter(p =>
//             (p.title || '').toLowerCase().includes(lowerCaseSearchTerm)
//         );

//         const searchedAvailable = available.filter(p =>
//             (p.title || '').toLowerCase().includes(lowerCaseSearchTerm)
//         );

//         return { assignedPdfs: searchedAssigned, availablePdfs: searchedAvailable };

//     }, [courseQuery.data, pdfsQuery.data, searchTerm]); // Dependencies that trigger recalculation

//     // Event Handlers
//     const handleMainCategoryChange = (value: string) => {
//         const mainCategoryId = value === "all" ? undefined : value;
//         setSelectedMainCategory(mainCategoryId);
//         setFilters({ mainCategoryId, categoryId: undefined });
//     };

//     const handleCategoryChange = (value: string) => {
//         const categoryId = value === "all" ? undefined : value;
//         setFilters(prev => ({ ...prev, categoryId }));
//     };
    
//     const handleAssignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) return;
//         assignPdf.mutate({ courseId, pdfId });
//     };

//     const handleUnassignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) {
//             toast({
//                 title: "Error",
//                 description: "Cannot unassign PDF due to a missing ID.",
//                 variant: "destructive",
//             });
//             return;
//         }
//         unassignPdf.mutate({ courseId, pdfId });
//     };

//     if (courseQuery.isLoading) {
//         return <Skeleton className="h-screen w-full" />;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">
//                 Assign PDFs to: <span className="text-primary">{courseQuery.data?.title}</span>
//             </h1>

//             <Tabs defaultValue="available">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="available">Available PDFs ({availablePdfs.length})</TabsTrigger>
//                     <TabsTrigger value="assigned">Assigned PDFs ({assignedPdfs.length})</TabsTrigger>
//                 </TabsList>
                
//                 {/* AVAILABLE PDFs TAB */}
//                 <TabsContent value="available">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Browse Available PDFs</CardTitle>
//                             <CardDescription>Search and filter all PDFs in the system.</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                <Select onValueChange={handleMainCategoryChange}>
//                                     <SelectTrigger><SelectValue placeholder="Filter by Main Category" /></SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">All Main Categories</SelectItem>
//                                         {Array.isArray(mainCategories) && mainCategories.map((cat: any) => (
//                                             <SelectItem key={cat.id} value={cat.id}>{cat.mainCategoryName}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery?.isLoading}>
//                                     <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">All Categories</SelectItem>
//                                         {categoriesQuery && Array.isArray(categoriesQuery.data) && categoriesQuery.data.map((cat: any) => (
//                                             <SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 <div className="relative">
//                                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                     <Input placeholder="Search available PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                                 </div>
//                             </div>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                     {pdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
//                                     ) : availablePdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No available PDFs found.</TableCell></TableRow>
//                                     ) : (
//                                         availablePdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="font-medium">{pdf.title}</TableCell>
//                                                 <TableCell>{pdf.category?.categoryName || 'N/A'}</TableCell>
//                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" onClick={() => handleAssignClick(pdf.id)} disabled={assignPdf.isPending}><LinkIcon className="h-4 w-4 mr-2" />Assign</Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 {/* ASSIGNED PDFs TAB */}
//                 <TabsContent value="assigned">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Assigned PDFs Configuration</CardTitle>
//                             <CardDescription>View and manage the PDFs assigned to this course.</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="relative md:w-1/3">
//                                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                 <Input placeholder="Search assigned PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                             </div>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF</TableHead><TableHead>Status</TableHead><TableHead>Is Free</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                      {courseQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4}><Skeleton className="h-16 w-full" /></TableCell></TableRow>
//                                      ) : assignedPdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No PDFs assigned yet.</TableCell></TableRow>
//                                     ) : (
//                                         assignedPdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500"/><span className="font-medium">{pdf.title}</span></TableCell>
//                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
//                                                 <TableCell>{pdf.isFree ? <Check className="h-5 w-5 text-green-500"/> : <X className="h-5 w-5 text-red-500"/>}</TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(pdf.id)} disabled={unassignPdf.isPending}><Trash2 className="h-4 w-4 mr-2" />Unassign</Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// } 
// "use client";

// import { useState, useMemo } from 'react';
// import { useRoute } from 'wouter';
// import { usePdfs, type Pdf, type PdfFilterOptions } from '@/hooks/use-pdfs';
// import { useCourses } from '@/hooks/use-courses';
// import { useToast } from "@/hooks/use-toast";

// // Import UI components
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Search, Loader2, Link as LinkIcon, Trash2, FileText, Check, X } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// export default function AssignPdfPage() {
//     const [, params] = useRoute("/courses/assign-pdf/:courseId");
//     const courseId = params?.courseId || '';
//     const { toast } = useToast();

//     // State for managing filters and search
//     const [filters, setFilters] = useState<PdfFilterOptions>({});
//     const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
//     const [searchTerm, setSearchTerm] = useState("");
    
//     // Hooks for fetching data and performing mutations
//     const { getPdfs, assignPdf, unassignPdf } = usePdfs(); // courseId is not needed here
//     const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

//     const courseQuery = useCourseById(courseId);
//     const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
//     const pdfsQuery = getPdfs(filters);

//     // ✅ CORE LOGIC: A single useMemo hook derives both final lists.
//     // It correctly normalizes IDs, separates lists, and applies the search filter.
//     const { assignedPdfs, availablePdfs } = useMemo(() => {
//         // 1. Normalize the master list to ensure every object has a `.id` property.
//         const allNormalizedPdfs = (pdfsQuery.data || []).map(p => ({
//             ...p,
//             id: p.id || p._id, // Use .id if it exists, otherwise fall back to ._id
//         }));
        
//         // 2. Normalize the list of PDFs assigned to the course.
//         const normalizedAssigned = (courseQuery.data?.assignedPdfs || [])
//             .filter(p => p && (p.id || p._id)) // Filter out any invalid entries
//             .map(p => ({ ...p, id: p.id || p._id }));

//         // 3. Create a Set of assigned IDs for efficient lookup (O(1) time complexity).
//         const assignedPdfIds = new Set(normalizedAssigned.map(p => p.id));
        
//         // 4. Filter the normalized master list to find available PDFs.
//         const available = allNormalizedPdfs.filter(p => !assignedPdfIds.has(p.id));

//         // 5. If there's no search term, return the calculated lists directly.
//         if (!searchTerm) {
//             return { assignedPdfs: normalizedAssigned, availablePdfs: available };
//         }

//         // 6. Apply search filter to both lists if a search term exists.
//         const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
//         const searchedAssigned = normalizedAssigned.filter(p =>
//             (p.title || '').toLowerCase().includes(lowerCaseSearchTerm)
//         );

//         const searchedAvailable = available.filter(p =>
//             (p.title || '').toLowerCase().includes(lowerCaseSearchTerm)
//         );

//         return { assignedPdfs: searchedAssigned, availablePdfs: searchedAvailable };

//     }, [courseQuery.data, pdfsQuery.data, searchTerm]); // Dependencies that trigger recalculation

//     // Event Handlers
//     const handleMainCategoryChange = (value: string) => {
//         const mainCategoryId = value === "all" ? undefined : value;
//         setSelectedMainCategory(mainCategoryId);
//         setFilters({ mainCategoryId, categoryId: undefined });
//     };

//     const handleCategoryChange = (value: string) => {
//         const categoryId = value === "all" ? undefined : value;
//         setFilters(prev => ({ ...prev, categoryId }));
//     };
    
//     const handleAssignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) return;
//         assignPdf.mutate({ courseId, pdfId });
//     };

//     const handleUnassignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) {
//             toast({
//                 title: "Error",
//                 description: "Cannot unassign PDF due to a missing ID.",
//                 variant: "destructive",
//             });
//             return;
//         }
//         unassignPdf.mutate({ courseId, pdfId });
//     };

//     if (courseQuery.isLoading) {
//         return <Skeleton className="h-screen w-full" />;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">
//                 Assign PDFs to: <span className="text-primary">{courseQuery.data?.title}</span>
//             </h1>

//             <Tabs defaultValue="available">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="available">Available PDFs ({availablePdfs.length})</TabsTrigger>
//                     <TabsTrigger value="assigned">Assigned PDFs ({assignedPdfs.length})</TabsTrigger>
//                 </TabsList>
                
//                 {/* AVAILABLE PDFs TAB */}
//                 <TabsContent value="available">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Browse Available PDFs</CardTitle>
//                             <CardDescription>Search and filter all PDFs in the system to assign to this course.</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                <Select onValueChange={handleMainCategoryChange}>
//                                     <SelectTrigger><SelectValue placeholder="Filter by Main Category" /></SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">All Main Categories</SelectItem>
//                                         {Array.isArray(mainCategories) && mainCategories.map((cat: any) => (
//                                             <SelectItem key={cat.id} value={cat.id}>{cat.mainCategoryName}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery?.isLoading}>
//                                     <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">All Categories</SelectItem>
//                                         {categoriesQuery && Array.isArray(categoriesQuery.data) && categoriesQuery.data.map((cat: any) => (
//                                             <SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 <div className="relative">
//                                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                     <Input placeholder="Search available PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                                 </div>
//                             </div>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                     {pdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
//                                     ) : availablePdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No available PDFs found matching your criteria.</TableCell></TableRow>
//                                     ) : (
//                                         availablePdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="font-medium">{pdf.title}</TableCell>
//                                                 <TableCell>{pdf.category?.categoryName || 'N/A'}</TableCell>
//                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" onClick={() => handleAssignClick(pdf.id)} disabled={assignPdf.isPending}>
//                                                         {assignPdf.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-2" />}
//                                                         Assign
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 {/* ASSIGNED PDFs TAB */}
//                 <TabsContent value="assigned">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Assigned PDFs Configuration</CardTitle>
//                             <CardDescription>View and manage the PDFs assigned to this course.</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="relative md:w-1/3">
//                                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                 <Input placeholder="Search assigned PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                             </div>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF</TableHead><TableHead>Status</TableHead><TableHead>Is Free</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                      {courseQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
//                                      ) : assignedPdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No PDFs have been assigned to this course yet.</TableCell></TableRow>
//                                     ) : (
//                                         assignedPdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500"/><span className="font-medium">{pdf.title}</span></TableCell>
//                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
//                                                 <TableCell>{pdf.isFree ? <Check className="h-5 w-5 text-green-500"/> : <X className="h-5 w-5 text-red-500"/>}</TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(pdf.id)} disabled={unassignPdf.isPending}>
//                                                         {unassignPdf.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
//                                                         Unassign
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// } 
// "use client";

// import { useState, useMemo } from 'react';
// import { useRoute } from 'wouter';
// import { usePdfs, type Pdf, type PdfFilterOptions } from '@/hooks/use-pdfs';
// import { useCourses } from '@/hooks/use-courses';
// import { useToast } from "@/hooks/use-toast";
// import { useQuery } from '@tanstack/react-query'; // Import useQuery

// // Import UI components
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Search, Loader2, Link as LinkIcon, Trash2, FileText, Check, X } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// // Define constants for your API
// const API_BASE_URL = "http://localhost:5099/api";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// export default function AssignPdfPage() {
//     const [, params] = useRoute("/courses/assign-pdf/:courseId");
//     const courseId = params?.courseId || '';
//     const { toast } = useToast();

//     // State for managing filters and search
//     const [filters, setFilters] = useState<PdfFilterOptions>({});
//     const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
//     const [searchTerm, setSearchTerm] = useState("");
    
//     // --- HOOKS ---
//     const { getPdfs, assignPdf, unassignPdf } = usePdfs();
//     const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

//     // --- DATA FETCHING ---
//     const courseQuery = useCourseById(courseId); // For course title
//     const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
//     const pdfsQuery = getPdfs(filters); // For master list of all PDFs

//     // ✅ NEW: Dedicated query for the PDFs assigned to this specific course
//     const assignedPdfsQuery = useQuery<Pdf[]>({
//         queryKey: ['assignedPdfs', courseId],
//         queryFn: async () => {
//             if (!courseId) return [];
//             const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assigned-pdfs`, {
//                 headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//             });
//             if (!response.ok) throw new Error('Failed to fetch assigned PDFs');
//             const result = await response.json();
            
//             // ✅ This is the recommended, safer way
//             const data = result.data || result;
//             return Array.isArray(data) ? data : [];
//         },
//         enabled: !!courseId,
//     });

//     // ✅ UPDATED CORE LOGIC: useMemo now uses the new `assignedPdfsQuery`
//     const { assignedPdfs, availablePdfs } = useMemo(() => {
//         const allNormalizedPdfs = (pdfsQuery.data || []).map(p => ({ ...p, id: p.id || p._id }));
//         const normalizedAssigned = (assignedPdfsQuery.data || []).map(p => ({ ...p, id: p.id || p._id }));

//         const assignedPdfIds = new Set(normalizedAssigned.map(p => p.id));
//         const available = allNormalizedPdfs.filter(p => !assignedPdfIds.has(p.id));

//         if (!searchTerm) {
//             return { assignedPdfs: normalizedAssigned, availablePdfs: available };
//         }

//         const lowerCaseSearchTerm = searchTerm.toLowerCase();
//         const searchedAssigned = normalizedAssigned.filter(p => (p.title || '').toLowerCase().includes(lowerCaseSearchTerm));
//         const searchedAvailable = available.filter(p => (p.title || '').toLowerCase().includes(lowerCaseSearchTerm));

//         return { assignedPdfs: searchedAssigned, availablePdfs: searchedAvailable };

//     }, [assignedPdfsQuery.data, pdfsQuery.data, searchTerm]);

//     // --- EVENT HANDLERS (No changes needed) ---
//     const handleMainCategoryChange = (value: string) => {
//         const mainCategoryId = value === "all" ? undefined : value;
//         setSelectedMainCategory(mainCategoryId);
//         setFilters({ mainCategoryId, categoryId: undefined });
//     };

//     const handleCategoryChange = (value: string) => {
//         const categoryId = value === "all" ? undefined : value;
//         setFilters(prev => ({ ...prev, categoryId }));
//     };
    
//     const handleAssignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) return;
//         assignPdf.mutate({ courseId, pdfId });
//     };

//     const handleUnassignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) {
//             toast({ title: "Error", description: "Cannot unassign PDF due to a missing ID.", variant: "destructive" });
//             return;
//         }
//         unassignPdf.mutate({ courseId, pdfId });
//     };

//     // --- RENDER LOGIC ---
//     if (courseQuery.isLoading) {
//         return <Skeleton className="h-screen w-full" />;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">
//                 Assign PDFs to: <span className="text-primary">{courseQuery.data?.title}</span>
//             </h1>

//             <Tabs defaultValue="available">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="available">Available PDFs ({availablePdfs.length})</TabsTrigger>
//                     <TabsTrigger value="assigned">Assigned PDFs ({assignedPdfs.length})</TabsTrigger>
//                 </TabsList>
                
//                 <TabsContent value="available">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Browse Available PDFs</CardTitle>
//                             <CardDescription>Search and filter all PDFs in the system to assign to this course.</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                <Select onValueChange={handleMainCategoryChange}>
//                                     <SelectTrigger><SelectValue placeholder="Filter by Main Category" /></SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">All Main Categories</SelectItem>
//                                         {Array.isArray(mainCategories) && mainCategories.map((cat: any) => (
//                                             <SelectItem key={cat.id} value={cat.id}>{cat.mainCategoryName}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery?.isLoading}>
//                                     <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">All Categories</SelectItem>
//                                         {categoriesQuery && Array.isArray(categoriesQuery.data) && categoriesQuery.data.map((cat: any) => (
//                                             <SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 <div className="relative">
//                                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                     <Input placeholder="Search available PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                                 </div>
//                             </div>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                     {pdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
//                                     ) : availablePdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No available PDFs found matching your criteria.</TableCell></TableRow>
//                                     ) : (
//                                         availablePdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="font-medium">{pdf.title}</TableCell>
//                                                 <TableCell>{pdf.category?.categoryName || 'N/A'}</TableCell>
//                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" onClick={() => handleAssignClick(pdf.id)} disabled={assignPdf.isPending}>
//                                                         {assignPdf.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-2" />}
//                                                         Assign
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="assigned">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Assigned PDFs Configuration</CardTitle>
//                             <CardDescription>View and manage the PDFs assigned to this course.</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="relative md:w-1/3">
//                                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                 <Input placeholder="Search assigned PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                             </div>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF</TableHead><TableHead>Status</TableHead><TableHead>Is Free</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                      {/* ✅ UPDATED: Loading state now uses the new query */}
//                                      {assignedPdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
//                                      ) : assignedPdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No PDFs have been assigned to this course yet.</TableCell></TableRow>
//                                     ) : (
//                                         assignedPdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500"/><span className="font-medium">{pdf.title}</span></TableCell>
//                                                 <TableCell><Badge variant={pdf.status === 'active' ? 'success' : 'destructive'}>{pdf.status}</Badge></TableCell>
//                                                 <TableCell>{pdf.isFree ? <Check className="h-5 w-5 text-green-500"/> : <X className="h-5 w-5 text-red-500"/>}</TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(pdf.id)} disabled={unassignPdf.isPending}>
//                                                         {unassignPdf.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
//                                                         Unassign
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// // } 
// "use client";

// import { useState, useMemo } from 'react';
// import { useRoute } from 'wouter';
// import { usePdfs, type Pdf } from '@/hooks/use-pdfs';
// import { useCourses } from '@/hooks/use-courses';
// import { useToast } from "@/hooks/use-toast";
// import { useQuery } from '@tanstack/react-query';

// // Import UI components
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Search, Loader2, Link as LinkIcon, Trash2, FileText, Check, X } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// const API_BASE_URL = "http://localhost:5099/api";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// export default function AssignPdfPage() {
//     const [, params] = useRoute("/courses/assign-pdf/:courseId");
//     const courseId = params?.courseId || '';
//     const { toast } = useToast();
//     const [searchTerm, setSearchTerm] = useState("");
    
//     // --- HOOKS ---
//     // ✅ We only need the mutations from usePdfs now.
//     const { assignPdf, unassignPdf } = usePdfs();
//     const { useCourseById } = useCourses();

//     // --- DATA FETCHING ---
//     const courseQuery = useCourseById(courseId);

//     // ✅ Query 1: Fetches ONLY the PDFs already assigned to this course.
//     const assignedPdfsQuery = useQuery<Pdf[]>({
//         queryKey: ['assignedPdfs', courseId],
//         queryFn: async () => {
//             if (!courseId) return [];
//             const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assigned-pdfs`, {
//                 headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//             });
//             if (!response.ok) throw new Error('Failed to fetch assigned PDFs');
//             const result = await response.json();
//             // Your API likely returns { data: { pdfs: [...] } }
//             return result.data?.pdfs || []; 
//         },
//         enabled: !!courseId,
//     });

//     // ✅ Query 2: Fetches ONLY the PDFs available for this course.
//     const availablePdfsQuery = useQuery<Pdf[]>({
//         queryKey: ['availablePdfs', courseId],
//         queryFn: async () => {
//             if (!courseId) return [];
//             const response = await fetch(`${API_BASE_URL}/courses/${courseId}/available-pdfs`, {
//                  headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//             });
//             if (!response.ok) throw new Error('Failed to fetch available PDFs');
//             const result = await response.json();
//             // Your API likely returns { data: { pdfs: [...] } }
//             return result.data?.pdfs || [];
//         },
//         enabled: !!courseId,
//     });

//     // ✅ CORE LOGIC: Simplified useMemo just applies the search term to the fetched lists.
//     const { assignedPdfs, availablePdfs } = useMemo(() => {
//         let assigned = assignedPdfsQuery.data || [];
//         let available = availablePdfsQuery.data || [];

//         if (searchTerm) {
//             const lowerCaseSearchTerm = searchTerm.toLowerCase();
//             assigned = assigned.filter(p => p.title.toLowerCase().includes(lowerCaseSearchTerm));
//             available = available.filter(p => p.title.toLowerCase().includes(lowerCaseSearchTerm));
//         }

//         return { assignedPdfs: assigned, availablePdfs: available };
//     }, [assignedPdfsQuery.data, availablePdfsQuery.data, searchTerm]);

//     // --- EVENT HANDLERS ---
//     const handleAssignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) return;
//         assignPdf.mutate({ courseId, pdfId });
//     };

//     const handleUnassignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) {
//             toast({ title: "Error", description: "Missing ID", variant: "destructive" });
//             return;
//         }
//         unassignPdf.mutate({ courseId, pdfId });
//     };

//     if (courseQuery.isLoading) {
//         return <Skeleton className="h-screen w-full" />;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">
//                 Assign PDFs to: <span className="text-primary">{courseQuery.data?.title}</span>
//             </h1>
//             {/* The search bar now filters both lists simultaneously */}
//             <div className="relative md:w-1/3">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input placeholder="Search assigned & available PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//             </div>

//             <Tabs defaultValue="available">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="available">Available PDFs ({availablePdfs.length})</TabsTrigger>
//                     <TabsTrigger value="assigned">Assigned PDFs ({assignedPdfs.length})</TabsTrigger>
//                 </TabsList>
                
//                 <TabsContent value="available">
//                     <Card>
//                         <CardHeader><CardTitle>Browse Available PDFs</CardTitle></CardHeader>
//                         <CardContent>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF Title</TableHead><TableHead className="w-32">Action</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                     {/* Loading state is now tied to its specific query */}
//                                     {availablePdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
//                                     ) : availablePdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={2} className="text-center h-24">No available PDFs found.</TableCell></TableRow>
//                                     ) : (
//                                         availablePdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="font-medium">{pdf.title}</TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" onClick={() => handleAssignClick(pdf.id)} disabled={assignPdf.isPending}>
//                                                         <LinkIcon className="h-4 w-4 mr-2" />Assign
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="assigned">
//                     <Card>
//                         <CardHeader><CardTitle>Assigned PDFs Configuration</CardTitle></CardHeader>
//                         <CardContent>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF Title</TableHead><TableHead className="w-36">Actions</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                      {assignedPdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
//                                      ) : assignedPdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={2} className="text-center h-24">No PDFs assigned yet.</TableCell></TableRow>
//                                     ) : (
//                                         assignedPdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500"/><span className="font-medium">{pdf.title}</span></TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(pdf.id)} disabled={unassignPdf.isPending}>
//                                                         <Trash2 className="h-4 w-4 mr-2" />Unassign
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// } 
// "use client";

// import { useState, useMemo } from 'react';
// import { useRoute } from 'wouter';
// import { usePdfs, type CoursePdf as Pdf } from '@/hooks/use-pdfs';
// import { useCourses } from '@/hooks/use-courses';
// import { useToast } from "@/hooks/use-toast";
// import { useQuery } from '@tanstack/react-query';

// // Import UI components
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Search, Loader2, Link as LinkIcon, Trash2, FileText } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// const API_BASE_URL = "http://localhost:5099/api";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// export default function AssignPdfPage() {
//     const [, params] = useRoute("/courses/assign-pdf/:courseId");
//     const courseId = params?.courseId || '';
//     const { toast } = useToast();
//     const [searchTerm, setSearchTerm] = useState("");
    
//     // --- HOOKS ---
//     const { assignPdf, unassignPdf } = usePdfs();
//     const { useCourseById } = useCourses();

//     // --- DATA FETCHING ---
//     const courseQuery = useCourseById(courseId);

//     // ✅ Fetches ONLY the PDFs already assigned to this course
//     const assignedPdfsQuery = useQuery<Pdf[]>({
//         queryKey: ['assignedPdfs', courseId],
//         queryFn: async () => {
//             if (!courseId) return [];
//             const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assigned-pdfs`, {
//                 headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//             });
//             if (!response.ok) throw new Error('Failed to fetch assigned PDFs');
//             const result = await response.json();
//             return result.data?.pdfs || []; 
//         },
//         enabled: !!courseId,
//     });

//     // ✅ Fetches ONLY the PDFs available for this course (backend already does the subtraction)
//     const availablePdfsQuery = useQuery<Pdf[]>({
//         queryKey: ['availablePdfs', courseId],
//         queryFn: async () => {
//             if (!courseId) return [];
//             const response = await fetch(`${API_BASE_URL}/courses/${courseId}/available-pdfs`, {
//                  headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//             });
//             if (!response.ok) throw new Error('Failed to fetch available PDFs');
//             const result = await response.json();
//             return result.data?.pdfs || [];
//         },
//         enabled: !!courseId,
//     });

//     // --- UI LOGIC ---
//     // This just applies the search term to the lists already provided by the API
//     const { assignedPdfs, availablePdfs } = useMemo(() => {
//         let assigned = assignedPdfsQuery.data || [];
//         let available = availablePdfsQuery.data || [];

//         if (searchTerm) {
//             const lowerCaseSearchTerm = searchTerm.toLowerCase();
//             assigned = assigned.filter(p => p.title.toLowerCase().includes(lowerCaseSearchTerm));
//             available = available.filter(p => p.title.toLowerCase().includes(lowerCaseSearchTerm));
//         }

//         return { assignedPdfs: assigned, availablePdfs: available };
//     }, [assignedPdfsQuery.data, availablePdfsQuery.data, searchTerm]);

//     // --- EVENT HANDLERS ---
//     const handleAssignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) return;
//         assignPdf.mutate({ courseId, pdfId });
//     };

//     const handleUnassignClick = (pdfId: string) => {
//         if (!courseId || !pdfId) {
//             toast({ title: "Error", description: "Missing ID", variant: "destructive" });
//             return;
//         }
//         unassignPdf.mutate({ courseId, pdfId });
//     };

//     if (courseQuery.isLoading) {
//         return <Skeleton className="h-screen w-full" />;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">
//                 Assign PDFs to: <span className="text-primary">{courseQuery.data?.title}</span>
//             </h1>
//             <div className="relative md:w-1/3">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input placeholder="Search assigned & available PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//             </div>

//             <Tabs defaultValue="available">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="available">Available PDFs ({availablePdfs.length})</TabsTrigger>
//                     <TabsTrigger value="assigned">Assigned PDFs ({assignedPdfs.length})</TabsTrigger>
//                 </TabsList>
                
//                 <TabsContent value="available">
//                     <Card>
//                         <CardHeader><CardTitle>Browse Available PDFs</CardTitle></CardHeader>
//                         <CardContent>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF Title</TableHead><TableHead className="w-32">Action</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                     {availablePdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
//                                     ) : availablePdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={2} className="text-center h-24">No available PDFs found.</TableCell></TableRow>
//                                     ) : (
//                                         availablePdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="font-medium">{pdf.title}</TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" onClick={() => handleAssignClick(pdf.id)} disabled={assignPdf.isPending}>
//                                                         <LinkIcon className="h-4 w-4 mr-2" />Assign
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="assigned">
//                     <Card>
//                         <CardHeader><CardTitle>Assigned PDFs Configuration</CardTitle></CardHeader>
//                         <CardContent>
//                             <Table>
//                                 <TableHeader><TableRow><TableHead>PDF Title</TableHead><TableHead className="w-36">Actions</TableHead></TableRow></TableHeader>
//                                 <TableBody>
//                                      {assignedPdfsQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
//                                      ) : assignedPdfs.length === 0 ? (
//                                         <TableRow><TableCell colSpan={2} className="text-center h-24">No PDFs assigned yet.</TableCell></TableRow>
//                                     ) : (
//                                         assignedPdfs.map((pdf) => (
//                                             <TableRow key={pdf.id}>
//                                                 <TableCell className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500"/><span className="font-medium">{pdf.title}</span></TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(pdf.id)} disabled={unassignPdf.isPending}>
//                                                         <Trash2 className="h-4 w-4 mr-2" />Unassign
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// } 
"use client";

import { useState, useMemo } from 'react';
import { useRoute } from 'wouter';
import { usePdfs, type CoursePdf as Pdf } from '@/hooks/use-pdfs';
import { useCourses } from '@/hooks/use-courses';
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';

// Import UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, Loader2, Link as LinkIcon, Trash2, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const API_BASE_URL = "http://localhost:5099/api";
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export default function AssignPdfPage() {
    const [, params] = useRoute("/courses/assign-pdf/:courseId");
    const courseId = params?.courseId || '';
    const [searchTerm, setSearchTerm] = useState("");
    
    // State for selections
    const [selectedPdfs, setSelectedPdfs] = useState<Set<string>>(new Set());
    const [selectedAssignedPdfs, setSelectedAssignedPdfs] = useState<Set<string>>(new Set());

    // --- HOOKS ---
    const { assignPdf, unassignPdf } = usePdfs();
    const { useCourseById } = useCourses();

    // --- DATA FETCHING ---
    const courseQuery = useCourseById(courseId);

    const assignedPdfsQuery = useQuery<Pdf[]>({
        queryKey: ['assignedPdfs', courseId],
        queryFn: async () => {
            if (!courseId) return [];
            const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assigned-pdfs`, {
                headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
            });
            if (!response.ok) throw new Error('Failed to fetch assigned PDFs');
            const result = await response.json();
            return result.data?.pdfs || []; 
        },
        enabled: !!courseId,
    });

    const availablePdfsQuery = useQuery<Pdf[]>({
        queryKey: ['availablePdfs', courseId],
        queryFn: async () => {
            if (!courseId) return [];
            const response = await fetch(`${API_BASE_URL}/courses/${courseId}/available-pdfs`, {
                 headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
            });
            if (!response.ok) throw new Error('Failed to fetch available PDFs');
            const result = await response.json();
            return result.data?.pdfs || [];
        },
        enabled: !!courseId,
    });

    // --- UI LOGIC ---
    const { assignedPdfs, availablePdfs } = useMemo(() => {
        let assigned = assignedPdfsQuery.data || [];
        let available = availablePdfsQuery.data || [];

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            assigned = assigned.filter(p => p.title.toLowerCase().includes(lowerCaseSearchTerm));
            available = available.filter(p => p.title.toLowerCase().includes(lowerCaseSearchTerm));
        }

        return { assignedPdfs: assigned, availablePdfs: available };
    }, [assignedPdfsQuery.data, availablePdfsQuery.data, searchTerm]);

    // --- EVENT HANDLERS ---
    const handleSelectPdf = (pdfId: string) => {
        setSelectedPdfs(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(pdfId)) newSelection.delete(pdfId);
            else newSelection.add(pdfId);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedPdfs.size === availablePdfs.length) setSelectedPdfs(new Set());
        else setSelectedPdfs(new Set(availablePdfs.map(p => p.id)));
    };

    const handleAssignSelected = () => {
        if (!courseId || selectedPdfs.size === 0) return;
        const assignPromises = Array.from(selectedPdfs).map(pdfId => 
            assignPdf.mutateAsync({ courseId, pdfId })
          );        
          toast.promise(Promise.all(assignPromises), {
            loading: `Assigning ${selectedPdfs.size} PDFs...`,
            success: () => {
                setSelectedPdfs(new Set());
                return `${selectedPdfs.size} PDFs assigned successfully!`;
            },
            error: 'One or more assignments failed.',
        });
    };
    
    const handleSelectAssignedPdf = (pdfId: string) => {
        setSelectedAssignedPdfs(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(pdfId)) newSelection.delete(pdfId);
            else newSelection.add(pdfId);
            return newSelection;
        });
    };

    const handleSelectAllAssigned = () => {
        if (selectedAssignedPdfs.size === assignedPdfs.length) setSelectedAssignedPdfs(new Set());
        else setSelectedAssignedPdfs(new Set(assignedPdfs.map(p => p.id)));
    };

    const handleUnassignSelected = () => {
        if (!courseId || selectedAssignedPdfs.size === 0) return;
        const unassignPromises = Array.from(selectedAssignedPdfs).map(pdfId => unassignPdf.mutateAsync({ courseId, pdfId }));
        toast.promise(Promise.all(unassignPromises), {
            loading: `Unassigning ${selectedAssignedPdfs.size} PDFs...`,
            success: () => {
                setSelectedAssignedPdfs(new Set());
                return `${selectedAssignedPdfs.size} PDFs unassigned successfully!`;
            },
            error: 'One or more unassignments failed.',
        });
    };

    const handleAssignClick = (pdfId: string) => {
        if (!courseId || !pdfId) return;
        assignPdf.mutate({ courseId, pdfId });
    };

    const handleUnassignClick = (pdfId: string) => {
        if (!courseId || !pdfId) return toast.error("Missing ID");
        unassignPdf.mutate({ courseId, pdfId });
    };

    if (courseQuery.isLoading) {
        return <Skeleton className="h-screen w-full" />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">
                Assign PDFs to: <span className="text-primary">{courseQuery.data?.title}</span>
            </h1>
            <div className="relative md:w-1/3">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search assigned & available PDFs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>

            <Tabs defaultValue="available">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">Available PDFs ({availablePdfs.length})</TabsTrigger>
                    <TabsTrigger value="assigned">Assigned PDFs ({assignedPdfs.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="available">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Browse Available PDFs</CardTitle>
                                    <CardDescription>Select PDFs to assign to this course.</CardDescription>
                                </div>
                                {selectedPdfs.size > 0 && (
                                    <Button onClick={handleAssignSelected} disabled={assignPdf.isPending}>
                                        <LinkIcon className="h-4 w-4 mr-2" />
                                        Assign Selected ({selectedPdfs.size})
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={availablePdfs.length > 0 && selectedPdfs.size === availablePdfs.length}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all available"
                                        />
                                    </TableHead>
                                    <TableHead>PDF Title</TableHead>
                                    <TableHead className="w-32 text-right">Action</TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                    {availablePdfsQuery.isLoading ? (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                                    ) : availablePdfs.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">No available PDFs found.</TableCell></TableRow>
                                    ) : (
                                        availablePdfs.map((pdf) => (
                                            <TableRow key={pdf.id} data-state={selectedPdfs.has(pdf.id) ? "selected" : ""}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedPdfs.has(pdf.id)}
                                                        onCheckedChange={() => handleSelectPdf(pdf.id)}
                                                        aria-label="Select row"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{pdf.title}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" onClick={() => handleAssignClick(pdf.id)} disabled={assignPdf.isPending}>
                                                        <LinkIcon className="h-4 w-4 mr-2" />Assign
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assigned">
                    <Card>
                        <CardHeader>
                           <div className="flex justify-between items-center">
                               <div>
                                   <CardTitle>Assigned PDFs Configuration</CardTitle>
                                   <CardDescription>Select PDFs to unassign from this course.</CardDescription>
                               </div>
                                {selectedAssignedPdfs.size > 0 && (
                                    <Button variant="destructive" onClick={handleUnassignSelected} disabled={unassignPdf.isPending}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Unassign Selected ({selectedAssignedPdfs.size})
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={assignedPdfs.length > 0 && selectedAssignedPdfs.size === assignedPdfs.length}
                                            onCheckedChange={handleSelectAllAssigned}
                                            aria-label="Select all assigned"
                                        />
                                    </TableHead>
                                    <TableHead>PDF Title</TableHead>
                                    <TableHead className="w-36 text-right">Actions</TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                     {assignedPdfsQuery.isLoading ? (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                                     ) : assignedPdfs.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">No PDFs assigned yet.</TableCell></TableRow>
                                    ) : (
                                        assignedPdfs.map((pdf) => (
                                            <TableRow key={pdf.id} data-state={selectedAssignedPdfs.has(pdf.id) ? "selected" : ""}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedAssignedPdfs.has(pdf.id)}
                                                        onCheckedChange={() => handleSelectAssignedPdf(pdf.id)}
                                                        aria-label="Select assigned row"
                                                    />
                                                </TableCell>
                                                <TableCell className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500"/><span className="font-medium">{pdf.title}</span></TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(pdf.id)} disabled={unassignPdf.isPending}>
                                                        <Trash2 className="h-4 w-4 mr-2" />Unassign
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}