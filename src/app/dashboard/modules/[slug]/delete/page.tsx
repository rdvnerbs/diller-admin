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
import { AlertTriangle, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DeleteModulePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [module, setModule] = useState<any>(null);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchModule = async () => {
      try {
        // Fetch module with category info
        const { data, error } = await supabase
          .from("learning_modules")
          .select("*, learning_categories(name, color)")
          .eq("slug", params.slug)
          .single();

        if (error || !data) {
          router.push("/dashboard/modules");
          return;
        }

        setModule(data);

        // Count associated exercises
        const { data: exercises } = await supabase
          .from("exercises")
          .select("id")
          .eq("module_id", data.id);

        setExerciseCount(exercises?.length || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching module:", error);
        router.push("/dashboard/modules");
      }
    };

    fetchModule();
  }, [params.slug]);

  const handleDeleteModule = async () => {
    try {
      setError("");
      setDeleting(true);

      // Delete module
      const { error } = await supabase
        .from("learning_modules")
        .delete()
        .eq("id", module.id);

      if (error) {
        setError(error.message);
        setDeleting(false);
        return;
      }

      router.push("/dashboard/modules");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting module:", error);
      setError(error.message || "Failed to delete module");
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
          <Link href={`/dashboard/modules/${params.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-600">Delete Module</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">
              Are you sure you want to delete this module?
            </CardTitle>
          </div>
          <CardDescription>
            This action cannot be undone. This will permanently delete the
            module and all associated exercises.
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
                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                  {module.image_url ? (
                    <img
                      src={module.image_url}
                      alt={module.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-full w-full p-2 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {module.learning_categories?.name || "Uncategorized"} ·{" "}
                    {module.difficulty_level || "Beginner"}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-md border border-red-100 mt-4">
                <p className="text-red-700 font-medium">
                  Warning: This module has {exerciseCount} exercise
                  {exerciseCount !== 1 ? "s" : ""}.
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Deleting this module will also delete all associated exercises
                  and user progress.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-medium mb-2">Consequences:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>This module will be permanently removed from the system</li>
                <li>
                  All exercises in this module will be permanently deleted
                </li>
                <li>User progress related to this module will be lost</li>
                <li>This action cannot be reversed</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/modules/${params.slug}`}>Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteModule}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Module
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
