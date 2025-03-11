"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Edit,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [levelFilter, setLevelFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

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

      // Fetch courses with language info
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*, languages(name, code, flag_url)")
        .order("created_at", { ascending: false });

      // Fetch languages for filter
      const { data: languagesData } = await supabase
        .from("languages")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      setCourses(coursesData || []);
      setFilteredCourses(coursesData || []);
      setLanguages(languagesData || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const applyFilters = (
    searchTerm = "",
    level = levelFilter,
    language = languageFilter,
  ) => {
    let filtered = [...courses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description &&
            course.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    // Apply level filter
    if (level !== "all") {
      filtered = filtered.filter((course) => course.level === level);
    }

    // Apply language filter
    if (language !== "all") {
      filtered = filtered.filter((course) => course.language_id === language);
    }

    setFilteredCourses(filtered);
  };

  // Mock data for demonstration
  const mockCourses = [
    {
      id: "1",
      title: "English for Beginners",
      description: "A comprehensive course for absolute beginners",
      level: "beginner",
      duration_weeks: 8,
      image_url:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
      is_published: true,
      languages: {
        name: "English",
        code: "en",
        flag_url: "https://flagcdn.com/w320/gb.png",
      },
    },
    {
      id: "2",
      title: "Business English",
      description: "Master English for professional environments",
      level: "intermediate",
      duration_weeks: 10,
      image_url:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
      is_published: true,
      languages: {
        name: "English",
        code: "en",
        flag_url: "https://flagcdn.com/w320/gb.png",
      },
    },
    {
      id: "3",
      title: "Advanced Conversation",
      description: "Improve your fluency and natural expression",
      level: "advanced",
      duration_weeks: 12,
      image_url:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
      is_published: true,
      languages: {
        name: "English",
        code: "en",
        flag_url: "https://flagcdn.com/w320/gb.png",
      },
    },
    {
      id: "4",
      title: "English for Travel",
      description: "Essential phrases and vocabulary for travelers",
      level: "beginner",
      duration_weeks: 6,
      image_url:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
      is_published: true,
      languages: {
        name: "English",
        code: "en",
        flag_url: "https://flagcdn.com/w320/gb.png",
      },
    },
    {
      id: "5",
      title: "Academic English",
      description: "Prepare for university studies in English",
      level: "advanced",
      duration_weeks: 14,
      image_url:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
      is_published: false,
      languages: {
        name: "English",
        code: "en",
        flag_url: "https://flagcdn.com/w320/gb.png",
      },
    },
    {
      id: "6",
      title: "English for Kids",
      description: "Fun and engaging English lessons for children",
      level: "beginner",
      duration_weeks: 12,
      image_url:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
      is_published: true,
      languages: {
        name: "English",
        code: "en",
        flag_url: "https://flagcdn.com/w320/gb.png",
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Use mock data if no real data is available
  const displayCourses = courses.length > 0 ? filteredCourses : mockCourses;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Courses</h1>
              <p className="text-muted-foreground">
                Manage language learning courses
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/courses/new">
                <Plus className="h-4 w-4" />
                <span>Create Course</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search courses..."
                className="pl-10 bg-white"
                onChange={(e) => {
                  const searchTerm = e.target.value;
                  applyFilters(searchTerm, levelFilter, languageFilter);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={levelFilter}
                onValueChange={(value) => {
                  setLevelFilter(value);
                  applyFilters("", value, languageFilter);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={languageFilter}
                onValueChange={(value) => {
                  setLanguageFilter(value);
                  applyFilters("", levelFilter, value);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language.id} value={language.id}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

          {/* Courses View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCourses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 w-full">
                    <img
                      src={
                        course.image_url ||
                        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium border flex items-center gap-1">
                      {course.languages?.flag_url && (
                        <img
                          src={course.languages.flag_url}
                          alt={course.languages.code}
                          className="w-4 h-3 object-cover"
                        />
                      )}
                      <span>{course.languages?.name || "Unknown"}</span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 rounded-full px-2 py-1 text-xs font-medium text-white">
                      {course.level}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${course.is_published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {course.is_published ? "Published" : "Draft"}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-muted-foreground">
                        {course.duration_weeks}{" "}
                        {course.duration_weeks === 1 ? "week" : "weeks"}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/courses/${course.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/courses/${course.id}/delete`}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/dashboard/courses/${course.id}`}>
                        View Course
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
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
                      Language
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                            {course.image_url ? (
                              <img
                                src={course.image_url}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-full w-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {course.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {course.languages?.flag_url && (
                            <img
                              src={course.languages.flag_url}
                              alt={course.languages.code}
                              className="h-4 w-6 object-cover rounded-sm"
                            />
                          )}
                          <span>{course.languages?.name || "English"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {course.level || "beginner"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span>{course.duration_weeks || 8} weeks</span>
                      </td>
                      <td className="px-4 py-3">
                        {course.is_published ? (
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Published
                          </span>
                        ) : (
                          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/courses/${course.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/courses/${course.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/courses/${course.id}/delete`}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
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

          {/* Empty State */}
          {(!displayCourses || displayCourses.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Courses Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Create your first course to start adding lessons and exercises.
              </p>
              <Button asChild>
                <Link href="/dashboard/courses/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
