"use client";

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Home, Map, Book, Bell, GraduationCap, TrendingUp, Megaphone, UserCog, School, SquarePen} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  badge?: number;
  dropdown?: DropdownItem[];
}

interface DropdownItem {
  label: string;
  href: string;
}

export function Sidebar() {
  const [location] = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const toggleDropdown = (label: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(label)) {
      newOpenDropdowns.delete(label);
    } else {
      newOpenDropdowns.add(label);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    {
      icon: Map,
      label: "Structure",
      dropdown: [
        { label: "Main Category", href: "/main-category" },
        { label: "Category Section", href: "/category-section" },
        { label: "Sections", href: "/sections" },
        { label: "Topics", href: "/topics" },
        { label: "Sub-Topics", href: "/sub-topics" },
      ],
    },
    {
      icon: Book,
      label: "Study Material",
      dropdown: [
        { label: "Ebooks", href: "/ebooks" },
        { label: "Books", href: "/books" },
        { label: "Order Management", href: "/orders" },
      ],
    },
    {
      icon: School,
      label: "Practice",
      dropdown: [
        { label: "All Questions", href: "/questions" },
        { label: "Online Tests", href: "/series" },
        { label: "Test Instructions", href: "/instructions" },
        { label: "Online Test Packages", href: "/packages" },
        { label: "Duplicate Question", href: "/duplicate-questions" },
        { label: "Practice Batches", href: "/practice-batch" },
       
      ],
    },
    { icon: Bell, label: "Notifications", href: "/in-app-notification" },
    {
      icon: GraduationCap,
      label: "Learning",
      dropdown: [
        { label: "Online Course Classes", href: "/course-classes" },
        { label: "Online Course PDF", href: "/online-course-pdfs" },
        { label: "Online Courses", href: "/courses" },
      ],
    },
    {
        icon: Megaphone,
        label: "Marketing",
        dropdown: [
          { label: "Banners", href: "/banners" },
          { label: "SEO URL", href: "/seo-urls" },
        ],
    },
    {
      icon: TrendingUp,
      label: "Sales",
      dropdown: [
        { label: "Users", href: "/users" },
        { label: "Contact Us Enquiry", href: "/sales/contact-enquiry" },
        { label: "Coupons", href: "/coupons" },
        { label: "Subscriptions", href: "/subscriptions" },
      ],
    },
    {
      icon: UserCog,
      label: "Admin Management",
      dropdown: [
        { label: "Manage Users", href: "/users" },
        { label: "Profile", href: "/profile" },
      ],
    },
  ];

  const accessibleNavItems = navItems;

  const isActive = (href: string) => location === href;
  const isDropdownActive = (items: DropdownItem[]) => items.some(item => location === item.href);

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Course Admin</h1>
      </div>

      <nav className="mt-6 flex-1 overflow-y-auto">
        {accessibleNavItems.map((item) => (
          <div key={item.label} className="px-4 py-1">
            {item.href ? (
              // ✅ FIX: Removed the inner <a> tag and applied props directly to <Link>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "text-blue-600 bg-blue-50 font-semibold"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                </div>
                {item.badge && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{item.badge}</span>}
              </Link>
            ) : (
              <div>
                <button onClick={() => toggleDropdown(item.label)} className={cn("flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors", item.dropdown && isDropdownActive(item.dropdown) ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50")}>
                  <div className="flex items-center"><item.icon className="h-5 w-5 mr-3" /><span>{item.label}</span></div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", openDropdowns.has(item.label) ? "rotate-180" : "")} />
                </button>
                {item.dropdown && (
                  <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", openDropdowns.has(item.label) ? "max-h-96" : "max-h-0")}>
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                      {item.dropdown.map((dropdownItem) => (
                        // ✅ FIX: Also applied the fix to dropdown links
                        <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className={cn(
                                "block px-3 py-2 text-sm rounded-md transition-colors",
                                isActive(dropdownItem.href)
                                ? "text-blue-600 bg-blue-50 font-medium"
                                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                            )}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}