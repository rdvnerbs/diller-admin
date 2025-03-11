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
  MessageSquare,
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

export default function SentencesPage() {
  const router = useRouter();
  const [sentences, setSentences] = useState<any[]>([]);
  const [filteredSentences, setFilteredSentences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [levelFilter, setLevelFilter] = useState("all");
  const [grammarFilter, setGrammarFilter] = useState("all");

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

      // Fetch sentences
      const { data } = await supabase
        .from("sentences")
        .select("*")
        .order("cumle_en");

      setSentences(data || []);
      setFilteredSentences(data || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const applyFilters = (
    searchTerm = "",
    level = levelFilter,
    grammar = grammarFilter,
  ) => {
    let filtered = [...sentences];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sentence) =>
          sentence.cumle_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sentence.cumle_tr.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply level filter
    if (level !== "all") {
      filtered = filtered.filter((sentence) => sentence.seviye === level);
    }

    // Apply grammar filter
    if (grammar !== "all") {
      filtered = filtered.filter(
        (sentence) => sentence.gramer_konusu === grammar,
      );
    }

    setFilteredSentences(filtered);
  };

  // Mock data for demonstration
  const mockSentences = [
    {
      id: "1",
      cumle_en: "I am going to the store.",
      cumle_tr: "Mağazaya gidiyorum.",
      cumle_zaman: "present continuous",
      gramer_konusu: "present_continuous",
      cumle_ogeleri: { subject: "I", verb: "am going", object: "to the store" },
      resim_url:
        "https://images.unsplash.com/photo-1601600576337-c1d8a1b85faf?w=800&q=80",
      ses_url: "https://example.com/audio/sentence1.mp3",
      seviye: "beginner",
    },
    {
      id: "2",
      cumle_en: "She has been working here for five years.",
      cumle_tr: "Beş yıldır burada çalışıyor.",
      cumle_zaman: "present perfect continuous",
      gramer_konusu: "present_perfect_continuous",
      cumle_ogeleri: {
        subject: "She",
        verb: "has been working",
        object: "here",
        time: "for five years",
      },
      resim_url:
        "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80",
      ses_url: "https://example.com/audio/sentence2.mp3",
      seviye: "intermediate",
    },
    {
      id: "3",
      cumle_en: "If I had known, I would have told you.",
      cumle_tr: "Bilseydim, sana söylerdim.",
      cumle_zaman: "past perfect conditional",
      gramer_konusu: "third_conditional",
      cumle_ogeleri: {
        condition: { subject: "I", verb: "had known" },
        result: { subject: "I", verb: "would have told", object: "you" },
      },
      resim_url: null,
      ses_url: "https://example.com/audio/sentence3.mp3",
      seviye: "advanced",
    },
    {
      id: "4",
      cumle_en: "Could you please pass me the salt?",
      cumle_tr: "Tuzu bana uzatabilir misin lütfen?",
      cumle_zaman: "modal verb",
      gramer_konusu: "modals_requests",
      cumle_ogeleri: {
        subject: "you",
        verb: "could pass",
        indirect_object: "me",
        direct_object: "the salt",
      },
      resim_url:
        "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=80",
      ses_url: "https://example.com/audio/sentence4.mp3",
      seviye: "beginner",
    },
    {
      id: "5",
      cumle_en: "By the time we arrived, the movie had already started.",
      cumle_tr: "Biz vardığımızda film çoktan başlamıştı.",
      cumle_zaman: "past perfect",
      gramer_konusu: "past_perfect",
      cumle_ogeleri: {
        time_clause: { subject: "we", verb: "arrived" },
        main_clause: { subject: "the movie", verb: "had started" },
      },
      resim_url:
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80",
      ses_url: "https://example.com/audio/sentence5.mp3",
      seviye: "intermediate",
    },
    {
      id: "6",
      cumle_en: "Not only did she win the race, but she also broke the record.",
      cumle_tr:
        "Sadece yarışı kazanmakla kalmadı, aynı zamanda rekoru da kırdı.",
      cumle_zaman: "past simple",
      gramer_konusu: "correlative_conjunctions",
      cumle_ogeleri: {
        first_clause: { subject: "she", verb: "did win", object: "the race" },
        second_clause: { subject: "she", verb: "broke", object: "the record" },
      },
      resim_url:
        "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&q=80",
      ses_url: "https://example.com/audio/sentence6.mp3",
      seviye: "advanced",
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
  const displaySentences =
    sentences.length > 0 ? filteredSentences : mockSentences;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Example Sentences</h1>
              <p className="text-muted-foreground">
                Manage example sentences for language learning
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/sentences/new">
                <Plus className="h-4 w-4" />
                <span>Add Sentence</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search sentences..."
                className="pl-10 bg-white"
                onChange={(e) => {
                  const searchTerm = e.target.value;
                  applyFilters(searchTerm, levelFilter, grammarFilter);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={levelFilter}
                onValueChange={(value) => {
                  setLevelFilter(value);
                  applyFilters("", value, grammarFilter);
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
                value={grammarFilter}
                onValueChange={(value) => {
                  setGrammarFilter(value);
                  applyFilters("", levelFilter, value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by grammar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grammar Topics</SelectItem>
                  <SelectItem value="present_simple">Present Simple</SelectItem>
                  <SelectItem value="present_continuous">
                    Present Continuous
                  </SelectItem>
                  <SelectItem value="past_simple">Past Simple</SelectItem>
                  <SelectItem value="past_continuous">
                    Past Continuous
                  </SelectItem>
                  <SelectItem value="present_perfect">
                    Present Perfect
                  </SelectItem>
                  <SelectItem value="present_perfect_continuous">
                    Present Perfect Continuous
                  </SelectItem>
                  <SelectItem value="past_perfect">Past Perfect</SelectItem>
                  <SelectItem value="future_simple">Future Simple</SelectItem>
                  <SelectItem value="modals_requests">
                    Modals - Requests
                  </SelectItem>
                  <SelectItem value="third_conditional">
                    Third Conditional
                  </SelectItem>
                  <SelectItem value="correlative_conjunctions">
                    Correlative Conjunctions
                  </SelectItem>
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

          {/* Sentences View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displaySentences.map((sentence) => (
                <Card
                  key={sentence.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="line-clamp-1">
                            {sentence.cumle_en}
                          </span>
                          {sentence.ses_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6 flex-shrink-0"
                            >
                              <Volume2 className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {sentence.cumle_tr}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                          {sentence.seviye || "beginner"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {(sentence.gramer_konusu || "grammar").replace(
                          /_/g,
                          " ",
                        )}
                      </span>
                      <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {(sentence.cumle_zaman || "tense").replace(/_/g, " ")}
                      </span>
                    </div>

                    {sentence.resim_url && (
                      <div className="h-32 w-full mb-3">
                        <img
                          src={sentence.resim_url}
                          alt={sentence.cumle_en}
                          className="h-full w-full object-cover rounded-md"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/sentences/${sentence.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/sentences/${sentence.id}/delete`}
                        >
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
                      Grammar
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Level
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displaySentences.map((sentence) => (
                    <tr key={sentence.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium line-clamp-1">
                            {sentence.cumle_en}
                          </span>
                          {sentence.ses_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6"
                            >
                              <Volume2 className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="line-clamp-1">
                          {sentence.cumle_tr}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full inline-block w-fit">
                            {(sentence.gramer_konusu || "grammar").replace(
                              /_/g,
                              " ",
                            )}
                          </span>
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block w-fit">
                            {(sentence.cumle_zaman || "tense").replace(
                              /_/g,
                              " ",
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {sentence.seviye || "beginner"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/sentences/${sentence.id}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/sentences/${sentence.id}/delete`}
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
          {(!displaySentences || displaySentences.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Sentences Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Add your first example sentence to start building your language
                resources.
              </p>
              <Button asChild>
                <Link href="/dashboard/sentences/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sentence
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
