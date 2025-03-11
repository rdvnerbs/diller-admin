import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tables } from "@/types/supabase";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Plane,
  Users,
} from "lucide-react";
import Link from "next/link";

type Category = Tables<"learning_categories">;

interface CategoryCardProps {
  category: Category;
  progress?: number;
}

export default function CategoryCard({
  category,
  progress = 0,
}: CategoryCardProps) {
  // Map category icons based on the icon name stored in the database
  const getIcon = (iconName: string | null) => {
    const iconMap: Record<string, React.ReactNode> = {
      MessageCircle: <MessageCircle className="h-5 w-5" />,
      Briefcase: <Briefcase className="h-5 w-5" />,
      Plane: <Plane className="h-5 w-5" />,
      Users: <Users className="h-5 w-5" />,
      GraduationCap: <GraduationCap className="h-5 w-5" />,
      BookOpen: <BookOpen className="h-5 w-5" />,
    };

    return iconName && iconMap[iconName] ? (
      iconMap[iconName]
    ) : (
      <BookOpen className="h-5 w-5" />
    );
  };

  // Map category colors
  const getColorClasses = (color: string | null) => {
    const colorMap: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      },
      yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      },
      red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      },
    };

    return color && colorMap[color]
      ? colorMap[color]
      : { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  };

  const colors = getColorClasses(category.color);

  return (
    <Card
      className={`border ${colors.border} hover:shadow-md transition-shadow`}
    >
      <CardHeader className={`${colors.bg} rounded-t-lg pb-2 pt-4`}>
        <div className="flex justify-between items-start">
          <div className={`${colors.text} p-2 rounded-full ${colors.bg}`}>
            {getIcon(category.icon)}
          </div>
          <div className="text-xs font-medium bg-white px-2 py-1 rounded-full border">
            {progress}% Complete
          </div>
        </div>
        <CardTitle className="text-lg font-medium mt-2">
          {category.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {category.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Link
          href={`/dashboard/categories/${category.slug}`}
          className={`${colors.text} text-sm font-medium hover:underline flex items-center`}
        >
          Explore lessons
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
