import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, X, Clock, ListChecks } from 'lucide-react';
import NumberInput from './NumberInput';
import PresetManager from './PresetManager';

interface TimerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  totalMinutes: number;
  workSeconds: number;
  restSeconds: number;
  onTotalMinutesChange: (value: number) => void;
  onWorkSecondsChange: (value: number) => void;
  initialTab?: 'timer' | 'presets';
}

const TimerSettings: React.FC<TimerSettingsProps> = ({
  isOpen,
  onClose,
  totalMinutes,
  workSeconds,
  restSeconds,
  onTotalMinutesChange,
  onWorkSecondsChange,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'presets'>(initialTab ?? 'timer');

  // When the settings modal is opened, ensure the requested tab is shown
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-timer max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Settings</h2>
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
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab((v as 'timer' | 'presets'))} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timer" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timer
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Presets
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 overflow-y-auto max-h-[60vh]">
              <TabsContent value="timer" className="space-y-6 mt-0">
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
                
                <Button
                  onClick={onClose}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Done
                </Button>
              </TabsContent>
              
              <TabsContent value="presets" className="mt-0">
                <PresetManager onClose={onClose} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default TimerSettings;