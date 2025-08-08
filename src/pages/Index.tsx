import React from 'react';
import IntervalTimer from '../components/IntervalTimer';
import InstallPrompt from '../components/InstallPrompt';
import AuthModal from '../components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, isLoading } = useAuth();
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in, show app
  if (user) {
    return (
      <>
        {/* Main app */}
  <IntervalTimer />
        <InstallPrompt />
      </>
    );
  }

  // Otherwise show login
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthModal onClose={() => {}} />
    </div>
  );
};

export default Index;
