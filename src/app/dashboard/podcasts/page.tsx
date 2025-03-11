"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Headphones,
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
  Music,
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

export default function PodcastsPage() {
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<any[]>([]);
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

      // Fetch podcasts with pagination
      await fetchPodcasts(1);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchPodcasts = async (page: number) => {
    setLoading(true);
    const supabase = createClient();

    // Calculate pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Build query
    let query = supabase
      .from("podcasts")
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

    setPodcasts(data || []);
    setFilteredPodcasts(data || []);
    setCurrentPage(page);
    setLoading(false);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    fetchPodcasts(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "difficulty") {
      setDifficultyFilter(value);
    } else if (type === "language") {
      setLanguageFilter(value);
    } else if (type === "premium") {
      setPremiumFilter(value);
    }
    fetchPodcasts(1);
  };

  const handlePageChange = (page: number) => {
    fetchPodcasts(page);
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
  const mockPodcasts = [
    {
      id: "1",
      title: "English Daily News",
      description: "Daily news in simple English for language learners",
      image_url:
        "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&q=80",
      audio_url: "https://example.com/audio/daily-news-ep1.mp3",
      difficulty_level: "beginner",
      duration_minutes: 10,
      is_premium: false,
      host: "Sarah Johnson",
      episode_number: 1,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "2",
      title: "Business English Podcast",
      description:
        "Learn business vocabulary and expressions through real-world scenarios",
      image_url:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      audio_url: "https://example.com/audio/business-english-ep5.mp3",
      difficulty_level: "intermediate",
      duration_minutes: 15,
      is_premium: true,
      host: "Michael Brown",
      episode_number: 5,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "3",
      title: "English Literature Discussions",
      description:
        "Deep dive into classic English literature with expert analysis",
      image_url:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      audio_url: "https://example.com/audio/literature-ep3.mp3",
      difficulty_level: "advanced",
      duration_minutes: 25,
      is_premium: true,
      host: "Dr. Emily Wilson",
      episode_number: 3,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "4",
      title: "Travel English Essentials",
      description: "Essential phrases and vocabulary for travelers",
      image_url:
        "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80",
      audio_url: "https://example.com/audio/travel-english-ep7.mp3",
      difficulty_level: "beginner",
      duration_minutes: 12,
      is_premium: false,
      host: "David Chen",
      episode_number: 7,
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
  const displayPodcasts = podcasts.length > 0 ? filteredPodcasts : mockPodcasts;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Podcasts</h1>
              <p className="text-muted-foreground">
                Improve your listening skills with educational podcasts
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/podcasts/new">
                <Plus className="h-4 w-4" />
                <span>Add Podcast</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search podcasts..."
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
                        <SelectItem value="all">All Podcasts</SelectItem>
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

          {/* Podcasts View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayPodcasts.map((podcast) => (
                <Card
                  key={podcast.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 w-full">
                    <img
                      src={
                        podcast.image_url ||
                        "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80"
                      }
                      alt={podcast.title}
                      className="w-full h-full object-cover"
                    />
                    {podcast.is_premium && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                        <Crown className="h-4 w-4" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      <Badge
                        className={getDifficultyColor(podcast.difficulty_level)}
                      >
                        {podcast.difficulty_level.charAt(0).toUpperCase() +
                          podcast.difficulty_level.slice(1)}
                      </Badge>
                      <Badge className="bg-gray-800 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {podcast.duration_minutes} min
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{podcast.title}</CardTitle>
                      <Badge variant="outline">
                        Ep. {podcast.episode_number || 1}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {podcast.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Music className="h-4 w-4 mr-1" />
                      <span>Host: {podcast.host || "Unknown"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/podcasts/${podcast.id}`}>
                        Listen
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/podcasts/${podcast.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/podcasts/${podcast.id}/delete`}>
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
                      Host
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Episode
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
                  {displayPodcasts.map((podcast) => (
                    <tr key={podcast.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                            {podcast.image_url ? (
                              <img
                                src={podcast.image_url}
                                alt={podcast.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Headphones className="h-full w-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{podcast.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {podcast.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{podcast.host || "Unknown"}</td>
                      <td className="px-4 py-3">
                        {podcast.episode_number || 1}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={getDifficultyColor(
                            podcast.difficulty_level,
                          )}
                        >
                          {podcast.difficulty_level.charAt(0).toUpperCase() +
                            podcast.difficulty_level.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {podcast.duration_minutes} minutes
                      </td>
                      <td className="px-4 py-3">
                        {podcast.is_premium ? (
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
                            <Link href={`/dashboard/podcasts/${podcast.id}`}>
                              Listen
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/podcasts/${podcast.id}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/podcasts/${podcast.id}/delete`}
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
          {(!displayPodcasts || displayPodcasts.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <Headphones className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Podcasts Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                {searchQuery
                  ? `No podcasts match your search for "${searchQuery}"`
                  : "Add your first podcast to start building your library."}
              </p>
              <Button asChild>
                <Link href="/dashboard/podcasts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Podcast
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
