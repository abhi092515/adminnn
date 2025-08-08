// "use client";

// import { useState, useRef, useMemo } from "react";
// import { Link, useLocation } from "wouter";
// import { Plus, Search, Edit, Users, Loader2, ArrowUpDown, FileText } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useCourses, type FilterOptions, type Course } from "@/hooks/use-courses";
// import { useToast } from "@/hooks/use-toast";

// export default function CoursesPage() {
//   const [, setLocation] = useLocation();
//   const [filters, setFilters] = useState<FilterOptions>({});
//   const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
//   const [searchTerm, setSearchTerm] = useState("");
//   const searchTimeout = useRef<NodeJS.Timeout>();
//   const { toast } = useToast();
//   const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

//   const {
//     mainCategories,
//     isLoadingMainCategories,
//     getCategoriesByMainCategory,
//     getCourses,
//     toggleCourseStatus,
//   } = useCourses();

//   const coursesQuery = getCourses();
//   const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);

//   const processedCourses = useMemo(() => {
//     // ✅ FIX: Use optional chaining to safely access .data and provide a fallback.
//     const courses = coursesQuery?.data || [];
    
//     let filtered = courses;
//     if (filters.mainCategoryId) filtered = filtered.filter(c => c.mainCategory?.id === filters.mainCategoryId);
//     if (filters.categoryId) filtered = filtered.filter(c => c.category?.id === filters.categoryId);
//     if (filters.search) filtered = filtered.filter(c => c.title.toLowerCase().includes(filters.search!.toLowerCase()));
    
//     // Sort the filtered list
//     const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
//     if (sortOrder === 'desc') {
//       return sorted.reverse();
//     }
//     return sorted;
//     // ✅ FIX: Use optional chaining in the dependency array as well.
//   }, [coursesQuery?.data, filters, sortOrder]);

//   const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
//   const handleSearch = (value: string) => { setSearchTerm(value); if (searchTimeout.current) clearTimeout(searchTimeout.current); searchTimeout.current = setTimeout(() => { setFilters(prev => ({ ...prev, search: value || undefined })); }, 500); };
//   const handleMainCategoryChange = (value: string) => { const mainCategoryId = value === "all" ? undefined : value; setSelectedMainCategory(mainCategoryId); setFilters(prev => ({ mainCategoryId, categoryId: undefined, search: prev.search })); };
//   const handleCategoryChange = (value: string) => { const categoryId = value === "all" ? undefined : value; setFilters(prev => ({ ...prev, categoryId })); };

//   const handleToggleStatus = (course: Course) => {
//     setUpdatingStatusId(course.id);
//     const newStatus = course.status === 'active' ? 'inactive' : 'active';
//     toggleCourseStatus.mutate(
//       { courseId: course.id, status: newStatus },
//       {
//         onSuccess: () => toast({ title: "Success", description: "Status updated." }),
//         onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
//         onSettled: () => setUpdatingStatusId(null),
//       }
//     );
//   };

//   const handleAssignClass = (courseId: string) => {
//     setLocation(`/courses/assign-class/${courseId}`);
//   };

//   const handleAssignPdf = (courseId: string) => {
//     setLocation(`/courses/assign-pdf/${courseId}`);
//   };

//   if (isLoadingMainCategories) {
//     return (
//       <div className="space-y-6">
//         <Skeleton className="h-8 w-48" />
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {Array.from({ length: 3 }).map((_, i) => ( <Skeleton key={i} className="h-10" /> ))}
//         </div>
//         <Skeleton className="h-96" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Courses</h1>
//         <Link href="/courses/new">
//           <Button><Plus className="h-4 w-4 mr-2" />Add New Course</Button>
//         </Link>
//       </div>

//       <Card>
//         <CardHeader className="pb-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Select onValueChange={handleMainCategoryChange}>
//               <SelectTrigger><SelectValue placeholder="Select Main Category" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Main Categories</SelectItem>
//                 {mainCategories?.map((category: any) => (
//                   <SelectItem key={category.id} value={category.id}>
//                     {category.mainCategoryName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery?.isLoading}>
//               <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Categories</SelectItem>
//                 {categoriesQuery?.data?.map((category: any) => (
//                   <SelectItem key={category.id} value={category.id}>
//                     {category.categoryName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <Input placeholder="Search by title..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10" />
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       <Card>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-24">
//                   <Button variant="ghost" size="sm" onClick={toggleSortOrder}>
//                     Title <ArrowUpDown className="h-4 w-4 ml-2" />
//                   </Button>
//                 </TableHead>
//                 <TableHead className="w-24">Banner</TableHead>
//                 <TableHead>Faculty</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead className="w-24">Status</TableHead>
//                 <TableHead className="w-48 text-center">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {/* ✅ FIX: Use optional chaining to safely access 'isLoading'. */}
//               {coursesQuery?.isLoading ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <TableRow key={i}>
//                     <TableCell><Skeleton className="h-4 w-48" /></TableCell>
//                     <TableCell><Skeleton className="h-12 w-16" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-32" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-32" /></TableCell>
//                     <TableCell><Skeleton className="h-6 w-16" /></TableCell>
//                     <TableCell><Skeleton className="h-8 w-24" /></TableCell>
//                   </TableRow>
//                 ))
//               ) :
//                 processedCourses.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center py-8 text-gray-500">
//                       No courses found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   processedCourses.map((course: Course) => (
//                     <TableRow key={course.id}>
//                       <TableCell className="font-medium">{course.title}</TableCell>
//                       <TableCell>
//                         <img src={course.banner || 'https://via.placeholder.com/64x48.png?text=No+Img'} alt="Course banner" className="w-16 h-12 object-cover rounded" />
//                       </TableCell>
//                       <TableCell>
//                         {course.facultyDetails?.name || 'N/A'}
//                       </TableCell>
//                       <TableCell>
//                         {course.category?.categoryName || 'N/A'}
//                       </TableCell>
//                       <TableCell>
//                         {updatingStatusId === course.id ? (
//                            <Badge variant="secondary" className="flex items-center justify-center w-28 text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</Badge>
//                         ) : (
//                           <Badge onClick={() => handleToggleStatus(course)} variant={course.status === "active" ? "default" : "destructive"} className="cursor-pointer w-20 justify-center">
//                             {course.status}
//                           </Badge>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex space-x-2">
//                           <Link href={`/courses/edit/${course.id}`}>
//                             <Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
//                           </Link>
//                           <Button variant="ghost" size="sm" onClick={() => handleAssignClass(course.id)}>
//                             <Users className="h-4 w-4 mr-1" /> Assign Class
//                           </Button>
//                           <Button variant="ghost" size="sm" onClick={() => handleAssignPdf(course.id)}>
//                             <FileText className="h-4 w-4 mr-1" /> Assign PDF
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useState, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Plus, Search, Edit, Users, Loader2, ArrowUpDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
// ✅ CHANGED: Import the specific hooks needed
import { 
  useCourses, 
  useMainCategories, 
  useCategoriesByMainCategory,
  useCourseMutations,
  type FilterOptions, 
  type Course 
} from "@/hooks/use-courses";
import { useToast } from "@/hooks/use-toast";

export default function CoursesPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ✅ CHANGED: Call the correct, separated hooks directly
  const { data: mainCategories, isLoading: isLoadingMainCategories } = useMainCategories();
  const { data: courses, isLoading: isLoadingCourses } = useCourses();
  const { data: categories, isLoading: isLoadingCategories } = useCategoriesByMainCategory(selectedMainCategory);
  const { toggleCourseStatus } = useCourseMutations();

  const processedCourses = useMemo(() => {
    // ✅ CHANGED: Directly use the 'courses' data from the hook
    const courseList = courses || [];
    
    let filtered = courseList;
    if (filters.mainCategoryId) filtered = filtered.filter(c => c.mainCategory?.id === filters.mainCategoryId);
    if (filters.categoryId) filtered = filtered.filter(c => c.category?.id === filters.categoryId);
    if (filters.search) filtered = filtered.filter(c => c.title.toLowerCase().includes(filters.search!.toLowerCase()));
    
    const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === 'desc') {
      return sorted.reverse();
    }
    return sorted;
    // ✅ CHANGED: Cleaned up dependency array
  }, [courses, filters, sortOrder]);

  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  const handleSearch = (value: string) => { setSearchTerm(value); if (searchTimeout.current) clearTimeout(searchTimeout.current); searchTimeout.current = setTimeout(() => { setFilters(prev => ({ ...prev, search: value || undefined })); }, 500); };
  const handleMainCategoryChange = (value: string) => { const mainCategoryId = value === "all" ? undefined : value; setSelectedMainCategory(mainCategoryId); setFilters(prev => ({ mainCategoryId, categoryId: undefined, search: prev.search })); };
  const handleCategoryChange = (value: string) => { const categoryId = value === "all" ? undefined : value; setFilters(prev => ({ ...prev, categoryId })); };

  const handleToggleStatus = (course: Course) => {
    setUpdatingStatusId(course.id);
    const newStatus = course.status === 'active' ? 'inactive' : 'active';
    toggleCourseStatus.mutate(
      { courseId: course.id, status: newStatus },
      {
        onSuccess: () => toast({ title: "Success", description: "Status updated." }),
        onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
        onSettled: () => setUpdatingStatusId(null),
      }
    );
  };

  const handleAssignClass = (courseId: string) => {
    setLocation(`/courses/assign-class/${courseId}`);
  };

  const handleAssignPdf = (courseId: string) => {
    setLocation(`/courses/assign-pdf/${courseId}`);
  };

  if (isLoadingMainCategories) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => ( <Skeleton key={i} className="h-10" /> ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link href="/courses/new">
          <Button><Plus className="h-4 w-4 mr-2" />Add New Course</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select onValueChange={handleMainCategoryChange}>
              <SelectTrigger><SelectValue placeholder="Select Main Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Main Categories</SelectItem>
                {mainCategories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.mainCategoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* ✅ CHANGED: Use the correct loading state variable */}
            <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || isLoadingCategories}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {/* ✅ CHANGED: Use the correct data variable */}
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by title..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">
                  <Button variant="ghost" size="sm" onClick={toggleSortOrder}>
                    Title <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="w-24">Banner</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-48 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* ✅ CHANGED: Use the correct loading state variable */}
              {isLoadingCourses ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-12 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) :
                processedCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  processedCourses.map((course: Course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>
                        <img src={course.banner || 'https://via.placeholder.com/64x48.png?text=No+Img'} alt="Course banner" className="w-16 h-12 object-cover rounded" />
                      </TableCell>
                      <TableCell>
                        {course.facultyDetails?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {course.category?.categoryName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {updatingStatusId === course.id ? (
                           <Badge variant="secondary" className="flex items-center justify-center w-28 text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</Badge>
                        ) : (
                          <Badge onClick={() => handleToggleStatus(course)} variant={course.status === "active" ? "default" : "destructive"} className="cursor-pointer w-20 justify-center">
                            {course.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/courses/edit/${course.id}`}>
                            <Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleAssignClass(course.id)}>
                            <Users className="h-4 w-4 mr-1" /> Assign Class
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleAssignPdf(course.id)}>
                            <FileText className="h-4 w-4 mr-1" /> Assign PDF
                          </Button>
                        </div>
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