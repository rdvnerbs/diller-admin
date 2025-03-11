import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Edit, Plus } from "lucide-react";
import Link from "next/link";
import ExercisePreviewCard from "@/components/dashboard-components/exercise-preview-card";
import { Progress } from "@/components/ui/progress";

export default async function ModuleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch module by slug
  const { data: module } = await supabase
    .from("learning_modules")
    .select("*, learning_categories(*)")
    .eq("slug", params.slug)
    .single();

  if (!module) {
    return redirect("/dashboard/modules");
  }

  // Fetch exercises for this module
  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("module_id", module.id);

  // Mock exercises if none exist
  const displayExercises = exercises?.length
    ? exercises
    : [
        {
          id: "1",
          title: `Introduction to ${module.title}`,
          type: "multiple-choice",
          points: 10,
          module_id: module.id,
          content: {
            question: `What is the main focus of ${module.title}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 1,
          },
        },
        {
          id: "2",
          title: `${module.title} Practice`,
          type: "matching",
          points: 15,
          module_id: module.id,
          content: {
            instruction: "Match the phrases with their meanings",
            pairs: [
              { left: "Phrase 1", right: "Meaning 1" },
              { left: "Phrase 2", right: "Meaning 2" },
              { left: "Phrase 3", right: "Meaning 3" },
            ],
          },
        },
      ];

  // Get category
  const category = module.learning_categories;

  // Mock user progress
  const userProgress = {
    completed: 1,
    total: displayExercises.length,
    percentage: Math.round((1 / displayExercises.length) * 100),
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link href="/dashboard/modules">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Modules
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
                <Link href={`/dashboard/modules/${params.slug}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span>Edit Module</span>
                </Link>
              </Button>
              <Button size="sm" className="flex items-center gap-1" asChild>
                <Link href={`/dashboard/modules/${params.slug}/exercises/new`}>
                  <Plus className="h-4 w-4" />
                  <span>Add Exercise</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Module Header */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative h-32 w-full md:w-64 rounded-lg overflow-hidden">
                <img
                  src={
                    module.image_url ||
                    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
                  }
                  alt={module.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  {category && (
                    <Link
                      href={`/dashboard/categories/${category.slug}`}
                      className={`text-xs font-medium px-2 py-1 rounded-full bg-${category.color || "blue"}-100 text-${category.color || "blue"}-800`}
                    >
                      {category.name}
                    </Link>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      module.difficulty_level === "beginner"
                        ? "bg-green-100 text-green-800"
                        : module.difficulty_level === "intermediate"
                          ? "bg-blue-100 text-blue-800"
                          : module.difficulty_level === "advanced"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {module.difficulty_level}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {module.estimated_duration || 15} min
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-2">{module.title}</h1>
                <p className="text-gray-600 mb-4">{module.description}</p>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Progress</span>
                    <span className="font-medium">
                      {userProgress.percentage}%
                    </span>
                  </div>
                  <Progress value={userProgress.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{userProgress.completed} completed</span>
                    <span>{userProgress.total} total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exercises Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Module Exercises</h2>
            {displayExercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayExercises.map((exercise) => (
                  <ExercisePreviewCard
                    key={exercise.id}
                    exercise={exercise as any}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Exercises Yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Create your first exercise for this module.
                </p>
                <Button asChild>
                  <Link
                    href={`/dashboard/modules/${params.slug}/exercises/new`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
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
