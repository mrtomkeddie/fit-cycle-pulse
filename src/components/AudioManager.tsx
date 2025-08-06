import { useEffect, useRef, useState } from 'react';

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
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastBeepTimeRef = useRef<number>(0);

  // Initialize or resume audio context
  const initAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      setAudioEnabled(true);
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  };

  // Initialize audio when timer starts
  useEffect(() => {
    if (isRunning && !audioEnabled) {
      initAudio();
    }
  }, [isRunning, audioEnabled]);

  // Play beep sound
  const playBeep = async (frequency = 800, duration = 200) => {
    try {
      if (!audioContextRef.current || !audioEnabled) return;

      // Create a new audio context if the current one is closed
      if (audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume the audio context if it's suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      const now = audioContextRef.current.currentTime;
      gainNode.gain.setValueAtTime(0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

      oscillator.start(now);
      oscillator.stop(now + duration / 1000);
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  };

  // Handle countdown beeps
  useEffect(() => {
    const playCountdownBeep = async () => {
      if (!audioEnabled || !isRunning || isWorkoutComplete) return;

      const shouldBeep = () => {
        if (isWorkPhase && timeLeft <= 5 && timeLeft > 0) return true;
        if (!isWorkPhase && !isLastRest && timeLeft <= 5 && timeLeft > 0) return true;
        if (!isWorkPhase && isLastRest && timeLeft <= 10 && timeLeft > 0) return true;
        return false;
      };

      if (shouldBeep() && timeLeft !== lastBeepTimeRef.current) {
        await playBeep(600, 150);
        lastBeepTimeRef.current = timeLeft;
      }
    };

    playCountdownBeep();
  }, [isRunning, timeLeft, isWorkPhase, isLastRest, isWorkoutComplete, audioEnabled]);

  // Handle workout complete beeps
  useEffect(() => {
    const playCompleteBeeps = async () => {
      if (!audioEnabled || !isWorkoutComplete) return;
      
      await playBeep(1000, 150);
      await new Promise(resolve => setTimeout(resolve, 200));
      await playBeep(1000, 150);
      await new Promise(resolve => setTimeout(resolve, 200));
      await playBeep(1000, 150);
    };

    if (isWorkoutComplete) {
      playCompleteBeeps();
    }
  }, [isWorkoutComplete, audioEnabled]);

  // Cleanup audio context when component unmounts
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return null;
};

export default AudioManager;