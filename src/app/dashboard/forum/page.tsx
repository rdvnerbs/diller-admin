"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Edit,
  Loader2,
  Plus,
  Search,
  Filter,
  Eye,
  Clock,
  Pin,
  Lock,
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
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ForumPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
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

      // Fetch forum categories
      const { data: categoriesData } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("is_active", true)
        .order("order_number");

      setCategories(categoriesData || []);

      // Fetch forum topics with pagination
      await fetchTopics(1, categoryFilter, searchQuery);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchTopics = async (page: number, categoryId = "all", search = "") => {
    setLoading(true);
    const supabase = createClient();

    // Calculate pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Build query
    let query = supabase
      .from("forum_topics")
      .select(
        "*, forum_categories(*), profiles!forum_topics_user_id_fkey(full_name, avatar_url), forum_replies(count)",
      )
      .eq("is_deleted", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    // Apply category filter if selected
    if (categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Get count for pagination
    const { count } = await query.count();
    setTotalPages(Math.ceil((count || 0) / itemsPerPage));

    // Get paginated data
    const { data } = await query.range(from, to);

    setTopics(data || []);
    setFilteredTopics(data || []);
    setCurrentPage(page);
    setLoading(false);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    fetchTopics(1, categoryFilter, searchTerm);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setCategoryFilter(categoryId);
    fetchTopics(1, categoryId, searchQuery);
  };

  const handlePageChange = (page: number) => {
    fetchTopics(page, categoryFilter, searchQuery);
  };

  // Mock data for demonstration
  const mockTopics = [
    {
      id: "1",
      title: "Tips for learning irregular verbs",
      content: "What are your best strategies for memorizing irregular verbs?",
      created_at: "2023-07-15T10:30:00Z",
      updated_at: "2023-07-15T10:30:00Z",
      is_pinned: true,
      is_locked: false,
      view_count: 156,
      forum_categories: {
        name: "Grammar Help",
        color: "green",
      },
      profiles: {
        full_name: "John Smith",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      },
      forum_replies: [
        { id: "1" },
        { id: "2" },
        { id: "3" },
        { id: "4" },
        { id: "5" },
      ],
    },
    {
      id: "2",
      title: "Best podcasts for intermediate learners",
      content:
        "I'm looking for podcast recommendations for intermediate English learners.",
      created_at: "2023-07-14T15:45:00Z",
      updated_at: "2023-07-14T15:45:00Z",
      is_pinned: false,
      is_locked: false,
      view_count: 89,
      forum_categories: {
        name: "Learning Tips",
        color: "amber",
      },
      profiles: {
        full_name: "Emily Johnson",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      },
      forum_replies: [{ id: "1" }, { id: "2" }],
    },
    {
      id: "3",
      title: "Confused about phrasal verbs",
      content: "Can someone explain how to use phrasal verbs correctly?",
      created_at: "2023-07-13T09:15:00Z",
      updated_at: "2023-07-13T09:15:00Z",
      is_pinned: false,
      is_locked: false,
      view_count: 124,
      forum_categories: {
        name: "Grammar Help",
        color: "green",
      },
      profiles: {
        full_name: "Michael Brown",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      },
      forum_replies: [{ id: "1" }, { id: "2" }, { id: "3" }],
    },
    {
      id: "4",
      title: "Community rules and guidelines",
      content: "Please read our community guidelines before posting.",
      created_at: "2023-07-10T08:00:00Z",
      updated_at: "2023-07-10T08:00:00Z",
      is_pinned: true,
      is_locked: true,
      view_count: 312,
      forum_categories: {
        name: "General Discussion",
        color: "blue",
      },
      profiles: {
        full_name: "Admin",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      },
      forum_replies: [],
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
  const displayTopics = topics.length > 0 ? filteredTopics : mockTopics;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
              <p className="text-muted-foreground">
                Discuss language learning with other students and teachers
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/forum/new-topic">
                <Plus className="h-4 w-4" />
                <span>New Topic</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search topics..."
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={categoryFilter}
                onValueChange={handleCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={`border-l-4 hover:shadow-md transition-shadow cursor-pointer`}
                style={{ borderLeftColor: category.color || "#3b82f6" }}
                onClick={() => handleCategoryFilter(category.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare
                      className="h-5 w-5"
                      style={{ color: category.color || "#3b82f6" }}
                    />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Topics List */}
          <div className="bg-white rounded-lg border overflow-hidden mb-6">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold">Discussion Topics</h2>
            </div>
            <div className="divide-y">
              {displayTopics.length > 0 ? (
                displayTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-4 hover:bg-gray-50 ${topic.is_pinned ? "bg-amber-50" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:block">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                          {topic.profiles?.avatar_url ? (
                            <img
                              src={topic.profiles.avatar_url}
                              alt={topic.profiles.full_name || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-bold">
                              {(topic.profiles?.full_name ||
                                "U")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.is_pinned && (
                            <Badge
                              variant="outline"
                              className="text-amber-600 border-amber-300 bg-amber-50"
                            >
                              <Pin className="h-3 w-3 mr-1" /> Pinned
                            </Badge>
                          )}
                          {topic.is_locked && (
                            <Badge
                              variant="outline"
                              className="text-gray-600 border-gray-300 bg-gray-50"
                            >
                              <Lock className="h-3 w-3 mr-1" /> Locked
                            </Badge>
                          )}
                          <Badge
                            className="text-xs"
                            style={{
                              backgroundColor:
                                `${topic.forum_categories?.color}15` ||
                                "#3b82f615",
                              color: topic.forum_categories?.color || "#3b82f6",
                              borderColor:
                                `${topic.forum_categories?.color}30` ||
                                "#3b82f630",
                            }}
                          >
                            {topic.forum_categories?.name || "General"}
                          </Badge>
                        </div>
                        <Link
                          href={`/dashboard/forum/topics/${topic.id}`}
                          className="font-medium text-lg hover:text-blue-600 transition-colors"
                        >
                          {topic.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {topic.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(topic.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {topic.forum_replies?.length || 0} replies
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {topic.view_count} views
                          </span>
                          <span>
                            by {topic.profiles?.full_name || "Anonymous"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No Topics Found
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    {searchQuery
                      ? `No topics match your search for "${searchQuery}"`
                      : categoryFilter !== "all"
                        ? "No topics in this category yet"
                        : "Be the first to start a discussion!"}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/forum/new-topic">
                      <Plus className="h-4 w-4 mr-2" />
                      Start a New Topic
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

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
