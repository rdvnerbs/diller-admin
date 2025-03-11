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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
  });

  const [preferencesData, setPreferencesData] = useState({
    daily_reminder: true,
    achievement_notifications: true,
    weekly_report: true,
    preferred_difficulty: "beginner",
    learning_goal_minutes: 15,
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

        // Fetch profile
        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            full_name: profileData.full_name || "",
            bio: profileData.bio || "",
            avatar_url: profileData.avatar_url || "",
          });
        }

        // Fetch preferences
        const { data: preferencesData } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (preferencesData) {
          setPreferences(preferencesData);
          setPreferencesData({
            daily_reminder: preferencesData.daily_reminder,
            achievement_notifications:
              preferencesData.achievement_notifications,
            weekly_report: preferencesData.weekly_report,
            preferred_difficulty: preferencesData.preferred_difficulty,
            learning_goal_minutes: preferencesData.learning_goal_minutes,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update profile
      const { error: profileError } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update or insert preferences
      if (preferences) {
        const { error: preferencesError } = await supabase
          .from("user_preferences")
          .update({
            daily_reminder: preferencesData.daily_reminder,
            achievement_notifications:
              preferencesData.achievement_notifications,
            weekly_report: preferencesData.weekly_report,
            preferred_difficulty: preferencesData.preferred_difficulty,
            learning_goal_minutes: preferencesData.learning_goal_minutes,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (preferencesError) throw preferencesError;
      } else {
        const { error: preferencesError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            daily_reminder: preferencesData.daily_reminder,
            achievement_notifications:
              preferencesData.achievement_notifications,
            weekly_report: preferencesData.weekly_report,
            preferred_difficulty: preferencesData.preferred_difficulty,
            learning_goal_minutes: preferencesData.learning_goal_minutes,
          });

        if (preferencesError) throw preferencesError;
      }

      router.push("/dashboard/profile");
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
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
          <Link href="/dashboard/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us a bit about yourself"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={formData.avatar_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, avatar_url: e.target.value })
                }
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL for your profile picture
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
            <CardDescription>
              Customize your learning experience and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dailyReminder" className="font-medium">
                    Daily Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily reminders to practice
                  </p>
                </div>
                <Switch
                  id="dailyReminder"
                  checked={preferencesData.daily_reminder}
                  onCheckedChange={(checked) =>
                    setPreferencesData({
                      ...preferencesData,
                      daily_reminder: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="achievementNotifications"
                    className="font-medium"
                  >
                    Achievement Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you earn achievements
                  </p>
                </div>
                <Switch
                  id="achievementNotifications"
                  checked={preferencesData.achievement_notifications}
                  onCheckedChange={(checked) =>
                    setPreferencesData({
                      ...preferencesData,
                      achievement_notifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReport" className="font-medium">
                    Weekly Progress Report
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your progress
                  </p>
                </div>
                <Switch
                  id="weeklyReport"
                  checked={preferencesData.weekly_report}
                  onCheckedChange={(checked) =>
                    setPreferencesData({
                      ...preferencesData,
                      weekly_report: checked,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDifficulty">
                  Preferred Difficulty
                </Label>
                <Select
                  value={preferencesData.preferred_difficulty}
                  onValueChange={(value) =>
                    setPreferencesData({
                      ...preferencesData,
                      preferred_difficulty: value,
                    })
                  }
                >
                  <SelectTrigger id="preferredDifficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningGoal">
                  Daily Learning Goal (minutes)
                </Label>
                <Input
                  id="learningGoal"
                  type="number"
                  min="5"
                  max="120"
                  value={preferencesData.learning_goal_minutes}
                  onChange={(e) =>
                    setPreferencesData({
                      ...preferencesData,
                      learning_goal_minutes: parseInt(e.target.value) || 15,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end space-x-4 px-0">
          <Button variant="outline" asChild>
            <Link href="/dashboard/profile">Cancel</Link>
          </Button>
          <Button onClick={handleProfileUpdate} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
