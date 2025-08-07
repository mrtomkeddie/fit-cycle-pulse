import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Settings, 
  Dumbbell, 
  LogOut
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
          size="sm"
          className="fixed top-6 right-4 z-40 pt-safe-top pr-safe-right"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-[300px] sm:w-[400px] pt-safe-top pb-safe-bottom bg-background border-l border-border"
      >
        <div className="pt-16 h-full flex flex-col">
          {/* Header */}
          <div className="px-2 pb-6">
            <h2 className="text-lg font-semibold text-foreground">Menu</h2>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-1 px-2">
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-14 px-4 text-base font-medium hover:bg-accent/50"
              onClick={handleSettings}
            >
              <Settings className="h-5 w-5 mr-4" />
              Timer Settings
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-14 px-4 text-base font-medium hover:bg-accent/50"
              onClick={handlePresets}
            >
              <Dumbbell className="h-5 w-5 mr-4" />
              Workout Presets
            </Button>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto space-y-4 px-2 pb-4">
            {/* Divider */}
            <div className="border-t border-border" />

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-14 px-4 text-base font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-4" />
              Sign Out
            </Button>

            {/* User Info Card */}
            <Card className="p-4 bg-accent/20 border-accent/20">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
