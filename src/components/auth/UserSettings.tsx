import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useSwapIntents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  User,
  Bell,
  Shield,
  MapPin,
  Briefcase,
  Save,
  X
} from 'lucide-react';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { preferences, updatePreferences, isLoading, isUpdating } = useUserPreferences();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications'>('profile');
  const [formData, setFormData] = useState({
    // Profile data
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',

    // Preferences data
    autoMatchEnabled: preferences?.autoMatchEnabled ?? true,
    preferredTimeSlots: preferences?.preferredTimeSlots || ['any'],
    preferredMarketplaces: preferences?.preferredMarketplaces || [],
    skillFlexibility: preferences?.skillFlexibility ?? false,
    maxSwapsPerWeek: preferences?.maxSwapsPerWeek ?? 2,

    // Notification settings
    emailNotifications: preferences?.notificationSettings?.email ?? true,
    pushNotifications: preferences?.notificationSettings?.push ?? true,
    smsNotifications: preferences?.notificationSettings?.sms ?? false,
  });

  React.useEffect(() => {
    if (user && preferences) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        autoMatchEnabled: preferences.autoMatchEnabled ?? true,
        preferredTimeSlots: preferences.preferredTimeSlots || ['any'],
        preferredMarketplaces: preferences.preferredMarketplaces || [],
        skillFlexibility: preferences.skillFlexibility ?? false,
        maxSwapsPerWeek: preferences.maxSwapsPerWeek ?? 2,
        emailNotifications: preferences.notificationSettings?.email ?? true,
        pushNotifications: preferences.notificationSettings?.push ?? true,
        smsNotifications: preferences.notificationSettings?.sms ?? false,
      });
    }
  }, [user, preferences]);

  const handleSavePreferences = () => {
    updatePreferences({
      autoMatchEnabled: formData.autoMatchEnabled,
      preferredTimeSlots: formData.preferredTimeSlots,
      preferredMarketplaces: formData.preferredMarketplaces,
      skillFlexibility: formData.skillFlexibility,
      maxSwapsPerWeek: formData.maxSwapsPerWeek,
      notificationSettings: {
        email: formData.emailNotifications,
        push: formData.pushNotifications,
        sms: formData.smsNotifications,
      },
    });
  };

  const timeSlotOptions = [
    { value: 'morning', label: 'Morning (6AM - 12PM)' },
    { value: 'day', label: 'Day (12PM - 6PM)' },
    { value: 'evening', label: 'Evening (6PM - 12AM)' },
    { value: 'night', label: 'Night (12AM - 6AM)' },
    { value: 'any', label: 'Any Time' },
  ];

  const marketplaceOptions = [
    { value: 'AE', label: 'UAE' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'EG', label: 'Egypt' },
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Swap Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            disabled // Profile editing would require additional backend endpoints
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            disabled // Profile editing would require additional backend endpoints
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          disabled // Profile editing would require additional backend endpoints
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-purple-100 text-purple-800">
          <Shield className="h-3 w-3 mr-1" />
          {user?.role}
        </Badge>
        <Badge variant="outline">
          <MapPin className="h-3 w-3 mr-1" />
          {user?.marketplace}
        </Badge>
        {user?.skills?.map((skill, index) => (
          <Badge key={index} variant="secondary">
            <Briefcase className="h-2 w-2 mr-1" />
            {skill}
          </Badge>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Profile information editing is currently read-only.
          Contact your administrator to update your profile details.
        </p>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="autoMatch">Auto-matching</Label>
          <p className="text-sm text-gray-500">Automatically find swap matches for you</p>
        </div>
        <Switch
          id="autoMatch"
          checked={formData.autoMatchEnabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoMatchEnabled: checked }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Preferred Time Slots</Label>
        <div className="grid grid-cols-2 gap-2">
          {timeSlotOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`time-${option.value}`}
                checked={formData.preferredTimeSlots.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      preferredTimeSlots: [...prev.preferredTimeSlots, option.value]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      preferredTimeSlots: prev.preferredTimeSlots.filter(slot => slot !== option.value)
                    }));
                  }
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor={`time-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferred Marketplaces</Label>
        <div className="grid grid-cols-2 gap-2">
          {marketplaceOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`marketplace-${option.value}`}
                checked={formData.preferredMarketplaces.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      preferredMarketplaces: [...prev.preferredMarketplaces, option.value]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      preferredMarketplaces: prev.preferredMarketplaces.filter(mp => mp !== option.value)
                    }));
                  }
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor={`marketplace-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="skillFlexibility">Skill Flexibility</Label>
          <p className="text-sm text-gray-500">Allow swaps with different skill requirements</p>
        </div>
        <Switch
          id="skillFlexibility"
          checked={formData.skillFlexibility}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, skillFlexibility: checked }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxSwaps">Maximum Swaps Per Week</Label>
        <Select
          value={formData.maxSwapsPerWeek.toString()}
          onValueChange={(value) => setFormData(prev => ({ ...prev, maxSwapsPerWeek: parseInt(value) }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num === 0 ? 'No limit' : `${num} swap${num > 1 ? 's' : ''}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="emailNotif">Email Notifications</Label>
          <p className="text-sm text-gray-500">Receive notifications via email</p>
        </div>
        <Switch
          id="emailNotif"
          checked={formData.emailNotifications}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="pushNotif">Push Notifications</Label>
          <p className="text-sm text-gray-500">Receive browser push notifications</p>
        </div>
        <Switch
          id="pushNotif"
          checked={formData.pushNotifications}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pushNotifications: checked }))}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="smsNotif">SMS Notifications</Label>
          <p className="text-sm text-gray-500">Receive notifications via SMS</p>
        </div>
        <Switch
          id="smsNotif"
          checked={formData.smsNotifications}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotifications: checked }))}
        />
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> SMS notifications may incur charges based on your mobile plan.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>User Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your profile, preferences, and notification settings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-6">
          {/* Sidebar */}
          <div className="w-48 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'preferences' && renderPreferencesTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          {(activeTab === 'preferences' || activeTab === 'notifications') && (
            <Button
              onClick={handleSavePreferences}
              disabled={isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
