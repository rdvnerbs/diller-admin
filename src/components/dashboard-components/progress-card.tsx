import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy } from "lucide-react";

interface ProgressCardProps {
  streak: number;
  longestStreak: number;
  completedExercises: number;
  totalExercises: number;
  totalPoints: number;
}

export default function ProgressCard({
  streak = 0,
  longestStreak = 0,
  completedExercises = 0,
  totalExercises = 100,
  totalPoints = 0,
}: ProgressCardProps) {
  const progressPercentage =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedExercises} completed</span>
              <span>{totalExercises} total</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {/* Streak */}
            <div className="flex flex-col items-center justify-center rounded-md bg-blue-50 p-3">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-blue-500" />
                <span className="text-xl font-bold text-blue-700">
                  {streak}
                </span>
              </div>
              <span className="text-xs text-blue-700">Day Streak</span>
            </div>

            {/* Longest streak */}
            <div className="flex flex-col items-center justify-center rounded-md bg-purple-50 p-3">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-purple-500" />
                <span className="text-xl font-bold text-purple-700">
                  {longestStreak}
                </span>
              </div>
              <span className="text-xs text-purple-700">Best Streak</span>
            </div>

            {/* Points */}
            <div className="flex flex-col items-center justify-center rounded-md bg-amber-50 p-3">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xl font-bold text-amber-700">
                  {totalPoints}
                </span>
              </div>
              <span className="text-xs text-amber-700">Total Points</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
