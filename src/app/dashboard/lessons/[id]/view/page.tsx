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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Edit,
  Loader2,
  MessageSquare,
  Send,
  Trash,
  Save,
  X,
  Bookmark,
  Volume2,
  VolumeX,
  Video,
} from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ViewLessonPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedWords, setSelectedWords] = useState<any[]>([]);
  const [selectedSentences, setSelectedSentences] = useState<any[]>([]);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push("/sign-in");
          return;
        }
        setUser(userData.user);

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

        // Fetch user's notes for this lesson
        const { data: notesData } = await supabase
          .from("user_lesson_notes")
          .select("notes")
          .eq("user_id", userData.user.id)
          .eq("lesson_id", params.id)
          .single();

        if (notesData) {
          setNotes(notesData.notes);
          setSavedNotes(notesData.notes);
        }

        // Fetch user's progress for this lesson to resume playback
        const { data: progressData } = await supabase
          .from("user_lesson_progress")
          .select("playback_position")
          .eq("user_id", userData.user.id)
          .eq("lesson_id", params.id)
          .single();

        if (progressData && progressData.playback_position) {
          setCurrentTime(progressData.playback_position);
        }

        // Fetch comments for this lesson
        const { data: commentsData } = await supabase
          .from("lesson_comments")
          .select("*, users(name, avatar_url)")
          .eq("lesson_id", params.id)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });

        if (commentsData) {
          setComments(commentsData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard/courses");
      }
    };

    fetchData();
  }, [params.id, router, supabase]);

  useEffect(() => {
    // Set initial video time when component loads
    if (videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const saveProgress = async () => {
    if (!user || !videoRef.current) return;

    try {
      await supabase.from("user_lesson_progress").upsert({
        user_id: user.id,
        lesson_id: params.id,
        playback_position: videoRef.current.currentTime,
        is_completed:
          videoRef.current.currentTime >= videoRef.current.duration * 0.9, // Mark as completed if watched 90%
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const saveNotes = async () => {
    if (!user) return;

    try {
      // Check if notes record exists
      const { data: existingNotes } = await supabase
        .from("user_lesson_notes")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", params.id)
        .maybeSingle();

      if (existingNotes) {
        // Update existing notes
        await supabase
          .from("user_lesson_notes")
          .update({
            notes: notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingNotes.id);
      } else {
        // Insert new notes
        await supabase.from("user_lesson_notes").insert({
          user_id: user.id,
          lesson_id: params.id,
          notes: notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      setSavedNotes(notes);
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      setIsSubmittingComment(true);

      const { data, error } = await supabase
        .from("lesson_comments")
        .insert({
          lesson_id: params.id,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select("*, users(name, avatar_url)")
        .single();

      if (error) throw error;

      // Add new comment to the list
      setComments([data, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!user || !editedCommentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const { data, error } = await supabase
        .from("lesson_comments")
        .update({
          content: editedCommentText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", user.id) // Ensure user can only edit their own comments
        .select("*, users(name, avatar_url)")
        .single();

      if (error) throw error;

      setComments(
        comments.map((comment) => (comment.id === commentId ? data : comment)),
      );
      setEditingComment(null);
      setEditedCommentText("");
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("lesson_comments")
        .update({ is_deleted: true })
        .eq("id", commentId)
        .eq("user_id", user.id); // Ensure user can only delete their own comments

      if (error) throw error;

      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" asChild className="mr-4">
          <Link href={`/dashboard/courses/${lesson.course_id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <div className="ml-auto">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/lessons/${params.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lesson
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area - video and content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video player */}
          <div className="bg-black rounded-lg overflow-hidden">
            {lesson.video_url || lesson.video_file_path ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  controls
                  controlsList="nodownload"
                  onTimeUpdate={() => {
                    handleTimeUpdate();
                    // Save progress every 10 seconds
                    if (
                      Math.floor(videoRef.current?.currentTime || 0) % 10 ===
                      0
                    ) {
                      saveProgress();
                    }
                  }}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={saveProgress}
                  onPause={saveProgress}
                >
                  <source
                    src={
                      lesson.video_url ||
                      lesson.video_file_path ||
                      "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                    }
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-video bg-gray-800 text-white">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No video available for this lesson</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs for content and comments */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="content">Lesson Content</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            {/* Lesson content tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Content</CardTitle>
                  <CardDescription>
                    {lesson.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lesson.html_content ? (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: lesson.html_content }}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      No content available for this lesson.
                    </p>
                  )}

                  {/* Vocabulary Words Section */}
                  {selectedWords.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Key Vocabulary
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 divide-y">
                          {selectedWords.map((word, index) => (
                            <div key={word.id} className="py-3">
                              <div className="flex flex-wrap justify-between">
                                <div className="font-medium text-blue-700">
                                  {word.kelime_en}
                                </div>
                                <div className="text-gray-600">
                                  {word.kelime_tr}
                                </div>
                              </div>
                              {word.kelime_en_aciklama && (
                                <div className="text-sm text-gray-500 mt-1 italic">
                                  "{word.kelime_en_aciklama}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Example Sentences Section */}
                  {selectedSentences.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Example Sentences
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 divide-y">
                          {selectedSentences.map((sentence, index) => (
                            <div key={sentence.id} className="py-3">
                              <div className="font-medium">
                                {sentence.cumle_en}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {sentence.cumle_tr}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {sentence.gramer_konusu?.replace(/_/g, " ") ||
                                    "Grammar"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {sentence.seviye || "Beginner"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Legacy Content Display */}
                  {lesson.content?.vocabulary &&
                    lesson.content.vocabulary.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">
                          Additional Vocabulary
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 divide-y">
                            {lesson.content.vocabulary.map(
                              (item: any, index: number) => (
                                <div key={index} className="py-3">
                                  <div className="flex flex-wrap justify-between">
                                    <div className="font-medium text-blue-700">
                                      {item.word}
                                    </div>
                                    <div className="text-gray-600">
                                      {item.definition}
                                    </div>
                                  </div>
                                  {item.example && (
                                    <div className="text-sm text-gray-500 mt-1 italic">
                                      "{item.example}"
                                    </div>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Legacy Example Sentences */}
                  {lesson.content?.example_sentences &&
                    lesson.content.example_sentences.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">
                          Additional Example Sentences
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 divide-y">
                            {lesson.content.example_sentences.map(
                              (item: any, index: number) => (
                                <div key={index} className="py-3">
                                  <div className="font-medium">
                                    {item.sentence}
                                  </div>
                                  {item.translation && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {item.translation}
                                    </div>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comments tab */}
            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                  <CardDescription>
                    Share your thoughts or ask questions about this lesson
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add comment form */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                                {comment.users?.avatar_url ? (
                                  <img
                                    src={comment.users.avatar_url}
                                    alt="User"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-bold">
                                    {(comment.users?.name ||
                                      "U")[0].toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {comment.users?.name || "Anonymous"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    comment.created_at,
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Edit/Delete buttons (only for user's own comments) */}
                            {user && comment.user_id === user.id && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingComment(comment.id);
                                    setEditedCommentText(comment.content);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Comment content (or edit form) */}
                          {editingComment === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editedCommentText}
                                onChange={(e) =>
                                  setEditedCommentText(e.target.value)
                                }
                                className="w-full"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditedCommentText("");
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" /> Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleEditComment(comment.id)}
                                  disabled={isSubmittingComment}
                                >
                                  {isSubmittingComment ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-1" />
                                  )}
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p>{comment.content}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - notes */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                <span>My Notes</span>
              </CardTitle>
              <CardDescription>
                Take notes while watching the lesson
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your notes here..."
                className="min-h-[300px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                {notes !== savedNotes ? "Unsaved changes" : "All changes saved"}
              </p>
              <Button
                onClick={saveNotes}
                disabled={notes === savedNotes}
                size="sm"
              >
                Save Notes
              </Button>
            </CardFooter>
          </Card>

          {/* Course navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Course Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mb-2" asChild>
                <Link href={`/dashboard/courses/${lesson.course_id}`}>
                  Back to Course Overview
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
