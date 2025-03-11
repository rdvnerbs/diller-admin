-- Seed learning_categories
INSERT INTO learning_categories (name, description, slug, icon, color)
VALUES
  ('Greetings & Basics', 'Master essential everyday conversations', 'greetings-basics', 'MessageCircle', 'blue'),
  ('Business English', 'Professional vocabulary and communication', 'business-english', 'Briefcase', 'green'),
  ('Travel English', 'Navigate any situation while traveling', 'travel-english', 'Plane', 'yellow'),
  ('Social English', 'Make friends and engage in casual talk', 'social-english', 'Users', 'purple'),
  ('Academic English', 'Excel in educational environments', 'academic-english', 'GraduationCap', 'red'),
  ('Specialized Vocabulary', 'Industry-specific terminology', 'specialized-vocabulary', 'BookOpen', 'indigo')
ON CONFLICT (slug) DO NOTHING;

-- Seed achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, points)
VALUES
  ('First Steps', 'Complete your first exercise', 'Award', 'exercises_completed', 1, 10),
  ('Quick Learner', 'Complete 10 exercises', 'Zap', 'exercises_completed', 10, 25),
  ('Dedicated Student', 'Complete 50 exercises', 'BookOpen', 'exercises_completed', 50, 50),
  ('English Master', 'Complete 100 exercises', 'GraduationCap', 'exercises_completed', 100, 100),
  ('Perfect Score', 'Get 100% on an exercise', 'CheckCircle', 'perfect_score', 1, 20),
  ('Streak Starter', 'Maintain a 3-day streak', 'Flame', 'streak_days', 3, 15),
  ('Consistent Learner', 'Maintain a 7-day streak', 'CalendarCheck', 'streak_days', 7, 30),
  ('Language Enthusiast', 'Maintain a 30-day streak', 'Star', 'streak_days', 30, 100),
  ('Category Explorer', 'Study in 3 different categories', 'Compass', 'categories_explored', 3, 25),
  ('Well-Rounded', 'Study in all categories', 'Globe', 'categories_explored', 6, 75)
ON CONFLICT DO NOTHING;
