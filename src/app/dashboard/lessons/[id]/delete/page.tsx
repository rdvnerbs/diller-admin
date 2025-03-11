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

export default function DeleteLessonPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("*, courses(title)")
          .eq("id", params.id)
          .single();

        if (error || !data) {
          router.push("/dashboard/courses");
          return;
        }

        setLesson(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        router.push("/dashboard/courses");
      }
    };

    fetchLesson();
  }, [params.id, router, supabase]);

  const handleDeleteLesson = async () => {
    try {
      setError("");
      setDeleting(true);

      // Delete lesson
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      router.push(`/dashboard/courses/${lesson.course_id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      setError(error.message || "Failed to delete lesson");
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
          <Link href={`/dashboard/courses/${lesson.course_id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-600">Delete Lesson</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">
              Are you sure you want to delete this lesson?
            </CardTitle>
          </div>
          <CardDescription>
            This action cannot be undone. This will permanently delete the
            lesson and all associated data.
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
              <h3 className="font-medium mb-2">Lesson Details:</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">Title:</span>{" "}
                  <span className="font-medium">{lesson.title}</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Course:</span>{" "}
                  <span className="font-medium">
                    {lesson.courses?.title || "Unknown Course"}
                  </span>
                </li>
                <li>
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium">
                    {lesson.duration_minutes} minutes
                  </span>
                </li>
                <li>
                  <span className="text-muted-foreground">Order:</span>{" "}
                  <span className="font-medium">{lesson.order_number}</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-medium mb-2">Consequences:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>This lesson will be permanently removed from the course</li>
                <li>Any user progress related to this lesson will be lost</li>
                <li>
                  Content and materials associated with this lesson will be
                  deleted
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/courses/${lesson.course_id}`}>Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteLesson}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Lesson
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
