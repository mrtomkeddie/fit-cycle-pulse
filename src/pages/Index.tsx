import React, { useState } from 'react';
import IntervalTimer from '../components/IntervalTimer';
import InstallPrompt from '../components/InstallPrompt';
import AuthModal from '../components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, isLoading } = useAuth();
  // Preview toggle to skip login (local-only helper)
  const [previewMode, setPreviewMode] = useState(false);

  // Show loading only when not in preview
  if (isLoading && !previewMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If preview mode is enabled or the user is logged in, show app
  if (previewMode || user) {
    return (
      <>
        {/* Main app */}
  <IntervalTimer />
        <InstallPrompt />
      </>
    );
  }

  // Otherwise show login with a small preview bypass (dev convenience)
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <AuthModal onClose={() => {}} />

      <div className="mt-6 p-4 bg-muted rounded-lg max-w-md w-full">
        <p className="text-sm text-muted-foreground mb-2 text-center">For preview purposes:</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          type="button"
          onClick={() => setPreviewMode(true)}
        >
          Preview App (Skip Login)
        </Button>
      </div>
    </div>
  );
};

export default Index;
