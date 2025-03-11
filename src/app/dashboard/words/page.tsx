"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Trash,
  BookOpen,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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

export default function WordsPage() {
  const router = useRouter();
  const [words, setWords] = useState<any[]>([]);
  const [filteredWords, setFilteredWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

      // Fetch words
      const { data } = await supabase
        .from("words")
        .select("*")
        .order("kelime_en");

      setWords(data || []);
      setFilteredWords(data || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const applyFilters = (
    searchTerm = "",
    level = levelFilter,
    type = typeFilter,
  ) => {
    let filtered = [...words];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (word) =>
          word.kelime_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          word.kelime_tr.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply level filter
    if (level !== "all") {
      filtered = filtered.filter((word) => word.seviye === level);
    }

    // Apply type filter
    if (type !== "all") {
      filtered = filtered.filter((word) => word.kelime_turu === type);
    }

    setFilteredWords(filtered);
  };

  // Mock data for demonstration
  const mockWords = [
    {
      id: "1",
      kelime_en: "Hello",
      kelime_tr: "Merhaba",
      kelime_en_aciklama: "Used as a greeting",
      kelime_tr_aciklama: "Selamlama için kullanılır",
      resim_url:
        "https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=800&q=80",
      ses_url: "https://example.com/audio/hello.mp3",
      seviye: "beginner",
      kelime_turu: "greeting",
    },
    {
      id: "2",
      kelime_en: "Goodbye",
      kelime_tr: "Hoşçakal",
      kelime_en_aciklama: "Used when parting",
      kelime_tr_aciklama: "Ayrılırken kullanılır",
      resim_url:
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
      ses_url: "https://example.com/audio/goodbye.mp3",
      seviye: "beginner",
      kelime_turu: "greeting",
    },
    {
      id: "3",
      kelime_en: "Thank you",
      kelime_tr: "Teşekkür ederim",
      kelime_en_aciklama: "Used to express gratitude",
      kelime_tr_aciklama: "Minnettarlık ifade etmek için kullanılır",
      resim_url:
        "https://images.unsplash.com/photo-1532499016263-f2c3e89de9cd?w=800&q=80",
      ses_url: "https://example.com/audio/thankyou.mp3",
      seviye: "beginner",
      kelime_turu: "expression",
    },
    {
      id: "4",
      kelime_en: "Meeting",
      kelime_tr: "Toplantı",
      kelime_en_aciklama: "A gathering of people for a specific purpose",
      kelime_tr_aciklama: "Belirli bir amaç için insanların bir araya gelmesi",
      resim_url:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
      ses_url: "https://example.com/audio/meeting.mp3",
      seviye: "intermediate",
      kelime_turu: "noun",
    },
    {
      id: "5",
      kelime_en: "Collaborate",
      kelime_tr: "İşbirliği yapmak",
      kelime_en_aciklama: "Work jointly on an activity or project",
      kelime_tr_aciklama: "Bir aktivite veya projede birlikte çalışmak",
      resim_url:
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80",
      ses_url: "https://example.com/audio/collaborate.mp3",
      seviye: "advanced",
      kelime_turu: "verb",
    },
    {
      id: "6",
      kelime_en: "Efficient",
      kelime_tr: "Verimli",
      kelime_en_aciklama:
        "Achieving maximum productivity with minimum wasted effort",
      kelime_tr_aciklama: "Minimum çaba ile maksimum üretkenliğe ulaşmak",
      resim_url:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      ses_url: "https://example.com/audio/efficient.mp3",
      seviye: "intermediate",
      kelime_turu: "adjective",
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
  const displayWords = words.length > 0 ? filteredWords : mockWords;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Vocabulary</h1>
              <p className="text-muted-foreground">
                Manage the vocabulary words for language learning
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/words/new">
                <Plus className="h-4 w-4" />
                <span>Add Word</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search words..."
                className="pl-10 bg-white"
                onChange={(e) => {
                  const searchTerm = e.target.value;
                  applyFilters(searchTerm, levelFilter, typeFilter);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={levelFilter}
                onValueChange={(value) => {
                  setLevelFilter(value);
                  applyFilters("", value, typeFilter);
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
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  applyFilters("", levelFilter, value);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="noun">Noun</SelectItem>
                  <SelectItem value="verb">Verb</SelectItem>
                  <SelectItem value="adjective">Adjective</SelectItem>
                  <SelectItem value="adverb">Adverb</SelectItem>
                  <SelectItem value="pronoun">Pronoun</SelectItem>
                  <SelectItem value="preposition">Preposition</SelectItem>
                  <SelectItem value="conjunction">Conjunction</SelectItem>
                  <SelectItem value="interjection">Interjection</SelectItem>
                  <SelectItem value="expression">Expression</SelectItem>
                  <SelectItem value="greeting">Greeting</SelectItem>
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

          {/* Words View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayWords.map((word) => (
                <Card
                  key={word.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 w-full bg-gray-100">
                    {word.resim_url ? (
                      <img
                        src={word.resim_url}
                        alt={word.kelime_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {word.kelime_en}
                          {word.ses_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6"
                            >
                              <Volume2 className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                        </CardTitle>
                        <CardDescription>{word.kelime_tr}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {word.seviye || "beginner"}
                        </span>
                        <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {word.kelime_turu || "noun"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">
                      {word.kelime_en_aciklama}
                    </p>
                    <p className="text-sm text-gray-500 italic">
                      {word.kelime_tr_aciklama}
                    </p>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/words/${word.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/words/${word.id}/delete`}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      English
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Turkish
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayWords.map((word) => (
                    <tr key={word.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{word.kelime_en}</span>
                          {word.ses_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6"
                            >
                              <Volume2 className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {word.kelime_en_aciklama}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span>{word.kelime_tr}</span>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {word.kelime_tr_aciklama}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {word.seviye || "beginner"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {word.kelime_turu || "noun"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/words/${word.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/words/${word.id}/delete`}>
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
          {(!displayWords || displayWords.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Words Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Add your first vocabulary word to start building your language
                resources.
              </p>
              <Button asChild>
                <Link href="/dashboard/words/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Word
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
