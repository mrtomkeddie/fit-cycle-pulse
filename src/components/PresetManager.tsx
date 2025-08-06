import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Check, X, Edit } from 'lucide-react';
import { usePresets } from '@/hooks/usePresets';
import { WorkoutPreset, Exercise } from '@/types/presets';
import NumberInput from './NumberInput';

interface PresetManagerProps {
  onClose: () => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ onClose }) => {
  const { presets, selectedPresetId, selectPreset, addPreset, updatePreset, deletePreset } = usePresets();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [newPreset, setNewPreset] = useState<Partial<WorkoutPreset>>({
    name: '',
    workSeconds: 20,
    restSeconds: 40,
    totalMinutes: 20,
    exercises: [],
  });
  const [exerciseInput, setExerciseInput] = useState('');

  const handleCreatePreset = () => {
    if (!newPreset.name || !newPreset.exercises || newPreset.exercises.length === 0) {
      alert('Please provide a name and at least one exercise');
      return;
    }

    if (editingPresetId) {
      // Update existing preset
      const preset: WorkoutPreset = {
        id: editingPresetId,
        name: newPreset.name,
        workSeconds: newPreset.workSeconds || 20,
        restSeconds: newPreset.restSeconds || 40,
        totalMinutes: newPreset.totalMinutes || 20,
        exercises: newPreset.exercises,
      };
      updatePreset(editingPresetId, preset);
      setEditingPresetId(null);
    } else {
      // Create new preset
      const preset: WorkoutPreset = {
        id: `preset-${Date.now()}`,
        name: newPreset.name,
        workSeconds: newPreset.workSeconds || 20,
        restSeconds: newPreset.restSeconds || 40,
        totalMinutes: newPreset.totalMinutes || 20,
        exercises: newPreset.exercises,
      };
      addPreset(preset);
    }

    setShowCreateForm(false);
    resetForm();
  };

  const resetForm = () => {
    setNewPreset({
      name: '',
      workSeconds: 20,
      restSeconds: 40,
      totalMinutes: 20,
      exercises: [],
    });
    setExerciseInput('');
    setEditingPresetId(null);
  };

  const startEditing = (preset: WorkoutPreset) => {
    setNewPreset({
      name: preset.name,
      workSeconds: preset.workSeconds,
      restSeconds: preset.restSeconds,
      totalMinutes: preset.totalMinutes,
      exercises: [...preset.exercises],
    });
    setEditingPresetId(preset.id);
    setShowCreateForm(true);
  };

  const cancelEditing = () => {
    setShowCreateForm(false);
    resetForm();
  };

  const addExercise = () => {
    if (!exerciseInput.trim()) return;
    
    const exercises = exerciseInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(name => ({ name }));

    setNewPreset(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), ...exercises],
    }));
    setExerciseInput('');
  };

  const removeExercise = (index: number) => {
    setNewPreset(prev => ({
      ...prev,
      exercises: prev.exercises?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Workout Presets</h3>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateForm(!showCreateForm);
          }}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Preset
        </Button>
      </div>

      {/* Current presets */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">Select Preset:</div>
        <div className="grid gap-2">
          <Button
            variant={selectedPresetId === null ? "default" : "outline"}
            onClick={() => selectPreset(null)}
            className="justify-start"
          >
            Manual Mode (No Preset)
          </Button>
          {presets.map(preset => (
            <div key={preset.id} className="flex gap-2">
              <Button
                variant={selectedPresetId === preset.id ? "default" : "outline"}
                onClick={() => selectPreset(preset.id)}
                className="flex-1 justify-start"
              >
                {preset.name} ({preset.exercises.length} exercises)
              </Button>
              {!preset.id.startsWith('default-') && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(preset)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete "${preset.name}" preset?`)) {
                        deletePreset(preset.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create new preset form */}
      {showCreateForm && (
        <Card className="p-4 border-border">
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">
                {editingPresetId ? 'Edit Preset' : 'Create New Preset'}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>            <div className="space-y-3">
              <div>
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={newPreset.name || ''}
                  onChange={e => setNewPreset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Custom Workout"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="preset-work">Work (s)</Label>
                  <NumberInput
                    id="preset-work"
                    min={10}
                    max={60}
                    value={newPreset.workSeconds || 20}
                    onChange={value => setNewPreset(prev => ({ ...prev, workSeconds: value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="preset-rest">Rest (s)</Label>
                  <NumberInput
                    id="preset-rest"
                    min={10}
                    max={120}
                    value={newPreset.restSeconds || 40}
                    onChange={value => setNewPreset(prev => ({ ...prev, restSeconds: value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="preset-total">Total (min)</Label>
                  <NumberInput
                    id="preset-total"
                    min={1}
                    max={60}
                    value={newPreset.totalMinutes || 20}
                    onChange={value => setNewPreset(prev => ({ ...prev, totalMinutes: value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exercises">Exercises (one per line)</Label>
                <Textarea
                  id="exercises"
                  value={exerciseInput}
                  onChange={e => setExerciseInput(e.target.value)}
                  placeholder="Push-ups&#10;Squats&#10;Jumping Jacks&#10;Burpees"
                  rows={4}
                />
                <Button
                  onClick={addExercise}
                  size="sm"
                  className="mt-2"
                  disabled={!exerciseInput.trim()}
                >
                  Add Exercises
                </Button>
              </div>

              {newPreset.exercises && newPreset.exercises.length > 0 && (
                <div>
                  <Label>Current Exercises ({newPreset.exercises.length}):</Label>
                  <div className="mt-1 space-y-1">
                    {newPreset.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{exercise.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(index)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePreset}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!newPreset.name || !newPreset.exercises || newPreset.exercises.length === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {editingPresetId ? 'Update Preset' : 'Create Preset'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </div>
  );
};

export default PresetManager;
