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
          className="fixed top-12 right-4 z-40 pt-safe-top pr-safe-right"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-safe-top pb-safe-bottom">
        <div className="pt-12 h-full flex flex-col">
          {/* Menu Items */}
          <div className="flex-1 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSettings}
            >
              <Settings className="h-4 w-4 mr-3" />
              Timer Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handlePresets}
            >
              <Dumbbell className="h-4 w-4 mr-3" />
              Workout Presets
            </Button>

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Logout */}
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>

          {/* User Info at Bottom */}
          <Card className="p-4 mt-4 mb-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Welcome, {user?.name}!
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
