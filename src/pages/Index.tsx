import React, { useState } from 'react';
import IntervalTimer from '../components/IntervalTimer';
import InstallPrompt from '../components/InstallPrompt';
import AuthModal from '../components/AuthModal';
import MobileMenu from '../components/MobileMenu';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  console.log('📄 Index component rendering...');
  
  const { user, isLoading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  console.log('👤 User state:', { user: user?.email, isLoading });

  if (isLoading) {
    console.log('⏳ Showing loading spinner...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 No user, showing auth modal...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AuthModal onClose={() => {}} />
      </div>
    );
  }

  console.log('✅ User logged in, showing main app...');
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
