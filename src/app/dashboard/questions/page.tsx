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

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
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

      // Fetch questions with language info
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*, languages(name, code)")
        .order("created_at", { ascending: false });

      // Fetch languages for filter
      const { data: languagesData } = await supabase
        .from("languages")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      setQuestions(questionsData || []);
      setFilteredQuestions(questionsData || []);
      setLanguages(languagesData || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const applyFilters = (
    searchTerm = "",
    difficulty = difficultyFilter,
    type = typeFilter,
    language = languageFilter,
  ) => {
    let filtered = [...questions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (question.description &&
            question.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    // Apply difficulty filter
    if (difficulty !== "all") {
      filtered = filtered.filter(
        (question) => question.difficulty_level === difficulty,
      );
    }

    // Apply type filter
    if (type !== "all") {
      filtered = filtered.filter((question) => question.type === type);
    }

    // Apply language filter
    if (language !== "all") {
      filtered = filtered.filter(
        (question) => question.language_id === language,
      );
    }

    setFilteredQuestions(filtered);
  };

  const getQuestionTypeLabel = (type: string) => {
    const types = {
      multiple_choice: "Multiple Choice",
      matching: "Matching",
      word_image: "Word-Image Matching",
      audio_word: "Audio-Word Matching",
      audio_multiple_choice: "Audio Multiple Choice",
      fill_in_blank_text: "Fill in Blank (Text)",
      fill_in_blank_choice: "Fill in Blank (Choice)",
      dictation: "Dictation",
      translation: "Translation",
      word_completion: "Word Completion",
      sentence_completion: "Sentence Completion",
    };
    return types[type as keyof typeof types] || type;
  };

  const getQuestionTypeColor = (type: string) => {
    const colors = {
      multiple_choice: "bg-blue-100 text-blue-800",
      matching: "bg-green-100 text-green-800",
      word_image: "bg-purple-100 text-purple-800",
      audio_word: "bg-pink-100 text-pink-800",
      audio_multiple_choice: "bg-indigo-100 text-indigo-800",
      fill_in_blank_text: "bg-yellow-100 text-yellow-800",
      fill_in_blank_choice: "bg-amber-100 text-amber-800",
      dictation: "bg-teal-100 text-teal-800",
      translation: "bg-cyan-100 text-cyan-800",
      word_completion: "bg-orange-100 text-orange-800",
      sentence_completion: "bg-rose-100 text-rose-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
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
  const mockQuestions = [
    {
      id: "1",
      title: "Basic Greetings",
      description: "Choose the correct greeting for the given situation",
      type: "multiple_choice",
      difficulty_level: "beginner",
      points: 10,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "2",
      title: "Match the Words",
      description: "Match English words with their Turkish translations",
      type: "matching",
      difficulty_level: "beginner",
      points: 15,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "3",
      title: "Listen and Choose",
      description: "Listen to the audio and select the correct word",
      type: "audio_multiple_choice",
      difficulty_level: "intermediate",
      points: 20,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "4",
      title: "Complete the Sentence",
      description: "Fill in the blank with the correct word",
      type: "fill_in_blank_choice",
      difficulty_level: "intermediate",
      points: 15,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "5",
      title: "Translate the Sentence",
      description: "Translate the given sentence from English to Turkish",
      type: "translation",
      difficulty_level: "advanced",
      points: 25,
      languages: {
        name: "English",
        code: "en",
      },
    },
    {
      id: "6",
      title: "Word and Image Matching",
      description: "Match the word with the correct image",
      type: "word_image",
      difficulty_level: "beginner",
      points: 10,
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
  const displayQuestions =
    questions.length > 0 ? filteredQuestions : mockQuestions;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Questions</h1>
              <p className="text-muted-foreground">
                Manage questions for exercises and exams
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/questions/new">
                <Plus className="h-4 w-4" />
                <span>Create Question</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search questions..."
                className="pl-10 bg-white"
                onChange={(e) => {
                  const searchTerm = e.target.value;
                  applyFilters(
                    searchTerm,
                    difficultyFilter,
                    typeFilter,
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
                        applyFilters("", value, typeFilter, languageFilter);
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
                    <p className="text-sm font-medium mb-2">Question Type</p>
                    <Select
                      value={typeFilter}
                      onValueChange={(value) => {
                        setTypeFilter(value);
                        applyFilters(
                          "",
                          difficultyFilter,
                          value,
                          languageFilter,
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="multiple_choice">
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value="matching">Matching</SelectItem>
                        <SelectItem value="word_image">
                          Word-Image Matching
                        </SelectItem>
                        <SelectItem value="audio_word">
                          Audio-Word Matching
                        </SelectItem>
                        <SelectItem value="audio_multiple_choice">
                          Audio Multiple Choice
                        </SelectItem>
                        <SelectItem value="fill_in_blank_text">
                          Fill in Blank (Text)
                        </SelectItem>
                        <SelectItem value="fill_in_blank_choice">
                          Fill in Blank (Choice)
                        </SelectItem>
                        <SelectItem value="dictation">Dictation</SelectItem>
                        <SelectItem value="translation">Translation</SelectItem>
                        <SelectItem value="word_completion">
                          Word Completion
                        </SelectItem>
                        <SelectItem value="sentence_completion">
                          Sentence Completion
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2 border-t">
                    <p className="text-sm font-medium mb-2">Language</p>
                    <Select
                      value={languageFilter}
                      onValueChange={(value) => {
                        setLanguageFilter(value);
                        applyFilters("", difficultyFilter, typeFilter, value);
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

          {/* Questions View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayQuestions.map((question) => (
                <Card
                  key={question.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {question.title}
                      </CardTitle>
                      <Badge className={getQuestionTypeColor(question.type)}>
                        {getQuestionTypeLabel(question.type)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {question.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        className={getDifficultyColor(
                          question.difficulty_level,
                        )}
                      >
                        {question.difficulty_level.charAt(0).toUpperCase() +
                          question.difficulty_level.slice(1)}
                      </Badge>
                      <Badge variant="outline">{question.points} points</Badge>
                      {question.languages && (
                        <Badge variant="outline">
                          {question.languages.name}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/questions/${question.id}`}>
                        View
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/questions/${question.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/questions/${question.id}/delete`}
                        >
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
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Difficulty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Points
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Language
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayQuestions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{question.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {question.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getQuestionTypeColor(question.type)}>
                          {getQuestionTypeLabel(question.type)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={getDifficultyColor(
                            question.difficulty_level,
                          )}
                        >
                          {question.difficulty_level.charAt(0).toUpperCase() +
                            question.difficulty_level.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span>{question.points} points</span>
                      </td>
                      <td className="px-4 py-3">
                        {question.languages?.name || "English"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/questions/${question.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/questions/${question.id}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/questions/${question.id}/delete`}
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
          {(!displayQuestions || displayQuestions.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Questions Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Create your first question to start building exercises and
                exams.
              </p>
              <Button asChild>
                <Link href="/dashboard/questions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Question
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
