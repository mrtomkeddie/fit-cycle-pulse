import React, { useState } from 'react';
import IntervalTimer from '../components/IntervalTimer';
import InstallPrompt from '../components/InstallPrompt';
import AuthModal from '../components/AuthModal';
import MobileMenu from '../components/MobileMenu';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
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
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">WorkoutTimer</h1>
            <p className="text-muted-foreground">Your personal interval timer for effective workouts</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              <User className="h-4 w-4 mr-2" />
              Get Started
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {import.meta.env.VITE_SUPABASE_URL 
                ? '🔐 Real authentication with Supabase' 
                : '⚠️ Demo mode: Configure Supabase for real authentication'
              }
            </div>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
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
