import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  isRunning: boolean;
  timeLeft: number;
  isWorkPhase: boolean;
  isLastRest: boolean;
  isWorkoutComplete: boolean;
}

const AudioManager: React.FC<AudioManagerProps> = ({
  isRunning,
  timeLeft,
  isWorkPhase,
  isLastRest,
  isWorkoutComplete
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastBeepTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);
  const scheduledBeepsRef = useRef<Set<number>>(new Set());
  const checkTimerRef = useRef<number | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play beep sound
  const playBeep = (frequency = 800, duration = 200) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  // Handle workout complete beeps
  useEffect(() => {
    if (isWorkoutComplete) {
      // Play three quick beeps
      setTimeout(() => playBeep(1000, 150), 0);
      setTimeout(() => playBeep(1000, 150), 200);
      setTimeout(() => playBeep(1000, 150), 400);
    }
  }, [isWorkoutComplete]);

  // Track phase start time for precise timing
  useEffect(() => {
    if (isRunning && !isWorkoutComplete) {
      phaseStartTimeRef.current = performance.now();
      scheduledBeepsRef.current.clear();
    }
  }, [isRunning, isWorkPhase, isWorkoutComplete]);

  // Precise countdown beeps using high-resolution timing
  useEffect(() => {
    if (!isRunning || isWorkoutComplete) {
      if (checkTimerRef.current) {
        cancelAnimationFrame(checkTimerRef.current);
        checkTimerRef.current = null;
      }
      return;
    }

    const checkPreciseTiming = () => {
      if (!audioContextRef.current || !isRunning || isWorkoutComplete) return;

      const elapsed = (performance.now() - phaseStartTimeRef.current) / 1000;
      const preciseTimeLeft = Math.ceil(timeLeft - elapsed);
      
      // Determine beep threshold based on phase
      const beepThreshold = (!isWorkPhase && isLastRest) ? 10 : 5;
      
      // Check if we should beep for this second
      const shouldBeep = () => {
        if (isWorkPhase && preciseTimeLeft <= 5 && preciseTimeLeft > 0) return true;
        if (!isWorkPhase && !isLastRest && preciseTimeLeft <= 5 && preciseTimeLeft > 0) return true;
        if (!isWorkPhase && isLastRest && preciseTimeLeft <= 10 && preciseTimeLeft > 0) return true;
        return false;
      };

      if (shouldBeep() && !scheduledBeepsRef.current.has(preciseTimeLeft)) {
        // Schedule beep to play exactly at the second boundary
        const timeToNextSecond = 1 - (elapsed % 1);
        const scheduledTime = audioContextRef.current.currentTime + timeToNextSecond;
        
        // Play beep with Web Audio scheduling
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, scheduledTime);
        gainNode.gain.setValueAtTime(0.3, scheduledTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, scheduledTime + 0.15);
        
        oscillator.start(scheduledTime);
        oscillator.stop(scheduledTime + 0.15);
        
        scheduledBeepsRef.current.add(preciseTimeLeft);
      }

      checkTimerRef.current = requestAnimationFrame(checkPreciseTiming);
    };

    checkTimerRef.current = requestAnimationFrame(checkPreciseTiming);

    return () => {
      if (checkTimerRef.current) {
        cancelAnimationFrame(checkTimerRef.current);
        checkTimerRef.current = null;
      }
    };
  }, [isRunning, timeLeft, isWorkPhase, isLastRest, isWorkoutComplete]);

  return null;
};

export default AudioManager;