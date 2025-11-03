-- ============================================
-- LIFEFLOW DATABASE SCHEMA
-- Initial Migration - Version 001
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: habits
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  target_days INTEGER DEFAULT 7,
  color VARCHAR(7) DEFAULT '#14b8a6',
  icon VARCHAR(50) DEFAULT '⭐',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_habit UNIQUE(user_id, name),
  CONSTRAINT check_category CHECK (category IN ('fitness', 'learning', 'health', 'productivity', 'mindfulness', 'social', 'other')),
  CONSTRAINT check_frequency CHECK (frequency IN ('daily', 'weekly', 'custom'))
);

-- ============================================
-- TABLE: habit_logs
-- ============================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  intensity INTEGER DEFAULT 3 CHECK (intensity BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_habit_date UNIQUE(habit_id, logged_date)
);

-- ============================================
-- TABLE: goals
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  goal_type VARCHAR(50) NOT NULL,
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  frequency VARCHAR(20) DEFAULT 'weekly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_goal_status CHECK (status IN ('active', 'completed', 'paused', 'failed')),
  CONSTRAINT check_goal_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  CONSTRAINT check_target_date CHECK (target_date >= start_date)
);

-- ============================================
-- TABLE: goal_progress
-- ============================================
CREATE TABLE IF NOT EXISTS goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL,
  progress_value DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  milestone_achieved VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_goal_progress_date UNIQUE(goal_id, progress_date)
);

-- ============================================
-- TABLE: time_blocks
-- ============================================
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  block_type VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50),
  is_completed BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_block_type CHECK (block_type IN ('work', 'break', 'habit', 'goal', 'meeting', 'personal', 'focus')),
  CONSTRAINT check_recurrence CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly') OR recurrence_pattern IS NULL),
  CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- ============================================
-- TABLE: activities
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_block_id UUID REFERENCES time_blocks(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL,
  app_name VARCHAR(100),
  website_url VARCHAR(255),
  duration_minutes INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_activity_type CHECK (activity_type IN ('productive', 'neutral', 'distraction')),
  CONSTRAINT check_duration CHECK (duration_minutes > 0)
);

-- ============================================
-- TABLE: reminders
-- ============================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  time_block_id UUID REFERENCES time_blocks(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL,
  scheduled_time TIME NOT NULL,
  days_of_week VARCHAR(50),
  is_enabled BOOLEAN DEFAULT true,
  notification_method VARCHAR(20) DEFAULT 'push',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_notification_method CHECK (notification_method IN ('push', 'email', 'in_app'))
);

-- ============================================
-- TABLE: analytics_snapshots
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  habits_completed INTEGER DEFAULT 0,
  total_habits INTEGER DEFAULT 0,
  goals_on_track INTEGER DEFAULT 0,
  productive_hours DECIMAL(5, 2) DEFAULT 0,
  total_time_tracked DECIMAL(5, 2) DEFAULT 0,
  mood_score INTEGER CHECK (mood_score IS NULL OR mood_score BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level IS NULL OR energy_level BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3, 1) CHECK (sleep_hours IS NULL OR sleep_hours >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_snapshot_date UNIQUE(user_id, snapshot_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Habits indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);

-- Habit logs indexes
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_logged_date ON habit_logs(logged_date);

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

-- Goal progress indexes
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_date ON goal_progress(goal_id, progress_date);
CREATE INDEX IF NOT EXISTS idx_goal_progress_user_id ON goal_progress(user_id);

-- Time blocks indexes
CREATE INDEX IF NOT EXISTS idx_time_blocks_user_date ON time_blocks(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_time_blocks_start_time ON time_blocks(start_time);
CREATE INDEX IF NOT EXISTS idx_time_blocks_type ON time_blocks(block_type);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_time_block ON activities(time_block_id);

-- Reminders indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_enabled ON reminders(is_enabled);

-- Analytics snapshots indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_date ON analytics_snapshots(snapshot_date);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_blocks_updated_at BEFORE UPDATE ON time_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (OPTIONAL)
-- ============================================

-- Puedes añadir datos de ejemplo aquí si lo necesitas

-- ============================================
-- END OF MIGRATION
-- ============================================
