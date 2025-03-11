"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Globe,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LanguagesPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<any[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

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

      // Fetch languages
      const { data } = await supabase
        .from("languages")
        .select("*")
        .order("name");

      setLanguages(data || []);
      setFilteredLanguages(data || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Languages</h1>
              <p className="text-muted-foreground">
                Manage the languages available on the platform
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/languages/new">
                <Plus className="h-4 w-4" />
                <span>Add Language</span>
              </Link>
            </Button>
          </header>

          {/* Search Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search languages..."
                className="pl-10 bg-white"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filteredLanguages = languages?.filter(
                    (lang) =>
                      lang.name.toLowerCase().includes(searchTerm) ||
                      lang.code.toLowerCase().includes(searchTerm),
                  );
                  setFilteredLanguages(filteredLanguages || []);
                }}
              />
            </div>
            <div className="flex gap-2">
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

          {/* Languages View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLanguages.map((language) => (
                <Card
                  key={language.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {language.flag_url ? (
                          <img
                            src={language.flag_url}
                            alt={language.name}
                            className="w-8 h-6 object-cover rounded-sm border border-gray-200"
                          />
                        ) : (
                          <Globe className="h-6 w-6 text-blue-500" />
                        )}
                        <CardTitle className="text-lg">
                          {language.name}
                        </CardTitle>
                      </div>
                      <div className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {language.code.toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${language.is_active ? "bg-green-500" : "bg-gray-300"} mr-2`}
                        ></div>
                        <span className="text-sm text-muted-foreground">
                          {language.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/languages/${language.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/languages/${language.id}/delete`}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Link>
                        </Button>
                      </div>
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
                      Language
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Code
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
                  {filteredLanguages.map((language) => (
                    <tr key={language.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {language.flag_url ? (
                            <img
                              src={language.flag_url}
                              alt={language.name}
                              className="w-6 h-4 object-cover rounded-sm border border-gray-200"
                            />
                          ) : (
                            <Globe className="h-5 w-5 text-blue-500" />
                          )}
                          <span className="font-medium">{language.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {language.code.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${language.is_active ? "bg-green-500" : "bg-gray-300"} mr-2`}
                          ></div>
                          <span className="text-sm text-muted-foreground">
                            {language.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/languages/${language.id}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/languages/${language.id}/delete`}
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
          {(!filteredLanguages || filteredLanguages.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Languages Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Add your first language to start creating courses.
              </p>
              <Button asChild>
                <Link href="/dashboard/languages/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
