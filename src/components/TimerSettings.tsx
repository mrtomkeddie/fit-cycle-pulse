import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, X } from 'lucide-react';
import NumberInput from './NumberInput';

interface TimerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  totalMinutes: number;
  workSeconds: number;
  restSeconds: number;
  onTotalMinutesChange: (value: number) => void;
  onWorkSecondsChange: (value: number) => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({
  isOpen,
  onClose,
  totalMinutes,
  workSeconds,
  restSeconds,
  onTotalMinutesChange,
  onWorkSecondsChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-timer">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Timer Settings</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="total-time" className="text-sm font-medium text-foreground">
                Total Workout Time (minutes)
              </Label>
              <NumberInput
                id="total-time"
                min={1}
                max={60}
                value={totalMinutes}
                onChange={onTotalMinutesChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="work-time" className="text-sm font-medium text-foreground">
                Work Time Per Round (seconds)
              </Label>
              <NumberInput
                id="work-time"
                min={10}
                max={50}
                value={workSeconds}
                onChange={onWorkSecondsChange}
              />
              <div className="text-sm text-muted-foreground">
                Rest time: {restSeconds} seconds
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              Done
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimerSettings;