"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
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
  Users,
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function DialogsPage() {
  const router = useRouter();
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [filteredDialogs, setFilteredDialogs] = useState<any[]>([]);
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

      // Fetch dialogs with pagination
      await fetchDialogs(1);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchDialogs = async (page: number) => {
    setLoading(true);
    const supabase = createClient();
    
    // Calculate pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    // Build query
    let query = supabase
      .from("dialogs")
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
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    
    // Get count for pagination
    const { count } = await query.count();
    setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    
    // Get paginated data
    const { data } = await query.range(from, to);
    
    setDialogs(data || []);
    setFilteredDialogs(data || []);
    setCurrentPage(page);
    setLoading(false);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    fetchDialogs(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "difficulty") {
      setDifficultyFilter(value);
    } else if (type === "language") {
      setLanguageFilter(value);
    } else if (type === "premium") {
      setPremiumFilter(value);
    }
    fetchDialogs(1);
  };

  const handlePageChange = (page: number) => {
    fetchDialogs(page);
  };

  const getDifficultyColor = (level: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-purple-100 text-purple-800",
      expert: "bg-red-100 text-red-800"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Mock data for demonstration
  const mockDialogs = [
    {
      id: "1",
      title: "At the Restaurant",
      description: "A conversation between a customer and a waiter at a restaurant",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      audio_url: "https://example.com/audio/restaurant-dialog.mp3",
      difficulty_level: "beginner",
      duration_minutes: 3,
      is_premium: false,
      content: {
        speakers: ["Waiter", "Customer"],
        lines: 8
      },
      languages: {
        name: "English",
        code: "en"
      }
    },
    {
      id: "2",
      title: "Job Interview",
      description: "A dialog between an interviewer and a job applicant",
      image_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80",
      audio_url: "https://example.com/audio/job-interview.mp3",
      difficulty_level: "intermediate",
      duration_minutes: 5,
      is_premium: true,
      content: {
        speakers: ["Interviewer", "Applicant"],
        lines: 12
      },
      languages: {
        name: "English",
        code: "en"
      }
    },
    {
      id: "3",
      title: "At the Doctor's Office",
      description: "A conversation between a patient and a doctor",
      image_url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
      audio_url: "https://example.com/audio/doctors-office.mp3",
      difficulty_level: "intermediate",
      duration_minutes: 4,
      is_premium: false,
      content: {
        speakers: ["Doctor", "Patient"],
        lines: 10
      },
      languages: {
        name: "English",
        code: "en"
      }
    },
    {
      id: "4",
      title: "Business Negotiation",
      description: "A complex business negotiation between two executives",
      image_url: "https://images.unsplash.com/photo-1573497491765-55a64cc0144c?w=800&q=80",
      audio_url: "https://example.com/audio/business-negotiation.mp3",
      difficulty_level: "advanced",
      duration_minutes: 8,
      is_premium: true,
      content: {
        speakers: ["CEO", "Investor"],
        lines: 16
      },
      languages: {
        name: "English",
        code: "en"
      }
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
  const displayDialogs = dialogs.length > 0 ? filteredDialogs : mockDialogs;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dialogs</h1>
              <p className="text-muted-foreground">
                Practice real-life conversations with interactive dialogs
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/dialogs/new">
                <Plus className="h-4 w-4" />
                <span>Add Dialog</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search dialogs..."
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
                      onValueChange={(value) => handleFilterChange("difficulty", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2 border-t">
                    <p className="text-sm font-medium mb-2">Language</p>
                    <Select
                      value={languageFilter}
                      onValueChange={(value) => handleFilterChange("language", value)}
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
                      onValueChange={(value) => handleFilterChange("premium", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dialogs</SelectItem>
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

          {/* Dialogs View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayDialogs.map((dialog) => (
                <Card
                  key={dialog.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 w-full">
                    <img
                      src={dialog.image_url || "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=800&q=80"}
                      alt={dialog.title}
                      className="w-full h-full object-cover"
                    />
                    {dialog.is_premium && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                        <Crown className="h-4 w-4" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      <Badge className={getDifficultyColor(dialog.difficulty_level)}>
                        {dialog.difficulty_level.charAt(0).toUpperCase() + dialog.difficulty_level.slice(1)}
                      </Badge>
                      <Badge className="bg-gray-800 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {dialog.duration_minutes} min
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{dialog.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {dialog.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>
                        {dialog.content?.speakers?.length || 2} speakers, {dialog.content?.lines || 0} lines
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/dialogs/${dialog.id}`}>
                        Practice
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/dialogs/${dialog.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/dialogs/${dialog.id}/delete`}>
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
                  {displayDialogs.map((dialog) => (
                    <tr key={dialog.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                            {dialog.image_url ? (
                              <img
                                src={dialog.image_url}
                                alt={dialog.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <MessageSquare className="h-full w-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{dialog.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {dialog.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {dialog.languages?.name || "English"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getDifficultyColor(dialog.difficulty_level)}>
                          {dialog.difficulty_level.charAt(0).toUpperCase() + dialog.difficulty_level.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {dialog.duration_minutes} minutes
                      </td>
                      <td className="px-4 py-3">
                        {dialog.is_premium ? (
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
                            <Link href={`/dashboard/dialogs/${dialog.id}`}>
                              Practice
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/dialogs/${dialog.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/dialogs/${dialog.id}/delete`}>
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
          {(!displayDialogs || displayDialogs.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Dialogs Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                {searchQuery
                  ? `No dialogs match your search for "${searchQuery}"`
                  : "Add your first dialog to start practicing conversations."}
              </p>
              <Button asChild>
                <Link href="/dashboard/dialogs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dialog
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
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
