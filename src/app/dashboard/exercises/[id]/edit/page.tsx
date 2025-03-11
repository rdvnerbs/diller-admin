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
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditExercisePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exercise, setExercise] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [exerciseType, setExerciseType] = useState("multiple-choice");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 10,
    module_id: "",
  });

  // Multiple choice state
  const [multipleChoiceData, setMultipleChoiceData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  // Matching state
  const [matchingData, setMatchingData] = useState({
    instruction: "Match the items",
    pairs: [
      { left: "", right: "" },
      { left: "", right: "" },
      { left: "", right: "" },
    ],
  });

  // Listening state
  const [listeningData, setListeningData] = useState({
    instruction: "Listen and answer",
    audioUrl: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exercise
        const { data: exerciseData, error: exerciseError } = await supabase
          .from("exercises")
          .select("*")
          .eq("id", params.id)
          .single();

        if (exerciseError || !exerciseData) {
          router.push("/dashboard/exercises");
          return;
        }

        setExercise(exerciseData);
        setExerciseType(exerciseData.type);
        setFormData({
          title: exerciseData.title,
          description: exerciseData.description || "",
          points: exerciseData.points || 10,
          module_id: exerciseData.module_id || "",
        });

        // Set content based on exercise type
        if (exerciseData.type === "multiple-choice" && exerciseData.content) {
          setMultipleChoiceData({
            question: exerciseData.content.question || "",
            options: exerciseData.content.options || ["", "", "", ""],
            correctAnswer: exerciseData.content.correctAnswer || 0,
          });
        } else if (exerciseData.type === "matching" && exerciseData.content) {
          setMatchingData({
            instruction: exerciseData.content.instruction || "Match the items",
            pairs: exerciseData.content.pairs || [
              { left: "", right: "" },
              { left: "", right: "" },
              { left: "", right: "" },
            ],
          });
        } else if (exerciseData.type === "listening" && exerciseData.content) {
          setListeningData({
            instruction:
              exerciseData.content.instruction || "Listen and answer",
            audioUrl: exerciseData.content.audioUrl || "",
            question: exerciseData.content.question || "",
            options: exerciseData.content.options || ["", "", "", ""],
            correctAnswer: exerciseData.content.correctAnswer || 0,
          });
        }

        // Fetch modules
        const { data: modulesData } = await supabase
          .from("learning_modules")
          .select("*, learning_categories(name)");

        if (modulesData) {
          setModules(modulesData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard/exercises");
      }
    };

    fetchData();
  }, [params.id, router, supabase]);

  const handleUpdateExercise = async () => {
    if (!exercise) return;

    try {
      setSaving(true);

      // Prepare content based on exercise type
      let content = {};
      if (exerciseType === "multiple-choice") {
        content = multipleChoiceData;
      } else if (exerciseType === "matching") {
        content = matchingData;
      } else if (exerciseType === "listening") {
        content = listeningData;
      }

      const { error } = await supabase
        .from("exercises")
        .update({
          title: formData.title,
          description: formData.description,
          type: exerciseType,
          points: formData.points,
          content: content,
          module_id: formData.module_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", exercise.id);

      if (error) throw error;

      router.push(`/dashboard/exercises/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating exercise:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleMultipleChoiceOptionChange = (index: number, value: string) => {
    const newOptions = [...multipleChoiceData.options];
    newOptions[index] = value;
    setMultipleChoiceData({ ...multipleChoiceData, options: newOptions });
  };

  const handleMatchingPairChange = (
    index: number,
    side: "left" | "right",
    value: string,
  ) => {
    const newPairs = [...matchingData.pairs];
    newPairs[index][side] = value;
    setMatchingData({ ...matchingData, pairs: newPairs });
  };

  const addMatchingPair = () => {
    setMatchingData({
      ...matchingData,
      pairs: [...matchingData.pairs, { left: "", right: "" }],
    });
  };

  const removeMatchingPair = (index: number) => {
    if (matchingData.pairs.length <= 2) return;
    const newPairs = [...matchingData.pairs];
    newPairs.splice(index, 1);
    setMatchingData({ ...matchingData, pairs: newPairs });
  };

  const handleListeningOptionChange = (index: number, value: string) => {
    const newOptions = [...listeningData.options];
    newOptions[index] = value;
    setListeningData({ ...listeningData, options: newOptions });
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
          <Link href={`/dashboard/exercises/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercise
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Exercise</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Information</CardTitle>
          <CardDescription>Update the details of this exercise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Exercise title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="5"
                max="50"
                value={formData.points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 10,
