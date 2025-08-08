// "use client";

// import { useAuth } from "@/context/AuthContext";
// import { Redirect } from "wouter";
// import React from "react";
// import { Loader2 } from "lucide-react";

// type UserRole = 'superadmin' | 'admin' | 'data-entry';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   roles?: UserRole[];
// }

// export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
//   const { isAuthenticated, user, isLoading } = useAuth();

//   // 1. While checking for a token, show a loading screen
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   // 2. If not authenticated, redirect to login
//   if (!isAuthenticated) {
//     return <Redirect to="/login" />;
//   }

//   // 3. ✅ UPDATED LOGIC: Deny access only if roles are required AND
//   //    the user is NOT a superadmin AND their role is not in the allowed list.
//   if (roles && user && user.role !== 'superadmin' && !roles.includes(user.role)) {
//     return <Redirect to="/unauthorized" />; 
//   }

//   // 4. If all checks pass, render the page
//   return <>{children}</>;
// };