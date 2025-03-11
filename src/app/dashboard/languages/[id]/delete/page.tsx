"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Globe, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DeleteLanguagePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [language, setLanguage] = useState<any>(null);
  const [courseCount, setCourseCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        // Fetch language
        const { data, error } = await supabase
          .from("languages")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error || !data) {
          router.push("/dashboard/languages");
          return;
        }

        setLanguage(data);

        // Count associated courses
        const { count } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true })
          .eq("language_id", params.id);

        setCourseCount(count || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching language:", error);
        router.push("/dashboard/languages");
      }
    };

    fetchLanguage();
  }, [params.id]);

  const handleDeleteLanguage = async () => {
    try {
      setError("");
      setDeleting(true);

      // Delete language
      const { error } = await supabase
        .from("languages")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      router.push("/dashboard/languages");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting language:", error);
      setError(error.message || "Failed to delete language");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/dashboard/languages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Languages
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-600">Delete Language</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">
              Are you sure you want to delete this language?
            </CardTitle>
          </div>
          <CardDescription>
            This action cannot be undone. This will permanently delete the
            language and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                {language.flag_url ? (
                  <img
                    src={language.flag_url}
                    alt={language.name}
                    className="w-10 h-6 object-cover rounded-sm border border-gray-200"
                  />
                ) : (
                  <Globe className="h-8 w-8 text-blue-500" />
                )}
                <div>
                  <h3 className="font-medium text-lg">{language.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Code: {language.code.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-md border border-red-100 mt-4">
                <p className="text-red-700 font-medium">
                  Warning: This language has {courseCount} associated course
                  {courseCount !== 1 ? "s" : ""}.
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Deleting this language will also delete all associated
                  courses, lessons, and exercises.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-medium mb-2">Consequences:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  This language will be permanently removed from the system
                </li>
                <li>
                  All courses in this language will be permanently deleted
                </li>
                <li>
                  All lessons and exercises in those courses will be permanently
                  deleted
                </li>
                <li>User progress related to this language will be lost</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/languages">Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteLanguage}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Language
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
