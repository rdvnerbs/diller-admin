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
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DeleteAccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      setError("");
      setDeleting(true);

      // Check confirmation text
      if (confirmation !== "DELETE") {
        setError("Please type DELETE to confirm account deletion");
        setDeleting(false);
        return;
      }

      // In a real application, you would need to implement a secure way to delete the user account
      // This might involve a server-side function or admin API call

      // For demo purposes, we'll just sign out
      await supabase.auth.signOut();
      router.push("/sign-in");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setError(error.message || "Failed to delete account");
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
          <Link href="/dashboard/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-red-600">Delete Account</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">
              Warning: This action cannot be undone
            </CardTitle>
          </div>
          <CardDescription>
            Deleting your account will permanently remove all your data from our
            system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">
                What happens when you delete your account:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  Your profile and personal information will be permanently
                  deleted
                </li>
                <li>Your learning progress and achievements will be lost</li>
                <li>
                  You will lose access to any premium content you may have
                  purchased
                </li>
                <li>Your data cannot be recovered once deleted</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-red-200">
              <Label
                htmlFor="confirmation"
                className="font-medium text-red-600"
              >
                Type DELETE to confirm account deletion
              </Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Type DELETE here"
                className="mt-2 border-red-200"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/profile">Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deleting || confirmation !== "DELETE"}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
