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

export default function DeleteCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [lessonCount, setLessonCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Fetch course with language info
        const { data, error } = await supabase
          .from("courses")
          .select("*, languages(name, code, flag_url)")
          .eq("id", params.id)
          .single();

        if (error || !data) {
          router.push("/dashboard/courses");
          return;
        }

        setCourse(data);

        // Count associated lessons
        const { count } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("course_id", params.id);

        setLessonCount(count || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        router.push("/dashboard/courses");
      }
    };

    fetchCourse();
  }, [params.id]);

  const handleDeleteCourse = async () => {
    try {
      setError("");
      setDeleting(true);

      // Delete course
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      router.push("/dashboard/courses");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting course:", error);
      setError(error.message || "Failed to delete course");
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
          <Link href={`/dashboard/courses/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-600">Delete Course</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">
              Are you sure you want to delete this course?
            </CardTitle>
          </div>
          <CardDescription>
            This action cannot be undone. This will permanently delete the
            course and all associated lessons and exercises.
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
                <div className="h-12 w-12 rounded-md overflow-hidden">
                  <img
                    src={
                      course.image_url ||
                      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
                    }
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{course.title}</h3>
                  <div className="flex items-center gap-2">
                    {course.languages?.flag_url && (
                      <img
                        src={course.languages.flag_url}
                        alt={course.languages.code}
                        className="w-4 h-3 object-cover"
                      />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {course.languages?.name} · {course.level}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-md border border-red-100 mt-4">
                <p className="text-red-700 font-medium">
                  Warning: This course has {lessonCount} lesson
                  {lessonCount !== 1 ? "s" : ""}.
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Deleting this course will also delete all associated lessons
                  and exercises.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-medium mb-2">Consequences:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>This course will be permanently removed from the system</li>
                <li>All lessons in this course will be permanently deleted</li>
                <li>
                  All exercises in those lessons will be permanently deleted
                </li>
                <li>Student progress related to this course will be lost</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/courses/${params.id}`}>Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteCourse}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Course
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
