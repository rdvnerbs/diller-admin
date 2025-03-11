import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Edit, Plus, Trash } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch course with language info
  const { data: course } = await supabase
    .from("courses")
    .select("*, languages(name, code, flag_url)")
    .eq("id", params.id)
    .single();

  if (!course) {
    return redirect("/dashboard/courses");
  }

  // Fetch lessons for this course
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", params.id)
    .order("order_number");

  // Fetch user progress for lessons
  const { data: userProgress } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, is_completed, playback_position")
    .eq("user_id", user.id);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link href="/dashboard/courses">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Courses
                </Link>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                asChild
              >
                <Link href={`/dashboard/courses/${params.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span>Edit Course</span>
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                asChild
              >
                <Link href={`/dashboard/courses/${params.id}/delete`}>
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Course Header */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            <div className="h-48 w-full">
              <img
                src={
                  course.image_url ||
                  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
                }
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                {course.languages?.flag_url && (
                  <img
                    src={course.languages.flag_url}
                    alt={course.languages.code}
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                )}
                <span className="text-white text-sm font-medium bg-black/30 px-2 py-1 rounded-full">
                  {course.languages?.name || "Unknown Language"}
                </span>
                <span className="text-white text-sm font-medium bg-black/30 px-2 py-1 rounded-full capitalize">
                  {course.level}
                </span>
                <span
                  className={`text-white text-sm font-medium ${course.is_published ? "bg-green-500/80" : "bg-amber-500/80"} px-2 py-1 rounded-full`}
                >
                  {course.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {course.title}
              </h1>
              <p className="text-white/90 max-w-3xl">{course.description}</p>
            </div>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {course.duration_weeks} weeks
                </p>
                <p className="text-sm text-muted-foreground">
                  Estimated completion time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{lessons?.length || 0}</p>
                <p className="text-sm text-muted-foreground">
                  Total lessons in this course
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Language</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {course.languages?.flag_url && (
                    <img
                      src={course.languages.flag_url}
                      alt={course.languages.code}
                      className="w-8 h-6 object-cover rounded-sm border border-gray-200"
                    />
                  )}
                  <p className="text-xl font-bold">
                    {course.languages?.name || "Unknown"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Course language
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lessons Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Course Lessons</h2>
              <Button asChild>
                <Link href={`/dashboard/courses/${params.id}/lessons/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </Link>
              </Button>
            </div>

            {lessons && lessons.length > 0 ? (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <Card
                    key={lesson.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {lesson.title}
                            </CardTitle>
                            {userProgress?.some(
                              (p) =>
                                p.lesson_id === lesson.id && p.is_completed,
                            ) && (
                              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">
                                Completed
                              </span>
                            )}
                            {userProgress?.some(
                              (p) =>
                                p.lesson_id === lesson.id &&
                                !p.is_completed &&
                                p.playback_position > 0,
                            ) && (
                              <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-2">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${lesson.is_published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                        >
                          {lesson.is_published ? "Published" : "Draft"}
                        </div>
                      </div>
                      <CardDescription className="ml-10">
                        {lesson.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center ml-10">
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground">
                            {lesson.duration_minutes} min
                          </div>
                          {/* Progress indicator */}
                          {userProgress?.some(
                            (p) =>
                              p.lesson_id === lesson.id &&
                              p.playback_position > 0,
                          ) && (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-xs text-green-600">
                                {userProgress.find(
                                  (p) => p.lesson_id === lesson.id,
                                )?.is_completed
                                  ? "Completed"
                                  : "In Progress"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/lessons/${lesson.id}/view`}>
                              <BookOpen className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/lessons/${lesson.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/lessons/${lesson.id}/delete`}
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
              <div className="text-center py-12 bg-white rounded-lg border">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Lessons Yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Start adding lessons to build your course content.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/courses/${params.id}/lessons/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Lesson
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
