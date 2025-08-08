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

import { ClassData, MainCategoryOption, CategoryOption, SelectOption } from "@/types/class"


const BACKEND_API_URL = "http://localhost:5099/api"


const classSchema = z.object({
     image: z.any().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    link: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "Please enter a valid URL"
    }).optional(),
    teacherName: z.string().min(1, "Teacher name is required"),
    mainCategory: z.string().min(1, "Main category is required"),
    category: z.string().min(1, "Category is required"),
    section: z.string().min(1, "Section is required"),
    topic: z.string().min(1, "Topic is required"),
    priority: z.number().min(1, "Priority must be at least 1"),
    status: z.enum(["active", "inactive"]),
    isChat: z.boolean(),
    isFree: z.boolean(),
    isLive: z.boolean(),
})

type ClassFormProps = {
    onSubmit: (data: any) => void
    initialData?: ClassData
    isLoading?: boolean
    mode?: 'create' | 'edit'
}

export function ClassForm({
    onSubmit,
    initialData,
    isLoading = false,
    mode = 'create'
}: ClassFormProps) {
    const form = useForm<z.infer<typeof classSchema>>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            image: initialData?.image || undefined,
            title: initialData?.title || "",
            description: initialData?.description || "",
            link: initialData?.link || "",
            teacherName: initialData?.teacherName || "",
            mainCategory: typeof initialData?.mainCategory === "object" ? initialData?.mainCategory.id : initialData?.mainCategory || "",
            category: initialData?.category && typeof initialData.category === 'object' ? initialData.category.id : initialData?.category || '',
            section: initialData?.section && typeof initialData.section === 'object' ? initialData.section.id : initialData?.section || '',
            topic: initialData?.topic && typeof initialData.topic === 'object' ? initialData.topic.id : initialData?.topic || '',
            priority: initialData?.priority || 1,
            status: (initialData?.status as "active" | "inactive") || "active",
            isChat: initialData?.isChat || false,
            isFree: initialData?.isFree || false,
            isLive: initialData?.isLive || false,
        },
    })

    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)
    const [mainCategories, setMainCategories] = useState<MainCategoryOption[]>([])
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [sections, setSections] = useState<SelectOption[]>([])
    const [topics, setTopics] = useState<SelectOption[]>([])

    const selectedMainCategory = form.watch("mainCategory")
    const selectedCategory = form.watch("category")
    const selectedSection = form.watch("section")

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
    }, [initialData])    

    useEffect(() => {
        if (selectedMainCategory) {
            const fetchCategories = async () => {
                try {
                    const response = await fetch(`${BACKEND_API_URL}/categories?mainCategoryId=${selectedMainCategory}`)
                    if (!response.ok) throw new Error('Failed to fetch categories')
                    const data = await response.json()
                    setCategories(data.data || [])
                    // Only reset dependent fields if not in edit mode with initial data
                    if (!initialData || mode === 'create') {
                        form.setValue("category", "")
                        form.setValue("section", "")
                        form.setValue("topic", "")
                        setSections([])
                        setTopics([])
                    }
                } catch (error) {
                    console.error('Error fetching categories:', error)
                }
            }
            fetchCategories()
        } else {
            setCategories([])
            setSections([])
            setTopics([])
        }
    }, [selectedMainCategory, form, initialData, mode])    
    useEffect(() => {
        if (selectedCategory) {
            const fetchSections = async () => {
                try {
                    const response = await fetch(`${BACKEND_API_URL}/sections?categoryId=${selectedCategory}`)
                    if (!response.ok) throw new Error('Failed to fetch sections')
                    const data = await response.json()
                    setSections(data.data || [])
                    if (!initialData || mode === 'create') {
                        form.setValue("section", "")
                        form.setValue("topic", "")
                        setTopics([])
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error)
                }
            }
            fetchSections()
        } else {
            setSections([])
            setTopics([])
        }
    }, [selectedCategory, form, initialData, mode])    

    useEffect(() => {
        if (selectedSection) {
            const fetchTopics = async () => {
                try {
                    const response = await fetch(`${BACKEND_API_URL}/topics?sectionId=${selectedSection}`)
                    if (!response.ok) throw new Error('Failed to fetch topics')
                    const data = await response.json()
                    setTopics(data || [])
                    if (!initialData || mode === 'create') {
                        form.setValue("topic", "")
                    }
                } catch (error) {
                    console.error('Error fetching topics:', error)
                }
            }
            fetchTopics()
        } else {
            setTopics([])
        }
    }, [selectedSection, form, initialData, mode])

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            const populateInitialData = async () => {
                try {
                    // If we have a main category, fetch its categories
                    if (initialData.mainCategory) {
                        const mainCatId = typeof initialData.mainCategory === "object" ? initialData.mainCategory.id : initialData.mainCategory;
                        const categoriesResponse = await fetch(`${BACKEND_API_URL}/categories?mainCategoryId=${mainCatId}`)
                        if (categoriesResponse.ok) {
                            const categoriesData = await categoriesResponse.json()
                            setCategories(categoriesData.data || [])
                        }

                        // If we have a category, fetch its sections
                        if (initialData.category) {
                            const catId = typeof initialData.category === "object" ? initialData.category.id : initialData.category;
                            const sectionsResponse = await fetch(`${BACKEND_API_URL}/sections?categoryId=${catId}`)
                            if (sectionsResponse.ok) {
                                const sectionsData = await sectionsResponse.json()
                                setSections(sectionsData.data || [])
                            }

                            // If we have a section, fetch its topics
                            if (initialData.section) {
                                const sectionId = typeof initialData.section === "object" ? initialData.section.id : initialData.section;
                                const topicsResponse = await fetch(`${BACKEND_API_URL}/topics?sectionId=${sectionId}`)
                                if (topicsResponse.ok) {
                                    const topicsData = await topicsResponse.json()
                                    setTopics(topicsData || [])
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error populating initial data:', error)
                }
            }

            populateInitialData()
        }
    }, [mode, initialData])

    const handleSubmit = async (data: z.infer<typeof classSchema>) => {
        try {
            await onSubmit(data)
            toast({
                title: "Success",
                description: `Class has been ${mode === 'create' ? 'created' : 'updated'} successfully`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Image Upload */}
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Banner Image</FormLabel>
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
                                        </div>                    <span className="text-sm text-muted-foreground">
                                            {field.value && typeof field.value === 'object' && 'name' in field.value ? field.value.name : "No file chosen"}
                                        </span>
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview || "/placeholder.svg"}
                                                alt="Preview"
                                                className="h-32 w-auto object-contain rounded border"
                                            />
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter class title"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter class description"
                                    rows={4}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Link */}
                <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Link</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="https://meet.google.com/abc-xyz"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Teacher Name */}
                <FormField
                    control={form.control}
                    name="teacherName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teacher Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter teacher name"
                                    {...field}
                                />
                            </FormControl>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select main category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {mainCategories.map((cat) => (
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
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMainCategory}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((cat) => (
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

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={section.id}>
                                                {section.sectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Topic */}
                    <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Topic</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSection}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select topic" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {topics.map((topic) => (
                                            <SelectItem key={topic.id} value={topic.id}>
                                                {topic.topicName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        min="1"
                                        placeholder="Enter priority"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Boolean Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="isChat"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Enable Chat</FormLabel>
                                    <FormDescription>
                                        Allow students to chat during class
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Free Class</FormLabel>
                                    <FormDescription>
                                        This class is free for students
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isLive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Live Class</FormLabel>
                                    <FormDescription>
                                        This class is live/scheduled
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-4">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? "Processing..." : mode === 'create' ? "Create Class" : "Update Class"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}