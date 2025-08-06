import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Timer, Zap, Dumbbell, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkoutPreset } from '@/types/presets';
import NumberInput from './NumberInput';

type WizardStep = 'basic' | 'timing' | 'warmup' | 'exercises' | 'review';

interface PresetWizardProps {
  onClose: () => void;
  onSave: (preset: WorkoutPreset) => void;
  editingPreset?: WorkoutPreset | null;
}

const PresetWizard: React.FC<PresetWizardProps> = ({ onClose, onSave, editingPreset }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [presetData, setPresetData] = useState<Partial<WorkoutPreset>>({
    name: editingPreset?.name || '',
    workSeconds: editingPreset?.workSeconds || 20,
    restSeconds: editingPreset?.restSeconds || 40,
    totalMinutes: editingPreset?.totalMinutes || 20,
    exercises: editingPreset?.exercises || [],
    warmUpDuration: editingPreset?.warmUpDuration || 0,
    warmUpExercises: editingPreset?.warmUpExercises || [],
  });

  const [includeWarmUp, setIncludeWarmUp] = useState(!!editingPreset?.warmUpDuration);
  const [exerciseInput, setExerciseInput] = useState('');
  const [warmUpInput, setWarmUpInput] = useState('');

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${seconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const steps: { id: WizardStep; title: string; icon: React.ReactNode }[] = [
    { id: 'basic', title: 'Basic Info', icon: <Timer className="h-4 w-4" /> },
    { id: 'timing', title: 'Timing', icon: <Timer className="h-4 w-4" /> },
    { id: 'warmup', title: 'Warm-up', icon: <Zap className="h-4 w-4" /> },
    { id: 'exercises', title: 'Exercises', icon: <Dumbbell className="h-4 w-4" /> },
    { id: 'review', title: 'Review', icon: <Check className="h-4 w-4" /> },
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

  const handleSave = () => {
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

    onSave(preset);
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
          <div className="space-y-4 p-3">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Set your timing</h3>
              <p className="text-sm text-muted-foreground">Configure work, rest, and total workout duration</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="work-seconds">Work (seconds)</Label>
                <NumberInput
                  id="work-seconds"
                  min={10}
                  max={120}
                  value={presetData.workSeconds || 20}
                  onChange={value => setPresetData(prev => ({ ...prev, workSeconds: value }))}
                />
              </div>
              <div>
                <Label htmlFor="rest-seconds">Rest (seconds)</Label>
                <NumberInput
                  id="rest-seconds"
                  min={5}
                  max={180}
                  value={presetData.restSeconds || 40}
                  onChange={value => setPresetData(prev => ({ ...prev, restSeconds: value }))}
                />
              </div>
              <div>
                <Label htmlFor="total-minutes">Total (minutes)</Label>
                <NumberInput
                  id="total-minutes"
                  min={1}
                  max={60}
                  value={presetData.totalMinutes || 20}
                  onChange={value => setPresetData(prev => ({ ...prev, totalMinutes: value }))}
                />
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
                <div>
                  <Label>Warm-up Duration</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <Label htmlFor="warmup-minutes" className="text-xs">Minutes</Label>
                      <NumberInput
                        id="warmup-minutes"
                        min={0}
                        max={10}
                        value={Math.floor((presetData.warmUpDuration || 300) / 60)}
                        onChange={value => setPresetData(prev => ({ 
                          ...prev, 
                          warmUpDuration: value * 60 + ((prev.warmUpDuration || 300) % 60)
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="warmup-seconds" className="text-xs">Seconds</Label>
                      <NumberInput
                        id="warmup-seconds"
                        min={0}
                        max={59}
                        value={(presetData.warmUpDuration || 300) % 60}
                        onChange={value => setPresetData(prev => ({ 
                          ...prev, 
                          warmUpDuration: Math.floor((prev.warmUpDuration || 300) / 60) * 60 + value
                        }))}
                      />
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

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-card border-border shadow-timer max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {editingPreset ? 'Edit Workout' : 'Create Workout'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
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
                onClick={handleSave}
                disabled={!canProceed()}
                className="bg-primary hover:bg-primary/90"
              >
                <Check className="h-4 w-4 mr-1" />
                {editingPreset ? 'Update Preset' : 'Create Preset'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
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
};

export default PresetWizard;
