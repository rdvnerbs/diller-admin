import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Edit, Plus } from "lucide-react";
import Link from "next/link";
import ModuleCard from "@/components/dashboard-components/module-card";

export default async function CategoryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch category by slug
  const { data: category } = await supabase
    .from("learning_categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) {
    return redirect("/dashboard/categories");
  }

  // Fetch modules for this category
  const { data: modules } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("category_id", category.id);

  // Mock modules if none exist
  const displayModules = modules?.length
    ? modules
    : [
        {
          id: "1",
          title: `Introduction to ${category.name}`,
          description: `Learn the basics of ${category.name}`,
          difficulty_level: "Beginner",
          estimated_duration: 15,
          slug: `intro-${category.slug}`,
          image_url:
            "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
          category_id: category.id,
        },
      ];

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link href="/dashboard/categories">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Link>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                asChild
              >
                <Link href={`/dashboard/categories/${params.slug}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span>Edit Category</span>
                </Link>
              </Button>
              <Button size="sm" className="flex items-center gap-1" asChild>
                <Link href={`/dashboard/categories/${params.slug}/modules/new`}>
                  <Plus className="h-4 w-4" />
                  <span>Add Module</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Category Header */}
          <div
            className={`bg-gradient-to-r from-${category.color}-50 to-${category.color}-100 rounded-xl p-6 border border-${category.color}-200 mb-8`}
          >
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div
                className={`bg-white p-4 rounded-full border border-${category.color}-200`}
              >
                <BookOpen className={`h-12 w-12 text-${category.color}-600`} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1
                  className={`text-3xl font-bold text-${category.color}-900 mb-2`}
                >
                  {category.name}
                </h1>
                <p className={`text-${category.color}-700 mb-4 max-w-2xl`}>
                  {category.description}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span
                    className={`bg-${category.color}-100 text-${category.color}-800 text-xs px-3 py-1 rounded-full`}
                  >
                    {displayModules.length} Modules
                  </span>
                  <span
                    className={`bg-${category.color}-100 text-${category.color}-800 text-xs px-3 py-1 rounded-full`}
                  >
                    Beginner to Advanced
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Learning Modules</h2>
            {displayModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayModules.map((module) => (
                  <ModuleCard key={module.id} module={module as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Modules Yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Create your first learning module for this category.
                </p>
                <Button asChild>
                  <Link
                    href={`/dashboard/categories/${params.slug}/modules/new`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
