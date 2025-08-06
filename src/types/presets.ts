export interface Exercise {
  name: string;
  duration?: number; // Optional override for specific exercises
}

export interface WorkoutPreset {
  id: string;
  name: string;
  exercises: Exercise[];
  workSeconds: number;
  restSeconds: number;
  totalMinutes: number;
  warmUpDuration?: number; // Optional warm-up in seconds
  warmUpExercises?: Exercise[]; // Optional warm-up exercises
}

export interface PresetStore {
  presets: WorkoutPreset[];
  selectedPresetId: string | null;
}
