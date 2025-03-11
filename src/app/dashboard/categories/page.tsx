"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useRouter } from "next/navigation";
import CategoryCard from "@/components/dashboard-components/category-card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Edit,
  Eye,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type Category = Tables<"learning_categories">;

export default function CategoriesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredCategory, setFeaturedCategory] = useState<Category | null>(
    null,
  );

  // Category form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "blue",
    icon: "BookOpen",
    slug: "",
  });

  // Fetch user and data
  useEffect(() => {
    const fetchUserAndData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setUser(user);
      await fetchCategories();
      setLoading(false);
    };

    fetchUserAndData();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("learning_categories")
        .select("*");

      if (error) throw error;

      if (data) {
        setCategories(data);
        setFilteredCategories(data);

        // Set featured category (for now, just pick the first business-related one or the first one)
        const businessCategory = data.find(
          (cat) =>
            cat.name.toLowerCase().includes("business") ||
            cat.slug.toLowerCase().includes("business"),
        );

        setFeaturedCategory(businessCategory || data[0] || null);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Create category
  const handleCreateCategory = async () => {
    try {
      // Generate slug if empty
      const slug =
        categoryForm.slug ||
        categoryForm.name.toLowerCase().replace(/\s+/g, "-");

      const { data, error } = await supabase
        .from("learning_categories")
        .insert([
          {
            name: categoryForm.name,
            description: categoryForm.description,
            color: categoryForm.color,
            icon: categoryForm.icon,
            slug: slug,
          },
        ])
        .select();

      if (error) throw error;

      // Add the new category to the state
      if (data) {
        setCategories([...categories, data[0]]);
        // If no featured category yet, set this as featured
        if (!featuredCategory) {
          setFeaturedCategory(data[0]);
        }
      }

      // Reset form and close dialog
      resetCategoryForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!currentCategory) return;

    try {
      // Generate slug if empty
      const slug =
        categoryForm.slug ||
        categoryForm.name.toLowerCase().replace(/\s+/g, "-");

      const { data, error } = await supabase
        .from("learning_categories")
        .update({
          name: categoryForm.name,
          description: categoryForm.description,
          color: categoryForm.color,
          icon: categoryForm.icon,
          slug: slug,
        })
        .eq("id", currentCategory.id)
        .select();

      if (error) throw error;

      if (data) {
        // Update categories state
        setCategories(
          categories.map((cat) =>
            cat.id === currentCategory.id ? data[0] : cat,
          ),
        );

        // Update featured category if needed
        if (featuredCategory && featuredCategory.id === currentCategory.id) {
          setFeaturedCategory(data[0]);
        }
      }

      // Reset form and close dialog
      resetCategoryForm();
      setIsEditDialogOpen(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("learning_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Remove from state
      const updatedCategories = categories.filter((cat) => cat.id !== id);
      setCategories(updatedCategories);

      // Update featured category if needed
      if (featuredCategory && featuredCategory.id === id) {
        setFeaturedCategory(updatedCategories[0] || null);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Set category as featured
  const setAsFeatured = (category: Category) => {
    setFeaturedCategory(category);
  };

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      color: category.color || "blue",
      icon: category.icon || "BookOpen",
      slug: category.slug,
    });
    setIsEditDialogOpen(true);
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      color: "blue",
      icon: "BookOpen",
      slug: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Learning Categories</h1>
              <p className="text-muted-foreground">
                Explore different categories to improve your English skills
              </p>
            </div>
            <Button className="flex items-center gap-1" asChild>
              <Link href="/dashboard/categories/new">
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </Link>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search categories..."
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  const searchTerm = e.target.value.toLowerCase();
                  const filtered = categories.filter(
                    (category) =>
                      category.name.toLowerCase().includes(searchTerm) ||
                      category.description
                        ?.toLowerCase()
                        .includes(searchTerm) ||
                      category.slug.toLowerCase().includes(searchTerm),
                  );
                  setFilteredCategories(filtered);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("card")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Featured Category */}
          {featuredCategory && (
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Featured Category</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(featuredCategory)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="bg-white p-4 rounded-full border border-blue-200">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">
                      {featuredCategory.name}
                    </h3>
                    <p className="text-blue-700 mb-4 max-w-2xl">
                      {featuredCategory.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        15 Modules
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        40+ Exercises
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        Beginner to Advanced
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-4">All Categories</h2>
            {filteredCategories.length > 0 ? (
              viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => (
                    <Card key={category.id} className="overflow-hidden group">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle>{category.name}</CardTitle>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setAsFeatured(category)}
                              title="Set as featured"
                            >
                              ★
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditDialog(category)}
                              title="Edit category"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteCategory(category.id)}
                              title="Delete category"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CategoryCard
                          category={category}
                          progress={Math.floor(Math.random() * 100)} // Mock progress for now
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Slug
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-8 w-8 rounded-full overflow-hidden"
                                style={{
                                  backgroundColor: category.color || "#e5e7eb",
                                }}
                              >
                                {category.icon ? (
                                  <div className="h-full w-full flex items-center justify-center text-white">
                                    {/* Render icon based on name */}
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-white font-bold">
                                    {category.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <span className="font-medium">
                                {category.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground line-clamp-1">
                              {category.description}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {category.slug}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={`/dashboard/categories/${category.slug}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={`/dashboard/categories/${category.slug}/edit`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                {searchQuery ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Categories Found
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      No categories match your search for "{searchQuery}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Categories Yet
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Create your first learning category to get started.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/categories/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new learning category to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-name" className="text-right">
                Name
              </Label>
              <Input
                id="create-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="create-description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-color" className="text-right">
                Color
              </Label>
              <Select
                value={categoryForm.color}
                onValueChange={(value) =>
                  setCategoryForm({ ...categoryForm, color: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="indigo">Indigo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-icon" className="text-right">
                Icon
              </Label>
              <Select
                value={categoryForm.icon}
                onValueChange={(value) =>
                  setCategoryForm({ ...categoryForm, icon: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BookOpen">Book</SelectItem>
                  <SelectItem value="MessageCircle">Message</SelectItem>
                  <SelectItem value="Briefcase">Briefcase</SelectItem>
                  <SelectItem value="Plane">Plane</SelectItem>
                  <SelectItem value="Users">Users</SelectItem>
                  <SelectItem value="GraduationCap">Graduation Cap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-slug" className="text-right">
                Slug (optional)
              </Label>
              <Input
                id="create-slug"
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, slug: e.target.value })
                }
                placeholder="auto-generated-if-empty"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetCategoryForm();
                setIsCreateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleCreateCategory}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details of this learning category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-color" className="text-right">
                Color
              </Label>
              <Select
                value={categoryForm.color}
                onValueChange={(value) =>
                  setCategoryForm({ ...categoryForm, color: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="indigo">Indigo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-icon" className="text-right">
                Icon
              </Label>
              <Select
                value={categoryForm.icon}
                onValueChange={(value) =>
                  setCategoryForm({ ...categoryForm, icon: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BookOpen">Book</SelectItem>
                  <SelectItem value="MessageCircle">Message</SelectItem>
                  <SelectItem value="Briefcase">Briefcase</SelectItem>
                  <SelectItem value="Plane">Plane</SelectItem>
                  <SelectItem value="Users">Users</SelectItem>
                  <SelectItem value="GraduationCap">Graduation Cap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-slug" className="text-right">
                Slug
              </Label>
              <Input
                id="edit-slug"
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, slug: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetCategoryForm();
                setCurrentCategory(null);
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (currentCategory) {
                  handleDeleteCategory(currentCategory.id);
                  setIsEditDialogOpen(false);
                  setCurrentCategory(null);
                }
              }}
            >
              Delete
            </Button>
            <Button type="submit" onClick={handleUpdateCategory}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
