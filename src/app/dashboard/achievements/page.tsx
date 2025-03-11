"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  BookOpen,
  CalendarCheck,
  Flame,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Star,
} from "lucide-react";
import AchievementCard from "@/components/dashboard-components/achievement-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setCurrentUser(user);

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*");

      // Fetch user achievements
      const { data: userAchievementsData } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);

      setAchievements(achievementsData || []);
      setFilteredAchievements(achievementsData || []);
      setUserAchievements(userAchievementsData || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Mock achievements if needed
  const mockAchievements = [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first exercise",
      icon: "BookOpen",
      requirement_type: "exercises_completed",
      requirement_value: 1,
      points: 10,
    },
    {
      id: "2",
      name: "Consistent Learner",
      description: "Maintain a 3-day learning streak",
      icon: "Flame",
      requirement_type: "streak_days",
      requirement_value: 3,
      points: 20,
    },
    {
      id: "3",
      name: "Perfect Score",
      description: "Get 100% on any exercise",
      icon: "Star",
      requirement_type: "perfect_score",
      requirement_value: 1,
      points: 30,
    },
    {
      id: "4",
      name: "Explorer",
      description: "Try exercises from 3 different categories",
      icon: "Compass",
      requirement_type: "categories_explored",
      requirement_value: 3,
      points: 25,
    },
    {
      id: "5",
      name: "Weekly Warrior",
      description: "Complete at least one exercise every day for a week",
      icon: "CalendarCheck",
      requirement_type: "streak_days",
      requirement_value: 7,
      points: 50,
    },
    {
      id: "6",
      name: "Vocabulary Master",
      description: "Complete 10 vocabulary exercises",
      icon: "BookOpen",
      requirement_type: "exercises_completed",
      requirement_value: 10,
      points: 40,
    },
    {
      id: "7",
      name: "Grammar Guru",
      description: "Complete 10 grammar exercises",
      icon: "CheckCircle",
      requirement_type: "exercises_completed",
      requirement_value: 10,
      points: 40,
    },
    {
      id: "8",
      name: "Listening Pro",
      description: "Complete 5 listening exercises",
      icon: "Headphones",
      requirement_type: "exercises_completed",
      requirement_value: 5,
      points: 35,
    },
  ];

  // Use database data if available, otherwise use mock data
  const allAchievements =
    achievements.length > 0 ? achievements : mockAchievements;
  const allUserAchievements =
    userAchievements.length > 0 ? userAchievements : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Group achievements by type
  const earnedAchievements = achievements.filter((achievement) =>
    userAchievements.some((ua) => ua.achievement_id === achievement.id),
  );

  const unlockedAchievements = achievements.filter(
    (achievement) =>
      !userAchievements.some((ua) => ua.achievement_id === achievement.id),
  );

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Achievements</h1>
              <p className="text-muted-foreground">
                Track your progress and earn badges as you learn
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/achievements/new">
                <Plus className="h-4 w-4 mr-2" />
                <span>Create Achievement</span>
              </Link>
            </Button>
          </header>

          {/* Achievement Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Achievements
                </p>
                <p className="text-2xl font-bold">
                  {earnedAchievements.length} / {allAchievements.length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">
                  {earnedAchievements.reduce(
                    (sum, achievement) => sum + (achievement.points || 0),
                    0,
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Flame className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Recent Achievement
                </p>
                <p className="text-lg font-bold">
                  {earnedAchievements.length > 0
                    ? earnedAchievements[0].name
                    : "None yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Search and View Mode */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search achievements..."
                className="pl-10 bg-white"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filtered =
                    achievements.length > 0
                      ? achievements.filter(
                          (achievement) =>
                            achievement.title
                              ?.toLowerCase()
                              .includes(searchTerm) ||
                            achievement.description
                              ?.toLowerCase()
                              .includes(searchTerm),
                        )
                      : mockAchievements.filter(
                          (achievement) =>
                            achievement.name
                              ?.toLowerCase()
                              .includes(searchTerm) ||
                            achievement.description
                              ?.toLowerCase()
                              .includes(searchTerm),
                        );
                  setFilteredAchievements(filtered);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("card")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>All Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="earned" className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Earned</span>
              </TabsTrigger>
              <TabsTrigger value="locked" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>Locked</span>
              </TabsTrigger>
            </TabsList>

            {/* All Achievements Tab */}
            <TabsContent value="all" className="space-y-6">
              {viewMode === "card" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      userAchievement={
                        allUserAchievements.find(
                          (ua) => ua.achievement_id === achievement.id,
                        ) || null
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Achievement
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Points
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredAchievements.map((achievement) => {
                        const isEarned = allUserAchievements.some(
                          (ua) => ua.achievement_id === achievement.id,
                        );
                        return (
                          <tr key={achievement.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center">
                                  {achievement.badge_image_url ? (
                                    <img
                                      src={achievement.badge_image_url}
                                      alt={
                                        achievement.title || achievement.name
                                      }
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <Award className="h-5 w-5 text-amber-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {achievement.title || achievement.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {achievement.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium">
                                {achievement.points} pts
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${isEarned ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                              >
                                {isEarned ? "Earned" : "Locked"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/dashboard/achievements/${achievement.id}/edit`}
                                  >
                                    Edit
                                  </Link>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Earned Achievements Tab */}
            <TabsContent value="earned" className="space-y-6">
              {earnedAchievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {earnedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      userAchievement={
                        allUserAchievements.find(
                          (ua) => ua.achievement_id === achievement.id,
                        ) || null
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No Achievements Yet
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Complete exercises and maintain your learning streak to earn
                    achievements.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Locked Achievements Tab */}
            <TabsContent value="locked" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={null}
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
