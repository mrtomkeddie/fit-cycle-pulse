import { useState, useEffect, useCallback } from 'react';
import { WorkoutPreset, PresetStore } from '@/types/presets';
import { SupabasePresetService } from '@/lib/supabase';

const PRESETS_STORAGE_KEY = 'hiit-timer-presets';
const SYNC_STATUS_KEY = 'hiit-timer-sync-status';

interface SyncStatus {
  lastSyncTime: number;
  pendingChanges: string[]; // Array of preset IDs that need syncing
}

const defaultPresets: WorkoutPreset[] = [];

export const usePresets = () => {
  const [presetStore, setPresetStore] = useState<PresetStore>({
    presets: defaultPresets,
    selectedPresetId: null,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: 0,
    pendingChanges: []
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncWithSupabase(); // Auto-sync when coming back online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load from localStorage and sync with Supabase on mount
  useEffect(() => {
    loadFromLocalStorage();
    loadSyncStatus();
    
    // Try to sync on mount if online
    if (navigator.onLine) {
      syncWithSupabase();
    }
  }, []);

  const loadFromLocalStorage = () => {
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
  };

  const loadSyncStatus = () => {
    const stored = localStorage.getItem(SYNC_STATUS_KEY);
    if (stored) {
      try {
        setSyncStatus(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse sync status:', error);
      }
    }
  };

  const saveToLocalStorage = (newStore: PresetStore) => {
    const storeToSave = {
      presets: newStore.presets.filter(p => !defaultPresets.find(dp => dp.id === p.id)),
      selectedPresetId: newStore.selectedPresetId,
    };
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(storeToSave));
  };

  const saveSyncStatus = (newStatus: SyncStatus) => {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(newStatus));
    setSyncStatus(newStatus);
  };

  const markForSync = (presetId: string) => {
    const newStatus = {
      ...syncStatus,
      pendingChanges: [...new Set([...syncStatus.pendingChanges, presetId])]
    };
    saveSyncStatus(newStatus);
  };

  const removeFromSync = (presetId: string) => {
    const newStatus = {
      ...syncStatus,
      pendingChanges: syncStatus.pendingChanges.filter(id => id !== presetId)
    };
    saveSyncStatus(newStatus);
  };

  const syncWithSupabase = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // Check if Supabase is actually reachable
      const supabaseOnline = await SupabasePresetService.isOnline();
      if (!supabaseOnline) {
        console.log('Supabase is not reachable, skipping sync');
        return;
      }

      // 1. Fetch latest from Supabase
      const remotePresets = await SupabasePresetService.getPresets();
      const remoteSelectedId = await SupabasePresetService.getSelectedPresetId();

      // 2. Merge with local data (prioritize local changes for pending items)
      const localPresets = presetStore.presets.filter(p => !defaultPresets.find(dp => dp.id === p.id));
      const mergedPresets = [...defaultPresets];

      // Add remote presets that aren't pending local changes
      remotePresets.forEach(remotePreset => {
        if (!syncStatus.pendingChanges.includes(remotePreset.id)) {
          const localIndex = localPresets.findIndex(p => p.id === remotePreset.id);
          if (localIndex === -1) {
            // New remote preset
            mergedPresets.push(remotePreset);
          } else {
            // Use remote version if not modified locally
            mergedPresets.push(remotePreset);
          }
        }
      });

      // Add local presets (including pending changes)
      localPresets.forEach(localPreset => {
        const existingIndex = mergedPresets.findIndex(p => p.id === localPreset.id);
        if (existingIndex === -1) {
          // New local preset
          mergedPresets.push(localPreset);
        } else if (syncStatus.pendingChanges.includes(localPreset.id)) {
          // Local changes take priority
          mergedPresets[existingIndex] = localPreset;
        }
      });

      // 3. Push pending changes to Supabase
      for (const presetId of syncStatus.pendingChanges) {
        const preset = mergedPresets.find(p => p.id === presetId);
        if (preset) {
          const success = await SupabasePresetService.savePreset(preset);
          if (success) {
            removeFromSync(presetId);
          }
        } else {
          // Preset was deleted, remove from Supabase
          await SupabasePresetService.deletePreset(presetId);
          removeFromSync(presetId);
        }
      }

      // 4. Sync selected preset
      let selectedId = presetStore.selectedPresetId;
      if (remoteSelectedId && !syncStatus.pendingChanges.includes('selectedPreset')) {
        selectedId = remoteSelectedId;
      } else if (presetStore.selectedPresetId !== remoteSelectedId) {
        await SupabasePresetService.saveSelectedPresetId(presetStore.selectedPresetId);
      }

      // 5. Update local state
      const newStore = {
        presets: mergedPresets,
        selectedPresetId: selectedId,
      };
      setPresetStore(newStore);
      saveToLocalStorage(newStore);

      // 6. Update sync timestamp
      saveSyncStatus({
        ...syncStatus,
        lastSyncTime: Date.now(),
        pendingChanges: syncStatus.pendingChanges.filter(id => id !== 'selectedPreset')
      });

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, presetStore, syncStatus]);

  const addPreset = async (preset: WorkoutPreset) => {
    const newStore = {
      ...presetStore,
      presets: [...presetStore.presets, preset],
    };
    setPresetStore(newStore);
    saveToLocalStorage(newStore);
    markForSync(preset.id);

    // Try to sync immediately if online
    if (isOnline) {
      syncWithSupabase();
    }
  };

  const updatePreset = async (id: string, updatedPreset: WorkoutPreset) => {
    const newStore = {
      ...presetStore,
      presets: presetStore.presets.map(p => p.id === id ? updatedPreset : p),
    };
    setPresetStore(newStore);
    saveToLocalStorage(newStore);
    markForSync(id);

    // Try to sync immediately if online
    if (isOnline) {
      syncWithSupabase();
    }
  };

  const deletePreset = async (id: string) => {
    const newStore = {
      ...presetStore,
      presets: presetStore.presets.filter(p => p.id !== id),
      selectedPresetId: presetStore.selectedPresetId === id ? null : presetStore.selectedPresetId,
    };
    setPresetStore(newStore);
    saveToLocalStorage(newStore);
    markForSync(id); // Mark for deletion sync

    // Try to sync immediately if online
    if (isOnline) {
      syncWithSupabase();
    }
  };

  const selectPreset = async (id: string | null) => {
    const newStore = {
      ...presetStore,
      selectedPresetId: id,
    };
    setPresetStore(newStore);
    saveToLocalStorage(newStore);
    markForSync('selectedPreset');

    // Try to sync immediately if online
    if (isOnline) {
      syncWithSupabase();
    }
  };

  const getSelectedPreset = (): WorkoutPreset | null => {
    if (!presetStore.selectedPresetId) return null;
    return presetStore.presets.find(p => p.id === presetStore.selectedPresetId) || null;
  };

  const forcSync = () => {
    if (isOnline) {
      syncWithSupabase();
    }
  };

  return {
    presets: presetStore.presets,
    selectedPresetId: presetStore.selectedPresetId,
    selectedPreset: getSelectedPreset(),
    addPreset,
    updatePreset,
    deletePreset,
    selectPreset,
    // Sync status
    isOnline,
    isSyncing,
    hasPendingChanges: syncStatus.pendingChanges.length > 0,
    lastSyncTime: syncStatus.lastSyncTime,
    forcSync,
  };
};
