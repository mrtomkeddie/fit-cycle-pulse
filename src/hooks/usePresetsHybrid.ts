import { useState, useEffect } from 'react';
import { WorkoutPreset, PresetStore } from '@/types/presets';
import { SupabasePresetService } from '@/lib/supabase';

const defaultPresets: WorkoutPreset[] = [];

export const usePresets = () => {
  const [presetStore, setPresetStore] = useState<PresetStore>({
    presets: defaultPresets,
    selectedPresetId: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load presets from Supabase on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    console.log('🔄 loadPresets called');
    setIsLoading(true);
    try {
      console.log('🔄 Calling SupabasePresetService.getPresets...');
      const presets = await SupabasePresetService.getPresets();
      console.log('🔄 Got presets from Supabase:', presets);
      
      console.log('🔄 Calling SupabasePresetService.getSelectedPresetId...');
      const selectedId = await SupabasePresetService.getSelectedPresetId();
      console.log('🔄 Got selected ID from Supabase:', selectedId);
      
      const newStore = {
        presets: [...defaultPresets, ...presets],
        selectedPresetId: selectedId,
      };
      
      console.log('🔄 Setting new store:', newStore);
      setPresetStore(newStore);
    } catch (error) {
      console.error('❌ Failed to load presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPreset = async (preset: WorkoutPreset) => {
    console.log('🔄 addPreset called with:', preset);
    console.log('🔄 Current presets before add:', presetStore.presets);
    
    setIsLoading(true);
    
    try {
      console.log('🔄 Calling SupabasePresetService.savePreset...');
      const success = await SupabasePresetService.savePreset(preset);
      console.log('🔄 SupabasePresetService.savePreset result:', success);
      
      if (success) {
        console.log('🔄 Preset saved successfully! Reloading presets...');
        // Reload all presets to get the latest data
        await loadPresets();
        console.log('🔄 Presets reloaded. Current presets:', presetStore.presets);
      } else {
        console.error('❌ Failed to save preset - savePreset returned false');
      }
    } catch (error) {
      console.error('❌ Error saving preset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreset = async (id: string, updatedPreset: WorkoutPreset) => {
    setIsLoading(true);
    try {
      const success = await SupabasePresetService.savePreset(updatedPreset);
      if (success) {
        await loadPresets();
      }
    } catch (error) {
      console.error('Error updating preset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePreset = async (id: string) => {
    setIsLoading(true);
    try {
      const success = await SupabasePresetService.deletePreset(id);
      if (success) {
        await loadPresets();
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPreset = async (id: string | null) => {
    setIsLoading(true);
    try {
      const success = await SupabasePresetService.saveSelectedPresetId(id);
      if (success) {
        setPresetStore(prev => ({
          ...prev,
          selectedPresetId: id,
        }));
      }
    } catch (error) {
      console.error('Error selecting preset:', error);
    } finally {
      setIsLoading(false);
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
    addPreset,
    updatePreset,
    deletePreset,
    selectPreset,
    isLoading,
    reload: loadPresets,
  };
};
