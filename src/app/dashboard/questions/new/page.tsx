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
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewQuestionPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [languages, setLanguages] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "multiple_choice",
    difficulty_level: "beginner",
    points: 10,
    language_id: "",
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

  // Word-Image state
  const [wordImageData, setWordImageData] = useState({
    instruction: "Match the word with the correct image",
    word: "",
    images: ["", "", "", ""],
    correctImage: 0,
  });

  // Audio-Word state
  const [audioWordData, setAudioWordData] = useState({
    instruction: "Listen and select the correct word",
    audioUrl: "",
    words: ["", "", "", ""],
    correctWord: 0,
  });

  // Fill in blank state
  const [fillInBlankData, setFillInBlankData] = useState({
    instruction: "Fill in the blank",
    sentence: "",
    blanks: [
      {
        position: 0,
        answer: "",
        options: ["", "", "", ""],
      },
    ],
  });

  // Translation state
  const [translationData, setTranslationData] = useState({
    instruction: "Translate the following sentence",
    sourceText: "",
    correctTranslation: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check auth
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/sign-in");
          return;
        }

        // Fetch languages
        const { data: languagesData } = await supabase
          .from("languages")
          .select("*")
          .eq("is_active", true);

        setLanguages(languagesData || []);

        // Set default language if available
        if (languagesData && languagesData.length > 0) {
          setFormData({
            ...formData,
            language_id: languagesData[0].id,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const handleCreateQuestion = async () => {
    try {
      setError("");
      setSaving(true);

      // Validate form
      if (!formData.title.trim()) {
        setError("Title is required");
        setSaving(false);
        return;
      }

      if (!formData.language_id) {
        setError("Language is required");
        setSaving(false);
        return;
      }

      // Prepare content based on question type
      let content = {};
      if (formData.type === "multiple_choice") {
        if (!multipleChoiceData.question.trim()) {
          setError("Question text is required");
          setSaving(false);
          return;
        }
        if (multipleChoiceData.options.some((opt) => !opt.trim())) {
          setError("All options must be filled");
          setSaving(false);
          return;
        }
        content = multipleChoiceData;
      } else if (formData.type === "matching") {
        if (matchingData.pairs.some((pair) => !pair.left.trim() || !pair.right.trim())) {
          setError("All matching pairs must be filled");
          setSaving(false);
          return;
        }
        content = matchingData;
      } else if (formData.type === "word_image") {
        if (!wordImageData.word.trim()) {
          setError("Word is required");
          setSaving(false);
          return;
        }
        if (wordImageData.images.some((img) => !img.trim())) {
          setError("All image URLs must be filled");
          setSaving(false);
          return;
        }
        content = wordImageData;
      } else if (formData.type === "audio_word") {
        if (!audioWordData.audioUrl.trim()) {
          setError("Audio URL is required");
          setSaving(false);
          return;
        }
        if (audioWordData.words.some((word) => !word.trim())) {
          setError("All word options must be filled");
          setSaving(false);
          return;
        }
        content = audioWordData;
      } else if (formData.type === "fill_in_blank_choice") {
        if (!fillInBlankData.sentence.trim()) {
          setError("Sentence is required");
          setSaving(false);
          return;
        }
        if (fillInBlankData.blanks.some((blank) => !blank.answer.trim() || blank.options.some((opt) => !opt.trim()))) {
          setError("All blanks and options must be filled");
          setSaving(false);
          return;
        }
        content = fillInBlankData;
      } else if (formData.type === "translation") {
        if (!translationData.sourceText.trim() || !translationData.correctTranslation.trim()) {
          setError("Source text and correct translation are required");
          setSaving(false);
          return;
        }
        content = translationData;
      }

      // Create question
      const { data, error: createError } = await supabase
        .from("questions")
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            type: formData.type,
            difficulty_level: formData.difficulty_level,
            points: formData.points,
            content: content,
            language_id: formData.language_id,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select();

      if (createError) throw createError;

      router.push("/dashboard/questions");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating question:", error);
      setError(error.message || "Failed to create question");
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

  const handleWordImageChange = (index: number, value: string) => {
    const newImages = [...wordImageData.images];
    newImages[index] = value;
    setWordImageData({ ...wordImageData, images: newImages });
  };

  const handleAudioWordChange = (index: number, value: string) => {
    const newWords = [...audioWordData.words];
    newWords[index] = value;
    setAudioWordData({ ...audioWordData, words: newWords });
  };

  const handleFillInBlankOptionChange = (blankIndex: number, optionIndex: number, value: string) => {
    const newBlanks = [...fillInBlankData.blanks];
    newBlanks[blankIndex].options[optionIndex] = value;
    setFillInBlankData({ ...fillInBlankData, blanks: newBlanks });
  };

  const addBlank = () => {
    setFillInBlankData({
      ...fillInBlankData,
      blanks: [
        ...fillInBlankData.blanks,
        {
          position: fillInBlankData.blanks.length,
          answer: "",
          options: ["", "", "", ""],
        },
      ],
    });
  };

  const removeBlank = (index: number) => {
    if (fillInBlankData.blanks.length <= 1) return;
    const newBlanks = [...fillInBlankData.blanks];
    newBlanks.splice(index, 1);
    // Update positions
    newBlanks.forEach((blank, idx) => {
      blank.position = idx;
    });
    setFillInBlankData({ ...fillInBlankData, blanks: newBlanks });
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
          <Link href="/dashboard/questions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Question</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Information</CardTitle>
          <CardDescription>Create a new question for exercises and exams</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="A question about basic English greetings"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Question Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="word_image">Word-Image Matching</SelectItem>
                  <SelectItem value="audio_word">Audio-Word Matching</SelectItem>
                  <SelectItem value="audio_multiple_choice">Audio Multiple Choice</SelectItem>
                  <SelectItem value="fill_in_blank_text">Fill in Blank (Text)</SelectItem>
                  <SelectItem value="fill_in_blank_choice">Fill in Blank (Choice)</SelectItem>
                  <SelectItem value="dictation">Dictation</SelectItem>
                  <SelectItem value="translation">Translation</SelectItem>
                  <SelectItem value="word_completion">Word Completion</SelectItem>
                  <SelectItem value="sentence_completion">Sentence Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty_level: value })
                }
              >
                <SelectTrigger id="difficulty_level">
                  <SelectValue placeholder="Select difficulty level" />
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

          <div className="space-y-2">
            <Label htmlFor="language_id">Language</Label>
            <Select
              value={formData.language_id}
              onValueChange={(value) =>
                setFormData({ ...formData, language_id: value })
              }
            >
              <SelectTrigger id="language_id">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Content Based on Type */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-4">Question Content</h3>

            {/* Multiple Choice */}
            {formData.type === "multiple_choice" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question Text</Label>
                  <Textarea
                    id="question"
                    value={multipleChoiceData.question}
                    onChange={(e) =>
                      setMultipleChoiceData({
                        ...multipleChoiceData,
                        question: e.target.value,
                      })
                    }
                    placeholder="What is the correct greeting for meeting someone in the morning?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {multipleChoiceData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="correct-answer"
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
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer
                  </p>
                </div>
              </div>
            )}

            {/* Matching */}
            {formData.type === "matching" && (
              <div className="space-y-4">
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
                    placeholder="Match the English words with their Turkish translations"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Matching Pairs</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMatchingPair}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Pair
                    </Button>
                  </div>

                  {matchingData.pairs.map((pair, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 mb-2"
                    >
                      <Input
                        value={pair.left}
                        onChange={(e) =>
                          handleMatchingPairChange(
                            index,
                            "left",
                            e.target.value,
                          )
                        }
                        placeholder="Left item (e.g., English word)"
                        className="flex-1"
                      />
                      <span className="text-gray-500">→</span>
                      <Input
                        value={pair.right}
                        onChange={(e) =>
                          handleMatchingPairChange(
                            index,
                            "right",
                            e.target.value,
                          )
                        }
                        placeholder="Right item (e.g., Turkish translation)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMatchingPair(index)}
                        disabled={matchingData.pairs.length <= 2}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Word-Image Matching */}
            {formData.type === "word_image" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="word-image-instruction">Instruction</Label>
                  <Input
                    id="word-image-instruction"
                    value={wordImageData.instruction}
                    onChange={(e) =>
                      setWordImageData({
                        ...wordImageData,
                        instruction: e.target.value,
                      })
                    }
                    placeholder="Match the word with the correct image"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="word">Word</Label>
                  <Input
                    id="word"
                    value={wordImageData.word}
                    onChange={(e) =>
                      setWordImageData({
                        ...wordImageData,
                        word: e.target.value,
                      })
                    }
                    placeholder="Enter the word (e.g., Apple)"
                  />
                </div>

                <div className="space-y-2