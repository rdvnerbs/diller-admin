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
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditLanguagePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    flag_url: "",
    is_active: true,
  });

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const { data, error } = await supabase
          .from("languages")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error || !data) {
          router.push("/dashboard/languages");
          return;
        }

        setLanguage(data);
        setFormData({
          name: data.name || "",
          code: data.code || "",
          flag_url: data.flag_url || "",
          is_active: data.is_active,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching language:", error);
        router.push("/dashboard/languages");
      }
    };

    fetchLanguage();
  }, [params.id]);

  const handleUpdateLanguage = async () => {
    try {
      setError("");
      setSaving(true);

      // Validate form
      if (!formData.name.trim()) {
        setError("Language name is required");
        setSaving(false);
        return;
      }

      if (!formData.code.trim()) {
        setError("Language code is required");
        setSaving(false);
        return;
      }

      // Update language
      const { error } = await supabase
        .from("languages")
        .update({
          name: formData.name.trim(),
          code: formData.code.trim().toLowerCase(),
          flag_url: formData.flag_url.trim() || null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (error) throw error;

      router.push("/dashboard/languages");
      router.refresh();
    } catch (error: any) {
      console.error("Error updating language:", error);
      setError(error.message || "Failed to update language");
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
          <Link href="/dashboard/languages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Languages
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Language</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Language Information</CardTitle>
          <CardDescription>Update the language details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Language Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="English"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Language Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="en"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                ISO language code (e.g., en, es, fr)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flag_url">Flag URL (Optional)</Label>
            <Input
              id="flag_url"
              value={formData.flag_url}
              onChange={(e) =>
                setFormData({ ...formData, flag_url: e.target.value })
              }
              placeholder="https://example.com/flags/en.png"
            />
            <p className="text-xs text-muted-foreground">
              URL to the flag image for this language
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="is_active" className="font-medium">
                Active Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable this language on the platform
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
            <Link href="/dashboard/languages">Cancel</Link>
          </Button>
          <Button onClick={handleUpdateLanguage} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
