import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import CircularProgress from './CircularProgress';
import TimerSettings from './TimerSettings';
import AudioManager from './AudioManager';
import { useWakeLock } from '@/hooks/useWakeLock';

const IntervalTimer: React.FC = () => {
  // Timer settings
  const [totalMinutes, setTotalMinutes] = useState(20);
  const [workSeconds, setWorkSeconds] = useState(20);
  const [restSeconds, setRestSeconds] = useState(10);
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workSeconds);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  
  // Wake lock to keep screen active during workout
  useWakeLock(isRunning);

  // Calculate total rounds based on settings
  useEffect(() => {
    const totalSeconds = totalMinutes * 60;
    const cycleSeconds = workSeconds + restSeconds;
    const rounds = Math.floor(totalSeconds / cycleSeconds);
    setTotalRounds(Math.max(1, rounds));
  }, [totalMinutes, workSeconds, restSeconds]);

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
        
        {/* Header with settings */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Interval Timer</h1>
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
            <div className="flex gap-4">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                disabled={isWorkoutComplete}
                className={`px-8 py-3 font-semibold ${
                  isWorkPhase 
                    ? 'bg-work hover:bg-work/90 text-white' 
                    : 'bg-rest hover:bg-rest/90 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    {isWorkoutComplete ? 'Restart' : 'Start'}
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                className="px-8 py-3 border-border text-foreground hover:bg-secondary"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Workout summary */}
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
        onRestSecondsChange={setRestSeconds}
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