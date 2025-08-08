// "use client";

// import { useForm } from 'react-hook-form';
// import { useLocation } from 'wouter';
// import { useAuth } from '@/context/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
// import { toast } from "sonner";
// import { Loader2 } from 'lucide-react';

// import { useState, useEffect } from 'react';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';

// const formSchema = z.object({
//   email: z.string().email("Invalid email address."),
//   password: z.string().min(1, "Password is required."),
// });

// export default function LoginPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const { login, isAuthenticated } = useAuth();
//   const [_, setLocation] = useLocation();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });
//   useEffect(() => {
//     if (isAuthenticated) {
//       setLocation("/admin/dashboard");
//     }
//   }, [isAuthenticated, setLocation]);


//   const onSubmit = async (data: z.infer<typeof formSchema>) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('http://localhost:5099/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.msg || 'Login failed. Please check your credentials.');
//       }
      
//       login(result.data, result.data.token);
//       toast.success("Login successful!");
//       //setLocation("/");

//     } catch (error: any) {
//       toast.error(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // ✅ ADD THIS FUNCTION to log validation errors
//   const onErrors = (errors: any) => {
//     console.error("Form Validation Errors:", errors);
//     toast.error("Please check the form for errors.");
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
//       <Card className="w-full max-w-sm">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl">Admin Panel Login</CardTitle>
//           <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             {/* ✅ UPDATE THIS LINE to include the error handler */}
//             <form onSubmit={form.handleSubmit(onSubmit, onErrors)} className="space-y-6">
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <Label htmlFor="email">Email</Label>
//                     <FormControl>
//                       <Input id="email" type="email" placeholder="admin@example.com" autoComplete="email" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <Label htmlFor="password">Password</Label>
//                     <FormControl>
//                       <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Sign In
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }