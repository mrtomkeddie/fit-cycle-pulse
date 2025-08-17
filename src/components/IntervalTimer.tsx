import { Settings } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import CircularProgress from './CircularProgress';
import TimerSettings from './TimerSettings';
import AudioManager from './AudioManager';
import { useWakeLock } from '@/hooks/useWakeLock';



const IntervalTimer: React.FC = () => {
  // Timer settings
  const [totalMinutes, setTotalMinutes] = useState(20);
  const [workSeconds, setWorkSeconds] = useState(20);
  const [restSeconds, setRestSeconds] = useState(40);
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workSeconds);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = totalMinutes; // One round per minute
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  // No exercises
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);

  // No logout
  
  // Wake lock to keep screen active during workout
  useWakeLock(isRunning);

  // No preset update

  // No exercises

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
  }, [workSeconds, restSeconds, totalMinutes, resetTimer]);

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Settings button */}
        <div className="flex justify-end mb-2">
          <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => setShowSettings(true)}>
            <Settings className="h-6 w-6" />
          </Button>
        </div>
        {/* Main timer display */}
        <Card className="p-8 bg-card border-border shadow-timer">
          <div className="flex flex-col items-center space-y-8">
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
            <div className="flex gap-6">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                disabled={isWorkoutComplete}
                className={`h-32 w-32 text-xl font-semibold flex flex-col items-center justify-center gap-2 ${
                  isWorkPhase 
                    ? 'bg-work hover:bg-work/90 text-white' 
                    : 'bg-rest hover:bg-rest/90 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-12 w-12" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-12 w-12" />
                    <span>{isWorkoutComplete ? 'Restart' : 'Start'}</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                className="h-32 w-32 text-xl border-border text-foreground hover:bg-secondary flex flex-col items-center justify-center gap-2"
              >
                <RotateCcw className="h-12 w-12" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Timer summary */}
        <Card className="p-4 bg-card border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Time</div>
              <div className="font-semibold text-foreground">{totalMinutes}m</div>
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

export default IntervalTimer;