-- Create workout_presets table
CREATE TABLE workout_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  work_seconds INTEGER NOT NULL,
  rest_seconds INTEGER NOT NULL,
  total_minutes INTEGER NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  warm_up_duration INTEGER,
  warm_up_exercises JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create preset_store table (for storing selected preset and user settings)
CREATE TABLE preset_store (
  id TEXT PRIMARY KEY DEFAULT 'default',
  selected_preset_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_preset_id) REFERENCES workout_presets(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_workout_presets_user_id ON workout_presets(user_id);
CREATE INDEX idx_workout_presets_created_at ON workout_presets(created_at);
CREATE INDEX idx_preset_store_user_id ON preset_store(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE workout_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_store ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_presets
CREATE POLICY "Users can view their own presets" ON workout_presets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presets" ON workout_presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presets" ON workout_presets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets" ON workout_presets
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for preset_store
CREATE POLICY "Users can view their own preset store" ON preset_store
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preset store" ON preset_store
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preset store" ON preset_store
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preset store" ON preset_store
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_presets_updated_at 
  BEFORE UPDATE ON workout_presets 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preset_store_updated_at 
  BEFORE UPDATE ON preset_store 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
