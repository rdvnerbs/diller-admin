"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Filter,
  Clock,
  Crown,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<any[]>([]);
  const [filteredStories, setFilteredStories] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

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

      // Fetch languages for filter
      const { data: languagesData } = await supabase
        .from("languages")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      setLanguages(languagesData || []);

      // Fetch stories with pagination
      await fetchStories(1);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchStories = async (page: number) => {
    setLoading(true);
    const supabase = createClient();

    // Calculate pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Build query
    let query = supabase
      .from("stories")
      .select("*, languages(name, code)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      query = query.eq("difficulty_level", difficultyFilter);
    }

    // Apply language filter
    if (languageFilter !== "all") {
      query = query.eq("language_id", languageFilter);
    }

    // Apply premium filter
    if (premiumFilter !== "all") {
      query = query.eq("is_premium", premiumFilter === "premium");
    }

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
      );
    }

    // Get count for pagination
    const { count } = await query.count();
    setTotalPages(Math.ceil((count || 0) / itemsPerPage));

    // Get paginated data
    const { data } = await query.range(from, to);

    setStories(data || []);
    setFilteredStories(data || []);
    setCurrentPage(page);
    setLoading(false);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    fetchStories(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "difficulty") {
      setDifficultyFilter(value);
    } else if (type === "language") {
      setLanguageFilter(value);
    } else if (type === "premium") {
      setPremiumFilter(value);
    }
    fetchStories(1);
  };

  const handlePageChange = (page: number) => {
    fetchStories(page);
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
  const mockStories = [
    {
      id: "1",
      title: "The Lost Key",
      description:
        "A short story about a man who loses his key and the adventure that follows",
      image_url:
        "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80",
      audio_url: "https://example.com/audio/lost-key.mp3",
      difficulty_level: "beginner",
      duration_minutes: 5,
      is_premium: false,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "2",
      title: "The Mysterious Neighbor",
      description:
        "A story about a family who moves to a new house and discovers their neighbor has a secret",
      image_url:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
      audio_url: "https://example.com/audio/mysterious-neighbor.mp3",
      difficulty_level: "intermediate",
      duration_minutes: 8,
      is_premium: true,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "3",
      title: "The Last Train",
      description:
        "A suspenseful story about a woman who must catch the last train home",
      image_url:
        "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
      audio_url: "https://example.com/audio/last-train.mp3",
      difficulty_level: "advanced",
      duration_minutes: 12,
      is_premium: true,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "4",
      title: "The Birthday Surprise",
      description: "A heartwarming story about a surprise birthday party",
      image_url:
        "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
      audio_url: "https://example.com/audio/birthday-surprise.mp3",
      difficulty_level: "beginner",
      duration_minutes: 6,
      is_premium: false,
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
  const displayStories = stories.length > 0 ? filteredStories : mockStories;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Stories</h1>
              <p className="text-muted-foreground">
                Improve your listening and reading skills with engaging stories
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/stories/new">
                <Plus className="h-4 w-4" />
                <span>Add Story</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search stories..."
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
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
                      onValueChange={(value) =>
                        handleFilterChange("difficulty", value)
                      }
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
                    <p className="text-sm font-medium mb-2">Language</p>
                    <Select
                      value={languageFilter}
                      onValueChange={(value) =>
                        handleFilterChange("language", value)
                      }
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
                  <div className="p-2 border-t">
                    <p className="text-sm font-medium mb-2">Access</p>
                    <Select
                      value={premiumFilter}
                      onValueChange={(value) =>
                        handleFilterChange("premium", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stories</SelectItem>
                        <SelectItem value="free">Free Only</SelectItem>
                        <SelectItem value="premium">Premium Only</SelectItem>
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

          {/* Stories View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayStories.map((story) => (
                <Card
                  key={story.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 w-full">
                    <img
                      src={
                        story.image_url ||
                        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
                      }
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    {story.is_premium && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                        <Crown className="h-4 w-4" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      <Badge
                        className={getDifficultyColor(story.difficulty_level)}
                      >
                        {story.difficulty_level.charAt(0).toUpperCase() +
                          story.difficulty_level.slice(1)}
                      </Badge>
                      <Badge className="bg-gray-800 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {story.duration_minutes} min
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {story.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/stories/${story.id}`}>
                        Listen
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/stories/${story.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/stories/${story.id}/delete`}>
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
                      Language
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Difficulty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Access
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayStories.map((story) => (
                    <tr key={story.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                            {story.image_url ? (
                              <img
                                src={story.image_url}
                                alt={story.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-full w-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{story.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {story.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {story.languages?.name || "English"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={getDifficultyColor(story.difficulty_level)}
                        >
                          {story.difficulty_level.charAt(0).toUpperCase() +
                            story.difficulty_level.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {story.duration_minutes} minutes
                      </td>
                      <td className="px-4 py-3">
                        {story.is_premium ? (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Crown className="h-3 w-3 mr-1" /> Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/stories/${story.id}`}>
                              Listen
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/stories/${story.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/stories/${story.id}/delete`}
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
          {(!displayStories || displayStories.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Stories Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                {searchQuery
                  ? `No stories match your search for "${searchQuery}"`
                  : "Add your first story to start building your library."}
              </p>
              <Button asChild>
                <Link href="/dashboard/stories/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Link>
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="my-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
    </>
  );
}
