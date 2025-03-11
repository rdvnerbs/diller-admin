import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Edit,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user streak
  const { data: userStreak } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Mock activity data
  const recentActivity = [
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
  ];

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

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    profile?.avatar_url ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  }
                />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-1">
                  {profile?.full_name || user.email?.split("@")[0]}
                </h1>
                <p className="text-muted-foreground mb-3">{user.email}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      Joined{" "}
                      {new Date(
                        user.created_at || profile?.created_at || Date.now(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">250 Points</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {userStreak?.current_streak || 0} Day Streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  asChild
                >
                  <Link href="/dashboard/profile/edit">
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  asChild
                >
                  <Link href="/dashboard/profile/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="activity" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger
                value="activity"
                className="flex items-center gap-1"
                asChild
              >
                <Link href="/dashboard/profile/activity">
                  <Clock className="h-4 w-4" />
                  <span>Activity</span>
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="flex items-center gap-1"
                asChild
              >
                <Link href="/dashboard/profile/stats">
                  <Award className="h-4 w-4" />
                  <span>Statistics</span>
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-1"
                asChild
              >
                <Link href="/dashboard/profile/settings">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </Link>
              </TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your learning journey over the past few days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
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
                                : activity.type === "module_started"
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
                                  : activity.type === "module_started"
                                    ? "text-green-600"
                                    : "text-purple-600"
                            }`}
                          >
                            {activity.type === "exercise_completed" ? (
                              <Clock />
                            ) : activity.type === "achievement_earned" ? (
                              <Award />
                            ) : activity.type === "module_started" ? (
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">250</div>
                    <p className="text-sm text-muted-foreground">
                      +30 this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Exercises Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">24</div>
                    <p className="text-sm text-muted-foreground">
                      +5 this week
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

              <Card>
                <CardHeader>
                  <CardTitle>Learning Statistics</CardTitle>
                  <CardDescription>
                    Your progress across different categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Category progress bars would go here */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Business English
                        </span>
                        <span className="text-sm text-muted-foreground">
                          65%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Travel English
                        </span>
                        <span className="text-sm text-muted-foreground">
                          40%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Greetings & Basics
                        </span>
                        <span className="text-sm text-muted-foreground">
                          90%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: "90%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Academic English
                        </span>
                        <span className="text-sm text-muted-foreground">
                          25%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md"
                          defaultValue={profile?.full_name || ""}
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          className="w-full p-2 border rounded-md bg-gray-50"
                          defaultValue={user.email || ""}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full p-2 border rounded-md"
                          placeholder="Your current password"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full p-2 border rounded-md"
                          placeholder="Your new password"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Daily Reminders</p>
                        <p className="text-sm text-muted-foreground">
                          Receive daily reminders to practice
                        </p>
                      </div>
                      <div className="h-6 w-11 bg-gray-200 rounded-full relative">
                        <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Achievement Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when you earn achievements
                        </p>
                      </div>
                      <div className="h-6 w-11 bg-blue-500 rounded-full relative">
                        <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Progress Report</p>
                        <p className="text-sm text-muted-foreground">
                          Receive a weekly summary of your progress
                        </p>
                      </div>
                      <div className="h-6 w-11 bg-blue-500 rounded-full relative">
                        <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
