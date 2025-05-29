import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSwapIntents } from '@/hooks/useSwapIntents';
import { useRealSchedule } from '@/hooks/useRealSchedule';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { realScheduleApi } from '@/services/api';
import { SwapIntent } from '@/types/api';
import { X } from 'lucide-react';

interface CreateSwapIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedShiftId?: string;
}

const timeSlotOptions = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
  { value: 'day', label: 'Day (12 PM - 6 PM)' },
  { value: 'evening', label: 'Evening (6 PM - 12 AM)' },
  { value: 'any', label: 'Any Time' },
];

const marketplaceOptions = [
  { value: 'AE', label: 'AE (United Arab Emirates)' },
  { value: 'SA', label: 'SA (Saudi Arabia)' },
  { value: 'UK', label: 'UK (United Kingdom)' },
  { value: 'EG', label: 'EG (Egypt)' },
];

export const CreateSwapIntentModal: React.FC<CreateSwapIntentModalProps> = ({
  isOpen,
  onClose,
  preselectedShiftId,
}) => {
  const { user } = useAuth();
  const { createSwapIntent, isCreating } = useSwapIntents();

  // Get user's actual shifts (auto-generated from real schedule)
  const { data: userShifts, isLoading: isLoadingShifts } = useQuery({
    queryKey: ['my-shifts'],
    queryFn: async () => {
      const response = await realScheduleApi.getMyShifts();
      return response.data;
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    originalShiftId: preselectedShiftId || '',
    preferredTimeSlots: ['any'] as string[],
    preferredMarketplaces: [] as string[],
    skillFlexibility: false,
    maxDaysOut: 14,
    priority: 3,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.originalShiftId) {
      return;
    }

    createSwapIntent(formData as Partial<SwapIntent>, {
      onSuccess: () => {
        onClose();
        setFormData({
          originalShiftId: '',
          preferredTimeSlots: ['any'],
          preferredMarketplaces: [],
          skillFlexibility: false,
          maxDaysOut: 14,
          priority: 3,
          notes: '',
        });
      },
    });
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    setFormData(prev => {
      const newTimeSlots = prev.preferredTimeSlots.includes(timeSlot)
        ? prev.preferredTimeSlots.filter(slot => slot !== timeSlot)
        : [...prev.preferredTimeSlots.filter(slot => slot !== 'any'), timeSlot];

      // If no specific time slots selected, default to 'any'
      return {
        ...prev,
        preferredTimeSlots: newTimeSlots.length === 0 ? ['any'] : newTimeSlots,
      };
    });
  };

  const handleMarketplaceToggle = (marketplace: string) => {
    setFormData(prev => ({
      ...prev,
      preferredMarketplaces: prev.preferredMarketplaces.includes(marketplace)
        ? prev.preferredMarketplaces.filter(mp => mp !== marketplace)
        : [...prev.preferredMarketplaces, marketplace],
    }));
  };

  // Use actual shifts from the database
  const shifts = userShifts || [];
  const selectedShift = shifts?.find(shift => shift._id === formData.originalShiftId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Swap Intent</DialogTitle>
          <DialogDescription>
            Set up your preferences for smart matching to find the perfect swap partner.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shift Selection */}
          <div className="space-y-2">
            <Label htmlFor="originalShiftId">Select Shift to Swap</Label>
            <Select
              value={formData.originalShiftId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, originalShiftId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a shift..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingShifts ? (
                  <SelectItem value="" disabled>Loading your shifts...</SelectItem>
                ) : shifts?.length === 0 ? (
                  <SelectItem value="" disabled>No shifts available</SelectItem>
                ) : (
                  shifts?.map((shift) => (
                    <SelectItem key={shift._id} value={shift._id}>
                      {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - {shift.startTime} to {shift.endTime}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedShift && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Selected:</strong> {new Date(selectedShift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} from {selectedShift.startTime} to {selectedShift.endTime}
                </p>
                <p className="text-sm text-blue-700">
                  Marketplace: {selectedShift.marketplace} | Skills: {selectedShift.skills.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Preferred Time Slots */}
          <div className="space-y-3">
            <Label>Preferred Time Slots</Label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlotOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`time-${option.value}`}
                    checked={formData.preferredTimeSlots.includes(option.value)}
                    onCheckedChange={() => handleTimeSlotToggle(option.value)}
                  />
                  <Label htmlFor={`time-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.preferredTimeSlots.map((slot) => (
                <Badge key={slot} variant="secondary" className="text-xs">
                  {timeSlotOptions.find(opt => opt.value === slot)?.label}
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
          </div>

          {/* Preferred Marketplaces */}
          <div className="space-y-3">
            <Label>Preferred Marketplaces (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {marketplaceOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`marketplace-${option.value}`}
                    checked={formData.preferredMarketplaces.includes(option.value)}
                    onCheckedChange={() => handleMarketplaceToggle(option.value)}
                  />
                  <Label htmlFor={`marketplace-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {formData.preferredMarketplaces.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.preferredMarketplaces.map((marketplace) => (
                  <Badge key={marketplace} variant="secondary" className="text-xs">
                    {marketplaceOptions.find(opt => opt.value === marketplace)?.label}
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

          {/* Skill Flexibility */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="skillFlexibility"
              checked={formData.skillFlexibility}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, skillFlexibility: checked as boolean }))
              }
            />
            <Label htmlFor="skillFlexibility">
              Open to cross-training opportunities
            </Label>
          </div>

          {/* Max Days Out */}
          <div className="space-y-2">
            <Label htmlFor="maxDaysOut">Maximum days in advance</Label>
            <Input
              id="maxDaysOut"
              type="number"
              min="1"
              max="30"
              value={formData.maxDaysOut}
              onChange={(e) => setFormData(prev => ({ ...prev, maxDaysOut: parseInt(e.target.value) }))}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Low</SelectItem>
                <SelectItem value="2">2 - Below Normal</SelectItem>
                <SelectItem value="3">3 - Normal</SelectItem>
                <SelectItem value="4">4 - High</SelectItem>
                <SelectItem value="5">5 - Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about your swap preferences..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.notes.length}/500 characters</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.originalShiftId || isCreating || isLoadingShifts}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? 'Creating...' : 'Create Intent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
