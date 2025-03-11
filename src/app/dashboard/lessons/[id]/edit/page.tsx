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
import { HtmlEditor } from "@/components/ui/html-editor";
import { Switch } from "@/components/ui/switch";
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  MessageSquare,
  Plus,
  Trash,
  Video,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EditLessonPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [sentences, setSentences] = useState<any[]>([]);
  const [selectedWords, setSelectedWords] = useState<any[]>([]);
  const [selectedSentences, setSelectedSentences] = useState<any[]>([]);
  const [isWordDialogOpen, setIsWordDialogOpen] = useState(false);
  const [isSentenceDialogOpen, setIsSentenceDialogOpen] = useState(false);
  const [availableWords, setAvailableWords] = useState<any[]>([]);
  const [availableSentences, setAvailableSentences] = useState<any[]>([]);
  const [wordSearchTerm, setWordSearchTerm] = useState("");
  const [sentenceSearchTerm, setSentenceSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_number: 1,
    duration_minutes: 15,
    content: {},
    is_published: false,
    video_url: "",
    video_file_path: "",
    html_content: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", params.id)
          .single();

        if (lessonError || !lessonData) {
          router.push("/dashboard/courses");
          return;
        }

        setLesson(lessonData);

        // Fetch course
        const { data: courseData } = await supabase
          .from("courses")
          .select("*")
          .eq("id", lessonData.course_id)
          .single();

        if (courseData) {
          setCourse(courseData);
        }

        // Fetch all words
        const { data: wordsData } = await supabase.from("words").select("*");
        setWords(wordsData || []);

        // Fetch all sentences
        const { data: sentencesData } = await supabase
          .from("sentences")
          .select("*");
        setSentences(sentencesData || []);

        // Fetch lesson words
        const { data: lessonWordsData } = await supabase
          .from("lesson_words")
          .select("*, word:words(*)")
          .eq("lesson_id", params.id);

        // Fetch lesson sentences
        const { data: lessonSentencesData } = await supabase
          .from("lesson_sentences")
          .select("*, sentence:sentences(*)")
          .eq("lesson_id", params.id);

        // Set selected words and sentences
        setSelectedWords(lessonWordsData?.map((lw) => lw.word) || []);
        setSelectedSentences(
          lessonSentencesData?.map((ls) => ls.sentence) || [],
        );

        setFormData({
          title: lessonData.title || "",
          description: lessonData.description || "",
          order_number: lessonData.order_number || 1,
          duration_minutes: lessonData.duration_minutes || 15,
          content: lessonData.content || {},
          is_published: lessonData.is_published || false,
          video_url: lessonData.video_url || "",
          video_file_path: lessonData.video_file_path || "",
          html_content: lessonData.html_content || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard/courses");
      }
    };

    fetchData();
  }, [params.id, router, supabase]);

  // Filter available words and sentences based on search term
  useEffect(() => {
    // Filter words that are not already selected
    const filteredWords = words.filter(
      (word) =>
        !selectedWords.some((sw) => sw.id === word.id) &&
        (word.kelime_en.toLowerCase().includes(wordSearchTerm.toLowerCase()) ||
          word.kelime_tr.toLowerCase().includes(wordSearchTerm.toLowerCase())),
    );
    setAvailableWords(filteredWords);

    // Filter sentences that are not already selected
    const filteredSentences = sentences.filter(
      (sentence) =>
        !selectedSentences.some((ss) => ss.id === sentence.id) &&
        (sentence.cumle_en
          .toLowerCase()
          .includes(sentenceSearchTerm.toLowerCase()) ||
          sentence.cumle_tr
            .toLowerCase()
            .includes(sentenceSearchTerm.toLowerCase())),
    );
    setAvailableSentences(filteredSentences);
  }, [
    words,
    sentences,
    selectedWords,
    selectedSentences,
    wordSearchTerm,
    sentenceSearchTerm,
  ]);

  const handleUpdateLesson = async () => {
    try {
      setError("");
      setSaving(true);

      // Validate form
      if (!formData.title.trim()) {
        setError("Lesson title is required");
        setSaving(false);
        return;
      }

      // Update lesson
      const { error } = await supabase
        .from("lessons")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          order_number: formData.order_number,
          duration_minutes: formData.duration_minutes,
          content: formData.content,
          is_published: formData.is_published,
          video_url: formData.video_url.trim(),
          video_file_path: formData.video_file_path.trim(),
          html_content: formData.html_content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (error) throw error;

      // Update lesson words - first delete all existing relationships
      await supabase.from("lesson_words").delete().eq("lesson_id", params.id);

      // Then insert new relationships
      if (selectedWords.length > 0) {
        const wordRelationships = selectedWords.map((word) => ({
          lesson_id: params.id,
          word_id: word.id,
        }));

        const { error: wordsError } = await supabase
          .from("lesson_words")
          .insert(wordRelationships);

        if (wordsError) throw wordsError;
      }

      // Update lesson sentences - first delete all existing relationships
      await supabase
        .from("lesson_sentences")
        .delete()
        .eq("lesson_id", params.id);

      // Then insert new relationships
      if (selectedSentences.length > 0) {
        const sentenceRelationships = selectedSentences.map((sentence) => ({
          lesson_id: params.id,
          sentence_id: sentence.id,
        }));

        const { error: sentencesError } = await supabase
          .from("lesson_sentences")
          .insert(sentenceRelationships);

        if (sentencesError) throw sentencesError;
      }

      // Show success message
      alert("Lesson updated successfully!");

      router.push(`/dashboard/courses/${lesson.course_id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating lesson:", error);
      setError(error.message || "Failed to update lesson");
    } finally {
      setSaving(false);
    }
  };

  const addWord = (word: any) => {
    setSelectedWords([...selectedWords, word]);
    setIsWordDialogOpen(false);
  };

  const removeWord = (wordId: string) => {
    setSelectedWords(selectedWords.filter((word) => word.id !== wordId));
  };

  const addSentence = (sentence: any) => {
    setSelectedSentences([...selectedSentences, sentence]);
    setIsSentenceDialogOpen(false);
  };

  const removeSentence = (sentenceId: string) => {
    setSelectedSentences(
      selectedSentences.filter((sentence) => sentence.id !== sentenceId),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" asChild className="mr-4">
          <Link href={`/dashboard/courses/${lesson.course_id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Lesson</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
              <CardDescription>
                Update the lesson details for {course?.title || "this course"}
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
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Introduction to Basic Phrases"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Order Number</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order_number: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Position of this lesson in the course
                  </p>
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
                  placeholder="A brief description of what this lesson covers..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="180"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: parseInt(e.target.value) || 15,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Estimated time to complete this lesson
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL (Optional)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                  placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                />
                <p className="text-xs text-muted-foreground">
                  External video URL (YouTube, Vimeo, or direct video link)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_file_path">
                  Video File Path (Optional)
                </Label>
                <Input
                  id="video_file_path"
                  value={formData.video_file_path}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      video_file_path: e.target.value,
                    })
                  }
                  placeholder="/videos/lesson-video.mp4"
                />
                <p className="text-xs text-muted-foreground">
                  Path to uploaded video file (if not using external URL)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="html_content">Lesson Content</Label>
                <HtmlEditor
                  value={formData.html_content}
                  onChange={(value) =>
                    setFormData({ ...formData, html_content: value })
                  }
                  placeholder="Enter lesson content here..."
                  minHeight="300px"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="is_published" className="font-medium">
                    Publish Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Make this lesson available to students
                  </p>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_published: checked })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/courses/${lesson.course_id}`}>
                  Cancel
                </Link>
              </Button>
              <Button onClick={handleUpdateLesson} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vocabulary Words */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Vocabulary Words</span>
                <Dialog
                  open={isWordDialogOpen}
                  onOpenChange={setIsWordDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" /> Add Words
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Vocabulary Words</DialogTitle>
                      <DialogDescription>
                        Select words to include in this lesson.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="Search words..."
                        value={wordSearchTerm}
                        onChange={(e) => setWordSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                      <div className="max-h-[300px] overflow-y-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>English</TableHead>
                              <TableHead>Turkish</TableHead>
                              <TableHead>Level</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableWords.length > 0 ? (
                              availableWords.map((word) => (
                                <TableRow key={word.id}>
                                  <TableCell>{word.kelime_en}</TableCell>
                                  <TableCell>{word.kelime_tr}</TableCell>
                                  <TableCell>
                                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {word.seviye || "beginner"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addWord(word)}
                                    >
                                      Add
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-4 text-muted-foreground"
                                >
                                  No words found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsWordDialogOpen(false)}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Key vocabulary words for this lesson
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedWords.length > 0 ? (
                <div className="space-y-2">
                  {selectedWords.map((word) => (
                    <div
                      key={word.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-medium">{word.kelime_en}</p>
                        <p className="text-sm text-muted-foreground">
                          {word.kelime_tr}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeWord(word.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No vocabulary words added yet</p>
                  <p className="text-sm">Click "Add Words" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Example Sentences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Example Sentences</span>
                <Dialog
                  open={isSentenceDialogOpen}
                  onOpenChange={setIsSentenceDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" /> Add Sentences
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Example Sentences</DialogTitle>
                      <DialogDescription>
                        Select sentences to include in this lesson.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="Search sentences..."
                        value={sentenceSearchTerm}
                        onChange={(e) => setSentenceSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                      <div className="max-h-[300px] overflow-y-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>English</TableHead>
                              <TableHead>Turkish</TableHead>
                              <TableHead>Level</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableSentences.length > 0 ? (
                              availableSentences.map((sentence) => (
                                <TableRow key={sentence.id}>
                                  <TableCell className="max-w-[200px] truncate">
                                    {sentence.cumle_en}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate">
                                    {sentence.cumle_tr}
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {sentence.seviye || "beginner"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addSentence(sentence)}
                                    >
                                      Add
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-4 text-muted-foreground"
                                >
                                  No sentences found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsSentenceDialogOpen(false)}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Example sentences for this lesson
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSentences.length > 0 ? (
                <div className="space-y-2">
                  {selectedSentences.map((sentence) => (
                    <div
                      key={sentence.id}
                      className="flex justify-between items-start p-2 bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-medium line-clamp-2">
                          {sentence.cumle_en}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {sentence.cumle_tr}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0"
                        onClick={() => removeSentence(sentence.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No example sentences added yet</p>
                  <p className="text-sm">
                    Click "Add Sentences" to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.video_url && (
            <Card>
              <CardHeader>
                <CardTitle>Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                  {formData.video_url.includes("youtube.com") ||
                  formData.video_url.includes("youtu.be") ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${formData.video_url
                        .split("/")
                        .pop()}`}
                      className="w-full h-full rounded-md"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Video URL provided
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
