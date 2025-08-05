import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, X } from 'lucide-react';

interface TimerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  totalMinutes: number;
  workSeconds: number;
  restSeconds: number;
  onTotalMinutesChange: (value: number) => void;
  onWorkSecondsChange: (value: number) => void;
  onRestSecondsChange: (value: number) => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({
  isOpen,
  onClose,
  totalMinutes,
  workSeconds,
  restSeconds,
  onTotalMinutesChange,
  onWorkSecondsChange,
  onRestSecondsChange,
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
              <Input
                id="total-time"
                type="number"
                min="1"
                max="60"
                value={totalMinutes}
                onChange={(e) => onTotalMinutesChange(parseInt(e.target.value) || 1)}
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="work-time" className="text-sm font-medium text-foreground">
                Work Interval (seconds)
              </Label>
              <Input
                id="work-time"
                type="number"
                min="5"
                max="300"
                value={workSeconds}
                onChange={(e) => onWorkSecondsChange(parseInt(e.target.value) || 5)}
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rest-time" className="text-sm font-medium text-foreground">
                Rest Interval (seconds)
              </Label>
              <Input
                id="rest-time"
                type="number"
                min="5"
                max="300"
                value={restSeconds}
                onChange={(e) => onRestSecondsChange(parseInt(e.target.value) || 5)}
                className="bg-input border-border text-foreground"
              />
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