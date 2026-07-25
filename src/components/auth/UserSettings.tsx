import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useSwapIntents';
import { Loader2, Save, User, Bell, Shield, X } from 'lucide-react';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimeSlot = 'morning' | 'day' | 'evening' | 'any';

const timeSlotOptions: { value: TimeSlot; label: string }[] = [
  { value: 'morning', label: 'Morning (6AM - 12PM)' },
  { value: 'day', label: 'Day (12PM - 6PM)' },
  { value: 'evening', label: 'Evening (6PM - 12AM)' },
  { value: 'any', label: 'Any Time' },
];

const marketplaceOptions = [
  { value: 'AE', label: 'AE (United Arab Emirates)' },
  { value: 'SA', label: 'SA (Saudi Arabia)' },
  { value: 'UK', label: 'UK (United Kingdom)' },
  { value: 'EG', label: 'EG (Egypt)' },
];

const skillOptions = [
  { value: 'PhoneMU', label: 'Phone MU' },
  { value: 'phoneOnly', label: 'Phone Only' },
  { value: 'MuOnly', label: 'MU Only' },
  { value: 'Email', label: 'Email Support' },
  { value: 'General', label: 'General Support' },
  { value: 'Specialty', label: 'Specialty Support' },
];

export const UserSettings: React.FC<UserSettingsProps> = ({ isOpen, onClose }) => {
  const { user, userProfile } = useAuth();
  const { preferences, updatePreferences, isUpdating } = useUserPreferences();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    autoMatchEnabled: true,
    preferredTimeSlots: [] as TimeSlot[],
    preferredMarketplaces: [] as string[],
    skillFlexibility: false,
    maxSwapsPerWeek: 3,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  // Initialize form data when user or preferences change
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
      }));
    }

    if (preferences) {
      setFormData(prev => ({
        ...prev,
        autoMatchEnabled: preferences.autoMatchEnabled,
        preferredTimeSlots: preferences.preferredTimeSlots as TimeSlot[],
        preferredMarketplaces: preferences.preferredMarketplaces,
        skillFlexibility: preferences.skillFlexibility,
        maxSwapsPerWeek: preferences.maxSwapsPerWeek,
        emailNotifications: preferences.notificationSettings.email,
        pushNotifications: preferences.notificationSettings.push,
        smsNotifications: preferences.notificationSettings.sms,
      }));
    }
  }, [userProfile, preferences]);

  const handleTimeSlotToggle = (timeSlot: TimeSlot) => {
    setFormData(prev => ({
      ...prev,
      preferredTimeSlots: prev.preferredTimeSlots.includes(timeSlot)
        ? prev.preferredTimeSlots.filter(slot => slot !== timeSlot)
        : [...prev.preferredTimeSlots, timeSlot]
    }));
  };

  const handleMarketplaceToggle = (marketplace: string) => {
    setFormData(prev => ({
      ...prev,
      preferredMarketplaces: prev.preferredMarketplaces.includes(marketplace)
        ? prev.preferredMarketplaces.filter(m => m !== marketplace)
        : [...prev.preferredMarketplaces, marketplace]
    }));
  };

  const handleSave = async () => {
    try {
      const preferencesUpdate = {
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
      };

      updatePreferences(preferencesUpdate);
      
      // Close modal after successful update
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (!user || !userProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your profile and preferences for SmartSwap
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Your basic profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Role: {userProfile.role}</Badge>
                <Badge variant="outline">Marketplace: {userProfile.marketplace}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Matching Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Matching Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure how SmartSwap finds matches for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Match Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-matching</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically search for matches when you create swap intents
                  </p>
                </div>
                <Switch
                  checked={formData.autoMatchEnabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, autoMatchEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Preferred Time Slots */}
              <div className="space-y-3">
                <Label>Preferred Time Slots</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {timeSlotOptions.map((timeSlot) => (
                    <div key={timeSlot.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`timeSlot-${timeSlot.value}`}
                        checked={formData.preferredTimeSlots.includes(timeSlot.value)}
                        onCheckedChange={() => handleTimeSlotToggle(timeSlot.value)}
                      />
                      <Label htmlFor={`timeSlot-${timeSlot.value}`} className="text-sm">
                        {timeSlot.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.preferredTimeSlots.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.preferredTimeSlots.map((slot) => (
                      <Badge key={slot} variant="secondary" className="text-xs">
                        {timeSlotOptions.find(t => t.value === slot)?.label}
                        <button
                          type="button"
                          onClick={() => handleTimeSlotToggle(slot)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Preferred Marketplaces */}
              <div className="space-y-3">
                <Label>Preferred Marketplaces</Label>
                <div className="grid grid-cols-2 gap-2">
                  {marketplaceOptions.map((marketplace) => (
                    <div key={marketplace.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`marketplace-${marketplace.value}`}
                        checked={formData.preferredMarketplaces.includes(marketplace.value)}
                        onCheckedChange={() => handleMarketplaceToggle(marketplace.value)}
                      />
                      <Label htmlFor={`marketplace-${marketplace.value}`} className="text-sm">
                        {marketplace.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.preferredMarketplaces.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.preferredMarketplaces.map((marketplace) => (
                      <Badge key={marketplace} variant="secondary" className="text-xs">
                        {marketplaceOptions.find(m => m.value === marketplace)?.label}
                        <button
                          type="button"
                          onClick={() => handleMarketplaceToggle(marketplace)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Skill Flexibility */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Skill Flexibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow matches with different skill requirements
                  </p>
                </div>
                <Switch
                  checked={formData.skillFlexibility}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, skillFlexibility: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Max Swaps Per Week */}
              <div className="space-y-2">
                <Label htmlFor="maxSwaps">Maximum Swaps Per Week</Label>
                <Select
                  value={formData.maxSwapsPerWeek.toString()}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, maxSwapsPerWeek: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} swap{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={formData.pushNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS (if phone number provided)
                  </p>
                </div>
                <Switch
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
