import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tables } from "@/types/supabase";
import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Module = Tables<"learning_modules">;

interface RecommendationCardProps {
  module: Module;
  reason?: string;
}

export default function RecommendationCard({
  module,
  reason = "Based on your progress",
}: RecommendationCardProps) {
  // Map difficulty levels to colors
  const getDifficultyColor = (level: string) => {
    const levelMap: Record<string, string> = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-purple-100 text-purple-800",
      expert: "bg-red-100 text-red-800",
    };

    return levelMap[level.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 w-full">
        <Image
          src={
            module.image_url ||
            "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
          }
          alt={module.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(module.difficulty_level)}`}
          >
            {module.difficulty_level}
          </span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{module.title}</CardTitle>
        <CardDescription className="text-xs">{reason}</CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.description}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-0">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{module.estimated_duration || 15} min</span>
        </div>

        <Link
          href={`/dashboard/modules/${module.slug}`}
          className="text-xs font-medium text-blue-600 hover:underline flex items-center"
        >
          Start learning
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
