"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  Edit,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Trash,
  Filter,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Fetch users with pagination
      await fetchUsers(1);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    const supabase = createClient();

    // Calculate pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Build query
    let query = supabase
      .from("profiles")
      .select("*, user_memberships(*, membership_plans(*))")
      .order("created_at", { ascending: false });

    // Apply role filter
    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      query = query.eq("is_active", isActive);
    }

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`,
      );
    }

    // Get count for pagination
    const { count } = await query.count();
    setTotalPages(Math.ceil((count || 0) / itemsPerPage));

    // Get paginated data
    const { data } = await query.range(from, to);

    setUsers(data || []);
    setFilteredUsers(data || []);
    setCurrentPage(page);
    setLoading(false);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    fetchUsers(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "role") {
      setRoleFilter(value);
    } else if (type === "status") {
      setStatusFilter(value);
    }
    fetchUsers(1);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const handleCreateUser = async () => {
    try {
      setFormError("");
      setIsSubmitting(true);

      // Validate form
      if (
        !newUserForm.email ||
        !newUserForm.password ||
        !newUserForm.full_name
      ) {
        setFormError("All fields are required");
        setIsSubmitting(false);
        return;
      }

      const supabase = createClient();

      // Create user in auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: newUserForm.email,
          password: newUserForm.password,
          email_confirm: true,
          user_metadata: {
            full_name: newUserForm.full_name,
          },
        });

      if (authError) {
        setFormError(authError.message);
        setIsSubmitting(false);
        return;
      }

      // Update profile with role
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            role: newUserForm.role,
            full_name: newUserForm.full_name,
          })
          .eq("id", authData.user.id);

        if (profileError) {
          setFormError(profileError.message);
          setIsSubmitting(false);
          return;
        }
      }

      // Reset form and close dialog
      setNewUserForm({
        email: "",
        password: "",
        full_name: "",
        role: "user",
      });
      setIsCreateDialogOpen(false);

      // Refresh user list
      fetchUsers(1);
    } catch (error: any) {
      setFormError(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean,
  ) => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      // Refresh user list
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Error toggling user status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockUsers = [
    {
      id: "1",
      email: "john.doe@example.com",
      full_name: "John Doe",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      role: "user",
      is_active: true,
      created_at: "2023-06-15T10:30:00Z",
      user_memberships: [
        {
          membership_plans: {
            name: "Premium",
          },
          end_date: "2024-06-15T10:30:00Z",
        },
      ],
    },
    {
      id: "2",
      email: "jane.smith@example.com",
      full_name: "Jane Smith",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      role: "admin",
      is_active: true,
      created_at: "2023-05-20T14:45:00Z",
      user_memberships: [],
    },
    {
      id: "3",
      email: "michael.brown@example.com",
      full_name: "Michael Brown",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      role: "user",
      is_active: false,
      created_at: "2023-07-05T09:15:00Z",
      user_memberships: [
        {
          membership_plans: {
            name: "Basic",
          },
          end_date: "2023-12-05T09:15:00Z",
        },
      ],
    },
    {
      id: "4",
      email: "emily.johnson@example.com",
      full_name: "Emily Johnson",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      role: "teacher",
      is_active: true,
      created_at: "2023-04-12T11:20:00Z",
      user_memberships: [
        {
          membership_plans: {
            name: "Annual",
          },
          end_date: "2024-04-12T11:20:00Z",
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Use mock data if no real data is available
  const displayUsers = users.length > 0 ? filteredUsers : mockUsers;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Users</h1>
              <p className="text-muted-foreground">
                Manage users and their permissions
              </p>
            </div>
            <Button
              className="flex items-center gap-1"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          </header>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search users..."
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <p className="text-sm font-medium mb-2">Role</p>
                    <Select
                      value={roleFilter}
                      onValueChange={(value) =>
                        handleFilterChange("role", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2 border-t">
                    <p className="text-sm font-medium mb-2">Status</p>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) =>
                        handleFilterChange("status", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

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

          {/* Users View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayUsers.map((user) => (
                <Card
                  key={user.id}
                  className={`overflow-hidden hover:shadow-md transition-shadow ${!user.is_active ? "opacity-70" : ""}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={user.avatar_url}
                          alt={user.full_name}
                        />
                        <AvatarFallback>
                          {user.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Badge
                        variant={user.is_active ? "default" : "secondary"}
                        className={
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      {user.full_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Role
                        </span>
                        <Badge variant="outline">
                          {user.role?.charAt(0).toUpperCase() +
                            user.role?.slice(1) || "User"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Membership
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            user.user_memberships?.length
                              ? "bg-blue-100 text-blue-800"
                              : ""
                          }
                        >
                          {user.user_memberships?.length
                            ? user.user_memberships[0].membership_plans.name
                            : "None"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Joined
                        </span>
                        <span className="text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/users/${user.id}`}>View</Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/users/${user.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleToggleUserStatus(user.id, user.is_active)
                        }
                      >
                        {user.is_active ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Membership
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 ${!user.is_active ? "bg-gray-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={user.avatar_url}
                              alt={user.full_name}
                            />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {user.role?.charAt(0).toUpperCase() +
                            user.role?.slice(1) || "User"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.user_memberships?.length ? (
                          <div>
                            <Badge className="bg-blue-100 text-blue-800">
                              {user.user_memberships[0].membership_plans.name}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              Expires:{" "}
                              {new Date(
                                user.user_memberships[0].end_date,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user.is_active ? "default" : "secondary"}
                          className={
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/users/${user.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/users/${user.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleUserStatus(user.id, user.is_active)
                            }
                          >
                            {user.is_active ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {(!displayUsers || displayUsers.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Users Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                {searchQuery
                  ? `No users match your search for "${searchQuery}"`
                  : "Add your first user to get started."}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="my-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the specified role and permissions.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
              {formError}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={newUserForm.full_name}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, full_name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={newUserForm.password}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, password: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newUserForm.role}
                onValueChange={(value) =>
                  setNewUserForm({ ...newUserForm, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
