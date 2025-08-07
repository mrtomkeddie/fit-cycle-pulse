import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Timer, Zap, Dumbbell, Check, X, ChevronLeft, ChevronRight, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { usePresetsSupabase } from '@/hooks/usePresetsSupabase';
import { WorkoutPreset } from '@/types/presets';
import NumberInput from './NumberInput';

interface PresetManagerProps {
  onClose: () => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ onClose }) => {
  const { presets, selectedPresetId, selectPreset, addPreset, updatePreset, deletePreset, isLoading, error } = usePresetsSupabase();
  const [showWizard, setShowWizard] = useState(false);
  const [editingPreset, setEditingPreset] = useState<WorkoutPreset | null>(null);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<'basic' | 'timing' | 'warmup' | 'exercises' | 'review'>('basic');
  const [presetData, setPresetData] = useState<Partial<WorkoutPreset>>({});
  const [includeWarmUp, setIncludeWarmUp] = useState(false);
  const [exerciseInput, setExerciseInput] = useState('');
  const [warmUpInput, setWarmUpInput] = useState('');

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${seconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleSavePreset = (preset: WorkoutPreset) => {
    if (editingPreset) {
      updatePreset(preset.id, preset);
    } else {
      addPreset(preset);
    }
    setShowWizard(false);
    setEditingPreset(null);
    // Reset wizard state
    setCurrentStep('basic');
    setPresetData({});
    setIncludeWarmUp(false);
    setExerciseInput('');
    setWarmUpInput('');
  };

  const startEditing = (preset: WorkoutPreset) => {
    setEditingPreset(preset);
    setPresetData({
      name: preset.name,
      workSeconds: preset.workSeconds,
      restSeconds: preset.restSeconds,
      totalMinutes: preset.totalMinutes,
      exercises: preset.exercises,
      warmUpDuration: preset.warmUpDuration || 0,
      warmUpExercises: preset.warmUpExercises || [],
    });
    setIncludeWarmUp(!!preset.warmUpDuration);
    setCurrentStep('basic');
    setShowWizard(true);
  };

  const startCreating = () => {
    setEditingPreset(null);
    setPresetData({
      name: '',
      workSeconds: 20,
      restSeconds: 40,
      totalMinutes: 20,
      exercises: [],
      warmUpDuration: 0,
      warmUpExercises: [],
    });
    setIncludeWarmUp(false);
    setExerciseInput('');
    setWarmUpInput('');
    setCurrentStep('basic');
    setShowWizard(true);
  };

  const handleDeletePreset = (preset: WorkoutPreset) => {
    if (confirm(`Delete "${preset.name}" preset?`)) {
      deletePreset(preset.id);
    }
  };

  // Wizard functions
  const steps = [
    { id: 'basic' as const, title: 'Basic Info', icon: <Timer className="h-4 w-4" /> },
    { id: 'timing' as const, title: 'Timing', icon: <Timer className="h-4 w-4" /> },
    { id: 'warmup' as const, title: 'Warm-up', icon: <Zap className="h-4 w-4" /> },
    { id: 'exercises' as const, title: 'Exercises', icon: <Dumbbell className="h-4 w-4" /> },
    { id: 'review' as const, title: 'Review', icon: <Check className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basic':
        return !!presetData.name?.trim();
      case 'timing':
        return true;
      case 'warmup':
        return !includeWarmUp || (presetData.warmUpDuration! > 0);
      case 'exercises':
        return presetData.exercises && presetData.exercises.length > 0;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const addExercises = (input: string, isWarmUp = false) => {
    if (!input.trim()) return;
    
    const exercises = input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(name => ({ name }));

    if (isWarmUp) {
      setPresetData(prev => ({
        ...prev,
        warmUpExercises: [...(prev.warmUpExercises || []), ...exercises],
      }));
      setWarmUpInput('');
    } else {
      setPresetData(prev => ({
        ...prev,
        exercises: [...(prev.exercises || []), ...exercises],
      }));
      setExerciseInput('');
    }
  };

  const removeExercise = (index: number, isWarmUp = false) => {
    if (isWarmUp) {
      setPresetData(prev => ({
        ...prev,
        warmUpExercises: prev.warmUpExercises?.filter((_, i) => i !== index) || [],
      }));
    } else {
      setPresetData(prev => ({
        ...prev,
        exercises: prev.exercises?.filter((_, i) => i !== index) || [],
      }));
    }
  };

  const handleWizardSave = () => {
    const preset: WorkoutPreset = {
      id: editingPreset?.id || `preset-${Date.now()}`,
      name: presetData.name!,
      workSeconds: presetData.workSeconds || 20,
      restSeconds: presetData.restSeconds || 40,
      totalMinutes: presetData.totalMinutes || 20,
      exercises: presetData.exercises || [],
      ...(includeWarmUp && {
        warmUpDuration: presetData.warmUpDuration,
        warmUpExercises: presetData.warmUpExercises,
      }),
    };

    handleSavePreset(preset);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-4 p-3">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Let's create your workout preset</h3>
              <p className="text-sm text-muted-foreground">Start by giving your workout a name</p>
            </div>
            <div>
              <Label htmlFor="preset-name">Workout Name</Label>
              <Input
                id="preset-name"
                value={presetData.name || ''}
                onChange={e => setPresetData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Morning HIIT, Core Crusher, Full Body Burn"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'timing':
        return (
          <div className="space-y-3 p-1">
            <div className="text-center mb-3">
              <h3 className="text-base font-semibold text-foreground">Set your timing</h3>
              <p className="text-xs text-muted-foreground">Configure work, rest, and total workout duration</p>
            </div>
            
            {/* Compact vertical layout */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="work-seconds" className="text-xs font-medium flex items-center gap-1">
                  <Timer className="h-3 w-3 text-primary" />
                  Work Duration
                </Label>
                <div className="bg-muted/50 rounded p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPresetData(prev => ({ ...prev, workSeconds: Math.max(10, (prev.workSeconds || 20) - 5) }))}
                      className="h-12 w-12 rounded-full text-lg font-bold"
                      disabled={(presetData.workSeconds || 20) <= 10}
                    >
                      −
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-xl font-bold text-foreground">{presetData.workSeconds || 20}</div>
                      <div className="text-xs text-muted-foreground">seconds</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPresetData(prev => ({ ...prev, workSeconds: Math.min(120, (prev.workSeconds || 20) + 5) }))}
                      className="h-12 w-12 rounded-full text-lg font-bold"
                      disabled={(presetData.workSeconds || 20) >= 120}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="rest-seconds" className="text-xs font-medium flex items-center gap-1">
                  <Timer className="h-3 w-3 text-blue-500" />
                  Rest Duration
                </Label>
                <div className="bg-muted/50 rounded p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPresetData(prev => ({ ...prev, restSeconds: Math.max(5, (prev.restSeconds || 40) - 5) }))}
                      className="h-12 w-12 rounded-full text-lg font-bold"
                      disabled={(presetData.restSeconds || 40) <= 5}
                    >
                      −
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-xl font-bold text-foreground">{presetData.restSeconds || 40}</div>
                      <div className="text-xs text-muted-foreground">seconds</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPresetData(prev => ({ ...prev, restSeconds: Math.min(180, (prev.restSeconds || 40) + 5) }))}
                      className="h-12 w-12 rounded-full text-lg font-bold"
                      disabled={(presetData.restSeconds || 40) >= 180}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="total-minutes" className="text-xs font-medium flex items-center gap-1">
                  <Timer className="h-3 w-3 text-green-500" />
                  Total Workout Duration
                </Label>
                <div className="bg-muted/50 rounded p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPresetData(prev => ({ ...prev, totalMinutes: Math.max(1, (prev.totalMinutes || 20) - 1) }))}
                      className="h-12 w-12 rounded-full text-lg font-bold"
                      disabled={(presetData.totalMinutes || 20) <= 1}
                    >
                      −
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-xl font-bold text-foreground">{presetData.totalMinutes || 20}</div>
                      <div className="text-xs text-muted-foreground">minutes</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPresetData(prev => ({ ...prev, totalMinutes: Math.min(60, (prev.totalMinutes || 20) + 1) }))}
                      className="h-12 w-12 rounded-full text-lg font-bold"
                      disabled={(presetData.totalMinutes || 20) >= 60}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'warmup':
        return (
          <div className="space-y-4 p-3">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Warm-up (Optional)</h3>
              <p className="text-sm text-muted-foreground">Add a warm-up period before your workout</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="include-warmup"
                checked={includeWarmUp}
                onCheckedChange={setIncludeWarmUp}
              />
              <Label htmlFor="include-warmup">Include warm-up</Label>
            </div>

            {includeWarmUp && (
              <div className="space-y-4 mt-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3 text-orange-500" />
                    Warm-up Duration
                  </Label>
                  <div className="bg-muted/50 rounded p-2">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetData(prev => ({ 
                          ...prev, 
                          warmUpDuration: Math.max(0, (prev.warmUpDuration || 300) - 30)
                        }))}
                        className="h-8 w-8 rounded-full text-xs"
                        disabled={(presetData.warmUpDuration || 300) <= 0}
                      >
                        −
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="text-xl font-bold text-foreground">
                          {Math.floor((presetData.warmUpDuration || 300) / 60)}:
                          {String((presetData.warmUpDuration || 300) % 60).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-muted-foreground">min:sec</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetData(prev => ({ 
                          ...prev, 
                          warmUpDuration: Math.min(600, (prev.warmUpDuration || 300) + 30)
                        }))}
                        className="h-8 w-8 rounded-full text-xs"
                        disabled={(presetData.warmUpDuration || 300) >= 600}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="warmup-exercises">Warm-up Exercises (one per line)</Label>
                  <Textarea
                    id="warmup-exercises"
                    value={warmUpInput}
                    onChange={e => setWarmUpInput(e.target.value)}
                    placeholder="Arm circles&#10;Leg swings&#10;Light jogging&#10;Dynamic stretches"
                    rows={4}
                    className="mt-1"
                  />
                  <Button
                    onClick={() => addExercises(warmUpInput, true)}
                    size="sm"
                    className="mt-2"
                    disabled={!warmUpInput.trim()}
                  >
                    Add Warm-up Exercises
                  </Button>
                </div>

                {presetData.warmUpExercises && presetData.warmUpExercises.length > 0 && (
                  <div>
                    <Label>Current Warm-up Exercises ({presetData.warmUpExercises.length}):</Label>
                    <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                      {presetData.warmUpExercises.map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-muted rounded p-2">
                          <span>{exercise.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(index, true)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'exercises':
        return (
          <div className="space-y-4 p-3">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Add your exercises</h3>
              <p className="text-sm text-muted-foreground">List the exercises for your workout</p>
            </div>
            
            <div>
              <Label htmlFor="exercises">Exercises (one per line)</Label>
              <Textarea
                id="exercises"
                value={exerciseInput}
                onChange={e => setExerciseInput(e.target.value)}
                placeholder="Push-ups&#10;Squats&#10;Jumping Jacks&#10;Burpees&#10;Mountain Climbers"
                rows={6}
                className="mt-1"
              />
              <Button
                onClick={() => addExercises(exerciseInput)}
                size="sm"
                className="mt-2"
                disabled={!exerciseInput.trim()}
              >
                Add Exercises
              </Button>
            </div>

            {presetData.exercises && presetData.exercises.length > 0 && (
              <div>
                <Label>Current Exercises ({presetData.exercises.length}):</Label>
                <div className="mt-1 space-y-1 max-h-40 overflow-y-auto">
                  {presetData.exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-muted rounded p-2">
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
          </div>
        );

      case 'review':
        const formatDuration = (seconds: number): string => {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          if (minutes === 0) return `${seconds}s`;
          if (remainingSeconds === 0) return `${minutes}m`;
          return `${minutes}m ${remainingSeconds}s`;
        };

        return (
          <div className="space-y-4 p-3">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Review your workout</h3>
              <p className="text-sm text-muted-foreground">Everything looks good? Let's save it!</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Name:</span>
                  <div className="text-muted-foreground">{presetData.name}</div>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <div className="text-muted-foreground">{presetData.totalMinutes} minutes</div>
                </div>
                <div>
                  <span className="font-medium">Work Time:</span>
                  <div className="text-muted-foreground">{presetData.workSeconds}s</div>
                </div>
                <div>
                  <span className="font-medium">Rest Time:</span>
                  <div className="text-muted-foreground">{presetData.restSeconds}s</div>
                </div>
              </div>
              
              {includeWarmUp && (
                <div>
                  <span className="font-medium">Warm-up:</span>
                  <div className="text-muted-foreground">
                    {formatDuration(presetData.warmUpDuration || 0)} with {presetData.warmUpExercises?.length || 0} exercises
                  </div>
                </div>
              )}
              
              <div>
                <span className="font-medium">Exercises ({presetData.exercises?.length || 0}):</span>
                <div className="text-muted-foreground mt-1 max-h-32 overflow-y-auto">
                  {presetData.exercises?.map((exercise, index) => (
                    <div key={index} className="text-xs">• {exercise.name}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showWizard) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-card border-border shadow-timer max-h-[90vh] overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingPreset ? 'Edit Workout' : 'Create Workout'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowWizard(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index <= currentStepIndex 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted text-muted-foreground'
                  }`}>
                    {index < currentStepIndex ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[300px] overflow-y-auto">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {currentStepIndex === steps.length - 1 ? (
                                  <Button
                    onClick={handleWizardSave}
                    disabled={!canProceed() || isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-1" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    {editingPreset ? 'Update Preset' : 'Create Preset'}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed() || isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Workout Presets</h3>
        <Button
          onClick={startCreating}
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
        <div className="grid gap-2 px-6">
          <Button
            variant={selectedPresetId === null ? "default" : "outline"}
            onClick={() => selectPreset(null)}
            className="justify-start"
          >
            Manual Mode (No Preset)
          </Button>
                     {isLoading && (
             <div className="text-center py-6 text-muted-foreground">
               <Loader2 className="h-6 w-6 animate-spin mb-2" />
               <p className="text-sm">Loading presets...</p>
             </div>
           )}
           {presets.length === 0 && !isLoading && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No workout presets yet.</p>
              <p className="text-xs">Click "New Preset" to create your first workout!</p>
            </div>
          )}
          {presets.map(preset => (
            <div key={preset.id} className="flex gap-2">
              <Button
                variant={selectedPresetId === preset.id ? "default" : "outline"}
                onClick={() => selectPreset(preset.id)}
                className="flex-1 justify-start text-left"
              >
                <div>
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.exercises.length} exercises • {preset.workSeconds}s work • {preset.restSeconds}s rest
                    {preset.warmUpDuration && ` • ${formatDuration(preset.warmUpDuration)} warm-up`}
                  </div>
                </div>
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(preset)}
                  className="text-muted-foreground hover:text-foreground px-2"
                  title="Edit preset"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeletePreset(preset)}
                  className="text-destructive hover:text-destructive px-2"
                  title="Delete preset"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </div>
  );
};

export default PresetManager;
