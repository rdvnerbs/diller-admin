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
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewWordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    kelime_en: "",
    kelime_tr: "",
    kelime_en_aciklama: "",
    kelime_tr_aciklama: "",
    resim_url: "",
    ses_url: "",
    seviye: "beginner",
    kelime_turu: "noun",
  });

  const handleCreateWord = async () => {
    try {
      setError("");
      setSaving(true);

      // Validate form
      if (!formData.kelime_en.trim()) {
        setError("English word is required");
        setSaving(false);
        return;
      }

      if (!formData.kelime_tr.trim()) {
        setError("Turkish translation is required");
        setSaving(false);
        return;
      }

      // Create word
      const { data, error } = await supabase
        .from("words")
        .insert({
          kelime_en: formData.kelime_en.trim(),
          kelime_tr: formData.kelime_tr.trim(),
          kelime_en_aciklama: formData.kelime_en_aciklama.trim(),
          kelime_tr_aciklama: formData.kelime_tr_aciklama.trim(),
          resim_url: formData.resim_url.trim() || null,
          ses_url: formData.ses_url.trim() || null,
          seviye: formData.seviye,
          kelime_turu: formData.kelime_turu,
        })
        .select();

      if (error) throw error;

      router.push("/dashboard/words");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating word:", error);
      setError(error.message || "Failed to create word");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/dashboard/words">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vocabulary
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add New Word</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Word Information</CardTitle>
          <CardDescription>Add a new vocabulary word</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kelime_en">English Word</Label>
              <Input
                id="kelime_en"
                value={formData.kelime_en}
                onChange={(e) =>
                  setFormData({ ...formData, kelime_en: e.target.value })
                }
                placeholder="Hello"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelime_tr">Turkish Translation</Label>
              <Input
                id="kelime_tr"
                value={formData.kelime_tr}
                onChange={(e) =>
                  setFormData({ ...formData, kelime_tr: e.target.value })
                }
                placeholder="Merhaba"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kelime_en_aciklama">English Description</Label>
              <Textarea
                id="kelime_en_aciklama"
                value={formData.kelime_en_aciklama}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kelime_en_aciklama: e.target.value,
                  })
                }
                placeholder="A greeting used when meeting someone"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelime_tr_aciklama">Turkish Description</Label>
              <Textarea
                id="kelime_tr_aciklama"
                value={formData.kelime_tr_aciklama}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kelime_tr_aciklama: e.target.value,
                  })
                }
                placeholder="Biriyle karşılaşıldığında kullanılan bir selamlama"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seviye">Level</Label>
              <Select
                value={formData.seviye}
                onValueChange={(value) =>
                  setFormData({ ...formData, seviye: value })
                }
              >
                <SelectTrigger id="seviye">
                  <SelectValue placeholder="Select level" />
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
              <Label htmlFor="kelime_turu">Word Type</Label>
              <Select
                value={formData.kelime_turu}
                onValueChange={(value) =>
                  setFormData({ ...formData, kelime_turu: value })
                }
              >
                <SelectTrigger id="kelime_turu">
                  <SelectValue placeholder="Select word type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noun">Noun</SelectItem>
                  <SelectItem value="verb">Verb</SelectItem>
                  <SelectItem value="adjective">Adjective</SelectItem>
                  <SelectItem value="adverb">Adverb</SelectItem>
                  <SelectItem value="pronoun">Pronoun</SelectItem>
                  <SelectItem value="preposition">Preposition</SelectItem>
                  <SelectItem value="conjunction">Conjunction</SelectItem>
                  <SelectItem value="interjection">Interjection</SelectItem>
                  <SelectItem value="expression">Expression</SelectItem>
                  <SelectItem value="greeting">Greeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resim_url">Image URL (Optional)</Label>
              <Input
                id="resim_url"
                value={formData.resim_url}
                onChange={(e) =>
                  setFormData({ ...formData, resim_url: e.target.value })
                }
                placeholder="https://example.com/images/hello.jpg"
              />
              <p className="text-xs text-muted-foreground">
                URL to an image representing this word
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ses_url">Audio URL (Optional)</Label>
              <Input
                id="ses_url"
                value={formData.ses_url}
                onChange={(e) =>
                  setFormData({ ...formData, ses_url: e.target.value })
                }
                placeholder="https://example.com/audio/hello.mp3"
              />
              <p className="text-xs text-muted-foreground">
                URL to an audio file with pronunciation
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/words">Cancel</Link>
          </Button>
          <Button onClick={handleCreateWord} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Word
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
