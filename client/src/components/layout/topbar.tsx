"use client";

// import { useAuth } from "@/context/AuthContext"; // REMOVE THIS IMPORT
import { Link } from "wouter";
// import { User, LogOut, Bell } from "lucide-react"; // Bell can stay if you want notifications without user context
import { Bell } from "lucide-react"; // Keep Bell if still desired
import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // REMOVE THESE IMPORTS if not used
// import { // REMOVE THESE IMPORTS if not used
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  // Get the current user and logout function from the AuthContext
  // const { user, logout } = useAuth(); // REMOVE OR COMMENT OUT THIS LINE

  // Helper function to get user's initials for the avatar
  // const getInitials = (name?: string) => { // REMOVE OR COMMENT OUT THIS FUNCTION
  //   if (!name) return "AU"; // Default to "Admin User"
  //   return name.split(' ').map(n => n[0]).join('').toUpperCase();
  // };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Page Title */}
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

        {/* Right side with icons and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications can remain even without a logged-in user if they are general */}
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </Button>

          {/* REMOVE THE ENTIRE DROPDOWN MENU SECTION */}
          {/*
          {user && ( // This conditional rendering will always be false now
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-2 space-x-3 rounded-full">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">{user.name || "Admin"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profilePicture} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || "Admin"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/admin/profile"> // Also consider if this link should change
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          */}
        </div>
      </div>
    </header>
  );
}

// REMOVE THIS EXPORT: This was likely a temporary or conflicting export from a previous edit.
// export const Topbar = () => {
//   return null; // or return {};
// };