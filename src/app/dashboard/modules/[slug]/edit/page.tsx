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
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Trash } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EditModulePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [module, setModule] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty_level: "beginner",
    estimated_duration: 15,
    image_url: "",
    slug: "",
    category_id: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch module
        const { data: moduleData, error: moduleError } = await supabase
          .from("learning_modules")
          .select("*")
          .eq("slug", params.slug)
          .single();

        if (moduleError || !moduleData) {
          router.push("/dashboard/modules");
          return;
        }

        setModule(moduleData);

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("learning_categories")
          .select("*");

        if (categoriesData) {
          setCategories(categoriesData);
        }

        setFormData({
          title: moduleData.title,
          description: moduleData.description || "",
          difficulty_level: moduleData.difficulty_level || "beginner",
          estimated_duration: moduleData.estimated_duration || 15,
          image_url: moduleData.image_url || "",
          slug: moduleData.slug,
          category_id: moduleData.category_id || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard/modules");
      }
    };

    fetchData();
  }, [params.slug]);

  const handleUpdateModule = async () => {
    if (!module) return;

    try {
      setSaving(true);

      // Generate slug if empty
      const slug =
        formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-");

      const { error } = await supabase
        .from("learning_modules")
        .update({
          title: formData.title,
          description: formData.description,
          difficulty_level: formData.difficulty_level,
          estimated_duration: formData.estimated_duration,
          image_url: formData.image_url,
          slug: slug,
          category_id: formData.category_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", module.id);

      if (error) throw error;

      router.push(`/dashboard/modules/${slug}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating module:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async () => {
    if (!module) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from("learning_modules")
        .delete()
        .eq("id", module.id);

      if (error) throw error;

      router.push("/dashboard/modules");
      router.refresh();
    } catch (error) {
      console.error("Error deleting module:", error);
    } finally {
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
          <Link href={`/dashboard/modules/${params.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Module</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Information</CardTitle>
          <CardDescription>
            Update the details of this learning module
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
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Trash className="h-4 w-4 mr-2" />
                Delete Module
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  module and all associated exercises.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteModule}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/modules/${params.slug}`}>Cancel</Link>
            </Button>
            <Button onClick={handleUpdateModule} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
