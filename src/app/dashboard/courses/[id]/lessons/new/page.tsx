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
import { createClient } from "../../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewLessonPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<any>(null);
  const [nextOrderNumber, setNextOrderNumber] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_number: 1,
    duration_minutes: 15,
    content: {},
    is_published: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", params.id)
          .single();

        if (courseError || !courseData) {
          router.push("/dashboard/courses");
          return;
        }

        setCourse(courseData);

        // Get the highest order number from existing lessons
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("order_number")
          .eq("course_id", params.id)
          .order("order_number", { ascending: false })
          .limit(1);

        const highestOrder =
          lessonsData && lessonsData.length > 0
            ? lessonsData[0].order_number
            : 0;
        const nextOrder = highestOrder + 1;

        setNextOrderNumber(nextOrder);
        setFormData((prev) => ({ ...prev, order_number: nextOrder }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard/courses");
      }
    };

    fetchData();
  }, [params.id]);

  const handleCreateLesson = async () => {
    try {
      setError("");
      setSaving(true);

      // Validate form
      if (!formData.title.trim()) {
        setError("Lesson title is required");
        setSaving(false);
        return;
      }

      // Create lesson
      const { data, error } = await supabase
        .from("lessons")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          course_id: params.id,
          order_number: formData.order_number,
          content: formData.content,
          duration_minutes: formData.duration_minutes,
          is_published: formData.is_published,
        })
        .select();

      if (error) throw error;

      router.push(`/dashboard/courses/${params.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error creating lesson:", error);
      setError(error.message || "Failed to create lesson");
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
          <Link href={`/dashboard/courses/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add New Lesson</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Information</CardTitle>
          <CardDescription>
            Create a new lesson for {course.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Introduction to Basic Phrases"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order Number</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_number: parseInt(e.target.value) || 1,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Position of this lesson in the course (auto-assigned to{" "}
                {nextOrderNumber})
              </p>
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
              placeholder="A brief description of what this lesson covers..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="180"
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration_minutes: parseInt(e.target.value) || 15,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Estimated time to complete this lesson
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="is_published" className="font-medium">
                Publish Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Make this lesson available to students
              </p>
            </div>
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_published: checked })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/courses/${params.id}`}>Cancel</Link>
          </Button>
          <Button onClick={handleCreateLesson} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Lesson
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
