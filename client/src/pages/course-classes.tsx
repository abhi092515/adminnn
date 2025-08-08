"use client";

import { useState, useRef, useMemo } from "react";
import { Link } from "wouter";
import { Plus, Search, Download, FileText, FileSpreadsheet, Printer, Edit, Play, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseClasses, type FilterOptions, type CourseClass } from "@/hooks/use-course-classes";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

export default function CourseClassesPage() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // State for sorting

  const {
    mainCategories,
    isLoadingMainCategories,
    getCategoriesByMainCategory,
    getClasses,
    goLive,
    toggleClassStatus,
  } = useCourseClasses();

  // Fetches ALL classes once
  const classesQuery = getClasses();

  // Fetches dependent categories when a main category is selected
  const categoriesQuery = getCategoriesByMainCategory(selectedMainCategory!);

  // Client-side filtering and sorting logic
  const processedClasses = useMemo(() => {
    let classes = classesQuery.data || [];

    if (filters.mainCategoryId) {
      classes = classes.filter(c => c.mainCategory.id === filters.mainCategoryId);
    }
    if (filters.categoryId) {
      classes = classes.filter(c => c.category.id === filters.categoryId);
    }
    if (filters.search) {
      classes = classes.filter(c =>
        c.title.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...classes]; // Create a mutable copy
    if (sortOrder === 'desc') {
      return sorted.reverse();
    }
    return sorted;

  }, [classesQuery.data, filters, sortOrder]);

  // Event Handlers
  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value || undefined }));
    }, 500);
  };

  const handleMainCategoryChange = (value: string) => {
    const mainCategoryId = value === "all" ? undefined : value;
    setSelectedMainCategory(mainCategoryId);
    setFilters(prev => ({
      mainCategoryId: mainCategoryId,
      categoryId: undefined, // Reset category
      search: prev.search // Preserve existing search term
    }));
  };

  const handleCategoryChange = (value: string) => {
    const categoryId = value === "all" ? undefined : value;
    setFilters(prev => ({ ...prev, categoryId }));
  };
  const handleToggleStatus = (courseClass: CourseClass) => {
    setUpdatingStatusId(courseClass.id);
    const newStatus = courseClass.status === 'active' ? 'inactive' : 'active';

    toggleClassStatus.mutate(
      { classId: courseClass.id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: "Status Updated!",
            description: `The class "${courseClass.title}" is now ${newStatus}.`
          });
          alert(`Status for "${courseClass.title}" has been updated to ${newStatus}.`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to update status: ${error.message}`,
            variant: "destructive",
          });
          alert(`Error: Failed to update status. Please try again.`);
        },
        onSettled: () => {
          setUpdatingStatusId(null);
        },
      }
    );
  };
  const handleExportToCsv = () => {
    toast({ title: "Preparing Export", description: "Generating CSV file..." });

    if (!processedClasses || processedClasses.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export for the current filters.",
        variant: "destructive",
      });
      return;
    }

    const dataToExport = processedClasses.map(course => ({
      ID: course.id,
      Title: course.title,
      Teacher: course.teacherName,
      Status: course.status,
      "Main Category": course.mainCategory.mainCategoryName,
      Category: course.category.categoryName,
      Description: course.description,
      "Is Live": course.isLive,
      "Is Free": course.isFree,
      Link: course.link,
    }));

    const csv = Papa.unparse(dataToExport);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'course-classes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Complete", description: "Your file has been downloaded." });
  };

  const exportData = (format: 'csv' | 'excel' | 'pdf') => {
    toast({
      title: "Export Started",
      description: `Exporting data as ${format.toUpperCase()}...`,
    });
  };

  const handlePrint = () => window.print();

  const handleGoLive = (classId: string) => {
    goLive.mutate(classId, {
      onSuccess: () => {
        toast({ title: "Success", description: "Class is now live!" });
        classesQuery.refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to go live: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  if (isLoadingMainCategories) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Online Course Classes</h1>
        <Link href="/course-classes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Class
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
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

            <Select onValueChange={handleCategoryChange} disabled={!selectedMainCategory || categoriesQuery.isLoading}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesQuery.data?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleExportToCsv}><FileText className="h-4 w-4 mr-2" />CSV</Button>
        <Button variant="outline" size="sm" onClick={() => exportData('excel')}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
        <Button variant="outline" size="sm" onClick={() => exportData('pdf')}><Download className="h-4 w-4 mr-2" />PDF</Button>
        <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
      </div>

      {/* Classes Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">
                  <div className="flex items-center">
                    #Sno.
                    <Button variant="ghost" size="sm" onClick={toggleSortOrder} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="w-24">Banner</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classesQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-12 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : processedClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No course classes found
                  </TableCell>
                </TableRow>
              ) : (
                processedClasses.map((courseClass: CourseClass, index: number) => (
                  <TableRow key={courseClass.id}>
                    <TableCell className="font-medium">{sortOrder === 'asc' ? index + 1 : processedClasses.length - index}</TableCell>
                    <TableCell>
                      <img src={courseClass.image} alt="Course banner" className="w-16 h-12 object-cover rounded" />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{courseClass.title}</p>
                        <p className="text-sm text-gray-500">By {courseClass.teacherName}</p>
                        <p className="text-sm text-gray-500">Category: {courseClass.category.categoryName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {updatingStatusId === courseClass.id ? (
                        <Badge variant="secondary" className="flex items-center justify-center w-28 text-muted-foreground">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </Badge>
                      ) : (
                        <Badge
                          onClick={() => handleToggleStatus(courseClass)}
                          variant={courseClass.status === "active" ? "default" : "destructive"}
                          className={`cursor-pointer w-20 justify-center transition-all hover:opacity-80 ${courseClass.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {courseClass.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/course-classes/edit/${courseClass.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGoLive(courseClass.id)}
                          className="text-green-600 hover:text-green-800"
                          disabled={goLive.isPending}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Go Live
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