import { useState, useEffect } from 'react';
import { WorkoutPreset, PresetStore } from '@/types/presets';
import { supabase } from '@/lib/supabase';

export const usePresetsSupabase = () => {
  const [presetStore, setPresetStore] = useState<PresetStore>({
    presets: [],
    selectedPresetId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  // Check if Supabase is available
  useEffect(() => {
    const checkSupabase = () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const available = !!(url && key);
      setIsSupabaseAvailable(available);
      
      if (!available) {
        console.warn('⚠️ Supabase not configured - falling back to local storage');
        // Load from localStorage as fallback
        loadFromLocalStorage();
      }
    };
    
    checkSupabase();
  }, []);

  // Load presets from Supabase on mount
  useEffect(() => {
    if (isSupabaseAvailable) {
      loadPresets();
    }
  }, [isSupabaseAvailable]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('workoutimer-presets');
      const selectedId = localStorage.getItem('workoutimer-selected-preset');
      
      if (stored) {
        const presets = JSON.parse(stored);
        setPresetStore({
          presets,
          selectedPresetId: selectedId,
        });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLocalStorage = (presets: WorkoutPreset[], selectedId: string | null) => {
    try {
      localStorage.setItem('workoutimer-presets', JSON.stringify(presets));
      if (selectedId) {
        localStorage.setItem('workoutimer-selected-preset', selectedId);
      } else {
        localStorage.removeItem('workoutimer-selected-preset');
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadPresets = async () => {
    if (!isSupabaseAvailable) {
      loadFromLocalStorage();
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('workout_presets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching presets:', fetchError);
        setError('Failed to load presets');
        // Fallback to localStorage
        loadFromLocalStorage();
        return;
      }

      const presets = data?.map(preset => ({
        id: preset.id,
        name: preset.name,
        workSeconds: preset.work_seconds,
        restSeconds: preset.rest_seconds,
        totalMinutes: preset.total_minutes,
        exercises: preset.exercises || [],
        warmUpDuration: preset.warm_up_duration,
        warmUpExercises: preset.warm_up_exercises || [],
      })) || [];

      // Load selected preset ID
      const { data: storeData } = await supabase
        .from('preset_store')
        .select('selected_preset_id')
        .eq('id', 'default')
        .single();

      setPresetStore({
        presets,
        selectedPresetId: storeData?.selected_preset_id || null,
      });
    } catch (err) {
      console.error('Error loading presets:', err);
      setError('Failed to load presets');
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const addPreset = async (preset: WorkoutPreset) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSupabaseAvailable) {
        const { error: insertError } = await supabase
          .from('workout_presets')
          .insert({
            id: preset.id,
            name: preset.name,
            work_seconds: preset.workSeconds,
            rest_seconds: preset.restSeconds,
            total_minutes: preset.totalMinutes,
            exercises: preset.exercises,
            warm_up_duration: preset.warmUpDuration,
            warm_up_exercises: preset.warmUpExercises,
          });

        if (insertError) {
          console.error('Error adding preset:', insertError);
          setError('Failed to save preset');
          return;
        }
      }

      // Always update local state and localStorage
      const newPresets = [...presetStore.presets, preset];
      setPresetStore(prev => ({ ...prev, presets: newPresets }));
      saveToLocalStorage(newPresets, presetStore.selectedPresetId);
      
      if (isSupabaseAvailable) {
        await loadPresets();
      }
    } catch (err) {
      console.error('Error adding preset:', err);
      setError('Failed to save preset');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreset = async (id: string, updatedPreset: WorkoutPreset) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSupabaseAvailable) {
        const { error: updateError } = await supabase
          .from('workout_presets')
          .update({
            name: updatedPreset.name,
            work_seconds: updatedPreset.workSeconds,
            rest_seconds: updatedPreset.restSeconds,
            total_minutes: updatedPreset.totalMinutes,
            exercises: updatedPreset.exercises,
            warm_up_duration: updatedPreset.warmUpDuration,
            warm_up_exercises: updatedPreset.warmUpExercises,
          })
          .eq('id', id);

        if (updateError) {
          console.error('Error updating preset:', updateError);
          setError('Failed to update preset');
          return;
        }
      }

      // Always update local state and localStorage
      const newPresets = presetStore.presets.map(p => 
        p.id === id ? updatedPreset : p
      );
      setPresetStore(prev => ({ ...prev, presets: newPresets }));
      saveToLocalStorage(newPresets, presetStore.selectedPresetId);
      
      if (isSupabaseAvailable) {
        await loadPresets();
      }
    } catch (err) {
      console.error('Error updating preset:', err);
      setError('Failed to update preset');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePreset = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSupabaseAvailable) {
        const { error: deleteError } = await supabase
          .from('workout_presets')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting preset:', deleteError);
          setError('Failed to delete preset');
          return;
        }
      }

      // Always update local state and localStorage
      const newPresets = presetStore.presets.filter(p => p.id !== id);
      const newSelectedId = presetStore.selectedPresetId === id ? null : presetStore.selectedPresetId;
      setPresetStore(prev => ({ 
        ...prev, 
        presets: newPresets,
        selectedPresetId: newSelectedId
      }));
      saveToLocalStorage(newPresets, newSelectedId);
      
      if (isSupabaseAvailable) {
        await loadPresets();
      }
    } catch (err) {
      console.error('Error deleting preset:', err);
      setError('Failed to delete preset');
    } finally {
      setIsLoading(false);
    }
  };

  const selectPreset = async (id: string | null) => {
    try {
      if (isSupabaseAvailable) {
        const { error: updateError } = await supabase
          .from('preset_store')
          .upsert({
            id: 'default',
            selected_preset_id: id,
          });

        if (updateError) {
          console.error('Error selecting preset:', updateError);
          return;
        }
      }

      // Always update local state and localStorage
      setPresetStore(prev => ({
        ...prev,
        selectedPresetId: id,
      }));
      saveToLocalStorage(presetStore.presets, id);
    } catch (err) {
      console.error('Error selecting preset:', err);
    }
  };

  const getSelectedPreset = (): WorkoutPreset | null => {
    if (!presetStore.selectedPresetId) return null;
    return presetStore.presets.find(p => p.id === presetStore.selectedPresetId) || null;
  };

  return {
    presets: presetStore.presets,
    selectedPresetId: presetStore.selectedPresetId,
    selectedPreset: getSelectedPreset(),
    isLoading,
    error,
    addPreset,
    updatePreset,
    deletePreset,
    selectPreset,
    refresh: loadPresets,
    isSupabaseAvailable,
  };
};
