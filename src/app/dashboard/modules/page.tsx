"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Grid,
  Layers,
  List,
  ListChecks,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleCard from "@/components/dashboard-components/module-card";
import { Input } from "@/components/ui/input";

export default function ModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<any[]>([]);
  const [filteredModules, setFilteredModules] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Fetch learning modules
      const { data } = await supabase.from("learning_modules").select("*");

      setModules(data || []);
      setFilteredModules(data || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Mock data for demonstration
  const mockModules = [
    {
      id: "1",
      title: "Introduction to Greetings",
      description: "Learn basic greetings and introductions in English",
      difficulty_level: "Beginner",
      estimated_duration: 15,
      slug: "intro-greetings",
      image_url:
        "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=800&q=80",
    },
    {
      id: "2",
      title: "Business Meeting Vocabulary",
      description: "Essential vocabulary for professional business meetings",
      difficulty_level: "Intermediate",
      estimated_duration: 25,
      slug: "business-meetings",
      image_url:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    },
    {
      id: "3",
      title: "Travel Conversations",
      description:
        "Practice conversations for airports, hotels, and restaurants",
      difficulty_level: "Beginner",
      estimated_duration: 20,
      slug: "travel-conversations",
      image_url:
        "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80",
    },
    {
      id: "4",
      title: "Social English",
      description: "Casual conversations and social interactions",
      difficulty_level: "Beginner",
      estimated_duration: 18,
      slug: "social-english",
      image_url:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
    },
    {
      id: "5",
      title: "Academic Writing",
      description: "Formal writing techniques for academic contexts",
      difficulty_level: "Advanced",
      estimated_duration: 30,
      slug: "academic-writing",
      image_url:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    },
    {
      id: "6",
      title: "Job Interview Preparation",
      description: "Vocabulary and phrases for successful job interviews",
      difficulty_level: "Intermediate",
      estimated_duration: 25,
      slug: "job-interviews",
      image_url:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80",
    },
  ];

  // Group modules by difficulty level
  const groupedModules = mockModules.reduce(
    (acc, module) => {
      const level = module.difficulty_level.toLowerCase();
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(module);
      return acc;
    },
    {} as Record<string, typeof mockModules>,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Learning Modules</h1>
              <p className="text-muted-foreground">
                Browse all available learning modules by difficulty level or
                category
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/modules/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Module
              </Link>
            </Button>
          </header>

          {/* Search and View Mode */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search modules..."
                className="pl-10 bg-white"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  if (modules && modules.length > 0) {
                    const filtered = modules.filter(
                      (module) =>
                        (module.title || "")
                          .toLowerCase()
                          .includes(searchTerm) ||
                        (module.description || "")
                          .toLowerCase()
                          .includes(searchTerm) ||
                        (module.difficulty_level || "")
                          .toLowerCase()
                          .includes(searchTerm),
                    );
                    setFilteredModules(filtered);
                  } else {
                    const filtered = mockModules.filter(
                      (module) =>
                        module.title.toLowerCase().includes(searchTerm) ||
                        module.description.toLowerCase().includes(searchTerm) ||
                        module.difficulty_level
                          .toLowerCase()
                          .includes(searchTerm),
                    );
                    setFilteredModules(filtered);
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("card")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger
                value="all"
                className="flex items-center gap-1"
                onClick={() => {
                  setCurrentTab("all");
                  // Keep the current view mode when changing tabs
                }}
              >
                <Layers className="h-4 w-4" />
                <span>All Modules</span>
              </TabsTrigger>
              <TabsTrigger
                value="beginner"
                className="flex items-center gap-1"
                onClick={() => {
                  setCurrentTab("beginner");
                  // Keep the current view mode when changing tabs
                }}
              >
                <BookOpen className="h-4 w-4" />
                <span>Beginner</span>
              </TabsTrigger>
              <TabsTrigger
                value="intermediate"
                className="flex items-center gap-1"
                onClick={() => {
                  setCurrentTab("intermediate");
                  // Keep the current view mode when changing tabs
                }}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Intermediate</span>
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex items-center gap-1"
                onClick={() => {
                  setCurrentTab("advanced");
                  // Keep the current view mode when changing tabs
                }}
              >
                <ListChecks className="h-4 w-4" />
                <span>Advanced</span>
              </TabsTrigger>
            </TabsList>

            {/* All Modules Tab */}
            <TabsContent value="all" className="space-y-6">
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredModules.length > 0
                    ? filteredModules.map((module) => (
                        <ModuleCard key={module.id} module={module as any} />
                      ))
                    : mockModules.map((module) => (
                        <ModuleCard key={module.id} module={module as any} />
                      ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Difficulty
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(filteredModules.length > 0
                        ? filteredModules
                        : mockModules
                      ).map((module) => (
                        <tr key={module.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                                {module.image_url ? (
                                  <img
                                    src={module.image_url}
                                    alt={module.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-full w-full p-2 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{module.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {module.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {module.difficulty_level || "Beginner"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                              {module.estimated_duration || 15} min
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/dashboard/modules/${module.slug}`}
                                >
                                  View
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Beginner Tab */}
            <TabsContent value="beginner" className="space-y-6">
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModules["beginner"]?.map((module) => (
                    <ModuleCard key={module.id} module={module as any} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Difficulty
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {groupedModules["beginner"]?.map((module) => (
                        <tr key={module.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                                {module.image_url ? (
                                  <img
                                    src={module.image_url}
                                    alt={module.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-full w-full p-2 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{module.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {module.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {module.difficulty_level || "Beginner"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                              {module.estimated_duration || 15} min
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/dashboard/modules/${module.slug}`}
                                >
                                  View
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Intermediate Tab */}
            <TabsContent value="intermediate" className="space-y-6">
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModules["intermediate"]?.map((module) => (
                    <ModuleCard key={module.id} module={module as any} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Difficulty
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {groupedModules["intermediate"]?.map((module) => (
                        <tr key={module.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                                {module.image_url ? (
                                  <img
                                    src={module.image_url}
                                    alt={module.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-full w-full p-2 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{module.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {module.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {module.difficulty_level || "Intermediate"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                              {module.estimated_duration || 15} min
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/dashboard/modules/${module.slug}`}
                                >
                                  View
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModules["advanced"]?.map((module) => (
                    <ModuleCard key={module.id} module={module as any} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Difficulty
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {groupedModules["advanced"]?.map((module) => (
                        <tr key={module.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                                {module.image_url ? (
                                  <img
                                    src={module.image_url}
                                    alt={module.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-full w-full p-2 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{module.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {module.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {module.difficulty_level || "Advanced"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                              {module.estimated_duration || 15} min
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/dashboard/modules/${module.slug}`}
                                >
                                  View
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
