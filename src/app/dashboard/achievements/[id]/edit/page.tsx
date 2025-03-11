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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditAchievementPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [achievement, setAchievement] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 10,
    badge_image_url: "",
    requirement_type: "lesson_completion",
    requirement_count: 1,
    is_active: true,
  });

  const requirementTypes = [
    { value: "lesson_completion", label: "Lesson Completion" },
    { value: "perfect_score", label: "Perfect Score" },
    { value: "streak_days", label: "Streak Days" },
    { value: "words_learned", label: "Words Learned" },
    { value: "grammar_exercises", label: "Grammar Exercises" },
    { value: "conversation_exercises", label: "Conversation Exercises" },
  ];

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const { data, error } = await supabase
          .from("achievements")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error || !data) {
          router.push("/dashboard/achievements");
          return;
        }

        setAchievement(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          points: data.points || 10,
          badge_image_url: data.badge_image_url || "",
          requirement_type: data.requirement_type || "lesson_completion",
          requirement_count: data.requirement_count || 1,
          is_active: data.is_active !== undefined ? data.is_active : true,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching achievement:", error);
        router.push("/dashboard/achievements");
      }
    };

    fetchAchievement();
  }, [params.id]);

  const handleUpdateAchievement = async () => {
    try {
      setError("");
      setSaving(true);

      // Validate form
      if (!formData.title.trim()) {
        setError("Achievement title is required");
        setSaving(false);
        return;
      }

      if (!formData.description.trim()) {
        setError("Achievement description is required");
        setSaving(false);
        return;
      }

      if (formData.points < 1) {
        setError("Points must be at least 1");
        setSaving(false);
        return;
      }

      if (formData.requirement_count < 1) {
        setError("Requirement count must be at least 1");
        setSaving(false);
        return;
      }

      // Update achievement
      const { error } = await supabase
        .from("achievements")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          points: formData.points,
          badge_image_url: formData.badge_image_url.trim() || null,
          requirement_type: formData.requirement_type,
          requirement_count: formData.requirement_count,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (error) throw error;

      router.push("/dashboard/achievements");
      router.refresh();
    } catch (error: any) {
      console.error("Error updating achievement:", error);
      setError(error.message || "Failed to update achievement");
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
          <Link href="/dashboard/achievements">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Achievements
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Achievement</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievement Information</CardTitle>
          <CardDescription>Update the achievement details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Achievement Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Perfect Score"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 10,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Get 100% on any exercise"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="badge_image_url">Badge Image URL (Optional)</Label>
            <Input
              id="badge_image_url"
              value={formData.badge_image_url}
              onChange={(e) =>
                setFormData({ ...formData, badge_image_url: e.target.value })
              }
              placeholder="https://example.com/badge.png"
            />
            <p className="text-xs text-muted-foreground">
              URL to the badge image for this achievement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requirement_type">Requirement Type</Label>
              <Select
                value={formData.requirement_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, requirement_type: value })
                }
              >
                <SelectTrigger id="requirement_type">
                  <SelectValue placeholder="Select requirement type" />
                </SelectTrigger>
                <SelectContent>
                  {requirementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirement_count">Requirement Count</Label>
              <Input
                id="requirement_count"
                type="number"
                min="1"
                max="1000"
                value={formData.requirement_count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirement_count: parseInt(e.target.value) || 1,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Number of times the requirement must be met
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="is_active" className="font-medium">
                Active Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable this achievement on the platform
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/achievements">Cancel</Link>
          </Button>
          <Button onClick={handleUpdateAchievement} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
