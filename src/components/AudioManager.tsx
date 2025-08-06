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

  // Handle countdown beeps
  useEffect(() => {
    if (!isRunning || isWorkoutComplete) return;

    const shouldBeep = () => {
      if (isWorkPhase && timeLeft <= 5 && timeLeft > 0) return true;
      if (!isWorkPhase && !isLastRest && timeLeft <= 5 && timeLeft > 0) return true;
      if (!isWorkPhase && isLastRest && timeLeft <= 10 && timeLeft > 0) return true;
      return false;
    };

    if (shouldBeep() && timeLeft !== lastBeepTimeRef.current) {
      playBeep(600, 150);
      lastBeepTimeRef.current = timeLeft;
    }
  }, [isRunning, timeLeft, isWorkPhase, isLastRest, isWorkoutComplete]);

  return null;
};

export default AudioManager;