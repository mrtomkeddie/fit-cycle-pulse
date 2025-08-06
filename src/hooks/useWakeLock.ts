import { useEffect, useRef } from 'react';

export const useWakeLock = (isActive: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isActive) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Screen wake lock activated');
        }
      } catch (err) {
        console.log('Wake lock request failed:', err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen wake lock released');
      }
    };

    if (isActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isActive]);

  return wakeLockRef.current;
};