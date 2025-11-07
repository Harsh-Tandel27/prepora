"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { calculateProfileCompletion, mergeProfileWithCompletion, type UserProfile } from "@/lib/utils/profile";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileCompletionFormProps {
  userId: string;
  initialProfile?: Partial<UserProfile>;
  onSave?: (profile: UserProfile) => void;
}

export default function ProfileCompletionForm({ userId, initialProfile, onSave }: ProfileCompletionFormProps) {
  const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const completion = calculateProfileCompletion(profile);

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const mergedProfile = mergeProfileWithCompletion(profile);
      
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profile: mergedProfile
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Profile saved successfully!' });
        if (onSave) {
          onSave(mergedProfile);
        }
        // Refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to save profile' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const educationOptions = [
    'B.E / B-Tech',
    'BSc or MSc',
    'BA/MA',
    'B.com (Bachelor of commerce)',
    'M.E / M-Tech',
    'Masters in data science',
    'MED',
    'B.ed(Teaching)',
    'M.com',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Completion Indicator */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Profile Completion</h3>
          <div className="flex items-center gap-2">
            {completion.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-lg font-bold">{completion.percentage}%</span>
          </div>
        </div>
        
        <Progress value={completion.percentage} className="mb-4" />
        
        {completion.completed ? (
          <p className="text-sm text-green-600 dark:text-green-400">
            ✅ Profile complete! You can now create interviews and receive accurate predictions.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Complete your profile to create interviews and get accurate success predictions.
            </p>
            {completion.missingFields.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Missing: {completion.missingFields.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">
              Age <span className="text-red-500">*</span>
            </Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="100"
              value={profile.age || ''}
              onChange={(e) => updateField('age', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Enter your age"
              required
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">
              Gender <span className="text-red-500">*</span>
            </Label>
            <select
              id="gender"
              value={profile.gender || ''}
              onChange={(e) => updateField('gender', e.target.value as 'Male' | 'Female' | 'Other' | null)}
              className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <Label htmlFor="education">
              Education <span className="text-red-500">*</span>
            </Label>
            <select
              id="education"
              value={profile.education || ''}
              onChange={(e) => updateField('education', e.target.value || null)}
              className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground"
              required
            >
              <option value="">Select education</option>
              {educationOptions.map(edu => (
                <option key={edu} value={edu}>{edu}</option>
              ))}
            </select>
          </div>

          {/* Marital Status */}
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <select
              id="maritalStatus"
              value={profile.maritalStatus || ''}
              onChange={(e) => updateField('maritalStatus', e.target.value as 'Married' | 'Unmarried' | null || null)}
              className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground"
            >
              <option value="">Select status</option>
              <option value="Married">Married</option>
              <option value="Unmarried">Unmarried</option>
            </select>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Professional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currently Employed */}
          <div className="space-y-2">
            <Label htmlFor="currentlyEmployed">
              Currently Employed <span className="text-red-500">*</span>
            </Label>
            <select
              id="currentlyEmployed"
              value={profile.currentlyEmployed === null ? '' : profile.currentlyEmployed ? 'true' : 'false'}
              onChange={(e) => updateField('currentlyEmployed', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
              className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground"
              required
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Experience in Months */}
          <div className="space-y-2">
            <Label htmlFor="experienceMonths">
              Experience (months) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="experienceMonths"
              type="number"
              min="0"
              value={profile.experienceMonths || ''}
              onChange={(e) => updateField('experienceMonths', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 24"
              required
            />
          </div>

          {/* Willing to Relocate */}
          <div className="space-y-2">
            <Label htmlFor="willingToRelocate">
              Willing to Relocate <span className="text-red-500">*</span>
            </Label>
            <select
              id="willingToRelocate"
              value={profile.willingToRelocate === null ? '' : profile.willingToRelocate ? 'true' : 'false'}
              onChange={(e) => updateField('willingToRelocate', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
              className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground"
              required
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Has Acquaintance */}
          <div className="space-y-2">
            <Label htmlFor="hasAcquaintance">Has Acquaintance in Company</Label>
            <select
              id="hasAcquaintance"
              value={profile.hasAcquaintance === null ? '' : profile.hasAcquaintance ? 'true' : 'false'}
              onChange={(e) => updateField('hasAcquaintance', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
              className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground"
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        {saveMessage && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{saveMessage.text}</span>
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}

