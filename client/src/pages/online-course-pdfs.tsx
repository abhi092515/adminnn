// // src/pages/online-course-pdfs.tsx

// "use client";

// import { useState, useRef, useMemo } from "react";
// import { Link } from "wouter";
// import { Plus, Search, Download, FileText, FileSpreadsheet, Printer, Edit, ExternalLink, Loader2, ArrowUpDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useCoursePdfs, type FilterOptions, type CoursePdf } from "@/hooks/use-course-pdfs";
// import { useToast } from "@/hooks/use-toast";
// import Papa from "papaparse";

// export default function CoursePdfsPage() {
//   const [filters, setFilters] = useState<FilterOptions>({});
//   const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
//   const [searchTerm, setSearchTerm] = useState("");
//   const searchTimeout = useRef<NodeJS.Timeout>();
//   const { toast } = useToast();
//   const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // State for sorting

//   const {
//     mainCategories,
//     isLoadingMainCategories,
//     getCategoriesByMainCategory,
//     getPdfs,
//     togglePdfStatus,
//   } = useCoursePdfs();

//   const pdfsQuery = getPdfs();
//   const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);

//   const processedPdfs = useMemo(() => {
//     let pdfs = pdfsQuery.data || [];
//     if (filters.mainCategoryId) pdfs = pdfs.filter(p => p.mainCategory.id === filters.mainCategoryId);
//     if (filters.categoryId) pdfs = pdfs.filter(p => p.category.id === filters.categoryId);
//     if (filters.search) pdfs = pdfs.filter(p => p.title.toLowerCase().includes(filters.search!.toLowerCase()));

//     // Apply sorting
//     const sorted = [...pdfs]; // Create a mutable copy
//     if (sortOrder === 'desc') {
//       return sorted.reverse();
//     }
//     return sorted;
//   }, [pdfsQuery.data, filters, sortOrder]);

//   const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
//   const handleSearch = (value: string) => { setSearchTerm(value); if (searchTimeout.current) clearTimeout(searchTimeout.current); searchTimeout.current = setTimeout(() => { setFilters(prev => ({ ...prev, search: value || undefined })); }, 500); };
//   const handleMainCategoryChange = (value: string) => { const mainCategoryId = value === "all" ? undefined : value; setSelectedMainCategory(mainCategoryId); setFilters(prev => ({ mainCategoryId: mainCategoryId, categoryId: undefined, search: prev.search })); };
//   const handleCategoryChange = (value: string) => { const categoryId = value === "all" ? undefined : value; setFilters(prev => ({ ...prev, categoryId })); };

//   const handleToggleStatus = (pdf: CoursePdf) => {
//     setUpdatingStatusId(pdf.id);
//     const newStatus = pdf.status === 'active' ? 'inactive' : 'active';
//     togglePdfStatus.mutate(
//       { pdfId: pdf.id, status: newStatus },
//       {
//         onSuccess: () => toast({ title: "Success", description: "Status updated." }),
//         onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
//         onSettled: () => setUpdatingStatusId(null),
//       }
//     );
//   };

//   const handleExportToCsv = () => {
//     if (!processedPdfs || processedPdfs.length === 0) { toast({ title: "No Data", description: "There is no data to export." }); return; }
//     const dataToExport = processedPdfs.map(pdf => ({ ID: pdf.id, Title: pdf.title, Status: pdf.status, Teacher: pdf.teacherName, Category: pdf.category.categoryName, "Main Category": pdf.mainCategory.mainCategoryName, "File URL": pdf.uploadPdf, }));
//     const csv = Papa.unparse(dataToExport);
//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.setAttribute('download', 'online-course-pdfs.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     toast({ title: "Export Complete" });
//   };

//   const handlePrint = () => window.print();

//   if (isLoadingMainCategories) { return (<div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div><Skeleton className="h-64" /></div>); }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Online Course PDFs</h1>
//         <Link href="online-course-pdfs/new">
//           <Button><Plus className="h-4 w-4 mr-2" />Add New PDF</Button>
//         </Link>
//       </div>

//       <Card>
//         <CardHeader className="pb-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Select onValueChange={handleMainCategoryChange}><SelectTrigger><SelectValue placeholder="Select Main Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Main Categories</SelectItem>{mainCategories?.map((category: any) => (<SelectItem key={category.id} value={category.id}>{category.mainCategoryName}</SelectItem>))}</SelectContent></Select>
//             <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery.isLoading}><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categoriesQuery.data?.map((category: any) => (<SelectItem key={category.id} value={category.id}>{category.categoryName}</SelectItem>))}</SelectContent></Select>
//             <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search by title..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10" /></div>
//           </div>
//         </CardHeader>
//       </Card>

//       <div className="flex flex-wrap gap-2">
//         <Button variant="outline" size="sm" onClick={handleExportToCsv}><FileText className="h-4 w-4 mr-2" />CSV</Button>
//         <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
//       </div>

//       <Card>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader><TableRow>
//               <TableHead className="w-24">
//                 <div className="flex items-center">
//                   #Sno.
//                   <Button variant="ghost" size="sm" onClick={toggleSortOrder} className="ml-1">
//                     <ArrowUpDown className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </TableHead>
//               <TableHead className="w-24">Thumbnail</TableHead>
//               <TableHead>Title</TableHead>
//               <TableHead className="w-24">Status</TableHead>
//               <TableHead className="w-48">Actions</TableHead>
//             </TableRow></TableHeader>
//             <TableBody>
//               {pdfsQuery.isLoading ? (Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-4 w-8" /></TableCell><TableCell><Skeleton className="h-12 w-16" /></TableCell><TableCell><Skeleton className="h-4 w-48" /></TableCell><TableCell><Skeleton className="h-6 w-16" /></TableCell><TableCell><Skeleton className="h-8 w-32" /></TableCell></TableRow>))) :
//                 processedPdfs.length === 0 ? (<TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No course PDFs found</TableCell></TableRow>) :
//                   (processedPdfs.map((pdf: CoursePdf, index: number) => (
//                     <TableRow key={pdf.id}>
//                       <TableCell className="font-medium">{sortOrder === 'asc' ? index + 1 : processedPdfs.length - index}</TableCell>
//                       <TableCell><img src={pdf.image || "https://via.placeholder.com/64x48?text=PDF"} alt="PDF thumbnail" className="w-16 h-12 object-cover rounded" /></TableCell>
//                       <TableCell><div><p className="font-medium">{pdf.title}</p><p className="text-sm text-gray-500">By {pdf.teacherName}</p><p className="text-sm text-gray-500">Category: {pdf.category.categoryName}</p></div></TableCell>
//                       <TableCell>
//                         {updatingStatusId === pdf.id ? (<Badge variant="secondary" className="flex items-center justify-center w-28 text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</Badge>) :
//                           (<Badge onClick={() => handleToggleStatus(pdf)} variant={pdf.status === "active" ? "default" : "destructive"} className={`cursor-pointer w-20 justify-center transition-all hover:opacity-80 ${pdf.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{pdf.status}</Badge>)}
//                       </TableCell>
//                       <TableCell><div className="flex space-x-2"><Link href={`/online-course-pdfs/edit/${pdf.id}`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button></Link><a href={pdf.uploadPdf} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4 mr-1" /> View</Button></a></div></TableCell>
//                     </TableRow>
//                   )))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// } 
"use client";

import { useState, useRef, useMemo } from "react";
import { Link } from "wouter";
import { Plus, Search, Edit, ArrowUpDown, ExternalLink, Loader2, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePdfs, type FilterOptions, type CoursePdf } from "@/hooks/use-pdfs";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

export default function CoursePdfsPage() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    mainCategories,
    isLoadingMainCategories,
    getCategoriesByMainCategory,
    getPdfs,
    togglePdfStatus,
  } = usePdfs();

  // ✅ FIX: Pass the 'filters' state to the getPdfs query.
  const pdfsQuery = getPdfs(filters);
  const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);

  const processedPdfs = useMemo(() => {
    let pdfs = pdfsQuery.data || [];
    
    // ✅ FIX: Added optional chaining for safer filtering.
    if (filters.mainCategoryId) pdfs = pdfs.filter(p => p.mainCategory?.id === filters.mainCategoryId);
    if (filters.categoryId) pdfs = pdfs.filter(p => p.category?.id === filters.categoryId);
    if (filters.search) pdfs = pdfs.filter(p => p.title.toLowerCase().includes(filters.search!.toLowerCase()));

    // ✅ FIX: Improved sorting to be alphabetical by title.
    const sorted = [...pdfs].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.title.localeCompare(b.title);
        } else {
            return b.title.localeCompare(a.title);
        }
    });

    return sorted;
  }, [pdfsQuery.data, filters, sortOrder]);

  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  const handleSearch = (value: string) => { setSearchTerm(value); if (searchTimeout.current) clearTimeout(searchTimeout.current); searchTimeout.current = setTimeout(() => { setFilters(prev => ({ ...prev, search: value || undefined })); }, 500); };
  const handleMainCategoryChange = (value: string) => { const mainCategoryId = value === "all" ? undefined : value; setSelectedMainCategory(mainCategoryId); setFilters(prev => ({ mainCategoryId, categoryId: undefined, search: prev.search })); };
  const handleCategoryChange = (value: string) => { const categoryId = value === "all" ? undefined : value; setFilters(prev => ({ ...prev, categoryId })); };

  const handleToggleStatus = (pdf: CoursePdf) => {
    setUpdatingStatusId(pdf.id);
    const newStatus = pdf.status === 'active' ? 'inactive' : 'active';
    togglePdfStatus.mutate(
      { pdfId: pdf.id, status: newStatus },
      {
        onSuccess: () => toast({ title: "Success", description: "Status updated." }),
        onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
        onSettled: () => setUpdatingStatusId(null),
      }
    );
  };

  const handleExportToCsv = () => {
    if (!processedPdfs || processedPdfs.length === 0) { toast({ title: "No Data", description: "There is no data to export." }); return; }
    const dataToExport = processedPdfs.map(pdf => ({ ID: pdf.id, Title: pdf.title, Status: pdf.status, Teacher: pdf.teacherName, Category: pdf.category?.categoryName || 'N/A', "Main Category": pdf.mainCategory?.mainCategoryName || 'N/A', "File URL": pdf.uploadPdf, }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'online-course-pdfs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Complete" });
  };

  const handlePrint = () => window.print();

  if (isLoadingMainCategories) { return (<div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div><Skeleton className="h-64" /></div>); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Online Course PDFs</h1>
        <Link href="online-course-pdfs/new">
          <Button><Plus className="h-4 w-4 mr-2" />Add New PDF</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select onValueChange={handleMainCategoryChange}>
              <SelectTrigger><SelectValue placeholder="Select Main Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Main Categories</SelectItem>
                {/* ✅ FIX: Safer rendering with Array.isArray */}
                {Array.isArray(mainCategories) && mainCategories.map((category: any) => (<SelectItem key={category.id} value={category.id}>{category.mainCategoryName}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery?.isLoading}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {/* ✅ FIX: Safer rendering with Array.isArray */}
                {categoriesQuery && Array.isArray(categoriesQuery.data) && categoriesQuery.data.map((category: any) => (<SelectItem key={category.id} value={category.id}>{category.categoryName}</SelectItem>))}
              </SelectContent>
            </Select>
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search by title..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleExportToCsv}><FileText className="h-4 w-4 mr-2" />CSV</Button>
        <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-24">#Sno.</TableHead>
              <TableHead className="w-24">Thumbnail</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={toggleSortOrder}>
                  Title <ArrowUpDown className="h-4 w-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {pdfsQuery?.isLoading ? (Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-4 w-8" /></TableCell><TableCell><Skeleton className="h-12 w-16" /></TableCell><TableCell><Skeleton className="h-4 w-48" /></TableCell><TableCell><Skeleton className="h-6 w-16" /></TableCell><TableCell><Skeleton className="h-8 w-32" /></TableCell></TableRow>))) :
                processedPdfs.length === 0 ? (<TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No course PDFs found</TableCell></TableRow>) :
                  (processedPdfs.map((pdf: CoursePdf, index: number) => (
                    <TableRow key={pdf.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell><img src={pdf.image || "https://via.placeholder.com/64x48?text=PDF"} alt="PDF thumbnail" className="w-16 h-12 object-cover rounded" /></TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pdf.title}</p>
                          <p className="text-sm text-gray-500">By {pdf.teacherName}</p>
                          {/* ✅ FIX: Safer rendering for nested category data */}
                          <p className="text-sm text-gray-500">Category: {pdf.category?.categoryName || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{pdf.category?.categoryName || 'N/A'}</TableCell>
                      <TableCell>
                        {updatingStatusId === pdf.id ? (<Badge variant="secondary" className="flex items-center justify-center w-28 text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</Badge>) :
                          (<Badge onClick={() => handleToggleStatus(pdf)} variant={pdf.status === "active" ? "default" : "destructive"} className="cursor-pointer w-20 justify-center">{pdf.status}</Badge>)}
                      </TableCell>
                      <TableCell><div className="flex space-x-2"><Link href={`/online-course-pdfs/edit/${pdf.id}`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button></Link><a href={pdf.uploadPdf} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4 mr-1" /> View</Button></a></div></TableCell>
                    </TableRow>
                  )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}