import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tables } from "@/types/supabase";
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

type Exercise = Tables<"exercises">;

interface ExercisePreviewCardProps {
  exercise: Exercise;
}

export default function ExercisePreviewCard({
  exercise,
}: ExercisePreviewCardProps) {
  // Get exercise type icon
  const getTypeIcon = (type: string) => {
    const typeMap: Record<string, React.ReactNode> = {
      "multiple-choice": <ListChecks className="h-5 w-5" />,
      matching: <CheckCircle2 className="h-5 w-5" />,
      listening: <Headphones className="h-5 w-5" />,
      conversation: <MessageSquare className="h-5 w-5" />,
    };

    return typeMap[type.toLowerCase()] || <ListChecks className="h-5 w-5" />;
  };

  // Get exercise type color
  const getTypeColor = (type: string) => {
    const typeMap: Record<string, { bg: string; text: string }> = {
      "multiple-choice": { bg: "bg-blue-100", text: "text-blue-700" },
      matching: { bg: "bg-green-100", text: "text-green-700" },
      listening: { bg: "bg-purple-100", text: "text-purple-700" },
      conversation: { bg: "bg-amber-100", text: "text-amber-700" },
    };

    return (
      typeMap[type.toLowerCase()] || {
        bg: "bg-gray-100",
        text: "text-gray-700",
      }
    );
  };

  const typeColor = getTypeColor(exercise.type);

  // Generate a preview based on exercise type and content
  const renderPreview = () => {
    try {
      const content = exercise.content as any;

      switch (exercise.type.toLowerCase()) {
        case "multiple-choice":
          return (
            <div className="space-y-2">
              <p className="text-sm font-medium">{content.question}</p>
              <div className="space-y-1">
                {content.options
                  ?.slice(0, 3)
                  .map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                      <span className="text-sm text-gray-600">{option}</span>
                    </div>
                  ))}
                {(content.options?.length || 0) > 3 && (
                  <div className="text-xs text-muted-foreground">
                    + more options
                  </div>
                )}
              </div>
            </div>
          );

        case "matching":
          return (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {content.instruction || "Match the items"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  {content.pairs
                    ?.slice(0, 2)
                    .map((pair: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm border rounded p-1 bg-gray-50"
                      >
                        {pair.left}
                      </div>
                    ))}
                </div>
                <div className="space-y-1">
                  {content.pairs
                    ?.slice(0, 2)
                    .map((pair: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm border rounded p-1 bg-gray-50"
                      >
                        {pair.right}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );

        case "listening":
          return (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="rounded-full bg-gray-100 p-3">
                  <Headphones className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <p className="text-sm text-center">
                {content.instruction || "Listen and answer the question"}
              </p>
              {content.question && (
                <p className="text-xs text-center text-muted-foreground">
                  Question: {content.question}
                </p>
              )}
            </div>
          );

        default:
          return (
            <div className="text-sm text-center text-muted-foreground">
              Preview not available
            </div>
          );
      }
    } catch (error) {
      return (
        <div className="text-sm text-center text-muted-foreground">
          Preview not available
        </div>
      );
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className={`${typeColor.bg} pb-3`}>
        <div className="flex justify-between items-center">
          <div className={`${typeColor.text} flex items-center gap-1`}>
            {getTypeIcon(exercise.type)}
            <span className="text-xs font-medium">{exercise.type}</span>
          </div>
          <div className="text-xs font-medium bg-white px-2 py-1 rounded-full border">
            {exercise.points || 10} pts
          </div>
        </div>
        <CardTitle className="text-base font-medium mt-1">
          {exercise.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-3">{renderPreview()}</CardContent>

      <CardFooter className="pt-2">
        <Button asChild size="sm" className="w-full">
          <Link href={`/dashboard/exercises/${exercise.id}`}>
            Start Exercise <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
