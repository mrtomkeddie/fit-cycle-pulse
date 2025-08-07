import React, { useState } from 'react';
import IntervalTimer from '../components/IntervalTimer';
import InstallPrompt from '../components/InstallPrompt';
import AuthModal from '../components/AuthModal';
import MobileMenu from '../components/MobileMenu';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AuthModal onClose={() => {}} />
      </div>
    );
  }

  return (
    <>
      {/* Hamburger Menu (all devices) */}
      <MobileMenu 
        onOpenSettings={() => setShowSettings(true)}
        onOpenPresets={() => setShowPresets(true)}
      />

      {/* Main app */}
      <IntervalTimer 
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
        showPresets={showPresets}
        onClosePresets={() => setShowPresets(false)}
      />
      <InstallPrompt />
    </>
  );
};

export default Index;
