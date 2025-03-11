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
import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditSentencePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    cumle_en: "",
    cumle_tr: "",
    cumle_zaman: "present_simple",
    gramer_konusu: "present_simple",
    cumle_ogeleri: {},
    resim_url: "",
    ses_url: "",
    seviye: "beginner",
  });

  // Sentence parts state
  const [sentenceParts, setSentenceParts] = useState({
    subject: "",
    verb: "",
    object: "",
    time: "",
    place: "",
  });

  useEffect(() => {
    const fetchSentence = async () => {
      try {
        const { data, error } = await supabase
          .from("sentences")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Sentence not found");

        setFormData({
          cumle_en: data.cumle_en || "",
          cumle_tr: data.cumle_tr || "",
          cumle_zaman: data.cumle_zaman || "present_simple",
          gramer_konusu: data.gramer_konusu || "present_simple",
          cumle_ogeleri: data.cumle_ogeleri || {},
          resim_url: data.resim_url || "",
          ses_url: data.ses_url || "",
          seviye: data.seviye || "beginner",
        });

        // Extract sentence parts from cumle_ogeleri
        if (data.cumle_ogeleri) {
          const parts = {
            subject: data.cumle_ogeleri.subject || "",
            verb: data.cumle_ogeleri.verb || "",
            object: data.cumle_ogeleri.object || "",
            time: data.cumle_ogeleri.time || "",
            place: data.cumle_ogeleri.place || "",
          };
          setSentenceParts(parts);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching sentence:", error);
        router.push("/dashboard/sentences");
      }
    };

    fetchSentence();
  }, [params.id, router, supabase]);

  const handleUpdateSentence = async () => {
    try {
      setError("");
      setSaving(true);

      // Validate form
      if (!formData.cumle_en.trim()) {
        setError("English sentence is required");
        setSaving(false);
        return;
      }

      if (!formData.cumle_tr.trim()) {
        setError("Turkish translation is required");
        setSaving(false);
        return;
      }

      // Prepare sentence parts
      const parts = {};
      for (const [key, value] of Object.entries(sentenceParts)) {
        if (value.trim()) {
          parts[key] = value.trim();
        }
      }

      // Update sentence
      const { error } = await supabase
        .from("sentences")
        .update({
          cumle_en: formData.cumle_en.trim(),
          cumle_tr: formData.cumle_tr.trim(),
          cumle_zaman: formData.cumle_zaman,
          gramer_konusu: formData.gramer_konusu,
          cumle_ogeleri: parts,
          resim_url: formData.resim_url.trim() || null,
          ses_url: formData.ses_url.trim() || null,
          seviye: formData.seviye,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (error) throw error;

      // Show success message
      alert("Sentence updated successfully!");

      router.push("/dashboard/sentences");
      router.refresh();
    } catch (error: any) {
      console.error("Error updating sentence:", error);
      setError(error.message || "Failed to update sentence");
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
          <Link href="/dashboard/sentences">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sentences
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Sentence</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sentence Information</CardTitle>
          <CardDescription>Update example sentence details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cumle_en">English Sentence</Label>
              <Textarea
                id="cumle_en"
                value={formData.cumle_en}
                onChange={(e) =>
                  setFormData({ ...formData, cumle_en: e.target.value })
                }
                placeholder="I am going to the store."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cumle_tr">Turkish Translation</Label>
              <Textarea
                id="cumle_tr"
                value={formData.cumle_tr}
                onChange={(e) =>
                  setFormData({ ...formData, cumle_tr: e.target.value })
                }
                placeholder="Mağazaya gidiyorum."
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cumle_zaman">Tense</Label>
              <Select
                value={formData.cumle_zaman}
                onValueChange={(value) =>
                  setFormData({ ...formData, cumle_zaman: value })
                }
              >
                <SelectTrigger id="cumle_zaman">
                  <SelectValue placeholder="Select tense" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present_simple">Present Simple</SelectItem>
                  <SelectItem value="present_continuous">
                    Present Continuous
                  </SelectItem>
                  <SelectItem value="past_simple">Past Simple</SelectItem>
                  <SelectItem value="past_continuous">
                    Past Continuous
                  </SelectItem>
                  <SelectItem value="present_perfect">
                    Present Perfect
                  </SelectItem>
                  <SelectItem value="present_perfect_continuous">
                    Present Perfect Continuous
                  </SelectItem>
                  <SelectItem value="past_perfect">Past Perfect</SelectItem>
                  <SelectItem value="past_perfect_continuous">
                    Past Perfect Continuous
                  </SelectItem>
                  <SelectItem value="future_simple">Future Simple</SelectItem>
                  <SelectItem value="future_continuous">
                    Future Continuous
                  </SelectItem>
                  <SelectItem value="future_perfect">Future Perfect</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gramer_konusu">Grammar Topic</Label>
              <Select
                value={formData.gramer_konusu}
                onValueChange={(value) =>
                  setFormData({ ...formData, gramer_konusu: value })
                }
              >
                <SelectTrigger id="gramer_konusu">
                  <SelectValue placeholder="Select grammar topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present_simple">Present Simple</SelectItem>
                  <SelectItem value="present_continuous">
                    Present Continuous
                  </SelectItem>
                  <SelectItem value="past_simple">Past Simple</SelectItem>
                  <SelectItem value="past_continuous">
                    Past Continuous
                  </SelectItem>
                  <SelectItem value="present_perfect">
                    Present Perfect
                  </SelectItem>
                  <SelectItem value="present_perfect_continuous">
                    Present Perfect Continuous
                  </SelectItem>
                  <SelectItem value="past_perfect">Past Perfect</SelectItem>
                  <SelectItem value="future_simple">Future Simple</SelectItem>
                  <SelectItem value="modals_requests">
                    Modals - Requests
                  </SelectItem>
                  <SelectItem value="first_conditional">
                    First Conditional
                  </SelectItem>
                  <SelectItem value="second_conditional">
                    Second Conditional
                  </SelectItem>
                  <SelectItem value="third_conditional">
                    Third Conditional
                  </SelectItem>
                  <SelectItem value="passive_voice">Passive Voice</SelectItem>
                  <SelectItem value="reported_speech">
                    Reported Speech
                  </SelectItem>
                  <SelectItem value="relative_clauses">
                    Relative Clauses
                  </SelectItem>
                  <SelectItem value="gerunds_infinitives">
                    Gerunds & Infinitives
                  </SelectItem>
                  <SelectItem value="correlative_conjunctions">
                    Correlative Conjunctions
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sentence Parts</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={sentenceParts.subject}
                  onChange={(e) =>
                    setSentenceParts({
                      ...sentenceParts,
                      subject: e.target.value,
                    })
                  }
                  placeholder="I, you, he, she, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verb" className="text-sm">
                  Verb
                </Label>
                <Input
                  id="verb"
                  value={sentenceParts.verb}
                  onChange={(e) =>
                    setSentenceParts({ ...sentenceParts, verb: e.target.value })
                  }
                  placeholder="am going, will eat, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="object" className="text-sm">
                  Object
                </Label>
                <Input
                  id="object"
                  value={sentenceParts.object}
                  onChange={(e) =>
                    setSentenceParts({
                      ...sentenceParts,
                      object: e.target.value,
                    })
                  }
                  placeholder="the book, him, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm">
                  Time
                </Label>
                <Input
                  id="time"
                  value={sentenceParts.time}
                  onChange={(e) =>
                    setSentenceParts({ ...sentenceParts, time: e.target.value })
                  }
                  placeholder="yesterday, tomorrow, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="place" className="text-sm">
                  Place
                </Label>
                <Input
                  id="place"
                  value={sentenceParts.place}
                  onChange={(e) =>
                    setSentenceParts({
                      ...sentenceParts,
                      place: e.target.value,
                    })
                  }
                  placeholder="at home, in the park, etc."
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Break down the sentence into its grammatical parts
            </p>
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
                placeholder="https://example.com/images/store.jpg"
              />
              <p className="text-xs text-muted-foreground">
                URL to an image representing this sentence
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
                placeholder="https://example.com/audio/sentence.mp3"
              />
              <p className="text-xs text-muted-foreground">
                URL to an audio file with pronunciation
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/sentences">Cancel</Link>
          </Button>
          <Button onClick={handleUpdateSentence} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
