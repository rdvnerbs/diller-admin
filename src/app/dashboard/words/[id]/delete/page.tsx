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
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DeleteWordPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [word, setWord] = useState<any>(null);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const { data, error } = await supabase
          .from("words")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Word not found");

        setWord(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching word:", error);
        router.push("/dashboard/words");
      }
    };

    fetchWord();
  }, [params.id, router, supabase]);

  const handleDeleteWord = async () => {
    try {
      setError("");
      setDeleting(true);

      const { error } = await supabase
        .from("words")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      router.push("/dashboard/words");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting word:", error);
      setError(error.message || "Failed to delete word");
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/dashboard/words">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vocabulary
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Delete Word</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Confirm Deletion
          </CardTitle>
          <CardDescription>
            Are you sure you want to delete this word? This action cannot be
            undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">English</p>
                <p className="font-medium">{word.kelime_en}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Turkish</p>
                <p className="font-medium">{word.kelime_tr}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Level</p>
                <p className="font-medium">{word.seviye}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="font-medium">{word.kelime_turu}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/words">Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteWord}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Word
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
