//  import React, { createContext, useState, useContext, useEffect } from 'react';
//   import { Loader2 } from 'lucide-react'; 

// interface User {
//   id: string;
//   email: string;
//   role: 'superadmin' | 'admin' | 'data-entry';
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (userData: User, token: string) => void;
//   logout: () => void;
//   isAuthenticated: boolean;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     try {
//       const storedToken = localStorage.getItem('authToken');
//       const storedUser = localStorage.getItem('authUser');

//       if (storedToken && storedUser) {
//         setUser(JSON.parse(storedUser));
//         setToken(storedToken);
//       }
//     } catch (error) {
//       console.error("Failed to parse auth data from localStorage", error);
//       localStorage.removeItem('authUser');
//       localStorage.removeItem('authToken');
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const login = (userData: User, newToken: string) => {
//     setUser(userData);
//     setToken(newToken);
//     localStorage.setItem('authUser', JSON.stringify(userData));
//     localStorage.setItem('authToken', newToken);
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('authUser');
//     localStorage.removeItem('authToken');
//   };

//   const isAuthenticated = !!token;

//   if (isLoading) {
//     return (
//       <div className="flex h-screen w-screen items-center justify-center">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
// export const useAuth = () => {
//   return null; // or return {};
// };

