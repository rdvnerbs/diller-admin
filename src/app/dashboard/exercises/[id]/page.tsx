import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Edit, Trash } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ExerciseDetailPage({
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

  // Fetch exercise by id
  const { data: exercise } = await supabase
    .from("exercises")
    .select(
      "*, learning_modules(title, slug, category_id, learning_categories(name, color))",
    )
    .eq("id", params.id)
    .single();

  if (!exercise) {
    return redirect("/dashboard/exercises");
  }

  // Format exercise type for display
  const formatExerciseType = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "Multiple Choice";
      case "matching":
        return "Matching";
      case "listening":
        return "Listening";
      default:
        return type;
    }
  };

  // Render exercise content based on type
  const renderExerciseContent = () => {
    switch (exercise.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Question:</h3>
              <p>{exercise.content.question}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Options:</h3>
              {exercise.content.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${index === exercise.content.correctAnswer ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${index === exercise.content.correctAnswer ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    >
                      {index === exercise.content.correctAnswer && "✓"}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "matching":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Instructions:</h3>
              <p>{exercise.content.instruction}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Matching Pairs:</h3>
              {exercise.content.pairs.map((pair: any, index: number) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <div className="p-3 border rounded-lg border-blue-200 bg-blue-50 flex-1">
                    {pair.left}
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="p-3 border rounded-lg border-green-200 bg-green-50 flex-1">
                    {pair.right}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "listening":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Instructions:</h3>
              <p>{exercise.content.instruction}</p>
            </div>
            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
              <h3 className="font-medium mb-2">Audio:</h3>
              <audio controls className="w-full">
                <source src={exercise.content.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Question:</h3>
              <p>{exercise.content.question}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Options:</h3>
              {exercise.content.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${index === exercise.content.correctAnswer ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${index === exercise.content.correctAnswer ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    >
                      {index === exercise.content.correctAnswer && "✓"}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <p>Unknown exercise type</p>;
    }
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
                <Link href="/dashboard/exercises">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Exercises
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
                <Link href={`/dashboard/exercises/${params.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span>Edit Exercise</span>
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                asChild
              >
                <Link href={`/dashboard/exercises/${params.id}/delete`}>
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Exercise Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{exercise.title}</CardTitle>
                  <CardDescription>{exercise.description}</CardDescription>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium bg-${exercise.learning_modules?.learning_categories?.color || "gray"}-100 text-${exercise.learning_modules?.learning_categories?.color || "gray"}-800`}
                >
                  {formatExerciseType(exercise.type)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm text-muted-foreground mb-1">Module</h3>
                  <p className="font-medium">
                    {exercise.learning_modules?.title || "Uncategorized"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm text-muted-foreground mb-1">
                    Category
                  </h3>
                  <p className="font-medium">
                    {exercise.learning_modules?.learning_categories?.name ||
                      "Uncategorized"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm text-muted-foreground mb-1">Points</h3>
                  <p className="font-medium">{exercise.points}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Content */}
          <Card>
            <CardHeader>
              <CardTitle>Exercise Content</CardTitle>
              <CardDescription>
                Preview how this exercise will appear to learners
              </CardDescription>
            </CardHeader>
            <CardContent>{renderExerciseContent()}</CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
