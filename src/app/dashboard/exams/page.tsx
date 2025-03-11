"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Edit,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Trash,
  Filter,
  CheckCircle2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [filteredExams, setFilteredExams] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
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

      // Fetch exams with language info
      const { data: examsData } = await supabase
        .from("exams")
        .select("*, languages(name, code)")
        .order("created_at", { ascending: false });

      // Fetch languages for filter
      const { data: languagesData } = await supabase
        .from("languages")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      setExams(examsData || []);
      setFilteredExams(examsData || []);
      setLanguages(languagesData || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const applyFilters = (
    searchTerm = "",
    difficulty = difficultyFilter,
    published = publishedFilter,
    language = languageFilter,
  ) => {
    let filtered = [...exams];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exam.description &&
            exam.description.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Apply difficulty filter
    if (difficulty !== "all") {
      filtered = filtered.filter(
        (exam) => exam.difficulty_level === difficulty,
      );
    }

    // Apply published filter
    if (published !== "all") {
      const isPublished = published === "published";
      filtered = filtered.filter((exam) => exam.is_published === isPublished);
    }

    // Apply language filter
    if (language !== "all") {
      filtered = filtered.filter((exam) => exam.language_id === language);
    }

    setFilteredExams(filtered);
  };

  const getDifficultyColor = (level: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-purple-100 text-purple-800",
      expert: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Mock data for demonstration
  const mockExams = [
    {
      id: "1",
      title: "Beginner English Test",
      description:
        "A comprehensive test for beginners covering basic vocabulary and grammar",
      difficulty_level: "beginner",
      time_limit: 30,
      passing_score: 70,
      is_published: true,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "2",
      title: "Intermediate Grammar Quiz",
      description:
        "Test your knowledge of intermediate English grammar concepts",
      difficulty_level: "intermediate",
      time_limit: 45,
      passing_score: 75,
      is_published: true,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "3",
      title: "Advanced Vocabulary Challenge",
      description: "Challenge yourself with advanced English vocabulary",
      difficulty_level: "advanced",
      time_limit: 60,
      passing_score: 80,
      is_published: false,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "4",
      title: "Business English Assessment",
      description: "Evaluate your business English skills",
      difficulty_level: "intermediate",
      time_limit: null,
      passing_score: 70,
      is_published: true,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "5",
      title: "English Proficiency Test",
      description:
        "Comprehensive assessment of your English language proficiency",
      difficulty_level: "expert",
      time_limit: 90,
      passing_score: 85,
      is_published: false,
      languages: {
        name: "English",
        code: "en",
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
  const displayExams = exams.length > 0 ? filteredExams : mockExams;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Exams</h1>
              <p className="text-muted-foreground">
                Create and manage language assessment exams
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/exams/new">
                <Plus className="h-4 w-4" />
                <span>Create Exam</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search exams..."
                className="pl-10 bg-white"
                onChange={(e) => {
                  const searchTerm = e.target.value;
                  applyFilters(
                    searchTerm,
                    difficultyFilter,
                    publishedFilter,
                    languageFilter,
                  );
                }}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <p className="text-sm font-medium mb-2">Difficulty</p>
                    <Select
                      value={difficultyFilter}
                      onValueChange={(value) => {
                        setDifficultyFilter(value);
                        applyFilters(
                          "",
                          value,
                          publishedFilter,
                          languageFilter,
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2 border-t">
                    <p className="text-sm font-medium mb-2">Status</p>
                    <Select
                      value={publishedFilter}
                      onValueChange={(value) => {
                        setPublishedFilter(value);
                        applyFilters(
                          "",
                          difficultyFilter,
                          value,
                          languageFilter,
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2 border-t">
                    <p className="text-sm font-medium mb-2">Language</p>
                    <Select
                      value={languageFilter}
                      onValueChange={(value) => {
                        setLanguageFilter(value);
                        applyFilters(
                          "",
                          difficultyFilter,
                          publishedFilter,
                          value,
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
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
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

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

          {/* Exams View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayExams.map((exam) => (
                <Card
                  key={exam.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <Badge
                        variant={exam.is_published ? "default" : "secondary"}
                      >
                        {exam.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {exam.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        className={getDifficultyColor(exam.difficulty_level)}
                      >
                        {exam.difficulty_level.charAt(0).toUpperCase() +
                          exam.difficulty_level.slice(1)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {exam.time_limit
                          ? `${exam.time_limit} min`
                          : "No time limit"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {exam.passing_score}% to pass
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exam.languages?.name || "English"}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/exams/${exam.id}`}>View</Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/exams/${exam.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/exams/${exam.id}/delete`}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Link>
                      </Button>
                    </div>
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
                      Difficulty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Time Limit
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Passing Score
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
                  {displayExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {exam.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={getDifficultyColor(exam.difficulty_level)}
                        >
                          {exam.difficulty_level.charAt(0).toUpperCase() +
                            exam.difficulty_level.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {exam.time_limit
                          ? `${exam.time_limit} minutes`
                          : "No time limit"}
                      </td>
                      <td className="px-4 py-3">{exam.passing_score}%</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={exam.is_published ? "default" : "secondary"}
                        >
                          {exam.is_published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/exams/${exam.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/exams/${exam.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/exams/${exam.id}/delete`}>
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
          {(!displayExams || displayExams.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Exams Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Create your first exam to start assessing student knowledge.
              </p>
              <Button asChild>
                <Link href="/dashboard/exams/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Exam
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
