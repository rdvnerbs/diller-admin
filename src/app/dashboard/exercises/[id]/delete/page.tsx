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
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DeleteExercisePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [exercise, setExercise] = useState<any>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data: exerciseData, error } = await supabase
          .from("exercises")
          .select("*, learning_modules(title)")
          .eq("id", params.id)
          .single();

        if (error || !exerciseData) {
          router.push("/dashboard/exercises");
          return;
        }

        setExercise(exerciseData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exercise:", error);
        router.push("/dashboard/exercises");
      }
    };

    fetchExercise();
  }, [params.id]);

  const handleDeleteExercise = async () => {
    if (!exercise) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exercise.id);

      if (error) throw error;

      router.push("/dashboard/exercises");
      router.refresh();
    } catch (error) {
      console.error("Error deleting exercise:", error);
    } finally {
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
          <Link href={`/dashboard/exercises/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercise
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-600">Delete Exercise</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">
              Are you sure you want to delete this exercise?
            </CardTitle>
          </div>
          <CardDescription>
            This action cannot be undone. This will permanently delete the
            exercise and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-medium mb-2">Exercise Details:</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">Title:</span>{" "}
                  <span className="font-medium">{exercise.title}</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-medium">
                    {exercise.type === "multiple-choice"
                      ? "Multiple Choice"
                      : exercise.type === "matching"
                        ? "Matching"
                        : exercise.type === "listening"
                          ? "Listening"
                          : exercise.type}
                  </span>
                </li>
                {exercise.learning_modules && (
                  <li>
                    <span className="text-muted-foreground">Module:</span>{" "}
                    <span className="font-medium">
                      {exercise.learning_modules.title}
                    </span>
                  </li>
                )}
                <li>
                  <span className="text-muted-foreground">Points:</span>{" "}
                  <span className="font-medium">{exercise.points}</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-medium mb-2">Consequences:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  This exercise will be permanently removed from the system
                </li>
                <li>
                  Any user progress or attempts related to this exercise will be
                  lost
                </li>
                <li>
                  This exercise will no longer appear in any learning modules
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/exercises/${params.id}`}>Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteExercise}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Exercise
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
