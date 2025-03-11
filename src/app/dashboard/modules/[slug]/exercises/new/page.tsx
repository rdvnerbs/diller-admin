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
import { createClient } from "../../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewModuleExercisePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [module, setModule] = useState<any>(null);
  const [exerciseType, setExerciseType] = useState("multiple-choice");
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 10,
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
    const fetchModule = async () => {
      try {
        const { data, error } = await supabase
          .from("learning_modules")
          .select("*")
          .eq("slug", params.slug)
          .single();

        if (error || !data) {
          router.push("/dashboard/modules");
          return;
        }

        setModule(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching module:", error);
        router.push("/dashboard/modules");
      }
    };

    fetchModule();
  }, [params.slug, router, supabase]);

  const handleCreateExercise = async () => {
    try {
      setError("");
      setSaving(true);

      // Validate form
      if (!formData.title.trim()) {
        setError("Exercise title is required");
        setSaving(false);
        return;
      }

      // Prepare content based on exercise type
      let content = {};
      if (exerciseType === "multiple-choice") {
        if (!multipleChoiceData.question.trim()) {
          setError("Question is required");
          setSaving(false);
          return;
        }
        content = multipleChoiceData;
      } else if (exerciseType === "matching") {
        if (
          matchingData.pairs.some(
            (pair) => !pair.left.trim() || !pair.right.trim(),
          )
        ) {
          setError("All matching pairs must be filled");
          setSaving(false);
          return;
        }
        content = matchingData;
      } else if (exerciseType === "listening") {
        if (!listeningData.audioUrl.trim()) {
          setError("Audio URL is required");
          setSaving(false);
          return;
        }
        if (!listeningData.question.trim()) {
          setError("Question is required");
          setSaving(false);
          return;
        }
        content = listeningData;
      }

      // Create exercise
      const { data, error } = await supabase
        .from("exercises")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: exerciseType,
          points: formData.points,
          content: content,
          module_id: module.id,
        })
        .select();

      if (error) throw error;

      router.push(`/dashboard/modules/${params.slug}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error creating exercise:", error);
      setError(error.message || "Failed to create exercise");
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
          <Link href={`/dashboard/modules/${params.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Exercise</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Information</CardTitle>
          <CardDescription>
            Create a new exercise for {module.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exercise Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Basic Greetings Quiz"
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
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="A brief description of this exercise"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Exercise Type</Label>
            <Tabs
              value={exerciseType}
              onValueChange={setExerciseType}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="multiple-choice">
                  Multiple Choice
                </TabsTrigger>
                <TabsTrigger value="matching">Matching</TabsTrigger>
                <TabsTrigger value="listening">Listening</TabsTrigger>
              </TabsList>

              {/* Multiple Choice Content */}
              <TabsContent value="multiple-choice" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mc-question">Question</Label>
                  <Textarea
                    id="mc-question"
                    value={multipleChoiceData.question}
                    onChange={(e) =>
                      setMultipleChoiceData({
                        ...multipleChoiceData,
                        question: e.target.value,
                      })
                    }
                    placeholder="Enter your question"
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Options</Label>
                  {multipleChoiceData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="correctAnswer"
                        checked={multipleChoiceData.correctAnswer === index}
                        onChange={() =>
                          setMultipleChoiceData({
                            ...multipleChoiceData,
                            correctAnswer: index,
                          })
                        }
                        className="h-4 w-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) =>
                          handleMultipleChoiceOptionChange(
                            index,
                            e.target.value,
                          )
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer
                  </p>
                </div>
              </TabsContent>

              {/* Matching Content */}
              <TabsContent value="matching" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matching-instruction">Instruction</Label>
                  <Input
                    id="matching-instruction"
                    value={matchingData.instruction}
                    onChange={(e) =>
                      setMatchingData({
                        ...matchingData,
                        instruction: e.target.value,
                      })
                    }
                    placeholder="Instructions for the matching exercise"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Matching Pairs</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMatchingPair}
                    >
                      Add Pair
                    </Button>
                  </div>

                  {matchingData.pairs.map((pair, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={pair.left}
                        onChange={(e) =>
                          handleMatchingPairChange(
                            index,
                            "left",
                            e.target.value,
                          )
                        }
                        placeholder="Left item"
                        className="flex-1"
                      />
                      <span className="text-center">→</span>
                      <Input
                        value={pair.right}
                        onChange={(e) =>
                          handleMatchingPairChange(
                            index,
                            "right",
                            e.target.value,
                          )
                        }
                        placeholder="Right item"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMatchingPair(index)}
                        disabled={matchingData.pairs.length <= 2}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Listening Content */}
              <TabsContent value="listening" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="listening-instruction">Instruction</Label>
                  <Input
                    id="listening-instruction"
                    value={listeningData.instruction}
                    onChange={(e) =>
                      setListeningData({
                        ...listeningData,
                        instruction: e.target.value,
                      })
                    }
                    placeholder="Instructions for the listening exercise"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio-url">Audio URL</Label>
                  <Input
                    id="audio-url"
                    value={listeningData.audioUrl}
                    onChange={(e) =>
                      setListeningData({
                        ...listeningData,
                        audioUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listening-question">Question</Label>
                  <Textarea
                    id="listening-question"
                    value={listeningData.question}
                    onChange={(e) =>
                      setListeningData({
                        ...listeningData,
                        question: e.target.value,
                      })
                    }
                    placeholder="Question after listening"
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Answer Options</Label>
                  {listeningData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`listening-option-${index}`}
                        name="listeningCorrectAnswer"
                        checked={listeningData.correctAnswer === index}
                        onChange={() =>
                          setListeningData({
                            ...listeningData,
                            correctAnswer: index,
                          })
                        }
                        className="h-4 w-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) =>
                          handleListeningOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/modules/${params.slug}`}>Cancel</Link>
          </Button>
          <Button onClick={handleCreateExercise} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Exercise
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
