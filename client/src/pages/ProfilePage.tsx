// "use client";

// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { useAuth } from "@/context/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { toast } from 'sonner';
// import { useState } from 'react';
// import { Loader2 } from 'lucide-react';

// // Schema for validating the profile update form
// const profileFormSchema = z.object({
//   name: z.string().min(1, "Name is required."),
//   phone: z.string().optional(),
//   city: z.string().optional(),
//   state: z.string().optional(),
// });

// type ProfileFormData = z.infer<typeof profileFormSchema>;

// export default function ProfilePage() {
//     const { user, token } = useAuth();
//     const [isLoading, setIsLoading] = useState(false);

//     const form = useForm<ProfileFormData>({
//         resolver: zodResolver(profileFormSchema),
//         // Pre-fill the form with the current user's data
//         defaultValues: {
//             name: user?.name || "",
//             phone: user?.phone || "",
//             city: user?.city || "",
//             state: user?.state || "",
//         },
//     });

//     const handleProfileUpdate = async (data: ProfileFormData) => {
//         setIsLoading(true);
//         try {
//             // NOTE: You would need a backend endpoint for this.
//             // Example: PUT /api/users/profile
//             const response = await fetch(`http://localhost:5099/api/users/profile`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify(data),
//             });

//             const result = await response.json();
//             if (!response.ok) {
//                 throw new Error(result.msg || 'Failed to update profile.');
//             }

//             toast.success("Profile updated successfully!");
//             // Optionally, you could update the user data in AuthContext here
//             // or prompt the user to refresh.

//         } catch (error: any) {
//             toast.error(error.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (!user) {
//         return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-2xl font-bold">My Profile</h1>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                 <div className="md:col-span-2">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Update Your Information</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <Form {...form}>
//                                 <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
//                                     <FormField control={form.control} name="name" render={({ field }) => (
//                                         <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
//                                     )} />
//                                     <FormField control={form.control} name="phone" render={({ field }) => (
//                                         <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
//                                     )} />
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <FormField control={form.control} name="city" render={({ field }) => (
//                                             <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
//                                         )} />
//                                         <FormField control={form.control} name="state" render={({ field }) => (
//                                             <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
//                                         )} />
//                                     </div>
//                                     <Button type="submit" disabled={isLoading}>
//                                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                                         Save Changes
//                                     </Button>
//                                 </form>
//                             </Form>
//                         </CardContent>
//                     </Card>
//                 </div>
//                 <div>
//                     <Card>
//                          <CardHeader>
//                             <CardTitle>Account Details</CardTitle>
//                             <CardDescription>Your current account information.</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-3">
//                             <p className="text-sm"><strong>Email:</strong><br/>{user.email}</p>
//                             <p className="text-sm"><strong>Role:</strong><br/><span className="capitalize bg-secondary text-secondary-foreground px-2 py-1 rounded-md">{user.role}</span></p>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//         </div>
//     );
// }