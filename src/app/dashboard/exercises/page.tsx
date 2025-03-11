import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Headphones,
  ListChecks,
  MessageSquare,
  Plus,
} from "lucide-react";
import ExercisePreviewCard from "@/components/dashboard-components/exercise-preview-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ExercisesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch exercises (using mock data for now)
  const { data: exercises } = await supabase
    .from("exercises")
    .select(
      "*, learning_modules(title, slug, learning_categories(name, color))",
    );

  // Use mock exercises if none exist in the database
  const mockExercises = [
    {
      id: "1",
      title: "Greeting Practice",
      type: "multiple-choice",
      points: 10,
      content: {
        question:
          "What is an appropriate greeting for a formal business meeting?",
        options: [
          "Hey there!",
          "Good morning, nice to meet you.",
          "What's up?",
          "Hi, how's it going?",
        ],
        correctAnswer: 1,
      },
    },
    {
      id: "2",
      title: "Matching Phrases",
      type: "matching",
      points: 15,
      content: {
        instruction: "Match the phrases with their meanings",
        pairs: [
          { left: "Break the ice", right: "Start a conversation" },
          { left: "Get to the point", right: "Speak directly" },
          { left: "On the same page", right: "Having the same understanding" },
        ],
      },
    },
    {
      id: "3",
      title: "Airport Announcements",
      type: "listening",
      points: 20,
      content: {
        instruction:
          "Listen to the airport announcement and answer the question",
        audioUrl: "/audio/airport-announcement.mp3",
        question: "What gate number was announced for the flight to London?",
      },
    },
    {
      id: "4",
      title: "Restaurant Conversation",
      type: "conversation",
      points: 25,
      content: {
        instruction: "Practice this restaurant conversation",
        dialogue: [
          {
            role: "server",
            text: "Hello, welcome to our restaurant. Do you have a reservation?",
          },
          {
            role: "customer",
            text: "Yes, I booked a table for two under the name Smith.",
          },
          {
            role: "server",
            text: "Perfect, your table is ready. Please follow me.",
          },
        ],
      },
    },
    {
      id: "5",
      title: "Office Vocabulary Quiz",
      type: "multiple-choice",
      points: 15,
      content: {
        question: "Which of these is NOT typically found in an office?",
        options: ["Stapler", "Printer", "Blender", "Filing cabinet"],
        correctAnswer: 2,
      },
    },
    {
      id: "6",
      title: "Travel Phrases Matching",
      type: "matching",
      points: 15,
      content: {
        instruction: "Match the travel phrases with their uses",
        pairs: [
          { left: "Excuse me, where is...", right: "Asking for directions" },
          { left: "I'd like to book...", right: "Making reservations" },
          { left: "How much does it cost?", right: "Asking about price" },
        ],
      },
    },
  ];

  const displayExercises = exercises?.length ? exercises : mockExercises;

  // Group exercises by type
  const groupedExercises = displayExercises.reduce(
    (acc, exercise) => {
      const type = exercise.type.toLowerCase();
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(exercise);
      return acc;
    },
    {} as Record<string, typeof displayExercises>,
  );

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Practice Exercises</h1>
              <p className="text-muted-foreground">
                Improve your English skills with various exercise types
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/exercises/new">
                <Plus className="h-4 w-4" />
                <span>Create Exercise</span>
              </Link>
            </Button>
          </header>

          {/* Main Content Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <span>All Exercises</span>
              </TabsTrigger>
              <TabsTrigger
                value="multiple-choice"
                className="flex items-center gap-1"
              >
                <ListChecks className="h-4 w-4" />
                <span>Multiple Choice</span>
              </TabsTrigger>
              <TabsTrigger value="matching" className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Matching</span>
              </TabsTrigger>
              <TabsTrigger
                value="listening"
                className="flex items-center gap-1"
              >
                <Headphones className="h-4 w-4" />
                <span>Listening</span>
              </TabsTrigger>
              <TabsTrigger
                value="conversation"
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Conversation</span>
              </TabsTrigger>
            </TabsList>

            {/* All Exercises Tab */}
            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayExercises.map((exercise) => (
                  <ExercisePreviewCard
                    key={exercise.id}
                    exercise={exercise as any}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Multiple Choice Tab */}
            <TabsContent value="multiple-choice" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedExercises["multiple-choice"]?.map((exercise) => (
                  <ExercisePreviewCard
                    key={exercise.id}
                    exercise={exercise as any}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Matching Tab */}
            <TabsContent value="matching" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedExercises["matching"]?.map((exercise) => (
                  <ExercisePreviewCard
                    key={exercise.id}
                    exercise={exercise as any}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Listening Tab */}
            <TabsContent value="listening" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedExercises["listening"]?.map((exercise) => (
                  <ExercisePreviewCard
                    key={exercise.id}
                    exercise={exercise as any}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Conversation Tab */}
            <TabsContent value="conversation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedExercises["conversation"]?.map((exercise) => (
                  <ExercisePreviewCard
                    key={exercise.id}
                    exercise={exercise as any}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
