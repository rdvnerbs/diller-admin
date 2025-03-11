"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import AchievementCard from "@/components/dashboard-components/achievement-card";
import CategoryCard from "@/components/dashboard-components/category-card";
import ExercisePreviewCard from "@/components/dashboard-components/exercise-preview-card";
import ProgressCard from "@/components/dashboard-components/progress-card";
import RecommendationCard from "@/components/dashboard-components/recommendation-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Plus, RefreshCw, Trophy } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = Tables<"learning_categories">;
type Achievement = Tables<"achievements">;
type UserAchievement = Tables<"user_achievements">;
type UserStreak = Tables<"user_streaks">;
type Module = Tables<"learning_modules">;

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    [],
  );
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);
  const [recommendedModules, setRecommendedModules] = useState<Module[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState({
    completedExercises: 0,
    totalExercises: 0,
    totalPoints: 0,
  });

  // New category state
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "blue",
    icon: "BookOpen",
    slug: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setUser(user);
      await fetchData(user.id);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Fetch all data
  const fetchData = async (userId: string) => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("learning_categories")
        .select("*");

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*");

      if (achievementsData) {
        setAchievements(achievementsData);
      }

      // Fetch user achievements
      const { data: userAchievementsData } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId);

      if (userAchievementsData) {
        setUserAchievements(userAchievementsData);
      }

      // Fetch user streak
      const { data: userStreakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (userStreakData) {
        setUserStreak(userStreakData);
      }

      // Fetch modules
      const { data: modulesData } = await supabase
        .from("learning_modules")
        .select("*")
        .limit(3);

      if (modulesData) {
        setRecommendedModules(modulesData);
      }

      // Fetch exercises
      const { data: exercisesData } = await supabase
        .from("exercises")
        .select("*")
        .limit(3);

      if (exercisesData) {
        setExercises(exercisesData);
      }

      // Fetch user progress
      const { data: userExerciseAttempts } = await supabase
        .from("user_exercise_attempts")
        .select("*")
        .eq("user_id", userId);

      if (userExerciseAttempts) {
        // Calculate completed exercises
        const completedCount = userExerciseAttempts.length;

        // Calculate total points
        const totalPoints = userExerciseAttempts.reduce((sum, attempt) => {
          return sum + (attempt.score || 0);
        }, 0);

        setUserProgress({
          completedExercises: completedCount,
          totalExercises: exercisesData?.length || 100,
          totalPoints: totalPoints,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle category creation
  const handleCreateCategory = async () => {
    try {
      // Generate slug if empty
      const slug =
        newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, "-");

      const { data, error } = await supabase
        .from("learning_categories")
        .insert([
          {
            name: newCategory.name,
            description: newCategory.description,
            color: newCategory.color,
            icon: newCategory.icon,
            slug: slug,
          },
        ])
        .select();

      if (error) throw error;

      // Add the new category to the state
      if (data) {
        setCategories([...categories, data[0]]);
      }

      // Reset form and close dialog
      setNewCategory({
        name: "",
        description: "",
        color: "blue",
        icon: "BookOpen",
        slug: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("learning_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Remove the category from state
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Refresh data
  const refreshData = async () => {
    if (user) {
      await fetchData(user.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email}
              </h1>
              <p className="text-muted-foreground">
                Track your progress and continue your English learning journey
              </p>
            </div>
            <Button
              onClick={refreshData}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </header>

          {/* Progress Section */}
          <section className="mb-8">
            <ProgressCard
              streak={userStreak?.current_streak || 0}
              longestStreak={userStreak?.longest_streak || 0}
              completedExercises={userProgress.completedExercises}
              totalExercises={userProgress.totalExercises}
              totalPoints={userProgress.totalPoints}
            />
          </section>

          {/* Main Content Tabs */}
          <Tabs defaultValue="categories" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger
                value="categories"
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                <span>Categories</span>
              </TabsTrigger>
              <TabsTrigger
                value="recommended"
                className="flex items-center gap-1"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Recommended</span>
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="flex items-center gap-1"
              >
                <Trophy className="h-4 w-4" />
                <span>Achievements</span>
              </TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Learning Categories</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Add Category</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>
                        Add a new learning category to the platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              name: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={newCategory.description}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              description: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">
                          Color
                        </Label>
                        <select
                          id="color"
                          value={newCategory.color}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              color: e.target.value,
                            })
                          }
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                          <option value="yellow">Yellow</option>
                          <option value="purple">Purple</option>
                          <option value="red">Red</option>
                          <option value="indigo">Indigo</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">
                          Icon
                        </Label>
                        <select
                          id="icon"
                          value={newCategory.icon}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              icon: e.target.value,
                            })
                          }
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="BookOpen">Book</option>
                          <option value="MessageCircle">Message</option>
                          <option value="Briefcase">Briefcase</option>
                          <option value="Plane">Plane</option>
                          <option value="Users">Users</option>
                          <option value="GraduationCap">Graduation Cap</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="slug" className="text-right">
                          Slug (optional)
                        </Label>
                        <Input
                          id="slug"
                          value={newCategory.slug}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              slug: e.target.value,
                            })
                          }
                          placeholder="auto-generated-if-empty"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleCreateCategory}>
                        Create Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div key={category.id} className="relative group">
                      <CategoryCard
                        category={category}
                        progress={Math.floor(Math.random() * 100)} // Mock progress for now
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Categories Yet
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Create your first learning category to get started.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard/categories">View All Categories</Link>
                </Button>
              </div>
            </TabsContent>

            {/* Recommended Tab */}
            <TabsContent value="recommended" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Recommended for You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedModules.length > 0 ? (
                    recommendedModules.map((module, index) => (
                      <RecommendationCard
                        key={module.id}
                        module={module}
                        reason={
                          index === 0
                            ? "Continue where you left off"
                            : index === 1
                              ? "Based on your interests"
                              : "Popular in your level"
                        }
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No Recommendations Yet
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Complete more exercises to get personalized
                        recommendations.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">
                  Practice Exercises
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exercises.length > 0 ? (
                    exercises.map((exercise) => (
                      <ExercisePreviewCard
                        key={exercise.id}
                        exercise={exercise}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No Exercises Available
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Check back later for new exercises.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard/exercises">View All Exercises</Link>
                </Button>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Your Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      userAchievement={
                        userAchievements.find(
                          (ua) => ua.achievement_id === achievement.id,
                        ) || null
                      }
                    />
                  ))
                ) : (
                  <div className="col-span-4 text-center py-12">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Achievements Yet
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Complete exercises and maintain your learning streak to
                      earn achievements.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard/achievements">
                    View All Achievements
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
