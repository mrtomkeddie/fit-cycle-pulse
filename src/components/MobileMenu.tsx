import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Settings, 
  Dumbbell, 
  LogOut,
  User,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
  onOpenSettings: () => void;
  onOpenPresets: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onOpenSettings, onOpenPresets }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleSettings = () => {
    onOpenSettings();
    setIsOpen(false);
  };

  const handlePresets = () => {
    onOpenPresets();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-6 z-40 pt-safe-top pr-safe-right hover:bg-accent/50 transition-colors w-10 h-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-[320px] sm:w-[380px] pt-safe-top pb-safe-bottom bg-background/95 backdrop-blur-sm border-l border-border/50 [&>button]:hidden"
      >
        <div className="h-full flex flex-col">
          {/* Custom Close Button */}
          <div className="flex justify-end pt-4 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 p-0 hover:bg-accent/50 transition-colors rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="pt-4 pb-6 px-4">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 space-y-2">
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-12 px-4 text-base font-medium hover:bg-accent/50 transition-all duration-200 rounded-xl"
              onClick={handleSettings}
            >
              <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
              Timer Settings
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-12 px-4 text-base font-medium hover:bg-accent/50 transition-all duration-200 rounded-xl"
              onClick={handlePresets}
            >
              <Dumbbell className="h-5 w-5 mr-3 text-muted-foreground" />
              Workout Presets
            </Button>
          </div>

          {/* Bottom Section */}
          <div className="px-4 pb-6">
            {/* Divider */}
            <div className="border-t border-border/50 my-4" />

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-12 px-4 text-base font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
