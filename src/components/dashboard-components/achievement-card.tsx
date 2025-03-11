import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tables } from "@/types/supabase";
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Compass,
  Flame,
  Globe,
  GraduationCap,
  Star,
  Zap,
} from "lucide-react";

type Achievement = Tables<"achievements">;
type UserAchievement = Tables<"user_achievements">;

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement | null;
}

export default function AchievementCard({
  achievement,
  userAchievement = null,
}: AchievementCardProps) {
  const isEarned = !!userAchievement;

  // Map achievement icons based on the icon name stored in the database
  const getIcon = (iconName: string | null) => {
    const iconMap: Record<string, React.ReactNode> = {
      Award: <Award className="h-6 w-6" />,
      Zap: <Zap className="h-6 w-6" />,
      BookOpen: <BookOpen className="h-6 w-6" />,
      GraduationCap: <GraduationCap className="h-6 w-6" />,
      CheckCircle: <CheckCircle className="h-6 w-6" />,
      Flame: <Flame className="h-6 w-6" />,
      CalendarCheck: <CalendarCheck className="h-6 w-6" />,
      Star: <Star className="h-6 w-6" />,
      Compass: <Compass className="h-6 w-6" />,
      Globe: <Globe className="h-6 w-6" />,
    };

    return iconName && iconMap[iconName] ? (
      iconMap[iconName]
    ) : (
      <Award className="h-6 w-6" />
    );
  };

  return (
    <Card
      className={`border ${isEarned ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200" : "bg-gray-50 border-gray-200 opacity-75"} transition-all`}
    >
      <CardHeader className="pb-2 text-center">
        <div
          className={`mx-auto rounded-full p-3 ${isEarned ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-500"}`}
        >
          {getIcon(achievement.icon)}
        </div>
        <CardTitle
          className={`text-base font-medium mt-2 ${isEarned ? "text-amber-900" : "text-gray-700"}`}
        >
          {achievement.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <CardDescription
          className={`text-xs ${isEarned ? "text-amber-700" : "text-gray-500"}`}
        >
          {achievement.description}
        </CardDescription>
        {isEarned ? (
          <div className="mt-2 text-xs font-medium text-amber-700">
            Earned {new Date(userAchievement.earned_at).toLocaleDateString()}
          </div>
        ) : (
          <div className="mt-2 text-xs font-medium text-gray-500">
            {achievement.requirement_type === "exercises_completed" &&
              `Complete ${achievement.requirement_value} exercises`}
            {achievement.requirement_type === "streak_days" &&
              `Maintain a ${achievement.requirement_value}-day streak`}
            {achievement.requirement_type === "perfect_score" &&
              "Get a perfect score"}
            {achievement.requirement_type === "categories_explored" &&
              `Explore ${achievement.requirement_value} categories`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
