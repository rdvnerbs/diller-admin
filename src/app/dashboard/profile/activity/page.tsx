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

export default function ActivityPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

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
        await fetchActivities(user.id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchActivities = async (userId: string) => {
    // In a real app, you would fetch activities from the database
    // For now, we'll use mock data
    const mockActivities = [
      {
        id: "1",
        type: "exercise_completed",
        title: "Completed 'Greeting Practice' exercise",
        score: "8/10",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: "2",
        type: "achievement_earned",
        title: "Earned 'Perfect Score' achievement",
        points: 30,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        id: "3",
        type: "module_started",
        title: "Started 'Business Meeting Vocabulary' module",
        progress: "20%",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: "4",
        type: "exercise_completed",
        title: "Completed 'Matching Phrases' exercise",
        score: "15/15",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
      {
        id: "5",
        type: "category_explored",
        title: "Explored 'Travel English' category",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        id: "6",
        type: "exercise_completed",
        title: "Completed 'Airport Announcements' listening exercise",
        score: "7/10",
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      },
      {
        id: "7",
        type: "achievement_earned",
        title: "Earned 'Consistent Learner' achievement",
        points: 20,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
      {
        id: "8",
        type: "module_completed",
        title: "Completed 'Greetings & Introductions' module",
        score: "85%",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      },
      {
        id: "9",
        type: "exercise_completed",
        title: "Completed 'Restaurant Conversation' exercise",
        score: "9/10",
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
      },
      {
        id: "10",
        type: "category_explored",
        title: "Explored 'Business English' category",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      },
    ];

    setActivities(mockActivities);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter activities
  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((activity) => activity.type === filter);

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
        <h1 className="text-2xl font-bold">Activity History</h1>
      </div>

      <div className="space-y-6">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Activities
          </Button>
          <Button
            variant={filter === "exercise_completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("exercise_completed")}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Exercises
          </Button>
          <Button
            variant={filter === "achievement_earned" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("achievement_earned")}
            className="flex items-center gap-1"
          >
            <Award className="h-4 w-4" />
            Achievements
          </Button>
          <Button
            variant={
              filter === "module_started" || filter === "module_completed"
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => setFilter("module_started")}
            className="flex items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            Modules
          </Button>
        </div>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Learning Activities</CardTitle>
            <CardDescription>
              {filter === "all"
                ? "All your recent learning activities"
                : `Filtered by ${filter.replace("_", " ")}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div
                      className={`p-2 rounded-full mt-1 ${
                        activity.type === "exercise_completed"
                          ? "bg-blue-100"
                          : activity.type === "achievement_earned"
                            ? "bg-amber-100"
                            : activity.type === "module_started" ||
                                activity.type === "module_completed"
                              ? "bg-green-100"
                              : "bg-purple-100"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 ${
                          activity.type === "exercise_completed"
                            ? "text-blue-600"
                            : activity.type === "achievement_earned"
                              ? "text-amber-600"
                              : activity.type === "module_started" ||
                                  activity.type === "module_completed"
                                ? "text-green-600"
                                : "text-purple-600"
                        }`}
                      >
                        {activity.type === "exercise_completed" ? (
                          <Clock />
                        ) : activity.type === "achievement_earned" ? (
                          <Award />
                        ) : activity.type === "module_started" ||
                          activity.type === "module_completed" ? (
                          <BookOpen />
                        ) : (
                          <BookOpen />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{activity.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                      {activity.score && (
                        <p className="text-sm text-muted-foreground">
                          Score: {activity.score}
                        </p>
                      )}
                      {activity.points && (
                        <p className="text-sm text-muted-foreground">
                          +{activity.points} points
                        </p>
                      )}
                      {activity.progress && (
                        <p className="text-sm text-muted-foreground">
                          Progress: {activity.progress}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No activities found for this filter.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
