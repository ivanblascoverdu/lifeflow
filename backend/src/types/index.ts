// ============= USER =============
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  timezone: string;
  notifications_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone?: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  timezone: string;
  notificationsEnabled: boolean;
}

// ============= HABIT =============
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  target_days: number;
  color: string;
  icon: string;
  created_at: Date;
  updated_at: Date;
}

export type HabitCategory = 'fitness' | 'learning' | 'health' | 'productivity' | 'mindfulness' | 'social' | 'other';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface HabitCreateDTO {
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays: number;
  color: string;
  icon: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  logged_date: Date;
  completed: boolean;
  notes?: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  created_at: Date;
}

export interface HabitLogCreateDTO {
  habitId: string;
  loggedDate: string; // ISO date string
  completed: boolean;
  notes?: string;
  intensity?: 1 | 2 | 3 | 4 | 5;
}

export interface HabitWithStats extends Habit {
  current_streak: number;
  best_streak: number;
  completion_rate: number;
  total_completions: number;
}

// ============= GOAL =============
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: GoalStatus;
  start_date: Date;
  target_date: Date;
  frequency: GoalFrequency;
  created_at: Date;
  updated_at: Date;
}

export type GoalStatus = 'active' | 'completed' | 'paused' | 'failed';
export type GoalFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface GoalCreateDTO {
  title: string;
  description?: string;
  goalType: string;
  targetValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  frequency: GoalFrequency;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  user_id: string;
  progress_date: Date;
  progress_value: number;
  notes?: string;
  milestone_achieved?: string;
  created_at: Date;
}

export interface GoalProgressCreateDTO {
  goalId: string;
  progressDate: string;
  progressValue: number;
  notes?: string;
  milestoneAchieved?: string;
}

export interface GoalWithProgress extends Goal {
  progress_percentage: number;
  days_remaining: number;
  on_track: boolean;
}

// ============= TIME TRACKING =============
export interface TimeBlock {
  id: string;
  user_id: string;
  goal_id?: string;
  habit_id?: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  block_type: BlockType;
  color: string;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  is_completed: boolean;
  priority: 1 | 2 | 3 | 4 | 5;
  created_at: Date;
  updated_at: Date;
}

export type BlockType = 'work' | 'break' | 'habit' | 'goal' | 'meeting' | 'personal' | 'focus';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';

export interface TimeBlockCreateDTO {
  title: string;
  description?: string;
  startTime: string; // ISO datetime
  endTime: string;
  blockType: BlockType;
  color: string;
  goalId?: string;
  habitId?: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  priority?: 1 | 2 | 3 | 4 | 5;
}

export interface Activity {
  id: string;
  user_id: string;
  time_block_id?: string;
  activity_type: ActivityType;
  app_name?: string;
  website_url?: string;
  duration_minutes: number;
  category: string;
  start_time: Date;
  end_time: Date;
  created_at: Date;
}

export type ActivityType = 'productive' | 'neutral' | 'distraction';

export interface ActivityCreateDTO {
  timeBlockId?: string;
  activityType: ActivityType;
  appName?: string;
  websiteUrl?: string;
  durationMinutes: number;
  category: string;
  startTime: string;
  endTime: string;
}

// ============= ANALYTICS =============
export interface AnalyticsSnapshot {
  id: string;
  user_id: string;
  snapshot_date: Date;
  habits_completed: number;
  total_habits: number;
  goals_on_track: number;
  productive_hours: number;
  total_time_tracked: number;
  mood_score?: number;
  energy_level?: number;
  sleep_hours?: number;
  created_at: Date;
}

export interface DashboardStats {
  today: {
    habitsCompleted: number;
    totalHabits: number;
    productiveHours: number;
    goalsOnTrack: number;
  };
  week: {
    habitCompletionRate: number;
    totalProductiveHours: number;
    bestStreak: { habitName: string; streak: number };
  };
  month: {
    totalGoalsCompleted: number;
    averageDailyProductivity: number;
  };
}
