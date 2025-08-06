import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import CircularProgress from './CircularProgress';
import TimerSettings from './TimerSettings';
import AudioManager from './AudioManager';

const HIITTimer: React.FC = () => {
  // Timer settings
  const [totalMinutes, setTotalMinutes] = useState(20); // Total workout time in minutes
  const [workSeconds, setWorkSeconds] = useState(20); // Work duration in seconds
  const restSeconds = 60 - workSeconds; // Rest duration automatically calculated
  const totalRounds = totalMinutes; // One round per minute
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workSeconds);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);

  // No need to calculate total rounds - it's fixed

  // Reset timer to initial state
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(workSeconds);
    setIsWorkPhase(true);
    setCurrentRound(1);
    setIsWorkoutComplete(false);
  }, [workSeconds]);

  // Timer tick logic
  useEffect(() => {
    if (!isRunning || isWorkoutComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Phase transition logic
          if (isWorkPhase) {
            // Switching from work to rest
            setIsWorkPhase(false);
            return restSeconds;
          } else {
            // Switching from rest to work or ending workout
            if (currentRound >= totalRounds) {
              // Workout complete
              setIsWorkoutComplete(true);
              setIsRunning(false);
              return 0;
            } else {
              // Next round
              setCurrentRound(r => r + 1);
              setIsWorkPhase(true);
              return workSeconds;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isWorkPhase, currentRound, totalRounds, workSeconds, restSeconds, isWorkoutComplete]);

  // Reset when settings change
  useEffect(() => {
    resetTimer();
  }, [workSeconds, restSeconds, resetTimer]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const totalTime = isWorkPhase ? workSeconds : restSeconds;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Check if this is the last rest period
  const isLastRest = !isWorkPhase && currentRound === totalRounds;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start">
      {/* Safe area spacer for mobile */}
      <div className="w-full h-[env(safe-area-inset-top)] bg-background" />
      
      <div className="w-full max-w-md space-y-6 p-4">
        {/* Header with settings */}
        <div className="flex items-center justify-between mt-4">
          <img 
            src="/fit-cycle-pulse/icons/logo.png" 
            alt="Interval Timer" 
            className="h-8 w-auto" 
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Main timer display */}
        <Card className="p-6 bg-card border-border shadow-timer relative">
          <div className="flex flex-col items-center space-y-6">
            
            {/* Circular progress timer */}
            <CircularProgress
              percentage={getProgressPercentage()}
              size={280}
              strokeWidth={8}
              isWorkPhase={isWorkPhase}
            >
              <div className="text-center">
                <div className="text-5xl font-mono font-bold text-foreground mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className={`text-lg font-semibold ${
                  isWorkPhase ? 'text-work' : 'text-rest'
                }`}>
                  {isWorkoutComplete ? 'Complete!' : isWorkPhase ? 'WORK' : 'REST'}
                </div>
              </div>
            </CircularProgress>

            {/* Round counter */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Round</div>
              <div className="text-2xl font-bold text-foreground">
                {currentRound} / {totalRounds}
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                disabled={isWorkoutComplete}
                className={`h-16 w-32 text-lg font-semibold ${
                  isWorkPhase 
                    ? 'bg-work hover:bg-work/90 text-white' 
                    : 'bg-rest hover:bg-rest/90 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-6 w-6 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6 mr-2" />
                    {isWorkoutComplete ? 'Restart' : 'Start'}
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                className="h-16 w-32 text-lg border-border text-foreground hover:bg-secondary"
              >
                <RotateCcw className="h-6 w-6 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Workout summary */}
        <Card className="p-4 bg-card border-border shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Rounds</div>
              <div className="font-semibold text-foreground">{totalRounds}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Work</div>
              <div className="font-semibold text-work">{workSeconds}s</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Rest</div>
              <div className="font-semibold text-rest">{restSeconds}s</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings modal */}
      <TimerSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        totalMinutes={totalMinutes}
        workSeconds={workSeconds}
        restSeconds={restSeconds}
        onTotalMinutesChange={setTotalMinutes}
        onWorkSecondsChange={setWorkSeconds}
      />

      {/* Audio manager */}
      <AudioManager
        isRunning={isRunning}
        timeLeft={timeLeft}
        isWorkPhase={isWorkPhase}
        isLastRest={isLastRest}
        isWorkoutComplete={isWorkoutComplete}
      />
    </div>
  );
};

export default HIITTimer;