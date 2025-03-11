"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, BookOpen, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function StatsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userStreak, setUserStreak] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPoints: 250,
    weeklyPoints: 30,
    exercisesCompleted: 24,
    weeklyExercises: 5,
    categoryProgress: [
      { name: "Business English", progress: 65, color: "blue" },
      { name: "Travel English", progress: 40, color: "yellow" },
      { name: "Greetings & Basics", progress: 90, color: "green" },
      { name: "Academic English", progress: 25, color: "purple" },
    ],
    weeklyActivity: [10, 15, 5, 20, 10, 30, 15], // Last 7 days
    exerciseTypes: [
      { type: "Multiple Choice", count: 12 },
      { type: "Matching", count: 6 },
      { type: "Listening", count: 4 },
      { type: "Conversation", count: 2 },
    ],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/sign-in");
          return;
        }
        setUser(user);

        // Fetch user streak
        const { data: userStreakData } = await supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (userStreakData) {
          setUserStreak(userStreakData);
        }

        // In a real app, you would fetch more stats here

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
          <Link href="/dashboard/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Learning Statistics</h1>
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPoints}</div>
              <p className="text-sm text-muted-foreground">
                +{stats.weeklyPoints} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Exercises Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.exercisesCompleted}
              </div>
              <p className="text-sm text-muted-foreground">
                +{stats.weeklyExercises} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Learning Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userStreak?.current_streak || 0} days
              </div>
              <p className="text-sm text-muted-foreground">
                Best: {userStreak?.longest_streak || 0} days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Category Progress</CardTitle>
            <CardDescription>
              Your learning progress across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.categoryProgress.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {category.progress}%
                    </span>
                  </div>
                  <Progress value={category.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Types */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Types Completed</CardTitle>
            <CardDescription>
              Breakdown of different exercise types you've completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.exerciseTypes.map((type) => (
                <div
                  key={type.type}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="text-2xl font-bold">{type.count}</div>
                  <div className="text-sm text-muted-foreground">
                    {type.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Your learning activity over the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-end justify-between gap-2">
              {stats.weeklyActivity.map((value, index) => {
                const day = new Date();
                day.setDate(day.getDate() - (6 - index));
                const dayName = day.toLocaleDateString("en-US", {
                  weekday: "short",
                });

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t-sm"
                      style={{ height: `${(value / 30) * 100}%` }}
                    ></div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {dayName}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
