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
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Award, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DeleteAchievementPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [achievement, setAchievement] = useState<any>(null);
  const [error, setError] = useState("");

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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching achievement:", error);
        router.push("/dashboard/achievements");
      }
    };

    fetchAchievement();
  }, [params.id]);

  const handleDeleteAchievement = async () => {
    try {
      setError("");
      setDeleting(true);

      // Delete achievement
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      router.push("/dashboard/achievements");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting achievement:", error);
      setError(error.message || "Failed to delete achievement");
      setDeleting(false);
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
        <h1 className="text-2xl font-bold text-red-600">Delete Achievement</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">
              Are you sure you want to delete this achievement?
            </CardTitle>
          </div>
          <CardDescription>
            This action cannot be undone. This will permanently delete the
            achievement and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {achievement.badge_image_url ? (
                    <img
                      src={achievement.badge_image_url}
                      alt={achievement.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Award className="h-8 w-8 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.points} Points
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-md border border-red-100 mt-4">
                <p className="text-red-700 font-medium">
                  Warning: Users who have earned this achievement will lose it.
                </p>
                <p className="text-sm text-red-600 mt-1">
                  This may affect user motivation and progress tracking.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-medium mb-2">Achievement Details:</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">Title:</span>{" "}
                  <span className="font-medium">{achievement.title}</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Description:</span>{" "}
                  <span className="font-medium">{achievement.description}</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Points:</span>{" "}
                  <span className="font-medium">{achievement.points}</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Requirement:</span>{" "}
                  <span className="font-medium">
                    {achievement.requirement_count}{" "}
                    {achievement.requirement_type.replace(/_/g, " ")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/achievements">Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAchievement}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Achievement
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
