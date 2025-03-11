"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "../../../../../supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
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

export default function SearchCoursesPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialLanguage = searchParams.get("language") || "all";
  const initialLevel = searchParams.get("level") || "all";

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [languageFilter, setLanguageFilter] = useState(initialLanguage);
  const [levelFilter, setLevelFilter] = useState(initialLevel);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { data } = await supabase
          .from("languages")
          .select("id, name, code")
          .eq("is_active", true)
          .order("name");

        setLanguages(data || []);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };

    fetchLanguages();
  }, [supabase]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("courses")
          .select("*, languages(name, code, flag_url)")
          .order("title");

        // Apply filters if they exist
        if (initialQuery) {
          query = query.ilike("title", `%${initialQuery}%`);
        }

        if (initialLanguage && initialLanguage !== "all") {
          query = query.eq("language_id", initialLanguage);
        }

        if (initialLevel && initialLevel !== "all") {
          query = query.eq("level", initialLevel);
        }

        const { data, error } = await query;

        if (error) throw error;

        setCourses(data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [initialQuery, initialLanguage, initialLevel, supabase]);

  const handleSearch = () => {
    setSearching(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (languageFilter !== "all") params.set("language", languageFilter);
    if (levelFilter !== "all") params.set("level", levelFilter);

    router.push(`/dashboard/courses/search?${params.toString()}`);
    setSearching(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/dashboard/courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Search Courses</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>
            Find courses by title, language, or level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by course title..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-[180px]">
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
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px]">
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
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            {courses.length > 0
              ? `Search Results (${courses.length})`
              : "No courses found"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
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
                  <div className="text-sm text-muted-foreground">
                    {course.duration_weeks}{" "}
                    {course.duration_weeks === 1 ? "week" : "weeks"}
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
        </div>
      )}
    </div>
  );
}
