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
import { createClient } from "../../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewModulePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty_level: "beginner",
    estimated_duration: 15,
    image_url: "",
    slug: "",
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data: categoryData, error } = await supabase
          .from("learning_categories")
          .select("*")
          .eq("slug", params.slug)
          .single();

        if (error || !categoryData) {
          router.push("/dashboard/categories");
          return;
        }

        setCategory(categoryData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching category:", error);
        router.push("/dashboard/categories");
      }
    };

    fetchCategory();
  }, [params.slug]);

  const handleCreateModule = async () => {
    if (!category) return;

    try {
      setSaving(true);

      // Generate slug if empty
      const slug =
        formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-");

      const { data, error } = await supabase
        .from("learning_modules")
        .insert({
          title: formData.title,
          description: formData.description,
          difficulty_level: formData.difficulty_level,
          estimated_duration: formData.estimated_duration,
          image_url: formData.image_url,
          slug: slug,
          category_id: category.id,
        })
        .select();

      if (error) throw error;

      router.push(`/dashboard/categories/${params.slug}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating module:", error);
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
          <Link href={`/dashboard/categories/${params.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Category
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Module</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Information</CardTitle>
          <CardDescription>
            Create a new learning module for the {category.name} category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Module title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="module-slug"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs. Leave blank to auto-generate from title.
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
              placeholder="Describe this module"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty_level: value })
                }
              >
                <SelectTrigger id="difficulty">
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
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="120"
                value={formData.estimated_duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_duration: parseInt(e.target.value) || 15,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL for the module cover image
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/categories/${params.slug}`}>Cancel</Link>
          </Button>
          <Button onClick={handleCreateModule} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Module
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
