"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  Dumbbell,
  GraduationCap,
  Globe,
  Home,
  Layers,
  Settings,
  User,
  BookText,
  MessageSquare,
} from "lucide-react";

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: "Languages",
    href: "/dashboard/languages",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
    icon: <BookText className="w-5 h-5" />,
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "Modules",
    href: "/dashboard/modules",
    icon: <Layers className="w-5 h-5" />,
  },
  {
    name: "Exercises",
    href: "/dashboard/exercises",
    icon: <Dumbbell className="w-5 h-5" />,
  },
  {
    name: "Vocabulary",
    href: "/dashboard/words",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "Sentences",
    href: "/dashboard/sentences",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    name: "Achievements",
    href: "/dashboard/achievements",
    icon: <Award className="w-5 h-5" />,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
        <span className="text-xl font-bold">LinguaLearn</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.name === "Achievements" && (
                    <span className="ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-1">Pro Tip</h4>
          <p className="text-sm text-blue-600">
            Practice daily to maintain your learning streak!
          </p>
        </div>
      </div>
    </aside>
  );
}
