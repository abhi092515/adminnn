"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload } from "lucide-react"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { type Course } from "@/hooks/use-course-form"


const BACKEND_API_URL = "http://localhost:5099/api"



// Types for dropdown options
interface MainCategoryOption {
    id: string
    mainCategoryName: string
}

interface CategoryOption {
    id: string
    categoryName: string
}

const courseSchema = z.object({
    banner: z.any().optional(),
    title: z.string().min(1, "Title is required"),
    assignHeader: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    mainCategory: z.string().min(1, "Main category is required"),
    category: z.string().min(1, "Category is required"),
    priority: z.coerce.number().min(0, "Priority must be at least 0").default(0),
    status: z.enum(["active", "inactive", "draft"]).default("active"),
    isLive: z.boolean().default(false),
    isFree: z.boolean().default(false),
    shortDescription1: z.string().optional(),
    shortDescription2: z.string().optional(),
    shortDescription3: z.string().optional(),
    shortDescription4: z.string().optional(),
    shortDescription5: z.string().optional(),
    shortDescription6: z.string().optional(),
    courseHighlight1: z.string().optional(),
    courseHighlight2: z.string().optional(),
    courseHighlight3: z.string().optional(),
    courseHighlight4: z.string().optional(),
    courseHighlight5: z.string().optional(),
    courseHighlight6: z.string().optional(),
    faq: z.string().optional(), // Kept for form state, but removed on submit
})

type CourseFormProps = {
    onSubmit: (data: any) => void
    initialData?: Course | null;
    isLoading?: boolean
    mode?: 'create' | 'edit'
}

export function CourseForm({
    onSubmit,
    initialData,
    isLoading = false,
    mode = 'create'
}: CourseFormProps) {
    const form = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            banner: initialData?.banner || undefined,
            title: initialData?.title || "",
            assignHeader: initialData?.assignHeader || "",
            description: Array.isArray(initialData?.description)
                ? initialData.description.join('\n')
                : initialData?.description || "",
            mainCategory: typeof initialData?.mainCategory === 'object'
                ? initialData.mainCategory.id
                : initialData?.mainCategory || "",
            category: typeof initialData?.category === 'object'
                ? initialData.category.id
                : initialData?.category || "",
            priority: initialData?.priority || 1,
            status: initialData?.status || "active",
            isLive: initialData?.isLive || false,
            isFree: initialData?.isFree || false,
            // ✅ Populate form fields from the arrays in initialData
            shortDescription1: initialData?.courseInfo?.[0] || "",
            shortDescription2: initialData?.courseInfo?.[1] || "",
            shortDescription3: initialData?.courseInfo?.[2] || "",
            shortDescription4: initialData?.courseInfo?.[3] || "",
            shortDescription5: initialData?.courseInfo?.[4] || "",
            shortDescription6: initialData?.courseInfo?.[5] || "",
            courseHighlight1: initialData?.courseHighlights?.[0] || "",
            courseHighlight2: initialData?.courseHighlights?.[1] || "",
            courseHighlight3: initialData?.courseHighlights?.[2] || "",
            courseHighlight4: initialData?.courseHighlights?.[3] || "",
            courseHighlight5: initialData?.courseHighlights?.[4] || "",
            courseHighlight6: initialData?.courseHighlights?.[5] || "",
            faq: "", // Not implemented
        },
    })

    const [imagePreview, setImagePreview] = useState<string | null>(
        typeof initialData?.banner === 'string' ? initialData.banner : null
    )
    const [mainCategories, setMainCategories] = useState<MainCategoryOption[]>([])
    const [categories, setCategories] = useState<CategoryOption[]>([])

    const selectedMainCategory = form.watch("mainCategory")

    // Fetch main categories on component mount
    useEffect(() => {
        const fetchMainCategories = async () => {
            try {
                const response = await fetch(`${BACKEND_API_URL}/main-categories`)
                if (!response.ok) throw new Error('Failed to fetch main categories')
                const data = await response.json()
                setMainCategories(data.data || [])
            } catch (error) {
                console.error('Error fetching main categories:', error)
            }
        }
        fetchMainCategories()
    }, [])

    // Fetch categories when main category changes
    useEffect(() => {
        if (selectedMainCategory) {
            const fetchCategories = async () => {
                try {
                    const response = await fetch(`${BACKEND_API_URL}/categories?mainCategoryId=${selectedMainCategory}`)
                    if (!response.ok) throw new Error('Failed to fetch categories')
                    const data = await response.json()
                    setCategories(data.data || [])
                    // Reset category field when main category changes
                    if (mode === 'create') {
                        form.setValue("category", "")
                    }
                } catch (error) {
                    console.error('Error fetching categories:', error)
                }
            }
            fetchCategories()
        } else {
            setCategories([])
        }
    }, [selectedMainCategory, form, mode])
   const handleSubmit = async (data: z.infer<typeof courseSchema>) => {
        console.log("Form validation successful. Preparing FormData for submission...");

        // 1. Initialize a new FormData object.
        const formData = new FormData();

        // 2. Handle the file upload.
        // The 'banner' field from your form will be a File object if a new one was selected.
        if (data.banner && data.banner instanceof File) {
            // The field name 'image' MUST match what your multer middleware expects.
            formData.append('image', data.banner);
        }

        // 3. Append all other text, number, and boolean fields.
        // FormData converts everything to a string, which your backend will parse.
        formData.append('title', data.title);
        formData.append('mainCategory', data.mainCategory);
        formData.append('category', data.category);
        formData.append('priority', String(data.priority));
        formData.append('status', data.status);
        formData.append('isLive', String(data.isLive));
        formData.append('isFree', String(data.isFree));
        
        if (data.assignHeader) {
            formData.append('assignHeader', data.assignHeader);
        }

        // 4. Handle the arrays by stringifying them.
        // This is a standard pattern for sending structured data with files.
        const courseHighlights = [
            data.courseHighlight1, data.courseHighlight2, data.courseHighlight3,
            data.courseHighlight4, data.courseHighlight5, data.courseHighlight6,
        ].filter(Boolean);

        const courseInfo = [
            data.shortDescription1, data.shortDescription2, data.shortDescription3,
            data.shortDescription4, data.shortDescription5, data.shortDescription6,
        ].filter(Boolean);

        const descriptionLines = data.description.split('\n').filter(line => line.trim() !== '');
        
        formData.append('courseHighlights', JSON.stringify(courseHighlights));
        formData.append('courseInfo', JSON.stringify(courseInfo));
        formData.append('description', JSON.stringify(descriptionLines));

        try {
            // 5. Call the onSubmit prop with the fully constructed FormData object.
            // This will pass the FormData to your `createCourse` or `updateCourse` mutation.
            await onSubmit(formData);

            if (mode === 'create') {
                form.reset();
                setImagePreview(null);
            }
            
            toast({
                title: "Success",
                description: `Course has been ${mode === 'create' ? 'created' : 'updated'} successfully`,
            });
        } catch (error:any) {
            console.error("Submission Error:", error);
            toast({
                title: "Submission Error",
                description: error.message || "Something went wrong. Please check the console.",
                variant: "destructive",
            });
        }
    }

    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                    console.error("FORM VALIDATION FAILED:", errors);
                })} 
                className="space-y-6"
            >                
                {/* Banner Image Upload */}
                <FormField
                    control={form.control}
                    name="banner"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Banner Image</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        field.onChange(file)
                                                        const reader = new FileReader()
                                                        reader.onloadend = () => {
                                                            setImagePreview(reader.result as string)
                                                        }
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <Button type="button" variant="outline" className="relative flex gap-2">
                                                <Upload className="h-4 w-4" />
                                                Choose File
                                            </Button>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {field.value && typeof field.value === 'object' && 'name' in field.value 
                                                ? field.value.name 
                                                : "No file chosen"}
                                        </span>
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-32 w-auto object-contain rounded border"
                                            />
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>
                                Upload a banner image for the course
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Advanced Calculus"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Assignment Header
                    <FormField
                        control={form.control}
                        name="assignHeader"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assignment Header</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Mastering Complex Integrals"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} */}
                    {/* /> */}
                </div>

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter course description (one point per line)"
                                    rows={6}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter each description point on a new line
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Category */}
                    <FormField
                        control={form.control}
                        name="mainCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Main Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select main category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {mainCategories?.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.mainCategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Category */}
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value} 
                                    disabled={!selectedMainCategory}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories?.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.categoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                    {/* Priority */}
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="Enter priority"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Status */}
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Is Live */}
                    <FormField
                        control={form.control}
                        name="isLive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-6">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Live Course</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                     {/* Is Free */}
                    <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-6">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Is Free</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <div>
                    <FormLabel>Short Descriptions (for Course Info)</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        <FormField control={form.control} name="shortDescription1" render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., Course Duration" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="shortDescription2" render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., Course Subjects" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="shortDescription3" render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., Course Features" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="shortDescription4" render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., Course Benefits" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="shortDescription5" render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., Course Audience" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="shortDescription6" render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., Course Upto" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>

                 <div>
                    <FormLabel>Course Highlights</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        <FormField control={form.control} name="courseHighlight1" render={({ field }) => (<FormItem><FormControl><Input placeholder="Highlight 1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="courseHighlight2" render={({ field }) => (<FormItem><FormControl><Input placeholder="Highlight 2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="courseHighlight3" render={({ field }) => (<FormItem><FormControl><Input placeholder="Highlight 3" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="courseHighlight4" render={({ field }) => (<FormItem><FormControl><Input placeholder="Highlight 4" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="courseHighlight5" render={({ field }) => (<FormItem><FormControl><Input placeholder="Highlight 5" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="courseHighlight6" render={({ field }) => (<FormItem><FormControl><Input placeholder="Highlight 6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Processing..." : mode === 'create' ? "Create Course" : "Update Course"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}