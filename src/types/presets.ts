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
}

export interface PresetStore {
  presets: WorkoutPreset[];
  selectedPresetId: string | null;
}
