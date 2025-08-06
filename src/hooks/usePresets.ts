import { useState, useEffect } from 'react';
import { WorkoutPreset, PresetStore } from '@/types/presets';

const PRESETS_STORAGE_KEY = 'hiit-timer-presets';

const defaultPresets: WorkoutPreset[] = [];

export const usePresets = () => {
  const [presetStore, setPresetStore] = useState<PresetStore>({
    presets: defaultPresets,
    selectedPresetId: null,
  });

  // Load presets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (stored) {
      try {
        const parsedStore = JSON.parse(stored);
        setPresetStore({
          presets: [...defaultPresets, ...parsedStore.presets],
          selectedPresetId: parsedStore.selectedPresetId,
        });
      } catch (error) {
        console.error('Failed to parse stored presets:', error);
      }
    }
  }, []);

  // Save to localStorage whenever presets change
  const saveToStorage = (newStore: PresetStore) => {
    const storeToSave = {
      presets: newStore.presets.filter(p => !defaultPresets.find(dp => dp.id === p.id)),
      selectedPresetId: newStore.selectedPresetId,
    };
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(storeToSave));
  };

  const addPreset = (preset: WorkoutPreset) => {
    const newStore = {
      ...presetStore,
      presets: [...presetStore.presets, preset],
    };
    setPresetStore(newStore);
    saveToStorage(newStore);
  };

  const updatePreset = (id: string, updatedPreset: WorkoutPreset) => {
    const newStore = {
      ...presetStore,
      presets: presetStore.presets.map(p => p.id === id ? updatedPreset : p),
    };
    setPresetStore(newStore);
    saveToStorage(newStore);
  };

  const deletePreset = (id: string) => {
    const newStore = {
      ...presetStore,
      presets: presetStore.presets.filter(p => p.id !== id),
      selectedPresetId: presetStore.selectedPresetId === id ? null : presetStore.selectedPresetId,
    };
    setPresetStore(newStore);
    saveToStorage(newStore);
  };

  const selectPreset = (id: string | null) => {
    const newStore = {
      ...presetStore,
      selectedPresetId: id,
    };
    setPresetStore(newStore);
    saveToStorage(newStore);
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
  };
};
