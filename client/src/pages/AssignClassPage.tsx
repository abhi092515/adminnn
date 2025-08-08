// // "use client";

// // import { useState, useMemo } from 'react';
// // import { useRoute } from 'wouter';
// // import { useClasses, type Class, type ClassFilterOptions } from '@/hooks/use-classes';
// // import { useCourses } from '@/hooks/use-courses';
// // import { toast } from "sonner";

// // // Import UI components
// // import { Input } from '@/components/ui/input';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // import { Badge } from '@/components/ui/badge';
// // import { Search, Loader2, Link as LinkIcon, Trash2, Check, X } from 'lucide-react';
// // import { Skeleton } from '@/components/ui/skeleton';
// // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// // export default function AssignClassPage() {
// //     const [, params] = useRoute("/courses/assign-class/:courseId");
// //     const courseId = params?.courseId || '';

// //     // State for managing filters and search
// //     const [filters, setFilters] = useState<ClassFilterOptions>({});
// //     const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
// //     const [searchTerm, setSearchTerm] = useState("");
    
// //     // Hooks for fetching data
// //     const { getClasses, assignClass, unassignClass } = useClasses();
// //     const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

// //     const courseQuery = useCourseById(courseId);
// //     const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
// //     const classesQuery = getClasses(filters);

// //     // ✅ FIX: This hook now normalizes all data to use a consistent `.id` property.
// //     const { assigned, available } = useMemo(() => {
// //         const allSystemClasses = classesQuery.data || [];
        
// //         // Normalize the assigned classes to ensure they have a consistent `.id` property.
// //         const normalizedAssigned = (courseQuery.data?.classes || []).map(c => ({
// //             ...c,
// //             id: c.id || c._id 
// //         }));

// //         const assignedIds = new Set(normalizedAssigned.map(c => c.id));
// //         const availableClasses = allSystemClasses.filter(c => !assignedIds.has(c.id));
        
// //         const lowerCaseSearchTerm = searchTerm.toLowerCase();
// //         if (!searchTerm) {
// //             return { assigned: normalizedAssigned, available: availableClasses };
// //         }

// //         const searchedAssigned = normalizedAssigned.filter(c => (c.title || '').toLowerCase().includes(lowerCaseSearchTerm));
// //         const searchedAvailable = availableClasses.filter(c => (c.title || '').toLowerCase().includes(lowerCaseSearchTerm));

// //         return { assigned: searchedAssigned, available: searchedAvailable };

// //     }, [courseQuery.data, classesQuery.data, searchTerm]);


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
    
// //     const handleAssignClick = (classId: string | null | undefined) => {
// //       if (!courseId || !classId) {
// //         toast.error("Cannot assign class due to a missing ID.");
// //         return;
// //       }
// //       assignClass.mutate({ courseId, classId });
// //     };

// //     const handleUnassignClick = (classId: string | null | undefined) => {
// //         if (!courseId || !classId) {
// //             toast.error("Cannot unassign class due to a missing ID.");
// //             return;
// //         }
// //         unassignClass.mutate({ courseId, classId });
// //     };

// //     if (courseQuery.isLoading) {
// //         return <Skeleton className="h-screen w-full" />;
// //     }

// //     return (
// //         <div className="space-y-6">
// //             <h1 className="text-2xl font-bold">
// //                 Assign Classes to: <span className="text-primary">{courseQuery.data?.title}</span>
// //             </h1>

// //             <Tabs defaultValue="available">
// //                 <TabsList className="grid w-full grid-cols-2">
// //                     <TabsTrigger value="available">Available Classes</TabsTrigger>
// //                     <TabsTrigger value="assigned">Assigned Classes ({assigned.length})</TabsTrigger>
// //                 </TabsList>
                
// //                 <TabsContent value="available">
// //                     <Card>
// //                         <CardHeader>
// //                             <CardTitle>Browse Available Classes</CardTitle>
// //                             <CardDescription>
// //                                 Showing {available.length} available classes.
// //                             </CardDescription>
// //                         </CardHeader>
// //                         <CardContent className="space-y-4">
// //                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                                 <Select onValueChange={handleMainCategoryChange}>
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
// //                                     <Input placeholder="Search available classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
// //                                 </div>
// //                             </div>
// //                             <Table>
// //                                 <TableHeader>
// //                                     <TableRow>
// //                                         <TableHead>Image</TableHead>
// //                                         <TableHead>Class Details</TableHead>
// //                                         <TableHead>Teacher</TableHead>
// //                                         <TableHead>Action</TableHead>
// //                                     </TableRow>
// //                                 </TableHeader>
// //                                 <TableBody>
// //                                     {classesQuery.isLoading ? (
// //                                         <TableRow><TableCell colSpan={4}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
// //                                     ) : available.length === 0 ? (
// //                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No available classes found.</TableCell></TableRow>
// //                                     ) : (
// //                                         available.map((classItem) => (
// //                                           <TableRow key={classItem.id}>
// //                                                 <TableCell><img src={classItem.image || 'https://via.placeholder.com/100x60.png?text=Class'} alt={classItem.title} className="w-24 h-16 object-cover rounded-md bg-gray-100" /></TableCell>
// //                                                 <TableCell className="font-medium">{classItem.title}</TableCell>
// //                                                 <TableCell>{classItem.teacherName}</TableCell>
// //                                                 <TableCell>
// //                                                     <Button size="sm" onClick={() => handleAssignClick(classItem.id)} disabled={assignClass.isPending}><LinkIcon className="h-4 w-4 mr-2" />Assign</Button>
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
// //                         <CardHeader><CardTitle>Assigned Classes Configuration</CardTitle></CardHeader>
// //                         <CardContent className="space-y-4">
// //                              <div className="relative md:w-1/3">
// //                                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                                 <Input placeholder="Search assigned classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
// //                             </div>
// //                             <Table>
// //                                 <TableHeader>
// //                                     <TableRow>
// //                                         <TableHead>Class</TableHead>
// //                                         <TableHead>Status</TableHead>
// //                                         <TableHead>Actions</TableHead>
// //                                     </TableRow>
// //                                 </TableHeader>
// //                                 <TableBody>
// //                                      {courseQuery.isLoading ? (
// //                                         <TableRow><TableCell colSpan={3}><Skeleton className="h-16 w-full" /></TableCell></TableRow>
// //                                      ) : assigned.length === 0 ? (
// //                                         <TableRow><TableCell colSpan={3} className="text-center h-24">No classes assigned yet.</TableCell></TableRow>
// //                                     ) : (
// //                                         assigned.map((classItem) => (
// //                                             <TableRow key={classItem.id}>
// //                                                 <TableCell className="flex items-center gap-2">
// //                                                     <img src={classItem.image || 'https://via.placeholder.com/100x60.png?text=Class'} alt={classItem.title} className="w-16 h-12 object-cover rounded-md bg-gray-100" />
// //                                                     <span className="font-medium">{classItem.title}</span>
// //                                                 </TableCell>
// //                                                 <TableCell><Badge variant={classItem.status === 'active' ? 'success' : 'destructive'}>{classItem.status}</Badge></TableCell>
// //                                                 <TableCell>
// //                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(classItem.id)} disabled={unassignClass.isPending}><Trash2 className="h-4 w-4 mr-2" />Unassign</Button>
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
// import { useClasses, type Class, type ClassFilterOptions } from '@/hooks/use-classes';
// import { useCourses } from '@/hooks/use-courses';
// import { toast } from "sonner";

// // Import UI components
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Search, Link as LinkIcon, Trash2 } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Checkbox } from "@/components/ui/checkbox";

// export default function AssignClassPage() {
//     const [, params] = useRoute("/courses/assign-class/:courseId");
//     const courseId = params?.courseId || '';

//     // State for managing filters and search
//     const [filters, setFilters] = useState<ClassFilterOptions>({});
//     const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set()); // ✅ 2. State for selected classes

    
//     // Hooks for fetching data
//     const { getClasses, assignClass, unassignClass,assignMultipleClasses } = useClasses();
//     const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

//     const courseQuery = useCourseById(courseId);
//     const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
//     const classesQuery = getClasses(filters);

//     // ✅ FIX: Filter out invalid data before normalizing and mapping.
//     const { assigned, available } = useMemo(() => {
//         const allSystemClasses = classesQuery.data || [];
        
//         // 1. First, filter the assigned classes to ensure they have a valid ID.
//         // This prevents items without an 'id' or '_id' from ever being processed.
//         const validAssignedClasses = (courseQuery.data?.classes || [])
//             .filter(c => c && (c.id || c._id));

//         // 2. Now, normalize the filtered, valid classes to have a consistent `.id` property.
//         const normalizedAssigned = validAssignedClasses.map(c => ({
//             ...c,
//             id: c.id || c._id 
//         }));

//         const assignedIds = new Set(normalizedAssigned.map(c => c.id));
//         const availableClasses = allSystemClasses.filter(c => c && !assignedIds.has(c.id));
        
//         const lowerCaseSearchTerm = searchTerm.toLowerCase();
//         if (!searchTerm) {
//             return { assigned: normalizedAssigned, available: availableClasses };
//         }

//         const searchedAssigned = normalizedAssigned.filter(c => (c.title || '').toLowerCase().includes(lowerCaseSearchTerm));
//         const searchedAvailable = availableClasses.filter(c => (c.title || '').toLowerCase().includes(lowerCaseSearchTerm));

//         return { assigned: searchedAssigned, available: searchedAvailable };

//     }, [courseQuery.data, classesQuery.data, searchTerm]);


//     // Event Handlers
//     const handleMainCategoryChange = (value: string) => {
//         const mainCategoryId = value === "all" ? undefined : value;
//         setSelectedMainCategory(mainCategoryId);
//         setFilters({ mainCategoryId, categoryId: undefined });
//     };
//     const handleSelectClass = (classId: string) => {
//         setSelectedClasses(prev => {
//             const newSelection = new Set(prev);
//             if (newSelection.has(classId)) {
//                 newSelection.delete(classId);
//             } else {
//                 newSelection.add(classId);
//             }
//             return newSelection;
//         });
//     };
//     const handleAssignSelected = () => {
//         if (!courseId || selectedClasses.size === 0) {
//             toast.error("No classes selected or course ID is missing.");
//             return;
//         }
//         const classIds = Array.from(selectedClasses);
//         assignMultipleClasses.mutate({ courseId, classIds }, {
//             onSuccess: () => {
//                 setSelectedClasses(new Set()); // Clear selection on success
//             }
//         });
//     };

//     const handleCategoryChange = (value: string) => {
//         const categoryId = value === "all" ? undefined : value;
//         setFilters(prev => ({ ...prev, categoryId }));
//     };
    
//     const handleAssignClick = (classId: string | null | undefined) => {
//       if (!courseId || !classId) {
//         toast.error("Cannot assign class due to a missing ID.");
//         return;
//       }
//       assignClass.mutate({ courseId, classId });
//     };

//     const handleUnassignClick = (classId: string | null | undefined) => {
//         if (!courseId || !classId) {
//             toast.error("Cannot unassign class due to a missing ID.");
//             return;
//         }
//         unassignClass.mutate({ courseId, classId });
//     };

//     if (courseQuery.isLoading) {
//         return <Skeleton className="h-screen w-full" />;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">
//                 Assign Classes to: <span className="text-primary">{courseQuery.data?.title}</span>
//             </h1>

//             <Tabs defaultValue="available">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="available">Available Classes</TabsTrigger>
//                     <TabsTrigger value="assigned">Assigned Classes ({assigned.length})</TabsTrigger>
//                 </TabsList>
                
//                 <TabsContent value="available">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Browse Available Classes</CardTitle>
//                             <CardDescription>
//                                 Showing {available.length} available classes.
//                             </CardDescription>
//                             {selectedClasses.size > 0 && (
//                                     <Button onClick={handleAssignSelected} disabled={assignMultipleClasses?.isPending}>
//                                         <LinkIcon className="h-4 w-4 mr-2" />
//                                         Assign Selected ({selectedClasses.size})
//                                     </Button>
//                                 )}
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <Select onValueChange={handleMainCategoryChange}>
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
//                                     <Input placeholder="Search available classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                                 </div>
//                             </div>
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow>
//                                     <TableHead className="w-12">
//                                             <Checkbox
//                                                 checked={available.length > 0 && selectedClasses.size === available.length}
//                                                 onCheckedChange={handleSelectAll}
//                                                 aria-label="Select all"
//                                             />
//                                         </TableHead>
//                                         <TableHead>Image</TableHead>
//                                         <TableHead>Class Details</TableHead>
//                                         <TableHead>Teacher</TableHead>
//                                         <TableHead>Action</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {classesQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={4}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
//                                     ) : available.length === 0 ? (
//                                         <TableRow><TableCell colSpan={4} className="text-center h-24">No available classes found.</TableCell></TableRow>
//                                     ) : (
//                                         available.map((classItem) => (
//                                           <TableRow key={classItem.id}>
//                                             <TableCell>
//                                                     <Checkbox
//                                                         checked={selectedClasses.has(classItem.id)}
//                                                         onCheckedChange={() => handleSelectClass(classItem.id)}
//                                                         aria-label="Select row"
//                                                     />
//                                                 </TableCell>
//                                                 <TableCell><img src={classItem.image || 'https://via.placeholder.com/100x60.png?text=Class'} alt={classItem.title} className="w-24 h-16 object-cover rounded-md bg-gray-100" /></TableCell>
//                                                 <TableCell className="font-medium">{classItem.title}</TableCell>
//                                                 <TableCell>{classItem.teacherName}</TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" onClick={() => handleAssignClick(classItem.id)} disabled={assignClass.isPending}><LinkIcon className="h-4 w-4 mr-2" />Assign</Button>
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
//                         <CardHeader><CardTitle>Assigned Classes Configuration</CardTitle></CardHeader>
//                         <CardContent className="space-y-4">
//                              <div className="relative md:w-1/3">
//                                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                                 <Input placeholder="Search assigned classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                             </div>
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow>
//                                         <TableHead>Class</TableHead>
//                                         <TableHead>Status</TableHead>
//                                         <TableHead>Actions</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                      {courseQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={3}><Skeleton className="h-16 w-full" /></TableCell></TableRow>
//                                      ) : assigned.length === 0 ? (
//                                         <TableRow><TableCell colSpan={3} className="text-center h-24">No classes assigned yet.</TableCell></TableRow>
//                                     ) : (
//                                         assigned.map((classItem) => (
//                                             <TableRow key={classItem.id}>
//                                                 <TableCell className="flex items-center gap-2">
//                                                     <img src={classItem.image || 'https://via.placeholder.com/100x60.png?text=Class'} alt={classItem.title} className="w-16 h-12 object-cover rounded-md bg-gray-100" />
//                                                     <span className="font-medium">{classItem.title}</span>
//                                                 </TableCell>
//                                                 <TableCell><Badge variant={classItem.status === 'active' ? 'success' : 'destructive'}>{classItem.status}</Badge></TableCell>
//                                                 <TableCell>
//                                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(classItem.id)} disabled={unassignClass.isPending}><Trash2 className="h-4 w-4 mr-2" />Unassign</Button>
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
// import { useClasses, type Class, type ClassFilterOptions } from '@/hooks/use-classes';
// import { useCourses } from '@/hooks/use-courses';
// import { toast } from "sonner";

// // Import UI components
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Search, Link as LinkIcon, Trash2 } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Checkbox } from "@/components/ui/checkbox";

// export default function AssignClassPage() {
//     const [, params] = useRoute("/courses/assign-class/:courseId");
//     const courseId = params?.courseId || '';

//     // State
//     const [filters, setFilters] = useState<ClassFilterOptions>({});
//     const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
    
//     // Hooks
//     const { getClasses, assignClass, unassignClass, assignMultipleClasses } = useClasses();
//     const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

//     const courseQuery = useCourseById(courseId);
//     const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
//     const classesQuery = getClasses(filters);

//     const { assigned, available } = useMemo(() => {
//         const allSystemClasses = classesQuery.data || [];
//         const validAssignedClasses = (courseQuery.data?.classes || []).filter(c => c && (c.id || c._id));
//         const normalizedAssigned = validAssignedClasses.map(c => ({ ...c, id: c.id || c._id }));
//         const assignedIds = new Set(normalizedAssigned.map(c => c.id));
//         const availableClasses = allSystemClasses.filter(c => c && c.id && !assignedIds.has(c.id));
        
//         if (!searchTerm) {
//             return { assigned: normalizedAssigned, available: availableClasses };
//         }
//         const lowerCaseSearchTerm = searchTerm.toLowerCase();
//         const searchedAssigned = normalizedAssigned.filter(c => (c.title || '').toLowerCase().includes(lowerCaseSearchTerm));
//         const searchedAvailable = availableClasses.filter(c => (c.title || '').toLowerCase().includes(lowerCaseSearchTerm));
//         return { assigned: searchedAssigned, available: searchedAvailable };
//     }, [courseQuery.data, classesQuery.data, searchTerm]);

//     // --- Event Handlers ---
//     const handleMainCategoryChange = (value: string) => {
//         const mainCategoryId = value === "all" ? undefined : value;
//         setSelectedMainCategory(mainCategoryId);
//         setFilters({ mainCategoryId, categoryId: undefined });
//     };

//     const handleCategoryChange = (value: string) => {
//         const categoryId = value === "all" ? undefined : value;
//         setFilters(prev => ({ ...prev, categoryId }));
//     };

//     const handleSelectClass = (classId: string) => {
//         setSelectedClasses(prev => {
//             const newSelection = new Set(prev);
//             if (newSelection.has(classId)) {
//                 newSelection.delete(classId);
//             } else {
//                 newSelection.add(classId);
//             }
//             return newSelection;
//         });
//     };
    
//     // ✅ ADDED THIS MISSING FUNCTION
//     const handleSelectAll = () => {
//         if (selectedClasses.size === available.length) {
//             setSelectedClasses(new Set());
//         } else {
//             setSelectedClasses(new Set(available.map(c => c.id)));
//         }
//     };

//     const handleAssignSelected = () => {
//         if (!courseId || selectedClasses.size === 0) {
//             toast.error("No classes selected or course ID is missing.");
//             return;
//         }
//         const classIds = Array.from(selectedClasses);
//         assignMultipleClasses.mutate({ courseId, classIds }, {
//             onSuccess: () => {
//                 setSelectedClasses(new Set());
//             }
//         });
//     };
    
//     const handleAssignClick = (classId: string | null | undefined) => {
//       if (!courseId || !classId) {
//         toast.error("Cannot assign class due to a missing ID.");
//         return;
//       }
//       assignClass.mutate({ courseId, classId });
//     };

//     const handleUnassignClick = (classId: string | null | undefined) => {
//         if (!courseId || !classId) {
//             toast.error("Cannot unassign class due to a missing ID.");
//             return;
//         }
//         unassignClass.mutate({ courseId, classId });
//     };

//     if (courseQuery.isLoading) {
//         return <Skeleton className="h-screen w-full" />;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">
//                 Assign Classes to: <span className="text-primary">{courseQuery.data?.title}</span>
//             </h1>

//             <Tabs defaultValue="available">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="available">Available Classes ({available.length})</TabsTrigger>
//                     <TabsTrigger value="assigned">Assigned Classes ({assigned.length})</TabsTrigger>
//                 </TabsList>
                
//                 <TabsContent value="available">
//                     <Card>
//                         <CardHeader>
//                             <div className="flex justify-between items-start">
//                                 <div>
//                                     <CardTitle>Browse Available Classes</CardTitle>
//                                     <CardDescription>Select classes to assign to the course.</CardDescription>
//                                 </div>
//                                 {selectedClasses.size > 0 && (
//                                     <Button onClick={handleAssignSelected} disabled={assignMultipleClasses?.isPending}>
//                                         <LinkIcon className="h-4 w-4 mr-2" />
//                                         Assign Selected ({selectedClasses.size})
//                                     </Button>
//                                 )}
//                             </div>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <Select onValueChange={handleMainCategoryChange}>
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
//                                     <Input placeholder="Search available classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//                                 </div>
//                             </div>
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow>
//                                         <TableHead className="w-12">
//                                             <Checkbox
//                                                 checked={available.length > 0 && selectedClasses.size === available.length}
//                                                 onCheckedChange={handleSelectAll}
//                                                 aria-label="Select all"
//                                             />
//                                         </TableHead>
//                                         <TableHead>Image</TableHead>
//                                         <TableHead>Class Details</TableHead>
//                                         <TableHead>Teacher</TableHead>
//                                         <TableHead className="text-right">Action</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {classesQuery.isLoading ? (
//                                         <TableRow><TableCell colSpan={5}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
//                                     ) : available.length === 0 ? (
//                                         <TableRow><TableCell colSpan={5} className="text-center h-24">No available classes found.</TableCell></TableRow>
//                                     ) : (
//                                         available.map((classItem) => (
//                                           <TableRow key={classItem.id} data-state={selectedClasses.has(classItem.id) && "selected"}>
//                                             <TableCell>
//                                                 <Checkbox
//                                                     checked={selectedClasses.has(classItem.id)}
//                                                     onCheckedChange={() => handleSelectClass(classItem.id)}
//                                                     aria-label="Select row"
//                                                 />
//                                             </TableCell>
//                                             <TableCell><img src={classItem.image || 'https://via.placeholder.com/100x60.png?text=Class'} alt={classItem.title} className="w-24 h-16 object-cover rounded-md bg-gray-100" /></TableCell>
//                                             <TableCell className="font-medium">{classItem.title}</TableCell>
//                                             <TableCell>{classItem.teacherName}</TableCell>
//                                             <TableCell className="text-right">
//                                                 <Button size="sm" onClick={() => handleAssignClick(classItem.id)} disabled={assignClass.isPending}><LinkIcon className="h-4 w-4 mr-2" />Assign</Button>
//                                             </TableCell>
//                                           </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="assigned">
//                 <Card>
//         <CardHeader><CardTitle>Assigned Classes Configuration</CardTitle></CardHeader>
//         <CardContent className="space-y-4">
//              <div className="relative md:w-1/3">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input placeholder="Search assigned classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//             </div>
//             <Table>
//                 <TableHeader>
//                     <TableRow>
//                         <TableHead>Class</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                      {courseQuery.isLoading ? (
//                         <TableRow><TableCell colSpan={3}><Skeleton className="h-16 w-full" /></TableCell></TableRow>
//                      ) : assigned.length === 0 ? (
//                         <TableRow><TableCell colSpan={3} className="text-center h-24">No classes assigned yet.</TableCell></TableRow>
//                     ) : (
//                         assigned.map((classItem) => (
//                             <TableRow key={classItem.id}>
//                                 <TableCell className="flex items-center gap-2">
//                                     <img src={classItem.image || 'https://via.placeholder.com/100x60.png?text=Class'} alt={classItem.title} className="w-16 h-12 object-cover rounded-md bg-gray-100" />
//                                     <span className="font-medium">{classItem.title}</span>
//                                 </TableCell>
//                                 <TableCell>
//                                     <Badge variant={classItem.status === 'active' ? 'default' : 'destructive'}>{classItem.status}</Badge>
//                                 </TableCell>
//                                 <TableCell className="text-right">
//                                     <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(classItem.id)} disabled={unassignClass.isPending}>
//                                         <Trash2 className="h-4 w-4 mr-2" />Unassign
//                                     </Button>
//                                 </TableCell>
//                             </TableRow>
//                         ))
//                     )}
//                 </TableBody>
//             </Table>
//         </CardContent>
//     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// } 
"use client";

import { useState, useMemo } from 'react';
import { useRoute } from 'wouter';
import { useClasses, type Class, type ClassFilterOptions } from '@/hooks/use-classes';
import { useCourses } from '@/hooks/use-courses';
import { toast } from "sonner";

// Import UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export default function AssignClassPage() {
    const [, params] = useRoute("/courses/assign-class/:courseId");
    const courseId = params?.courseId || '';

    // State
    const [filters, setFilters] = useState<ClassFilterOptions>({});
    const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
    const [selectedAssignedClasses, setSelectedAssignedClasses] = useState<Set<string>>(new Set());

    // Hooks
    const { getClasses, assignClass, unassignClass, assignMultipleClasses, unassignMultipleClasses } = useClasses();
    const { mainCategories, getCategoriesByMainCategory, useCourseById } = useCourses();

    const courseQuery = useCourseById(courseId);
    const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);
    const classesQuery = getClasses(filters);

    const { assigned, available } = useMemo(() => {
        const allSystemClasses = classesQuery.data || [];
        const validAssignedClasses = (courseQuery.data?.classes || []).filter(c => c && (c.id || c._id));
        const normalizedAssigned = validAssignedClasses.map(c => ({ ...c, id: c.id || c._id }));
        const assignedIds = new Set(normalizedAssigned.map(c => c.id));
        const availableClasses = allSystemClasses.filter(c => c && c.id && !assignedIds.has(c.id));
        
        if (!searchTerm) {
            return { assigned: normalizedAssigned, available: availableClasses };
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const searchedAssigned = normalizedAssigned.filter(c => (c.title || '').toLowerCase().includes(lowerCaseSearchTerm));
        const searchedAvailable = availableClasses.filter(c => (c.title || '').toLowerCase().includes(lowerCaseSearchTerm));
        
        return { assigned: searchedAssigned, available: searchedAvailable };
    }, [courseQuery.data, classesQuery.data, searchTerm]);

    // --- Event Handlers ---
    const handleMainCategoryChange = (value: string) => {
        const mainCategoryId = value === "all" ? undefined : value;
        setSelectedMainCategory(mainCategoryId);
        setFilters({ mainCategoryId, categoryId: undefined });
    };

    const handleCategoryChange = (value: string) => {
        const categoryId = value === "all" ? undefined : value;
        setFilters(prev => ({ ...prev, categoryId }));
    };

    const handleSelectClass = (classId: string) => {
        setSelectedClasses(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(classId)) newSelection.delete(classId);
            else newSelection.add(classId);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedClasses.size === available.length) setSelectedClasses(new Set());
        else setSelectedClasses(new Set(available.map(c => c.id)));
    };

    const handleAssignSelected = () => {
        if (!courseId || selectedClasses.size === 0) return;
        const classIds = Array.from(selectedClasses);
        assignMultipleClasses.mutate({ courseId, classIds }, {
            onSuccess: () => setSelectedClasses(new Set()),
        });
    };
    
    const handleSelectAssignedClass = (classId: string) => {
        setSelectedAssignedClasses(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(classId)) newSelection.delete(classId);
            else newSelection.add(classId);
            return newSelection;
        });
    };

    const handleSelectAllAssigned = () => {
        if (selectedAssignedClasses.size === assigned.length) setSelectedAssignedClasses(new Set());
        else setSelectedAssignedClasses(new Set(assigned.map(c => c.id)));
    };

    const handleUnassignSelected = () => {
        if (!courseId || selectedAssignedClasses.size === 0) return;
        const classIds = Array.from(selectedAssignedClasses);
        unassignMultipleClasses.mutate({ courseId, classIds }, {
            onSuccess: () => setSelectedAssignedClasses(new Set()),
        });
    };

    const handleAssignClick = (classId: string) => {
        if (!courseId || !classId) return toast.error("Missing ID");
        assignClass.mutate({ courseId, classId });
    };

    const handleUnassignClick = (classId: string) => {
        if (!courseId || !classId) return toast.error("Missing ID");
        unassignClass.mutate({ courseId, classId });
    };

    if (courseQuery.isLoading) {
        return <Skeleton className="h-screen w-full" />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">
                Assign Classes to: <span className="text-primary">{courseQuery.data?.title}</span>
            </h1>

            <Tabs defaultValue="available">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">Available Classes ({available.length})</TabsTrigger>
                    <TabsTrigger value="assigned">Assigned Classes ({assigned.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="available">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Browse Available Classes</CardTitle>
                                    <CardDescription>Select classes to assign to the course.</CardDescription>
                                </div>
                                {selectedClasses.size > 0 && (
                                    <Button onClick={handleAssignSelected} disabled={assignMultipleClasses?.isPending}>
                                        <LinkIcon className="h-4 w-4 mr-2" />
                                        Assign Selected ({selectedClasses.size})
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select onValueChange={handleMainCategoryChange}>
                                    <SelectTrigger><SelectValue placeholder="Filter by Main Category" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Main Categories</SelectItem>
                                        {mainCategories?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.mainCategoryName}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery.isLoading}>
                                    <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categoriesQuery.data?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search available classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={available.length > 0 && selectedClasses.size === available.length}
                                                onCheckedChange={handleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Class Details</TableHead>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classesQuery.isLoading ? (
                                        <TableRow><TableCell colSpan={5}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
                                    ) : available.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">No available classes found.</TableCell></TableRow>
                                    ) : (
                                        available.map((classItem) => (
                                          <TableRow key={classItem.id} data-state={selectedClasses.has(classItem.id) ? "selected" : ""}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedClasses.has(classItem.id)}
                                                    onCheckedChange={() => handleSelectClass(classItem.id)}
                                                    aria-label="Select row"
                                                />
                                            </TableCell>
                                            <TableCell><img src={classItem.image || 'https://via.placeholder.com/100x60.png?text=Class'} alt={classItem.title} className="w-24 h-16 object-cover rounded-md bg-gray-100" /></TableCell>
                                            <TableCell className="font-medium">{classItem.title}</TableCell>
                                            <TableCell>{classItem.teacherName}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleAssignClick(classItem.id)} disabled={assignClass.isPending}><LinkIcon className="h-4 w-4 mr-2" />Assign</Button>
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
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Assigned Classes Configuration</CardTitle>
                                    <CardDescription>Select classes to unassign from the course.</CardDescription>
                                </div>
                                {selectedAssignedClasses.size > 0 && (
                                    <Button variant="destructive" onClick={handleUnassignSelected} disabled={unassignMultipleClasses?.isPending}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Unassign Selected ({selectedAssignedClasses.size})
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="relative md:w-1/3">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search assigned classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={assigned.length > 0 && selectedAssignedClasses.size === assigned.length}
                                                onCheckedChange={handleSelectAllAssigned}
                                                aria-label="Select all assigned"
                                            />
                                        </TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {courseQuery.isLoading ? (
                                        <TableRow><TableCell colSpan={4}><Skeleton className="h-16 w-full" /></TableCell></TableRow>
                                     ) : assigned.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center h-24">No classes assigned yet.</TableCell></TableRow>
                                    ) : (
                                        assigned.map((classItem) => (
                                            <TableRow key={classItem.id} data-state={selectedAssignedClasses.has(classItem.id) ? "selected" : ""}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedAssignedClasses.has(classItem.id)}
                                                        onCheckedChange={() => handleSelectAssignedClass(classItem.id)}
                                                        aria-label="Select assigned row"
                                                    />
                                                </TableCell>
                                                <TableCell className="flex items-center gap-2">
                                                    <img src={classItem.image || 'https://via.placeholder.com/100x60.png?text=Class'} alt={classItem.title} className="w-16 h-12 object-cover rounded-md bg-gray-100" />
                                                    <span className="font-medium">{classItem.title}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={classItem.status === 'active' ? 'default' : 'destructive'}>{classItem.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="destructive" onClick={() => handleUnassignClick(classItem.id)} disabled={unassignClass.isPending}>
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