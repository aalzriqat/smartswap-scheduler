
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Shield, MapPin, Briefcase } from 'lucide-react';
import { UserSettings } from './UserSettings';

export const UserProfile: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!user || !userProfile) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'WorkFlowManagement':
        return 'bg-purple-100 text-purple-800';
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Developer':
        return 'bg-green-100 text-green-800';
      case 'Employee':
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'WorkFlowManagement':
        return 'Workflow Management';
      default:
        return role;
    }
  };

  return (
    <React.Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials(userProfile.first_name, userProfile.last_name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {getInitials(userProfile.first_name, userProfile.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">
                    {userProfile.first_name} {userProfile.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {userProfile.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={getRoleColor(userProfile.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleDisplayName(userProfile.role)}
                </Badge>
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {userProfile.marketplace}
                </Badge>
              </div>

              {userProfile.skills && userProfile.skills.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {userProfile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Briefcase className="h-2 w-2 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => logout()}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </React.Fragment>
  );
};

// Compact version for mobile or smaller spaces
export const UserProfileCompact: React.FC = () => {
  const { user, userProfile, logout } = useAuth();

  if (!user || !userProfile) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-600 text-white text-sm">
          {getInitials(userProfile.first_name, userProfile.last_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {userProfile.first_name} {userProfile.last_name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {userProfile.role} • {userProfile.marketplace}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout()}
        className="text-muted-foreground hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};
